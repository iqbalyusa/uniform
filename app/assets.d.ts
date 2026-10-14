// esbuild's file loader turns imported images into their public URL.
declare module '*.png'{const url:string;export default url;}
declare module '*.webp'{const url:string;export default url;}
