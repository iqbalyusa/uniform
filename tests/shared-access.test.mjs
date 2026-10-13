import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {build} from 'esbuild';

let serial=0;
async function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')&&!f.includes('workbook_stock_import')).sort())sqlite.exec(readFileSync(`drizzle/${file}`,'utf8'));
 sqlite.exec("INSERT INTO members (id,email,name,role,active,user_id) VALUES ('rahma','rahma@pribadidepok.sch.id','Rahma','admin',1,'existing-rahma'),('afro','afro@pribadidepok.sch.id','Afro','admin',1,NULL); INSERT INTO stock (key,quantity,revision) VALUES ('13|Baru|9',10,0);");
 class Statement{constructor(sql,values=[]){this.sql=sql;this.values=values;}bind(...values){return new Statement(this.sql,values);}execute(){const s=sqlite.prepare(this.sql);if(s.columns().length)return {results:s.all(...this.values),meta:{changes:0}};return {results:[],meta:{changes:Number(s.run(...this.values).changes)}};}async first(){return this.execute().results[0]??null;}async all(){return this.execute();}async run(){return this.execute();}}
 const id=`shared-${++serial}`;globalThis.sharedFixtures??={};globalThis.sharedFixtures[id]={DB:{prepare:sql=>new Statement(sql),async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>s.execute());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
 const result=await build({entryPoints:['app/api/[...path]/route.ts'],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'shared-test-bindings',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'shared-test'}));b.onResolve({filter:/\/identity$/},()=>({path:'identity',namespace:'shared-test'}));b.onLoad({filter:/.*/,namespace:'shared-test'},({path})=>({contents:path==='env'?`export const env=globalThis.sharedFixtures[${JSON.stringify(id)}];`:'export async function getChatGPTUser(){throw Error("Shared mode must not require account identity");}'}));}}]});
 const route=await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
 const get=(path,headers={})=>route.GET(new Request(`https://example.com/api/${path}`,{headers}));
 const post=(path,data,origin='https://example.com')=>route.POST(new Request(`https://example.com/api/${path}`,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)}));
 return {sqlite,get,post};
}
const move=(data={})=>({id:crypto.randomUUID(),key:'13|Baru|9',action:'Masuk',staffName:'Iin Rosita',quantity:2,revision:0,date:'2026-01-01',...data});

test('anonymous state is editable, officer records stay private and recoverable',async()=>{
 const {sqlite,get,post}=await fixture();const before=sqlite.prepare('SELECT * FROM members ORDER BY id').all();
 const response=await get('state',{'oai-authenticated-user-email':'unknown@example.com'});assert.equal(response.status,200);
 const state=await response.json();assert.equal(state.accessMode,'shared');assert.equal(state.member.role,'shared');assert.equal(state.member.name,'Pengunjung tanpa akun');assert.deepEqual(state.members,[]);
 assert.equal((await post('members',{email:'new@example.com',name:'New',role:'admin'})).status,404);
 assert.deepEqual(sqlite.prepare('SELECT * FROM members ORDER BY id').all(),before);sqlite.close();
});
test('anonymous receipts, issues and adjustments retain validation and honest audit attribution',async()=>{
 const {sqlite,get,post}=await fixture();
 assert.equal((await post('movement',move())).status,200);
 assert.equal((await post('movement',move({action:'Keluar',revision:1,quantity:13,studentName:'Test',studentClass:'7A'}))).status,409);
 assert.equal((await post('movement',move({action:'Keluar',revision:1,quantity:1}))).status,400);
 assert.equal((await post('movement',move({action:'Penyesuaian',revision:1,quantity:9}))).status,400);
 assert.equal((await post('movement',move({action:'Penyesuaian',revision:1,quantity:9,note:'Physical count'}))).status,200);
 const request=move({action:'Keluar',revision:2,quantity:2,studentName:'Test',studentClass:'7A'});
 assert.equal((await post('movement',request)).status,200);assert.equal((await post('movement',request)).status,200);
 assert.equal(sqlite.prepare('SELECT quantity FROM stock WHERE key=?').get(request.key).quantity,7);
 const history=await (await get('history')).json();assert.equal(history.length,3);assert.ok(history.every(h=>h.actor==='Pengunjung tanpa akun'&&h.actor_id==='shared-visitor'));
 assert.equal((await post('movement',move({key:'13|Lama|9-10'}))).status,400);
 assert.equal((await post('movement',move({quantity:0.5,revision:3}))).status,400);sqlite.close();
});
test('anonymous import, backup and settings work; stale imports and cross-origin writes fail',async()=>{
 const {sqlite,get,post}=await fixture();const state=await (await get('state')).json();
 const request={id:crypto.randomUUID(),rows:[{key:'0|Lama|1-2',quantity:8}],mode:'set',revision:state.revision,filename:'test.csv'};
 const response=await post('import',request);assert.equal(response.status,200);const imported=await response.json();
 const before=await (await get(`backup/${imported.backupId}`)).json();assert.equal(before.stock['13|Baru|9'],10);assert.equal(before.stock['0|Lama|1-2'],0);
 const after=await (await get('backup')).json();assert.equal(after.stock['0|Lama|1-2'],8);assert.equal(after.stock['13|Baru|9'],10);
 assert.equal((await post('import',{...request,id:crypto.randomUUID()})).status,409);
 assert.equal((await post('settings',{lowLimit:7})).status,200);assert.equal((await (await get('state')).json()).lowLimit,7);
 assert.equal((await post('settings',{lowLimit:2},'https://evil.example')).status,403);
 assert.equal((await post('settings',{lowLimit:-1})).status,400);
 assert.equal(sqlite.prepare("SELECT actor FROM backups WHERE id=?").get(imported.backupId).actor,'Pengunjung tanpa akun');sqlite.close();
});
test('simultaneous anonymous issues keep one winning revision and cannot overdraw',async()=>{
 const {sqlite,post}=await fixture();const results=await Promise.all([post('movement',move({action:'Keluar',quantity:7,studentName:'A',studentClass:'7A'})),post('movement',move({action:'Keluar',quantity:7,studentName:'B',studentClass:'7B'}))]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(sqlite.prepare("SELECT quantity FROM stock WHERE key='13|Baru|9'").get().quantity,3);
 assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM history').get().n,1);sqlite.close();
});
