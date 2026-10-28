import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { contentFingerprint } from '../../supabase/functions/_shared/public-snapshot.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const dist = path.join(root, 'dist');

test('release exports only public files, one consistent snapshot and immutable content-addressed assets', async () => {
  assert.ok(fs.existsSync(dist), 'Run npm run build:site before this release check');
  function files(dir) {return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
  const output=files(dist);
  assert.ok(output.length>20);
  for(const file of output){
    assert.doesNotMatch(path.relative(dist,file),/(^|[\\/])(src|supabase|scripts|tests|node_modules|local-backups|\.git)([\\/]|$)/);
    assert.doesNotMatch(file,/\.(sql|md|ts|toml)$/);
    assert.doesNotMatch(path.basename(file),/^package(?:-lock)?\.json$/);
  }
  const snapshot=JSON.parse(fs.readFileSync(path.join(dist,'adatok.json'),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(dist,'deployment.json'),'utf8'));
  assert.equal(manifest.contentHash,await contentFingerprint(snapshot));
  assert.equal(snapshot.siteContent.email,undefined);
  assert.match(fs.readFileSync(path.join(dist,'index.html'),'utf8'),new RegExp('data-lumi-content-fingerprint="'+manifest.contentHash+'"'));
  for(const file of output.filter(x=>x.endsWith('.html'))){
    const html=fs.readFileSync(file,'utf8');
    if(manifest.environment==='test') assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
    for(const match of html.matchAll(/(?:href|src)="(\/assets\/[^"?]+)"/g))assert.ok(fs.existsSync(path.join(dist,match[1])),match[1]);
  }
  const headers=fs.readFileSync(path.join(dist,'_headers'),'utf8');
  assert.match(headers,/\/assets\/\*[\s\S]*max-age=31536000, immutable/);
  assert.match(headers,/max-age=0, must-revalidate/);
  assert.match(headers,/\/deployment.json\n  Access-Control-Allow-Origin: \*/);
});

test('admin requests coalesce, editor data stays in-session, dynamic panels refresh and logout invalidates cache',async()=>{
  const calls=[];const state={session:{},adminVerified:true};
  const context=vm.createContext({allapot:state,Map,Set,Promise,
    foglalasokBetoltese:async()=>calls.push('bookings'), esemenynaploBetoltese:async()=>calls.push('events'),
    szolgaltatasokBetoltese:async()=>calls.push('services'),kuponokBetoltese:async()=>calls.push('coupons'),
    idosavokBetoltese:async()=>calls.push('availability'),tiltasokBetoltese:async()=>calls.push('blocked'),
    beallitasokBetoltese:async()=>calls.push('settings'),vendegProfilokBetoltese:async()=>calls.push('profiles'),
    adminV2AttekintesFrissitese:async()=>{},
  });
  vm.runInContext(fs.readFileSync(path.join(root,'src/admin/02-request-cache.js'),'utf8'),context);
  await context.adminPanelAdatokBetoltese('szolgaltatasok');
  await context.adminPanelAdatokBetoltese('szolgaltatasok');
  assert.deepEqual(calls,['services']);
  await context.adminPanelAdatokBetoltese('foglalasok');await context.adminPanelAdatokBetoltese('foglalasok');
  assert.equal(calls.filter(x=>x==='bookings').length,2);
  let count=0,release;const pending=new Promise(resolve=>{release=resolve;});
  const a=context.adminKeresOsszevonasa('same',async()=>{count++;await pending;});
  const b=context.adminKeresOsszevonasa('same',()=>{count++;});release();await Promise.all([a,b]);assert.equal(count,1);
  const valid=context.adminKeresMunkamenetOr();assert.equal(valid(),true);
  context.adminAdatCacheTorlese();assert.equal(valid(),false);
  await context.adminPanelAdatokBetoltese('szolgaltatasok');assert.equal(calls.filter(x=>x==='services').length,2);
  await context.adminPanelAdatokBetoltese('arkalkulator');assert.equal(calls.filter(x=>x==='coupons').length,1);
  state.adminVerified=false;await context.adminPanelAdatokBetoltese('esemenynaplo');assert.equal(calls.includes('events'),false);
});
