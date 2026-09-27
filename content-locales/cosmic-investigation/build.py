# coding: utf-8
from pathlib import Path
import json,pathlib
P=pathlib.Path(__file__).parent
src=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'cosmic-investigation.json')); supp=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'cosmic-investigation-supplement.json'))
langs=['ru','es','ja','zh-CN','ko']; maps={l:{k:v for k,v in json.load(open(P.parent/'mythic-antiquity'/(l+'.json'))).items() if k in src+supp} for l in langs}
for f in sorted(P.glob('chunk*.txt')):
 for row in f.read_text().splitlines():
  if not row: continue
  a=row.split('|'); assert len(a)==6,(f,row)
  idx=int(a[0].lstrip('ds')); k=(supp if a[0].startswith('s') else src)[idx]
  for l,t in zip(langs,a[1:]):
   if a[0].startswith('d'):t=maps[l][k.split(': ',1)[0]]+': '+t
   maps[l][k]=t
suffix={'map schematic':['схема карты','esquema del mapa','地図の概略','地图示意图','지도 개략도'],'location schematic':['схема места','esquema del lugar','場所の概略','地点示意图','장소 개략도'],'portrait schematic':['схематичный портрет','retrato esquemático','肖像の概略','肖像示意图','인물 개략도'],'creature schematic':['схема существа','esquema de criatura','クリーチャーの概略','生物示意图','생물 개략도'],'item schematic':['схема предмета','esquema del objeto','アイテムの概略','物品示意图','아이템 개략도'],'background schematic':['схема фона','esquema del fondo','背景の概略','背景示意图','배경 개략도']}
for s in src:
 if ': ' not in s:continue
 title,body=s.split(': ',1)
 if body in suffix:
  for i,l in enumerate(langs):
   if title in maps[l]:maps[l][s]=maps[l][title]+': '+suffix[body][i]
for i,l in enumerate(langs):
 for ci,bi,ti in [(17,7,6),(23,9,8),(29,11,10)]:
  prefix=['Игра на три-четыре часа в сеттинге «','Una partida de tres a cuatro horas de ','3〜4時間の','三至四小时的','3~4시간짜리 '][i]
  join=['»: ',': ','のゲーム：','游戏：',' 게임: '][i]
  maps[l][src[ci]]=prefix+maps[l][src[ti]]+join+maps[l][src[bi]]
exec((P/'supp.py').read_text())
full=src+supp
for l in langs:(P/(l+'.json')).write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print({l:len(m) for l,m in maps.items()})
(P/'progress.json').write_text(json.dumps({'total':len(full),'coverage':{l:len(m) for l,m in maps.items()},'uncovered':{l:[s for s in full if s not in m] for l,m in maps.items()}},ensure_ascii=False,indent=2))
