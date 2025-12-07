import type { FlashcardQuestion } from '../hooks/useFlashcardFilters'

interface Props {
  question: FlashcardQuestion
  isFlipped: boolean
  isFavorite: boolean
  onFlip: () => void
  onToggleFavorite: () => void
  showLessonSource?: boolean
}

export default function FlashcardView({
  question,
  isFlipped,
  isFavorite,
  onFlip,
  onToggleFavorite,
  showLessonSource = false
}: Props) {
  const hasCorrectAnswers = question.answers.some(a => a.isCorrect)

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
        {/* Favorite button - outside of card faces so it's only rendered once */}
        <button
          className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          title={isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
        >
          ⭐
        </button>

        {/* Front side - Question */}
        <div className="flashcard-front">
          {showLessonSource && (
            <div className="lesson-source">
              Lekce {question.lessonId}: {question.lessonTitle}
            </div>
          )}

          <div className="flashcard-content">
            <h3 className="question-text">{question.text}</h3>
            <p className="flip-hint">Klikni nebo stiskni mezerník pro otočení</p>
          </div>
        </div>

        {/* Back side - Answers + Explanation */}
        <div className="flashcard-back">
          {showLessonSource && (
            <div className="lesson-source">
              Lekce {question.lessonId}: {question.lessonTitle}
            </div>
          )}

          <div className="flashcard-content">
            <div className="correct-answers">
              <h4>Správné odpovědi:</h4>
              <ul>
                {question.answers
                  .filter(a => a.isCorrect)
                  .map((answer, i) => (
                    <li key={i}>{answer.text}</li>
                  ))}
                {!hasCorrectAnswers && <li>Žádná odpověď není správná</li>}
              </ul>
            </div>

            {question.aiExplanation && (
              <div className="explanation">
                <h4>Vysvětlení:</h4>
                <div className="explanation-content">
                  {question.aiExplanation.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
