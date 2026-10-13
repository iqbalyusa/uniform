import { build } from 'esbuild';
import { mkdir,rm,cp,writeFile,readdir,chmod } from 'node:fs/promises';
import { resolve,relative,join } from 'node:path';
const root=process.cwd(),out=resolve(root,'school-dist');
if(relative(root,out)!=='school-dist')throw Error('Invalid school build directory');
await rm(out,{recursive:true,force:true});
const dest=join(out,'seragam');await mkdir(dest,{recursive:true});
const result=await build({entryPoints:['app/client.tsx'],outdir:join(dest,'assets'),bundle:true,splitting:true,format:'esm',platform:'browser',minify:true,metafile:true,entryNames:'app-[hash]',chunkNames:'chunk-[hash]',publicPath:'/seragam/assets/',define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_BASE_PATH':'"/seragam"','process.env.NEXT_PUBLIC_API_GATEWAY':'true'},target:['es2022'],loader:{'.woff2':'file','.woff':'file','.png':'file'},logLevel:'info'});
const outputs=Object.keys(result.metafile.outputs),main=outputs.find(p=>result.metafile.outputs[p].entryPoint==='app/client.tsx'&&p.endsWith('.js')),css=outputs.find(p=>p.endsWith('.css'));
if(!main||!css)throw Error('Browser entry or stylesheet missing');
const name=p=>p.split('/').pop();
await writeFile(join(dest,'index.html'),`<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12233c"><title>Pribadi · Manajemen Seragam</title><meta name="description" content="Persediaan seragam SD, SMP, dan SMA Pribadi."><link rel="stylesheet" href="/seragam/assets/${name(css)}"></head><body><div id="app"></div><script type="module" src="/seragam/assets/${name(main)}"></script></body></html>`);
await cp('hosting/school',dest,{recursive:true});
async function permissions(dir){await chmod(dir,0o755);for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await permissions(path);else await chmod(path,0o644);}}
await permissions(out);
console.log('School hosting package: school-dist/seragam');
