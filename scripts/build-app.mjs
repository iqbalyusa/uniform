import { build } from 'esbuild';
import { mkdir,writeFile,cp,rm,readdir,readFile,access } from 'node:fs/promises';
import { resolve,relative,join } from 'node:path';
const root=process.cwd(),dist=resolve(root,'dist');if(relative(root,dist)!=='dist')throw Error('Invalid build directory');
// Keep the previous build's hashed files so pages already open in a browser keep working until reloaded.
// Only the build listed in assets-manifest.json is kept, so old files do not pile up.
const assetsDir=join(dist,'public','assets'),manifest=join(dist,'assets-manifest.json'),previous=new Map();
const kept=await readFile(manifest,'utf8').then(JSON.parse).catch(()=>readdir(assetsDir).catch(()=>[]));
for(const file of kept)if(/^[a-zA-Z0-9._-]+$/.test(file))await readFile(join(assetsDir,file)).then(body=>previous.set(file,body),()=>{});
await rm(dist,{recursive:true,force:true});
const publicDir=join(dist,'public');await mkdir(publicDir,{recursive:true});await cp('public',publicDir,{recursive:true});
const client=await build({entryPoints:['app/client.tsx'],outdir:join(publicDir,'assets'),bundle:true,splitting:true,format:'esm',platform:'browser',minify:true,metafile:true,entryNames:'app-[hash]',chunkNames:'chunk-[hash]',publicPath:'/assets/',define:{'process.env.NODE_ENV':'"production"'},target:['es2022'],loader:{'.woff2':'file','.woff':'file','.png':'file','.webp':'file'},logLevel:'info'});
const outputs=Object.keys(client.metafile.outputs),main=outputs.find(p=>client.metafile.outputs[p].entryPoint==='app/client.tsx'&&p.endsWith('.js')),css=outputs.find(p=>p.endsWith('.css'));
if(!main||!css)throw Error('Browser entry or stylesheet missing');
const name=p=>p.split('/').pop();
await writeFile(join(publicDir,'index.html'),`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12233c"><title>Pribadi · Manajemen Seragam</title><meta name="description" content="Stok seragam bersama untuk SD, SMP, dan SMA Pribadi."><link rel="icon" href="/favicon.png" type="image/png"><link rel="stylesheet" href="/assets/${name(css)}"></head><body><div id="app"></div><script type="module" src="/assets/${name(main)}"></script></body></html>`);
await writeFile(manifest,JSON.stringify(outputs.map(name)));
for(const [file,body] of previous)await access(join(assetsDir,file)).catch(()=>writeFile(join(assetsDir,file),body));
await build({entryPoints:['server/api.ts'],outfile:join(dist,'api.mjs'),bundle:true,format:'esm',platform:'node',target:'node22',minify:true,logLevel:'info'});
console.log('Built browser assets (dist/public) and Node.js API (dist/api.mjs).');
