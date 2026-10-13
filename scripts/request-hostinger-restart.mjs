import {homedir} from 'node:os';
import {projectRoot} from '../hosting/node/database.mjs';
import {requestRestart} from '../hosting/node/restart.mjs';

const paths=requestRestart({appRoot:projectRoot,accountHome:homedir()});
console.log(`Restart requested for ${paths.length} application path(s).`);
