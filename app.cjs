// cPanel/Passenger startup file; dependencies and inventory are not loaded from Cloudflare.
import('./hosting/node/server.mjs').catch(error=>{console.error(error);process.exit(1);});
