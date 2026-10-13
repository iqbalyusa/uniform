import { getDatabase } from './database';
import { getChatGPTUser } from './identity';
import { accountsEnabled } from './access';
import { staffNames,allKeys,localDate,validateKey,validateQuantity,type Member } from './catalog';
export class ApiError extends Error{constructor(message:string,public status=400){super(message);}}
export function database(){const db=getDatabase();if(!db)throw new ApiError('Database belum terhubung. Hubungi administrator.',503);return db;}
const initialAdmins=[['rahma@pribadidepok.sch.id','Rahma'],['afro@pribadidepok.sch.id','Afro']];
export async function actor(request?:Request){
 const db=database();
 await db.prepare('INSERT OR IGNORE INTO settings (id,low_limit,revision) VALUES (1,5,0)').run();
 if(!accountsEnabled)return {id:'shared-visitor',email:'',name:'Pengunjung tanpa akun',role:'shared',active:1} satisfies Member;
 const user=await getChatGPTUser(request);if(!user)throw new ApiError('Silakan masuk untuk mengakses stok.',401);
 await db.batch([db.prepare('INSERT OR IGNORE INTO settings (id,low_limit,revision) VALUES (1,5,0)'),...initialAdmins.map(([email,name])=>db.prepare("INSERT OR IGNORE INTO members (id,email,name,role,active) VALUES (?, ?, ?, 'admin',1)").bind(email,email,name))]);
 let member=await db.prepare('SELECT * FROM members WHERE user_id=?').bind(user.userId).first<Member>();
 if(!member){const invited=await db.prepare('SELECT * FROM members WHERE email=? AND user_id IS NULL AND active=1').bind(user.email.toLowerCase()).first<Member>();if(invited){await db.prepare('UPDATE members SET user_id=? WHERE id=? AND user_id IS NULL').bind(user.userId,invited.id).run();member=await db.prepare('SELECT * FROM members WHERE user_id=?').bind(user.userId).first<Member>();}}
 if(!member||!member.active)throw new ApiError(`Akun ${user.email} belum diberi akses atau dinonaktifkan. Hubungi administrator.`,403);return member;
}
export function admin(member:Member){if(member.role!=='admin')throw new ApiError('Hanya administrator yang dapat menjalankan tindakan ini.',403);}
export function inventoryEditor(member:Member){if(accountsEnabled)admin(member);}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)throw new ApiError('Permintaan tidak berasal dari aplikasi ini.',403);}
export async function body(request:Request){if(!request.headers.get('content-type')?.includes('application/json'))throw new ApiError('Format permintaan harus JSON.',415);const raw=await request.text();if(raw.length>3000000)throw new ApiError('Data terlalu besar.',413);try{return JSON.parse(raw);}catch{throw new ApiError('JSON tidak valid.');}}
export async function snapshot(member:Member){
 const db=database();const [s,h,p,m,b]=await db.batch([db.prepare('SELECT key,quantity,revision FROM stock'),db.prepare('SELECT * FROM history ORDER BY occurred_at DESC,id DESC LIMIT 500'),db.prepare('SELECT * FROM settings WHERE id=1'),db.prepare(accountsEnabled&&member.role==='admin'?'SELECT id,email,name,role,active FROM members ORDER BY name':'SELECT id FROM members WHERE 0'),db.prepare(!accountsEnabled||member.role==='admin'?'SELECT id,created_at,actor FROM backups ORDER BY created_at DESC LIMIT 20':'SELECT id FROM backups WHERE 0')]);
 const stock:Record<string,{quantity:number;revision:number}>=Object.fromEntries(allKeys.map(k=>[k,{quantity:0,revision:0}]));for(const row of s.results as any[])stock[row.key]={quantity:row.quantity,revision:row.revision};const prefs=p.results[0] as any;return {stock,history:h.results,lowLimit:prefs?.low_limit??5,revision:prefs?.revision??0,accessMode:accountsEnabled?'accounts':'shared',member,members:m.results,backups:b.results};
}
export async function fullBackup(member:Member){
 inventoryEditor(member);const db=database();const [balances,history,prefs]=await db.batch([db.prepare('SELECT key,quantity FROM stock'),db.prepare('SELECT * FROM history ORDER BY occurred_at DESC,id DESC'),db.prepare('SELECT low_limit,revision FROM settings WHERE id=1')]);
 const stock:Record<string,number>=Object.fromEntries(allKeys.map(k=>[k,0]));for(const row of balances.results as {key:string;quantity:number}[])stock[row.key]=row.quantity;
 return {schemaVersion:2,exportedAt:new Date().toISOString(),stock,history:history.results,lowLimit:(prefs.results[0] as any)?.low_limit??5,revision:(prefs.results[0] as any)?.revision??0};
}
function required(value:unknown,label:string,max=200){if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new ApiError(`${label} wajib diisi (maksimal ${max} karakter).`);return value.trim();}
function selectedStaff(data:any){const name=required(data.staffName,'Staff',100);if(!staffNames.some(staff=>staff===name))throw new ApiError('Pilih Staff dari daftar yang tersedia.');return name;}
export async function movement(member:Member,data:any){
 if(data.items!==undefined)return purchase(member,data);
 const db=database();validateKey(data.key);const id=required(data.id,'ID permintaan',100);const prior=await db.prepare('SELECT actor_id FROM history WHERE id=?').bind(id).first<{actor_id:string}>();if(prior){if(prior.actor_id!==member.id)throw new ApiError('ID permintaan sudah digunakan.',409);return {replayed:true};}
 const action=data.action;if(!['Masuk','Keluar','Penyesuaian'].includes(action))throw new ApiError('Jenis perubahan tidak valid.');if(action==='Penyesuaian')inventoryEditor(member);if(action==='Masuk'&&data.key.split('|')[1]!=='Baru')throw new ApiError('Penerimaan baru harus memakai sistem ukuran Baru.');
 const current=await db.prepare('SELECT quantity,revision FROM stock WHERE key=?').bind(data.key).first<{quantity:number;revision:number}>();const before=current?.quantity??0,revision=current?.revision??0;if(data.revision!==revision)throw new ApiError('Stok berubah oleh petugas lain. Muat ulang dan periksa jumlah terbaru.',409);
 validateQuantity(data.quantity);if(action!=='Penyesuaian'&&data.quantity===0)throw new ApiError('Jumlah harus lebih dari 0.');if(action==='Keluar'&&data.quantity>before)throw new ApiError(`Stok tidak cukup. Tersedia ${before} pcs.`,409);
 const staff=action==='Penyesuaian'?'':selectedStaff(data);
 const after=action==='Penyesuaian'?data.quantity:before+(action==='Masuk'?data.quantity:-data.quantity);validateQuantity(after);
 const note=action==='Penyesuaian'?required(data.note,'Alasan penyesuaian',1000):String(data.note??'').slice(0,1000);const student=action==='Keluar'?required(data.studentName,'Nama siswa'):'';const cls=action==='Keluar'?required(data.studentClass,'Kelas',50):'';
 const date=data.date??localDate();if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||date>localDate())throw new ApiError('Tanggal tidak valid atau berada di masa depan.');const now=new Date().toISOString();
 const result=await db.batch([
  db.prepare('INSERT OR IGNORE INTO stock (key,quantity,revision) VALUES (?,0,0)').bind(data.key),
  db.prepare('UPDATE stock SET quantity=?,revision=revision+1,last_change=? WHERE key=? AND revision=?').bind(after,id,data.key,revision),
  db.prepare('INSERT OR IGNORE INTO history (id,key,action,actor_id,actor,occurred_at,date,before_qty,after_qty,delta,student_name,student_class,staff_name,note,source) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? FROM stock WHERE key=? AND last_change=?').bind(id,data.key,action,member.id,member.name,now,date,before,after,after-before,student,cls,staff,note,'app',data.key,id),
  db.prepare('UPDATE settings SET revision=revision+1 WHERE id=1 AND EXISTS (SELECT 1 FROM history WHERE id=?)').bind(id),
 ]);if(!result[2].meta.changes)throw new ApiError('Stok berubah oleh petugas lain. Muat ulang sebelum menyimpan.',409);return {id,before,after};
}
async function purchase(member:Member,data:any){
 const db=database(),id=required(data.id,'ID permintaan',100);
 const prior=await db.prepare('SELECT actor_id FROM history WHERE id=?').bind(id).first<{actor_id:string}>();
 if(prior){if(prior.actor_id!==member.id)throw new ApiError('ID permintaan sudah digunakan.',409);return {replayed:true};}
 if(data.action!=='Keluar'||!Array.isArray(data.items)||!data.items.length||data.items.length>10)throw new ApiError('Pembelian harus berisi 1–10 jenis seragam.');
 const student=required(data.studentName,'Nama siswa'),cls=required(data.studentClass,'Kelas',50),note=String(data.note??'').slice(0,1000);
 const date=data.date??localDate();if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||date>localDate())throw new ApiError('Tanggal tidak valid atau berada di masa depan.');
 const seen=new Set<string>(),lines:{key:string;quantity:number;before:number;revision:number}[]=[];
 for(const item of data.items){
  validateKey(item.key);validateQuantity(item.quantity);if(!item.quantity)throw new ApiError('Jumlah harus lebih dari 0.');
  if(seen.has(item.key))throw new ApiError('Seragam dengan sistem ukuran dan ukuran yang sama cukup dicatat sekali. Gabungkan jumlahnya.');seen.add(item.key);
  const current=await db.prepare('SELECT quantity,revision FROM stock WHERE key=?').bind(item.key).first<{quantity:number;revision:number}>();
  const before=current?.quantity??0,revision=current?.revision??0;
  if(item.revision!==revision)throw new ApiError('Stok berubah oleh petugas lain. Muat ulang dan periksa jumlah terbaru.',409);
  if(item.quantity>before)throw new ApiError(`Stok tidak cukup untuk seragam ${lines.length+1}. Tersedia ${before} pcs.`,409);
  lines.push({key:item.key,quantity:item.quantity,before,revision});
 }
 const staff=selectedStaff(data),now=new Date().toISOString(),statements=[];
 lines.forEach((line,index)=>{
  const lineId=index===0?id:`${id}:${index}`;
  // A revision conflict violates the stock guard, rolling back the entire batch.
  statements.push(db.prepare('UPDATE stock SET quantity=CASE WHEN revision=? THEN quantity-? ELSE -1 END,revision=revision+1,last_change=? WHERE key=?').bind(line.revision,line.quantity,lineId,line.key));
  statements.push(db.prepare('INSERT INTO history (id,key,action,actor_id,actor,occurred_at,date,before_qty,after_qty,delta,student_name,student_class,staff_name,note,source) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(lineId,line.key,'Keluar',member.id,member.name,now,date,line.before,line.before-line.quantity,-line.quantity,student,cls,staff,note,'app'));
 });
 statements.push(db.prepare('UPDATE settings SET revision=revision+1 WHERE id=1'));
 try{await db.batch(statements);}catch(error){
  const prior=await db.prepare('SELECT actor_id FROM history WHERE id=?').bind(id).first<{actor_id:string}>();
  if(prior?.actor_id===member.id)return {replayed:true};
  if(String(error).includes('invalid stock quantity'))throw new ApiError('Stok berubah oleh petugas lain. Muat ulang sebelum menyimpan.',409);
  throw error;
 }
 return {id,items:lines.length,quantity:lines.reduce((total,line)=>total+line.quantity,0)};
}
export async function changeMember(member:Member,data:any){
 if(!accountsEnabled)throw new ApiError('Pengelolaan akun dinonaktifkan sementara.',404);
 admin(member);const db=database();const email=required(data.email,'Email',254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new ApiError('Alamat email tidak valid.');const name=required(data.name,'Nama petugas',100);if(!['admin','staff'].includes(data.role))throw new ApiError('Peran tidak valid.');const active=data.active===0?0:1;const existing=await db.prepare('SELECT * FROM members WHERE email=?').bind(email).first<Member>();if(existing?.id===member.id&&(!active||data.role!=='admin'))throw new ApiError('Anda tidak dapat mencabut akses administrator sendiri.');const id=existing?.id??crypto.randomUUID();
 await db.batch([db.prepare('INSERT INTO members (id,email,name,role,active) VALUES (?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,role=excluded.role,active=excluded.active').bind(id,email,name,data.role,active),db.prepare("INSERT INTO history (id,action,actor_id,actor,occurred_at,date,note) VALUES (?,'Akses petugas',?,?,?,?,?)").bind(crypto.randomUUID(),member.id,member.name,new Date().toISOString(),localDate(),`${name} (${email}) · ${data.role} · ${active?'aktif':'nonaktif'}`)]);return {id};
}
export async function importStock(member:Member,data:any){
 inventoryEditor(member);const db=database();const id=required(data.id,'ID permintaan',100);if(await db.prepare('SELECT id FROM history WHERE id=?').bind(id).first())return {replayed:true};if(!Array.isArray(data.rows)||!data.rows.length||data.rows.length>allKeys.length)throw new ApiError(`Impor harus berisi 1–${allKeys.length} kombinasi stok.`);if(!['set','add'].includes(data.mode))throw new ApiError('Mode impor tidak valid.');
 const seen=new Set<string>();for(const row of data.rows){validateKey(row.key);validateQuantity(row.quantity);if(seen.has(row.key))throw new ApiError('Kombinasi seragam/ukuran duplikat.');seen.add(row.key);}const state=await snapshot(member);if(data.revision!==state.revision)throw new ApiError('Data berubah sejak pratinjau. Buat pratinjau kembali.',409);const now=new Date().toISOString();const backup=await fullBackup(member);const guard=crypto.randomUUID();
 const statements=[db.prepare('INSERT INTO backups (id,created_at,actor,data) SELECT CASE WHEN revision=? THEN ? ELSE NULL END,?,?,? FROM settings WHERE id=1').bind(data.revision,guard,now,member.name,JSON.stringify(backup))];
 // Twenty rows per statement stay well within SQLite's parameter limits.
 for(let offset=0;offset<data.rows.length;offset+=20){const chunk=data.rows.slice(offset,offset+20);const parameters:unknown[]=[];for(const row of chunk){const after=data.mode==='add'?state.stock[row.key].quantity+row.quantity:row.quantity;validateQuantity(after);parameters.push(row.key,after,id);}statements.push(db.prepare(`INSERT INTO stock (key,quantity,revision,last_change) VALUES ${chunk.map(()=>'(?,?,1,?)').join(',')} ON CONFLICT(key) DO UPDATE SET quantity=excluded.quantity,revision=stock.revision+1,last_change=excluded.last_change`).bind(...parameters));}
 const total=data.rows.reduce((sum:number,row:any)=>sum+row.quantity,0);statements.push(db.prepare("INSERT INTO history (id,action,actor_id,actor,occurred_at,date,note,source) VALUES (?,'Impor stok',?,?,?,?,?,'import')").bind(id,member.id,member.name,now,localDate(),`${data.rows.length} kombinasi · ${total} pcs · ${data.mode==='add'?'ditambahkan':'mengganti hanya kombinasi dalam berkas'} · ${String(data.filename??'Berkas').slice(0,200)} · cadangan ${guard}`));
 statements.push(db.prepare("INSERT INTO history (id,action,actor_id,actor,occurred_at,date,note,source) VALUES (?,'Rincian impor',?,?,?,?,?,'import')").bind(`${id}:details`,member.id,member.name,now,localDate(),JSON.stringify(data.rows.map((r:any)=>({key:r.key,before:state.stock[r.key].quantity,after:data.mode==='add'?state.stock[r.key].quantity+r.quantity:r.quantity})))));
 if(Array.isArray(data.legacyHistory)&&data.legacyHistory.length){statements.push(db.prepare('INSERT INTO backups (id,created_at,actor,data) VALUES (?,?,?,?)').bind(`source:${guard}`,now,member.name,JSON.stringify({schemaVersion:2,source:'imported-archive',stock:Object.fromEntries(data.rows.map((r:any)=>[r.key,r.quantity])),history:data.legacyHistory,lowLimit:data.lowLimit??state.lowLimit})));}
 statements.push(db.prepare('UPDATE settings SET revision=revision+1 WHERE id=1'));try{await db.batch(statements);}catch(error){if(String(error).includes('NOT NULL'))throw new ApiError('Data berubah saat impor. Buat pratinjau kembali.',409);throw error;}return {imported:data.rows.length,backupId:guard};
}
