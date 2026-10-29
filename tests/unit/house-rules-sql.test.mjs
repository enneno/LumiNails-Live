import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
const schema = fs.readFileSync(new URL('../../supabase-schema.sql', import.meta.url), 'utf8');
const release = fs.readFileSync(new URL('../../supabase-house-rules-consent.sql', import.meta.url), 'utf8');
const rules = JSON.parse(fs.readFileSync(new URL('../../supabase/functions/_shared/house-rules.json', import.meta.url)));
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function original(schemaName, name) {
  const start = schema.indexOf(`CREATE OR REPLACE FUNCTION "${schemaName}"."${name}"`);
  assert.ok(start >= 0);
  return schema.slice(start, schema.indexOf('$$;', start) + 3);
}
async function setup() {
  const db = new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role;
      create schema private;create schema auth;grant usage on schema public,auth to authenticated,anon,service_role;
      create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
      create function public.is_verified_customer() returns boolean language sql as $$select auth.uid() is not null$$;
      create table public.bookings(id uuid primary key,public_reference text,legacy_public_reference text,customer_email text,customer_phone text,
        customer_user_id uuid,status text default 'confirmed',starts_at timestamptz);
      create table public.booking_events(id uuid default gen_random_uuid(),booking_id uuid references public.bookings(id),event_type text,
        channel text,status text,title text,message text,metadata jsonb,created_at timestamptz default now());
      create table public.booking_email_jobs(booking_id uuid,kind text,dedupe_key text unique,payload jsonb);
      -- Synthetic implementation of existing creation RPCs: test only the new wrapper's delegation, atomicity and retry handling.
      create function public.create_booking_idempotent(p_request_key uuid,p_service_id uuid,p_customer_name text,p_customer_phone text,p_customer_email text,p_note text,p_starts_at timestamptz,p_coupon_id uuid default null,p_coupon_code text default null)
      returns uuid language plpgsql as $$begin
        insert into public.bookings(id,public_reference,customer_email,customer_phone,starts_at) values(p_request_key,'LUMI-ABCD',p_customer_email,p_customer_phone,p_starts_at) on conflict do nothing;
        return p_request_key;end;$$;
      create function public.create_booking_idempotent_for_user(p_request_key uuid,p_service_id uuid,p_customer_name text,p_customer_phone text,p_customer_email text,p_note text,p_starts_at timestamptz,p_customer_user_id uuid,p_coupon_id uuid default null,p_coupon_code text default null)
      returns uuid language plpgsql as $$begin
        perform public.create_booking_idempotent(p_request_key,p_service_id,p_customer_name,p_customer_phone,p_customer_email,p_note,p_starts_at,p_coupon_id,p_coupon_code);
        update public.bookings set customer_user_id=p_customer_user_id where id=p_request_key;return p_request_key;end;$$;`);
    for (const [s, n] of [['private','lumi_booking_phone_key'],['private','lumi_booking_contact_matches'],['private','lumi_cancel_booking'],['public','cancel_booking_by_verified_contact'],['public','cancel_my_booking']]) await db.exec(original(s,n));
    await db.exec(`revoke all on function public.cancel_my_booking(uuid,text) from public;grant execute on function public.cancel_my_booking(uuid,text) to authenticated,service_role;
      revoke all on function public.cancel_booking_by_verified_contact(text,text,text) from public;grant execute on function public.cancel_booking_by_verified_contact(text,text,text) to service_role;`);
    await db.exec(release);
    return db;
  } catch (error) { await db.close(); throw error; }
}
const create = (db, n, accepted = true, version = rules.version, user = null) => db.query(`select public.create_booking_with_rules($1,$2,'Synthetic guest','201234567','guest@example.test','',now()+interval '3 days',null,null,$3,$4,$5) id`,[id(n),id(1),user,accepted,version]);

test('house rules SQL: exact consent, durable version, idempotent retries and atomic rollback', async () => {
  const db = await setup();
  try {
    await assert.rejects(create(db,2,false), /Fogadd el/);
    await assert.rejects(create(db,2,true,'outdated'), /Fogadd el/);
    assert.equal((await db.query('select count(*)::int n from bookings')).rows[0].n,0);
    await create(db,2);await create(db,2);
    await create(db,3,true,rules.version,id(9));
    assert.equal((await db.query('select count(*)::int n from booking_events')).rows[0].n,2);
    const saved = (await db.query('select * from booking_events where booking_id=$1',[id(2)])).rows[0];
    assert.equal(saved.metadata.version,rules.version);assert.equal(saved.metadata.scope,'booking');assert.ok(saved.created_at);
    assert.equal((await db.query('select customer_user_id from bookings where id=$1',[id(3)])).rows[0].customer_user_id,id(9));
    await db.exec(`create function private.reject_test_audit() returns trigger language plpgsql as $$begin raise exception 'Synthetic audit failure';end;$$;
      create trigger test_audit before insert on booking_events for each row execute function private.reject_test_audit();`);
    await assert.rejects(create(db,4), /Synthetic audit failure/);
    assert.equal((await db.query('select count(*)::int n from bookings where id=$1',[id(4)])).rows[0].n,0);
  } finally { await db.close(); }
});

test('house rules SQL: original ownership, late-cancellation note, legacy reference/contact and e-mail queue survive', async () => {
  const db = await setup();
  try {
    await create(db,2,true,rules.version,id(9));
    await db.query("update bookings set starts_at=now()+interval '3 hours', legacy_public_reference='LUMI-OLD1' where id=$1",[id(2)]);
    await db.exec(`select set_config('test.uid','${id(8)}',false);set role authenticated;`);
    assert.equal((await db.query('select * from public.cancel_my_booking_with_rules($1,$2,true,$3)',[id(2),'Reason',rules.version])).rows[0].result,'not_found');
    await assert.rejects(db.query('select * from public.cancel_my_booking($1,$2)',[id(2),'Reason']), /permission denied/);
    await db.exec(`reset role;select set_config('test.uid','${id(9)}',false);set role authenticated;`);
    assert.equal((await db.query('select * from public.cancel_my_booking_with_rules($1,$2,true,$3)',[id(2),'',rules.version])).rows[0].result,'note_required');
    await assert.rejects(db.query('select * from public.cancel_my_booking_with_rules($1,$2,false,$3)',[id(2),'Reason',rules.version]), /Fogadd el/);
    await db.exec('reset role;set role service_role;');
    assert.equal((await db.query('select * from public.cancel_booking_verified_with_rules($1,$2,$3,true,$4)',['LUMI-OLD1','other@example.test','Reason',rules.version])).rows[0].result,'not_found');
    const args=['lumi old1','guest@example.test','Reason',rules.version];
    assert.equal((await db.query('select * from public.cancel_booking_verified_with_rules($1,$2,$3,true,$4)',args)).rows[0].result,'cancelled');
    assert.equal((await db.query('select * from public.cancel_booking_verified_with_rules($1,$2,$3,true,$4)',args)).rows[0].result,'already_cancelled');
    await db.exec('reset role;');
    assert.equal((await db.query('select status from bookings')).rows[0].status,'cancelled_by_customer');
    assert.equal((await db.query('select count(*)::int n from booking_email_jobs')).rows[0].n,1);
    assert.equal((await db.query("select count(*)::int n from booking_events where event_type='cancellation_rules_accepted'")).rows[0].n,1);
    await create(db,3,true,rules.version,id(9));
    await db.exec('set role authenticated;');
    assert.equal((await db.query('select * from public.cancel_my_booking_with_rules($1,$2,true,$3)',[id(3),'',rules.version])).rows[0].result,'cancelled');
    await db.exec('reset role;');
    assert.equal((await db.query("select metadata->>'version' version from booking_events where booking_id=$1 and event_type='cancellation_rules_accepted'",[id(3)])).rows[0].version,rules.version);
    for (const role of ['anon','authenticated']) {
      assert.equal((await db.query(`select has_function_privilege($1,'public.create_booking_with_rules(uuid,uuid,text,text,text,text,timestamptz,uuid,text,uuid,boolean,text)','execute') allowed`,[role])).rows[0].allowed,false);
      assert.equal((await db.query(`select has_function_privilege($1,'public.cancel_booking_verified_with_rules(text,text,text,boolean,text)','execute') allowed`,[role])).rows[0].allowed,false);
    }
  } finally { await db.close(); }
});
