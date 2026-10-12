declare module 'virtual:site-assets'{export const assets:Record<string,{body:string;type:string;base64?:boolean}>;export const html:string;}
declare module '*.png'{const url:string;export default url;}
