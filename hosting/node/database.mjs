import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readdirSync,readFileSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
export const projectRoot=fileURLToPath(new URL('../../',import.meta.url));
export const databasePath=resolve(process.env.SERAGAM_DATABASE_PATH||resolve(homedir(),'seragam-data','inventory.sqlite'));
export function openDatabase(){
 const rel=relative(projectRoot,databasePath);
 if((!rel.startsWith('..'+sep)&&!isAbsolute(rel))||databasePath.split(sep).includes('public_html'))throw Error('Keep the database outside the Git checkout and public_html.');
 mkdirSync(dirname(databasePath),{recursive:true,mode:0o700});
 const sqlite=new DatabaseSync(databasePath);
 sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS school_migrations (name TEXT PRIMARY KEY)');
 const dir=resolve(projectRoot,'drizzle');
 for(const file of readdirSync(dir).filter(f=>f.endsWith('.sql')).sort()){
  if(sqlite.prepare('SELECT name FROM school_migrations WHERE name=?').get(file))continue;
  sqlite.exec('BEGIN IMMEDIATE');
  try{sqlite.exec(readFileSync(resolve(dir,file),'utf8'));sqlite.prepare('INSERT INTO school_migrations VALUES (?)').run(file);sqlite.exec('COMMIT');}
  catch(error){sqlite.exec('ROLLBACK');throw error;}
 }
 class Statement{
  constructor(sql,values=[]){this.sql=sql;this.values=values;}
  bind(...values){return new Statement(this.sql,values);}
  execute(){const s=sqlite.prepare(this.sql);if(/^\s*(SELECT|WITH|PRAGMA)\b/i.test(this.sql))return {results:s.all(...this.values),meta:{changes:0}};const result=s.run(...this.values);return {results:[],meta:{changes:Number(result.changes)}};}
  async first(){return this.execute().results[0]??null;}
  async all(){return this.execute();}
  async run(){return this.execute();}
 }
 const DB={prepare:sql=>new Statement(sql),async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const rows=statements.map(s=>s.execute());sqlite.exec('COMMIT');return rows;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
 return {sqlite,DB};
}
