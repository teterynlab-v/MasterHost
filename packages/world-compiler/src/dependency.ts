export interface DependencyNode{id:string;dependsOn:string[]}
export function topologicalSort(nodes:DependencyNode[]):string[]{
 const map=new Map(nodes.map(n=>[n.id,n])),state=new Map<string,0|1|2>(),out:string[]=[],stack:string[]=[];
 const visit=(id:string)=>{const s=state.get(id)??0;if(s===2)return;if(s===1){const i=stack.indexOf(id);throw Error(`Dependency cycle: ${[...stack.slice(i),id].join(" -> ")}`)}
  const n=map.get(id);if(!n)throw Error(`Missing dependency node '${id}'`);state.set(id,1);stack.push(id);
  for(const dep of n.dependsOn){if(!map.has(dep))throw Error(`'${id}' depends on missing '${dep}'`);visit(dep)}
  stack.pop();state.set(id,2);out.push(id);
 };for(const n of nodes)visit(n.id);return out;
}
