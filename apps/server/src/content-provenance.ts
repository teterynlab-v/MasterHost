import type { MaterializedWorld } from '@masterhost/domain';

/** Metadata for display only: never rewrite an immutable World or user-authored text. */
export function authoredFieldSource(field: {value:unknown;source?:string}|undefined, displayed:unknown):string {
 return field && field.value === displayed ? field.source ?? 'generated' : 'custom';
}
export function withSceneProvenance<T extends {id:string;title:string;summary?:string;sourceEntityId?:string}>(scene:T,world:MaterializedWorld){
 const entity=world.entities.find(value=>value.id===(scene.sourceEntityId??scene.id));
 return {...scene,titleSource:authoredFieldSource(entity?.values.name,scene.title),summarySource:authoredFieldSource(entity?.values.description,scene.summary)};
}
export function withNodeProvenance<T extends {id:string;locationId?:string;label:string}>(node:T,world:MaterializedWorld){
 const entity=world.entities.find(value=>value.id===(node.locationId??node.id));
 return {...node,labelSource:authoredFieldSource(entity?.values.name,node.label)};
}
export function withActorProvenance<T extends {kind?:string;label?:string;labelSource?:string;templateId?:string;worldEntityId?:string;worldEntityLabel?:string}>(actor:T,world:MaterializedWorld,templates:Record<string,{label:string}>){
 const entity=world.entities.find(value=>value.id===actor.worldEntityId);
 const worldEntityNameSource=authoredFieldSource(entity?.values.name,actor.worldEntityLabel);
 const template=actor.templateId?templates[actor.templateId]:undefined;
 const labelSource=actor.labelSource??(actor.kind==='npc'?(actor.label===actor.worldEntityLabel?worldEntityNameSource:template&&actor.label===template.label?'pack':'custom'):'custom');
 return {...actor,labelSource,worldEntityNameSource};
}
export function packContentMetadata(pack:{manifest:{id:string};universe?:{id:string;localization:unknown}}){
 return {manifest:{id:pack.manifest.id},...(pack.universe?{universe:{id:pack.universe.id,localization:pack.universe.localization}}:{})};
}
