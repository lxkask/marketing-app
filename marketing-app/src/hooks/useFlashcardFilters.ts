import { useState, useCallback } from 'react'
import type { Question } from '../types'

export interface FlashcardQuestion extends Question {
  lessonId: number
  lessonTitle: string
}

export interface FlashcardFilters {
  selectedLessons: Set<number>
  onlyFavorites: boolean
  shuffle: boolean
  onlyUnseen: boolean
}

interface UseFlashcardFiltersReturn {
  filters: FlashcardFilters
  toggleLesson: (lessonId: number) => void
  setOnlyFavorites: (value: boolean) => void
  setShuffle: (value: boolean) => void
  setOnlyUnseen: (value: boolean) => void
  resetFilters: () => void
  applyFilters: (
    questions: FlashcardQuestion[],
    favorites: Set<string>,
    viewed: Set<string>
  ) => FlashcardQuestion[]
}

export function useFlashcardFilters(): UseFlashcardFiltersReturn {
  const [filters, setFilters] = useState<FlashcardFilters>({
    selectedLessons: new Set(),
    onlyFavorites: false,
    shuffle: false,
    onlyUnseen: false
  })

  const toggleLesson = useCallback((lessonId: number) => {
    setFilters(prev => {
      const newLessons = new Set(prev.selectedLessons)
      if (newLessons.has(lessonId)) {
        newLessons.delete(lessonId)
      } else {
        newLessons.add(lessonId)
      }
      return { ...prev, selectedLessons: newLessons }
    })
  }, [])

  const setOnlyFavorites = useCallback((value: boolean) => {
    setFilters(prev => ({ ...prev, onlyFavorites: value }))
  }, [])

  const setShuffle = useCallback((value: boolean) => {
    setFilters(prev => ({ ...prev, shuffle: value }))
  }, [])

  const setOnlyUnseen = useCallback((value: boolean) => {
    setFilters(prev => ({ ...prev, onlyUnseen: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      selectedLessons: new Set(),
      onlyFavorites: false,
      shuffle: false,
      onlyUnseen: false
    })
  }, [])

  const applyFilters = useCallback(
    (
      questions: FlashcardQuestion[],
      favorites: Set<string>,
      viewed: Set<string>
    ): FlashcardQuestion[] => {
      let result = [...questions]

      // 1. Filter by selected lessons (if any selected)
      if (filters.selectedLessons.size > 0) {
        result = result.filter(q => filters.selectedLessons.has(q.lessonId))
      }

      // 2. Filter by favorites only
      if (filters.onlyFavorites) {
        result = result.filter(q => favorites.has(`${q.lessonId}-${q.id}`))
      }

      // 3. Filter by unseen only
      if (filters.onlyUnseen) {
        result = result.filter(q => !viewed.has(`${q.lessonId}-${q.id}`))
      }

      // 4. Shuffle if enabled
      if (filters.shuffle) {
        result = result.sort(() => Math.random() - 0.5)
      }

      return result
    },
    [filters]
  )

  return {
    filters,
    toggleLesson,
    setOnlyFavorites,
    setShuffle,
    setOnlyUnseen,
    resetFilters,
    applyFilters
  }
}
