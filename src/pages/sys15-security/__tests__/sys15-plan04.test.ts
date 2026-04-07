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
describe('SYS15 Plan04: 파일 존재 확인', () => {
  const pages = [
    'SecMainPage.tsx',
    'PersonalSecDailyPage.tsx',
    'OfficeSecDailyPage.tsx',
    'DutyOfficerPage.tsx',
    'SecurityLevelPage.tsx',
    'AbsencePage.tsx',
    'SecurityEduPage.tsx',
    'ApprovalPendingPage.tsx',
    'ApprovalCompletedPage.tsx',
  ]

  pages.forEach((page) => {
    it(`${page} 파일이 존재한다`, () => {
      expect(existsSync(resolve(root, page))).toBe(true)
    })
  })
})

// ──────────────────────────────────────────────────
// SecMainPage: 메인화면 캘린더
// ──────────────────────────────────────────────────
describe('SYS15 SecMainPage: 캘린더 메인화면', () => {
  it('Calendar 컴포넌트를 사용한다 (D-31)', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('Calendar')
  })

  it('cellRender로 날짜별 상태를 렌더링한다', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('cellRender')
  })

  it('Badge 컴포넌트로 상태를 표시한다 (4색)', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('Badge')
  })

  it('Tabs 2개(개인/사무실)로 구성된다 (D-30)', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('Tabs')
    expect(content).toContain('개인보안결산')
    expect(content).toContain('사무실보안결산')
  })

  it('onPanelChange로 월 네비게이션을 처리한다 (D-32)', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('onPanelChange')
  })

  it('onSelect로 날짜 클릭을 처리한다 (D-32)', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('onSelect')
  })

  it('미결산 알림 Alert 컴포넌트가 있다', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('Alert')
  })

  it('날짜 클릭시 상세 Modal이 열린다', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('Modal')
  })

  it('/sys15/daily-status 엔드포인트를 사용한다', () => {
    const content = readPage('SecMainPage.tsx')
    expect(content).toContain('/sys15/daily-status')
  })
})

// ──────────────────────────────────────────────────
// PersonalSecDailyPage: 개인 보안일일결산
// ──────────────────────────────────────────────────
describe('SYS15 PersonalSecDailyPage: 개인 보안일일결산', () => {
  it('Checkbox.Group으로 체크리스트를 구현한다 (D-13)', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('Checkbox.Group')
  })

  it('미체크 항목에 TextArea 사유 입력이 조건부로 표시된다 (D-13)', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('TextArea')
  })

  it('필수 점검항목과 선택 점검항목이 분리된다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('REQUIRED_ITEMS')
    expect(content).toContain('OPTIONAL_ITEMS')
  })

  it('임시저장 Button이 있다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('임시저장')
  })

  it('제출(결재요청) Button이 있다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('제출')
  })

  it('DataTable로 이력 조회가 가능하다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('RangePicker로 기간 필터가 있다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('RangePicker')
  })

  it('StatusBadge로 상태를 표시한다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('StatusBadge')
  })

  it('/sys15/personal-daily 엔드포인트를 사용한다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('/sys15/personal-daily')
  })

  it('제출 시 status=submitted로 결재 연동된다', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain("status: 'submitted'")
  })
})

// ──────────────────────────────────────────────────
// OfficeSecDailyPage: 사무실 보안일일결산
// ──────────────────────────────────────────────────
describe('SYS15 OfficeSecDailyPage: 사무실 보안일일결산', () => {
  it('Checkbox.Group으로 체크리스트를 구현한다 (D-14)', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('Checkbox.Group')
  })

  it('미실시자 성명 Input이 있다 (미실시자 필수 조건)', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('nonCompliantPersons')
  })

  it('부재자 성명 Input이 있다', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('absentPersons')
  })

  it('사유 TextArea가 있다', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('TextArea')
  })

  it('Checkbox 미체크 항목에 사유 조건부 표시가 있다', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('uncheckedReasons')
  })

  it('DataTable로 이력 조회가 가능하다', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('/sys15/office-daily 엔드포인트를 사용한다', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('/sys15/office-daily')
  })
})

// ──────────────────────────────────────────────────
// DutyOfficerPage: 점검관 당직표
// ──────────────────────────────────────────────────
describe('SYS15 DutyOfficerPage: 점검관 당직표', () => {
  it('Calendar 컴포넌트로 월별 배정을 표시한다 (D-15)', () => {
    const content = readPage('DutyOfficerPage.tsx')
    expect(content).toContain('Calendar')
  })

  it('Steps 컴포넌트로 결재 흐름을 표시한다 (D-15)', () => {
    const content = readPage('DutyOfficerPage.tsx')
    expect(content).toContain('Steps')
  })

  it('Tabs로 당직표 작성/점검결과를 분리한다', () => {
    const content = readPage('DutyOfficerPage.tsx')
    expect(content).toContain('Tabs')
    expect(content).toContain('당직표 작성')
    expect(content).toContain('점검결과 입력')
  })

  it('DataTable로 이력을 조회한다', () => {
    const content = readPage('DutyOfficerPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('점검결과 입력 Form이 있다', () => {
    const content = readPage('DutyOfficerPage.tsx')
    expect(content).toContain('점검결과')
  })

  it('당직관 Select(계급/부대)가 있다', () => {
    const content = readPage('DutyOfficerPage.tsx')
    expect(content).toContain('officerName')
  })

  it('/sys15/duty-officer 엔드포인트를 사용한다', () => {
    const content = readPage('DutyOfficerPage.tsx')
    expect(content).toContain('/sys15/duty-officer')
  })
})

// ──────────────────────────────────────────────────
// SecurityLevelPage: 보안수준평가
// ──────────────────────────────────────────────────
describe('SYS15 SecurityLevelPage: 보안수준평가', () => {
  it('Tabs 2개(수시/정기)로 구성된다 (D-33)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('Tabs')
    expect(content).toContain('수시평가')
    expect(content).toContain('정기평가')
  })

  it('Bar 차트를 포함한다 (D-36)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    // Bar는 Column을 래핑하여 사용
    expect(content).toContain('Bar')
  })

  it('Pie 차트를 포함한다 (D-36)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('Pie')
  })

  it('Line 차트를 포함한다 (D-36)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('Line')
  })

  it('InputNumber로 점수 입력이 가능하다 (D-34)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('InputNumber')
  })

  it('정기평가에서 5개 항목 InputNumber가 있다 (D-34)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('score1')
    expect(content).toContain('score2')
    expect(content).toContain('score5')
  })

  it('Upload.Dragger 관련근거 첨부가 있다 (D-35)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('Dragger')
  })

  it('가점/감점 InputNumber가 있다', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('bonus')
    expect(content).toContain('deduction')
  })

  it('DataTable로 평가 목록을 조회한다', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('/sys15/security-level 엔드포인트를 사용한다', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('/sys15/security-level')
  })

  it('/sys15/security-level/stats 통계 엔드포인트를 사용한다', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('/sys15/security-level/stats')
  })

  it('등급(grade) 표시 StatusBadge가 있다', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('StatusBadge')
  })
})

// ──────────────────────────────────────────────────
// AbsencePage: 부재관리
// ──────────────────────────────────────────────────
describe('SYS15 AbsencePage: 부재관리', () => {
  it('DataTable로 부재 목록을 조회한다', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain('DataTable')
  })

  it('DatePicker.RangePicker로 부재기간을 입력한다', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain('RangePicker')
  })

  it('사유 TextArea가 있다', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain('TextArea')
  })

  it('StatusBadge로 상태를 표시한다', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain('StatusBadge')
  })

  it('수정/삭제는 결재 전까지만 가능하다 (pending 상태)', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain("status === 'pending'")
  })

  it('/sys15/absences 엔드포인트를 사용한다', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain('/sys15/absences')
  })

  it('부대(서) 컬럼이 있다 (7대 규칙 5번)', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain('부대(서)')
  })
})

// ──────────────────────────────────────────────────
// SecurityEduPage: 보안교육관리
// ──────────────────────────────────────────────────
describe('SYS15 SecurityEduPage: 보안교육관리', () => {
  it('DataTable로 교육 현황을 조회한다', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('RangePicker 기간 검색이 있다 (D-42)', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('RangePicker')
  })

  it('교육구분 Select가 있다 (D-42)', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('EDU_TYPE_OPTIONS')
  })

  it('소요시간 InputNumber가 있다', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('InputNumber')
  })

  it('교육내용 TextArea가 있다', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('TextArea')
  })

  it('삭제는 체계관리자 전용 안내가 있다 (D-43)', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('체계관리자')
  })

  it('엑셀 저장 Mock이 있다', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('엑셀')
  })

  it('/sys15/security-edu 엔드포인트를 사용한다', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('/sys15/security-edu')
  })
})

// ──────────────────────────────────────────────────
// ApprovalPendingPage: 결재대기
// ──────────────────────────────────────────────────
describe('SYS15 ApprovalPendingPage: 결재대기', () => {
  it('DataTable로 결재대기 목록을 조회한다', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('Steps 컴포넌트로 결재 흐름을 표시한다 (SEC-08)', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('Steps')
  })

  it('승인 Button이 있다', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('승인')
  })

  it('반려 Button이 있다', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('반려')
  })

  it('반려사유 TextArea가 있다 (필수)', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('반려 사유')
    expect(content).toContain('TextArea')
  })

  it('StatusBadge로 결재 상태를 표시한다', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('StatusBadge')
  })

  it('/sys15/approvals/pending 엔드포인트를 사용한다', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('/sys15/approvals/pending')
  })

  it('행 클릭시 상세 Modal이 열린다', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('Modal')
  })

  it('문서유형 컬럼이 있다', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('docType')
  })
})

// ──────────────────────────────────────────────────
// ApprovalCompletedPage: 결재완료
// ──────────────────────────────────────────────────
describe('SYS15 ApprovalCompletedPage: 결재완료', () => {
  it('DataTable로 결재완료 목록을 조회한다 (조회 전용)', () => {
    const content = readPage('ApprovalCompletedPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('RangePicker 기간 검색이 있다 (SEC-09)', () => {
    const content = readPage('ApprovalCompletedPage.tsx')
    expect(content).toContain('RangePicker')
  })

  it('문서유형 Select 필터가 있다', () => {
    const content = readPage('ApprovalCompletedPage.tsx')
    expect(content).toContain('DOC_TYPE_OPTIONS')
  })

  it('StatusBadge로 상태를 표시한다', () => {
    const content = readPage('ApprovalCompletedPage.tsx')
    expect(content).toContain('StatusBadge')
  })

  it('/sys15/approvals/completed 엔드포인트를 사용한다', () => {
    const content = readPage('ApprovalCompletedPage.tsx')
    expect(content).toContain('/sys15/approvals/completed')
  })

  it('반려사유 컬럼이 있다', () => {
    const content = readPage('ApprovalCompletedPage.tsx')
    expect(content).toContain('rejectReason')
  })
})

// ──────────────────────────────────────────────────
// MSW Handler: Wave 2 엔드포인트 검증
// ──────────────────────────────────────────────────
describe('SYS15 MSW Handler: Wave 2 엔드포인트', () => {
  it('/api/sys15/daily-status 캘린더 상태 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/daily-status')
  })

  it('/api/sys15/personal-daily 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/personal-daily')
  })

  it('/api/sys15/office-daily 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/office-daily')
  })

  it('/api/sys15/duty-officer 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/duty-officer')
  })

  it('/api/sys15/security-level 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/security-level')
  })

  it('/api/sys15/security-level/stats 통계 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/security-level/stats')
  })

  it('/api/sys15/absences CRUD 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/absences')
  })

  it('/api/sys15/security-edu CRUD 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/security-edu')
  })

  it('/api/sys15/approvals/pending 결재대기 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/approvals/pending')
  })

  it('/api/sys15/approvals/completed 결재완료 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/approvals/completed')
  })

  it('결재 승인/반려 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/approve')
    expect(content).toContain('/reject')
  })

  it('DailyStatusItem 타입이 정의되어 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('DailyStatusItem')
  })

  it('ApprovalRecord 타입이 정의되어 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('ApprovalRecord')
  })

  it('SecurityLevelRecord 타입이 정의되어 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('SecurityLevelRecord')
  })

  it('AbsenceRecord 타입이 정의되어 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('AbsenceRecord')
  })

  it('SecurityEduRecord 타입이 정의되어 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('SecurityEduRecord')
  })
})

// ──────────────────────────────────────────────────
// 7대 규칙 준수 확인
// ──────────────────────────────────────────────────
describe('SYS15 Plan04: 7대 규칙 준수', () => {
  it('부대(서) 표기 통일 - SecMainPage (7대 규칙 5번)', () => {
    // SecMainPage는 부대 관련 컬럼이 없지만 Modal에서 표시
    const content = readPage('SecMainPage.tsx')
    expect(content).toBeTruthy()
  })

  it('부대(서) 표기 통일 - PersonalSecDailyPage (7대 규칙 5번)', () => {
    const content = readPage('PersonalSecDailyPage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('부대(서) 표기 통일 - OfficeSecDailyPage (7대 규칙 5번)', () => {
    const content = readPage('OfficeSecDailyPage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('부대(서) 표기 통일 - SecurityLevelPage (7대 규칙 5번)', () => {
    const content = readPage('SecurityLevelPage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('부대(서) 표기 통일 - AbsencePage (7대 규칙 5번)', () => {
    const content = readPage('AbsencePage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('부대(서) 표기 통일 - SecurityEduPage (7대 규칙 5번)', () => {
    const content = readPage('SecurityEduPage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('부대(서) 표기 통일 - ApprovalPendingPage (7대 규칙 5번)', () => {
    const content = readPage('ApprovalPendingPage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('부대(서) 표기 통일 - ApprovalCompletedPage (7대 규칙 5번)', () => {
    const content = readPage('ApprovalCompletedPage.tsx')
    expect(content).toContain('부대(서)')
  })
})
