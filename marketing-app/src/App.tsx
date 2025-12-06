import { useState } from 'react'
import lessons from './data/lessons.json'
import type { Lesson } from './types'
import LessonList from './components/LessonList'
import LessonView from './components/LessonView'
import Quiz from './components/Quiz'
import './App.css'

type View = 'list' | 'lesson' | 'quiz'

function App() {
  const [view, setView] = useState<View>('list')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setView('lesson')
  }

  const handleStartQuiz = () => {
    if (selectedLesson) {
      setView('quiz')
    }
  }

  const handleBack = () => {
    if (view === 'quiz') {
      setView('lesson')
    } else {
      setView('list')
      setSelectedLesson(null)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Marketing pro informatiky</h1>
        <p className="subtitle">Interaktivní studijní průvodce</p>
      </header>

      <main className="main">
        {view === 'list' && (
          <LessonList
            lessons={lessons as Lesson[]}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {view === 'lesson' && selectedLesson && (
          <LessonView
            lesson={selectedLesson}
            onBack={handleBack}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {view === 'quiz' && selectedLesson && (
          <Quiz
            lesson={selectedLesson}
            onBack={handleBack}
          />
        )}
      </main>

      <footer className="footer">
        <p>Tahák pro přípravu na zkoušku z Marketingu</p>
      </footer>
    </div>
  )
}

export default App
