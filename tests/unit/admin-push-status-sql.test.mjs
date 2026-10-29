import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const schema = fs.readFileSync(new URL('../../supabase-schema.sql', import.meta.url), 'utf8');
const release = fs.readFileSync(new URL('../../supabase-admin-push-statuses.sql', import.meta.url), 'utf8');
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const change = (record, status, type = 'blocked') => ({ id: record.id, type, status, starts_at: record.starts_at, ends_at: record.ends_at, reason: record.reason || 'Synthetic guest', paid_amount: record.paid_amount ?? null });

async function setup() {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;create role authenticated;create role service_role;
      create schema auth;create schema private;create schema vault;create schema net;
      create function public.is_lumi_admin() returns boolean language sql as $$select coalesce(current_setting('test.admin',true),'yes')='yes'$$;
      create table public.services(id uuid primary key,name text,price_amount integer default 6500,duration_minutes integer default 60,active boolean default true,booking_enabled boolean default true);
      create table public.availability_windows(work_date date,start_time time,end_time time,slot_step_minutes integer default 30,active boolean default true);
      create table public.bookings(id uuid primary key,service_id uuid,customer_name text,customer_email text,starts_at timestamptz,ends_at timestamptz,
        paid_amount integer,status text default 'pending',final_price_amount integer,service_price_amount integer,coupon_discount_amount integer,coupon_code text,
        constraint bookings_status_check check(status in('pending','confirmed','done','cancelled','cancelled_by_customer')),
        exclude using gist(tstzrange(starts_at,ends_at,'[)') with &&) where(status in('pending','confirmed','done')));
      create table public.blocked_times(id uuid primary key,starts_at timestamptz,ends_at timestamptz,reason text,paid_amount integer,status text default 'blocked',
        constraint blocked_times_status_check check(status in('blocked','done','cancelled_by_customer')));
      create table public.admin_booking_change_operations(operation_id uuid primary key,changes jsonb,result jsonb,completed_at timestamptz);
      create table public.booking_email_jobs(id uuid primary key default gen_random_uuid(),booking_id uuid,kind text,dedupe_key text unique,payload jsonb,status text default 'pending');
      create table public.booking_events(id uuid default gen_random_uuid(),booking_id uuid,event_type text,channel text,status text,title text,message text,metadata jsonb);
      create table public.customer_profiles(user_id uuid,full_name text,created_at timestamptz default now());
      create table public.admin_error_events(id bigserial primary key,source text,title text,detail text);
      create table vault.decrypted_secrets(name text,decrypted_secret text);
      insert into vault.decrypted_secrets values('lumi_web_push_webhook_secret','synthetic-webhook-secret');
      create table private.test_pushes(id bigserial primary key,body jsonb);
      create function net.http_post(url text,headers jsonb,body jsonb,timeout_milliseconds integer) returns bigint language plpgsql as $$
      declare k bigint;begin
        if current_setting('test.push_failure',true)='yes' then raise exception 'Synthetic delivery unavailable';end if;
        insert into private.test_pushes(body) values(body) returning id into k;return k;end;$$;
      create function public.lumi_booking_style_extra_minutes(text) returns integer language sql as $$select 0$$;
    `);
    for (const name of ['apply_admin_booking_changes', 'lumi_enforce_booking_buffer']) {
      const start = schema.indexOf('CREATE OR REPLACE FUNCTION "public"."' + name + '"');
      await db.exec(schema.slice(start, schema.indexOf('$$;', start) + 3));
    }
    await db.exec(`create trigger bookings_enforce_buffer before insert or update of starts_at,ends_at,status on public.bookings for each row execute function public.lumi_enforce_booking_buffer();
      insert into public.services(id,name) values('${id(1)}','Synthetic manicure');
      insert into public.availability_windows values(current_date+1,'09:00','15:00',30,true);
      insert into public.blocked_times(id,starts_at,ends_at,reason) values('${id(2)}',((current_date+1)::text||' 09:00')::timestamp at time zone 'Europe/Budapest',((current_date+1)::text||' 10:00')::timestamp at time zone 'Europe/Budapest','Synthetic manual');
      insert into public.bookings(id,service_id,customer_name,customer_email,starts_at,ends_at,status) values('${id(3)}','${id(1)}','Synthetic online','guest@example.test',now()-interval '3 hours',now()-interval '2 hours','confirmed');`);
    const before = (await db.query('select * from public.blocked_times')).rows;
    await db.exec(release);
    assert.deepEqual((await db.query('select * from public.blocked_times')).rows, before);
    await db.exec(`create trigger bookings_push after insert or update of status on public.bookings for each row execute function public.enqueue_booking_web_push();
      create trigger registrations_push after insert on public.customer_profiles for each row execute function private.lumi_registration_notice();`);
    return db;
  } catch (error) { await db.close(); throw error; }
}

test('status SQL: durable distinct manual cancellations, released slots, idempotent saves and preserved rows', async () => {
  const db = await setup();
  try {
    let record = (await db.query('select * from public.blocked_times')).rows[0];
    assert.equal((await db.query("select count(*)::int n from public.get_available_slots($1,current_date+1) where label='09:00'", [id(1)])).rows[0].n, 0);
    const changes = [change(record, 'cancelled')];
    const saved = await db.query('select public.apply_admin_booking_changes($1,$2::jsonb) as result', [id(10), JSON.stringify(changes)]);
    assert.equal(saved.rows[0].result.modified_count, 1);
    assert.deepEqual(saved.rows[0].result.email_jobs, []);
    assert.deepEqual((await db.query('select public.apply_admin_booking_changes($1,$2::jsonb) as result', [id(10), JSON.stringify(changes)])).rows, saved.rows);
    record = (await db.query('select * from public.blocked_times')).rows[0];
    assert.equal(record.status, 'cancelled');
    assert.equal(record.reason, 'Synthetic manual');
    for (const fn of ['get_available_slots', 'get_available_slots_for_style']) assert.equal((await db.query(`select count(*)::int n from public.${fn}($1,current_date+1) where label='09:00'`, [id(1)])).rows[0].n, 1);
    const report = (await db.query("select public.get_booking_monthly_report_data(date_trunc('month',current_date+1)::date) as report")).rows[0].report;
    assert.equal(report.manual.cancelled_owner, 1); assert.equal(report.manual.cancelled_customer, 0); assert.equal(report.manual.booked_minutes, 0);
    await db.query('select public.apply_admin_booking_changes($1,$2::jsonb)', [id(11), JSON.stringify([change(record, 'cancelled_by_customer')])]);
    assert.equal((await db.query('select status from public.blocked_times')).rows[0].status, 'cancelled_by_customer');
    await assert.rejects(db.query('select public.apply_admin_booking_changes($1,$2::jsonb)', [id(12), JSON.stringify([change(record, 'no_show')])]), /véget ért/);
    assert.equal((await db.query('select status from public.blocked_times')).rows[0].status, 'cancelled_by_customer');
    await db.exec("set test.admin='no'");
    await assert.rejects(db.query('select public.apply_admin_booking_changes($1,$2::jsonb)', [id(13), JSON.stringify([change(record, 'blocked')])]), /Admin jogosultság/);
  } finally { await db.close(); }
});

test('status SQL: no show sends no email, batch rollback and overlap protection remain effective', async () => {
  const db = await setup();
  try {
    const record = (await db.query('select * from public.bookings')).rows[0];
    await db.query('select public.apply_admin_booking_changes($1,$2::jsonb)', [id(20), JSON.stringify([{ ...change(record, 'no_show', 'booking'), email_notification: { status: 'no_show' } }])]);
    assert.equal((await db.query('select status from public.bookings')).rows[0].status, 'no_show');
    assert.equal((await db.query('select count(*)::int n from public.booking_email_jobs')).rows[0].n, 0);
    await assert.rejects(db.query('select public.apply_admin_booking_changes($1,$2::jsonb)', [id(21), JSON.stringify([change(record, 'done', 'booking'), { ...change(record, 'invalid', 'booking'), id: id(99) }])]), /statusz/);
    assert.equal((await db.query('select status from public.bookings')).rows[0].status, 'no_show');
    await db.exec(`insert into public.bookings(id,service_id,starts_at,ends_at,status) values('${id(30)}','${id(1)}',now()-interval '3 hours',now()-interval '2 hours','confirmed')`);
    await assert.rejects(db.query('select public.apply_admin_booking_changes($1,$2::jsonb)', [id(22), JSON.stringify([change(record, 'confirmed', 'booking')])]), /utkozik/);
    assert.equal((await db.query('select status from public.bookings where id=$1', [id(3)])).rows[0].status, 'no_show');
  } finally { await db.close(); }
});

test('push SQL: guest categories only, private identifiers, fail-open transactions and server-only dispatcher', async () => {
  const db = await setup();
  try {
    await db.exec("update public.bookings set status='cancelled'");
    assert.equal((await db.query('select count(*)::int n from private.test_pushes')).rows[0].n, 0);
    await db.exec(`set test.admin='no';insert into public.customer_profiles(user_id,full_name) values('${id(40)}','Private guest');
      insert into public.admin_error_events(source,title,detail) values('booking_email','Synthetic error','8/8'),('cron','Cron failure','Technical');
      update public.bookings set status='confirmed';update public.bookings set status='cancelled_by_customer';`);
    const pushes = (await db.query('select body from private.test_pushes order by id')).rows.map(row => row.body);
    assert.equal(pushes.length, 3);
    assert.deepEqual(pushes[0], { kind: 'guestRegistration', record: { user_id: id(40) } });
    assert.deepEqual(pushes[1], { kind: 'bookingEmailFailure', record: { id: 1 } });
    assert.equal(pushes[2].record.status, 'cancelled_by_customer');
    assert.doesNotMatch(JSON.stringify(pushes.slice(0, 2)), /Private guest|example.test/);
    await db.exec(`set test.push_failure='yes';insert into public.customer_profiles(user_id,full_name) values('${id(41)}','Still registered');`);
    assert.equal((await db.query('select count(*)::int n from public.customer_profiles')).rows[0].n, 2);
    assert.equal((await db.query("select has_function_privilege('authenticated','private.lumi_enqueue_admin_push(jsonb)','execute') as allowed")).rows[0].allowed, false);
    assert.equal((await db.query("select has_function_privilege('anon','private.lumi_email_error_push()','execute') as allowed")).rows[0].allowed, false);
  } finally { await db.close(); }
});
