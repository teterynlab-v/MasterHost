# coding: utf-8
for i,l in enumerate(langs):
 for k in supp:
  if k.endswith(' — Illustrated') and k[:-14] in maps[l]:maps[l][k]=maps[l][k[:-14]]+[' — С иллюстрациями',' — Ilustrado',' — イラスト付き',' — 插画版',' — 삽화 포함'][i]
  if ' for Coastal University,' in k:
   title=k.split(' for Coastal University,')[0]
   if title in maps[l]:maps[l][k]=maps[l][title]+[' для «Прибрежного университета», «Полярной экспедиции» и «Упадочного мегаполиса». Три оригинальных расследования: вредоносный университетский сигнал, тёплая геометрическая полость и стирающий канал памяти мегаполиса.',' para Universidad Costera, Expedición Polar y Metrópolis en Decadencia. Tres investigaciones originales: una señal universitaria dañina, una cavidad geométrica cálida y un flujo metropolitano de memoria que borra.','。沿岸の大学、極地探検、衰退する大都市に対応。有害な大学の信号、暖かな幾何学的空洞、消去する大都市の記憶供給を扱う三つの独自の調査。','，适用于海岸大学、极地考察与衰败都市。三个原创调查：有害大学信号、温暖几何空腔，以及抹除记忆的都市供给。','. 해안 대학, 극지 탐사, 쇠락하는 대도시를 위한 세 가지 독창적인 조사: 해로운 대학 신호, 따뜻한 기하학 공동, 기억을 지우는 대도시 공급.'][i]
