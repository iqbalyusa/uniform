import {build} from 'esbuild';
import {mkdir,rm,writeFile,readFile,copyFile,rename} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {deploymentConfig} from '../hosting/node/config.mjs';
import {publicHtaccess} from '../hosting/node/public-config.mjs';
const {basePath:base}=deploymentConfig();
const root=process.cwd(),target=resolve(root,'hostinger-dist'),out=resolve(root,'hostinger-dist.next');
if(relative(root,out)!=='hostinger-dist.next')throw Error('Invalid Hostinger build directory');
await rm(out,{recursive:true,force:true});const dir=join(out,'public');await mkdir(dir,{recursive:true});
const result=await build({entryPoints:['app/client.tsx'],outdir:join(dir,'assets'),bundle:true,splitting:true,format:'esm',platform:'browser',minify:true,metafile:true,entryNames:'app-[hash]',chunkNames:'chunk-[hash]',publicPath:base+'/assets/',define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_BASE_PATH':JSON.stringify(base),'process.env.NEXT_PUBLIC_API_GATEWAY':'false'},target:['es2022'],loader:{'.woff2':'file','.woff':'file','.png':'file'},logLevel:'info'});
const files=Object.keys(result.metafile.outputs),main=files.find(p=>result.metafile.outputs[p].entryPoint==='app/client.tsx'&&p.endsWith('.js')),css=files.find(p=>p.endsWith('.css'));if(!main||!css)throw Error('Missing browser entry');const name=p=>p.split('/').pop();
await writeFile(join(dir,'index.html'),`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12233c"><title>Pribadi · Manajemen Seragam</title><meta name="description" content="Persediaan seragam SD, SMP, dan SMA Pribadi."><link rel="stylesheet" href="${base}/assets/${name(css)}"></head><body><div id="app"></div><script type="module" src="${base}/assets/${name(main)}"></script></body></html>`);
let existingHtaccess='';try{existingHtaccess=await readFile(join(target,'public/.htaccess'),'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
await writeFile(join(dir,'.htaccess'),publicHtaccess(existingHtaccess));
await build({entryPoints:['app/api/[...path]/route.ts'],outfile:join(out,'api.mjs'),bundle:true,platform:'node',format:'esm',target:'node22',plugins:[{name:'school-database',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'school'}));b.onLoad({filter:/.*/,namespace:'school'},()=>({contents:'export const env=globalThis.schoolEnv;'}));}}],minify:true,logLevel:'info'});
await build({entryPoints:['lib/catalog.ts'],outfile:join(out,'catalog.mjs'),bundle:true,platform:'node',format:'esm',target:'node22',minify:true});
const currentAssets=files.map(p=>'assets/'+name(p));
try{const previous=JSON.parse(await readFile(join(target,'assets-manifest.json'),'utf8'));for(const file of previous){if(!/^assets\/[a-zA-Z0-9._-]+$/.test(file))throw Error('Invalid prior asset manifest');try{await copyFile(join(target,'public',file),join(dir,file));}catch(error){if(error.code!=='ENOENT')throw error;}}}catch(error){if(error.code!=='ENOENT')throw error;}
await writeFile(join(out,'assets-manifest.json'),JSON.stringify(currentAssets));
const previous=resolve(root,'hostinger-dist.previous');await rm(previous,{recursive:true,force:true});
try{await rename(target,previous);}catch(error){if(error.code!=='ENOENT')throw error;}
try{await rename(out,target);}catch(error){try{await rename(previous,target);}catch{}throw error;}
console.log('Built standalone Hostinger app. Runtime uses only the school-hosted SQLite database.');
