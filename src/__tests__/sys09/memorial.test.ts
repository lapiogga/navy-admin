import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys09-memorial')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('DeceasedPage', () => {
  const content = readFileSync(resolve(BASE, 'DeceasedPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('사망자 타이틀을 포함한다', () => {
    expect(content).toContain('사망자')
  })

  it('serviceNumber 필드를 포함한다', () => {
    expect(content).toContain('serviceNumber')
  })

  it('deathType 필드를 포함한다', () => {
    expect(content).toContain('deathType')
  })

  it('deathDate 필드를 포함한다', () => {
    expect(content).toContain('deathDate')
  })
})

describe('InjuredPage', () => {
  const content = readFileSync(resolve(BASE, 'InjuredPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('상이자 타이틀을 포함한다', () => {
    expect(content).toContain('상이자')
  })

  it('injuryType 필드를 포함한다', () => {
    expect(content).toContain('injuryType')
  })

  it('injuryGrade 필드를 포함한다', () => {
    expect(content).toContain('injuryGrade')
  })
})

describe('ReviewPage', () => {
  const content = readFileSync(resolve(BASE, 'ReviewPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('심사 타이틀을 포함한다', () => {
    expect(content).toContain('심사')
  })

  it('reviewRound 필드를 포함한다', () => {
    expect(content).toContain('reviewRound')
  })

  it('result 필드를 포함한다', () => {
    expect(content).toContain('result')
  })
})

describe('PrintableReport', () => {
  const content = readFileSync(resolve(BASE, 'PrintableReport.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('window.print를 포함한다', () => {
    expect(content).toContain('window.print')
  })

  it('print-area 클래스를 포함한다', () => {
    expect(content).toContain('print-area')
  })

  it('인쇄 버튼을 포함한다', () => {
    expect(content).toContain('인쇄')
  })
})

describe('print.css', () => {
  const content = readFileSync(resolve(BASE, 'print.css'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('@media print를 포함한다', () => {
    expect(content).toContain('@media print')
  })

  it('@page를 포함한다', () => {
    expect(content).toContain('@page')
  })

  it('A4 사이즈를 포함한다', () => {
    expect(content).toContain('A4')
  })

  it('report-title 클래스를 포함한다', () => {
    expect(content).toContain('report-title')
  })
})

describe('StatsUnitPage', () => {
  const content = readFileSync(resolve(BASE, 'StatsUnitPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('@ant-design/charts import를 포함한다', () => {
    expect(content).toContain('@ant-design/charts')
  })

  it('Bar 차트를 사용한다', () => {
    expect(content).toContain('Bar')
  })
})

describe('StatsTypePage', () => {
  const content = readFileSync(resolve(BASE, 'StatsTypePage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Pie 차트를 사용한다', () => {
    expect(content).toContain('Pie')
  })
})

describe('StatsYearPage', () => {
  const content = readFileSync(resolve(BASE, 'StatsYearPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Line 차트를 사용한다', () => {
    expect(content).toContain('Line')
  })
})

describe('ReportDeceasedPage', () => {
  const content = readFileSync(resolve(BASE, 'ReportDeceasedPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Descriptions 또는 Table을 포함한다', () => {
    expect(content.includes('Descriptions') || content.includes('Table')).toBe(true)
  })

  it('PrintableReport를 사용한다', () => {
    expect(content).toContain('PrintableReport')
  })
})

describe('CertDeathPage', () => {
  const content = readFileSync(resolve(BASE, 'CertDeathPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Descriptions를 포함한다', () => {
    expect(content).toContain('Descriptions')
  })

  it('PrintableReport를 사용한다', () => {
    expect(content).toContain('PrintableReport')
  })

  it('확인서 텍스트를 포함한다', () => {
    expect(content.includes('확인서') || content.includes('확인자')).toBe(true)
  })
})

describe('sys09 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys09.ts'), 'utf-8')

  it('sys09Handlers를 export한다', () => {
    expect(content).toContain('export const sys09Handlers')
  })

  it('/sys09/deceased 핸들러를 포함한다', () => {
    expect(content).toContain('/sys09/deceased')
  })

  it('/sys09/injured 핸들러를 포함한다', () => {
    expect(content).toContain('/sys09/injured')
  })

  it('/sys09/reviews 핸들러를 포함한다', () => {
    expect(content).toContain('/sys09/reviews')
  })

  it('/sys09/stats/ 핸들러를 포함한다', () => {
    expect(content).toContain('/sys09/stats/')
  })

  it('/sys09/reports/ 핸들러를 포함한다', () => {
    expect(content).toContain('/sys09/reports/')
  })

  it('extends Record<string, unknown>를 포함한다', () => {
    expect(content).toContain('extends Record<string, unknown>')
  })
})

describe('handlers/index.ts sys09', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys09Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys09Handlers')
  })
})

describe('sys09-memorial index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('/sys09/ 경로 매핑을 포함한다', () => {
    expect(content).toContain('sys09')
  })

  it('여러 Route 매핑을 포함한다', () => {
    const routeCount = (content.match(/path=/g) || []).length
    expect(routeCount).toBeGreaterThanOrEqual(13)
  })

  it('common/board lazy import를 포함한다 (HONOR-17)', () => {
    expect(content).toContain('common/board')
  })
})
