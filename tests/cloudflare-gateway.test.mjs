import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {createBackend} from '../hosting/node/backend.mjs';
const origin='https://pribadidepok.sch.id';
const request=(path,body,headers={})=>new Request(origin+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{origin,'content-type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});

test('gateway relays reads, backup routes and date filters to the existing Cloudflare origin',async()=>{
 const calls=[];
 const backend=await createBackend({origin,mode:'cloudflare',fetchImpl:async(url,options)=>{calls.push({url,options});return Response.json({revision:2},{headers:{'set-cookie':'upstream-cookie=not-forwarded'}});}});
 for(const path of ['state','history?from=2026-01-01&to=2026-10-13','backup/old:backup']){
  const response=await backend.handle(request(path));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{revision:2});
  assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('set-cookie'),null);
  assert.equal(calls.at(-1).url,'https://uniform.pribadisch.workers.dev/api/'+path);
 }
});

test('student purchase body and retry ID are preserved through a real HTTP upstream',async()=>{
 const received=[],saved=new Map();
 const worker=createServer(async(req,res)=>{
  let body='';for await(const part of req)body+=part;
  const data=JSON.parse(body);received.push({data,headers:req.headers});
  if(!saved.has(data.id))saved.set(data.id,data);
  res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({saved:saved.size}));
 });
 worker.listen(0,'127.0.0.1');await once(worker,'listening');
 try{
  const backend=await createBackend({origin,mode:'cloudflare',fetchImpl:(url,options)=>fetch('http://127.0.0.1:'+worker.address().port+new URL(url).pathname,options)});
  const data={id:'same-purchase',action:'Keluar',studentName:'Test student',studentClass:'7A',staffName:'Rahmawati',items:[{key:'0|Baru|1',quantity:1,revision:4},{key:'1|Lama|1-2',quantity:2,revision:3}]};
  for(let i=0;i<2;i++)assert.deepEqual(await (await backend.handle(request('movement',data,{'cookie':'school-session=private','oai-authenticated-user-email':'untrusted@example.com'}))).json(),{saved:1});
  assert.equal(received.length,2);assert.equal(saved.size,1);
  for(const r of received){assert.deepEqual(r.data,data);assert.equal(r.headers.origin,'https://uniform.pribadisch.workers.dev');assert.equal(r.headers.cookie,undefined);assert.equal(r.headers['oai-authenticated-user-email'],undefined);}
 }finally{worker.closeAllConnections();await new Promise(resolve=>worker.close(resolve));}
});

test('gateway blocks foreign origins, malformed JSON and unsupported endpoints before forwarding',async()=>{
 let calls=0;const backend=await createBackend({origin,mode:'cloudflare',fetchImpl:async()=>{calls++;return Response.json({});}});
 assert.equal((await backend.handle(request('movement',{}, {origin:'https://other.example'}))).status,403);
 assert.equal((await backend.handle(request('movement',{}, {origin:''}))).status,403);
 assert.equal((await backend.handle(request('movement',{}, {'content-type':'text/plain'}))).status,415);
 assert.equal((await backend.handle(new Request(origin+'/api/movement',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{' }))).status,400);
 assert.equal((await backend.handle(request('unknown'))).status,404);
 assert.equal((await backend.handle(request('movement'))).status,405);
 assert.equal((await backend.handle(request('state',{}))).status,405);
 assert.equal(calls,0);
});

test('Cloudflare validation failures retain their status and gateway never retries a failed write',async()=>{
 const conflict=await createBackend({origin,mode:'cloudflare',fetchImpl:async()=>Response.json({error:'Stok berubah'},{status:409})});
 const response=await conflict.handle(request('movement',{}));assert.equal(response.status,409);assert.deepEqual(await response.json(),{error:'Stok berubah'});
 let calls=0;const failed=await createBackend({origin,mode:'cloudflare',fetchImpl:async()=>{calls++;throw Error('Connection lost');}});
 assert.equal((await failed.handle(request('movement',{id:'keep-retry-id'}))).status,502);assert.equal(calls,1);
 const html=await createBackend({origin,mode:'cloudflare',fetchImpl:async()=>new Response('<html>error</html>')});
 assert.equal((await html.handle(request('state'))).status,502);
});

test('configuration errors do not silently select another database',async()=>{
 await assert.rejects(createBackend({origin,mode:'unknown'}),/SERAGAM_BACKEND/);
 await assert.rejects(createBackend({origin,mode:'cloudflare',upstream:'http://unsafe.example'}),/HTTPS origin/);
});
