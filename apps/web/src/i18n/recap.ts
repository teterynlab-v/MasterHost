import {authoredValue} from './content.js';
export type RecapDisplayEntry={text:string;display?:{template:string;values:Record<string,{value:string;source:string}>}};
/** Translate the caption before inserting values, so user text containing braces stays literal. */
export function recapEntryText(entry:RecapDisplayEntry,c:(source:unknown)=>string){
 if(!entry.display)return entry.text;
 const {template,values}=entry.display;
 return c(template).replace(/\{(\w+)\}/g,(token:string,key:string)=>values[key]?authoredValue(values[key],c):token);
}
