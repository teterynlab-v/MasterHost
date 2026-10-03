import {describe,it,expect} from 'vitest';
import Fastify from 'fastify';
import {registerSessionAdmin} from './session-admin.js';

describe('session administration authorization and lifecycle',()=>{
 const setup=async(role:string|null='owner')=>{
  const app=Fastify(),calls:string[]=[];
  await registerSessionAdmin(app,{
   authorize:async()=>{if(role!=='owner')throw Object.assign(Error('admin required'),{statusCode:403});return 'realm-a'},
   list:async realm=>{calls.push(realm);return []},
   manage:async(realm,id,action,expectedState,participantId)=>{calls.push([realm,id,action,expectedState,participantId].join(':'));return {id,state:action==='resume'?'live':'finished'}},
   notify:async(id,action)=>{calls.push(`notify:${id}:${action}`)},
  });return {app,calls};
 };
 it('rejects ordinary players before reading sessions',async()=>{const {app,calls}=await setup('player');expect((await app.inject('/api/admin/sessions')).statusCode).toBe(403);expect(calls).toEqual([]);await app.close()});
 it('scopes listing to the authenticated Realm',async()=>{const {app,calls}=await setup();expect((await app.inject('/api/admin/sessions')).statusCode).toBe(200);expect(calls).toEqual(['realm-a']);await app.close()});
 it('requires an observed state and rejects unsupported operations',async()=>{const {app,calls}=await setup();for(const payload of [{action:'delete',expectedState:'live'},{action:'finish'}])expect((await app.inject({method:'POST',url:'/api/admin/sessions/s1/manage',payload})).statusCode).toBe(400);expect(calls).toEqual([]);await app.close()});
 it('persists the scoped operation before notifying connected clients',async()=>{const {app,calls}=await setup();const r=await app.inject({method:'POST',url:'/api/admin/sessions/s1/manage',payload:{action:'finish',expectedState:'live'}});expect(r.statusCode).toBe(200);expect(calls).toEqual(['realm-a:s1:finish:live:','notify:s1:finish']);await app.close()});
});
