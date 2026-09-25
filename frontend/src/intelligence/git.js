const text=async h=>{try{return await (await h.getFile()).text()}catch{return null}};
async function child(dir,name){try{return await dir.getDirectoryHandle(name)}catch{return null}}
async function file(dir,name){try{return await dir.getFileHandle(name)}catch{return null}}
export async function readGitMetadata(root){
 const git=await child(root,'.git'); if(!git)return {available:false,reason:'No .git directory is accessible.'};
 const headFile=await file(git,'HEAD'); const head=headFile?await text(headFile):null;
 let branch=null,commit=null;
 if(head?.startsWith('ref: ')){branch=head.slice(5).trim().split('/').pop()||null; const parts=head.slice(5).trim().split('/'); let d=git; for(const p of parts.slice(1,-1)){d=await child(d,p);if(!d)break} const f=d&&await file(d,parts.at(-1)); commit=f?await text(f):null} else commit=head;
 let remote=null; const cf=await file(git,'config'); const config=cf?await text(cf):''; const match=config.match(/\[remote\s+"origin"\][^\[]*?url\s*=\s*(.+)/s); if(match)remote=match[1].trim();
 return {available:true,branch:branch||'detached HEAD',commit:commit?.trim()||null,remote,detached:!branch};
}