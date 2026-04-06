---
phase: 04-a-6
plan: "06"
subsystem: SYS09 영현보훈체계
tags: [sys09, crud, charts, print-css, msw, reports]
dependency_graph:
  requires: [Phase 0 공통 컴포넌트, Phase 1 공통게시판]
  provides: [SYS09 영현보훈 35개 프로세스]
  affects: [handlers/index.ts]
tech_stack:
  added: ["@ant-design/charts (Bar/Pie/Line/Column 4종"]
  patterns:
    - PrintableReport 래퍼 + print.css A4 인쇄 패턴
    - antd Descriptions 보고서/확인서 레이아웃 패턴
    - 4종 차트 (Bar/Pie/Line/Column) 현황 페이지 패턴
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys09.ts
    - navy-admin/src/pages/sys09-memorial/DeceasedPage.tsx
    - navy-admin/src/pages/sys09-memorial/InjuredPage.tsx
    - navy-admin/src/pages/sys09-memorial/ReviewPage.tsx
    - navy-admin/src/pages/sys09-memorial/PrintableReport.tsx
    - navy-admin/src/pages/sys09-memorial/print.css
    - navy-admin/src/pages/sys09-memorial/StatsUnitPage.tsx
    - navy-admin/src/pages/sys09-memorial/StatsTypePage.tsx
    - navy-admin/src/pages/sys09-memorial/StatsYearPage.tsx
    - navy-admin/src/pages/sys09-memorial/StatsMonthPage.tsx
    - navy-admin/src/pages/sys09-memorial/StatsUnitListPage.tsx
    - navy-admin/src/pages/sys09-memorial/StatsAllListPage.tsx
    - navy-admin/src/pages/sys09-memorial/ReportDeceasedPage.tsx
    - navy-admin/src/pages/sys09-memorial/ReportInjuredPage.tsx
    - navy-admin/src/pages/sys09-memorial/CertDeathPage.tsx
    - navy-admin/src/pages/sys09-memorial/CertMeritDeathPage.tsx
    - navy-admin/src/pages/sys09-memorial/CertMeritInjuredPage.tsx
    - navy-admin/src/pages/sys09-memorial/CertReviewResultPage.tsx
    - navy-admin/src/pages/sys09-memorial/CertIssueLedgerPage.tsx
    - navy-admin/src/__tests__/sys09/memorial.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/pages/sys09-memorial/index.tsx
decisions:
  - "PrintableReport 공통 래퍼 + print.css 방식으로 모든 보고서/확인서 인쇄 통일"
  - "HONOR-17 게시판은 Phase 1 공통게시판 lazy 재사용 (sysCode=sys09)"
  - "@ant-design/charts 4종 차트 활용: Bar(부대별)/Pie(신분별)/Line(연도별)/Column(월별)"
metrics:
  duration: "약 15분"
  completed_date: "2026-04-06"
  tasks_completed: 3
  files_created: 20
  files_modified: 2
  tests_passed: 56
---

# Phase 4 Plan 06: SYS09 영현보훈체계 Summary

Deceased/Injured/CombatReview CRUD 3종 + @ant-design/charts 4종 현황 차트 + PrintableReport/print.css 인쇄 래퍼로 보고서/확인서 7종 구현.

## What Was Built

SYS09 영현보훈체계 35개 단위 프로세스 (HONOR-01~17) 전체 구현.

### Task 1a: MSW 핸들러 + 타입 정의 + 테스트 스캐폴드

- `sys09.ts`: Deceased/Injured/CombatReview 인터페이스 (`extends Record<string, unknown>`)
- 27개 REST API 엔드포인트 MSW 핸들러 (CRUD 15 + 통계 5 + 보고서 7)
- Mock 데이터: 사망자 25건, 상이자 20건, 심사 15건
- `handlers/index.ts`에 sys09Handlers 추가

### Task 1b: CRUD 3종 + PrintableReport + Print CSS

- **DeceasedPage** (HONOR-01): 사망자 관리 — SearchForm(군구분/계급/소속) + DataTable(6컬럼) + CrudForm(14필드)
- **InjuredPage** (HONOR-02): 상이자 관리 — SearchForm + DataTable(injuryType StatusBadge) + CrudForm(16필드)
- **ReviewPage** (HONOR-03): 전공사상심사 — SearchForm + DataTable(result StatusBadge) + CrudForm(14필드)
- **PrintableReport.tsx**: `window.print()` 래퍼 컴포넌트, print-area/no-print 클래스 기반
- **print.css**: `@media print`, `@page { size: A4 portrait }`, report-title/signature-area 스타일

### Task 2: 현황 6종 + 보고서/확인서 7종 + 라우트

현황 페이지 (HONOR-04~09):
- **StatsUnitPage**: Bar 차트 + 부대별 집계 Table (HONOR-04)
- **StatsUnitListPage**: 부대별 사망자 명부 DataTable (HONOR-05)
- **StatsTypePage**: Pie 차트 + 신분별 집계 Table (HONOR-06)
- **StatsYearPage**: Line 차트 + 연도별 추이 Table (HONOR-07)
- **StatsMonthPage**: Column 차트 + 월별 매트릭스 Table (HONOR-08)
- **StatsAllListPage**: 전사망자 명부 DataTable (HONOR-09)

보고서/확인서 (HONOR-10~16):
- **ReportDeceasedPage**: 사망자 현황 보고서 + 합계 행 + 서명란 (HONOR-10)
- **ReportInjuredPage**: 상이자 현황 보고서 (HONOR-11)
- **CertDeathPage**: 순직/사망확인서 — Descriptions 레이아웃 (HONOR-12)
- **CertMeritDeathPage**: 국가유공자 확인서(사망자) — 3단 Descriptions (HONOR-13)
- **CertMeritInjuredPage**: 국가유공자 확인서(상이자) (HONOR-14)
- **CertReviewResultPage**: 전공사상심사결과 — 4단 Descriptions + 위원 서명 Table (HONOR-15)
- **CertIssueLedgerPage**: 전사망자 확인증 발급대장 Table (HONOR-16)

라우트 (index.tsx): 17개 Route 매핑, HONOR-17 게시판 common/board lazy 재사용

## Test Results

- **56/56 tests PASSED**
- TypeScript: 오류 없음 (`tsc --noEmit`)

## Deviations from Plan

None - 플랜 그대로 실행됨.

## Known Stubs

없음 — 모든 데이터는 MSW Mock API에서 실제 랜덤 데이터로 제공됨.

## Self-Check: PASSED

- DeceasedPage.tsx: FOUND
- InjuredPage.tsx: FOUND
- ReviewPage.tsx: FOUND
- PrintableReport.tsx: FOUND
- print.css: FOUND
- StatsUnitPage.tsx (Bar): FOUND
- StatsTypePage.tsx (Pie): FOUND
- StatsYearPage.tsx (Line): FOUND
- StatsMonthPage.tsx (Column): FOUND
- ReportDeceasedPage.tsx: FOUND
- CertDeathPage.tsx: FOUND
- sys09.ts handlers: FOUND
- index.tsx (17 routes): FOUND
- Commits: b82d4fa, f30750b — VERIFIED
