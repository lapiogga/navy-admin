---
phase: 05-b-3
verified: 2026-04-06T16:37:48Z
status: gaps_found
score: 2/3 must-haves verified
re_verification: false
gaps:
  - truth: "주말버스예약관리체계에서 사용자가 노선을 조회하고 좌석을 선택하여 예약하면, 관리자가 배차를 관리하고 대기자 자동배정을 실행할 수 있다"
    status: partial
    reason: "SYS10 5개 파일에서 잘못된 import 경로(@/shared/api/apiClient -> @/shared/api/client)로 인해 빌드 실패. 기능은 모두 구현되었으나 프로덕션 빌드 불가."
    artifacts:
      - path: "src/pages/sys10-weekend-bus/ExternalLoginPage.tsx"
        issue: "import { apiClient } from '@/shared/api/apiClient' -- 올바른 경로: '@/shared/api/client'"
      - path: "src/pages/sys10-weekend-bus/ExternalRegisterPage.tsx"
        issue: "동일한 잘못된 import 경로"
      - path: "src/pages/sys10-weekend-bus/ExternalUserPage.tsx"
        issue: "동일한 잘못된 import 경로"
      - path: "src/pages/sys10-weekend-bus/BusWaitlistPage.tsx"
        issue: "동일한 잘못된 import 경로"
      - path: "src/pages/sys10-weekend-bus/BusViolatorPage.tsx"
        issue: "동일한 잘못된 import 경로"
    missing:
      - "5개 파일에서 '@/shared/api/apiClient'를 '@/shared/api/client'로 수정"
  - truth: "7대 규칙 5번 -- 부대(서) 표기 통일"
    status: partial
    reason: "SYS07 MilDataUsagePage에서 '부대'로만 표기, '부대(서)' 미사용"
    artifacts:
      - path: "src/pages/sys07-mil-data/MilDataUsagePage.tsx"
        issue: "line 162: title '부대' -> '부대(서)', line 300: label '부대' -> '부대(서)'"
    missing:
      - "MilDataUsagePage.tsx의 부대 라벨 2곳을 '부대(서)'로 변경"
human_verification:
  - test: "좌석 선택 UI가 시각적으로 올바르게 표시되는지"
    expected: "4열 배치(2+통로+2), 상태별 색상 구분, 범례 표시"
    why_human: "시각적 레이아웃은 코드만으로 완전 검증 불가"
  - test: "직무기술서 5단계 위자드가 순차적으로 동작하는지"
    expected: "기본정보 -> 업무분류/비율 -> 시간배분 -> 역량/자격요건 -> 완료/제출 순서"
    why_human: "다단계 폼 인터랙션은 런타임 테스트 필요"
  - test: "군사자료 통계 차트(Column, Pie, Line, Bar)가 정상 렌더링되는지"
    expected: "4종 차트가 데이터와 함께 표시"
    why_human: "차트 라이브러리 렌더링은 브라우저에서만 확인 가능"
---

# Phase 5: 중복잡도 서브시스템 B 검증 보고서

**Phase Goal:** 3개 중복잡도 서브시스템 B(131개 프로세스)가 보안등급 분류, 좌석 선택 UI, 계층 구조 직무기술서 결재를 포함하여 완전 동작한다
**Verified:** 2026-04-06T16:37:48Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 군사자료관리체계에서 자료를 보안등급별로 분류하여 등록하고, 열람신청 -> 대출 -> 반납 플로우가 동작하며, 다양한 각도의 통계 현황을 차트로 확인할 수 있다 | VERIFIED | MilDataListPage(379L) 보안등급 Tag/SearchForm, MilDataUsagePage(347L) Steps 워크플로우(신청->승인->대출->반납), MilDataStatsPage(306L) Column/Pie/Line/Bar 4종 차트, MilDataEvalPage(198L) 평가심의, HaegidanListPage(205L) 해기단자료 |
| 2 | 주말버스예약관리체계에서 사용자가 노선을 조회하고 좌석을 선택하여 예약하면, 관리자가 배차를 관리하고 대기자 자동배정을 실행할 수 있다 | PARTIAL | 기능 구현 완료: BusReservationPage(222L) 노선+좌석 선택, SeatGrid(168L) 4열 좌석 UI, BusDispatchPage(262L) 배차, BusWaitlistPage(183L) 대기자 자동배정. **그러나** 5개 파일에서 잘못된 import 경로로 빌드 실패 |
| 3 | 직무기술서관리체계에서 사용자가 직무기술서를 작성(업무분류, 시간배분, 역량입력 포함)하고 결재를 요청하면, 결재선에 따른 승인/반려가 동작한다 | VERIFIED | JobDescFormPage(427L) 5단계 위자드(기본정보/업무분류비율/시간배분/역량자격/완료제출), JobDescApprovalPage(426L) 결재대기/결재이력/결재선관리 3탭, Steps 워크플로우, JobDescAdminPage(538L) 관리자 조회/검토/의견/반송 |

**Score:** 2/3 truths fully verified (1 partial due to build error)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/sys07-mil-data/` (9 files) | SYS07 군사자료관리 전체 화면 | VERIFIED | 1,932 lines, MilDataListPage/FormPage/DetailPage/EvalPage/StatsPage/UsagePage + HaegidanListPage/FormPage + index.tsx |
| `src/pages/sys10-weekend-bus/` (13 files) | SYS10 주말버스 전체 화면 | PARTIAL | 2,381 lines, 기능 완전 구현. 5개 파일 import 경로 오류로 빌드 실패 |
| `src/pages/sys18-job-desc/` (7 files) | SYS18 직무기술서 전체 화면 | VERIFIED | 2,312 lines, JobDescListPage/FormPage/ApprovalPage/AdminPage/OrgDiagnosisPage/StandardWorkTimePage + index.tsx |
| `src/shared/api/mocks/handlers/sys07.ts` | SYS07 MSW 핸들러 | VERIFIED | 551 lines, documents CRUD + usages + stats + haegidan + evaluations |
| `src/shared/api/mocks/handlers/sys10.ts` | SYS10 MSW 핸들러 | VERIFIED | 382 lines, routes + seats + reservations + dispatches + waitlist + violators + external |
| `src/shared/api/mocks/handlers/sys18.ts` | SYS18 MSW 핸들러 | VERIFIED | 552 lines, job-descs + org-diagnosis + approvals + approvers + standard-hours |
| `src/entities/subsystem/menus.ts` | 메뉴 등록 | VERIFIED | sys07(6 menus), sys10(11 menus), sys18(8 menus) 모두 등록 |
| `src/entities/subsystem/config.ts` | 서브시스템 설정 | VERIFIED | sys07/sys10/sys18 config 등록 |
| `src/app/router.tsx` | 라우트 매핑 | VERIFIED | Sys07Page/Sys10Page/Sys18Page lazy import + 라우트 등록 |
| `src/__tests__/sys07/military-data.test.ts` | SYS07 테스트 | VERIFIED | 30 tests, MSW + 페이지 컴포넌트 + 라우트 검증 |
| `src/__tests__/sys10/weekend-bus.test.ts` | SYS10 테스트 | VERIFIED | 36 tests |
| `src/__tests__/sys18/job-desc.test.ts` | SYS18 테스트 | VERIFIED | 53 tests |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| MilDataListPage | MSW /api/sys07/documents | TanStack Query + apiClient | WIRED | fetchDocuments -> apiClient.get -> MSW handler |
| MilDataUsagePage | MSW /api/sys07/usages | useMutation + fetch | WIRED | approve/reject/loan/return mutations |
| MilDataStatsPage | MSW /api/sys07/stats/* | useQuery + fetch | WIRED | 4개 통계 API (doctype, security, usage-trend, cross-tab) |
| BusReservationPage | MSW /api/sys10/routes | useQuery + apiClient | WIRED | 노선조회 -> 좌석조회 -> 예약신청 full flow |
| SeatGrid | BusReservationPage | props (seats, onSeatClick) | WIRED | 좌석 클릭 -> selected 토글 -> 예약에 반영 |
| BusDispatchPage | MSW /api/sys10/dispatches | apiClient | WIRED | 배차 CRUD + 자동배정 |
| BusWaitlistPage | MSW /api/sys10/waitlist | apiClient | PARTIAL | 잘못된 import 경로로 빌드 실패 |
| JobDescFormPage | MSW /api/sys18/job-descs | useMutation + apiClient | WIRED | draft/submit mutations |
| JobDescApprovalPage | MSW /api/sys18/approvals | apiClient | WIRED | 결재대기 목록 + 승인/반려 처리 |
| OrgDiagnosisPage | MSW /api/sys18/org-diagnosis | apiClient | WIRED | 조직진단 CRUD |
| index.tsx (sys07) | CodeMgmtIndex / AuthGroupIndex | lazy import | WIRED | 관리자 대메뉴 (규칙 7) |
| index.tsx (sys10) | CodeGroupPage / PermissionGroupPage | lazy import | WIRED | 관리자 대메뉴 (규칙 7) |
| index.tsx (sys18) | CodeMgmtPage / AuthGroupPage | lazy import | WIRED | 관리자 대메뉴 (규칙 7) |
| index.tsx (sys10) | BoardListPage | lazy import (boardId="sys10-notice") | WIRED | 공통게시판 (규칙 6) |
| index.tsx (sys18) | BoardListPage | lazy import (boardId="sys18") | WIRED | 공통게시판 (규칙 6) |
| MSW handlers | handlers/index.ts | import + spread | WIRED | sys07Handlers, sys10Handlers, sys18Handlers 모두 등록 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| MilDataListPage | listData | useQuery -> fetchDocuments -> MSW sys07 | Yes (faker 생성 데이터) | FLOWING |
| MilDataUsagePage | usages | fetchUsages -> MSW sys07 | Yes (faker 생성 데이터) | FLOWING |
| BusReservationPage | routeData | useQuery -> apiClient.get /sys10/routes | Yes (정적 5개 노선 Mock) | FLOWING |
| BusReservationPage | seats | useQuery -> apiClient.get seats | Yes (MSW 동적 생성) | FLOWING |
| JobDescFormPage | standardHoursQuery | useQuery -> fetchStandardHours | Yes (MSW 반환) | FLOWING |
| JobDescApprovalPage | approvals | fetchApprovals -> MSW sys18 | Yes (faker 생성 데이터) | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 747 tests 전체 통과 | npx vitest run | 747 passed, 0 failed | PASS |
| TypeScript 타입 체크 | npx tsc --noEmit | 성공 (오류 없음) | PASS |
| Vite 빌드 | npx vite build | 실패 -- ExternalLoginPage.tsx import 오류 | FAIL |

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| MDATA-01 | 군사자료 관리 (12 프로세스) | SATISFIED | MilDataListPage: 목록/등록/수정/삭제/상세/검색/보안등급, MilDataFormPage: 등록/수정 폼, MilDataEvalPage: 평가심의 |
| MDATA-02 | 군사자료 활용 (6 프로세스) | SATISFIED | MilDataUsagePage: 열람신청/대출/반납 Steps 워크플로우, 승인/반려, 이력 |
| MDATA-03 | 통계자료 (15 프로세스) | SATISFIED | MilDataStatsPage: Column/Pie/Line/Bar 4종 차트, 문서별/보안등급별/활용추이/교차분석/접수기록부/활용기록부, PrintableReport |
| MDATA-04 | 해기단자료 (7 프로세스) | SATISFIED | HaegidanListPage/FormPage: 목록/등록/수정/삭제/검색/인쇄 |
| BUS-01 | 주말버스 예약 (7 프로세스) | PARTIAL | BusReservationPage: 노선조회/좌석선택/예약신청/TicketPrint. 빌드 실패로 런타임 불가 |
| BUS-02 | 예약현황 (5 프로세스) | SATISFIED | BusReservationStatusPage: 노선별/일자별/부대별 검색, PrintableReport |
| BUS-03 | 배차관리 (6 프로세스) | SATISFIED | BusDispatchPage: 노선관리/차량배정/운행확정 |
| BUS-04 | 예약시간관리 (4 프로세스) | SATISFIED | BusSchedulePage: 예약오픈/마감/취소마감 시간 설정 |
| BUS-05 | 대기자관리 (4 프로세스) | PARTIAL | BusWaitlistPage: 대기목록/자동배정 구현됨. import 오류로 빌드 실패 |
| BUS-06 | 사용현황 (2 프로세스) | SATISFIED | BusUsagePage: 부대별/노선별 + PrintableReport |
| BUS-07 | 위규자관리 (5 프로세스) | PARTIAL | BusViolatorPage: 목록/등록/수정/삭제/제재 구현. import 오류로 빌드 실패 |
| BUS-08 | 타군 사용자 관리 (9 프로세스) | PARTIAL | ExternalUserPage/LoginPage/RegisterPage: 구현됨. import 오류로 빌드 실패 |
| BUS-09 | 게시판 (2 프로세스) | SATISFIED | index.tsx: BoardListPage lazy import (boardId="sys10-notice") |
| JOB-01 | 직무기술서 작성 (16 프로세스) | SATISFIED | JobDescFormPage: 5단계 위자드, 업무분류/비율100%검증/시간배분/역량/임시저장/결재요청 |
| JOB-02 | 직무기술서 조회-관리자 (11 프로세스) | SATISFIED | JobDescAdminPage: 목록/상세/검토/의견등록/반송/검색/부대별/엑셀/PrintableReport |
| JOB-03 | 결재 (9 프로세스) | SATISFIED | JobDescApprovalPage: 결재대기/결재완료/결재선관리 3탭, Steps 워크플로우 |
| JOB-04 | 조직진단 대상 관리 (5 프로세스) | SATISFIED | OrgDiagnosisPage: CRUD/기간설정/대상자관리/진행현황 |
| JOB-05 | 게시판 (3 프로세스) | SATISFIED | index.tsx: BoardListPage lazy import (boardId="sys18") |
| JOB-06 | 공통코드관리 (1 프로세스) | SATISFIED | index.tsx: CodeMgmtPage lazy import |
| JOB-07 | 사용자권한관리 (1 프로세스) | SATISFIED | index.tsx: AuthGroupPage lazy import |
| JOB-08 | 표준업무시간관리 (1 프로세스) | SATISFIED | StandardWorkTimePage: 신분별 표준시간 CRUD |

### 7대 규칙 준수 현황

| 규칙 | SYS07 | SYS10 | SYS18 |
|------|-------|-------|-------|
| 1. 컬럼 표시 필수 | PASS | PASS | PASS |
| 2. 입력값 = CRUD | PASS | PASS | PASS |
| 3. 검색조건 = 검색 기능 | PASS | PASS | PASS |
| 4. 출력 = PrintableReport | PASS (3곳) | PASS (4곳+TicketPrint) | PASS (1곳) |
| 5. 부대(서) 표기 통일 | PARTIAL -- MilDataUsagePage 2곳 '부대'만 표기 | PASS | PASS |
| 6. 공통게시판 lazy import | N/A (요구사항 없음) | PASS (sys10-notice) | PASS (sys18) |
| 7. 관리자 대메뉴 (코드/권한) | PASS (/sys07/3/1, 3/2) | PASS (/sys10/2/1, 2/2) | PASS (/sys18/2/1, 2/3) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| sys10/index.tsx | 34-41 | PlaceholderPage 선언됨 (미사용 dead code) | INFO | 빌드에 영향 없음, 코드 정리 필요 |
| sys10/ExternalLoginPage.tsx | 4 | 잘못된 import 경로 `@/shared/api/apiClient` | BLOCKER | 빌드 실패 |
| sys10/ExternalRegisterPage.tsx | 4 | 잘못된 import 경로 `@/shared/api/apiClient` | BLOCKER | 빌드 실패 |
| sys10/ExternalUserPage.tsx | 6 | 잘못된 import 경로 `@/shared/api/apiClient` | BLOCKER | 빌드 실패 |
| sys10/BusWaitlistPage.tsx | 7 | 잘못된 import 경로 `@/shared/api/apiClient` | BLOCKER | 빌드 실패 |
| sys10/BusViolatorPage.tsx | 9 | 잘못된 import 경로 `@/shared/api/apiClient` | BLOCKER | 빌드 실패 |
| sys07/MilDataUsagePage.tsx | 162, 300 | '부대' 라벨 -- 규칙5 '부대(서)' 미준수 | WARNING | 표기 규칙 위반 |

### Human Verification Required

### 1. 좌석 선택 UI 시각 검증

**Test:** SYS10 /sys10/1/2 접속 -> 노선/일자/시간 선택 -> 좌석 그리드 표시 확인
**Expected:** 4열 배치(2+통로+2), 운전석 표시, 상태별 색상(파란=빈좌석, 회색=예약됨, 초록=내선택, 빨강=불가), 범례 표시
**Why human:** 시각적 레이아웃과 색상은 코드만으로 완전 검증 불가

### 2. 직무기술서 5단계 위자드 인터랙션

**Test:** SYS18 /sys18/1/3 -> 신규작성 -> 5단계 순차 진행
**Expected:** 기본정보 -> 업무분류/비율(합계 100% 검증) -> 시간배분(표준업무시간 연동) -> 역량/자격요건 -> 완료/제출(요약+결재선)
**Why human:** 다단계 폼 상태 전환과 유효성 검사 인터랙션은 런타임 테스트 필요

### 3. 군사자료 통계 차트 렌더링

**Test:** SYS07 /sys07/1/3 -> 통계 탭별 차트 확인
**Expected:** Column(문서별현황), Pie(비밀등급분포), Line(활용추이), Bar(교차분석) 4종 차트 + 데이터 표시
**Why human:** @ant-design/charts 렌더링은 브라우저에서만 확인 가능

## Gaps Summary

2개 gap이 발견되었으며, 모두 수정 범위가 작습니다:

**Gap 1 (BLOCKER): SYS10 빌드 실패** -- 5개 파일에서 `@/shared/api/apiClient`를 `@/shared/api/client`로 수정하면 해결. 기능 자체는 완전 구현됨.

**Gap 2 (WARNING): SYS07 부대(서) 표기** -- MilDataUsagePage의 2곳에서 '부대'를 '부대(서)'로 변경. 1줄씩 2곳.

총 수정량: 7개 파일, 각각 1줄 변경 (5 import 수정 + 2 라벨 수정)

---

_Verified: 2026-04-06T16:37:48Z_
_Verifier: Claude (gsd-verifier)_
