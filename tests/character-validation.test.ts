import { describe, expect, it } from "vitest";
import { buildCharacterState, evaluateCharacterPortability, validateCharacterValues } from "@masterhost/worldpack-sdk";
import type { CharacterCreationSchema } from "@masterhost/domain";

const schema = { steps: [
  { id: "identity", title: "Identity", fields: [{ id: "handle", label: "Handle", type: "text" as const, required: true }] },
  { id: "role", title: "Role", fields: [{ id: "role", label: "Role", type: "choice" as const, required: true, options: [{ value: "runner", label: "Runner" }] }] }
] };

describe("server character values", () => {
  it("accepts values declared by a pack", () => expect(validateCharacterValues(schema, { handle: "Echo", role: "runner" })).toEqual({ handle: "Echo", role: "runner" }));
  it("rejects missing, unknown and invalid choices", () => {
    expect(() => validateCharacterValues(schema, { handle: "Echo" })).toThrow(/required.*role/);
    expect(() => validateCharacterValues(schema, { handle: "Echo", role: "warrior" })).toThrow(/invalid choice/);
    expect(() => validateCharacterValues(schema, { handle: "Echo", role: "runner", admin: true })).toThrow(/unknown character field/);
  });
  it("applies defaults, conditions, validation, calculations and Pack-defined starting state", () => {
    const advanced:CharacterCreationSchema={schemaVersion:"2",steps:[
      {id:"identity",title:"Identity",fields:[{id:"name",label:"Name",type:"text",required:true,minLength:2,pattern:"^[A-Z]"}]},
      {id:"role",title:"Role",fields:[{id:"role",label:"Role",type:"choice",required:true,options:[{value:"mage",label:"Mage"},{value:"guard",label:"Guard"}]},{id:"magic",label:"Magic",type:"number",default:1,when:{field:"role",equals:"mage"}},{id:"body",label:"Body",type:"number",default:2}]}
    ],calculated:[{id:"readiness",operation:"sum",fields:["magic","body"]}],starting:{progression:{xp:0},resources:{health:10},inventory:[{id:"spellbook",when:{field:"role",equals:"mage"}}],traits:[{id:"arcane",when:{field:"role",equals:"mage"}}],assets:[{id:"portrait",value:"default.svg"}]}};
    expect(buildCharacterState(advanced,{name:"Aria",role:"mage"})).toEqual({values:{name:"Aria",role:"mage",magic:1,body:2,readiness:3},progression:{xp:0},resources:{health:10},inventory:[{id:"spellbook"}],traits:["arcane"],assets:{portrait:"default.svg"}});
    expect(()=>buildCharacterState(advanced,{name:"Aria",role:"guard",magic:5})).toThrow(/inactive character field magic/);
  });
  it("uses only explicit exact, accept, normalize or migration compatibility",()=>{
    const target:CharacterCreationSchema={schemaVersion:"2",steps:[{id:"main",title:"Main",fields:[{id:"name",label:"Name",type:"text",required:true},{id:"role",label:"Role",type:"choice",required:true,options:[{value:"runner",label:"Runner"}]}]}],portability:{rules:[
      {fromPackId:"old",fromVersions:["1"],mode:"normalize"},
      {fromPackId:"legacy",fromVersions:["1"],mode:"migrate",fieldMap:{name:"handle",role:"job"}}
    ]}};
    const source=(worldPackId:string,worldPackVersion:string,values:Record<string,unknown>,characterSchemaVersion="1")=>({worldPackId,worldPackVersion,characterSchemaVersion,values});
    expect(evaluateCharacterPortability("new","2",target,source("new","2",{name:"Echo",role:"runner"},"2")).mode).toBe("exact");
    expect(evaluateCharacterPortability("new","2",target,source("old","1",{name:"Echo",role:"runner",obsolete:true}))).toMatchObject({compatible:true,mode:"normalize",values:{name:"Echo",role:"runner"}});
    expect(evaluateCharacterPortability("new","2",target,source("legacy","1",{handle:"Echo",job:"runner"}))).toMatchObject({compatible:true,mode:"migrate",values:{name:"Echo",role:"runner"}});
    expect(evaluateCharacterPortability("new","2",target,source("unknown","1",{name:"Echo",role:"runner"}))).toMatchObject({compatible:false,mode:"reject"});
  });
});
