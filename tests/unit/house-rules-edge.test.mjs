import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';
import { HOUSE_RULES_VERSION } from '../../supabase/functions/_shared/house-rules-policy.mjs';
const bookingId='00000000-0000-4000-8000-000000000012';
async function handler(slug) {
  const calls=[];
  const client={ rpc:async(name,args)=>{
    calls.push({name,args});
    const data=name==='consume_booking_management_rate_limit'?[{allowed:true}]:name==='create_booking_with_rules'?bookingId:
      name==='enqueue_new_booking_email'?[{id:'synthetic-job',status:'sent'}]:name==='get_booking_status_verified'?[{public_reference:'LUMI-ABCD'}]:name==='cancel_booking_verified_with_rules'?[{success:true,result:'cancelled',message:'OK'}]:null;
    return {data,error:null};
  },from:()=>{const chain={select:()=>chain,eq:()=>chain,single:async()=>({data:{public_reference:'LUMI-ABCD'},error:null})};return chain;},
  auth:{getUser:async token=>({data:{user:token==='valid.jwt.token'?{id:bookingId,email:'guest@example.test',email_confirmed_at:'2026-01-01'}:null},error:null})}};
  const compiled=await build({entryPoints:[`supabase/functions/${slug}/index.ts`],bundle:true,write:false,platform:'node',format:'cjs',external:['https://*'],logLevel:'silent'});
  const sandbox={TextEncoder,Uint8Array,crypto,Response,Request,URL,Date,console:{error(){},warn(){}},
    Deno:{env:{get:key=>({SUPABASE_URL:'https://synthetic.example.test',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service',SUPABASE_ANON_KEY:'synthetic-anon'})[key]}},
    require:name=>name.includes('/server.ts')?{serve:fn=>sandbox.handler=fn}:{createClient:()=>client}};
  vm.runInNewContext(compiled.outputFiles[0].text,sandbox);
  return {calls,invoke:async(body,token)=>{const response=await sandbox.handler(new Request('https://synthetic.example.test',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)}));return {status:response.status,data:await response.json()};}};
}
const consent={house_rules_accepted:true,house_rules_version:HOUSE_RULES_VERSION};
test('house rules Edge: booking rejects absent/false/stale consent; preserves authenticated identity and queue reuse',async()=>{
  const edge=await handler('create-booking-with-email');
  const body={request_key:bookingId,service_id:bookingId,customer_name:'Synthetic guest',customer_phone:'201234567',customer_email:'guest@example.test',starts_at:new Date(Date.now()+86400000).toISOString()};
  for(const flags of [{},{...consent,house_rules_accepted:false},{...consent,house_rules_accepted:'true'},{...consent,house_rules_version:'stale'}]) assert.equal((await edge.invoke({...body,...flags})).status,400);
  assert.equal(edge.calls.length,0);
  assert.equal((await edge.invoke({...body,...consent},'invalid.jwt.token')).status,401);
  assert.equal(edge.calls.length,0);
  const created=await edge.invoke({...body,...consent},'valid.jwt.token');
  assert.equal(created.data.ok,true);assert.equal(created.data.account_linked,true);assert.equal(created.data.email.reused,true);
  const call=edge.calls.find(call=>call.name==='create_booking_with_rules');
  assert.equal(call.args.p_customer_user_id,bookingId);assert.equal(call.args.p_rules_version,HOUSE_RULES_VERSION);assert.equal(call.args.p_rules_accepted,true);
  assert.equal((await edge.invoke({...body,customer_email:'other@example.test',...consent},'valid.jwt.token')).status,400);
  assert.equal(edge.calls.filter(call=>call.name==='create_booking_with_rules').length,1);
  assert.equal((await edge.invoke({...body,...consent})).data.account_linked,false);
  assert.equal(edge.calls.filter(call=>call.name==='create_booking_with_rules')[1].args.p_customer_user_id,undefined);
});
test('house rules Edge: verified lookup needs no checkbox; cancellation cannot bypass exact-version consent',async()=>{
  const edge=await handler('manage-booking');const body={reference:'LUMI-ABCD',contact:'guest@example.test'};
  assert.equal((await edge.invoke({...body,action:'lookup'})).status,200);
  for(const flags of [{},{...consent,house_rules_accepted:false},{...consent,house_rules_version:'stale'}]) assert.equal((await edge.invoke({...body,action:'cancel',...flags})).status,400);
  assert.equal(edge.calls.filter(call=>call.name==='cancel_booking_verified_with_rules').length,0);
  assert.equal((await edge.invoke({...body,action:'cancel',...consent})).data.ok,true);
  const call=edge.calls.find(call=>call.name==='cancel_booking_verified_with_rules');
  assert.equal(call.args.p_reference,body.reference);assert.equal(call.args.p_contact,body.contact);assert.equal(call.args.p_rules_version,HOUSE_RULES_VERSION);
});
