# coding: utf-8
for i,l in enumerate(langs):
 for k in supp:
  if k.endswith(' — Illustrated') and k[:-14] in maps[l]:maps[l][k]=maps[l][k[:-14]]+[' — С иллюстрациями',' — Ilustrado',' — イラスト付き',' — 插画版',' — 삽화 포함'][i]
  if ' for Hidden Courts,' in k:
   title=k.split(' for Hidden Courts,')[0]
   if title in maps[l]:maps[l][k]=maps[l][title]+[' для «Тайных дворов», «Кварталов чудовищ» и «Заговора муниципальной магии». Три оригинальные городские кампании: читатели, задержанные тайными дворами, ночные жилища перед дневной инспекцией и улицы, стёртые частным договором заклинания.',' para Cortes Ocultas, Distritos de Monstruos y Conspiración de Magia Municipal. Tres campañas urbanas originales: lectores detenidos por cortes ocultas, hogares nocturnos ante una inspección diurna y calles borradas por un contrato privado de hechizo.','。隠れた宮廷、怪物の地区、市政魔法の陰謀に対応。隠れた宮廷に拘束された読者、昼間の検査に直面する夜の住居、私的な呪文契約に消された街路を描く三つの独自の都市キャンペーン。','，适用于隐秘宫廷、怪物街区与市政魔法阴谋。三个原创城市战役：被隐秘宫廷扣留的读者、面临白天检查的夜行住所，以及被私人法术合同抹去的街道。','. 숨겨진 궁정, 괴물 지구, 도시 마법의 음모를 위한 세 가지 독창적인 도시 캠페인: 숨겨진 궁정에 구금된 독자, 주간 점검을 앞둔 야행성 집, 사설 주문 계약에 지워진 거리.'][i]
