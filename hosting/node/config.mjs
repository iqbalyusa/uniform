import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export const deploymentFile=fileURLToPath(new URL('./deployment.json',import.meta.url));
export function validateOrigin(origin){
 const url=new URL(origin);
 if(!['https:','http:'].includes(url.protocol)||url.origin!==origin)throw Error('SERAGAM_ORIGIN must contain only an HTTP(S) scheme and host.');
 return origin;
}
export function normalizeBasePath(value){
 if(value==='/'||value==='')return '';
 if(typeof value!=='string'||!/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(value))throw Error('SERAGAM_BASE_PATH must be / for a domain root, or a path such as /seragam.');
 return value;
}
export function deploymentConfig({env=process.env,file=deploymentFile}={}){
 let saved={};try{saved=JSON.parse(readFileSync(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 return {origin:validateOrigin(env.SERAGAM_ORIGIN||saved.origin||'https://pribadidepok.sch.id'),basePath:normalizeBasePath(env.SERAGAM_BASE_PATH??saved.basePath??'/seragam')};
}
