import { describe, it, expect } from 'vitest'

describe('useCodeOptions 훅', () => {
  it('useCodeOptions가 export된다', async () => {
    const { useCodeOptions } = await import('@/features/common/hooks/useCodeOptions')
    expect(typeof useCodeOptions).toBe('function')
  })
})
