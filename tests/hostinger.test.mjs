import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
async function fixture(){
 const dir=mkdtempSync(join(tmpdir(),'seragam-hostinger-'));
 const original=process.env.SERAGAM_DATABASE_PATH;process.env.SERAGAM_DATABASE_PATH=join(dir,'inventory.sqlite');
 const module=await import(`../hosting/node/database.mjs?test=${crypto.randomUUID()}`);
 if(original===undefined)delete process.env.SERAGAM_DATABASE_PATH;else process.env.SERAGAM_DATABASE_PATH=original;
 return {module,dir};
}
test('Hostinger SQLite batches roll back all stock changes on a failed constraint',async()=>{
 const {module,dir}=await fixture(),{sqlite,DB}=module.openDatabase();
 try{
  await DB.batch([DB.prepare('INSERT INTO stock (key,quantity) VALUES (?,?)').bind('0|Baru|1',5),DB.prepare('INSERT INTO stock (key,quantity) VALUES (?,?)').bind('1|Baru|1',2)]);
  await assert.rejects(DB.batch([DB.prepare('UPDATE stock SET quantity=? WHERE key=?').bind(3,'0|Baru|1'),DB.prepare('UPDATE stock SET quantity=? WHERE key=?').bind(-1,'1|Baru|1')]),/invalid stock quantity/);
  assert.equal((await DB.prepare('SELECT quantity FROM stock WHERE key=?').bind('0|Baru|1').first()).quantity,5);
  const snapshot=await DB.batch([DB.prepare('SELECT * FROM stock'),DB.prepare('SELECT * FROM history')]);assert.equal(snapshot[0].results.length,2);assert.equal(snapshot[1].results.length,0);
 }finally{sqlite.close();rmSync(dir,{recursive:true,force:true});}
});
test('Hostinger inventory, selected Staff and backups persist after closing and reopening',async()=>{
 const {module,dir}=await fixture();let current=module.openDatabase();
 try{
  current.sqlite.prepare('INSERT INTO stock (key,quantity,revision) VALUES (?,?,?)').run('0|Lama|1-2',9,4);
  current.sqlite.prepare('INSERT INTO settings (id,low_limit,revision) VALUES (1,7,4)').run();
  current.sqlite.prepare('INSERT INTO history (id,key,action,actor_id,actor,occurred_at,date,staff_name) VALUES (?,?,?,?,?,?,?,?)').run('migration-history','0|Lama|1-2','Masuk','shared-visitor','Pengunjung tanpa akun','2026-01-01T00:00:00Z','2026-01-01','Rahmawati');
  current.sqlite.prepare('INSERT INTO backups (id,created_at,actor,data) VALUES (?,?,?,?)').run('old-backup','2026-01-01','Original actor',JSON.stringify({stock:{'0|Lama|1-2':8}}));
  current.sqlite.close();current=module.openDatabase();
  assert.equal((await current.DB.prepare('SELECT quantity FROM stock').first()).quantity,9);
  assert.equal((await current.DB.prepare('SELECT staff_name FROM history').first()).staff_name,'Rahmawati');
  assert.equal((await current.DB.prepare('SELECT low_limit FROM settings').first()).low_limit,7);
  assert.deepEqual(JSON.parse((await current.DB.prepare('SELECT data FROM backups').first()).data),{stock:{'0|Lama|1-2':8}});
  assert.throws(()=>current.sqlite.prepare('DELETE FROM history').run(),/immutable/);
 }finally{current.sqlite.close();rmSync(dir,{recursive:true,force:true});}
});
