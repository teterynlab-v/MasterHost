import type{MaterializedWorld,WorldDescriptor}from"@masterhost/domain";import type{LoadedWorldPack}from"@masterhost/worldpack-sdk";import{compileWorld}from"./index.js";import{materializeRelations,type RelationRule}from"./relation-materializer.js";import{evaluateConstraints,type ConstraintSpec}from"./constraints.js";
export interface ConstraintCompileResult{world:MaterializedWorld;relations:ReturnType<typeof materializeRelations>;attempt:number;constraints:ReturnType<typeof evaluateConstraints>}
export function compileSatisfying(a:{realmId:string;descriptor:WorldDescriptor;pack:LoadedWorldPack;seed:string;worldId?:string;maxAttempts?:number}):ConstraintCompileResult{
 const rules=((a.pack.content as any).relations??[])as RelationRule[],specs=((a.pack.content as any).constraints??[])as ConstraintSpec[],max=a.maxAttempts??20;let last:any;
 for(let i=0;i<max;i++){const seed=i===0?a.seed:`${a.seed}:attempt:${i}`,world=compileWorld({...a,seed}),relations=materializeRelations(world,rules),constraints=evaluateConstraints(world,relations,specs);last={world,relations,attempt:i+1,constraints};if(constraints.every(x=>x.passed))return last}
 const failed=last.constraints.filter((x:any)=>!x.passed).map((x:any)=>`${x.id}: expected ${x.expected}, actual ${x.actual}`).join("; ");throw Error(`Unable to satisfy constraints after ${max} attempts: ${failed}`);
}
