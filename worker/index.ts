import { GET,POST } from '../app/api/[...path]/route';
import { assets,html } from 'virtual:site-assets';
const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
export default {async fetch(request:Request){
 const url=new URL(request.url);
 if(url.pathname.startsWith('/api/'))return request.method==='GET'?GET(request):request.method==='POST'?POST(request):Response.json({error:'Metode tidak didukung.'},{status:405,headers:{...headers,'Allow':'GET, POST'}});
 if(url.pathname==='/')return new Response(html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'"}});
 const asset=assets[url.pathname];if(asset)return new Response(asset.base64?Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0)):asset.body,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':'public, max-age=31536000, immutable'}});
 return new Response('Tidak ditemukan',{status:404,headers});
}};
