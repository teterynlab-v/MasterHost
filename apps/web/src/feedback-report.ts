export function buildFeedbackReport(input:Record<string,unknown> & {description:string;locale:string;hash:string;version?:string}){
 const description=input.description.trim().slice(0,4000);
 if(!description)throw Error('A description is required');
 const screen=input.hash.replace(/^#/,'');
 return {format:'masterhost.feedback.v1',version:input.version??'development',locale:input.locale,screen:['gm','join','game','universes','game-builder','admin','world'].includes(screen)?screen:'other',description};
}
