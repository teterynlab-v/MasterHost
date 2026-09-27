# coding: utf-8
from pathlib import Path
exec(Path(__file__).with_name('build.py').read_text())
sup=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'age-of-sail-supplement.json'))
data='''0|Свободное море|El Mar sin Fijar|定まらぬ海|无定之海|고정되지 않은 바다
3|Три полных мореходных приключения|Tres Aventuras Marítimas Completas|三つの完全な海の冒険|三个完整海航冒险|세 가지 완전한 해상 모험
8|Экипажи, капитаны, островитяне и угрозы|Tripulaciones, Capitanes, Isleños y Amenazas|乗員、船長、島民と脅威|船员、船长、岛民与威胁|선원, 선장, 섬사람과 위협
11|Роли экипажа и пути морской репутации|Roles de Tripulación y Caminos de Reputación Marítima|乗員の役割と海の評判の道|船员角色与海上名誉路径|선원 역할과 해상 평판의 길
14|Инструменты спасения, груза и пути|Herramientas de Rescate, Carga y Ruta|救助、貨物、航路の道具|救援、货物与航路工具|구조, 화물, 항로 도구
17|Двенадцать мест бухт, набережных и живых островов|Doce Lugares de Calas, Muelles e Islas Vivas|十二の入江、埠頭、生きた島の場所|十二处海湾、码头与活岛地点|열두 만, 부두, 살아 있는 섬 장소
20|Правила промеров, передачи и якоря|Reglas de Sondeo, Transferencia y Anclas|測深、積み替え、錨のルール|测深、转运与锚规则|측심, 이송, 닻 규칙
21|Промерить риф|Sondear arrecife|礁を測深する|测深礁石|암초 측심
22|Начать спасение|Lanzar rescate|救助を始める|启动救援|구조 시작
23|Прочесть приказ|Leer orden|命令を読む|阅读命令|명령 읽기
24|Проверить груз|Inspeccionar carga|貨物を検査する|检查货物|화물 검사
25|Освободить якорь|Liberar ancla|錨を解く|解除锚|닻 해제
26|Спеть путь|Cantar ruta|航路を歌う|歌唱航路|항로 노래
31|Схемы свободного моря|Esquemas del Mar sin Fijar|定まらぬ海の模式図|无定之海示意图|고정되지 않은 바다 도식
32|Иллюстрированная эпоха парусов|Era de la Vela ilustrada|挿絵付き大航海時代|插画风帆时代|삽화 범선 시대
34|Навигация плаваний|Navegación Marítima|航海の案内|航行导航|항해 탐색
35|Оригинальные схемы навигации эпохи парусов|Esquemas originales de navegación de Era de la Vela|独自の大航海時代案内図|原创风帆时代导航示意图|독창적인 범선 시대 탐색 도식
38|Три основы мореходных путешествий|Tres Marcos de Viajes Marítimos|三つの海の航海の枠組み|三种海航旅程框架|세 가지 해상 항해 틀'''
for row in data.splitlines():i,v=row.split('|',1);add(sup[int(i)],v)
for l in langs:
 cf=json.load(open(Path(__file__).parent.parent/'classic-fantasy'/(l+'.json')))
 for k in sup:
  if k in cf and k not in maps[l]:maps[l][k]=cf[k]
summary=['Три оригинальные мореходные кампании: спасение Вольной бухты, нейтральное лечение через ложную блокаду и движущийся остров, выбирающий свой горизонт.','Tres campañas marítimas originales: rescate de una cala libre, carga médica neutral a través de órdenes de bloqueo falsas y una isla móvil que elige su horizonte.','三つの独自の海のキャンペーン：自由入江の救助、偽封鎖命令を越える中立治療貨物、自分の水平線を選ぶ動く島。','三个原创海航战役：自由湾救援、穿越伪造封锁命令的中立医疗货物，以及选择自己地平线的移动岛。','세 가지 독창적인 해상 캠페인: 자유 만 구조, 위조 봉쇄 명령을 지나는 중립 치료 화물, 자기 수평선을 선택하는 움직이는 섬.']
for i,b in [(2,3),(7,8),(10,11),(13,14),(16,17),(19,20),(28,0),(30,31),(37,38)]:
 for l,tail in zip(langs,summary):maps[l][sup[i]]=maps[l][sup[b]]+' — '+', '.join(maps[l][src[j]] for j in [6,8,10])+'. '+tail
for k in sup:
 if k.endswith(' — Illustrated'):
  for l,w in zip(langs,['с иллюстрациями','ilustrado','挿絵付き','插画版','삽화판']):maps[l][k]=maps[l][k.removesuffix(' — Illustrated')]+' — '+w
for l in langs:
 assert set(src+sup)==set(maps[l]),set(src+sup)-set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Sail full:',len(src+sup))
