import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys18-job-desc')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('sys18 MSW 핸들러 (sys18.ts)', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys18.ts'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('sys18Handlers를 export한다', () => {
    expect(content).toContain('sys18Handlers')
  })

  it('직무기술서 API 엔드포인트를 포함한다', () => {
    expect(content).toContain('/api/sys18/job-descs')
  })

  it('조직진단 API 엔드포인트를 포함한다', () => {
    expect(content).toContain('/api/sys18/org-diagnosis')
  })

  it('결재 API 엔드포인트를 포함한다', () => {
    expect(content).toContain('/api/sys18/approvals')
  })

  it('결재자 API 엔드포인트를 포함한다', () => {
    expect(content).toContain('/api/sys18/approvers')
  })

  it('임시저장 API를 포함한다', () => {
    expect(content).toContain('/draft')
  })

  it('결재요청 API를 포함한다', () => {
    expect(content).toContain('/submit')
  })
})

describe('handlers/index.ts에 sys18Handlers 등록', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys18Handlers를 import한다', () => {
    expect(content).toContain('sys18Handlers')
  })

  it('handlers 배열에 sys18Handlers를 포함한다', () => {
    expect(content).toContain('...sys18Handlers')
  })
})

describe('JobDescFormPage', () => {
  const content = readFileSync(resolve(BASE, 'JobDescFormPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(150)
  })

  it('Steps 컴포넌트를 포함한다', () => {
    expect(content).toContain('Steps')
  })

  it('Form.List를 포함한다', () => {
    expect(content).toContain('Form.List')
  })

  it('ratio(비율) 필드를 포함한다', () => {
    expect(content).toContain('ratio')
  })

  it('임시저장 기능을 포함한다', () => {
    expect(content).toContain('임시저장')
  })

  it('결재 요청 기능을 포함한다', () => {
    expect(content).toContain('결재 요청')
  })

  it('current 상태를 포함한다', () => {
    expect(content).toContain('current')
  })

  it('taskType 필드를 포함한다', () => {
    expect(content).toContain('taskType')
  })

  it('taskName 필드를 포함한다', () => {
    expect(content).toContain('taskName')
  })

  it('weeklyHours 필드를 포함한다', () => {
    expect(content).toContain('weeklyHours')
  })

  it('5단계 스텝 항목을 포함한다', () => {
    expect(content).toContain('기본정보')
    expect(content).toContain('업무분류')
    expect(content).toContain('시간배분')
    expect(content).toContain('역량')
    expect(content).toContain('완료')
  })

  it('비율 합계 검증 로직을 포함한다', () => {
    expect(content).toContain('ratioSum')
  })
})

describe('JobDescListPage', () => {
  const content = readFileSync(resolve(BASE, 'JobDescListPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Tabs 컴포넌트를 포함한다', () => {
    expect(content).toContain('Tabs')
  })

  it('personal 탭을 포함한다', () => {
    expect(content).toContain('personal')
  })

  it('department 탭을 포함한다', () => {
    expect(content).toContain('department')
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('인쇄(출력) 기능을 포함한다', () => {
    expect(content).toContain('인쇄')
  })
})

describe('JobDescApprovalPage', () => {
  const content = readFileSync(resolve(BASE, 'JobDescApprovalPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(100)
  })

  it('Steps 컴포넌트를 포함한다', () => {
    expect(content).toContain('Steps')
  })

  it('approve(승인) 기능을 포함한다', () => {
    expect(content).toContain('approve')
  })

  it('reject(반려) 기능을 포함한다', () => {
    expect(content).toContain('reject')
  })

  it('rejectReason(반려사유)을 포함한다', () => {
    expect(content).toContain('rejectReason')
  })

  it('재결재 기능을 포함한다', () => {
    expect(content).toContain('재결재')
  })

  it('firstApprover를 포함한다', () => {
    expect(content).toContain('firstApprover')
  })

  it('secondApprover를 포함한다', () => {
    expect(content).toContain('secondApprover')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })
})

describe('OrgDiagnosisPage', () => {
  const content = readFileSync(resolve(BASE, 'OrgDiagnosisPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(60)
  })

  it('diagnosisPeriod(진단기간)을 포함한다', () => {
    expect(content).toContain('diagnosisPeriod')
  })

  it('targetUsers(대상자)를 포함한다', () => {
    expect(content).toContain('targetUsers')
  })

  it('isBefore(진단기간 비교)를 포함한다', () => {
    expect(content).toContain('isBefore')
  })

  it('DataTable을 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('StatusBadge를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })
})

describe('JobDescAdminPage', () => {
  const content = readFileSync(resolve(BASE, 'JobDescAdminPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(120)
  })

  it('@ant-design/charts에서 Bar, Column, Pie를 import한다', () => {
    expect(content).toContain('@ant-design/charts')
    expect(content).toContain('Bar')
    expect(content).toContain('Column')
    expect(content).toContain('Pie')
  })

  it('검토결과 입력 기능을 포함한다', () => {
    expect(content).toContain('reviewResult')
    expect(content).toContain('검토결과 입력')
  })

  it('의견보내기 기능을 포함한다', () => {
    expect(content).toContain('opinionContent')
    expect(content).toContain('의견 보내기')
  })

  it('반송 기능을 포함한다', () => {
    expect(content).toContain('returnReason')
    expect(content).toContain('반송')
  })

  it('인쇄(출력) 기능을 포함한다', () => {
    expect(content).toContain('인쇄')
    expect(content).toContain('PrintableReport')
  })
})

describe('sys18.ts 관리자/통계/표준업무시간 API', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys18.ts'), 'utf-8')

  it('관리자 직무기술서 목록 API를 포함한다', () => {
    expect(content).toContain('/api/sys18/job-descs/admin')
  })

  it('통계 API를 포함한다', () => {
    expect(content).toContain('/api/sys18/stats')
  })

  it('검토결과 입력 API를 포함한다', () => {
    expect(content).toContain('/review')
  })

  it('의견보내기 API를 포함한다', () => {
    expect(content).toContain('/opinion')
  })

  it('반송 API를 포함한다', () => {
    expect(content).toContain('/return')
  })

  it('표준업무시간 CRUD API를 포함한다', () => {
    expect(content).toContain('/api/sys18/standard-work-hours')
  })
})

describe('StandardWorkTimePage', () => {
  const content = readFileSync(resolve(BASE, 'StandardWorkTimePage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(60)
  })

  it('dayjs를 import하고 isAfter/isBefore를 사용한다', () => {
    expect(content).toContain('dayjs')
    expect(content).toMatch(/isAfter|isBefore/)
  })

  it('rankCategory 필드를 포함한다', () => {
    expect(content).toContain('rankCategory')
  })

  it('standardHours 필드를 포함한다', () => {
    expect(content).toContain('standardHours')
  })

  it('RangePicker를 포함한다', () => {
    expect(content).toContain('RangePicker')
  })

  it('CrudForm을 참조한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('DataTable을 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('StatusBadge로 적용상태를 표시한다', () => {
    expect(content).toContain('StatusBadge')
    expect(content).toContain('적용중')
    expect(content).toContain('적용예정')
    expect(content).toContain('적용만료')
  })
})

describe('index.tsx 라우트 분기', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('/sys18/1/1 라우트를 포함한다', () => {
    expect(content).toContain('1/1')
  })

  it('/sys18/1/2 라우트를 포함한다', () => {
    expect(content).toContain('1/2')
  })

  it('/sys18/1/3 라우트를 포함한다', () => {
    expect(content).toContain('1/3')
  })

  it('/sys18/1/4 라우트를 포함한다', () => {
    expect(content).toContain('1/4')
  })

  it('/sys18/2/1 라우트를 포함한다', () => {
    expect(content).toContain('2/1')
  })

  it('/sys18/2/3 라우트를 포함한다', () => {
    expect(content).toContain('2/3')
  })

  it('공통게시판 lazy import를 포함한다', () => {
    expect(content).toContain('board')
  })

  it('코드관리 lazy import를 포함한다', () => {
    expect(content).toContain('code-mgmt')
  })

  it('권한관리 lazy import를 포함한다', () => {
    expect(content).toContain('auth-group')
  })

  it('/sys18/1/5 라우트에 JobDescAdminPage를 포함한다 (placeholder 아님)', () => {
    expect(content).toContain('1/5')
    expect(content).toContain('JobDescAdminPage')
    expect(content).not.toContain('PlaceholderPage')
  })

  it('/sys18/2/2 라우트에 StandardWorkTimePage를 포함한다 (placeholder 아님)', () => {
    expect(content).toContain('2/2')
    expect(content).toContain('StandardWorkTimePage')
  })

  it('BoardListPage를 lazy import한다', () => {
    expect(content).toContain('BoardListPage')
  })

  it('code-mgmt를 lazy import한다', () => {
    expect(content).toContain('code-mgmt')
  })

  it('AuthGroupPage를 lazy import한다', () => {
    expect(content).toContain('auth-group')
  })
})
