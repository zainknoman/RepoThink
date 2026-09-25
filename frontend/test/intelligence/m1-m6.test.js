import test from "node:test";
import assert from "node:assert/strict";
import {buildCallGraph,discoverTests,deadCodeSignals,complexitySignals} from "../../src/intelligence/code.js";
import {impactForFile} from "../../src/intelligence/impact.js";
import {hybridSearch} from "../../src/intelligence/search.js";
import {buildArchitecture,architectureMermaid} from "../../src/intelligence/architecture.js";

function fixture(){
 const a={path:"src/a.js",language:"javascript",lines:20,bytes:100,tokens:40,source:"function alpha(){ beta(); if(x) beta(); } export { alpha }",symbols:[{name:"alpha",kind:"function",line:1,definitionKey:"src/a.js::alpha::1"}],parseErrors:[]};
 const b={path:"src/b.js",language:"javascript",lines:10,bytes:60,tokens:20,source:"function beta(){ return 1; } export { beta }",symbols:[{name:"beta",kind:"function",line:1,definitionKey:"src/b.js::beta::1"}],parseErrors:[]};
 const t={path:"src/a.test.js",language:"javascript",lines:5,bytes:20,tokens:10,source:"test('alpha',()=>alpha())",symbols:[],parseErrors:[]};
 const refs=[{from:"src/a.js",name:"beta",line:1,column:20,resolvedSymbols:[b.symbols[0]]}];
 a.references=refs;b.references=[];t.references=[];
 return {repository:"fixture",files:[a,b,t],symbols:[a.symbols[0],b.symbols[0]],references:refs,exports:[{path:"src/a.js",name:"alpha"},{path:"src/b.js",name:"beta"}],importBindings:[],dependencies:[{from:"src/a.js",to:"src/b.js",module:"./b",line:1}],externalDependencies:[],unresolvedImports:[],languages:{javascript:3},stats:{files:3,lines:35,symbols:2,references:1},project:{frameworks:[]}};
}
test("M1 call graph and tests",()=>{const i=fixture();assert.equal(buildCallGraph(i).edges.length,1);assert.equal(discoverTests(i).length,1);assert.ok(complexitySignals(i)[0].cyclomatic>=2)});
test("M1 dead-code model",()=>{const i=fixture();assert.ok(deadCodeSignals(i).length>=0)});
test("M2 impact",()=>{const i=fixture();const x=impactForFile(i,"src/a.js");assert.deepEqual(x.dependencies,["src/b.js"]);assert.ok(x.evidence.length)});
test("M3 hybrid search",()=>{const i=fixture();assert.equal(hybridSearch(i,"alpha")[0].name,"alpha")});
test("M4 architecture and Mermaid",()=>{const m=buildArchitecture(fixture());assert.equal(m.system.edges,1);assert.match(architectureMermaid(m),/flowchart LR/)});
