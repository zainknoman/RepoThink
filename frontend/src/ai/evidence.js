
import {hybridSearch,selectContext} from "../intelligence/search.js";
export function retrieveEvidence(index,question,options={}){const results=hybridSearch(index,question,{limit:options.limit||30});return {question,results,context:selectContext(index,results,options),evidence:results.map((r,i)=>({id:"E"+(i+1),path:r.path,line:r.line||1,score:r.score,reason:r.evidence}))}}
export function buildEvidencePrompt(bundle){return "You are RepoThink. Answer only from supplied repository evidence. If insufficient, say so. Cite evidence IDs such as [E1].\n\nQUESTION:\n"+bundle.question+"\n\nEVIDENCE:\n"+bundle.evidence.map(e=>"["+e.id+"] "+e.path+":"+e.line+" score="+e.score.toFixed(2)).join("\n")+"\n\nCONTEXT FILES:\n"+bundle.context.files.join("\n")}
export async function askAI(config,bundle){
 if(!config?.apiKey)throw new Error("Configure an API key first.");
 const endpoint=config.endpoint||({openai:"https://api.openai.com/v1/chat/completions",local:"http://localhost:11434/v1/chat/completions",gemini:"https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",anthropic:"https://api.anthropic.com/v1/messages"})[config.provider];
 const prompt=buildEvidencePrompt(bundle);
 let headers={"Content-Type":"application/json"},body;
 if(config.provider==="anthropic"){headers["x-api-key"]=config.apiKey;headers["anthropic-version"]="2023-06-01";body={model:config.model||"claude-3-5-sonnet-latest",max_tokens:2000,messages:[{role:"user",content:prompt}]};}
 else {headers.Authorization="Bearer "+config.apiKey;body={model:config.model||"gpt-4o-mini",messages:[{role:"user",content:prompt}]};}
 const res=await fetch(endpoint,{method:"POST",headers,body:JSON.stringify(body)});
 if(!res.ok)throw new Error("AI request failed: "+res.status);
 const data=await res.json();
 return data.choices?.[0]?.message?.content||data.content?.[0]?.text||JSON.stringify(data);
}
