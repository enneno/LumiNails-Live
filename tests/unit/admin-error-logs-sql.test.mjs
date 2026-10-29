import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const schema = fs.readFileSync(new URL('../../supabase-schema.sql', import.meta.url), 'utf8');
const release = fs.readFileSync(new URL('../../supabase-admin-error-logs.sql', import.meta.url), 'utf8');
const bookingId = '00000000-0000-4000-8000-000000000001';
const jobId = '00000000-0000-4000-8000-000000000002';
const userId = '00000000-0000-4000-8000-000000000003';

async function setup() {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;create role authenticated;create role service_role;
      create schema auth;create schema private;create schema cron;create schema net;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('lumi_test.uid',true),'')::uuid $$;
      create function public.is_lumi_admin() returns boolean language sql as $$ select coalesce(current_setting('lumi_test.admin',true),'false')='true' $$;
      create table public.services(id uuid primary key,name text,price_text text);
      create table public.bookings(id uuid primary key,service_id uuid,customer_name text,customer_phone text,customer_email text,note text,
        starts_at timestamptz,ends_at timestamptz,created_at timestamptz default now(),status text default 'confirmed',
        reminder_scheduled_for timestamptz,reminder_sent_at timestamptz,reminder_locked_at timestamptz,reminder_attempts integer default 0,reminder_last_error text,
        review_request_scheduled_for timestamptz,review_request_sent_at timestamptz,review_request_locked_at timestamptz,review_request_attempts integer default 0,review_request_last_error text);
      create table public.booking_review_recipients(email text primary key,first_booking_id uuid,sent_at timestamptz);
      create table public.customer_profiles(user_id uuid primary key,full_name text);
      create table public.booking_events(id uuid primary key default gen_random_uuid(),booking_id uuid,event_type text,channel text,status text,title text,message text,metadata jsonb,created_at timestamptz default now());
      create table public.booking_email_jobs(id uuid primary key,booking_id uuid,kind text,payload jsonb default '{}',status text default 'pending',attempts integer default 0,
        sent_at timestamptz,next_attempt_at timestamptz default now(),locked_at timestamptz,last_error text,created_at timestamptz default now(),updated_at timestamptz default now());
      create table public.booking_monthly_report_jobs(report_month date primary key,status text default 'pending' check(status in('pending','processing','retry','sent')),
        attempts integer default 0,sent_at timestamptz,next_attempt_at timestamptz default now(),locked_at timestamptz,last_error text,report_data jsonb default '{}',created_at timestamptz default now(),updated_at timestamptz default now());
      create table cron.job(jobid bigserial primary key,jobname text unique,schedule text,command text,active boolean default true);
      create table cron.job_run_details(runid bigserial primary key,jobid bigint,status text,start_time timestamptz);
      create function cron.schedule(text,text,text) returns bigint language plpgsql as $$ declare k bigint;begin
        insert into cron.job(jobname,schedule,command) values($1,$2,$3) on conflict(jobname) do update set schedule=excluded.schedule,command=excluded.command returning jobid into k;return k;end;$$;
      create function cron.unschedule(text) returns boolean language plpgsql as $$ begin delete from cron.job where jobname=$1;return found;end;$$;
      create table private.test_dispatches(id bigserial primary key);
      create function net.http_post() returns bigint language plpgsql as $$ declare k bigint;begin insert into private.test_dispatches default values returning id into k;return k;end;$$;
      select cron.schedule('lumi-booking-notifications','*/10 * * * *','select net.http_post()');
      grant usage on schema public,auth to authenticated,anon,service_role;
      grant execute on function auth.uid(),public.is_lumi_admin() to authenticated;
      grant all on public.bookings,public.booking_email_jobs,public.booking_monthly_report_jobs,public.services,public.booking_review_recipients,public.booking_events to service_role;
    `);
    for (const name of ['claim_due_booking_email_jobs','claim_due_booking_monthly_reports','finish_booking_monthly_report','claim_due_booking_reminders','claim_due_booking_review_requests','finish_booking_reminder','finish_booking_review_request','finish_booking_email_job']) {
      const start = schema.indexOf('CREATE OR REPLACE FUNCTION "public"."' + name + '"');
      await db.exec(schema.slice(start, schema.indexOf('$$;', start) + 3));
    }
    await db.exec(release);
    await db.exec(`insert into public.services values('${jobId}','Synthetic service','100 Ft');
      insert into public.bookings(id,service_id,customer_name,customer_email,starts_at,ends_at) values('${bookingId}','${jobId}','Synthetic guest','guest@example.test',now()+interval '1 day',now()+interval '1 day 1 hour');
      insert into auth.users values('${userId}');`);
    return db;
  } catch (error) { await db.close();throw new Error(error.message); }
}

test('delivery SQL: bounded retries, two-minute delay, immediate wake-up, hourly recovery and preserved eligibility', async () => {
  const db = await setup();
  try {
    assert.equal((await db.query("select schedule from cron.job where jobname='lumi-booking-notifications'")).rows[0].schedule, '0 * * * *');
    assert.equal((await db.query("select schedule from cron.job where jobname='lumi-admin-background-errors'")).rows[0].schedule, '0 * * * *');
    await db.exec(`insert into public.booking_email_jobs(id,booking_id,kind) values('${jobId}','${bookingId}','new_booking');`);
    assert.equal((await db.query('select count(*)::int as n from private.test_dispatches')).rows[0].n, 1);
    await db.query('select public.finish_booking_email_job($1,false,$2)', [jobId,'HTTP 503 guest@example.test']);
    let row = (await db.query('select *,extract(epoch from next_attempt_at-clock_timestamp()) as delay from public.booking_email_jobs')).rows[0];
    assert.equal(row.attempts,1);assert.equal(row.status,'retry');assert.ok(row.delay>118 && row.delay<=120);
    assert.equal((await db.query("select count(*)::int as n from cron.job where jobname like 'lumi-retry-%'")).rows[0].n,1);
    await db.query("select private.lumi_retry_delivery('booking-email',$1)",[jobId]);
    assert.equal((await db.query('select count(*)::int as n from private.test_dispatches')).rows[0].n,1);
    assert.equal((await db.query('select * from public.claim_due_booking_email_jobs(20)')).rows.length,0);
    await db.query("update public.booking_email_jobs set next_attempt_at=now()-interval '1 second' where id=$1",[jobId]);
    await db.query("select private.lumi_retry_delivery('booking-email',$1)",[jobId]);
    assert.equal((await db.query('select count(*)::int as n from private.test_dispatches')).rows[0].n,2);
    assert.equal((await db.query('select * from public.claim_due_booking_email_jobs(20)')).rows.length,1);
    assert.equal((await db.query('select * from public.claim_due_booking_email_jobs(20)')).rows.length,0);
    for(let n=2;n<=8;n++)await db.query('select public.finish_booking_email_job($1,false,$2)',[jobId,'HTTP 503']);
    row=(await db.query('select * from public.booking_email_jobs')).rows[0];
    assert.equal(row.attempts,8);assert.equal(row.status,'failed');
    assert.equal((await db.query('select * from public.claim_due_booking_email_jobs(20)')).rows.length,0);
    assert.equal((await db.query("select count(*)::int as n from cron.job where jobname like 'lumi-retry-%'")).rows[0].n,0);
    await db.query("update public.bookings set reminder_scheduled_for=now()-interval '10 minutes' where id=$1",[bookingId]);
    assert.equal((await db.query('select * from public.claim_due_booking_reminders(20)')).rows.length,1);
    await db.query('select public.finish_booking_reminder($1,false,$2)',[bookingId,'HTTP 429']);
    assert.equal((await db.query('select * from public.claim_due_booking_reminders(20)')).rows.length,0);
    for(let n=2;n<=8;n++)await db.query('select public.finish_booking_reminder($1,false,$2)',[bookingId,'HTTP 429']);
    assert.equal((await db.query('select * from public.claim_due_booking_reminders(20)')).rows.length,0);
    await db.query("update public.bookings set status='done',review_request_scheduled_for=now()-interval '1 minute' where id=$1",[bookingId]);
    assert.equal((await db.query('select * from public.claim_due_booking_review_requests(20)')).rows.length,1);
    assert.equal((await db.query('select * from public.claim_due_booking_review_requests(20)')).rows.length,0);
    await db.query('select public.finish_booking_review_request($1,true,null)',[bookingId]);
    await db.query('select public.finish_booking_review_request($1,true,null)',[bookingId]);
    assert.equal((await db.query('select count(*)::int as n from public.booking_review_recipients')).rows[0].n,1);
    assert.equal((await db.query("select count(*)::int as n from public.booking_events where event_type='booking_review_request_email'")).rows[0].n,1);
    await db.exec("insert into public.booking_monthly_report_jobs(report_month) values(date_trunc('month',now())::date)");
    const month=(await db.query('select report_month from public.booking_monthly_report_jobs')).rows[0].report_month;
    for(let n=1;n<=8;n++)await db.query('select public.finish_booking_monthly_report($1,false,$2,null)',[month,'HTTP 503']);
    assert.equal((await db.query('select * from public.claim_due_booking_monthly_reports(3)')).rows.length,0);
    assert.equal((await db.query('select customer_name from public.bookings')).rows[0].customer_name,'Synthetic guest');
  } finally { await db.close(); }
});

test('error logs SQL: only exhausted/stalled failures, successful recovery, private payloads and own monotonic read cursor', async () => {
  const db = await setup();
  try {
    await db.exec(`insert into public.booking_email_jobs(id,booking_id,kind) values('${jobId}','${bookingId}','new_booking')`);
    for(let n=1;n<8;n++)await db.query('select public.finish_booking_email_job($1,false,$2)',[jobId,'HTTP 503 secret@example.test bearer-test']);
    assert.equal((await db.query('select count(*)::int as n from public.admin_error_events')).rows[0].n,0);
    await db.query('select public.finish_booking_email_job($1,false,$2)',[jobId,'HTTP 503 secret@example.test bearer-test']);
    const error=(await db.query('select * from public.admin_error_events')).rows[0];
    assert.match(error.detail,/8\/8/);assert.doesNotMatch(error.detail,/secret@example|bearer-test/);
    await db.exec(`set lumi_test.uid='${userId}';set lumi_test.admin='false';set role authenticated;`);
    assert.equal((await db.query('select * from public.admin_error_events')).rows.length,0);
    await assert.rejects(db.query('select public.admin_mark_error_logs_read(1000)'),/Admin access required/);
    await assert.rejects(db.query("insert into public.admin_error_events(source,source_key,occurred_at,title) values('cron','bad',now(),'bad')"),/permission denied/);
    await assert.rejects(db.query('select * from private.lumi_delivery_state'),/permission denied/);
    await assert.rejects(db.query('select public.finish_booking_email_job($1,false,null)',[jobId]),/permission denied/);
    await db.exec("set lumi_test.admin='true'");
    assert.equal((await db.query('select * from public.admin_error_events')).rows.length,1);
    await db.query('select public.admin_mark_error_logs_read(999999)');
    await db.query('select public.admin_mark_error_logs_read(0)');
    assert.equal((await db.query('select last_seen_id::int from public.admin_error_log_reads')).rows[0].last_seen_id,Number(error.id));
    await db.exec("set lumi_test.uid='00000000-0000-4000-8000-000000000099'");
    assert.equal((await db.query('select * from public.admin_error_log_reads')).rows.length,0);
    await db.exec('reset role');
    await db.query("update public.booking_email_jobs set status='sent',sent_at=now() where id=$1",[jobId]);
    assert.equal((await db.query('select count(*)::int as n from public.admin_error_events')).rows[0].n,0);
  } finally { await db.close(); }
});

test('error logs SQL: one-hour cron threshold, recovery, seven-day retention and informational open registration', async () => {
  const db = await setup();
  try {
    await db.exec("insert into cron.job_run_details(jobid,status,start_time) select jobid,'failed',now()-interval '30 minutes' from cron.job where jobname='lumi-booking-notifications'");
    await db.exec('select private.lumi_collect_admin_errors()');
    assert.equal((await db.query('select count(*)::int as n from public.admin_error_events')).rows[0].n,0);
    await db.exec("update cron.job_run_details set start_time=now()-interval '2 hours';select private.lumi_collect_admin_errors()");
    assert.equal((await db.query('select count(*)::int as n from public.admin_error_events')).rows[0].n,1);
    await db.exec("insert into cron.job_run_details(jobid,status,start_time) select jobid,'succeeded',now() from cron.job where jobname='lumi-booking-notifications';select private.lumi_collect_admin_errors()");
    assert.equal((await db.query('select count(*)::int as n from public.admin_error_events')).rows[0].n,0);
    await db.exec(`insert into public.booking_email_jobs(id,booking_id,kind,next_attempt_at) values('${jobId}','${bookingId}','new_booking',now()-interval '2 hours')`);
    assert.match((await db.query('select title from public.admin_error_events')).rows[0].title,/elakadt/);
    await db.query("update public.booking_email_jobs set status='sent',sent_at=now() where id=$1",[jobId]);
    await db.exec("insert into public.admin_error_events(source,source_key,occurred_at,title) values('cron','old',now()-interval '8 days','old');select private.lumi_collect_admin_errors()");
    assert.equal((await db.query('select count(*)::int as n from public.admin_error_events')).rows[0].n,0);
    await db.exec("set lumi_test.admin='false'");
    await db.query('insert into public.customer_profiles(user_id,full_name) values($1,$2)',[userId,'Synthetic account']);
    assert.equal((await db.query('select count(*)::int as n from public.customer_profiles')).rows[0].n,1);
    const notice=(await db.query("select * from public.booking_events where event_type='customer_registered'")).rows[0];
    assert.equal(notice.metadata.open_registration,true);assert.doesNotMatch(notice.message,/Synthetic account/);
    assert.equal((await db.query('select count(*)::int as n from public.bookings')).rows[0].n,1);
  } finally { await db.close(); }
});
