import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {SceneStage,SceneStageSwitch,sceneStageMode,sceneStageCopy,sceneArtwork} from './scene-stage.js';
import {supportedLocales} from './i18n/catalog.js';

describe('active scene presentation',()=>{
 it('uses the active scene mapping and falls back to the map when that scene has no art',()=>{
  expect(sceneArtwork('docks',{docks:'/docks.webp'},'/default-background.webp')).toBe('/docks.webp');
  expect(sceneArtwork('tower',{docks:'/docks.webp'},'/default-background.webp')).toBeUndefined();
  expect(sceneArtwork('docks',undefined,'/player-active-scene.webp')).toBe('/player-active-scene.webp');
 });
 it('shows active scene art and summary instead of the world map',()=>{
  const html=renderToStaticMarkup(<SceneStage title="Dockside" summary="A ship waits in the fog." sceneAssetUrl="/scenes/docks.webp" mapAssetUrl="/world-map.webp" labels={sceneStageCopy.en}/>);
  expect(html).toContain('src="/scenes/docks.webp"');expect(html).not.toContain('src="/world-map.webp"');expect(html).toContain('A ship waits in the fog.');
 });
 it('uses the map as a clearly labelled fallback while retaining the scene summary',()=>{
  const html=renderToStaticMarkup(<SceneStage title="Dockside" summary="A ship waits in the fog." mapAssetUrl="/world-map.webp" labels={sceneStageCopy.en}/>);
  expect(html).toContain('src="/world-map.webp"');expect(html).toContain('A ship waits in the fog.');expect(html).toContain('Scene illustration unavailable');
 });
 it('still presents the scene without any image asset',()=>{
  const html=renderToStaticMarkup(<SceneStage title="Dockside" summary="A ship waits in the fog." labels={sceneStageCopy.en}/>);
  expect(html).not.toContain('<img');expect(html).toContain('Dockside');expect(html).toContain('A ship waits in the fog.');
 });
 it('resets a chosen map view when the authoritative active scene changes',()=>{
  expect(sceneStageMode({sceneId:'docks',mode:'map'},'docks')).toBe('map');
  expect(sceneStageMode({sceneId:'docks',mode:'map'},'tower')).toBe('scene');
  expect(sceneStageMode({sceneId:undefined,mode:'scene'},'docks')).toBe('scene');
 });
 for(const locale of supportedLocales)it(`provides an accessible scene/map switch in ${locale}`,()=>{
  const html=renderToStaticMarkup(<SceneStageSwitch mode="scene" labels={sceneStageCopy[locale]} onChange={()=>{}}/>);
  expect(html).toContain('aria-pressed="true"');expect(html).toContain('aria-pressed="false"');expect(html).not.toContain('undefined');expect(sceneStageCopy[locale].scene).toBeTruthy();expect(sceneStageCopy[locale].map).toBeTruthy();
 });
});
