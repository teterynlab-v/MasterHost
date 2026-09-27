# coding: utf-8
import json
from pathlib import Path
src=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'post-apocalypse.json'));langs=['ru','es','ja','zh-CN','ko'];maps={l:{} for l in langs}
def add(k,v):
 a=v.split('|');assert len(a)==5,(k,a)
 for l,x in zip(langs,a):maps[l][k]=x
names='''Road Mutual|Дорожная взаимопомощь|Mutua del Camino|街道相互組合|道路互助会|도로 상조회
Vault Keepers|Хранители хранилища|Guardianes de la Bóveda|保管庫の守り手|种库守护者|종자고 지킴이
Heat Assembly|Тепловой совет|Asamblea del Calor|熱の協議会|供热议会|열 의회
Causeway Camp|Лагерь у дамбы|Campamento de la Calzada|土手道の野営地|堤道营地|둑길 야영지
Open Soil Collective|Коллектив открытой почвы|Colectivo de Suelo Abierto|露地の共同体|开放土壤集体|노지 공동체
Station Mechanics|Механики станции|Mecánicos de la Estación|発電所の整備士|电站技工|발전소 정비사
Caravan Witnesses|Свидетели каравана|Testigos de la Caravana|隊商の証人|商队见证人|대상단 증인
Seed Heirs|Наследники семян|Herederos de las Semillas|種の相続人|种子继承人|씨앗 후계자
Dustroad Depot|Склад Пыльной дороги|Depósito del Camino Polvoriento|砂塵街道の倉庫|尘路仓库|먼지길 창고
Glassroot Gate|Врата Стеклянного корня|Puerta de Raíz de Vidrio|硝子根の門|玻璃根大门|유리뿌리 관문
Last Grid Control|Управление последней сетью|Control de la Última Red|最後の送電網の制御室|最后电网控制室|마지막 전력망 제어실
Broken Causeway|Разрушенная дамба|Calzada Rota|崩れた土手道|断裂堤道|부서진 둑길
Clean Seed Room|Комната чистых семян|Sala de Semillas Limpias|清潔な種の部屋|洁净种子室|깨끗한 씨앗 방
Cinder Valve Hall|Зал угольных клапанов|Sala de Válvulas de Ceniza|燃え殻の弁室|煤渣阀门大厅|잿불 밸브실
Windbreak Camp|Ветрозащитный лагерь|Campamento Cortavientos|防風の野営地|防风营地|방풍 야영지
Open Soil Beds|Открытые грядки|Bancales de Suelo Abierto|露地の苗床|开放土壤苗床|노지 모판
Far Hearth|Дальний очаг|Hogar Lejano|遠き炉辺|远炉聚落|먼 화덕
Auction Mile|Аукционная миля|Milla de Subastas|競売街道|拍卖大道|경매 거리
Inheritance Archive|Архив наследства|Archivo de Herencias|相続の文書庫|继承档案馆|상속 기록보관소
Return Cable|Обратный кабель|Cable de Retorno|帰還ケーブル|回路电缆|귀환 케이블
Driver Mara Axle|Водитель Мара Эксл|Conductora Mara Axle|運転手マラ・アクスル|司机玛拉·阿克塞尔|운전사 마라 액슬
Keeper Ina Glassroot|Хранительница Ина Гласрут|Guardiana Ina Glassroot|守り手イナ・グラスルート|守护者伊娜·格拉斯鲁特|지킴이 이나 글래스루트
Engineer Pell Heat|Инженер Пелл Хит|Ingeniero Pell Heat|技師ペル・ヒート|工程师佩尔·希特|기술자 펠 히트
Camper Juno Brace|Обитатель лагеря Джуно Брейс|Campista Juno Brace|野営者ジュノ・ブレイス|营员朱诺·布雷斯|야영객 주노 브레이스
Grower Dev Open|Садовод Дев Оупен|Cultivador Dev Open|栽培者デヴ・オープン|种植者德夫·奥彭|재배자 데브 오픈
Clerk Sera Ember|Писарь Сера Эмбер|Escribana Sera Ember|書記セラ・エンバー|书记塞拉·恩伯|서기 세라 엠버
Medic Noa Filter|Медик Ноа Филтер|Médica Noa Filter|衛生兵ノア・フィルター|医护诺亚·菲尔特|의무관 노아 필터
Archivist Ren Seed|Архивист Рен Сид|Archivista Ren Seed|文書係レン・シード|档案员伦·西德|기록관 렌 시드
Elder Bea Far|Старейшина Беа Фар|Anciana Bea Far|長老ベア・ファー|长者贝娅·法尔|장로 베아 파
Broker Sol Passage|Посредник Сол Пасседж|Corredor Sol Passage|仲買人ソル・パッセージ|中间人索尔·帕塞奇|중개인 솔 패시지
Technician Mei Culture|Техник Мей Калчер|Técnica Mei Culture|技術者メイ・カルチャー|技术员梅·卡尔彻|기술자 메이 컬처
Worker Ash Cinder|Рабочий Эш Синдер|Trabajador Ash Cinder|作業員アッシュ・シンダー|工人阿什·辛德|노동자 애시 신더
Child Len Route|Ребёнок Лен Рут|Niño Len Route|子供レン・ルート|孩子伦·鲁特|아이 렌 루트
Patient Rosa Root|Пациентка Роза Рут|Paciente Rosa Root|患者ローザ・ルート|病人罗莎·鲁特|환자 로사 루트
Courier Kai Hearth|Курьер Кай Харт|Mensajero Kai Hearth|運び手カイ・ハース|信使凯·哈斯|배달원 카이 하스
Buyer Tess Reserve|Покупательница Тесс Резерв|Compradora Tess Reserve|買い手テス・リザーブ|买家泰丝·里泽夫|구매자 테스 리저브
Keeper Oren Seal|Хранитель Орен Сил|Guardián Oren Seal|守り手オレン・シール|守护者奥伦·西尔|지킴이 오렌 실
Guardian Fia Wire|Защитница Фиа Уайр|Guardiana Fia Wire|守護者フィア・ワイヤー|守护者菲娅·怀尔|수호자 피아 와이어
Mechanic Ivo Span|Механик Иво Спэн|Mecánico Ivo Span|整備士イヴォ・スパン|技工伊沃·斯潘|정비사 이보 스팬
Grower Nessa Heir|Садовод Несса Хейр|Cultivadora Nessa Heir|栽培者ネッサ・エア|种植者内莎·埃尔|재배자 네사 에어
Organizer Bo Warm|Организатор Бо Уорм|Organizador Bo Warm|組織者ボー・ウォーム|组织者博·沃姆|조직자 보 웜
Scout Ada Mile|Разведчица Ада Майл|Exploradora Ada Mile|斥候エイダ・マイル|侦察员艾达·迈尔|정찰병 에이다 마일
Researcher Taro Field|Исследователь Таро Филд|Investigador Taro Field|研究者タロ・フィールド|研究员太郎·菲尔德|연구자 타로 필드
Dispatcher Kira Last|Диспетчер Кира Ласт|Despachadora Kira Last|指令員キラ・ラスト|调度员基拉·拉斯特|배차원 키라 라스트
Passage Raiders|Налётчики переправы|Asaltantes del Paso|通路の略奪者|通道劫掠者|통행 약탈자
Vault Purger|Очиститель хранилища|Purgador de la Bóveda|保管庫の粛清機|种库净化者|종자고 정화자
Heat Sheriff|Шериф тепла|Sheriff del Calor|熱の保安官|供热警长|열 보안관
Dust Stalker|Пыльный преследователь|Acechador del Polvo|砂塵の追跡者|尘埃潜行者|먼지 추적자
Filter Bloom|Налёт фильтра|Floración del Filtro|フィルターの繁殖物|过滤器菌落|필터 증식체
Warehouse Guard|Страж склада|Guardia del Almacén|倉庫の番人|仓库守卫|창고 경비병
Axle Gang|Банда оси|Banda del Eje|車軸の一団|车轴帮|차축 갱단
Seal Drone|Запирающий дрон|Dron de Sellado|封鎖ドローン|封锁无人机|봉쇄 드론
Cable Gnawer|Грызун кабеля|Roedor de Cables|ケーブル齧り|电缆啃食者|케이블 갉는 기계
Reserve Collector|Сборщик запасов|Recaudador de Reservas|備蓄の徴収者|储备征收者|비축 징수자
Culture Warden|Страж культур|Guardián de Cultivos|培養物の管理者|培养物守卫|배양체 감시자
Ration Informer|Доносчик пайков|Informante de Raciones|配給の密告者|配给告密者|배급 밀고자
Causeway Swarm|Рой дамбы|Enjambre de la Calzada|土手道の群れ|堤道机群|둑길 기계 무리
Seed Thief|Вор семян|Ladrón de Semillas|種の泥棒|种子窃贼|씨앗 도둑
Cold Patrol|Холодный патруль|Patrulla del Frío|寒気の巡回隊|严寒巡逻队|추위 순찰대
Auction Enforcer|Вышибала аукциона|Ejecutor de Subastas|競売の執行者|拍卖执法者|경매 집행자
Charter Eraser|Стиратель хартии|Borrador de la Carta|憲章の抹消者|宪章抹除者|헌장 지우개
Grid Echo|Эхо сети|Eco de la Red|送電網の残響|电网回声|전력망 메아리'''
for row in names.splitlines():k,v=row.split('|',1);add(k,v)
names='''Reserve Ledger|Реестр запасов|Libro de Reservas|備蓄台帳|储备账簿|비축 장부
Clean Seed Sample|Образец чистых семян|Muestra de Semillas Limpias|清潔な種の標本|洁净种子样本|깨끗한 씨앗 표본
Demand Map|Карта потребностей|Mapa de Demanda|需要の地図|需求地图|수요 지도
Bridge Brace|Опора моста|Refuerzo del Puente|橋の支柱|桥梁支架|다리 지지대
Filter Cartridge|Фильтрующий картридж|Cartucho del Filtro|フィルターカートリッジ|滤芯|필터 카트리지
Bypass Handle|Ручка обхода|Manija del Derivador|迂回弁の取っ手|旁路手柄|우회 밸브 손잡이
Dust Masks|Противопылевые маски|Mascarillas Antipolvo|防塵マスク|防尘面罩|방진 마스크
Joint Planting Charter|Хартия совместного посева|Carta de Siembra Conjunta|共同播種の憲章|联合种植宪章|공동 파종 헌장
Return Cable Reel|Катушка обратного кабеля|Bobina del Cable de Retorno|帰還ケーブル巻き|回路电缆盘|귀환 케이블 릴
Passage Receipt|Квитанция прохода|Recibo de Paso|通行の受領書|通行收据|통행 영수증
Outdoor Trial Log|Журнал наружных испытаний|Registro de Ensayos Exteriores|露地試験の記録|室外试验日志|야외 시험 기록
Repair Cell|Ремонтный элемент питания|Celda de Reparación|修理用電池|维修电池|수리 전지
Convoy Release|Освобождение конвоя|Liberación del Convoy|護送隊の解除書|车队解除书|호송대 해제서
Heir Seed Box|Коробка семян наследников|Caja de Semillas de Herederos|相続人の種箱|继承人种子盒|후계자의 씨앗 상자
Unmetered Petition|Прошение неучтённых|Petición de Hogares sin Medidor|未計測者の請願|未计量住户请愿书|계량기 없는 가정의 청원
Silent Engine Kit|Набор тихого двигателя|Equipo de Motor Silencioso|静かなエンジンの道具|静音引擎套件|조용한 엔진 키트
Culture Divider|Разделитель культур|Separador de Cultivos|培養物の分離器|培养物分隔器|배양체 분리기
Warehouse Invoice|Счёт склада|Factura del Almacén|倉庫の請求書|仓库发票|창고 청구서
Camp Evacuation Map|Карта эвакуации лагеря|Mapa de Evacuación del Campamento|野営地の避難図|营地疏散图|야영지 대피 지도
Open Soil Deed|Акт открытой почвы|Título de Suelo Abierto|露地の権利書|开放土壤地契|노지 권리 증서
Manual Grid Key|Ключ ручного управления сетью|Llave Manual de la Red|送電網の手動キー|电网手动钥匙|전력망 수동 열쇠
Auction Amnesty|Аукционная амнистия|Amnistía de la Subasta|競売の恩赦|拍卖赦免|경매 사면
Harvest Ration|Паёк урожая|Ración de Cosecha|収穫の配給|收成口粮|수확 배급
Heat Covenant|Соглашение о тепле|Convenio del Calor|熱の盟約|供热契约|열 협약
Departure Alarm|Тревога отправления|Alarma de Salida|出発警報|出发警报|출발 경보
Closed Greenhouse|Закрытая теплица|Invernadero Cerrado|閉ざされた温室|封闭温室|닫힌 온실
Cold Roll Call|Холодная перекличка|Lista del Frío|寒気の点呼|严寒点名|추위의 점호
Camp Signal|Сигнал лагеря|Señal del Campamento|野営地の信号|营地信号|야영지 신호
Bloom Warning|Предупреждение о налёте|Alerta de Proliferación|繁殖警告|菌落警报|증식 경고
Warehouse Steam|Складской пар|Vapor del Almacén|倉庫の蒸気|仓库蒸汽|창고 증기
Reserve Bid|Ставка на запасы|Oferta por Reservas|備蓄への入札|储备投标|비축 입찰
Healthy Shoot|Здоровый росток|Brote Sano|健康な芽|健康幼苗|건강한 싹
Meter Seizure|Изъятие счётчика|Incautación del Medidor|計器の押収|计量没收|계량기 압수
Bridge Crack|Трещина моста|Grieta del Puente|橋の亀裂|桥梁裂缝|다리 균열
Charter Discovery|Открытие хартии|Hallazgo de la Carta|憲章の発見|宪章发现|헌장 발견
Old Priority|Старый приоритет|Prioridad Antigua|古い優先順位|旧优先级|옛 우선순위
Broker Barricade|Баррикада посредника|Barricada del Corredor|仲買人の封鎖|中间人路障|중개인 바리케이드
Filter Failure|Отказ фильтра|Fallo del Filtro|フィルター故障|过滤器故障|필터 고장
Return Petition|Прошение о возвращении|Petición de Retorno|帰還の請願|回归请愿|귀환 청원
Mask Shortage|Нехватка масок|Escasez de Mascarillas|マスク不足|面罩短缺|마스크 부족
Heir Meeting|Встреча наследников|Reunión de Herederos|相続人の集会|继承人会议|후계자 회의
Repair Offer|Предложение ремонта|Oferta de Reparación|修理の提案|修缮提议|수리 제안
Buyer Arrival|Прибытие покупателя|Llegada del Comprador|買い手の到着|买家抵达|구매자 도착
Purger Countdown|Отсчёт очистителя|Cuenta Atrás del Purgador|粛清機の秒読み|净化倒计时|정화자 초읽기
Cable Fault|Неисправность кабеля|Fallo del Cable|ケーブル故障|电缆故障|케이블 고장
Camp Council|Совет лагеря|Consejo del Campamento|野営地の会議|营地议会|야영지 회의
Open Soil Hearing|Слушание открытой почвы|Audiencia de Suelo Abierto|露地の審理|开放土壤听证|노지 심리
Ration Confession|Признание о пайках|Confesión de Raciones|配給の告白|配给坦白|배급 고백
Quiet Crossing|Тихая переправа|Cruce Silencioso|静かな横断|静默渡行|조용한 건너기
First Harvest|Первый урожай|Primera Cosecha|最初の収穫|首次收成|첫 수확
Shared Override|Совместное ручное управление|Control Manual Compartido|共同の手動制御|共享手动控制|공동 수동 제어
Road Reopened|Дорога снова открыта|Camino Reabierto|再開した街道|道路重开|다시 열린 길
Seeds Released|Выданные семена|Semillas Liberadas|解放された種|种子发放|풀린 씨앗
Heat after Frost|Тепло после мороза|Calor tras la Helada|霜の後の熱|霜冻后的暖气|서리 뒤의 열
Barrels before the Storm|Бочки перед бурей|Barriles antes de la Tormenta|嵐の前の樽|风暴前的桶|폭풍 전의 통
The Sealed Harvest|Запечатанный урожай|La Cosecha Sellada|封じられた収穫|封存的收成|봉인된 수확
Homes off the Roll|Дома вне списка|Hogares fuera de la Lista|名簿外の家|名单外的家|명부 밖의 집
A Span for Everyone|Пролёт для всех|Un Tramo para Todos|皆のための橋桁|所有人的桥段|모두를 위한 교량 구간
The Living Sample|Живой образец|La Muestra Viva|生きた標本|活体样本|살아 있는 표본
Heat in the Warehouse|Тепло на складе|Calor en el Almacén|倉庫の熱|仓库的暖气|창고의 열
An Inherited Garden|Унаследованный сад|Un Jardín Heredado|受け継いだ庭|继承的花园|물려받은 정원
The Dead Factory|Мёртвый завод|La Fábrica Muerta|死んだ工場|死寂工厂|죽은 공장
A Camp on Wheels|Лагерь на колёсах|Un Campamento sobre Ruedas|車輪の野営地|轮上营地|바퀴 달린 야영지
The Purger's Order|Приказ очистителя|La Orden del Purgador|粛清機の命令|净化者的命令|정화자의 명령
Across the Cold Ridge|Через холодный хребет|A través de la Cresta Fría|寒い尾根を越えて|越过寒冷山脊|차가운 능선을 넘어
The Reserve Hearing|Слушание о запасах|La Audiencia de Reservas|備蓄の審理|储备听证会|비축 심리
Harvest beyond Glass|Урожай за стеклом|Cosecha más allá del Vidrio|硝子の外の収穫|玻璃之外的收成|유리 너머의 수확
The One-use Override|Одноразовое ручное управление|El Control Manual de un Uso|一度限りの手動制御|一次性手动控制|일회용 수동 제어
A Road Kept Open|Дорога, оставшаяся открытой|Un Camino que Sigue Abierto|開き続ける道|保持畅通的道路|계속 열린 길
The Next Season|Следующий сезон|La Próxima Temporada|次の季節|下一个季节|다음 계절
Both Hearths Warm|Оба очага в тепле|Ambos Hogares Calientes|両方の炉辺を暖かく|两处炉火皆温暖|두 화덕 모두 따뜻하게
Convoy Auditor|Ревизор конвоя|Auditor del Convoy|護送隊の監査人|车队审计员|호송대 감사관
Seed Technician|Техник семян|Técnico de Semillas|種の技術者|种子技术员|씨앗 기술자
Grid Engineer|Инженер сети|Ingeniero de la Red|送電網の技師|电网工程师|전력망 기술자
Causeway Medic|Медик дамбы|Médico de la Calzada|土手道の衛生兵|堤道医护|둑길 의무관
Open Soil Grower|Садовод открытой почвы|Cultivador de Suelo Abierto|露地の栽培者|开放土壤种植者|노지 재배자
Far Hearth Courier|Курьер Дальнего очага|Mensajero del Hogar Lejano|遠き炉辺の運び手|远炉信使|먼 화덕 배달원
Road Mediator|Дорожный посредник|Mediador del Camino|街道の仲介者|道路调解员|길의 중재자
Charter Archivist|Архивист хартии|Archivista de Cartas|憲章の文書係|宪章档案员|헌장 기록관
Reserve Steward|Распорядитель запасов|Administrador de Reservas|備蓄の世話役|储备管事|비축 관리인
Seed Custodian|Хранитель семян|Custodio de Semillas|種の守り手|种子守护者|씨앗 지킴이
Heat Coordinator|Координатор тепла|Coordinador del Calor|熱の調整者|供热协调员|열 조정관
Crossing Guardian|Хранитель переправы|Guardián del Cruce|渡りの守護者|渡行守护者|통행 수호자
Harvest Witness|Свидетель урожая|Testigo de Cosechas|収穫の証人|收成见证人|수확 증인
Return Warden|Страж возвращения|Guardián del Retorno|帰還の守護者|回归守卫|귀환 수호자
Dustroad Route|Путь Пыльной дороги|Ruta del Camino Polvoriento|砂塵街道の道筋|尘路路线|먼지길 경로
Glassroot Trial|Испытание Стеклянного корня|Ensayo de Raíz de Vidrio|硝子根の試験|玻璃根试验|유리뿌리 시험
Last Grid Ledger|Реестр последней сети|Libro de la Última Red|最後の送電網の台帳|最后电网账簿|마지막 전력망 장부'''
for row in names.splitlines():k,v=row.split('|',1);add(k,v)
clauses='''35|ведёт конвой и нуждается в честном учёте аварийных запасов.|dirige el convoy y necesita cuentas honestas de reservas de emergencia.|護送隊を運営し、緊急備蓄の正直な会計を必要とする。|运营车队，需要应急储备的诚实核算。|호송대를 운영하며 비상 비축의 정직한 회계가 필요하다.
38|защищает чистые семена, но запрещает посев вне запечатанной теплицы.|protege semillas limpias, pero rechaza sembrar fuera del invernadero sellado.|清潔な種を守るが、封じた温室の外の播種を拒む。|保护洁净种子，却拒绝在密封温室外种植。|깨끗한 씨앗을 지키지만 봉인된 온실 밖의 파종을 거부한다.
41|распределяет энергию по реестру, не учитывающему дальние дома.|asigna energía mediante un libro que omite hogares distantes.|遠くの家を除外した台帳で電力を配分する。|依遗漏远方住户的账簿分配电力。|먼 집들을 빠뜨린 장부로 전력을 배분한다.
44|предлагает работу на мосту, если конвой эвакуирует раненых путников.|ofrece trabajar en el puente si el convoy evacua a sus viajeros heridos.|護送隊が負傷した旅人を避難させれば橋の作業を提供する。|若车队疏散受伤旅人，便提供修桥劳动。|호송대가 다친 여행자를 대피시키면 다리 노동을 제공한다.
47|имеет безопасные опытные грядки и требует долю урожая.|tiene bancales de ensayo seguros y exige parte de la cosecha.|安全な試験苗床を持ち、収穫の分け前を求める。|有安全试验苗床，并要求分享收成。|안전한 시험 모판을 갖고 수확의 몫을 요구한다.
50|может перезапустить сеть, если совет выдаст ремонтные элементы питания.|puede reiniciar la red si la asamblea libera celdas de reparación.|協議会が修理用電池を渡せば送電網を再起動できる。|议会发放维修电池后可重启电网。|의회가 수리 전지를 내놓으면 전력망을 재시작할 수 있다.
53|знает, какие заявки на припасы подделали перед отправлением.|sabe qué ofertas de suministros se falsificaron antes de salir.|出発前にどの補給入札が偽造されたか知る。|知道出发前哪些物资投标遭伪造。|출발 전에 어떤 보급 입찰이 위조되었는지 안다.
56|хранит исходные соглашения о посеве, подписанные до краха.|conserva acuerdos de siembra originales firmados antes del colapso.|崩壊前に署名された播種の原契約を持つ。|持有崩溃前签署的原始种植协议。|붕괴 전에 서명한 원래 파종 협약을 보유한다.
59|последние бочки воды конвоя запечатаны для дальнего покупателя.|los últimos barriles de agua del convoy están sellados para un comprador distante.|護送隊の最後の水樽は遠方の買い手のため封じられている。|车队最后的水桶封存给远方买家。|호송대의 마지막 물통은 먼 구매자를 위해 봉인되어 있다.
62|сканер теплицы отвергает здоровых людей снаружи.|un escáner del invernadero rechaza a personas sanas de fuera.|温室の検査機が外の健康な人を拒む。|温室扫描仪拒绝健康的外来人。|온실 스캐너가 건강한 외부인을 거부한다.
65|из тёплого пульта видны холодные неучтённые дома.|una sala de control cálida mira casas frías no contabilizadas.|暖かい制御室から寒い未計上の家が見える。|温暖控制室俯瞰冰冷且未计入的房屋。|따뜻한 제어실에서 춥고 집계되지 않은 집들이 보인다.
68|средний пролёт не выдержит одновременно грузовик и застрявший лагерь.|el tramo central no soporta el camión y el campamento varado a la vez.|中央の橋桁はトラックと取り残された野営者を同時に支えられない。|中央桥段无法同时承受卡车与被困营地人员。|중앙 교량 구간은 트럭과 고립된 야영객을 동시에 지탱하지 못한다.
71|один живой урожай делит фильтр с непроверенной культурой.|un cultivo vivo comparte filtro con un cultivo sin analizar.|生きた作物が未検査の培養物とフィルターを共有する。|一株活作物与未检测培养物共用过滤器。|살아 있는 작물 하나가 검사하지 않은 배양체와 필터를 공유한다.
74|повреждённый обход направляет тепло в склад совета.|un derivador dañado envía calor al almacén de la asamblea.|壊れた迂回路が協議会の倉庫に熱を送る。|损坏的旁路把热送到议会仓库。|손상된 우회로가 의회 창고로 열을 보낸다.
77|путники укрываются под упавшим дорожным знаком, а маски заканчиваются.|viajeros se refugian bajo una señal caída mientras menguan las mascarillas.|旅人は倒れた道路標識の下に隠れ、マスクが減っている。|旅人躲在倒塌路牌下，面罩日渐不足。|여행자들이 쓰러진 도로 표지판 아래 숨으며 마스크가 줄어든다.
80|малое наружное испытание процветает вопреки предупреждениям хранилища.|un pequeño ensayo exterior prospera pese a advertencias de la bóveda.|保管庫の警告にもかかわらず小規模な露地試験が育つ。|尽管种库警告，小规模室外试种仍茁壮成长。|종자고 경고에도 작은 야외 시험 재배가 잘 자란다.
83|старики поселения жгут мебель, пока счётчики не видят потребности.|los ancianos queman muebles mientras medidores indican demanda nula.|集落の老人は家具を燃やすが、計器は需要なしと示す。|聚落老人烧家具取暖，计量器却显示无需求。|정착지 노인들이 가구를 태우는데 계량기는 수요 없음을 표시한다.
86|посредники продают доступ к дороге, содержимой трудом общины.|corredores venden acceso a un camino mantenido con trabajo comunitario.|共同体の労働で維持した道への通行を仲買人が売る。|中间人出售由社区劳动维护的道路通行权。|중개인들이 공동체 노동으로 유지하는 길의 통행권을 판다.
89|хартия посева называет чужаков совместными хранителями.|la carta de siembra nombra a forasteros custodios conjuntos.|播種憲章は外部の人を共同管理者と記す。|种植宪章指定外来人为共同保管人。|파종 헌장이 외부인을 공동 관리자로 명명한다.
92|запасная линия дотянется до Дальнего очага, если главное поселение поделится элементами питания.|una línea auxiliar llegaría al Hogar Lejano si el asentamiento principal comparte celdas.|主集落が電池を分ければ予備線が遠き炉辺に届く。|主聚落分享电池后，备用线路可抵达远炉。|주 정착지가 전지를 나누면 예비선이 먼 화덕까지 닿는다.
95|откажется от договора покупателя, если команда предложит обоснованный план запасов.|dejará el contrato del comprador si el equipo propone un plan de reservas defendible.|乗員が正当化できる備蓄計画を示せば買い手の契約を捨てる。|团队提出合理储备计划后会放弃买家契约。|일행이 정당화할 수 있는 비축 계획을 제시하면 구매자 계약을 포기한다.
98|знает, что протокол изоляции устарел, и боится потерять чистый урожай.|sabe que el protocolo de aislamiento está obsoleto y teme perder el cultivo limpio.|隔離手順が古いと知り、清潔な作物を失うことを恐れる。|知道隔离规程过时，却怕失去洁净作物。|격리 규약이 낡았음을 알지만 깨끗한 작물을 잃을까 두려워한다.
101|починит обход, но нужна карта неучтённых домов.|puede reparar el derivador, pero necesita un mapa de hogares omitidos.|迂回路を修理できるが、未計上の家の地図が必要だ。|能修复旁路，但需要遗漏房屋地图。|우회로를 수리할 수 있지만 집계되지 않은 집의 지도가 필요하다.
104|возглавит работы на мосту, когда раненые получат транспорт.|puede dirigir obras del puente cuando los heridos tengan transporte.|負傷者の輸送が確保されれば橋の作業を指揮する。|受伤旅人有交通工具后可带领修桥。|다친 여행자의 교통편이 마련되면 다리 노동을 이끈다.
107|имеет чистые наружные ростки и предлагает нейтральную проверку загрязнения.|tiene brotes exteriores limpios y ofrece una prueba neutral de contaminación.|清潔な露地の芽を持ち、中立な汚染検査を提案する。|拥有洁净室外幼苗，并提供中立污染检测。|깨끗한 야외 싹이 있고 중립적인 오염 검사를 제안한다.
110|прячет реестр пропущенных потребностей под старым обогревателем.|oculta el libro de demanda omitida bajo un viejo calentador.|抜けた需要の台帳を古い暖房器の下に隠す。|把遗漏需求账簿藏在旧暖炉下。|누락된 수요 장부를 옛 난방기 아래 숨긴다.
113|имеет запасные пылевые маски и должен выбрать безопасный путь эвакуации.|tiene mascarillas de repuesto y debe elegir una evacuación segura.|予備防塵マスクを持ち、安全な避難路を選ばねばならない。|有备用防尘面罩，必须选择安全疏散路线。|예비 방진 마스크를 갖고 안전한 대피로를 선택해야 한다.
116|хранит совместную хартию и хочет участия наследников в её возобновлении.|tiene la carta conjunta y quiere que los herederos participen al renovarla.|共同憲章を持ち、更新に相続人の参加を望む。|持有联合宪章，希望继承人参与续订。|공동 헌장을 보유하며 갱신에 후계자들이 참여하기를 바란다.
119|знает рабочий кабельный путь через старый служебный туннель.|conoce una ruta funcional de cable por el antiguo túnel de servicio.|古い整備トンネルを通る使えるケーブル経路を知る。|知道穿越旧维护隧道的可用电缆路线。|옛 정비 터널을 지나는 쓸 수 있는 케이블 경로를 안다.
122|купил поддельные заявки и даст показания за ограниченную амнистию.|compró las ofertas falsas y testificará por una amnistía limitada.|偽の入札を買い、限定的な恩赦と交換で証言する。|买下伪造投标，愿为有限赦免作证。|위조 입찰을 샀으며 제한된 사면을 받으면 증언한다.
125|выделит жизнеспособный штамм, не сжигая всю комнату семян.|puede separar la cepa viable sin quemar toda la sala de semillas.|種の部屋を全焼させず生存する株を分離できる。|能分离可存活品系，无须烧毁整间种子室。|씨앗 방 전체를 태우지 않고 살아 있는 균주를 분리할 수 있다.
128|перекроет клапан склада до входа ремонтной команды.|puede cerrar la válvula del almacén antes de que entren reparadores.|修理班が入る前に倉庫の弁を閉められる。|可在维修队进入前关闭仓库阀门。|수리조가 들어가기 전에 창고 밸브를 잠글 수 있다.
131|отметил пешую переправу, недоступную тяжёлым грузовикам конвоя.|marcó un paso peatonal que los camiones pesados no pueden usar.|護送隊の大型トラックが使えない徒歩の渡りを記した。|标出车队重型卡车无法使用的步行通道。|호송대 대형 트럭이 쓸 수 없는 도보 통로를 표시했다.
134|нуждается в еде сейчас и отказывается от обещания урожая без пайка.|necesita comer ahora y rechaza promesas de cosecha sin una ración.|今食事が必要で、配給なしの収穫の約束を拒む。|现在就需要食物，拒绝没有口粮的收成承诺。|지금 음식이 필요하며 배급 없는 수확 약속을 거부한다.
137|перенесёт элементы питания через холодный хребет, если получит приют на обратном пути.|puede llevar celdas por la cresta fría si recibe refugio al regresar.|帰りの避難場所があれば寒い尾根越しに修理用電池を運べる。|若返程得到庇护，可越过寒冷山脊运维修电池。|돌아올 때 쉼터를 받으면 차가운 능선 너머로 수리 전지를 운반한다.
140|требует бочки, но согласится на отсроченную доставку при свидетелях.|reclama los barriles, pero acepta una entrega diferida ante testigos.|樽を要求するが、立会い付きの配送延期を受ける。|主张拥有桶，但接受有见证的延期交付。|통을 요구하지만 증인이 있는 배달 연기를 받아들인다.
143|откроет врата, если покажут безопасную замену фильтра.|abrirá la puerta si se demuestra un reemplazo seguro del filtro.|安全なフィルター交換が示されれば門を開く。|证明安全更换过滤器后便会开门。|안전한 필터 교체를 보여 주면 관문을 연다.
146|защищает Дальний очаг и подозревает, что команде нужен лишь его запасной кабель.|protege Hogar Lejano y sospecha que el equipo solo quiere su cable sobrante.|遠き炉辺を守り、乗員が予備ケーブルだけを狙うと疑う。|保护远炉，怀疑团队只想拿备用电缆。|먼 화덕을 지키며 일행이 예비 케이블만 원한다고 의심한다.
149|усилит одну балку моста до прибытия пылевого фронта.|puede reforzar una viga antes de que llegue el frente de polvo.|砂塵前線が来る前に橋の梁を一本補強できる。|可在尘暴锋到来前加固一根桥梁。|먼지 전선이 오기 전에 다리 보 하나를 보강할 수 있다.
152|хочет сохранить права на семена даже при потере теплицы.|quiere que sobrevivan los derechos de semillas aunque se pierda el invernadero.|温室を失っても種の権利が残ることを望む。|希望即使失去温室也保留种子权利。|온실을 잃더라도 씨앗 권리가 남기를 바란다.
155|договорится об общем тепле, если пропущенным жителям дадут голос.|puede negociar calor compartido si los residentes omitidos votan.|抜けた住民に投票権があれば熱の共有を交渉できる。|遗漏居民获投票权后可协商共享供热。|누락된 주민에게 투표권이 주어지면 공동 열을 협상한다.
158|видела, как баррикаду посредника строили из украденного ремонтного дерева.|vio construir la barricada con madera de reparación robada.|仲買人の封鎖が盗んだ修理材で作られるのを見た。|看到中间人用偷来的维修木材建路障。|중개인 바리케이드를 훔친 수리 목재로 만드는 것을 보았다.
161|записал старые успешные наружные испытания, которые подавили.|registró ensayos exteriores exitosos antiguos que fueron censurados.|隠された昔の露地試験の成功を記録した。|记录了被压制的旧室外试验成功结果。|은폐된 옛 야외 시험 성공 사례를 기록했다.
164|хранит одноразовое ручное управление сетью и хочет публичного свидетеля перед применением.|tiene un control manual de un uso y quiere un testigo público antes de usarlo.|一度限りの手動制御を持ち、使用前に公の証人を求める。|持有一次性电网手动控制，使用前需要公开见证人。|일회용 전력망 수동 제어를 갖고 사용 전에 공개 증인을 원한다.'''
def clauses_add(text):
 for row in text.splitlines():
  i,v=row.split('|',1);key=src[int(i)];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
clauses_add(clauses)
clauses_add('''167|требуют бочки покупателя и примут припасы для раненой родни.|exigen barriles del comprador y aceptarán suministros para familiares heridos.|買い手の樽を要求するが、負傷した身内への物資でも受ける。|索要买家桶，愿接受给受伤亲人的补给。|구매자의 통을 요구하며 다친 친족을 위한 보급품도 받아들인다.
170|сжигает открытые культуры, если не предоставлен проверенный чистый образец.|quema cultivos expuestos salvo que reciba una muestra limpia verificada.|検証済みの清潔な標本がなければ露出した培養物を焼く。|除非提供经过验证的洁净样本，否则烧毁暴露培养物。|검증된 깨끗한 표본이 없으면 노출된 배양체를 태운다.
173|изымет ремонтные элементы у всех без счётчика совета.|confisca celdas de reparación a quien no tenga medidor de la asamblea.|協議会の計器を持たない人から修理電池を押収する。|没收没有议会计量器者的维修电池。|의회 계량기가 없는 이에게서 수리 전지를 압수한다.
176|следует за двигателями конвоя, но отвлекается тихой приманкой.|sigue motores del convoy y puede desviarse con un señuelo silencioso.|護送隊のエンジンを追うが静かな囮でそらせる。|跟随车队引擎，可用安静诱饵引开。|호송대 엔진을 따라가지만 조용한 유인책으로 돌릴 수 있다.
179|забивает воздушные каналы, но без тёплой влаги безвреден.|obstruye conductos de aire, pero es inocuo sin humedad cálida.|空気路を詰まらせるが暖かい湿気から離すと無害になる。|堵塞空气通道，远离温暖潮湿后无害。|공기 통로를 막지만 따뜻한 습기와 분리하면 무해하다.
182|охраняет незаконную тепловую линию и прячет её квитанцию потребности.|protege una línea de calor no autorizada y oculta su recibo de demanda.|無許可の暖房線を守り、需要の受領書を隠す。|保护未经授权的供热线并隐藏需求收据。|무허가 난방선을 보호하며 수요 영수증을 숨긴다.
185|пытается захватить грузовик конвоя, пока команда чинит пролёт.|intenta tomar el camión mientras el equipo repara el tramo.|乗員が橋桁を直す間にトラックを奪おうとする。|团队修桥段时试图抢车队卡车。|일행이 교량 구간을 수리하는 동안 트럭을 빼앗으려 한다.
188|запирает теплицу при эвакуации, если протокол не изменён.|cierra el invernadero durante la evacuación salvo que se cambie su protocolo.|手順を変更しなければ避難中に温室を閉鎖する。|若不修改规程，就在疏散时锁温室。|규약을 수정하지 않으면 대피 중 온실을 잠근다.
191|машина-сборщик принимает обратную линию за утиль.|una máquina recolectora confunde la línea de retorno con chatarra.|回収機が帰還線を廃材と間違える。|回收机器把回路线路误认为废料。|수거 기계가 귀환선을 폐품으로 착각한다.
194|соблюдает дальнюю заявку, не признавая застрявший лагерь.|impone la oferta distante sin reconocer el campamento varado.|取り残された野営地を認めず遠方の入札を執行する。|执行远方投标而不承认被困营地。|고립된 야영지를 인정하지 않고 먼 입찰을 강제한다.
197|уничтожает опытные грядки, называя это проверкой безопасности.|destruye bancales de ensayo llamándolo inspección de seguridad.|試験苗床を破壊し、安全検査と呼ぶ。|摧毁试验苗床，却称其为安全检查。|시험 모판을 파괴하면서 안전 검사라고 부른다.
200|угрожает жителям, признающим обход сломанных счётчиков.|amenaza a residentes que admiten evitar medidores rotos.|壊れた計器を迂回したと認める住民を脅す。|威胁承认绕过故障计量器的居民。|고장난 계량기를 우회했다고 인정한 주민을 위협한다.
203|разрозненные дорожные машины реагируют на вибрацию моста и могут быть выключены.|máquinas de carretera sueltas reaccionan a vibraciones del puente y pueden apagarse.|散らばる道路機械は橋の振動に反応し、電源を切れる。|散落道路机器回应桥梁振动，可以断电。|흩어진 도로 기계들이 다리 진동에 반응하며 전원을 끌 수 있다.
206|крадёт жизнеспособные образцы ради монополии, а не немедленного голода.|roba muestras viables por monopolio, no por hambre inmediata.|目先の飢えでなく独占のため生存標本を盗む。|盗取可存活样本为垄断，而非眼前饥饿。|당장의 굶주림이 아니라 독점을 위해 살아 있는 표본을 훔친다.
209|приказывает эвакуировать Дальний очаг, не обеспечив другого приюта.|ordena evacuar Hogar Lejano sin organizar otro refugio.|別の避難場所を用意せず遠き炉辺の避難を命じる。|命令疏散远炉却未安排其他庇护所。|다른 쉼터를 마련하지 않고 먼 화덕 대피를 명령한다.
212|перекрывает общую дорогу до начала слушания о запасах.|bloquea el camino público antes de la audiencia de reservas.|備蓄審理の前に公道を封鎖する。|储备听证开始前封锁公共道路。|비축 심리 전에 공공 도로를 막는다.
215|уничтожает доказательства общих прав на посев.|destruye pruebas de derechos de siembra compartidos.|播種権が共有された証拠を壊す。|毁掉种植权曾共享的证据。|파종 권리가 공유되었다는 증거를 파괴한다.
218|старый процесс управления отдаёт приоритет мёртвому промышленному району.|un proceso antiguo prioriza un distrito industrial muerto.|古い制御処理が死んだ工業地区を優先する。|旧控制流程优先供应废弃工业区。|옛 제어 과정이 죽은 산업 지구를 우선한다.
221|записывает заявки покупателей и неоплаченные аварийные нужды лагеря.|registra ofertas de compradores y necesidades de emergencia impagas del campamento.|買い手の入札と野営地の未払い緊急需要を記す。|记录买家投标与营地未付款应急需求。|구매자 입찰과 야영지의 미지급 비상 수요를 기록한다.
224|докажет наружную жизнеспособность при проверке без перекрёстного загрязнения.|puede probar viabilidad exterior si se analiza sin contaminación cruzada.|交差汚染なしの検査で露地の生存性を証明できる。|无交叉污染地检测可证明室外存活能力。|교차 오염 없이 검사하면 야외 생존력을 증명할 수 있다.
227|называет семьи, пропущенные счётчиками совета.|nombra hogares omitidos por medidores de la asamblea.|協議会の計器が除外した世帯を記す。|列出议会计量器遗漏的住户。|의회 계량기에서 빠진 가정들을 적는다.
230|поддержит грузовик лишь после ухода путников со слабого пролёта.|soporta el camión solo después de que viajeros salgan del tramo débil.|旅人が弱い橋桁を離れた後にのみトラックを支える。|旅人离开脆弱桥段后才能支撑卡车。|여행자들이 약한 교량 구간을 떠나야 트럭을 지탱한다.
233|сохраняет чистоту теплицы при открытых эвакуационных вратах.|mantiene limpio el invernadero con la puerta de evacuación abierta.|避難門が開いても温室を清潔に保つ。|疏散门打开时仍保持温室洁净。|대피 관문이 열려 있어도 온실을 깨끗하게 유지한다.
236|перекрывает незаконное тепло склада, не останавливая главный котёл.|cierra calor no autorizado del almacén sin parar la caldera principal.|主ボイラーを止めず無許可の倉庫暖房を閉じる。|关闭未经授权的仓库供热，而不停止主锅炉。|주 보일러를 멈추지 않고 무허가 창고 열을 끈다.
239|защищают пешую переправу, но не хватят всему конвою.|protegen el paso peatonal, pero no cubren todo el convoy.|徒歩の渡りを守るが全護送隊には足りない。|保护步行渡行者，但无法覆盖整个车队。|도보 통로를 보호하지만 호송대 전체에는 부족하다.
242|даёт чужакам законное право на семенное наследство.|da a forasteros derecho legal a la herencia de semillas.|外部の人に種の相続への法的権利を与える。|赋予外来人种子继承的合法权利。|외부인에게 씨앗 유산의 법적 권리를 준다.
245|согреет Дальний очаг, если путь будет починен.|puede calentar Hogar Lejano si se repara su ruta.|経路を直せば遠き炉辺を暖められる。|路线修复后可温暖远炉。|경로를 수리하면 먼 화덕을 따뜻하게 할 수 있다.
248|связывает посредника баррикады с украденным деревом общины.|vincula al corredor de la barricada con madera comunitaria robada.|封鎖の仲買人を盗まれた共同体の木材に結びつける。|将路障中间人与被盗社区木材联系起来。|바리케이드 중개인과 도난 공동체 목재를 연결한다.
251|показывает, какие участки оставались чистыми до заморозки протокола.|muestra parcelas que siguieron limpias antes de congelar el protocolo.|手順が凍結される前に清潔だった畑を示す。|显示规程冻结前哪些地块保持洁净。|규약이 동결되기 전 깨끗했던 밭을 보여 준다.
254|питает один цикл диагностики или одну ночь аварийного приюта.|alimenta un ciclo diagnóstico o una noche de refugio de emergencia.|一回の診断周期か一晩の緊急避難所を動かす。|供电一次诊断循环或一晚应急庇护。|진단 주기 한 번 또는 비상 쉼터 하룻밤을 가동한다.
257|отсрочит требование покупателя, если караван засвидетельствует.|difiere el reclamo del comprador ante testigos de la caravana.|隊商が立ち会えば買い手の要求を延期する。|商队见证后可推迟买家主张。|대상단이 증언하면 구매자 요구를 연기한다.
260|сохранит малый штамм даже при пожаре теплицы.|preserva una cepa pequeña aunque arda el invernadero.|温室が燃えても少量の株を保つ。|即使温室烧毁也保存少量品系。|온실이 불타도 작은 균주를 보존한다.
263|внесёт жителей Дальнего очага в реестр теплового совета.|puede incluir residentes del Hogar Lejano en la lista de la asamblea.|遠き炉辺の住民を熱協議会の名簿に加えられる。|可将远炉居民加入供热议会名单。|먼 화덕 주민을 열 의회 명부에 넣을 수 있다.
266|позволяет грузовику проехать, не привлекая пыльного преследователя.|permite cruzar al camión sin atraer al acechador del polvo.|砂塵の追跡者を呼ばずトラックが渡れる。|让卡车不引来尘埃潜行者而渡行。|먼지 추적자를 끌어들이지 않고 트럭이 건너게 한다.
269|отделяет полезные семена от налёта фильтра.|separa semillas útiles de la proliferación del filtro.|有用な種をフィルターの繁殖物から分ける。|将有用种子与过滤器菌落分开。|유용한 씨앗과 필터 증식체를 분리한다.
272|доказывает, что тёплый склад забирает жилой паёк.|prueba que el almacén cálido consume una ración residencial.|暖かい倉庫が住宅の配給を奪っている証拠になる。|证明温暖仓库占用住宅配给。|따뜻한 창고가 주택 배급을 가져간다는 것을 증명한다.
275|отмечает места транспорта и безопасные приюты ожидания.|marca plazas de transporte y refugios seguros de espera.|輸送の席と安全な待機場所を示す。|标记交通席位与安全等候庇护所。|수송 자리와 안전한 대기 쉼터를 표시한다.
278|устанавливает совместный посев с подотчётностью урожая.|establece siembra compartida con rendición de cuentas de cosechas.|収穫の説明責任を伴う共同播種を定める。|建立共享种植与收成问责制。|수확 책임을 수반하는 공동 파종을 확립한다.
281|заменяет приоритеты мёртвой промышленности графиком при свидетелях.|anula prioridades industriales muertas con un horario ante testigos.|死んだ工業の優先を立会い付きの計画で上書きする。|用有见证的日程覆盖废弃工业优先级。|죽은 산업 우선순위를 증인이 있는 일정으로 덮어쓴다.
284|обеспечит признание посредника ценой смягчённого наказания.|puede lograr la confesión del corredor a cambio de menor condena.|軽い刑と交換で仲買人の告白を得られる。|可以减刑换取中间人坦白。|가벼운 형을 대가로 중개인의 자백을 얻을 수 있다.
287|кормит людей сейчас, уменьшая запас семян следующего сезона.|alimenta ahora reduciendo la reserva de semillas de la próxima temporada.|次の季節の種備蓄を減らして今人々を養う。|减少下一季种子储备，满足当前食物需求。|다음 계절 씨앗 비축을 줄여 지금 사람들을 먹인다.
290|записывает итоговый график и ремонтные обязанности обоих поселений.|registra horario final y deberes de reparación de ambos asentamientos.|両集落の最終計画と修理義務を記す。|记录两个聚落的最终日程与维修义务。|두 정착지의 최종 일정과 수리 의무를 기록한다.''')
clauses_add('''293|пылевой фронт надвигается до подсчёта последних бочек воды.|el frente de polvo avanza antes de contar los últimos barriles de agua.|最後の水樽を数える前に砂塵前線が進む。|最后水桶清点前尘暴锋已逼近。|마지막 물통을 세기 전에 먼지 전선이 다가온다.
296|здоровому путнику отказывают во входе, пока комнате семян нужны работники.|se niega entrada a un viajero sano mientras la sala de semillas pide mano de obra.|種の部屋が労働を求める一方、健康な旅人は入れない。|种子室需要劳力，却拒绝健康旅人进入。|씨앗 방이 노동을 요구하는데 건강한 여행자의 입장은 거부된다.
299|имён Дальнего очага нет в списке потребностей совета.|los nombres del Hogar Lejano no figuran en la lista de demanda.|遠き炉辺の名は協議会の需要名簿にない。|远炉居民的名字不在议会需求名单上。|먼 화덕 이름들이 의회 수요 명단에 없다.
302|сломанное радио просит конвой о местах рядом с дамбой.|una radio averiada pide al convoy plazas junto a la calzada.|壊れた無線が土手道のそばで護送隊に空きを求める。|坏掉的无线电请求车队在堤道旁提供席位。|고장난 무전기가 둑길 옆에서 호송대에 자리를 요청한다.
305|очиститель объявляет все наружные образцы заражёнными.|el purgador declara contaminadas todas las muestras exteriores.|粛清機は全ての露地標本が汚染されたと宣言する。|净化者宣称所有室外样本都受污染。|정화자가 모든 야외 표본이 오염되었다고 선언한다.
308|незаконный выход светится, пока дома замерзают.|una salida no autorizada brilla mientras los hogares se congelan.|家が凍える中、無許可の出口が光る。|房屋冰冷时，未经授权的出口发光。|집들이 얼어붙는 동안 무허가 출구가 빛난다.
311|покупатель предлагает запчасти в обмен на исключительные права на бочки.|un comprador ofrece piezas a cambio de barriles exclusivos.|買い手は樽の独占と交換で修理部品を提供する。|买家以独占桶为条件提供维修零件。|구매자가 통의 독점권을 대가로 수리 부품을 제안한다.
314|наружная грядка даёт доказательство, которое хранилищу трудно отвергнуть.|un bancal exterior aporta pruebas difíciles de descartar para la bóveda.|露地の苗床が保管庫の否定しがたい証拠を生む。|室外苗床提供种库难以否认的证据。|야외 모판이 종자고가 쉽게 부정할 수 없는 증거를 낸다.
317|шериф забирает единственный диагностический элемент из незарегистрированного дома.|un sheriff toma la única celda diagnóstica de un hogar no registrado.|保安官が未登録の家から唯一の診断電池を奪う。|警长拿走未登记住宅唯一的诊断电池。|보안관이 등록되지 않은 집에서 유일한 진단 전지를 가져간다.
320|переправа тяжёлого грузовика угрожает застрявшим путникам.|el cruce del camión pesado amenaza a viajeros varados.|大型トラックの横断が取り残された旅人を脅かす。|重型卡车渡行危及被困旅人。|대형 트럭의 통행이 고립된 여행자를 위협한다.
323|архив раскрывает, что хранилище задумывали для окружающих общин.|el archivo revela que la bóveda debía servir a comunidades cercanas.|文書庫は保管庫が周辺共同体に奉仕するためだったと示す。|档案揭示种库原本用于服务周边社区。|기록은 종자고가 주변 공동체를 위해 만들어졌음을 드러낸다.
326|сеть направляет ещё один цикл тепла в пустой завод.|la red envía otro ciclo de calor a una fábrica vacía.|送電網は無人の工場にもう一周期の熱を送る。|电网再向空工厂发送一轮热量。|전력망이 빈 공장으로 또 한 번의 열 주기를 보낸다.
329|Аукционная миля берёт плату за проход после ремонта дороги трудом общины.|Milla de Subastas cobra paso tras reparar el camino con trabajo comunitario.|共同体が道を直した後、競売街道が通行料を取る。|社区劳动修路后，拍卖大道收取通行费。|공동체 노동으로 길을 수리한 뒤 경매 거리가 통행료를 받는다.
332|открытие врат грозит живому урожаю, если не установлен разделитель.|abrir ahora arriesga el cultivo viable salvo que se instale un separador.|分離器を付けなければ今門を開けると生きた作物が危険になる。|若不装分隔器，立即开门会危及可存活作物。|분리기를 달지 않고 지금 관문을 열면 살아 있는 작물이 위험하다.
335|жители просят общее тепло вместо принудительной эвакуации.|los residentes piden compartir calor en vez de aceptar evacuación forzada.|住民は強制避難でなく熱の共有を求める。|居民要求共享供热，而非接受强制疏散。|주민들이 강제 대피 대신 열을 나누자고 요청한다.
338|пешую переправу придётся проводить малыми группами.|el paso peatonal debe hacerse en grupos menores.|徒歩の横断は小グループに分ける必要がある。|步行渡行须分小组进行。|도보 통행을 더 작은 무리로 나누어야 한다.
341|наследники семян требуют голос в изменении соглашения о посеве.|los herederos exigen voz en cambios del acuerdo de siembra.|種の相続人は播種契約の変更に発言権を求める。|种子继承人要求参与种植协议任何变更。|씨앗 후계자들이 파종 협약 변경에 발언권을 요구한다.
344|совет предлагает элементы питания лишь при сохранении домов вне списка.|la asamblea ofrece celdas solo si los hogares omitidos siguen fuera de la lista.|協議会は除外された家を名簿に加えなければ電池を出す。|议会只在遗漏住宅继续不入名单的条件下提供电池。|의회가 누락된 집들을 명부 밖에 두어야 전지를 주겠다고 한다.
347|Тесс прибывает на склад до слушания о запасах.|Tess llega al depósito antes de la audiencia de reservas.|備蓄審理の前にテスが倉庫に着く。|泰丝在储备听证前抵达仓库。|테스가 비축 심리 전에 창고에 도착한다.
350|страж культур назначает сожжение до независимой проверки.|el guardián programa una quema antes del análisis independiente.|培養物管理者が独立検査の前に焼却を予定する。|培养物守卫把焚烧安排在独立检测前。|배양체 감시자가 독립 검사 전에 소각을 예약한다.
353|последняя обратная линия отказывает при нагревании главного котла.|la última línea de retorno falla al calentarse la caldera principal.|主ボイラーが暖まると最後の帰還線が壊れる。|主锅炉升温时最后回路线路失效。|주 보일러가 따뜻해지면 마지막 귀환선이 고장난다.
356|путники решают, кому нужнее первые места в транспорте.|los viajeros deciden quién necesita primeras plazas de transporte.|旅人は最初の輸送席を誰が必要とするか決める。|旅人决定谁最需要首批交通席位。|여행자들이 누가 첫 수송 자리를 필요로 하는지 결정한다.
359|чистый образец может отменить протокол при публичном свидетеле.|una muestra limpia puede anular el protocolo ante testigo público.|清潔な標本は公の立会いで手順を覆せる。|洁净样本可在公开见证下推翻规程。|깨끗한 표본이 공개 증인 아래 규약을 뒤집을 수 있다.
362|рабочий признаёт, что складскую линию установили при прошлых морозах.|un trabajador admite que la línea del almacén se instaló durante una helada anterior.|作業員が前の凍結時に倉庫線を付けたと認める。|工人承认仓库线路在上一次严寒时安装。|노동자가 지난 한파 때 창고선을 설치했음을 인정한다.
365|тихий путь грузовика открывается ценой оставленного груза.|se abre una ruta silenciosa al precio de dejar una carga.|荷物を残す代償で静かなトラックの道が使える。|留下一批货物才能使用卡车静音路线。|짐 하나를 남기는 대가로 조용한 트럭 경로가 열린다.
368|команда выбирает между едой сейчас и запасом следующего сезона.|el equipo elige entre comidas inmediatas y reservas de la próxima temporada.|乗員は今の食事と次の季節の備蓄を選ぶ。|团队在眼前饭食与下一季储备间选择。|일행이 당장의 식사와 다음 계절 비축 중 선택한다.
371|диспетчер предлагает один ручной цикл при подписи обоих поселений.|la despachadora ofrece un ciclo manual si firman ambos asentamientos.|両集落が署名すれば指令員が一回の手動周期を出す。|两个聚落签署后，调度员提供一次手动循环。|두 정착지가 서명하면 배차원이 수동 주기 한 번을 제공한다.
374|решение конвоя о запасах меняет право пользования дамбой.|la decisión de reservas cambia quién puede usar la calzada.|護送隊の備蓄決定が土手道を使う者を変える。|车队的储备决定改变谁可使用堤道。|호송대의 비축 결정이 누가 둑길을 쓸 수 있는지 바꾼다.
377|окончательная хартия определяет, кто может сеять и кто обязан сообщать о неудачах.|la carta final define quién siembra y quién informa de fallos.|最終憲章は播種できる者と失敗を報告する者を定める。|最终宪章规定谁可以种植，谁必须报告失败。|최종 헌장이 누가 심고 누가 실패를 보고해야 하는지 정한다.
380|график отражает решение команды о пропущенных семьях.|el horario refleja la decisión sobre hogares omitidos.|計画は除外された世帯に関する乗員の決定を反映する。|日程反映团队对遗漏住户的决定。|일정이 누락된 가정에 대한 일행의 결정을 반영한다.''')
clauses_add('''383|Цель: установить аварийные запасы. Проверьте заявки или договоритесь об отсрочке доставки; промедление оставляет лагерь в изоляции.|Objetivo: establecer reservas de emergencia. Audita ofertas o negocia entrega diferida; la demora deja varado el campamento.|目的：緊急備蓄を確立する。入札を監査するか配送延期を交渉する。遅れると野営地が孤立する。|目标：建立应急储备。审计投标或协商延期交付；拖延会让营地受困。|목표: 비상 비축을 마련한다. 입찰을 감사하거나 배달 연기를 협상하라. 지체하면 야영지가 고립된다.
386|Цель: найти безопасный вход в хранилище. Докажите здоровье или замените фильтр врат; промедление начинает очистку.|Objetivo: entrar con seguridad. Prueba salud limpia o cambia el filtro de la puerta; la demora inicia una purga.|目的：保管庫へ安全に入る。健康を証明するか門のフィルターを替える。遅れると粛清が始まる。|目标：安全进入种库。证明健康或更换大门过滤器；拖延会启动净化。|목표: 종자고로 안전하게 들어간다. 건강을 입증하거나 관문 필터를 교체하라. 지체하면 정화가 시작된다.
389|Цель: выявить неучтённые нужды. Составьте карту Дальнего очага или найдите скрытый реестр; промедление ведёт к принудительной эвакуации.|Objetivo: identificar demanda omitida. Cartografía Hogar Lejano o recupera el libro oculto; la demora trae evacuación forzada.|目的：未計上の需要を見つける。遠き炉辺の地図を作るか隠れた台帳を取る。遅れると強制避難となる。|目标：找出未计入需求。绘制远炉地图或收回隐藏账簿；拖延会导致强制疏散。|목표: 집계되지 않은 수요를 찾는다. 먼 화덕을 지도에 표시하거나 숨긴 장부를 되찾아라. 지체하면 강제 대피가 온다.
392|Цель: переправиться без потерь путников. Усильте балку или организуйте пеший путь поэтапно; промедление приближает пылевой фронт.|Objetivo: cruzar sin perder viajeros. Refuerza la viga o organiza el paso a pie; la demora acerca el frente de polvo.|目的：旅人を失わず渡る。梁を補強するか徒歩路を段階的に渡る。遅れると砂塵前線が迫る。|目标：不损失旅人地渡行。加固桥梁或分阶段步行；拖延会迎来尘暴锋。|목표: 여행자를 잃지 않고 건넌다. 보를 보강하거나 도보 경로를 단계적으로 이용하라. 지체하면 먼지 전선이 다가온다.
395|Цель: отделить семена от загрязнения. Установите разделитель культур или проверьте наружные ростки; промедление сжигает комнату.|Objetivo: separar semillas de contaminación. Instala un separador o analiza brotes exteriores; la demora quema la sala.|目的：種と汚染を分ける。分離器を付けるか露地の芽を検査する。遅れると部屋が焼かれる。|目标：将种子与污染分离。装培养物分隔器或检测室外幼苗；拖延会烧毁房间。|목표: 씨앗을 오염에서 분리한다. 배양체 분리기를 달거나 야외 싹을 검사하라. 지체하면 방이 불탄다.
398|Цель: остановить незаконное отведение. Закройте обход или добейтесь публичной проверки; промедление истощает ремонтные элементы.|Objetivo: detener el desvío no autorizado. Cierra el derivador o consigue inspección pública; la demora agota celdas de reparación.|目的：無許可の転用を止める。迂回弁を閉じるか公開検査を得る。遅れると修理電池が尽きる。|目标：停止未经授权的分流。关闭旁路或促成公开检查；拖延会耗尽维修电池。|목표: 무허가 전용을 멈춘다. 우회로를 닫거나 공개 검사를 확보하라. 지체하면 수리 전지가 고갈된다.
400|Цель: открыть общий проход. Разоблачите кражу дерева или договоритесь о возмещении; промедление ведёт к захвату грузовика.|Objetivo: reabrir paso público. Revela madera robada o negocia restitución; la demora incauta el camión.|目的：公の通路を再開する。盗んだ木材を暴くか返還を交渉する。遅れるとトラックが押収される。|目标：重开公共通道。揭露木材盗窃或谈判赔偿；拖延会令卡车被夺。|목표: 공공 통행을 다시 연다. 목재 도난을 밝히거나 배상을 협상하라. 지체하면 트럭을 빼앗긴다.
403|Цель: установить права посева. Найдите общую хартию или соберите наследников семян; промедление стирает архив.|Objetivo: establecer derechos de siembra. Recupera la carta conjunta o reúne herederos de semillas; la demora borra el archivo.|目的：播種権を確立する。共同憲章を取り戻すか種の相続人を集める。遅れると文書庫が消える。|目标：确立种植权。收回联合宪章或召集种子继承人；拖延会抹除档案。|목표: 파종 권리를 확립한다. 공동 헌장을 되찾거나 씨앗 후계자를 모아라. 지체하면 기록이 지워진다.
406|Цель: изменить приоритеты сети. Используйте ручной ключ или докажите устаревшую потребность; промедление отключает линию Дальнего очага.|Objetivo: cambiar prioridades de red. Usa la llave manual o prueba demanda obsoleta; la demora cierra la línea del Hogar Lejano.|目的：送電網の優先を変える。手動キーを使うか古い需要を証明する。遅れると遠き炉辺の線が切れる。|目标：改变电网优先级。使用手动钥匙或证明需求过时；拖延会切断远炉线路。|목표: 전력망 우선순위를 바꾼다. 수동 열쇠를 쓰거나 낡은 수요를 입증하라. 지체하면 먼 화덕 선이 끊긴다.
409|Цель: эвакуировать уязвимых путников. Поделитесь местом грузовика или привлеките второй транспорт; промедление закрывает пешую переправу.|Objetivo: evacuar viajeros vulnerables. Comparte espacio del camión o consigue otro transporte; la demora cierra el paso a pie.|目的：弱い旅人を避難させる。トラックの席を分けるか別の運搬車を得る。遅れると徒歩の渡りが閉じる。|目标：疏散脆弱旅人。分享卡车空间或招募第二辆运输车；拖延会关闭步行通道。|목표: 취약한 여행자를 대피시킨다. 트럭 공간을 나누거나 두 번째 운송차를 구하라. 지체하면 도보 통로가 닫힌다.
412|Цель: предотвратить ненужное сожжение. Подтвердите образец или изолируйте машину; промедление уничтожает жизнеспособный штамм.|Objetivo: evitar quema innecesaria. Certifica una muestra o aísla la máquina; la demora destruye la cepa viable.|目的：不要な焼却を防ぐ。標本を認証するか機械を隔離する。遅れると生きた株が消える。|目标：阻止无必要焚烧。认证样本或隔离机器；拖延会毁掉可存活品系。|목표: 불필요한 소각을 막는다. 표본을 인증하거나 기계를 격리하라. 지체하면 살아 있는 균주가 사라진다.
415|Цель: починить обратный кабель. Сопроводите элементы питания или откройте служебный туннель; промедление истощает приют.|Objetivo: reparar el cable de retorno. Escolta celdas o abre el túnel de servicio; la demora agota el refugio.|目的：帰還ケーブルを直す。電池を護送するか整備トンネルを開く。遅れると避難所が尽きる。|目标：修复回路电缆。护送电池或打开维护隧道；拖延会耗尽庇护所。|목표: 귀환 케이블을 수리한다. 전지를 호송하거나 정비 터널을 열어라. 지체하면 쉼터가 고갈된다.
418|Цель: урегулировать притязания конвоя. Представьте заявки и нужды или засвидетельствуйте отсрочку доставки; промедление продаёт оставшиеся бочки.|Objetivo: acordar el reclamo del convoy. Presenta ofertas y necesidades o atestigua entrega diferida; la demora vende los barriles restantes.|目的：護送隊の主張を合意する。入札と需要を提示するか配送延期に立ち会う。遅れると残る樽が売られる。|目标：议定车队主张。呈交投标与需求或见证延期交付；拖延会卖掉剩余桶。|목표: 호송대의 요구를 합의한다. 입찰과 필요를 제시하거나 배달 연기를 증언하라. 지체하면 남은 통이 팔린다.
421|Цель: определить безопасную политику посева. Создайте наблюдаемые грядки или раздайте коробки наследников; промедление вызывает голодный бунт.|Objetivo: fijar una política segura de siembra. Establece bancales vigilados o distribuye cajas de herederos; la demora provoca motín por comida.|目的：安全な播種方針を定める。監視付き苗床を作るか相続人の箱を配る。遅れると食糧暴動になる。|目标：制定安全种植政策。建立监测苗床或分发继承人种子盒；拖延会引发食物暴动。|목표: 안전한 파종 정책을 정한다. 감시되는 모판을 만들거나 후계자의 상자를 나누어라. 지체하면 식량 폭동이 일어난다.
424|Цель: перезапустить справедливое тепло. Назначьте общие циклы или создайте совместную ремонтную команду; промедление замораживает управляющие клапаны.|Objetivo: reiniciar calor justo. Programa ciclos compartidos o forma reparadores conjuntos; la demora congela válvulas de control.|目的：公平な熱を再開する。共有周期を組むか共同修理班を作る。遅れると制御弁が凍る。|目标：重启公平供热。安排共享循环或组成联合维修队；拖延会冻住控制阀。|목표: 공정한 열을 다시 가동한다. 공동 주기를 짜거나 공동 수리조를 구성하라. 지체하면 제어 밸브가 언다.
427|Цель: выбрать управление проходом. Создайте дорожную взаимопомощь или ограниченную пошлинную хартию; запишите, кто оплачивает ремонт.|Objetivo: elegir gobierno del paso. Crea una mutua del camino o una carta de peajes limitada; anota quién financia reparaciones.|目的：通行の運営を選ぶ。街道相互組合か限定の通行税憲章を作り、修理費の負担者を記録する。|目标：选择通行治理。建立道路互助会或有限收费宪章；记录谁资助修缮。|목표: 통행 관리를 선택한다. 도로 상조회나 제한된 통행료 헌장을 만들고 수리비 부담자를 기록하라.
430|Цель: справедливо разделить еду и семена. Оплатите немедленные пайки или защитите запас при свидетелях; запишите, кто может сеять.|Objetivo: dividir comida y semillas justamente. Financia raciones inmediatas o protege una reserva ante testigos; anota quién siembra.|目的：食事と種を公平に分ける。即時配給に資金を出すか立会い付き備蓄を守り、播種できる者を記録する。|目标：公平分配食物和种子。资助即时配给或保护有见证的储备；记录谁可种植。|목표: 식량과 씨앗을 공정하게 나눈다. 즉시 배급을 지원하거나 증인이 있는 비축을 지키고 누가 심을지 기록하라.
433|Цель: урегулировать тепловое соглашение. Разделите нехватку или гарантируйте минимальный паёк; запишите, кто представляет пропущенные дома.|Objetivo: acordar el convenio térmico. Comparte escasez o garantiza una ración mínima; anota quién representa hogares omitidos.|目的：熱の盟約を合意する。不足を分担するか最低配給を保証し、除外された家の代表を記録する。|目标：议定供热契约。分担短缺或保证最低配给；记录谁代表遗漏住宅。|목표: 열 협약을 합의한다. 부족을 나누거나 최소 배급을 보장하고 누가 누락된 집들을 대표하는지 기록하라.''')
clauses_add('''436|следит за запасами и защищает путников, чьи нужды не оплачены.|rastrea reservas y protege a viajeros con necesidades impagas.|備蓄を追跡し、需要の支払いがない旅人を守る。|追踪储备，保护需求未付款的旅人。|비축을 추적하고 필요가 지불되지 않은 여행자를 보호한다.
439|разделяет жизнеспособные культуры и отвергает ненужную очистку.|separa cultivos viables y rechaza purgas innecesarias.|生存する培養物を分け、不要な粛清を拒む。|分离可存活培养物，拒绝无必要净化。|살아 있는 배양체를 분리하고 불필요한 정화를 거부한다.
442|чинит управление и составляет карту неучтённых нужд семей.|repara controles y cartografía demanda doméstica omitida.|制御を直し、未計上の世帯需要を地図にする。|修复控制装置，绘制未计入住户需求图。|제어 장치를 수리하고 집계되지 않은 가정 수요를 지도에 표시한다.
445|организует эвакуацию и лечит воздействие пыли.|organiza evacuaciones y trata exposición al polvo.|避難を段階的に進め、砂塵の被害を治療する。|组织疏散并治疗粉尘暴露。|대피를 단계적으로 진행하고 먼지 노출을 치료한다.
448|проверяет наружные урожаи и честно записывает неудачи.|prueba cultivos exteriores y registra fallos honestamente.|露地作物を試し、失敗を正直に記す。|测试室外作物，诚实记录失败。|야외 작물을 시험하고 실패를 정직하게 기록한다.
451|носит элементы питания и договаривается о приюте за хребтом.|lleva celdas y negocia refugio por la cresta.|電池を運び、尾根を越えた避難場所を交渉する。|运送电池并协商山脊彼侧庇护。|전지를 운반하고 능선 너머 쉼터를 협상한다.
454|отсрочит договоры, не скрывая аварийную нехватку.|puede diferir contratos sin ocultar escasez de emergencia.|緊急の不足を隠さず契約を延期できる。|可延期契约而不隐瞒应急短缺。|비상 부족을 숨기지 않고 계약을 연기할 수 있다.
457|сохраняет унаследованные права и привлекает названные общины.|preserva derechos heredados e involucra comunidades nombradas.|継承権を守り、記された共同体を参加させる。|保护继承权并让被指名社区参与。|물려받은 권리를 보존하고 명시된 공동체를 참여시킨다.
460|заслужите доверие, защищая аварийные припасы честным учётом; получите власть конвоя и обязанности доставки.|gana confianza protegiendo suministros de emergencia con cuentas honestas; obtén autoridad del convoy y deberes de entrega.|正直な会計で緊急物資を守り信頼を得る。護送隊の権限と配送義務を得る。|诚实核算、保护应急物资以赢得信任；获得车队权威与交付义务。|정직한 회계로 비상 보급을 지켜 신뢰를 얻고 호송대 권한과 배달 의무를 얻어라.
463|заслужите доверие, сохраняя урожай и общие права посева; получите доступ к хранилищу и обязанности проверки.|gana confianza preservando cultivos y derechos compartidos de siembra; obtén acceso a la bóveda y deberes de análisis.|作物と共有播種権を保ち信頼を得る。保管庫への接近権と検査義務を得る。|保护作物与共享种植权以赢得信任；获得种库访问权与检测义务。|작물과 공동 파종 권리를 지켜 신뢰를 얻고 종자고 접근권과 검사 의무를 얻어라.
466|заслужите доверие, включая пропущенные дома в решения о пайках; получите доступ к управлению и обязанности публичного графика.|gana confianza incluyendo hogares omitidos en decisiones de raciones; obtén acceso al control y deberes de horario público.|配給決定に除外の家を含め信頼を得る。制御への接近権と公開計画の義務を得る。|将遗漏住宅纳入配给决策以赢得信任；获得控制权限与公开日程责任。|누락된 집을 배급 결정에 포함해 신뢰를 얻고 제어 접근권과 공개 일정 의무를 얻어라.
469|заслужите доверие, эвакуируя путников до перевозки грузов; получите мостовые команды и ответственность ремонта.|gana confianza evacuando viajeros antes de mover carga; obtén equipos de puente y responsabilidades de reparación.|貨物より先に旅人を避難させ信頼を得る。橋の班と修理責任を得る。|先疏散旅人后运货以赢得信任；获得修桥队伍与维修责任。|화물보다 여행자를 먼저 대피시켜 신뢰를 얻고 다리 작업반과 수리 책임을 얻어라.
472|заслужите доверие, делясь чистыми доказательствами испытаний; получите поддержку садоводов и обязанности отчёта о загрязнении.|gana confianza compartiendo pruebas de ensayos limpios; obtén apoyo de cultivadores y deberes de informar contaminación.|清潔な試験証拠を共有し信頼を得る。栽培者の支援と汚染報告の義務を得る。|分享洁净试验证据以赢得信任；获得种植者支持与污染报告责任。|깨끗한 시험 증거를 나누어 신뢰를 얻고 재배자 지원과 오염 보고 의무를 얻어라.
475|заслужите доверие, снабжая спасательный путь; получите поддержку курьеров и обязанности приюта.|gana confianza abasteciendo una ruta de rescate; obtén apoyo de mensajeros y obligaciones de refugio.|救助路を補給し信頼を得る。運び手の支援と避難所の義務を得る。|维持救援路线供应以赢得信任；获得信使支持与庇护义务。|구조 경로를 보급해 신뢰를 얻고 배달원 지원과 쉼터 의무를 얻어라.
478|охристые линии фронта и синие метки запасов отличают безопасные переправы от платных барьеров.|líneas ocre del frente y marcas azules de reservas distinguen cruces seguros de barreras pagadas.|黄土の前線と青の備蓄印で安全な横断と有料障壁を区別する。|赭色锋线与蓝色储备标记区分安全渡行和付费障碍。|황토색 전선과 파란 비축 표시가 안전한 통행과 유료 장벽을 구분한다.
482|зелёные чистые грядки и красные полосы изоляции отмечают живые семена и сомнительные культуры.|bancales verdes limpios y franjas rojas de aislamiento marcan semillas viables y cultivos inciertos.|緑の清潔な苗床と赤の隔離帯で生存する種と不確かな培養物を示す。|绿色洁净苗床与红色隔离带标记可存活种子与不确定培养物。|초록색 깨끗한 모판과 빨간 격리 띠가 살아 있는 씨앗과 불확실한 배양체를 표시한다.
485|янтарные линии семей и серые мёртвые районы отличают общее тепло от устаревшей потребности.|líneas ámbar de hogares y distritos muertos grises distinguen calor compartido de demanda obsoleta.|琥珀色の世帯線と灰色の死んだ地区で共有の熱と古い需要を区別する。|琥珀色住户线路与灰色废弃区域区分共享供热和过时需求。|호박색 가정선과 회색 죽은 지구가 공동 열과 낡은 수요를 구분한다.''')
for l in langs:
 shared=json.load(open(Path(__file__).parent.parent/'dark-fantasy'/(l+'.json')))
 for k in src:
  if k in shared and k not in maps[l]:maps[l][k]=shared[k]
art={'map schematic':'схема карты|esquema de mapa|地図の模式図|地图示意图|지도 도식','location schematic':'схема локации|esquema de ubicación|場所の模式図|地点示意图|장소 도식','portrait schematic':'схема портрета|esquema de retrato|肖像の模式図|肖像示意图|초상 도식','creature schematic':'схема существа|esquema de criatura|生物の模式図|生物示意图|생물 도식','item schematic':'схема предмета|esquema de objeto|アイテムの模式図|物品示意图|아이템 도식','background schematic':'схема фона|esquema de fondo|背景の模式図|背景示意图|배경 도식'}
for k in src:
 if ': ' in k and k.rsplit(': ',1)[1] in art:
  n,a=k.rsplit(': ',1);add(k,'|'.join(maps[l][n]+': '+w for l,w in zip(langs,art[a].split('|'))))
first={0:'Постапокалипсис|Posapocalipsis|ポストアポカリプス|后末日|포스트 아포칼립스',1:'Общины возрождаются среди разрушенных дорог, скудных ресурсов, странных опасностей и наследия ушедшей эпохи.|Comunidades reconstruyen entre caminos arruinados, recursos escasos, peligros extraños y legados de una era perdida.|共同体は壊れた道、乏しい資源、奇妙な危険、失われた時代の遺産の中で再建する。|社区在破败道路、稀缺资源、奇异危险与失落时代遗产中重建。|공동체가 무너진 길, 부족한 자원, 이상한 위험, 잃어버린 시대의 유산 속에서 재건한다.',2:'путь|ruta|経路|路线|경로',3:'ремонт|reparación|修理|修缮|수리',4:'делиться|compartir|分ける|分享|나누기',5:'восстановить|reconstruir|再建|重建|재건',6:'Конвой Пыльной дороги|Convoy del Camino Polvoriento|砂塵街道の護送隊|尘路车队|먼지길 호송대',7:'Конвой припасов должен пересечь разрушенную дамбу до пылевого фронта. Спасите изолированных путников, договоритесь о проходе и решите, принадлежат запасы покупателям или общинам.|Un convoy debe cruzar una calzada rota antes del frente de polvo. Rescata viajeros aislados, negocia paso y decide si sus reservas pertenecen a compradores o comunidades.|補給護送隊は砂塵前線の前に崩れた土手道を渡らねばならない。孤立した旅人を救い、通行を交渉し、備蓄が買い手と共同体のどちらに属するか決める。|补给车队必须在尘暴锋前越过断裂堤道。救援孤立旅人，协商通行，决定储备属于买家还是社区。|보급 호송대가 먼지 전선 전에 부서진 둑길을 건너야 한다. 고립된 여행자를 구하고 통행을 협상하며 비축이 구매자와 공동체 중 누구 것인지 결정하라.',8:'Хранилище семян|Bóveda de Semillas|種の保管庫|种子库|종자고',9:'Запечатанная теплица предлагает урожай ценой старого протокола изоляции. Верните чистые семена, расследуйте загрязнение и решите, кто может сеять за стенами.|Un invernadero sellado ofrece cosechas al precio de un viejo protocolo de aislamiento. Recupera semillas limpias, investiga contaminación y decide quién siembra fuera de sus muros.|封じた温室は古い隔離手順を代償に収穫を提供する。清潔な種を回収し、汚染を調べ、誰が壁の外で植えられるか決める。|密封温室以旧隔离规程为代价提供收成。收回洁净种子，调查污染，决定谁能在墙外种植。|봉인된 온실이 옛 격리 규약을 대가로 수확을 제공한다. 깨끗한 씨앗을 되찾고 오염을 조사하며 누가 벽 밖에서 심을지 결정하라.',10:'Последняя сеть|Última Red|最後の送電網|最后电网|마지막 전력망',11:'Отказывающая электростанция может согреть одно поселение в грядущий мороз. Почините управление, раскройте неравные пайки и решите, как разделить оставшееся тепло.|Una central averiada puede calentar un asentamiento durante la próxima helada. Repara controles, revela racionamiento desigual y decide cómo compartir el calor restante.|故障する発電所は来る凍結で一つの集落を暖められる。制御を直し、不公平な配給を暴き、残る熱の分け方を決める。|故障电站能在即将到来的严寒中温暖一个聚落。修复控制装置，揭露不平等配给，决定如何分享剩余热量。|고장난 발전소가 다가올 한파 동안 정착지 하나를 따뜻하게 할 수 있다. 제어 장치를 수리하고 불공평한 배급을 밝히며 남은 열을 나눌 방법을 정하라.',12:'Обеспечьте безопасность уязвимых путников до перевозки припасов|Protege a viajeros vulnerables antes de mover suministros|物資を動かす前に弱い旅人を守る|运补给前先保护脆弱旅人|보급품을 옮기기 전에 취약한 여행자를 지켜라',13:'Проверьте семена и восстановите общую инфраструктуру|Analiza semillas y reconstruye infraestructura compartida|種を検査し共有基盤を再建する|检测种子，重建共享基础设施|씨앗을 검사하고 공동 기반 시설을 재건하라',14:'Договаривайтесь о запасах, не исключая семьи|Negocia reservas sin excluir hogares|世帯を排除せず備蓄を交渉する|协商储备，不排除住户|가정을 배제하지 않고 비축을 협상하라',15:'Запишите владение, нехватку и обязанности обслуживания|Anota propiedad, escasez y deberes de mantenimiento|所有、不足、保守義務を記録する|记录所有权、短缺与维护义务|소유권, 부족, 유지 의무를 기록하라',18:'Начните с запечатанных бочек и бури у разрушенной дамбы.|Comienza con barriles sellados y una tormenta acercándose a la calzada rota.|封じた樽と崩れた土手道へ迫る嵐から始める。|从封存桶与逼近断裂堤道的风暴开始。|봉인된 통과 부서진 둑길로 다가오는 폭풍으로 시작하라.',19:'До выбора сообщите пропускную способность, маски и места в транспорте.|Indica capacidad de cruce, mascarillas y plazas de transporte antes de pedir decisiones.|選択を求める前に通行能力、マスク、輸送席を示す。|要求选择前说明渡行能力、面罩与交通席位。|선택을 요청하기 전에 통행 수용력과 마스크, 수송 자리를 알려라.',20:'Дайте владельцам договоров собственные нужды и допустите отсрочку при свидетелях.|Da necesidades propias a titulares de contratos y permite demora ante testigos.|契約者にも自分の必要を持たせ、立会いの下で延期を認める。|给契约持有人自身需求，允许有见证的延期。|계약 소유자들에게 자기 필요를 주고 증인이 있는 지연을 허용하라.',21:'Запишите, кто владеет проходом, платит за ремонт и получает аварийные запасы.|Anota quién posee el paso, paga reparaciones y recibe reservas de emergencia.|通行の所有者、修理費負担者、緊急備蓄の受取人を記録する。|记录谁拥有通行权、支付维修并获得应急储备。|누가 통행을 소유하고 수리비를 내며 비상 비축을 받는지 기록하라.',24:'Начните со здорового чужака, отвергнутого старым протоколом изоляции.|Abre con un forastero sano rechazado por un antiguo protocolo de aislamiento.|古い隔離手順が拒む健康な外部者から始める。|从被旧隔离规程拒绝的健康外来人开始。|옛 격리 규약으로 거부된 건강한 외부인으로 시작하라.',25:'Отделите сомнительное загрязнение от автоматической вины.|Distingue contaminación incierta de culpa automática.|不確かな汚染を自動的な罪から区別する。|区分不确定污染与自动定罪。|불확실한 오염과 자동적인 유죄를 구분하라.',26:'Предложите живой образец, независимую проверку и участие наследников семян.|Ofrece una muestra viable, análisis independiente y participación de herederos de semillas.|生存標本、独立検査、種の相続人の参加を提示する。|提供可存活样本、独立检测与种子继承人参与。|살아 있는 표본과 독립 검사, 씨앗 후계자 참여를 제안하라.',27:'Запишите еду сейчас, запас следующего сезона и право сеять.|Anota comida inmediata, reservas de la próxima temporada y quién siembra.|今の食事、次の季節の備蓄、播種できる者を記録する。|记录即时食物、下一季储备与谁可种植。|당장 먹을 음식과 다음 계절 비축, 누가 심을지 기록하라.',30:'Покажите тёплые склады и холодные дома, пропущенные в списке.|Muestra almacenes cálidos y hogares fríos ausentes de la lista.|暖かい倉庫と名簿外の寒い家を見せる。|展现温暖仓库与名单遗漏的冰冷住宅。|따뜻한 창고와 명부에서 빠진 추운 집을 보여라.',31:'Сделайте старый промышленный приоритет исправимым процессом, а не магией.|Haz de la vieja prioridad industrial un proceso reparable en vez de magia.|古い工業優先を魔法でなく修正できる処理にする。|让旧工业优先级成为可修正流程，而非魔法。|옛 산업 우선순위를 마법이 아닌 고칠 수 있는 과정으로 만들어라.',32:'Предложите общие циклы и ручное управление с явными затратами.|Ofrece ciclos compartidos y control manual con costes visibles.|共有周期と手動制御を明確な代償つきで提示する。|提供共享循环与手动控制，明确代价。|공동 주기와 수동 제어를 명확한 비용과 함께 제안하라.',33:'Запишите представительство семей и ответственность за обратный кабель.|Anota representación doméstica y responsabilidad del cable de retorno.|世帯の代表と帰還ケーブルの責任を記録する。|记录住户代表与回路电缆责任。|가정 대표와 귀환 케이블 책임을 기록하라.'}
for i,v in first.items():add(src[i],v)
for i,n,t in [(16,'Пыльная дорога|Camino Polvoriento|砂塵街道|尘路|먼지길','A Road Kept Open'),(22,'Хранилище семян|Bóveda de Semillas|種の保管庫|种子库|종자고','The Next Season'),(28,'Последняя сеть|Última Red|最後の送電網|最后电网|마지막 전력망','Both Hearths Warm')]:
 for l,w in zip(langs,n.split('|')):maps[l][src[i]]=w+': '+maps[l][t]
for i,c,d in [(17,6,7),(23,8,9),(29,10,11)]:
 for l,v in zip(langs,['Игра на три-четыре часа в мире «{c}»: {d}','Una partida de tres a cuatro horas de {c}: {d}','「{c}」の3～4時間のゲーム：{d}','三至四小时的《{c}》游戏：{d}','{c}의 3~4시간 게임: {d}']):maps[l][src[i]]=v.format(c=maps[l][src[c]],d=maps[l][src[d]])
extra='''Recovery navigation interface|Интерфейс восстановления|Interfaz de navegación de recuperación|再建のナビゲーション画面|复苏导航界面|회복 탐색 화면
Desert|Пустыня|Desierto|砂漠|沙漠|사막
Overgrown|Заросшая|Cubierto de vegetación|繁茂|植被覆盖|무성한 식생
Flooded|Затопленная|Inundado|水没|淹没|침수
Recovering|Восстанавливающиеся|En recuperación|回復中|恢复中|회복 중
Scarce|Скудные|Escasos|不足|稀缺|부족
Critical|Критические|Críticos|危機的|危急|위급
Scout|Разведчик|Explorador|斥候|侦察员|정찰병
Tinker|Мастеровой|Manitas|修理屋|工匠|수리공
Warden|Страж|Guardián|守護者|守卫|수호자
Survivor role|Роль выжившего|Rol del superviviente|生存者の役割|幸存者角色|생존자 역할
Grit|Стойкость|Tenacidad|粘り強さ|坚韧|근성
Scavenge|Сбор|Recolección|回収|搜寻|수색
Heart|Сердце|Corazón|心|心志|마음
Post-Apocalypse portrait|Портрет постапокалипсиса|Retrato de Posapocalipsis|ポストアポカリプスの肖像|后末日肖像|포스트 아포칼립스 초상
Health|Здоровье|Salud|健康|生命|건강
Water|Вода|Agua|水|水|물
Radiation|Радиация|Radiación|放射線|辐射|방사능
Scrap Rifle|Винтовка из лома|Fusil de chatarra|廃材ライフル|废料步枪|고철 소총
Salvage Kit|Набор сбора утиля|Equipo de recuperación|回収道具|回收套件|회수 도구
Old World Core|Ядро старого мира|Núcleo del Viejo Mundo|旧世界のコア|旧世界核心|옛 세계 코어
Clean Water|Чистая вода|Agua limpia|清潔な水|净水|깨끗한 물
Patchwork Armor|Составной доспех|Armadura remendada|継ぎはぎの鎧|拼凑护甲|짜깁기 갑옷
Geiger Counter|Счётчик Гейгера|Contador Geiger|ガイガーカウンター|盖革计数器|가이거 계수기
Trade Chits|Торговые жетоны|Vales comerciales|交易証票|贸易凭证|거래 증표
Rad Bear|Радиационный медведь|Oso radiactivo|放射能の熊|辐射熊|방사능 곰
Scout Juniper|Разведчица Джунипер|Exploradora Juniper|斥候ジュニパー|侦察员朱尼珀|정찰병 주니퍼
Dust Lurker|Пыльный затаившийся|Acechador del polvo|砂塵の潜伏者|尘埃潜伏者|먼지 잠복자
Irradiated|Облучён|Irradiado|被曝|受辐射|피폭
Resourceful|Находчив|Ingenioso|機転が利く|足智多谋|기지가 좋음
Fortified|Укреплён|Fortificado|強化|加固|강화
Use Scrap Rifle|Использовать винтовку из лома|Usar fusil de chatarra|廃材ライフルを使う|使用废料步枪|고철 소총 사용
Recover Health|Восстановить здоровье|Recuperar salud|健康を回復|恢复生命|건강 회복
Spend Radiation|Потратить радиацию|Gastar radiación|放射線を消費|消耗辐射|방사능 사용'''
for row in extra.splitlines():k,v=row.split('|',1);add(k,v)
for l in langs:
 assert set(src)==set(maps[l]),set(src)-set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Post base:',len(src))
