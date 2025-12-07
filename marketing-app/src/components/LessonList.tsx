import type { Lesson } from '../types'
import './LessonList.css'

interface Props {
  lessons: Lesson[]
  onSelectLesson: (lesson: Lesson) => void
  isLessonComplete: (lessonId: number) => boolean
  getLessonScore: (lessonId: number) => { correct: number; total: number } | undefined
}

// Calculate reading time in minutes (avg 1000 chars/min)
function getReadingTime(notes: { text: string }[]): number {
  const totalChars = notes.reduce((sum, note) => sum + note.text.length, 0)
  return Math.max(1, Math.ceil(totalChars / 1000))
}

export default function LessonList({ lessons, onSelectLesson, isLessonComplete, getLessonScore }: Props) {
  return (
    <div className="lesson-list">
      <div className="lesson-list-header">
        <h2>Lekce</h2>
        <p className="lesson-list-subtitle">Vyberte lekci pro studium nebo test</p>
      </div>

      <div className="lessons-grid">
        {lessons.map((lesson, index) => {
          const isComplete = isLessonComplete(lesson.id)
          const score = getLessonScore(lesson.id)
          const readingTime = getReadingTime(lesson.notes)

          return (
            <button
              key={lesson.id}
              className={`lesson-card ${isComplete ? 'completed' : ''}`}
              onClick={() => onSelectLesson(lesson)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {isComplete && (
                <div className="completion-badge" title="Dokončeno">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}

              <div className="lesson-number">{lesson.id}</div>

              <h3 className="lesson-title">{lesson.title}</h3>

              <div className="lesson-meta">
                <span className="lesson-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {readingTime} min čtení
                </span>
                <span className="lesson-stat">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                  </svg>
                  {lesson.questions.length} otázek
                </span>
              </div>

              {score && (
                <div className="lesson-score">
                  <span className="score-label">Poslední skóre:</span>
                  <span className="score-value">{score.correct}/{score.total}</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
