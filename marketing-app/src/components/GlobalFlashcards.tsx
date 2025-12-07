import { useState, useMemo, useEffect, useCallback } from 'react'
import type { Lesson } from '../types'
import { useFavorites } from '../hooks/useFavorites'
import { useFlashcardProgress } from '../hooks/useFlashcardProgress'
import { useFlashcardFilters, type FlashcardQuestion } from '../hooks/useFlashcardFilters'
import FlashcardView from './FlashcardView'
import './Flashcards.css'

interface Props {
  lessons: Lesson[]
  onBack: () => void
}

type Mode = 'setup' | 'flashcards' | 'completion'

export default function GlobalFlashcards({ lessons, onBack }: Props) {
  const [mode, setMode] = useState<Mode>('setup')
  const [questions, setQuestions] = useState<FlashcardQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const { favorites, isFavorite, toggleFavorite, getFavoriteCount } = useFavorites()
  const { markAsViewed, getViewedCount } = useFlashcardProgress()
  const { filters, applyFilters, toggleLesson, setOnlyFavorites, setShuffle, setOnlyUnseen, resetFilters } = useFlashcardFilters()

  // Build all questions from all lessons
  const allQuestions = useMemo(() => {
    const qs: FlashcardQuestion[] = []
    for (const lesson of lessons) {
      for (const q of lesson.questions) {
        qs.push({
          ...q,
          lessonId: lesson.id,
          lessonTitle: lesson.title
        })
      }
    }
    return qs
  }, [lessons])

  // Calculate filtered questions for display
  const filteredQuestions = useMemo(() => {
    return applyFilters(allQuestions, favorites, new Set())
  }, [applyFilters, allQuestions, favorites])

  const currentQuestion = questions[currentIndex]
  const allSelected = filters.selectedLessons.size === 0 || filters.selectedLessons.size === lessons.length

  const handleStartFlashcards = () => {
    setQuestions(filteredQuestions)
    setCurrentIndex(0)
    setIsFlipped(false)
    setMode('flashcards')
  }

  const handleFlip = () => {
    setIsFlipped(prev => !prev)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      markAsViewed(currentQuestion.lessonId, currentQuestion.id)
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      // Last card reached
      setMode('completion')
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleToggleFavorite = () => {
    toggleFavorite(currentQuestion.lessonId, currentQuestion.id)
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (mode !== 'flashcards') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key

      // Space - Flip card
      if (e.code === 'Space') {
        e.preventDefault()
        handleFlip()
      }

      // Left arrow - Previous card
      if (key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      }

      // Right arrow - Next card
      if (key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }

      // F - Toggle favorite
      if (key === 'f' || key === 'F') {
        e.preventDefault()
        handleToggleFavorite()
      }
    },
    [mode, currentIndex, currentQuestion]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Mark card as viewed when moving to next
  useEffect(() => {
    if (mode === 'flashcards' && currentQuestion) {
      markAsViewed(currentQuestion.lessonId, currentQuestion.id)
    }
  }, [currentIndex, mode, currentQuestion, markAsViewed])

  // Setup screen
  if (mode === 'setup') {
    return (
      <div className="flashcards">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zpět na lekce
        </button>

        <div className="setup-card">
          <div className="setup-icon">🎴</div>
          <h2>Globální flashcards</h2>
          <p className="setup-description">
            Procvičuj flashcards ze všech {lessons.length} lekcí. Celkem je k dispozici{' '}
            <strong>{allQuestions.length}</strong> otázek.
          </p>

          {/* Lesson selector */}
          <div className="lesson-selector">
            <h3>Vyberte lekce:</h3>
            <div className="lesson-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      resetFilters()
                    } else {
                      // Select all except none
                      resetFilters()
                      lessons.forEach(l => toggleLesson(l.id))
                    }
                  }}
                />
                <strong>Všechny lekce ({allQuestions.length} otázek)</strong>
              </label>

              {lessons.map(lesson => (
                <label key={lesson.id}>
                  <input
                    type="checkbox"
                    checked={filters.selectedLessons.size === 0 || filters.selectedLessons.has(lesson.id)}
                    onChange={() => toggleLesson(lesson.id)}
                  />
                  Lekce {lesson.id}: {lesson.title} ({lesson.questions.length})
                </label>
              ))}
            </div>
          </div>

          {/* Filter options */}
          <div className="filter-options">
            <h3>Možnosti:</h3>

            <label>
              <input
                type="checkbox"
                checked={filters.onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
              />
              ⭐ Jen oblíbené ({getFavoriteCount()})
            </label>

            <label>
              <input
                type="checkbox"
                checked={filters.shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
              />
              🔀 Náhodné pořadí
            </label>

            <label>
              <input
                type="checkbox"
                checked={filters.onlyUnseen}
                onChange={(e) => setOnlyUnseen(e.target.checked)}
              />
              👁️ Jen neviděné
            </label>
          </div>

          {/* Card count */}
          <div className="card-count">
            <strong>{filteredQuestions.length}</strong> karet k procvičení
          </div>

          {/* Start button */}
          <button
            className="start-flashcards-button"
            onClick={handleStartFlashcards}
            disabled={filteredQuestions.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Spustit flashcards ({filteredQuestions.length})
          </button>
        </div>
      </div>
    )
  }

  // Completion screen
  if (mode === 'completion') {
    return (
      <div className="flashcards">
        <div className="flashcards-completion">
          <div className="completion-icon">✨</div>
          <h2>Hotovo!</h2>

          <div className="completion-stats">
            <div className="stat">
              <span className="stat-value">{questions.length}</span>
              <span className="stat-label">karet prošlo</span>
            </div>
            <div className="stat">
              <span className="stat-value">{getFavoriteCount()}</span>
              <span className="stat-label">oblíbených</span>
            </div>
            <div className="stat">
              <span className="stat-value">{getViewedCount()}</span>
              <span className="stat-label">nově viděno</span>
            </div>
          </div>

          <div className="completion-actions">
            <button className="new-flashcards-button" onClick={() => setMode('setup')}>
              Nové flashcards
            </button>
            <button className="back-button-large" onClick={onBack}>
              Zpět na lekce
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Flashcards mode
  return (
    <div className="flashcards">
      <div className="flashcards-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ukončit
        </button>

        <div className="flashcards-header-info">
          <div className="progress">
            <span>Karta {currentIndex + 1} z {questions.length}</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="favorite-count">
            ⭐ {getFavoriteCount()}
          </div>
        </div>
      </div>

      <FlashcardView
        question={currentQuestion}
        isFlipped={isFlipped}
        isFavorite={isFavorite(currentQuestion.lessonId, currentQuestion.id)}
        onFlip={handleFlip}
        onToggleFavorite={handleToggleFavorite}
        showLessonSource={true}
      />

      <div className="flashcard-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Předchozí
        </button>

        <button
          className="nav-button"
          onClick={handleNext}
        >
          {currentIndex === questions.length - 1 ? 'Dokončit' : 'Další'} →
        </button>
      </div>

      <p className="keyboard-hint">
        <kbd>←</kbd> <kbd>→</kbd> navigace
        <kbd>Space</kbd> otočit
        <kbd>F</kbd> oblíbené
      </p>
    </div>
  )
}
