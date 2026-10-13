import {homedir} from 'node:os';
import {databasePath,projectRoot} from '../hosting/node/database.mjs';
import {relocateApp} from '../hosting/node/relocate.mjs';
import {repairLauncher} from '../hosting/node/launcher.mjs';

const result=relocateApp({source:projectRoot,accountHome:homedir(),databasePath});
if(result.alreadyMoved){console.log('The app is already in '+result.target);}
else{
 console.log('App moved to: '+result.target);
 console.log('Previous checkout path preserved at: '+result.source);
 console.log('Registered cPanel path preserved at: '+result.legacy);
 console.log('SQLite stays at: '+result.databasePath);
 console.log('Private code and database backups: '+result.backupDir);
 console.log('Passenger restart requested. Keep the existing cPanel Application root and activation command.');
 console.log('School app URL remains https://pribadidepok.sch.id/seragam/. Direct access to /seragam-app is blocked.');
}
if(result.environmentLink)console.log('Node Selector environment alias: '+result.environmentLink.path+' -> '+result.environmentLink.target);
const launcher=repairLauncher({accountHome:homedir(),appRoot:result.target});
console.log('Stable cPanel launcher: '+launcher.launcher+' (real directory; loads the app in public_html).');
