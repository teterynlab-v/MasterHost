/** Localization is a display operation; never write these results into descriptors or runtime actions. */
export type ContentStrings = Record<string, string>;
export type ContentLocalization = {sourceLocale?:string; strings:Record<string, ContentStrings>};
export type ContentPack = {manifest?:{id?:string};universe?:{id?:string;localization?:ContentLocalization};localization?:ContentLocalization};
export type ContentDictionaries = Record<string, Record<string, ContentStrings>>;
export function contentScope(id:string|undefined){return id?.replace(/^masterhost\./,'');}
export function createContentTranslator(locale:string,dictionaries:ContentDictionaries,pack?:ContentPack){
 const localization=pack?.universe?.localization??pack?.localization;
 const scope=contentScope(pack?.universe?.id??pack?.manifest?.id);
 return (source:unknown,explicitScope?:string,localeKey?:string):string=>{
  if(source===undefined||source===null)return '';
  const text=String(source),sourceLocale=localization?.sourceLocale??'en';
  const target=localization?.strings[locale],sourceStrings=localization?.strings[sourceLocale];
  const key=localeKey??(sourceStrings?Object.keys(sourceStrings).find(key=>sourceStrings[key]===text):undefined);
  const owned=(key?target?.[key]:undefined)??target?.[text];
  if(owned!==undefined)return owned;
  const selected=contentScope(explicitScope)??scope;
  const scoped=selected?dictionaries[selected]?.[locale]?.[text]:undefined;
  if(scoped!==undefined)return scoped;
  const common=dictionaries._ui?.[locale]?.[text];
  if(common!==undefined)return common;
  // Detached schema/definition responses can still render bundled content. Ambiguous copy stays source.
  if(!selected||!dictionaries[selected]){const candidates=new Set(Object.values(dictionaries).flatMap(locales=>locales[locale]?.[text]!==undefined?[locales[locale]![text]!]:[]));if(candidates.size===1)return [...candidates][0]!;}
  return text;
 };
}
export function authoredValue(value:{value?:unknown;source?:string}|undefined,c:(source:unknown)=>string){return value?.source==='custom'||value?.source==='runtime'?String(value?.value??''):c(value?.value);}
export function authoredActorLabel(actor:{label?:string;worldEntityId?:string;worldEntityLabel?:string;labelSource?:string;worldEntityNameSource?:string},c:(source:unknown)=>string){
 if(actor.labelSource==='custom'||actor.labelSource==='runtime')return actor.label??'';
 if(actor.labelSource==='pack')return c(actor.label);
 if(actor.worldEntityId&&actor.label===actor.worldEntityLabel)return authoredValue({value:actor.label,source:actor.worldEntityNameSource},c);
 return actor.label??'';
}
/** Field labels are authored; the input ID remains the runtime attribute key. */
export function contentFieldLabel(id:string,schema?:{steps:{fields:{id:string;label:string}[]}[]}){return schema?.steps.flatMap(step=>step.fields).find(field=>field.id===id)?.label??id.replace(/[._-]/g,' ').replace(/(^|\s)([a-z])/g,(_,space:string,letter:string)=>space+letter.toUpperCase());}
