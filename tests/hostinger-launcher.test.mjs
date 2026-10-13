import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,realpathSync,lstatSync,existsSync,symlinkSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {repairLauncher} from '../hosting/node/launcher.mjs';
import {requestRestart} from '../hosting/node/restart.mjs';

function fixture(){
 const accountHome=mkdtempSync(join(tmpdir(),'seragam-launcher-')),appRoot=join(accountHome,'public_html/seragam-app'),environmentRoot=join(accountHome,'nodevenv/repositories/seragam-app'),databasePath=join(accountHome,'seragam-data/inventory.sqlite');
 mkdirSync(join(appRoot,'hostinger-dist/public'),{recursive:true});mkdirSync(environmentRoot,{recursive:true});mkdirSync(join(accountHome,'seragam-data'));
 writeFileSync(join(appRoot,'.htaccess'),readFileSync('.htaccess'));writeFileSync(join(appRoot,'hostinger-dist/public/index.html'),'<html>school app</html>');
 const sqlite=new DatabaseSync(databasePath);sqlite.exec('CREATE TABLE stock (quantity INTEGER); INSERT INTO stock VALUES(1491)');sqlite.close();
 writeFileSync(join(appRoot,'app.cjs'),`const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync(${JSON.stringify(databasePath)},{readOnly:true});console.log(JSON.stringify({quantity:db.prepare('SELECT quantity FROM stock').get().quantity}));db.close();`);
 symlinkSync(appRoot,join(accountHome,'seragam-app'),'dir');
 return {accountHome,appRoot,environmentRoot,databasePath,close(){rmSync(accountHome,{recursive:true,force:true});}};
}

test('registered app root becomes a real launcher directory and starts the public app with the original SQLite data',()=>{
 const f=fixture();try{
  const original=readFileSync(join(f.appRoot,'app.cjs'),'utf8'),result=repairLauncher(f);
  assert.ok(lstatSync(result.launcher).isDirectory());assert.equal(realpathSync(result.launcher),result.launcher);
  assert.equal(readFileSync(join(f.appRoot,'app.cjs'),'utf8'),original);
  assert.equal(realpathSync(join(f.accountHome,'nodevenv/seragam-app')),f.environmentRoot);
  assert.ok(lstatSync(join(result.backupDir,'original-seragam-app-link')).isSymbolicLink());
  const output=execFileSync(process.execPath,[join(result.launcher,'app.cjs')],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
  assert.deepEqual(JSON.parse(output),{quantity:1491});
  assert.equal(repairLauncher(f).alreadyRepaired,true);
 }finally{f.close();}
});

test('launcher tmp stays inside its root and deploy requests restart for both application paths',()=>{
 const f=fixture();try{
  const result=repairLauncher(f);
  const tmp=join(result.launcher,'tmp');assert.ok(lstatSync(tmp).isDirectory());assert.equal(realpathSync(tmp),tmp);
  writeFileSync(join(f.appRoot,'tmp/restart.txt'),'old build');writeFileSync(join(tmp,'restart.txt'),'old build');
  assert.equal(requestRestart(f).length,2);
  assert.equal(readFileSync(join(f.appRoot,'tmp/restart.txt'),'utf8'),'');assert.equal(readFileSync(join(tmp,'restart.txt'),'utf8'),'');
 }finally{f.close();}
});

test('repair upgrades the previous tmp symlink without deleting its target contents',()=>{
 const f=fixture();try{
  const result=repairLauncher(f),tmp=join(result.launcher,'tmp');
  rmSync(tmp,{recursive:true});writeFileSync(join(f.appRoot,'tmp/keep.txt'),'original target data');symlinkSync(join(f.appRoot,'tmp'),tmp,'dir');
  const upgraded=repairLauncher(f);assert.equal(upgraded.tmpRepaired,true);assert.ok(lstatSync(tmp).isDirectory());
  assert.equal(realpathSync(tmp),tmp);assert.equal(readFileSync(join(f.appRoot,'tmp/keep.txt'),'utf8'),'original target data');
 }finally{f.close();}
});

test('an unrelated real home directory is never replaced',()=>{
 const f=fixture();try{
  const launcher=join(f.accountHome,'seragam-app');rmSync(launcher);mkdirSync(launcher);writeFileSync(join(launcher,'keep.txt'),'existing app');
  assert.throws(()=>repairLauncher(f),/unrecognized real directory/);
  assert.equal(readFileSync(join(launcher,'keep.txt'),'utf8'),'existing app');assert.ok(existsSync(f.databasePath));
 }finally{f.close();}
});
