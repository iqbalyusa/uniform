// Hosted identity is injected and validated by Sites dispatch, never by browser storage.
export async function getChatGPTUser(request?:Request){
 if(!request)return null;
 const userId=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');if(!userId||!email)return null;
 let fullName=request.headers.get('oai-authenticated-user-full-name');if(fullName&&request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){try{fullName=decodeURIComponent(fullName);}catch{fullName=null;}}
 return {userId,email,displayName:fullName||email};
}
