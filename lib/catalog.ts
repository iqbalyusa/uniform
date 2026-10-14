export const staffNames=['Anna Ratna Ningsih','Afro Mutmainah','Rahmawati'] as const;
export const uniforms = [
 ['Kemeja Nasional SD Putra','Nasional','SD'],['Kemeja Nasional SD Putri','Nasional','SD'],['Celana Nasional SD','Nasional','SD'],['Rok Nasional SD','Nasional','SD'],
 ['Kemeja Nasional SMP Putra','Nasional','SMP'],['Kemeja Nasional SMP Putri','Nasional','SMP'],['Celana Nasional SMP','Nasional','SMP'],['Rok Nasional SMP','Nasional','SMP'],
 ['Kemeja Nasional SMA Putra','Nasional','SMA'],['Kemeja Nasional SMA Putri','Nasional','SMA'],['Celana Nasional SMA','Nasional','SMA'],['Rok Nasional SMA','Nasional','SMA'],
 ['Polo Shirt PUTIH Panjang','Umum','Bersama'],['Polo Shirt MERAH Panjang','Umum','Bersama'],['Kaos Sport Panjang','Umum','Bersama'],['Rok Kotak','Umum','Bersama'],['Polo Shirt PUTIH Pendek','Umum','Bersama'],['Polo Shirt MERAH Pendek','Umum','Bersama'],['Kaos Sport Pendek','Umum','Bersama'],['Celana Cream','Umum','Bersama'],['Celana Training Sport','Umum','Bersama'],
] as const;
export const oldSizes=['0',...Array.from({length:15},(_,i)=>`${i*2+1}-${i*2+2}`)];
export const newSizes=Array.from({length:16},(_,i)=>String(i));
export const sizes=(v:string)=>v==='Lama'?oldSizes:newSizes;
export const stockKey=(i:number,v:string,s:string)=>`${i}|${v}|${s}`;
export const allKeys=uniforms.flatMap((_,i)=>['Lama','Baru'].flatMap(v=>sizes(v).map(s=>stockKey(i,v,s))));
const validKeys=new Set(allKeys);
export function validateKey(key:unknown):asserts key is string{if(typeof key!=='string'||!validKeys.has(key))throw new Error('Seragam, versi, atau ukuran tidak valid.');}
export function validateQuantity(n:unknown):asserts n is number{if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0||n>1000000)throw new Error('Jumlah harus bilangan bulat antara 0 dan 1.000.000.');}
export const itemForKey=(key:string)=>uniforms[Number(key.split('|')[0])];
export function localDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export type Balance={quantity:number;revision:number};
export type Member={id:string;email:string;name:string;role:'admin'|'staff'|'shared';active:number;user_id?:string|null};
export type Activity={id:string;key:string|null;action:string;actor:string;actor_id:string;occurred_at:string;date:string;before_qty:number|null;after_qty:number|null;delta:number|null;student_name:string;student_class:string;staff_name?:string;note:string;source:string;edited_at?:string|null;edit_log?:string};
export type Snapshot={stock:Record<string,Balance>;history:Activity[];lowLimit:number;revision:number;accessMode:'accounts'|'shared';member:Member;members:Member[];backups:{id:string;created_at:string;actor:string}[]};
