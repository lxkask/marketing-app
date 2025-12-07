import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'marketing-app-favorites'

interface UseFavoritesReturn {
  favorites: Set<string>
  isFavorite: (lessonId: number, questionId: number) => boolean
  toggleFavorite: (lessonId: number, questionId: number) => void
  getFavoriteCount: () => number
  clearFavorites: () => void
}

const getStoredFavorites = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch (e) {
    console.error('Failed to load favorites:', e)
  }
  return new Set()
}

const saveFavorites = (favorites: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)))
  } catch (e) {
    console.error('Failed to save favorites:', e)
  }
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(getStoredFavorites)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const isFavorite = useCallback(
    (lessonId: number, questionId: number) => {
      return favorites.has(`${lessonId}-${questionId}`)
    },
    [favorites]
  )

  const toggleFavorite = useCallback((lessonId: number, questionId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      const key = `${lessonId}-${questionId}`

      if (newFavorites.has(key)) {
        newFavorites.delete(key)
      } else {
        newFavorites.add(key)
      }

      return newFavorites
    })
  }, [])

  const getFavoriteCount = useCallback(() => {
    return favorites.size
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites(new Set())
  }, [])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoriteCount,
    clearFavorites
  }
}
