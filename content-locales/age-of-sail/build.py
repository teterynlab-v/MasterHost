# coding: utf-8
import json
from pathlib import Path
src=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'age-of-sail.json'));langs=['ru','es','ja','zh-CN','ko'];maps={l:{} for l in langs}
def add(k,v):
 a=v.split('|');assert len(a)==5,(k,a)
 for l,x in zip(langs,a):maps[l][k]=x
def clauses_add(text):
 for row in text.splitlines():
  i,v=row.split('|',1);key=src[int(i)];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
names='''Free Cove Captains|Капитаны Вольной бухты|Capitanes de la Cala Libre|自由入江の船長|自由湾船长|자유 만 선장
Neutral Cargo League|Лига нейтральных грузов|Liga de Carga Neutral|中立貨物連盟|中立货运联盟|중립 화물 연맹
Drifting Island Choir|Хор дрейфующего острова|Coro de la Isla a la Deriva|漂う島の合唱団|漂流岛唱诗班|표류 섬 합창단
Reef Salvagers|Сборщики рифа|Recuperadores del Arrecife|礁の回収者|礁石打捞者|암초 회수자
Harbor Surgeons|Портовые хирурги|Cirujanos del Puerto|港の外科医|港口外科医|항구 외과의
Storm Watch Crew|Команда штормового дозора|Tripulación de Vigilancia de Tormentas|嵐の見張り乗員|风暴守望船员|폭풍 감시 선원
Cove Signal Keepers|Смотрители сигналов бухты|Guardianes de Señales de la Cala|入江の信号守|海湾信号守护人|만 신호지기
Tide Chart Guild|Гильдия приливных карт|Gremio de Cartas de Mareas|潮汐図ギルド|潮汐图公会|조석도 길드
Free Cove Signal Tower|Сигнальная башня Вольной бухты|Torre de Señales de la Cala Libre|自由入江の信号塔|自由湾信号塔|자유 만 신호탑
Neutral Quay|Нейтральная набережная|Muelle Neutral|中立の埠頭|中立码头|중립 부두
Walking Island Beach|Пляж шагающего острова|Playa de la Isla Caminante|歩く島の浜|行走岛海滩|걷는 섬 해변
Salvage Basin|Бассейн утиля|Cuenca de Recuperación|回収の船溜まり|打捞港池|회수 항만
Surgeons' Warehouse|Склад хирургов|Almacén de Cirujanos|外科医の倉庫|外科医仓库|외과의 창고
Storm Broker Anchorage|Стоянка штормового посредника|Fondeadero del Corredor de Tormentas|嵐の仲買人の泊地|风暴中间人锚地|폭풍 중개인 정박지
Broken Reef Channel|Пролив разрушенного рифа|Canal del Arrecife Roto|砕けた礁の水道|碎礁水道|부서진 암초 수로
Blockade Flagship|Флагман блокады|Buque Insignia del Bloqueo|封鎖の旗艦|封锁旗舰|봉쇄 기함
Choir Ridge|Хребет хора|Cresta del Coro|合唱団の尾根|唱诗班山脊|합창단 능선
Prize Ledger Cabin|Каюта призового реестра|Camarote del Libro de Presas|捕獲台帳の船室|战利账簿船舱|포획 장부 선실
Open Water Transfer|Передача в открытом море|Transferencia en Aguas Abiertas|沖合の積み替え|开放水域转运|공해 이송
Unfixed Horizon|Свободный горизонт|Horizonte sin Fijar|定まらぬ水平線|无定地平线|고정되지 않은 수평선
Captain Mara Cove|Капитан Мара Коув|Capitana Mara Cove|マラ・コーヴ船長|玛拉·科夫船长|마라 코브 선장
Pilot Kai Neutral|Лоцман Кай Ньютрал|Piloto Kai Neutral|水先案内カイ・ニュートラル|领航员凯·纽特拉尔|도선사 카이 뉴트럴
Singer Ren Drift|Певец Рен Дрифт|Cantante Ren Drift|歌手レン・ドリフト|歌者伦·德里夫特|가수 렌 드리프트
Salvager Tessa Basin|Сборщица Тесса Бейсин|Recuperadora Tessa Basin|回収者テッサ・ベイシン|打捞者泰莎·贝辛|회수자 테사 베이신
Surgeon Ivo Quay|Хирург Иво Кей|Cirujano Ivo Quay|外科医イヴォ・キー|外科医伊沃·基|외과의 이보 키
Helmswoman Bea Storm|Рулевая Беа Сторм|Timonel Bea Storm|舵手ベア・ストーム|舵手贝娅·斯托姆|조타수 베아 스톰
Keeper Neri Signal|Смотритель Нери Сигнал|Guardián Neri Signal|守り手ネリ・シグナル|守护人内里·西格纳尔|지기 네리 시그널
Commander Sol Flag|Командир Сол Флэг|Comandante Sol Flag|ソル・フラッグ司令官|指挥官索尔·弗拉格|지휘관 솔 플래그
Chanter Fia Ridge|Певчая Фиа Ридж|Cantora Fia Ridge|歌い手フィア・リッジ|吟唱者菲娅·里奇|선창자 피아 리지
Sounder Juno Reef|Промерщик Джуно Риф|Sondador Juno Reef|測深者ジュノ・リーフ|测深员朱诺·里夫|측심사 주노 리프
Quartermaster Mei Crate|Квартирмейстер Мей Крейт|Intendente Mei Crate|補給長メイ・クレート|军需官梅·克雷特|보급장 메이 크레이트
Chartwright Oren Horizon|Картограф Орен Хорайзон|Cartógrafo Oren Horizon|図師オレン・ホライゾン|制图师奥伦·霍赖森|해도 제작자 오렌 호라이즌
Witness Dev Wreck|Свидетель Дев Рек|Testigo Dev Wreck|証人デヴ・レック|见证人德夫·雷克|증인 데브 렉
Courier Noa Open|Курьер Ноа Оупен|Mensajero Noa Open|運び手ノア・オープン|信使诺亚·奥彭|배달원 노아 오픈
Broker Rosa Anchor|Посредница Роза Энкор|Corredora Rosa Anchor|仲買人ローザ・アンカー|中间人罗莎·安克|중개인 로사 앵커
Rigger Ada Rope|Такелажница Ада Роуп|Aparejadora Ada Rope|索具師エイダ・ロープ|索具工艾达·罗普|삭구공 에이다 로프
Porter Pell Shore|Носильщик Пелл Шор|Porteador Pell Shore|運搬人ペル・ショア|搬运工佩尔·肖尔|짐꾼 펠 쇼어
Sailor Ash Name|Моряк Эш Нейм|Marinero Ash Name|船員アッシュ・ネーム|水手阿什·奈姆|선원 애시 네임
Lookout Len Light|Дозорный Лен Лайт|Vigía Len Light|見張りレン・ライト|瞭望员伦·莱特|감시병 렌 라이트
Clerk Kira Date|Писарь Кира Дейт|Escribana Kira Date|書記キラ・デイト|书记基拉·戴特|서기 키라 데이트
Diver Taro Chain|Ныряльщик Таро Чейн|Buzo Taro Chain|潜水者タロ・チェイン|潜水员太郎·切恩|잠수부 타로 체인
Mate Siva Prize|Помощница Сива Прайз|Oficial Siva Prize|航海士シヴァ・プライズ|副船长西瓦·普赖兹|항해사 시바 프라이즈
Envoy Tess Two|Посланница Тесс Ту|Enviada Tess Two|使節テス・トゥー|使者泰丝·图|사절 테스 투
Navigator Eri Verse|Штурман Эри Верс|Navegante Eri Verse|航海士エリ・ヴァース|航海员埃里·弗斯|항해사 에리 버스
Prize Enforcer|Взыскатель добычи|Ejecutor de Presas|捕獲の執行者|战利执法者|포획 집행자
Forged Seal Patrol|Патруль ложной печати|Patrulla del Sello Falso|偽印の巡回隊|伪印巡逻队|위조 인장 순찰대
Anchor Warden|Страж якоря|Guardián del Ancla|錨の守護者|锚之守卫|닻 수호자
Reef Corsair|Рифовый корсар|Corsario del Arrecife|礁の海賊|礁石海盗|암초 해적
Blockade Informer|Доносчик блокады|Informante del Bloqueo|封鎖の密告者|封锁告密者|봉쇄 밀고자
Name Harpooner|Гарпунщик имён|Arponero de Nombres|名の銛打ち|名字鱼叉手|이름 작살잡이
Salvage Shark|Акула утиля|Tiburón de Recuperación|回収の鮫|打捞鲨|회수 상어
Quay Gun Crew|Орудийная команда набережной|Dotación de Cañón del Muelle|埠頭の砲手|码头炮组|부두 포수조
Storm Mouth|Пасть шторма|Boca de la Tormenta|嵐の口|风暴之口|폭풍의 입
Debt Blackmailer|Шантажист долга|Chantajista de Deudas|負債の脅迫者|债务勒索者|빚 협박자
False Courier|Ложный курьер|Mensajero Falso|偽の運び手|虚假信使|가짜 배달원
Chart Leech|Картографическая пиявка|Sanguijuela de Cartas|海図の蛭|海图水蛭|해도 거머리
Signal Saboteur|Диверсант сигналов|Saboteador de Señales|信号の破壊者|信号破坏者|신호 파괴자
Escort Press Gang|Вербовщики эскорта|Leva de la Escolta|護衛の強制徴募隊|护航强征队|호위 강제 징집대
Island Chain Giant|Островной цепной великан|Gigante de Cadenas de la Isla|島の鎖の巨人|岛屿锁链巨人|섬 사슬 거인
Prize Mutineer|Мятежник добычи|Amotinado de Presas|捕獲の反乱者|战利叛变者|포획 반란자
Seal Echo|Эхо печати|Eco del Sello|印の残響|印章回声|인장 메아리
Horizon Broker|Посредник горизонта|Corredor del Horizonte|水平線の仲買人|地平线中间人|수평선 중개인'''
for row in names.splitlines():k,v=row.split('|',1);add(k,v)
names='''Unrescued Crew List|Список неспасённых экипажей|Lista de Tripulaciones no Rescatadas|未救助乗員の名簿|未获救船员名单|구조되지 않은 선원 명부
Authentic Transfer Order|Подлинный приказ передачи|Orden Auténtica de Transferencia|本物の積み替え命令|真实转运命令|진짜 이송 명령
Offered Route Verse|Добровольный стих пути|Verso de Ruta Ofrecido|捧げた航路の詩|自愿航路诗句|자발적 항로 시구
Boat Chain Key|Ключ лодочной цепи|Llave de Cadenas de Botes|舟の鎖の鍵|船链钥匙|보트 사슬 열쇠
Two-shore Treatment Inventory|Реестр лечения двух берегов|Inventario de Tratamiento de Dos Orillas|両岸の治療在庫表|两岸治疗清单|양안 치료 재고 목록
Anchor Release Plan|План освобождения якоря|Plan de Liberación del Ancla|錨の解除計画|解锚计划|닻 해제 계획
Repaired Lead Line|Починенный лотлинь|Sonda Reparada|修理済み測深綱|修复测深绳|수리된 측심줄
Seal Date Rubbing|Оттиск даты печати|Calco de la Fecha del Sello|印の日付の拓本|印章日期拓本|인장 날짜 탁본
Borrowed Name Ribbon|Лента заимствованного имени|Cinta del Nombre Prestado|借りた名のリボン|借名丝带|빌린 이름 리본
Earlier Wreck Testimony|Показания о прежнем крушении|Testimonio del Naufragio Anterior|前の難破の証言|先前船难证词|이전 난파 증언
Neutral Inspection Slip|Бланк нейтральной проверки|Comprobante de Inspección Neutral|中立検査票|中立检查单|중립 검사표
Living Tide Chart|Живая приливная карта|Carta Viva de Mareas|生きた潮汐図|活潮汐图|살아 있는 조석도
Reef Signal Oil|Масло сигнала рифа|Aceite de Señales del Arrecife|礁の信号油|礁石信号油|암초 신호 기름
Open Water Cradle|Люлька открытого моря|Cuna de Aguas Abiertas|沖合の運搬台|开放水域吊架|공해 운반대
Lower Shackle Tool|Инструмент нижней скобы|Herramienta del Grillete Inferior|下の枷の道具|下部卸扣工具|아래 족쇄 도구
Rescue Duty Covenant|Соглашение спасательных обязанностей|Convenio de Deberes de Rescate|救助義務の盟約|救援义务契约|구조 의무 협약
Harbor Copy Comparison|Сравнение портовых копий|Comparación de Copias del Puerto|港の写しの比較|港口副本对比|항구 사본 비교
Name Release Knot|Узел освобождения имени|Nudo de Liberación del Nombre|名を解く結び目|释名绳结|이름 해제 매듭
Low-draft Boat Map|Карта мелкосидящих лодок|Mapa de Botes de Poco Calado|浅喫水艇の地図|浅吃水船图|얕은 흘수 보트 지도
Civilian Cargo Receipt|Квитанция гражданского груза|Recibo de Carga Civil|民間貨物の領収書|民用货物收据|민간 화물 영수증
Choir Course Witness|Свидетель курса хора|Testigo del Rumbo del Coro|合唱団航路の証人|唱诗班航向见证|합창단 항로 증인
Revised Prize Ledger|Исправленный призовой реестр|Libro de Presas Revisado|修正捕獲台帳|修订战利账簿|수정된 포획 장부
Two-shore Delivery Record|Запись доставки двух берегов|Registro de Entregas a Dos Orillas|両岸の配送記録|两岸交付记录|양안 배달 기록
Unowned Horizon Chart|Карта ничьего горизонта|Carta del Horizonte sin Dueño|所有者なき水平線図|无主地平线图|주인 없는 수평선 해도
Reef Distress|Бедствие у рифа|Socorro del Arrecife|礁の遭難|礁石遇险|암초 조난
Seal at the Quay|Печать у набережной|Sello en el Muelle|埠頭の印|码头印章|부두의 인장
Borrowed Name Song|Песнь заимствованного имени|Canción del Nombre Prestado|借りた名の歌|借名之歌|빌린 이름의 노래
Wreck Debt|Долг крушения|Deuda del Naufragio|難破の負債|船难债务|난파의 빚
Treatment Count|Подсчёт лечения|Cuenta de Tratamiento|治療の数|治疗清点|치료 집계
Current Turn|Поворот течения|Giro de la Corriente|海流の変化|洋流转向|해류 전환
Shallow Sounding|Мелководный промер|Sondeo Poco Profundo|浅瀬の測深|浅水测深|얕은 수심 측정
Order Comparison|Сравнение приказов|Comparación de Órdenes|命令の比較|命令对比|명령 비교
Choir Petition|Прошение хора|Petición del Coro|合唱団の請願|唱诗班请愿|합창단 청원
Signal Darkens|Сигнал гаснет|Se Apaga la Señal|暗くなる信号|信号熄灭|어두워지는 신호
Inspection Offer|Предложение проверки|Oferta de Inspección|検査の提案|检查提议|검사 제안
Released Name|Освобождённое имя|Nombre Liberado|解かれた名|释放的名字|풀린 이름
Boat Bargain|Сделка о лодках|Trato de Botes|舟の取引|船只交易|보트 거래
Courier Race|Гонка курьера|Carrera del Mensajero|運び手の競争|信使竞速|배달원 경주
Calm Window|Окно штиля|Intervalo de Calma|凪の時間|平静窗口|고요한 기회
Crew Places|Места экипажа|Plazas de Tripulación|乗員の席|船员席位|선원 자리
Press Gang|Принудительная вербовка|Leva Forzosa|強制徴募隊|强征队|강제 징집대
Living Chart|Живая карта|Carta Viva|生きた海図|活海图|살아 있는 해도
Survivor Hearing|Слушание выживших|Audiencia de Supervivientes|生存者の審理|幸存者听证|생존자 심리
Treatment Loaded|Лечение погружено|Tratamiento Cargado|積まれた治療品|医疗物资装船|치료품 적재
Storm Opens|Шторм раскрывается|Se Abre la Tormenta|開く嵐|风暴开启|열리는 폭풍
Last Rescue|Последнее спасение|Último Rescate|最後の救助|最后救援|마지막 구조
Extension Revoked|Продление отменено|Prórroga Revocada|撤回された延長|延期撤销|연장 철회
Anchor Cut|Якорь отсечён|Ancla Cortada|切られた錨|锚断开|끊긴 닻
Ledger Revised|Реестр исправлен|Libro Revisado|修正された台帳|账簿修订|장부 수정
Both Shores Served|Оба берега снабжены|Ambas Orillas Abastecidas|供給された両岸|两岸皆获供应|양안 공급
Choir Departure|Отплытие хора|Partida del Coro|合唱団の出発|唱诗班启程|합창단 출발
Boats for the Next Storm|Лодки для следующего шторма|Botes para la Próxima Tormenta|次の嵐のための舟|下一场风暴的船|다음 폭풍을 위한 보트
A Cargo Still Civilian|Груз всё ещё гражданский|Una Carga Aún Civil|なお民間の貨物|依旧民用的货物|여전히 민간 화물
The Unfixed Horizon|Свободный горизонт|El Horizonte sin Fijar|定まらぬ水平線|无定地平线|고정되지 않은 수평선
Lifeboats behind Chains|Спасательные лодки за цепями|Botes Salvavidas Encadenados|鎖の奥の救命艇|锁链后的救生艇|사슬 뒤의 구명보트
A Seal with the Wrong Date|Печать с неверной датой|Un Sello con Fecha Errónea|日付の違う印|日期错误的印章|날짜가 틀린 인장
The Island Sings Your Name|Остров поёт твоё имя|La Isla Canta tu Nombre|島があなたの名を歌う|岛屿歌唱你的名字|섬이 네 이름을 노래한다
The Wreck before This Wreck|Крушение до этого крушения|El Naufragio Anterior|この難破の前の難破|这次船难之前的船难|이 난파 전의 난파
Inspection without Impressment|Проверка без вербовки|Inspección sin Leva|徴募なき検査|不强征的检查|강제 징집 없는 검사
An Anchor the Island Never Chose|Якорь, не выбранный островом|Un Ancla que la Isla no Eligió|島が選ばなかった錨|岛屿从未选择的锚|섬이 선택하지 않은 닻
Soundings through Broken Reef|Промеры через разрушенный риф|Sondeos por el Arrecife Roto|砕けた礁の測深|穿越碎礁的测深|부서진 암초를 지나는 측심
Orders aboard the Flagship|Приказы на флагмане|Órdenes en el Buque Insignia|旗艦上の命令|旗舰上的命令|기함의 명령
The Borrowed Verse|Заимствованный стих|El Verso Prestado|借りた詩|借来的诗句|빌린 시구
The Light that Must Stay Lit|Огонь, который не должен гаснуть|La Luz que Debe Seguir Encendida|消してはならぬ灯|必须保持明亮的灯|꺼져서는 안 되는 불빛
Crates across Open Water|Ящики через открытое море|Cajas por Aguas Abiertas|沖合を渡る木箱|跨越开放水域的箱子|공해를 지나는 상자
Under the Moving Keel|Под движущимся килем|Bajo la Quilla en Movimiento|動く竜骨の下|移动龙骨之下|움직이는 용골 아래
Spoils after Rescue|Добыча после спасения|Botín después del Rescate|救助後の戦利品|救援后的战利品|구조 뒤의 전리품
A Transfer Worth Defending|Передача, достойная защиты|Una Transferencia que Merece Defenderse|守る価値のある積み替え|值得保卫的转运|지킬 가치가 있는 이송
The Course Offered Freely|Добровольно предложенный курс|El Rumbo Ofrecido Libremente|自由に捧げた航路|自愿提供的航向|자발적으로 제안한 항로
Neither Navy's Prize|Добыча ни одного флота|Presa de Ninguna Armada|どの海軍の獲物でもない|不属于任何海军的战利品|어느 해군의 포획물도 아님
An Island with Its Own Horizon|Остров со своим горизонтом|Una Isla con su Propio Horizonte|自分の水平線を持つ島|拥有自己地平线的岛|자기 수평선을 가진 섬
Reef Pilot|Рифовый лоцман|Piloto del Arrecife|礁の水先案内|礁石领航员|암초 도선사
Neutral Quartermaster|Нейтральный квартирмейстер|Intendente Neutral|中立の補給長|中立军需官|중립 보급장
Choir Navigator|Штурман хора|Navegante del Coro|合唱団の航海士|唱诗班航海员|합창단 항해사
Wreck Witness|Свидетель крушения|Testigo del Naufragio|難破の証人|船难见证人|난파 증인
Two-shore Envoy|Посланник двух берегов|Enviado de Dos Orillas|両岸の使節|两岸使者|양안 사절
Anchor Diver|Якорный ныряльщик|Buzo del Ancla|錨の潜水者|锚潜水员|닻 잠수부
Signal Keeper|Смотритель сигналов|Guardián de Señales|信号守|信号守护人|신호지기
Living Chartwright|Мастер живых карт|Cartógrafo Vivo|生きた海図師|活海图制作者|살아 있는 해도 제작자
Free Cove Rescuer|Спасатель Вольной бухты|Rescatador de la Cala Libre|自由入江の救助者|自由湾救援者|자유 만 구조자
Civilian Passage Keeper|Хранитель гражданского прохода|Guardián del Paso Civil|民間通行の守り手|民用通行守护人|민간 통행 지킴이
Unfixed Horizon Guide|Проводник свободного горизонта|Guía del Horizonte sin Fijar|定まらぬ水平線の案内|无定地平线向导|고정되지 않은 수평선 안내자
Wreck Account Steward|Распорядитель учёта крушений|Administrador de Cuentas de Naufragios|難破会計の世話役|船难核算管事|난파 회계 관리인
Open Water Mediator|Посредник открытого моря|Mediador de Aguas Abiertas|沖合の仲介者|开放水域调解人|공해 중재자
Storm Release Diver|Ныряльщик штормового освобождения|Buzo de Liberación de Tormentas|嵐の解除潜水者|风暴解除潜水员|폭풍 해제 잠수부
Free Cove Rescue|Спасение Вольной бухты|Rescate de la Cala Libre|自由入江の救助|自由湾救援|자유 만 구조
Neutral Cargo Chart|Карта нейтрального груза|Carta de Carga Neutral|中立貨物の海図|中立货物海图|중립 화물 해도
Unfixed Horizon Song|Песнь свободного горизонта|Canción del Horizonte sin Fijar|定まらぬ水平線の歌|无定地平线之歌|고정되지 않은 수평선 노래'''
for row in names.splitlines():k,v=row.split('|',1);add(k,v)
clauses_add('''35|нуждается в спасательной флотилии, пока соперники держат украденные лодки архипелага.|necesita una flotilla de rescate mientras rivales retienen botes robados del archipiélago.|敵が群島の盗まれた救命艇を持つ中、救助船団を必要とする。|对手扣留群岛被盗救生艇时，需要救援船队。|경쟁자들이 군도의 훔친 구명보트를 갖고 있어 구조 선단이 필요하다.
38|несёт лечебные припасы через блокаду, основанную на поддельных военных бумагах.|lleva suministros médicos por un bloqueo impuesto con documentos falsos.|偽の戦争書類による封鎖を越え治療品を運ぶ。|穿越以伪造战争文件实施的封锁，运送医疗补给。|가짜 전쟁 문서로 시행되는 봉쇄를 넘어 치료품을 운반한다.
41|держит движущийся остров на курсе именами, которые моряки поют добровольно.|guía una isla móvil mediante nombres cantados voluntariamente por sus marineros.|船員が自発的に歌う名で動く島の航路を保つ。|通过水手自愿歌唱的名字保持移动岛屿航向。|선원이 자발적으로 부르는 이름으로 움직이는 섬의 항로를 유지한다.
44|отпустит лодки, если капитан погасит старый спасательный долг.|puede liberar botes si un capitán paga una deuda de rescate anterior.|船長が昔の救助の負債を払えば舟を解放する。|船长偿还旧救援债务后可释放船只。|선장이 옛 구조 빚을 갚으면 보트를 풀어 준다.
47|засвидетельствует, что груз служит гражданским обеих сторон.|testificará que la carga sirve a civiles de ambos bandos.|貨物が双方の民間人に使われると証言する。|愿作证货物用于双方平民。|화물이 양쪽 민간인을 위한 것임을 증언한다.
50|проложит безопасный путь острова, не привязывая его к частному якорю.|puede trazar una ruta segura sin ligar la isla a un ancla privada.|私的な錨に縛らず島の安全な航路を描ける。|可规划岛屿安全航路，不将其束缚于私人锚。|사유 닻에 묶지 않고 섬의 안전한 항로를 그릴 수 있다.
53|следит за застрявшими моряками, пропущенными призовым реестром капитана.|rastrea marineros varados ignorados por el libro de presas del capitán.|船長の捕獲台帳が無視した遭難船員を追う。|追踪被船长战利账簿忽略的受困水手。|선장 포획 장부에서 무시된 고립 선원을 추적한다.
56|хранит живую книгу путей, чью последнюю запись забрал штормовой посредник.|tiene un libro vivo de rutas cuya última entrada tomó un corredor de tormentas.|嵐の仲買人が最後の項目を奪った生きた航路帳を持つ。|持有活航路册，其最后记录被风暴中间人拿走。|폭풍 중개인이 마지막 항목을 가져간 살아 있는 항로 책을 갖고 있다.
59|рифовый огонь зовёт на спасение, пока портовые лодки заперты.|una luz del arrecife pide rescate mientras los botes están cerrados.|港の救命艇が閉じられる中、礁の灯が救助を求める。|港口救生艇被锁时，礁灯呼救。|항구 구명보트가 잠겨 있는 동안 암초 불빛이 구조를 요청한다.
62|медицинские ящики ждут под печатью блокады с неверной датой подписи.|cajas médicas esperan bajo un sello de bloqueo con fecha errónea.|医療木箱は署名日が違う封鎖印の下で待つ。|医疗箱在签署日期错误的封锁印下等待。|의료 상자가 서명 날짜가 틀린 봉쇄 인장 아래 기다린다.
65|берег движется, когда команда поёт имя, которое никто не предложил.|la costa se mueve cuando se canta un nombre que nadie ofreció.|誰も捧げなかった名を乗員が歌うと海岸が動く。|船员唱出无人自愿提供的名字时海岸移动。|아무도 제공하지 않은 이름을 일행이 부르면 해안이 움직인다.
68|украденные лодки прикованы рядом с грузом прежнего крушения.|botes robados están encadenados junto a carga de un naufragio anterior.|盗んだ舟が前の難破の貨物の横で鎖につながれる。|被盗船只锁在先前船难货物旁。|훔친 보트가 이전 난파 화물 옆에 묶여 있다.
71|лечебный реестр доказывает назначение груза обоим соперничающим берегам.|el inventario médico prueba que la carga sirve a ambas orillas rivales.|治療在庫が貨物は対立する両岸向けと証明する。|医疗库存证明货物供应敌对两岸。|치료 재고가 화물이 경쟁하는 양안을 위한 것임을 증명한다.
74|частный якорь принуждает остров к опасному течению.|un ancla privada fuerza a la isla móvil a una corriente peligrosa.|私的な錨が動く島を危険な海流に強いる。|私人锚迫使移动岛屿进入危险洋流。|사유 닻이 움직이는 섬을 위험한 해류로 끌어간다.
77|спасательный путь требует мелкосидящих лодок и промеров при свидетелях.|la ruta de rescate necesita botes de poco calado y sondeos atestiguados.|救助路には浅喫水艇と立会いの測深が必要だ。|救援路线需要浅吃水船与有见证测深。|구조 경로에 얕은 흘수 보트와 증인이 있는 측심이 필요하다.
80|приказы капитана отличаются от поддельных портовых копий.|las órdenes del capitán difieren de copias falsas del puerto.|船長の命令が偽の港の写しと違う。|船长命令不同于伪造港口副本。|선장 명령이 가짜 항구 사본과 다르다.
83|остров выберет другой курс после освобождения заимствованных имён.|la isla puede elegir otro rumbo al liberar nombres prestados.|借りた名が解かれると島は別の航路を選べる。|借名被释放后岛可选择另一航向。|빌린 이름을 풀면 섬이 다른 항로를 선택할 수 있다.
86|вольный капитан стёр спасательные обязанности из списка прибыльных захватов.|el capitán libre borró deberes de rescate de capturas rentables.|自由船長は儲かる捕獲の名簿から救助義務を消した。|自由船长从获利捕获名单抹去救援义务。|자유 선장이 수익성 포획 목록에서 구조 의무를 지웠다.
89|нейтральные экипажи передают лечебные ящики без военного эскорта.|tripulaciones neutrales transfieren cajas médicas sin escolta militar.|中立乗員は軍の護衛なしで治療木箱を動かせる。|中立船员可转运医疗箱而不接受军队护航。|중립 선원들이 군 호위 없이 치료 상자를 옮길 수 있다.
92|карта безопасно меняется, когда моряки предлагают свой стих пути.|la carta cambia con seguridad al ofrecer marineros su propio verso.|船員が自分の航路の詩を捧げると海図は安全に変わる。|水手自愿提供自己航路诗句时，海图安全改变。|선원들이 자기 항로 시구를 제안하면 해도가 안전하게 바뀐다.
95|вернёт спасательные лодки, если выживших прежнего крушения признают.|devolverá botes si se reconoce a supervivientes del naufragio anterior.|前の難破の生存者が認められれば救命艇を返す。|先前船难幸存者获承认后便归还救生艇。|이전 난파 생존자를 인정하면 구명보트를 돌려준다.
98|провезёт лечение по проливу, если ложную печать оспорят.|puede llevar tratamiento por el canal si se cuestiona el sello falso.|偽の印に異議があれば水道を通り治療品を運べる。|伪印遭质疑后可经水道运医疗物资。|위조 인장에 이의를 제기하면 수로로 치료품을 나를 수 있다.
101|знает, что стих пути острова содержит невольно заимствованные имена.|sabe que el verso de la isla incluye nombres tomados sin voluntad.|島の航路詩に意に反して借りた名があると知る。|知道岛屿航路诗句含非自愿借取的名字。|섬 항로 시구에 비자발적으로 빌린 이름이 있음을 안다.
104|держит лодки залогом неоплаченного спасательного долга капитана.|retiene botes como garantía de la deuda de rescate impaga del capitán.|船長の未払い救助負債の担保に救命艇を持つ。|以救援船作船长未偿救援债务抵押。|선장의 미지급 구조 빚 담보로 보트를 갖고 있다.
107|проверит ящики до прибытия командира блокады.|puede verificar cajas antes de llegar el comandante del bloqueo.|封鎖司令官が来る前に木箱を検証できる。|可在封锁指挥官抵达前检查箱子。|봉쇄 지휘관이 오기 전에 상자를 검증할 수 있다.
110|отсечёт частный якорь, если хор сначала выберет безопасное течение.|puede cortar el ancla privada si el coro elige primero una corriente segura.|合唱団が先に安全な海流を選べば私的錨を切れる。|唱诗班先选择安全洋流后可切断私人锚。|합창단이 먼저 안전한 해류를 선택하면 사유 닻을 자를 수 있다.
113|записал каждого застрявшего моряка, ещё ждущего за рифом.|registró a todos los marineros aún varados más allá del arrecife.|礁の先で待つ遭難船員を全て記録した。|记录了仍在礁石外等待的每个被困水手。|암초 너머에서 기다리는 모든 고립 선원을 기록했다.
116|разрешит нейтральную передачу по подлинным приказам и при публичных свидетелях.|permitirá transferencia neutral con órdenes auténticas y testigos públicos.|本物の命令と公の証人で中立の積み替えを許す。|在真实命令与公开见证下允许中立转运。|진짜 명령과 공개 증인 아래 중립 이송을 허락한다.
119|хочет выбрать курс острова без вечного владения.|quiere elegir el rumbo sin propiedad permanente de la isla.|永久所有なしで島の航路を選びたい。|希望选择岛屿航向，不设永久所有权。|영구 소유권 없이 섬 항로를 선택하기를 원한다.
122|знает мелкий спасательный путь, но нужен починенный лотлинь.|conoce ruta de rescate somera, pero necesita sonda reparada.|浅い救助路を知るが修理済み測深綱が必要だ。|知道浅水救援路线，但需修好测深绳。|얕은 구조 경로를 알지만 수리된 측심줄이 필요하다.
125|покажет припасы обоим берегам вопреки ложным военным претензиям.|puede mostrar suministros para ambas orillas pese al reclamo bélico falso.|偽の戦争主張に反し両岸向けの物資を示せる。|尽管虚假战争主张，仍可证明补给供两岸。|가짜 전쟁 주장에도 양안 보급품을 보여 줄 수 있다.
128|запишет предложенный путь, не копируя чужое имя.|puede escribir una ruta ofrecida sin copiar otro nombre.|他の船員の名を写さず捧げた航路を書ける。|能写自愿航路而不复制另一水手名字。|다른 선원 이름을 복사하지 않고 제공된 항로를 적을 수 있다.
131|пережил прежний захват и хочет вернуть спасательные обязанности в реестр.|sobrevivió a la captura anterior y quiere restaurar deberes de rescate.|前の捕獲を生き延び、救助義務を台帳に戻したい。|在先前捕获中幸存，希望恢复账簿救援义务。|이전 포획에서 살아남아 장부에 구조 의무를 복원하려 한다.
134|перенесёт подлинный приказ между кораблями до поворота прилива.|puede llevar la orden auténtica entre barcos antes de cambiar la marea.|潮が変わる前に船間で本物の命令を運べる。|潮汐转变前能把真命令送到船间。|조수가 바뀌기 전에 배 사이로 진짜 명령을 옮길 수 있다.
137|наживается на фиксированном причале острова и скрывает риск от хора.|lucra con un amarre fijo y oculta su riesgo al coro.|島の固定泊地で儲け、危険を合唱団に隠す。|从固定岛泊位获利并向唱诗班隐瞒风险。|고정 섬 선석으로 이익을 보며 합창단에 위험을 숨긴다.
140|освободит прикованные лодки после погашения долга при свидетелях.|puede liberar botes encadenados tras resolver la deuda ante testigos.|立会い付き負債和解の後に鎖の舟を解ける。|有见证债务和解后可解锁船只。|증인이 있는 빚 합의 뒤 묶인 보트를 풀 수 있다.
143|выгрузит лечение на любом берегу, если солдаты не ступят на лодку передачи.|descargará en cualquier orilla si soldados no suben al bote.|兵士が積み替え艇に乗らなければどちらの岸でも荷下ろしする。|士兵不上转运船便愿在任何岸卸医疗物资。|병사들이 이송 보트에 타지 않으면 어느 강둑에서든 치료품을 내린다.
146|слышал своё имя в песне курса острова без разрешения.|oyó su nombre cantado en el rumbo de la isla sin permiso.|許可なく自分の名が島の航路に歌われるのを聞いた。|听到自己的名字未经许可被唱入岛航向。|허락 없이 자기 이름이 섬 항로에 불리는 것을 들었다.
149|сохранит видимость рифового сигнала в грядущий шквал.|puede mantener visible la señal durante la próxima borrasca.|来る突風の中で礁の信号を見えるままにできる。|能在将至飑风中保持礁信号可见。|다가올 돌풍 동안 암초 신호를 보이게 유지할 수 있다.
152|знает, что ложная печать подписана до объявления конфликта.|sabe que el sello falso se firmó antes del conflicto declarado.|偽封鎖印が紛争宣言より前に署名されたと知る。|知道伪封锁印在宣战前签署。|위조 봉쇄 인장이 선언된 충돌 전에 서명된 것을 안다.
155|достигнет нижней скобы якоря в одно окно спокойной воды.|puede alcanzar el grillete inferior en un intervalo de agua calma.|一度の静水時間に錨の下の枷に届く。|可在一次平静水域窗口够到锚下卸扣。|한 번의 고요한 물 기회에 닻 아래 족쇄에 닿을 수 있다.
158|исправит реестр, если все призовые экипажи разделят спасательные обязанности.|revisará el libro si todas las tripulaciones comparten deberes de rescate.|捕獲乗員全員が救助義務を分ければ台帳を直す。|所有战利船员共担救援义务后会修订账簿。|모든 포획 선원이 구조 의무를 나누면 장부를 수정한다.
161|предлагает проверку обоих берегов вместо военного эскорта.|ofrece inspección por ambas orillas en vez de escolta militar.|軍護衛でなく両岸の検査を提案する。|提议由两岸检查而非军队护航。|군 호위 대신 양안 검사를 제안한다.
164|поведёт новый курс, используя лишь добровольные имена.|puede guiar un nuevo rumbo solo con nombres voluntarios.|自発的な名だけで新しい航路を導ける。|仅用自愿名字便可引导新航向。|자발적으로 제공한 이름만으로 새 항로를 이끌 수 있다.''')
clauses_add('''167|запирает лодки ради прибыльного права захвата.|encierra botes para preservar un reclamo de captura rentable.|儲かる捕獲主張のため救命艇を閉じる。|为保留盈利捕获主张而锁救援船。|수익성 포획 주장을 지키려고 구조 보트를 잠근다.
170|изымает гражданское лечение по неподписанному продлению войны.|incauta tratamiento civil bajo una prórroga bélica sin firmar.|未署名の戦争延長で民間治療を押収する。|依未签署战争延期没收民用医疗物资。|서명 없는 전쟁 연장 아래 민간 치료품을 압수한다.
173|держит остров в течении, не выбранном хором.|mantiene la isla en una corriente que el coro no eligió.|合唱団が選ばぬ海流に島を留める。|把岛固定在唱诗班未选择的洋流。|합창단이 선택하지 않은 해류에 섬을 붙잡는다.
176|нападает на промерщиков, но отступит за долю спасательной работы при свидетелях.|ataca a sondadores, pero puede ceder por parte del rescate atestiguado.|測深者を襲うが立会い救助の分担で退くこともある。|攻击测深员，但可因分担有见证救援工作而退让。|측심사를 공격하지만 증인이 있는 구조 작업의 몫을 받으면 물러날 수 있다.
179|прячет записи нейтрального груза ради принудительного военного эскорта.|oculta registros de carga neutral para imponer escolta militar.|軍護衛を強いるため中立貨物記録を隠す。|隐藏中立货物记录以强迫军队护航。|군 호위를 강제하려고 중립 화물 기록을 숨긴다.
182|привязывает имя моряка к острову без предложенного стиха.|vincula un nombre a la isla sin verso ofrecido.|捧げた詩なしで船員の名を島に縛る。|未经提供诗句便把水手名字束缚于岛。|자발적 시구 없이 선원 이름을 섬에 묶는다.
185|охраняет мелкосидящий путь и следует выброшенному железу крушения.|guarda la ruta somera y sigue hierro descartado del naufragio.|浅喫水路を守り、捨てた難破鉄を追う。|守卫浅吃水路线，跟随抛弃的船难铁件。|얕은 흘수 경로를 지키며 버려진 난파 철을 따라간다.
188|готовится стрелять по лодке передачи без подлинных приказов.|se prepara para disparar al bote salvo que lleguen órdenes auténticas.|本物の命令が来なければ積み替え艇を撃つ準備をする。|真命令未抵达便准备炮击转运船。|진짜 명령이 오지 않으면 이송 보트에 사격할 준비를 한다.
191|поглощает фиксированные пути, но открывается вокруг добровольно выбранного течения.|traga rutas fijas, pero se abre alrededor de una corriente elegida libremente.|固定路を飲むが自発的に選んだ海流の周りは開く。|吞没固定路线，但围绕自愿选择的洋流开放。|고정 경로를 삼키지만 자발적으로 선택한 해류 주위에서 열린다.
194|отпустит лодки, только если прежние выжившие промолчат.|libera botes solo si los supervivientes anteriores callan.|前の生存者が黙る場合だけ舟を放す。|只有先前幸存者沉默才放船。|이전 생존자가 침묵해야만 보트를 풀어 준다.
197|подменяет законный приказ передачи ложной портовой копией.|sustituye una orden legal por la copia falsa del puerto.|合法の積み替え命令を港の偽写しに替える。|用港口伪副本替换合法转运命令。|합법 이송 명령을 항구 위조 사본으로 바꾼다.
200|копирует последнюю запись пути и истощает моряка, чьё имя несёт.|copia la última ruta y drena al marinero cuyo nombre lleva.|最後の航路を写し、その名の船員を消耗させる。|复制最后航路记录并耗尽所载名字的水手。|마지막 항로를 복사해 그 이름의 선원을 소모시킨다.
203|гасит рифовый свет, скрывая неспасённых от призового реестра.|apaga la luz para ocultar a no rescatados del libro de presas.|未救助者を捕獲台帳から隠すため礁の灯を消す。|熄灭礁灯以从战利账簿隐藏未获救者。|포획 장부에서 미구조자를 숨기려고 암초 불빛을 끈다.
206|принуждает нейтральных моряков к службе после проверки груза.|fuerza a marineros neutrales al servicio tras inspeccionar carga.|貨物検査後に中立船員を強制徴募する。|查货后强征中立水手服役。|화물 검사 후 중립 선원을 강제로 복무시킨다.
209|поднимается, когда частный якорь волочится через хребет хора.|se alza cuando el ancla privada arrastra por la cresta del coro.|私的な錨が合唱団の尾根を引きずると立ち上がる。|私人锚拖过唱诗班山脊时崛起。|사유 닻이 합창단 능선을 끌고 지나가면 솟는다.
212|пытается сохранить богатство захвата, бросив спасательную флотилию.|intenta conservar riqueza de captura abandonando la flotilla de rescate.|救助船団を捨てて捕獲の富を残そうとする。|试图遗弃救援船队以保留捕获财富。|구조 선단을 버려 포획 부를 지키려 한다.
215|повторяет отменённое продление блокады через сигнальные флаги без присмотра.|repite la prórroga revocada con banderas sin vigilancia.|無人の信号旗で撤回した封鎖延長を繰り返す。|通过无人看管信号旗重复已撤销封锁延期。|방치된 신호기로 철회된 봉쇄 연장을 되풀이한다.
218|продаёт вечные права навигации над движущимся островом.|vende derechos perpetuos de navegación de una isla móvil.|動き続ける島の永続航海権を売る。|出售仍在移动岛屿的永久航行权。|계속 움직이는 섬의 영구 항해권을 판다.
221|называет людей, стёртых из прибыльного учёта призового реестра.|nombra personas borradas del registro rentable de presas.|捕獲台帳の利益会計から消された人を記す。|列出被战利账簿盈利核算抹除的人。|포획 장부의 이익 회계에서 지워진 사람을 적는다.
224|разрешает проверенный гражданский груз без военного эскорта.|permite carga civil inspeccionada sin escolta militar.|軍護衛なしで検査済み民間貨物を認める。|允许检查过的民用货物无需军队护航。|군 호위 없이 검사된 민간 화물을 허용한다.
227|ведёт остров именами, добровольно данными моряками.|guía la isla con nombres dados libremente por marineros.|船員の自発的な名で島を導く。|用水手自愿提供的名字引导岛。|선원이 자발적으로 준 이름으로 섬을 이끈다.
230|освобождает мелкосидящие лодки после засвидетельствования спасательного долга.|libera botes someros tras atestiguar la deuda de rescate.|救助負債が証言されると浅喫水救命艇を解く。|救援债务被见证后解锁浅吃水救生艇。|구조 빚이 증언되면 얕은 흘수 구명보트를 푼다.
233|показывает, кого груз вылечит на обоих берегах.|muestra a quién trata la carga en ambas orillas rivales.|貨物が対立する両岸の誰を治すか示す。|显示货物可治疗敌对两岸哪些人。|화물이 양쪽 경쟁 강둑의 누구를 치료하는지 보여 준다.
236|отмечает безопасное отсечение нижней скобы до поворота течения.|marca un corte seguro del grillete inferior antes de cambiar corriente.|海流が変わる前の下の枷の安全な切断を示す。|标记洋流转向前安全切断下卸扣。|해류가 바뀌기 전 아래 족쇄의 안전한 절단을 표시한다.
239|проверяет мелководный путь без риска для гружёной лодки.|prueba la ruta somera sin arriesgar un bote cargado.|積載救命艇を危険にせず浅い礁路を検査する。|测试浅礁路线，不冒载满救援船风险。|짐 실은 구조 보트의 위험 없이 얕은 암초 길을 검사한다.
242|доказывает, что портовый приказ старше объявленной блокады.|prueba que la orden del puerto precede al bloqueo declarado.|港の命令が封鎖宣言より前と証明する。|证明港口命令早于宣布的封锁。|항구 명령이 선언된 봉쇄보다 앞섰음을 증명한다.
245|выявляет моряка, привязанного к курсу без согласия.|identifica al marinero vinculado al rumbo sin consentimiento.|同意なく航路に縛られた船員を特定する。|识别未经同意被束缚于岛航向的水手。|동의 없이 섬 항로에 묶인 선원을 찾는다.
248|вернёт спасательные обязанности в реестр капитана.|puede restaurar deberes de rescate al libro del capitán.|船長の捕獲台帳に救助義務を戻せる。|可恢复船长战利账簿的救援义务。|선장 장부에 구조 의무를 복원할 수 있다.
251|записывает гражданский груз при свидетелях обоих берегов.|registra carga civil ante testigos de ambas orillas.|両岸の証人の下で民間貨物を記す。|在两岸见证人面前记录民用货物。|양안 증인 아래 민간 화물을 기록한다.
254|меняется согласно добровольному стиху течения хора.|cambia según el verso de corriente ofrecido por el coro.|合唱団が捧げた海流の詩に従って変わる。|根据唱诗班自愿提供的洋流诗句变化。|합창단이 제공한 해류 시구에 따라 바뀐다.
257|сохраняет огонь застрявшего экипажа видимым в шквал.|mantiene visible la luz de la tripulación varada en la borrasca.|突風でも遭難乗員の灯を見えるままにする。|在飑风中保持被困船员灯光可见。|돌풍 속 고립 선원의 불빛을 보이게 한다.
260|переносит ящики без солдат на борту.|mueve cajas médicas sin soldados a bordo.|兵士を乗せず治療木箱を動かす。|运输医疗箱而不让士兵登船。|병사를 태우지 않고 치료 상자를 옮긴다.
263|отпускает частный якорь в ограниченное окно погружения.|libera el ancla privada en un intervalo limitado de buceo.|限られた潜水時間に私的な錨を解く。|在有限潜水窗口解除私人锚。|한정된 잠수 기회에 사유 닻을 푼다.
266|требует от призовых экипажей оплаты будущего спасения жизней.|exige financiar futuros rescates a tripulaciones de presas.|捕獲乗員に将来の救命費を求める。|要求战利船员资助未来救生工作。|포획 선원에게 미래 인명 구조 비용을 요구한다.
269|отделяет подлинные приказы от ложного продления войны.|separa órdenes auténticas de la prórroga bélica falsa.|本物の命令と偽の戦争延長を分ける。|区分真实命令与伪造战争延期。|진짜 명령과 가짜 전쟁 연장을 구분한다.
272|отзывает заимствованное имя до исполнения нового пути.|retira un nombre prestado antes de cantar otra ruta.|新航路が歌われる前に借りた名を取り下げる。|在歌唱新航路前撤回借名。|새 항로를 부르기 전에 빌린 이름을 철회한다.
275|распределяет спасательные места и безопасные приливные переправы.|asigna plazas de rescate y cruces seguros de marea.|救助席と安全な潮汐横断を割り当てる。|分配救援席位与安全潮汐渡行。|구조 자리와 안전한 조석 통행을 배정한다.
278|не даёт проверенным ящикам стать захваченной добычей.|impide que cajas inspeccionadas se vuelvan presas capturadas.|検査済み木箱が捕獲獲物になるのを防ぐ。|防止检过箱子变为被捕战利品。|검사한 상자가 포획물이 되지 않게 한다.
281|записывает выбор острова без владения его горизонтом.|registra la elección de la isla sin reclamar su horizonte.|水平線を所有せず島の選択を記す。|记录岛屿选择，不主张地平线所有权。|수평선 소유권을 주장하지 않고 섬의 선택을 기록한다.
284|учитывает потерянные экипажи и цену спасения наряду с добычей.|contabiliza tripulaciones perdidas y costes de rescate junto al botín.|戦利品と共に失われた乗員と救助費を計上する。|连同战利品核算失踪船员与救援成本。|전리품과 함께 잃은 선원과 구조 비용을 계산한다.
287|документирует доставленное лечение без отказа от независимости экипажа.|documenta entregas médicas sin ceder independencia de la tripulación.|乗員の独立を渡さず届けた治療を記録する。|记录交付医疗物资，不放弃船员独立。|선원 독립성을 포기하지 않고 치료 배달을 문서화한다.
290|оставляет навигационные знания открытыми к поправкам при движении острова.|mantiene conocimiento navegable abierto a corrección al moverse la isla.|島が動く際に航海知識を修正できるように保つ。|岛移动时保持航行知识可修正。|섬이 움직일 때 항해 지식을 수정할 수 있게 한다.''')
clauses_add('''293|застрявший экипаж сигналит, пока капитаны спорят о запертых лодках.|una tripulación varada señala mientras capitanes discuten por botes cerrados.|船長が閉じた舟を争う中、遭難乗員が信号を出す。|船长争论被锁船只时，被困船员发信号。|선장들이 잠긴 보트를 두고 다투는 동안 고립 선원이 신호를 보낸다.
296|на лечебные ящики предъявляют сомнительную блокадную претензию.|las cajas reciben un reclamo sospechoso de bloqueo.|治療木箱に疑わしい封鎖主張が出る。|医疗箱遭可疑封锁主张。|치료 상자에 수상한 봉쇄 주장이 붙는다.
299|движущийся остров повторяет непредложенное имя моряка.|la isla móvil repite un nombre no ofrecido.|動く島が捧げていない船員の名を繰り返す。|移动岛重复水手未自愿提供的名字。|움직이는 섬이 제공되지 않은 선원 이름을 되풀이한다.
302|выжившие прежнего захвата спрашивают, куда исчезли спасательные обязанности.|supervivientes anteriores preguntan por deberes de rescate desaparecidos.|前の捕獲の生存者が救助義務の消えた理由を問う。|先前捕获幸存者问救援义务为何消失。|이전 포획 생존자가 구조 의무가 사라진 이유를 묻는다.
305|реестр показывает срочную нужду обоих берегов.|el inventario muestra necesidad urgente en ambas orillas.|在庫表が対立両岸の緊急需要を示す。|清单显示敌对两岸急需。|재고가 경쟁하는 양안의 긴급 수요를 보여 준다.
308|частный якорь тянет остров к пасти шторма.|el ancla privada arrastra la isla a la boca de tormenta.|私的な錨が島を嵐の口へ引く。|私人锚把岛拖向风暴之口。|사유 닻이 섬을 폭풍의 입으로 끌어간다.
311|мелкосидящий спасательный путь появляется до подъёма прилива.|aparece una ruta somera antes de subir la marea.|潮が上がる前に浅喫水救助路が現れる。|涨潮前出现浅吃水救援路线。|조수가 오르기 전에 얕은 흘수 구조 경로가 나타난다.
314|копия флагмана противоречит ложному портовому продлению.|la copia del buque insignia contradice la prórroga falsa del puerto.|旗艦の写しが港の偽延長と矛盾する。|旗舰副本与港口伪延期矛盾。|기함 사본이 항구 위조 연장과 모순된다.
317|островитяне просят выбрать курс без вечных прав навигации.|isleños piden elegir rumbo sin derechos perpetuos de navegación.|島民が永続航海権なしの航路選択を求める。|岛民请求无永久航行权地选择航向。|섬사람들이 영구 항해권 없이 항로를 선택하기를 요청한다.
320|диверсант убирает масло с рифовой башни.|un saboteador quita aceite de la torre del arrecife.|破壊者が礁の塔から油を奪う。|破坏者拿走礁塔油。|파괴자가 암초 탑에서 기름을 없앤다.
323|оба берега предлагают нейтральных свидетелей вместо солдат.|ambas orillas ofrecen testigos neutrales en vez de soldados.|両岸が兵士でなく中立証人を提案する。|两岸提议中立见证人而非士兵。|양안이 병사 대신 중립 증인을 제안한다.
326|отозванная лента заставляет остров остановиться перед новым стихом.|una cinta retirada hace pausar la isla antes del próximo verso.|取り下げたリボンが次の詩の前に島を止める。|撤回丝带使岛在下一诗句前停顿。|철회된 리본이 다음 시구 전에 섬을 멈추게 한다.
329|Тесса предлагает снять цепи по спасательному соглашению при свидетелях.|Tessa ofrece liberar cadenas con un acuerdo de rescate atestiguado.|テッサは立会い付き救助合意で鎖を解くと出す。|泰莎提议依有见证救援和解释放锁链。|테사가 증인이 있는 구조 합의로 사슬을 풀겠다고 한다.
332|подлинный приказ должен пересечь море до выстрела орудийной команды.|la orden auténtica debe cruzar antes de disparar los artilleros.|砲手が撃つ前に本物の命令が沖合を渡る必要がある。|真命令须在炮组开火前越过海面。|포수조가 쏘기 전에 진짜 명령이 공해를 건너야 한다.
335|нижняя скоба доступна для одного короткого погружения.|el grillete inferior es accesible durante una inmersión breve.|下の枷に一度の短い潜水で届く。|下卸扣在一次短潜水内可达。|아래 족쇄에 한 번의 짧은 잠수 동안 닿을 수 있다.
338|флотилия должна открыто выбрать грузовую вместимость и места спасения.|la flotilla debe elegir capacidad de carga y plazas de rescate abiertamente.|船団は積載量と救助席を公に選ばねばならない。|船队必须公开选择载货量与救援席位。|선단이 화물 수용량과 구조 자리를 공개적으로 선택해야 한다.
341|офицер эскорта утверждает, что нейтральная передача требует службы экипажа.|un oficial afirma que la transferencia neutral exige servicio de tripulación.|護衛将校は中立積み替えに乗員の軍務が必要と主張する。|护航军官声称中立转运要求船员服役。|호위 장교가 중립 이송에 선원 복무가 필요하다고 주장한다.
344|следующая запись пути меняется при добровольном стихе моряка.|la próxima ruta cambia al ofrecer un marinero su verso.|船員が自分の詩を捧げると次の航路項目が変わる。|水手自愿提供自己诗句时下一航路记录改变。|선원이 자기 시구를 제공하면 다음 항로 항목이 바뀐다.
347|Дев называет людей, пропущенных призовым учётом капитана.|Dev nombra personas ausentes de las cuentas del capitán.|デヴが船長の捕獲会計から抜けた人を名指す。|德夫说出船长战利核算遗漏的人。|데브가 선장 포획 회계에서 빠진 사람의 이름을 부른다.
350|ящики отправляются по гражданской квитанции двух берегов.|las cajas parten bajo un recibo civil de ambas orillas.|木箱は両岸の民間領収書で出発する。|箱子依两岸民用收据启程。|상자들이 양안 민간 영수증 아래 출발한다.
353|пасть пропускает путь, спетый без украденных имён.|la boca permite una ruta cantada sin nombres robados.|口は盗んだ名のない歌の航路を通す。|风暴口允许不含盗名的歌唱航路。|입이 도난 이름 없이 부른 항로를 허용한다.
356|рифовый сигнал находит последнюю группу после закрытия порта.|la señal localiza al último grupo tras cerrar el puerto.|港が閉じた後、礁信号が最後の集団を見つける。|港关闭后，礁信号定位最后一组人。|항구가 닫힌 뒤 암초 신호가 마지막 무리를 찾는다.
359|командир публично отзывает ложное притязание блокады.|el comandante retira públicamente el reclamo falso.|司令官が偽封鎖主張を公に取り下げる。|指挥官公开撤回虚假封锁主张。|지휘관이 가짜 봉쇄 주장을 공개적으로 철회한다.
362|остров входит в выбранное течение без частного причала.|la isla entra en la corriente elegida sin amarre privado.|私的泊地なしで島が選んだ海流に入る。|岛无私人泊位地进入所选洋流。|섬이 사유 선석 없이 선택한 해류로 들어간다.
365|призовые экипажи принимают или отвергают будущие спасательные обязанности.|tripulaciones aceptan o rechazan futuros deberes de rescate.|捕獲乗員が将来の救助義務を受けるか拒む。|战利船员接受或拒绝未来救援义务。|포획 선원이 미래 구조 의무를 받거나 거부한다.
368|нейтральные доставки меняют доверие к вольным экипажам.|entregas neutrales cambian quién confía en tripulaciones libres.|中立配送が自由乗員を信頼する者を変える。|中立交付改变谁信任自由船员。|중립 배달이 자유 선원을 믿는 사람을 바꾼다.
371|движущийся остров выбирает попутчиков своей песни.|la isla móvil elige quién viaja con su canto.|動く島は歌と共に旅する者を選ぶ。|移动岛选择谁可伴其歌同行。|움직이는 섬이 노래와 여행할 이를 선택한다.
374|спасательное соглашение задаёт доступ после кризиса.|el convenio de rescate fija acceso tras la crisis.|救助盟約が今の危機の後の利用を定める。|救援契约规定当前危机后的使用权。|구조 협약이 현재 위기 뒤의 접근을 정한다.
377|записи проверки сохраняют независимую цель передачи.|registros de inspección preservan el propósito independiente.|検査記録が積み替えの独立目的を保つ。|检查记录保持转运独立目的。|검사 기록이 이송의 독립 목적을 지킨다.
380|карта следует за живым островом, не владея его путём.|la carta sigue una isla viva sin poseer su ruta.|海図は航路を所有せず生きた島に従う。|海图跟随活岛，而不拥有其路线。|해도가 항로를 소유하지 않고 살아 있는 섬을 따른다.''')
clauses_add('''383|Цель: начать спасение рифа. Погасите долг прежнего крушения или освободите лодки при свидетелях; промедление оставляет больше моряков в изоляции.|Objetivo: lanzar el rescate. Paga la deuda anterior o libera botes ante testigos; la demora deja varados a más marineros.|目的：礁の救助を始める。前の難破の負債を払うか立会いで舟を解く。遅れるとさらに船員が孤立する。|目标：启动礁石救援。清偿旧船难债或在见证下放船；拖延使更多水手受困。|목표: 암초 구조를 시작한다. 옛 난파 빚을 갚거나 증인 앞에서 보트를 풀어라. 지체하면 더 많은 선원이 고립된다.
386|Цель: установить права гражданского груза. Сравните подлинные приказы или проверьте лечебный реестр; промедление объявляет ящики добычей.|Objetivo: fijar derechos de carga civil. Compara órdenes auténticas o verifica el inventario; la demora reclama cajas como presas.|目的：民間貨物の権利を定める。本物の命令を比べるか治療在庫を検証する。遅れると木箱が獲物とされる。|目标：确立民用货物权利。比较真命令或核实医疗清单；拖延会把箱子认作战利品。|목표: 민간 화물 권리를 정한다. 진짜 명령을 비교하거나 치료 재고를 검증하라. 지체하면 상자가 포획물이 된다.
389|Цель: выявить невольную связь с путём. Прочтите ленты имён или спросите хор; промедление тянет пляж к шторму.|Objetivo: identificar un vínculo involuntario. Lee cintas o pregunta al coro; la demora arrastra la playa a la tormenta.|目的：意に反する航路の絆を特定する。名のリボンを読むか合唱団に問う。遅れると浜が嵐へ引かれる。|目标：识别非自愿航路束缚。读取姓名丝带或问唱诗班；拖延把海滩拖向风暴。|목표: 비자발적 항로 유대를 찾는다. 이름 리본을 읽거나 합창단에 물어라. 지체하면 해변이 폭풍으로 끌려간다.
392|Цель: вернуть забытые обязанности спасения. Выслушайте выживших или найдите призовой учёт; промедление разделяет флотилию.|Objetivo: restaurar deberes de rescate. Oye supervivientes o recupera cuentas de presas; la demora divide la flotilla.|目的：忘れた救助義務を戻す。生存者を聞くか捕獲会計を回収する。遅れると船団が分裂する。|目标：恢复被忘救援义务。听幸存者或找回战利核算；拖延分裂船队。|목표: 잊힌 구조 의무를 복원한다. 생존자를 듣거나 포획 회계를 되찾아라. 지체하면 선단이 갈라진다.
395|Цель: перевезти груз при нейтральных свидетелях. Соберите инспекторов двух берегов или откройте передачу по воде; промедление принуждает экипаж к службе.|Objetivo: mover carga ante testigos neutrales. Reúne inspectores de ambas orillas o abre transferencia acuática; la demora fuerza servicio.|目的：中立証人で貨物を動かす。両岸の検査者を集めるか水上積み替えを開く。遅れると乗員が徴募される。|目标：在中立见证下运货。召集两岸检查员或开放水上转运；拖延强征船员。|목표: 중립 증인 아래 화물을 옮긴다. 양안 검사관을 모으거나 물 이송을 열어라. 지체하면 선원이 강제 복무한다.
398|Цель: спланировать безопасное освобождение. Отметьте нижнюю скобу или дайте хору выбрать течение; промедление будит цепного великана.|Objetivo: planear liberación segura. Marca el grillete inferior o deja elegir corriente al coro; la demora despierta al gigante.|目的：安全な解除を計画する。下の枷を記すか合唱団に海流を選ばせる。遅れると鎖の巨人が起きる。|目标：规划安全解除。标记下卸扣或让唱诗班选洋流；拖延唤醒锁链巨人。|목표: 안전한 해제를 계획한다. 아래 족쇄를 표시하거나 합창단이 해류를 고르게 하라. 지체하면 사슬 거인이 깬다.
401|Цель: достичь застрявших экипажей. Почините лотлинь или организуйте поэтапные мелкосидящие переправы; промедление поднимает прилив.|Objetivo: llegar a tripulaciones varadas. Repara la sonda u organiza cruces someros; la demora sube la marea.|目的：遭難乗員に届く。測深綱を直すか浅喫水横断を段階的に行う。遅れると潮が上がる。|目标：抵达被困船员。修测深绳或分批浅吃水渡行；拖延导致涨潮。|목표: 고립 선원에게 도달한다. 측심줄을 수리하거나 얕은 흘수 통행을 단계적으로 하라. 지체하면 조수가 오른다.
404|Цель: остановить незаконное изъятие. Доставьте подлинный приказ или разоблачите ложную копию; промедление разрешает выстрел орудийной команде.|Objetivo: detener incautación ilegal. Entrega la orden auténtica o revela copia falsa; la demora autoriza artilleros.|目的：違法差押えを止める。本物の命令を渡すか偽写しを暴く。遅れると砲手が許可される。|目标：停止非法没收。送真命令或揭露假副本；拖延授权炮组开火。|목표: 불법 압수를 막는다. 진짜 명령을 배달하거나 위조 사본을 밝혀라. 지체하면 포수조가 허가받는다.
407|Цель: освободить непредложенные имена. Отзовите ленты или сохраните лишь добровольные слова пути; промедление кормит картографическую пиявку.|Objetivo: liberar nombres no ofrecidos. Retira cintas o guarda solo palabras voluntarias; la demora alimenta a la sanguijuela.|目的：捧げていない名を解く。リボンを取り下げるか自発的な航路語だけ保つ。遅れると海図の蛭が育つ。|目标：释放未自愿名字。撤回丝带或只留自愿航路词；拖延滋养海图水蛭。|목표: 제공되지 않은 이름을 푼다. 리본을 철회하거나 자발적인 항로 말만 남겨라. 지체하면 해도 거머리를 먹인다.
410|Цель: найти последнюю спасаемую группу. Верните сигнальное масло или поставьте дозорного при свидетелях; промедление скрывает выживших от реестра.|Objetivo: localizar al último grupo. Restaura aceite o coloca un vigía atestiguado; la demora oculta supervivientes del libro.|目的：最後の救助集団を探す。信号油を戻すか立会いの見張りを置く。遅れると生存者が台帳から隠れる。|目标：找到最后待救组。补信号油或安置有见证瞭望员；拖延从账簿隐藏幸存者。|목표: 마지막 구조 무리를 찾는다. 신호 기름을 복구하거나 증인이 있는 감시병을 배치하라. 지체하면 생존자가 장부에서 숨겨진다.
413|Цель: безопасно доставить обоим берегам. Используйте нейтральную люльку или примите ограниченную проверку; промедление теряет лечебное окно.|Objetivo: entregar a ambas orillas con seguridad. Usa la cuna neutral o acepta inspección limitada; la demora pierde un intervalo de tratamiento.|目的：両岸に安全に届ける。中立運搬台を使うか限定検査を受ける。遅れると治療時間を失う。|目标：安全送两岸。用中立吊架或接受有限检查；拖延错过治疗窗口。|목표: 양안에 안전하게 배달한다. 중립 운반대를 쓰거나 제한 검사를 받아라. 지체하면 치료 기회를 잃는다.
416|Цель: отсечь частный якорь. Используйте спокойное погружение или откройте замок палубы; промедление закрывает безопасное течение.|Objetivo: cortar el ancla privada. Usa la inmersión calma o abre el cierre de cubierta; la demora cierra la corriente segura.|目的：私的な錨を切る。凪の潜水を使うか甲板錠を解く。遅れると安全な海流が閉じる。|目标：切断私人锚。平静时潜水或解除甲板锁；拖延关闭安全洋流。|목표: 사유 닻을 자른다. 고요한 잠수를 쓰거나 갑판 잠금을 풀어라. 지체하면 안전한 해류가 닫힌다.
419|Цель: изменить обязанности экипажей. Оплатите общие лодки или заключите спасательное соглашение при свидетелях; промедление возобновляет спор добычи.|Objetivo: revisar deberes. Financia botes comunes o vincula un convenio atestiguado; la demora renueva la disputa por presas.|目的：乗員の義務を改める。共用救命艇に資金を出すか立会い盟約を結ぶ。遅れると獲物争いが戻る。|目标：修订船员义务。资助共享救生艇或缔结有见证救援契约；拖延重启战利争端。|목표: 선원 의무를 수정한다. 공동 구명보트를 지원하거나 증인이 있는 구조 협약을 맺어라. 지체하면 포획 분쟁이 재개된다.
422|Цель: сохранить независимость гражданских. Запишите доставки обоих берегов или отвергните принудительный эскорт; промедление вербует новый экипаж.|Objetivo: preservar independencia civil. Registra entregas o rechaza escolta forzada; la demora recluta otra tripulación.|目的：民間独立を守る。両岸配送を記すか強制護衛を拒む。遅れると別乗員が徴募される。|目标：保持民用独立。记录两岸交付或拒绝强制护航；拖延强征另一船员队。|목표: 민간 독립을 지킨다. 양안 배달을 기록하거나 강제 호위를 거부하라. 지체하면 다른 선원이 징집된다.
425|Цель: плыть без украденных имён. Спойте добровольный стих или следуйте свидетельской карте хора; промедление продаёт путь острова.|Objetivo: navegar sin nombres robados. Canta un verso voluntario o sigue la carta del coro; la demora vende la ruta.|目的：盗んだ名なしで航海する。自発的な詩を歌うか合唱団の証人図に従う。遅れると島の航路が売られる。|目标：不用盗名航行。唱自愿诗句或跟随唱诗班见证图；拖延卖掉岛航路。|목표: 훔친 이름 없이 항해한다. 자발적 시구를 부르거나 합창단 증인 해도를 따라라. 지체하면 섬 항로가 팔린다.
427|Цель: решить будущее Вольной бухты. Разделите доступ к спасению или назначьте подотчётные дозорные команды; запишите расходы и выживших.|Objetivo: acordar el futuro de la cala. Comparte acceso al rescate o asigna vigilantes responsables; anota costes y supervivientes.|目的：自由入江の未来を合意する。救助利用を分けるか責任ある見張りを任命し、費用と生存者を記録する。|目标：议定自由湾未来。共享救援权限或指定负责守望队；记录成本与幸存者。|목표: 자유 만의 미래를 합의한다. 구조 접근을 나누거나 책임 있는 감시조를 배정하고 비용과 생존자를 기록하라.
430|Цель: решить наследие груза. Сохраните нейтральную проверку или независимые записи доставок; запишите нужды обоих берегов.|Objetivo: acordar el legado de carga. Mantén inspección neutral o registros independientes; anota necesidades de ambas orillas.|目的：貨物の遺産を合意する。中立検査か独立配送記録を保ち、両岸の必要を記す。|目标：议定货物遗产。维持中立检查或独立交付记录；记录两岸需求。|목표: 화물 유산을 합의한다. 중립 검사나 독립 배달 기록을 유지하고 양안의 필요를 기록하라.
433|Цель: решить живую навигацию. Сохраните ничью карту или отзывный пакт путешествия; запишите выбранный хором курс.|Objetivo: acordar navegación viva. Mantén una carta sin dueño o pacto revocable; anota el rumbo elegido por el coro.|目的：生きた航海を合意する。所有者なき図か撤回可能な航海盟約を保ち、合唱団の選んだ航路を記す。|目标：议定活航行。保留无主海图或可撤销航行契约；记录唱诗班所选航向。|목표: 살아 있는 항해를 합의한다. 주인 없는 해도나 철회 가능한 항해 계약을 유지하고 합창단 선택 항로를 기록하라.''')
clauses_add('''436|проверяет спасательные пути и считает места экипажа до загрузки.|prueba rutas de rescate y cuenta plazas antes de cargar.|積載前に救助路を試し乗員席を数える。|装货前测试救援路线并清点船员席位。|적재 전에 구조 경로를 검사하고 선원 자리를 센다.
439|держит лечение независимым от военных призовых претензий.|mantiene carga médica independiente de reclamos militares de presas.|治療貨物を軍の獲物主張から独立させる。|让医疗货物独立于军事战利主张。|치료 화물을 군 포획 주장과 독립적으로 유지한다.
442|использует имена пути, предложенные носителями.|usa nombres de ruta ofrecidos por sus titulares.|本人が捧げた航路の名を使う。|使用本人自愿提供的航路名字。|당사자가 제공한 항로 이름을 쓴다.
445|возвращает спасательные обязанности, скрытые прибыльным учётом.|restaura deberes ocultos por cuentas lucrativas.|利益会計が隠した救助義務を戻す。|恢复被盈利核算隐藏的救援义务。|수익 회계에 숨겨진 구조 의무를 복원한다.
448|делает возможной гражданскую проверку без вербовки.|permite inspección civil sin leva.|徴募なしの民間検査を可能にする。|使不强征的民用检查成为可能。|강제 징집 없이 민간 검사를 가능하게 한다.
451|планирует ограниченное безопасное освобождение острова.|planifica una liberación segura y limitada de la isla móvil.|動く島の限定的で安全な解除を計画する。|规划移动岛的有限安全解除。|움직이는 섬의 제한된 안전 해제를 계획한다.
454|сохраняет видимость потерянных экипажей после закрытия порта.|mantiene visibles tripulaciones perdidas tras cerrar el puerto.|港が閉じても失われた乗員を見えるままにする。|港关闭后保持失踪船员可见。|항구가 닫힌 뒤에도 잃은 선원을 보이게 한다.
457|записывает меняющиеся пути без притязаний на вечное владение.|registra rutas cambiantes sin reclamar propiedad permanente.|永久所有を求めず変わる航路を記す。|记录变化航路，不主张永久所有。|영구 소유를 주장하지 않고 바뀌는 항로를 기록한다.
460|заслужите статус возвращением застрявших домой; получите доступ к лодкам и обязанности дозора.|gana posición trayendo a varados a casa; obtén acceso a botes y deberes de vigilancia.|遭難者を帰して地位を得る。救命艇利用と見張り義務を得る。|带受困船员回家以获地位；获得救生艇权限与守望义务。|고립 선원을 집으로 데려와 지위를 얻고 구명보트 접근권과 감시 의무를 얻어라.
463|заслужите доверие независимой доставкой лечения; получите нейтральные набережные и обязанности проверки.|gana confianza con entrega médica independiente; obtén muelles neutrales y deberes de inspección.|独立治療配送で信頼を得る。中立埠頭と検査義務を得る。|独立交付医疗物资以获信任；获得中立码头与检查义务。|독립 치료 배달로 신뢰를 얻고 중립 부두와 검사 의무를 얻어라.
466|заслужите гостеприимство добровольной навигацией; получите пути хора и обязанности поправок.|gana bienvenida con navegación voluntaria; obtén rutas del coro y deberes de corrección.|自発航海で歓迎を得る。合唱団航路と修正義務を得る。|自愿航行以获欢迎；获得唱诗班航路与修正义务。|자발적 항해로 환영받고 합창단 항로와 수정 의무를 얻어라.
469|заслужите законность учётом потерь наряду с добычей; получите свидетелей выживших и цену спасения.|gana legitimidad contando pérdidas junto al botín; obtén testigos supervivientes y costes de rescate.|戦利品と損失を数えて正当性を得る。生存証人と救助費を得る。|将损失与战利同算以获合法性；获得幸存者见证与救援成本。|전리품과 손실을 함께 세어 정당성을 얻고 생존자 증인과 구조 비용을 얻어라.
472|заслужите уверенность передачей двух берегов; получите инспекторов и подотчётность доставки.|gana confianza con transferencias a ambas orillas; obtén inspectores y responsabilidad de entrega.|両岸積み替えで信頼を得る。検査乗員と配送責任を得る。|两岸转运以获信赖；获得检查船员与交付问责。|양안 이송으로 신뢰를 얻고 검사 선원과 배달 책임을 얻어라.
475|заслужите уважение безопасной якорной работой; получите поддержку карты и обязанности эвакуации.|gana respeto con trabajo seguro de anclas; obtén apoyo cartográfico y deberes de evacuación.|安全な錨作業で尊敬を得る。海図支援と避難義務を得る。|安全锚作业以获尊重；获得海图支持与疏散义务。|안전한 닻 작업으로 존중받고 해도 지원과 대피 의무를 얻어라.
478|синие промеры и янтарные огни бедствия отличают вместимость спасения от запертой добычи.|sondeos azules y luces ámbar distinguen capacidad de rescate de presas cerradas.|青の測深と琥珀の遭難灯で救助能力と閉じた獲物を区別する。|蓝色测深与琥珀遇险灯区分救援能力和锁住战利品。|파란 측심과 호박빛 조난 불빛이 구조 수용력과 잠긴 포획물을 구분한다.
482|зелёные гражданские пути и красные ложные печати отличают проверенную доставку от военного изъятия.|rutas civiles verdes y sellos falsos rojos distinguen entrega inspeccionada de incautación militar.|緑の民間路と赤の偽印で検査配送と軍差押えを区別する。|绿色民用航路与红色伪印区分检查交付和军事没收。|초록 민간 경로와 빨간 위조 인장이 검사 배달과 군 압수를 구분한다.
485|бирюзовые предложенные течения и фиолетовые заимствованные имена отличают живой путь от частного плена.|corrientes ofrecidas turquesas y nombres prestados violetas distinguen ruta viva de cautiverio privado.|青緑の捧げた海流と紫の借名で生きた航路と私的拘束を区別する。|青绿自愿洋流与紫色借名区分活航路和私人囚禁。|청록색 자발적 해류와 보라 빌린 이름이 살아 있는 항로와 사적 감금을 구분한다.''')
for l in langs:
 shared=json.load(open(Path(__file__).parent.parent/'gothic-horror'/(l+'.json')))
 for k in src:
  if k in shared and k not in maps[l]:maps[l][k]=shared[k]
art={'map schematic':'схема карты|esquema de mapa|地図の模式図|地图示意图|지도 도식','location schematic':'схема локации|esquema de ubicación|場所の模式図|地点示意图|장소 도식','portrait schematic':'схема портрета|esquema de retrato|肖像の模式図|肖像示意图|초상 도식','creature schematic':'схема существа|esquema de criatura|生物の模式図|生物示意图|생물 도식','item schematic':'схема предмета|esquema de objeto|アイテムの模式図|物品示意图|아이템 도식','background schematic':'схема фона|esquema de fondo|背景の模式図|背景示意图|배경 도식'}
for k in src:
 if ': ' in k and k.rsplit(': ',1)[1] in art:
  n,a=k.rsplit(': ',1);add(k,'|'.join(maps[l][n]+': '+w for l,w in zip(langs,art[a].split('|'))))
first={0:'Эпоха парусов|Era de la Vela|大航海時代|风帆时代|범선 시대',1:'Экипажи следуют слухам через опасные моря, где соперничают империи, вольные капитаны, штормы и живые мифы.|Tripulaciones siguen rumores por mares peligrosos donde compiten imperios, capitanes libres, tormentas y mitos vivos.|乗員は帝国、自由船長、嵐、生きた神話が争う危険な海で噂を追う。|船员追逐危险海上的传闻，帝国、自由船长、风暴与活神话在此竞争。|선원들이 제국, 자유 선장, 폭풍, 살아 있는 신화가 경쟁하는 위험한 바다에서 소문을 쫓는다.',2:'слух|rumor|噂|传闻|소문',3:'плавание|viaje marítimo|航海|航行|항해',4:'открытие|descubrimiento|発見|发现|발견',5:'репутация|reputación|評判|名誉|평판',6:'Пиратский архипелаг|Archipiélago Pirata|海賊群島|海盗群岛|해적 군도',7:'Вольные капитаны держат лодки, нужные застрявшему на рифе экипажу. Погасите долг прежнего крушения, начните спасение и решите, включает ли добыча будущие обязанности спасения жизней.|Capitanes libres retienen botes necesarios para una tripulación varada. Resuelve la deuda de un naufragio anterior, lanza el rescate y decide si el botín incluye futuros deberes de salvar vidas.|自由船長は礁の遭難乗員に必要な救命艇を持つ。前の難破の負債を合意し、救助を始め、戦利品に将来の救命義務が含まれるか選ぶ。|自由船长扣留被困礁石船员所需救生艇。解决旧船难债，启动救援，决定战利品是否附带未来救生义务。|자유 선장들이 암초에 고립된 선원에게 필요한 구명보트를 보유한다. 옛 난파 빚을 합의하고 구조를 시작하며 전리품에 미래 인명 구조 의무가 포함될지 선택하라.',8:'Имперская торговая война|Guerra Comercial Imperial|帝国の通商戦争|帝国贸易战|제국 무역 전쟁',9:'Гражданские лечебные ящики сталкиваются с блокадой на поддельных бумагах. Сравните приказы, доставьте обоим берегам и защитите нейтральный экипаж от принудительной военной службы.|Cajas médicas civiles enfrentan bloqueo basado en papeles falsos. Compara órdenes, entrega a ambas orillas y protege a una tripulación neutral del servicio militar forzoso.|民間治療木箱は偽書類の封鎖に遭う。命令を比べ、対立両岸に届け、中立乗員を強制軍務から守る。|民用医疗箱遭伪文件封锁。比较命令，交付敌对两岸，保护中立船员免遭强征。|민간 치료 상자가 위조 서류의 봉쇄에 맞선다. 명령을 비교하고 양안에 배달하며 중립 선원을 강제 군 복무에서 지켜라.',10:'Мифический океан|Océano Mítico|神話の海|神话之海|신화의 대양',11:'Движущийся остров поёт имена, не предложенные моряками, пока частный якорь тянет его к шторму. Освободите заимствованные имена, отсеките якорь и проложите выбранный островом курс.|Una isla móvil canta nombres no ofrecidos mientras un ancla privada la arrastra a tormenta. Libera nombres prestados, corta el ancla y traza el rumbo elegido por la isla.|動く島は船員の捧げない名を歌い、私的な錨が嵐へ引く。借りた名を解き、錨を切り、島が選ぶ航路を描く。|移动岛唱出水手未提供的名字，私人锚将其拖向风暴。释放借名，切断锚，规划岛自行选择的航向。|움직이는 섬이 선원이 제공하지 않은 이름을 부르고 사유 닻이 폭풍으로 끈다. 빌린 이름을 풀고 닻을 자르며 섬이 선택한 항로를 그려라.',12:'Следуйте огню бедствия, ложному приказу или заимствованному имени пути|Sigue luz de socorro, orden falsa o nombre de ruta prestado|遭難灯、偽命令、借りた航路名を追う|跟随遇险灯、假命令或借来航路名|조난 불빛, 위조 명령, 빌린 항로 이름을 따라라',13:'Промерьте путь и защитите вместимость экипажа|Sondea la ruta y protege capacidad de tripulación|航路を測深し乗員の収容力を守る|测深航路，保护船员容量|항로를 측심하고 선원 수용력을 지켜라',14:'Противостаньте призовой претензии, блокаде или плену живого острова|Confronta reclamo de presas, bloqueo o isla viva cautiva|獲物主張、封鎖、生きた島の拘束に対峙する|对抗战利主张、封锁或活岛囚禁|포획 주장, 봉쇄, 살아 있는 섬의 감금에 맞서라',15:'Запишите спасательные обязанности, нейтральный груз и выбранные горизонты|Anota deberes de rescate, carga neutral y horizontes elegidos|救助義務、中立貨物、選んだ水平線を記録する|记录救援义务、中立货物与所选地平线|구조 의무, 중립 화물, 선택한 수평선을 기록하라',18:'Начните с огня бедствия, пока исправные лодки прикованы.|Comienza con luz de socorro y botes útiles encadenados.|使える救命艇が鎖につながれた中、遭難灯で始める。|从遇险灯与可用救生艇仍锁住开始。|쓸 수 있는 구명보트가 묶여 있을 때 조난 불빛으로 시작하라.',19:'До плавания сообщите глубину прилива, места спасения и грузовую вместимость.|Indica profundidad de marea, plazas de rescate y capacidad de carga antes de zarpar.|航海前に潮の深さ、救助席、積載量を示す。|航行前说明潮深、救援席位与载货能力。|항해 전에 조수 깊이, 구조 자리, 화물 수용량을 알려라.',20:'Пусть прежние выжившие и призовой реестр раскроют причину удержания лодок.|Deja que supervivientes y libro revelen por qué se retienen los botes.|前の生存者と捕獲台帳で舟を留める理由を示す。|让先前幸存者与战利账簿揭示扣船原因。|이전 생존자와 포획 장부가 보트를 보류한 이유를 드러내게 하라.',21:'Запишите спасённые экипажи, потери и будущие спасательные обязательства.|Anota tripulaciones salvadas, pérdidas y futuros deberes de rescate.|救った乗員、損失、将来の救助義務を記録する。|记录获救船员、损失与未来救援义务。|구조된 선원, 손실, 미래 구조 의무를 기록하라.',24:'Начните с лечебных ящиков и приказа с явно неверной датой.|Abre con cajas médicas y una orden de fecha claramente errónea.|治療木箱と明らかに日付の違う命令で始める。|从医疗箱与日期明显错误的命令开始。|치료 상자와 날짜가 명백히 틀린 명령으로 시작하라.',25:'Конкретизируйте нужды обоих берегов без требования военной верности.|Concreta necesidades de ambas orillas sin exigir lealtad militar.|軍への忠誠を求めず両岸の必要を具体化する。|具体说明两岸需求，不要求军事效忠。|군 충성을 요구하지 않고 양안의 필요를 구체화하라.',26:'Предложите сравнение приказов, нейтральную проверку и передачу в открытом море.|Ofrece comparación de órdenes, inspección neutral y transferencia en aguas abiertas.|命令比較、中立検査、沖合積み替えを出す。|提供命令比较、中立检查与开放水域转运。|명령 비교, 중립 검사, 공해 이송을 제시하라.',27:'Запишите независимость экипажа и фактические доставки гражданским.|Anota independencia de tripulación y entregas civiles reales.|乗員の独立状態と実際の民間配送を記録する。|记录独立船员地位与实际民用交付。|선원 독립 지위와 실제 민간 배달을 기록하라.',30:'Спросите, какие имена пути предложены, а какие заимствованы.|Pregunta qué nombres se ofrecieron y cuáles se tomaron prestados.|航路名のどれを捧げどれを借りたか問う。|询问哪些航路名自愿提供，哪些借取。|어떤 항로 이름이 제공되었고 어떤 것이 빌려졌는지 물어라.',31:'Сообщите выбор безопасного течения и ограниченное окно погружения к нижней скобе.|Indica elección de corriente segura y ventana limitada de inmersión al grillete inferior.|安全海流の選択と下の枷への限られた潜水時間を示す。|说明安全洋流选择与下卸扣有限潜水窗口。|안전한 해류 선택과 아래 족쇄의 한정 잠수 기회를 알려라.',32:'Дайте освобождение имён, якорные планы и добровольный стих пути.|Ofrece liberación de nombres, planes del ancla y verso voluntario.|名の解放、錨計画、自発的な航路詩を提供する。|提供释名、锚计划与自愿航路诗句。|이름 해제, 닻 계획, 자발적 항로 시구를 제공하라.',33:'Запишите выбранный живым островом курс и отзывные условия путешествия.|Anota rumbo elegido por la isla y términos revocables de viaje.|生きた島の選んだ航路と撤回できる航海条件を記す。|记录活岛自选航向与可撤销旅行条款。|살아 있는 섬의 선택 항로와 철회 가능한 여행 조건을 기록하라.'}
for i,v in first.items():add(src[i],v)
for i,c,t in [(16,6,'Boats for the Next Storm'),(22,8,"Neither Navy's Prize"),(28,10,'An Island with Its Own Horizon')]:
 for l in langs:maps[l][src[i]]=maps[l][src[c]]+': '+maps[l][t]
for i,c,d in [(17,6,7),(23,8,9),(29,10,11)]:
 for l,v in zip(langs,['Игра на три-четыре часа в мире «{c}»: {d}','Una partida de tres a cuatro horas de {c}: {d}','「{c}」の3～4時間のゲーム：{d}','三至四小时的《{c}》游戏：{d}','{c}의 3~4시간 게임: {d}']):maps[l][src[i]]=v.format(c=maps[l][src[c]],d=maps[l][src[d]])
extra='''Voyage navigation interface|Интерфейс плаваний|Interfaz de navegación marítima|航海のナビゲーション画面|航行导航界面|항해 탐색 화면
Free coves|Вольные бухты|Calas libres|自由な入江|自由海湾|자유 만
Neutral trade route|Нейтральный торговый путь|Ruta comercial neutral|中立通商路|中立贸易路线|중립 무역로
Living ocean|Живой океан|Océano vivo|生きた海|活海洋|살아 있는 대양
Plentiful|Изобилие|Abundantes|豊富|充足|풍부
Strained|Напряжённость|Limitados|逼迫|紧缺|빠듯함
Rare|Редкость|Raros|希少|稀少|희소
Duelist|Дуэлянт|Duelista|決闘者|决斗士|결투사
Navigator|Штурман|Navegante|航海士|航海员|항해사
Storyteller|Рассказчик|Narrador|語り部|说书人|이야기꾼
Crew role|Роль экипажа|Rol de tripulación|乗員の役割|船员角色|선원 역할
Brawn|Сила|Fuerza física|腕力|体力|완력
Seamanship|Мореходство|Marinería|操船|航海术|선박 운용
Charm|Обаяние|Encanto|魅力|魅力|매력
Age of Sail portrait|Портрет эпохи парусов|Retrato de Era de la Vela|大航海時代の肖像|风帆时代肖像|범선 시대 초상
Morale|Мораль|Moral|士気|士气|사기
Provisions|Провизия|Provisiones|食糧|给养|식량
Boarding Sabre|Абордажная сабля|Sable de abordaje|乗り込みのサーベル|登船军刀|승선 사브르
Navigator Kit|Набор штурмана|Equipo de navegante|航海士の道具|航海员套件|항해사 도구
Rest Ration|Паёк отдыха|Ración de descanso|休息の配給|休息口粮|휴식 배급
Deck Coat|Палубный плащ|Abrigo de cubierta|甲板の外套|甲板外套|갑판 외투
Rigging Tools|Такелажные инструменты|Herramientas de aparejo|索具道具|索具工具|삭구 도구
Harbor Seal|Портовая печать|Sello del puerto|港の印|港口印章|항구 인장
Harbor Pilot|Портовый лоцман|Piloto del puerto|港の水先案内|港口领航员|항구 도선사
Rattled|Встревожен|Nervioso|動揺|慌乱|동요
Fair Wind|Попутный ветер|Viento favorable|順風|顺风|순풍
Braced|Подготовлен|Preparado|構え|稳固|대비
Use Boarding Sabre|Использовать абордажную саблю|Usar sable de abordaje|乗り込みサーベルを使う|使用登船军刀|승선 사브르 사용
Spend Provisions|Потратить провизию|Gastar provisiones|食糧を消費|消耗给养|식량 사용'''
for row in extra.splitlines():k,v=row.split('|',1);add(k,v)
for l in langs:
 assert set(src)==set(maps[l]),set(src)-set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Sail base:',len(src))
