import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { build } from 'esbuild';

// Execute the actual service SQL against SQLite; D1's batch transaction semantics are reproduced here.
const result=await build({entryPoints:['lib/server.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'test-bindings',setup(b){b.onResolve({filter:/\/database$/},()=>({path:'env',namespace:'test'}));b.onResolve({filter:/\/identity$/},()=>({path:'auth',namespace:'test'}));b.onResolve({filter:/\/access$/},()=>({path:'access',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},({path})=>({contents:path==='env'?'export function getDatabase(){return globalThis.testEnv.DB;}':path==='access'?'export const accountsEnabled=true;':'export async function getChatGPTUser(){return globalThis.testUser;}'}));}}]});
const sqlite=new DatabaseSync(':memory:');
// Service tests start with an empty ledger; the authorized workbook migration has its own tests.
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')&&!f.includes('workbook_stock_import')).sort())sqlite.exec(readFileSync(`drizzle/${file}`,'utf8'));
class Statement{constructor(sql,values=[]){this.sql=sql;this.values=values;}bind(...values){return new Statement(this.sql,values);}execute(){const s=sqlite.prepare(this.sql);const rows=s.columns().length?s.all(...this.values):[];const meta=s.columns().length?{changes:0}:s.run(...this.values);return {results:rows,meta:{changes:Number(meta.changes??0)}};}async first(){return this.execute().results[0]??null;}async all(){return this.execute();}async run(){return this.execute();}}
globalThis.testEnv={DB:{prepare:sql=>new Statement(sql),async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const rows=statements.map(s=>s.execute());sqlite.exec('COMMIT');return rows;}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
const service=await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
globalThis.testUser={userId:'rahma-id',email:'rahma@pribadidepok.sch.id',displayName:'Rahma'};
const admin=await service.actor();
const key='13|Baru|9';
const move=(overrides={})=>({id:crypto.randomUUID(),key,action:'Masuk',staffName:'Iin Rosita',quantity:10,revision:0,date:'2026-01-01',...overrides});
test('authenticated listed accounts bind stable identity; others are denied',async()=>{assert.equal(admin.role,'admin');globalThis.testUser={userId:'unknown',email:'unknown@example.com'};await assert.rejects(service.actor(),/belum diberi akses/);globalThis.testUser=null;await assert.rejects(service.actor(),/Silakan masuk/);globalThis.testUser={userId:'rahma-id',email:'rahma@pribadidepok.sch.id'};});
test('receipts, required recipients, and negative balance protection',async()=>{await service.movement(admin,move());assert.equal(sqlite.prepare('SELECT quantity FROM stock WHERE key=?').get(key).quantity,10);await assert.rejects(service.movement(admin,move({action:'Masuk',key:'13|Lama|9-10'})),/ukuran Baru/);await assert.rejects(service.movement(admin,move({action:'Keluar',quantity:1,revision:1})),/Nama siswa/);await assert.rejects(service.movement(admin,move({action:'Keluar',quantity:11,revision:1,studentName:'Test siswa',studentClass:'7A'})),/tidak cukup/);assert.throws(()=>sqlite.prepare('UPDATE stock SET quantity=-1 WHERE key=?').run(key),/invalid stock quantity/);});
test('concurrent issues cannot overdraw and write exactly one audit entry',async()=>{const records=await Promise.allSettled([service.movement(admin,move({action:'Keluar',quantity:7,revision:1,studentName:'Siswa A',studentClass:'7A'})),service.movement(admin,move({action:'Keluar',quantity:7,revision:1,studentName:'Siswa B',studentClass:'7B'}))]);assert.equal(records.filter(r=>r.status==='fulfilled').length,1);assert.equal(sqlite.prepare('SELECT quantity FROM stock WHERE key=?').get(key).quantity,3);assert.equal(sqlite.prepare("SELECT count(*) AS n FROM history WHERE action='Keluar'").get().n,1);});
test('request retries are idempotent and adjustments require reasons',async()=>{const request=move({quantity:2,revision:2});await service.movement(admin,request);await service.movement(admin,request);assert.equal(sqlite.prepare('SELECT quantity FROM stock WHERE key=?').get(key).quantity,5);await assert.rejects(service.movement(admin,move({action:'Penyesuaian',quantity:4,revision:3})),/Alasan/);});
test('staff cannot administer users, settings imports or adjustments',async()=>{const staff={...admin,id:'staff',role:'staff'};await assert.rejects(service.changeMember(staff,{email:'a@example.com',name:'A',role:'staff'}),/administrator/);await assert.rejects(service.importStock(staff,{id:'x',rows:[]}),/administrator/);await assert.rejects(service.movement(staff,move({action:'Penyesuaian',quantity:0,revision:3,note:'Count'})),/administrator/);});
test('imports validate every row, preserve absent keys and back up before applying',async()=>{let state=await service.snapshot(admin);const before=JSON.stringify(state.stock);await assert.rejects(service.importStock(admin,{id:'invalid',rows:[{key,quantity:-1}],mode:'set',revision:state.revision}),/bilangan/);assert.equal(JSON.stringify((await service.snapshot(admin)).stock),before);await assert.rejects(service.importStock(admin,{id:'duplicate',rows:[{key,quantity:1},{key,quantity:2}],mode:'set',revision:state.revision}),/duplikat/);const result=await service.importStock(admin,{id:'import1',rows:[{key:'0|Lama|1-2',quantity:8}],mode:'set',revision:state.revision,filename:'test.csv',legacyHistory:[{user:'Original',date:'1/1/2025'}]});const after=await service.snapshot(admin);assert.equal(after.stock[key].quantity,5);assert.equal(after.stock['0|Lama|1-2'].quantity,8);assert.equal(JSON.parse(sqlite.prepare('SELECT data FROM backups WHERE id=?').get(result.backupId).data).stock[key],5);assert.equal(after.backups.length,2);await assert.rejects(service.importStock(admin,{id:'stale',rows:[{key,quantity:999}],mode:'set',revision:state.revision}),/Data berubah/);});
test('full catalog import remains bounded and old/new ledgers stay separate',async()=>{const state=await service.snapshot(admin);const rows=Object.keys(state.stock).map(key=>({key,quantity:key.includes('|Lama|')?2:3}));assert.equal(rows.length,672);await service.importStock(admin,{id:'full',rows,mode:'set',revision:state.revision});const after=await service.snapshot(admin);assert.equal(after.stock['13|Lama|9-10'].quantity,2);assert.equal(after.stock['13|Lama|0'].quantity,2);assert.equal(after.stock['13|Baru|0'].quantity,3);assert.equal(after.stock[key].quantity,3);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM stock').get().n,672);});
test('audit cannot be altered and last administrator remains active',async()=>{assert.throws(()=>sqlite.prepare("DELETE FROM history WHERE id='import1'").run(),/immutable/);sqlite.prepare("UPDATE members SET active=0 WHERE email='afro@pribadidepok.sch.id'").run();assert.throws(()=>sqlite.prepare("UPDATE members SET active=0 WHERE email='rahma@pribadidepok.sch.id'").run(),/last active/);});
test('same-origin check rejects CSRF and accepts the app origin',()=>{assert.throws(()=>service.sameOrigin(new Request('https://example.com/api/movement',{headers:{origin:'https://evil.example'}})),/aplikasi/);service.sameOrigin(new Request('https://example.com/api/movement',{headers:{origin:'https://example.com'}}));});
test('history returns records with blank date filters and respects a supplied range',async()=>{
 const bundled=await build({entryPoints:['app/api/[...path]/route.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'route-test-bindings',setup(b){b.onResolve({filter:/\/database$/},()=>({path:'env',namespace:'test'}));b.onResolve({filter:/\/identity$/},()=>({path:'auth',namespace:'test'}));b.onResolve({filter:/\/access$/},()=>({path:'access',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},({path})=>({contents:path==='env'?'export function getDatabase(){return globalThis.testEnv.DB;}':path==='access'?'export const accountsEnabled=true;':'export async function getChatGPTUser(){return globalThis.testUser;}'}));}}]});
 const route=await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
 const all=await (await route.GET(new Request('https://example.com/api/history?from=&to='))).json();
 assert.ok(all.length>0);assert.ok(all.some(row=>row.date==='2026-01-01'));
 const future=await (await route.GET(new Request('https://example.com/api/history?from=2099-01-01&to=2099-12-31'))).json();assert.equal(future.length,0);
});

test('one student purchase updates multiple uniforms once and records each item',async()=>{
 const state=await service.snapshot(admin),keys=['0|Baru|1','1|Baru|2'];
 const request={id:crypto.randomUUID(),action:'Keluar',staffName:'Rahmawati',studentName:'Siswa pembelian',studentClass:'7A',date:'2026-01-01',note:'Dua seragam',items:keys.map(key=>({key,quantity:1,revision:state.stock[key].revision}))};
 await service.movement(admin,request);await service.movement(admin,request);
 const after=await service.snapshot(admin);
 for(const key of keys)assert.equal(after.stock[key].quantity,state.stock[key].quantity-1);
 const history=after.history.filter(h=>h.id===request.id||h.id.startsWith(request.id+':'));
 assert.equal(history.length,2);assert.ok(history.every(h=>h.student_name===request.studentName&&h.student_class==='7A'&&h.delta===-1&&h.staff_name==='Rahmawati'));
 assert.equal(after.revision,state.revision+1);
});

test('an unavailable later purchase item leaves all quantities and history unchanged',async()=>{
 const state=await service.snapshot(admin),keys=['2|Baru|1','3|Baru|1'];
 const request={id:crypto.randomUUID(),action:'Keluar',staffName:'Rahmawati',studentName:'Siswa',studentClass:'7A',items:keys.map((key,i)=>({key,quantity:i?state.stock[key].quantity+1:1,revision:state.stock[key].revision}))};
 await assert.rejects(service.movement(admin,request),/tidak cukup/);
 const after=await service.snapshot(admin);assert.deepEqual(after.stock,state.stock);assert.deepEqual(after.history,state.history);assert.equal(after.revision,state.revision);
});

test('purchase rejects missing student details, duplicate sizes and invalid quantities',async()=>{
 const state=await service.snapshot(admin),key='4|Baru|1',line={key,quantity:1,revision:state.stock[key].revision};
 const request={id:crypto.randomUUID(),action:'Keluar',staffName:'Rahmawati',studentName:'Siswa',studentClass:'7A',items:[line]};
 await assert.rejects(service.movement(admin,{...request,studentName:''}),/Nama siswa/);
 await assert.rejects(service.movement(admin,{...request,studentClass:''}),/Kelas/);
 await assert.rejects(service.movement(admin,{...request,items:[line,line]}),/Gabungkan/);
 await assert.rejects(service.movement(admin,{...request,items:[{...line,quantity:0}]}),/lebih dari 0/);
 await assert.rejects(service.movement(admin,{...request,items:[{...line,quantity:1.5}]}),/bilangan/);
 await assert.rejects(service.movement(admin,{...request,items:Array(11).fill(line)}),/1–10/);
});

test('a concurrent stock revision on the second item rolls back the first item and its audit',async()=>{
 const state=await service.snapshot(admin),keys=['5|Baru|1','6|Baru|1'];
 const request={id:crypto.randomUUID(),action:'Keluar',staffName:'Rahmawati',studentName:'Siswa',studentClass:'7A',items:keys.map(key=>({key,quantity:1,revision:state.stock[key].revision}))};
 const db=globalThis.testEnv.DB,originalBatch=db.batch;
 db.batch=async statements=>{sqlite.prepare('UPDATE stock SET revision=revision+1 WHERE key=?').run(keys[1]);return originalBatch(statements);};
 try{await assert.rejects(service.movement(admin,request),/Stok berubah/);}finally{db.batch=originalBatch;}
 const after=await service.snapshot(admin);
 for(const key of keys)assert.equal(after.stock[key].quantity,state.stock[key].quantity);
 assert.equal(after.stock[keys[0]].revision,state.stock[keys[0]].revision);
 assert.equal(after.revision,state.revision);assert.ok(!after.history.some(h=>h.id===request.id||h.id.startsWith(request.id+':')));
});

test('concurrent multi-item purchases cannot partially save or overdraw stock',async()=>{
 const state=await service.snapshot(admin),keys=['7|Baru|1','8|Baru|1'];
 const request={action:'Keluar',staffName:'Rahmawati',studentName:'Siswa',studentClass:'7A',items:keys.map(key=>({key,quantity:2,revision:state.stock[key].revision}))};
 const results=await Promise.allSettled([service.movement(admin,{...request,id:crypto.randomUUID()}),service.movement(admin,{...request,id:crypto.randomUUID()})]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 const after=await service.snapshot(admin);for(const key of keys)assert.equal(after.stock[key].quantity,state.stock[key].quantity-2);
 assert.equal(after.history.length,state.history.length+2);assert.equal(after.revision,state.revision+1);
});

test('receipts record the selected staff separately from the authenticated actor',async()=>{
 for(const staffName of ['Iin Rosita','Afro Mutmainah','Rahmawati']){
  const state=await service.snapshot(admin),key='10|Baru|2';
  const request=move({key,quantity:1,revision:state.stock[key].revision,staffName});await service.movement(admin,request);
  const row=sqlite.prepare('SELECT * FROM history WHERE id=?').get(request.id);
  assert.equal(row.staff_name,staffName);assert.equal(row.actor_id,admin.id);assert.equal(row.actor,admin.name);
  const backup=await service.fullBackup(admin);assert.equal(backup.history.find(h=>h.id===request.id).staff_name,staffName);
 }
});

test('missing and unlisted staff cannot change stock in receipts or student purchases',async()=>{
 const before=await service.snapshot(admin),key='11|Baru|2';
 for(const staffName of [undefined,'','Unknown staff']){
  await assert.rejects(service.movement(admin,move({key,quantity:1,revision:before.stock[key].revision,staffName})),/Staff/);
  await assert.rejects(service.movement(admin,{id:crypto.randomUUID(),action:'Keluar',studentName:'Siswa',studentClass:'7A',staffName,items:[{key,quantity:1,revision:before.stock[key].revision}]}),/Staff/);
 }
 const after=await service.snapshot(admin);assert.deepEqual(after.stock,before.stock);assert.deepEqual(after.history,before.history);
});

test('staff migration preserves historical attribution and quantities',()=>{
 const legacy=new DatabaseSync(':memory:');
 for(const file of ['0000_pretty_johnny_storm.sql','0001_ledger_guards.sql'])legacy.exec(readFileSync(`drizzle/${file}`,'utf8'));
 legacy.exec("INSERT INTO history (id,action,actor_id,actor,occurred_at,date) VALUES ('legacy','Masuk','original','Original actor','2026-01-01','2026-01-01'); INSERT INTO stock (key,quantity) VALUES ('0|Baru|1',9);");
 legacy.exec(readFileSync('drizzle/0002_movement_staff.sql','utf8'));
 const row=legacy.prepare("SELECT * FROM history WHERE id='legacy'").get();assert.equal(row.actor,'Original actor');assert.equal(row.staff_name,'');assert.equal(legacy.prepare('SELECT quantity FROM stock').get().quantity,9);legacy.close();
});
