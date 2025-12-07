/**
 * Generates AI-style explanations for quiz questions using Claude API
 * Run: node scripts/generateExplanations.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') });

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Marketing concepts dictionary with definitions
const concepts = {
  // Základní pojmy
  'marketing': 'Marketing je proces plánování a realizace koncepce, tvorby cen, propagace a distribuce myšlenek, zboží a služeb za účelem směny, která uspokojí potřeby jednotlivců i organizací.',
  'směna': 'Směna je jádrem marketingu – jde o proces, při kterém jedna strana poskytuje hodnotu druhé straně výměnou za jinou hodnotu.',

  // B2B a B2C
  'b2b': 'B2B (Business-to-Business) je marketing mezi firmami, kde zákazníkem je jiná firma, nikoli konečný spotřebitel. Typicky má méně zákazníků, ale větší objemy obchodů.',
  'b2c': 'B2C (Business-to-Consumer) je marketing zaměřený na konečné spotřebitele pro jejich osobní spotřebu.',

  // Marketingový mix
  '4p': 'Marketingový mix 4P zahrnuje: Product (produkt), Price (cena), Place (distribuce), Promotion (komunikace/propagace). Tyto čtyři nástroje firma kombinuje k dosažení marketingových cílů.',
  '4c': 'Model 4C je zákaznicky orientovaná alternativa k 4P: Customer value (hodnota pro zákazníka), Cost (náklady zákazníka), Convenience (dostupnost/pohodlí), Communication (komunikace).',
  'produkt': 'Produkt je cokoliv, co lze nabídnout trhu ke koupi, použití či spotřebě a co může uspokojit potřebu či přání.',
  'cena': 'Cena je jediný prvek marketingového mixu, který přináší příjmy. Ostatní prvky představují náklady.',
  'distribuce': 'Distribuce (Place) zahrnuje činnosti, které zajišťují dostupnost produktu cílovým zákazníkům.',
  'komunikace': 'Marketingová komunikace (Promotion) zahrnuje reklamu, podporu prodeje, PR, osobní prodej a přímý marketing.',

  // Koncepce řízení
  'výrobní koncepce': 'Výrobní koncepce předpokládá, že spotřebitelé preferují levné a dostupné produkty. Firma se soustředí na vysoký objem výroby a snižování nákladů.',
  'produktová koncepce': 'Produktová koncepce vychází z předpokladu, že zákazníci preferují kvalitní produkty. Riziko: "marketingová krátkozrakost" – přílišné soustředění na produkt místo potřeb zákazníka.',
  'prodejní koncepce': 'Prodejní koncepce předpokládá pasivního spotřebitele, kterého je třeba přesvědčit agresivním prodejem. Často u "nehledaného zboží" (pojištění).',
  'marketingová koncepce': 'Marketingová koncepce se zaměřuje primárně na zákazníka a uspokojování jeho potřeb. Vychází z pochopení problémů zákazníka.',
  'společenský marketing': 'Společenský marketing (sociální koncepce) zohledňuje nejen potřeby zákazníka, ale i dlouhodobé zájmy společnosti.',
  'csr': 'CSR (Corporate Social Responsibility) je společenská odpovědnost firem – dobrovolné přijímání závazků vůči společnosti a životnímu prostředí.',

  // STP
  'segmentace': 'Segmentace je rozdělení trhu na skupiny zákazníků s podobnými potřebami, charakteristikami nebo chováním.',
  'targeting': 'Targeting je výběr cílových segmentů, na které se firma zaměří.',
  'positioning': 'Positioning je vytvoření jedinečné pozice produktu v mysli zákazníka oproti konkurenci.',
  'stp': 'STP proces: Segmentace (rozdělení trhu) → Targeting (výběr segmentů) → Positioning (umístění produktu).',

  // Analýzy a matice
  'swot': 'SWOT analýza hodnotí Strengths (silné stránky), Weaknesses (slabé stránky), Opportunities (příležitosti) a Threats (hrozby).',
  'pest': 'PEST/PESTLE analýza zkoumá makroprostředí: Political, Economic, Social, Technological (+ Legal, Environmental).',
  'bcg': 'BCG matice hodnotí portfolio produktů podle tržního podílu a růstu trhu: Hvězdy, Dojné krávy, Otazníky, Psi.',
  'ansoff': 'Ansoffova matice definuje růstové strategie: Penetrace trhu, Rozvoj trhu, Rozvoj produktu, Diverzifikace.',

  // Výzkum
  'primární výzkum': 'Primární výzkum získává nová data přímo pro daný účel (dotazníky, rozhovory, pozorování).',
  'sekundární výzkum': 'Sekundární výzkum využívá již existující data (statistiky, studie, databáze).',
  'kvalitativní výzkum': 'Kvalitativní výzkum zkoumá hloubku názorů a motivací (focus groups, hloubkové rozhovory). Nelze statisticky zobecnit.',
  'kvantitativní výzkum': 'Kvantitativní výzkum pracuje s čísly a statistikami na velkém vzorku, výsledky lze zobecnit.',

  // Produktové
  'životní cyklus': 'Životní cyklus produktu: Zavádění → Růst → Zralost → Úpadek. Každá fáze vyžaduje jinou strategii.',
  'značka': 'Značka je jméno, symbol nebo design, který identifikuje produkt a odlišuje ho od konkurence.',
  'private label': 'Private label (vlastní značka) jsou produkty vyráběné pro maloobchodníky pod jejich značkou.',

  // Komunikace
  'reklama': 'Reklama je placená neosobní forma komunikace prostřednictvím masových médií.',
  'pr': 'PR (Public Relations) je budování dobrých vztahů s veřejností pomocí publicity a pozitivní image.',
  'direct marketing': 'Přímý marketing je přímá komunikace s vybranými zákazníky za účelem okamžité reakce.',
  'aida': 'Model AIDA: Attention (pozornost) → Interest (zájem) → Desire (touha) → Action (akce).',

  // Spotřebitel
  'spotřebitel': 'Spotřebitelské chování je proces rozhodování o nákupu, který ovlivňují kulturní, sociální, osobní a psychologické faktory.',
  'nákupní rozhodování': 'Proces nákupního rozhodování: Rozpoznání potřeby → Hledání informací → Hodnocení alternativ → Nákup → Ponákupní chování.',

  // Další marketingové přístupy
  'guerilla marketing': 'Guerilla marketing využívá nekonvenční, nízkonákladové taktiky pro maximální dopad.',
  'virální marketing': 'Virální marketing vytváří obsah, který se šíří spontánně mezi uživateli (word-of-mouth).',
  'relationship marketing': 'Vztahový marketing se zaměřuje na budování dlouhodobých vztahů se zákazníky místo jednorázových transakcí.',

  // Hofstede kulturní dimenze
  'hofstede': 'Hofstede definoval kulturní dimenze: individualismus vs. kolektivismus, maskulinita vs. femininita, vzdálenost moci a vyhýbání se nejistotě.',
  'kolektivismus': 'Kolektivistické společnosti (Čína, Indie, Japonsko) kladou důraz na skupinu a rodinu. Opakem jsou individualistické společnosti (USA, Austrálie).',
  'individualismus': 'Individualistické společnosti (USA, Austrálie, UK) kladou důraz na jednotlivce. Opakem jsou kolektivistické společnosti (Čína, Indie).',
  'maskulinita': 'Maskulinita jako kulturní dimenze podle Hofstedeho měří důraz na výkon, soutěživost a materiální úspěch vs. kvalitu života a péči o druhé (femininita).',

  // Ansoffova matice - detaily
  'rozvoj trhu': 'Rozvoj trhu (Ansoff) znamená hledání nových trhů pro stávající produkty – expanze do nových geografických oblastí nebo segmentů.',
  'penetrace trhu': 'Penetrace trhu (Ansoff) znamená zvyšování prodeje stávajících produktů na stávajících trzích.',
  'rozvoj produktu': 'Rozvoj produktu (Ansoff) znamená nabídku nových nebo vylepšených produktů stávajícím zákazníkům.',
  'diverzifikace': 'Diverzifikace (Ansoff) je nejrizikovější strategie – nové produkty na nových trzích.',

  // Spotřební chování - skupiny a postoje
  'aspirační skupina': 'Aspirační skupina je referenční skupina, ke které si jedinec přeje patřit, i když s ní nemusí být v přímém kontaktu.',
  'referenční skupina': 'Referenční skupina ovlivňuje postoje a chování jedince. Může být členská (jsem členem) nebo aspirační (chci být členem).',
  'postoj': 'Postoj má tři složky: kognitivní (znalosti), afektivní (emoce, sympatie) a konativní (připravenost jednat).',
  'kognitivní složka': 'Kognitivní složka postoje zahrnuje znalosti a přesvědčení o objektu.',
  'afektivní složka': 'Afektivní složka postoje vyjadřuje emocionální vztah – zda má člověk objekt rád či nikoliv.',
  'konativní složka': 'Konativní složka postoje je připravenost jednat vůči objektu určitým způsobem – záměr k nákupu.',

  // Porterovy síly
  'porter': 'Porterův model pěti sil: stávající konkurence, hrozba nových konkurentů, hrozba substitutů, vyjednávací síla dodavatelů a zákazníků.',
  'konkurenční síly': 'Porterových 5 sil: rivalita v odvětví, hrozba vstupu nových firem, hrozba substitutů, síla dodavatelů, síla odběratelů.',

  // Výzkum - detaily
  'validita': 'Validita znamená, že výzkum měří to, co měřit má – že informace skutečně vyjadřují zkoumanou skutečnost.',
  'reliabilita': 'Reliabilita (spolehlivost) znamená, že při opakování výzkumu dostaneme stejné výsledky.',
  'relevance': 'Relevance informace znamená, že je využitelná pro řešení daného problému – vztahuje se ke zkoumané problematice.',
  'panelový efekt': 'Panelový efekt je negativní jev, kdy se členové panelu stávají "profesionálními" respondenty a jejich odpovědi se mění. Řeší se obměnou části respondentů.',
  'sekundární data': 'Sekundární data již někde existují (statistiky, studie). Jejich výzkum by měl předcházet primárnímu výzkumu.',

  // Behaviorální kritéria segmentace
  'behaviorální kritéria': 'Behaviorální kritéria segmentace: příležitost užití, věrnost značce, míra používání, připravenost k nákupu, hledané užitky.',
  'věrnost značce': 'Věrnost značce (brand loyalty) je behaviorální kritérium segmentace – jak často zákazník opakovaně kupuje stejnou značku.',

  // Kultura
  'kultura': 'Kultura jako faktor spotřebního chování je učená (ne vrozená), adaptivní (mění se v čase) a přenáší se mezi generacemi.',

  // Poptávka institucí (B2B)
  'poptávka institucí': 'Poptávka institucí (B2B) je odvozená od spotřebitelské poptávky, bývá koncentrovanější, méně pružná a na rozhodování se podílí více osob.',

  // Distribuce - detaily
  'intenzivní distribuce': 'Intenzivní (usilovná) distribuce znamená, že zboží je k dispozici na všech možných prodejních místech.',
  'selektivní distribuce': 'Selektivní (výběrová) distribuce využívá omezený počet pečlivě vybraných prodejců.',
  'exkluzivní distribuce': 'Exkluzivní (výhradní) distribuce využívá velmi malý počet prodejců – často jeden v dané oblasti.',
  'přímá distribuce': 'Přímá distribuce je bez mezičlánků – přímo od výrobce k zákazníkovi.',
  'nepřímá distribuce': 'Nepřímá distribuce využívá jeden nebo více mezičlánků (velkoobchod, maloobchod).',
  'maloobchod': 'Maloobchod prodává zboží konečným spotřebitelům. Patří sem hypermarkety, supermarkety, obchodní domy. Cash & Carry je velkoobchod.',

  // Push/Pull strategie
  'push strategie': 'Push strategie "tlačí" produkt přes distribuční kanály k zákazníkovi – zaměřuje se na obchodníky a mezičlánky.',
  'pull strategie': 'Pull strategie buduje spotřebitelskou poptávku pomocí propagace. Spotřebitelé pak žádají produkt po maloobchodech.',
  'guerilla': 'Guerilla kampaně jsou nekonvenční a nízkonákladové – typické pro pull strategii, ne push.',

  // Produkt - detaily
  'komplexní pojetí produktu': 'Komplexní pojetí produktu znamená, že produkt není kupován jen pro základní funkci, ale i pro další charakteristiky (design, značku, služby).',
  'komunikační charakteristiky': 'Komunikační charakteristiky produktu jsou obal, značka, design – prvky, které komunikují se zákazníkem.',
  'funkční charakteristiky': 'Funkční charakteristiky produktu: výkon, trvanlivost, spolehlivost, údržba. Vzhled patří mezi komunikační charakteristiky.',

  // Cena - detaily
  'cenová pružnost': 'Cenová pružnost (elasticita) poptávky měří, jak poptávka reaguje na změnu ceny. Sůl má nízkou elasticitu (nezbytnost), luxusní zboží vysokou.',
  'komplementární produkt': 'Komplementární (vázaný) produkt je doplněk k jinému produktu – např. toner k tiskárně, holicí pěna k holicímu strojku.',

  // PR a komunikace
  'media relations': 'Media relations je součást PR zaměřená na budování vztahů s médii. Typickým nástrojem jsou tiskové konference.',
  'krizová komunikace': 'Krizová komunikace je důležitou součástí PR – řízení komunikace během krizových situací.',

  // Plánování a orientace
  'geocentrická orientace': 'Geocentrická orientace vnímá celý svět jako jeden trh. Etnocentrická se soustředí na domácí trh, polycentrická na jednotlivé zahraniční trhy.',

  // Kupní chování a role
  'kupní role': 'Kupní role v rodině: převaha muže, převaha ženy, společné rozhodování. Expresivní rozhodování není standardní klasifikace.',
  'kupní chování': 'Kupní chování zákazníků zkoumá: kdo, co, proč, kdy a jak nakupuje a užívá produkty.',
  'ponákupní chování': 'Ponákupní chování zahrnuje spokojenost, věrnost značce, kladné/záporné WOM (word-of-mouth), generalizaci (přenos spokojenosti na další produkty značky).',
  'wom': 'WOM (Word-of-Mouth) je ústní šíření informací mezi spotřebiteli. Kladné WOM je výsledkem spokojenosti s produktem.',

  // Skupiny
  'disociační skupina': 'Disociační skupina je referenční skupina, ke které jedinec NECHCE patřit. Opakem je aspirační skupina (chce patřit).',
  'primární skupina': 'Primární skupina je charakteristická těsnými vazbami, častým stykem a důvěrnými neformálními vztahy (rodina, přátelé).',
  'sekundární skupina': 'Sekundární skupina má formálnější vztahy a méně častý kontakt (kolegové, spolky).',

  // Výzkumné metody
  'anketa': 'Anketa není reprezentativní výzkumná metoda – respondenti se sami rozhodnou odpovědět, výsledky nelze zobecnit na populaci.',
  'ad hoc výzkum': 'Ad hoc výzkum je jednorázový výzkum pro konkrétní jedinečný účel, na rozdíl od kontinuálního nebo syndikovaného výzkumu.',
  'projektivní techniky': 'Projektivní techniky (slovní asociace, dokončování vět, TAT) vyžadují psychologickou interpretaci a odhalují skryté motivace.',
  'aio': 'AIO (Activities, Interests, Opinions) je metoda psychografické segmentace definující životní styl spotřebitele.',

  // Produkt specifika
  'produkt definice': 'Produkt v marketingu zahrnuje nejen fyzické zboží, ale i služby, myšlenky, osoby, místa a organizace.',
  'design': 'Design výrobku může představovat konkurenční výhodu – odlišuje produkt od konkurence a přináší funkční i estetickou hodnotu.',
  'komplexní výrobek': 'Model komplexního výrobku (Mercator) se hodí pro luxusní produkty, kde jsou důležité emocionální a symbolické hodnoty.',
  'životní cyklus produktu': 'Průběh životního cyklu produktu je zákonitý, ale závisí na mnoha faktorech včetně těch, které firma nemůže ovlivnit.',

  // Cena a podpora prodeje
  'podpora prodeje': 'Podpora prodeje zahrnuje krátkodobé stimuly: slevy, bonusy, kupóny, soutěže, vzorky. Je součástí komunikačního mixu, ne cena.',
  'tvorba ceny': 'Základní metody tvorby ceny: nákladově orientovaná, poptávkově orientovaná, konkurenčně orientovaná.',
  'poptávka luxusní': 'Křivka poptávky po luxusním zboží může být odlišná od běžných produktů – vyšší cena může znamenat vyšší vnímanou hodnotu (Veblenův efekt).',

  // Distribuční systémy
  'korporační systém': 'Korporační (vertikální) distribuční systém = vlastnictví více úrovní distribuce jednou firmou. Ne spojení firem na stejné úrovni.',
  'administrativní systém': 'Administrativní distribuční systém koordinuje nezávislé subjekty na základě síly jednoho dominantního člena, ne na základě licencí.',
  'franchising': 'Franchising je poskytnutí licence k podnikání, včetně know-how, loga a obchodního jména sítě.',

  // PR specifika
  'spotřebitelské soutěže': 'Spotřebitelské soutěže jsou nástrojem podpory prodeje, nikoli public relations.',

  // Výzkumné techniky - specifické
  'oční kamera': 'Oční kamera (eye tracking) sleduje pohyb očí a používá se k testování tiskovin, webových stránek a obalů. Nesouvisí s percepční mapou.',
  'kvótní výběr': 'Kvótní výběr není náhodný – tazatel vybírá respondenty podle předem stanovených kvót (věk, pohlaví). O výběru nerozhoduje náhoda.',
  'percepční mapa': 'Percepční mapa zobrazuje vnímání značek/produktů spotřebiteli v prostoru definovaném důležitými atributy. Nevychází z oční kamery.',

  // Geografické faktory
  'geografické faktory': 'Geografické okolí/faktory ovlivňují zejména logistiku a distribuci, nikoliv legislativu, daně či výběr pracovní síly.',

  // Vnímání produktu
  'vnímání produktu': 'Spotřebitelské vnímání výrobku znamená zejména příznivý poměr mezi cenou a funkčními charakteristikami (hodnota za peníze).',

  // Cena - specifika
  'cena v mixu': 'Cena je součástí marketingového mixu (4P), nikoliv komunikačního mixu. Komunikační mix zahrnuje reklamu, PR, podporu prodeje atd.',
  'externí faktory ceny': 'Externí faktory ovlivňující cenu: konkurence, poptávka, charakter trhu, hospodářská situace. Cíle firmy jsou interní faktor.',
  'sbírání smetany': 'Strategie sbírání smetany (skimming) = vysoké počáteční ceny, menší objem prodeje. Opakem je penetrační cena.',
  'referenční cena': 'Referenční cena je cena, kterou si spotřebitelé pamatují a se kterou porovnávají aktuální ceny produktů.',
  'elasticita': 'Elasticita poptávky: pokles o 1 % při růstu ceny o 10 % = neelastická poptávka (koeficient < 1). Elastická by byla při poklesu > 10 %.',

  // Plánování
  'plánování': 'Při plánování se berou v potaz oblasti: výroba, nákup, finance, obnova majetku. Lidské zdroje jsou obvykle samostatnou oblastí HR.',

  // Opinion leader
  'opinion leader': 'Opinion leader (názorový vůdce) je osoba, která ovlivňuje názory a rozhodování ostatních ve své sociální skupině. NENÍ to vedoucí firma na trhu – ta se nazývá "market leader".',
};

// Detect concepts in question text
function detectConcepts(text) {
  const lowerText = text.toLowerCase();
  const found = [];

  const keywords = {
    'b2b': ['b2b', 'business-to-business', 'business to business', 'mezipodnikov'],
    'b2c': ['b2c', 'business-to-consumer', 'business to consumer', 'konečn'],
    '4p': ['4p', '4 p', 'marketingov.{1,5}mix', 'product', 'price', 'place', 'promotion'],
    '4c': ['4c', '4 c', 'customer value', 'cost', 'convenience', 'communication'],
    'výrobní koncepce': ['výrobní koncepce', 'výrobní přístup', 'vysoký objem výroby'],
    'produktová koncepce': ['produktová koncepce', 'produktový přístup', 'kvalitní výrobek', 'krátkozrakost'],
    'prodejní koncepce': ['prodejní koncepce', 'prodejní přístup', 'agresivní prodej', 'pasivní spotřebitel'],
    'marketingová koncepce': ['marketingová koncepce', 'marketingový přístup', 'potřeby zákazníka', 'uspokojování potřeb'],
    'společenský marketing': ['společensk', 'sociální koncepce', 'sociální marketing'],
    'csr': ['csr', 'společenská odpovědnost', 'corporate social'],
    'segmentace': ['segmentace', 'segment'],
    'targeting': ['targeting', 'cílení', 'cílový trh', 'cílovou skupin'],
    'positioning': ['positioning', 'pozicování', 'umístění značky', 'pozice v mysli'],
    'stp': ['stp', 'segmentace.{1,20}targeting', 'targeting.{1,20}positioning'],
    'swot': ['swot', 'silné stránky', 'slabé stránky', 'příležitosti', 'hrozby'],
    'pest': ['pest', 'pestle', 'makroprostředí'],
    'bcg': ['bcg', 'boston', 'hvězdy', 'dojné krávy', 'otazníky', 'psi'],
    'ansoff': ['ansoff', 'penetrace trhu', 'diverzifikace', 'rozvoj trhu', 'rozvoj produktu'],
    'primární výzkum': ['primární výzkum', 'primární data', 'primárního výzkumu'],
    'sekundární výzkum': ['sekundární výzkum', 'sekundární data', 'sekundárního výzkumu'],
    'kvalitativní výzkum': ['kvalitativní', 'focus group', 'hloubkový rozhovor'],
    'kvantitativní výzkum': ['kvantitativní', 'statistick'],
    'životní cyklus': ['životní cyklus', 'fáze.{1,10}produkt', 'zavádění', 'růst', 'zralost', 'úpadek'],
    'značka': ['značk', 'brand', 'logo'],
    'reklama': ['reklam', 'inzerát', 'mediální'],
    'aida': ['aida', 'attention', 'interest', 'desire', 'action'],
    'marketing': ['marketing', 'marketingov'],
    'směna': ['směn', 'hodnot'],

    // Nové pojmy
    'hofstede': ['hofstede', 'kolektivist', 'individualist', 'maskulinit', 'femininit'],
    'kolektivismus': ['kolektivist', 'kolektivní společnost'],
    'maskulinita': ['maskulinit', 'femininit'],
    'rozvoj trhu': ['rozvoj trhu', 'nové trhy pro.{1,20}stávající', 'stávající produkt.{1,20}nový trh'],
    'aspirační skupina': ['aspirační', 'přeje patřit', 'identifikuje'],
    'referenční skupina': ['referenční skupina'],
    'postoj': ['postoj', 'kognitivní', 'afektivní', 'konativní'],
    'konativní složka': ['konativní'],
    'porter': ['porter', 'konkurenční síl', 'pěti sil', '5 sil'],
    'konkurenční síly': ['vyjednávací síl', 'hrozba substitut', 'hrozba vstup'],
    'validita': ['validit', 'měří to, co'],
    'reliabilita': ['reliabilit', 'spolehlivost', 'opakovan.{1,10}stejn'],
    'relevance': ['relevan', 'využiteln.{1,10}pro řešení'],
    'panelový efekt': ['panelový efekt', 'panel', 'profesionální.{1,10}respondent'],
    'sekundární data': ['sekundární.{1,10}dat', 'existující data', 'předchází.{1,10}primární'],
    'behaviorální kritéria': ['behaviorální', 'věrnost.{1,10}značk', 'míra používání', 'připravenost.{1,10}nákup'],
    'kultura': ['kultura je', 'kulturní', 'predispozic'],
    'poptávka institucí': ['poptávka institucí', 'kupní chování institucí', 'odvozená.{1,10}poptávk'],
    'intenzivní distribuce': ['intenzivní distribuc', 'usilovná distribuc', 'všech.{1,10}prodejních'],
    'selektivní distribuce': ['selektivní', 'výběrová distribuc'],
    'exkluzivní distribuce': ['exkluzivní', 'výhradní distribuc'],
    'přímá distribuce': ['přímá distribu', 'bez mezičlánk'],
    'nepřímá distribuce': ['nepřímá distribu', 'mezičlán'],
    'maloobchod': ['maloobchod', 'hypermarket', 'supermarket', 'obchodní dům', 'cash.{1,5}carry'],
    'push strategie': ['push', 'tlačí produkt', 'protlačení'],
    'pull strategie': ['pull', 'spotřebitelská poptávka', 'budování.{1,10}poptávk'],
    'guerilla': ['gueril', 'geril'],
    'komplexní pojetí produktu': ['komplexní pojetí', 'základní funkc'],
    'komunikační charakteristiky': ['komunikační charakteristik', 'obal.{1,10}značk'],
    'funkční charakteristiky': ['funkční charakteristik', 'trvanlivost', 'výkon'],
    'cenová pružnost': ['cenová pružnost', 'elasticit', 'pružnost poptávky'],
    'komplementární produkt': ['komplementární', 'vázaný produkt'],
    'media relations': ['media relations', 'tiskové konference'],
    'krizová komunikace': ['krizová komunikace', 'krizov'],
    'geocentrická orientace': ['geocentric', 'etnocentric', 'polycentric'],

    // Nové pojmy - druhá vlna
    'kupní role': ['kupní rol', 'převaha muže', 'převaha ženy', 'společné rozhodování'],
    'kupní chování': ['kupní chování', 'kdo nakupuje', 'co nakupuje', 'proč.{1,10}nakupuje'],
    'ponákupní chování': ['ponákupní', 'spokojenost.{1,10}výrobk', 'věrnost', 'loajalit', 'generalizac'],
    'wom': ['wom', 'word.{1,5}mouth', 'ústní.{1,10}šíření'],
    'disociační skupina': ['disociační', 'nechce patřit'],
    'primární skupina': ['primární skupina', 'těsn.{1,10}vazb', 'důvěrn.{1,10}vztah'],
    'anketa': ['anket', 'zobecn.{1,10}celek'],
    'ad hoc výzkum': ['ad hoc', 'jednorázový výzkum'],
    'projektivní techniky': ['projektivní', 'slovní asociac', 'dokončovací'],
    'aio': ['aio', 'activities.{1,10}interests', 'životní styl'],
    'produkt definice': ['pod pojmem produkt', 'produkt.{1,10}představuje', 'fyzické zboží', 'myšlenk'],
    'design': ['design.{1,10}výrobk', 'konkurenční výhod.{1,10}design'],
    'komplexní výrobek': ['komplexní.{1,10}výrobk', 'mercator', 'luxusní.{1,10}produkt'],
    'životní cyklus produktu': ['průběh životního cyklu', 'životní cyklus.{1,10}zákonit'],
    'podpora prodeje': ['podpora prodeje', 'slevy.{1,10}bonusy', 'kupóny', 'spotřebitelské soutěže'],
    'tvorba ceny': ['tvorba ceny', 'metod.{1,10}ceny', 'dle nákladů', 'dle poptávky', 'dle konkurence'],
    'poptávka luxusní': ['křivka poptávky', 'luxusní.{1,10}produkt', 'běžn.{1,10}produkt'],
    'korporační systém': ['korporační.{1,10}systém', 'korporační.{1,10}distribu'],
    'administrativní systém': ['administrativní.{1,10}systém', 'administrativní.{1,10}distribu'],
    'franchising': ['franchis', 'licence.{1,10}podnikání', 'know.{1,5}how'],
    'spotřebitelské soutěže': ['spotřebitelské soutěže', 'soutěže.{1,10}public relations'],

    // Třetí vlna pojmů
    'oční kamera': ['oční kamer', 'eye.{1,5}track'],
    'kvótní výběr': ['kvótní', 'kvót'],
    'percepční mapa': ['percepční map'],
    'geografické faktory': ['geografické okolí', 'geografick.{1,10}ovlivňuje'],
    'vnímání produktu': ['vnímání výrobku', 'spotřebitelské vnímání'],
    'cena v mixu': ['cena.{1,10}nástroj', 'cena.{1,10}komunikační'],
    'externí faktory ceny': ['externí faktor.{1,10}cen', 'faktor.{1,10}ovlivňuj.{1,10}cen'],
    'sbírání smetany': ['sbírání smetany', 'skimming'],
    'referenční cena': ['referenční cen'],
    'elasticita': ['elastick', 'neelastick', 'pružnost poptávky', 'klesne.{1,10}poptávan'],
    'plánování': ['při plánování', 'nebere v potaz'],
    'opinion leader': ['opinion leader', 'názorový vůdce'],
  };

  for (const [concept, patterns] of Object.entries(keywords)) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lowerText)) {
        found.push(concept);
        break;
      }
    }
  }

  return [...new Set(found)];
}

// Generate explanation for a question using Claude API
async function generateExplanation(question, lessonTitle) {
  const { text, answers } = question;
  const correctAnswers = answers.filter(a => a.isCorrect);
  const incorrectAnswers = answers.filter(a => !a.isCorrect);

  // Detect concepts in question and answers
  const allText = text + ' ' + answers.map(a => a.text).join(' ');
  const detectedConcepts = detectConcepts(allText);

  // Is it an ANO/NE question?
  const isYesNo = answers.length === 2 &&
    answers.some(a => a.text.toUpperCase() === 'ANO') &&
    answers.some(a => a.text.toUpperCase() === 'NE');

  // Format question data for Claude
  const correctAnswerText = correctAnswers.length === 1
    ? correctAnswers[0].text
    : correctAnswers.map(a => a.text).join(', ');

  const incorrectAnswerList = incorrectAnswers.length > 0
    ? '\n\nNesprávné odpovědi:\n' + incorrectAnswers.map(a => `- ${a.text}`).join('\n')
    : '';

  const conceptContext = detectedConcepts.length > 0
    ? `\n\nKlíčové marketingové koncepty v otázce: ${detectedConcepts.join(', ')}`
    : '';

  const prompt = `Jsi lektor marketingu. Vyrábíš detailní vysvětlení pro otázku ze lekce "${lessonTitle}".

OTÁZKA: ${text}

${isYesNo ? 'Typ: ANO/NE otázka' : 'Typ: Multiple choice otázka'}
SPRÁVNÁ ODPOVĚĎ(I): ${correctAnswerText}
${incorrectAnswerList}
${conceptContext}

Vygeneruj DETAILNÍ VYSVĚTLENÍ (2-3 odstavce) v češtině, které:
1. PRVNÍ ODSTAVEC: Jasně vysvětli, proč je správná odpověď správná. Zaměř se na marketingový koncept a jeho aplikaci.
2. DRUHÝ ODSTAVEC: Pokud existují nesprávné odpovědi, vysvětli proč jsou špatné a co je jejich chybou v Understanding.
3. TŘETÍ ODSTAVEC: Krátce připomeň, kde se o tomto tématu mluví v lekci nebo jak se to uplatňuje v praxi.

Formátuj odpověď přímo bez seznamů, jen přirozené odstavce. Buď konkrétní a praktický.`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const explanation = message.content[0].type === 'text' ? message.content[0].text : '';
    return explanation.trim();
  } catch (error) {
    console.error(`Chyba při generování vysvětlení pro otázku: ${text.substring(0, 50)}...`);
    console.error(error.message);
    // Fallback na staré vysvětlení
    return question.explanation;
  }
}

// Main function
async function main() {
  const lessonsPath = join(__dirname, '..', 'src', 'data', 'lessons.json');
  const lessons = JSON.parse(readFileSync(lessonsPath, 'utf8'));

  let totalQuestions = 0;
  let updatedQuestions = 0;
  let failedQuestions = 0;

  console.log('🚀 Spouštím generování AI vysvětlení...\n');

  for (const lesson of lessons) {
    console.log(`📚 Zpracovávám lekci: ${lesson.title}`);

    for (const question of lesson.questions) {
      totalQuestions++;

      try {
        const newExplanation = await generateExplanation(question, lesson.title);

        if (newExplanation && newExplanation !== question.explanation) {
          question.aiExplanation = newExplanation;
          updatedQuestions++;
          process.stdout.write('.');
        } else {
          question.aiExplanation = question.explanation;
          process.stdout.write('~');
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failedQuestions++;
        question.aiExplanation = question.explanation;
        process.stdout.write('✗');
      }
    }
    console.log('');
  }

  writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2), 'utf8');

  console.log('\n✅ Hotovo!');
  console.log(`📊 Statistika:`);
  console.log(`   - Celkem otázek: ${totalQuestions}`);
  console.log(`   - Vylepšeno: ${updatedQuestions}`);
  console.log(`   - Chyb: ${failedQuestions}`);
  console.log(`   - Uloženo do: ${lessonsPath}`);
}

main().catch(console.error);
