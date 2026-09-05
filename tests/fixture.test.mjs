import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const fixture=new URL('./fixture.mjs',import.meta.url);
const base=JSON.parse(readFileSync(new URL('./source.json',import.meta.url)));
function invoke(state,name,args) {
 const dir=mkdtempSync(join(tmpdir(),'guidance-contract-'));
 const path=join(dir,'state.json');writeFileSync(path,JSON.stringify(state));
 const p=spawnSync(process.execPath,[fixture.pathname,path],{input:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})+'\n',encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout).result;
}
test('discovery includes mixed-case matching sections and unrelated control',()=>{
 const data=JSON.parse(invoke(base,'list_sections',{team:'Northstar'}).content[0].text);
 assert.equal(data.filter(s=>s.name.toLowerCase()==='playbooks and references').length,2);
});
test('document listing exposes routing metadata without body',()=>{
 const data=JSON.parse(invoke(base,'list_documents',{section_id:'team-guidance'}).content[0].text);
 assert.equal(data.length,2);assert.ok(data.every(d=>!('body' in d)));
});
test('reads reflect the current source, not a cached snapshot',()=>{
 const url=base.documents.releases.url;
 const first=invoke(base,'read_document',{url});
 const next=structuredClone(base);next.documents.releases.body='Approval marker MAPLE-83.';
 const second=invoke(next,'read_document',{url});
 assert.match(first.content[0].text,/PINE-47/);assert.match(second.content[0].text,/MAPLE-83/);
});
test('access failure is an error, not an empty catalog',()=>{
 const state={...base,unavailable:true};
 assert.equal(invoke(state,'list_sections',{team:'Northstar'}).isError,true);
});
test('document denial is explicit',()=>{
 assert.equal(invoke({...base,denied:['releases']},'read_document',{url:base.documents.releases.url}).isError,true);
});
