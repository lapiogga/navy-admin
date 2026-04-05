import { useState } from 'react'

/**
 * localStorage 기반 즐겨찾기 관리 훅
 * @param storageKey localStorage 저장 키
 */
export function useFavorites(storageKey: string) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    } catch {
      return []
    }
  })

  const toggle = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
  }

  const isFavorite = (id: string): boolean => favorites.includes(id)

  return { favorites, toggle, isFavorite }
}
