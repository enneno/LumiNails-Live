-- LOCAL release source; not applied to the shared database.
-- Existing records, RLS, operation deduplication and booking overlap constraints are preserved.
-- Requires the already active supabase-admin-error-logs.sql release.
begin;

alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings add constraint bookings_status_check check(status in('pending','confirmed','done','cancelled','cancelled_by_customer','no_show'));
alter table public.blocked_times drop constraint blocked_times_status_check;
alter table public.blocked_times add constraint blocked_times_status_check check(status in('blocked','done','cancelled','cancelled_by_customer','no_show'));

CREATE OR REPLACE FUNCTION public.apply_admin_booking_changes_internal(p_operation_id uuid, p_changes jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

        if v_status = 'no_show' then
            if v_ends_at > now() then
                raise exception 'Csak véget ért időpont jelölhető nem jelent meg állapotúnak.';
            end if;
            v_notification := 'null'::jsonb;
        end if;

        if v_type = 'booking' then
            if v_status not in ('pending', 'confirmed', 'done', 'cancelled', 'cancelled_by_customer', 'no_show') then
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
            if v_status not in ('blocked', 'done', 'cancelled', 'cancelled_by_customer', 'no_show') then
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
$function$;

CREATE OR REPLACE FUNCTION public.get_available_slots(p_service_id uuid, p_date date)
 RETURNS TABLE(starts_at timestamp with time zone, label text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    with svc as (
        select id, duration_minutes
        from public.services
        where id = p_service_id
            and active = true
            and booking_enabled = true
    ),
    windows as (
        select *
        from public.availability_windows
        where active = true
            and work_date = p_date
    ),
    slots as (
        select
            gs as starts_at,
            gs + make_interval(mins => duration.effective_minutes) as ends_at
        from svc
        cross join windows
        cross join lateral (
            select case
                when svc.duration_minutes > 0 then svc.duration_minutes
                else windows.slot_step_minutes
            end as effective_minutes
        ) duration
        cross join lateral generate_series(
            ((p_date::text || ' ' || windows.start_time::text)::timestamp at time zone 'Europe/Budapest'),
            ((p_date::text || ' ' || windows.end_time::text)::timestamp at time zone 'Europe/Budapest')
                - make_interval(mins => duration.effective_minutes),
            make_interval(mins => windows.slot_step_minutes)
        ) as gs
    )
    select
        slots.starts_at,
        to_char(slots.starts_at at time zone 'Europe/Budapest', 'HH24:MI') as label
    from slots
    where slots.starts_at > now()
        and not exists (
            select 1
            from public.bookings b
            where b.status in ('pending', 'confirmed', 'done')
                and tstzrange(b.starts_at, b.ends_at + interval '30 minutes', '[)')
                    && tstzrange(slots.starts_at, slots.ends_at + interval '30 minutes', '[)')
        )
        and not exists (
            select 1
            from public.blocked_times bt
            where coalesce(bt.status, 'blocked') not in ('cancelled', 'cancelled_by_customer', 'no_show')
                and tstzrange(bt.starts_at, bt.ends_at, '[)')
                    && tstzrange(slots.starts_at, slots.ends_at, '[)')
        )
    order by slots.starts_at;
$function$;

CREATE OR REPLACE FUNCTION public.get_available_slots_for_style(p_service_id uuid, p_date date, p_nail_style text DEFAULT ''::text)
 RETURNS TABLE(starts_at timestamp with time zone, label text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    with svc as (
        select id, duration_minutes
        from public.services
        where id = p_service_id
            and active = true
            and booking_enabled = true
    ),
    windows as (
        select *
        from public.availability_windows
        where active = true
            and work_date = p_date
    ),
    slots as (
        select
            gs as starts_at,
            gs + make_interval(mins => duration.effective_minutes) as ends_at
        from svc
        cross join windows
        cross join lateral (
            select
                (
                    case
                        when svc.duration_minutes > 0 then svc.duration_minutes
                        else windows.slot_step_minutes
                    end
                    + public.lumi_booking_style_extra_minutes(p_nail_style)
                ) as effective_minutes
        ) duration
        cross join lateral generate_series(
            ((p_date::text || ' ' || windows.start_time::text)::timestamp at time zone 'Europe/Budapest'),
            ((p_date::text || ' ' || windows.end_time::text)::timestamp at time zone 'Europe/Budapest')
                - make_interval(mins => duration.effective_minutes),
            make_interval(mins => windows.slot_step_minutes)
        ) as gs
    )
    select
        slots.starts_at,
        to_char(slots.starts_at at time zone 'Europe/Budapest', 'HH24:MI') as label
    from slots
    where slots.starts_at > now()
        and not exists (
            select 1
            from public.bookings b
            where b.status in ('pending', 'confirmed', 'done')
                and tstzrange(b.starts_at, b.ends_at + interval '30 minutes', '[)')
                    && tstzrange(slots.starts_at, slots.ends_at + interval '30 minutes', '[)')
        )
        and not exists (
            select 1
            from public.blocked_times bt
            where coalesce(bt.status, 'blocked') not in ('cancelled', 'cancelled_by_customer', 'no_show')
                and tstzrange(bt.starts_at, bt.ends_at, '[)')
                    && tstzrange(slots.starts_at, slots.ends_at, '[)')
        )
    order by slots.starts_at;
$function$;

CREATE OR REPLACE FUNCTION public.get_booking_monthly_report_data(p_report_month date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare
    v_month date := date_trunc('month', p_report_month)::date;
    v_start timestamptz := (v_month::timestamp at time zone 'Europe/Budapest');
    v_end timestamptz := ((v_month + interval '1 month')::timestamp at time zone 'Europe/Budapest');
    v_result jsonb;
begin
    if p_report_month is null or p_report_month <> v_month then
        raise exception 'A riport hónapjának első napját kell megadni.';
    end if;

    with online_base as (
        select
            b.status,
            coalesce(s.name, 'Ismeretlen szolgáltatás') as service_name,
            greatest(round(extract(epoch from (b.ends_at - b.starts_at)) / 60.0), 0)::integer as duration_minutes,
            greatest(coalesce(b.final_price_amount, b.service_price_amount, s.price_amount, 0), 0)::integer as price_amount,
            greatest(coalesce(b.coupon_discount_amount, 0), 0)::integer as discount_amount,
            nullif(trim(b.coupon_code), '') is not null as used_coupon,
            nullif(lower(trim(b.customer_email)), '') as normalized_email
        from public.bookings b
        left join public.services s on s.id = b.service_id
        where b.starts_at >= v_start and b.starts_at < v_end
    ),
    manual_base as (
        select
            coalesce(nullif(trim(bt.status), ''), 'blocked') as status,
            greatest(round(extract(epoch from (bt.ends_at - bt.starts_at)) / 60.0), 0)::integer as duration_minutes
        from public.blocked_times bt
        where bt.starts_at >= v_start and bt.starts_at < v_end
    ),
    online_summary as (
        select
            count(*)::integer as total,
            count(*) filter (where status = 'done')::integer as done,
            count(*) filter (where status = 'no_show')::integer as no_show,
            count(*) filter (where status = 'confirmed')::integer as confirmed,
            count(*) filter (where status = 'pending')::integer as pending,
            count(*) filter (where status = 'cancelled')::integer as cancelled_owner,
            count(*) filter (where status = 'cancelled_by_customer')::integer as cancelled_customer,
            count(distinct normalized_email)::integer as unique_customers,
            count(*) filter (where used_coupon)::integer as coupon_bookings,
            coalesce(sum(discount_amount) filter (where used_coupon), 0)::integer as discount_total_amount,
            coalesce(sum(price_amount) filter (where status = 'done'), 0)::integer as completed_revenue_amount,
            coalesce(sum(duration_minutes) filter (where status not in ('cancelled', 'cancelled_by_customer', 'no_show')), 0)::integer as booked_minutes,
            coalesce(sum(duration_minutes) filter (where status = 'done'), 0)::integer as completed_minutes
        from online_base
    ),
    manual_summary as (
        select
            count(*)::integer as total,
            count(*) filter (where status = 'done')::integer as done,
            count(*) filter (where status = 'no_show')::integer as no_show,
            count(*) filter (where status = 'cancelled')::integer as cancelled_owner,
            count(*) filter (where status = 'cancelled_by_customer')::integer as cancelled_customer,
            coalesce(sum(duration_minutes) filter (where status not in ('cancelled', 'cancelled_by_customer', 'no_show')), 0)::integer as booked_minutes,
            coalesce(sum(duration_minutes) filter (where status = 'done'), 0)::integer as completed_minutes
        from manual_base
    ),
    service_summary as (
        select
            service_name,
            count(*)::integer as bookings,
            count(*) filter (where status = 'done')::integer as done,
            count(*) filter (where status = 'no_show')::integer as no_show,
            count(*) filter (where status in ('cancelled', 'cancelled_by_customer'))::integer as cancelled,
            coalesce(sum(price_amount) filter (where status = 'done'), 0)::integer as completed_revenue_amount
        from online_base
        group by service_name
    )
    select jsonb_build_object(
        'report_month', v_month,
        'period_start', v_start,
        'period_end', v_end,
        'online', jsonb_build_object(
            'total', o.total,
            'done', o.done,
            'no_show', o.no_show,
            'confirmed', o.confirmed,
            'pending', o.pending,
            'cancelled_owner', o.cancelled_owner,
            'cancelled_customer', o.cancelled_customer,
            'unique_customers', o.unique_customers,
            'coupon_bookings', o.coupon_bookings,
            'discount_total_amount', o.discount_total_amount,
            'completed_revenue_amount', o.completed_revenue_amount,
            'booked_minutes', o.booked_minutes,
            'completed_minutes', o.completed_minutes
        ),
        'manual', jsonb_build_object(
            'total', m.total,
            'done', m.done,
            'no_show', m.no_show,
            'cancelled_owner', m.cancelled_owner,
            'cancelled_customer', m.cancelled_customer,
            'booked_minutes', m.booked_minutes,
            'completed_minutes', m.completed_minutes
        ),
        'services', coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'name', service_name,
                    'bookings', bookings,
                    'done', done,
                    'cancelled', cancelled,
                    'completed_revenue_amount', completed_revenue_amount
                )
                order by bookings desc, service_name
            )
            from service_summary
        ), '[]'::jsonb)
    )
    into v_result
    from online_summary o
    cross join manual_summary m;

    return coalesce(v_result, '{}'::jsonb);
end;
$function$;
-- Only identifiers pass into registration/error webhooks; names are resolved by the server.
create or replace function private.lumi_enqueue_admin_push(p_body jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare v_secret text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets
  where name='lumi_web_push_webhook_secret' limit 1;
  if coalesce(v_secret,'')='' then return;end if;
  perform net.http_post(
    url:='https://htbpzvmlegapaphsipax.supabase.co/functions/v1/send-web-push',
    headers:=jsonb_build_object('Content-Type','application/json','x-lumi-web-push-secret',v_secret),
    body:=p_body,timeout_milliseconds:=1500);
exception when others then
  raise warning 'Admin push enqueue unavailable';
end;
$$;
revoke all on function private.lumi_enqueue_admin_push(jsonb) from public,anon,authenticated,service_role;

create or replace function public.enqueue_booking_web_push()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  -- Admin edits are not guest activity. Push delivery never controls the booking transaction.
  if public.is_lumi_admin() then return new;end if;
  if tg_op='UPDATE' then
    if new.status<>'cancelled_by_customer' or old.status in('cancelled','cancelled_by_customer') then return new;end if;
  elsif tg_op<>'INSERT' then return new;end if;
  perform private.lumi_enqueue_admin_push(jsonb_build_object(
    'type',tg_op,'record',jsonb_build_object('id',new.id,'customer_name',new.customer_name,
      'starts_at',new.starts_at,'service_id',new.service_id,'status',new.status),
    'old_record',case when tg_op='UPDATE' then jsonb_build_object('status',old.status) else null end));
  return new;
exception when others then
  raise warning 'Booking push enqueue unavailable';return new;
end;
$$;

create or replace function private.lumi_registration_notice()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.booking_events(event_type,channel,status,title,message,metadata)
  values('customer_registered','customer_account','info','Új regisztráció',
    'Új vendégfiók jött létre. A regisztráció automatikus, nincs jóváhagyási teendő.',jsonb_build_object('open_registration',true));
  perform private.lumi_enqueue_admin_push(jsonb_build_object('kind','guestRegistration','record',jsonb_build_object('user_id',new.user_id)));
  return new;
exception when others then
  raise warning 'Registration notice unavailable';return new;
end;
$$;

create or replace function private.lumi_email_error_push()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.source in('booking_email','reminder_email','review_email','monthly_report') then
    perform private.lumi_enqueue_admin_push(jsonb_build_object('kind','bookingEmailFailure','record',jsonb_build_object('id',new.id)));
  end if;
  return new;
exception when others then
  raise warning 'Email failure push unavailable';return new;
end;
$$;
revoke all on function private.lumi_email_error_push() from public,anon,authenticated,service_role;
drop trigger if exists lumi_admin_email_error_push on public.admin_error_events;
create trigger lumi_admin_email_error_push after insert on public.admin_error_events
for each row execute function private.lumi_email_error_push();

commit;
