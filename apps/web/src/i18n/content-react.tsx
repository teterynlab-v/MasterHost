import {useMemo} from 'react';
import {useOptionalI18n} from './react.js';
import {createContentTranslator, type ContentDictionaries, type ContentPack, type ContentStrings} from './content.js';
declare global {interface ImportMeta {glob:(pattern:string,options:{eager:boolean;import:string})=>Record<string,ContentStrings>}}
const files=import.meta.glob('../../../../content-locales/*/{en,ru,es,ja,zh-CN,ko}.json',{eager:true,import:'default'});
export const bundledContentDictionaries:ContentDictionaries={};
for(const [path,strings] of Object.entries(files)){const match=path.match(/content-locales\/([^/]+)\/(ru|es|ja|zh-CN|ko|en)\.json$/);if(match){const scope=match[1]!,locale=match[2]!;(bundledContentDictionaries[scope]??={})[locale]=strings;}}
export function useContentI18n(pack?:ContentPack){const locale=useOptionalI18n()?.locale??'en';return {c:useMemo(()=>createContentTranslator(locale,bundledContentDictionaries,pack),[locale,pack])};}
