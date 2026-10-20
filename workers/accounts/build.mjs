import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
await build({absWorkingDir:fileURLToPath(new URL('.',import.meta.url)),entryPoints:['handler.mjs'],outfile:'dist/accounts.mjs',bundle:true,format:'esm',platform:'node',target:'es2022',external:['node:*','cloudflare:email'],minify:true,banner:{js:"import {createRequire as __oriviaCreateRequire} from 'node:module';const require=__oriviaCreateRequire('/orivia-runtime.cjs');"}});
console.log('Built standalone account module; explicit provider settings and database required.');

await build({absWorkingDir:fileURLToPath(new URL('.',import.meta.url)),entryPoints:['notification-job.mjs'],outfile:'dist/notification-job.mjs',bundle:true,format:'esm',platform:'node',target:'es2022',external:['node:*'],minify:true,banner:{js:"import {createRequire as __oriviaCreateRequire} from 'node:module';const require=__oriviaCreateRequire('/orivia-runtime.cjs');"}});
console.log('Built private notification scheduler.');
