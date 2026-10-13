const defaultUpstream='https://uniform.pribadisch.workers.dev';
const json=(status,error)=>new Response(JSON.stringify({error}),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});

export async function createBackend({mode=process.env.SERAGAM_BACKEND||'cloudflare',origin,upstream=defaultUpstream,fetchImpl=globalThis.fetch}={}){
 if(!origin||new URL(origin).origin!==origin)throw Error('SERAGAM_ORIGIN must contain only a scheme and host.');
 if(mode==='sqlite'){
  const {openDatabase}=await import('./database.mjs');
  const {DB}=openDatabase();globalThis.schoolEnv={DB};
  const {GET,POST}=await import('../../hostinger-dist/api.mjs');
  return {description:'school-hosted SQLite',handle:request=>request.method==='GET'?GET(request):POST(request)};
 }
 if(mode!=='cloudflare')throw Error('SERAGAM_BACKEND must be cloudflare or sqlite.');
 const target=new URL(upstream);
 if(target.protocol!=='https:'||target.origin!==upstream||target.username||target.password)throw Error('Cloudflare upstream must be an HTTPS origin.');
 return {description:'Cloudflare Worker and D1',async handle(request){
  const url=new URL(request.url),method=request.method;
  if(!['GET','POST'].includes(method))return json(405,'Metode tidak didukung.');
  const endpoint=url.pathname.slice('/api/'.length);
  if(!url.pathname.startsWith('/api/')||!/^(state|history|backup(?:\/[a-zA-Z0-9:_-]+)?|movement|import|settings|members)$/.test(endpoint))return json(404,'Halaman API tidak ditemukan.');
  const read=['state','history','backup'].includes(endpoint)||endpoint.startsWith('backup/');
  if((method==='GET'&&!read)||(method==='POST'&&!['movement','import','settings','members'].includes(endpoint)))return json(405,'Metode tidak didukung.');
  let body;
  if(method==='POST'){
   if(request.headers.get('origin')!==origin)return json(403,'Permintaan tidak berasal dari aplikasi ini.');
   if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return json(415,'Format permintaan harus JSON.');
   body=await request.text();
   if(Buffer.byteLength(body)>3000000)return json(413,'Data terlalu besar.');
   try{JSON.parse(body);}catch{return json(400,'JSON tidak valid.');}
  }
  try{
   // Send only gateway-owned headers. Browser cookies and identity headers stay local.
   const response=await fetchImpl(upstream+url.pathname+url.search,{method,headers:method==='POST'?{'Accept':'application/json','Content-Type':'application/json','Origin':upstream}:{'Accept':'application/json'},...(body!==undefined?{body}:{}),redirect:'error',signal:AbortSignal.timeout(40000)});
   if(!response.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw Error('Upstream did not return JSON.');
   return new Response(await response.text(),{status:response.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  }catch{
   // Do not retry writes or switch databases when the Worker cannot be reached.
   return json(502,'Layanan stok Cloudflare belum merespons. Muat ulang sebelum mencoba menyimpan kembali.');
  }
 }};
}
