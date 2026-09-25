const DB='repothink-cache',VERSION=1,STORE='indexes';
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function serializable(index){
 const copy=JSON.parse(JSON.stringify(index,(key,value)=>{
  if(key==='_fileHandles')return undefined;
  if(key==='resolvedSymbols'&&Array.isArray(value))return value.map(s=>typeof s==='string'?s:s?.definitionKey).filter(Boolean);
  if(key==='references'&&Array.isArray(value)&&value.some(x=>x?.from&&x?.name&&x?.line))return value.map(x=>({from:x.from,name:x.name,line:x.line,column:x.column,resolvedSymbols:(x.resolvedSymbols||[]).map(s=>typeof s==='string'?s:s?.definitionKey).filter(Boolean)}));
  if(key==='importedBy'&&Array.isArray(value))return value.map(x=>({from:x.from,to:x.to,local:x.local,line:x.line,imported:x.imported,kind:x.kind}));
  return value;
 }));
 return copy;
}
export async function saveIndex(key,index){try{const db=await openDb();const value=serializable(index);return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error)})}catch{return false}}
export async function loadIndex(key){try{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}catch{return null}}
export async function clearIndex(key){try{const db=await openDb();return await new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)})}catch{return false}}