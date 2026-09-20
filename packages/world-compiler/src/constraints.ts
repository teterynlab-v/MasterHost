import type{MaterializedWorld}from"@masterhost/domain";import{queryEntities,type EntityQuery,type WorldRelation}from"./relations.js";
export type ConstraintSpec=
 |{id:string;type:"entity-count";query:EntityQuery;min?:number;max?:number;exactly?:number}
 |{id:string;type:"relation-count";relation:string;min?:number;max?:number;exactly?:number};
export interface ConstraintResult{id:string;passed:boolean;expected:string;actual:number}
const result=(id:string,n:number,min?:number,max?:number,exactly?:number):ConstraintResult=>({id,actual:n,passed:exactly!==undefined?n===exactly:(min===undefined||n>=min)&&(max===undefined||n<=max),expected:exactly!==undefined?`exactly ${exactly}`:`${min??"-∞"}..${max??"∞"}`});
export function evaluateConstraints(world:MaterializedWorld,rels:WorldRelation[],specs:ConstraintSpec[]=[]){return specs.map(c=>c.type==="entity-count"?result(c.id,queryEntities(world,c.query).length,c.min,c.max,c.exactly):result(c.id,rels.filter(r=>r.type===c.relation).length,c.min,c.max,c.exactly))}
