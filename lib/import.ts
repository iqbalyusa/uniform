import { uniforms,stockKey,validateKey,validateQuantity,sizes } from './catalog';
export type ImportRow={key:string;quantity:number;row:number};
export type Sheet={name:string;rows:string[][]};
export function parseCsv(text:string):string[][]{
 const delimiter=text.split(/\r?\n/)[0].includes(';')?';':',';const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===delimiter&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new Error('Tanda kutip CSV tidak ditutup.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
export function previewRows(rows:string[][],mapping:{name:number;version:number;size:number;quantity:number;fixedVersion:string;layout:string;header:number}){
 const output:ImportRow[]=[],errors:string[]=[],seen=new Set<string>();const normalize=(s:string)=>String(s??'').trim().replace(/\s+/g,' ').toLowerCase();
 function add(name:string,version:string,size:string,qty:string,row:number){
  try{const i=uniforms.findIndex(u=>normalize(u[0])===normalize(name));if(i<0)throw new Error(`Nama seragam tidak dikenal: ${name||'(kosong)'}`);const v=normalize(version)==='lama'?'Lama':normalize(version)==='baru'?'Baru':'';if(!v)throw new Error('Versi harus Lama atau Baru; pilih versi secara eksplisit.');const key=stockKey(i,v,String(size).trim());validateKey(key);if(String(qty).trim()==='')throw new Error('Jumlah kosong.');const quantity=Number(qty);validateQuantity(quantity);if(seen.has(key))throw new Error(`Duplikat ${name} · ${v} ${size}`);seen.add(key);output.push({key,quantity,row});}catch(e){errors.push(`Baris ${row}: ${(e as Error).message}`);}
 }
 const header=rows[mapping.header]??[];
 rows.slice(mapping.header+1).forEach((r,i)=>{if(!r.some(x=>String(x).trim()))return;const line=mapping.header+i+2;const version=mapping.version>=0?r[mapping.version]:mapping.fixedVersion;
  if(mapping.layout==='matrix'){const valid=sizes(version);let columns=0;header.forEach((h,c)=>{if(c!==mapping.name&&c!==mapping.version&&valid.includes(String(h).trim())){columns++;if(r[c]!==undefined&&String(r[c]).trim()!=='')add(r[mapping.name],version,h,r[c],line);}});if(!columns)errors.push(`Baris ${line}: tidak ada kolom ukuran sesuai versi ${version||'(belum dipilih)'}.`);}
  else add(r[mapping.name],version,r[mapping.size],r[mapping.quantity],line);
 });
 if(!output.length&&!errors.length)errors.push('Tidak ada baris stok yang dapat diimpor.');return {rows:output,errors};
}
export function previewJson(data:any){
 if(!data||typeof data.stock!=='object'||Array.isArray(data.stock))throw new Error('Berkas harus berisi objek stock dari cadangan aplikasi.');
 const rows:ImportRow[]=[],errors:string[]=[];Object.entries(data.stock).forEach(([key,v],i)=>{try{validateKey(key);const quantity=typeof v==='object'&&v!==null?(v as any).quantity:v;validateQuantity(quantity);rows.push({key,quantity,row:i+1});}catch(e){errors.push(`Kunci ${key}: ${(e as Error).message}`);}});if(!rows.length)errors.push('Tidak ada stok di dalam cadangan.');return {rows,errors,legacyHistory:Array.isArray(data.history)?data.history:[],lowLimit:data.lowLimit};
}
export async function readSheets(file:File):Promise<Sheet[]>{
 if(file.size>5*1024*1024)throw new Error('Ukuran berkas maksimal 5 MB.');if(/\.csv$/i.test(file.name))return [{name:'CSV',rows:parseCsv((await file.text()).replace(/^\uFEFF/,''))}];
 if(!/\.xlsx$/i.test(file.name))throw new Error('Gunakan Excel .xlsx, CSV, atau cadangan JSON.');const module=await import('exceljs');const Excel=module.default??module;const workbook=new Excel.Workbook();await workbook.xlsx.load(await file.arrayBuffer());
 return workbook.worksheets.map(sheet=>{const rows:string[][]=[];sheet.eachRow({includeEmpty:true},row=>{const cells:string[]=[];for(let i=1;i<=sheet.columnCount;i++){const cell=row.getCell(i);const value=cell.value;if(typeof value==='object'&&value&&'formula' in value&&value.result===undefined)throw new Error(`Rumus ${sheet.name}!${cell.address} belum memiliki hasil tersimpan. Buka dan simpan berkas di Excel terlebih dahulu.`);cells.push(cell.text);}rows.push(cells);});return {name:sheet.name,rows};});
}
