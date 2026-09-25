export function buildRepositoryReport(index,health,git){
 if(!index)return '';
 const lines=['# RepoThink Repository Report','', 'Repository: '+index.repository, 'Generated: '+new Date().toISOString(), ''];
 if(git?.available) lines.push('## Git','Branch: '+(git.branch||'unknown'),'Commit: '+(git.commit||'unknown'),'Remote: '+(git.remote||'unknown'),'');
 lines.push('## Statistics','', '- Files: '+index.stats.files,'- Lines: '+index.stats.lines,'- Symbols: '+index.stats.symbols,'- References: '+index.stats.references,'- Internal dependencies: '+index.stats.internalEdges,'- Unresolved imports: '+index.unresolvedImports.length,'');
 if(health) lines.push('## Health','- Score: '+health.score,'- Issues: '+health.stats.issues,'- Cycles: '+health.stats.cycles,'');
 lines.push('## Languages','',...Object.entries(index.languages).map(([k,v])=>'- '+k+': '+v+' files'),'','## Dependency Hotspots','',...index.files.map(f=>{const out=index.dependencies.filter(e=>e.from===f.path).length;const inc=index.dependencies.filter(e=>e.to===f.path).length;return {path:f.path,n:out+inc}}).sort((a,b)=>b.n-a.n).slice(0,20).map(x=>'- '+x.path+': '+x.n+' connections'));
 return lines.join('\n');
}
export function downloadText(filename,content,type='text/markdown'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}