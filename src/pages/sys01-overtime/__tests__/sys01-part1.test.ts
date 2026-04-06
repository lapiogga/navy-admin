import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '..')
const handlersDir = resolve(__dirname, '../../../shared/api/mocks/handlers')

function readPage(name: string): string {
  return readFileSync(resolve(root, name), 'utf-8')
}

function readHandler(name: string): string {
  return readFileSync(resolve(handlersDir, name), 'utf-8')
}

describe('SYS01 Part 1: 11개 페이지 파일 존재 확인', () => {
  const pages = [
    'OtRequestPage.tsx',
    'OtApprovalPage.tsx',
    'OtBulkPage.tsx',
    'OtBulkApprovalPage.tsx',
    'OtMonthlyClosingPage.tsx',
    'OtMyStatusPage.tsx',
    'OtAbsencePage.tsx',
    'OtUnitStatusPage.tsx',
    'OtMonthlyStatusPage.tsx',
    'OtUnitPersonnelPage.tsx',
  ]

  pages.forEach(page => {
    it(`${page} 파일이 존재한다`, () => {
      expect(existsSync(resolve(root, page))).toBe(true)
    })
  })
})

describe('SYS01 OtRequestPage: TimePicker + 자동계산', () => {
  it('TimePicker.RangePicker가 포함된다 (D-04, Pitfall 4 대응)', () => {
    const content = readPage('OtRequestPage.tsx')
    expect(content).toContain('TimePicker.RangePicker')
  })

  it('diff 메서드로 시간 자동계산을 한다', () => {
    const content = readPage('OtRequestPage.tsx')
    expect(content).toContain('diff')
  })

  it('minutes 단위로 근무시간을 계산한다', () => {
    const content = readPage('OtRequestPage.tsx')
    expect(content).toContain('minutes')
  })
})

describe('SYS01 OtApprovalPage: Steps 결재 패턴', () => {
  it('<Steps 컴포넌트가 포함된다 (D-06)', () => {
    const content = readPage('OtApprovalPage.tsx')
    expect(content).toContain('<Steps')
  })

  it('승인/반려 버튼이 포함된다', () => {
    const content = readPage('OtApprovalPage.tsx')
    expect(content).toContain('승인')
    expect(content).toContain('반려')
  })
})

describe('SYS01 OtMonthlyClosingPage: 마감 워크플로우', () => {
  it('ConfirmDialog가 포함된다 (D-07)', () => {
    const content = readPage('OtMonthlyClosingPage.tsx')
    expect(content).toContain('ConfirmDialog')
  })

  it('마감 텍스트가 포함된다', () => {
    const content = readPage('OtMonthlyClosingPage.tsx')
    expect(content).toContain('마감')
  })

  it('status 필드가 포함된다 (closed/draft 상태 전환)', () => {
    const content = readPage('OtMonthlyClosingPage.tsx')
    expect(content).toContain('status')
  })

  it('마감취소 기능이 포함된다 (D-08)', () => {
    const content = readPage('OtMonthlyClosingPage.tsx')
    expect(content).toContain('cancel-close')
  })
})

describe('SYS01 OtMyStatusPage: Column 차트', () => {
  it('@ant-design/charts Column import가 포함된다 (D-05)', () => {
    const content = readPage('OtMyStatusPage.tsx')
    expect(content).toContain('Column')
  })

  it('연간/월간 Tabs가 포함된다', () => {
    const content = readPage('OtMyStatusPage.tsx')
    expect(content).toContain('연간')
    expect(content).toContain('월간')
  })
})

describe('SYS01 OtBulkPage: rowSelection 다중선택', () => {
  it('rowSelection이 포함된다 (D-28)', () => {
    const content = readPage('OtBulkPage.tsx')
    expect(content).toContain('rowSelection')
  })
})

describe('SYS01 OtAbsencePage: DatePicker.RangePicker', () => {
  it('RangePicker가 포함된다 (D-42)', () => {
    const content = readPage('OtAbsencePage.tsx')
    expect(content).toContain('RangePicker')
  })

  it('부재유형 Select가 포함된다', () => {
    const content = readPage('OtAbsencePage.tsx')
    expect(content).toContain('absenceType')
  })
})

describe('SYS01 MSW 핸들러', () => {
  it('sys01Handlers가 export된다', () => {
    const content = readHandler('sys01-overtime.ts')
    expect(content).toContain('export const sys01Handlers')
  })

  it('monthly-closing 엔드포인트가 포함된다 (마감 워크플로우)', () => {
    const content = readHandler('sys01-overtime.ts')
    expect(content).toContain('monthly-closing')
  })

  it('/api/sys01/requests CRUD 엔드포인트가 포함된다', () => {
    const content = readHandler('sys01-overtime.ts')
    expect(content).toContain('/api/sys01/requests')
  })

  it('/api/sys01/approvals 엔드포인트가 포함된다', () => {
    const content = readHandler('sys01-overtime.ts')
    expect(content).toContain('/api/sys01/approvals')
  })

  it('/api/sys01/my-status 엔드포인트가 포함된다', () => {
    const content = readHandler('sys01-overtime.ts')
    expect(content).toContain('/api/sys01/my-status')
  })

  it('/api/sys01/unit-personnel 엔드포인트가 포함된다', () => {
    const content = readHandler('sys01-overtime.ts')
    expect(content).toContain('/api/sys01/unit-personnel')
  })
})

describe('SYS01 7대 규칙: 부대(서) 표기 통일', () => {
  it('OtRequestPage에 부대(서) 표기가 포함된다', () => {
    const content = readPage('OtRequestPage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('OtAbsencePage에 부대(서) 표기가 포함된다', () => {
    const content = readPage('OtAbsencePage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('OtUnitStatusPage에 부대(서) 표기가 포함된다', () => {
    const content = readPage('OtUnitStatusPage.tsx')
    expect(content).toContain('부대(서)')
  })
})
