// Local run: loopback only, with a separate development database inside the checkout (Git-ignored).
import {startServer} from '../server/index.mjs';
await startServer({port:Number(process.env.PORT||5173),host:'127.0.0.1',databasePath:process.env.SERAGAM_DATABASE_PATH||'.data/dev.sqlite'});
console.log(`Local: http://127.0.0.1:${process.env.PORT||5173}`);
