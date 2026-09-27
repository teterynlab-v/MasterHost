# coding: utf-8
from pathlib import Path
exec(Path(__file__).with_name('build.py').read_text())
sup=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'post-apocalypse-supplement.json'))
data='''0|Разрушенное шоссе|La Autopista Rota|壊れた幹線道路|破碎公路|부서진 고속도로
1|Ржавый бассейн|Cuenca Oxidada|錆の盆地|锈盆地|녹슨 분지
2|Зелёный шрам|Cicatriz Verde|緑の傷|绿色伤痕|녹색 흉터
3|Соляная пустошь|Extensión Salina|塩の大地|盐之旷野|소금 벌판
4|Затопленный север|Norte Inundado|水没した北部|水淹北方|침수된 북부
5|Стеклянные земли|Las Tierras de Vidrio|硝子の地|玻璃之地|유리 땅
6|Приют 17|Refugio 17|避難所17|避难所17|피난처 17
7|Жестяная крыша|Techo de Hojalata|トタン屋根|铁皮屋顶|양철 지붕
8|Колодец милосердия|Pozo de la Misericordia|慈悲の井戸|慈悲井|자비의 우물
9|Последняя остановка|Última Parada|最後の停留所|最后一站|마지막 정거장
10|Литейный город|Ciudad de Fundición|鋳造の町|铸造镇|주조 마을
11|Погребённая аркология|La Arcología Enterrada|埋もれたアーコロジー|埋葬生态城|묻힌 아콜로지
12|Радиогора|Montaña de Radio|無線の山|无线电山|무전 산
13|Роща мутантов|Arboleda Mutante|変異体の林|变异林|돌연변이 숲
14|Дамба старого мира|Presa del Viejo Mundo|旧世界のダム|旧世界大坝|옛 세계 댐
15|Длинный туннель|El Túnel Largo|長いトンネル|漫长隧道|긴 터널
16|Споровый громила|Bruto de Esporas|胞子の怪物|孢子蛮兽|포자 괴수
17|Бритвенная стая|Bandada Afilada|刃の群れ|剃刀群|면도날 무리
18|Пасть туннеля|Fauces del Túnel|トンネルの顎|隧道巨口|터널 아가리
19|Док Холлис|Doc Hollis|ドク・ホリス|霍利斯医生|닥 홀리스
20|Гирбокс|Gearbox|ギアボックス|吉尔博克斯|기어박스
21|Маршал Флинт|Mariscal Flint|フリント保安官|弗林特执法官|플린트 보안관
22|Мать Рейн|Madre Rain|レイン母|雨之母|레인 어머니
23|Дорожный союз|La Unión del Camino|街道組合|道路联盟|도로 연합
24|Родня хранилища|Familia de la Bóveda|保管庫の一族|种库亲族|종자고 가족
25|Дети цветения|Hijos de la Floración|開花の子供|繁花之子|개화의 아이들
26|Колодцы краснеют|Los Pozos se Tiñen de Rojo|赤くなる井戸|井水染红|붉어지는 우물
27|Спутник заговорил|Habla un Satélite|語る衛星|卫星开口|말하는 위성
28|Великое переселение|La Gran Migración|大移住|大迁徙|대이주
29|Конвой под огнём|Convoy bajo Fuego|砲火の中の護送隊|火力下的车队|포화 속 호송대
30|Ночь в туннеле|Noche en el Túnel|トンネルの夜|隧道之夜|터널의 밤
31|Осада приюта 17|Asedio de Refugio 17|避難所17の包囲|避难所17围攻|피난처 17 포위
34|Три полных приключения восстановления|Tres Aventuras Completas de Reconstrucción|三つの完全な再建の冒険|三个完整重建冒险|세 가지 완전한 재건 모험
39|Путники, садоводы, механики и угрозы|Viajeros, Cultivadores, Mecánicos y Amenazas|旅人、栽培者、整備士と脅威|旅人、种植者、技工与威胁|여행자, 재배자, 정비사와 위협
42|Роли выживших и пути хранителей|Roles de Supervivientes y Caminos de Custodios|生存者の役割と守り手の道|幸存者角色与保管人路径|생존자 역할과 지킴이의 길
45|Доказательства запасов, семена и ремонтные припасы|Pruebas de Reservas, Semillas y Suministros de Reparación|備蓄の証拠、種と修理物資|储备证据、种子与维修物资|비축 증거, 씨앗과 수리 보급품
48|Двенадцать мест дороги, хранилища и сети|Doce Lugares del Camino, Bóveda y Red|街道、保管庫、送電網の十二の場所|十二处道路、种库与电网地点|길, 종자고, 전력망의 열두 장소
51|Правила запасов, переправ, семян и тепла|Reglas de Reservas, Cruces, Semillas y Calor|備蓄、横断、種、熱のルール|储备、渡行、种子与供热规则|비축, 통행, 씨앗, 열 규칙
52|Проверить запасы|Auditar reservas|備蓄を監査する|审计储备|비축 감사
53|Укрепить переправу|Reforzar cruce|横断を補強する|加固通道|통행 보강
54|Проверить семена|Analizar semillas|種を検査する|检测种子|씨앗 검사
55|Договориться о пайке|Negociar ración|配給を交渉する|协商配给|배급 협상
56|Проследить тепло|Rastrear calor|熱を追跡する|追踪热量|열 추적
57|Починить обратную линию|Reparar retorno|帰還線を直す|修复回路|귀환선 수리
60|Общины после краха|Comunidades tras el Colapso|崩壊後の共同体|崩溃后的社区|붕괴 뒤 공동체
63|Схемы путей восстановления|Esquemas de Rutas de Reconstrucción|再建路の模式図|重建路线示意图|재건 경로 도식
64|Иллюстрированный постапокалипсис|Posapocalipsis ilustrado|挿絵付きポストアポカリプス|插画后末日|삽화 포스트 아포칼립스
66|Навигация восстановления|Navegación de Recuperación|再建の案内|复苏导航|회복 탐색
67|Оригинальные схемы навигации постапокалипсиса|Esquemas originales de navegación de Posapocalipsis|独自のポストアポカリプス案内図|原创后末日导航示意图|독창적인 포스트 아포칼립스 탐색 도식
70|Три основы выживания и восстановления|Tres Marcos de Supervivencia y Reconstrucción|三つの生存と再建の枠組み|三种生存与重建框架|세 가지 생존과 재건 틀'''
for row in data.splitlines():i,v=row.split('|',1);add(sup[int(i)],v)
for l in langs:
 cf=json.load(open(Path(__file__).parent.parent/'classic-fantasy'/(l+'.json')))
 for k in sup:
  if k in cf and k not in maps[l]:maps[l][k]=cf[k]
summary=['Три полные кампании восстановления: проход конвоя, общее семенное наследство и тепло для пропущенных семей.','Tres campañas completas de reconstrucción: paso del convoy, herencia de semillas compartida y calor para hogares omitidos.','三つの完全な再建キャンペーン：護送隊の通行、共有の種の相続、除外された世帯への熱。','三个完整重建战役：车队通行、共享种子遗产与遗漏住户的供热。','세 가지 완전한 재건 캠페인: 호송대 통행, 공동 씨앗 유산, 누락된 가정의 열.']
for i,b in [(33,34),(38,39),(41,42),(44,45),(47,48),(50,51),(59,60),(62,63),(69,70)]:
 for l,tail in zip(langs,summary):maps[l][sup[i]]=maps[l][sup[b]]+' — '+', '.join(maps[l][src[j]] for j in [6,8,10])+'. '+tail
for k in sup:
 if k.endswith(' — Illustrated'):
  for l,w in zip(langs,['с иллюстрациями','ilustrado','挿絵付き','插画版','삽화판']):maps[l][k]=maps[l][k.removesuffix(' — Illustrated')]+' — '+w
for l in langs:
 assert set(src+sup)==set(maps[l]),set(src+sup)-set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Post full:',len(src+sup))
