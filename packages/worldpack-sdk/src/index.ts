import{readFile,readdir}from"node:fs/promises";import{join,relative,resolve}from"node:path";import YAML from"yaml";import{z}from"zod";import type{CharacterCreationSchema}from"@masterhost/domain";
import { validateRuntimePack } from "./runtime-validation.js";
const Id=z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
export const ManifestSchema=z.object({id:z.string(),name:z.string(),version:z.string(),schemaVersion:z.literal("0.1"),defaultArtSet:z.string(),entryTemplate:Id});
const Question=z.object({id:Id,label:z.string(),type:z.literal("choice"),options:z.array(z.object({value:z.string(),label:z.string()})).min(1),default:z.string()});
export const ValueSpecSchema:z.ZodType<any>=z.lazy(()=>z.union([
 z.object({value:z.unknown()}),z.object({descriptor:z.string(),default:z.unknown().optional()}),z.object({generator:Id}),
 z.object({expression:z.string()}),z.object({param:z.string(),default:z.unknown().optional()}),z.object({parent:z.string(),default:z.unknown().optional()})
]));
const Condition:z.ZodType<any>=z.lazy(()=>z.union([
 z.object({eq:z.tuple([z.any(),z.any()])}),z.object({ne:z.tuple([z.any(),z.any()])}),
 z.object({in:z.tuple([z.any(),z.array(z.any())])}),z.object({gte:z.tuple([z.any(),z.any()])}),z.object({lte:z.tuple([z.any(),z.any()])}),
 z.object({all:z.array(Condition)}),z.object({any:z.array(Condition)}),z.object({not:Condition})
]));
const Component=z.object({template:Id,count:z.union([z.number().int().positive(),ValueSpecSchema]).optional(),when:Condition.optional(),parameters:z.record(z.string(),ValueSpecSchema).optional()});
const Parameter=z.object({required:z.boolean().optional(),default:z.unknown().optional()});
const Template=z.object({kind:z.string(),parameters:z.record(z.string(),Parameter).optional(),values:z.record(z.string(),ValueSpecSchema).optional(),traits:z.array(Id).optional(),tags:z.array(z.string()).optional(),components:z.record(z.string(),Component).optional()});
const Generator=z.discriminatedUnion("type",[z.object({type:z.literal("values"),values:z.array(z.unknown()).min(1)}),z.object({type:z.literal("weighted-table"),entries:z.array(z.object({value:z.unknown(),weight:z.number().positive()})).min(1)}),z.object({type:z.literal("integer-range"),min:z.number().int(),max:z.number().int()})]);
const Trait=z.object({id:Id,when:Condition.optional(),addTags:z.array(z.string()).optional(),set:z.record(z.string(),z.unknown()).optional(),multiply:z.record(z.string(),z.number()).optional()});
const Resource=z.object({label:z.string(),min:z.number().finite().optional(),max:z.number().finite().optional(),default:z.number().finite()}).strict().refine(x=>x.min===undefined||x.max===undefined||x.min<=x.max,{message:"resource min exceeds max"});
const ActorTemplate=z.object({label:z.string().trim().min(1).max(80),resources:z.record(Id,z.number().finite()).optional(),attributes:z.record(Id,z.number().finite()).optional(),worldEntityKinds:z.array(Id).min(1).optional()}).strict();
const Effect=z.object({label:z.string(),duration:z.object({type:z.enum(["turns","rounds","session","permanent"]),value:z.number().int().positive().optional()}).strict().optional(),modifiers:z.record(Id,z.number().finite()).optional()}).strict();
const Target=z.enum(["self","actor","none","single-actor","multiple-actors"]);
const StepCondition=z.object({previousOutcome:z.enum(["success","failure"])}).strict();
const ActionStep=z.union([
 z.object({check:z.object({id:Id,against:z.union([z.number().finite(),z.string()]).optional()}).strict(),when:StepCondition.optional()}).strict(),
 z.object({roll:z.object({id:Id,dice:z.string()}).strict(),when:StepCondition.optional()}).strict(),
 z.object({resource:z.object({target:z.enum(["actor","target"]),resource:Id,operation:z.enum(["add","subtract","set"]),value:z.union([z.number().finite(),z.string()])}).strict(),when:StepCondition.optional()}).strict(),
 z.object({effect:z.object({target:z.enum(["actor","target"]),id:Id}).strict(),when:StepCondition.optional()}).strict()
]);
const Action=z.union([
 z.object({label:z.string(),target:Target,steps:z.array(ActionStep).min(1)}).strict(),
 z.object({label:z.string(),target:Target,kind:z.enum(["check","resource","effect","custom"]),checkId:Id.optional(),resource:Id.optional(),operation:z.enum(["add","subtract","set"]).optional(),amount:z.number().finite().optional(),effectId:Id.optional()}).strict()
]);
const CharacterField=z.object({id:Id,label:z.string(),type:z.enum(["text","choice","number"]),required:z.boolean().optional(),options:z.array(z.object({value:z.string(),label:z.string()})).optional(),min:z.number().finite().optional(),max:z.number().finite().optional(),default:z.unknown().optional()});
const CharacterCreation=z.object({steps:z.array(z.object({id:Id,title:z.string(),fields:z.array(CharacterField)}))});
export const PackSchema=z.object({questions:z.array(Question),generators:z.record(z.string(),Generator),templates:z.record(z.string(),Template),traits:z.record(z.string(),Trait).optional(),relations:z.array(z.any()).optional(),constraints:z.array(z.any()).optional(),dependencies:z.array(z.any()).optional(),characterCreation:CharacterCreation.optional(),checks:z.record(z.string(),z.object({label:z.string(),dice:z.string(),modifierField:Id.optional()}).strict()).optional(),
resources:z.record(Id,Resource).optional(),effects:z.record(Id,Effect).optional(),actions:z.record(Id,Action).optional(),actorTemplates:z.record(Id,ActorTemplate).optional(),encounter:z.object({orderingPolicy:z.enum(["none","fixed","rolled","attribute","custom"]),attributeField:Id.optional()}).strict().optional()});
export type LoadedWorldPack={manifest:z.infer<typeof ManifestSchema>;content:z.infer<typeof PackSchema>;root:string;assets:string[]};
async function files(root:string,cur:string):Promise<string[]>{let out:string[]=[];for(const e of await readdir(cur,{withFileTypes:true}).catch(()=>[])){const p=join(cur,e.name);if(e.isDirectory())out.push(...await files(root,p));else out.push(relative(root,p))}return out}
export async function loadWorldPack(input:string):Promise<LoadedWorldPack>{const root=resolve(input),manifest=ManifestSchema.parse(YAML.parse(await readFile(join(root,"manifest.yaml"),"utf8"))),content=PackSchema.parse(YAML.parse(await readFile(join(root,"pack.yaml"),"utf8")));if(!content.templates[manifest.entryTemplate])throw Error(`Missing entry template ${manifest.entryTemplate}`);
 for(const[id,t]of Object.entries(content.templates)){for(const v of Object.values(t.values??{}))if((v as any).generator&&!content.generators[(v as any).generator])throw Error(`Template ${id}: missing generator ${(v as any).generator}`);for(const c of Object.values(t.components??{})){if(!content.templates[c.template])throw Error(`Template ${id}: missing template ${c.template}`);if((c.count as any)?.generator&&!content.generators[(c.count as any).generator])throw Error(`Template ${id}: missing count generator ${(c.count as any).generator}`)}for(const tr of t.traits??[])if(!content.traits?.[tr])throw Error(`Template ${id}: missing trait ${tr}`)}
 for(const[id,action]of Object.entries(content.actions??{})){
  if("steps" in action){for(const step of action.steps){if("check" in step&&!content.checks?.[step.check.id])throw Error(`Action ${id}: missing check ${step.check.id}`);if("resource" in step&&!content.resources?.[step.resource.resource])throw Error(`Action ${id}: missing resource ${step.resource.resource}`);if("effect" in step&&!content.effects?.[step.effect.id])throw Error(`Action ${id}: missing effect ${step.effect.id}`)}}
  else{if(action.checkId&&!content.checks?.[action.checkId])throw Error(`Action ${id}: missing check ${action.checkId}`);if(action.resource&&!content.resources?.[action.resource])throw Error(`Action ${id}: missing resource ${action.resource}`);if(action.effectId&&!content.effects?.[action.effectId])throw Error(`Action ${id}: missing effect ${action.effectId}`)}
 }
 for(const[id,template]of Object.entries(content.actorTemplates??{})){
  for(const[resourceId,value]of Object.entries(template.resources??{})){const resource=content.resources?.[resourceId];if(!resource)throw Error(`Actor template ${id}: unknown resource ${resourceId}`);if(resource.min!==undefined&&value<resource.min||resource.max!==undefined&&value>resource.max)throw Error(`Actor template ${id}: resource ${resourceId} outside bounds`)}
  const kinds=new Set(Object.values(content.templates).map(value=>value.kind));
  for(const kind of template.worldEntityKinds??[])if(!kinds.has(kind))throw Error(`Actor template ${id}: unknown World entity kind ${kind}`);
 }
 validateRuntimePack(content);
 return{manifest,content,root,assets:await files(root,join(root,"assets"))}}
export function validateWorldPack(p:LoadedWorldPack){return{valid:true as const,id:p.manifest.id,version:p.manifest.version,questions:p.content.questions.length,templates:Object.keys(p.content.templates).length,generators:Object.keys(p.content.generators).length,traits:Object.keys(p.content.traits??{}).length,assets:p.assets.length}}
export function validateCharacterValues(schema:CharacterCreationSchema,values:unknown):Record<string,unknown>{
 if(!values||typeof values!=="object"||Array.isArray(values))throw Error("character values must be an object");
 const fields=schema.steps.flatMap(step=>step.fields),allowed=new Set(fields.map(field=>field.id)),data=values as Record<string,unknown>;
 for(const key of Object.keys(data))if(!allowed.has(key))throw Error(`unknown character field ${key}`);
 for(const field of fields){const value=data[field.id];if(value===undefined||value===null||value===""){if(field.required)throw Error(`required character field ${field.id}`);continue}
  if(field.type==="text"&&(typeof value!=="string"||value.length>200))throw Error(`invalid text field ${field.id}`);
  if(field.type==="number"&&(typeof value!=="number"||!Number.isFinite(value)||field.min!==undefined&&value<field.min||field.max!==undefined&&value>field.max))throw Error(`invalid number field ${field.id}`);
  if(field.type==="choice"&&!field.options?.some(option=>option.value===value))throw Error(`invalid choice field ${field.id}`);
 }
 return data;
}
