import {it,expect} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {I18nProvider} from './i18n/react.js';
import {WorldBuilder} from './world-builder.js';
it('localizes editor loading copy without editing the World',()=>{
 Object.defineProperty(globalThis,'location',{value:{search:'?lang=ru'},configurable:true});
 Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null},configurable:true});
 const world={id:'w1',packId:'masterhost.classic-fantasy',revision:1,entities:[{id:'e1',kind:'npc',values:{name:{value:'Scout',source:'custom'}}}]};
 const before=JSON.stringify(world),html=renderToStaticMarkup(React.createElement(I18nProvider,{children:React.createElement(WorldBuilder,{world,request:async()=>({}),requestMedia:async()=>new Blob(),onWorld:async()=>undefined})}));
 expect(html).toContain('Загрузка редактора мира');expect(html).not.toContain('Loading World Builder');expect(JSON.stringify(world)).toBe(before);
});
