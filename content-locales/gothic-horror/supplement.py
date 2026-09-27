# coding: utf-8
from pathlib import Path
exec(Path(__file__).with_name('build.py').read_text())
sup=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'gothic-horror-supplement.json'))
data='''0|Сокрытое графство|El Condado Velado|覆われた郡|隐秘郡|베일에 가린 군
1|Воронья пустошь|Páramo del Cuervo|鴉の荒野|渡鸦荒原|까마귀 황야
2|Святая Орла|Santa Orla|聖オルラ|圣奥拉|성녀 오를라
3|Серый приют|Refugio Gris|灰色の港|灰港|회색 피난처
4|Долина аконита|Valle del Acónito|トリカブトの谷|乌头谷|투구꽃 골짜기
5|Ночное озеро|Lago Nocturno|夜想の湖|夜曲湖|야상의 호수
6|Сумеречная лощина|Hondonada del Ocaso|夕べの窪地|暮色谷|저녁 골짜기
7|Блэквик|Blackwick|ブラックウィック|布莱克威克|블랙윅
8|Сумеречный мост|Puente del Crepúsculo|薄闇の橋|幽暮桥|황혼 다리
9|Траурный порт|Puerto de Luto|喪の港|哀悼港|애도의 항구
10|Розовая могила|Tumba de Rosas|薔薇の墓|玫瑰墓|장미 무덤
11|Замок Вей|Castillo Vey|ヴェイ城|维城堡|베이 성
12|Зеркальный склеп|La Cripta del Espejo|鏡の地下墓所|镜之墓穴|거울 지하묘
13|Усадьба аконита|Mansión del Acónito|トリカブトの屋敷|乌头庄园|투구꽃 저택
14|Лунный приют|Asilo a la Luz de la Luna|月明かりの療養院|月照精神病院|달빛 요양원
15|Собор туманов|Catedral de las Nieblas|霧の大聖堂|迷雾大教堂|안개 대성당
16|Лунный волк|Lobo Lunar|月の狼|月狼|달 늑대
17|Зеркальный призрак|Espectro del Espejo|鏡の幽鬼|镜之幽灵|거울 망령
18|Гаргулья|Gárgola|ガーゴイル|石像鬼|가고일
19|Леди Кармин|Lady Carmine|カーマイン夫人|卡迈恩女士|카마인 여사
20|Доктор Грейвс|Doctor Graves|グレイブス医師|格雷夫斯医生|그레이브스 박사
21|Сестра Люсент|Hermana Lucent|ルーセント修道女|露森特修女|루센트 수녀
22|Ночной кучер|El Cochero Nocturno|夜の御者|夜间车夫|밤의 마부
23|Серебряный дозор|La Vigilia de Plata|銀の見張り|银色守夜团|은빛 감시단
24|Дом Кармин|Casa Carmine|カーマイン家|卡迈恩家族|카마인 가문
25|Сокрытое общество|La Sociedad Velada|覆われた協会|隐秘社团|베일의 결사
26|Портрет плачет|El Retrato Llora|泣く肖像|肖像落泪|우는 초상
27|Похороны без тела|Un Funeral sin Cadáver|遺体なき葬儀|无尸葬礼|시신 없는 장례
28|Луна остаётся полной|La Luna Sigue Llena|満ちたままの月|月亮永远圆满|늘 보름인 달
29|Маскарад крови|Mascarada de Sangre|血の仮面舞踏会|鲜血假面舞会|피의 가면무도회
30|Запертый сеанс|La Sesión Espiritista Cerrada|閉ざされた降霊会|封闭降灵会|잠긴 강령회
31|Охота через Воронью пустошь|Caza por el Páramo del Cuervo|鴉の荒野の狩り|渡鸦荒原狩猎|까마귀 황야의 사냥
34|Три полных приключения личного ужаса|Tres Aventuras Completas de Horror Íntimo|三つの完全な親密な恐怖の冒険|三个完整亲密恐怖冒险|세 가지 완전한 내밀한 공포 모험
39|Свидетели, покровители и связывающие духи|Testigos, Patronos y Espíritus Vinculantes|証人、後援者、縛る霊|见证人、赞助者与束缚灵体|증인, 후원자와 구속하는 영혼
42|Роли свидетелей и пути попечения|Roles de Testigos y Caminos de Custodia|証人の役割と世話役の道|见证人角色与管理路径|증인 역할과 관리의 길
45|Договоры, показания и спасательные реликвии|Contratos, Testimonios y Reliquias de Rescate|契約、証言、救助の遺物|契约、证词与救援遗物|계약, 증언과 구조 유물
48|Двенадцать поместий, дворов и затонувших мест|Doce Fincas, Cortes y Lugares Ahogados|十二の屋敷、宮廷、水没地|十二处庄园、宫廷与水淹地点|열두 영지, 궁정과 수몰 장소
51|Правила расследования, защиты и освобождения|Reglas de Investigación, Protección y Liberación|調査、保護、解放のルール|调查、保护与解除规则|조사, 보호, 해제 규칙
52|Засвидетельствовать обещание|Atestiguar promesa|約束に立ち会う|见证承诺|약속 증언
53|Защитить показания|Proteger testimonio|証言を守る|保护证词|증언 보호
54|Проследить договор|Rastrear contrato|契約を追う|追踪契约|계약 추적
55|Успокоить пациента|Calmar paciente|患者を落ち着かせる|安抚病人|환자 진정
56|Назвать потерянных|Nombrar a los perdidos|失われた者を名指す|说出失踪者名字|잃은 이들의 이름 부르기
57|Снять обязательство|Liberar obligación|義務を解く|解除义务|의무 해제
60|Траурное графство и тайные покровители|Condado de Luto y Patronos Secretos|喪の郡と秘密の後援者|哀悼郡与秘密赞助者|애도의 군과 비밀 후원자
63|Схемы призрачных общин|Esquemas de Comunidades Embrujadas|幽霊の共同体の模式図|幽灵社区示意图|귀신 들린 공동체 도식
64|Иллюстрированный готический ужас|Horror Gótico ilustrado|挿絵付きゴシックホラー|插画哥特恐怖|삽화 고딕 호러
66|Призрачная навигация|Navegación Embrujada|幽霊の案内|幽灵导航|유령 탐색
67|Оригинальные схемы навигации готического ужаса|Esquemas originales de navegación de Horror Gótico|独自のゴシックホラー案内図|原创哥特恐怖导航示意图|독창적인 고딕 호러 탐색 도식
70|Три основы призрачных общин|Tres Marcos de Comunidades Embrujadas|三つの幽霊の共同体の枠組み|三种幽灵社区框架|세 가지 귀신 들린 공동체 틀'''
for row in data.splitlines():i,v=row.split('|',1);add(sup[int(i)],v)
for l in langs:
 cf=json.load(open(Path(__file__).parent.parent/'classic-fantasy'/(l+'.json')))
 for k in sup:
  if k in cf and k not in maps[l]:maps[l][k]=cf[k]
summary=['Три полные кампании личного ужаса: унаследованное похоронное обещание, связанная кровью благотворительность и спасение затонувшего прихода.','Tres campañas completas de horror íntimo: una promesa funeraria heredada, una caridad ligada por sangre y el rescate de una parroquia ahogada.','三つの完全な親密な恐怖のキャンペーン：継承された葬儀の約束、血に縛られた慈善、溺れた教区の救助。','三个完整亲密恐怖战役：继承的葬礼承诺、血契慈善以及被淹教区的救援。','세 가지 완전한 내밀한 공포 캠페인: 물려받은 장례 약속, 피로 묶인 자선, 수몰 교구의 구조.']
for i,b in [(33,34),(38,39),(41,42),(44,45),(47,48),(50,51),(59,60),(62,63),(69,70)]:
 for l,tail in zip(langs,summary):maps[l][sup[i]]=maps[l][sup[b]]+' — '+', '.join(maps[l][src[j]] for j in [6,8,10])+'. '+tail
for k in sup:
 if k.endswith(' — Illustrated'):
  for l,w in zip(langs,['с иллюстрациями','ilustrado','挿絵付き','插画版','삽화판']):maps[l][k]=maps[l][k.removesuffix(' — Illustrated')]+' — '+w
for l in langs:
 assert set(src+sup)==set(maps[l]),set(src+sup)-set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Gothic full:',len(src+sup))
