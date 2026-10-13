import {writeFileSync} from 'node:fs';
import {deploymentFile,validateOrigin,normalizeBasePath} from '../hosting/node/config.mjs';

const [origin,basePath='/']=process.argv.slice(2);
if(!origin)throw Error('Usage: node scripts/configure-hostinger-domain.mjs https://uniform.pribadidepok.sch.id /');
const config={origin:validateOrigin(origin),basePath:normalizeBasePath(basePath)};
writeFileSync(deploymentFile,JSON.stringify(config,null,2)+'\n',{mode:0o600});
console.log(`Saved school deployment: ${config.origin}${config.basePath||'/'} .`);
console.log('Rebuild with hosting/node/deploy.sh, and set the same origin and base path in cPanel.');
