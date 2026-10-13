import {homedir} from 'node:os';
import {databasePath,projectRoot} from '../hosting/node/database.mjs';
import {relocateApp} from '../hosting/node/relocate.mjs';

const result=relocateApp({source:projectRoot,accountHome:homedir(),databasePath});
if(result.alreadyMoved){console.log('The app is already in '+result.target);}
else{
 console.log('App moved to: '+result.target);
 console.log('Compatibility links preserved at: '+result.source+' and '+result.legacy);
 console.log('SQLite stays at: '+result.databasePath);
 console.log('Private code and database backups: '+result.backupDir);
 console.log('Passenger restart requested. Keep the existing cPanel Application root and activation command.');
 console.log('School app URL remains https://pribadidepok.sch.id/seragam/. Direct access to /seragam-app is blocked.');
}
