# coding: utf-8
for i,l in enumerate(langs):
 for k in supp:
  if k.endswith(' — Illustrated') and k[:-14] in maps[l]:maps[l][k]=maps[l][k[:-14]]+[' — С иллюстрациями',' — Ilustrado',' — イラスト付き',' — 插画版',' — 삽화 포함'][i]
  if ' for Defense Metropolis,' in k:
   title=k.split(' for Defense Metropolis,')[0]
   if title in maps[l]:maps[l][k]=maps[l][title]+[' для «Оборонительного мегаполиса», «Восстания колонии» и «Пограничья обломков машин». Три оригинальные кампании машин: прибрежная эвакуация под узким сектором огня, независимый доступ гражданских к кислороду и согласованная утилизация живых великанов.',' para Metrópolis de Defensa, Rebelión de la Colonia y Frontera de Restos Mecánicos. Tres campañas originales de estructuras: evacuación costera bajo un arco de tiro estrecho, acceso civil independiente al oxígeno y recuperación consentida de gigantes vivos.','。防衛大都市、植民地の反乱、機械残骸の辺境に対応。狭い射界の下での沿岸避難、民間の独立した酸素アクセス、生きた巨人の同意に基づく回収を描く三つの独自の機体キャンペーン。','，适用于防御都市、殖民地起义与机骸边疆。三个原创机体战役：狭窄射界下的海岸疏散、平民独立氧气取用权，以及经同意回收活巨机。','. 방어 대도시, 식민지 반란, 기계 잔해 변경을 위한 세 가지 독창적인 기체 캠페인: 좁은 사격 범위 아래 해안 대피, 독립 민간 산소 접근, 살아 있는 거인의 동의 인양.'][i]
