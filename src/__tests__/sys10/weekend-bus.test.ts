import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys10-weekend-bus')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('SeatGrid 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'SeatGrid.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('STATUS_COLOR 상수를 포함한다', () => {
    expect(content).toContain('STATUS_COLOR')
  })

  it('available 상태를 포함한다', () => {
    expect(content).toContain('available')
  })

  it('reserved 상태를 포함한다', () => {
    expect(content).toContain('reserved')
  })

  it('selected 상태를 포함한다', () => {
    expect(content).toContain('selected')
  })

  it('unavailable 상태를 포함한다', () => {
    expect(content).toContain('unavailable')
  })

  it('Row 컴포넌트를 사용한다', () => {
    expect(content).toContain('Row')
  })

  it('Col 컴포넌트를 사용한다', () => {
    expect(content).toContain('Col')
  })

  it('onSeatClick 콜백을 포함한다', () => {
    expect(content).toContain('onSeatClick')
  })
})

describe('BusReservationPage 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'BusReservationPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('SeatGrid 컴포넌트를 사용한다', () => {
    expect(content).toContain('SeatGrid')
  })

  it('onSeatClick 콜백을 포함한다', () => {
    expect(content).toContain('onSeatClick')
  })

  it('routeId 필드를 포함한다', () => {
    expect(content).toContain('routeId')
  })

  it('operationDate 필드를 포함한다', () => {
    expect(content).toContain('operationDate')
  })
})

describe('TicketPrint 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'TicketPrint.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('PrintableReport 컴포넌트를 사용한다', () => {
    expect(content).toContain('PrintableReport')
  })

  it('승차권 제목을 포함한다', () => {
    expect(content).toContain('승차권')
  })
})

describe('sys10 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys10.ts'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('sys10Handlers를 export한다', () => {
    expect(content).toContain('sys10Handlers')
  })
})

describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys10Handlers를 포함한다', () => {
    expect(content).toContain('sys10Handlers')
  })
})
