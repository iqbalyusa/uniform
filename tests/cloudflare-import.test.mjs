import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {importArchive} from '../server/import.mjs';
import {exportCloudflare} from '../server/cloudflare-export.mjs';
const keys=['0|Baru|1','1|Lama|1-2'];
const history={id:'original-history',key:keys[0],action:'Masuk',actor_id:'shared-visitor',actor:'Pengunjung tanpa akun',occurred_at:'2026-01-01T00:00:00Z',date:'2026-01-01',before_qty:0,after_qty:5,delta:5,staff_name:'Iin Rosita',source:'app'};
const archive=()=>({snapshot:{schemaVersion:2,stock:{[keys[0]]:5,[keys[1]]:3},history:[history],lowLimit:7,revision:2},stockRevisions:{[keys[0]]:4,[keys[1]]:1},backups:[{id:'saved-backup',created_at:'2026-01-01',actor:'Original actor',data:{schemaVersion:2,stock:{[keys[0]]:1}}}]});
function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
 return sqlite;
}

test('one-time import accepts unused zero balances and preserves history, Staff, revisions, settings and backups',()=>{
 const sqlite=fixture();
 try{
  for(const key of keys)sqlite.prepare('INSERT INTO stock (key,quantity,revision) VALUES (?,0,0)').run(key);
  const source=archive();assert.deepEqual(importArchive(sqlite,source,keys),{balances:2,pieces:8,history:1,backups:1});
  assert.deepEqual(sqlite.prepare('SELECT quantity,revision FROM stock WHERE key=?').get(keys[0]),Object.assign(Object.create(null),{quantity:5,revision:4}));
  const row=sqlite.prepare('SELECT * FROM history').get();assert.equal(row.actor,history.actor);assert.equal(row.staff_name,history.staff_name);assert.equal(row.id,history.id);
  const settings=sqlite.prepare('SELECT low_limit,revision FROM settings').get();assert.equal(settings.low_limit,7);assert.equal(settings.revision,2);
  assert.deepEqual(JSON.parse(sqlite.prepare('SELECT data FROM backups').get().data),source.backups[0].data);
  assert.throws(()=>importArchive(sqlite,source,keys),/protect existing records/);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM history').get().n,1);
 }finally{sqlite.close();}
});

test('import refuses quantities, revised zero balances and changed settings without altering them',()=>{
 for(const setup of ["INSERT INTO stock(key,quantity) VALUES ('0|Baru|1',1)","INSERT INTO stock(key,quantity,revision) VALUES ('0|Baru|1',0,1)","INSERT INTO settings(id,low_limit,revision) VALUES(1,7,1)"]){
  const sqlite=fixture();try{
   sqlite.exec(setup);const before=sqlite.prepare('SELECT * FROM stock').all();
   assert.throws(()=>importArchive(sqlite,archive(),keys),/protect existing records/);
   assert.deepEqual(sqlite.prepare('SELECT * FROM stock').all(),before);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM history').get().n,0);
  }finally{sqlite.close();}
 }
});

test('bad history rolls back imported stock and all earlier history rows',()=>{
 const sqlite=fixture();try{
  sqlite.prepare('INSERT INTO stock (key,quantity) VALUES (?,0)').run(keys[0]);
  const source=archive();source.snapshot.history.push({...history});
  assert.throws(()=>importArchive(sqlite,source,keys),/UNIQUE/);
  assert.equal(sqlite.prepare('SELECT quantity FROM stock').get().quantity,0);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM history').get().n,0);assert.equal(sqlite.prepare('SELECT count(*) AS n FROM backups').get().n,0);
 }finally{sqlite.close();}
});

test('one-time Cloudflare export downloads complete history and saved backups without any writes',async()=>{
 const source=archive(),calls=[];
 const state={revision:2,stock:Object.fromEntries(keys.map(k=>[k,{quantity:source.snapshot.stock[k],revision:source.stockRevisions[k]}])),backups:source.backups.map(({data,...row})=>row)};
 const result=await exportCloudflare(async(url,options)=>{
  calls.push({url,options});const path=new URL(url).pathname;
  return Response.json(path==='/api/state'?state:path==='/api/backup'?source.snapshot:source.backups[0].data);
 });
 assert.deepEqual(result.snapshot,source.snapshot);assert.deepEqual(result.stockRevisions,source.stockRevisions);assert.deepEqual(result.backups,source.backups);
 assert.equal(calls.length,4);assert.ok(calls.every(c=>!c.options.method||c.options.method==='GET'));
});

test('export rejects changes during transfer and source errors',async()=>{
 const source=archive();let states=0;
 await assert.rejects(exportCloudflare(async url=>Response.json(new URL(url).pathname==='/api/backup'?source.snapshot:{revision:++states,stock:Object.fromEntries(keys.map(k=>[k,{quantity:source.snapshot.stock[k],revision:0}])),backups:[]})),/changed during export/);
 await assert.rejects(exportCloudflare(async()=>Response.json({error:'offline'},{status:503})),/export failed/);
});
