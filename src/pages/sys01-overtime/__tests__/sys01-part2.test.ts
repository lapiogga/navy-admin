import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '..')
const routerPath = resolve(__dirname, '../../../app/router.tsx')

function readPage(name: string): string {
  return readFileSync(resolve(root, name), 'utf-8')
}

// Part 2 페이지 존재 확인
describe('SYS01 Part 2: 12개 페이지 파일 존재 확인', () => {
  const pages = [
    'OtMaxHoursPage.tsx',
    'OtWorkHoursPage.tsx',
    'OtHolidayPage.tsx',
    'OtApprovalLinePage.tsx',
    'OtDutyWorkerPage.tsx',
    'OtDutyPostPage.tsx',
    'OtDutyPostChangePage.tsx',
    'OtPersonalDutyApprovalPage.tsx',
    'OtPersonalDeptApprovalPage.tsx',
    'OtPersonalSettingPage.tsx',
    'OtPersonalDutyPage.tsx',
    'OtPersonalDeptPage.tsx',
  ]

  pages.forEach((page) => {
    it(`${page} 파일이 존재한다`, () => {
      expect(existsSync(resolve(root, page))).toBe(true)
    })
  })
})

// OtMaxHoursPage: Tabs CRUD (D-30)
describe('SYS01 OtMaxHoursPage: 최대인정시간 Tabs', () => {
  it('<Tabs 컴포넌트가 포함된다 (D-30)', () => {
    const content = readPage('OtMaxHoursPage.tsx')
    expect(content).toContain('<Tabs')
  })

  it('최대인정시간 탭이 포함된다', () => {
    const content = readPage('OtMaxHoursPage.tsx')
    expect(content).toContain('최대인정시간')
  })

  it('예외처리 탭이 포함된다', () => {
    const content = readPage('OtMaxHoursPage.tsx')
    expect(content).toContain('예외처리')
  })

  it('예외구분 탭이 포함된다', () => {
    const content = readPage('OtMaxHoursPage.tsx')
    expect(content).toContain('예외구분')
  })
})

// OtWorkHoursPage: Calendar + Modal (D-31, Pitfall 2)
describe('SYS01 OtWorkHoursPage: 근무시간 Calendar', () => {
  it('<Calendar 컴포넌트가 포함된다 (D-31)', () => {
    const content = readPage('OtWorkHoursPage.tsx')
    expect(content).toContain('<Calendar')
  })

  it('onSelect 핸들러가 포함된다 (날짜 클릭 -> Modal)', () => {
    const content = readPage('OtWorkHoursPage.tsx')
    expect(content).toContain('onSelect')
  })

  it('cellRender가 포함된다 (날짜 셀 근무시간 표시)', () => {
    const content = readPage('OtWorkHoursPage.tsx')
    expect(content).toContain('cellRender')
  })

  it('onPanelChange가 포함된다 (Pitfall 2: 월 네비게이션)', () => {
    const content = readPage('OtWorkHoursPage.tsx')
    expect(content).toContain('onPanelChange')
  })

  it('TimePicker.RangePicker가 포함된다 (Modal 내 근무시간)', () => {
    const content = readPage('OtWorkHoursPage.tsx')
    expect(content).toContain('TimePicker.RangePicker')
  })
})

// OtHolidayPage: Calendar + cellRender red (D-32)
describe('SYS01 OtHolidayPage: 공휴일 Calendar', () => {
  it('<Calendar 컴포넌트가 포함된다 (D-32)', () => {
    const content = readPage('OtHolidayPage.tsx')
    expect(content).toContain('<Calendar')
  })

  it('cellRender가 포함된다 (공휴일 셀 표시)', () => {
    const content = readPage('OtHolidayPage.tsx')
    expect(content).toContain('cellRender')
  })

  it('text-red-500 스타일이 포함된다 (공휴일 빨간 텍스트)', () => {
    const content = readPage('OtHolidayPage.tsx')
    expect(content).toContain('text-red-500')
  })

  it('공휴일 종류 Select가 포함된다 (법정/대체/지정)', () => {
    const content = readPage('OtHolidayPage.tsx')
    expect(content).toContain('법정')
    expect(content).toContain('대체')
    expect(content).toContain('지정')
  })
})

// OtDutyPostPage: mode=multiple (D-10)
describe('SYS01 OtDutyPostPage: 당직개소 다중선택', () => {
  it('mode="multiple" 또는 mode 프로퍼티가 포함된다 (D-10)', () => {
    const content = readPage('OtDutyPostPage.tsx')
    expect(content).toContain('mode')
  })

  it('"multiple" 값이 포함된다', () => {
    const content = readPage('OtDutyPostPage.tsx')
    expect(content).toContain('multiple')
  })

  it('MAC주소 필드가 포함된다 (D-10)', () => {
    const content = readPage('OtDutyPostPage.tsx')
    expect(content).toContain('macAddress')
  })
})

// OtPersonalSettingPage: Descriptions (D-38)
describe('SYS01 OtPersonalSettingPage: 읽기전용 Descriptions', () => {
  it('Descriptions 컴포넌트가 포함된다 (D-38)', () => {
    const content = readPage('OtPersonalSettingPage.tsx')
    expect(content).toContain('Descriptions')
  })

  it('결재부서 필드가 표시된다', () => {
    const content = readPage('OtPersonalSettingPage.tsx')
    expect(content).toContain('결재부서')
  })

  it('결재자 필드가 표시된다', () => {
    const content = readPage('OtPersonalSettingPage.tsx')
    expect(content).toContain('결재자')
  })

  it('당직개소 필드가 표시된다', () => {
    const content = readPage('OtPersonalSettingPage.tsx')
    expect(content).toContain('당직개소')
  })
})

// OtPersonalDeptPage: 복구 버튼 (D-15)
describe('SYS01 OtPersonalDeptPage: 복구 버튼', () => {
  it('복구 텍스트가 포함된다 (D-15)', () => {
    const content = readPage('OtPersonalDeptPage.tsx')
    expect(content).toContain('복구')
  })

  it('Tabs 구조가 포함된다 (신청/결재현황)', () => {
    const content = readPage('OtPersonalDeptPage.tsx')
    expect(content).toContain('<Tabs')
  })
})

// index.tsx: 관리자/게시판 lazy import (7대 규칙 6, 7번)
describe('SYS01 index.tsx: 7대 규칙 6/7번 준수', () => {
  it('AuthGroupPage 또는 auth-group lazy import가 포함된다 (7대 규칙 7번)', () => {
    const content = readPage('index.tsx')
    expect(content).toMatch(/AuthGroupPage|auth-group/)
  })

  it('BoardListPage 또는 board lazy import가 포함된다 (7대 규칙 6번)', () => {
    const content = readPage('index.tsx')
    expect(content).toMatch(/BoardListPage|common\/board/)
  })

  it('sysCode sys01 게시판이 설정된다', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('sys01')
  })

  it('관리자 Route(7/1)가 포함된다', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('7/1')
  })

  it('게시판 Route(6/1, 6/2)가 포함된다', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('6/1')
    expect(content).toContain('6/2')
  })
})

// router.tsx: sys01 라우트 등록 확인
describe('SYS01 router.tsx: sys01 라우트 등록', () => {
  it('router.tsx에 sys01 라우트가 등록된다', () => {
    const content = readFileSync(routerPath, 'utf-8')
    expect(content).toContain('sys01')
  })

  it('router.tsx에 Sys01Page lazy import가 있다', () => {
    const content = readFileSync(routerPath, 'utf-8')
    expect(content).toContain('Sys01Page')
  })
})

// 전체 22개 페이지 확인 (Part 1 + Part 2)
describe('SYS01 전체 22개 페이지 파일 존재', () => {
  const allPages = [
    // Part 1 (10개)
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
    // Part 2 (12개)
    'OtMaxHoursPage.tsx',
    'OtWorkHoursPage.tsx',
    'OtHolidayPage.tsx',
    'OtApprovalLinePage.tsx',
    'OtDutyWorkerPage.tsx',
    'OtDutyPostPage.tsx',
    'OtDutyPostChangePage.tsx',
    'OtPersonalDutyApprovalPage.tsx',
    'OtPersonalDeptApprovalPage.tsx',
    'OtPersonalSettingPage.tsx',
    'OtPersonalDutyPage.tsx',
    'OtPersonalDeptPage.tsx',
  ]

  it('22개 파일이 모두 존재한다', () => {
    const missing = allPages.filter((p) => !existsSync(resolve(root, p)))
    expect(missing).toHaveLength(0)
  })
})
