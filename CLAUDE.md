# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A marketing course study guide ("tahák") with two components:
1. **Static HTML source** (`insis-tahak/`) - Exported lecture notes from a Czech university's INSIS system
2. **React app** (`marketing-app/`) - Interactive study app with lessons and quizzes built from the HTML source

## Commands

```bash
# Development (from marketing-app/)
npm run dev      # Start Vite dev server
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build

# Data processing pipeline (run in order)
node scripts/parseHtml.js        # Parse HTML source to lessons.json
node scripts/fixQuestions.js     # Fix data inconsistencies and errors
node scripts/generateExplanations.js # Generate AI-enhanced explanations for all questions
```

## Architecture

### Data Flow
`insis-tahak/index.htm` → `scripts/parseHtml.js` → `src/data/lessons.json` → React app

### Pipeline Scripts

#### `scripts/parseHtml.js` - HTML Parser
- Reads `index.htm` with Windows-1250 encoding using `iconv-lite`
- Splits content by `<h1>` tags (lesson boundaries)
- Extracts notes from paragraphs with indentation levels based on `margin-left` CSS
- Finds `OTÁZKY` (Questions) sections and parses answers
- Detects correct answers by looking for green color (`#00B050`) in Verdana font spans
- Outputs: 422 raw questions across 13 lessons

#### `scripts/fixQuestions.js` - Data Validation & Repair
- Removes 8 fake questions in Lesson 6 (were actually notes incorrectly parsed as questions)
- Fixes incorrectly parsed questions that were merged into other questions' answers
- Corrects wrong answer markings and splits merged answers
- Removes duplicates and corrupted data
- Total fixes: 45 corrections applied
- Outputs: 414 clean questions ready for use

#### `scripts/generateExplanations.js` - AI Explanation Generator
- Dictionary of 100+ marketing concepts with definitions (4P, B2B, SWOT, Porter, Hofstede, etc.)
- Pattern-based concept detection in question text and answers
- Generates contextual explanations showing why answers are correct/incorrect
- Covers concepts: marketing mix, business models, consumer behavior, market analysis, distribution, pricing, communication strategies
- Coverage: 414/414 questions (100%) have AI-enhanced explanations

### React App Structure

#### Components
- `App.tsx` - Main app with hash-based routing (list/lesson/quiz/global-quiz/flashcards/global-flashcards), dark mode toggle, progress tracking
- `types.ts` - TypeScript types: `Lesson`, `Question`, `Answer`, `Note`
- `components/LessonList.tsx` - Grid of lesson cards with progress badges and reading time estimates
- `components/LessonView.tsx` - Displays lesson notes with quiz and flashcards entry buttons
- `components/Quiz.tsx` - Single-lesson quiz with:
  - Multi-select answers (1-9 keyboard shortcuts)
  - "None correct" option (0 key)
  - AI-enhanced explanations with concept definitions (E key)
  - Retry wrong answers functionality
  - Progress bar and current score display
  - Shuffle toggle (🔀) - randomize question order before starting quiz
- `components/GlobalQuiz.tsx` - Cumulative quiz across all lessons with:
  - Configurable question count (10, 20, 50, or all)
  - Shuffle option (default enabled) - randomize question order
- `components/Flashcards.tsx` - Single-lesson flashcards mode with:
  - 3D flip animation (Space key to flip)
  - Navigation between cards (← → arrow keys)
  - Favorite toggle (F key, ⭐ icon)
  - Progress bar showing current card position
  - Auto-scroll reset on card change
- `components/GlobalFlashcards.tsx` - Multi-lesson flashcards with:
  - Setup screen with lesson selection
  - Advanced filters (favorites, shuffle, unseen, by lesson)
  - Completion stats screen
  - Same flashcard features as single-lesson mode
- `components/FlashcardView.tsx` - Shared flashcard UI component:
  - Front side: Question text with flip hint
  - Back side: Correct answers + AI explanation
  - Favorite button and lesson source badge (for global mode)
  - Styled scrollbar for long content

#### Hooks
- `hooks/useTheme.ts` - Dark/light mode toggle with localStorage persistence
- `hooks/useProgress.ts` - Tracks completed lessons and quiz scores
- `hooks/useFavorites.ts` - Manages favorite flashcards (localStorage, ⭐ system)
- `hooks/useFlashcardProgress.ts` - Tracks viewed cards in current session (sessionStorage)
- `hooks/useFlashcardFilters.ts` - Advanced filtering logic for global flashcards:
  - Filter by selected lessons (Set<number>)
  - Filter by favorites only
  - Shuffle cards randomly
  - Filter unseen cards only

### Key Data Types
```typescript
type Lesson = { id, title, notes: Note[], questions: Question[] }
type Question = { id, text, answers: Answer[], explanation, aiExplanation? }
type Answer = { text, isCorrect }
type Note = { text, indent: 0-4 }
type FlashcardQuestion = Question & { lessonId: number, lessonTitle: string }
```

- `explanation` - Basic list of correct answers (fallback)
- `aiExplanation` - AI-generated explanation with concept definitions and context
- `FlashcardQuestion` - Extended Question type with lesson metadata for global flashcards

## Features

### Learning Aids
- **AI Explanations**: Every question has an AI-generated explanation showing why answers are correct/wrong
- **Quiz Keyboard Shortcuts**: Fast quiz answering
  - `1`-`9` Select/deselect answers
  - `0` Toggle "none correct" option
  - `Enter` Submit answer or go to next question
  - `E` Show/hide explanation
- **Flashcards Keyboard Shortcuts**: Efficient card navigation
  - `Space` Flip card front/back
  - `←` Previous card
  - `→` Next card
  - `F` Toggle favorite (⭐)
- **Question Shuffling**: Randomize question order in quizzes
  - Single-lesson quiz: Toggle 🔀 icon in quiz header (disabled after first answer)
  - Global quiz: Checkbox on setup screen (default enabled)
- **Progress Tracking**: Completion status and scores saved in localStorage
- **Dark Mode**: Eye-friendly dark theme toggle
- **Retry Mode**: Practice only the questions you got wrong

### Flashcards System
- **Single-Lesson Flashcards**: Practice questions from a specific lesson
- **Global Flashcards**: Cross-lesson practice with advanced filtering
- **3D Flip Animation**: Smooth card rotation with CSS transforms
- **Favorite System**: Star important cards (⭐), persists in localStorage
- **Advanced Filters**:
  - 📍 By Lesson - Select specific lessons to practice
  - ⭐ Favorites Only - Practice starred cards
  - 🔀 Shuffle - Randomize card order
  - 👁️ Unseen Only - Show cards not viewed in current session
- **Session Tracking**: Viewed cards tracked in sessionStorage (resets on page refresh)
- **Auto-scroll Reset**: Cards always open at the top, regardless of previous scroll position
- **Fixed Height Layout**: 550px container prevents page overflow and navigation hiding

### Content
- **13 Lessons** covering marketing fundamentals (definitions, strategies, mix, research, segmentation, branding, communication)
- **414 Questions** with multiple correct answers support
- **100+ Marketing Concepts** in AI explanation dictionary (4P, B2B, SWOT, Porter, Hofstede dimensions, etc.)
- **Global Test**: Take a quiz across all lessons with configurable question count
- **Global Flashcards**: Practice all 414 questions with filtering

## Implementation Notes

- The source HTML uses Windows-1250 encoding (Czech)
- Questions support multiple correct answers (checkbox-style quiz)
- Hash-based routing enables browser back/forward navigation:
  - `#lesson/:id` - Lesson detail view
  - `#quiz/:id` - Single-lesson quiz
  - `#flashcards/:id` - Single-lesson flashcards
  - `#global-quiz` - Multi-lesson quiz
  - `#flashcards-global` - Multi-lesson flashcards
- Persistence:
  - **localStorage**: Progress, favorites, theme preference (permanent)
  - **sessionStorage**: Viewed flashcards (temporary, resets on refresh)
- The static HTML version can be viewed by opening `insis-tahak/index.htm` directly
- Data pipeline must be run in order: parseHtml → fixQuestions → generateExplanations
- Flashcards use CSS 3D transforms (`transform-style: preserve-3d`, `rotateY(180deg)`)
- Scroll position resets on card change via `useEffect` + `querySelector('.flashcard-back').scrollTop = 0`
