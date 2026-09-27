import type {CampaignRecap,TimelineEvent} from '@masterhost/game-runtime';
import type {MaterializedWorld} from '@masterhost/domain';
/** Only display fields from recap-visible events are projected; stored text and IDs stay canonical. */
export function withRecapDisplay(recap:CampaignRecap,events:TimelineEvent[],world:MaterializedWorld,actions:Record<string,{label:string}>){
 const bySequence=new Map(events.map(event=>[event.sequence,event]));
 return {...recap,entries:recap.entries.map(entry=>{
  const event=bySequence.get(entry.sequence),p=event?.payload??{};
  const display=(template:string,values:Record<string,{value:string;source:string}>={})=>({...entry,display:{template,values}});
  if(entry.type==='TravelCompleted'||entry.type==='ActorMoved'){
   const id=p.toLocationId??p.locationId,entity=world.entities.find(value=>value.id===id),name=entity?.values.name;
   // An explicit differing locationName is custom, even if it matches another authored string.
   const value=String(p.locationName??name?.value??id??'a new location');
   const source=p.locationName!==undefined&&p.locationName!==name?.value?'custom':name?.source??(id?'custom':'pack');
   return display('Travelled to {location}.',{location:{value,source}});
  }
  if(entry.type==='CheckResolved')return display('Check resolved: {outcome}.',{outcome:{value:String(p.outcome??'resolved'),source:'pack'}});
  if(entry.type==='ActionResolved'){
   const action=actions[String(p.actionId)];
   return p.actionId?display('Action {action} completed.',{action:{value:action?.label??String(p.actionId),source:action?'pack':'custom'}}):display('An action completed.');
  }
  if(entry.type==='EncounterStarted')return display('An encounter began.');
  if(entry.type==='EncounterEnded')return display('The encounter ended.');
  if(entry.type==='CanonFactPromoted')return display('Canon established: {title}.',{title:{value:String(p.title??p.key??'new fact'),source:p.title!==undefined||p.key!==undefined?'custom':'pack'}});
  // NarrativeEventRecorded is user text, never a template, even if it equals a system caption.
  return entry;
 })};
}
