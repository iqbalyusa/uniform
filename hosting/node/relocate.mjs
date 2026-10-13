import {DatabaseSync} from 'node:sqlite';
import {execFileSync} from 'node:child_process';
import {chmodSync,existsSync,lstatSync,mkdirSync,readFileSync,readlinkSync,realpathSync,renameSync,symlinkSync,unlinkSync,writeFileSync} from 'node:fs';
import {join,relative,isAbsolute,sep} from 'node:path';

const present=path=>{try{lstatSync(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}};
const inside=(parent,path)=>{const rel=relative(parent,path);return !isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep);};
const replaceLink=(path,target)=>{if(present(path)){if(!lstatSync(path).isSymbolicLink())throw Error('Refusing to replace a real directory: '+path);unlinkSync(path);}symlinkSync(target,path,'dir');};

export function relocateApp({source,accountHome,databasePath}){
 source=realpathSync(source);accountHome=realpathSync(accountHome);
 const publicRoot=realpathSync(join(accountHome,'public_html')),target=join(publicRoot,'seragam-app'),legacy=join(accountHome,'seragam-app');
 if(!/^Require all denied\s*$/m.test(readFileSync(join(source,'.htaccess'),'utf8')))throw Error('Repository HTTP protection is missing. Pull the latest GitHub code first.');
 if(source===target)return {alreadyMoved:true,target};
 if(inside(source,target)||inside(target,source))throw Error('Source and destination must be separate directories.');
 if(present(target))throw Error('Destination already exists. Nothing was moved: '+target);
 if(!existsSync(join(source,'app.cjs'))||!existsSync(join(source,'hostinger-dist/public/index.html')))throw Error('The source must be the existing built Node.js app.');
 let originalLegacy;
 if(present(legacy)){
  if(!lstatSync(legacy).isSymbolicLink()||realpathSync(legacy)!==source)throw Error('The existing home seragam-app path is not the expected compatibility link. Nothing was moved.');
  originalLegacy=readlinkSync(legacy);
 }
 databasePath=realpathSync(databasePath);
 if(inside(publicRoot,databasePath)||inside(source,databasePath))throw Error('The database must remain outside public_html and the repository.');
 const nodeModules=join(source,'node_modules');
 const modulesLink=present(nodeModules)&&lstatSync(nodeModules).isSymbolicLink()?readlinkSync(nodeModules):null;
 const modulesTarget=modulesLink===null?null:realpathSync(nodeModules);
 const backupDir=join(accountHome,'seragam-relocation-backups',String(Date.now()));
 mkdirSync(backupDir,{recursive:true,mode:0o700});
 const inventoryBackup=join(backupDir,'inventory.sqlite');
 const db=new DatabaseSync(databasePath,{readOnly:true});
 try{db.exec('PRAGMA busy_timeout=5000');db.prepare('VACUUM INTO ?').run(inventoryBackup);}finally{db.close();}
 chmodSync(inventoryBackup,0o600);
 const sourceBackup=join(backupDir,'app-source.tar.gz');
 execFileSync('tar',['--exclude=./node_modules','-czf',sourceBackup,'-C',source,'.']);chmodSync(sourceBackup,0o600);
 writeFileSync(join(backupDir,'paths.json'),JSON.stringify({source,target,legacy,originalLegacy,databasePath,modulesLink},null,2),{mode:0o600});
 let moved=false,sourceLinked=false,legacyLinked=false,modulesChanged=false;
 try{
  renameSync(source,target);moved=true;
  symlinkSync(target,source,'dir');sourceLinked=true;
  legacyLinked=true;replaceLink(legacy,target);
  // Keep CloudLinux's existing virtual environment intact, including relative links.
  if(modulesLink!==null&&!isAbsolute(modulesLink)){
   modulesChanged=true;replaceLink(join(target,'node_modules'),inside(source,modulesTarget)?join(target,relative(source,modulesTarget)):modulesTarget);
  }
  mkdirSync(join(target,'tmp'),{recursive:true});writeFileSync(join(target,'tmp/restart.txt'),'');
  return {target,source,legacy,backupDir,databasePath};
 }catch(error){
  // Restore the original layout if any step after the directory rename fails.
  try{
   if(modulesChanged)replaceLink(join(target,'node_modules'),modulesLink);
   if(legacyLinked){if(present(legacy))unlinkSync(legacy);if(originalLegacy!==undefined)symlinkSync(originalLegacy,legacy,'dir');}
   if(sourceLinked)unlinkSync(source);
   if(moved)renameSync(target,source);
  }catch(rollbackError){throw new Error(`Relocation failed and rollback needs attention. Backups: ${backupDir}. ${rollbackError.message}`,{cause:error});}
  throw new Error(`Relocation stopped; original folders restored. Backups: ${backupDir}. ${error.message}`,{cause:error});
 }
}
