# coding: utf-8
import json
from pathlib import Path
src=json.load(open(Path(__file__).resolve().parents[1]/'sources'/'dark-fantasy.json')); langs=['ru','es','ja','zh-CN','ko']; maps={l:{} for l in langs}
def add(k,v):
 a=v.split('|'); assert len(a)==5,(k,a)
 for l,x in zip(langs,a):maps[l][k]=x
# Every entry below translates the complete authored source clause.
data='''Dawn Wardens|Стражи рассвета|Guardianes del Alba|夜明けの守護者|黎明守卫|새벽 수호자
Nameless House|Безымянный дом|Casa sin Nombre|名なき家|无名之家|이름 없는 집
Pilgrim Kitchen|Кухня паломников|Cocina de Peregrinos|巡礼者の炊事場|朝圣厨房|순례자 부엌
March Freeholders|Вольные землевладельцы марок|Propietarios Libres de las Marcas|辺境の自由農民|边境自由民|변경 자유민
Thorn Court|Терновый двор|Corte de Espinas|茨の宮廷|荆棘宫廷|가시 궁정
Ash Hospice|Пепельный приют|Hospicio de Ceniza|灰の療養所|灰烬疗养院|잿빛 요양원
Bell Witnesses|Свидетели колокола|Testigos de la Campana|鐘の証人|钟之见证者|종의 증인
River Coven|Речной ковен|Aquelarre del Río|川の魔女団|河流女巫团|강의 마녀회
Sunless Granary|Зернохранилище без солнца|Granero sin Sol|陽なき穀倉|无日粮仓|태양 없는 곡창
House without Doors|Дом без дверей|Casa sin Puertas|扉なき家|无门之家|문 없는 집
Pilgrim Causeway|Дамба паломников|Calzada de Peregrinos|巡礼者の土手道|朝圣堤道|순례자의 둑길
Bell Tower|Колокольня|Campanario|鐘楼|钟塔|종탑
Thorn Registry|Терновый реестр|Registro de Espinas|茨の名簿所|荆棘登记处|가시 등록소
Tenant Furrows|Борозды арендаторов|Surcos de Arrendatarios|小作人の畝|佃户田垄|소작인의 밭고랑
River Naming Stone|Речной камень имён|Piedra del Nombre del Río|川の命名石|河流命名石|강의 작명석
Saint's Rest|Отдых святого|Descanso del Santo|聖人の休息地|圣者休憩地|성자의 쉼터
Oath Hearing Yard|Двор суда клятв|Patio de Audiencia del Juramento|誓いの審理広場|誓约听证庭|맹세 심리 마당
Mirror Nursery|Зеркальная детская|Guardería de Espejos|鏡の養育室|镜之育儿室|거울 보육실
Open Well|Открытый колодец|Pozo Abierto|開かれた井戸|开放水井|열린 우물
Warden Elian Rook|Страж Элиан Рук|Guardián Elian Rook|守護者エリアン・ルーク|守卫埃利安·鲁克|수호자 엘리안 루크
Caretaker Siva Blank|Опекун Сива Бланк|Cuidadora Siva Blank|世話人シヴァ・ブランク|看护西瓦·布兰克|보호자 시바 블랭크
Cook Mara Ash|Повар Мара Эш|Cocinera Mara Ash|料理人マラ・アッシュ|厨师玛拉·阿什|요리사 마라 애시
Farmer Ivo Reed|Фермер Иво Рид|Granjero Ivo Reed|農夫イヴォ・リード|农夫伊沃·里德|농부 이보 리드
Witch Tessa Thorn|Ведьма Тесса Торн|Bruja Tessa Thorn|魔女テッサ・ソーン|女巫泰莎·索恩|마녀 테사 손
Healer Ren Cinder|Целитель Рен Синдер|Sanador Ren Cinder|治療師レン・シンダー|医者伦·辛德|치유사 렌 신더
Bellkeeper Ada Vane|Смотрительница колокола Ада Вейн|Campanera Ada Vane|鐘守エイダ・ヴェイン|守钟人艾达·韦恩|종지기 에이다 베인
Child Neri Glass|Ребёнок Нери Гласс|Niño Neri Glass|子供ネリ・グラス|孩子内里·格拉斯|아이 네리 글래스
Saint Oren Vale|Святой Орен Вейл|Santo Oren Vale|聖人オレン・ヴェイル|圣者奥伦·韦尔|성자 오렌 베일
Captain Pell Dusk|Капитан Пелл Даск|Capitán Pell Dusk|ペル・ダスク隊長|佩尔·达斯克队长|펠 더스크 대장
Witness Fia River|Свидетельница Фиа Ривер|Testigo Fia River|証人フィア・リバー|见证人菲娅·里弗|증인 피아 리버
Porter Juno Moss|Носильщик Джуно Мосс|Porteador Juno Moss|運び手ジュノ・モス|搬运工朱诺·莫斯|짐꾼 주노 모스
Archivist Bea Soot|Архивист Беа Сут|Archivista Bea Soot|文書係ベア・スート|档案员贝娅·苏特|기록관 베아 수트
Tutor Kai Mirror|Наставник Кай Миррор|Tutor Kai Mirror|教師カイ・ミラー|导师凯·米勒|교사 카이 미러
Patient Rosa Fen|Пациентка Роза Фен|Paciente Rosa Fen|患者ローザ・フェン|病人罗莎·芬|환자 로사 펜
Messenger Sol Furrow|Гонец Сол Фарроу|Mensajero Sol Furrow|伝令ソル・ファロー|信使索尔·弗罗|전령 솔 퍼로
Heir Mei Briar|Наследница Мей Брайар|Heredera Mei Briar|後継者メイ・ブライア|继承人梅·布赖尔|후계자 메이 브라이어
Herbalist Noa Well|Травник Ноа Уэлл|Herborista Noa Well|薬草師ノア・ウェル|草药师诺亚·韦尔|약초사 노아 웰
Miller Len Dusk|Мельник Лен Даск|Molinero Len Dusk|粉屋レン・ダスク|磨坊主伦·达斯克|방앗간 주인 렌 더스크
Mediator Dev Name|Посредник Дев Нейм|Mediador Dev Name|仲介者デヴ・ネーム|调解员德夫·奈姆|중재자 데브 네임
Guard Tess Gate|Стражница Тесс Гейт|Guardia Tess Gate|衛兵テス・ゲート|卫兵泰丝·盖特|경비병 테스 게이트
Scout Ash Lamp|Разведчик Эш Ламп|Explorador Ash Lamp|斥候アッシュ・ランプ|侦察兵阿什·兰普|정찰병 애시 램프
Singer Kira Reed|Певица Кира Рид|Cantante Kira Reed|歌手キラ・リード|歌手基拉·里德|가수 키라 리드
Pilgrim Taro Rest|Паломник Таро Рест|Peregrino Taro Rest|巡礼者タロ・レスト|朝圣者太郎·雷斯特|순례자 타로 레스트
Levy Knight|Рыцарь подати|Caballero del Tributo|徴税騎士|征税骑士|징세 기사
Name Collector|Сборщик имён|Recaudador de Nombres|名の徴収者|名字收集者|이름 수집가
Penance Marshal|Маршал покаяния|Mariscal de Penitencia|贖罪の執行官|忏悔执法官|참회 집행관
Hollow Sun Hound|Пёс полого солнца|Sabueso del Sol Hueco|虚ろな太陽の猟犬|空日猎犬|빈 태양의 사냥개
Thorn Bailiff|Терновый пристав|Alguacil de Espinas|茨の執行吏|荆棘执达吏|가시 집행관
Ash Censer|Пепельная кадильница|Incensario de Ceniza|灰の香炉|灰烬香炉|재의 향로
Gate Revenant|Призрак врат|Aparecido de la Puerta|門の亡者|门之亡魂|관문의 망자
Mirror Leech|Зеркальная пиявка|Sanguijuela del Espejo|鏡の蛭|镜之水蛭|거울 거머리
Pilgrim Extortioner|Вымогатель у паломников|Extorsionador de Peregrinos|巡礼者の恐喝者|朝圣勒索者|순례자 갈취꾼
Granary Guard|Страж зернохранилища|Guardia del Granero|穀倉の番人|粮仓守卫|곡창 경비병
Pact Eraser|Стиратель пакта|Borrador del Pacto|盟約の抹消者|契约抹除者|계약 지우개
Saint's Jailer|Тюремщик святого|Carcelero del Santo|聖人の看守|圣者狱卒|성자의 간수
Dusk Swarm|Сумеречный рой|Enjambre del Ocaso|夕闇の群れ|暮色虫群|황혼의 무리
House Usurer|Ростовщик дома|Usurero de la Casa|家の高利貸し|家族放债人|가문의 고리대금업자
Token Forger|Фальшивомонетчик жетонов|Falsificador de Fichas|証票の偽造者|凭证伪造者|증표 위조범
Oath Devourer|Пожиратель клятв|Devorador de Juramentos|誓い喰い|噬誓者|맹세 포식자
Thorn Wraith|Терновый призрак|Espectro de Espinas|茨の幽鬼|荆棘幽灵|가시 망령
Procession Echo|Эхо процессии|Eco de la Procesión|行列の残響|游行回声|행렬의 메아리
First Bell Contract|Первый договор колокола|Primer Contrato de la Campana|最初の鐘の契約|第一钟约|첫 종의 계약
Child Sign Book|Книга детских жестов|Libro de Señas Infantiles|子供の手話帳|儿童手势册|아이의 손짓 책
Recovery Record|Запись выздоровления|Registro de Recuperación|回復記録|康复记录|회복 기록
Dawn Clapper|Язык рассветного колокола|Badajo del Alba|夜明けの鐘の舌|黎明钟舌|새벽 종의 추
Broken Pact Seal|Печать нарушенного пакта|Sello del Pacto Roto|破られた盟約の封印|破约印章|깨진 계약의 봉인
Hospice Ration Key|Ключ пайков приюта|Llave de Raciones del Hospicio|療養所の食糧庫の鍵|疗养院配给钥匙|요양원 배급 열쇠
Tenant Seed Sack|Мешок семян арендаторов|Saco de Semillas de Arrendatarios|小作人の種袋|佃户种子袋|소작인의 씨앗 자루
Common Naming Verse|Общий стих имён|Verso Común de los Nombres|共同命名の詩|共同命名诗句|공동 작명 시구
Rest Charter|Хартия отдыха|Carta del Descanso|休息の憲章|休息宪章|휴식 헌장
Levy Chest Receipt|Квитанция сундука податей|Recibo del Cofre del Tributo|徴税箱の受領書|税箱收据|징세 상자 영수증
Mirror Chalk|Зеркальный мел|Tiza de Espejo|鏡のチョーク|镜面粉笔|거울 분필
Well Test Strip|Полоска для проверки воды|Tira de Prueba del Pozo|井戸の検査紙|井水试纸|우물 검사 시험지
Repair Covenant|Соглашение о ремонте|Convenio de Reparación|修理の盟約|修缮契约|수리 협약
River Witness Cord|Речной шнур свидетелей|Cordón de Testigos del Río|川の証人の紐|河流见证绳|강의 증인 끈
Rotating Care List|Список дежурств по уходу|Lista de Cuidados Rotativos|交代看護表|轮班照护表|돌봄 교대표
Decoy Dawn Lantern|Рассветный фонарь-приманка|Farol Señuelo del Alba|夜明けの囮灯|黎明诱饵灯|새벽 유인 등불
Heir Testimony|Показания наследницы|Testimonio de la Heredera|後継者の証言|继承人证词|후계자의 증언
Smoke Filter|Фильтр дыма|Filtro de Humo|煙のフィルター|烟雾过滤器|연기 필터
Universal Protection Copy|Копия всеобщей защиты|Copia de Protección Universal|万人保護の写し|普遍保护条款副本|보편 보호 사본
Nursery Petition|Прошение детской|Petición de la Guardería|養育室の請願|育儿室请愿书|보육실 청원서
Clean Dose Flask|Фляга чистой дозы|Frasco de Dosis Limpia|清潔な投薬瓶|洁净剂量瓶|깨끗한 투약병
Defense Route Map|Карта защитных путей|Mapa de Rutas Defensivas|防衛路の地図|防卫路线图|방어 경로 지도
Unowned Name Register|Ничьей реестр имён|Registro de Nombres sin Dueño|所有者なき名簿|无主姓名册|주인 없는 이름 명부
Open Cure Agreement|Открытое соглашение о лечении|Acuerdo Abierto de Curación|開かれた治療協定|开放治疗协议|열린 치료 협정'''
for row in data.splitlines():k,v=row.split('|',1);add(k,v)
data='''Silent Dawn|Безмолвный рассвет|Alba Silenciosa|静かな夜明け|无声黎明|침묵의 새벽
Forgotten Child|Забытый ребёнок|Niño Olvidado|忘れられた子供|被遗忘的孩子|잊힌 아이
Denied Ration|Отказанный паёк|Ración Denegada|拒まれた食糧|拒发口粮|거부된 배급
Seed Seizure|Изъятие семян|Incautación de Semillas|種の押収|种子没收|씨앗 압수
Heir Recognition|Узнавание наследницы|Reconocimiento de la Heredera|後継者の認識|认出继承人|후계자 알아보기
Unconfessed Recovery|Выздоровление без исповеди|Recuperación sin Confesión|告白なき回復|未经忏悔的康复|고해 없는 회복
Warning Rhythm|Ритм предупреждения|Ritmo de Advertencia|警告の拍子|警报节奏|경고의 박자
Nursery Message|Весть из детской|Mensaje de la Guardería|養育室の伝言|育儿室消息|보육실의 메시지
Bearer Exhaustion|Истощение носителя|Agotamiento del Portador|担い手の疲弊|承载者疲惫|보유자의 탈진
Contract Found|Найденный договор|Contrato Encontrado|見つかった契約|契约寻获|발견된 계약
Registry Lock|Запечатанный реестр|Registro Sellado|名簿の封鎖|登记册封锁|명부 봉쇄
Smoke Diagnosis|Диагноз дыма|Diagnóstico del Humo|煙の診断|烟雾诊断|연기 진단
Tenant Assembly|Собрание арендаторов|Asamblea de Arrendatarios|小作人の集会|佃户大会|소작인 집회
House Threat|Угроза дома|Amenaza de la Casa|家の脅し|家族威胁|가문의 위협
Rest Refusal|Отказ в отдыхе|Descanso Denegado|休息の拒否|拒绝休息|휴식 거부
Field Decoy|Полевая приманка|Señuelo del Campo|畑の囮|田间诱饵|밭의 유인책
Old Verse|Древний стих|Verso Antiguo|古い詩|古老诗句|옛 시구
Dose Trial|Испытание дозы|Prueba de Dosis|投薬試験|剂量试验|투약 시험
Clapper Return|Возвращение языка колокола|Regreso del Badajo|鐘の舌の返還|钟舌归还|종추의 귀환
Mirror Breach|Зеркальный прорыв|Brecha del Espejo|鏡の侵入|镜面突破|거울의 침입
Food Hearing|Слушание о еде|Audiencia sobre Alimentos|食糧の審理|食物听证|식량 심리
Gate Repair|Ремонт врат|Reparación de la Puerta|門の修理|大门修缮|관문 수리
Heir Confession|Признание наследницы|Confesión de la Heredera|後継者の告白|继承人坦白|후계자의 고백
Bearer Petition|Прошение носителя|Petición del Portador|担い手の請願|承载者请愿|보유자의 청원
Oath Reckoning|Расчёт по клятвам|Ajuste de Juramentos|誓いの清算|誓约清算|맹세의 결산
Names Spoken|Названные имена|Nombres Pronunciados|語られた名|说出的名字|불린 이름들
Cure Queue|Очередь за лечением|Cola de Tratamiento|治療の列|治疗队列|치료 대기열
Dawn for Tenants|Рассвет для арендаторов|Alba para Arrendatarios|小作人の夜明け|佃户的黎明|소작인의 새벽
Pact Released|Освобождённый пакт|Pacto Liberado|解かれた盟約|契约解除|풀린 계약
Pilgrimage Ends|Конец паломничества|Fin de la Peregrinación|巡礼の終わり|朝圣终结|순례의 끝
The Bell that Failed|Умолкший колокол|La Campana que Falló|鳴らない鐘|失灵之钟|울리지 않은 종
Names at the Threshold|Имена на пороге|Nombres en el Umbral|敷居の名|门槛上的名字|문턱의 이름들
The Penance Gate|Врата покаяния|La Puerta de Penitencia|贖罪の門|忏悔之门|참회의 관문
Grain under Guard|Зерно под охраной|Grano bajo Guardia|見張られた穀物|受守卫的粮食|감시받는 곡물
The House's Own Debt|Собственный долг дома|La Deuda de la Casa|家自身の負債|家族自己的债|가문 자신의 빚
Smoke in the Hospice|Дым в приюте|Humo en el Hospicio|療養所の煙|疗养院中的烟|요양원의 연기
Fields beyond the Oath|Поля вне клятвы|Campos fuera del Juramento|誓いの外の畑|誓约之外的田地|맹세 밖의 밭
The Mirror Nursery|Зеркальная детская|La Guardería de Espejos|鏡の養育室|镜之育儿室|거울 보육실
A Saint who Must Sleep|Святой, которому нужен сон|Un Santo que Debe Dormir|眠らねばならぬ聖人|必须睡觉的圣者|잠들어야 하는 성자
The First Contract|Первый договор|El Primer Contrato|最初の契約|第一契约|첫 계약
Three Houses at the River|Три дома у реки|Tres Casas junto al Río|川辺の三家|河畔三家族|강가의 세 가문
Water before Confession|Вода прежде исповеди|Agua antes de Confesión|告白より先に水|先饮水后忏悔|고해보다 먼저 물
A Defense Worth Paying|Защита, достойная платы|Una Defensa que Merece Pagarse|払う価値のある防衛|值得付费的防卫|대가를 낼 만한 방어
A Name of One's Own|Собственное имя|Un Nombre Propio|自分の名|属于自己的名字|자신만의 이름
The Queue by Need|Очередь по нужде|La Cola según Necesidad|必要に応じた列|按需排队|필요에 따른 대기열
Dawn for Everyone|Рассвет для всех|Alba para Todos|皆の夜明け|所有人的黎明|모두의 새벽
The Released Pact|Освобождённый пакт|El Pacto Liberado|解かれた盟約|解除的契约|풀려난 계약
The Bearer's Road|Дорога носителя|El Camino del Portador|担い手の道|承载者之路|보유자의 길
Bell Advocate|Защитник колокола|Defensor de la Campana|鐘の代弁者|钟之辩护人|종의 대변인
Name Witness|Свидетель имён|Testigo de Nombres|名の証人|名字见证人|이름의 증인
Hospice Examiner|Исследователь приюта|Examinador del Hospicio|療養所の検査者|疗养院调查员|요양원 조사관
Furrow Guardian|Хранитель борозд|Guardián de los Surcos|畝の守り手|田垄守护者|밭고랑 수호자
River Mediator|Речной посредник|Mediador del Río|川の仲介者|河流调解员|강의 중재자
Bearer Companion|Спутник носителя|Compañero del Portador|担い手の同行者|承载者伙伴|보유자의 동반자
Contract Archivist|Хранитель договоров|Archivista de Contratos|契約の文書係|契约档案员|계약 기록관
Mirror Tutor|Зеркальный наставник|Tutor del Espejo|鏡の教師|镜之导师|거울 교사
Dawn Steward|Распорядитель рассвета|Administrador del Alba|夜明けの世話役|黎明管事|새벽 관리인
Pact Liberator|Освободитель пакта|Liberador del Pacto|盟約の解放者|契约解放者|계약 해방자
Cure Custodian|Хранитель лечения|Custodio de la Cura|治療の守り手|疗法守护者|치료 지킴이
Tenant Defender|Защитник арендаторов|Defensor de Arrendatarios|小作人の擁護者|佃户保护者|소작인 수호자
Name Guardian|Хранитель имён|Guardián de Nombres|名の守護者|名字守护者|이름 수호자
Road Companion|Дорожный спутник|Compañero del Camino|道の仲間|旅途伙伴|길의 동반자
Last Dawn Chart|Карта последнего рассвета|Carta del Último Alba|最後の夜明けの図|最后黎明图|마지막 새벽 도표
River Pact Chart|Карта речного пакта|Carta del Pacto del Río|川の盟約の図|河流契约图|강의 계약 도표
Ash Pilgrim Chart|Карта пепельных паломников|Carta del Peregrino de Ceniza|灰の巡礼図|灰烬朝圣图|재의 순례자 도표'''
for row in data.splitlines():k,v=row.split('|',1);add(k,v)
clauses='''35|охраняют поля колоколом, который не могут звонить без новой семейной клятвы.|protegen los campos con una campana que no pueden tocar sin otro juramento familiar.|新たな世帯の誓いなしに鳴らせない鐘で畑を守る。|用钟守护田地，但没有另一户家庭的誓约便无法敲响。|새로운 가정의 맹세 없이는 울릴 수 없는 종으로 밭을 지킨다.
38|укрывает детей, стёртых долинным пактом имён.|refugia a niños borrados por el pacto de nombres del valle.|谷の命名盟約で消された子供をかくまう。|庇护被山谷命名契约抹除的孩子。|계곡의 작명 계약으로 지워진 아이들을 보호한다.
41|кормит больных и отвергает доказательство покаяния как условие пайка.|alimenta a los enfermos y rechaza exigir penitencia para dar raciones.|病人を養い、食糧の条件として贖罪の証明を求めることを拒む。|给病人食物，拒绝把忏悔证明作为配给条件。|병자들을 먹이며 참회 증명을 배급 조건으로 삼지 않는다.
44|починят врата, если арендаторы получат право голоса в подати стражей.|repararán las puertas si los arrendatarios tienen voz en el tributo de los guardianes.|小作人が守護者の徴税に発言権を得れば門を修理する。|若佃户能对守卫征税发言，就会修缮大门。|소작인에게 수호자의 징세에 대한 발언권을 주면 관문을 수리한다.
47|взыскивает долги имён, скрывая собственное нарушенное обещание.|cobra deudas de nombres mientras oculta su propia promesa incumplida.|自らの破った約束を隠しながら名の負債を取り立てる。|追讨名字债务，却隐瞒自己违背的承诺。|스스로 어긴 약속을 숨기면서 이름의 빚을 징수한다.
50|знает, какие симптомы поддаются лекарству святого.|sabe qué síntomas responden a la cura del santo.|聖人の治療がどの症状に効くか知る。|知道哪些症状对圣者疗法有反应。|성자의 치료가 어떤 증상에 효과가 있는지 안다.
53|хранит первый договор, дающий рассветную защиту каждому жителю.|conserva el primer contrato que concede protección al alba a cada residente.|全住民に夜明けの保護を与える最初の契約を持つ。|持有第一份授予每位居民黎明保护的契约。|모든 주민에게 새벽의 보호를 보장하는 첫 계약을 보유한다.
56|предлагает освободить имена, если дома примут общего свидетеля.|ofrece liberar los nombres si las casas aceptan un testigo común.|各家が共通の証人を受け入れれば名を解放すると提案する。|若家族接受共同见证人，便愿意释放名字。|가문들이 공동 증인을 받아들이면 이름을 풀어 주겠다고 한다.
59|семена здоровы, но стражи оставляют их только присягнувшим семьям.|la semilla sigue sana, pero los guardianes la reservan para hogares juramentados.|種は無事だが、守護者は誓った世帯にのみ取り置く。|种子完好，但守卫只留给宣誓家庭。|씨앗은 멀쩡하지만 수호자들은 맹세한 가정에만 남겨 둔다.
62|дети входят свободно, но их написанные имена исчезают на пороге.|los niños entran libremente, pero sus nombres escritos desaparecen en el umbral.|子供は自由に入れるが、書かれた名は敷居で消える。|孩子可自由进入，但写下的名字会在门槛处消失。|아이들은 자유롭게 들어가지만 적힌 이름은 문턱에서 사라진다.
65|путники в лихорадке стоят в очереди под вратами, требующими жетонов покаяния.|viajeros febriles hacen cola ante una puerta que exige fichas de penitencia.|熱に苦しむ旅人が贖罪の証票を求める門に並ぶ。|发烧的旅人在要求忏悔凭证的大门下排队。|열병에 걸린 여행자들이 참회 증표를 요구하는 관문 아래 줄을 선다.
68|пропавший язык колокола спрятан в сундуке податей.|el badajo desaparecido está oculto en un cofre del tributo.|消えた鐘の舌は徴税箱に隠されている。|失踪的钟舌藏在税箱里。|사라진 종추가 징세 상자 안에 숨겨져 있다.
71|реестр имён записывает детей как залог сделок взрослых.|un libro de nombres registra a los niños como garantía de tratos de adultos.|命名台帳は子供を大人の取引の担保として記す。|命名账簿把孩子列为成年人交易的抵押物。|작명 장부에 아이들이 어른의 거래 담보로 기록되어 있다.
73|пациенту становится лучше без предписанной исповеди.|un paciente mejora sin recitar la confesión prescrita.|患者は指定の告白を唱えずに回復する。|一名病人未念规定的忏悔词也好转了。|환자가 정해진 고해를 읊지 않아도 호전된다.
76|не присягнувшие фермеры растят урожай за защищённой границей.|granjeros no juramentados cultivan fuera del límite protegido.|誓いを立てぬ農民が保護境界の外で作物を育てる。|未宣誓的农民在保护边界之外种植庄稼。|맹세하지 않은 농부들이 보호 경계 밖에서 작물을 기른다.
79|исходный пакт может произнести свидетель всех трёх домов.|un testigo de las tres casas puede pronunciar el pacto original.|三家すべての証人なら元の盟約を唱えられる。|三家族共同的见证人可以念出原始契约。|세 가문 모두의 증인이 원래 계약을 말할 수 있다.
82|живой носитель не может вылечить ещё одну толпу без сна.|el portador vivo no puede curar a otra multitud sin dormir.|生きた担い手は眠らずにもう一群を治せない。|活着的承载者不睡觉便无法治愈另一群人。|살아 있는 보유자는 잠을 자지 않고 또 다른 군중을 치료할 수 없다.
85|стражи должны ответить землевладельцам перед старым договором.|los guardianes deben responder a los propietarios libres ante el antiguo contrato.|守護者は古い契約の前で自由農民に答えねばならない。|守卫必须面对旧契约向自由民作答。|수호자들은 옛 계약 앞에서 자유민들에게 답해야 한다.
88|дети помнят имена друг друга с помощью отражённых знаков.|los niños recuerdan sus nombres mediante señas reflejadas.|子供は鏡に映した手話で互いの名を覚えている。|孩子们通过反射的手势记住彼此的名字。|아이들은 반사된 손짓으로 서로의 이름을 기억한다.
91|лекарство можно развести до безопасных доз, если воду проверят.|la cura puede diluirse en dosis seguras si se analiza el agua.|水を検査すれば治療薬を安全な量に薄められる。|检测井水后，可把药物稀释成安全剂量。|물을 검사하면 치료제를 안전한 용량으로 희석할 수 있다.
94|позвонит для не присягнувших семей, если договор колокола будет доказан.|tocará para los hogares no juramentados si se prueba el contrato de la campana.|鐘の契約が証明されれば誓わぬ世帯のためにも鐘を鳴らす。|若钟约得到证实，就会为未宣誓家庭敲钟。|종의 계약이 입증되면 맹세하지 않은 가정을 위해 종을 울린다.
97|знает жест каждого ребёнка и отказывается от нового выкупа за имена.|conoce la seña de cada niño y rechaza otro rescate de nombres.|全ての子供の手話を知り、再び名の身代金を払うことを拒む。|知道每个孩子的手势，拒绝再次为名字支付赎金。|모든 아이의 손짓을 알며 또 다른 이름 몸값을 거부한다.
100|еды для больных хватит, если солдаты перестанут забирать пайки покаяния.|tiene comida suficiente para los enfermos si los soldados dejan de tomar las raciones de penitencia.|兵士が贖罪の食糧を奪わなければ病人の食事は足りる。|只要士兵停止拿走忏悔配给，就有足够食物给病人。|병사들이 참회 배급을 가져가지 않으면 병자들을 먹일 충분한 음식이 있다.
103|может возглавить ремонт врат после публичного признания потерь арендаторов.|puede dirigir las reparaciones cuando se reconozcan públicamente las pérdidas de los arrendatarios.|小作人の損失が公に認められれば門の修理を指揮できる。|佃户损失获公开承认后，可以带领修门。|소작인의 손실이 공개적으로 인정되면 관문 수리를 이끌 수 있다.
106|нарушила пакт ради наследницы и спрятала долг в реестре.|rompió el pacto para salvar a su heredera y ocultó la deuda en el registro.|後継者を救うため盟約を破り、負債を台帳に隠した。|为救继承人而破约，并把债务藏在登记册里。|후계자를 살리기 위해 계약을 깨고 빚을 명부에 숨겼다.
109|записал выздоровления, не связанные с исповедью, и ищет свидетеля.|registró recuperaciones ajenas a la confesión y busca un testigo.|告白と無関係な回復を記録し、証人を探す。|记录了与忏悔无关的康复，正在寻找见证人。|고해와 무관한 회복을 기록했고 증인을 찾는다.
112|видела, как капитан подати спрятал язык колокола перед голодом.|vio al capitán del tributo esconder el badajo antes de la hambruna.|飢饉の前に徴税隊長が鐘の舌を隠すのを見た。|看到征税队长在饥荒前藏起钟舌。|기근 전에 징세 대장이 종추를 숨기는 것을 보았다.
115|может составить карту детской по отражениям, но боится забыть остальных.|puede trazar la guardería mediante reflejos, pero teme olvidar a los demás.|反射で養育室の地図を作れるが、他の子を忘れるのを恐れる。|能凭反射绘制育儿室地图，却怕忘记其他人。|반사상으로 보육실 지도를 그릴 수 있지만 다른 아이들을 잊을까 두려워한다.
118|хочет отдыха и отказывается навсегда стать пленным лекарством.|quiere descansar y se niega a convertirse en una cura cautiva permanente.|休息を望み、永遠に囚われた治療手段になることを拒む。|想要休息，拒绝永远成为被囚的疗法。|휴식을 원하며 영원히 붙잡힌 치료 수단이 되기를 거부한다.
121|утверждает, что новые клятвы оплачивают защиту, но зерно оставляет своей страже.|afirma que más juramentos financian la defensa, pero guarda su grano para su guardia.|追加の誓いで防衛費を賄うと主張するが、穀物を私兵に渡す。|声称额外誓约资助防卫，却把粮食留给自己的卫队。|추가 맹세가 방어 비용을 댄다고 하지만 그 곡물을 자기 경비대에 남긴다.
124|может возобновить пакт, только если дети говорят за себя.|solo puede renovar el pacto si los niños hablan por sí mismos.|子供が自分で発言する場合にのみ盟約を更新できる。|只有孩子自己发言，才能续订契约。|아이들이 직접 말해야만 계약을 갱신할 수 있다.
127|знает безопасный путь для пациентов, не допущенных в процессию.|conoce una ruta segura para pacientes excluidos de la procesión.|行列から排除された患者の安全な道を知る。|知道被游行拒之门外的病人的安全路线。|행렬에서 배제된 환자들을 위한 안전한 길을 안다.
130|хранит исходный пункт о всеобщей защите под записью о похоронах.|conserva la cláusula original de protección universal bajo un registro funerario.|葬儀記録の下に万人保護の原条項を保管する。|在葬礼记录下保存原始的普遍保护条款。|장례 기록 아래 원래의 보편 보호 조항을 보관한다.
133|учит именам-жестам, неуязвимым для письменного стирания двора.|enseña nombres por señas inmunes al borrado escrito de la corte.|宮廷の文字抹消に影響されない手話の名を教える。|教授不受宫廷文字抹除影响的手势名字。|궁정의 문자 삭제에 지워지지 않는 손짓 이름을 가르친다.
136|выздоровела после чистой воды и спрашивает, зачем всё ещё требуют покаяния.|se recuperó con agua limpia y pregunta por qué aún se exige penitencia.|清潔な水で回復し、なぜまだ贖罪が必要か問う。|喝净水后康复，追问为何仍要求忏悔。|깨끗한 물을 마시고 회복했으며 왜 여전히 참회를 요구하는지 묻는다.
139|может донести договор до слушания прежде, чем солдаты сожгут его.|puede llevar el contrato a la audiencia antes de que los soldados lo quemen.|兵士が焼く前に契約を審理の場に運べる。|能在士兵烧毁契约前把它送到听证会。|병사들이 불태우기 전에 계약을 심리장으로 가져갈 수 있다.
142|признает долг дома, если опекун обещает не брать детей в заложники.|confesará la deuda de la casa si su tutora promete no exigir rescate por niños.|保護者が子供の身代金を求めないと約束すれば家の負債を告白する。|若监护人承诺不拿孩子索赎金，就会坦白家族债务。|보호자가 아이 몸값을 요구하지 않겠다고 약속하면 가문의 빚을 고백한다.
145|может увеличить запас лекарства, но нужна проверка загрязнения.|puede ampliar la cura, pero necesita una prueba de contaminación.|治療薬を増やせるが汚染検査が必要だ。|可以延长药物供应，但需要污染检测。|치료제를 더 오래 쓸 수 있게 하지만 오염 검사가 필요하다.
148|спрятал семена арендаторов и отдаст их при засвидетельствованном соглашении о посеве.|ocultó semillas de arrendatarios y las entregará con un acuerdo de siembra ante testigos.|小作人の種を隠し、立会い付きの播種合意があれば渡す。|藏起佃户种子，会在有见证的播种协议下交出。|소작인의 씨앗을 숨겼으며 증인이 있는 파종 협약을 맺으면 내놓는다.
151|предлагает общий реестр вне владения домов.|ofrece un registro común fuera de la propiedad de las casas.|各家の所有から外れた共同名簿を提案する。|提供不归家族所有的共同登记册。|가문 소유권 밖의 공동 명부를 제안한다.
154|перестанет изымать пайки при законной защите от капитана.|dejará de confiscar raciones si recibe protección legal frente al capitán.|隊長からの法的保護を得れば食糧の押収をやめる。|若获免受队长威胁的合法保护，就停止没收配给。|대장에게서 법적인 보호를 받으면 배급 압수를 멈춘다.
157|отметил защитный путь, не требующий полей арендаторов.|marcó una ruta defensiva que no necesita los campos de los arrendatarios.|小作人の畑を使わない防衛路を記した。|标出无需占用佃户田地的防卫路线。|소작인의 밭이 필요 없는 방어 경로를 표시했다.
160|помнит древний стих имён, услышанный до разделения домов.|recuerda un antiguo verso de nombres de antes de la división de las casas.|各家が分かれる前に聞いた古い命名の詩を覚えている。|记得家族分裂前听到的古老命名诗句。|가문들이 갈라지기 전에 들은 옛 작명 시구를 기억한다.
163|может организовать сменный уход, чтобы Орен покинул процессию.|puede organizar cuidados rotativos para que Oren deje la procesión.|オレンが行列を離れられるよう交代看護を組める。|能安排轮班照护，让奥伦离开游行。|오렌이 행렬을 떠날 수 있도록 교대 돌봄을 구성할 수 있다.'''
for row in clauses.splitlines():i,v=row.split('|',1);i=int(i);key=src[i];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
clauses='''166|изымет урожай не присягнувших и может отступить перед первым договором.|confisca cosechas no juramentadas y puede ceder ante el primer contrato.|誓わぬ者の収穫を押収するが最初の契約で退くこともある。|没收未宣誓者的收成，可在第一契约面前退让。|맹세하지 않은 이의 수확을 압수하지만 첫 계약을 보면 물러날 수 있다.
169|отнимает детские знаки, пока нарушенный долг двора не разоблачён.|toma las señas infantiles salvo que se revele la deuda incumplida de la corte.|宮廷の破った負債が暴かれなければ子供の手話を奪う。|除非宫廷违约债务被揭露，否则夺取孩子的手势。|궁정의 어긴 빚이 드러나지 않으면 아이들의 손짓을 빼앗는다.
172|не отдаёт еду приюту, пока не получит жетон исповеди.|retiene comida del hospicio hasta recibir una ficha de confesión.|告白の証票を渡すまで療養所の食糧を差し止める。|扣留疗养院食物，直到收到忏悔凭证。|고해 증표를 내놓을 때까지 요양원 음식을 주지 않는다.
175|охотится на неосвещённых полях, но следует за фонарём-приманкой прочь от работников.|caza en campos oscuros, pero sigue un farol señuelo lejos de los trabajadores.|暗い畑で狩るが、囮灯を追って働く人から離れる。|在无光田野狩猎，但会追随诱饵灯远离工人。|빛 없는 밭에서 사냥하지만 유인 등불을 따라 일꾼들 곁을 떠난다.
178|запечатывает реестр, чтобы не допустить показаний о наследнице.|sella el registro para impedir testimonios sobre la heredera.|後継者についての証言を防ぐため名簿を封じる。|封闭登记册以阻止有关继承人的证词。|후계자에 대한 증언을 막으려고 명부를 봉인한다.
181|распространяет раздражающий дым, который принимают за вернувшуюся чуму.|difunde humo irritante confundido con el regreso de la peste.|再来した疫病と誤認される刺激性の煙を広める。|散发被误认为瘟疫回归的刺激性烟雾。|돌아온 역병으로 오해받는 자극성 연기를 퍼뜨린다.
184|соблюдает старую границу, игнорируя её пункт о всеобщей защите.|impone el límite antiguo ignorando su cláusula de protección universal.|万人保護の条項を無視し、古い境界を強制する。|执行旧边界规则，却忽视其普遍保护条款。|보편 보호 조항을 무시하면서 옛 경계를 강제한다.
187|питается стёртыми воспоминаниями и отступает перед совместно произнесёнными именами.|se alimenta de recuerdos borrados y retrocede ante nombres dichos en común.|消された記憶を食べ、共に唱える名から逃げる。|吞食被抹除的记忆，面对共同念出的名字便退却。|지워진 기억을 먹으며 함께 말하는 이름 앞에서 물러난다.
190|продаёт поддельные лекарства путникам, не допущенным через врата.|vende curas falsas a viajeros excluidos en la puerta.|門で拒まれた旅人に偽の治療薬を売る。|向被大门拒绝的旅人出售假药。|관문에서 거부된 여행자에게 가짜 치료제를 판다.
193|охраняет личный запас семян капитана по ложному приказу о защите.|defiende el depósito privado de semillas del capitán con una falsa orden defensiva.|偽の防衛命令で隊長の私的な種の隠し庫を守る。|依虚假防卫命令守护队长的私人种子库。|가짜 방어 명령 아래 대장의 개인 씨앗 창고를 지킨다.
196|сжигает знаки, доказывающие, что обещание нарушил двор, а не дети.|quema señas que prueban que la corte, no los niños, rompió la promesa.|子供でなく宮廷が約束を破った証拠の印を焼く。|烧毁证明是宫廷而非孩子违背承诺的符号。|아이들이 아닌 궁정이 약속을 어겼다는 표식을 불태운다.
199|утверждает, что носитель не может уйти, пока все паломники не очистятся.|afirma que el portador no puede irse hasta purificar a todos los peregrinos.|巡礼者全員が清められるまで担い手は去れないと主張する。|声称所有朝圣者净化前承载者不得离开。|모든 순례자가 정화되기 전에는 보유자가 떠날 수 없다고 한다.
202|следует треснувшему ритму колокола, и его можно выманить за поля.|sigue el ritmo roto de la campana y puede atraerse fuera de los campos.|ひび割れた鐘の拍子に従い、畑の外に誘い出せる。|跟随破裂钟声的节奏，可被引出田野。|갈라진 종의 박자를 따라가며 밭 너머로 유인할 수 있다.
205|предлагает вернуть имена в обмен на вечный труд в детской.|ofrece restaurar nombres a cambio de trabajo perpetuo en la guardería.|養育室での永遠の労働と引き換えに名の回復を提案する。|以在育儿室永久劳动为条件恢复名字。|보육실에서 영원히 일하는 대가로 이름 복원을 제안한다.
208|наживается на покаянной системе врат и хранит список покупателей.|se beneficia del sistema de penitencia de la puerta y tiene una lista de compradores.|門の贖罪制度で儲け、購入者の名簿を持つ。|从大门忏悔制度获利，并持有买家名单。|관문의 참회 체계로 이익을 보며 구매자 명단을 가진다.
211|поглощает обещания, навязанные голодным фермерам, но слабеет перед добровольным ремонтом.|consume promesas impuestas a granjeros hambrientos, pero se debilita ante reparaciones voluntarias.|飢えた農民への強制の約束を食べるが、自発的な修理には弱まる。|吞噬强迫饥饿农民作出的承诺，却在自愿修缮前衰弱。|굶주린 농부에게 강요된 약속을 먹지만 자발적인 수리 앞에서는 약해진다.
214|охраняет подавленный стих, называющий дома ответственными сторонами.|guarda un verso censurado que nombra a las casas como partes responsables.|各家を責任当事者とする封じられた詩を守る。|守护被压制的诗句，其中指出家族是责任方。|가문들을 책임 당사자로 지목하는 억압된 시구를 지킨다.
217|унаследованное правило повторяет требования покаяния после утраты лечебного смысла.|una regla heredada repite exigencias de penitencia cuando su fin curativo ya terminó.|古い規則が治療の目的を失った後も贖罪の要求を繰り返す。|继承的规则在治疗目的结束后仍重复要求忏悔。|물려받은 규칙이 치료 목적이 끝난 뒤에도 참회를 요구한다.
220|обещает защиту всем жителям, а не только присягнувшим владельцам.|promete protección a todos los residentes, no solo a propietarios juramentados.|誓った所有者だけでなく全住民の保護を約束する。|承诺保护所有居民，而非仅宣誓的业主。|맹세한 소유주뿐 아니라 모든 주민에게 보호를 약속한다.
223|сохраняет жесты, пока двор стирает написанные имена.|conserva gestos mientras la corte borra los nombres escritos.|宮廷が書かれた名を消す間も手話を保存する。|在宫廷抹除书写名字时保留手势。|궁정이 적힌 이름을 지울 때도 손짓을 보존한다.
226|отделяет улучшения от чистой воды от навязанных исповедей.|distingue mejoras por agua limpia de confesiones impuestas.|清潔な水による改善を強制された告白から区別する。|区分净水带来的改善与强制忏悔。|깨끗한 물로 인한 호전과 강요된 고해를 구분한다.
229|может восстановить сигнальный колокол после засвидетельствования кражи.|puede restaurar la campana de alarma tras atestiguar su robo.|盗難が証言されれば警告の鐘を復旧できる。|盗窃被见证后可修复警报钟。|도난이 증언되면 경고 종을 복구할 수 있다.
232|доказывает, что наследницу спасли за счёт детей.|prueba que se salvó a la heredera a costa de los niños.|子供を犠牲に後継者を救った証拠になる。|证明继承人获救是以孩子为代价。|아이들을 희생시켜 후계자를 살렸음을 증명한다.
235|открывает склад, изъятый маршалом покаяния.|abre un almacén incautado por el mariscal de penitencia.|贖罪の執行官が押収した倉庫を開く。|打开被忏悔执法官没收的仓库。|참회 집행관이 압수한 창고를 연다.
238|позволяет сеять вне подати, если организована защита.|permite sembrar fuera del tributo si se organiza la defensa.|防衛を手配すれば徴税外で種をまける。|安排防卫后可在征税范围外播种。|방어를 마련하면 징세 밖에서 파종할 수 있다.
241|может восстановить имена, не приписывая их дому.|puede restaurar nombres sin asignarlos a una casa.|家に帰属させずに名を回復できる。|能恢复名字而不将其分配给家族。|가문에 귀속시키지 않고 이름을 복원할 수 있다.
244|гарантирует святому безопасный отдых и право уйти.|garantiza al santo descanso seguro y derecho a irse.|聖人の安全な休息と去る権利を保証する。|保证圣者安全休息与离开的权利。|성자의 안전한 휴식과 떠날 권리를 보장한다.
247|связывает изъятое зерно с личной стражей капитана.|vincula el grano confiscado con la guardia privada del capitán.|押収穀物を隊長の私兵に結びつける。|将没收粮食与队长私人卫队联系起来。|압수된 곡물과 대장의 사설 경비대를 연결한다.
250|позволяет детям отмечать путь без написанных имён.|permite a los niños marcar su ruta sin nombres escritos.|子供が文字の名を使わず道を記せる。|让孩子不用书写名字也能标记路线。|아이들이 이름을 적지 않고 길을 표시하게 한다.
253|выявляет раздражающее загрязнение до разведения лекарства.|detecta contaminación irritante antes de diluir la cura.|治療薬を薄める前に刺激物汚染を見つける。|稀释药物前识别刺激物污染。|치료제를 희석하기 전에 자극성 오염을 찾아낸다.
256|обменивает работу арендаторов на вратах на подотчётный график защиты.|cambia trabajo de arrendatarios en las puertas por un plan defensivo responsable.|小作人の門の修理を、説明責任ある防衛計画と交換する。|以佃户修门劳动换取负责任的防卫日程。|소작인의 관문 노동을 책임 있는 방어 일정과 교환한다.
259|связывает трёх представителей, не передавая детские долги.|vincula a tres representantes sin transferir deudas infantiles.|子供の負債を移さずに三人の代表を結ぶ。|联结三位代表而不转移孩子的债务。|아이들의 빚을 이전하지 않고 대표 세 명을 묶는다.
262|сохраняет доступ к лечению, пока носитель отдыхает.|mantiene disponible el tratamiento mientras descansa el portador.|担い手が休む間も治療を利用できるようにする。|承载者休息时维持治疗供应。|보유자가 쉬는 동안에도 치료를 유지한다.
265|уводит солнечного пса от посевных бригад.|aleja al sabueso solar de las cuadrillas de siembra.|太陽の猟犬を播種班から引き離す。|把太阳猎犬引离播种队。|태양 사냥개를 파종 작업반에게서 유인한다.
268|может разоблачить нарушенное обещание, не объявляя другого ребёнка залогом.|puede revelar la promesa rota sin poner a otro niño como garantía.|他の子供を担保にせず破られた約束を暴ける。|能揭露违约承诺而不把另一个孩子列为抵押。|다른 아이를 담보로 삼지 않고 어긴 약속을 드러낼 수 있다.
271|защищает пациентов приюта от пепельной кадильницы.|protege a pacientes del hospicio del incensario de ceniza.|療養所の患者を灰の香炉から守る。|保护疗养院病人免受灰烬香炉伤害。|요양원 환자들을 재의 향로에서 보호한다.
274|может пережить уничтожение колокольного архива.|puede sobrevivir a la destrucción del archivo de la campana.|鐘の文書庫が破壊されても残る。|即使钟的档案库被毁仍能保存。|종의 기록보관소가 파괴되어도 살아남을 수 있다.
277|излагает собственные условия детей по восстановлению имён.|expone las condiciones de los niños para restaurar sus nombres.|名の回復に関する子供自身の条件を示す。|陈述孩子对恢复名字提出的自身条件。|이름 복원에 대한 아이들 자신의 조건을 적는다.
280|предлагает отмеренное лекарство вместо платы исповедью.|ofrece una cura medida en vez de pagar con confesión.|告白の支払いの代わりに計量した治療薬を提供する。|提供定量药物而非以忏悔付款。|고해를 대가로 요구하지 않고 정량 치료제를 제공한다.
283|отмечает патрули, сохраняющие борозды арендаторов.|marca patrullas que preservan los surcos de los arrendatarios.|小作人の畝を壊さない巡回路を示す。|标记不破坏佃户田垄的巡逻路线。|소작인의 밭고랑을 보존하는 순찰을 표시한다.
286|записывает личности с правом исправления и удаления.|registra identidades con derecho a revisarlas o eliminarlas.|変更と削除の権利を伴って身元を記録する。|记录身份，并允许修改或删除。|수정하거나 삭제할 권리와 함께 정체성을 기록한다.
289|задаёт приоритет лечения и запрещает владеть носителем в плену.|fija prioridades de tratamiento e impide poseer cautivo al portador.|治療の優先度を定め、担い手を囚人として所有することを防ぐ。|规定治疗优先次序，防止囚禁占有承载者。|치료 우선순위를 정하고 보유자를 감금하여 소유하는 것을 막는다.'''
for row in clauses.splitlines():i,v=row.split('|',1);key=src[int(i)];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
clauses='''292|колокол молчит, пока солдаты подати требуют новых клятв.|la campana falla mientras soldados del tributo exigen nuevos juramentos.|徴税兵が新たな誓いを要求する中、鐘が鳴らない。|征税士兵要求新誓约时钟失灵。|징세 병사들이 새 맹세를 요구하는 동안 종이 울리지 않는다.
295|мать не может прочесть имя, написанное мгновение назад.|una madre no puede leer el nombre que escribió hace un instante.|母親が先ほど書いた名を読めない。|一位母亲读不出自己刚写的名字。|어머니가 방금 적은 이름을 읽지 못한다.
298|маршал отказывает путнику в лихорадке без жетона покаяния.|el mariscal rechaza a un viajero febril sin ficha de penitencia.|執行官は贖罪の証票のない熱病の旅人を拒む。|执法官拒绝没有忏悔凭证的发烧旅人。|집행관이 참회 증표 없는 열병 여행자를 돌려보낸다.
301|капитан приказывает перенести зерно арендаторов в свой сундук.|el capitán ordena trasladar grano de los arrendatarios a su cofre.|隊長は小作人の穀物を自分の箱へ運ぶよう命じる。|队长命令把佃户粮食移入自己的箱子。|대장이 소작인의 곡물을 자기 상자로 옮기라고 명령한다.
304|стёртый ребёнок узнаёт наследницу ведьмы по старой детской.|un niño borrado reconoce a la heredera de la bruja de la antigua guardería.|消された子供が昔の養育室で知った魔女の後継者を見分ける。|被抹除的孩子认出曾在旧育儿室的女巫继承人。|지워진 아이가 옛 보육실에서 본 마녀의 후계자를 알아본다.
307|пациенту становится лучше после чистой воды и отдыха.|un paciente mejora tras agua limpia y descanso.|患者は清潔な水と休息で回復する。|病人喝净水并休息后好转。|환자가 깨끗한 물과 휴식 뒤에 호전된다.
310|треснувший колокол привлекает псов, а не отпугивает.|la campana agrietada atrae sabuesos en vez de ahuyentarlos.|ひび割れた鐘は猟犬を追い払わず呼び寄せる。|破裂的钟吸引猎犬而非驱赶。|갈라진 종이 사냥개를 쫓지 않고 불러들인다.
313|дети общаются зеркальными жестами, которые двор не может стереть.|los niños se comunican con señas reflejadas que la corte no puede borrar.|子供は宮廷が消せない鏡の手話で話す。|孩子以宫廷无法抹除的镜面手势交流。|아이들이 궁정이 지울 수 없는 거울 손짓으로 소통한다.
316|Орен падает после принудительного публичного лечения.|Oren se desploma tras una cura pública forzada.|オレンが強制された公開治療の後に倒れる。|奥伦在被强迫公开治疗后倒下。|오렌이 강요된 공개 치료 뒤에 쓰러진다.
319|пункт о всеобщей защите обнаруживается в похоронном архиве.|la cláusula de protección universal aparece en un archivo funerario.|葬儀文書庫で万人保護の条項が見つかる。|普遍保护条款出现在葬礼档案中。|장례 기록보관소에서 보편 보호 조항이 발견된다.
322|пристав запечатывает записи до показаний детей.|el alguacil sella los registros antes de que los niños testifiquen.|子供が証言する前に執行吏が記録を封じる。|执达吏在孩子作证前封存记录。|집행관이 아이들이 증언하기 전에 기록을 봉인한다.
325|раздражающее вещество кадильницы признают источником ложных симптомов.|el irritante del incensario se identifica como causa de síntomas falsos.|香炉の刺激物が偽の症状の原因と判明する。|香炉中的刺激物被认定为虚假症状的来源。|향로의 자극물이 가짜 증상의 원인으로 밝혀진다.
328|фермеры предлагают ремонтный труд, если правила подати станут публичными.|los granjeros ofrecen reparar si se publican las reglas del tributo.|徴税規則が公表されれば農民は修理労働を提供する。|农民愿提供维修劳动，条件是征税规则公开。|농부들이 징세 규칙이 공개되면 수리 노동을 제공하겠다고 한다.
331|Тесса грозит новым проклятием при разоблачении её нарушенного обещания.|Tessa amenaza con otra maldición si se revela su promesa rota.|破った約束が暴かれればテッサは新たな呪いをかけると脅す。|泰莎威胁：若她违背的承诺被揭露，就施加新诅咒。|테사는 어긴 약속이 드러나면 새 저주를 내리겠다고 위협한다.
334|тюремщик запрещает сменный уход, называя его дезертирством.|el carcelero bloquea cuidados rotativos y los llama deserción.|看守は交代看護を脱走と呼んで阻止する。|狱卒阻止轮班照护，称之为逃亡。|간수가 돌봄 교대를 막으며 탈영이라 부른다.
337|путь фонарей может увести псов ценой выделения дозорной команды.|una ruta de faroles puede alejar sabuesos al coste de un equipo de vigilancia.|見張り班の負担で、灯の道が猟犬を引き離せる。|灯笼路线可引开猎犬，代价是安排守望队。|등불 경로로 사냥개를 유인할 수 있지만 감시조를 배치해야 한다.
340|Кира вспоминает формулу имён, подотчётную общим свидетелям.|Kira recuerda una fórmula de nombres responsable ante testigos comunes.|キラは共同証人への責任を伴う命名の式を思い出す。|基拉想起对共同见证人负责的命名公式。|키라가 공동 증인에게 책임지는 작명 공식을 떠올린다.
343|разведённое лекарство действует, если колодезная вода чистая.|la cura diluida funciona si el agua del pozo está limpia.|井戸水が清潔なら薄めた治療薬が効く。|井水干净时稀释药物有效。|우물물이 깨끗하면 희석된 치료제가 효과를 낸다.
346|смотрительница раскрывает, где капитан спрятал голос колокола.|la campanera revela dónde ocultó el capitán la voz de la campana.|鐘守が隊長の隠した鐘の声の場所を明かす。|守钟人揭露队长藏钟声的地方。|종지기가 대장이 종의 목소리를 숨긴 곳을 밝힌다.
349|пиявка проникает в детскую через отражение одинокого ребёнка.|una sanguijuela entra en la guardería por el reflejo de un niño aislado.|孤立した子供の反射を通って蛭が養育室に入る。|水蛭通过孤立孩子的倒影进入育儿室。|거머리가 고립된 아이의 반사상을 통해 보육실로 들어온다.
352|кухня требует отделить лечение и голод от вины.|la cocina exige separar tratamiento y hambre de la culpa.|炊事場は治療と空腹を罪から切り離すよう求める。|厨房要求将治疗与饥饿和罪责分开。|부엌이 치료와 굶주림을 죄책에서 분리하라고 요구한다.
355|землевладельцы должны выбрать график защиты до возвращения сумеречного роя.|los propietarios libres deben elegir un plan defensivo antes del regreso del enjambre del ocaso.|自由農民は夕闇の群れが戻る前に防衛計画を選ぶ。|自由民须在暮色虫群回来前选择防卫日程。|자유민들이 황혼의 무리가 돌아오기 전에 방어 일정을 선택해야 한다.
358|Мей предлагает показания при обещании, что ни один ребёнок не заменит её долг.|Mei ofrece testimonio con la promesa de que ningún niño sustituya su deuda.|メイは自分の負債を子供に肩代わりさせない約束と引き換えに証言する。|梅愿意作证，条件是承诺不让任何孩子替代她的债务。|메이는 어떤 아이도 자신의 빚을 대신하지 않는다는 약속을 받고 증언한다.
361|Орен просит право путешествовать после передачи лекарства.|Oren pide poder viajar tras compartir la cura.|治療を分けた後に旅する権利をオレンが求める。|奥伦要求分享疗法后有旅行的权利。|오렌이 치료제를 나눈 뒤 여행할 권리를 요청한다.
364|капитан предлагает защиту в обмен на вечный контроль над зерном.|el capitán ofrece defensa a cambio de control permanente del grano.|隊長は穀物の永続支配と交換で防衛を提供する。|队长以永久掌控粮食为条件提供防卫。|대장이 곡물의 영구 통제권을 대가로 방어를 제안한다.
367|дети могут решить, кто засвидетельствует восстановленные личности.|los niños pueden decidir quién atestigua sus identidades restauradas.|子供は回復した身元に誰が立ち会うか決められる。|孩子可决定由谁见证恢复的身份。|아이들이 복원된 정체성을 누가 증언할지 결정할 수 있다.
370|приют выбирает очередь по нужде, а не по наличию жетонов.|el hospicio prioriza según necesidad, no según posesión de fichas.|療養所は証票の所有でなく必要に応じて優先する。|疗养院按需求而非凭证所有权决定优先次序。|요양원이 증표 소유가 아니라 필요에 따라 우선순위를 정한다.
373|новый график колокола отражает окончательное соглашение о защите.|el nuevo horario de la campana refleja el acuerdo final de protección.|鐘の新たな予定は最終保護協定を反映する。|新敲钟日程反映最终保护协议。|종의 새 일정이 최종 보호 협정을 반영한다.
376|реестр меняется согласно условиям, выбранным детьми.|el registro cambia según los términos elegidos por los niños.|名簿は子供が選んだ条件に従って変わる。|登记册依孩子选择的条件改变。|명부가 아이들이 선택한 조건에 따라 바뀐다.
379|носитель уходит или остаётся по соглашению, которое помог написать.|el portador se va o se queda bajo un acuerdo que ayudó a redactar.|担い手は自ら作成に参加した合意に従って去るか残る。|承载者依自己参与拟定的协议离开或留下。|보유자가 자신이 작성에 참여한 협약에 따라 떠나거나 남는다.'''
for row in clauses.splitlines():i,v=row.split('|',1);key=src[int(i)];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
clauses='''382|Цель: найти пропавший голос рассвета. Обыщите сундук податей или добейтесь показаний смотрительницы; промедление стоит семян арендаторов.|Objetivo: hallar la voz del alba perdida. Busca en el cofre del tributo o consigue testimonio de la campanera; la demora cuesta semillas de arrendatarios.|目的：消えた夜明けの声を探す。徴税箱を調べるか鐘守の証言を得る。遅れると小作人の種を失う。|目标：找回失踪的黎明之声。搜查税箱或获得守钟人证词；拖延会损失佃户种子。|목표: 사라진 새벽의 목소리를 찾는다. 징세 상자를 수색하거나 종지기의 증언을 얻어라. 지체하면 소작인의 씨앗을 잃는다.
385|Цель: связаться со стёртыми детьми. Выучите жесты или следуйте отражённым отметкам; промедление изолирует одного ребёнка.|Objetivo: contactar a los niños borrados. Aprende sus señas o sigue marcas reflejadas; la demora aísla a un niño.|目的：消された子供と接触する。手話を学ぶか鏡の印を追う。遅れると一人が孤立する。|目标：联系被抹除的孩子。学习手势或跟随反射标记；拖延会使一个孩子孤立。|목표: 지워진 아이들에게 연락한다. 손짓을 배우거나 반사된 표식을 따라라. 지체하면 아이 한 명이 고립된다.
388|Цель: безопасно принять больных. Оспорьте правило жетонов или проведите их путём приюта; промедление истощает пациента.|Objetivo: admitir a los enfermos con seguridad. Cuestiona la regla de fichas o escolta por la ruta del hospicio; la demora agota a un paciente.|目的：病人を安全に受け入れる。証票規則を問いただすか療養所への道を護送する。遅れると患者が疲弊する。|目标：安全接纳病人。挑战凭证规则或护送他们走疗养院路线；拖延会耗尽病人体力。|목표: 병자를 안전하게 받아들인다. 증표 규칙에 이의를 제기하거나 요양원 길로 호송하라. 지체하면 환자가 탈진한다.
391|Цель: вернуть общие запасы. Докажите ложность приказа о защите или договоритесь о выдаче при свидетелях; промедление опустошает запасы арендаторов.|Objetivo: recuperar reservas comunes. Prueba la orden defensiva falsa o negocia una entrega ante testigos; la demora vacía los almacenes de arrendatarios.|目的：共用備蓄を取り戻す。偽の防衛命令を証明するか立会いの下で引き渡しを交渉する。遅れると小作人の蓄えが尽きる。|目标：收回共同储备。证明防卫命令虚假或谈判见证下的释放；拖延会耗尽佃户库存。|목표: 공동 비축을 되찾는다. 가짜 방어 명령을 입증하거나 증인이 있는 반환을 협상하라. 지체하면 소작인의 저장고가 빈다.
394|Цель: выяснить, кто нарушил пакт. Прочтите реестр или защитите показания наследницы; промедление сжигает книгу.|Objetivo: identificar quién rompió el pacto. Lee el registro o protege el testimonio de la heredera; la demora quema el libro.|目的：盟約を破った者を特定する。名簿を読むか後継者の証言を守る。遅れると台帳が焼かれる。|目标：查明谁违约。读取登记册或保护继承人证词；拖延会让账簿被烧毁。|목표: 계약을 깬 자를 찾는다. 명부를 읽거나 후계자의 증언을 보호하라. 지체하면 장부가 불탄다.
397|Цель: отделить болезнь от навязанного вреда. Проверьте кадильницу или сравните записи выздоровления; промедление создаёт ложные случаи.|Objetivo: separar enfermedad de daño impuesto. Analiza el incensario o compara registros de recuperación; la demora crea casos falsos.|目的：病気と加えられた害を区別する。香炉を検査するか回復記録を比較する。遅れると偽の患者が増える。|目标：区分疾病与强加的伤害。检测香炉或比较康复记录；拖延会制造虚假病例。|목표: 질병과 강요된 피해를 구분한다. 향로를 검사하거나 회복 기록을 비교하라. 지체하면 가짜 환자가 생긴다.
400|Цель: защитить не присягнувших фермеров. Почините патрульный путь или уведите псов; промедление уничтожает следующий урожай.|Objetivo: proteger a granjeros no juramentados. Repara una ruta de patrulla o aleja a los sabuesos; la demora destruye la próxima cosecha.|目的：誓わぬ農民を守る。巡回路を修復するか猟犬を誘導する。遅れると次の収穫が失われる。|目标：保护未宣誓农民。修复巡逻路线或引开猎犬；拖延会毁掉下一次收成。|목표: 맹세하지 않은 농부를 보호한다. 순찰로를 수리하거나 사냥개를 유인하라. 지체하면 다음 수확이 사라진다.
403|Цель: сохранить детские воспоминания. Делитесь произнесёнными знаками или изолируйте пиявку; промедление стирает связь.|Objetivo: conservar recuerdos infantiles. Comparte señas pronunciadas o aísla a la sanguijuela; la demora borra un vínculo.|目的：子供の記憶を守る。口にした印を共有するか蛭を隔離する。遅れると絆が消える。|目标：保持孩子的记忆完整。分享说出的符号或隔离水蛭；拖延会抹除一段联系。|목표: 아이들의 기억을 지킨다. 말로 표현한 표식을 공유하거나 거머리를 격리하라. 지체하면 유대가 지워진다.
406|Цель: защитить самостоятельность носителя. Организуйте сменный уход или обеспечьте хартию отдыха; промедление не даёт получить новую безопасную дозу.|Objetivo: proteger la autonomía del portador. Organiza cuidados rotativos o aplica la carta del descanso; la demora impide otra dosis segura.|目的：担い手の自己決定を守る。交代看護を組むか休息憲章を施行する。遅れると次の安全な投薬ができない。|目标：保护承载者自主权。安排轮班照护或执行休息宪章；拖延会阻止下一次安全投药。|목표: 보유자의 자율성을 보호한다. 돌봄 교대를 구성하거나 휴식 헌장을 집행하라. 지체하면 다음 안전한 투약을 할 수 없다.
409|Цель: установить всеобщую защиту. Верните архив или вызовите свидетелей договора; промедление усиливает притязание капитана.|Objetivo: establecer protección universal. Recupera el archivo o llama a testigos del contrato; la demora fortalece la reivindicación del capitán.|目的：万人の保護を確立する。文書庫を回復するか契約の証人を呼ぶ。遅れると隊長の主張が強まる。|目标：确立普遍保护。收回档案或召集契约见证人；拖延会强化队长的主张。|목표: 보편적 보호를 확립한다. 기록을 되찾거나 계약 증인을 불러라. 지체하면 대장의 주장이 강해진다.
412|Цель: восстановить имена без выкупа. Соберите общих свидетелей или верните древний стих; промедление разделяет детей.|Objetivo: renovar nombres sin rescate. Reúne testigos comunes o restaura el verso antiguo; la demora divide a los niños.|目的：身代金なしで名を更新する。共同証人を集めるか古い詩を戻す。遅れると子供が分断される。|目标：不用赎金恢复名字。召集共同见证人或恢复古老诗句；拖延会分裂孩子们。|목표: 몸값 없이 이름을 갱신한다. 공동 증인을 모으거나 옛 시구를 복원하라. 지체하면 아이들이 갈라진다.
415|Цель: получить безопасное общее лекарство. Испытайте разведённые дозы или очистите колодец; промедление поддерживает рынок подделок.|Objetivo: producir una cura compartida segura. Prueba dosis diluidas o limpia el pozo; la demora alimenta el mercado falso.|目的：安全な共有治療薬を作る。薄めた投薬を試すか井戸を清める。遅れると偽薬市場が育つ。|目标：制作安全共享药物。测试稀释剂量或清洁水井；拖延会助长假药市场。|목표: 안전한 공동 치료제를 만든다. 희석한 용량을 시험하거나 우물을 청소하라. 지체하면 가짜 시장이 커진다.
418|Цель: установить справедливую подать. Сравните нужды патрулей или примите ограниченные ремонтные обязанности; промедление оставляет врата без защиты.|Objetivo: fijar un tributo justo. Compara necesidades de patrulla o acepta obligaciones de reparación limitadas; la demora deja una puerta indefensa.|目的：公平な税を定める。巡回の必要を比較するか限定的な修理義務を受ける。遅れると門が無防備になる。|目标：制定公平征税。比较巡逻需求或接受有限修缮义务；拖延会使一座大门无人防守。|목표: 공정한 세금을 정한다. 순찰 수요를 비교하거나 제한된 수리 의무를 수락하라. 지체하면 관문이 무방비로 남는다.
421|Цель: дать детям власть над личностью. Создайте ничей реестр или засвидетельствуйте личные имена; промедление заменяет старый долг.|Objetivo: dar a los niños control de su identidad. Crea un registro sin dueño o atestigua nombres individuales; la demora sustituye la antigua deuda.|目的：子供に自己の身元の決定権を与える。所有者なき名簿を作るか個々の名に立ち会う。遅れると古い負債が置き換えられる。|目标：让孩子控制身份。建立无主登记册或见证个人名字；拖延会替换旧债。|목표: 아이들이 정체성을 통제하게 한다. 주인 없는 명부를 만들거나 개인 이름을 증언하라. 지체하면 옛 빚이 대체된다.
424|Цель: справедливо распределить лечение. Используйте сортировку приюта или сменный публичный список; промедление вредит самым слабым пациентам.|Objetivo: asignar tratamiento justamente. Usa triaje del hospicio o una lista pública rotativa; la demora daña a los pacientes más débiles.|目的：治療を公平に配分する。療養所の優先判定か交代の公開名簿を使う。遅れると最も弱い患者が傷つく。|目标：公平分配治疗。采用疗养院分诊或轮班公开名单；拖延会伤害最虚弱的病人。|목표: 치료를 공정하게 배분한다. 요양원 중증도 분류나 순환 공개 명단을 사용하라. 지체하면 가장 약한 환자가 피해를 본다.
427|Цель: урегулировать защиту полей. Оплатите общую защиту или соглашение арендаторов при свидетелях; запишите, кто управляет колоколом.|Objetivo: acordar protección de campos. Financia defensa común o un convenio de arrendatarios ante testigos; anota quién controla la campana.|目的：畑の保護を合意する。共同防衛か立会い付き小作人盟約に資金を出し、誰が鐘を管理するか記録する。|目标：议定田地保护。资助共同防卫或有见证的佃户契约；记录谁控制钟。|목표: 밭의 보호를 합의한다. 공동 방어나 증인이 있는 소작인 협약에 자금을 대고 누가 종을 통제하는지 기록하라.
430|Цель: покончить с унаследованным выкупом имён. Упраздните притязание дома или свяжите подотчётных свидетелей; запишите условия, выбранные детьми.|Objetivo: acabar con el rescate de nombres heredado. Disuelve la reivindicación de la casa o vincula testigos responsables; anota los términos de los niños.|目的：受け継がれた名の身代金を終わらせる。家の権利主張を解消するか責任を持つ証人を結び、子供の選んだ条件を記録する。|目标：终结继承的名字赎金。解散家族主张或约束负责任的见证人；记录孩子选择的条件。|목표: 대물림된 이름 몸값을 끝낸다. 가문의 권리 주장을 해소하거나 책임지는 증인들을 묶고 아이들의 조건을 기록하라.
433|Цель: урегулировать соглашение о лечении. Поделитесь знаниями дозировки или сохраните добровольный сменный уход; запишите право носителя уйти.|Objetivo: acordar la cura. Comparte conocimientos de dosis o mantén cuidados rotativos voluntarios; anota el derecho del portador a irse.|目的：治療協定を合意する。投薬の知識を共有するか自発的な交代看護を維持し、担い手の去る権利を記録する。|目标：议定治疗协议。分享剂量知识或维持自愿轮班照护；记录承载者离开的权利。|목표: 치료 협정을 맺는다. 용량 지식을 나누거나 자발적 돌봄 교대를 유지하고 보유자가 떠날 권리를 기록하라.'''
for row in clauses.splitlines():i,v=row.split('|',1);key=src[int(i)];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
clauses='''436|проверяет заявления о защите и защищает жителей, исключённых из клятв.|comprueba reivindicaciones defensivas y protege a residentes excluidos de juramentos.|防衛の主張を検証し、誓いから排除された住民を守る。|验证防卫主张，保护被誓约排除的居民。|방어 주장을 검증하고 맹세에서 배제된 주민을 보호한다.
439|учит стёртые знаки и защищает власть детей над личностью.|aprende señas borradas y protege el control infantil de la identidad.|消された手話を学び、子供の身元決定権を守る。|学习被抹除的手势，保护孩子对身份的控制。|지워진 손짓을 배우고 아이들의 정체성 통제권을 보호한다.
442|отделяет симптомы от навязанного покаяния.|separa síntomas de penitencia impuesta.|症状と強制された贖罪を区別する。|区分症状与强制忏悔。|증상과 강요된 참회를 구분한다.
445|обеспечивает безопасность работников, не отдавая вечный контроль над урожаем.|mantiene seguros a trabajadores sin ceder control permanente de cosechas.|収穫の永久支配を与えず働く人を守る。|保障工人安全，不交出永久收成控制权。|수확의 영구 통제권을 주지 않고 일꾼을 지킨다.
448|возобновляет обещания при свидетелях вместо наследственного выкупа.|renueva promesas ante testigos en vez de rescate hereditario.|世襲の身代金でなく証人の下で約束を更新する。|在见证人面前续订承诺，取代世袭赎金。|세습 몸값 대신 증인 아래 약속을 갱신한다.
451|защищает отдых целителя и право уйти.|protege el descanso del sanador y su derecho a irse.|治療者の休息と去る権利を守る。|保护医者休息与离开的权利。|치유사의 휴식과 떠날 권리를 보호한다.
454|сохраняет исходную защиту от удобного переосмысления.|preserva protecciones originales frente a reinterpretaciones interesadas.|都合のよい再解釈から元の保護を守る。|保护原始保障免遭便利的重新解释。|편의적인 재해석에서 원래 보호를 보존한다.
457|восстанавливает общую память, не заменяя собственных имён детей.|restaura memoria compartida sin reemplazar los nombres de los niños.|子供自身の名を置き換えず共有記憶を戻す。|恢复共同记忆，不替换孩子自己的名字。|아이들 자신의 이름을 바꾸지 않고 공동 기억을 복원한다.
460|заслужите доверие подотчётной общей защитой; получите власть над колоколом и обязанности патруля.|gana confianza con defensa común responsable; obtén autoridad sobre la campana y obligaciones de patrulla.|責任ある共同防衛で信頼を得る。鐘の権限と巡回義務を得る。|以负责任的共同防卫赢得信任；获得敲钟权与巡逻义务。|책임 있는 공동 방어로 신뢰를 얻고 종의 권한과 순찰 의무를 얻어라.
463|заслужите доверие, прекратив унаследованный выкуп; получите общих свидетелей и обязанности реестра.|gana confianza acabando con el rescate heredado; obtén testigos comunes y deberes del registro.|受け継がれた身代金を終えて信頼を得る。共同証人と名簿の義務を得る。|终结世袭赎金以赢得信任；获得共同见证人与登记册责任。|물려받은 몸값을 끝내 신뢰를 얻고 공동 증인과 명부 의무를 얻어라.
466|заслужите доверие безопасным лечением по нужде; получите доступ к приюту и записи дозировок.|gana confianza con tratamiento seguro según necesidad; obtén acceso al hospicio y registros de dosis.|必要に応じた安全な治療で信頼を得る。療養所への接近権と投薬記録を得る。|按需安全治疗以赢得信任；获得疗养院访问权与剂量记录。|필요에 따른 안전한 치료로 신뢰를 얻고 요양원 접근권과 용량 기록을 얻어라.
469|заслужите доверие сохранением урожая и справедливым ремонтом; получите команды землевладельцев и надзор за податью.|gana confianza preservando cosechas y reparaciones justas; obtén equipos de propietarios libres y escrutinio del tributo.|収穫の保全と公平な修理で信頼を得る。自由農民の班と徴税の監視を得る。|保全收成、公平修缮以赢得信任；获得自由民队伍与征税监督权。|수확 보존과 공정한 수리로 신뢰를 얻고 자유민 작업반과 징세 감시권을 얻어라.
472|заслужите доверие через личности, выбранные их носителями; получите доступ к детской и обязанности согласия.|gana confianza con identidades elegidas por sus titulares; obtén acceso a la guardería y deberes de consentimiento.|本人が選ぶ身元で信頼を得る。養育室への接近権と同意の義務を得る。|尊重本人选择的身份以赢得信任；获得育儿室访问权与同意责任。|당사자가 선택한 정체성으로 신뢰를 얻고 보육실 접근권과 동의 의무를 얻어라.
475|заслужите доверие, сохраняя добровольность ухода; получите поддержку паломников и обязанности отдыха.|gana confianza manteniendo voluntarios los cuidados; obtén apoyo de peregrinos y obligaciones de descanso.|自発的な看護で信頼を得る。巡礼者の支援と休息の義務を得る。|维持自愿照护以赢得信任；获得朝圣者支持与休息责任。|돌봄을 자발적으로 유지해 신뢰를 얻고 순례자 지원과 휴식 의무를 얻어라.
478|золотые пути защиты и чёрные знаки изъятия отличают защиту от контроля подати.|rutas de protección doradas y marcas negras de confiscación distinguen defensa de control del tributo.|金の保護路と黒の押収印で防衛と徴税支配を区別する。|金色保护路线与黑色没收标记区分防卫和征税控制。|금빛 보호 경로와 검은 압수 표시가 방어와 징세 통제를 구분한다.
482|фиолетовые притязания домов и серебряные общие свидетели отличают выкуп от выбранной личности.|reivindicaciones de casas violetas y testigos comunes plateados distinguen rescate de identidad elegida.|紫の家の主張と銀の共同証人で身代金と選んだ身元を区別する。|紫色家族主张与银色共同见证人区分赎金与自主身份。|보라색 가문 주장과 은빛 공동 증인이 몸값과 선택된 정체성을 구분한다.
485|зелёная проверенная вода и ржавые преграды покаяния отличают лечение от навязанной вины.|agua analizada verde y barreras de penitencia oxidadas distinguen tratamiento de culpa impuesta.|緑の検査済み水と錆色の贖罪障壁で治療と強制の罪を区別する。|绿色已检水源与锈色忏悔障碍区分治疗和强加罪责。|초록색 검사된 물과 녹슨 참회 장벽이 치료와 강요된 죄책을 구분한다.'''
for row in clauses.splitlines():i,v=row.split('|',1);key=src[int(i)];n=key.split(': ',1)[0];add(key,'|'.join(maps[l][n]+': '+x for l,x in zip(langs,v.split('|'))))
# Shared labels retain the same vocabulary across universes.
for l in langs:
 shared=json.load(open(Path(__file__).parent.parent/'classic-fantasy'/(l+'.json')))
 for k in src:
  if k in shared and k not in maps[l]:maps[l][k]=shared[k]
art={'map schematic':'схема карты|esquema de mapa|地図の模式図|地图示意图|지도 도식','location schematic':'схема локации|esquema de ubicación|場所の模式図|地点示意图|장소 도식','portrait schematic':'схема портрета|esquema de retrato|肖像の模式図|肖像示意图|초상 도식','creature schematic':'схема существа|esquema de criatura|生物の模式図|生物示意图|생물 도식','item schematic':'схема предмета|esquema de objeto|アイテムの模式図|物品示意图|아이템 도식','background schematic':'схема фона|esquema de fondo|背景の模式図|背景示意图|배경 도식'}
for k in src:
 if ': ' in k and k.rsplit(': ',1)[1] in art:
  n,a=k.rsplit(': ',1);add(k,'|'.join(maps[l][n]+': '+w for l,w in zip(langs,art[a].split('|'))))
first={0:'Тёмное фэнтези|Fantasía Oscura|ダークファンタジー|黑暗奇幻|다크 판타지',1:'Отчаявшиеся люди противостоят проклятиям, порочным силам и выборам, победы которых всегда имеют цену.|Personas desesperadas afrontan maldiciones, poderes corruptos y decisiones cuyas victorias siempre tienen un precio.|絶望した人々が呪い、腐敗した力、常に勝利の代償を伴う選択に立ち向かう。|绝望之人面对诅咒、腐败权力与胜利总有代价的抉择。|절망한 사람들이 저주와 타락한 권력, 승리에 늘 대가가 따르는 선택에 맞선다.',2:'защищать|defender|守る|防卫|방어',3:'раскрыть|descubrir|暴く|揭露|밝히기',4:'засвидетельствовать|atestiguar|立ち会う|见证|증언',5:'освободить|liberar|解放|释放|해방',6:'Умирающие марки|Marcas Moribundas|死にゆく辺境|垂死边境|죽어가는 변경',7:'Бессолнечное пограничье держит урожай за вратами клятв. Верните украденный рассветный колокол, раскройте цену защиты и решите, кому принадлежат последние безопасные поля.|Una frontera sin sol guarda cosechas tras puertas ligadas a juramentos. Recupera la campana del alba robada, revela el coste de protección y elige quién puede reclamar los últimos campos seguros.|陽なき国境は誓いで縛られた門の内に収穫を保つ。盗まれた夜明けの鐘を戻し、保護の代償を明かし、最後の安全な畑を誰に認めるか選ぶ。|无日边境把收成锁在誓约之门后。找回被盗的黎明钟，揭露保护的代价，并决定谁有权获得最后的安全田地。|태양 없는 국경은 맹세로 묶인 관문 뒤에 수확을 보관한다. 도난당한 새벽 종을 되찾고 보호의 대가를 드러내며 마지막 안전한 밭을 누가 차지할지 선택하라.',8:'Княжества ведьм|Principados de Brujas|魔女の公国群|女巫诸公国|마녀 공국들',9:'Три ведьмовских дома делят долину наследственными проклятиями. Расследуйте нарушенный пакт имён, спасите безымянных детей и решите, сохранят ли дома свои сделки.|Tres casas de brujas dividen un valle con maldiciones heredadas. Investiga un pacto de nombres roto, rescata a niños sin nombre y decide si las casas conservan sus tratos.|三つの魔女の家が受け継がれた呪いで谷を分ける。破られた命名盟約を調べ、名なき子供を救い、各家の取引が残るか決める。|三个女巫家族以世袭诅咒瓜分山谷。调查破裂的命名契约，救出无名孩子，并决定家族能否保留交易。|세 마녀 가문이 물려받은 저주로 계곡을 나눈다. 깨진 작명 계약을 조사하고 이름 없는 아이들을 구하며 가문들이 거래를 유지할지 결정하라.',10:'Чумное паломничество|Peregrinación de la Peste|疫病の巡礼|瘟疫朝圣|역병 순례',11:'Процессия ищет лекарство, которое несёт живой святой. Отделите болезнь от навязанного покаяния, защитите больных и выберите условия распространения лекарства.|Una procesión busca una cura llevada por un santo vivo. Separa enfermedad de penitencia impuesta, protege a los enfermos y elige las condiciones para compartir la cura.|行列が生きた聖人の持つ治療を求める。病気と強制された贖罪を分け、病人を守り、治療を分ける条件を選ぶ。|游行寻求活圣者承载的疗法。区分疾病与强加忏悔，保护病人，选择分享疗法的条件。|행렬이 살아 있는 성자가 지닌 치료제를 찾는다. 질병과 강요된 참회를 구분하고 병자들을 보호하며 치료제를 나눌 조건을 선택하라.',12:'Защитите исключённых жителей, не отдавая урожай по договору|Protege a residentes excluidos sin ceder su cosecha|収穫を明け渡さず排除された住民を守る|保护被排除居民，不签约交出收成|수확을 넘기지 않고 배제된 주민을 보호하라',13:'Раскройте нарушенные обещания и навязанное покаяние|Revela promesas rotas y penitencia impuesta|破られた約束と強制の贖罪を暴く|揭露违约承诺与强加忏悔|어긴 약속과 강요된 참회를 밝혀라',14:'Возобновите сделки при подотчётных общих свидетелях|Renueva pactos ante testigos comunes responsables|責任ある共同証人の下で取引を更新する|在负责任的共同见证人面前续订协议|책임 있는 공동 증인 아래 거래를 갱신하라',15:'Запишите выбранные личности, справедливую защиту и добровольный уход|Anota identidades elegidas, defensa justa y cuidados voluntarios|選ばれた身元、公平な防衛、自発的な看護を記録する|记录自主身份、公平防卫与自愿照护|선택된 정체성과 공정한 방어, 자발적 돌봄을 기록하라',18:'Начните с молчащего колокола и изымаемого зерна арендаторов.|Abre con una campana silenciosa y grano de arrendatarios confiscado.|静かな鐘と小作人の穀物押収から始める。|从无声之钟和佃户粮食被没收开始。|침묵하는 종과 압수되는 소작인 곡물로 시작하라.',19:'Отделите реальную нужду в защите от личной подати капитана.|Distingue la necesidad defensiva real del tributo privado del capitán.|本当の防衛の必要を隊長の私的徴税から区別する。|区分真正的防卫需求与队长私税。|실제 방어 필요와 대장의 사적 세금을 구분하라.',20:'Предложите свидетелей договора, ремонт патруля и путь-приманку с явными затратами.|Ofrece testigos del contrato, reparación de patrullas y una ruta señuelo con costes visibles.|契約の証人、巡回路の修理、囮の道を明確な代償つきで提示する。|提供契约见证人、巡逻修缮与诱饵路线，明确其代价。|계약 증인과 순찰 수리, 유인 경로를 명확한 비용과 함께 제시하라.',21:'Запишите, кто управляет колоколом, платит за защиту и сохраняет урожай.|Anota quién controla la campana, paga defensa y conserva cosechas.|誰が鐘を管理し、防衛費を払い、収穫を保つか記録する。|记录谁控制钟、支付防卫并保留收成。|누가 종을 통제하고 방어비를 내며 수확을 지키는지 기록하라.',24:'Общайтесь со стёртыми детьми жестами и зеркалами.|Usa gestos y espejos para comunicarte con niños borrados.|消された子供とは手話と鏡で話す。|用手势和镜子与被抹除的孩子交流。|손짓과 거울로 지워진 아이들과 소통하라.',25:'Никогда не предполагайте, что взрослые представители могут выбирать личности детей.|Nunca supongas que representantes adultos pueden elegir identidades infantiles.|大人の代表が子供の身元を選べると決めつけない。|绝不假定成年代表可以决定孩子的身份。|성인 대표가 아이들의 정체성을 선택할 수 있다고 가정하지 마라.',26:'Предложите показания наследницы, общих свидетелей и ничей реестр.|Ofrece testimonio de la heredera, testigos comunes y un registro sin dueño.|後継者の証言、共同証人、所有者なき名簿を提示する。|提供继承人证词、共同见证人与无主登记册。|후계자의 증언과 공동 증인, 주인 없는 명부를 제시하라.',27:'Запишите выбранное каждым ребёнком имя и оставшиеся обязанности домов.|Anota el nombre elegido por cada niño y las obligaciones restantes de las casas.|子供一人ずつの選んだ名と各家の残る義務を記録する。|记录每个孩子选择的名字与家族剩余义务。|각 아이가 선택한 이름과 가문에 남은 의무를 기록하라.',30:'Начните у врат покаяния с пациентом, которому нужны еда и уход.|Abre en la puerta de penitencia con un paciente que necesita comida y cuidados.|食事と看護が必要な患者と贖罪の門から始める。|从忏悔之门和需要食物照护的病人开始。|음식과 돌봄이 필요한 환자와 참회 관문에서 시작하라.',31:'Различайте симптомы, раздражающий дым и навязанные моральные оценки.|Distingue síntomas, humo irritante y juicios morales impuestos.|症状、刺激性の煙、押し付けられた道徳判断を区別する。|区分症状、刺激性烟雾与强加的道德判断。|증상과 자극성 연기, 강요된 도덕적 판단을 구분하라.',32:'Предложите проверку воды, отмеренные дозы и добровольные дежурства по уходу.|Ofrece análisis de agua, dosis medidas y cuidados rotativos voluntarios.|水質検査、計量投薬、自発的な交代看護を提示する。|提供水质检测、定量给药与自愿轮班照护。|물 검사와 정량 투약, 자발적 돌봄 교대를 제시하라.',33:'Запишите приоритет лечения, знания о лекарстве и право носителя уйти.|Anota prioridades de tratamiento, conocimiento de la cura y derecho del portador a irse.|治療の優先度、治療の知識、担い手が去る権利を記録する。|记录治疗优先次序、疗法知识与承载者离开的权利。|치료 우선순위와 치료제 지식, 보유자가 떠날 권리를 기록하라.'}
for i,v in first.items():add(src[i],v)
for i,c,t in [(16,6,'Dawn for Everyone'),(22,8,'The Released Pact'),(28,10,"The Bearer's Road")]:
 for l in langs:maps[l][src[i]]=maps[l][src[c]]+': '+maps[l][t]
for i,c,d in [(17,6,7),(23,8,9),(29,10,11)]:
 for l,v in zip(langs,['Игра на три-четыре часа в мире «{c}»: {d}','Una partida de tres a cuatro horas de {c}: {d}','「{c}」の3～4時間のゲーム：{d}','三至四小时的《{c}》游戏：{d}','{c}의 3~4시간 게임: {d}']):maps[l][src[i]]=v.format(c=maps[l][src[c]],d=maps[l][src[d]])
extra='''Dark bargain navigation interface|Интерфейс тёмных сделок|Interfaz de navegación de pactos oscuros|闇の取引のナビゲーション画面|黑暗交易导航界面|어둠의 거래 탐색 화면
Blighted|Поражённая|Devastado|荒廃|荒芜|황폐
Haunted|Преследуемый призраками|Embrujado|憑かれた|闹鬼|귀신 들림
War Torn|Разорённая войной|Asolado por guerra|戦禍|战乱|전쟁 피해
Meager|Скудные|Exiguos|乏しい|贫乏|빈약
Desperate|Отчаянные|Desesperados|絶望的|绝望|절망
Famine|Голод|Hambruna|飢饉|饥荒|기근
Vigilant|Страж|Vigilante|監視者|警戒者|감시자
Hexer|Проклинатель|Maleficador|呪術師|咒术师|저주술사
Penitent|Кающийся|Penitente|悔悟者|忏悔者|참회자
Dark calling|Тёмное призвание|Vocación oscura|闇の天職|黑暗职业|어둠의 소명
Progression path|Путь развития|Trayectoria de progresión|成長の道|成长路径|성장 경로
Steel|Сталь|Acero|鋼|钢铁|강철
Guile|Хитрость|Astucia|狡知|诡计|책략
Will|Воля|Voluntad|意志|意志|의지
Dark Fantasy portrait|Портрет тёмного фэнтези|Retrato de Fantasía Oscura|ダークファンタジーの肖像|黑暗奇幻肖像|다크 판타지 초상
Flesh|Плоть|Carne|肉体|血肉|육체
Hope|Надежда|Esperanza|希望|希望|희망
Taint|Скверна|Corrupción|穢れ|污秽|오염
Blacksteel Blade|Клинок чёрной стали|Hoja de acero negro|黒鋼の剣|黑钢之刃|흑강 검
Hunter's Satchel|Сумка охотника|Bolsa del cazador|狩人の鞄|猎人挎包|사냥꾼 가방
Saintbone Charm|Оберег из кости святого|Amuleto de hueso santo|聖骨のお守り|圣骨护符|성자 뼈 부적
Bitter Tonic|Горький тоник|Tónico amargo|苦い強壮剤|苦涩补剂|쓴 강장제
Funeral Plate|Погребальный доспех|Armadura funeraria|葬送の板金鎧|丧葬板甲|장례 판금갑옷
Hexing Nails|Проклинающие гвозди|Clavos malditos|呪いの釘|诅咒钉|저주 못
Lantern Seal|Печать фонаря|Sello del farol|灯の封印|灯笼印章|등불 봉인
Grave Hound|Могильный пёс|Sabueso de tumba|墓の猟犬|墓穴猎犬|무덤 사냥개
Sister Mercy|Сестра Милосердие|Hermana Misericordia|マーシー修道女|慈悲修女|자비 수녀
Briar Witch|Терновая ведьма|Bruja del brezo|茨の魔女|荆棘女巫|가시 마녀
Terrified|В ужасе|Aterrorizado|恐怖|恐惧|공포
Consecrated|Освящён|Consagrado|聖別|祝圣|축성
Blood Marked|Отмечен кровью|Marcado con sangre|血の印|血印|피의 표식
Use Blacksteel Blade|Использовать клинок чёрной стали|Usar hoja de acero negro|黒鋼の剣を使う|使用黑钢之刃|흑강 검 사용
Recover Flesh|Восстановить плоть|Recuperar carne|肉体を回復|恢复血肉|육체 회복
Spend Taint|Потратить скверну|Gastar corrupción|穢れを消費|消耗污秽|오염 사용'''
for row in extra.splitlines():k,v=row.split('|',1);add(k,v)
for l in langs:
 missing=set(src)-set(maps[l]);assert not missing,(l,missing)
 Path(__file__).with_name(l+'.json').write_text(json.dumps(maps[l],ensure_ascii=False,indent=2)+'\n')
print('Dark Fantasy base complete:',len(src))
