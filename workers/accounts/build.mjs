import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
await build({absWorkingDir:fileURLToPath(new URL('.',import.meta.url)),entryPoints:['handler.mjs'],outfile:'dist/accounts.mjs',bundle:true,format:'esm',platform:'node',target:'es2022',external:['node:*','cloudflare:email'],minify:true});
console.log('Built standalone account module; explicit provider settings and database required.');
