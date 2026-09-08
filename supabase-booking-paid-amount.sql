-- Lumi Nails: ténylegesen fizetett összeg követése online és kézi foglalásoknál.
-- Biztonságosan újrafuttatható; meglévő összegek hiányzóként (null) maradnak.

alter table public.bookings
    add column if not exists paid_amount integer;

alter table public.blocked_times
    add column if not exists paid_amount integer;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'bookings_paid_amount_check'
            and conrelid = 'public.bookings'::regclass
    ) then
        alter table public.bookings
            add constraint bookings_paid_amount_check
            check (paid_amount is null or paid_amount >= 0);
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'blocked_times_paid_amount_check'
            and conrelid = 'public.blocked_times'::regclass
    ) then
        alter table public.blocked_times
            add constraint blocked_times_paid_amount_check
            check (paid_amount is null or paid_amount >= 0);
    end if;
end
$$;

comment on column public.bookings.paid_amount is
    'Actual amount paid in Hungarian forints; null means not recorded.';
comment on column public.blocked_times.paid_amount is
    'Actual amount paid in Hungarian forints for a manually added booking; null means not recorded.';

create or replace function public.apply_admin_booking_changes_internal(
    p_operation_id uuid,
    p_changes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_change jsonb;
    v_id uuid;
    v_type text;
    v_status text;
    v_starts_at timestamptz;
    v_ends_at timestamptz;
    v_reason text;
    v_has_paid_amount boolean;
    v_paid_amount integer;
    v_notification jsonb;
    v_job public.booking_email_jobs%rowtype;
    v_jobs jsonb := '[]'::jsonb;
    v_modified integer := 0;
    v_existing_changes jsonb;
    v_existing_result jsonb;
    v_result jsonb;
begin
    if p_operation_id is null then
        raise exception 'Hianyzik az admin mentési muvelet azonositoja.';
    end if;

    if jsonb_typeof(coalesce(p_changes, '[]'::jsonb)) <> 'array' then
        raise exception 'Ervenytelen admin modositaslista.';
    end if;

    if jsonb_array_length(coalesce(p_changes, '[]'::jsonb)) > 100 then
        raise exception 'Egyszerre legfeljebb 100 bejegyzes modosithato.';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 1));

    select changes, result
    into v_existing_changes, v_existing_result
    from public.admin_booking_change_operations
    where operation_id = p_operation_id;

    if found then
        if v_existing_changes is distinct from p_changes then
            raise exception 'Ezt az admin muveleti azonositot mas adatokkal mar hasznaltak.';
        end if;
        if v_existing_result is not null then
            return v_existing_result;
        end if;
        raise exception 'Az admin muvelet feldolgozasa meg nem fejezodott be.';
    end if;

    insert into public.admin_booking_change_operations (operation_id, changes)
    values (p_operation_id, p_changes);

    for v_change in
        select value from jsonb_array_elements(coalesce(p_changes, '[]'::jsonb))
    loop
        v_id := (v_change->>'id')::uuid;
        v_type := trim(coalesce(v_change->>'type', ''));
        v_status := trim(coalesce(v_change->>'status', ''));
        v_starts_at := (v_change->>'starts_at')::timestamptz;
        v_ends_at := (v_change->>'ends_at')::timestamptz;
        v_reason := left(trim(coalesce(v_change->>'reason', '')), 500);
        v_has_paid_amount := v_change ? 'paid_amount';
        v_paid_amount := case
            when v_has_paid_amount and v_change->'paid_amount' <> 'null'::jsonb
                then (v_change->>'paid_amount')::integer
            else null
        end;
        v_notification := coalesce(v_change->'email_notification', 'null'::jsonb);

        if v_starts_at >= v_ends_at then
            raise exception 'A befejezesnek kesobbinek kell lennie a kezdesnel.';
        end if;

        if v_paid_amount < 0 then
            raise exception 'A fizetett osszeg nem lehet negativ.';
        end if;

        if v_type = 'booking' then
            if v_status not in ('pending', 'confirmed', 'done', 'cancelled', 'cancelled_by_customer') then
                raise exception 'Ervenytelen foglalasi statusz.';
            end if;

            update public.bookings
            set status = v_status,
                starts_at = v_starts_at,
                ends_at = v_ends_at,
                paid_amount = case when v_has_paid_amount then v_paid_amount else paid_amount end
            where id = v_id;

            if not found then
                raise exception 'Az egyik foglalas mar nem talalhato.';
            end if;

            if v_notification <> 'null'::jsonb then
                insert into public.booking_email_jobs (
                    booking_id,
                    kind,
                    dedupe_key,
                    payload
                ) values (
                    v_id,
                    'admin_update',
                    'admin-update/' || p_operation_id::text || '/' || v_id::text,
                    jsonb_build_object('notification', v_notification)
                )
                on conflict (dedupe_key) do update
                set dedupe_key = excluded.dedupe_key
                returning * into v_job;

                v_jobs := v_jobs || jsonb_build_array(jsonb_build_object(
                    'id', v_job.id,
                    'booking_id', v_job.booking_id,
                    'kind', v_job.kind,
                    'payload', v_job.payload,
                    'status', v_job.status
                ));
            end if;

            insert into public.booking_events (
                booking_id,
                event_type,
                channel,
                status,
                title,
                message,
                metadata
            ) values (
                v_id,
                case when v_status = 'cancelled_by_customer' then 'customer_cancelled' else 'admin_booking_updated' end,
                'admin',
                'info',
                case when v_status = 'cancelled_by_customer' then 'A vendeg mondta le' else 'Admin modositas mentve' end,
                case when v_status = 'cancelled_by_customer'
                    then 'A foglalast a vendeg lemondasakent rogzitettek. Automatikus email nem ment ki.'
                    else 'A foglalas adatai az admin feluleten modosultak.'
                end,
                jsonb_build_object('operation_id', p_operation_id, 'change', v_change)
            );
        elsif v_type = 'blocked' then
            if v_status not in ('blocked', 'done', 'cancelled_by_customer') then
                raise exception 'Ervenytelen kezi idopont statusz.';
            end if;

            if v_reason = '' then
                raise exception 'A kezi idopont neve vagy megjegyzese nem lehet ures.';
            end if;

            update public.blocked_times
            set status = v_status,
                starts_at = v_starts_at,
                ends_at = v_ends_at,
                reason = v_reason,
                paid_amount = case when v_has_paid_amount then v_paid_amount else paid_amount end
            where id = v_id;

            if not found then
                raise exception 'Az egyik kezi idopont mar nem talalhato.';
            end if;
        else
            raise exception 'Ismeretlen admin bejegyzestipus.';
        end if;

        v_modified := v_modified + 1;
    end loop;

    v_result := jsonb_build_object(
        'ok', true,
        'modified_count', v_modified,
        'email_jobs', v_jobs
    );

    update public.admin_booking_change_operations
    set result = v_result, completed_at = now()
    where operation_id = p_operation_id;

    return v_result;
exception
    when exclusion_violation then
        raise exception 'Az egyik modositott idopont utkozik egy masik foglalassal vagy a kotelezo szunettel.';
end;
$$;

revoke all on function public.apply_admin_booking_changes_internal(uuid, jsonb)
    from public, anon, authenticated;
grant execute on function public.apply_admin_booking_changes_internal(uuid, jsonb)
    to service_role;
