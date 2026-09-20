export type Operand = string|number|boolean|null|{descriptor:string}|{param:string}|{self:string}|{parent:string};
export type Condition={eq:[Operand,Operand]}|{ne:[Operand,Operand]}|{in:[Operand,(string|number|boolean|null)[]]}|{gte:[Operand,Operand]}|{lte:[Operand,Operand]}|{all:Condition[]}|{any:Condition[]}|{not:Condition};
export interface EvalContext{descriptor:Record<string,unknown>;params:Record<string,unknown>;self:Record<string,unknown>;parent:Record<string,unknown>}
const get=(o:any,p:string)=>p.split(".").reduce((x,k)=>x?.[k],o);
export const operand=(x:Operand,c:EvalContext):unknown=>{
 if(x===null||typeof x!=="object")return x;
 if("descriptor"in x)return c.descriptor[x.descriptor]??get(c.descriptor,x.descriptor);
 if("param"in x)return get(c.params,x.param);
 if("self"in x)return get(c.self,x.self);
 return get(c.parent,x.parent);
};
export function condition(x:Condition|undefined,c:EvalContext):boolean{
 if(!x)return true;
 if("eq"in x)return operand(x.eq[0],c)===operand(x.eq[1],c);
 if("ne"in x)return operand(x.ne[0],c)!==operand(x.ne[1],c);
 if("in"in x)return x.in[1].includes(operand(x.in[0],c) as any);
 if("gte"in x)return Number(operand(x.gte[0],c))>=Number(operand(x.gte[1],c));
 if("lte"in x)return Number(operand(x.lte[0],c))<=Number(operand(x.lte[1],c));
 if("all"in x)return x.all.every(y=>condition(y,c));
 if("any"in x)return x.any.some(y=>condition(y,c));
 return !condition(x.not,c);
}

export interface TraitSpec{id:string;when?:Condition;addTags?:string[];set?:Record<string,unknown>;multiply?:Record<string,number>}
export function applyTraits(values:Record<string,unknown>,tags:string[],traits:TraitSpec[],ctx:EvalContext){
 const v={...values},t=[...tags];for(const tr of traits){if(!condition(tr.when,{...ctx,self:v}))continue;
 for(const[k,x]of Object.entries(tr.set??{}))v[k]=x;for(const[k,m]of Object.entries(tr.multiply??{}))v[k]=Number(v[k]??0)*m;
 for(const x of tr.addTags??[])if(!t.includes(x))t.push(x)}return{values:v,tags:t}
}
