import {useContentI18n} from './i18n/content-react.js';
import React from "react";
import { useI18n } from "./i18n/react.js";
import { characterSheetValues } from "./game.js";

type Choice = {id:string;displayName:string;values:Record<string,unknown>;compatibility?:{compatible:boolean}};
export function CharacterChoices({characters,schema,onChoose}:{characters:Choice[];schema:Parameters<typeof characterSheetValues>[0];onChoose:(character:Choice)=>void}) {
  const {c}=useContentI18n(schema),{t}=useI18n(), compatible=characters.filter(character=>character.compatibility?.compatible), other=characters.filter(character=>!character.compatibility?.compatible);
  const cards=(items:Choice[])=> <div className="characterCards">{items.map(character=><article key={character.id}><h3>{character.displayName}</h3>{character.compatibility?.compatible&&<p className="muted">{characterSheetValues(schema,character.values,c).slice(0,3).map(field=>`${field.label}: ${field.value}`).join(" · ")}</p>}<span className={character.compatibility?.compatible?"tag good":"tag"}>{character.compatibility?.compatible?t("join.compatible"):t("join.unavailable")}</span>{character.compatibility?.compatible&&<button onClick={()=>onChoose(character)}>{t("join.select")}</button>}</article>)}</div>;
  return <>{compatible.length>0&&cards(compatible)}{other.length>0&&<details><summary>{t("join.otherCharacters",{count:other.length})}</summary>{cards(other)}</details>}</>;
}
