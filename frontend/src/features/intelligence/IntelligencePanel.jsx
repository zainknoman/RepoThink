import {useMemo,useState} from "react";
import {buildCallGraph,callers,callees,discoverTests,deadCodeSignals,duplicateCodeSignals,complexitySignals} from "../../intelligence/code.js";
import {changedFiles,snapshotIndex,impactReport} from "../../intelligence/impact.js";
import {hybridSearch,selectContext} from "../../intelligence/search.js";
import {buildArchitecture,architectureMermaid} from "../../intelligence/architecture.js";
import {retrieveEvidence,askAI} from "../../ai/evidence.js";
import {createMCPTools,mcpToolDefinitions} from "../../mcp/tools.js";
import {buildRepositoryContext} from "../../intelligence/context.js";

const Button=({children,...p})=><button className="primary" {...p}>{children}</button>;
const Row=({title,meta,onClick})=><button className="table-row" onClick={onClick}><b>{title}</b><span>{meta}</span></button>;

export default function IntelligencePanel({index,health,project,aiConfig}){
 const [tab,setTab]=useState("m1"),[query,setQuery]=useState(""),[question,setQuestion]=useState(""),[evidence,setEvidence]=useState(null),[answer,setAnswer]=useState(""),[busy,setBusy]=useState(false),[baseline,setBaseline]=useState(()=>{try{return JSON.parse(localStorage.getItem("repothink-baseline-"+(project?.name||""))||"{}")}catch{return{}}}),[mcpOutput,setMcpOutput]=useState("");
 if(!index)return <section className="panel"><h2>Intelligence Studio</h2><Empty text="Build the repository index to use M1–M6 intelligence."/></section>;
 const graph=useMemo(()=>buildCallGraph(index),[index]);
 const tests=useMemo(()=>discoverTests(index),[index]);
 const dead=useMemo(()=>deadCodeSignals(index),[index]);
 const dup=useMemo(()=>duplicateCodeSignals(index),[index]);
 const complexity=useMemo(()=>complexitySignals(index),[index]);
 const impact=useMemo(()=>changedFiles(index,baseline),[index,baseline]);
 const search=useMemo(()=>hybridSearch(index,query,{limit:50}),[index,query]);
 const arch=useMemo(()=>buildArchitecture(index),[index]);
 const contextBuilder=(files,opts)=>buildRepositoryContext(index,files,opts);
 async function ask(){setBusy(true);try{const b=retrieveEvidence(index,question,{limit:30,maxFiles:8,maxTokens:12000});setEvidence(b);if(aiConfig?.apiKey)setAnswer(await askAI(aiConfig,b))}catch(e){setAnswer(e.message)}finally{setBusy(false)}}
 async function callTool(name,args){try{const fn=createMCPTools(index,health,contextBuilder)[name];setMcpOutput(JSON.stringify(await fn(args),null,2))}catch(e){setMcpOutput(JSON.stringify({error:e.message},null,2))}}
 function capture(){const next=snapshotIndex(index);localStorage.setItem("repothink-baseline-"+project.name,JSON.stringify(next));setBaseline(next)}
 const tabs=[["m1","M1 Code Intelligence"],["m2","M2 Impact"],["m3","M3 Search & Context"],["m4","M4 Architecture"],["m5","M5 Evidence AI"],["m6","M6 MCP"]];
 return <section className="panel studio"><div className="section-head"><div><span className="eyebrow">M1 → M6</span><h2>Intelligence Studio</h2><p className="muted">Unified code intelligence, impact analysis, retrieval, architecture, evidence-backed AI and MCP tools.</p></div></div><div className="codebase-tabs">{tabs.map(x=><button key={x[0]} className={tab===x[0]?"active":""} onClick={()=>setTab(x[0])}>{x[1]}</button>)}</div>
 {tab==="m1"&&<div><div className="stats compact"><Stat label="Call edges" value={graph.edges.length}/><Stat label="Tests" value={tests.length}/><Stat label="Dead-code signals" value={dead.length}/><Stat label="Duplicate groups" value={dup.length}/><Stat label="Complexity files" value={complexity.length}/></div><h3>Call graph</h3><div className="table-list">{graph.edges.slice(0,100).map((e,i)=>{const a=index.symbols.find(s=>s.definitionKey===e.from),b=index.symbols.find(s=>s.definitionKey===e.to);return <Row key={i} title={(a?.name||e.from)+" → "+(b?.name||e.to)} meta={e.path+":"+e.line+" · confidence "+e.confidence}/>})}</div><h3>Test discovery</h3><div className="table-list">{tests.slice(0,50).map((x,i)=><Row key={i} title={x.path} meta={x.evidence}/>)}</div><h3>Complexity hotspots</h3><div className="table-list">{complexity.slice(0,20).map((x,i)=><Row key={i} title={x.path} meta={"cyclomatic "+x.cyclomatic+" · confidence "+x.confidence}/>)}</div></div>}
 {tab==="m2"&&<div><div className="section-head"><div><h3>Change and impact analysis</h3><p className="muted">The baseline is stored locally per repository. Capture it before making changes, then refresh the index.</p></div><Button onClick={capture}>Capture Current Baseline</Button></div><div className="stats compact"><Stat label="Changed files" value={impact.length}/><Stat label="Added" value={impact.filter(x=>x.status==="added").length}/><Stat label="Modified" value={impact.filter(x=>x.status==="modified").length}/><Stat label="Deleted" value={impact.filter(x=>x.status==="deleted").length}/></div><div className="table-list">{impact.slice(0,100).map((x,i)=><Row key={i} title={x.path} meta={x.status}/>)}</div>{impact.length>0&&<pre className="source context-output">{JSON.stringify(impactReport(index,impact.slice(0,20).map(x=>x.path)),null,2)}</pre>}</div>}
 {tab==="m3"&&<div><input className="searchbox" placeholder="Search symbols, files and concepts…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="stats compact"><Stat label="Results" value={search.length}/><Stat label="Selected context tokens" value={selectContext(index,search,{maxFiles:8,maxTokens:12000}).tokens}/></div><div className="table-list">{search.map((r,i)=><Row key={i} title={r.name} meta={r.kind+" · "+r.path+":"+r.line+" · "+r.score.toFixed(2)}/>)}</div></div>}
 {tab==="m4"&&<div><div className="stats compact"><Stat label="Files" value={arch.system.files}/><Stat label="Edges" value={arch.system.edges}/><Stat label="Modules" value={arch.modules.length}/><Stat label="APIs" value={arch.apis.length}/><Stat label="Tests" value={arch.tests.length}/><Stat label="External" value={arch.external.length}/></div><h3>Architecture model</h3><pre className="source context-output">{JSON.stringify(arch,null,2)}</pre><Button onClick={()=>{const blob=new Blob([architectureMermaid(arch)],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="repothink-architecture.mmd";a.click();URL.revokeObjectURL(a.href)}}>Export Mermaid</Button></div>}
 {tab==="m5"&&<div><textarea className="searchbox" rows="4" placeholder="Ask a question about this repository…" value={question} onChange={e=>setQuestion(e.target.value)}/><Button disabled={!question.trim()||busy} onClick={ask}>{busy?"Thinking…":"Retrieve Evidence / Ask AI"}</Button>{evidence&&<><h3>Evidence</h3><div className="table-list">{evidence.evidence.map(e=><Row key={e.id} title={"["+e.id+"] "+e.path+":"+e.line} meta={e.reason.join(" · ")}/>)}</div><div className="callout">Context: {evidence.context.files.length} files · approximately {evidence.context.tokens.toLocaleString()} tokens.</div></>}{answer&&<pre className="source context-output">{answer}</pre>}</div>}
 {tab==="m6"&&<div><h3>MCP tools</h3><div className="table-list">{mcpToolDefinitions().map(t=><Row key={t.name} title={t.name} meta={t.description}/>)}</div><div className="callout">This adapter uses the MCP tools/list and tools/call JSON-RPC model. It keeps repository data local to the workspace.</div><Button onClick={()=>callTool("repothink.health",{})}>Run health tool</Button>{mcpOutput&&<pre className="source context-output">{mcpOutput}</pre>}</div>}
 </section>
}
function Empty({text}){return <div className="empty">{text}</div>}
function Stat({label,value}){return <article className="stat"><span>{label}</span><strong>{Number(value||0).toLocaleString()}</strong></article>}
