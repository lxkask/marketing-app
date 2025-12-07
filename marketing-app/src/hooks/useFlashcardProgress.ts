import { useState, useEffect, useCallback } from 'react'

const SESSION_KEY = 'flashcards-session-viewed'

interface UseFlashcardProgressReturn {
  viewedCards: Set<string>
  markAsViewed: (lessonId: number, questionId: number) => void
  isViewed: (lessonId: number, questionId: number) => boolean
  resetViewed: () => void
  getViewedCount: () => number
}

const getStoredViewed = (): Set<string> => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch (e) {
    console.error('Failed to load flashcard progress:', e)
  }
  return new Set()
}

const saveViewed = (viewed: Set<string>) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(viewed)))
  } catch (e) {
    console.error('Failed to save flashcard progress:', e)
  }
}

export function useFlashcardProgress(): UseFlashcardProgressReturn {
  const [viewedCards, setViewedCards] = useState<Set<string>>(getStoredViewed)

  useEffect(() => {
    saveViewed(viewedCards)
  }, [viewedCards])

  const markAsViewed = useCallback((lessonId: number, questionId: number) => {
    setViewedCards(prev => {
      const newViewed = new Set(prev)
      newViewed.add(`${lessonId}-${questionId}`)
      return newViewed
    })
  }, [])

  const isViewed = useCallback(
    (lessonId: number, questionId: number) => {
      return viewedCards.has(`${lessonId}-${questionId}`)
    },
    [viewedCards]
  )

  const resetViewed = useCallback(() => {
    setViewedCards(new Set())
  }, [])

  const getViewedCount = useCallback(() => {
    return viewedCards.size
  }, [viewedCards])

  return {
    viewedCards,
    markAsViewed,
    isViewed,
    resetViewed,
    getViewedCount
  }
}
