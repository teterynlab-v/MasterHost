export async function restoreSavedWorld<T>(key:string,storage:Pick<Storage,'getItem'>,load:(id:string)=>Promise<T>,activate:(world:T)=>Promise<void>):Promise<boolean>{
 const id=storage.getItem(key);
 if(!id)return false;
 // An unavailable API is not evidence that the saved World was deleted.
 await activate(await load(id));
 return true;
}
