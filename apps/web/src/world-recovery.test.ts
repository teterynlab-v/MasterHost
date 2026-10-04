import {describe,it,expect,vi} from 'vitest';
import {restoreSavedWorld} from './world-recovery.js';
describe('saved World recovery',()=>{
 it('retries the same saved World after a temporary API failure without clearing selection',async()=>{const removeItem=vi.fn(),storage={getItem:()=> 'saved-world',removeItem},load=vi.fn().mockRejectedValueOnce(Error('offline')).mockResolvedValue({id:'saved-world'}),activate=vi.fn();await expect(restoreSavedWorld('world-key',storage,load,activate)).rejects.toThrow('offline');expect(removeItem).not.toHaveBeenCalled();await expect(restoreSavedWorld('world-key',storage,load,activate)).resolves.toBe(true);expect(load).toHaveBeenNthCalledWith(2,'saved-world');expect(activate).toHaveBeenCalledWith({id:'saved-world'})});
 it('preserves selection when auxiliary World metadata fails',async()=>{const storage={getItem:()=> 'saved-world',removeItem:vi.fn()};await expect(restoreSavedWorld('world-key',storage,async()=>({id:'saved-world'}),async()=>{throw Error('report unavailable')})).rejects.toThrow('report unavailable');expect(storage.removeItem).not.toHaveBeenCalled()});
 it('does not create a World when no selection exists',async()=>{const load=vi.fn(),activate=vi.fn();expect(await restoreSavedWorld('world-key',{getItem:()=>null},load,activate)).toBe(false);expect(load).not.toHaveBeenCalled();expect(activate).not.toHaveBeenCalled()});
});
