# coding: utf-8
import json
from pathlib import Path
src=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'gothic-horror.json'));langs=['ru','es','ja','zh-CN','ko'];maps={l:{} for l in langs}
def add(k,v):
 a=v.split('|');assert len(a)==5,(k,a)
 for l,x in zip(langs,a):maps[l][k]=x
names='''County Mourning Guild|Гильдия траура графства|Gremio de Luto del Condado|郡の喪のギルド|郡哀悼公会|군 애도 길드
Velvet Patrons|Бархатные покровители|Patronos del Terciopelo|ベルベットの後援者|丝绒赞助者|벨벳 후원자
Reservoir Wardens|Стражи водохранилища|Guardianes del Embalse|貯水池の守護者|水库守卫|저수지 수호자
Estate Tenants|Арендаторы поместья|Arrendatarios de la Finca|屋敷の借家人|庄园佃户|영지 세입자
Night Charity|Ночная благотворительность|Caridad Nocturna|夜の慈善団|夜间慈善会|밤의 자선회
Choir Remembrance|Память хора|Memoria del Coro|合唱団の追悼会|唱诗班纪念会|합창단 추모회
Bellfounders Union|Союз литейщиков колоколов|Unión de Fundidores de Campanas|鐘鋳造者の組合|铸钟工会|종 주조자 연합
Court Petitioners|Просители двора|Peticionarios de la Corte|宮廷の請願者|宫廷请愿人|궁정 청원자
Ashwake Gate|Врата Эшвейк|Puerta de Ashwake|アッシュウェイクの門|阿什韦克大门|애시웨이크 관문
Velvet Infirmary|Бархатная лечебница|Enfermería del Terciopelo|ベルベットの診療所|丝绒医务室|벨벳 진료소
Reservoir Well|Колодец водохранилища|Pozo del Embalse|貯水池の井戸|水库井|저수지 우물
Hollow Chapel|Пустая часовня|Capilla Hueca|虚ろな礼拝堂|空心礼拜堂|빈 예배당
Patron Ballroom|Бальный зал покровителей|Salón de Baile de Patronos|後援者の舞踏室|赞助者舞厅|후원자 무도회장
Sunken Steps|Затонувшие ступени|Escaleras Hundidas|水没した階段|沉没台阶|수몰 계단
Tenant Orchard|Сад арендаторов|Huerto de Arrendatarios|借家人の果樹園|佃户果园|세입자 과수원
Contract Salon|Салон договоров|Salón de Contratos|契約の広間|契约沙龙|계약 살롱
Choir Loft|Хоры|Tribuna del Coro|聖歌隊席|唱诗班楼台|성가대석
Bellfoundry|Колокольная литейная|Fundición de Campanas|鐘の鋳造所|铸钟厂|종 주조소
Petition Hall|Зал прошений|Sala de Peticiones|請願の広間|请愿大厅|청원 홀
Old Water Gate|Старые водяные врата|Antigua Compuerta|古い水門|旧水闸|옛 수문
Mira Ashwake|Мира Эшвейк|Mira Ashwake|ミラ・アッシュウェイク|米拉·阿什韦克|미라 애시웨이크
Matron Elise Velvet|Старшая сестра Элиз Велвет|Matrona Elise Velvet|婦長エリーズ・ベルベット|护士长埃莉丝·韦尔维特|수간호사 엘리스 벨벳
Singer Tom Lowwater|Певец Том Лоуотер|Cantante Tom Lowwater|歌手トム・ローウォーター|歌手汤姆·洛沃特|가수 톰 로워터
Gravedigger Ren Vale|Могильщик Рен Вейл|Sepulturero Ren Vale|墓掘りレン・ヴェイル|掘墓人伦·韦尔|묘지기 렌 베일
Petitioner Ada Thorn|Просительница Ада Торн|Peticionaria Ada Thorn|請願者エイダ・ソーン|请愿人艾达·索恩|청원자 에이다 손
Warden Pell Reed|Страж Пелл Рид|Guardián Pell Reed|守護者ペル・リード|守卫佩尔·里德|수호자 펠 리드
Tenant Jonah Branch|Арендатор Джона Бранч|Arrendatario Jonah Branch|借家人ジョナ・ブランチ|佃户乔纳·布兰奇|세입자 조나 브랜치
Patron Lucien Pale|Покровитель Люсьен Пейл|Patrono Lucien Pale|後援者ルシアン・ペイル|赞助者吕西安·佩尔|후원자 뤼시앵 페일
Boatkeeper Nessa Moor|Лодочница Несса Мур|Barquera Nessa Moor|船守ネッサ・ムーア|船主内莎·穆尔|뱃사공 네사 무어
Founder Mara Kiln|Литейщица Мара Килн|Fundidora Mara Kiln|鋳造師マラ・キルン|铸工玛拉·基尔恩|주조공 마라 킬른
Judge Ivo Candor|Судья Иво Кэндор|Juez Ivo Candor|判事イヴォ・キャンダー|法官伊沃·坎德|판사 이보 캔더
Archivist Sera Hymn|Архивист Сера Химн|Archivista Sera Hymn|文書係セラ・ヒム|档案员塞拉·希姆|기록관 세라 힘
Child Len Orchard|Ребёнок Лен Орчард|Niño Len Orchard|子供レン・オーチャード|孩子伦·奥查德|아이 렌 오차드
Patient Rosa Borrow|Пациентка Роза Борроу|Paciente Rosa Borrow|患者ローザ・ボロウ|病人罗莎·博罗|환자 로사 버로
Diver Kai Breath|Ныряльщик Кай Брет|Buzo Kai Breath|潜水者カイ・ブレス|潜水员凯·布雷斯|잠수부 카이 브레스
Steward Oren Ash|Управляющий Орен Эш|Administrador Oren Ash|管理人オレン・アッシュ|管家奥伦·阿什|관리인 오렌 애시
Court Musician Fia Glass|Придворная музыкантша Фиа Гласс|Música de Corte Fia Glass|宮廷楽師フィア・グラス|宫廷乐师菲娅·格拉斯|궁정 음악가 피아 글래스
Engineer Dev Sluice|Инженер Дев Слюс|Ingeniero Dev Sluice|技師デヴ・スルース|工程师德夫·斯卢斯|기술자 데브 슬루스
Widow Bea Candle|Вдова Беа Кэндл|Viuda Bea Candle|未亡人ベア・キャンドル|寡妇贝娅·坎德尔|미망인 베아 캔들
Clerk Noa Seal|Писарь Ноа Сил|Escribano Noa Seal|書記ノア・シール|书记诺亚·西尔|서기 노아 실
Choirmaster Ina Deep|Хормейстер Ина Дип|Directora de Coro Ina Deep|合唱長イナ・ディープ|合唱指挥伊娜·迪普|합창 지휘자 이나 딥
Courier Sol Rook|Курьер Сол Рук|Mensajero Sol Rook|運び手ソル・ルーク|信使索尔·鲁克|배달원 솔 루크
Donor Tess Quiet|Благотворительница Тесс Квайет|Donante Tess Quiet|寄付者テス・クワイエット|捐赠人泰丝·奎特|기부자 테스 콰이엇
Child Mei Shore|Ребёнок Мей Шор|Niña Mei Shore|子供メイ・ショア|孩子梅·肖尔|아이 메이 쇼어
Funeral Driver|Похоронный возница|Cochero Funerario|葬儀の御者|葬礼车夫|장례 마부
Velvet Collector|Бархатный сборщик|Recaudador del Terciopelo|ベルベットの徴収者|丝绒征收者|벨벳 징수자
Well Cantor|Колодезный певец|Cantor del Pozo|井戸の歌い手|井中领唱|우물 선창자
Orchard Shade|Садовая тень|Sombra del Huerto|果樹園の影|果园幽影|과수원 그림자
Mirror Guest|Зеркальный гость|Invitado del Espejo|鏡の客|镜中宾客|거울 손님
Sluice Guardian|Страж шлюза|Guardián de la Compuerta|水門の守護者|水闸守护者|수문 수호자
Ash Hounds|Пепельные псы|Sabuesos de Ceniza|灰の猟犬|灰烬猎犬|잿빛 사냥개
Subscription Broker|Посредник пожертвований|Corredor de Suscripciones|会費の仲買人|捐助认购中间人|기부 약정 중개인
Choir Echo|Эхо хора|Eco del Coro|合唱の残響|唱诗班回声|합창단 메아리
Grave Bailiff|Могильный пристав|Alguacil de Tumbas|墓の執行吏|墓地执达吏|무덤 집행관
Patron's Duelist|Дуэлянт покровителя|Duelista del Patrono|後援者の決闘者|赞助者决斗士|후원자의 결투사
Drowned Usher|Утонувший распорядитель|Ujier Ahogado|溺れた案内人|溺亡引座员|익사한 안내인
Bell Wraith|Призрак колокола|Espectro de la Campana|鐘の幽鬼|钟之幽灵|종 망령
Court Whisperer|Придворный шептун|Susurrador de la Corte|宮廷の囁き手|宫廷低语者|궁정 속삭임꾼
Reservoir Hunger|Голод водохранилища|Hambre del Embalse|貯水池の飢え|水库饥渴|저수지의 굶주림
Carriage Inspector|Инспектор кареты|Inspector del Carruaje|馬車の検査官|马车检查员|마차 검사관
Seal Leech|Пиявка печати|Sanguijuela del Sello|封印の蛭|印章水蛭|봉인 거머리
Nameless Soloist|Безымянный солист|Solista sin Nombre|名なき独唱者|无名独唱者|이름 없는 독창자
Funeral Register|Похоронный реестр|Registro Funerario|葬儀の名簿|葬礼登记册|장례 명부
Patient Receipt|Квитанция пациента|Recibo del Paciente|患者の領収書|病人收据|환자 영수증
Choir Roll|Список хора|Lista del Coro|合唱団の名簿|唱诗班名单|합창단 명부
Witness Candle|Свеча свидетеля|Vela del Testigo|証人の蝋燭|见证蜡烛|증인의 촛불
Unsealed Petition|Незапечатанное прошение|Petición sin Sellar|封じられていない請願|未封请愿书|봉인되지 않은 청원
Pumping Chart|График откачки|Horario de Bombeo|排水予定表|抽水日程|양수 일정
Mourning Box|Траурная шкатулка|Caja de Luto|喪の箱|哀悼盒|애도 상자
Patron Mirror|Зеркало покровителя|Espejo del Patrono|後援者の鏡|赞助者镜子|후원자 거울
Parish Medal|Медаль прихода|Medalla Parroquial|教区のメダル|教区勋章|교구 메달
Bell Wage Ledger|Реестр платы за колокол|Libro de Salarios de la Campana|鐘の賃金台帳|铸钟工资账簿|종 임금 장부
Revocation Seal|Печать отмены|Sello de Revocación|撤回の印|撤销印章|철회 인장
Breathing Lantern|Дыхательный фонарь|Farol de Respiración|呼吸の灯|呼吸灯|호흡 등불
Carriage Release|Освобождение от кареты|Liberación del Carruaje|馬車の解放書|马车解除书|마차 해제서
Charity Fund Deed|Акт благотворительного фонда|Escritura del Fondo Benéfico|慈善基金の証書|慈善基金契据|자선 기금 증서
Bypass Key|Ключ обхода|Llave del Derivador|迂回路の鍵|旁路钥匙|우회로 열쇠
Tenant Orchard Map|Карта сада арендаторов|Mapa del Huerto de Arrendatarios|借家人の果樹園の地図|佃户果园地图|세입자 과수원 지도
Private Confession|Тайная исповедь|Confesión Privada|私的な告白|私密忏悔|비공개 고해
Lost Name Ribbon|Лента потерянного имени|Cinta del Nombre Perdido|失われた名のリボン|失名丝带|잃어버린 이름 리본
Founder Hammer|Молот литейщика|Martillo del Fundidor|鋳造者の槌|铸工锤|주조공 망치
Three Witness Ring|Кольцо трёх свидетелей|Anillo de Tres Testigos|三証人の指輪|三见证人戒指|세 증인의 반지
Rescue Rope|Спасательная верёвка|Cuerda de Rescate|救助の綱|救援绳|구조 밧줄
Estate Settlement|Урегулирование поместья|Acuerdo de la Finca|屋敷の和解書|庄园和解书|영지 합의
Care Guarantee|Гарантия лечения|Garantía de Cuidados|治療の保証|照护保证|치료 보장
Remembrance Book|Книга памяти|Libro de Memoria|追悼の書|纪念册|추모록'''
for row in names.splitlines():k,v=row.split('|',1);add(k,v)
def clauses_add(text):
 for row in text.splitlines():
  i,v=row.split('|',1);key=src[int(i)];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
names='''Living Funeral|Похороны живого|Funeral de un Vivo|生者の葬儀|活人葬礼|산 자의 장례
Charity Invitation|Благотворительное приглашение|Invitación Benéfica|慈善の招待|慈善邀请|자선 초대
Water Hymn|Водный гимн|Himno del Agua|水の聖歌|水之圣歌|물의 찬송
Register Addition|Дополнение реестра|Adición al Registro|名簿への追加|登记册增补|명부 추가
Patient Recovery|Выздоровление пациента|Recuperación del Paciente|患者の回復|病人康复|환자 회복
Pump Halt|Остановка насоса|Parada de la Bomba|ポンプ停止|水泵停止|펌프 정지
Orchard Eviction|Выселение из сада|Desalojo del Huerto|果樹園の立ち退き|果园驱逐|과수원 퇴거
Mirror Accusation|Зеркальное обвинение|Acusación del Espejo|鏡の告発|镜中指控|거울의 고발
Loft Signal|Сигнал хоров|Señal de la Tribuna|聖歌隊席の信号|楼台信号|성가대석 신호
Wage Demand|Требование платы|Exigencia de Salarios|賃金の要求|工资要求|임금 요구
Witness Offer|Предложение свидетеля|Oferta de Testimonio|証言の提案|见证提议|증언 제안
Bypass Leak|Утечка обхода|Fuga del Derivador|迂回路の漏れ|旁路泄漏|우회로 누출
Carriage Crossing|Переправа кареты|Cruce del Carruaje|馬車の横断|马车过桥|마차 건너기
Contract Amendment|Поправка договора|Enmienda del Contrato|契約の修正|契约修改|계약 수정
Choir Dispute|Спор хора|Disputa del Coro|合唱団の争い|唱诗班争议|합창단 분쟁
Estate Confession|Признание поместья|Confesión de la Finca|屋敷の告白|庄园坦白|영지의 고백
Charter Threat|Угроза хартии|Amenaza a la Carta|憲章への脅し|宪章威胁|헌장 위협
Rope Break|Обрыв верёвки|Rotura de la Cuerda|綱の切断|绳索断裂|밧줄 끊김
Foundry Opening|Окно литейной|Oportunidad en la Fundición|鋳造所の機会|铸造窗口|주조소 기회
Third Witness|Третий свидетель|Tercer Testigo|第三の証人|第三见证人|세 번째 증인
Sluice Arrival|Прибытие шлюза|Llegada a la Compuerta|水門への到着|抵达水闸|수문 도착
Tenant Council|Совет арендаторов|Consejo de Arrendatarios|借家人の会議|佃户议会|세입자 회의
Public Procession|Публичная процессия|Procesión Pública|公の行列|公开游行|공개 행렬
Nameless Verse|Безымянный стих|Verso sin Nombre|名なき詩|无名诗句|이름 없는 시구
Paid Promise|Оплаченное обещание|Promesa Pagada|支払われた約束|兑现的承诺|지불된 약속
Care Without Debt|Лечение без долга|Cuidados sin Deuda|負債なき治療|无债照护|빚 없는 치료
Water Returned|Возвращённая вода|Agua Devuelta|戻された水|水归还|돌아온 물
Quiet Bell|Тихий колокол|Campana Silenciosa|静かな鐘|静默之钟|조용한 종
Open Charter|Открытая хартия|Carta Abierta|開かれた憲章|开放宪章|열린 헌장
Remembered Parish|Помянутый приход|Parroquia Recordada|記憶された教区|被铭记的教区|기억되는 교구
A Funeral for the Living|Похороны для живого|Un Funeral para los Vivos|生者のための葬儀|为活人举行的葬礼|산 자를 위한 장례
An Invitation in Velvet|Приглашение в бархат|Una Invitación de Terciopelo|ベルベットの招待|丝绒邀请|벨벳의 초대
The Well that Sings|Поющий колодец|El Pozo que Canta|歌う井戸|歌唱之井|노래하는 우물
The Orchard Graves|Могилы в саду|Las Tumbas del Huerto|果樹園の墓|果园墓穴|과수원 무덤
Mirrors at Supper|Зеркала за ужином|Espejos en la Cena|夕食の鏡|晚餐时的镜子|저녁 식사의 거울
An Air Pocket Below|Воздушный карман внизу|Una Bolsa de Aire Abajo|下の空気溜まり|下方气穴|아래의 공기주머니
The Unpaid Foundry|Неоплаченная литейная|La Fundición sin Pagar|未払いの鋳造所|未付费的铸造厂|임금 없는 주조소
A Petition with Names|Прошение с именами|Una Petición con Nombres|名のある請願|有名字的请愿书|이름 있는 청원
The Missing Verse|Пропавший стих|El Verso Perdido|失われた詩|失落诗句|사라진 시구
The Steward's Promise|Обещание управляющего|La Promesa del Administrador|管理人の約束|管家的承诺|관리인의 약속
Care Under Threat|Лечение под угрозой|Cuidados Amenazados|脅かされた治療|受威胁的照护|위협받는 치료
The Last Rope|Последняя верёвка|La Última Cuerda|最後の綱|最后的绳索|마지막 밧줄
At the Carriage Bridge|У моста кареты|En el Puente del Carruaje|馬車の橋で|马车桥头|마차 다리에서
The Open Hearing|Открытое слушание|La Audiencia Abierta|公開審理|公开听证|공개 심리
The Water Gate|Водяные врата|La Compuerta|水門|水闸|수문
A Quiet Inheritance|Тихое наследство|Una Herencia Silenciosa|静かな相続|平静的继承|조용한 유산
Charity after Midnight|Благотворительность после полуночи|Caridad después de Medianoche|真夜中過ぎの慈善|午夜后的慈善|자정 뒤의 자선
A Parish Remembered|Помянутый приход|Una Parroquia Recordada|記憶された教区|被铭记的教区|기억되는 교구
Estate Witness|Свидетель поместья|Testigo de la Finca|屋敷の証人|庄园见证人|영지 증인
Night Clinician|Ночной врач|Médico Nocturno|夜の医師|夜间医师|밤의 임상의
Reservoir Diver|Ныряльщик водохранилища|Buzo del Embalse|貯水池の潜水者|水库潜水员|저수지 잠수부
Bellfounder|Литейщик колоколов|Fundidor de Campanas|鐘鋳造者|铸钟工|종 주조공
Court Petitioner|Придворный проситель|Peticionario de la Corte|宮廷の請願者|宫廷请愿人|궁정 청원자
Choir Archivist|Архивист хора|Archivista del Coro|合唱団の文書係|唱诗班档案员|합창단 기록관
Tenant Advocate|Защитник арендаторов|Defensor de Arrendatarios|借家人の擁護者|佃户辩护人|세입자 대변인
Care Trustee|Попечитель лечения|Administrador de Cuidados|治療の受託者|照护受托人|치료 수탁자
Promise Keeper|Хранитель обещаний|Guardián de Promesas|約束の守り手|守诺者|약속 지킴이
Care Guardian|Защитник лечения|Guardián de Cuidados|治療の守護者|照护守护者|치료 수호자
Remembrance Steward|Распорядитель памяти|Administrador de la Memoria|追悼の世話役|纪念管事|추모 관리인
Bell Custodian|Хранитель колокола|Custodio de la Campana|鐘の守り手|钟之保管人|종 지킴이
Witness Protector|Защитник свидетелей|Protector de Testigos|証人の保護者|见证人保护者|증인 보호자
Water Warden|Страж воды|Guardián del Agua|水の守護者|水之守卫|물 수호자
Ashwake Mourning|Траур Эшвейка|Luto de Ashwake|アッシュウェイクの喪|阿什韦克哀悼|애시웨이크 애도
Velvet Testimony|Бархатные показания|Testimonio del Terciopelo|ベルベットの証言|丝绒证词|벨벳 증언
Reservoir Hymn|Гимн водохранилища|Himno del Embalse|貯水池の聖歌|水库圣歌|저수지 찬송'''
for row in names.splitlines():k,v=row.split('|',1);add(k,v)
clauses_add('''35|защищает скорбящие семьи, но скрывает неоплаченный похоронный договор поместья.|protege familias en duelo, pero oculta el contrato funerario impago de la finca.|遺族を守るが屋敷の未払い葬儀契約を隠す。|保护丧亲家庭，却隐瞒庄园未付的葬礼契约。|유족을 지키지만 영지의 미지급 장례 계약을 숨긴다.
38|финансирует лечебницу долгом, выплачиваемым безымянными жителями.|financia la enfermería con una deuda pagada por residentes sin nombre.|名なき住民が払う負債で診療所に資金を出す。|以无名居民偿还的债务资助医务室。|이름 없는 주민이 갚는 빚으로 진료소를 지원한다.
41|обеспечивает воду, скрывая затонувший приход.|mantiene el agua mientras oculta la parroquia ahogada.|溺れた教区を隠しながら水を流し続ける。|维持供水，却隐瞒被淹教区。|물 공급을 유지하며 수몰된 교구를 숨긴다.
44|дадут показания, если наследники обещают безопасное жильё после снятия проклятия.|testificarán si los herederos prometen vivienda segura tras la maldición.|呪いが終わった後の安全な住まいを後継者が約束すれば証言する。|继承人保证诅咒结束后安全住房才会作证。|저주가 끝난 뒤 안전한 주거를 후계자가 약속하면 증언한다.
47|предлагает лечение, не спрашивая, кто снабжает покровителей.|ofrece tratamiento sin preguntar quién abastece a sus patronos.|誰が後援者に供給するか問わず治療を提供する。|不问谁供养赞助者便提供治疗。|누가 후원자에게 공급하는지 묻지 않고 치료한다.
50|хочет назвать каждого потерянного певца до умолкания колоколов.|quiere nombrar a cada cantante perdido antes de silenciarse las campanas.|鐘が黙る前に失われた歌手全員の名を求める。|希望在钟沉默前说出每位失踪歌者的名字。|종이 멎기 전에 잃어버린 모든 가수의 이름을 부르기를 원한다.
53|может разрушить звонящий колокол, если деревня справедливо оплатит работников.|puede deshacer la campana si el pueblo paga justamente a sus trabajadores.|村が労働者に公平に払えば鳴る鐘を解体できる。|村庄公平支付工人工资后可拆解鸣钟。|마을이 노동자에게 공정하게 지불하면 울리는 종을 해체할 수 있다.
56|могут отменить долг, когда три свидетеля выскажутся открыто.|pueden anular la deuda si tres testigos hablan abiertamente.|三人の証人が公に話せば負債を取り消せる。|三位见证人公开发言后可撤销债务。|세 증인이 공개적으로 말하면 빚을 무효로 할 수 있다.
59|закрытая похоронная карета ждёт ещё живого наследника.|un carruaje funerario sin abrir espera a un heredero aún vivo.|開かぬ葬儀馬車が生きた後継者を待つ。|未打开的葬礼马车等待仍活着的继承人。|열리지 않은 장례 마차가 살아 있는 후계자를 기다린다.
62|пациенты выздоравливают, пока незнакомые имена исчезают из записей.|pacientes se recuperan mientras nombres desconocidos desaparecen de sus registros.|患者は回復する一方、記録から見知らぬ名が消える。|病人康复时，陌生名字从记录中消失。|환자가 회복하는 동안 기록에서 낯선 이름들이 사라진다.
65|мокрый гимн прерывает утренний набор воды города.|un himno húmedo interrumpe la recogida de agua matinal del pueblo.|濡れた聖歌が町の朝の水汲みを遮る。|潮湿圣歌打断镇上的晨间取水。|젖은 찬송이 마을의 아침 물 긷기를 끊는다.
68|реестр поместья содержит обещание почерком живого свидетеля.|el registro contiene una promesa escrita por un testigo vivo.|屋敷の名簿には生きた証人の筆跡の約束がある。|庄园登记册里有活见证人笔迹的承诺。|영지 명부에 살아 있는 증인의 필적으로 쓴 약속이 있다.
71|зеркала показывают людей, чья забота оплатила молодость гостей.|los espejos muestran personas cuyos cuidados pagaron la juventud de los invitados.|鏡は来客の若さを支払った看護の人々を映す。|镜子映出那些以照护支付宾客青春的人。|거울이 손님들의 젊음을 위해 돌봄을 대가로 지불한 사람들을 보여 준다.
74|подводная лестница доступна только в промежутке откачки.|una escalera sumergida solo se alcanza durante el intervalo de bombeo.|水没階段は排水の間だけ通れる。|水下楼梯仅在抽水间隔可通行。|수몰 계단은 양수 간격에만 접근할 수 있다.
77|свежие могилы отмечают дома, подлежащие выселению.|tumbas recientes marcan hogares destinados a desalojo.|新しい墓が立ち退き予定の家を示す。|新坟标记予定驱逐的住宅。|새 무덤들이 퇴거 예정 집을 표시한다.
80|запечатанный кровью акт записывает долги как благотворительные подписки.|una escritura sellada con sangre registra deudas como suscripciones benéficas.|血の封印の証書は負債を慈善会費として記す。|血封契据把债务列作慈善认捐。|피로 봉인한 증서에 빚을 자선 약정으로 기록한다.
83|воздушный карман держит музыку и выжившего певца.|una bolsa de aire atrapada conserva música y un cantante superviviente.|閉じた空気溜まりに音楽と生き残った歌手がいる。|被困气穴里有音乐与幸存歌者。|갇힌 공기주머니에 음악과 살아남은 가수가 있다.
86|расплавленный металл помнит имена, произнесённые при отливке.|el metal fundido recuerda nombres dichos durante la colada.|溶けた金属は鋳造中に語られた名を覚える。|熔融金属记得铸造时说出的名字。|녹은 금속이 주조 중 말한 이름을 기억한다.
89|старый судья выслушает показания до процессии покровителей.|un viejo juez oirá testimonios antes de la procesión de patronos.|老判事が後援者の行列の前に証言を聞く。|老法官愿在赞助者游行前听证。|늙은 판사가 후원자 행렬 전에 증언을 듣는다.
92|открытие безопасного обхода раскрывает приход, брошенный городом.|abrir el derivador seguro revela la parroquia abandonada por el pueblo.|安全な迂回路を開くと町が捨てた教区が現れる。|打开安全旁路揭示被镇抛弃的教区。|안전한 우회로를 열면 마을이 버린 교구가 드러난다.
95|живая наследница хочет убрать карету, но отказывается выселять арендаторов.|una heredera viva quiere quitar el carruaje, pero se niega a desalojar arrendatarios.|生きた後継者は馬車をなくしたいが借家人を追い出さない。|活继承人想赶走马车，却拒绝驱逐佃户。|살아 있는 후계자가 마차를 없애려 하지만 세입자 퇴거는 거부한다.
98|знает долг благотворительности и сохранит безопасность пациентов при раскрытии.|conoce la deuda benéfica y puede proteger pacientes durante la revelación.|慈善の負債を知り、公表中に患者を守れる。|知道慈善债务，能在揭露时保护病人。|자선의 빚을 알며 폭로 중 환자를 지킬 수 있다.
101|выжил в воздушном кармане и нуждается в том, кто запишет пропавшие имена.|sobrevivió en una bolsa de aire y necesita que alguien registre nombres perdidos.|空気溜まりで生き延び、失われた名を記す人を必要とする。|在气穴中幸存，需要有人记录失踪者名字。|공기주머니에서 살아남아 잃어버린 이름을 기록해 줄 사람이 필요하다.
104|хранит книгу погребений, противоречащую реестру поместья.|conserva un libro de entierros que contradice el registro de la finca.|屋敷の名簿と矛盾する埋葬台帳を持つ。|保管与庄园登记册矛盾的埋葬账簿。|영지 명부와 모순되는 매장 장부를 보관한다.
107|назовёт кредитора, если команда защитит её семью.|puede nombrar a un acreedor si el equipo protege a su familia.|一行が家族を守れば債権者を名指せる。|团队保护家人后可说出债权人。|일행이 가족을 보호하면 채권자를 말할 수 있다.
110|понизит водохранилище, если город получит другое водоснабжение.|bajará el embalse si el pueblo recibe otro suministro de agua.|町が別の給水を得れば貯水池を下げる。|城镇获得另一供水来源后愿降低水库水位。|마을이 다른 물 공급을 얻으면 저수지 수위를 낮춘다.
113|подписал старое обещание против голода и боится публичного осуждения.|firmó la promesa antigua para evitar hambre y teme culpa pública.|飢えを防ぐ古い約束に署名し、公の非難を恐れる。|为防饥饿签旧承诺，害怕公开责难。|굶주림을 막으려고 옛 약속에 서명했으며 공개 비난을 두려워한다.
116|предлагает отказаться от одного долга, требуя скрыть другой.|ofrece renunciar a una deuda mientras exige ocultar otra.|一つの負債を放棄する代わりに別の秘密を要求する。|提议放弃一笔债，却要求另一笔保持秘密。|빚 하나를 포기하겠지만 다른 빚은 비밀로 하라고 요구한다.
119|знает промежутки откачки, но потеряла родственника внизу.|conoce los intervalos de bombeo, pero perdió a un hermano abajo.|排水の間を知るが下で兄弟姉妹を失った。|知道抽水间隔，但在下方失去手足。|양수 간격을 알지만 아래에서 형제자매를 잃었다.
122|перельёт колокол без его приказа, если получит плату до слушания.|puede refundir la campana sin su mandato si cobra antes de la audiencia.|審理前に支払われれば命令のない鐘に鋳直せる。|若听证前获付款，就能重铸钟并去除命令。|심리 전에 돈을 받으면 명령 없는 종으로 다시 주조할 수 있다.
125|нуждается в трёх независимых показаниях для отмены подписки.|necesita tres testimonios independientes para anular la suscripción.|会費を無効にするため三つの独立証言が必要だ。|需三份独立证词才可撤销认捐。|약정을 무효화하려면 독립 증언 세 개가 필요하다.
128|восстановит список хора по разрозненным приходским квитанциям.|puede reconstruir la lista del coro con recibos parroquiales dispersos.|散らばった教区の領収書で合唱名簿を再現できる。|可从零散教区收据重建唱诗班名单。|흩어진 교구 영수증으로 합창단 명부를 복원할 수 있다.
131|слышит лошадей кареты до появления имени в реестре.|oye los caballos antes de aparecer un nombre en el registro.|名簿に名が出る前に馬車の馬を聞く。|名字出现在登记册前先听到马车的马。|이름이 명부에 나타나기 전에 마차 말을 듣는다.
134|хочет продолжения лечения после утраты влияния покровителей.|quiere que siga el tratamiento cuando los patronos pierdan influencia.|後援者が影響力を失っても治療継続を望む。|希望赞助者失势后治疗仍继续。|후원자들이 영향력을 잃어도 치료가 계속되기를 바란다.
137|может поднять двух певцов и нуждается во второй верёвочной команде.|puede subir a dos cantantes y necesita otro equipo de cuerda.|二人の歌手を上へ運べるが第二の綱班が必要だ。|能带两名歌者上去，需要第二支绳索队。|가수 두 명을 위로 데려갈 수 있고 두 번째 밧줄조가 필요하다.
140|спрятал неоплаченную плату и знает, почему колокол называет арендаторов.|ocultó salarios impagos y sabe por qué la campana nombra arrendatarios.|未払い賃金を隠し、鐘が借家人を呼ぶ理由を知る。|藏起未付工资，知道钟为何叫佃户名字。|미지급 임금을 숨겼고 종이 세입자를 부르는 이유를 안다.
143|узнаёт песню долга за бальным танцем.|reconoce la canción de deuda tras el baile.|舞踏の裏の負債の歌を聞き分ける。|认出舞厅舞曲背后的债务之歌。|무도회 춤 뒤에 숨은 빚의 노래를 알아본다.
146|починит обход, не истощая запасы города.|puede reparar el derivador sin vaciar reservas del pueblo.|町の備蓄を減らさず迂回路を修理できる。|能修旁路而不耗尽城镇储备。|마을 비축을 소모하지 않고 우회로를 수리할 수 있다.
149|хранит признание прежнего наследника в запертой траурной шкатулке.|guarda confesión de un heredero anterior en una caja de luto cerrada.|前の後継者の告白を閉じた喪の箱に保管する。|把前继承人的忏悔藏在上锁哀悼盒里。|이전 후계자의 고백을 잠긴 애도 상자에 보관한다.
152|заверит отменённый договор, если собственную подпись пощадят.|certificará un contrato revocado si se respeta su propia firma.|自分の署名が守られれば撤回契約を認証する。|若保全自身签名，便认证已撤销契约。|자신의 서명을 보호해 주면 철회된 계약을 인증한다.
155|отказывается уйти, пока не помянут утонувших по именам.|se niega a irse hasta recordar los nombres ahogados.|溺れた名が記憶されるまで去らない。|溺亡者名字被铭记前拒绝离开。|익사자의 이름을 기억하기 전에는 떠나지 않는다.
158|доставит повестку до пересечения каретой моста.|puede llevar una citación antes de que el carruaje cruce el puente.|馬車が橋を渡る前に召喚状を届けられる。|能在马车过桥前送达传票。|마차가 다리를 건너기 전에 소환장을 배달할 수 있다.
161|предлагает честное финансирование лечения, но не заменит все дары покровителей.|ofrece fondos honestos, pero no puede sustituir todos los regalos de los patronos.|誠実な治療資金を出すが全ての後援者の贈り物は補えない。|提供诚实照护资金，却无法替代赞助者全部馈赠。|정직한 치료 자금을 제안하지만 후원자의 모든 선물을 대신할 수 없다.
164|рисует затонувший приход таким, каким он был до наводнения.|dibuja la parroquia hundida como era antes de la inundación.|水没教区を洪水前の姿で描く。|画出被淹教区在洪水前的模样。|수몰 교구를 홍수 전 모습으로 그린다.''')
clauses_add('''167|исполняет реестр и обязан принять освобождение при свидетелях.|impone el registro y debe aceptar liberación ante testigos.|名簿を執行し、立会い付き解放を受けねばならない。|执行登记册，必须接受有见证的解除。|명부를 집행하며 증인이 있는 해제를 받아들여야 한다.
170|забирает безымянных должников, называя захват благотворительным визитом.|toma deudores sin nombre llamándolo visita benéfica.|名なき債務者を奪い、慈善訪問と呼ぶ。|抓走无名债务人，却称其为慈善访问。|이름 없는 채무자를 잡아가며 자선 방문이라 부른다.
173|манит слушателей вниз и может получить ответ восстановленным именем.|atrae oyentes abajo y puede responderse con un nombre restaurado.|聞き手を下に誘い、戻された名で応じられる。|引诱听者下潜，可用恢复的名字回应。|청자를 아래로 유인하며 복원된 이름으로 응답할 수 있다.
176|охраняет могилу неоплаченного арендатора и нападает на носителей печатей выселения.|guarda la tumba de un arrendatario impago y ataca a portadores de sellos de desalojo.|未払いの借家人の墓を守り、立ち退き印を持つ者を襲う。|守护未获付款佃户的墓，攻击带驱逐印章者。|돈을 받지 못한 세입자의 무덤을 지키며 퇴거 인장을 가진 이를 공격한다.
179|заимствует лицо пациента до признания исходного человека.|toma el rostro de un paciente hasta reconocer a la persona original.|本来の本人が認められるまで患者の顔を借りる。|借用病人面孔，直到原本人获承认。|원래 사람이 인정받을 때까지 환자의 얼굴을 빌린다.
182|закрывает лестницу, если обход не течёт.|cierra la escalera salvo que fluya el derivador.|迂回路が流れなければ階段を閉じる。|旁路不通水就关闭楼梯。|우회로에 물이 흐르지 않으면 계단을 닫는다.
185|преследуют названного наследника, но замирают при настоящем погребальном колоколе.|persiguen al heredero nombrado, pero paran con la verdadera campana funeraria.|名指された後継者を追うが真の埋葬鐘で止まる。|追捕被指名继承人，真丧钟响时停下。|지명된 후계자를 쫓지만 진짜 장례 종이 울리면 멈춘다.
188|пытается купить молчание свидетелей возобновлённым лечением.|intenta comprar silencio de testigos con tratamiento renovado.|治療の再開で証人の沈黙を買おうとする。|试图用继续治疗买下见证人的沉默。|치료 재개로 증인의 침묵을 사려 한다.
191|повторяет ложный список без беднейших певцов прихода.|repite una lista falsa que excluye a los cantantes más pobres.|教区の最貧の歌手を外した偽の名簿を繰り返す。|重复排除教区最穷歌者的虚假名单。|교구의 가장 가난한 가수를 뺀 거짓 명부를 되풀이한다.
194|изымает дома арендаторов в счёт забытых зарплат поместья.|toma hogares de arrendatarios por salarios olvidados de la finca.|屋敷の忘れた賃金の支払いに借家人の家を奪う。|没收佃户住宅以偿庄园遗忘工资。|영지의 잊힌 임금 대가로 세입자의 집을 압수한다.
197|вызывает команду, превращая публичное слушание в частную смерть.|reta al equipo para convertir audiencia pública en muerte privada.|一行に挑み、公開審理を私的な死に変えようとする。|挑战团队，试将公开听证变成私下死亡。|일행에게 도전해 공개 심리를 사적인 죽음으로 바꾸려 한다.
200|преграждает путь спасателям без знака памяти прихода.|bloquea a rescatadores sin un símbolo de memoria parroquial.|教区追悼の印のない救助者を阻む。|阻挡不带教区纪念信物的救援者。|교구 추모 증표 없는 구조자를 막는다.
203|звонит по следующему наследнику при отказе в обещанной плате.|toca por otro heredero cada vez que se niega un salario prometido.|約束の賃金が拒まれるたび次の後継者に鳴る。|每次拒付承诺工资便为另一继承人鸣钟。|약속된 임금을 거절할 때마다 다른 후계자를 위해 울린다.
206|превращает личную исповедь в оружие против пациентов.|convierte confesión íntima en arma contra pacientes.|親密な告白を患者への武器にする。|把私密忏悔化为针对病人的武器。|내밀한 고해를 환자를 공격하는 무기로 만든다.
209|течение тащит последнюю верёвку к хорам.|una corriente arrastra la última cuerda hacia la tribuna del coro.|流れが最後の綱を聖歌隊席に引く。|水流把最后绳索拖向唱诗班楼台。|물살이 마지막 밧줄을 성가대석 쪽으로 끈다.
212|объявляет освобождение недействительным без подписи живого.|declara inválida una liberación sin firma de alguien vivo.|生者の署名がなければ解放を無効とする。|无活人签名便宣布解除无效。|살아 있는 이의 서명이 없으면 해제를 무효라 한다.
215|питается исправленными договорами и раскрывает скрытый оригинал.|se alimenta de contratos enmendados y revela el original oculto.|修正契約を食べ、隠れた原本を明かす。|吞食修改契约，揭露隐藏原本。|수정된 계약을 먹고 숨긴 원본을 드러낸다.
218|отпустит хор лишь после возвращения украденного имени.|dejará ir al coro solo al regresar su nombre robado.|盗まれた自分の名が戻ると合唱団を去らせる。|被盗的名字归还后才让唱诗班离开。|도난당한 자기 이름이 돌아와야 합창단을 보내 준다.
221|записывает следующего живого наследника и связывающее обещание платы.|lista al próximo heredero vivo y la promesa salarial que lo vincula.|次の生きた後継者と縛る賃金の約束を記す。|列出下一位活继承人与约束其的工资承诺。|다음 살아 있는 후계자와 그를 묶는 임금 약속을 적는다.
224|доказывает, что лечение куплено долгом безымянного жителя.|prueba que se pagó el cuidado con deuda de un residente sin nombre.|名なき住民の負債で治療を買った証拠になる。|证明照护以无名居民的债购买。|이름 없는 주민의 빚으로 치료를 샀음을 증명한다.
227|называет потерянных певцов, пропуская приходских слуг.|nombra a cantantes perdidos, pero omite sirvientes parroquiales.|失われた歌手を記すが教区の使用人を外す。|列出失踪歌者，却遗漏教区仆人。|잃어버린 가수는 적지만 교구 하인은 빠뜨린다.
230|позволяет один раз услышать показания мёртвого арендатора.|permite oír una vez el testimonio de un arrendatario muerto.|死んだ借家人の証言を一度聞ける。|让死去佃户的证词被听到一次。|죽은 세입자의 증언을 한 번 듣게 한다.
233|начнёт публичное слушание при трёх подписях.|puede iniciar audiencia pública con tres firmas.|三人が署名すれば公開審理を始められる。|三人签名便可启动公开听证。|세 명이 서명하면 공개 심리를 시작할 수 있다.
236|отмечает безопасное окно погружения до закрытия врат.|marca un intervalo seguro de buceo antes de cerrar la puerta.|門が閉じる前の安全な潜水時間を示す。|标记关闸前的安全潜水间隔。|관문이 닫히기 전 안전한 잠수 간격을 표시한다.
239|хранит прежнюю исповедь и обещание жилья арендаторам.|guarda confesión anterior y una promesa de vivienda a arrendatarios.|以前の告白と借家人への住まいの誓約を持つ。|装有之前的忏悔与佃户住房承诺。|이전 고해와 세입자 주거 약속을 보관한다.
242|показывает украденные годы кредитора рядом с поддержанными пациентами.|muestra años robados de un acreedor junto a pacientes que apoyó.|債権者の盗んだ年月を支援した患者の隣に映す。|显示债权人窃取的岁月及其支持的病人。|채권자가 훔친 세월을 지원한 환자 옆에 보여 준다.
245|позволяет утонувшему распорядителю узнать спасателей.|permite al ujier ahogado reconocer al grupo de rescate.|溺れた案内人が救助隊と認識できる。|让溺亡引座员认出救援队。|익사한 안내인이 구조대를 알아보게 한다.
248|доказывает, кто оплатил отливку и кто не получил платы.|prueba quién pagó la colada y quién quedó sin cobrar.|鋳造費を払った者と未払いの者を証明する。|证明谁支付铸造费，谁未获报酬。|누가 주조비를 냈고 누가 돈을 못 받았는지 증명한다.
251|прекращает одну подписку, не выписывая невиновных пациентов.|termina una suscripción sin dar de alta a pacientes inocentes.|無実の患者を退院させず会費を一つ終える。|终止一项认捐而不赶走无辜病人。|무고한 환자를 퇴원시키지 않고 약정 하나를 끝낸다.
254|освещает воздушный карман, но фитиль живёт одну сцену.|ilumina una bolsa de aire, pero la mecha dura una escena.|空気溜まりを照らすが芯は一場面分だけ持つ。|照亮气穴，但灯芯只够一个场景。|공기주머니를 비추지만 심지는 한 장면만 간다.
257|для действия требует живую подпись и оплаченное обязательство.|necesita firma viva y obligación pagada para sostenerse.|有効にするには生者の署名と義務の支払いが必要だ。|需活人签名与已付义务才能有效。|효력을 유지하려면 살아 있는 서명과 지불된 의무가 필요하다.
260|передаёт лечение честному донору с ограниченными ресурсами.|transfiere cuidados a un donante honesto de recursos limitados.|限られた資源の誠実な寄付者に治療を移す。|把照护转给资源有限的诚实捐赠人。|한정된 자원의 정직한 기부자에게 치료를 이전한다.
263|открывает сухой путь, если верхний город уменьшит потребление.|abre una ruta seca si la ciudad alta reduce consumo.|上の町が消費を減らせば乾いた道を開く。|上城区降低耗水后可开干燥路线。|윗마을이 소비를 줄이면 마른 길을 연다.
266|показывает безопасные дома, которые не нужно отдавать.|muestra hogares seguros que no es necesario entregar.|引き渡さなくてよい安全な家を示す。|显示不必交出的安全住宅。|넘겨줄 필요가 없는 안전한 집을 보여 준다.
269|может разоблачить покровителя, но также раскрывает уязвимых пациентов.|puede revelar al patrono, pero también identifica pacientes vulnerables.|後援者を暴けるが弱い患者の身元も示す。|能揭露赞助者，但也暴露脆弱病人。|후원자를 폭로할 수 있지만 취약한 환자도 드러낸다.
272|вернёт имя певца, если его историю точно расскажут.|devuelve el nombre de un cantante si se cuenta bien su historia.|物語を正確に語れば歌手の名を戻す。|准确讲述歌者故事便可归还名字。|이야기를 정확히 말하면 가수의 이름을 돌려준다.
275|сломает колокол или изменит приказ, пока он горячий.|puede romper la campana o cambiar su mandato mientras está caliente.|鐘が熱い間に壊すか命令を変えられる。|钟热时可打碎或重塑其命令。|종이 뜨거울 때 깨뜨리거나 명령을 바꿀 수 있다.
278|записывает независимые показания, не раскрывая медицинские записи.|registra testimonios independientes sin revelar registros médicos.|医療記録を明かさず独立証言を記す。|记录独立证词而不泄露医疗记录。|의료 기록을 드러내지 않고 독립 증언을 기록한다.
281|держит двух ныряльщиков и одного певца одновременно.|sostiene dos buzos y un cantante a la vez.|潜水者二人と歌手一人を同時に支える。|一次支撑两名潜水员与一名歌者。|한 번에 잠수부 둘과 가수 하나를 지탱한다.
284|оплачивает зарплаты, сохраняя общую обязанность жилья.|paga salarios manteniendo obligación compartida de vivienda.|共有の住居義務を残しつつ賃金を払う。|支付工资，同时保留共享住房义务。|공동 주거 의무를 유지하며 임금을 지불한다.
287|сохраняет лечение после утраты двором хартии.|preserva tratamiento tras perder la corte su carta.|宮廷が憲章を失った後も治療を守る。|宫廷失去宪章后仍保留治疗。|궁정이 헌장을 잃어도 치료를 유지한다.
290|хранит список затонувшего прихода в открытой долговечной записи.|conserva la lista parroquial ahogada en un registro público duradero.|溺れた教区の名簿を公の長持ちする記録に保つ。|将被淹教区名单保存在公开持久记录中。|수몰 교구 명부를 공개적이고 오래가는 기록에 보관한다.''')
clauses_add('''293|карета объявляет погребение наследника до заката.|el carruaje anuncia entierro del heredero antes del ocaso.|馬車が日没前の後継者の埋葬を告げる。|马车宣布日落前埋葬继承人。|마차가 해 지기 전에 후계자 매장을 알린다.
296|команде предлагают лечение в обмен на безымянные подписи.|se ofrece cuidado al equipo a cambio de firmas sin nombre.|一行は名なき署名と引き換えに治療を提案される。|团队获提供照护，代价是无名签字。|일행이 이름 없는 서명을 대가로 치료를 제안받는다.
299|колодцы города повторяют просьбу певца о верёвке.|los pozos repiten la petición de cuerda de un cantante.|町の井戸が歌手の綱を求める声を繰り返す。|镇上水井重复歌者索要绳索的恳求。|마을 우물들이 밧줄을 달라는 가수의 부탁을 되풀이한다.
302|имя ещё одного арендатора появляется под живым наследником.|aparece otro nombre de arrendatario bajo el heredero vivo.|生きた後継者の下に別の借家人の名が現れる。|另一个佃户名字出现在活继承人之下。|살아 있는 후계자 아래 다른 세입자의 이름이 나타난다.
305|пациент просыпается моложе, пока донор исчезает.|un paciente despierta más joven mientras desaparece un donante.|寄付者が消える一方、患者は若くなって目覚める。|捐赠人消失时，病人醒来更年轻。|기부자가 사라지는 동안 환자가 더 젊게 깨어난다.
308|испуганный страж останавливает единственное безопасное окно погружения.|un guardián asustado detiene el único intervalo de buceo seguro.|怯えた守護者が唯一の安全な潜水時間を止める。|受惊守卫停止唯一安全潜水间隔。|겁먹은 수호자가 유일한 안전한 잠수 간격을 멈춘다.
311|приставы приносят печать, выданную до смерти прежнего наследника.|alguaciles traen un sello emitido antes de morir el heredero anterior.|前の後継者の死より前の印を執行吏が持ってくる。|执达吏带来前继承人死前签发的印章。|집행관들이 이전 후계자가 죽기 전에 발급된 인장을 가져온다.
314|отражение разоблачает кого-то в зале как кредитора.|un reflejo revela a alguien del salón como acreedor.|反射が舞踏室の一人を債権者と明かす。|倒影揭露舞厅中一人为债权人。|반사상이 무도회장 누군가를 채권자로 드러낸다.
317|Том зажигает лампу под поверхностью водохранилища.|Tom enciende una lámpara bajo la superficie del embalse.|トムが貯水池の水面下で灯をともす。|汤姆在水库水面下点灯。|톰이 저수지 수면 아래에서 램프를 켠다.
320|литейщики отказываются от ремонта, повторяющего прежнюю эксплуатацию.|los fundidores rechazan una reparación que repite la vieja explotación.|鋳造者は古い搾取を繰り返す修理を拒む。|铸钟工拒绝重复旧剥削的修缮。|주조공들이 옛 착취를 되풀이하는 수리를 거부한다.
323|просительница согласна говорить, если личные записи останутся закрыты.|una peticionaria hablará si los registros privados siguen sellados.|私的記録を封じたままなら請願者は話す。|请愿人同意发言，条件是私密记录保持封存。|청원자가 비공개 기록을 봉인해 두면 말하겠다고 한다.
326|инженеры просят команду выбрать район, который лишится воды.|ingenieros piden elegir qué barrio pierde agua.|技師がどの地区の水を止めるか一行に選ばせる。|工程师请团队选择哪个社区失去供水。|기술자들이 어느 동네가 물을 잃을지 일행에게 선택하라고 한다.
329|лошади подходят к мосту, везя пустой гроб.|los caballos se acercan al puente con un ataúd vacío.|馬が空の棺を運び橋に近づく。|马拉着空棺靠近桥。|말들이 빈 관을 싣고 다리로 다가온다.
332|посредник предлагает меньший долг, всё ещё связывающий невиновную семью.|el corredor ofrece una deuda menor que aún vincula a una familia inocente.|仲買人は無実の家族をなお縛る小さな負債を出す。|中间人提议较小债务，却仍束缚无辜家庭。|중개인이 무고한 가족을 여전히 묶는 작은 빚을 제안한다.
335|два уцелевших списка расходятся в имени слуги.|dos listas supervivientes discrepan sobre el nombre de un sirviente.|生き残った二つの名簿が使用人の名で食い違う。|两份幸存名单对仆人的名字意见不一。|남은 두 명부가 하인의 이름에 관해 다르다.
338|управляющий признаёт удержание платы ради защиты наследников.|el administrador admite retener salarios para proteger herederos.|管理人は後継者を守るため賃金を差し止めたと認める。|管家承认为保护继承人而扣留工资。|관리인이 후계자를 보호하려고 임금을 보류했다고 인정한다.
341|покровители грозят прекратить лечение до начала слушания.|los patronos amenazan con cerrar cuidados antes de la audiencia.|後援者は審理前に治療を閉じると脅す。|赞助者威胁在听证开始前停止照护。|후원자들이 심리 전에 치료를 닫겠다고 위협한다.
344|ныряльщику нужна помощь, пока последний воздушный карман хора сжимается.|un buzo necesita ayuda mientras mengua la última bolsa de aire del coro.|最後の合唱の空気溜まりが縮む中、潜水者が援助を求める。|唱诗班最后气穴缩小时，潜水员需要援助。|합창단 마지막 공기주머니가 줄어드는 동안 잠수부에게 도움이 필요하다.
347|горячий колокол можно изменить в одно окно публичного свидетельства.|la campana caliente puede reformarse durante una oportunidad pública de testimonio.|熱い鐘は一度の公開立会いの間に作り替えられる。|热钟可在一次公开见证窗口内重塑。|뜨거운 종을 한 번의 공개 증언 기회 동안 바꿀 수 있다.
350|пациент даст показания, если лечение останется гарантированным.|un paciente testificará si el tratamiento sigue garantizado.|治療が保証されれば患者が証言する。|若治疗仍获保证，病人愿作证。|치료가 계속 보장되면 환자가 증언한다.
353|последний промежуток откачки открывает старые водяные врата.|el último intervalo de bombeo revela la vieja compuerta.|最後の排水間隔が古い水門を見せる。|最后抽水间隔显露旧水闸。|마지막 양수 간격에 옛 수문이 드러난다.
356|семьи решают, брать ли совместную ответственность за ремонт.|las familias deciden si asumen responsabilidad conjunta de reparaciones.|家族は共同の修理責任を引き受けるか決める。|家庭决定是否接受联合维修责任。|가족들이 공동 수리 책임을 받을지 결정한다.
359|двор намерен похоронить прошение под торжественной церемонией.|la corte intenta enterrar la petición bajo una gran ceremonia.|宮廷は盛大な儀式で請願を埋めようとする。|宫廷企图以盛大典礼掩埋请愿书。|궁정이 성대한 의식 아래 청원을 묻으려 한다.
362|хор отказывается от эвакуации до поминовения пропущенного слуги.|el coro rechaza evacuar hasta recordar al sirviente omitido.|合唱団は外された使用人を記憶するまで避難しない。|唱诗班拒绝疏散，直到遗漏的仆人被铭记。|누락된 하인을 기억하기 전에는 합창단이 대피를 거부한다.
365|карета ждёт подтверждения, что плата дошла до живых семей.|el carruaje espera pruebas de que salarios llegaron a familias vivas.|馬車は賃金が生きた家族に届いた証拠を待つ。|马车等待工资已送达活人家庭的证明。|마차가 임금이 살아 있는 가족에게 전달된 증거를 기다린다.
368|честный фонд предлагает ограниченные койки и прозрачные обязанности.|un fondo honesto ofrece camas limitadas y obligaciones transparentes.|誠実な基金は限られた病床と透明な義務を出す。|诚实基金提供有限床位与透明义务。|정직한 기금이 제한된 침상과 투명한 의무를 제안한다.
371|верхний город видит цену соглашения о водохранилище.|la ciudad alta ve el coste del acuerdo del embalse.|上の町は貯水池合意の代償を見る。|上城区看到水库协议的代价。|윗마을이 저수지 협정의 대가를 본다.
374|новый звон отражает решение команды о похоронном обещании.|un nuevo tañido refleja el acuerdo sobre la promesa funeraria.|新たな鐘の音が葬儀の約束についての一行の和解を映す。|新钟声反映团队对葬礼承诺的解决。|새 종소리가 장례 약속에 대한 일행의 합의를 반영한다.
377|признание двора меняет управление благотворительным лечением.|la confesión de la corte cambia quién gobierna cuidados benéficos.|宮廷の告白が慈善治療の管理者を変える。|宫廷坦白改变谁治理慈善照护。|궁정의 고백이 자선 치료 관리자를 바꾼다.
380|последний гимн называет тех, кого город решил сохранить.|el himno final nombra a quienes el pueblo decidió preservar.|最後の聖歌は町が残すと決めた人々の名を呼ぶ。|最终圣歌说出镇决定保留的人名。|마지막 찬송이 마을이 보존하기로 선택한 이들의 이름을 부른다.''')
clauses_add('''383|Цель: остановить первое изъятие. Оспорьте реестр или укройте наследницу; промедление приводит карету к мосту.|Objetivo: parar la primera incautación. Cuestiona el registro o refugia a la heredera; la demora lleva el carruaje al puente.|目的：最初の差押えを止める。名簿に異議を唱えるか後継者をかくまう。遅れると馬車が橋に来る。|目标：阻止首次征收。质疑登记册或庇护继承人；拖延会让马车抵达桥。|목표: 첫 압수를 막는다. 명부에 이의를 제기하거나 후계자를 숨겨라. 지체하면 마차가 다리로 온다.
386|Цель: узнать кредитора благотворительности. Проверьте квитанции или опросите выздоравливающего пациента; промедление забирает ещё одного донора.|Objetivo: identificar al acreedor benéfico. Examina recibos o entrevista a un paciente que mejora; la demora toma otro donante.|目的：慈善の債権者を特定する。領収書を調べるか回復患者に聞く。遅れると別の寄付者が奪われる。|目标：查明慈善债权人。检查收据或访问康复病人；拖延会带走另一捐赠人。|목표: 자선의 채권자를 찾는다. 영수증을 조사하거나 회복 중인 환자를 면담하라. 지체하면 다른 기부자가 잡혀간다.
389|Цель: найти запертый хор. Следуйте графику откачки или ответьте стиху; промедление закрывает безопасную лестницу.|Objetivo: hallar el coro atrapado. Sigue el horario de bombeo o responde al verso; la demora cierra la escalera segura.|目的：閉じ込められた合唱団を探す。排水表を追うか詩に答える。遅れると安全な階段が閉じる。|目标：找到被困唱诗班。遵循抽水日程或回应诗句；拖延会关闭安全楼梯。|목표: 갇힌 합창단을 찾는다. 양수 일정을 따르거나 시구에 답하라. 지체하면 안전한 계단이 닫힌다.
392|Цель: сохранить показания арендаторов. Защитите могилы или договоритесь об отсрочке выселения; промедление рассеивает свидетелей.|Objetivo: preservar testimonios de arrendatarios. Protege tumbas o negocia suspensión del desalojo; la demora dispersa testigos.|目的：借家人の証言を守る。墓を守るか立ち退き延期を交渉する。遅れると証人が散る。|目标：保留佃户证词。保护墓穴或协商暂停驱逐；拖延会使见证人四散。|목표: 세입자 증언을 보존한다. 무덤을 보호하거나 퇴거 유예를 협상하라. 지체하면 증인이 흩어진다.
395|Цель: установить исходные условия долга. Расспросите покровителя или найдите зеркало; промедление возобновляет подписку.|Objetivo: establecer términos originales de deuda. Interroga al patrono o recupera un espejo; la demora renueva una suscripción.|目的：負債の元の条件を定める。後援者に問うか鏡を回収する。遅れると会費が更新される。|目标：确定债务原始条款。询问赞助者或收回镜子；拖延会续订认捐。|목표: 빚의 원래 조건을 확립한다. 후원자를 묻거나 거울을 회수하라. 지체하면 약정이 갱신된다.
398|Цель: добраться до Тома. Отправьте верёвочную команду или восстановите обход; промедление гасит его фонарь.|Objetivo: llegar a Tom. Envía un equipo de cuerda o restaura el derivador; la demora apaga su farol.|目的：トムに届く。綱班を送るか迂回路を戻す。遅れると灯が消える。|目标：到达汤姆处。派绳索队或恢复旁路；拖延会熄灭他的灯。|목표: 톰에게 도달한다. 밧줄조를 보내거나 우회로를 복구하라. 지체하면 그의 등불이 꺼진다.
401|Цель: обеспечить ремонт колокола. Оплатите литейщиков или верните удержанную плату; промедление заставляет звонить новое имя.|Objetivo: asegurar reparación de la campana. Paga a fundidores o recupera salarios retenidos; la demora hace sonar otro nombre.|目的：鐘の修理を確保する。鋳造者に払うか保留賃金を回収する。遅れると別の名に鐘が鳴る。|目标：确保修钟。支付铸工或追回扣留工资；拖延会使钟呼唤新名字。|목표: 종 수리를 확보한다. 주조공에게 지불하거나 보류 임금을 되찾아라. 지체하면 새 이름으로 종이 울린다.
404|Цель: собрать трёх независимых свидетелей. Защитите публичных выступающих или сохраните закрытые показания; промедление закрывает слушание.|Objetivo: reunir tres testigos independientes. Protege a oradores públicos o preserva testimonio sellado; la demora cierra la audiencia.|目的：独立証人を三人集める。公に話す者を守るか封じた証言を保つ。遅れると審理が閉じる。|目标：召集三位独立见证人。保护公开发言者或保留封存证词；拖延会关闭听证。|목표: 독립 증인 세 명을 모은다. 공개 발언자를 보호하거나 봉인된 증언을 보존하라. 지체하면 심리가 닫힌다.
407|Цель: вернуть пропущенного певца. Восстановите список слуг или договоритесь с солистом; промедление разделяет хор.|Objetivo: recuperar al cantante omitido. Restaura la lista de sirvientes o negocia con el solista; la demora divide el coro.|目的：外された歌手を戻す。使用人名簿を回復するか独唱者と取引する。遅れると合唱団が分かれる。|目标：找回遗漏歌者。恢复仆人名单或与独唱者谈判；拖延会分裂唱诗班。|목표: 누락된 가수를 되찾는다. 하인 명부를 복원하거나 독창자와 거래하라. 지체하면 합창단이 갈라진다.
410|Цель: урегулировать связывающее обязательство. Найдите старую исповедь или пересмотрите обещание поместья; промедление разрешает выселение.|Objetivo: resolver la obligación vinculante. Recupera la confesión antigua o renegocia la promesa de la finca; la demora autoriza desalojo.|目的：縛る義務を合意する。古い告白を回収するか屋敷の誓約を再交渉する。遅れると立ち退きが許可される。|目标：解决约束义务。收回旧忏悔或重谈庄园承诺；拖延会授权驱逐。|목표: 구속 의무를 합의한다. 옛 고해를 되찾거나 영지 약속을 재협상하라. 지체하면 퇴거가 허가된다.
413|Цель: сохранить лечение при раскрытии. Оплатите нейтральные койки или ограничьте передачу хартии; промедление бросает пациентов.|Objetivo: preservar tratamiento durante revelación. Financia camas neutrales o limita transferencia de la carta; la demora abandona pacientes.|目的：公表中も治療を守る。中立の病床に資金を出すか憲章の移転を制限する。遅れると患者が捨てられる。|目标：揭露时维持治疗。资助中立床位或限制宪章转让；拖延会遗弃病人。|목표: 폭로 중 치료를 유지한다. 중립 침상을 지원하거나 헌장 이전을 제한하라. 지체하면 환자들이 버려진다.
416|Цель: эвакуировать певцов. Удержите врата или сократите воду верхнего города; промедление затапливает хоры.|Objetivo: evacuar cantantes. Mantén la puerta o reduce consumo de la ciudad alta; la demora inunda la tribuna.|目的：歌手を避難させる。門を保持するか上の町の水を減らす。遅れると聖歌隊席が水没する。|目标：疏散歌者。守住闸门或减少上城区耗水；拖延会淹没楼台。|목표: 가수들을 대피시킨다. 관문을 유지하거나 윗마을 물 사용을 줄여라. 지체하면 성가대석이 잠긴다.
419|Цель: остановить последние похороны. Представьте освобождение при свидетелях или измените колокол; промедление забирает наследницу.|Objetivo: detener el último funeral. Presenta liberación ante testigos o reforma la campana; la demora toma a la heredera.|目的：最後の葬儀を止める。立会い付き解放を示すか鐘を作り替える。遅れると後継者が奪われる。|目标：停止最终葬礼。呈交有见证的解除书或重塑钟；拖延会带走继承人。|목표: 마지막 장례를 막는다. 증인이 있는 해제를 제시하거나 종을 바꿔라. 지체하면 후계자가 잡혀간다.
422|Цель: прекратить кровавый долг. Отмените подписку или вынудите признание; промедление даёт покровителям связать нового донора.|Objetivo: terminar la deuda de sangre. Revoca la suscripción o obliga a confesar; la demora permite vincular otro donante.|目的：血の負債を終える。会費を撤回するか告白させる。遅れると後援者が新たな寄付者を縛る。|目标：终止血债。撤销认捐或迫使坦白；拖延会让赞助者束缚新捐赠人。|목표: 피의 빚을 끝낸다. 약정을 철회하거나 고백을 강제하라. 지체하면 후원자가 새 기부자를 묶는다.
425|Цель: гарантировать безопасное возвращение. Откройте обход или договоритесь об общей обязанности водохранилища; промедление запирает спасателей.|Objetivo: garantizar regreso seguro. Abre el derivador o acuerda un deber compartido del embalse; la demora atrapa a rescatadores.|目的：安全な帰還を保証する。迂回路を開くか貯水池の共同義務を合意する。遅れると救助隊が閉じ込められる。|目标：保证安全返回。开旁路或议定共享水库责任；拖延会困住救援队。|목표: 안전한 귀환을 보장한다. 우회로를 열거나 공동 저수지 의무를 합의하라. 지체하면 구조대가 갇힌다.
428|Цель: решить управление поместьем. Защитите жильё арендаторов или создайте фонд платы; запишите, кто держит обещание.|Objetivo: decidir gobierno de la finca. Protege vivienda de arrendatarios o crea un fondo salarial; anota quién mantiene la promesa.|目的：屋敷の統治を決める。借家人の住まいを守るか賃金信託を作り、約束の担い手を記録する。|目标：决定庄园治理。保护佃户住房或建立工资信托；记录谁承担承诺。|목표: 영지 관리를 결정한다. 세입자 주거를 보호하거나 임금 신탁을 만들고 누가 약속을 지킬지 기록하라.
431|Цель: выбрать честное лечение. Передайте хартию или установите надзор пациентов; запишите, чьи долги остаются.|Objetivo: elegir cuidados honestos. Transfiere la carta o establece supervisión de pacientes; anota qué deudas quedan.|目的：誠実な治療を選ぶ。憲章を移すか患者の監督を設け、誰の負債が残るか記録する。|目标：选择诚实照护。转让宪章或建立病人监督；记录谁的债仍存在。|목표: 정직한 치료를 선택한다. 헌장을 이전하거나 환자 감독을 세우고 누구의 빚이 남는지 기록하라.
434|Цель: решить, как сохранится память. Опубликуйте полный список или назначьте хранителей; запишите, кто содержит безопасный водный путь.|Objetivo: decidir cómo perdura la memoria. Publica la lista completa o nombra custodios; anota quién mantiene la ruta de agua segura.|目的：記憶の存続を決める。完全な名簿を公開するか守り手を任命し、安全な水路の維持者を記録する。|目标：决定纪念如何延续。公布完整名单或任命保管人；记录谁维护安全水路。|목표: 기억이 남을 방법을 정한다. 전체 명부를 공개하거나 지킴이를 임명하고 안전한 물길의 유지자를 기록하라.''')
clauses_add('''437|заверит старые обещания и защищает семью арендаторов.|puede autenticar promesas antiguas y protege a una familia arrendataria.|古い約束を認証でき、借家人の家族を守る。|能认证旧承诺并保护一户佃户家庭。|옛 약속을 인증할 수 있고 세입자 가족을 보호한다.
440|сохраняет безопасность пациентов, противостоя кредитору благотворительности.|protege pacientes al confrontar al acreedor benéfico.|慈善の債権者と対峙しつつ患者を守る。|面对慈善债权人时保障病人安全。|자선 채권자에 맞서며 환자를 안전하게 지킨다.
443|знает безопасную лестницу, и близкий человек остался в потерянном приходе.|conoce la escalera segura y tiene a un ser querido en la parroquia perdida.|安全な階段を知り、失われた教区に愛する人がいる。|知道安全楼梯，所爱之人在失落教区。|안전한 계단을 알며 잃어버린 교구에 사랑하는 사람이 있다.
446|меняет связывающий металл и отказывается от неоплаченной работы.|reforma metal vinculante y rechaza trabajo sin pago.|縛る金属を作り替え、無給労働を拒む。|重塑约束金属，拒绝无偿劳动。|구속하는 금속을 바꾸고 무급 노동을 거부한다.
449|сохраняет показания, не используя личные страдания.|preserva testimonio sin explotar sufrimiento privado.|私的な苦しみを利用せず証言を守る。|保留证词，不利用私人痛苦。|사적인 고통을 이용하지 않고 증언을 보존한다.
452|восстанавливает потерянные имена и ведёт спасательный список.|reconstruye nombres perdidos y conserva la lista de rescate.|失われた名を再現し救助名簿を持つ。|重建失落名字并保留救援名单。|잃어버린 이름을 복원하고 구조 명부를 유지한다.
455|договаривается о жилье с живыми наследниками.|puede negociar deberes de vivienda con herederos vivos.|生きた後継者と住居義務を交渉できる。|可与活继承人协商住房义务。|살아 있는 후계자와 주거 의무를 협상할 수 있다.
458|финансирует честное лечение и отвечает за его ограничения.|puede financiar tratamiento honesto y explicar sus límites.|誠実な治療に資金を出し、その限界を説明できる。|可资助诚实治疗并说明其限制。|정직한 치료를 지원하고 그 한계를 설명할 수 있다.
461|заслужите доверие оплатой унаследованного долга без жертв арендаторов; получите доступ к поместью и обязанности содержания.|gana confianza pagando obligaciones heredadas sin sacrificar arrendatarios; obtén acceso a la finca y deberes de mantenimiento.|借家人を犠牲にせず継承義務を払い信頼を得る。屋敷への接近権と維持義務を得る。|不牺牲佃户地偿还继承义务以赢得信任；获得庄园访问权与维护责任。|세입자를 희생시키지 않고 상속 의무를 지불해 신뢰를 얻고 영지 접근권과 유지 의무를 얻어라.
464|заслужите доверие прекращением долга без оставления пациентов; получите контакт лечебницы и надзор за лечением.|gana confianza terminando deuda sin abandonar pacientes; obtén contacto clínico y supervisión del tratamiento.|患者を捨てず負債を終え信頼を得る。診療所の連絡先と治療監督を得る。|不抛弃病人地终结债务以赢得信任；获得诊所联系人与治疗监督权。|환자를 버리지 않고 빚을 끝내 신뢰를 얻고 진료소 연락책과 치료 감독권을 얻어라.
467|заслужите доверие именованием забытых мёртвых; получите доступ к приходу и обязанности публичной записи.|gana confianza nombrando muertos omitidos; obtén acceso parroquial y deberes de registro público.|除外された死者を名指し信頼を得る。教区への接近権と公開記録義務を得る。|说出遗漏死者之名以赢得信任；获得教区访问权与公开记录责任。|누락된 죽은 이의 이름을 불러 신뢰를 얻고 교구 접근권과 공개 기록 의무를 얻어라.
470|заслужите доверие изменением звона оплаченной работой; получите поддержку литейной и обязанности платы.|gana confianza reformando el tañido con trabajo pagado; obtén apoyo de fundición y obligaciones salariales.|有給労働で鐘を変えて信頼を得る。鋳造所の支援と賃金義務を得る。|付薪劳动重塑钟声以赢得信任；获得铸造厂支持与工资义务。|유급 노동으로 종소리를 바꾸어 신뢰를 얻고 주조소 지원과 임금 의무를 얻어라.
473|заслужите доверие отделением исповеди от личного вреда; получите доступ к слушанию и обязанности конфиденциальности.|gana confianza separando confesión de daño privado; obtén acceso a audiencias y deberes de confidencialidad.|告白と私的な害を分け信頼を得る。審理への接近権と守秘義務を得る。|区分忏悔与私人伤害以赢得信任；获得听证访问权与保密责任。|고해와 사적인 피해를 분리해 신뢰를 얻고 심리 접근권과 비밀 유지 의무를 얻어라.
476|заслужите доверие сохранением спасения и городского снабжения; получите власть шлюза и совместные обязанности ремонта.|gana confianza preservando rescate y agua del pueblo; obtén autoridad sobre compuertas y deberes compartidos de mantenimiento.|救助と町の給水を守り信頼を得る。水門権限と共同保守義務を得る。|同时保护救援与城镇供水以赢得信任；获得水闸权威与共享维护责任。|구조와 마을 물 공급을 함께 지켜 신뢰를 얻고 수문 권한과 공동 유지 의무를 얻어라.
479|золотые свечные метки свидетелей и чёрные пути кареты отделяют приют от связывающих могил.|marcas doradas de testigos y rutas negras de carruajes separan refugio de tumbas vinculantes.|蝋燭色の金の証人印と黒い馬車の道で避難所と縛る墓を分ける。|烛金见证标记与黑色马车路线区分庇护所和束缚墓穴。|촛불 금빛 증인 표시와 검은 마차 경로가 쉼터와 구속하는 무덤을 구분한다.
483|винно-красные печати и бледные зеркала отделяют публичные доказательства от личных медицинских записей.|sellos rojo vino y espejos pálidos separan pruebas públicas de registros médicos privados.|葡萄酒色の印と淡い鏡で公開証拠と私的医療記録を分ける。|酒红印章与苍白镜面区分公开证据和私密医疗记录。|와인빛 인장과 창백한 거울이 공개 증거와 비공개 의료 기록을 구분한다.
486|синие полосы глубины и серебряные ленты имён отмечают безопасную воду и память утонувших.|bandas azules de profundidad y cintas plateadas de nombres marcan agua segura y memoria ahogada.|青い深度帯と銀の名のリボンで安全な水と溺れた追悼を示す。|蓝色深度带与银色姓名丝带标记安全水域和溺亡纪念。|파란 깊이 띠와 은빛 이름 리본이 안전한 물과 익사자 추모를 표시한다.''')
for l in langs:
 shared=json.load(open(Path(__file__).parent.parent/'post-apocalypse'/(l+'.json')))
 for k in src:
  if k in shared and k not in maps[l]:maps[l][k]=shared[k]
art={'map schematic':'схема карты|esquema de mapa|地図の模式図|地图示意图|지도 도식','location schematic':'схема локации|esquema de ubicación|場所の模式図|地点示意图|장소 도식','portrait schematic':'схема портрета|esquema de retrato|肖像の模式図|肖像示意图|초상 도식','creature schematic':'схема существа|esquema de criatura|生物の模式図|生物示意图|생물 도식','item schematic':'схема предмета|esquema de objeto|アイテムの模式図|物品示意图|아이템 도식','background schematic':'схема фона|esquema de fondo|背景の模式図|背景示意图|배경 도식'}
for k in src:
 if ': ' in k and k.rsplit(': ',1)[1] in art:
  n,a=k.rsplit(': ',1);add(k,'|'.join(maps[l][n]+': '+w for l,w in zip(langs,art[a].split('|'))))
first={0:'Готический ужас|Horror Gótico|ゴシックホラー|哥特恐怖|고딕 호러',1:'Исследователи раскрывают личные трагедии, соблазнительные тайны и чудовищ за респектабельными дверями.|Investigadores descubren tragedias íntimas, secretos seductores y monstruos tras puertas respetables.|調査者は親密な悲劇、誘惑する秘密、立派な扉の裏の怪物を暴く。|调查者揭露亲密悲剧、诱人秘密与体面门后的怪物。|조사자들이 내밀한 비극과 유혹적인 비밀, 점잖은 문 뒤의 괴물을 밝힌다.',2:'расследовать|investigar|調査|调查|조사',3:'защищать|proteger|守る|保护|보호',4:'освободить|liberar|解放|释放|해방',5:'помнить|recordar|記憶|记忆|기억',6:'Траурное графство|Condado de Luto|喪の郡|哀悼郡|애도의 군',7:'Деревня наследует поместье, чьи похоронные колокола звонят по живым наследникам. Расследуйте погребённое обещание, защитите названные семьи и выберите способ прекратить обязательство.|Un pueblo hereda una finca cuyas campanas funerarias tañen por herederos vivos. Investiga una promesa enterrada, protege familias nombradas y elige cómo terminar su obligación.|村は生きた後継者に葬儀の鐘が鳴る屋敷を相続する。埋もれた約束を調べ、名指された家族を守り、義務の終わらせ方を選ぶ。|村庄继承一处为活继承人鸣丧钟的庄园。调查埋葬的承诺，保护被指名家庭，选择如何终结义务。|마을이 살아 있는 후계자를 위해 장례 종이 울리는 영지를 물려받는다. 묻힌 약속을 조사하고 이름 불린 가족을 지키며 의무를 끝낼 방법을 선택하라.',8:'Бархатный двор|Corte de Terciopelo|ベルベットの宮廷|丝绒宫廷|벨벳 궁정',9:'Респектабельный двор скрывает кровавый долг за приглашениями и благотворительным лечением. Сохраните свидетелей, противостаньте покровителям и решите, может ли публичное признание разрушить договор.|Una corte respetable oculta deuda de sangre tras invitaciones y cuidados benéficos. Protege testigos, confronta a patronos y decide si una confesión pública rompe el contrato.|立派な宮廷は招待と慈善治療の裏に血の負債を隠す。証人を守り、後援者と対峙し、公の告白で契約を破れるか決める。|体面宫廷把血债藏在邀请与慈善照护之后。保护见证人，对抗赞助者，决定公开坦白能否破约。|점잖은 궁정이 초대와 자선 치료 뒤에 피의 빚을 숨긴다. 증인을 지키고 후원자에 맞서며 공개 고백으로 계약을 깰 수 있는지 결정하라.',10:'Утонувший хор|Coro Ahogado|溺れた合唱団|溺亡唱诗班|익사한 합창단',11:'Собор под водохранилищем поёт через городские колодцы. Найдите пропавший хор, восстановите безопасный водный путь и решите, кто обязан помнить затонувший приход.|Una catedral bajo el embalse canta por los pozos del pueblo. Encuentra al coro perdido, restaura una ruta de agua segura y decide quién debe recordar la parroquia ahogada.|貯水池の下の大聖堂は町の井戸を通して歌う。失われた合唱団を探し、安全な水路を戻し、誰が溺れた教区を記憶すべきか決める。|水库下的教堂通过镇上水井歌唱。找到失踪唱诗班，恢复安全水路，决定谁须铭记被淹教区。|저수지 아래 대성당이 마을 우물을 통해 노래한다. 잃어버린 합창단을 찾고 안전한 물길을 복구하며 누가 수몰 교구를 기억해야 하는지 결정하라.',12:'Верните засвидетельствованное обещание или исходный договор|Recupera una promesa atestiguada o contrato original|立会いの約束か原契約を回収する|收回有见证的承诺或原始契约|증언된 약속이나 원래 계약을 되찾아라',13:'Защитите свидетелей, пациентов и арендаторов от взыскания|Protege testigos, pacientes y arrendatarios del cobro|証人、患者、借家人を取り立てから守る|保护见证人、病人与佃户免遭征收|증인, 환자, 세입자를 징수에서 지켜라',14:'Противостаньте связывающему долгу через выбор при свидетелях|Confronta una deuda vinculante mediante una elección atestiguada|立会いの選択で縛る負債に対峙する|通过有见证的抉择对抗约束债务|증인이 있는 선택으로 구속하는 빚에 맞서라',15:'Запишите, кто обязан обеспечивать лечение, плату и память|Anota quién debe cuidados, salarios y memoria|治療、賃金、追悼の義務者を記録する|记录谁负担照护、工资与纪念|누가 치료, 임금, 기억을 책임지는지 기록하라',18:'Начните с похоронной кареты, ждущей живого наследника.|Comienza con un carruaje funerario esperando a un heredero vivo.|生きた後継者を待つ葬儀馬車から始める。|从等候活继承人的葬礼马车开始。|살아 있는 후계자를 기다리는 장례 마차로 시작하라.',19:'Покажите, что проклятие вызвано настоящим неоплаченным обязательством.|Muestra que la maldición surge de una obligación real impaga.|呪いが本物の未払い義務から来ると示す。|展示诅咒来自真实未付义务。|저주가 실제 미지급 의무에서 비롯됨을 보여라.',20:'Сохраните показания арендаторов и приют как альтернативы насилию.|Mantén testimonio y refugio de arrendatarios como alternativas a violencia.|借家人の証言と避難場所を暴力の代案として残す。|保留佃户证词与庇护作为暴力的替代。|세입자 증언과 쉼터를 폭력의 대안으로 유지하라.',21:'Запишите, кто оплачивает унаследованную плату и содержит поместье.|Anota quién paga salarios heredados y mantiene la finca.|継承賃金の支払者と屋敷の維持者を記録する。|记录谁支付继承工资并维护庄园。|누가 상속된 임금을 지불하고 영지를 유지하는지 기록하라.',24:'Начните в лечебнице с выздоровевшим пациентом и исчезнувшим донором.|Comienza en la enfermería con un paciente recuperado y un donante desaparecido.|回復患者と消えた寄付者のいる診療所から始める。|从医务室、康复病人与消失捐赠人开始。|회복한 환자와 사라진 기부자가 있는 진료소에서 시작하라.',25:'Придайте благотворительному лечению реальную ценность, не оправдывая скрытую цену.|Da valor real a los cuidados benéficos sin justificar su precio oculto.|隠れた代償を正当化せず慈善治療に本当の価値を持たせる。|赋予慈善照护真实价值，但不为隐藏代价开脱。|숨은 대가를 변명하지 않으면서 자선 치료에 실제 가치를 부여하라.',26:'Отделите публичные показания от личных записей пациентов.|Separa testimonio público de registros íntimos de pacientes.|公の証言を親密な患者記録から分ける。|区分公开证词与私密病人记录。|공개 증언과 내밀한 환자 기록을 분리하라.',27:'Запишите пределы честного фонда лечения и оставшиеся обязательства.|Anota límites del fondo honesto y obligaciones restantes.|誠実な治療基金の限界と残る義務を記録する。|记录诚实照护基金的限制与剩余义务。|정직한 치료 기금의 한계와 남은 의무를 기록하라.',30:'Начните с гимна при утреннем наборе воды города.|Abre con un himno durante la recogida matinal de agua.|町の朝の水汲みから響く聖歌で始める。|从镇上晨间取水传出的圣歌开始。|마을의 아침 물 긷기에서 울리는 찬송으로 시작하라.',31:'Ясно сообщите промежуток откачки и вместимость спасения.|Indica claramente intervalo de bombeo y capacidad de rescate.|排水間隔と救助能力を明確に示す。|明确说明抽水间隔与救援能力。|양수 간격과 구조 수용력을 명확히 알려라.',32:'Дайте пропавшим слугам имена и причину требовать памяти.|Da nombres a sirvientes perdidos y un motivo para exigir memoria.|失われた使用人に名と追悼を求める理由を与える。|给失踪仆人名字与要求铭记的理由。|잃어버린 하인들에게 이름과 기억을 요구할 이유를 주어라.',33:'Запишите полный список прихода и соглашение о безопасной воде.|Anota la lista parroquial completa y el acuerdo de agua segura.|完全な教区名簿と安全な水の合意を記録する。|记录完整教区名单与安全用水协议。|전체 교구 명부와 안전한 물 협정을 기록하라.'}
for i,v in first.items():add(src[i],v)
for i,n,t in [(16,'Эшвейк|Ashwake|アッシュウェイク|阿什韦克|애시웨이크','A Quiet Inheritance'),(22,'Бархатный двор|Corte de Terciopelo|ベルベットの宮廷|丝绒宫廷|벨벳 궁정','Charity after Midnight'),(28,'Утонувший хор|Coro Ahogado|溺れた合唱団|溺亡唱诗班|익사한 합창단','A Parish Remembered')]:
 for l,w in zip(langs,n.split('|')):maps[l][src[i]]=w+': '+maps[l][t]
for i,c,d in [(17,6,7),(23,8,9),(29,10,11)]:
 for l,v in zip(langs,['Игра на три-четыре часа в мире «{c}»: {d}','Una partida de tres a cuatro horas de {c}: {d}','「{c}」の3～4時間のゲーム：{d}','三至四小时的《{c}》游戏：{d}','{c}의 3~4시간 게임: {d}']):maps[l][src[i]]=v.format(c=maps[l][src[c]],d=maps[l][src[d]])
extra='''Haunted navigation interface|Интерфейс призрачной навигации|Interfaz de navegación embrujada|幽霊のナビゲーション画面|幽灵导航界面|유령 탐색 화면
Urban|Городская|Urbano|都市|城市|도시
Moorland|Вересковая пустошь|Páramo|荒野|荒原|황야
Comfortable|Достаточные|Cómodos|余裕|充裕|여유
Fading|Убывающие|Menguantes|衰退|衰减|쇠퇴
Destitute|Нищета|Indigencia|窮乏|赤贫|궁핍
Investigator|Следователь|Investigador|調査者|调查员|조사자
Hunter|Охотник|Cazador|狩人|猎人|사냥꾼
Investigative role|Следственная роль|Rol investigador|調査の役割|调查角色|조사 역할
Reason|Разум|Razón|理性|理性|이성
Nerve|Самообладание|Temple|胆力|胆识|담력
Occult|Оккультизм|Ocultismo|神秘|神秘学|오컬트
Gothic Horror portrait|Портрет готического ужаса|Retrato de Horror Gótico|ゴシックホラーの肖像|哥特恐怖肖像|고딕 호러 초상
Composure|Хладнокровие|Compostura|平静|镇定|평정
Insight|Проницательность|Perspicacia|洞察|洞察|통찰
Silver Pistol|Серебряный пистолет|Pistola de plata|銀の拳銃|银手枪|은빛 권총
Investigation Case|Следственный чемодан|Maletín de investigación|調査用ケース|调查工具箱|조사 도구함
Spirit Lens|Линза духов|Lente espiritual|霊のレンズ|灵体透镜|영혼 렌즈
Laudanum|Лауданум|Láudano|アヘンチンキ|鸦片酊|아편 팅크
Hunter's Coat|Плащ охотника|Abrigo del cazador|狩人の外套|猎人外套|사냥꾼 외투
Ritual Chalk|Ритуальный мел|Tiza ritual|儀式のチョーク|仪式粉笔|의식 분필
Society Signet|Печать общества|Sello de la sociedad|協会の印章|社团印章|결사 인장
Pale Vampire|Бледный вампир|Vampiro pálido|蒼白の吸血鬼|苍白吸血鬼|창백한 흡혈귀
Inspector Vale|Инспектор Вейл|Inspector Vale|ヴェイル警部|韦尔警官|베일 경감
Grave Revenant|Могильный призрак|Aparecido de tumba|墓の亡者|墓穴亡魂|무덤 망자
Haunted|Преследуемый призраками|Embrujado|憑かれた|闹鬼|귀신 들림
Focused|Сосредоточен|Concentrado|集中|专注|집중
Warded|Под оберегом|Protegido por magia|結界|结界保护|결계 보호
Use Silver Pistol|Использовать серебряный пистолет|Usar pistola de plata|銀の拳銃を使う|使用银手枪|은빛 권총 사용
Spend Insight|Потратить проницательность|Gastar perspicacia|洞察を消費|消耗洞察|통찰 사용'''
for row in extra.splitlines():k,v=row.split('|',1);add(k,v)
add('Coastal','Прибрежная|Costero|沿岸|海岸|해안')
for l in langs:
 assert set(src)==set(maps[l]),set(src)-set(maps[l])
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Gothic base:',len(src))
