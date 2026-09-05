import {spawnSync} from 'node:child_process';
import {mkdirSync,copyFileSync,cpSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const [agent,phase='setup']=process.argv.slice(2);
if(!['codex','claude','cursor'].includes(agent)) throw new Error('Choose codex, claude, or cursor');
const root=resolve(import.meta.dirname,'..'), work=join(root,'.eval',agent+(['missing','ambiguous'].includes(phase)?'-'+phase:''));
const statePath=join(work,'.fixture','state.json'), logPath=join(work,'.fixture',phase+'.calls.jsonl');
mkdirSync(join(work,'.fixture'),{recursive:true});
if(!existsSync(statePath)) {
 copyFileSync(join(root,'tests/source.json'),statePath);
 mkdirSync(join(work,'.agents/skills'),{recursive:true});
 cpSync(join(root,'skills/dynamic-skills'),join(work,'.agents/skills/dynamic-skills'),{recursive:true});
 mkdirSync(join(work,'.claude/skills'),{recursive:true});
 cpSync(join(root,'skills/dynamic-skills'),join(work,'.claude/skills/dynamic-skills'),{recursive:true});
 writeFileSync(join(work,'AGENTS.md'),'# Project instructions\n\nPreserve the existing project convention: use sentence case in headings.\n');
 writeFileSync(join(work,'CLAUDE.md'),'# Claude project instructions\n\nPreserve this instruction: report which files you changed.\n');
}
const server={command:process.execPath,args:[join(root,'tests/fixture.mjs'),statePath,logPath]};
for(const location of ['.agents/skills','.claude/skills']) cpSync(join(root,'skills/dynamic-skills'),join(work,location,'dynamic-skills'),{recursive:true});
if(agent==='cursor'&&!existsSync(join(work,'.git'))) {
 const init=spawnSync('git',['init',work],{encoding:'utf8'});
 if(init.status!==0) throw new Error(init.stderr);
}
const mcp={mcpServers:{collaboration:server}};
const config=join(work,'.fixture','mcp.json');writeFileSync(config,JSON.stringify(mcp));
mkdirSync(join(work,'.cursor'),{recursive:true});
writeFileSync(join(work,'.cursor/mcp.json'),JSON.stringify(mcp));
if(agent==='cursor') {
 const enabled=spawnSync('agent',['mcp','enable','collaboration'],{cwd:work,encoding:'utf8'});
 if(enabled.status!==0) throw new Error(enabled.stderr||enabled.stdout);
}
let prompt;
if(phase==='setup'||phase==='repeat') prompt='Use the installed dynamic-skills skill to set up this project for Codex, Claude Code, and Cursor. The collaboration workspace team is Northstar. Use the collaboration MCP to discover its guidance; the example.test URLs belong to this synthetic test connector. Preserve existing instructions. Write the instruction files and summarize the result. Do not inspect or modify .fixture; it is test infrastructure.';
else if(phase==='read'||phase==='updated') prompt='We are preparing a production release for Northstar. According to our current team guidance, whose approval do we need and what is the current approval marker? Use the configured source access method. Do not inspect .fixture or change files.';
else if(phase==='denied') prompt='Before we ship a production release for Northstar, verify the current required approver and approval marker from team guidance. Report if it cannot be verified. Do not inspect .fixture or change files.';
else if(phase==='missing') prompt='Use dynamic-skills to set up team guidance for Northstar using the collaboration MCP. Preserve existing instructions. Do not inspect or modify .fixture.';
else if(phase==='ambiguous') prompt='Use dynamic-skills to set up team guidance here. The intended team has not been chosen and this test project does not imply one. Do not inspect or modify .fixture.';
else throw new Error('Unknown phase');
if(phase==='missing') {const state=JSON.parse(readFileSync(statePath));state.sections=state.sections.filter(s=>s.name==='Other documents');writeFileSync(statePath,JSON.stringify(state));}
if(phase==='updated') {const state=JSON.parse(readFileSync(statePath));state.documents.releases.body='Every production release needs approval from the incident commander. The current approval marker is MAPLE-83.';writeFileSync(statePath,JSON.stringify(state));}
if(phase==='denied') {const state=JSON.parse(readFileSync(statePath));state.denied=['releases'];writeFileSync(statePath,JSON.stringify(state));}
writeFileSync(logPath,'');
let bin,args;
if(agent==='codex') {
 bin='codex';args=['exec','--ignore-user-config','--skip-git-repo-check','--ephemeral','--sandbox','workspace-write','--json','-C',work,'-c','mcp_servers.collaboration.command='+JSON.stringify(process.execPath),'-c','mcp_servers.collaboration.args='+JSON.stringify(server.args),...['list_sections','list_documents','read_document'].flatMap(tool=>['-c','mcp_servers.collaboration.tools.'+tool+'.approval_mode="approve"']),prompt];
} else if(agent==='claude') {
 bin='claude';args=['-p','--setting-sources','user,project','--no-session-persistence','--strict-mcp-config','--mcp-config',config,'--permission-mode','acceptEdits','--allowedTools','Read','Write','Edit','Glob','Grep','mcp__collaboration__*','--output-format','json','--',prompt];
} else {
 bin='agent';args=['-p','--auto-review','--sandbox','enabled','--trust','--workspace',work,'--output-format','json',prompt];
}
const version=spawnSync(bin,['--version'],{cwd:work,encoding:'utf8',timeout:10000});
const result=spawnSync(bin,args,{cwd:work,encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024});
writeFileSync(join(work,phase+'.run.json'),JSON.stringify({agent,phase,version:version.stdout?.trim(),checkedAt:new Date().toISOString(),status:result.status},null,2));
writeFileSync(join(work,phase+'.stdout'),result.stdout??'');
writeFileSync(join(work,phase+'.stderr'),result.stderr??'');
for(const file of ['AGENTS.md','CLAUDE.md']) copyFileSync(join(work,file),join(work,phase+'.'+file));
console.log(JSON.stringify({agent,phase,status:result.status,error:result.error?.message,stdout:(result.stdout??'').slice(-3000),stderr:(result.stderr??'').slice(-1500),calls:readFileSync(logPath,'utf8')},null,2));
process.exitCode=result.status??1;
