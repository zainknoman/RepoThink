import { useMemo, useState } from 'react';
import { buildRepositoryIndex, detectCycles, getArchitecture, attachFileHandles } from '../intelligence/index/repository.js';
import { readGitMetadata } from '../intelligence/git.js';
import { saveIndex, loadIndex } from '../infrastructure/cache/indexCache.js';
import { buildRepositoryContext } from '../intelligence/context.js';
import { buildRepositoryReport, downloadText } from '../intelligence/reports.js';
import { AI_PROVIDERS, loadAIConfig, saveAIConfig } from '../ai/providers.js';
import IntelligencePanel from '../features/intelligence/IntelligencePanel.jsx';

const EXT=new Set(['.js','.jsx','.ts','.tsx','.vue','.py','.java','.kt','.go','.rs','.php','.cs','.cpp','.c','.h','.html','.css','.scss','.json','.md','.txt','.xml','.yaml','.yml','.sql','.sh','.bat','.ps1','.env']);
const IGNORE=new Set(['.git','node_modules','dist','build','.venv','venv','__pycache__','.idea','.vscode','coverage','.next','.nuxt','.turbo','.cache']);
const ext=n=>{const i=n.lastIndexOf('.');return i>=0?n.slice(i).toLowerCase():''};
async function collect(h,p='',out=[]){for await(const e of h.values()){if(e.kind==='directory'){if(!IGNORE.has(e.name))await collect(e,p?p+'/'+e.name:e.name,out)}else if(e.kind==='file'&&EXT.has(ext(e.name)))out.push({path:p?p+'/'+e.name:e.name,name:e.name,ext:ext(e.name),text:true,handle:e})}return out}
const Stat=({label,value})=><article className="stat"><span>{label}</span><strong>{Number(value||0).toLocaleString()}</strong></article>;

export default function App(){
 const [project,setProject]=useState(null),[index,setIndex]=useState(null),[health,setHealth]=useState(null),[git,setGit]=useState(null),[active,setActive]=useState('overview'),[status,setStatus]=useState('Open a local repository to begin.'),[progress,setProgress]=useState(null),[query,setQuery]=useState(''),[file,setFile]=useState(null),[tab,setTab]=useState('overview'),[contextFiles,setContextFiles]=useState([]),[contextResult,setContextResult]=useState(null),[aiConfig,setAiConfig]=useState(loadAIConfig());
 async function openRepo(){if(!window.showDirectoryPicker){setStatus('Use Chrome or Edge with File System Access API.');return}try{const h=await window.showDirectoryPicker({mode:'read'});setStatus('Scanning…');const files=await collect(h);setProject({name:h.name,files,h});setIndex(null);setHealth(null);setGit(await readGitMetadata(h));setFile(null);setContextResult(null);setStatus(`Loaded ${files.length.toLocaleString()} text files. Build the index when ready.`); const cached=await loadIndex(h.name); if(cached){attachFileHandles(cached,{files});setIndex(cached);setHealth(buildHealth(cached));setStatus('Loaded cached intelligence index. Refresh to re-index the repository.');}}catch(e){if(e?.name!=='AbortError')setStatus(e?.message||'Unable to open repository.')}}
 async function build(){if(!project)return;try{setProgress({phase:'analyze',current:0,total:project.files.length});const r=await buildRepositoryIndex(project,{onProgress:setProgress});attachFileHandles(r,project);setIndex(r);setHealth(buildHealth(r));await saveIndex(project.name,{...r,_fileHandles:undefined});setProgress(null);setActive('codebase');setStatus(`Index complete: ${r.stats.files.toLocaleString()} files analyzed.`)}catch(e){setProgress(null);setStatus(e?.message||'Indexing failed.')}}
 async function openFile(path, surface='editor'){const f=project?.files.find(x=>x.path===path);if(!f)return;setFile({path,content:await(await f.handle.getFile()).text()});setActive(surface)}
 const matches=useMemo(()=>{if(!index||!query.trim())return[];const q=query.toLowerCase();return [...index.symbols.filter(s=>s.name.toLowerCase().includes(q)||s.path.toLowerCase().includes(q)).map(s=>({kind:'symbol',...s})),...index.files.filter(f=>f.path.toLowerCase().includes(q)).map(f=>({kind:'file',...f}))].slice(0,100)},[index,query]);
 const symbols=(index?.symbols||[]).filter(s=>!query||s.name.toLowerCase().includes(query.toLowerCase())).slice(0,300);
 const refs=(index?.references||[]).filter(r=>!query||r.name.toLowerCase().includes(query.toLowerCase())).slice(0,300);
 const deps=(index?.dependencies||[]).filter(d=>!query||d.from.toLowerCase().includes(query.toLowerCase())||d.to.toLowerCase().includes(query.toLowerCase())).slice(0,300);
 const nav=[['overview','Overview'],['explorer','Explorer'],['search','Search'],['editor','Editor'],['codebase','Codebase'],['architecture','Architecture'],['impact','Impact'],['health','Health'],['git','Git'],['context','Context'],['reports','Reports'],['ai','AI']];
 return <div className="shell">
  <header className="topbar"><div className="brand"><div className="mark">R</div><div><strong>RepoThink</strong><small>Codebase Intelligence Workspace</small></div></div><div className="actions"><button onClick={openRepo}>Open Repository</button><button className="primary" disabled={!project||!!progress} onClick={build}>{progress?'Indexing…':'Build Index'}</button></div></header>
  <div className="statusbar"><span>{project?`Repository: ${project.name}`:'No repository open'}</span><span>{status}</span></div>
  <nav>{nav.map(([id,label])=><button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}>{label}</button>)}</nav>
  <main>
   {active==='overview'&&<><section className="hero"><div><span className="eyebrow">LOCAL-FIRST SOFTWARE UNDERSTANDING</span><h1>Think through an unfamiliar codebase.</h1><p>Open a local repository, build a structural index, then explore files, symbols, references and dependencies without uploading the project.</p><button className="primary large" onClick={openRepo}>Open Repository</button></div><div className="journey"><b>Open → Index → Understand → Analyze</b><span>Search → Trace → Impact → Context → AI</span></div></section>{project&&<div className="stats"><Stat label="Text files" value={project.files.length}/><Stat label="Indexed files" value={index?.stats.files}/><Stat label="Symbols" value={index?.stats.symbols}/><Stat label="Dependencies" value={index?.dependencies.length}/></div>}</>}
   {active==='explorer'&&<section className="panel"><div className="section-head"><div><span className="eyebrow">REPOSITORY EXPLORER</span><h2>Explorer</h2><p className="muted">Navigate the repository as a compact file tree.</p></div><span className="muted">{project?.files.length?.toLocaleString()||0} files</span></div>{!project?<Empty/>:<ExplorerTree files={project.files} selected={file?.path} onOpen={path=>openFile(path,'editor')}/>}</section>}
   {active==='search'&&<section className="panel"><div className="section-head"><div><span className="eyebrow">REPOSITORY SEARCH</span><h2>Search</h2><p className="muted">Search indexed files and symbols, then jump directly into the editor.</p></div><span className="muted">{matches.length} result{matches.length===1?'':'s'}</span></div><input className="searchbox" placeholder="Search files or symbols…" value={query} onChange={e=>setQuery(e.target.value)}/>{!index?<Empty text="Build the index to search."/>:<div className="results">{!query.trim()&&<div className="empty">Type a file or symbol name to search the indexed repository.</div>}{matches.map((m,i)=><button key={i} onClick={()=>openFile(m.path,'editor')}><b>{m.name||m.path}</b><span>{m.kind} · {m.path}{m.line?` · line ${m.line}`:''}</span></button>)}</div>}</section>}
   {active==='editor'&&<EditorPanel project={project} file={file} setFile={setFile}/>} {active==='codebase'&&<IntelligencePanel index={index} health={health} project={project} aiConfig={aiConfig} setAIConfig={v=>{setAiConfig(v);saveAIConfig(v)}} openFile={path=>openFile(path,'editor')}/>}
   {active==='health'&&<HealthPanel health={health} openFile={openFile}/>}
   {active==='git'&&<GitPanel git={git}/>}
   {active==='context'&&<ContextPanel index={index} project={project} selected={contextFiles} setSelected={setContextFiles} result={contextResult} setResult={setContextResult}/>} 
   {active==='reports'&&<ReportsPanel index={index} health={health} git={git}/>} 
   {active==='ai'&&<AIPanel config={aiConfig} setConfig={v=>{setAiConfig(v);saveAIConfig(v)}}/>}
   {active==='architecture'&&<ArchitecturePanel index={index} openFile={openFile}/>}
  </main>
  {progress&&<div className="progress"><div><b>{progress.phase}</b><span>{progress.current||0} / {progress.total||0}</span></div><div className="bar"><i style={{width:`${Math.min(100,((progress.current||0)/Math.max(1,progress.total||1))*100)}%`}}/></div></div>}
 </div>
}
function ExplorerTree({files,selected,onOpen}){
 const tree={};
 for(const f of files){let node=tree;const parts=f.path.split('/');parts.forEach((part,i)=>{const key=i===parts.length-1?'__file__'+part:part;if(!node[key])node[key]=i===parts.length-1?f:{};if(i<parts.length-1)node=node[key]})}
 const render=(node,prefix='')=>Object.entries(node).sort(([a],[b])=>a.localeCompare(b)).map(([name,value])=>name.startsWith('__file__')
   ? <button key={value.path} className={selected===value.path?'tree-file selected':''} onClick={()=>onOpen(value.path)}><span className="tree-icon">·</span>{value.name}</button>
   : <div key={name} className="tree-folder"><strong><span className="tree-icon">▾</span>{name}</strong><div>{render(value,prefix+name+'/')}</div></div>);
 return <div className="explorer-tree">{render(tree)}</div>;
}
function EditorPanel({project,file,setFile}){
 if(!project)return <section className="panel"><span className="eyebrow">SOURCE EDITOR</span><h2>Editor</h2><Empty text="Open a repository and select a file from Explorer or Search."/></section>;
 return <section className="panel editor-panel"><div className="section-head"><div><span className="eyebrow">SOURCE EDITOR</span><h2>{file?.path||'Select a source file'}</h2><p className="muted">Read-only local source inspection with line numbers.</p></div></div>{!file?<Empty text="Select a file from Explorer or Search."/>:<div className="editor"><div className="editor-lines">{file.content.split(/\r?\n/).map((_,i)=><span key={i}>{i+1}</span>)}</div><pre className="source editor-source">{file.content}</pre></div>}{file?.error&&<div className="callout">{file.error}</div>}</section>}
function GitPanel({git}){return <section className="panel"><span className="eyebrow">GIT INTELLIGENCE</span><h2>Repository Git</h2><p className="muted">Local Git metadata read directly from the selected repository.</p>{!git||!git.available?<Empty text={git?.reason||'Git metadata is unavailable.'}/>:<div className="stats compact"><Stat label="Branch" value={git.branch}/><Stat label="Commit" value={(git.commit||'').slice(0,8)}/><Stat label="Remote" value={git.remote||'Not configured'}/><Stat label="Mode" value={git.detached?'Detached':'Branch'}/></div>}</section>}
function ContextPanel({index,project,selected,setSelected,result,setResult}){
 const [includeDependencies,setIncludeDependencies]=useState(true),[includeDependents,setIncludeDependents]=useState(true);
 if(!index||!project)return <section className="panel"><h2>Context</h2><Empty text="Build an index to construct repository context."/></section>;
 async function build(){const r=await buildRepositoryContext(index,selected,{includeDependencies,includeDependents,includeMetadata:true});setResult(r)}
 return <section className="panel"><div className="section-head"><div><span className="eyebrow">CONTEXT BUILDER</span><h2>Repository Context</h2><p className="muted">Select source files and expand context through dependency relationships.</p></div><button className="primary" disabled={!selected.length} onClick={build}>Build Context</button></div><div className="context-options"><label><input type="checkbox" checked={includeDependencies} onChange={e=>setIncludeDependencies(e.target.checked)}/> Dependencies</label><label><input type="checkbox" checked={includeDependents} onChange={e=>setIncludeDependents(e.target.checked)}/> Dependents</label><span>{selected.length} selected</span></div><div className="context-files">{project.files.map(f=><label key={f.path}><input type="checkbox" checked={selected.includes(f.path)} onChange={e=>setSelected(e.target.checked?[...selected,f.path]:selected.filter(x=>x!==f.path))}/><span>{f.path}</span></label>)}</div>{result&&<><div className="callout">Generated {result.files.length} files · approximately {result.tokens.toLocaleString()} tokens.</div><pre className="source context-output">{result.content}</pre></>}</section>
}
function ReportsPanel({index,health,git}){return <section className="panel"><span className="eyebrow">REPORTING</span><h2>Repository Reports</h2><p className="muted">Generate a portable Markdown snapshot from the current intelligence model.</p>{!index?<Empty text="Build an index to generate a report."/>:<><button className="primary" onClick={()=>downloadText((index.repository||'repository')+'-repothink-report.md',buildRepositoryReport(index,health,git))}>Download Markdown Report</button><div className="callout">The report contains repository statistics, Git metadata, health signals, languages and dependency hotspots.</div></>}</section>}
function AIPanel({config,setConfig}){const provider=config.provider||'local';return <section className="panel"><span className="eyebrow">AI PROVIDER FOUNDATION</span><h2>AI Configuration</h2><p className="muted">Provider configuration is stored locally in this browser. Repository evidence remains local until a future AI workflow explicitly sends selected context.</p><div className="ai-form"><label>Provider<select value={provider} onChange={e=>setConfig({...config,provider:e.target.value})}>{AI_PROVIDERS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Model<input value={config.model||''} onChange={e=>setConfig({...config,model:e.target.value})} placeholder="Model name"/></label><label>API key<input type="password" value={config.apiKey||''} onChange={e=>setConfig({...config,apiKey:e.target.value})} placeholder="Stored only in localStorage"/></label></div><div className="callout">Endpoint: {AI_PROVIDERS.find(p=>p.id===provider)?.endpoint}</div></section>}
function CodebaseTab({tab,index,symbols,refs,deps,openFile}){
 if(tab==='overview')return <div className="intelligence-overview"><div className="overview-card"><h3>Project profile</h3><p><b>{index.repository}</b></p><p className="muted">{Object.entries(index.languages||{}).map(([n,c])=>`${n}: ${c}`).join(' · ')}</p></div><div className="overview-card"><h3>Resolution</h3><p>{index.stats.resolvedReferences.toLocaleString()} resolved references</p><p>{index.stats.unresolvedReferences.toLocaleString()} unresolved references</p><p>{index.unresolvedImports.length.toLocaleString()} unresolved relative imports</p></div></div>;
 if(tab==='files')return <List items={index.files.map(f=>({title:f.path,meta:`${f.language} · ${f.lines.toLocaleString()} lines · ${f.symbols.length} symbols`,path:f.path}))} openFile={openFile}/>;
 if(tab==='symbols')return <List items={symbols.map(s=>({title:s.name,meta:`${s.kind} · ${s.path}:${s.line}`,path:s.path}))} openFile={openFile}/>;
 if(tab==='references')return <List items={refs.map(r=>({title:r.name,meta:`${r.from}:${r.line} · ${r.resolvedSymbols.length?'resolved':'unresolved'}`,path:r.from}))} openFile={openFile}/>;
 if(tab==='dependencies')return <List items={deps.map(d=>({title:d.from,meta:`→ ${d.to} · ${d.module}`,path:d.from}))} openFile={openFile}/>
 if(tab==='analyzers')return <div className="analyzer-grid">{(index.project?.frameworks||[]).map((x,i)=><article className="overview-card" key={i}><h3>{x.name}</h3><p className="muted">Detected from {x.evidence}.</p></article>)}{!(index.project?.frameworks||[]).length&&<Empty text="No framework signals detected yet."/>}</div>;;
 return <div className="planned"><b>{tab[0].toUpperCase()+tab.slice(1)}</b><p className="muted">Scheduled for the corresponding RepoThink milestone. This will be implemented from the unified intelligence model rather than copied as a standalone utility.</p></div>
}
function List({items,openFile}){return <div className="table-list">{items.map((x,i)=><button key={i} onClick={()=>openFile(x.path)}><b>{x.title}</b><span>{x.meta}</span></button>)}</div>}
function buildHealth(index){
 const cycles=detectCycles(index), architecture=getArchitecture(index)||[];
 const unresolvedRefs=index.references.filter(r=>!r.resolvedSymbols?.length);
 const parserErrors=index.files.flatMap(f=>(f.parseErrors||[]).map(e=>({...e,path:f.path})));
 const issues=[
  ...index.unresolvedImports.map(x=>({severity:'high',type:'unresolved-import',path:x.from,line:x.line,message:`Unable to resolve relative import: ${x.module}`})),
  ...unresolvedRefs.map(x=>({severity:'medium',type:'unresolved-reference',path:x.from,line:x.line,message:`Unable to resolve symbol: ${x.name}`})),
  ...parserErrors.map(x=>({severity:'high',type:'parser-error',path:x.path,line:x.line,message:x.message})),
  ...cycles.map(x=>({severity:'medium',type:'dependency-cycle',path:x[0],message:`Dependency cycle detected across ${x.length-1} files`,cycle:x}))
 ];
 const severityCounts=issues.reduce((a,x)=>(a[x.severity]=(a[x.severity]||0)+1,a),{high:0,medium:0,low:0});
 return {score:Math.max(0,100-severityCounts.high*10-severityCounts.medium*3),issues,severityCounts,cycles,hotspots:architecture.sort((a,b)=>(b.dependencies+b.dependents)-(a.dependencies+a.dependents)).slice(0,20),stats:{issues:issues.length,cycles:cycles.length,unresolvedImports:index.unresolvedImports.length,unresolvedReferences:unresolvedRefs.length,parserErrors:parserErrors.length}};
}
function ArchitecturePanel({index,openFile}){
 if(!index)return <section className="panel"><span className="eyebrow">ARCHITECTURE</span><h2>Architecture</h2><p className="muted">Build the repository index to inspect the dependency architecture.</p><Empty text="No architecture graph is available yet."/></section>;
 const model=buildArchitectureModel(index);
 const [filter,setFilter]=useState('');
 const [selected,setSelected]=useState(null);
 const visibleNodes=model.nodes.filter(n=>!filter||n.path.toLowerCase().includes(filter.toLowerCase()));
 const visiblePaths=new Set(visibleNodes.map(n=>n.path));
 const visibleEdges=model.edges.filter(e=>visiblePaths.has(e.from)&&visiblePaths.has(e.to));
 const cols=4, width=900, height=Math.max(360,Math.ceil(visibleNodes.length/cols)*105);
 return <section className="panel architecture-panel">
  <div className="section-head"><div><span className="eyebrow">ARCHITECTURE INTELLIGENCE</span><h2>Dependency Architecture</h2><p className="muted">File-level dependency graph derived from the repository index.</p></div><div className="architecture-filter"><input className="searchbox" placeholder="Filter files…" value={filter} onChange={e=>setFilter(e.target.value)}/></div></div>
  <div className="stats compact"><Stat label="Files" value={model.nodes.length}/><Stat label="Edges" value={model.edges.length}/><Stat label="Cycles" value={model.cycles.length}/><Stat label="Components" value={model.components}/></div>
  <div className="architecture-layout">
   <div className="architecture-graph">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Repository dependency graph">
     <defs><marker id="repothink-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"/></marker></defs>
     {visibleEdges.map((e,i)=>{const a=visibleNodes.find(n=>n.path===e.from),b=visibleNodes.find(n=>n.path===e.to);return <line key={i} x1={a.x+95} y1={a.y+25} x2={b.x+95} y2={b.y+25} className={selected&&(selected===e.from||selected===e.to)?'graph-edge selected':''} markerEnd="url(#repothink-arrow)"/>})}
     {visibleNodes.map(n=><g key={n.path} transform={`translate(${n.x},${n.y})`} className={selected===n.path?'graph-node selected':'graph-node'} onClick={()=>{setSelected(n.path);openFile(n.path)}}><rect width="190" height="52" rx="9"/><text x="10" y="21">{n.label.slice(0,26)}{n.label.length>26?'…':''}</text><text x="10" y="39" className="graph-meta">{n.dependencies} deps · {n.dependents} dependents</text></g>)}
    </svg>
   </div>
   <div className="architecture-side"><h3>Hotspots</h3>{model.hotspots.slice(0,12).map(n=><button key={n.path} onClick={()=>openFile(n.path)}><b>{n.label}</b><span>{n.dependencies} outgoing · {n.dependents} incoming</span></button>)}{model.cycles.length>0&&<><h3>Cycles</h3>{model.cycles.slice(0,8).map((cycle,i)=><div className="cycle-item" key={i}>{cycle.map(x=>x.split('/').pop()).join(' → ')}</div>)}</>}</div>
  </div>
  <div className="architecture-edges"><h3>Dependency Edges</h3>{visibleEdges.slice(0,100).map((e,i)=><button key={i} onClick={()=>openFile(e.from)}><b>{e.from}</b><span>→ {e.to} · {e.module}</span></button>)}{!visibleEdges.length&&<Empty text="No matching dependency edges." />}</div>
 </section>;
}
function buildArchitectureModel(index){
 const architecture=getArchitecture(index)||[];
 const nodes=architecture.map((n,i)=>({...n,label:n.path.split('/').pop()||n.path,x:20+(i%4)*220,y:20+Math.floor(i/4)*105}));
 const nodeSet=new Set(nodes.map(n=>n.path));
 const edges=uniqueEdges((index.dependencies||[]).filter(e=>nodeSet.has(e.from)&&nodeSet.has(e.to)));
 const cycles=detectCycles(index);
 return {nodes,edges,cycles,hotspots:nodes.slice(0,20),components:countComponents(nodes,edges)};
}
function uniqueEdges(edges){const seen=new Set();return edges.filter(e=>{const k=`${e.from}→${e.to}`;if(seen.has(k))return false;seen.add(k);return true})}
function countComponents(nodes,edges){
 const graph=new Map(nodes.map(n=>[n.path,[]]));
 edges.forEach(e=>{graph.get(e.from)?.push(e.to);graph.get(e.to)?.push(e.from)});
 const seen=new Set();let count=0;
 for(const node of graph.keys()){if(seen.has(node))continue;count++;const stack=[node];seen.add(node);while(stack.length){for(const next of graph.get(stack.pop())||[]){if(!seen.has(next)){seen.add(next);stack.push(next)}}}}
 return count;
}
function HealthPanel({health,openFile}){
 if(!health)return <section className="panel"><span className="eyebrow">HEALTH</span><h2>Repository Health</h2><p className="muted">Build the repository index to calculate health signals.</p><Empty text="No health report is available yet."/></section>;
 return <section className="panel"><div className="section-head"><div><span className="eyebrow">HEALTH</span><h2>Repository Health</h2><p className="muted">Evidence from unresolved imports, references, parser errors and dependency cycles.</p></div><div className="health-score"><span>Health score</span><strong>{health.score}</strong></div></div><div className="stats compact"><Stat label="Issues" value={health.stats.issues}/><Stat label="High" value={health.severityCounts.high}/><Stat label="Medium" value={health.severityCounts.medium}/><Stat label="Cycles" value={health.stats.cycles}/><Stat label="Unresolved imports" value={health.stats.unresolvedImports}/><Stat label="Unresolved refs" value={health.stats.unresolvedReferences}/></div><div className="health-list">{health.issues.slice(0,100).map((issue,i)=><button key={i} onClick={()=>openFile(issue.path)}><b>{issue.type.replaceAll('-',' ')}</b><span>{issue.severity} · {issue.path}{issue.line?`:${issue.line}`:''} · {issue.message}</span></button>)}</div>{!health.issues.length&&<div className="empty">No indexed health issues detected.</div>}</section>
}
function Empty({text='Open a repository to begin.'}){return <div className="empty">{text}</div>}
