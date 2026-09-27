import json,re
from pathlib import Path
langs=['ru','es','ja','zh-CN','ko']; maps={l:{} for l in langs}
src=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'classic-fantasy.json'))
def add(key,vals):
 vals=vals.split('|'); assert len(vals)==5,(key,vals)
 for l,v in zip(langs,vals):maps[l][key]=v
names='''Серебряная корона|Corona Argéntea|銀の王冠|银冠|은빛 왕관
Стражи Долгой дороги|Guardianes del Camino Largo|長き道の守護団|长路守卫|긴 길의 수호자들
Коллегия Углей|Colegio de las Brasas|熾火学院|余烬学院|불씨 학회
Вольные знамёна|Estandartes Libres|自由の旗団|自由旗帜|자유 깃발들
Речной союз|Pacto del Río|河川盟約|河流同盟|강의 협약
Конклав Тернового леса|Cónclave del Bosque Espinoso|茨の森の評議会|荆棘林议会|가시숲 회의
Пепельный синод|Sínodo de Ceniza|灰の宗教会議|灰烬教会|잿빛 종교회의
Гильдия семи ключей|Gremio de las Siete Llaves|七つの鍵のギルド|七钥公会|일곱 열쇠 길드
Королевский мост|Puente del Rey|王の橋|国王桥|왕의 다리
Розовый дозор|Vigía de la Rosa|薔薇の見張り所|玫瑰哨所|장미 감시대
Аббатство Лунного колодца|Abadía del Pozo Lunar|月の泉の修道院|月井修道院|달샘 수도원
Драконьи врата|Puerta del Dragón|竜の門|龙门|용의 관문
Шепчущий лес|Bosque Susurrante|ささやく森|低语森林|속삭이는 숲
Крепость Звездопада|Fortaleza de la Estrella Caída|星降りの砦|落星要塞|별똥별 성채
Приют паломника|Descanso del Peregrino|巡礼者の休息地|朝圣者驿站|순례자의 쉼터
Угольный брод|Vado de Ceniza|燃え殻の渡し|煤渣浅滩|잿불 여울
Хранилище Полой короны|Bóveda de la Corona Hueca|虚ろな王冠の宝物庫|空冠宝库|빈 왕관 금고
Затонувший архив|Archivo Hundido|水没した文書庫|沉没档案馆|수몰 기록보관소
Маяк Морозного озера|Faro del Lago Helado|霜の湖の灯台|霜湖灯塔|서리호수 봉화
Курган девяти клятв|Túmulo de los Nueve Juramentos|九つの誓いの塚|九誓古冢|아홉 맹세의 고분
Элара Вей|Elara Vey|エララ・ヴェイ|埃拉拉·维|엘라라 베이
Брат Алдрен|Hermano Aldren|アルドレン修道士|奥尔德伦修士|알드렌 수사
Мира Фоксглав|Mira Foxglove|ミラ・フォックスグローブ|米拉·福克斯格洛夫|미라 폭스글러브
Сэр Корвен Хейл|Sir Corven Hale|コーヴェン・ヘイル卿|科文·黑尔爵士|코르벤 헤일 경
Несса Роуэн|Nessa Rowan|ネッサ・ローワン|内莎·罗文|네사 로완
Томас Флинт|Tomas Flint|トマス・フリント|托马斯·弗林特|토마스 플린트
Королева Изабет|Reina Ysabet|イザベット女王|伊莎贝特女王|이자벳 여왕
Принц Эдрик|Príncipe Edric|エドリック王子|埃德里克王子|에드릭 왕자
Леди Мэйлин|Lady Maelin|メイリン夫人|梅琳女士|메일린 여사
Маршал Варо|Mariscal Varo|ヴァロ元帥|瓦罗元帅|바로 원수
Писец Иона|Escriba Ione|書記イオネ|书记伊奥涅|서기관 이오네
Капитан Бранн|Capitán Brann|ブラン隊長|布兰队长|브란 대장
Рук Фен|Rook Fen|ルーク・フェン|鲁克·芬|루크 펜
Сестра Калис|Hermana Calis|カリス修道女|卡莉丝修女|칼리스 수녀
Оррен Пайк|Orren Pike|オレン・パイク|奥伦·派克|오렌 파이크
Джунипер Вейл|Juniper Vale|ジュニパー・ヴェイル|朱尼珀·韦尔|주니퍼 베일
Хадрик Мосс|Hadric Moss|ハドリック・モス|哈德里克·莫斯|하드릭 모스
Талия Дон|Talia Dawn|タリア・ドーン|塔莉娅·道恩|탈리아 돈
Венн Олдер|Venn Alder|ヴェン・アルダー|文恩·奥尔德|벤 올더
Кестрел Грей|Kestrel Grey|ケストレル・グレイ|凯斯特雷尔·格雷|케스트럴 그레이
Одо Белл|Odo Bell|オド・ベル|奥多·贝尔|오도 벨
Рея Марроу|Rhea Marrow|レア・マロウ|蕾娅·马罗|레아 매로
Перрин Эш|Perrin Ash|ペリン・アッシュ|佩林·阿什|페린 애시
Сейбл Рен|Sable Wren|セイブル・レン|塞布尔·雷恩|세이블 렌
Холмовой тролль|Trol de las Colinas|丘のトロール|丘陵巨魔|언덕 트롤
Пепельная виверна|Guiverno de Ceniza|灰のワイバーン|灰烬飞龙|잿빛 와이번
Гоблин-разоритель|Saqueador Goblin|略奪ゴブリン|地精劫掠者|고블린 약탈자
Моховой дракон|Draco del Musgo|苔のドレイク|苔藓亚龙|이끼 드레이크
Грифон-изгой|Grifo Desterrado|追放されたグリフォン|流亡狮鹫|추방된 그리핀
Рыцарь без клятвы|Caballero sin Juramento|誓いなき騎士|无誓骑士|맹세 없는 기사
Королевский шпион|Espía de la Corona|王冠の密偵|王室密探|왕실 첩자
Болотная ведьма|Bruja del Pantano|沼の魔女|沼泽女巫|늪 마녀
Каменный страж|Centinela de Piedra|石の番人|石头守卫|돌 파수꾼
Курганный мертвец|Espectro del Túmulo|塚の亡霊|古冢尸妖|고분 망령
Банда красных колпаков|Banda de Gorros Rojos|赤帽子の一団|红帽帮|레드캡 무리
Дикая мантикора|Mantícora Salvaje|野生のマンティコア|野生蝎尾狮|야생 만티코어
Зеркальный маг|Mago del Espejo|鏡の魔術師|镜之法师|거울 마법사
Дорожный налётчик|Asaltante del Camino|街道の襲撃者|路匪|길의 습격자
Топяная гидра|Hidra de la Ciénaga|湿地のヒドラ|泥沼九头蛇|수렁 히드라
Имперский автоматон|Autómata Imperial|帝国の自動人形|帝国自动机|제국 자동인형
Чумной алхимик|Alquimista de la Peste|疫病の錬金術師|瘟疫炼金术士|역병 연금술사
Полый великан|Gigante Hueco|虚ろな巨人|空心巨人|텅 빈 거인
Клинок дорожного стража|Hoja del Guardacaminos|街道守りの剣|道路守卫之刃|길 수호자의 검
Набор путника|Equipo del Caminante|旅人の道具|旅人工具包|여행자 도구
Реликвия углей|Reliquia de las Brasas|熾火の遺物|余烬遗物|불씨 유물
Зелье Лунного колодца|Poción del Pozo Lunar|月の泉の霊薬|月井药剂|달샘 물약
Кольчуга королевской стражи|Malla de la Guardia Real|近衛の鎖帷子|王室卫队锁甲|왕실 근위대 사슬갑옷
Отмычки семи ключей|Ganzúas de las Siete Llaves|七つの鍵の解錠具|七钥开锁器|일곱 열쇠 자물쇠 도구
Королевский жетон|Emblema Real|王家の証|王室信物|왕실 증표
Седло грифона|Silla de Grifo|グリフォンの鞍|狮鹫鞍具|그리핀 안장
Осколок камня клятв|Fragmento de la Piedra del Juramento|誓いの石の欠片|誓石碎片|맹세석 조각
Карта забытых дорог|Mapa de los Caminos Perdidos|失われた道の地図|失落道路地图|잃어버린 길의 지도
Солнечный диск|Disco Solar|太陽の円盤|太阳圆盘|태양 원반
Лук Тернового леса|Arco del Bosque Espinoso|茨の森の弓|荆棘林之弓|가시숲 활
Знамя перемирия|Estandarte de Tregua|停戦の旗|休战旗|휴전의 깃발
Линза писца|Lente del Escriba|書記のレンズ|书记透镜|서기관의 렌즈
Угольная бомба|Bomba de Ceniza|燃え殻爆弾|煤渣炸弹|잿불 폭탄
Речной компас|Brújula del Río|川の羅針盤|河流罗盘|강의 나침반
Курганный фонарь|Farol del Túmulo|塚の灯籠|古冢提灯|고분 등불
Родовая печать|Sello Ancestral|家伝の印章|传家印章|가보 인장
Флейта из драконьей кости|Flauta de Hueso de Dragón|竜骨の笛|龙骨笛|용뼈 피리
Колокольчик паломника|Campana del Peregrino|巡礼者の鈴|朝圣者铃铛|순례자의 종
Имперская шестерня|Engranaje Imperial|帝国の歯車|帝国齿轮|제국 톱니바퀴
Моховой плащ|Capa de Musgo|苔の外套|苔藓斗篷|이끼 망토
Серебряная коробка пайков|Caja de Raciones de Plata|銀の食糧箱|银制口粮盒|은제 배급 상자
Шлем без короны|Yelmo sin Corona|王冠なき兜|无冠头盔|왕관 없는 투구
Пропавшая корона|Corona Desaparecida|消えた王冠|失踪的王冠|사라진 왕관
Зелёная клятва|Juramento Verde|緑の誓い|绿之誓约|녹색 맹세
Пир кометы|Fiesta del Cometa|彗星の宴|彗星盛宴|혜성의 축제
Мостовая пошлина|Peaje del Puente|橋の通行料|桥梁通行税|다리 통행료
Разорванная помолвка|Compromiso Roto|破られた婚約|破裂的婚约|파기된 약혼
Зимняя десятина|Diezmo de Invierno|冬の十分の一税|冬季什一税|겨울 십일조
Перемирие с чудовищами|Tregua con los Monstruos|怪物との停戦|怪物休战|괴물과의 휴전
Безмолвный колокол|Campana Silenciosa|沈黙の鐘|无声之钟|침묵의 종
Ложный наследник|Heredero Falso|偽の後継者|虚假继承人|가짜 후계자
Затопленный брод|Vado Inundado|水没した渡し|淹没的浅滩|물에 잠긴 여울
Совет стражей|Asamblea de Guardianes|守護者の会議|守卫议会|수호자 회의
Пеплопад|Lluvia de Ceniza|灰の雨|灰烬雨|재의 비
Королевские похороны|Funeral Real|王家の葬儀|王室葬礼|왕실 장례식
Спор об урожае|Disputa por la Cosecha|収穫をめぐる争い|收成争端|수확 분쟁
Старая дорога открыта|Se Abre el Viejo Camino|古い道が開く|古道开启|옛길이 열리다
Перелёт грифонов|Migración de Grifos|グリフォンの渡り|狮鹫迁徙|그리핀의 이동
Чумной караван|Caravana de la Peste|疫病の隊商|瘟疫商队|역병 대상단
Затмение Лунного колодца|Eclipse del Pozo Lunar|月の泉の食|月井之蚀|달샘의 일식
Забастовка гильдии|Huelga del Gremio|ギルドのストライキ|公会罢工|길드 파업
Пограничный набег|Incursión Fronteriza|国境襲撃|边境突袭|국경 습격
Обмен пленными|Intercambio de Prisioneros|捕虜交換|俘虏交换|포로 교환
Древний маяк|Faro Antiguo|古代の灯台|古代灯塔|고대 봉화
Мечи за ужином|Espadas en la Cena|夕食の剣|晚宴上的刀剑|저녁 식사의 검
Деревенское обвинение|Acusación del Pueblo|村の告発|村庄的指控|마을의 고발
Пропавший патруль|Patrulla Perdida|行方不明の巡回隊|失踪巡逻队|실종된 순찰대
Аукцион реликвий|Subasta de Reliquias|遺物の競売|遗物拍卖|유물 경매
Предупреждение об осаде|Aviso de Asedio|包囲の警告|围城警报|포위 경고
Река краснеет|El Río Corre Rojo|赤く流れる川|河水染红|붉게 흐르는 강
Исчезновение посланника|Desaparece el Emisario|消えた使節|使者失踪|사절의 실종
Королевский суд|Juicio de la Corona|王冠の裁き|王室裁决|왕실의 판결
Колокол на рассвете|Una Campana al Alba|夜明けの鐘|黎明之钟|새벽의 종
Закрытые врата|La Puerta Cerrada|閉ざされた門|紧闭的大门|닫힌 관문
Следы за бродом|Huellas más allá del Vado|渡しの向こうの足跡|浅滩彼岸的足迹|여울 너머의 흔적
Совет знамён|Consejo de Estandartes|旗の評議会|旗帜议会|깃발 회의
Засада на старой дороге|Emboscada en el Viejo Camino|古道の待ち伏せ|古道伏击|옛길의 매복
Переговоры под тернами|Parlamento bajo los Espinos|茨の下の交渉|荆棘之下的谈判|가시 아래의 협상
Пустой трон|El Trono Vacío|空の玉座|空王座|빈 왕좌
Пир ножей|Banquete de Cuchillos|刃の宴|刀锋盛宴|칼의 연회
Клятва перед битвой|Juramento antes de la Batalla|戦い前の誓い|战前誓约|전투 전의 맹세
Спуск к Лунному колодцу|Descenso al Pozo Lunar|月の泉への降下|下探月井|달샘으로의 하강
Галерея статуй|Galería de Estatuas|彫像の回廊|雕像长廊|조각상 회랑
Механизм под холмом|Motor bajo la Colina|丘の下の機関|山丘下的机械|언덕 아래의 기관
Пробуждение стража|Despierta el Guardián|目覚める守護者|守卫苏醒|수호자의 각성
Выбор наследников|Elección de los Herederos|後継者たちの選択|继承人的抉择|후계자들의 선택
Битва у Королевского моста|Batalla en Puente del Rey|王の橋の戦い|国王桥之战|왕의 다리 전투
Цена короны|Precio de la Corona|王冠の代償|王冠的代价|왕관의 대가
Дорога домой|Camino a Casa|帰り道|归途|집으로 가는 길
Песни после победы|Canciones tras la Victoria|勝利の後の歌|凯旋之歌|승리 뒤의 노래
Рыцарь клятвы|Caballero Juramentado|誓約の騎士|誓约骑士|맹세의 기사
Следопыт Тернового леса|Explorador del Bosque Espinoso|茨の森の野伏|荆棘林游侠|가시숲 순찰자
Маг углей|Mago de las Brasas|熾火の魔術師|余烬法师|불씨 마법사
Посланник дорог|Emisario de los Caminos|街道を知る使節|熟路使者|길에 밝은 사절
Целитель Лунного колодца|Sanador del Pozo Lunar|月の泉の治療師|月井医者|달샘 치유사
Наследник без короны|Vástago sin Corona|王冠なき末裔|无冠后裔|왕관 없는 후손
Гильдейский исследователь|Explorador del Gremio|ギルドの探掘者|公会探险者|길드 탐굴자
Капитан знамени|Capitán del Estandarte|旗の隊長|旗队队长|깃발 대장
Прославленный страж|Guardián de Renombre|名高い守護者|著名守卫|명성 높은 수호자
Мастер дорог|Maestro de los Caminos|街道の達人|道路大师|길의 달인
Хранитель углей|Custodio de las Brasas|熾火の守り手|余烬守护者|불씨의 지킴이
Голос союза|Voz del Pacto|盟約の声|同盟之声|협약의 목소리
Наследник примирения|Heredero de la Reconciliación|和解の後継者|和解继承人|화해의 후계자
Искатель древней империи|Buscador del Antiguo Imperio|古代帝国の探求者|古帝国探索者|고대 제국의 탐구자
Иллюстрированная хроника|Crónica Iluminada|彩飾年代記|彩绘编年史|채색 연대기
Потрёпанная карта границы|Mapa Fronterizo Desgastado|風化した国境地図|风化边境地图|낡은 국경 지도
Имперская мозаика|Mosaico Imperial|帝国のモザイク|帝国马赛克|제국 모자이크'''
for i,line in zip(range(37,490,3),names.splitlines()):add(src[i],line)
assert len(names.splitlines())==151
base='''Классическое фэнтези|Fantasía Clásica|王道ファンタジー|经典奇幻|정통 판타지
Героические путешествия через соперничающие королевства, опасные дороги и древние руины в кругу верных друзей.|Viajes heroicos por reinos rivales, caminos peligrosos y ruinas antiguas, con una luminosa camaradería.|敵対する王国、危険な街道、古代遺跡を巡る英雄の旅と輝かしい仲間の絆。|穿越敌对王国、危险道路与古代遗迹，在光明的友谊中展开英雄之旅。|경쟁하는 왕국, 위험한 길, 고대 유적을 누비며 빛나는 동료애를 나누는 영웅들의 여정.
путешествие|viaje|旅|旅行|여행
угроза|amenaza|脅威|威胁|위협
подвиг|hazaña|功績|功绩|위업
развитие|crecimiento|成長|成长|성장
Пограничные королевства|Reinos Fronterizos|国境の王国群|边境诸国|국경 왕국들
Защищайте малые королевства на стыке дикой природы, чудовищ и старой вражды.|Defiende pequeños reinos donde confluyen lo salvaje, los monstruos y antiguos rencores.|荒野と怪物と古い怨恨が交わる小国を守る。|守护荒野、怪物与旧怨交汇的小国。|황야와 괴물, 오래된 원한이 만나는 작은 왕국들을 지켜라.
Война наследников|Guerra de Herederos|後継者の戦争|继承人之战|후계자 전쟁
Выбирайте верность и определяйте борьбу за наследование расколотой короны.|Elige lealtades y determina una lucha sucesoria en una corona dividida.|分裂した王家の継承争いで忠誠を選び、その行方を左右する。|选择效忠对象，影响分裂王权的继承之争。|충성을 선택하고 분열된 왕권의 계승 다툼을 이끌어라.
Руины древней империи|Ruinas del Antiguo Imperio|古代帝国の遺跡|古帝国遗迹|고대 제국의 유적
Исследуйте павшие чудеса, чьи сокровища могут преобразить мир живых.|Explora maravillas caídas cuyos tesoros pueden transformar el mundo de los vivos.|失われた驚異を探り、その宝で今の世界を変える。|探索陨落的奇观，其宝藏能重塑现世。|보물이 살아 있는 세계를 바꿀 수 있는 몰락한 경이들을 탐험하라.
Отправляйтесь к месту под угрозой|Viaja hacia un lugar amenazado|脅かされた場所へ旅する|前往受威胁之地|위협받는 장소로 여행하라
Раскройте опасность или расколотую верность|Revela un peligro o una lealtad dividida|危険や引き裂かれた忠誠を明かす|揭示危险或分裂的忠诚|위험이나 갈라진 충성을 밝혀라
Действуйте, договаривайтесь или сражайтесь ради значимого результата|Actúa, negocia o lucha por un resultado trascendente|重大な結果のために行動、交渉、戦闘を行う|行动、谈判或战斗，争取重要成果|중요한 결과를 위해 행동하고 협상하거나 싸워라
Наградите сокровищем, славой и изменившимися отношениями|Otorga tesoros, renombre y una relación transformada|宝、名声、変化した関係を報酬にする|奖励宝物、声望与改变的关系|보물과 명성, 달라진 관계를 보상하라
Удержите спорное пограничье, пока дороги разрушаются, кланы чудовищ переселяются, а честолюбивые стражи проверяют каждую клятву.|Mantén unida una frontera disputada mientras fallan los caminos, migran clanes de monstruos y guardianes ambiciosos ponen a prueba cada juramento.|道が崩れ、怪物の氏族が移住し、野心的な守護者がすべての誓いを試す中、争われる国境を守り抜く。|道路失修、怪物氏族迁徙、野心勃勃的守卫考验每个誓约之际，维系纷争中的边境。|길이 무너지고 괴물 씨족이 이동하며 야심 찬 수호자들이 모든 맹세를 시험하는 분쟁의 국경을 지켜라.
Разберитесь в нарушенном наследовании, где знамёна, браки, зерновые пути и милосердие в битве решают, кому носить корону.|Navega una sucesión rota donde los estandartes, matrimonios, rutas de grano y la misericordia en batalla deciden quién puede llevar la corona.|旗、婚姻、穀物の輸送路、戦場での慈悲が王冠の持ち主を決める、破綻した継承争いを進む。|在破裂的王位继承中周旋；旗帜、联姻、粮道与战场上的仁慈决定谁能戴上王冠。|깃발과 혼인, 곡물 수송로와 전장의 자비가 왕관의 주인을 정하는 무너진 계승 질서를 헤쳐 나가라.
Исследуйте запечатанные имперские сооружения, чьи забытые механизмы, беспокойные стражи и погребённые законы способны преобразить нынешние королевства.|Explora obras imperiales selladas cuyos motores perdidos, guardianes inquietos y leyes enterradas pueden transformar los reinos vivos.|失われた機関、落ち着かぬ守護者、埋もれた法が現在の王国を変えうる、封印された帝国の施設を探る。|探索被封印的帝国工程；失落机械、不安的守卫与被埋葬的法律能重塑现存王国。|잃어버린 기관과 잠들지 못하는 수호자, 묻힌 법이 현존 왕국들을 바꿀 수 있는 봉인된 제국 시설을 탐험하라.'''
for i,line in enumerate(base.splitlines()):add(src[i],line)
for i in [19,25,31]:
 c=src[i].split(':')[0]
 for l,ending in zip(langs,['Первая клятва','El Primer Juramento','最初の誓い','第一誓约','첫 맹세']):maps[l][src[i]]=maps[l][c]+': '+ending
for i in [20,26,32]:
 c=src[i-1].split(':')[0]
 vals=['Полное приключение на три-четыре часа в мире «{c}»: путешествия, переговоры, опасности, награда и выбор с долгими последствиями.','Una aventura completa de tres a cuatro horas en {c}, con viaje, negociación, peligro, recompensa y una elección duradera.','「{c}」の3～4時間の完全な冒険。旅、交渉、危険、報酬、長く残る選択を含む。','一场完整的三至四小时《{c}》冒险，包含旅行、谈判、危险、奖励与影响长远的抉择。','{c}에서 펼치는 3~4시간짜리 완전한 모험. 여행과 협상, 위험과 보상, 오래 남는 선택을 담는다.']
 for l,v in zip(langs,vals):maps[l][src[i]]=v.format(c=maps[l][c])
opening={21:'Начните у перекрытой дороги, откуда видны беженцы.|Comienza en un camino bloqueado con refugiados a la vista.|難民が見える封鎖された道から始める。|从能看见难民的封锁道路开始。|난민들이 보이는 막힌 길에서 시작하라.',22:'Покажите и стража, и деревню как убедительных претендентов.|Presenta al guardián y al pueblo como reclamantes creíbles.|守護者と村の双方に説得力ある主張を持たせる。|让守卫与村庄双方的诉求都可信。|수호자와 마을 양쪽의 요구가 모두 설득력 있게 하라.',23:'Перемещайте угрозу чудовищ, когда группа медлит.|Desplaza la amenaza monstruosa cuando el grupo se demore.|一行が遅れると怪物の脅威を移動させる。|队伍拖延时，移动怪物威胁。|일행이 지체하면 괴물의 위협을 이동시켜라.',24:'Запишите, какую клятву группа решила соблюсти.|Anota qué juramento decide cumplir el grupo.|一行がどの誓いを守ると決めたか記録する。|记录队伍选择履行哪个誓约。|일행이 지키기로 한 맹세를 기록하라.',27:'Начните на публичной церемонии наследования, прерванной появлением доказательств.|Comienza durante una ceremonia pública de sucesión interrumpida por pruebas.|証拠の登場で中断される公開の継承儀式から始める。|从被证据打断的公开继承仪式开始。|증거의 등장으로 중단되는 공개 계승 의식에서 시작하라.',28:'Дайте каждому наследнику одно законное основание и один опасный компромисс.|Da a cada heredero una reivindicación legítima y un compromiso peligroso.|各後継者に正当な根拠と危険な妥協を一つずつ与える。|给每位继承人一个合法依据与一个危险妥协。|각 후계자에게 정당한 주장 하나와 위험한 타협 하나를 주어라.',29:'Превратите победу в битве в переговоры, а не в автоматическую коронацию.|Convierte el éxito en batalla en una negociación en lugar de una coronación automática.|戦場の勝利を自動的な戴冠ではなく交渉につなげる。|把战场胜利转化为谈判，而非自动加冕。|전장의 성공이 자동 즉위가 아닌 협상으로 이어지게 하라.',30:'Запишите, кто получает корону и какой долг остаётся.|Anota quién obtiene la corona y qué deuda queda.|誰が王冠を得て、どんな負債が残るか記録する。|记录谁获得王冠，以及留下什么债务。|누가 왕관을 얻고 어떤 빚이 남는지 기록하라.',33:'Начните, когда имперский механизм пробуждается под заселённым холмом.|Comienza cuando un mecanismo imperial despierta bajo una colina habitada.|人の住む丘の下で帝国の機構が目覚めた時に始める。|从帝国机械在有人居住的山丘下苏醒时开始。|사람이 사는 언덕 아래에서 제국 기계가 깨어날 때 시작하라.',34:'Раскройте несовместимые толкования через надписи и живых свидетелей.|Usa inscripciones y testigos vivos para revelar interpretaciones incompatibles.|碑文と生きた証人で相容れない解釈を明かす。|用铭文与活着的证人揭示互不相容的解释。|비문과 살아 있는 증인을 통해 양립할 수 없는 해석들을 드러내라.',35:'Пусть страж реагирует на закон, жертву или силу.|Haz que el guardián responda a la ley, el sacrificio o la fuerza.|守護者が法、犠牲、力に反応するようにする。|让守卫回应法律、牺牲或武力。|수호자가 법과 희생, 힘에 반응하게 하라.',36:'Запишите, запечатана ли старая сила, разделена или присвоена.|Anota si el antiguo poder se sella, se comparte o se reclama.|古い力が封印、共有、占有されたか記録する。|记录古老力量是被封印、共享还是占有。|옛 힘이 봉인되었는지, 공유되었는지, 차지되었는지 기록하라.'}
for i,v in opening.items():add(src[i],v)
templates={
'holds roads and granaries in {c}; its captains demand service before granting safe passage.':'{n} контролирует дороги и зернохранилища в мире «{c}»; капитаны требуют службы, прежде чем разрешить безопасный проход.|{n} controla caminos y graneros en {c}; sus capitanes exigen servicio antes de conceder paso seguro.|{n}は「{c}」の街道と穀倉を押さえ、隊長たちは安全な通行の前に奉仕を求める。|{n}掌控《{c}》的道路与粮仓，其队长要求先提供服务才准许安全通行。|{n}: {c}의 길과 곡물 창고를 장악하며, 대장들은 안전한 통행을 허락하기 전에 봉사를 요구한다.',
'claims an old charter in {c}, trading protection for public loyalty and private concessions.':'{n} ссылается на древнюю хартию в мире «{c}», предоставляя защиту в обмен на публичную верность и тайные уступки.|{n} invoca una antigua carta en {c}, ofreciendo protección a cambio de lealtad pública y concesiones privadas.|{n}は「{c}」で古い勅許を主張し、公の忠誠と内密の譲歩の対価として保護を提供する。|{n}在《{c}》中援引古老特许状，以保护换取公开效忠与私下让步。|{n}: {c}에서 옛 헌장을 내세우며 공개적인 충성과 사적인 양보를 대가로 보호를 제공한다.',
'is divided over the future of {c}; one wing seeks peace while another prepares a decisive seizure.':'{n} расколота по вопросу будущего мира «{c}»: одно крыло стремится к миру, другое готовит решающий захват.|{n} se divide sobre el futuro de {c}; un ala busca la paz y otra prepara una toma decisiva.|{n}は「{c}」の未来をめぐって分裂し、一派は和平を、他派は決定的な奪取を準備する。|{n}因《{c}》的未来而分裂；一派寻求和平，另一派准备决定性的夺权。|{n}: {c}의 미래를 두고 갈라져 한쪽은 평화를 찾고 다른 쪽은 결정적인 장악을 준비한다.',
'controls a scarce craft needed across {c}, making every alliance costly and every insult consequential.':'{n} контролирует редкое ремесло, нужное всему миру «{c}», поэтому каждый союз дорог, а каждое оскорбление имеет последствия.|{n} controla un oficio escaso necesario en todo {c}, haciendo costosa cada alianza y trascendente cada insulto.|{n}は「{c}」全域に必要な希少技術を支配し、あらゆる同盟に費用を、侮辱に重大な結果を伴わせる。|{n}控制《{c}》各地所需的稀缺技艺，使每次结盟都有代价，每次侮辱都有后果。|{n}: {c} 전역에 필요한 희귀 기술을 통제해 모든 동맹에 비용을, 모든 모욕에 결과를 따르게 한다.',
'is a contested landmark in {c}, where travelers can find shelter only by resolving a local oath dispute.':'{n} — спорная достопримечательность мира «{c}»; путники найдут укрытие, лишь разрешив местный спор о клятве.|{n} es un hito disputado en {c}, donde los viajeros solo hallan refugio resolviendo una disputa local sobre un juramento.|{n}は「{c}」の争われる名所で、旅人は地元の誓いの争いを解決しなければ避難場所を得られない。|{n}是《{c}》中有争议的地标，旅人只有解决当地的誓约争端才能找到庇护。|{n}: {c}의 분쟁 중인 명소로, 여행자는 지역 맹세 분쟁을 해결해야만 피난처를 얻는다.',
'guards a route through {c}; its hidden entrance opens when visitors return a stolen community relic.':'{n} охраняет путь через мир «{c}»; тайный вход открывается, когда гости возвращают украденную реликвию общины.|{n} guarda una ruta por {c}; su entrada oculta se abre cuando los visitantes devuelven una reliquia comunitaria robada.|{n}は「{c}」を通る道を守り、訪問者が盗まれた共同体の聖遺物を返すと隠された入口が開く。|{n}守护穿越《{c}》的路线；访客归还被盗的社区遗物后，隐藏入口才会打开。|{n}: {c}를 지나는 길을 지키며, 방문객이 도난당한 공동체 유물을 돌려주면 숨겨진 입구가 열린다.',
'bears visible scars from the conflict in {c}, and clues there point toward the next threatened settlement.':'{n} несёт заметные шрамы конфликта в мире «{c}», а местные улики указывают на следующее поселение под угрозой.|{n} muestra cicatrices del conflicto en {c}, y sus pistas señalan el siguiente asentamiento amenazado.|{n}には「{c}」の紛争の傷跡が見え、そこにある手掛かりは次に脅かされる集落を示す。|{n}带有《{c}》冲突的明显伤痕，那里的线索指向下一个受威胁的聚落。|{n}: {c}의 충돌로 인한 흔적이 뚜렷하며, 그곳의 단서는 다음에 위협받을 정착지를 가리킨다.',
'offers safety in {c} at a price: the keeper asks the party to choose which neighboring claim deserves aid.':'{n} предлагает безопасность в мире «{c}» за плату: хранитель просит группу выбрать, какая соседская претензия заслуживает помощи.|{n} ofrece seguridad en {c} a un precio: el custodio pide al grupo elegir qué reivindicación vecina merece ayuda.|{n}は「{c}」で代償つきの安全を提供する。管理者は一行に、近隣のどの主張を支援すべきか選ばせる。|{n}在《{c}》中提供有代价的安全：看守要求队伍选择哪个邻近诉求值得援助。|{n}: {c}에서 대가를 받고 안전을 제공한다. 관리인은 일행에게 이웃의 어느 주장을 도울지 선택하도록 한다.',
'knows who profits from the crisis in {c} but will speak only after the party protects an innocent rival.':'{n} знает, кто наживается на кризисе в мире «{c}», но заговорит лишь после того, как группа защитит невиновного соперника.|{n} sabe quién se beneficia de la crisis en {c}, pero solo hablará cuando el grupo proteja a un rival inocente.|{n}は「{c}」の危機で利益を得る者を知っているが、一行が無実の対立者を守るまで話さない。|{n}知道谁从《{c}》的危机中获利，但只有队伍保护无辜对手后才会开口。|{n}: {c}의 위기로 이익을 보는 자를 알지만, 일행이 무고한 경쟁자를 보호해야 입을 연다.',
'carries authority in {c} and needs discreet allies before a public oath forces an irreversible choice.':'{n} обладает властью в мире «{c}» и нуждается в осторожных союзниках, прежде чем публичная клятва вынудит сделать необратимый выбор.|{n} tiene autoridad en {c} y necesita aliados discretos antes de que un juramento público imponga una elección irreversible.|{n}は「{c}」で権威を持ち、公の誓いが取り返しのつかない選択を強いる前に、慎重な味方を必要とする。|{n}在《{c}》拥有权威，需要谨慎的盟友，以免公开誓约迫使其作出不可逆的选择。|{n}: {c}에서 권위를 지니며, 공개적인 맹세로 돌이킬 수 없는 선택을 강요받기 전에 신중한 동맹이 필요하다.',
'has mapped a dangerous route across {c}; fear of an old betrayal makes every promise difficult to trust.':'{n} составил карту опасного пути через мир «{c}»; страх давнего предательства мешает доверять любым обещаниям.|{n} ha cartografiado una ruta peligrosa por {c}; el temor a una antigua traición dificulta confiar en cualquier promesa.|{n}は「{c}」を横断する危険な道を地図にしたが、過去の裏切りへの恐怖から約束を信じられない。|{n}绘制了穿越《{c}》的危险路线；对旧日背叛的恐惧使每个承诺都难以信任。|{n}: {c}를 가로지르는 위험한 길을 지도에 표시했지만, 옛 배신에 대한 두려움 때문에 어떤 약속도 쉽게 믿지 못한다.',
'seeks reconciliation in {c}, offering a useful favor if the party preserves dignity on both sides.':'{n} ищет примирения в мире «{c}» и предлагает полезную услугу, если группа сохранит достоинство обеих сторон.|{n} busca reconciliación en {c} y ofrece un favor útil si el grupo preserva la dignidad de ambas partes.|{n}は「{c}」で和解を望み、一行が双方の尊厳を守れば役に立つ便宜を提供する。|{n}在《{c}》中寻求和解，若队伍维护双方尊严，便会提供有用的帮助。|{n}: {c}에서 화해를 추구하며, 일행이 양쪽의 존엄을 지키면 유용한 호의를 제공한다.',
 'threatens travel through {c}, using terrain and frightened locals to isolate anyone who pursues it.':'{n} угрожает путешествиям через мир «{c}», используя местность и испуганных жителей, чтобы изолировать преследователей.|{n} amenaza los viajes por {c}, usando el terreno y lugareños asustados para aislar a quienes lo persiguen.|{n}は「{c}」の旅を脅かし、地形と怯えた住民を利用して追手を孤立させる。|{n}威胁穿越《{c}》的旅行，利用地形与受惊的居民孤立追捕者。|{n}: {c}를 지나는 여행을 위협하며 지형과 겁먹은 주민을 이용해 추격자를 고립시킨다.',
'serves a hidden claimant in {c}; defeating it reveals an order that turns a simple hunt into political evidence.':'{n} служит тайному претенденту в мире «{c}»; победа раскрывает приказ, превращающий обычную охоту в политическое доказательство.|{n} sirve a un pretendiente oculto en {c}; derrotarlo revela una orden que convierte una simple caza en prueba política.|{n}は「{c}」の隠れた権利主張者に仕え、倒すと単なる狩りを政治的な証拠へ変える命令が見つかる。|{n}为《{c}》的秘密觊觎者效力；击败它会揭露一道命令，使普通狩猎变成政治证据。|{n}: {c}의 숨은 권리 주장자를 섬기며, 물리치면 단순한 사냥을 정치적 증거로 바꾸는 명령이 드러난다.',
'protects something valuable beneath {c}, and can be bargained with if the party learns the terms of its ancient duty.':'{n} охраняет ценность под миром «{c}»; с ним можно договориться, если группа узнает условия его древнего долга.|{n} protege algo valioso bajo {c}; se puede negociar si el grupo descubre los términos de su antiguo deber.|{n}は「{c}」の地下で貴重なものを守り、一行が古い義務の条件を知れば交渉できる。|{n}守护《{c}》地下的珍贵之物；队伍了解其古老职责的条件后便可谈判。|{n}: {c} 아래의 귀중한 것을 지키며, 일행이 고대 의무의 조건을 알아내면 협상할 수 있다.',
'exploits the unrest in {c}, retreating toward civilians whenever direct force would carry an unacceptable cost.':'{n} использует волнения в мире «{c}», отступая к мирным жителям всякий раз, когда прямое применение силы обернулось бы неприемлемой ценой.|{n} aprovecha los disturbios en {c}, retirándose hacia civiles cuando la fuerza directa tendría un coste inaceptable.|{n}は「{c}」の騒乱を利用し、直接攻撃が許容できない犠牲を招くよう民間人の方へ退く。|{n}利用《{c}》的动乱，每当直接武力会造成不可接受的代价时，就向平民退去。|{n}: {c}의 불안을 이용하며, 직접적인 무력이 감당할 수 없는 대가를 낳도록 민간인 쪽으로 물러난다.',
'solves a practical obstacle in {c}, while its heraldry identifies a faction that denies ever possessing it.':'{n} помогает преодолеть практическое препятствие в мире «{c}», но его герб указывает на фракцию, отрицающую, что когда-либо им владела.|{n} resuelve un obstáculo práctico en {c}, pero su heráldica identifica a una facción que niega haberlo poseído.|{n}は「{c}」の実務的な障害を解決するが、紋章は所有を否定する勢力を示している。|{n}能解决《{c}》的实际障碍，但其纹章指向一个否认曾拥有它的派系。|{n}: {c}의 실질적인 장애물을 해결하지만, 문장은 소유한 적 없다고 주장하는 세력을 가리킨다.',
'is a reward promised in {c}; using it immediately grants an advantage but weakens the final settlement.':'{n} — обещанная награда в мире «{c}»; немедленное использование даёт преимущество, но ослабляет окончательное соглашение.|{n} es una recompensa prometida en {c}; usarla enseguida da ventaja pero debilita el acuerdo final.|{n}は「{c}」で約束された報酬で、すぐに使うと有利になるが最終合意を弱める。|{n}是《{c}》中承诺的奖励；立即使用能取得优势，却会削弱最终协议。|{n}: {c}에서 약속된 보상으로, 바로 사용하면 이점을 얻지만 최종 합의가 약해진다.',
'preserves evidence from {c}, allowing the party to challenge a lie before violence becomes inevitable.':'{n} сохраняет доказательства из мира «{c}», позволяя группе опровергнуть ложь до того, как насилие станет неизбежным.|{n} conserva pruebas de {c}, permitiendo al grupo refutar una mentira antes de que la violencia sea inevitable.|{n}は「{c}」の証拠を保存し、暴力が避けられなくなる前に一行が嘘を問いただせる。|{n}保存《{c}》的证据，让队伍在暴力不可避免前质疑谎言。|{n}: {c}의 증거를 보존해 폭력이 불가피해지기 전에 일행이 거짓말을 반박할 수 있게 한다.',
'aids travel through {c} and bears a prior owner’s oath that creates a new obligation when revealed.':'{n} помогает путешествовать через мир «{c}» и несёт клятву прежнего владельца, которая при раскрытии создаёт новое обязательство.|{n} facilita el viaje por {c} y lleva un juramento de su dueño anterior que crea una nueva obligación al revelarse.|{n}は「{c}」の旅を助け、明らかになると新たな義務を生む前の所有者の誓いを帯びている。|{n}有助于穿越《{c}》，并承载前主人的誓约；誓约揭晓时会带来新义务。|{n}: {c}의 여행을 돕고 전 주인의 맹세를 지니며, 그 맹세가 드러나면 새로운 의무가 생긴다.',
'interrupts the journey across {c}, forcing the party to choose between speed, public trust, and scarce supplies.':'{n} прерывает путешествие через мир «{c}», вынуждая группу выбирать между скоростью, доверием людей и скудными припасами.|{n} interrumpe el viaje por {c}, obligando al grupo a elegir entre rapidez, confianza pública y suministros escasos.|{n}は「{c}」の旅を中断し、一行に速さ、民衆の信頼、乏しい物資の間での選択を迫る。|{n}打断穿越《{c}》的旅程，迫使队伍在速度、公众信任与稀缺补给之间选择。|{n}: {c}를 지나는 여정을 중단시켜 일행이 속도, 대중의 신뢰, 부족한 보급품 중에서 선택하도록 한다.',
'changes the balance in {c}; two factions offer incompatible accounts and both can prove part of their claim.':'{n} меняет равновесие в мире «{c}»; две фракции дают несовместимые версии, и обе могут доказать часть своих утверждений.|{n} cambia el equilibrio en {c}; dos facciones ofrecen relatos incompatibles y ambas pueden probar parte de su afirmación.|{n}は「{c}」の均衡を変える。二つの勢力は相容れない説明をするが、どちらも主張の一部を証明できる。|{n}改变《{c}》的平衡；两个派系给出相互矛盾的说法，且双方都能证实部分主张。|{n}: {c}의 균형을 바꾼다. 두 세력은 양립할 수 없는 설명을 내놓지만 양쪽 모두 주장의 일부를 증명할 수 있다.',
'exposes a consequence of delay in {c}, moving one threatened NPC and closing an otherwise safe route.':'{n} показывает последствие задержки в мире «{c}»: один NPC под угрозой перемещается, а обычно безопасный путь закрывается.|{n} revela una consecuencia de la demora en {c}, moviendo a un PNJ amenazado y cerrando una ruta que sería segura.|{n}は「{c}」で遅れの結果を示し、脅かされたNPCを一人移動させ、本来安全な道を閉ざす。|{n}揭示《{c}》中拖延的后果：移动一名受威胁的NPC，并关闭本来安全的路线。|{n}: {c}에서 지연의 결과를 드러내며, 위협받는 NPC 한 명을 이동시키고 원래 안전한 길을 닫는다.',
'gives the people of {c} a voice, turning the party’s last deed into support, suspicion, or open resistance.':'{n} даёт жителям мира «{c}» голос, превращая последний поступок группы в поддержку, подозрение или открытое сопротивление.|{n} da voz a la gente de {c}, convirtiendo la última acción del grupo en apoyo, sospecha o resistencia abierta.|{n}は「{c}」の人々に声を与え、一行の直前の行いを支持、疑念、公然の抵抗へ変える。|{n}让《{c}》的居民发声，使队伍最近的行动转化为支持、怀疑或公开抵抗。|{n}: {c} 주민들의 목소리를 드러내며, 일행의 최근 행동을 지지나 의심, 공개적인 저항으로 바꾼다.',
'opens a playable situation in {c} with a visible threat, two useful approaches, and a consequence for waiting.':'{n} открывает игровую ситуацию в мире «{c}» с явной угрозой, двумя действенными подходами и последствием ожидания.|{n} abre una situación jugable en {c} con una amenaza visible, dos enfoques útiles y una consecuencia por esperar.|{n}は「{c}」で目に見える脅威、二つの有効な方法、待つことの結果を持つ場面を始める。|{n}开启《{c}》中一个可玩的场景，包含明显威胁、两种有效方法以及等待的后果。|{n}: {c}에서 눈에 보이는 위협, 유용한 두 접근법, 기다림의 결과가 있는 플레이 상황을 연다.',
'brings rival needs together in {c}; clues support negotiation, stealth, or a direct confrontation.':'{n} сталкивает соперничающие потребности в мире «{c}»; улики помогают переговорам, скрытности или прямой конфронтации.|{n} reúne necesidades rivales en {c}; las pistas favorecen negociación, sigilo o confrontación directa.|{n}は「{c}」で対立する要求を出会わせ、手掛かりは交渉、隠密、直接対決を支える。|{n}让《{c}》中相互竞争的需求交汇；线索支持谈判、潜行或直接对抗。|{n}: {c}에서 대립하는 요구가 만나며, 단서는 협상이나 은밀한 행동, 직접 대결을 뒷받침한다.',
'reveals what the opposition wants in {c} and lets the party change the route by accepting a costly bargain.':'{n} раскрывает желания противников в мире «{c}» и позволяет группе изменить путь, приняв дорогую сделку.|{n} revela lo que desea la oposición en {c} y permite al grupo cambiar la ruta aceptando un trato costoso.|{n}は「{c}」で敵対者の望みを明かし、一行が高い代償の取引を受ければ道を変えられる。|{n}揭示《{c}》中对手的愿望，让队伍通过接受高代价交易改变路线。|{n}: {c}에서 적대자의 바람을 드러내고, 일행이 값비싼 거래를 받아들여 경로를 바꾸게 한다.',
'resolves one pressure in {c} while carrying the party’s choice forward into the next location.':'{n} разрешает одно затруднение в мире «{c}», перенося выбор группы в следующую локацию.|{n} resuelve una presión en {c} y traslada la elección del grupo a la siguiente ubicación.|{n}は「{c}」の圧力を一つ解消しつつ、一行の選択を次の場所へ引き継ぐ。|{n}缓解《{c}》中的一项压力，并将队伍的选择延续到下一地点。|{n}: {c}의 압박 하나를 해결하며 일행의 선택을 다음 장소로 이어 간다.',
'enters {c} with a clear duty, a useful field specialty, and a relationship that can complicate the first oath.':'{n} вступает в мир «{c}» с ясным долгом, полезной полевой специальностью и отношениями, способными осложнить первую клятву.|{n} entra en {c} con un deber claro, una especialidad útil en el terreno y una relación que puede complicar el primer juramento.|{n}は明確な義務、役立つ現場技能、最初の誓いを複雑にしうる関係を持って「{c}」に入る。|{n}进入《{c}》时带有明确职责、实用的野外专长，以及可能使第一誓约复杂化的关系。|{n}: 명확한 의무와 유용한 현장 전문성, 첫 맹세를 복잡하게 할 수 있는 관계를 갖고 {c}에 들어선다.',
'is ready for {c}, combining a distinct approach to danger with a reason to protect one of its communities.':'{n} готов к миру «{c}», сочетая особый подход к опасности с причиной защищать одну из его общин.|{n} está preparado para {c}, combinando una forma singular de afrontar el peligro con un motivo para proteger una de sus comunidades.|{n}は危険への独自の対応と共同体を一つ守る理由を併せ持ち、「{c}」に備えている。|{n}已为《{c}》做好准备，既有独特的应对危险方式，也有保护其中一个社区的理由。|{n}: 위험에 대한 독특한 접근법과 공동체 하나를 보호할 이유를 갖추고 {c}에 대비한다.',
'knows one hidden truth about {c} and must decide when revealing it matters more than personal standing.':'{n} знает одну скрытую истину о мире «{c}» и должен решить, когда раскрыть её важнее, чем сохранить положение.|{n} conoce una verdad oculta sobre {c} y debe decidir cuándo revelarla importa más que su posición personal.|{n}は「{c}」の隠れた真実を一つ知り、それを明かすことが自分の立場より重要になる時を決めなければならない。|{n}知道《{c}》的一个隐藏真相，必须决定何时揭露它比个人地位更重要。|{n}: {c}의 숨겨진 진실 하나를 알고 있으며, 언제 그것을 밝히는 일이 자신의 지위보다 중요한지 결정해야 한다.',
'has practical authority in {c}, but every use of that status strengthens a rival obligation.':'{n} обладает реальной властью в мире «{c}», но каждое применение статуса усиливает конкурирующее обязательство.|{n} tiene autoridad práctica en {c}, pero cada uso de ese estatus fortalece una obligación rival.|{n}は「{c}」で実効的な権限を持つが、その地位を使うたびに対立する義務が強まる。|{n}在《{c}》拥有实际权威，但每次使用地位都会强化一项竞争性义务。|{n}: {c}에서 실질적인 권위를 지니지만 지위를 사용할 때마다 경쟁하는 의무가 강해진다.',
'advances through deeds in {c}, unlocking recognition, a reliable contact, and responsibility for a lasting consequence.':'{n} развивается через поступки в мире «{c}», получая признание, надёжный контакт и ответственность за долгие последствия.|{n} progresa mediante hazañas en {c}, obteniendo reconocimiento, un contacto fiable y responsabilidad por una consecuencia duradera.|{n}は「{c}」で功績によって成長し、評価、信頼できる連絡先、長く残る結果への責任を得る。|{n}通过《{c}》中的功绩成长，获得认可、可靠联系人以及对长远后果的责任。|{n}: {c}의 위업으로 성장하며 인정과 믿을 만한 연락책, 오래 남는 결과에 대한 책임을 얻는다.',
'rewards difficult choices in {c} with new reach, while tying the hero more closely to a faction’s expectations.':'{n} награждает трудные решения в мире «{c}» новым влиянием, теснее связывая героя с ожиданиями фракции.|{n} recompensa las decisiones difíciles en {c} con mayor alcance, vinculando más al héroe a las expectativas de una facción.|{n}は「{c}」の難しい選択に新たな影響範囲を与える一方、英雄を勢力の期待により強く結びつける。|{n}以扩大影响力奖励《{c}》中的艰难抉择，同时让英雄更紧密地受派系期望约束。|{n}: {c}의 어려운 선택에 더 넓은 영향력을 보상하면서 영웅을 세력의 기대에 더 긴밀히 묶는다.',
 'turns discoveries in {c} into expertise, access, and a final opportunity to reshape an old institution.':'{n} превращает открытия в мире «{c}» в знания, доступ и последнюю возможность преобразить старый институт.|{n} convierte los descubrimientos en {c} en conocimientos, acceso y una última oportunidad de transformar una antigua institución.|{n}は「{c}」の発見を専門知識、接近権、古い組織を変える最後の機会へと変える。|{n}将《{c}》中的发现转化为专业知识、访问权，以及重塑古老机构的最后机会。|{n}: {c}의 발견을 전문 지식과 접근권, 오래된 기관을 바꿀 마지막 기회로 전환한다.',
'grows through service in {c}, exchanging short-term power for a promise the Realm can remember.':'{n} растёт через служение в мире «{c}», обменивая краткосрочную власть на обещание, которое королевство сможет помнить.|{n} crece mediante el servicio en {c}, cambiando poder a corto plazo por una promesa que el reino puede recordar.|{n}は「{c}」で奉仕によって成長し、短期の力を王国が記憶する約束と交換する。|{n}通过在《{c}》中服务成长，以短期权力换取王国能够铭记的承诺。|{n}: {c}에서 봉사로 성장하며 단기적인 힘을 왕국이 기억할 약속으로 바꾼다.',
'presents {c} through readable maps, heraldic accents, and illustrated cards suited to heroic travel.':'{n} представляет мир «{c}» с помощью читаемых карт, геральдических акцентов и иллюстрированных карточек для героических путешествий.|{n} presenta {c} mediante mapas legibles, detalles heráldicos y tarjetas ilustradas adecuadas para viajes heroicos.|{n}は読みやすい地図、紋章の装飾、英雄の旅に適した挿絵入りカードで「{c}」を表現する。|{n}通过易读地图、纹章点缀与适合英雄旅行的插画卡牌呈现《{c}》。|{n}: 읽기 쉬운 지도와 문장 장식, 영웅의 여행에 어울리는 그림 카드로 {c}를 표현한다.',
'presents {c} as a weathered field document with strong route marks, faction seals, and practical table contrast.':'{n} представляет мир «{c}» как потрёпанный полевой документ с чёткими маршрутами, печатями фракций и удобным для игры контрастом.|{n} presenta {c} como un documento de campo gastado, con rutas claras, sellos de facciones y un contraste práctico para la mesa.|{n}は明瞭な道標、勢力の印章、卓上で見やすいコントラストを持つ風化した野外文書として「{c}」を表現する。|{n}把《{c}》呈现为风化的野外文件，配有醒目的路线标记、派系印章与便于桌面使用的对比度。|{n}: 선명한 경로 표시와 세력 인장, 탁상 플레이에 유용한 대비를 갖춘 낡은 현장 문서로 {c}를 표현한다.',
'presents {c} with geometric ruins, mineral colors, and luminous details that distinguish ancient mechanisms.':'{n} представляет мир «{c}» с геометрическими руинами, минеральными цветами и сияющими деталями, выделяющими древние механизмы.|{n} presenta {c} con ruinas geométricas, colores minerales y detalles luminosos que distinguen los mecanismos antiguos.|{n}は幾何学的な遺跡、鉱物の色、古代機構を見分ける光る細部で「{c}」を表現する。|{n}以几何遗迹、矿物色彩与辨识古代机械的发光细节呈现《{c}》。|{n}: 기하학적인 유적과 광물의 색, 고대 기계를 구분하는 빛나는 세부로 {c}를 표현한다.'}
for i in range(37,490,3):
 n=src[i]; desc=src[i+1]; tail=desc[len(n)+1:]; c=next(c for c in [src[6],src[8],src[10]] if c in tail); tail=tail.replace(c,'{c}')
 assert tail in templates,(i,tail)
 for l,v in zip(langs,templates[tail].split('|')):maps[l][desc]=v.format(n=maps[l][n],c=maps[l][c])
 art=src[i+2].split(', ')[1]; words={'map illustration':['иллюстрация карты','ilustración de mapa','地図イラスト','地图插画','지도 삽화'],'background illustration':['фоновая иллюстрация','ilustración de fondo','背景イラスト','背景插画','배경 삽화'],'portrait illustration':['портретная иллюстрация','ilustración de retrato','肖像イラスト','肖像插画','초상 삽화'],'token illustration':['иллюстрация жетона','ilustración de ficha','トークンイラスト','标记插画','토큰 삽화'],'item illustration':['иллюстрация предмета','ilustración de objeto','アイテムイラスト','物品插画','아이템 삽화'],'ui illustration':['иллюстрация интерфейса','ilustración de interfaz','UIイラスト','界面插画','인터페이스 삽화']}
 for l,w in zip(langs,words[art]):maps[l][src[i+2]]=maps[l][n]+', '+w
labels='''Тон кампании|Tono de la campaña|キャンペーンの雰囲気|战役基调|캠페인 분위기
Героический|Heroico|英雄的|英雄|영웅적
Напряжённый|Tenso|緊迫|紧张|긴장
Трагический|Trágico|悲劇的|悲剧|비극적
Уровень угрозы|Nivel de amenaza|脅威レベル|威胁等级|위협 수준
Низкий|Bajo|低|低|낮음
Средний|Medio|中|中|보통
Высокий|Alto|高|高|높음
Основная среда|Entorno dominante|主な環境|主要环境|주요 환경
Сельская|Pastoral|田園|田园|전원
Горная|Montañosa|山岳|山地|산악
Прибрежная|Costera|沿岸|海岸|해안
Нехватка ресурсов|Presión de recursos|資源の逼迫|资源压力|자원 압박
Изобилие|Abundantes|豊富|充足|풍부
Напряжённость|Limitados|逼迫|紧缺|빠듯함
Редкость|Raros|希少|稀少|희소
Схема вселенной|Patrón del universo|世界の構成|世界模式|세계 구성
Набор кампании|Kit de campaña|キャンペーンキット|战役套件|캠페인 키트
Визуальная тема|Tema visual|ビジュアルテーマ|视觉主题|시각 테마
Личность|Identidad|人物情報|身份|인물 정보
Имя|Nombre|名前|姓名|이름
Призвание|Vocación|天職|职业|소명
Рыцарь|Caballero|騎士|骑士|기사
Следопыт|Explorador|野伏|游侠|순찰자
Маг|Mago|魔術師|法师|마법사
Способности|Aptitudes|適性|能力|능력
Мощь|Fuerza|力|力量|힘
Смекалка|Ingenio|機転|机智|기지
Дух|Espíritu|精神|精神|정신
Особенность|Rasgo distintivo|持ち味|特色|특기
Характерный подход|Enfoque distintivo|得意な方法|特色方式|특기 접근법
Смелый|Audaz|大胆|大胆|대담함
Осторожный|Cauteloso|慎重|谨慎|신중함
Сострадательный|Compasivo|思いやり|仁慈|연민
Портрет|Retrato|肖像|肖像|초상
Портрет классического фэнтези|Retrato de Fantasía Clásica|王道ファンタジーの肖像|经典奇幻肖像|정통 판타지 초상
Силуэт|Silueta|シルエット|剪影|실루엣
Силы|Vigor|活力|活力|활력
Решимость|Determinación|決意|决心|결의
Мана|Maná|マナ|法力|마나
Длинный меч|Espada larga|ロングソード|长剑|장검
Набор путника|Equipo del caminante|旅人の道具|旅人工具包|여행자 도구
Лечебное зелье|Poción curativa|治療の霊薬|治疗药剂|치유 물약
Кольчужный доспех|Cota de malla|鎖帷子|锁子甲|사슬갑옷
Отмычки|Ganzúas|解錠具|开锁工具|자물쇠 도구
Слава|Renombre|名声|声望|명성
Опыт|Experiencia|経験|经验|경험
Элара Смелая|Elara la Audaz|勇敢なエララ|勇敢的埃拉拉|용감한 엘라라
Виверна|Guiverno|ワイバーン|飞龙|와이번
Потрясён|Alterado|動揺|动摇|동요
Благословлён|Bendecido|祝福|祝福|축복
Под защитой|Protegido|守備|守护|보호
Использовать длинный меч|Usar espada larga|ロングソードを使う|使用长剑|장검 사용
Восстановить силы|Recuperar vigor|活力を回復|恢复活力|활력 회복
Особый приём|Movimiento distintivo|得意技|特色招式|특기 행동
Потратить ману|Gastar maná|マナを消費|消耗法力|마나 사용'''
assert len(labels.splitlines())==len(src)-490
for i,line in enumerate(labels.splitlines(),490):add(src[i],line)
for l in langs:
 assert set(src)==set(maps[l]),(l,set(src)-set(maps[l]))
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Classic Fantasy complete: '+str(len(src))+' keys in each of 5 languages')
