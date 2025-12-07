import { useState, useEffect, useCallback } from 'react'
import lessons from './data/lessons.json'
import type { Lesson } from './types'
import { useTheme } from './hooks/useTheme'
import { useProgress } from './hooks/useProgress'
import LessonList from './components/LessonList'
import LessonView from './components/LessonView'
import Quiz from './components/Quiz'
import GlobalQuiz from './components/GlobalQuiz'
import Flashcards from './components/Flashcards'
import GlobalFlashcards from './components/GlobalFlashcards'
import './App.css'

type View = 'list' | 'lesson' | 'quiz' | 'global-quiz' | 'flashcards' | 'global-flashcards'

// Parse URL hash to get current view state
function parseHash(): { view: View; lessonId: number | null } {
  const hash = window.location.hash.slice(1) // Remove #
  if (!hash) return { view: 'list', lessonId: null }

  if (hash === 'global-quiz') {
    return { view: 'global-quiz', lessonId: null }
  }

  if (hash === 'flashcards-global') {
    return { view: 'global-flashcards', lessonId: null }
  }

  const lessonMatch = hash.match(/^lesson\/(\d+)$/)
  if (lessonMatch) {
    return { view: 'lesson', lessonId: parseInt(lessonMatch[1], 10) }
  }

  const quizMatch = hash.match(/^quiz\/(\d+)$/)
  if (quizMatch) {
    return { view: 'quiz', lessonId: parseInt(quizMatch[1], 10) }
  }

  const flashcardsMatch = hash.match(/^flashcards\/(\d+)$/)
  if (flashcardsMatch) {
    return { view: 'flashcards', lessonId: parseInt(flashcardsMatch[1], 10) }
  }

  return { view: 'list', lessonId: null }
}

function App() {
  const [view, setView] = useState<View>('list')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const { theme, toggleTheme } = useTheme()
  const progress = useProgress(lessons.length)

  // Navigate and update URL hash
  const navigate = useCallback((newView: View, lesson: Lesson | null = null) => {
    setView(newView)
    setSelectedLesson(lesson)

    let hash = ''
    if (newView === 'lesson' && lesson) {
      hash = `#lesson/${lesson.id}`
    } else if (newView === 'quiz' && lesson) {
      hash = `#quiz/${lesson.id}`
    } else if (newView === 'global-quiz') {
      hash = '#global-quiz'
    } else if (newView === 'flashcards' && lesson) {
      hash = `#flashcards/${lesson.id}`
    } else if (newView === 'global-flashcards') {
      hash = '#flashcards-global'
    }

    window.history.pushState(null, '', hash || window.location.pathname)
    window.scrollTo(0, 0)
  }, [])

  // Handle browser back/forward
  const handleHashChange = useCallback(() => {
    const { view: newView, lessonId } = parseHash()

    if (lessonId) {
      const lesson = (lessons as Lesson[]).find(l => l.id === lessonId)
      if (lesson) {
        setSelectedLesson(lesson)
        setView(newView)
        window.scrollTo(0, 0)
        return
      }
    }

    setView(newView)
    if (newView === 'list') {
      setSelectedLesson(null)
    }
    window.scrollTo(0, 0)
  }, [])

  // Initialize from URL and listen for changes
  useEffect(() => {
    handleHashChange() // Parse initial URL
    window.addEventListener('popstate', handleHashChange)
    return () => window.removeEventListener('popstate', handleHashChange)
  }, [handleHashChange])

  const handleSelectLesson = (lesson: Lesson) => {
    navigate('lesson', lesson)
  }

  const handleStartQuiz = () => {
    if (selectedLesson) {
      navigate('quiz', selectedLesson)
    }
  }

  const handleStartGlobalQuiz = () => {
    navigate('global-quiz')
  }

  const handleStartFlashcards = () => {
    if (selectedLesson) {
      navigate('flashcards', selectedLesson)
    }
  }

  const handleStartGlobalFlashcards = () => {
    navigate('global-flashcards')
  }

  const handleBack = () => {
    if (view === 'quiz' && selectedLesson) {
      navigate('lesson', selectedLesson)
    } else if (view === 'flashcards' && selectedLesson) {
      navigate('lesson', selectedLesson)
    } else if (view === 'global-quiz' || view === 'global-flashcards') {
      navigate('list')
    } else {
      navigate('list')
    }
  }

  const handleQuizComplete = (correct: number, total: number) => {
    if (selectedLesson) {
      progress.markLessonComplete(selectedLesson.id, { correct, total })
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>Základy marketingu pro informatiky a statistiky</h1>
            <p className="subtitle">Interaktivní studijní průvodce</p>
          </div>

          <div className="header-right">
            <div className="header-progress">
              <span className="header-progress-text">
                {progress.completedCount}/{progress.totalLessons} lekcí
              </span>
              <div className="header-progress-bar">
                <div
                  className="header-progress-fill"
                  style={{ width: `${progress.getCompletionPercentage()}%` }}
                />
              </div>
            </div>

            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Přepnout na tmavý režim' : 'Přepnout na světlý režim'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {view === 'list' && (
          <>
            <div className="stats-overview">
              <div className="stat-card">
                <div className="stat-icon lessons-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{lessons.length}</span>
                  <span className="stat-label">lekcí</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon questions-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{(lessons as Lesson[]).reduce((sum, l) => sum + l.questions.length, 0)}</span>
                  <span className="stat-label">otázek</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon progress-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{progress.getCompletionPercentage()}%</span>
                  <span className="stat-label">dokončeno</span>
                </div>
              </div>
            </div>

            <div className="global-test-section">
              <div className="global-actions">
                <button className="global-test-button" onClick={handleStartGlobalQuiz}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Celkový test ze všech lekcí
                </button>
                <button className="global-flashcards-button" onClick={handleStartGlobalFlashcards}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" />
                  </svg>
                  Globální flashcards
                </button>
              </div>
            </div>
            <LessonList
              lessons={lessons as Lesson[]}
              onSelectLesson={handleSelectLesson}
              isLessonComplete={progress.isLessonComplete}
              getLessonScore={progress.getLessonScore}
            />
          </>
        )}

        {view === 'lesson' && selectedLesson && (
          <LessonView
            lesson={selectedLesson}
            onBack={handleBack}
            onStartQuiz={handleStartQuiz}
            onStartFlashcards={handleStartFlashcards}
            isComplete={progress.isLessonComplete(selectedLesson.id)}
            score={progress.getLessonScore(selectedLesson.id)}
          />
        )}

        {view === 'quiz' && selectedLesson && (
          <Quiz
            lesson={selectedLesson}
            onBack={handleBack}
            onComplete={handleQuizComplete}
          />
        )}

        {view === 'flashcards' && selectedLesson && (
          <Flashcards
            lesson={selectedLesson}
            onBack={handleBack}
          />
        )}

        {view === 'global-quiz' && (
          <GlobalQuiz
            lessons={lessons as Lesson[]}
            onBack={handleBack}
          />
        )}

        {view === 'global-flashcards' && (
          <GlobalFlashcards
            lessons={lessons as Lesson[]}
            onBack={handleBack}
          />
        )}
      </main>

      <footer className="footer">
        <p>Tahák pro přípravu na závěrečný test</p>
      </footer>
    </div>
  )
}

export default App
