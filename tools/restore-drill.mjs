/* Synthetic restore drill (ORI-SEC-006). Restores a `wrangler d1 export` file into a fresh local SQLite database, checks
   integrity and foreign keys, applies the current additive migrations on top (twice, to prove they are idempotent),
   and compares per-table row counts with counts taken from the live database. Prints counts only, never row contents.
   Usage:
     node --experimental-sqlite tools/restore-drill.mjs counts-sql            → the SQL to run against the live database
     node --experimental-sqlite tools/restore-drill.mjs <export.sql> <live-counts.json> */
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const MIGRATIONS=['workers/accounts/feedback.sql','workers/accounts/platform-audit.sql'];
const [a,b]=process.argv.slice(2);
if(a==='counts-sql'){console.log("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name");process.exit(0)}
const db=new DatabaseSync(':memory:');const t0=Date.now();
// Load as D1 exports do (foreign keys not enforced while loading), then check every reference explicitly below.
db.exec('PRAGMA foreign_keys=OFF');db.exec(fs.readFileSync(a,'utf8').replace(/PRAGMA\s+foreign_keys\s*=\s*(ON|1|TRUE)\s*;/gi,''));const restoreMs=Date.now()-t0;
const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").all().map(r=>r.name);
const counts=Object.fromEntries(tables.map(n=>[n,db.prepare('SELECT COUNT(*) AS n FROM "'+n.replace(/"/g,'""')+'"').get().n]));
const integrity=db.prepare('PRAGMA integrity_check').get().integrity_check;
db.exec('PRAGMA foreign_keys=ON');const fk=db.prepare('PRAGMA foreign_key_check').all().length;
for(const pass of [1,2])for(const m of MIGRATIONS)db.exec(fs.readFileSync(m,'utf8'));
const after=Object.fromEntries(tables.map(n=>[n,db.prepare('SELECT COUNT(*) AS n FROM "'+n.replace(/"/g,'""')+'"').get().n]));
const live=b?JSON.parse(fs.readFileSync(b,'utf8')):null;
const mismatches=live?Object.keys({...live,...counts}).filter(k=>live[k]!==counts[k]):null;
const report={ranAt:new Date().toISOString(),tables:tables.length,restoreMs,integrity,foreignKeyViolations:fk,counts,
 migrationsReapplied:MIGRATIONS,migrationsChangedRows:tables.filter(n=>after[n]!==counts[n]),liveCompared:!!live,mismatches};
console.log(JSON.stringify(report,null,1));
if(integrity!=='ok'||fk||report.migrationsChangedRows.length||(mismatches&&mismatches.length))process.exit(1);
