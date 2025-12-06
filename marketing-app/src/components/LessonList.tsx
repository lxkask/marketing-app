import type { Lesson } from '../types'
import './LessonList.css'

interface Props {
  lessons: Lesson[]
  onSelectLesson: (lesson: Lesson) => void
}

export default function LessonList({ lessons, onSelectLesson }: Props) {
  return (
    <div className="lesson-list">
      <h2>Lekce</h2>
      <div className="lessons-grid">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            className="lesson-card"
            onClick={() => onSelectLesson(lesson)}
          >
            <span className="lesson-number">{lesson.id}</span>
            <h3 className="lesson-title">{lesson.title}</h3>
            <div className="lesson-meta">
              <span className="lesson-notes">{lesson.notes.length} poznámek</span>
              <span className="lesson-questions">{lesson.questions.length} otázek</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
