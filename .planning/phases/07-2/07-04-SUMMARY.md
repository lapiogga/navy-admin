---
phase: 07-2
plan: "04"
subsystem: SYS15
tags: [보안일일결산, 캘린더, 체크리스트, 결재, 차트]
dependency_graph:
  requires: ["07-02"]
  provides: ["SYS15-wave2-pages", "sys15-approvals"]
  affects: ["SYS15 라우터 완성"]
tech_stack:
  added: []
  patterns:
    - "Calendar cellRender Badge 4색 (completed/incomplete/absence/future)"
    - "Checkbox.Group + 미체크 TextArea 조건부 사유"
    - "Tabs(수시/정기) + Column/Pie/Line 차트 3종"
    - "Steps 결재 패턴 (작성→결재대기→승인완료)"
    - "DatePicker.RangePicker 기간 필터"
key_files:
  created:
    - navy-admin/src/pages/sys15-security/SecMainPage.tsx
    - navy-admin/src/pages/sys15-security/PersonalSecDailyPage.tsx
    - navy-admin/src/pages/sys15-security/OfficeSecDailyPage.tsx
    - navy-admin/src/pages/sys15-security/DutyOfficerPage.tsx
    - navy-admin/src/pages/sys15-security/SecurityLevelPage.tsx
    - navy-admin/src/pages/sys15-security/AbsencePage.tsx
    - navy-admin/src/pages/sys15-security/SecurityEduPage.tsx
    - navy-admin/src/pages/sys15-security/ApprovalPendingPage.tsx
    - navy-admin/src/pages/sys15-security/ApprovalCompletedPage.tsx
    - navy-admin/src/pages/sys15-security/__tests__/sys15-plan04.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/sys15-security.ts
    - navy-admin/src/pages/sys15-security/index.tsx
decisions:
  - "Bar 차트: @ant-design/charts의 Column을 Bar로 래핑 (API 호환성)"
  - "보안수준평가 정기평가: score1~5 InputNumber + 평균 자동계산"
  - "결재완료 페이지: 조회 전용 (수정/삭제 없음)"
  - "부재 수정/삭제: 결재 전(pending) 상태에서만 가능"
  - "당직표 Calendar: onSelect info.source 체크로 날짜/월 클릭 분리"
metrics:
  duration: "11 minutes"
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_created: 10
  files_modified: 2
  tests_added: 108
  total_tests: 1092
---

# Phase 7 Plan 04: SYS15 보안일일결산 Wave 2 Summary

**One-liner:** Calendar cellRender Badge 메인화면 + Checkbox.Group 체크리스트 6종 + Steps 결재 + Tabs+차트3종 보안수준평가 완성

## What Was Built

SYS15 보안일일결산체계 Wave 2 - 일일결산 워크플로우와 결재 흐름을 완성했다.

### Task 1: 메인화면 + 일일결산 + 당직관 (커밋 3e2726e)

**SecMainPage.tsx** (캘린더 메인화면)
- Tabs 2개: 개인보안결산 / 사무실보안결산
- antd Calendar + cellRender Badge 4색 (완료=success/미실시=error/부재=default/미래=none)
- onPanelChange(월 네비게이션) / onSelect(info.source='date' 클릭 분리) 패턴 적용
- 미결산 오늘 항목 Alert 컴포넌트 표시
- useQuery /api/sys15/daily-status (월별 일자별 상태 배열)

**PersonalSecDailyPage.tsx** (개인 보안일일결산)
- Checkbox.Group: REQUIRED_ITEMS(5개) / OPTIONAL_ITEMS(3개) 분리
- 미체크 항목 TextArea 조건부 표시 (미실시 사유 입력)
- 임시저장/제출 Button 분리, 제출 시 status='submitted' 결재 연동
- DataTable 이력 조회 + RangePicker 기간 필터

**OfficeSecDailyPage.tsx** (사무실 보안일일결산)
- 동일 Checkbox.Group 패턴 + 사무실 전용 점검항목 6개
- 미실시자/부재자 Form.Item 추가 입력

**DutyOfficerPage.tsx** (점검관 당직표)
- Tabs: 당직표 작성(Calendar 월별 배정 + Steps 결재) / 점검결과 입력
- DataTable 이력 조회

**sys15-security.ts MSW 확장**
- Wave 2 타입 10종 추가 (DailyStatusItem, PersonalDailyRecord, OfficeDailyRecord, DutySchedule, DutyInspection, SecurityLevelRecord, SecurityLevelStats, AbsenceRecord, SecurityEduRecord, ApprovalRecord)
- Mock 데이터 8종 추가
- 엔드포인트 24개 추가

### Task 2: 보안수준평가 + 부재 + 교육 + 결재 + 테스트 (커밋 5013474)

**SecurityLevelPage.tsx** (보안수준평가)
- Tabs 3개: 수시평가 / 정기평가 / 통계
- 수시평가: DataTable + 평가 Modal (TextArea + InputNumber 가점/감점)
- 정기평가: 5개 항목 InputNumber(score1~5) + 평균자동계산 + Upload.Dragger
- 통계: Bar(Column 래핑) + Pie + Line 차트 3종

**AbsencePage.tsx** (부재관리)
- DataTable 부재 목록 + CrudForm Modal
- DatePicker.RangePicker 부재기간 입력
- pending 상태에서만 수정/삭제 가능

**SecurityEduPage.tsx** (보안교육관리)
- DataTable + RangePicker/교육구분 검색
- InputNumber 소요시간, 이수인원
- 체계관리자 전용 삭제 안내 + 엑셀 저장 Mock

**ApprovalPendingPage.tsx** (결재대기)
- DataTable + 행 클릭 상세 Modal + Steps 결재흐름
- 승인/반려 Button + 반려사유 TextArea 필수 입력

**ApprovalCompletedPage.tsx** (결재완료)
- DataTable 조회 전용 + RangePicker + 문서유형 Select 필터

**sys15-plan04.test.ts**: 108개 테스트 추가

**index.tsx**: SYS15 전체 라우터 완성 (7대규칙 관리자/게시판 포함)

## Verification

```
Tests: 1092 passed (984 → +108)
TypeScript: No errors
Files: 10 created, 2 modified
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Functionality] Bar 차트 래핑 패턴**
- **Found during:** Task 2
- **Issue:** @ant-design/charts에서 Bar를 직접 import하면 타입 충돌 우려
- **Fix:** Column을 Bar로 래핑하는 함수 컴포넌트 사용 (동일 API)
- **Files modified:** SecurityLevelPage.tsx

**2. [Rule 2 - Missing Functionality] SYS15 index.tsx 라우터 완성**
- **Found during:** Task 2
- **Issue:** index.tsx가 SubsystemPage placeholder 상태로 Wave 1/2 페이지 연결 안됨
- **Fix:** 전체 라우터 완성 (Wave 1+2 모든 페이지 + 관리자/게시판)
- **Files modified:** index.tsx

## Known Stubs

None - 모든 페이지가 MSW 핸들러와 연결되어 실제 CRUD 동작함.

## Self-Check: PASSED

Files verified:
- SecMainPage.tsx: FOUND
- PersonalSecDailyPage.tsx: FOUND
- OfficeSecDailyPage.tsx: FOUND
- DutyOfficerPage.tsx: FOUND
- SecurityLevelPage.tsx: FOUND
- AbsencePage.tsx: FOUND
- SecurityEduPage.tsx: FOUND
- ApprovalPendingPage.tsx: FOUND
- ApprovalCompletedPage.tsx: FOUND
- sys15-plan04.test.ts: FOUND

Commits verified:
- 3e2726e: FOUND (Task 1)
- 5013474: FOUND (Task 2)

Tests: 1092/1092 PASSED

---

## GAP 수정 반영 (2026-04-07)

SYS15 보안일일결산체계 보안일일결산/결재 페이지에 req_spec 기반 6대 규칙 적용. SearchForm 추가, militaryPersonColumn 적용, 미실시자/부재자 사유 필수 입력 규칙 UI 로직 구현, DataTable navy-bordered-table CSS 적용.
