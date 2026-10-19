// node tests/run-parity.mjs : checks index.html's demos against tests/fixtures/v82-computed.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.dirname(here);
const real=readFileSync(path.join(here,'fixtures/v82-computed.json'),'utf8'),map=readFileSync(path.join(here,'parity-map.json'),'utf8');
mkdirSync(path.join(here,'out'),{recursive:true});const tmp=path.join(here,'out','_parity-run.js');
writeFileSync(tmp,`window.__REAL=${real};window.__MAP=${map};\n`+readFileSync(path.join(here,'parity.js'),'utf8'));
const out=execFileSync('node',[path.join(here,'drive.mjs'),'file://'+path.join(root,'index.html'),tmp],{env:{...process.env,WIN:process.env.WIN||'1512,900'},encoding:'utf8'});
const r=JSON.parse(out);console.log(`checked ${r.checked}, passed ${r.passed}, failed ${r.failed}`);r.fails.forEach(f=>console.log('  '+f));process.exit(r.failed?1:0);
