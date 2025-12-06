import type { Lesson } from '../types'
import './LessonView.css'

interface Props {
  lesson: Lesson
  onBack: () => void
  onStartQuiz: () => void
}

export default function LessonView({ lesson, onBack, onStartQuiz }: Props) {
  return (
    <div className="lesson-view">
      <div className="lesson-header">
        <button className="back-button" onClick={onBack}>
          ← Zpět na lekce
        </button>
        <h2>{lesson.title}</h2>
      </div>

      <div className="lesson-content">
        <section className="notes-section">
          <h3>Zápisky</h3>
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

        {lesson.questions.length > 0 && (
          <section className="quiz-section">
            <h3>Testové otázky</h3>
            <p className="quiz-info">
              Tato lekce obsahuje {lesson.questions.length} testových otázek.
            </p>
            <button className="start-quiz-button" onClick={onStartQuiz}>
              Spustit test
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
