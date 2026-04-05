import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime } from './date'

describe('formatDate', () => {
  it('문자열 날짜를 YYYY-MM-DD 형식으로 변환한다', () => {
    expect(formatDate('2026-04-05T12:30:00')).toBe('2026-04-05')
  })

  it('Date 객체를 YYYY-MM-DD 형식으로 변환한다', () => {
    expect(formatDate(new Date('2026-04-05'))).toBe('2026-04-05')
  })
})

describe('formatDateTime', () => {
  it('문자열 날짜를 YYYY-MM-DD HH:mm 형식으로 변환한다', () => {
    expect(formatDateTime('2026-04-05T12:30:00')).toBe('2026-04-05 12:30')
  })
})
