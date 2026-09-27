# coding: utf-8
from pathlib import Path
exec(Path(__file__).with_name('build.py').read_text())
sup=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'dark-fantasy-supplement.json'))
data='''0|Пепельный завет|El Pacto de Ceniza|灰の盟約|灰烬盟约|잿빛 언약
1|Висельная топь|Ciénaga de la Horca|絞首台の湿地|绞刑沼泽|교수대 수렁
2|Полая корона|La Corona Hueca|虚ろな王冠|空心王冠|빈 왕관
3|Чёрный терн|Espino Negro|黒い茨|黑荆棘|검은 가시
4|Могильный берег|Costa Sepulcral|墓の海岸|墓岸|무덤 해안
5|Пустошь ведьминого стекла|Páramo del Vidrio de Bruja|魔女硝子の荒野|巫镜荒原|마녀 유리 황야
6|Траурный колокол|Campana de Luto|喪の鐘|哀悼之钟|애도의 종
7|Синдервик|Cinderwick|シンダーウィック|辛德威克|신더윅
8|Руины святого|Ruina del Santo|聖人の廃墟|圣者废墟|성자의 폐허
9|Терновый рынок|Mercado de Espinas|茨の市場|荆棘市场|가시 시장
10|Последняя свеча|Última Vela|最後の蝋燭|最后的蜡烛|마지막 촛불
11|Костяной сад|Huerto de Huesos|骨の果樹園|白骨果园|뼈 과수원
12|Затонувшая часовня|La Capilla Hundida|水没した礼拝堂|沉没礼拜堂|수몰 예배당
13|Склеп красной луны|Cripta de la Luna Roja|赤月の地下墓所|红月墓穴|붉은 달 지하묘
14|Башня ведьминого стекла|Torre del Vidrio de Bruja|魔女硝子の塔|巫镜之塔|마녀 유리 탑
15|Плачущая дорога|El Camino Lloroso|泣く道|哭泣之路|우는 길
16|Полый рыцарь|Caballero Hueco|虚ろな騎士|空心骑士|빈 기사
17|Святой падали|Santo de la Carroña|屍肉の聖人|腐尸圣者|썩은 고기의 성자
18|Ночная ведьма|Bruja Nocturna|夜の魔女|夜巫|밤 마녀
19|Бледный охотник|El Cazador Pálido|蒼白の狩人|苍白猎人|창백한 사냥꾼
20|Моркант Вейл|Morcant Vale|モルカント・ヴェイル|莫尔坎特·韦尔|모르칸트 베일
21|Вдова Сейбл|Viuda Sable|未亡人セイブル|寡妇塞布尔|미망인 세이블
22|Отец Кроу|Padre Crow|クロウ神父|克罗神父|크로 신부
23|Дом Вейр|Casa Veyr|ヴェイル家|维尔家族|베이르 가문
24|Синод фонаря|El Sínodo del Farol|灯の宗教会議|灯笼教会|등불 종교회의
25|Терновый союз|El Pacto de Espinas|茨の協定|荆棘同盟|가시 협약
26|Колокола бьют тринадцать|Las Campanas Dan las Trece|十三を告げる鐘|钟鸣十三下|종이 열세 번 울린다
27|Святой возвращается голодным|Un Santo Regresa Hambriento|飢えて戻る聖人|圣者饥饿归来|굶주려 돌아온 성자
28|Солнце истекает кровью|El Sol Sangra|血を流す太陽|太阳流血|피 흘리는 태양
29|Пир ворон|Banquete de Cuervos|鴉の宴|乌鸦盛宴|까마귀의 연회
30|Непогребённое войско|La Hueste sin Enterrar|葬られぬ軍勢|未葬军团|묻히지 않은 군대
31|Суд у ведьминого стекла|Juicio en Vidrio de Bruja|魔女硝子の裁判|巫镜审判|마녀 유리의 재판
34|Три полных тёмных приключения|Tres Aventuras Oscuras Completas|三つの完全な闇の冒険|三个完整黑暗冒险|세 가지 완전한 어둠의 모험
39|Стражи, ведьмы, целители и угрозы|Guardianes, Brujas, Sanadores y Amenazas|守護者、魔女、治療者と脅威|守卫、女巫、医者与威胁|수호자, 마녀, 치유사와 위협
42|Тёмные призвания и пути свидетелей|Vocaciones Oscuras y Caminos de Testigos|闇の天職と証人の道|黑暗职业与见证路径|어둠의 소명과 증인의 길
46|Доказательства договоров, имён и лечения|Pruebas de Contratos, Nombres y Curas|契約、名、治療の証拠|契约、名字与疗法证据|계약, 이름, 치료 증거
49|Двенадцать мест колокола, пакта и паломников|Doce Lugares de Campanas, Pactos y Peregrinos|鐘、盟約、巡礼の十二の場所|十二处钟、契约与朝圣地点|종과 계약, 순례의 열두 장소
52|Правила защиты, имён и лечения|Reglas de Defensa, Nombres y Curas|防衛、命名、治療のルール|防卫、命名与治疗规则|방어, 작명, 치료 규칙
53|Прочесть договор|Leer contrato|契約を読む|阅读契约|계약 읽기
54|Охранять борозду|Proteger surco|畝を守る|守护田垄|밭고랑 지키기
55|Засвидетельствовать имя|Atestiguar nombre|名に立ち会う|见证名字|이름 증언
56|Проверить лекарство|Probar cura|治療を検査する|检测疗法|치료제 검사
57|Отвергнуть выкуп|Desafiar rescate|身代金に抗う|反抗赎金|몸값 거부
58|Сопроводить носителя|Escoltar portador|担い手を護送する|护送承载者|보유자 호송
61|Сделки под умирающим солнцем|Pactos bajo un Sol Moribundo|死にゆく太陽の下の取引|垂死太阳下的交易|죽어가는 태양 아래의 거래
64|Схемы тёмных сделок|Esquemas de Pactos Oscuros|闇の取引の模式図|黑暗交易示意图|어둠의 거래 도식
65|Иллюстрированное тёмное фэнтези|Fantasía Oscura ilustrada|挿絵付きダークファンタジー|插画黑暗奇幻|삽화 다크 판타지
67|Навигация по сделкам|Navegación de Pactos|取引の案内|交易导航|거래 탐색
68|Оригинальные схемы навигации тёмного фэнтези|Esquemas de navegación originales de Fantasía Oscura|独自のダークファンタジー案内図|原创黑暗奇幻导航示意图|독창적인 다크 판타지 탐색 도식
71|Три основы тёмных сделок|Tres Marcos de Pactos Oscuros|三つの闇の取引の枠組み|三种黑暗交易框架|세 가지 어둠의 거래 틀'''
for row in data.splitlines():i,v=row.split('|',1);add(sup[int(i)],v)
for l in langs:
 cf=json.load(open(Path(__file__).parent.parent/'classic-fantasy'/(l+'.json')))
 for k in sup:
  if k in cf and k not in maps[l]:maps[l][k]=cf[k]
summary=['Три полные тёмные кампании: общая защита под умирающим солнцем, имена без унаследованного выкупа и лекарство без владения пленником.','Tres campañas oscuras completas: defensa común bajo un sol moribundo, nombres libres de rescate heredado y una cura sin propiedad cautiva.','三つの完全な闇のキャンペーン：死にゆく太陽の下の共同防衛、継承の身代金から解放された名、担い手を所有しない治療。','三个完整黑暗战役：垂死太阳下的共同防卫、免于世袭赎金的名字，以及不囚禁占有承载者的疗法。','세 가지 완전한 어둠의 캠페인: 죽어가는 태양 아래의 공동 방어, 세습 몸값에서 해방된 이름, 보유자를 가두어 소유하지 않는 치료.']
for i,b in [(33,34),(38,39),(41,42),(45,46),(48,49),(51,52),(60,61),(63,64),(70,71)]:
 for l,tail in zip(langs,summary):maps[l][sup[i]]=maps[l][sup[b]]+' — '+', '.join(maps[l][src[j]] for j in [6,8,10])+'. '+tail
for k in sup:
 if k.endswith(' — Illustrated'):
  for l,w in zip(langs,['с иллюстрациями','ilustrado','挿絵付き','插画版','삽화판']):maps[l][k]=maps[l][k.removesuffix(' — Illustrated')]+' — '+w
for l in langs:
 assert set(src+sup)==set(maps[l]),set(src+sup)-set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Dark full:',len(src+sup))
