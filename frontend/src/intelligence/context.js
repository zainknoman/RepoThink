import {buildContext,estimateTokens,findDependencies,findDependents} from './index/repository.js';
export {estimateTokens};
export async function buildRepositoryContext(index,files,options={}){return buildContext(index,files,options)}
export function contextCandidates(index,files=[]){const selected=new Set(files);const related=new Set(files);for(const p of files){findDependencies(index,p).forEach(x=>related.add(x));findDependents(index,p).forEach(x=>related.add(x))}return [...related].map(path=>({path,selected:selected.has(path),tokens:index.files.find(f=>f.path===path)?.tokens||0}))}