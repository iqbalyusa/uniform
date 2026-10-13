import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {openDatabase,databasePath} from '../hosting/node/database.mjs';
import {requireEmptyDatabase,importArchive} from '../hosting/node/import.mjs';
import {allKeys} from '../hostinger-dist/catalog.mjs';
import {exportCloudflare} from './cloudflare-export.mjs';

const {sqlite}=openDatabase();
try{
 requireEmptyDatabase(sqlite);
 console.log('Downloading a one-time copy of Cloudflare stock, full history and saved backups...');
 const archive=await exportCloudflare();
 const dir=dirname(databasePath);mkdirSync(dir,{recursive:true,mode:0o700});
 const file=join(dir,`cloudflare-migration-${Date.now()}.json`);
 writeFileSync(file,JSON.stringify(archive),{mode:0o600,flag:'wx'});
 const result=importArchive(sqlite,archive,allKeys);
 console.log(`Copied ${result.pieces} pieces, ${result.history} history entries and ${result.backups} backups into ${databasePath}.`);
 console.log(`Private source backup saved to ${file}.`);
 console.log('Migration complete. Restart the school app to load the SQLite-only build. Use the school URL for all further transactions.');
}finally{sqlite.close();}
