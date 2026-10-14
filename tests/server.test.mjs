import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from 'esbuild';
import {openDatabase} from '../server/database.mjs';
import {startServer} from '../server/index.mjs';
import {get as httpGet} from 'node:http';
import {gunzipSync} from 'node:zlib';

const dir=mkdtempSync(join(tmpdir(),'seragam-server-'));
test.after(()=>rmSync(dir,{recursive:true,force:true}));

test('SQLite file persists data, migrates once, and rolls back failed batches',async()=>{
 const path=join(dir,'persist.sqlite');
 let {sqlite,DB}=openDatabase(path);
 await DB.batch([DB.prepare("INSERT INTO stock (key,quantity,revision) VALUES ('13|Baru|9',4,0)")]);
 await assert.rejects(DB.batch([DB.prepare("UPDATE stock SET quantity=9 WHERE key='13|Baru|9'"),DB.prepare('INSERT INTO missing_table VALUES (1)')]));
 sqlite.close();
 ({sqlite,DB}=openDatabase(path));
 assert.equal((await DB.prepare("SELECT quantity FROM stock WHERE key='13|Baru|9'").first()).quantity,4);
 sqlite.close();
});

test('database path inside public_html is refused',()=>{
 assert.throws(()=>openDatabase(join(dir,'public_html','inventory.sqlite')),/public web folders/);
});

test('Node server serves the page and the inventory API',async()=>{
 const publicRoot=join(dir,'public'),apiFile=join(dir,'api.mjs');
 mkdirSync(publicRoot);writeFileSync(join(publicRoot,'index.html'),'<html>seragam</html>');writeFileSync(join(dir,'secret.txt'),'private');
 await build({entryPoints:['server/api.ts'],outfile:apiFile,bundle:true,format:'esm',platform:'node',logLevel:'silent'});
 const server=await startServer({port:0,host:'127.0.0.1',databasePath:join(dir,'http.sqlite'),apiFile,publicRoot});
 const origin=`http://127.0.0.1:${server.address().port}`;
 try{
  const page=await fetch(origin+'/');assert.equal(page.status,200);assert.equal(await page.text(),'<html>seragam</html>');
  writeFileSync(join(publicRoot,'index.html'),'<html>rebuilt</html>');
  assert.equal(await (await fetch(origin+'/')).text(),'<html>rebuilt</html>','a rebuild must show without restarting');
  assert.equal((await fetch(origin+'/../secret.txt')).status,404);
  assert.equal((await fetch(origin+'/.env')).status,404);
  const move={id:crypto.randomUUID(),key:'13|Baru|9',action:'Masuk',staffName:'Anna Ratna Ningsih',quantity:2,revision:0,date:'2026-01-01'};
  const post=headers=>fetch(origin+'/api/movement',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(move)});
  assert.equal((await post({origin:'https://evil.example'})).status,403);
  const saved=await post({origin});assert.equal(saved.status,200,await saved.clone().text());
  const state=await (await fetch(origin+'/api/state')).json();
  assert.equal(state.stock['13|Baru|9'].quantity,2);
 }finally{await new Promise(done=>server.close(done));}
});

test('the stock snapshot is gzip-compressed for browsers that accept it',async()=>{
 const publicRoot=join(dir,'gz-public'),apiFile=join(dir,'api-gz.mjs');
 mkdirSync(publicRoot);writeFileSync(join(publicRoot,'index.html'),'<html></html>');
 await build({entryPoints:['server/api.ts'],outfile:apiFile,bundle:true,format:'esm',platform:'node',logLevel:'silent'});
 const server=await startServer({port:0,host:'127.0.0.1',databasePath:join(dir,'gz.sqlite'),apiFile,publicRoot});
 const origin=`http://127.0.0.1:${server.address().port}`;
 try{
  // fetch() hides the Content-Encoding header after decoding, so ask over plain http to see what the server really sends.
  const raw=encoding=>new Promise((resolve,reject)=>httpGet(origin+'/api/state',{headers:{'accept-encoding':encoding}},res=>{const parts=[];res.on('data',c=>parts.push(c));res.on('end',()=>resolve({headers:res.headers,body:Buffer.concat(parts)}));}).on('error',reject));
  const zipped=await raw('gzip'),plain=await raw('identity');
  assert.equal(zipped.headers['content-encoding'],'gzip');assert.equal(zipped.headers.vary,'Accept-Encoding');
  assert.equal(plain.headers['content-encoding'],undefined);
  assert.ok(zipped.body.length<plain.body.length/4,'the snapshot should shrink a lot');
  assert.deepEqual(JSON.parse(gunzipSync(zipped.body).toString()),JSON.parse(plain.body.toString()),'both encodings must carry the same snapshot');
 }finally{await new Promise(done=>server.close(done));}
});

test('SERAGAM_PASSWORD shows a password-only sign-in page and locks the app and API',async()=>{
 const publicRoot=join(dir,'locked'),apiFile=join(dir,'api-locked.mjs');
 mkdirSync(join(publicRoot,'assets'),{recursive:true});writeFileSync(join(publicRoot,'index.html'),'<html>seragam</html>');writeFileSync(join(publicRoot,'assets','app.js'),'1');
 await build({entryPoints:['server/api.ts'],outfile:apiFile,bundle:true,format:'esm',platform:'node',logLevel:'silent'});
 const server=await startServer({port:0,host:'127.0.0.1',databasePath:join(dir,'locked.sqlite'),apiFile,publicRoot,password:'rahasia'});
 const origin=`http://127.0.0.1:${server.address().port}`,form=password=>fetch(origin+'/login',{method:'POST',redirect:'manual',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password})});
 try{
  const page=await fetch(origin+'/');assert.equal(page.status,200);const html=await page.text();
  assert.match(html,/type="password"/);assert.doesNotMatch(html,/username|seragam<\/html>/i,'only a password field, not the app');
  assert.equal(page.headers.get('www-authenticate'),null,'no browser username/password prompt');
  assert.equal((await fetch(origin+'/api/state')).status,401);
  assert.equal((await fetch(origin+'/assets/app.js')).status,200,'hashed browser files carry no data');
  const wrong=await form('salah');assert.equal(wrong.status,401);assert.match(await wrong.text(),/Password salah/);assert.equal(wrong.headers.get('set-cookie'),null);
  const right=await form('rahasia');assert.equal(right.status,303);const cookies=right.headers.getSetCookie();
  assert.ok(cookies.some(c=>/^seragam_session=[0-9a-f]{64};.*HttpOnly/.test(c)));
  const cookie=cookies.map(c=>c.split(';')[0]).join('; ');
  assert.equal(await (await fetch(origin+'/',{headers:{cookie}})).text(),'<html>seragam</html>');
  assert.equal((await fetch(origin+'/api/state',{headers:{cookie}})).status,200);
  assert.equal((await fetch(origin+'/api/state',{headers:{cookie:'seragam_session='+'0'.repeat(64)}})).status,401,'a forged cookie is refused');
  const out=await fetch(origin+'/logout',{redirect:'manual',headers:{cookie}});assert.equal(out.status,303);assert.ok(out.headers.getSetCookie().some(c=>/^seragam_session=;.*Max-Age=0/.test(c)));
 }finally{await new Promise(done=>server.close(done));}
});
