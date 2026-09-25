const lineAt=(s,i)=>s.slice(0,i).split(/\r?\n/).length;
const has=(index,name)=>{const n=name.toLowerCase();return(index?.project?.frameworks||[]).some(x=>String(x.name).toLowerCase()===n)||(index?.project?.packages||[]).some(x=>String(x.package||x.name||"").toLowerCase().includes(n))};
const routeRules=[
 {framework:"Express",pattern:/\b(?:app|router)\.(get|post|put|patch|delete|options|head|use)\s*\(\s*["']([^"']+)["']/g,method:m=>m[1].toUpperCase(),path:m=>m[2]},
 {framework:"NestJS",pattern:/@(Get|Post|Put|Patch|Delete|All)\s*\(\s*["']?([^"')]+)?["']?\s*\)/g,method:m=>m[1].toUpperCase(),path:m=>m[2]||"/"},
 {framework:"FastAPI",pattern:/@(?:app|router)\.(get|post|put|patch|delete|options)\s*\(\s*["']([^"']+)["']/g,method:m=>m[1].toUpperCase(),path:m=>m[2]},
 {framework:"Flask",pattern:/@(?:app|blueprint)\.route\s*\(\s*["']([^"']+)["']/g,method:()=> "ROUTE",path:m=>m[1]},
 {framework:"Spring",pattern:/@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|RequestMapping)\s*(?:\(\s*["']([^"']+)["'])?/g,method:m=>m[1].replace("Mapping","").toUpperCase(),path:m=>m[2]||"/"},
 {framework:"ASP.NET",pattern:/\[(HttpGet|HttpPost|HttpPut|HttpPatch|HttpDelete|Route)(?:\s*\(\s*["']([^"']+)["'])?/g,method:m=>m[1].replace("Http","").toUpperCase(),path:m=>m[2]||"/"}];
const components=[
 {framework:"React",pattern:/(?:export\s+)?(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9_$]*)/g,kind:"component"},
 {framework:"Vue",pattern:/<template[\s>]/g,kind:"component"},
 {framework:"NestJS",pattern:/@Controller\s*\(\s*["']([^"']+)["']?\s*\)/g,kind:"controller"},
 {framework:"Spring",pattern:/@(RestController|Controller)\b/g,kind:"controller"},
 {framework:"ASP.NET",pattern:/\bclass\s+([A-Za-z0-9_]+)\s*:\s*(?:Controller|ControllerBase)/g,kind:"controller"},
 {framework:"FastAPI",pattern:/FastAPI\s*\(/g,kind:"application"},
 {framework:"Flask",pattern:/Flask\s*\(/g,kind:"application"}];
async function routes(index){const out=[];for(const f of index?.files||[]){const s=f.source||"";for(const r of routeRules){r.pattern.lastIndex=0;let m;while((m=r.pattern.exec(s)))out.push({type:"route",framework:r.framework,method:r.method(m),path:r.path(m),file:f.path,line:lineAt(s,m.index),confidence:.86,evidence:s.slice(m.index,m.index+160).split(/\r?\n/)[0].trim()})}}return out}
async function structure(index){const out=[];for(const f of index?.files||[]){const s=f.source||"";for(const r of components){if(!has(index,r.framework)&&!((r.framework==="React"&&/\.(jsx?|tsx?)$/.test(f.path))||(r.framework==="Vue"&&f.path.endsWith(".vue"))))continue;r.pattern.lastIndex=0;let m;while((m=r.pattern.exec(s)))out.push({type:r.kind,framework:r.framework,name:m[1]||f.path.split("/").pop(),file:f.path,line:lineAt(s,m.index),confidence:.8,evidence:s.slice(m.index,m.index+120).split(/\r?\n/)[0].trim()})}}return out}
const ANALYZERS=[
{id:"routes",name:"Route Discovery",category:"Framework",description:"Discovers HTTP routes and controller mappings.",run:routes},
{id:"framework-structure",name:"Framework Structure",category:"Framework",description:"Finds framework components, controllers and application entry points.",run:structure},
{id:"symbol-resolution",name:"Symbol Resolution",category:"Code Intelligence",description:"Classifies indexed references as resolved, ambiguous or unresolved.",run:index=>(index.references||[]).map(r=>({name:r.name,file:r.from,line:r.line,column:r.column,status:(r.resolvedSymbols||[]).length===1?"resolved":(r.resolvedSymbols||[]).length>1?"ambiguous":"unresolved",targets:(r.resolvedSymbols||[]).map(s=>s.path+"::"+s.name),confidence:(r.resolvedSymbols||[]).length===1?.95:(r.resolvedSymbols?.length?.6:.2)}))),
{id:"architecture-hotspots",name:"Architecture Hotspots",category:"Architecture",description:"Ranks files by dependency fan-in and fan-out.",run:index=>{const out=new Map(),inc=new Map();for(const e of index.dependencies||[]){out.set(e.from,(out.get(e.from)||0)+1);inc.set(e.to,(inc.get(e.to)||0)+1)}return(index.files||[]).map(f=>({file:f.path,outgoing:out.get(f.path)||0,incoming:inc.get(f.path)||0,score:(out.get(f.path)||0)+(inc.get(f.path)||0)})).sort((a,b)=>b.score-a.score)}}
];
export const getAnalyzers=()=>ANALYZERS.map(({run,...x})=>x);
export async function runAnalyzer(index,id){const a=ANALYZERS.find(x=>x.id===id);if(!a)throw new Error("Unknown analyzer: "+id);return a.run(index)}
export function analyzerSummary(index){const refs=index?.references||[];return{analyzers:ANALYZERS.length,resolved:refs.filter(r=>(r.resolvedSymbols||[]).length===1).length,ambiguous:refs.filter(r=>(r.resolvedSymbols||[]).length>1).length,unresolved:refs.filter(r=>!(r.resolvedSymbols||[]).length).length}}