import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEnterSubmit } from './ime'

describe('useEnterSubmit', () => {
  it('Enter 키 입력 시 onSubmit을 호출한다', () => {
    const onSubmit = vi.fn()
    const { result } = renderHook(() => useEnterSubmit(onSubmit))

    const event = {
      key: 'Enter',
      nativeEvent: { isComposing: false },
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent

    result.current(event)
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('한글 IME 조합 중에는 onSubmit을 호출하지 않는다', () => {
    const onSubmit = vi.fn()
    const { result } = renderHook(() => useEnterSubmit(onSubmit))

    const event = {
      key: 'Enter',
      nativeEvent: { isComposing: true },
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent

    result.current(event)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('Enter 외 키 입력 시 onSubmit을 호출하지 않는다', () => {
    const onSubmit = vi.fn()
    const { result } = renderHook(() => useEnterSubmit(onSubmit))

    const event = {
      key: 'a',
      nativeEvent: { isComposing: false },
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent

    result.current(event)
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
