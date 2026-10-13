import {randomUUID} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,readlinkSync,realpathSync,renameSync,rmSync,symlinkSync,unlinkSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {requestRestart} from './restart.mjs';

const present=path=>{try{lstatSync(path);return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}};

function repairTmp(launcher,appRoot){
 const tmp=join(launcher,'tmp');
 if(present(tmp)&&lstatSync(tmp).isSymbolicLink()){
  const original=readlinkSync(tmp);
  if(realpathSync(tmp)!==realpathSync(join(appRoot,'tmp')))throw Error('Launcher tmp points to an unexpected directory. Nothing was replaced.');
  unlinkSync(tmp);
  try{mkdirSync(tmp);}catch(error){symlinkSync(original,tmp,'dir');throw error;}
  return true;
 }
 mkdirSync(tmp,{recursive:true});return false;
}

export function repairLauncher({accountHome,appRoot}){
 accountHome=realpathSync(accountHome);appRoot=realpathSync(appRoot);
 const launcher=join(accountHome,'seragam-app'),expected=realpathSync(join(accountHome,'public_html/seragam-app'));
 if(appRoot!==expected)throw Error('The real app must already be in public_html/seragam-app. Nothing was changed.');
 if(!existsSync(join(appRoot,'app.cjs'))||!existsSync(join(appRoot,'hostinger-dist/public/index.html')))throw Error('The existing built app is missing. Nothing was changed.');
 if(!/^Require all denied\s*$/m.test(readFileSync(join(appRoot,'.htaccess'),'utf8')))throw Error('Repository HTTP protection is missing. Nothing was changed.');
 let alreadyRepaired=false;
 if(present(launcher)&&!lstatSync(launcher).isSymbolicLink()){
  const marker=join(launcher,'.seragam-launcher.json');
  if(!existsSync(marker)||JSON.parse(readFileSync(marker,'utf8')).appRoot!==appRoot)throw Error('Home seragam-app is an unrecognized real directory. Nothing was replaced.');
  alreadyRepaired=true;
 }else if(present(launcher)&&realpathSync(launcher)!==appRoot){throw Error('Home seragam-app points to another app. Nothing was replaced.');}
 const candidates=[join(accountHome,'nodevenv/seragam-app'),join(accountHome,'nodevenv/repositories/seragam-app'),join(accountHome,'nodevenv/public_html/seragam-app')];
 const environment=candidates.find(path=>existsSync(path)&&lstatSync(realpathSync(path)).isDirectory());
 if(!environment)throw Error('The existing Node.js environment was not found. Nothing was changed.');
 const environmentRoot=realpathSync(environment),environmentAlias=join(accountHome,'nodevenv/seragam-app');
 if(present(environmentAlias)&&(!existsSync(environmentAlias)||!lstatSync(realpathSync(environmentAlias)).isDirectory()))throw Error('The registered Node.js environment path is invalid. Nothing was changed.');
 if(alreadyRepaired){
  if(!present(environmentAlias))symlinkSync(environmentRoot,environmentAlias,'dir');
  const tmpRepaired=repairTmp(launcher,appRoot);
  requestRestart({appRoot,accountHome});
  return {alreadyRepaired,launcher,appRoot,environmentRoot,tmpRepaired};
 }
 const backupDir=join(accountHome,'seragam-registration-backups',`${Date.now()}-${randomUUID().slice(0,8)}`);
 mkdirSync(backupDir,{recursive:true,mode:0o700});
 const stage=join(backupDir,'launcher-stage');mkdirSync(stage,{mode:0o755});
 const startup=`// Stable cPanel entry point; the actual application stays inside public_html.\nimport(${JSON.stringify(pathToFileURL(join(appRoot,'app.cjs')).href)}).catch(error=>{console.error(error);process.exit(1);});\n`;
 writeFileSync(join(stage,'app.cjs'),startup,{mode:0o644});
 writeFileSync(join(stage,'package.json'),JSON.stringify({name:'seragam-cpanel-launcher',version:'1.0.0',private:true,scripts:{start:'node app.cjs'}},null,2)+'\n',{mode:0o644});
 writeFileSync(join(stage,'.seragam-launcher.json'),JSON.stringify({schemaVersion:1,appRoot,environmentRoot},null,2)+'\n',{mode:0o600});
 mkdirSync(join(appRoot,'tmp'),{recursive:true});mkdirSync(join(stage,'tmp'));
 const modules=join(appRoot,'node_modules');if(existsSync(modules))symlinkSync(realpathSync(modules),join(stage,'node_modules'),'dir');
 let aliasCreated=false,originalMoved=false,installed=false;
 const oldLink=join(backupDir,'original-seragam-app-link');
 try{
  if(!present(environmentAlias)){symlinkSync(environmentRoot,environmentAlias,'dir');aliasCreated=true;}
  if(present(launcher)){renameSync(launcher,oldLink);originalMoved=true;}
  renameSync(stage,launcher);installed=true;
  requestRestart({appRoot,accountHome});
  return {launcher,appRoot,environmentRoot,backupDir};
 }catch(error){
  try{
   if(installed)rmSync(launcher,{recursive:true});
   if(originalMoved)renameSync(oldLink,launcher);
   if(aliasCreated)unlinkSync(environmentAlias);
  }catch(rollbackError){throw new Error(`Launcher repair failed and rollback needs attention. Backup: ${backupDir}. ${rollbackError.message}`,{cause:error});}
  throw new Error(`Launcher repair stopped; original registered path restored. ${error.message}`,{cause:error});
 }
}
