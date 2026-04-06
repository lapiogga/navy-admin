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

describe('BusReservationStatusPage 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'BusReservationStatusPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 사용한다', () => {
    expect(content).toContain('DataTable')
  })

  it('reservedCount 컬럼을 포함한다', () => {
    expect(content).toContain('reservedCount')
  })

  it('StatusBadge 컴포넌트를 사용한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('승차권 발급 기능을 포함한다', () => {
    expect(content).toContain('승차권')
  })
})

describe('BusDispatchPage 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'BusDispatchPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('SeatGrid 컴포넌트를 사용한다', () => {
    expect(content).toContain('SeatGrid')
  })

  it('readOnly 모드를 사용한다', () => {
    expect(content).toContain('readOnly')
  })

  it('CrudForm 또는 Form을 사용한다', () => {
    expect(content).toContain('Form')
  })
})

describe('BusSchedulePage 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'BusSchedulePage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('openTime 필드를 포함한다', () => {
    expect(content).toContain('openTime')
  })

  it('closeTime 필드를 포함한다', () => {
    expect(content).toContain('closeTime')
  })

  it('reservationRank 필드를 포함한다', () => {
    expect(content).toContain('reservationRank')
  })
})

describe('BusUsagePage 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'BusUsagePage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('usageRate 컬럼을 포함한다', () => {
    expect(content).toContain('usageRate')
  })

  it('usedSeats 컬럼을 포함한다', () => {
    expect(content).toContain('usedSeats')
  })
})

describe('BusWaitlistPage 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'BusWaitlistPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('waitingNo 컬럼을 포함한다', () => {
    expect(content).toContain('waitingNo')
  })

  it('auto-assign API를 포함한다', () => {
    expect(content).toContain('auto-assign')
  })

  it('manual-assign API를 포함한다', () => {
    expect(content).toContain('manual-assign')
  })

  it('StatusBadge를 사용한다', () => {
    expect(content).toContain('StatusBadge')
  })
})

describe('BusViolatorPage 컴포넌트', () => {
  const content = readFileSync(resolve(BASE, 'BusViolatorPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('sanctionPeriod 필드를 포함한다', () => {
    expect(content).toContain('sanctionPeriod')
  })

  it('RangePicker를 사용한다', () => {
    expect(content).toContain('RangePicker')
  })

  it('violationType 필드를 포함한다', () => {
    expect(content).toContain('violationType')
  })

  it('CrudForm 또는 Form을 사용한다', () => {
    expect(content).toContain('Form')
  })
})

describe('sys10 MSW 핸들러 - Task 1 확장', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys10.ts'), 'utf-8')

  it('/api/sys10/waitlist 핸들러를 포함한다', () => {
    expect(content).toContain('/api/sys10/waitlist')
  })

  it('/api/sys10/violators 핸들러를 포함한다', () => {
    expect(content).toContain('/api/sys10/violators')
  })
})

describe('sys10 index.tsx - BusWaitlistPage, BusViolatorPage 연결', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('BusWaitlistPage를 포함한다', () => {
    expect(content).toContain('BusWaitlistPage')
  })

  it('BusViolatorPage를 포함한다', () => {
    expect(content).toContain('BusViolatorPage')
  })
})
