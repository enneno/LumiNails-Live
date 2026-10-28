import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicationHandler } from '../../supabase/functions/_shared/publication-handler.mjs';
import { contentFingerprint, publicContent } from '../../supabase/functions/_shared/public-snapshot.mjs';

const snapshot = {siteContent:{fooldal:{cim:'Test'},email:{internal:'excluded'}},services:[{name:'Service',active:true,sort_order:0}],phoneVisible:true,priceEffectiveAt:null};
const settings = [{key:'site_content',value:snapshot.siteContent,updated_at:'2026-10-28T00:00:00Z'},{key:'telefon_lathato',value:{visible:true}}];

function fixture({admin=true,user=true,deployed=null,hookStatus=200,claimError=false}={}) {
  let claims=0, hooks=0, roleChecks=0, released=0;
  let claimed=false;
  const values={SUPABASE_URL:'https://project.example.test',SUPABASE_ANON_KEY:'public-test-key',SUPABASE_SERVICE_ROLE_KEY:'server-test-key',LUMI_TEST_SITE_URL:'https://site.example.test',CLOUDFLARE_TEST_DEPLOY_HOOK:'https://api.cloudflare.com/test-hook'};
  const handler=publicationHandler({environment:'test',env:key=>values[key],createClient:()=>({
    auth:{getUser:async()=>({data:{user:user?{id:'admin-id'}:null},error:null})},
    rpc:async(name)=>{
      if(name==='is_lumi_admin'){roleChecks++;return{data:admin,error:null};}
      if(name==='lumi_claim_publication'){claims++;if(claimError)return{error:{code:'missing'}};const first=!claimed;claimed=true;return{data:first,error:null};}
      if(name==='lumi_release_publication'){released++;claimed=false;return{error:null};}
      return{data:null,error:null};
    }
  }),fetchImpl:async(input,options)=>{
    const url=new URL(input);
    if(url.pathname==='/rest/v1/services')return Response.json(snapshot.services);
    if(url.pathname==='/rest/v1/site_settings')return Response.json(settings);
    if(url.pathname==='/deployment.json')return deployed?Response.json(deployed):new Response('',{status:404});
    if(url.pathname==='/test-hook'){assert.equal(options.method,'POST');hooks++;return new Response('',{status:hookStatus});}
    throw Error('unexpected request');
  }});
  const call=(body={})=>handler(new Request('https://edge.example.test',{method:'POST',headers:{Authorization:'Bearer valid-test-session','Content-Type':'application/json'},body:JSON.stringify(body)}));
  return{call,stats:()=>({claims,hooks,roleChecks,released})};
}

test('content hash is canonical, ignores admin-only email templates and never exports private records',async()=>{
  const same={...snapshot,siteContent:{email:{internal:'changed'},fooldal:{cim:'Test'}},contentUpdatedAt:'different'};
  assert.equal(await contentFingerprint(snapshot),await contentFingerprint(same));
  assert.equal(publicContent(snapshot).siteContent.email,undefined);
  assert.notEqual(await contentFingerprint(snapshot),await contentFingerprint({...snapshot,phoneVisible:false}));
});
test('revoked admin and signed-out users cannot trigger a build',async()=>{
  for(const options of [{admin:false},{user:false}]){const f=fixture(options);const r=await f.call();assert.ok([401,403].includes(r.status));assert.equal(f.stats().hooks,0);assert.equal(f.stats().claims,0);}
});
test('unchanged, actually served content does not claim or trigger a build',async()=>{
  const hash=await contentFingerprint(snapshot);
  const f=fixture({deployed:{schemaVersion:1,contentHash:hash,origin:'https://site.example.test',environment:'test'}});
  const r=await f.call();assert.equal((await r.json()).state,'published');assert.equal(f.stats().hooks,0);assert.equal(f.stats().claims,0);
});
test('parallel identical publication requests trigger one hook and each checks current admin rights',async()=>{
  const f=fixture();const responses=await Promise.all([f.call(),f.call(),f.call()]);
  assert.ok(responses.every(r=>[200,202].includes(r.status)));assert.equal(f.stats().hooks,1);assert.equal(f.stats().roleChecks,3);
});
test('failed hook releases its claim; status and migration failures never dispatch',async()=>{
  const failed=fixture({hookStatus:500});assert.equal((await failed.call()).status,502);assert.equal(failed.stats().released,1);
  const status=fixture();assert.equal((await status.call({action:'status'})).status,200);assert.equal(status.stats().hooks,0);
  const missing=fixture({claimError:true});assert.equal((await missing.call()).status,503);assert.equal(missing.stats().hooks,0);
});
