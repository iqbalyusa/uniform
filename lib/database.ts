// Minimal statement interface implemented by the SQLite adapter in server/database.mjs.
export type Result<T=Record<string,unknown>>={results:T[];meta:{changes:number}};
export interface Statement{
 bind(...values:unknown[]):Statement;
 first<T=Record<string,unknown>>():Promise<T|null>;
 all<T=Record<string,unknown>>():Promise<Result<T>>;
 run():Promise<Result>;
}
export interface Database{
 prepare(sql:string):Statement;
 // Runs every statement in one transaction; any failure rolls back the whole batch.
 batch<T=Record<string,unknown>>(statements:Statement[]):Promise<Result<T>[]>;
}
let current:Database|undefined;
export function setDatabase(db:Database){current=db;}
export function getDatabase(){return current;}
