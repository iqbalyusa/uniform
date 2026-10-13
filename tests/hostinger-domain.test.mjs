import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deploymentConfig} from '../hosting/node/config.mjs';
import {publicHtaccess} from '../hosting/node/public-config.mjs';

test('saved subdomain settings survive builds without exported shell variables',()=>{
 const dir=mkdtempSync(join(tmpdir(),'seragam-domain-')),file=join(dir,'deployment.json');
 try{
  assert.deepEqual(deploymentConfig({env:{},file}),{origin:'https://pribadidepok.sch.id',basePath:'/seragam'});
  writeFileSync(file,JSON.stringify({origin:'https://uniform.pribadidepok.sch.id',basePath:''}));
  assert.deepEqual(deploymentConfig({env:{},file}),{origin:'https://uniform.pribadidepok.sch.id',basePath:''});
  assert.deepEqual(deploymentConfig({env:{SERAGAM_BASE_PATH:'/',SERAGAM_ORIGIN:'https://uniform.pribadidepok.sch.id'},file}),{origin:'https://uniform.pribadidepok.sch.id',basePath:''});
  assert.throws(()=>deploymentConfig({env:{SERAGAM_BASE_PATH:'/../private'},file}),/SERAGAM_BASE_PATH/);
  assert.throws(()=>deploymentConfig({env:{SERAGAM_ORIGIN:'https://uniform.pribadidepok.sch.id/seragam'},file}),/SERAGAM_ORIGIN/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('public directory protection grants browser files, blocks hidden files and preserves Passenger directives on repeated builds',()=>{
 const passenger='# DO NOT REMOVE\nPassengerAppRoot /home/pribadisch/seragam-app\nPassengerStartupFile app.cjs\n';
 const first=publicHtaccess(passenger),next=publicHtaccess(first);
 assert.equal(first,next);assert.ok(first.includes(passenger));
 assert.match(first,/Require all granted/);assert.match(first,/<FilesMatch "\^\\\.">\n    Require all denied/);
 assert.equal((next.match(/BEGIN SERAGAM PUBLIC/g)||[]).length,1);
});
