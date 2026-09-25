import test from "node:test";
import assert from "node:assert/strict";
import {searchSource,searchIndex,hybridSearch,selectContext} from "../../src/intelligence/search.js";
import {discoverApis,scanSecurity,detectProjectPackages} from "../../src/intelligence/scanners.js";
import {getAnalyzers,runAnalyzer} from "../../src/intelligence/analyzers.js";
import {buildDocumentationReport} from "../../src/intelligence/documentation.js";

function index(){
 const a={path:"src/app.js",language:"JavaScript",lines:12,bytes:300,tokens:70,source:'import {createUser} from "./user.js";\napp.get("/users", createUser);\nconst password = "super-secret-value";',symbols:[{name:"createUser",kind:"function",line:1,definitionKey:"src/user.js|createUser|function|1"}],parseErrors:[]};
 const u={path:"src/user.js",language:"JavaScript",lines:8,bytes:200,tokens:40,source:"export function createUser(){ return true; }",symbols:[{name:"createUser",kind:"function",line:1,definitionKey:"src/user.js|createUser|function|1"}],parseErrors:[]};
 return {repository:"fixture",files:[a,u],symbols:[...a.symbols,...u.symbols],references:[],imports:[{from:a.path,to:u.path,module:"./user.js"}],exports:[{path:u.path,name:"createUser"}],dependencies:[{from:a.path,to:u.path,module:"./user.js"}],externalDependencies:[],unresolvedImports:[],languages:{JavaScript:2},stats:{files:2,lines:20,symbols:2,references:0,resolvedReferences:0,unresolvedReferences:0,imports:1,exports:1,internalEdges:1,tokens:110},project:{frameworks:[{name:"Node.js",evidence:"package.json"}],packages:[]}};
}
test("RepoMind parity: indexed and source search",()=>{const i=index();assert.equal(searchSource(i,"password").length,1);assert.ok(searchIndex(i,"createUser").length);assert.ok(hybridSearch(i,"createUser").length);});
test("RepoMind parity: API and security scanners",()=>{const i=index();assert.equal(discoverApis(i)[0].path,"/users");assert.equal(scanSecurity(i)[0].id,"password");});
test("RepoMind parity: analyzers",async()=>{const i=index();assert.equal(getAnalyzers().length,4);assert.ok((await runAnalyzer(i,"routes")).length>=1);});
test("RepoMind parity: reports",()=>{const text=buildDocumentationReport(index(),{routes:discoverApis(index()),security:scanSecurity(index())});assert.match(text,/API Surface/);assert.match(text,/Security Findings/);});
test("RepoMind parity: context selection",()=>{const i=index();const r=selectContext(i,[{path:"src/app.js",line:1}],{maxFiles:2,maxTokens:100});assert.ok(r.files.includes("src/app.js"));});
