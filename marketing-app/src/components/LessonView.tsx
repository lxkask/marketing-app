import type { Lesson } from '../types'
import './LessonView.css'

interface Props {
  lesson: Lesson
  onBack: () => void
  onStartQuiz: () => void
  onStartFlashcards: () => void
  isComplete: boolean
  score?: { correct: number; total: number }
}

export default function LessonView({ lesson, onBack, onStartQuiz, onStartFlashcards, isComplete, score }: Props) {
  return (
    <div className="lesson-view">
      <div className="lesson-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zpět na lekce
        </button>

        <div className="lesson-title-row">
          <span className="lesson-badge">{lesson.id}</span>
          <h2>{lesson.title}</h2>
          {isComplete && (
            <span className="complete-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Dokončeno
            </span>
          )}
        </div>

        {score && (
          <div className="previous-score">
            Poslední výsledek: <strong>{score.correct}/{score.total}</strong> ({Math.round((score.correct / score.total) * 100)}%)
          </div>
        )}
      </div>

      <div className="lesson-content">
        {lesson.questions.length > 0 && (
          <section className="quiz-section">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Testové otázky a procvičování
            </h3>
            <p className="quiz-info">
              Tato lekce obsahuje <strong>{lesson.questions.length}</strong> testových otázek.
              {isComplete
                ? ' Můžete test zopakovat pro zlepšení skóre.'
                : ' Dokončením testu označíte lekci jako zvládnutou.'}
            </p>
            <div className="action-buttons">
              <button className="start-quiz-button" onClick={onStartQuiz}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {isComplete ? 'Zopakovat test' : 'Spustit test'}
              </button>
              <button className="flashcards-button" onClick={onStartFlashcards}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" />
                </svg>
                Flashcards ({lesson.questions.length})
              </button>
            </div>
          </section>
        )}

        <section className="notes-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Zápisky
          </h3>
          <div className="notes">
            {lesson.notes.map((note, index) => (
              <p
                key={index}
                className={`note indent-${note.indent}`}
              >
                {note.text}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
