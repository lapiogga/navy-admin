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

// ──────────────────────────────────────────────────
// 파일 존재 확인
// ──────────────────────────────────────────────────
describe('SYS15 Plan06: 파일 존재 확인', () => {
  const pages = [
    'SummarySecretPage.tsx',
    'SummaryPersonalPage.tsx',
    'SummaryOfficePage.tsx',
    'SummaryAbsencePage.tsx',
    'CheckItemMgmtPage.tsx',
    'HolidayMgmtPage.tsx',
    'NotifyTimeMgmtPage.tsx',
    'LogHistoryPage.tsx',
    'ExceptionMgmtPage.tsx',
    'PersonalSettingPage.tsx',
    'RelatedRegulationPage.tsx',
    'index.tsx',
  ]

  pages.forEach((page) => {
    it(`${page} 파일이 존재한다`, () => {
      expect(existsSync(resolve(root, page))).toBe(true)
    })
  })
})

// ──────────────────────────────────────────────────
// 결산종합현황 4종 (SEC-10~13)
// ──────────────────────────────────────────────────
describe('SYS15 결산종합현황 4종', () => {
  it('SummarySecretPage: DataTable을 사용한다 (SEC-13)', () => {
    const content = readPage('SummarySecretPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('SummarySecretPage: SearchForm으로 부대(서) 검색을 제공한다', () => {
    const content = readPage('SummarySecretPage.tsx')
    expect(content).toContain('SearchForm')
    expect(content).toContain('부대(서)')
  })

  it('SummarySecretPage: 엑셀 저장 버튼이 있다', () => {
    const content = readPage('SummarySecretPage.tsx')
    expect(content).toContain('엑셀 저장')
  })

  it('SummaryPersonalPage: DataTable을 사용한다 (SEC-10)', () => {
    const content = readPage('SummaryPersonalPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('SummaryPersonalPage: SearchForm으로 기간/부대 검색을 제공한다', () => {
    const content = readPage('SummaryPersonalPage.tsx')
    expect(content).toContain('SearchForm')
    expect(content).toContain('startDate')
    expect(content).toContain('endDate')
  })

  it('SummaryOfficePage: DataTable과 SearchForm을 사용한다 (SEC-11)', () => {
    const content = readPage('SummaryOfficePage.tsx')
    expect(content).toContain('DataTable')
    expect(content).toContain('SearchForm')
  })

  it('SummaryAbsencePage: DataTable, SearchForm, 엑셀저장을 사용한다 (SEC-12)', () => {
    const content = readPage('SummaryAbsencePage.tsx')
    expect(content).toContain('DataTable')
    expect(content).toContain('SearchForm')
    expect(content).toContain('엑셀 저장')
  })
})

// ──────────────────────────────────────────────────
// 점검항목관리 (SEC-19, D-24~26)
// ──────────────────────────────────────────────────
describe('SYS15 CheckItemMgmtPage: 점검항목 Tabs 5개 CRUD', () => {
  it('Tabs 컴포넌트를 사용한다 (D-24)', () => {
    const content = readPage('CheckItemMgmtPage.tsx')
    expect(content).toContain('Tabs')
  })

  it('5개 탭 키가 정의된다 (필수개인/필수사무실/선택개인/선택사무실/평가)', () => {
    const content = readPage('CheckItemMgmtPage.tsx')
    expect(content).toContain('personal-required')
    expect(content).toContain('office-required')
    expect(content).toContain('personal-optional')
    expect(content).toContain('office-optional')
    expect(content).toContain('security-level')
  })

  it('DataTable을 사용한다', () => {
    const content = readPage('CheckItemMgmtPage.tsx')
    const matches = content.match(/DataTable/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('선택점검항목 탭에 부대(서) 필터가 있다 (D-25)', () => {
    const content = readPage('CheckItemMgmtPage.tsx')
    expect(content).toContain('isOptional')
    expect(content).toContain('부대(서) 필터')
  })

  it('항목명/분류/가중치/필수여부/주기 컬럼이 있다', () => {
    const content = readPage('CheckItemMgmtPage.tsx')
    expect(content).toContain('itemName')
    expect(content).toContain('weight')
    expect(content).toContain('required')
    expect(content).toContain('cycle')
  })

  it('등록/수정/삭제 CRUD Modal이 있다', () => {
    const content = readPage('CheckItemMgmtPage.tsx')
    expect(content).toContain('Modal')
    expect(content).toContain('InputNumber')
  })
})

// ──────────────────────────────────────────────────
// 공휴일관리 (SEC-22, D-37~38)
// ──────────────────────────────────────────────────
describe('SYS15 HolidayMgmtPage: 공휴일 관리', () => {
  it('Tabs 컴포넌트를 사용한다 (D-37)', () => {
    const content = readPage('HolidayMgmtPage.tsx')
    expect(content).toContain('Tabs')
  })

  it('DatePicker.RangePicker를 사용한다', () => {
    const content = readPage('HolidayMgmtPage.tsx')
    expect(content).toContain('DatePicker')
    expect(content).toContain('RangePicker')
  })

  it('공통 공휴일과 부대(서) 휴무일 탭이 있다', () => {
    const content = readPage('HolidayMgmtPage.tsx')
    expect(content).toContain('공통 공휴일')
    expect(content).toContain('부대(서) 휴무일')
  })

  it('Upload.Dragger 일괄등록이 있다', () => {
    const content = readPage('HolidayMgmtPage.tsx')
    expect(content).toContain('Upload')
  })

  it('부대(서) 탭에 적용 부대 선택이 있다 (D-38)', () => {
    const content = readPage('HolidayMgmtPage.tsx')
    expect(content).toContain("tabType === 'unit'")
  })
})

// ──────────────────────────────────────────────────
// 알림시간관리 (SEC-21, D-39~40)
// ──────────────────────────────────────────────────
describe('SYS15 NotifyTimeMgmtPage: 알림시간 관리', () => {
  it('TimePicker를 사용한다 (D-39)', () => {
    const content = readPage('NotifyTimeMgmtPage.tsx')
    expect(content).toContain('TimePicker')
  })

  it('RangePicker로 알림 시간 범위를 설정한다', () => {
    const content = readPage('NotifyTimeMgmtPage.tsx')
    expect(content).toContain('RangePicker')
  })

  it('최상위(해군/해병대) 행은 삭제 disabled (D-40)', () => {
    const content = readPage('NotifyTimeMgmtPage.tsx')
    expect(content).toContain('disabled')
    expect(content).toContain('isTopLevel')
  })

  it('부대(서)별 알림시간 DataTable이 있다', () => {
    const content = readPage('NotifyTimeMgmtPage.tsx')
    expect(content).toContain('DataTable')
  })
})

// ──────────────────────────────────────────────────
// 이력관리 (SEC-23, D-41)
// ──────────────────────────────────────────────────
describe('SYS15 LogHistoryPage: 이력 관리', () => {
  it('Tabs 컴포넌트를 사용한다 (D-41)', () => {
    const content = readPage('LogHistoryPage.tsx')
    expect(content).toContain('Tabs')
  })

  it('결산실시이력과 종합이력 탭이 있다', () => {
    const content = readPage('LogHistoryPage.tsx')
    expect(content).toContain('결산실시이력')
    expect(content).toContain('종합이력')
  })

  it('SearchForm으로 기간/부대/인원 검색을 제공한다', () => {
    const content = readPage('LogHistoryPage.tsx')
    expect(content).toContain('SearchForm')
    expect(content).toContain('startDate')
    expect(content).toContain('department')
    expect(content).toContain('userName')
  })

  it('DataTable을 사용한다', () => {
    const content = readPage('LogHistoryPage.tsx')
    expect(content).toContain('DataTable')
  })
})

// ──────────────────────────────────────────────────
// 예외처리관리 (SEC-20, D-27~29)
// ──────────────────────────────────────────────────
describe('SYS15 ExceptionMgmtPage: 예외처리 Tree Master-Detail', () => {
  it('Tree 컴포넌트를 사용한다 (D-27)', () => {
    const content = readPage('ExceptionMgmtPage.tsx')
    expect(content).toContain('Tree')
  })

  it('Tabs 컴포넌트로 3종을 구분한다', () => {
    const content = readPage('ExceptionMgmtPage.tsx')
    expect(content).toContain('Tabs')
  })

  it('3개 탭 키(org/single/exception)가 있다', () => {
    const content = readPage('ExceptionMgmtPage.tsx')
    expect(content).toContain("key: 'org'")
    expect(content).toContain("key: 'single'")
    expect(content).toContain("key: 'exception'")
  })

  it('DataTable과 Tree가 Master-Detail로 연동된다', () => {
    const content = readPage('ExceptionMgmtPage.tsx')
    expect(content).toContain('selectedUnit')
    expect(content).toContain('DataTable')
    expect(content).toContain('onSelect')
  })

  it('Tree는 좌측 Card, DataTable은 우측에 배치된다', () => {
    const content = readPage('ExceptionMgmtPage.tsx')
    expect(content).toContain('flex: 1')
    expect(content).toContain('width: 280')
  })
})

// ──────────────────────────────────────────────────
// 개인설정 (SEC-24)
// ──────────────────────────────────────────────────
describe('SYS15 PersonalSettingPage: 개인설정', () => {
  it('Switch 컴포넌트를 사용한다 (알림 on/off)', () => {
    const content = readPage('PersonalSettingPage.tsx')
    expect(content).toContain('Switch')
  })

  it('TimePicker로 알림 시간을 설정한다', () => {
    const content = readPage('PersonalSettingPage.tsx')
    expect(content).toContain('TimePicker')
  })

  it('저장 성공 시 message.success를 호출한다', () => {
    const content = readPage('PersonalSettingPage.tsx')
    expect(content).toContain('message.success')
    expect(content).toContain('설정이 저장되었습니다')
  })

  it('개인결산/사무실결산 알림 항목이 있다', () => {
    const content = readPage('PersonalSettingPage.tsx')
    expect(content).toContain('personalAlarm')
    expect(content).toContain('officeAlarm')
  })
})

// ──────────────────────────────────────────────────
// SYS15 전체 라우터 (index.tsx)
// ──────────────────────────────────────────────────
describe('SYS15 index.tsx: 전체 라우터', () => {
  it('React.lazy import가 25개 이상 있다', () => {
    const content = readPage('index.tsx')
    const lazyMatches = content.match(/React\.lazy/g) ?? []
    expect(lazyMatches.length).toBeGreaterThanOrEqual(25)
  })

  it('공통 게시판 BoardListPage lazy import가 있다 (D-45, 7대 규칙 6번)', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('BoardListPage')
    expect(content).toContain('common/board')
  })

  it('CodeManagementPage lazy import가 있다 (D-46, 7대 규칙 7번)', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('CodeManagementPage')
    expect(content).toContain('code-mgmt')
  })

  it('AuthGroupPage lazy import가 있다 (D-46, 7대 규칙 7번)', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('AuthGroupPage')
    expect(content).toContain('auth-group')
  })

  it('sysCode sys15 게시판 Route가 있다 (7대 규칙 6번)', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('sys15-notice')
    expect(content).toContain('sys15-qna')
  })

  it('Route 30개 이상이 있다', () => {
    const content = readPage('index.tsx')
    const routeMatches = content.match(/<Route/g) ?? []
    expect(routeMatches.length).toBeGreaterThanOrEqual(30)
  })

  it('결산종합현황 4종 Route가 있다 (5/1 ~ 5/4)', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('5/1')
    expect(content).toContain('5/2')
    expect(content).toContain('5/3')
    expect(content).toContain('5/4')
  })

  it('관리자 대메뉴 5종 Route가 있다 (8/1 ~ 8/5)', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('8/1')
    expect(content).toContain('8/2')
    expect(content).toContain('8/3')
    expect(content).toContain('8/4')
    expect(content).toContain('8/5')
  })

  it('시스템 2종 Route가 있다 (9/1 ~ 9/2)', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('9/1')
    expect(content).toContain('9/2')
  })

  it('Suspense fallback이 있다', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('Suspense')
    expect(content).toContain('PageSpinner')
  })
})

// ──────────────────────────────────────────────────
// MSW 핸들러 확인
// ──────────────────────────────────────────────────
describe('SYS15 MSW 핸들러: Wave3 엔드포인트', () => {
  it('/api/sys15/summary/secret GET 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/summary/secret')
  })

  it('/api/sys15/summary/personal GET 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/summary/personal')
  })

  it('/api/sys15/check-items CRUD 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/check-items')
    expect(content).toContain('check-items/:id')
  })

  it('/api/sys15/holidays CRUD 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/holidays')
  })

  it('/api/sys15/notify-time 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/notify-time')
  })

  it('/api/sys15/logs GET 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/logs')
  })

  it('/api/sys15/exceptions CRUD 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/exceptions')
  })

  it('/api/sys15/personal-settings 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/personal-settings')
  })

  it('/api/sys15/regulations/:category 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/regulations')
  })

  it('/api/sys15/org-tree GET 핸들러가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/org-tree')
  })
})
