import { useCallback } from 'react'

/** 한글 IME 조합 중 Enter 이벤트 이중 발화 방지 훅 */
export function useEnterSubmit(onSubmit: () => void) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.nativeEvent.isComposing) return
      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      }
    },
    [onSubmit],
  )
}
