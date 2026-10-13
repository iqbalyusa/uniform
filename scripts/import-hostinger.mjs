import {readFileSync} from 'node:fs';
import {openDatabase} from '../hosting/node/database.mjs';
import {allKeys} from '../hostinger-dist/catalog.mjs';
import {importArchive} from '../hosting/node/import.mjs';
const file=process.argv[2];if(!file)throw Error('Usage: node scripts/import-hostinger.mjs /private/path/migration.json');
const archive=JSON.parse(readFileSync(file,'utf8'));
const {sqlite}=openDatabase();
try{
 const result=importArchive(sqlite,archive,allKeys);
 console.log(`Imported ${result.balances} balances, ${result.pieces} pieces, ${result.history} history entries and ${result.backups} backups.`);
}finally{sqlite.close();}
