---
phase: 05-b-3
plan: 03
subsystem: SYS10 주말버스예약관리체계 (나머지)
tags: [sys10, weekend-bus, waitlist, violator, external-auth]
completed: 2026-04-06
duration: 7min
tasks_completed: 2
files_created: 5
files_modified: 3
requires: [05-02]
provides: [BusWaitlistPage, BusViolatorPage, ExternalLoginPage, ExternalRegisterPage, ExternalUserPage]
affects: [router.tsx, index.tsx, sys10.ts, weekend-bus.test.ts]
tech_stack_added: []
tech_stack_patterns: [DatePicker.RangePicker 제재기간, dayjs 제재상태 자동계산, RequireAuth 바깥 외부 로그인 경로]
key_files_created:
  - navy-admin/src/pages/sys10-weekend-bus/BusWaitlistPage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/BusViolatorPage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/ExternalLoginPage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/ExternalRegisterPage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/ExternalUserPage.tsx
key_files_modified:
  - navy-admin/src/pages/sys10-weekend-bus/index.tsx
  - navy-admin/src/app/router.tsx
  - navy-admin/src/shared/api/mocks/handlers/sys10.ts
key_decisions:
  - PrintableReport를 sys09-memorial에서 직접 import — shared/ui에 없어 교차 import(Rule 1 auto-fix)
  - ExternalLoginPage/ExternalRegisterPage는 RequireAuth 바깥 두 경로로 분리 — /sys10/login + /sys10/login/register
  - 타군 사용자 Mock 8건 핸들러 내 인라인 생성 — 파일 최상단 모듈 레벨 배열과 클로저 혼용 패턴
requirements: [BUS-05, BUS-07, BUS-08]
---

# Phase 5 Plan 03: SYS10 주말버스예약관리체계 나머지 기능 Summary

대기자 자동/수동배정 + 위규자 CRUD + 타군 전용 로그인/회원등록/사용자관리 5개 페이지 구현. SYS10 44개 프로세스(BUS-01~09) 전체 완성.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | 대기자관리 + 위규자관리 + MSW 확장 | dee412e | BusWaitlistPage.tsx, BusViolatorPage.tsx, sys10.ts, index.tsx, weekend-bus.test.ts |
| 2 | 타군 로그인 + 회원등록 + 사용자관리 + router 경로 | 5830fb4 | ExternalLoginPage.tsx, ExternalRegisterPage.tsx, ExternalUserPage.tsx, router.tsx, index.tsx, sys10.ts |

## What Was Built

### BusWaitlistPage (BUS-05)
- DataTable: waitingNo/operationDate/route/userName/rank/unit/waitingDate/assignedSeat/status
- StatusBadge: waiting(대기중/gold), assigned(배정완료/green), cancelled(취소됨/default)
- 자동 배정 버튼: POST /api/sys10/waitlist/auto-assign, FIFO 배정 결과 메시지
- 수동 배정 Modal: 빈좌석 Select(available-seats API), POST manual-assign

### BusViolatorPage (BUS-07)
- DataTable CRUD: militaryId/userName/rank/unit/violationType/sanctionStart/sanctionEnd/sanctionStatus
- 제재상태 자동계산: dayjs로 today 비교 → sanctioned(제재중/red)/sanction_expired(제재만료/default)
- DatePicker.RangePicker로 sanctionPeriod 입력/수정
- 인쇄 미리보기 Modal (규칙 4): PrintableReport + 위규자 표 렌더링

### ExternalLoginPage (BUS-08)
- /sys10/login — RequireAuth 바깥 독립 경로
- 카드 레이아웃 400px, 주말버스 예약 시스템 + 타군 사용자 로그인 제목
- militaryId + password Form, 회원등록 신청 버튼
- 패스워드 초기화 Modal: militaryId + email 입력 → message.success

### ExternalRegisterPage (BUS-08)
- /sys10/login/register 경로
- militaryBranch(육/공/해/해병), unitName, militaryId, rank, name, position, phone(010-XXXX-XXXX 패턴), email, password, passwordConfirm(일치 검증)
- 등록 신청 성공 시 /sys10/login으로 이동

### ExternalUserPage (BUS-08 관리자)
- DataTable: militaryBranch/unitName/militaryId/rank/name/position/phone/email/status/registeredAt
- StatusBadge: pending(신청대기/gold), approved(승인/green), rejected(반려/red)
- 승인/반려 행 액션 (status=pending 시만), 반려 시 rejectReason TextArea Modal
- 패스워드 초기화 (선택 행 활성화)

### MSW 확장 (sys10.ts)
- 대기자 API 4개: GET/POST waitlist, available-seats, manual-assign
- 위규자 API 4개: GET/POST/PUT/DELETE violators
- 타군 API 6개: external-auth/login, external-users(register/list/approve/reject/reset-password)

## Test Results

- 총 67개 테스트 통과 (기존 36개 + Task 1 14개 신규 + Task 2 17개 신규)
- `npx tsc --noEmit`: 에러 없음

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] PrintableReport import 경로 수정**
- **Found during:** Task 1 (BusViolatorPage 작성 시)
- **Issue:** Plan에서 `@/shared/ui/PrintableReport` import를 가정했으나 PrintableReport는 `src/pages/sys09-memorial/`에만 존재
- **Fix:** import 경로를 `@/pages/sys09-memorial/PrintableReport`로 수정
- **Files modified:** BusViolatorPage.tsx
- **Commit:** dee412e

## Known Stubs

- ExternalLoginPage: 로그인 성공 시 sessionStorage 등 토큰 저장 없음 — 실 API 전환 시 처리 필요
- ExternalUserPage: `신규 등록` 버튼이 info 메시지만 표시 — MVP 범위에서 register 경로 안내로 대체

## Self-Check: PASSED

- BusWaitlistPage.tsx: FOUND (dee412e)
- BusViolatorPage.tsx: FOUND (dee412e)
- ExternalLoginPage.tsx: FOUND (5830fb4)
- ExternalRegisterPage.tsx: FOUND (5830fb4)
- ExternalUserPage.tsx: FOUND (5830fb4)
- commit dee412e: FOUND
- commit 5830fb4: FOUND
- 테스트 67개 통과 확인됨

---

## GAP 수정 반영 (2026-04-07)

SYS10 주말버스예약관리체계 후속 기능(대기자/위규자/외부사용자)에 동일한 6대 규칙 소급 적용. militaryPersonColumn, SearchForm, navy-bordered-table CSS 통일 적용.
