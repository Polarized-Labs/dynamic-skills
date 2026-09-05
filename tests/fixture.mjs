import { createInterface } from 'node:readline';
import { readFileSync, appendFileSync } from 'node:fs';

const [statePath, logPath] = process.argv.slice(2);
const tools = [
  {name:'list_sections',description:'List sections in a selected collaboration workspace and team.',inputSchema:{type:'object',properties:{team:{type:'string'}},required:['team']}},
  {name:'list_documents',description:'List document titles, descriptions, IDs and URLs in a section. Does not read document bodies.',inputSchema:{type:'object',properties:{section_id:{type:'string'}},required:['section_id']}},
  {name:'read_document',description:'Read the current body of a collaboration document by its verified URL.',inputSchema:{type:'object',properties:{url:{type:'string'}},required:['url']}}
];
function call(name,args) {
  const state=JSON.parse(readFileSync(statePath,'utf8'));
  if(logPath) appendFileSync(logPath,JSON.stringify({name,args})+'\n');
  if(state.unavailable) return {content:[{type:'text',text:'Access unavailable: collaboration connector is not authenticated.'}],isError:true};
  let value;
  if(name==='list_sections') {
    if(args.team!=='Northstar') throw new Error('Unknown or ambiguous team; select Northstar.');
    value=state.sections;
  } else if(name==='list_documents') {
    const section=state.sections.find(s=>s.id===args.section_id);
    if(!section) throw new Error('Section not found.');
    value=section.documents.map(id=>{const {body,...metadata}=state.documents[id];return metadata;});
  } else if(name==='read_document') {
    value=Object.values(state.documents).find(d=>d.url===args.url);
    if(!value) throw new Error('Document not found.');
    if(state.denied?.includes(value.id)) return {content:[{type:'text',text:'Access denied to '+value.url}],isError:true};
  } else throw new Error('Unknown tool');
  return {content:[{type:'text',text:JSON.stringify(value)}]};
}
for await (const line of createInterface({input:process.stdin})) {
  let req;
  try {
    req=JSON.parse(line);
    if(req.id===undefined) continue;
    let result;
    if(req.method==='initialize') result={protocolVersion:req.params?.protocolVersion??'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'synthetic-collaboration',version:'1.0.0'}};
    else if(req.method==='tools/list') result={tools:tools.map(tool=>({...tool,annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}}))};
    else if(req.method==='tools/call') result=call(req.params.name,req.params.arguments??{});
    else if(req.method==='ping') result={};
    else {process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:req.id,error:{code:-32601,message:'Method not found'}})+'\n');continue;}
    process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:req.id,result})+'\n');
  } catch(e) {
    if(req?.id!==undefined) process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:req.id,error:{code:-32602,message:e.message}})+'\n');
  }
}
