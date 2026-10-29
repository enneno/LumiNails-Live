-- LumiNails release SQL. Prepared and tested locally; do not run without release approval.
-- No booking, profile, content, existing attempt counter or audit row is rewritten.
begin;

alter table public.bookings
  add column if not exists reminder_next_attempt_at timestamptz,
  add column if not exists review_request_next_attempt_at timestamptz;

create table public.admin_error_events (
  id bigint generated always as identity primary key,
  source text not null check (source in ('cron','booking_email','reminder_email','review_email','monthly_report')),
  source_key text not null unique,
  occurred_at timestamptz not null,
  title text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index admin_error_events_occurred_at_idx on public.admin_error_events(occurred_at desc);
alter table public.admin_error_events enable row level security;
revoke all on public.admin_error_events from public, anon, authenticated;
grant select on public.admin_error_events to authenticated;
grant all on public.admin_error_events to service_role;
grant usage, select on sequence public.admin_error_events_id_seq to service_role;
create policy admin_error_events_read on public.admin_error_events for select to authenticated
  using ((select public.is_lumi_admin()));

create table public.admin_error_log_reads (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_id bigint not null default 0 check(last_seen_id>=0),
  updated_at timestamptz not null default now()
);
alter table public.admin_error_log_reads enable row level security;
revoke all on public.admin_error_log_reads from public, anon, authenticated;
grant select on public.admin_error_log_reads to authenticated;
grant all on public.admin_error_log_reads to service_role;
create policy admin_error_log_reads_own on public.admin_error_log_reads for select to authenticated
  using (user_id=(select auth.uid()) and (select public.is_lumi_admin()));

create function public.admin_mark_error_logs_read(p_last_seen_id bigint)
returns void language plpgsql security definer set search_path='' as $$
declare v_latest bigint;
begin
  if (select auth.uid()) is null or not (select public.is_lumi_admin()) then
    raise exception 'Admin access required' using errcode='42501';
  end if;
  select coalesce(max(id),0) into v_latest from public.admin_error_events;
  insert into public.admin_error_log_reads(user_id,last_seen_id)
  values ((select auth.uid()),least(greatest(coalesce(p_last_seen_id,0),0),v_latest))
  on conflict(user_id) do update set
    last_seen_id=greatest(public.admin_error_log_reads.last_seen_id,excluded.last_seen_id),updated_at=now();
end;
$$;
revoke all on function public.admin_mark_error_logs_read(bigint) from public,anon;
grant execute on function public.admin_mark_error_logs_read(bigint) to authenticated;

-- Private state only. Raw customer records and provider response bodies never enter the UI log.
create view private.lumi_delivery_state as
select 'booking-email'::text as queue,'booking_email'::text as source,j.id::text as record_key,
  j.status,j.attempts,j.next_attempt_at as due_at,j.locked_at,j.updated_at as changed_at,j.last_error
from public.booking_email_jobs j where j.sent_at is null
union all
select 'monthly-report','monthly_report',j.report_month::text,
  j.status,j.attempts,j.next_attempt_at,j.locked_at,j.updated_at,j.last_error
from public.booking_monthly_report_jobs j where j.sent_at is null
union all
select 'reminder-email','reminder_email',b.id::text,
  case when b.reminder_locked_at is not null then 'processing' when b.reminder_last_error is not null then 'retry' else 'pending' end,
  b.reminder_attempts,coalesce(b.reminder_next_attempt_at,b.reminder_scheduled_for),b.reminder_locked_at,
  coalesce(b.reminder_next_attempt_at-interval '2 minutes',b.reminder_locked_at,b.reminder_scheduled_for),b.reminder_last_error
from public.bookings b where b.reminder_sent_at is null and b.reminder_scheduled_for is not null
  and b.status in ('pending','confirmed') and b.starts_at>now()
union all
select 'review-email','review_email',b.id::text,
  case when b.review_request_locked_at is not null then 'processing' when b.review_request_last_error is not null then 'retry' else 'pending' end,
  b.review_request_attempts,coalesce(b.review_request_next_attempt_at,b.review_request_scheduled_for),b.review_request_locked_at,
  coalesce(b.review_request_next_attempt_at-interval '2 minutes',b.review_request_locked_at,b.review_request_scheduled_for),b.review_request_last_error
from public.bookings b where b.review_request_sent_at is null and b.review_request_scheduled_for is not null
  and b.status='done'
  and not exists(select 1 from public.booking_review_recipients r where r.email=lower(trim(b.customer_email)))
  and not exists(select 1 from public.bookings sent where lower(trim(sent.customer_email))=lower(trim(b.customer_email)) and sent.review_request_sent_at is not null);
revoke all on private.lumi_delivery_state from public,anon,authenticated;

create function private.lumi_delivery_error_summary(p_error text)
returns text language sql immutable set search_path='' as $$
  select case
    when p_error ~* 'timeout|timed out' then 'Időtúllépés a kézbesítés során.'
    when p_error ~ '\m(401|403)\M' then 'A küldési szolgáltatás hitelesítési hibát jelzett.'
    when p_error ~ '\m429\M' then 'A küldési szolgáltatás korlátozta a kéréseket.'
    when p_error ~ '\m5[0-9]{2}\M' then 'A küldési szolgáltatás kiszolgálóhibát jelzett.'
    else 'A kézbesítés sikertelen. Ellenőrizd a küldési szolgáltatás állapotát.' end;
$$;
revoke all on function private.lumi_delivery_error_summary(text) from public,anon,authenticated;

create function private.lumi_sync_delivery_error(p_queue text,p_key text)
returns void language plpgsql security definer set search_path='' as $$
declare v record; v_key text:='delivery/'||p_queue||'/'||p_key; v_stalled boolean;
begin
  select * into v from private.lumi_delivery_state where queue=p_queue and record_key=p_key;
  if not found then
    delete from public.admin_error_events where source_key in(v_key,v_key||'/stalled');
    return;
  end if;
  if v.attempts>=8 and v.last_error is not null then
    insert into public.admin_error_events(source,source_key,occurred_at,title,detail)
    values(v.source,v_key,coalesce(v.changed_at,now()),
      case v.source when 'booking_email' then 'Foglalási e-mail küldése sikertelen'
        when 'reminder_email' then 'Emlékeztető e-mail küldése sikertelen'
        when 'review_email' then 'Értékeléskérő e-mail küldése sikertelen'
        else 'Havi riport küldése sikertelen' end,
      'Kísérlet: '||v.attempts||'/8. '||private.lumi_delivery_error_summary(v.last_error))
    on conflict(source_key) do update set occurred_at=excluded.occurred_at,detail=excluded.detail;
  else
    delete from public.admin_error_events where source_key=v_key;
  end if;
  v_stalled:=v.attempts<8 and (
    (v.status in('pending','retry') and v.due_at<now()-interval '1 hour') or
    (v.status='processing' and coalesce(v.locked_at,v.due_at)<now()-interval '1 hour'));
  if v_stalled then
    insert into public.admin_error_events(source,source_key,occurred_at,title,detail)
    values(v.source,v_key||'/stalled',coalesce(v.locked_at,v.due_at),
      'E-mail kézbesítése elakadt','Az esedékes kézbesítés legalább egy órája nem haladt tovább.')
    on conflict(source_key) do nothing;
  else
    delete from public.admin_error_events where source_key=v_key||'/stalled';
  end if;
end;
$$;
revoke all on function private.lumi_sync_delivery_error(text,text) from public,anon,authenticated;

create function private.lumi_dispatch_notification_worker(p_force boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare v_command text;
begin
  if not p_force and not exists(select 1 from private.lumi_delivery_state where attempts<8 and due_at<=clock_timestamp()
    and (status in('pending','retry') or (status='processing' and locked_at<now()-interval '30 minutes'))) then return;end if;
  -- Reuse this project's existing server-only dispatch configuration in place.
  -- No credential is exported, duplicated in source, or copied from the reference project.
  select command into v_command from cron.job where jobname='lumi-booking-notifications' and active;
  if nullif(v_command,'') is null or v_command not ilike '%net.http_post%'
    or v_command ilike '%lumi_dispatch_notification_worker%' then
    raise exception 'Notification worker configuration unavailable';
  end if;
  execute v_command;
end;
$$;
revoke all on function private.lumi_dispatch_notification_worker(boolean) from public,anon,authenticated,service_role;

create function private.lumi_retry_delivery(p_queue text,p_key text)
returns void language plpgsql security definer set search_path='' as $$
declare v record;v_job text:='lumi-retry-'||p_queue||'-'||p_key;
begin
  select * into v from private.lumi_delivery_state where queue=p_queue and record_key=p_key;
  if found and v.status='retry' and v.attempts<8 and v.due_at>clock_timestamp() then return;end if;
  perform cron.unschedule(v_job);
  if v.record_key is null or v.status<>'retry' or v.attempts>=8 then return;end if;
  perform private.lumi_dispatch_notification_worker();
end;
$$;
revoke all on function private.lumi_retry_delivery(text,text) from public,anon,authenticated,service_role;

create function private.lumi_delivery_changed(p_queue text,p_key text)
returns void language plpgsql security definer set search_path='' as $$
declare v record;v_job text:='lumi-retry-'||p_queue||'-'||p_key;
begin
  perform private.lumi_sync_delivery_error(p_queue,p_key);
  select * into v from private.lumi_delivery_state where queue=p_queue and record_key=p_key;
  if found and v.status='retry' and v.attempts<8 then
    perform cron.schedule(v_job,'10 seconds',format('select private.lumi_retry_delivery(%L,%L);',p_queue,p_key));
  elsif exists(select 1 from cron.job where jobname=v_job) then
    perform cron.unschedule(v_job);
  end if;
exception when others then
  -- Keep the booking/delivery write. The hourly sweep recovers missed wake-ups.
  raise warning 'Delivery monitoring or retry scheduling unavailable';
end;
$$;
revoke all on function private.lumi_delivery_changed(text,text) from public,anon,authenticated;

create function private.lumi_queue_changed()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_queue text;v_key text;
begin
  if tg_table_name='booking_email_jobs' then v_queue:='booking-email';v_key:=new.id::text;
  else v_queue:='monthly-report';v_key:=new.report_month::text;end if;
  perform private.lumi_delivery_changed(v_queue,v_key);
  if tg_op='INSERT' then
    begin perform private.lumi_dispatch_notification_worker();
    exception when others then raise warning 'Delivery wake-up unavailable';end;
  end if;
  return new;
end;
$$;
revoke all on function private.lumi_queue_changed() from public,anon,authenticated;

create function private.lumi_booking_delivery_changed()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform private.lumi_delivery_changed('reminder-email',new.id::text);
  perform private.lumi_delivery_changed('review-email',new.id::text);
  return new;
end;
$$;
revoke all on function private.lumi_booking_delivery_changed() from public,anon,authenticated;

create function private.lumi_collect_admin_errors()
returns void language plpgsql security definer set search_path='' as $$
declare v record;v_keys text[]:=array[]::text[];
begin
  for v in select r.jobid,min(r.runid) as first_runid,max(r.start_time) as failed_at,j.jobname
    from cron.job_run_details r join cron.job j on j.jobid=r.jobid
    where r.status='failed' and j.active and j.jobname not like 'lumi-retry-%'
      and r.start_time>coalesce((select max(s.start_time) from cron.job_run_details s where s.jobid=r.jobid and s.status='succeeded'),'-infinity'::timestamptz)
    group by r.jobid,j.jobname having min(r.start_time)<now()-interval '1 hour'
  loop
    v_keys:=array_append(v_keys,'cron/'||v.jobid||'/'||v.first_runid);
    insert into public.admin_error_events(source,source_key,occurred_at,title,detail)
    values('cron','cron/'||v.jobid||'/'||v.first_runid,v.failed_at,'Tartós időzített feladathiba: '||v.jobname,
      'A feladat legalább egy órája hibás. Feladatazonosító: '||v.jobid)
    on conflict(source_key) do update set occurred_at=excluded.occurred_at;
  end loop;
  delete from public.admin_error_events where source='cron' and not(source_key=any(v_keys));
  for v in select queue,record_key from private.lumi_delivery_state loop
    perform private.lumi_sync_delivery_error(v.queue,v.record_key);
  end loop;
  delete from public.admin_error_events e where e.source<>'cron' and not exists(
    select 1 from private.lumi_delivery_state d where e.source_key in('delivery/'||d.queue||'/'||d.record_key,'delivery/'||d.queue||'/'||d.record_key||'/stalled'));
  delete from public.admin_error_events where occurred_at<now()-interval '7 days';
end;
$$;
revoke all on function private.lumi_collect_admin_errors() from public,anon,authenticated,service_role;

-- Registration is open. This is informational and never gates authentication or booking.
create function private.lumi_registration_notice()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.booking_events(event_type,channel,status,title,message,metadata)
  values('customer_registered','customer_account','info','Új regisztráció',
    'Új vendégfiók jött létre. A regisztráció automatikus, nincs jóváhagyási teendő.',jsonb_build_object('open_registration',true));
  return new;
exception when others then
  raise warning 'Registration notice unavailable';return new;
end;
$$;
revoke all on function private.lumi_registration_notice() from public,anon,authenticated;

-- Delivery function replacements and final triggers follow below.

-- Existing LumiNails functions, with bounded two-minute retries; original signatures and eligibility retained.
CREATE OR REPLACE FUNCTION "public"."finish_booking_email_job"("p_job_id" "uuid", "p_success" boolean, "p_error" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
    v_attempts integer;
begin
    select attempts + 1
    into v_attempts
    from public.booking_email_jobs
    where id = p_job_id and status <> 'sent'
    for update;

    if not found then
        if exists (select 1 from public.booking_email_jobs where id = p_job_id and status = 'sent') then
            return;
        end if;

        raise exception 'Az email munka nem talalhato.';
    end if;

    update public.booking_email_jobs
    set attempts = v_attempts,
        status = case
            when p_success then 'sent'
            when v_attempts >= 8 then 'failed'
            else 'retry'
        end,
        sent_at = case when p_success then now() else sent_at end,
        locked_at = null,
        last_error = case when p_success then null else left(coalesce(p_error, 'Ismeretlen email hiba'), 2000) end,
        next_attempt_at = case when p_success then next_attempt_at else clock_timestamp() + interval '2 minutes' end,
        updated_at = now()
    where id = p_job_id;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."claim_due_booking_monthly_reports"("p_limit" integer DEFAULT 3) RETURNS TABLE("report_month" "date")
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
    return query
    with candidates as (
        select j.report_month
        from public.booking_monthly_report_jobs j
        where j.sent_at is null and j.attempts < 8
            and j.next_attempt_at <= now()
            and (
                j.status in ('pending', 'retry')
                or (j.status = 'processing' and j.locked_at < now() - interval '30 minutes')
            )
        order by j.report_month
        limit least(greatest(coalesce(p_limit, 3), 1), 12)
        for update skip locked
    )
    update public.booking_monthly_report_jobs j
    set status = 'processing',
        locked_at = now(),
        updated_at = now()
    from candidates c
    where j.report_month = c.report_month
    returning j.report_month;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."finish_booking_monthly_report"("p_report_month" "date", "p_success" boolean, "p_error" "text" DEFAULT NULL::"text", "p_report_data" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
    v_attempts integer;
begin
    select attempts + 1
    into v_attempts
    from public.booking_monthly_report_jobs
    where report_month = p_report_month
        and sent_at is null
    for update;

    if not found then
        if exists (
            select 1
            from public.booking_monthly_report_jobs
            where report_month = p_report_month and sent_at is not null
        ) then
            return;
        end if;

        raise exception 'A havi riport munka nem található.';
    end if;

    update public.booking_monthly_report_jobs
    set attempts = v_attempts,
        status = case when p_success then 'sent' else 'retry' end,
        sent_at = case when p_success then now() else sent_at end,
        locked_at = null,
        last_error = case
            when p_success then null
            else left(coalesce(p_error, 'Ismeretlen havi riport hiba'), 2000)
        end,
        report_data = case
            when p_success and p_report_data is not null then p_report_data
            else report_data
        end,
        next_attempt_at = case when p_success then next_attempt_at else clock_timestamp() + interval '2 minutes' end,
        updated_at = now()
    where report_month = p_report_month;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."claim_due_booking_reminders"("p_limit" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "customer_name" "text", "customer_email" "text", "customer_phone" "text", "note" "text", "starts_at" timestamp with time zone, "ends_at" timestamp with time zone, "created_at" timestamp with time zone, "status" "text", "service_name" "text", "service_price_text" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    return query
    with candidates as (
        select b.id as booking_id
        from public.bookings b
        where b.reminder_scheduled_for <= now()
            and b.reminder_sent_at is null
            and b.status in ('pending', 'confirmed')
            and b.starts_at > now()
            and coalesce(b.reminder_attempts, 0) < 8
            and coalesce(b.reminder_next_attempt_at,b.reminder_scheduled_for) <= now()
            and (b.reminder_locked_at is null or b.reminder_locked_at < now() - interval '30 minutes')
        order by b.reminder_scheduled_for asc
        limit least(greatest(coalesce(p_limit, 20), 1), 50)
        for update skip locked
    )
    update public.bookings b
    set reminder_locked_at = now()
    from candidates c, public.services s
    where b.id = c.booking_id
        and s.id = b.service_id
    returning
        b.id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.note,
        b.starts_at,
        b.ends_at,
        b.created_at,
        b.status,
        s.name,
        s.price_text;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."claim_due_booking_review_requests"("p_limit" integer DEFAULT 20) RETURNS TABLE("id" "uuid", "customer_name" "text", "customer_email" "text", "customer_phone" "text", "note" "text", "starts_at" timestamp with time zone, "ends_at" timestamp with time zone, "created_at" timestamp with time zone, "status" "text", "service_name" "text", "service_price_text" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    return query
    with ranked as (
        select
            b.id as booking_id,
            row_number() over (
                partition by lower(trim(b.customer_email))
                order by b.review_request_scheduled_for asc, b.created_at asc
            ) as rn
        from public.bookings b
        where b.review_request_scheduled_for <= now()
            and b.review_request_sent_at is null
            and b.status = 'done'
            and coalesce(b.review_request_attempts, 0) < 8
            and coalesce(b.review_request_next_attempt_at,b.review_request_scheduled_for) <= now()
            and (b.review_request_locked_at is null or b.review_request_locked_at < now() - interval '30 minutes')
            and not exists (
                select 1
                from public.booking_review_recipients r
                where r.email = lower(trim(b.customer_email))
            )
            and not exists (
                select 1
                from public.bookings sent
                where lower(trim(sent.customer_email)) = lower(trim(b.customer_email))
                    and sent.review_request_sent_at is not null
            )
    ),
    candidates as (
        select candidate.id as booking_id
        from public.bookings candidate join ranked on ranked.booking_id=candidate.id
        where ranked.rn = 1
        limit least(greatest(coalesce(p_limit, 20), 1), 50)
        for update of candidate skip locked
    )
    update public.bookings b
    set review_request_locked_at = now()
    from candidates c, public.services s
    where b.id = c.booking_id
        and s.id = b.service_id
    returning
        b.id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.note,
        b.starts_at,
        b.ends_at,
        b.created_at,
        b.status,
        s.name,
        s.price_text;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."finish_booking_reminder"("p_booking_id" "uuid", "p_success" boolean, "p_error" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    update public.bookings
    set
        reminder_next_attempt_at = case when p_success then null else clock_timestamp() + interval '2 minutes' end,
        reminder_locked_at = null,
        reminder_attempts = coalesce(reminder_attempts, 0) + 1,
        reminder_sent_at = case when p_success then now() else reminder_sent_at end,
        reminder_last_error = case when p_success then null else left(coalesce(p_error, 'Ismeretlen email hiba'), 2000) end
    where id = p_booking_id and reminder_sent_at is null;
    if not found then return;end if;

    insert into public.booking_events (
        booking_id,
        event_type,
        channel,
        status,
        title,
        message,
        metadata
    ) values (
        p_booking_id,
        'booking_reminder_email',
        'email',
        case when p_success then 'success' else 'error' end,
        case when p_success then 'Emlékeztető email elküldve' else 'Emlékeztető email hiba' end,
        case when p_success then 'A vendég megkapta a foglalás előtti emlékeztetőt.' else left(coalesce(p_error, 'Az emlékeztető email nem ment ki.'), 2000) end,
        jsonb_build_object('ok', p_success, 'error', p_error)
    );
end;
$$;

CREATE OR REPLACE FUNCTION "public"."finish_booking_review_request"("p_booking_id" "uuid", "p_success" boolean, "p_error" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
    update public.bookings
    set
        review_request_next_attempt_at = case when p_success then null else clock_timestamp() + interval '2 minutes' end,
        review_request_locked_at = null,
        review_request_attempts = coalesce(review_request_attempts, 0) + 1,
        review_request_sent_at = case when p_success then now() else review_request_sent_at end,
        review_request_last_error = case when p_success then null else left(coalesce(p_error, 'Ismeretlen email hiba'), 2000) end
    where id = p_booking_id and review_request_sent_at is null;
    if not found then return;end if;

    if p_success then
        insert into public.booking_review_recipients (email, first_booking_id, sent_at)
        select lower(trim(customer_email)), id, now()
        from public.bookings
        where id = p_booking_id
            and nullif(trim(customer_email), '') is not null
        on conflict (email) do nothing;
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
        p_booking_id,
        'booking_review_request_email',
        'email',
        case when p_success then 'success' else 'error' end,
        case when p_success then 'Értékeléskérő email elküldve' else 'Értékeléskérő email hiba' end,
        case when p_success then 'A vendég megkapta a köszönő és Google értékeléskérő emailt.' else left(coalesce(p_error, 'Az értékeléskérő email nem ment ki.'), 2000) end,
        jsonb_build_object('ok', p_success, 'error', p_error)
    );
end;
$$;

create function private.lumi_reset_delivery_retry_due()
returns trigger language plpgsql set search_path='' as $$
begin
  if new.reminder_scheduled_for is distinct from old.reminder_scheduled_for or new.customer_email is distinct from old.customer_email
    or new.reminder_attempts<old.reminder_attempts then new.reminder_next_attempt_at:=null;end if;
  if new.review_request_scheduled_for is distinct from old.review_request_scheduled_for or new.customer_email is distinct from old.customer_email
    or new.review_request_attempts<old.review_request_attempts then new.review_request_next_attempt_at:=null;end if;
  return new;
end;
$$;
revoke all on function private.lumi_reset_delivery_retry_due() from public,anon,authenticated;

create trigger lumi_booking_delivery_retry_due before update of starts_at,ends_at,status,customer_email,reminder_scheduled_for,review_request_scheduled_for,reminder_attempts,review_request_attempts on public.bookings
for each row execute function private.lumi_reset_delivery_retry_due();
create trigger lumi_booking_delivery_monitor after update of status,starts_at,customer_email,reminder_attempts,reminder_locked_at,reminder_sent_at,review_request_attempts,review_request_locked_at,review_request_sent_at on public.bookings
for each row execute function private.lumi_booking_delivery_changed();
create trigger lumi_email_job_monitor after insert or update of status,attempts on public.booking_email_jobs
for each row execute function private.lumi_queue_changed();
create trigger lumi_report_job_monitor after insert or update of status,attempts on public.booking_monthly_report_jobs
for each row execute function private.lumi_queue_changed();
create trigger lumi_open_registration_notice after insert on public.customer_profiles
for each row execute function private.lumi_registration_notice();

-- Existing signatures stay service-only. No browser can claim or finish a delivery.
revoke all on function public.finish_booking_email_job(uuid,boolean,text),public.claim_due_booking_monthly_reports(integer),
 public.finish_booking_monthly_report(date,boolean,text,jsonb),public.claim_due_booking_reminders(integer),
 public.claim_due_booking_review_requests(integer),public.finish_booking_reminder(uuid,boolean,text),public.finish_booking_review_request(uuid,boolean,text)
 from public,anon,authenticated;
grant execute on function public.finish_booking_email_job(uuid,boolean,text),public.claim_due_booking_monthly_reports(integer),
 public.finish_booking_monthly_report(date,boolean,text,jsonb),public.claim_due_booking_reminders(integer),
 public.claim_due_booking_review_requests(integer),public.finish_booking_reminder(uuid,boolean,text),public.finish_booking_review_request(uuid,boolean,text)
 to service_role;

-- Hourly recovery, immediate normal email wake-ups, and temporary retries only after failure.
-- Preserve the currently configured server-side command and its secrets without exporting them.
do $$
declare v_command text;
begin
 select command into v_command from cron.job where jobname='lumi-booking-notifications' and active;
 if nullif(v_command,'') is null or v_command not ilike '%net.http_post%' or v_command ilike '%lumi_dispatch_notification_worker%' then
   raise exception 'Existing notification worker is not configured; no release changes applied';
 end if;
 perform cron.schedule('lumi-booking-notifications','0 * * * *',v_command);
end;
$$;
select cron.schedule('lumi-admin-background-errors','0 * * * *','select private.lumi_collect_admin_errors()');
select private.lumi_collect_admin_errors();
commit;
