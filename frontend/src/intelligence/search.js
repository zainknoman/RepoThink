
const tokens=s=>[...new Set((s||"").toLowerCase().split(/[^a-z0-9_$]+/).filter(x=>x.length>1))];
const overlap=(q,t)=>{const a=tokens(q),b=new Set(tokens(t));return a.length?a.filter(x=>b.has(x)).length/a.length:0};
export function searchRepository(index,q,{limit=50}={}){if(!q?.trim())return[];return (index.files||[]).flatMap(f=>[{kind:"file",name:f.path.split("/").pop(),path:f.path,line:1,score:overlap(q,f.path),evidence:["path index"]},...(f.symbols||[]).map(s=>({kind:"symbol",name:s.name,path:f.path,line:s.line,score:overlap(q,s.name+" "+f.path),evidence:["symbol index"]}))]).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit)}
export function semanticSearch(index,q,opts={}){return searchRepository(index,q,opts).map(x=>({...x,score:Math.min(1,x.score+.1),evidence:x.evidence.concat("token semantic overlap")}))}
export function hybridSearch(index,q,opts={}){return semanticSearch(index,q,opts).sort((a,b)=>b.score-a.score)}
export function selectContext(index,results,{maxFiles=8,maxTokens=12000}={}){let tokensUsed=0,files=[];for(const r of results){const f=index.files.find(x=>x.path===r.path);if(!f||files.includes(f.path))continue;const t=f.tokens||Math.ceil(f.lines*8);if(tokensUsed+t>maxTokens)continue;files.push(f.path);tokensUsed+=t;if(files.length>=maxFiles)break}return {files,tokens:tokensUsed,results:results.filter(r=>files.includes(r.path))}}
