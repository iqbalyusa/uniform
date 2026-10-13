import {readFileSync} from 'node:fs';
import {openDatabase} from '../hosting/node/database.mjs';
import {allKeys} from '../hostinger-dist/catalog.mjs';
const file=process.argv[2];if(!file)throw Error('Usage: node scripts/import-hostinger.mjs /private/path/migration.json');
const archive=JSON.parse(readFileSync(file,'utf8')),snapshot=archive.snapshot||archive;
if(!snapshot||snapshot.schemaVersion!==2||!snapshot.stock||!Array.isArray(snapshot.history))throw Error('Invalid inventory backup');
if(Object.keys(snapshot.stock).some(key=>!allKeys.includes(key)))throw Error('Unknown inventory keys');
for(const quantity of Object.values(snapshot.stock))if(!Number.isSafeInteger(quantity)||quantity<0||quantity>1000000)throw Error('Invalid stock quantity');
if(!Number.isSafeInteger(snapshot.lowLimit)||snapshot.lowLimit<0||snapshot.lowLimit>10000||!Number.isSafeInteger(snapshot.revision)||snapshot.revision<0)throw Error('Invalid settings in inventory backup');
for(const revision of Object.values(archive.stockRevisions||{}))if(!Number.isSafeInteger(revision)||revision<0)throw Error('Invalid stock revision');
const {sqlite}=openDatabase();sqlite.exec('BEGIN IMMEDIATE');
try{
 if(sqlite.prepare('SELECT count(*) AS n FROM history').get().n||sqlite.prepare('SELECT count(*) AS n FROM backups').get().n||sqlite.prepare('SELECT count(*) AS n FROM stock').get().n)throw Error('Database must be empty. Import refused to protect existing records.');
 const insert=sqlite.prepare('INSERT INTO stock (key,quantity,revision) VALUES (?,?,?)');
 for(const key of allKeys)insert.run(key,snapshot.stock[key]??0,archive.stockRevisions?.[key]??0);
 const columns=['id','key','action','actor_id','actor','occurred_at','date','before_qty','after_qty','delta','student_name','student_class','staff_name','note','source'];
 const history=sqlite.prepare(`INSERT INTO history (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`);
 for(const row of snapshot.history)history.run(...columns.map(c=>row[c]??(['key','before_qty','after_qty','delta'].includes(c)?null:c==='source'?'app':'')));
 const backup=sqlite.prepare('INSERT INTO backups (id,created_at,actor,data) VALUES (?,?,?,?)');for(const row of archive.backups||[])backup.run(row.id,row.created_at,row.actor,typeof row.data==='string'?row.data:JSON.stringify(row.data));
 sqlite.prepare('INSERT INTO settings (id,low_limit,revision) VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET low_limit=excluded.low_limit,revision=excluded.revision').run(snapshot.lowLimit??5,snapshot.revision??0);
 sqlite.exec('COMMIT');console.log(`Imported ${allKeys.length} balances, ${snapshot.history.length} history entries and ${(archive.backups||[]).length} backups.`);
}catch(error){sqlite.exec('ROLLBACK');throw error;}finally{sqlite.close();}
