import { useState } from 'react'
import type { Lesson } from '../types'
import './Quiz.css'

interface Props {
  lesson: Lesson
  onBack: () => void
}

export default function Quiz({ lesson, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Set<number>>(new Set())
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isFinished, setIsFinished] = useState(false)

  const questions = lesson.questions
  const currentQuestion = questions[currentIndex]

  const handleAnswerToggle = (answerIndex: number) => {
    if (isSubmitted) return

    const newSelected = new Set(selectedAnswers)
    if (newSelected.has(answerIndex)) {
      newSelected.delete(answerIndex)
    } else {
      newSelected.add(answerIndex)
    }
    setSelectedAnswers(newSelected)
  }

  const handleSubmit = () => {
    if (selectedAnswers.size === 0) return

    setIsSubmitted(true)

    // Check if answer is correct
    const correctIndices = new Set(
      currentQuestion.answers
        .map((a, i) => (a.isCorrect ? i : -1))
        .filter((i) => i !== -1)
    )

    const isCorrect =
      selectedAnswers.size === correctIndices.size &&
      [...selectedAnswers].every((i) => correctIndices.has(i))

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswers(new Set())
      setIsSubmitted(false)
      setShowExplanation(false)
    } else {
      setIsFinished(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswers(new Set())
    setIsSubmitted(false)
    setShowExplanation(false)
    setScore({ correct: 0, total: 0 })
    setIsFinished(false)
  }

  if (questions.length === 0) {
    return (
      <div className="quiz">
        <button className="back-button" onClick={onBack}>
          ← Zpět na lekci
        </button>
        <div className="no-questions">
          <p>Tato lekce nemá žádné testové otázky.</p>
        </div>
      </div>
    )
  }

  if (isFinished) {
    const percentage = Math.round((score.correct / score.total) * 100)
    return (
      <div className="quiz">
        <div className="quiz-results">
          <h2>Test dokončen!</h2>
          <div className="results-score">
            <span className="score-number">{score.correct}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{score.total}</span>
          </div>
          <p className="score-percentage">{percentage}% správně</p>
          <div className="results-message">
            {percentage >= 80 && <p>Výborně! Látku máš skvěle zvládnutou.</p>}
            {percentage >= 60 && percentage < 80 && <p>Dobrá práce! Ještě trochu procvič.</p>}
            {percentage < 60 && <p>Zkus si lekci ještě jednou projít.</p>}
          </div>
          <div className="results-actions">
            <button className="restart-button" onClick={handleRestart}>
              Zkusit znovu
            </button>
            <button className="back-button-large" onClick={onBack}>
              Zpět na lekci
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz">
      <div className="quiz-header">
        <button className="back-button" onClick={onBack}>
          ← Zpět na lekci
        </button>
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
          Skóre: {score.correct}/{score.total}
        </div>
      </div>

      <div className="question-card">
        <h3 className="question-text">{currentQuestion.text}</h3>

        <div className="answers">
          {currentQuestion.answers.map((answer, index) => {
            let answerClass = 'answer'
            if (isSubmitted) {
              if (answer.isCorrect) {
                answerClass += ' correct'
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
                  {selectedAnswers.has(index) ? '✓' : ''}
                </span>
                <span className="answer-text">{answer.text}</span>
                {isSubmitted && answer.isCorrect && (
                  <span className="correct-indicator">✓</span>
                )}
              </button>
            )
          })}
        </div>

        <p className="multi-select-hint">
          Může být více správných odpovědí
        </p>

        {isSubmitted && (
          <div className="explanation-section">
            <button
              className="toggle-explanation"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? 'Skrýt vysvětlení' : 'Zobrazit vysvětlení'}
            </button>
            {showExplanation && (
              <div className="explanation">
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        <div className="question-actions">
          {!isSubmitted ? (
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={selectedAnswers.size === 0}
            >
              Zkontrolovat
            </button>
          ) : (
            <button className="next-button" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'Další otázka' : 'Dokončit test'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
