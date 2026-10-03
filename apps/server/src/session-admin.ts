import type {FastifyInstance,FastifyRequest} from 'fastify';
export type AdminSessionAction='finish'|'resume'|'remove';
type Dependencies={
 authorize:(req:FastifyRequest)=>Promise<string>;
 list:(realmId:string)=>Promise<unknown>;
 manage:(realmId:string,id:string,action:AdminSessionAction,expectedState:string,participantId?:string)=>Promise<unknown>;
 notify:(id:string,action:AdminSessionAction,participantId?:string)=>Promise<void>;
};
export async function registerSessionAdmin(app:FastifyInstance,deps:Dependencies){
 app.get('/api/admin/sessions',async req=>deps.list(await deps.authorize(req)));
 app.post<{Params:{id:string};Body:{action?:AdminSessionAction;expectedState?:string;participantId?:string}}>('/api/admin/sessions/:id/manage',async req=>{
  const realmId=await deps.authorize(req),{action,expectedState,participantId}=req.body??{};
  if(!action||!['finish','resume','remove'].includes(action)||!expectedState||!['preparing','lobby','live','finished','cancelled'].includes(expectedState)||action==='remove'&&typeof participantId!=='string')throw Object.assign(Error('invalid session management operation'),{statusCode:400});
  const result=await deps.manage(realmId,req.params.id,action,expectedState,participantId);
  await deps.notify(req.params.id,action,participantId);return result;
 });
}
