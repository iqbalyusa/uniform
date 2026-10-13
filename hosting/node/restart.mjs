import {existsSync,lstatSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

export function requestRestart({appRoot,accountHome}){
 appRoot=realpathSync(appRoot);
 const roots=[appRoot],launcher=join(accountHome,'seragam-app');
 if(existsSync(launcher)){
  const marker=join(launcher,'.seragam-launcher.json');
  const recognized=realpathSync(launcher)===appRoot||(existsSync(marker)&&JSON.parse(readFileSync(marker,'utf8')).appRoot===appRoot);
  if(recognized)roots.push(launcher);
 }
 const paths=new Set();
 for(const root of roots){
  const tmp=join(root,'tmp');
  // cPanel requires its registered launcher's tmp directory to stay inside the root.
  if(existsSync(tmp)&&lstatSync(tmp).isSymbolicLink())throw Error('Run scripts/repair-hostinger-registration.mjs to replace the old tmp link before requesting a restart.');
  mkdirSync(tmp,{recursive:true});paths.add(join(realpathSync(tmp),'restart.txt'));
 }
 for(const path of paths)writeFileSync(path,'');
 return [...paths];
}
