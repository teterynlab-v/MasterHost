import type{MaterializedWorld,WorldEntity}from"@masterhost/domain";
export interface WorldRelation{id:string;from:string;type:string;to:string;source:"generated"|"custom";sourceRef?:string}
export interface EntityQuery{kind?:string;tags?:string[];excludeSelf?:boolean}
export function queryEntities(world:MaterializedWorld,q:EntityQuery,self?:WorldEntity){return world.entities.filter(e=>(!q.kind||e.kind===q.kind)&&(!q.tags||q.tags.every(t=>e.tags.includes(t)))&&(!q.excludeSelf||e.id!==self?.id))}
export function validateRelations(world:MaterializedWorld,rels:WorldRelation[]){const ids=new Set(world.entities.map(e=>e.id)),errors:string[]=[];for(const r of rels){if(!ids.has(r.from))errors.push(`relation ${r.id}: missing from ${r.from}`);if(!ids.has(r.to))errors.push(`relation ${r.id}: missing to ${r.to}`)}return errors}
