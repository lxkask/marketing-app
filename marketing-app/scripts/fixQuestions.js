import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '../src/data/lessons.json');
const lessons = JSON.parse(readFileSync(dataPath, 'utf-8'));

console.log('=== Oprava otázek ===\n');
let fixCount = 0;

function getLesson(id) {
  return lessons.find(l => l.id === id);
}

function getQuestion(lessonId, questionId) {
  const lesson = getLesson(lessonId);
  return lesson?.questions.find(q => q.id === questionId);
}

function logFix(lesson, question, desc) {
  fixCount++;
  console.log(`[${fixCount}] Lekce ${lesson}, Otázka ${question}: ${desc}`);
}

// ============================================================
// LEKCE 1 - Původní opravy + nové
// ============================================================
const lesson1 = getLesson(1);
if (lesson1) {
  const q6 = lesson1.questions.find(q => q.id === 6);
  if (q6) {
    // Deduplikace + oprava: "Zkrácená verze označující business-to-business" má být správná
    q6.answers = [
      { text: "Zkrácená verze označující \"business-to-buyers\"", isCorrect: false },
      { text: "Označuje metodu, která slouží k analýze marketingového makroprostředí", isCorrect: false },
      { text: "Je marketing na mezipodnikových trzích", isCorrect: true },
      { text: "Počet zákazníků je obvykle menší, než je tomu v případě B2C marketingu", isCorrect: true },
      { text: "Je marketing na trzích spotřebitelů", isCorrect: false },
      { text: "Označuje to samé, co B2C marketing", isCorrect: false },
      { text: "Zkrácená verze označující \"business-to-business\"", isCorrect: true },
      { text: "Označuje marketing, kdy je zákazníkem konečný spotřebitel", isCorrect: false },
      { text: "Označuje marketing, kdy je zákazníkem jiná firma", isCorrect: true }
    ];
    logFix(1, 6, "Opravena správnost odpovědi 'business-to-business'");
  }
}

// ============================================================
// LEKCE 3
// ============================================================

// Otázka 1 - poslední odpověď = 2 spojené
const l3q1 = getQuestion(3, 1);
if (l3q1) {
  l3q1.answers = [
    { text: "zaměřuje primárně na dodavatele", isCorrect: false },
    { text: "zaměřuje primárně na kvalitu výrobku a jeho zdokonalování", isCorrect: false },
    { text: "zaměřuje primárně na zákazníka a uspokojování jeho potřeb", isCorrect: true },
    { text: "zaměřuje primárně na konkurenci", isCorrect: false },
    { text: "zaměřuje primárně na prodej výrobku", isCorrect: false }
  ];
  logFix(3, 1, "Rozdělena spojená odpověď");
}

// Otázka 3 - odpověď 3 = 2 spojené, druhá správná
const l3q3 = getQuestion(3, 3);
if (l3q3) {
  l3q3.answers = [
    { text: "vychází z předpokladu, že zákazník je ochoten zaplatit za vysoce kvalitní výrobek vysokou cenu.", isCorrect: true },
    { text: "se soustředí primárně na výrobek, na potřeby zákazníka již méně – koncepce tak může vést k \"marketingové\" krátkozrakosti", isCorrect: true },
    { text: "vychází z předpokladu, že zákazník preferuje velké množství výrobků za přiměřenou cenu", isCorrect: false },
    { text: "vychází z předpokladu, že spotřebitel požaduje vysoce kvalitní výrobek", isCorrect: true },
    { text: "se soustředí zejména na prodej výrobku zákazníkům.", isCorrect: false }
  ];
  logFix(3, 3, "Rozdělena spojená odpověď, opravena správnost");
}

// Otázka 12 - první odpověď = 2 spojené, obě správné
const l3q12 = getQuestion(3, 12);
if (l3q12) {
  l3q12.answers = [
    { text: "přístup podle kterého je spotřebitel pasivní", isCorrect: true },
    { text: "přístup k trhu založený na \"agresivním\" prodeji.", isCorrect: true },
    { text: "uplatňována zejména u luxusního zboží.", isCorrect: false },
    { text: "často uplatňována u tzv. \"nehledaného zboží\" (např. pojištění)", isCorrect: true },
    { text: "přístup, v jehož jádru je výroba velkého množství výrobků bez ohledu na technický pokrok a design.", isCorrect: false }
  ];
  logFix(3, 12, "Rozdělena spojená odpověď");
}

// ============================================================
// LEKCE 5
// ============================================================

// Otázka 21 - 3. odpověď = 2 spojené, žádná správná
const l5q21 = getQuestion(5, 21);
if (l5q21) {
  l5q21.answers = [
    { text: "je nespokojenost kupujícího způsobená ponákupním konfliktem", isCorrect: true },
    { text: "je nespokojenost, která se objevuje ve druhé fázi nákupního procesu", isCorrect: false },
    { text: "je nespokojenost, která se objevuje v první fázi nákupního procesu", isCorrect: false },
    { text: "je nespokojenost, která se objevuje ve třetí fázi nákupního procesu", isCorrect: false }
  ];
  logFix(5, 21, "Rozdělena spojená odpověď");
}

// Otázka 27 - celá otázka 29 se naparsovala sem
const l5q27 = getQuestion(5, 27);
if (l5q27) {
  l5q27.answers = [
    { text: "nadnárodní hranice", isCorrect: false },
    { text: "globální hranice", isCorrect: false },
    { text: "národní hranice", isCorrect: true },
    { text: "evropské hranice", isCorrect: false }
  ];
  logFix(5, 27, "Odstraněna naparsovaná otázka 29");
}

// ============================================================
// LEKCE 6 - Původní opravy + nové
// ============================================================
const lesson6 = getLesson(6);
if (lesson6) {
  // Původní oprava - smazat otázky 1-8 (které byly notes, ne questions)
  const before = lesson6.questions.length;
  lesson6.questions = lesson6.questions.filter(q => q.id > 8);
  lesson6.questions.forEach((q, i) => { q.id = i + 1; });
  if (before > lesson6.questions.length) {
    logFix(6, "1-8", `Smazáno ${before - lesson6.questions.length} neplatných otázek`);
  }
}

// Po přečíslování - nové ID jsou o 8 menší
// Původní ID 2 -> nyní neexistuje (smazáno)
// Původní ID 10 -> nyní ID 2
// atd.

// Otázka 2 (původně 10) - odpověď 6 = 2 spojené, druhá správná
const l6q2 = getQuestion(6, 2);
if (l6q2) {
  l6q2.answers = [
    { text: "obvykle odpovídá na otázku \"Kolik?\"", isCorrect: false },
    { text: "informativní výzkum používaný pro zjištění motivací a chování zákazníků", isCorrect: true },
    { text: "obvykle odpovídá na otázku \"Proč?\"", isCorrect: true },
    { text: "typicky pracuje s velkými reprezentativními vzorky", isCorrect: false },
    { text: "odpovídá obvykle na otázku \"Jaká je kvalita?\"", isCorrect: false },
    { text: "umožňuje deskripci trhu, mapuje tržní situaci a umožňuje přesnou kvantifikaci", isCorrect: false },
    { text: "je typicky obtížně kvantifikovatelný, a vyžaduje tak psychologickou interpretaci", isCorrect: true }
  ];
  logFix(6, 2, "Rozdělena spojená odpověď, opravena správnost");
}

// Otázka 13 (původně 21) - celá otázka 14 se naparsovala
const l6q13 = getQuestion(6, 13);
if (l6q13) {
  l6q13.answers = [
    { text: "negativní jev, který se řeší obměnou části respondentů v panelu", isCorrect: true },
    { text: "fixní skupinu respondentů, jejíž účastníci jsou pravidelně obměňováni", isCorrect: false },
    { text: "jev, kdy se členové panelu stávají \"profesionálními\" respondenty", isCorrect: true },
    { text: "fixní skupinu expertů na zkoumané téma", isCorrect: false }
  ];
  logFix(6, 13, "Odstraněna naparsovaná otázka 14");
}

// Otázka 15 (původně 23) - odpověď 3 = 2 spojené, ani jedna správná
const l6q15 = getQuestion(6, 15);
if (l6q15) {
  l6q15.answers = [
    { text: "Následně po sekundárním výzkumu", isCorrect: true },
    { text: "Před sekundárním výzkumem", isCorrect: false },
    { text: "Převážně jako tzv. 'výzkum od stolu'", isCorrect: false },
    { text: "Zejména metodami kvalitativního výzkumu", isCorrect: false }
  ];
  logFix(6, 15, "Rozdělena spojená odpověď");
}

// Otázka 19 (původně 27) - v otázce je první odpověď
const l6q19 = getQuestion(6, 19);
if (l6q19) {
  l6q19.text = "Primární skupina";
  l6q19.answers = [
    { text: "je výlučně rodina", isCorrect: false },
    { text: "je vždy totožná s tzv. disociační skupinou.", isCorrect: false },
    { text: "žádná z předchozích odpovědí", isCorrect: true },
    { text: "je vždy totožná s tzv. aspirační skupinou.", isCorrect: false },
    { text: "je charakteristická nepřítomností osobních a důvěrných vztahů.", isCorrect: false }
  ];
  logFix(6, 19, "Opravena otázka - odpověď přesunuta z textu");
}

// Otázka 37 (původně 45) - pouze 1 odpověď, přidat špatné
const l6q37 = getQuestion(6, 37);
if (l6q37) {
  l6q37.answers = [
    { text: "Určit odpověď na otázku proč", isCorrect: true },
    { text: "Určit odpověď na otázku kolik", isCorrect: false },
    { text: "Získat statisticky reprezentativní data", isCorrect: false },
    { text: "Pracovat s velkými vzorky respondentů", isCorrect: false }
  ];
  logFix(6, 37, "Přidány chybějící špatné odpovědi");
}

// Otázka 40 (původně 48) - odpovědi obsahují "(špatně)"
const l6q40 = getQuestion(6, 40);
if (l6q40) {
  l6q40.answers = l6q40.answers.map(a => ({
    ...a,
    text: a.text.replace(/\s*\(špatně\)\s*/gi, '').trim()
  }));
  logFix(6, 40, "Odstraněn text '(špatně)' z odpovědí");
}

// ============================================================
// LEKCE 7 - Původní opravy + nové
// ============================================================

// Otázka 2 - celá otázka 3 se vložila + spojené odpovědi
const l7q2 = getQuestion(7, 2);
if (l7q2) {
  l7q2.answers = [
    { text: "měl by být vnitřně heterogenní a vnějškově homogenní", isCorrect: false },
    { text: "měl by být vnitřně homogenní a vnějškově heterogenní", isCorrect: true },
    { text: "měl by být dostatečně rozptýlený", isCorrect: false },
    { text: "neměl by na daný soubor marketingových stimulů reagovat stejným způsobem", isCorrect: false }
  ];
  logFix(7, 2, "Odstraněna naparsovaná otázka 3");
}

// Otázka 11 - již opraveno dříve (ponecháno)
const l7q11 = getQuestion(7, 11);
if (l7q11 && l7q11.answers.length === 1) {
  l7q11.answers = [
    { text: "podobnosti jednotlivých segmentů mezi sebou navzájem", isCorrect: false },
    { text: "dostatečné přístupnosti segmentu", isCorrect: false },
    { text: "podobnosti zákazníků v daném segmentu", isCorrect: true },
    { text: "dostatečné velikosti segmentu", isCorrect: false }
  ];
  logFix(7, 11, "Rozděleno na 4 odpovědi");
}

// Otázka 14 - celá otázka 16 se vložila
const l7q14 = getQuestion(7, 14);
if (l7q14) {
  l7q14.answers = [
    { text: "rozděluje zákazníky do homogenních skupin podle daných znaků", isCorrect: true },
    { text: "žádná z předchozích", isCorrect: false },
    { text: "řeší výběr distribučních strategií", isCorrect: false },
    { text: "spočívá ve stanovení benefitů a asociací, které firma komunikuje směrem k danému segmentu", isCorrect: false }
  ];
  logFix(7, 14, "Odstraněna naparsovaná otázka 16");
}

// Otázka 21 - 5 odpovědí spojených, správná jen "životní styl"
const l7q21 = getQuestion(7, 21);
if (l7q21) {
  l7q21.answers = [
    { text: "příjem", isCorrect: false },
    { text: "věrnost značce", isCorrect: false },
    { text: "životní styl", isCorrect: true },
    { text: "míra užití produktu", isCorrect: false },
    { text: "hodnoty", isCorrect: true },
    { text: "věk", isCorrect: false }
  ];
  logFix(7, 21, "Rozděleny spojené odpovědi, opravena správnost");
}

// Otázka 25 - otázka 28 se naparsovala
const l7q25 = getQuestion(7, 25);
if (l7q25) {
  l7q25.answers = [
    { text: "vnitřní dělitelnost segmentů", isCorrect: false },
    { text: "vnitřní homogenita segmentů", isCorrect: true },
    { text: "vnější heterogenita segmentů", isCorrect: true },
    { text: "vnější dělitelnost segmentů", isCorrect: false }
  ];
  logFix(7, 25, "Odstraněna naparsovaná otázka 28");
}

// Otázka 31 - již opraveno dříve (ponecháno)
const l7q31 = getQuestion(7, 31);
if (l7q31) {
  l7q31.text = "Mezi segmentační kritéria uplatňovaná při segmentaci institucionálních trhů patří:";
  l7q31.answers = [
    { text: "velikost společnosti", isCorrect: true },
    { text: "používané technologie", isCorrect: true },
    { text: "lokalita", isCorrect: true },
    { text: "životní styl", isCorrect: false }
  ];
  logFix(7, 31, "Opraveny odpovědi");
}

// Otázka 44 - v otázce je první odpověď
const l7q44 = getQuestion(7, 44);
if (l7q44) {
  l7q44.text = "Segment trhu by měl splňovat určité požadavky";
  l7q44.answers = [
    { text: "měl by být vnitřně homogenní a vnějškově heterogenní.", isCorrect: true },
    { text: "měl by být dostupný.", isCorrect: true },
    { text: "měl by být dostatečně rozptýlený.", isCorrect: false },
    { text: "měl by být vnitřně heterogenní a vnějškově homogenní.", isCorrect: false }
  ];
  logFix(7, 44, "Opravena otázka - odpověď přesunuta z textu");
}

// ============================================================
// LEKCE 8
// ============================================================

// Otázka 1 - žádná správná odpověď (rozřeďování značky = úspěšné použití pro jinou kategorii)
const l8q1 = getQuestion(8, 1);
if (l8q1) {
  l8q1.answers = [
    { text: "Úspěšné použití značky pro jinou produktovou kategorii", isCorrect: true },
    { text: "Grafická úprava známé úspěšné značky", isCorrect: false },
    { text: "Označení pro proces postupného posilování značky v dané cílové skupině", isCorrect: false },
    { text: "Označení pro proces, kdy se povědomí o značce šíří masivně mezi lidmi", isCorrect: false }
  ];
  logFix(8, 1, "Opravena správná odpověď");
}

// Otázka 20 - odpověď 2 = 2 spojené, ani jedna správná
const l8q20 = getQuestion(8, 20);
if (l8q20) {
  l8q20.answers = [
    { text: "to samé, co tzv. značka výrobce", isCorrect: false },
    { text: "je označení pro značku, která je v krizi", isCorrect: false },
    { text: "označení pro tzv. rodinnou značku", isCorrect: false },
    { text: "to samé, co tzv. maloobchodní značka", isCorrect: true },
    { text: "to samé, co tzv. private label", isCorrect: true }
  ];
  logFix(8, 20, "Rozdělena spojená odpověď");
}

// Otázka 28 - otázka 30 se naparsovala
const l8q28 = getQuestion(8, 28);
if (l8q28) {
  l8q28.answers = [
    { text: "jedinečný užitek spojený s danou značkou, který je dlouhodobě komunikován", isCorrect: true },
    { text: "agresivní strategii obchodních zástupců", isCorrect: false },
    { text: "strategii vysokých cen a dalších poplatků", isCorrect: false },
    { text: "způsob positioningu značky, kdy je komunikován nefunkční emocionální atribut", isCorrect: false },
    { text: "způsob, jakým je vymezována cena produktu v maloobchodním řetězci", isCorrect: false }
  ];
  logFix(8, 28, "Odstraněna naparsovaná otázka 30");
}

// Otázka 37 - pouze 1 spojená odpověď
const l8q37 = getQuestion(8, 37);
if (l8q37) {
  l8q37.answers = [
    { text: "představují pro značky výrobce velký problém", isCorrect: true },
    { text: "bývají levnější než značky výrobce", isCorrect: true },
    { text: "bývají dražší než značky výrobce", isCorrect: false },
    { text: "oslovují zejména spořivější zákazníky", isCorrect: true }
  ];
  logFix(8, 37, "Rozdělena spojená odpověď");
}

// Otázka 45 - otázka 48 se naparsovala se všemi odpověďmi
const l8q45 = getQuestion(8, 45);
if (l8q45) {
  l8q45.answers = [
    { text: "jedinečné emoce spojené s danou značkou", isCorrect: false },
    { text: "nejlepší servis na trhu", isCorrect: true },
    { text: "nejpokročilejší technologie na trhu", isCorrect: true },
    { text: "nejvyšší kvalita na trhu", isCorrect: true }
  ];
  logFix(8, 45, "Odstraněna naparsovaná otázka 48");
}

// Otázka 46 - odpověď 1 = 2 spojené, první správná
const l8q46 = getQuestion(8, 46);
if (l8q46) {
  l8q46.answers = [
    { text: "jedinečný užitek spojený s danou značkou, který je dlouhodobě komunikován.", isCorrect: true },
    { text: "způsob, jakým je vymezována cena produktu v maloobchodním řetězci", isCorrect: false },
    { text: "strategii vysokých cen a dalších poplatků.", isCorrect: false },
    { text: "agresivní strategii obchodních zástupců.", isCorrect: false }
  ];
  logFix(8, 46, "Rozdělena spojená odpověď, opravena správnost");
}

// ============================================================
// LEKCE 9
// ============================================================

// Otázka 7 - odpověď 3 = 2 spojené, druhá správná
const l9q7 = getQuestion(9, 7);
if (l9q7) {
  l9q7.answers = [
    { text: "Dojné krávy mají vysoké tempo růstu, ale relativně nízký tržní podíl", isCorrect: false },
    { text: "Dojné krávy mají vysoké tempo růstu a relativně vysoký tržní podíl", isCorrect: false },
    { text: "Dojné krávy mají nízké tempo růstu a nízký tržní podíl", isCorrect: false },
    { text: "Dojné krávy mají nízké tempo růstu, ale vysoký tržní podíl", isCorrect: true }
  ];
  logFix(9, 7, "Rozdělena spojená odpověď, opravena správnost");
}

// Otázka 11 - několik odpovědí spojených
const l9q11 = getQuestion(9, 11);
if (l9q11) {
  l9q11.answers = [
    { text: "trvanlivost, vzhled, chuť, náročnost na údržbu", isCorrect: false },
    { text: "vzhled, trvanlivost, použitá technologie, výkon", isCorrect: true },
    { text: "vzhled, chuť, výkon, náročnost na údržbu", isCorrect: false },
    { text: "výkon, trvanlivost, vzhled, chuť", isCorrect: false }
  ];
  logFix(9, 11, "Rozděleny spojené odpovědi, opravena správnost");
}

// Otázka 13 - otázka 12 se naparsovala
const l9q13 = getQuestion(9, 13);
if (l9q13) {
  l9q13.answers = [
    { text: "objem prodejů a tempo růstu trhu", isCorrect: false },
    { text: "relativní tržní podíl a tempo růstu trhu", isCorrect: true },
    { text: "objem prodejů a relativní tržní podíl", isCorrect: false },
    { text: "relativní tržní podíl a cenová úroveň", isCorrect: false }
  ];
  logFix(9, 13, "Odstraněna naparsovaná otázka 12");
}

// Otázka 15 - odpověď 1 = 2 spojené, první správná
const l9q15 = getQuestion(9, 15);
if (l9q15) {
  l9q15.answers = [
    { text: "že výrobek není kupován pouze pro svoji základní funkci, ale i pro řadu dalších charakteristik", isCorrect: true },
    { text: "že do vnímání výrobku je zahrnuta i cena, prodejní místo a způsob komunikace", isCorrect: false },
    { text: "že výrobek je posuzován z pohledu všech fází životního cyklu.", isCorrect: false },
    { text: "že výrobek je posuzován i z hlediska prospěšnosti vůči životnímu prostředí", isCorrect: false }
  ];
  logFix(9, 15, "Rozdělena spojená odpověď, opravena správnost");
}

// Otázka 17 - odpověď 3 = 2 spojené, ani jedna správná
const l9q17 = getQuestion(9, 17);
if (l9q17) {
  l9q17.answers = [
    { text: "nízkým relativním tržním podílem a tempem růstu trhu nad 10 %", isCorrect: true },
    { text: "vysokým relativním tržním podílem a objemem prodejů pod 10 %", isCorrect: false },
    { text: "nízkým relativním tržním podílem a objemem prodejů nad 10 %", isCorrect: false },
    { text: "vysokým relativním tržním podílem a tempem růstu trhu pod 10 %", isCorrect: false }
  ];
  logFix(9, 17, "Rozdělena spojená odpověď");
}

// Otázka 30 - otázka 30 naparsována + chybí správná odpověď
const l9q30 = getQuestion(9, 30);
if (l9q30) {
  l9q30.answers = [
    { text: "spotřebitele nejvíce zajímá ve struktuře komplexního výrobku jádro výrobku", isCorrect: false },
    { text: "spotřebitele nejvíce zajímají ve struktuře komplexního výrobku funkční charakteristiky", isCorrect: false },
    { text: "je do spotřebitelského vnímání komplexního modelu výrobku zahrnuta cena", isCorrect: false },
    { text: "konkurenční boj se odehrává na úrovni povrchových vrstev struktury komplexního výrobku", isCorrect: true }
  ];
  logFix(9, 30, "Opraveny odpovědi, odstraněna naparsovaná otázka");
}

// Otázka 39 - otázka 40 se naparsovala
const l9q39 = getQuestion(9, 39);
if (l9q39) {
  l9q39.answers = [
    { text: "poslední fázi životního cyklu výrobku se intenzita reklamy typicky radikálně zvyšuje - firma se totiž snaží zastavit pokles prodeje", isCorrect: true },
    { text: "v průběhu životního cyklu výrobku firma obvykle mění marketingový mix", isCorrect: false },
    { text: "ve fázi zavádění výrobku na trh bývá intenzita reklamy velmi vysoká", isCorrect: false },
    { text: "nejméně významným nástrojem komunikace na trzích B2B bývá reklama", isCorrect: false }
  ];
  logFix(9, 39, "Odstraněna naparsovaná otázka 40");
}

// ============================================================
// LEKCE 10
// ============================================================

// Otázka 1 - otázka 2 se naparsovala do odpovědí
const l10q1 = getQuestion(10, 1);
if (l10q1) {
  l10q1.answers = [
    { text: "ceny konkurence", isCorrect: true },
    { text: "náklady", isCorrect: true },
    { text: "hodnota vnímaná zákazníky", isCorrect: true },
    { text: "ani jedna varianta není správně", isCorrect: false }
  ];
  logFix(10, 1, "Odstraněna naparsovaná otázka 2");
}

// Otázka 18 - první odpověď = 2 spojené + otázka 20 se naparsovala
const l10q18 = getQuestion(10, 18);
if (l10q18) {
  l10q18.answers = [
    { text: "stanovení cen pro komplementární výrobky", isCorrect: true },
    { text: "stanovení cen pro doplňkové výrobky", isCorrect: false },
    { text: "stanovení cen pro sady produktů", isCorrect: false },
    { text: "stanovení cen pro vedlejší produkty", isCorrect: false },
    { text: "stanovení cen s přirážkou", isCorrect: false },
    { text: "stanovení cen pro výrobky, které je nutné používat společně s hlavním výrobkem", isCorrect: true }
  ];
  logFix(10, 18, "Rozdělena spojená odpověď, odstraněna naparsovaná otázka 20");
}

// Otázka 21 - otázka 24 se naparsovala do odpovědí
const l10q21 = getQuestion(10, 21);
if (l10q21) {
  l10q21.answers = [
    { text: "Marketingová strategie firmy", isCorrect: true },
    { text: "Cíle firmy", isCorrect: true },
    { text: "Náklady", isCorrect: true },
    { text: "Hospodářská situace země", isCorrect: false },
    { text: "hospodářská politika státu", isCorrect: false }
  ];
  logFix(10, 21, "Odstraněna naparsovaná otázka 24");
}

// ============================================================
// LEKCE 12
// ============================================================

// Otázka 30 - otázka 31 se naparsovala
const l12q30 = getQuestion(12, 30);
if (l12q30) {
  l12q30.answers = [
    { text: "přímý prodej pomocí zásilek vhodný pro individuální komunikaci", isCorrect: true },
    { text: "nástroj direct marketingu", isCorrect: true },
    { text: "přímý prodej pomocí telefonu", isCorrect: false }
  ];
  logFix(12, 30, "Odstraněna naparsovaná otázka 31");
}

// Otázka 38 - otázka 40 se naparsovala
const l12q38 = getQuestion(12, 38);
if (l12q38) {
  l12q38.answers = [
    { text: "usiluje o vyvolání okamžité reakce oslovených jedinců", isCorrect: true },
    { text: "jeho typickými nástroji jsou direct mail, telemarketing, mobilní marketing atp.", isCorrect: true },
    { text: "jde o personalizovanou komunikaci", isCorrect: true },
    { text: "cílí zejména na masové publikum", isCorrect: false },
    { text: "cílí obvykle na menší segmenty", isCorrect: true }
  ];
  logFix(12, 38, "Odstraněna naparsovaná otázka 40");
}

// Otázka 51 - odstranit odpověď "Příspěvků v diskuzi..."
const l12q51 = getQuestion(12, 51);
if (l12q51) {
  l12q51.answers = [
    { text: "Dotazování využívající telefon", isCorrect: true },
    { text: "Online dotazování", isCorrect: false },
    { text: "Přímého marketingu", isCorrect: true },
    { text: "Experimentální", isCorrect: false }
  ];
  logFix(12, 51, "Odstraněna neplatná odpověď 'Příspěvků v diskuzi...'");
}

// ============================================================
// LEKCE 13
// ============================================================

// Otázka 2 - otázka 3 se naparsovala
const l13q2 = getQuestion(13, 2);
if (l13q2) {
  l13q2.answers = [
    { text: "kvalifikovaní zaměstnanci podniku", isCorrect: false },
    { text: "finanční nestabilita podniku", isCorrect: false },
    { text: "růst poptávky", isCorrect: true },
    { text: "silná značka podniku", isCorrect: false },
    { text: "posilující konkurence", isCorrect: true }
  ];
  logFix(13, 2, "Odstraněna naparsovaná otázka 3");
}

// Otázka 8 - otázka 11 se naparsovala
const l13q8 = getQuestion(13, 8);
if (l13q8) {
  l13q8.answers = [
    { text: "technologie výrazně změnila podnikání na daném trhu", isCorrect: true },
    { text: "konkurenční aktivita na daném trhu roste", isCorrect: true },
    { text: "firma X chce investovat do reklamy více než konkurence", isCorrect: false },
    { text: "poptávka se na daném trhu mění", isCorrect: true }
  ];
  logFix(13, 8, "Odstraněna naparsovaná otázka 11");
}

// Otázka 11 - otázka 15 se naparsovala
const l13q11 = getQuestion(13, 11);
if (l13q11) {
  l13q11.answers = [
    { text: "Špatná image značky podniku", isCorrect: true },
    { text: "Ústup konkurence z trhu", isCorrect: false },
    { text: "Růst poptávky na konkurenčních produktech", isCorrect: false },
    { text: "Pokles poptávky v důsledku recese", isCorrect: false }
  ];
  logFix(13, 11, "Odstraněna naparsovaná otázka 15");
}

// ============================================================
// LEKCE 8 - Nové opravy
// ============================================================

// Otázka 13 - má naparsovanou otázku 14 v odpovědi
const l8q13 = getQuestion(8, 13);
if (l8q13) {
  // Opravit odpověď která obsahuje text "14. Brand positioning je:"
  l8q13.answers = [
    { text: "Označení pro proces, kdy se povědomí o značce šíří masivně mezi lidmi", isCorrect: false },
    { text: "Grafická úprava známé úspěšné značky do dalších obdobných modifikací", isCorrect: false },
    { text: "Situace, kdy si lidé přestávají značku spojovat s danou produktovou kategorií (resp. s daným zákaznickým segmentem)", isCorrect: true },
    { text: "Označení pro proces postupného posilování značky v dané cílové skupině", isCorrect: false }
  ];
  logFix(8, 13, "Opravena naparsovaná otázka 14 v odpovědi, ponechána jen otázka 13");
}

// Otázka 14 - měla být samostatná otázka ale byla naparsována do otázky 13
const l8q14 = getQuestion(8, 14);
if (l8q14) {
  l8q14.text = "Brand positioning je:";
  l8q14.answers = [
    { text: "Umístění značky produktu do počítačové hry", isCorrect: false },
    { text: "Umístění značky v regálech maloobchodu", isCorrect: false },
    { text: "Strategické marketingové rozhodnutí", isCorrect: true },
    { text: "To samé, co targeting", isCorrect: false }
  ];
  logFix(8, 14, "Oddělena a opravena naparsovaná otázka 14 (Brand positioning)");
}

// Otázka 48 - co-branding otázka s chybnou správnou odpovědí
const l8q48 = getQuestion(8, 48);
if (l8q48) {
  l8q48.answers = [
    { text: "použití licencovaných značek bez poplatku", isCorrect: false },
    { text: "použití značky distributora na daném produktu", isCorrect: false },
    { text: "použití dvou a více značek různých firem na jednom produktu", isCorrect: true },
    { text: "použití značky výrobce na daném produktu", isCorrect: false }
  ];
  logFix(8, 48, "Opravena chybná správná odpověď v co-branding otázce");
}

// ============================================================
// Regenerovat vysvětlení
// ============================================================
function generateExplanation(question) {
  const correctAnswers = question.answers.filter(a => a.isCorrect);
  if (correctAnswers.length === 0) {
    return "U této otázky není označena žádná správná odpověď.";
  } else if (correctAnswers.length === 1) {
    return `Správná odpověď je „${correctAnswers[0].text}".`;
  } else {
    return `Správné odpovědi jsou: ${correctAnswers.map(a => `„${a.text}"`).join(", ")}.`;
  }
}

// Přegenerovat vysvětlení pro všechny opravené otázky
for (const lesson of lessons) {
  for (const q of lesson.questions) {
    q.explanation = generateExplanation(q);
  }
}

// ============================================================
// Uložit
// ============================================================
writeFileSync(dataPath, JSON.stringify(lessons, null, 2), 'utf-8');
console.log(`\n=== Hotovo! ${fixCount} oprav aplikováno. Data uložena. ===`);
