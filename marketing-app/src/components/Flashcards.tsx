import { useState, useEffect, useCallback } from 'react'
import type { Lesson } from '../types'
import { useFavorites } from '../hooks/useFavorites'
import { useFlashcardProgress } from '../hooks/useFlashcardProgress'
import type { FlashcardQuestion } from '../hooks/useFlashcardFilters'
import FlashcardView from './FlashcardView'
import './Flashcards.css'

interface Props {
  lesson: Lesson
  onBack: () => void
}

export default function Flashcards({ lesson, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const { isFavorite, toggleFavorite, getFavoriteCount } = useFavorites()
  const { markAsViewed } = useFlashcardProgress()

  const questions: FlashcardQuestion[] = lesson.questions.map(q => ({
    ...q,
    lessonId: lesson.id,
    lessonTitle: lesson.title
  }))

  const currentQuestion = questions[currentIndex]

  const handleFlip = () => {
    setIsFlipped(prev => !prev)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      markAsViewed(lesson.id, currentQuestion.id)
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleToggleFavorite = () => {
    toggleFavorite(lesson.id, currentQuestion.id)
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
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
    [currentIndex, currentQuestion]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Mark initial card as viewed
  useEffect(() => {
    markAsViewed(lesson.id, currentQuestion.id)
  }, [currentIndex, lesson.id, currentQuestion.id, markAsViewed])

  // Reset scroll position when card changes or flips
  useEffect(() => {
    const backSide = document.querySelector('.flashcard-back') as HTMLElement
    if (backSide) {
      backSide.scrollTop = 0
    }
  }, [currentIndex, isFlipped])

  return (
    <div className="flashcards">
      <div className="flashcards-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zpět na lekci
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
        isFavorite={isFavorite(lesson.id, currentQuestion.id)}
        onFlip={handleFlip}
        onToggleFavorite={handleToggleFavorite}
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
          disabled={currentIndex === questions.length - 1}
        >
          Další →
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
