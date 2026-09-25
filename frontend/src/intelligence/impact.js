
const fingerprint=f=>f.path+":"+f.lines+":"+f.bytes+":"+f.symbols.length;
export function snapshotIndex(index){return Object.fromEntries((index.files||[]).map(f=>[f.path,fingerprint(f)]))}
export function changedFiles(index,baseline={}){const current=new Set((index.files||[]).map(f=>f.path));const changed=(index.files||[]).filter(f=>!baseline[f.path]||baseline[f.path]!==fingerprint(f)).map(f=>({...f,status:baseline[f.path]?"modified":"added"}));return changed.concat(Object.keys(baseline).filter(p=>!current.has(p)).map(path=>({path,status:"deleted"})))}
export function impactForFile(index,path){const dependencies=[...new Set((index.dependencies||[]).filter(e=>e.from===path).map(e=>e.to))];const dependents=[...new Set((index.dependencies||[]).filter(e=>e.to===path).map(e=>e.from))];const symbols=(index.symbols||[]).filter(s=>s.path===path);const tests=(index.files||[]).filter(f=>/test|spec|__tests__/i.test(f.path)).map(f=>f.path).slice(0,50);return {path,symbols,dependencies,dependents,tests,evidence:["file dependency edges","resolved symbol index","test path convention"]}}
export function impactReport(index,paths){return paths.map(p=>impactForFile(index,p))}
