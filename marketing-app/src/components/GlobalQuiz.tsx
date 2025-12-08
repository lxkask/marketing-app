import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import type { Lesson, Question } from '../types'
import './GlobalQuiz.css'

interface Props {
  lessons: Lesson[]
  onBack: () => void
}

type QuizMode = 'setup' | 'quiz' | 'results'

interface QuizQuestion extends Question {
  lessonId: number
  lessonTitle: string
}

export default function GlobalQuiz({ lessons, onBack }: Props) {
  const [mode, setMode] = useState<QuizMode>('setup')
  const [questionCount, setQuestionCount] = useState(20)
  const [shuffleEnabled, setShuffleEnabled] = useState(true)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Set<number>>(new Set())
  const [noneSelected, setNoneSelected] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const explanationRef = useRef<HTMLDivElement>(null)

  const allQuestions = useMemo(() => {
    const qs: QuizQuestion[] = []
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

  const totalAvailable = allQuestions.length

  const startQuiz = () => {
    let selectedQuestions = [...allQuestions]

    // Shuffle if enabled
    if (shuffleEnabled) {
      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5)
    }

    const selected = selectedQuestions.slice(0, Math.min(questionCount, totalAvailable))
    setQuestions(selected)
    setCurrentIndex(0)
    setSelectedAnswers(new Set())
    setNoneSelected(false)
    setIsSubmitted(false)
    setShowExplanation(false)
    setScore({ correct: 0, total: 0 })
    setMode('quiz')
  }

  const handleAnswerToggle = (answerIndex: number) => {
    if (isSubmitted) return

    // If selecting an answer, uncheck "none selected"
    setNoneSelected(false)

    const newSelected = new Set(selectedAnswers)
    if (newSelected.has(answerIndex)) {
      newSelected.delete(answerIndex)
    } else {
      newSelected.add(answerIndex)
    }
    setSelectedAnswers(newSelected)
  }

  const handleNoneToggle = () => {
    if (isSubmitted) return

    // If selecting "none", clear all other selections
    if (!noneSelected) {
      setSelectedAnswers(new Set())
    }
    setNoneSelected(!noneSelected)
  }

  const canSubmit = selectedAnswers.size > 0 || noneSelected

  const handleSubmit = () => {
    if (!canSubmit) return

    setIsSubmitted(true)

    const currentQuestion = questions[currentIndex]
    const correctIndices = new Set(
      currentQuestion.answers
        .map((a, i) => (a.isCorrect ? i : -1))
        .filter((i) => i !== -1)
    )

    let isCorrect: boolean
    if (noneSelected) {
      // User said "none is correct" - this is correct only if there are no correct answers
      isCorrect = correctIndices.size === 0
    } else {
      // Normal check - selected answers must match correct answers exactly
      isCorrect =
        selectedAnswers.size === correctIndices.size &&
        [...selectedAnswers].every((i) => correctIndices.has(i))
    }

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswers(new Set())
      setNoneSelected(false)
      setIsSubmitted(false)
      setShowExplanation(false)
    } else {
      setMode('results')
    }
  }

  const handleRestart = () => {
    setMode('setup')
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (mode !== 'quiz') return

    const key = e.key
    const currentQuestion = questions[currentIndex]

    if (key >= '1' && key <= '9') {
      const index = parseInt(key) - 1
      if (currentQuestion && index < currentQuestion.answers.length) {
        handleAnswerToggle(index)
      }
    }

    if (key === '0') {
      handleNoneToggle()
    }

    if (key === 'Enter') {
      if (!isSubmitted && (selectedAnswers.size > 0 || noneSelected)) {
        handleSubmit()
      } else if (isSubmitted) {
        handleNext()
      }
    }

    if (key === 'e' || key === 'E') {
      if (isSubmitted) {
        setShowExplanation(prev => {
          // If we're about to show the explanation, scroll to it
          if (!prev) {
            setTimeout(() => {
              explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 0)
          }
          return !prev
        })
      }
    }
  }, [mode, questions, currentIndex, isSubmitted, selectedAnswers, noneSelected])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (mode === 'setup') {
    return (
      <div className="global-quiz">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zpět na lekce
        </button>

        <div className="setup-card">
          <div className="setup-icon">📋</div>
          <h2>Celkový test</h2>
          <p className="setup-description">
            Test obsahuje otázky ze všech {lessons.length} lekcí.
            Celkem je k dispozici <strong>{totalAvailable}</strong> otázek.
          </p>

          <div className="count-selector">
            <label>Počet otázek:</label>
            <div className="count-options">
              {[10, 20, 50, totalAvailable].map((count) => (
                <button
                  key={count}
                  className={`count-option ${questionCount === count ? 'active' : ''}`}
                  onClick={() => setQuestionCount(count)}
                >
                  {count === totalAvailable ? 'Všechny' : count}
                </button>
              ))}
            </div>
          </div>

          <label className="shuffle-option">
            <input
              type="checkbox"
              checked={shuffleEnabled}
              onChange={(e) => setShuffleEnabled(e.target.checked)}
            />
            <span className="shuffle-icon">🔀</span>
            <span className="shuffle-text">Zamíchat pořadí otázek</span>
          </label>

          <button className="start-button" onClick={startQuiz}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Spustit test ({Math.min(questionCount, totalAvailable)} otázek)
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'results') {
    const percentage = Math.round((score.correct / score.total) * 100)
    return (
      <div className="global-quiz">
        <div className="quiz-results">
          <div className="results-icon">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2>Celkový test dokončen!</h2>
          <div className="results-score">
            <span className="score-number">{score.correct}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{score.total}</span>
          </div>
          <div className="score-percentage-bar">
            <div className="score-percentage-fill" style={{ width: `${percentage}%` }} />
          </div>
          <p className="score-percentage">{percentage}% správně</p>
          <div className="results-message">
            {percentage >= 80 && <p>Výborně! Jsi připraven/a na zkoušku!</p>}
            {percentage >= 60 && percentage < 80 && <p>Dobrá práce! Ještě trochu procvič slabší oblasti.</p>}
            {percentage < 60 && <p>Doporučujeme projít lekce znovu a zopakovat test.</p>}
          </div>
          <div className="results-actions">
            <button className="restart-button" onClick={handleRestart}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Nový test
            </button>
            <button className="back-button-large" onClick={onBack}>
              Zpět na lekce
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  // Check if this question has any correct answers
  const hasCorrectAnswers = currentQuestion.answers.some(a => a.isCorrect)

  return (
    <div className="global-quiz">
      <div className="quiz-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ukončit test
        </button>
        <div className="quiz-header-info">
          <div className="progress">
            <span className="progress-text">
              Otázka {currentIndex + 1} z {questions.length}
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="current-score">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {score.correct}/{score.total}
          </div>
        </div>
      </div>

      <div className="question-card">
        <div className="question-source">
          Lekce {currentQuestion.lessonId}: {currentQuestion.lessonTitle}
        </div>

        <h3 className="question-text">{currentQuestion.text}</h3>

        <div className="answers">
          {currentQuestion.answers.map((answer, index) => {
            let answerClass = 'answer'
            if (isSubmitted) {
              // Check if user got at least one correct answer
              const userGotSomeCorrect = currentQuestion.answers.some(
                (a, i) => a.isCorrect && selectedAnswers.has(i)
              )

              if (answer.isCorrect && selectedAnswers.has(index)) {
                answerClass += ' correct'
              } else if (answer.isCorrect && !selectedAnswers.has(index)) {
                // If user got some correct, show missed as orange; otherwise show as green
                answerClass += userGotSomeCorrect ? ' missed' : ' correct'
              } else if (selectedAnswers.has(index)) {
                answerClass += ' incorrect'
              }
            } else if (selectedAnswers.has(index)) {
              answerClass += ' selected'
            }

            return (
              <button
                key={index}
                className={answerClass}
                onClick={() => handleAnswerToggle(index)}
                disabled={isSubmitted}
              >
                <span className="answer-checkbox">
                  {selectedAnswers.has(index) && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="answer-text">{answer.text}</span>
                {isSubmitted && answer.isCorrect && (
                  <span className="correct-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* "None correct" option */}
        <button
          className={`answer none-option ${noneSelected ? 'selected' : ''} ${isSubmitted && !hasCorrectAnswers ? 'correct' : ''} ${isSubmitted && noneSelected && hasCorrectAnswers ? 'incorrect' : ''}`}
          onClick={handleNoneToggle}
          disabled={isSubmitted}
        >
          <span className="answer-checkbox">
            {noneSelected && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
          <span className="answer-text">Žádná odpověď není správná</span>
          {isSubmitted && !hasCorrectAnswers && (
            <span className="correct-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </button>

        <p className="multi-select-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Může být více správných odpovědí, nebo žádná
        </p>

        <p className="keyboard-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="6" y1="8" x2="6" y2="8" />
            <line x1="10" y1="8" x2="10" y2="8" />
            <line x1="14" y1="8" x2="14" y2="8" />
            <line x1="18" y1="8" x2="18" y2="8" />
            <line x1="6" y1="16" x2="18" y2="16" />
          </svg>
          <span className="keyboard-keys">
            <kbd>1</kbd>-<kbd>9</kbd> odpovědi
            <kbd>0</kbd> žádná
            <kbd>Enter</kbd> potvrdit
            <kbd>E</kbd> vysvětlení
          </span>
        </p>

        {isSubmitted && (
          <div className="explanation-section" ref={explanationRef}>
            <button
              className="toggle-explanation"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  Skrýt vysvětlení
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Zobrazit vysvětlení
                </>
              )}
            </button>
            {showExplanation && (
              <div className="explanation">
                <div className="explanation-header">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h-4V9.5c-1.2-.7-2-2-2-3.5a4 4 0 0 1 4-4z" />
                    <path d="M10 11v2a2 2 0 1 0 4 0v-2" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                  </svg>
                  AI Vysvětlení
                </div>
                <p>{currentQuestion.aiExplanation || currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        <div className="question-actions">
          {!isSubmitted ? (
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Zkontrolovat
            </button>
          ) : (
            <button className="next-button" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'Další otázka' : 'Zobrazit výsledky'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
