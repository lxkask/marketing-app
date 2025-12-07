# 📚 Základy marketingu - Interaktivní tahák

Interaktivní studijní aplikace pro kurz "Základy marketingu pro informatiky a statistiky". Obsahuje 13 lekcí, 414 testových otázek s AI vysvětleními a moderní flashcards systém.

**🌐 Live aplikace:** [marketing-app-blush.vercel.app](https://marketing-app-blush.vercel.app)

## ✨ Hlavní funkce

### 📖 Studijní materiály
- **13 strukturovaných lekcí** s poznámkami a přehledy
- **414 testových otázek** s podporou více správných odpovědí
- **AI-generovaná vysvětlení** pro každou otázku (100% pokrytí)
- **100+ marketingových konceptů** v databázi vysvětlení (4P, B2B, SWOT, Porter, Hofstede, atd.)

### 🧠 Testování a procvičování
- **Interaktivní kvízy** s okamžitou zpětnou vazbou
- **Klávesové zkratky** (1-9 pro odpovědi, 0 pro "žádná správná", E pro vysvětlení, Enter pro odeslání)
- **Režim opakování** - procvičuj jen otázky, které jsi minul
- **Globální test** - quiz napříč všemi lekcemi s konfigurovatelným počtem otázek
- **Progress tracking** - sledování dokončených lekcí a skóre

### 🎴 Flashcards systém
- **Single-lesson flashcards** - procvič karty z konkrétní lekce
- **Globální flashcards** - karty ze všech lekcí s pokročilými filtry
- **3D flip animace** - smooth otočení karty mezerníkem
- **Oblíbené karty** - označuj důležité otázky hvězdičkou (⭐)
- **Pokročilé filtry:**
  - 📍 Podle lekcí - vyber konkrétní lekce
  - ⭐ Jen oblíbené - procvič označené karty
  - 🔀 Náhodné pořadí - zamíchej karty
  - 👁️ Jen neviděné - zobraz jen karty z aktuální session
- **Klávesové zkratky:**
  - `Space` - otočit kartu
  - `←` / `→` - navigace mezi kartami
  - `F` - toggle oblíbené

### 🎨 UI/UX
- **Dark mode** - přepínatelný tmavý režim
- **Responsive design** - optimalizováno pro desktop, tablet i mobil
- **Hash-based routing** - funguje tlačítko zpět v prohlížeči
- **localStorage persistence** - progress, oblíbené a nastavení se ukládají
- **Hladké animace** - profesionální přechody a efekty

## 🏗️ Architektura projektu

```
insis-tahak/
├── insis-tahak/           # Zdrojové HTML soubory z INSIS
│   └── index.htm          # Exportované poznámky z univerzitního systému
│
└── marketing-app/         # React aplikace
    ├── scripts/           # Data pipeline
    │   ├── parseHtml.js           # Parser HTML → JSON
    │   ├── fixQuestions.js        # Oprava dat a validace
    │   └── generateExplanations.js # Generování AI vysvětlení
    │
    ├── src/
    │   ├── components/    # React komponenty
    │   │   ├── LessonList.tsx      # Grid lekcí
    │   │   ├── LessonView.tsx      # Detail lekce
    │   │   ├── Quiz.tsx            # Single-lesson quiz
    │   │   ├── GlobalQuiz.tsx      # Multi-lesson quiz
    │   │   ├── Flashcards.tsx      # Single-lesson flashcards
    │   │   ├── GlobalFlashcards.tsx # Multi-lesson flashcards
    │   │   └── FlashcardView.tsx   # Shared flashcard UI
    │   │
    │   ├── hooks/         # Custom React hooks
    │   │   ├── useTheme.ts              # Dark mode
    │   │   ├── useProgress.ts           # Quiz progress tracking
    │   │   ├── useFavorites.ts          # Favorite flashcards
    │   │   ├── useFlashcardProgress.ts  # Session-based viewed tracking
    │   │   └── useFlashcardFilters.ts   # Advanced filtering
    │   │
    │   ├── data/
    │   │   └── lessons.json # Zpracovaná data (414 otázek)
    │   │
    │   └── types.ts       # TypeScript definice
    │
    └── public/            # Statické soubory
```

## 📊 Data Pipeline

Aplikace používá tři-fázový pipeline pro zpracování dat:

```bash
# 1. Parsování HTML zdrojů (Windows-1250 encoding)
node scripts/parseHtml.js
# Output: 422 raw otázek z 13 lekcí

# 2. Validace a opravy dat
node scripts/fixQuestions.js
# Output: 414 čistých otázek (odstraněno 8 fake otázek, 45 oprav)

# 3. Generování AI vysvětlení
node scripts/generateExplanations.js
# Output: 414/414 otázek s vysvětleními (100% pokrytí)
```

### Klíčové funkce pipeline:
- **HTML parsing** s podporou Windows-1250 (české znaky)
- **Detekce správných odpovědí** podle zelené barvy (`#00B050`)
- **Extrakce poznámek** s hierarchií podle `margin-left` CSS
- **Pattern-based AI explanace** s databází 100+ marketingových konceptů
- **Validace integrity** - odstranění duplikátů, merged answers, fake questions

## 🚀 Vývoj

### Prerekvizity
- Node.js 20.19+ nebo 22.12+
- npm

### Lokální spuštění

```bash
cd marketing-app

# Instalace závislostí
npm install

# Development server (Vite)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Deployment na Vercel

```bash
# První deployment
vercel

# Production deployment
vercel --prod

# Aliasing na custom doménu
vercel alias [deployment-url] marketing-app-blush.vercel.app
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Vanilla CSS s custom properties (CSS variables)
- **Routing:** Hash-based routing (klientské)
- **State:** React hooks (useState, useEffect, useMemo)
- **Persistence:** localStorage + sessionStorage
- **Deployment:** Vercel
- **Data Processing:** Node.js + iconv-lite (encoding)

## 📝 Datové struktury

### Lesson
```typescript
type Lesson = {
  id: number
  title: string
  notes: Note[]
  questions: Question[]
}
```

### Question
```typescript
type Question = {
  id: number
  text: string
  answers: Answer[]
  explanation: string        // Základní list správných odpovědí
  aiExplanation?: string     // AI-generované vysvětlení (s koncepty)
}
```

### FlashcardQuestion
```typescript
type FlashcardQuestion = Question & {
  lessonId: number
  lessonTitle: string
}
```

## 🎯 Funkce dle použití

### Student připravující se na zkoušku
1. Projdi všechny lekce a přečti poznámky
2. Otestuj se u každé lekce kvízem
3. Procvič flashcards - označuj si důležité otázky
4. Na konci udělej celkový test ze všech lekcí
5. Opakuj flashcards jen z oblíbených

### Rychlé opakování před zkouškou
1. Globální flashcards → Jen oblíbené → Náhodné pořadí
2. Globální test (30-50 otázek) pro validaci znalostí
3. Retry mode u testů - opakuj jen chyby

### Procvičování specifických témat
1. Vyber konkrétní lekce ve flashcards filtru
2. Použij AI vysvětlení (E key) k hlubšímu pochopení
3. Označuj si složité otázky hvězdičkou

## 📈 Statistiky projektu

- **13 lekcí** pokrývajících marketing fundamentals
- **414 testových otázek** s multiple-choice odpověďmi
- **100% AI coverage** - každá otázka má vysvětlení
- **100+ konceptů** v AI explanation databázi
- **9 komponent** + 5 custom hooks
- **Full TypeScript** coverage
- **Zero dependencies** pro UI (vanilla CSS)

## 🔮 Budoucí vylepšení

- [ ] Export pokroku do PDF/CSV
- [ ] Spaced repetition algoritmus pro flashcards
- [ ] Statistiky učení (časové grafy, heatmapy)
- [ ] Multiplayer quiz režim
- [ ] Offline mode (PWA)
- [ ] Audio pronunciation pro pojmy

## 📄 Licence

Tento projekt je vytvořen pro studijní účely.

## 🙏 Poděkování

Vytvořeno s pomocí **Claude Code** (Anthropic) - AI asistent pro coding.

---

**⭐ Pro nejlepší zážitek:** Použij aplikaci na desktopu v full-screen režimu s dark mode zapnutým.
