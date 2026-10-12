import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync,readFileSync,readdirSync } from 'node:fs';
mkdirSync('.sites-runtime',{recursive:true});const sqlite=new DatabaseSync('.sites-runtime/preview.sqlite');sqlite.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){if(sqlite.prepare('SELECT name FROM local_migrations WHERE name=?').get(file))continue;sqlite.exec(readFileSync(`drizzle/${file}`,'utf8'));sqlite.prepare('INSERT INTO local_migrations VALUES (?)').run(file);}
class Statement{constructor(sql,values=[]){this.sql=sql;this.values=values;}bind(...values){return new Statement(this.sql,values);}execute(){const s=sqlite.prepare(this.sql);if(s.columns().length)return {results:s.all(...this.values),meta:{changes:0}};const result=s.run(...this.values);return {results:[],meta:{changes:Number(result.changes)}};}async first(){return this.execute().results[0]??null;}async all(){return this.execute();}async run(){return this.execute();}}
globalThis.localEnv={DB:{prepare:sql=>new Statement(sql),async batch(statements){sqlite.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>s.execute());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
const {default:worker}=await import('../.sites-runtime/preview-worker.mjs');
const port=Number(process.env.PORT??5173),origin=`http://127.0.0.1:${port}`;
createServer(async(req,res)=>{try{
 if(req.url.startsWith('/signin-with-chatgpt')){res.writeHead(302,{'Set-Cookie':'local_preview=rahma; HttpOnly; SameSite=Lax; Path=/','Location':'/'});res.end();return;}
 if(req.url.startsWith('/signout-with-chatgpt')){res.writeHead(302,{'Set-Cookie':'local_preview=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/','Location':'/'});res.end();return;}
 const headers=new Headers();for(const [k,v] of Object.entries(req.headers)){if(v&&!k.startsWith('oai-'))headers.set(k,Array.isArray(v)?v.join(','):v);}
 if(req.headers.cookie?.includes('local_preview=rahma')){headers.set('oai-authenticated-user-id','local-rahma');headers.set('oai-authenticated-user-email','rahma@pribadidepok.sch.id');}
 const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);const request=new Request(origin+req.url,{method:req.method,headers,...(body.length?{body}:{} )});const response=await worker.fetch(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e.message);res.writeHead(500);res.end('Preview error');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: ${origin}\nShared editing is available without an application account.`));
