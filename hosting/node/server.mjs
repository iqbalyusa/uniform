import {createServer} from 'node:http';
import {readFileSync,statSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {gzipSync} from 'node:zlib';
import {openDatabase,projectRoot} from './database.mjs';
const origin=process.env.SERAGAM_ORIGIN||'https://pribadidepok.sch.id';
if(new URL(origin).origin!==origin)throw Error('SERAGAM_ORIGIN must contain only a scheme and host.');
const base='/seragam',publicRoot=resolve(projectRoot,'hostinger-dist/public');
const {DB}=openDatabase();globalThis.schoolEnv={DB};
const {GET,POST}=await import('../../hostinger-dist/api.mjs');
const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'"};
const cache=new Map();
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/',origin);
  // Passenger may strip the application mount; direct Node access retains it.
  if(url.pathname===base||url.pathname.startsWith(base+'/'))url.pathname=url.pathname.slice(base.length)||'/';
  if(url.pathname.startsWith('/api/')){
   const method=req.method||'GET';
   if(!['GET','POST'].includes(method)){res.writeHead(405,{...security,Allow:'GET, POST','Content-Type':'application/json'});res.end(JSON.stringify({error:'Metode tidak didukung.'}));return;}
   const headers=new Headers();for(const [key,value]of Object.entries(req.headers)){if(value&&!key.startsWith('oai-'))headers.set(key,Array.isArray(value)?value.join(','):value);}
   let length=0;const chunks=[];for await(const chunk of req){length+=chunk.length;if(length<=3000000)chunks.push(chunk);}
   if(length>3000000){res.writeHead(413,{...security,'Content-Type':'application/json'});res.end(JSON.stringify({error:'Data terlalu besar.'}));return;}
   const request=new Request(origin+url.pathname+url.search,{method,headers,...(method==='POST'?{body:Buffer.concat(chunks)}:{})});
   const response=await (method==='GET'?GET(request):POST(request));
   res.writeHead(response.status,{...security,...Object.fromEntries(response.headers)});res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method||'GET')){res.writeHead(405,{...security,Allow:'GET, HEAD'});res.end();return;}
  const pathname=decodeURIComponent(url.pathname),file=resolve(publicRoot,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(publicRoot+sep)||!statSync(file,{throwIfNoEntry:false})?.isFile()){res.writeHead(404,security);res.end('Tidak ditemukan');return;}
  let asset=cache.get(file);if(!asset){const body=readFileSync(file);const extension=file.split('.').pop();const type={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',png:'image/png',woff:'font/woff',woff2:'font/woff2'}[extension]||'application/octet-stream';asset={body,type,gzip:['html','css','js'].includes(extension)?gzipSync(body):null};cache.set(file,asset);}
  const compressed=asset.gzip&&/\bgzip\b/.test(req.headers['accept-encoding']||''),body=compressed?asset.gzip:asset.body;
  res.writeHead(200,{...security,'Content-Type':asset.type,'Cache-Control':pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-store',Vary:'Accept-Encoding',...(compressed?{'Content-Encoding':'gzip'}:{}),'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
 }catch(error){console.error('School application error:',error.message);if(!res.headersSent)res.writeHead(500,{...security,'Content-Type':'application/json'});res.end(JSON.stringify({error:'Perubahan belum disimpan. Muat ulang dan coba kembali.'}));}
});
server.requestTimeout=120000;
server.listen(Number(process.env.PORT||3000),()=>console.log('Manajemen Seragam is running with the school-hosted SQLite database.'));
