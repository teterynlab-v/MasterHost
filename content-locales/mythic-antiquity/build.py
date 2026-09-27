# coding: utf-8
from pathlib import Path
import json,pathlib
P=pathlib.Path(__file__).parent
src=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'mythic-antiquity.json')); supp=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'mythic-antiquity-supplement.json'))
langs=['ru','es','ja','zh-CN','ko']; maps={l:{} for l in langs}
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
 for k in supp:
  if k.endswith(' — Illustrated') and k[:-14] in maps[l]:maps[l][k]=maps[l][k[:-14]]+[' — С иллюстрациями',' — Ilustrado',' — イラスト付き',' — 插画版',' — 삽화 포함'][i]
  if ' for Warring Poleis,' in k:
   title=k.split(' for Warring Poleis,')[0]
   if title in maps[l]:
    maps[l][k]=maps[l][title]+[' для «Враждующих полисов», «Островов Одиссеи» и «Рубежа подземного мира». Три оригинальные мифические кампании: пророчество спасения, честное возвращение домой и добровольное прощание у границы смерти.',' para Polis enfrentadas, Islas de la Odisea y Frontera del inframundo. Tres campañas míticas originales: una profecía de rescate, un regreso veraz y una despedida voluntaria en la frontera de la muerte.','。争う都市国家、オデュッセイアの島々、冥界の境界に対応。救助の予言、真実を伴う帰郷、死の境界での自発的な別れを描く、三つの独自の神話キャンペーン。','，适用于交战城邦、奥德赛群岛与冥界边境。三个原创神话战役：救援预言、真实的归乡，以及死亡边界上的自愿告别。','. 전쟁 중인 도시국가, 오디세이의 섬들, 저승의 경계를 위한 세 가지 독창적인 신화 캠페인: 구조 예언, 진실한 귀향, 죽음의 경계에서의 자발적인 작별.'][i]
full=src+supp
for l in langs:(P/(l+'.json')).write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print({l:len(m) for l,m in maps.items()})
(P/'progress.json').write_text(json.dumps({'total':len(full),'coverage':{l:len(m) for l,m in maps.items()},'uncovered':{l:[s for s in full if s not in m] for l,m in maps.items()}},ensure_ascii=False,indent=2))
