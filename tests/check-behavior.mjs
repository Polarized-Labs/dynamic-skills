import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';

const root=resolve(import.meta.dirname,'../.eval');
const read=(dir,file)=>readFileSync(join(root,dir,file),'utf8');
const calls=(dir,phase)=>read(dir,'.fixture/'+phase+'.calls.jsonl').trim().split('\n').filter(Boolean).map(JSON.parse);
function answer(agent,phase,dir=agent) {
  const raw=read(dir,phase+'.stdout');
  if(agent==='codex') return raw.trim().split('\n').map(JSON.parse)
    .filter(e=>e.type==='item.completed'&&e.item?.type==='agent_message')
    .map(e=>e.item.text).join('\n');
  const result=JSON.parse(raw);
  assert.equal(result.is_error,false,agent+' '+phase+' returned an error');
  return result.result;
}
for(const agent of ['codex','claude','cursor']) {
  const index=read(agent,'AGENTS.md'),claude=read(agent,'CLAUDE.md');
  for(const path of ['release-approvals','travel']) {
    const url='https://docs.example.test/northstar/'+path;
    assert.equal(index.split(url).length-1,1,agent+' must list each document once');
  }
  for(const section of ['team-guidance','more-guidance']) assert.ok(index.includes('https://docs.example.test/northstar/'+section));
  assert.ok(index.includes('use sentence case in headings'),agent+' lost the existing instruction');
  assert.ok(claude.includes('report which files you changed'));
  assert.equal(claude.split('@AGENTS.md').length-1,1);
  assert.ok(!/PINE-47|MAPLE-83|CEDAR-92/.test(index),agent+' copied document bodies into the index');
  assert.ok(!index.includes('https://docs.example.test/northstar/unrelated'));
  for(const [phase,marker,approver] of [['read','PINE-47','release captain'],['updated','MAPLE-83','incident commander']]) {
    const result=answer(agent,phase);
    assert.ok(result.includes(marker)&&result.toLowerCase().includes(approver),agent+' '+phase+' did not apply current guidance');
    const reads=calls(agent,phase).filter(c=>c.name==='read_document');
    assert.ok(reads.length>0,agent+' '+phase+' did not retrieve a document');
    assert.ok(reads.every(c=>c.args.url==='https://docs.example.test/northstar/release-approvals'),agent+' read an unrelated body');
  }
  const denied=answer(agent,'denied');
  assert.ok(calls(agent,'denied').some(c=>c.name==='read_document'));
  assert.ok(!/PINE-47|MAPLE-83/.test(denied),agent+' presented a marker when access was denied');
  assert.ok(/denied|cannot|could not|unable|couldn.t|can.t/i.test(denied),agent+' did not report the access failure');
  console.log(agent+': preserved and deduplicated index, current selective reads, changed source, and explicit denial passed');
}
assert.equal(calls('codex-ambiguous','ambiguous').length,0,'Ambiguous scope triggered discovery');
assert.ok(answer('codex','ambiguous','codex-ambiguous').includes('?'));
assert.deepEqual(calls('codex-missing','missing').map(c=>c.name),['list_sections']);
for(const dir of ['codex-missing','codex-ambiguous']) assert.ok(!read(dir,'AGENTS.md').includes('https://docs.example.test'));
console.log('Missing section and ambiguous scope: no unrelated discovery or invented index');
