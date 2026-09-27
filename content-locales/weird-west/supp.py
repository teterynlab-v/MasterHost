# coding: utf-8
for i,l in enumerate(langs):
 for k in supp:
  if k.endswith(' — Illustrated') and k[:-14] in maps[l]:maps[l][k]=maps[l][k[:-14]]+[' — С иллюстрациями',' — Ilustrado',' — イラスト付き',' — 插画版',' — 삽화 포함'][i]
  if ' for Cursed Frontier,' in k:
   title=k.split(' for Cursed Frontier,')[0]
   if title in maps[l]:
    maps[l][k]=maps[l][title]+[' для «Проклятого пограничья», «Призрачной железной дороги» и «Оккультного города золотой лихорадки». Три оригинальные кампании пограничья: проклятие наводнения на украденной дороге, призрачный поезд со стёртыми рабочими и золотая жила, отравляющая городской колодец.',' para Frontera Maldita, Ferrocarril Fantasma y Ciudad del Auge Oculto. Tres campañas originales de frontera: una maldición de inundación en un camino robado, un tren fantasma con trabajadores borrados y una veta de oro que envenena el pozo del pueblo.','。呪われた辺境、幽霊鉄道、怪異の繁栄都市に対応。奪われた道の洪水の呪い、消された労働者を乗せた幽霊列車、町の井戸を毒する金鉱脈を描く、三つの独自の辺境キャンペーン。','，适用于诅咒边疆、幽灵铁路与秘术淘金镇。三个原创边疆战役：被夺道路上的洪水诅咒、载着被抹去工人的幽灵列车，以及毒害镇上水井的金矿脉。','. 저주받은 변경, 유령 철도, 오컬트 호황 도시를 위한 세 가지 독창적인 변경 캠페인: 빼앗긴 길의 홍수 저주, 지워진 노동자가 탄 유령 기차, 마을 우물을 오염시키는 금 광맥.'][i]
