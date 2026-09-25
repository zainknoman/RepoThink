import fs from "node:fs/promises";
import path from "node:path";
const root=path.resolve(process.argv[2]||process.cwd());
const ignore=new Set([".git","node_modules","dist","build",".next",".nuxt","coverage"]);
const exts=new Set([".js",".jsx",".ts",".tsx",".vue",".py",".java",".kt",".go",".rs",".php",".cs",".c",".cpp",".h",".sql",".json",".md"]);
const files=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){if(ignore.has(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else if(exts.has(path.extname(e.name).toLowerCase()))files.push(p)}}await walk(root);
const data=await Promise.all(files.map(async p=>{const source=await fs.readFile(p,"utf8"),rel=path.relative(root,p).replaceAll("\\","/");const symbols=[];for(const m of source.matchAll(/\b(?:function|class|interface|type)\s+([A-Za-z_$][\w$]*)|\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g))symbols.push({name:m[1]||m[2],line:source.slice(0,m.index).split(/\r?\n/).length,path:rel});const imports=[...source.matchAll(/(?:import.*?from|require)\s*[("']([^"']+)["']/g)].map(m=>m[1]);return{path:rel,source,symbols,imports,lines:source.split(/\r?\n/).length}}));
const byPath=new Map(data.map(x=>[x.path,x])), resolve=(from,m)=>{if(!m?.startsWith("."))return null;const base=path.posix.dirname(from),raw=path.posix.normalize(path.posix.join(base,m));for(const c of [raw,raw+".js",raw+".ts",raw+".jsx",raw+".tsx",raw+"/index.js",raw+"/index.ts"])if(byPath.has(c))return c;return null};
const deps=data.flatMap(f=>f.imports.map(m=>({from:f.path,module:m,to:resolve(f.path,m)})).filter(x=>x.to));
const toolNames=["repothink.search","repothink.symbol","repothink.definition","repothink.references","repothink.callers","repothink.callees","repothink.dependencies","repothink.impact","repothink.tests","repothink.architecture","repothink.context","repothink.health","repothink.explain"];
const findSymbol=(name,p)=>data.flatMap(f=>f.symbols).find(s=>s.name===name&&(!p||s.path===p));
function result(value){return{content:[{type:"text",text:JSON.stringify(value)}]}}
async function call(name,a){
if(name==="repothink.search"){const q=(a.query||"").toLowerCase();return data.flatMap(f=>[{name:f.path,path:f.path,kind:"file",score:f.path.toLowerCase().includes(q)?1:0},...f.symbols.map(s=>({name:s.name,path:s.path,line:s.line,kind:"symbol",score:s.name.toLowerCase().includes(q)?1:0}))]).filter(x=>x.score).slice(0,a.limit||20)}
if(name==="repothink.symbol"||name==="repothink.definition")return findSymbol(a.name,a.path);
if(name==="repothink.references"){const s=findSymbol(a.name,a.path);if(!s)return[];const re=new RegExp("\\b"+s.name+"\\b","g");return data.flatMap(f=>[...f.source.matchAll(re)].map(m=>({path:f.path,line:f.source.slice(0,m.index).split(/\\r?\\n/).length}))).filter(x=>!(x.path===s.path&&x.line===s.line))}
if(name==="repothink.dependencies")return{dependencies:deps.filter(x=>x.from===a.path),dependents:deps.filter(x=>x.to===a.path)};
if(name==="repothink.callers"||name==="repothink.callees"){const s=findSymbol(a.name,a.path);if(!s)return[];return deps.filter(e=>name.endsWith("callers")?e.to===s.path:e.from===s.path)}
if(name==="repothink.tests")return data.filter(f=>/test|spec|__tests__/i.test(f.path)).map(f=>f.path);
if(name==="repothink.impact")return{path:a.path,dependencies:deps.filter(x=>x.from===a.path),dependents:deps.filter(x=>x.to===a.path),tests:data.filter(f=>/test|spec|__tests__/i.test(f.path)).map(f=>f.path)};
if(name==="repothink.architecture")return{files:data.length,edges:deps.length,modules:[...new Set(data.map(f=>f.path.split("/")[0]))],external:[...new Set(data.flatMap(f=>f.imports).filter(x=>!x.startsWith(".")))]};
if(name==="repothink.context")return(a.files||[]).map(p=>byPath.get(p)?.source).filter(Boolean).join("\n\n");
if(name==="repothink.health")return{files:data.length,unresolvedImports:data.flatMap(f=>f.imports.filter(m=>m.startsWith(".")&&!resolve(f.path,m)).map(module=>({path:f.path,module})))};
if(name==="repothink.explain")return{question:a.question,evidence:await call("repothink.search",{query:a.question,limit:20})};
return null}
async function handle(req){if(req.method==="initialize")return{jsonrpc:"2.0",id:req.id,result:{protocolVersion:"2026-06-18",capabilities:{tools:{}},serverInfo:{name:"repothink",version:"1.0.0"}}};if(req.method==="notifications/initialized")return null;if(req.method==="tools/list")return{jsonrpc:"2.0",id:req.id,result:{tools:toolNames.map(name=>({name,description:"RepoThink repository intelligence tool",inputSchema:{type:"object"}}))}};if(req.method==="tools/call"){try{return{jsonrpc:"2.0",id:req.id,result:result(await call(req.params?.name,req.params?.arguments||{}))}}catch(e){return{jsonrpc:"2.0",id:req.id,result:{isError:true,content:[{type:"text",text:e.message}]}}}}return{jsonrpc:"2.0",id:req.id,error:{code:-32601,message:"Method not found"}}}
let buffer="";process.stdin.setEncoding("utf8");process.stdin.on("data",async chunk=>{buffer+=chunk;const lines=buffer.split("\n");buffer=lines.pop();for(const line of lines.filter(Boolean)){try{const response=await handle(JSON.parse(line));if(response)process.stdout.write(JSON.stringify(response)+"\n")}catch(e){process.stdout.write(JSON.stringify({jsonrpc:"2.0",error:{code:-32700,message:e.message}})+"\n")}}});
