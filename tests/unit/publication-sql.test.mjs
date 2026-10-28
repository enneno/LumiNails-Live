import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('publication SQL: private claims, atomic CMS save, stale-editor rejection and atomic price list', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role;
      create function public.is_lumi_admin() returns boolean language sql as
      $$ select current_setting('lumi_test.admin', true) = 'true' $$;
      create table public.site_settings(key text primary key, value jsonb not null, updated_at timestamptz not null default now());
      create table public.services(id uuid primary key, name text not null, description text, price_text text,
        price_amount integer, price_unit text, price_suffix text, duration_minutes integer check(duration_minutes >= 0),
        sort_order integer, booking_enabled boolean, active boolean);
      alter table public.site_settings enable row level security;
      alter table public.services enable row level security;
      create policy admin_settings on public.site_settings to authenticated using(public.is_lumi_admin()) with check(public.is_lumi_admin());
      create policy admin_services on public.services to authenticated using(public.is_lumi_admin()) with check(public.is_lumi_admin());
      grant usage on schema public to authenticated, anon, service_role;
      grant select, insert, update on public.site_settings, public.services to authenticated;
    `);
    await db.exec(fs.readFileSync(new URL('../../supabase/migrations/20261028160120_static_publication.sql', import.meta.url), 'utf8'));
    const hash = 'a'.repeat(64);
    await db.exec('set role anon');
    await assert.rejects(db.query('select public.lumi_claim_publication($1,$2)', ['test', hash]), /permission denied/);
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select public.lumi_claim_publication($1,$2)', ['test', hash]), /permission denied/);
    await db.exec('set role service_role');
    assert.equal((await db.query('select public.lumi_claim_publication($1,$2) as claimed', ['test', hash])).rows[0].claimed, true);
    assert.equal((await db.query('select public.lumi_claim_publication($1,$2) as claimed', ['test', hash])).rows[0].claimed, false);
    assert.equal((await db.query('select public.lumi_claim_publication($1,$2) as claimed', ['live', hash])).rows[0].claimed, true);
    await db.exec('reset role; set role authenticated');
    await db.exec("set lumi_test.admin = 'false'");
    await assert.rejects(db.query('select public.save_public_site_content($1::jsonb,null)', [{kapcsolat:{telefonLathato:false}}]), /Not authorized/);
    await db.exec("set lumi_test.admin = 'true'");
    const first = (await db.query('select public.save_public_site_content($1::jsonb,null)::text as version', [{kapcsolat:{telefonLathato:false},fooldal:{cim:'first'}}])).rows[0].version;
    assert.equal((await db.query("select value from public.site_settings where key='telefon_lathato'")).rows[0].value.visible, false);
    await assert.rejects(db.query('select public.save_public_site_content($1::jsonb,null)', [{kapcsolat:{telefonLathato:true}}]), /CONTENT_VERSION_CONFLICT/);
    assert.equal((await db.query("select value from public.site_settings where key='telefon_lathato'")).rows[0].value.visible, false);
    await db.query('select public.save_public_site_content($1::jsonb,$2)', [{kapcsolat:{telefonLathato:true}}, first]);
    assert.equal((await db.query("select value from public.site_settings where key='telefon_lathato'")).rows[0].value.visible, true);

    const ids = ['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'];
    await db.exec('reset role');
    for (const id of ids) await db.query("insert into public.services(id,name,duration_minutes) values($1,'original',60)",[id]);
    const versions = (await db.query('select id,editor_version::text from public.services order by id')).rows;
    await db.exec('set role authenticated');
    const payload = {name:'changed',description:'',price_text:'100 Ft',price_amount:100,price_unit:'Ft',price_suffix:'',duration_minutes:60,sort_order:0,booking_enabled:true,active:true};
    const items = versions.map(row=>({id:row.id,expected_version:row.editor_version,payload}));
    const invalid = structuredClone(items); invalid[1].payload.duration_minutes = -1;
    await assert.rejects(db.query('select public.save_public_services($1::jsonb)', [invalid]), /check constraint/);
    assert.deepEqual((await db.query('select name from public.services order by id')).rows.map(x=>x.name), ['original','original']);
    await db.query('select public.save_public_services($1::jsonb)', [items]);
    assert.deepEqual((await db.query('select name from public.services order by id')).rows.map(x=>x.name), ['changed','changed']);
    await assert.rejects(db.query('select public.save_public_services($1::jsonb)', [items]), /CONTENT_VERSION_CONFLICT/);
    await db.exec('reset role');
    await assert.rejects(db.query('select * from private.lumi_publications').then(async () => {
      await db.exec('set role authenticated'); return db.query('select * from private.lumi_publications');
    }), /permission denied/);
  } finally { await db.close(); }
});
