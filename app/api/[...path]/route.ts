import { actor,inventoryEditor,database,snapshot,fullBackup,movement,editHistory,deleteHistory,changeMember,importStock,sameOrigin,body,ApiError } from '../../../lib/server';
import { localDate,validateQuantity } from '../../../lib/catalog';
export const dynamic='force-dynamic';
function response(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function handle(request:Request){try{
 const member=await actor(request);const path=new URL(request.url).pathname.slice(5);
 if(request.method==='GET'){
  if(path==='state')return response(await snapshot(member));
  if(path==='history'){const url=new URL(request.url);return response((await database().prepare('SELECT * FROM history WHERE date>=? AND date<=? ORDER BY occurred_at DESC,id DESC LIMIT 10000').bind(url.searchParams.get('from')||'',url.searchParams.get('to')||'9999-12-31').all()).results);}
  if(path==='backup'){inventoryEditor(member);return response(await fullBackup(member));}
  if(path.startsWith('backup/')){inventoryEditor(member);const b=await database().prepare('SELECT data FROM backups WHERE id=?').bind(path.slice(7)).first<{data:string}>();if(!b)throw new ApiError('Cadangan tidak ditemukan.',404);return response(JSON.parse(b.data));}
 }
 if(request.method==='POST'){
  sameOrigin(request);const data=await body(request);if(path==='movement')return response(await movement(member,data));if(path==='history-edit')return response(await editHistory(member,data));if(path==='history-delete')return response(await deleteHistory(member,data));if(path==='members')return response(await changeMember(member,data));if(path==='import')return response(await importStock(member,data));
  if(path==='settings'){inventoryEditor(member);validateQuantity(data.lowLimit);if(data.lowLimit>10000)throw new ApiError('Batas peringatan maksimal 10.000.');await database().batch([database().prepare('UPDATE settings SET low_limit=?,revision=revision+1 WHERE id=1').bind(data.lowLimit),database().prepare("INSERT INTO history (id,action,actor_id,actor,occurred_at,date,note) VALUES (?,'Pengaturan',?,?,?,?,?)").bind(crypto.randomUUID(),member.id,member.name,new Date().toISOString(),localDate(),`Batas stok menipis: di bawah ${data.lowLimit} pcs`)]);return response({saved:true});}
 }
 return response({error:'Halaman API tidak ditemukan.'},404);
 }catch(error){if(error instanceof ApiError)return response({error:error.message},error.status);if(error instanceof Error&&/tidak valid|bilangan bulat/.test(error.message))return response({error:error.message},400);console.error('Inventory API failure',error instanceof Error?error.message:'unknown');return response({error:'Perubahan belum disimpan. Coba kembali atau hubungi administrator.'},500);}}
export const GET=handle;export const POST=handle;
