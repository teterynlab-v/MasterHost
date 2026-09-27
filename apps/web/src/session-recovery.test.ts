import {afterEach,describe,expect,it,vi} from "vitest";
import {sessionSocket} from "./session-client.js";
class Socket {static last:Socket;onclose?: (event:{code:number})=>void;onopen?:()=>void;onmessage?:()=>void;onerror?:()=>void;constructor(public url:string){Socket.last=this}send(){}close(){this.onclose?.({code:1000})}}
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers()});
function setup(){vi.stubGlobal("location",{origin:"http://localhost"});vi.stubGlobal("sessionStorage",{getItem:()=>null,setItem:()=>{}});vi.stubGlobal("navigator",{onLine:true});vi.stubGlobal("WebSocket",Socket);vi.stubGlobal("addEventListener",()=>{});vi.stubGlobal("removeEventListener",()=>{});vi.stubGlobal("window",globalThis);vi.useFakeTimers();const statuses:string[]=[];return{statuses,connection:sessionSocket("session","saved-token",()=>{},s=>statuses.push(s))}}
describe("M30 saved player recovery",()=>{
 it("component cleanup does not announce credential revocation",()=>{const{statuses,connection}=setup();connection.close();expect(statuses).toEqual(["connecting"]);expect(vi.getTimerCount()).toBe(0)});
 it("a transport failure retries while only explicit policy rejection closes credentials",()=>{const{statuses,connection}=setup();Socket.last.onclose?.({code:1006});expect(statuses.at(-1)).toBe("recovering");vi.advanceTimersByTime(250);expect(statuses.at(-1)).toBe("recovering");Socket.last.onclose?.({code:1008});expect(statuses.at(-1)).toBe("closed");connection.close()});
});
