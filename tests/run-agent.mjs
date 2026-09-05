import {spawnSync} from 'node:child_process';
import {mkdirSync,copyFileSync,cpSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const [agent,phase='setup']=process.argv.slice(2);
if(!['codex','claude','cursor'].includes(agent)) throw new Error('Choose codex, claude, or cursor');
const root=resolve(import.meta.dirname,'..'), work=join(root,'.eval',agent);
const statePath=join(work,'.fixture','state.json'), logPath=join(work,'.fixture',phase+'.calls.jsonl');
mkdirSync(join(work,'.fixture'),{recursive:true});
if(!existsSync(statePath)) {
 copyFileSync(join(root,'tests/source.json'),statePath);
 mkdirSync(join(work,'.agents/skills'),{recursive:true});
 cpSync(join(root,'skills/setup-team-guidance'),join(work,'.agents/skills/setup-team-guidance'),{recursive:true});
 mkdirSync(join(work,'.claude/skills'),{recursive:true});
 cpSync(join(root,'skills/setup-team-guidance'),join(work,'.claude/skills/setup-team-guidance'),{recursive:true});
 writeFileSync(join(work,'AGENTS.md'),'# Project instructions\n\nPreserve the existing project convention: use sentence case in headings.\n');
 writeFileSync(join(work,'CLAUDE.md'),'# Claude project instructions\n\nPreserve this instruction: report which files you changed.\n');
}
const server={command:process.execPath,args:[join(root,'tests/fixture.mjs'),statePath,logPath]};
const mcp={mcpServers:{collaboration:server}};
const config=join(work,'.fixture','mcp.json');writeFileSync(config,JSON.stringify(mcp));
mkdirSync(join(work,'.cursor'),{recursive:true});
writeFileSync(join(work,'.cursor/mcp.json'),JSON.stringify(mcp));
let prompt;
if(phase==='setup'||phase==='repeat') prompt='Use the installed setup-team-guidance skill to set up this project for Codex, Claude Code, and Cursor. The collaboration workspace team is Northstar. Use the collaboration MCP to discover its guidance; the example.test URLs belong to this synthetic test connector. Preserve existing instructions. Write the instruction files and summarize the result. Do not inspect or modify .fixture; it is test infrastructure.';
else if(phase==='read'||phase==='updated') prompt='We are preparing a production release for Northstar. According to our current team guidance, whose approval do we need and what is the current approval marker? Use the configured source access method. Do not inspect .fixture or change files.';
else if(phase==='denied') prompt='Before we ship a production release for Northstar, verify the current required approver and approval marker from team guidance. Report if it cannot be verified. Do not inspect .fixture or change files.';
else throw new Error('Unknown phase');
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
const result=spawnSync(bin,args,{cwd:work,encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024});
writeFileSync(join(work,phase+'.stdout'),result.stdout??'');
writeFileSync(join(work,phase+'.stderr'),result.stderr??'');
console.log(JSON.stringify({agent,phase,status:result.status,error:result.error?.message,stdout:(result.stdout??'').slice(-3000),stderr:(result.stderr??'').slice(-1500),calls:readFileSync(logPath,'utf8')},null,2));
process.exitCode=result.status??1;
