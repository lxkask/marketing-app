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
        <p className="footer-credit">Created by</p>
        <div className="footer-links">
          <a
            href="https://github.com/lxkask"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <a
            href="https://www.instagram.com/l.xkas/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
