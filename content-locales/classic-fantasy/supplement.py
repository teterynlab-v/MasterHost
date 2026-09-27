# coding: utf-8
from pathlib import Path
exec(Path(__file__).with_name('build.py').read_text())
sup=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'classic-fantasy-supplement.json'))
old_keys='''The Crowned Marches
Amber Vale
Frostmere
The Green March
Sunfall Coast
High Barrows
Oakheart
Bellhaven
Ironford
Pilgrim's Rest
Griffin
Sir Corven
Old Nessa
The Argent Crown
Wardens of the Road
Circle of Embers
The Comet Feast
A Crown Goes Missing
The Green Oath
Bridge of Blades
Wyrm at Dusk
Siege of Bells
The First Oath Adventure — Illustrated
An eighteen-scene one-shot spine with travel, faction negotiation, discovery, conflict, reward, and a canonical final choice.
The First Oath Adventure
Illustrated Universe v1
Deep Universe Standard v1
Crowns and Companions — Illustrated
Twenty-four named allies and rivals plus eighteen adversaries tied to factions, places, and immediate motives.
Crowns and Companions
Marches Character Paths — Illustrated
Eight ready archetypes and six progression paths for oathbound, roadwise, magical, diplomatic, and delving heroes.
Marches Character Paths
Illustrated portrait
Relics of the Marches — Illustrated
Twenty-four rewards, clues, tools, heirlooms, and consumables with clear uses in travel and conflict.
Relics of the Marches
Border Roads and Ruins — Illustrated
Twelve playable settlements, wild roads, abbeys, keeps, vaults, and imperial ruins with linked pressures.
Border Roads and Ruins
Deeds and Oaths Rules — Illustrated
Pack-defined travel, checks, resources, effects, Actions, encounters, rewards, and renown progression.
Deeds and Oaths Rules
Take Cover
Study Signs
Call For Aid
Share Supplies
Invoke Oath
Mark The Road
Border Kingdoms Setting — Illustrated
The disputed marches, road oaths, rival crowns, and migrating monsters that frame a ready Classic Fantasy game.
Border Kingdoms Setting
Illuminated Marches Art Set — Illustrated
Illustration-quality maps plus portraits, tokens, item art, location cards, and backgrounds for the three Classic Fantasy patterns.
Illuminated Marches Art Set'''.splitlines()
old=dict(enumerate(old_keys))
old.update({206:'Original maps, portraits, tokens, item art, location cards, and backgrounds for the three Classic Fantasy patterns.',207:'Illustrated classic-fantasy',208:'Individual generated illustrations for every authored content object',517:'Illuminated Marches',518:'Original deep Classic Fantasy visual language',519:'Crowned Marches World — Illustrated',520:'A connected realm structure of provinces, settlements, roads, factions, adventure sites, and an opening threat.',521:'Crowned Marches World'})
v={0:'Коронованные марки|Las Marcas Coronadas|戴冠の辺境|王冠边境|왕관의 변경',1:'Янтарная долина|Valle Ámbar|琥珀の谷|琥珀谷|호박 골짜기',2:'Морозное озеро|Lago Helado|霜の湖|霜湖|서리호수',3:'Зелёная марка|La Marca Verde|緑の辺境|绿色边境|녹색 변경',4:'Берег Заката|Costa del Ocaso|日没の海岸|日落海岸|일몰 해안',5:'Высокие курганы|Altos Túmulos|高き塚|高耸古冢|높은 고분',6:'Дубовое сердце|Corazón de Roble|樫の心|橡木心|참나무 심장',7:'Колокольный приют|Refugio de las Campanas|鐘の港|钟声港|종의 안식처',8:'Железный брод|Vado de Hierro|鉄の渡し|铁浅滩|철의 여울',9:'Приют паломника|Descanso del Peregrino|巡礼者の休息地|朝圣者驿站|순례자의 쉼터',10:'Грифон|Grifo|グリフォン|狮鹫|그리핀',11:'Сэр Корвен|Sir Corven|コーヴェン卿|科文爵士|코르벤 경',12:'Старая Несса|Vieja Nessa|老ネッサ|老内莎|늙은 네사',13:'Серебряная корона|La Corona Argéntea|銀の王冠|银冠|은빛 왕관',14:'Стражи дороги|Guardianes del Camino|街道の守護者|道路守卫|길의 수호자들',15:'Круг углей|Círculo de las Brasas|熾火の輪|余烬之环|불씨의 모임',16:'Пир кометы|La Fiesta del Cometa|彗星の宴|彗星盛宴|혜성의 축제',17:'Корона пропала|Desaparece una Corona|消えた王冠|王冠失踪|왕관이 사라지다',18:'Зелёная клятва|El Juramento Verde|緑の誓い|绿之誓约|녹색 맹세',19:'Мост клинков|Puente de las Espadas|刃の橋|刀锋桥|칼날의 다리',20:'Змей в сумерках|Dragón al Anochecer|夕闇の竜|暮色之龙|황혼의 용',21:'Осада колоколов|Asedio de las Campanas|鐘の包囲|钟声围城|종의 포위',24:'Приключение первой клятвы|La Aventura del Primer Juramento|最初の誓いの冒険|第一誓约冒险|첫 맹세의 모험',25:'Иллюстрированная вселенная v1|Universo ilustrado v1|挿絵付きの世界 v1|插画世界 v1|삽화 세계 v1',26:'Стандарт глубокой вселенной v1|Estándar de Universo Profundo v1|詳細な世界の標準 v1|深度世界标准 v1|심층 세계 표준 v1',29:'Короны и спутники|Coronas y Compañeros|王冠と仲間|王冠与伙伴|왕관과 동료',32:'Пути персонажей марок|Trayectorias de Personajes de las Marcas|辺境の人物の道|边境角色路径|변경 캐릭터의 길',33:'Иллюстрированный портрет|Retrato ilustrado|挿絵付きの肖像|插画肖像|그림 초상',36:'Реликвии марок|Reliquias de las Marcas|辺境の遺物|边境遗物|변경의 유물',39:'Пограничные дороги и руины|Caminos Fronterizos y Ruinas|国境の道と遺跡|边境道路与遗迹|국경의 길과 유적',42:'Правила подвигов и клятв|Reglas de Hazañas y Juramentos|功績と誓いのルール|功绩与誓约规则|위업과 맹세 규칙',43:'Укрыться|Ponerse a cubierto|身を隠す|寻找掩护|엄폐하기',44:'Изучить знаки|Estudiar señales|兆しを調べる|研究迹象|징후 조사',45:'Позвать на помощь|Pedir ayuda|援助を呼ぶ|呼叫援助|지원 요청',46:'Поделиться припасами|Compartir suministros|物資を分ける|分享补给|보급품 나누기',47:'Воззвать к клятве|Invocar un juramento|誓いを呼び起こす|援引誓约|맹세 호소',48:'Отметить дорогу|Marcar el camino|道に印を付ける|标记道路|길 표시',51:'Сеттинг пограничных королевств|Ambientación de los Reinos Fronterizos|国境の王国群の設定|边境诸国设定|국경 왕국 배경',54:'Художественный набор иллюстрированных марок|Colección Artística de las Marcas Iluminadas|彩飾辺境のアートセット|彩绘边境美术套组|채색 변경 아트 세트',207:'Иллюстрированное классическое фэнтези|Fantasía Clásica ilustrada|挿絵付き王道ファンタジー|插画经典奇幻|삽화 정통 판타지',517:'Иллюстрированные марки|Marcas Iluminadas|彩飾辺境|彩绘边境|채색 변경',518:'Оригинальный глубокий визуальный язык классического фэнтези|Lenguaje visual original y profundo de Fantasía Clásica|独自の詳細な王道ファンタジーの視覚表現|原创深度经典奇幻视觉语言|독창적인 심층 정통 판타지 시각 언어',521:'Мир коронованных марок|Mundo de las Marcas Coronadas|戴冠の辺境の世界|王冠边境世界|왕관의 변경 세계'}
for i,x in v.items():add(old[i],x)
longs={23:'Основа разового приключения из восемнадцати сцен: путешествия, переговоры с фракциями, открытия, конфликты, награды и канонический финальный выбор.|Una estructura de aventura de una sesión con dieciocho escenas de viaje, negociación con facciones, descubrimiento, conflicto, recompensa y una elección final canónica.|旅、勢力との交渉、発見、対立、報酬、正史となる最後の選択を含む、18場面の単発冒険の骨格。|由十八个场景组成的单次冒险主线，涵盖旅行、派系谈判、发现、冲突、奖励与正史性的最终抉择。|여행, 세력 협상, 발견, 충돌, 보상, 정식 최종 선택을 담은 18장면의 단편 모험 뼈대.',28:'Двадцать четыре поименованных союзника и соперника и восемнадцать противников, связанных с фракциями, местами и непосредственными мотивами.|Veinticuatro aliados y rivales con nombre y dieciocho adversarios vinculados a facciones, lugares y motivos inmediatos.|勢力、場所、目前の動機に結びついた、名前を持つ24人の味方とライバル、および18の敵。|二十四名有名有姓的盟友与对手，加上十八名敌人，均与派系、地点和当前动机相关联。|세력, 장소, 당장의 동기에 연결된 이름 있는 동맹과 경쟁자 24명, 적 18명.',31:'Восемь готовых архетипов и шесть путей развития для героев клятв, дорог, магии, дипломатии и исследования глубин.|Ocho arquetipos listos y seis trayectorias de progresión para héroes juramentados, viajeros, mágicos, diplomáticos y exploradores de las profundidades.|誓約、旅、魔法、外交、探掘の英雄のための、すぐ使える8種の原型と6種の成長の道。|八个即用原型与六条成长路径，适用于誓约、道路、魔法、外交和探险英雄。|맹세, 길, 마법, 외교, 탐굴의 영웅을 위한 준비된 원형 8개와 성장 경로 6개.',35:'Двадцать четыре награды, улики, инструмента, наследства и расходных предмета с ясным применением в путешествиях и конфликтах.|Veinticuatro recompensas, pistas, herramientas, reliquias familiares y consumibles con usos claros en viajes y conflictos.|旅と対立での用途が明確な24の報酬、手掛かり、道具、家宝、消耗品。|二十四种奖励、线索、工具、传家宝与消耗品，在旅行和冲突中用途明确。|여행과 충돌에서 용도가 분명한 보상, 단서, 도구, 가보, 소모품 24개.',38:'Двенадцать игровых поселений, диких дорог, аббатств, крепостей, хранилищ и имперских руин со связанными затруднениями.|Doce asentamientos, caminos salvajes, abadías, fortalezas, bóvedas y ruinas imperiales jugables con presiones vinculadas.|関連した圧力を持つ、遊べる12の集落、野の道、修道院、砦、宝物庫、帝国遺跡。|十二个可玩聚落、荒野道路、修道院、要塞、宝库与帝国遗迹，拥有相互关联的压力。|서로 연결된 압박을 지닌 플레이 가능한 정착지, 황야 길, 수도원, 성채, 금고, 제국 유적 12곳.',41:'Определённые пакетом путешествия, проверки, ресурсы, эффекты, действия, встречи, награды и развитие славы.|Viajes, pruebas, recursos, efectos, acciones, encuentros, recompensas y progresión de renombre definidos por el paquete.|パックで定義された旅、判定、資源、効果、アクション、遭遇、報酬、名声の成長。|由内容包定义的旅行、检定、资源、效果、行动、遭遇、奖励与声望成长。|팩이 정의하는 여행, 판정, 자원, 효과, 행동, 조우, 보상, 명성 성장.',50:'Спорные марки, дорожные клятвы, соперничающие короны и мигрирующие чудовища задают основу готовой игры в классическое фэнтези.|Marcas disputadas, juramentos del camino, coronas rivales y monstruos migratorios que enmarcan una partida lista de Fantasía Clásica.|争われる辺境、街道の誓い、競合する王冠、移動する怪物が、すぐ遊べる王道ファンタジーの枠組みを作る。|纷争边境、道路誓约、敌对王冠与迁徙怪物构成即玩经典奇幻的框架。|분쟁의 변경, 길의 맹세, 경쟁하는 왕관, 이동하는 괴물들이 준비된 정통 판타지 게임의 틀을 이룬다.',53:'Карты иллюстрационного качества, портреты, жетоны, изображения предметов, карточки локаций и фоны для трёх схем классического фэнтези.|Mapas de calidad ilustrativa, retratos, fichas, arte de objetos, tarjetas de lugares y fondos para los tres patrones de Fantasía Clásica.|王道ファンタジーの3構成向けの、挿絵品質の地図、肖像、トークン、アイテム画、場所カード、背景。|适用于三种经典奇幻模式的插画品质地图、肖像、标记、物品美术、地点卡与背景。|정통 판타지의 세 구성을 위한 삽화 품질 지도, 초상, 토큰, 아이템 그림, 장소 카드, 배경.',206:'Оригинальные карты, портреты, жетоны, изображения предметов, карточки локаций и фоны для трёх схем классического фэнтези.|Mapas originales, retratos, fichas, arte de objetos, tarjetas de lugares y fondos para los tres patrones de Fantasía Clásica.|王道ファンタジーの3構成向けのオリジナル地図、肖像、トークン、アイテム画、場所カード、背景。|适用于三种经典奇幻模式的原创地图、肖像、标记、物品美术、地点卡与背景。|정통 판타지의 세 구성을 위한 독창적인 지도, 초상, 토큰, 아이템 그림, 장소 카드, 배경.',208:'Отдельные созданные иллюстрации для каждого авторского объекта контента.|Ilustraciones generadas individualmente para cada objeto de contenido escrito.|執筆された各コンテンツオブジェクトのための個別生成イラスト。|为每个创作内容对象单独生成的插画。|각 저작 콘텐츠 개체를 위해 개별 생성된 삽화.',520:'Связная структура королевства из провинций, поселений, дорог, фракций, мест приключений и начальной угрозы.|Una estructura de reino conectada con provincias, asentamientos, caminos, facciones, lugares de aventura y una amenaza inicial.|州、集落、街道、勢力、冒険の場所、開始時の脅威で構成された、つながりある王国の構造。|由省份、聚落、道路、派系、冒险地点与开局威胁组成的连贯王国结构。|지역, 정착지, 길, 세력, 모험 장소, 시작 위협으로 이어지는 왕국 구조.'}
for i,x in longs.items():add(old[i],x)
for key in sup:
 if key in maps['ru']:continue
 if '/' in key and re.search(r'\.(webp|svg|jpg)$',key):
  for l in langs:maps[l][key]=key
 elif key.endswith(' — Illustrated'):
  base=key.removesuffix(' — Illustrated')
  for l,w in zip(langs,['с иллюстрациями','ilustrado','挿絵付き','插画版','삽화판']):maps[l][key]=maps[l][base]+' — '+w
 else:raise ValueError(key)
for l in langs:
 assert set(src+sup)==set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print(len(src+sup),'all exact source keys complete')
