import Fastify from"fastify";import cors from"@fastify/cors";import{randomUUID}from"node:crypto";import{resolve}from"node:path";import{fileURLToPath}from"node:url";
import{loadWorldPack,validateWorldPack}from"@masterhost/worldpack-sdk";import{buildDescriptor}from"@masterhost/descriptor";
import{compileWorld,customizeValue,assignEntityImage,regenerateWorld,generationReport,explainValue,compareWorlds,scopeSummary,preserveCustomByPath,assertUniqueMaterializationPaths}from"@masterhost/world-compiler";
import{WorldRepository,exportMhWorldZip,importMhWorldZipWithAssets,withMigrationLock}from"@masterhost/persistence";import{registerRuntime}from"./runtime.js";
const app=Fastify({logger:true});await app.register(cors,{origin:true,methods:["GET","HEAD","POST","PATCH"]});
app.addContentTypeParser("application/vnd.masterhost.world+zip",{parseAs:"buffer",bodyLimit:10_000_000},(_req,body,done)=>done(null,body));
app.addContentTypeParser("application/octet-stream",{parseAs:"buffer",bodyLimit:2_000_000},(_req,body,done)=>done(null,body));
const repositoryRoot=fileURLToPath(new URL("../../../",import.meta.url));
const pack=await loadWorldPack(resolve(repositoryRoot,process.env.WORLD_PACK_PATH??"worldpacks/classic-fantasy-test"));
const databaseUrl=process.env.DATABASE_URL??"postgresql://masterhost:masterhost@localhost:5432/masterhost";
const repo=new WorldRepository(databaseUrl);
app.masterhostWorldRepository=repo;
const realmId="00000000-0000-0000-0000-000000000001";
const must=async(id:string)=>{const w=await repo.get(id);if(!w)throw Object.assign(Error("world not found"),{statusCode:404});return w};

app.get("/health",async()=>({status:"ok",pack:`${pack.manifest.id}@${pack.manifest.version}`}));
app.get("/api/pack",async()=>({manifest:pack.manifest,questions:pack.content.questions,validation:validateWorldPack(pack)}));
app.get("/api/worlds",async()=>repo.list());
app.post("/api/worlds/import",async(req:any)=>{if(!Buffer.isBuffer(req.body))throw Object.assign(Error("mhworld ZIP body required"),{statusCode:415});let result;try{result=importMhWorldZipWithAssets(req.body,realmId)}catch(error){throw Object.assign(Error(error instanceof Error?error.message:"Invalid mhworld archive"),{statusCode:400})}const{world,assets}=result;if(world.packId!==pack.manifest.id||world.packVersion!==pack.manifest.version)throw Object.assign(Error("required World Pack version is not active"),{statusCode:409});assertUniqueMaterializationPaths(world);return repo.saveImported(world,assets)});
app.post("/api/worlds",async(req:any)=>{const seed=req.body?.seed??randomUUID(),choices=Object.entries(req.body?.choices??{}).map(([path,value])=>({path,value:{mode:"explicit"as const,value},locked:Boolean(req.body?.locks?.includes(path))})),descriptor=buildDescriptor({packId:pack.manifest.id,packVersion:pack.manifest.version,choices,seed}),world=compileWorld({realmId,descriptor,pack,seed});assertUniqueMaterializationPaths(world);return repo.save(world,"compile")});
app.get("/api/worlds/:id",async(req:any)=>must(req.params.id));
app.post("/api/worlds/:id/assets",async(req:any)=>{await must(req.params.id);if(!Buffer.isBuffer(req.body))throw Object.assign(Error("binary image required"),{statusCode:415});try{return await repo.putAsset(req.params.id,String(req.query?.name??""),String(req.headers["x-asset-media-type"]??""),req.body)}catch(error){throw Object.assign(Error(error instanceof Error?error.message:"Invalid asset"),{statusCode:400})}});
app.get("/api/worlds/:id/assets/:name",async(req:any,reply)=>{await must(req.params.id);const asset=await repo.asset(req.params.id,req.params.name);if(!asset)throw Object.assign(Error("asset not found"),{statusCode:404});reply.header("content-type",asset.mediaType);reply.header("x-content-type-options","nosniff");reply.header("content-disposition",`${req.query?.inline==="1"?"inline":"attachment"}; filename="${req.params.name}"`);return reply.send(Buffer.from(asset.data))});
app.patch("/api/worlds/:id/entities/:entityId/assets/:role",async(req:any)=>{const world=await must(req.params.id);try{return await repo.save(assignEntityImage(world,req.params.entityId,req.params.role,req.body?.name),`image:${req.params.entityId}.${req.params.role}`)}catch(error){if(error&&typeof error==="object"&&"statusCode" in error)throw error;throw Object.assign(Error(error instanceof Error?error.message:"Invalid image assignment"),{statusCode:400})}});

app.patch("/api/worlds/:id/values",async(req:any)=>{const w=await must(req.params.id);return repo.save(customizeValue(w,req.body.entityId,req.body.key,req.body.value,req.body.locked??true),`customize:${req.body.entityId}.${req.body.key}`)});

app.get("/api/worlds/:id/report",async(req:any)=>generationReport(await must(req.params.id)));
app.get("/api/worlds/:id/entities/:entityId/explain/:key",async(req:any)=>explainValue(await must(req.params.id),req.params.entityId,req.params.key));
app.get("/api/worlds/:id/scope/:entityId",async(req:any)=>scopeSummary(await must(req.params.id),req.params.entityId));

app.post("/api/worlds/:id/regenerate/preview",async(req:any)=>{const w=await must(req.params.id),fresh=compileWorld({realmId:w.realmId,descriptor:w.descriptor,pack,seed:`${w.seed}:regen:${w.revision+1}`,worldId:w.id});preserveCustomByPath(w,fresh);return compareWorlds(w,fresh)});
app.post("/api/worlds/:id/regenerate",async(req:any)=>{const w=await must(req.params.id);await repo.snapshot(w,req.body?.snapshotName??`Before regeneration r${w.revision}`);const fresh=compileWorld({realmId:w.realmId,descriptor:w.descriptor,pack,seed:`${w.seed}:regen:${w.revision+1}`,worldId:w.id});preserveCustomByPath(w,fresh);fresh.createdAt=w.createdAt;fresh.assets=w.assets;fresh.revision=w.revision+1;return repo.save(fresh,"regenerate")});

app.get("/api/worlds/:id/revisions",async(req:any)=>repo.revisions(req.params.id));
app.get("/api/worlds/:id/snapshots",async(req:any)=>repo.snapshots(req.params.id));
app.post("/api/worlds/:id/snapshots",async(req:any)=>{const w=await must(req.params.id);return repo.snapshot(w,req.body?.name??`Snapshot r${w.revision}`)});
app.post("/api/snapshots/:id/restore",async(req:any)=>repo.restore(req.params.id));
app.post("/api/worlds/:id/fork",async(req:any)=>{const w=await must(req.params.id);return repo.fork(w,req.body?.name??`${w.name} Fork`)});

app.get("/api/worlds/:id/export",async(req:any,reply)=>{const w=await must(req.params.id),bytes=exportMhWorldZip(w,await repo.assets(w.id));reply.header("content-type","application/vnd.masterhost.world+zip");reply.header("content-disposition",`attachment; filename="${w.name.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}.mhworld"`);return reply.send(Buffer.from(bytes))});

app.masterhostPack=pack;
await withMigrationLock(databaseUrl,async()=>{await repo.migrate();await registerRuntime(app,{db:databaseUrl,realmId})});

app.setErrorHandler((err,req,reply)=>{req.log.error(err);const error=err instanceof Error?err:new Error(String(err));reply.code((error as Error&{statusCode?:number}).statusCode??400).send({error:"masterhost_error",message:error.message})});
await app.listen({host:"0.0.0.0",port:Number(process.env.PORT??8080)});
