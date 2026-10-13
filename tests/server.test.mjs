import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from 'esbuild';
import {openDatabase} from '../server/database.mjs';
import {startServer} from '../server/index.mjs';

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
  const move={id:crypto.randomUUID(),key:'13|Baru|9',action:'Masuk',staffName:'Anna Ratna',quantity:2,revision:0,date:'2026-01-01'};
  const post=headers=>fetch(origin+'/api/movement',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(move)});
  assert.equal((await post({origin:'https://evil.example'})).status,403);
  const saved=await post({origin});assert.equal(saved.status,200,await saved.clone().text());
  const state=await (await fetch(origin+'/api/state')).json();
  assert.equal(state.stock['13|Baru|9'].quantity,2);
 }finally{await new Promise(done=>server.close(done));}
});

test('SERAGAM_PASSWORD locks the page and API behind a login',async()=>{
 const publicRoot=join(dir,'locked'),apiFile=join(dir,'api-locked.mjs');
 mkdirSync(publicRoot);writeFileSync(join(publicRoot,'index.html'),'<html>seragam</html>');
 await build({entryPoints:['server/api.ts'],outfile:apiFile,bundle:true,format:'esm',platform:'node',logLevel:'silent'});
 const server=await startServer({port:0,host:'127.0.0.1',databasePath:join(dir,'locked.sqlite'),apiFile,publicRoot,user:'staff',password:'rahasia'});
 const origin=`http://127.0.0.1:${server.address().port}`,login=(user,password)=>({authorization:'Basic '+Buffer.from(`${user}:${password}`).toString('base64')});
 try{
  const anonymous=await fetch(origin+'/api/state');assert.equal(anonymous.status,401);assert.match(anonymous.headers.get('www-authenticate'),/^Basic /);
  assert.equal((await fetch(origin+'/',{headers:login('staff','salah')})).status,401);
  assert.equal((await fetch(origin+'/',{headers:login('staff','rahasia')})).status,200);
  assert.equal((await fetch(origin+'/api/state',{headers:login('staff','rahasia')})).status,200);
 }finally{await new Promise(done=>server.close(done));}
});
