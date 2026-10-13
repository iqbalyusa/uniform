// esbuild's file loader turns imported images into their public URL.
declare module '*.png'{const url:string;export default url;}
