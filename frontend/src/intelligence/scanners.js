const API_PATTERNS=[
 {framework:"Express",pattern:/\b(?:app|router)\.(get|post|put|patch|delete|options|head|use)\s*\(\s*["']([^"']+)["']/g},
 {framework:"NestJS",pattern:/@(Get|Post|Put|Patch|Delete|All)\s*\(\s*["']?([^"')]+)?["']?\s*\)/g},
 {framework:"FastAPI",pattern:/@(?:app|router)\.(get|post|put|patch|delete|options)\s*\(\s*["']([^"']+)["']/g},
 {framework:"Flask",pattern:/@(?:app|blueprint)\.route\s*\(\s*["']([^"']+)["']/g},
 {framework:"Spring",pattern:/@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|RequestMapping)\s*(?:\(\s*["']([^"']+)["'])?/g},
 {framework:"ASP.NET",pattern:/\[(HttpGet|HttpPost|HttpPut|HttpPatch|HttpDelete|Route)(?:\s*\(\s*["']([^"']+)["'])?/g}
];
const SECRET_PATTERNS=[
 {id:"private-key",severity:"high",pattern:/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i},
 {id:"api-key",severity:"high",pattern:/\b(?:api[_-]?key|access[_-]?key)\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}["']/i},
 {id:"password",severity:"high",pattern:/\b(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i},
 {id:"secret",severity:"high",pattern:/\b(?:secret|client_secret)\s*[:=]\s*["'][^"']{6,}["']/i},
 {id:"token",severity:"medium",pattern:/\b(?:access_token|auth_token|bearer_token)\s*[:=]\s*["'][^"']{10,}["']/i},
 {id:"connection-string",severity:"high",pattern:/(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^\s"']+/i},
 {id:"private-env",severity:"medium",pattern:/\b(?:AWS_SECRET_ACCESS_KEY|OPENAI_API_KEY|DATABASE_URL)\s*=\s*[^\s]+/i}
];
const PACKAGE_RULES=[["react","React"],["react-dom","React DOM"],["vue","Vue"],["@nestjs/core","NestJS"],["express","Express"],["fastapi","FastAPI"],["flask","Flask"],["spring-boot","Spring"],["next","Next.js"],["nuxt","Nuxt"],["vite","Vite"],["tailwindcss","Tailwind CSS"],["prisma","Prisma"],["sequelize","Sequelize"],["django","Django"]];
const lineAt=(s,i)=>s.slice(0,i).split(/\r?\n/).length;
const unique=(a,k)=>a.filter((x,i)=>a.findIndex(y=>k(y)===k(x))===i);
export function discoverApis(index){const out=[];for(const file of index?.files||[]){const source=file.source||"";for(const rule of API_PATTERNS){rule.pattern.lastIndex=0;let m;while((m=rule.pattern.exec(source))){const method=rule.framework==="Flask"?"ROUTE":rule.framework==="Spring"?(m[1]||"REQUEST").replace("Mapping","").toUpperCase():rule.framework==="ASP.NET"?(m[1]||"ROUTE").replace(/^Http/i,"").toUpperCase():(m[1]||"GET").toUpperCase();const route=rule.framework==="Flask"?(m[1]||"/"):(m[2]||"/");out.push({framework:rule.framework,method,path:route,file:file.path,line:lineAt(source,m.index),evidence:source.slice(m.index,m.index+160).split(/\r?\n/)[0].trim()})}}}return unique(out,x=>[x.file,x.line,x.method,x.path].join("|"))}
export function scanSecurity(index){const out=[];for(const file of index?.files||[]){if(/(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/i.test(file.path))continue;const lines=(file.source||"").split(/\r?\n/);for(let i=0;i<lines.length;i++)for(const rule of SECRET_PATTERNS){if(rule.pattern.test(lines[i]))out.push({id:rule.id,severity:rule.severity,path:file.path,line:i+1,text:lines[i].trim().slice(0,240),evidence:"heuristic pattern"});rule.pattern.lastIndex=0}}return out}
export function detectProjectPackages(index){const file=(index?.files||[]).find(f=>f.path==="package.json"||f.path.endsWith("/package.json"));if(!file)return[];try{const json=JSON.parse(file.source||"");const deps={...(json.dependencies||{}),...(json.devDependencies||{}),...(json.peerDependencies||{})};return Object.entries(deps).map(([pkg,version])=>{const known=PACKAGE_RULES.find(([n])=>n===pkg);return{package:pkg,version,category:known?.[1]||"Dependency",known:!!known}})}catch{return[]}}
export function intelligenceSummary(index,{api=[],security=[],packages=[]}={}){return{files:index?.stats?.files||0,symbols:index?.stats?.symbols||0,references:index?.stats?.references||0,resolved:index?.stats?.resolvedReferences||0,unresolvedReferences:index?.stats?.unresolvedReferences||0,internalEdges:index?.stats?.internalEdges||0,unresolvedImports:index?.unresolvedImports?.length||0,apiEndpoints:api.length,securityFindings:security.length,highSecurityFindings:security.filter(x=>x.severity==="high").length,packages:packages.length}}