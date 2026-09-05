import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const [target,source]=process.argv.slice(2).map(p=>resolve(p));
for(const root of ['.agents/skills','.claude/skills']) {
 for(const file of ['SKILL.md','agents/openai.yaml']) {
  assert.equal(readFileSync(join(target,root,'setup-team-guidance',file),'utf8'),readFileSync(join(source,'skills/setup-team-guidance',file),'utf8'),root+'/'+file+' differs');
 }
}
console.log('Installed skill and metadata match the source in shared Codex/Cursor and Claude Code locations.');
