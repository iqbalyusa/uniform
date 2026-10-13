import {homedir} from 'node:os';
import {projectRoot} from '../hosting/node/database.mjs';
import {repairLauncher} from '../hosting/node/launcher.mjs';

const result=repairLauncher({accountHome:homedir(),appRoot:projectRoot});
console.log(result.alreadyRepaired?'The stable cPanel launcher is already installed.':'Stable cPanel launcher installed at: '+result.launcher);
console.log('Actual app and Git repository stay at: '+result.appRoot);
console.log('Existing Node.js environment: '+result.environmentRoot);
if(result.backupDir)console.log('Original compatibility link backed up at: '+result.backupDir);
console.log('Database was not modified. Keep cPanel Application root as seragam-app and startup file as app.cjs. Save the subdomain settings and restart.');
