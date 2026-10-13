import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,mkdtempSync,writeFileSync,readFileSync,symlinkSync,realpathSync,existsSync,lstatSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,relative} from 'node:path';
import {relocateApp} from '../hosting/node/relocate.mjs';

function fixture(){
 const accountHome=mkdtempSync(join(tmpdir(),'seragam-relocation-')),source=join(accountHome,'repositories/seragam-app'),databasePath=join(accountHome,'seragam-data/inventory.sqlite');
 mkdirSync(join(accountHome,'public_html'));mkdirSync(join(source,'hostinger-dist/public'),{recursive:true});mkdirSync(join(accountHome,'seragam-data'));
 writeFileSync(join(source,'.htaccess'),readFileSync('.htaccess'));writeFileSync(join(source,'app.cjs'),'// school app');writeFileSync(join(source,'hostinger-dist/public/index.html'),'<html>school app</html>');
 symlinkSync(source,join(accountHome,'seragam-app'),'dir');
 const sqlite=new DatabaseSync(databasePath);sqlite.exec('PRAGMA journal_mode=WAL; CREATE TABLE stock (key TEXT PRIMARY KEY,quantity INTEGER); INSERT INTO stock VALUES (\'stock\',1491)');
 return {accountHome,source,databasePath,sqlite,close(){sqlite.close();rmSync(accountHome,{recursive:true,force:true});}};
}

test('relocation moves the real checkout into public_html and preserves both cPanel paths and live WAL data',()=>{
 const f=fixture();try{
  assert.ok(existsSync(f.databasePath+'-wal'));
  const result=relocateApp(f),target=join(f.accountHome,'public_html/seragam-app');
  assert.equal(result.target,target);assert.ok(lstatSync(target).isDirectory());
  assert.equal(realpathSync(f.source),target);assert.equal(realpathSync(join(f.accountHome,'seragam-app')),target);
  assert.match(readFileSync(join(target,'.htaccess'),'utf8'),/^Require all denied$/m);
  assert.ok(existsSync(join(target,'tmp/restart.txt')));
  assert.equal(f.sqlite.prepare('SELECT quantity FROM stock').get().quantity,1491);
  const backup=new DatabaseSync(join(result.backupDir,'inventory.sqlite'),{readOnly:true});
  try{assert.equal(backup.prepare('SELECT quantity FROM stock').get().quantity,1491);}finally{backup.close();}
  assert.ok(existsSync(join(result.backupDir,'app-source.tar.gz')));
  assert.equal(relocateApp(f).alreadyMoved,true);
 }finally{f.close();}
});

test('an occupied destination is left intact and does not change the running checkout',()=>{
 const f=fixture();try{
  const target=join(f.accountHome,'public_html/seragam-app');mkdirSync(target);writeFileSync(join(target,'keep.txt'),'existing files');
  assert.throws(()=>relocateApp(f),/Destination already exists/);
  assert.ok(lstatSync(f.source).isDirectory());assert.equal(readFileSync(join(target,'keep.txt'),'utf8'),'existing files');
  assert.equal(f.sqlite.prepare('SELECT quantity FROM stock').get().quantity,1491);
 }finally{f.close();}
});

test('relocation refuses missing HTTP protection and a database inside public_html',()=>{
 const f=fixture();try{
  writeFileSync(join(f.source,'.htaccess'),'Options -Indexes');
  assert.throws(()=>relocateApp(f),/HTTP protection is missing/);
  writeFileSync(join(f.source,'.htaccess'),readFileSync('.htaccess'));
  const publicDatabase=join(f.accountHome,'public_html/private.sqlite');writeFileSync(publicDatabase,'not allowed');
  assert.throws(()=>relocateApp({...f,databasePath:publicDatabase}),/database must remain outside/);
  assert.ok(lstatSync(f.source).isDirectory());
 }finally{f.close();}
});

test('relative node_modules links continue resolving to the existing CloudLinux environment after relocation',()=>{
 const f=fixture();try{
  const modules=join(f.accountHome,'nodevenv/repositories/seragam-app/22/lib/node_modules');mkdirSync(modules,{recursive:true});
  symlinkSync(relative(f.source,modules),join(f.source,'node_modules'),'dir');
  const result=relocateApp(f);assert.equal(realpathSync(join(result.target,'node_modules')),modules);
 }finally{f.close();}
});

test('a failure after the move restores the source and both original paths',()=>{
 const f=fixture();try{
  writeFileSync(join(f.source,'tmp'),'pre-existing file that prevents restart directory creation');
  assert.throws(()=>relocateApp(f),/original folders restored/);
  assert.ok(lstatSync(f.source).isDirectory());assert.equal(realpathSync(join(f.accountHome,'seragam-app')),f.source);
  assert.equal(existsSync(join(f.accountHome,'public_html/seragam-app')),false);
  assert.equal(f.sqlite.prepare('SELECT quantity FROM stock').get().quantity,1491);
 }finally{f.close();}
});
