---
phase: 05-b-3
plan: "05"
subsystem: SYS18 직무기술서관리체계
tags: [job-desc, admin, charts, standard-work-hours, phase1-reuse, dayjs]
requires: [05-04]
provides: [SYS18-complete]
affects: [sys18.ts, index.tsx]
tech-stack-added: []
tech-patterns: [Bar/Column/Pie-charts, dayjs-status-calc, phase1-lazy-reuse]
key-files-created:
  - navy-admin/src/pages/sys18-job-desc/JobDescAdminPage.tsx
  - navy-admin/src/pages/sys18-job-desc/StandardWorkTimePage.tsx
key-files-modified:
  - navy-admin/src/shared/api/mocks/handlers/sys18.ts
  - navy-admin/src/pages/sys18-job-desc/index.tsx
  - navy-admin/src/__tests__/sys18/job-desc.test.ts
decisions:
  - "관리자 직무기술서 조회는 /api/sys18/job-descs/admin 별도 엔드포인트로 분리 (일반 목록과 분리)"
  - "표준업무시간 API는 /api/sys18/standard-work-hours로 신규 분리 (기존 /standard-hours는 단건 조회 전용 유지)"
  - "index.tsx에서 CodeGroupPage 대신 CodeManagementPage 사용 (필수 props 불필요, 독립 실행 가능)"
  - "BoardListPage는 boardId='sys18' prop으로 재사용 (sysCode/boardType props 미존재)"
requirements: [JOB-02, JOB-05, JOB-06, JOB-07, JOB-08]
duration: "약 6분"
completed: "2026-04-06"
tasks-completed: 2
files-created: 2
files-modified: 3
tests-added: 25
---

# Phase 5 Plan 05: SYS18 직무기술서관리체계 완성 Summary

**한 줄 요약:** 관리자 조회(개인/부서 Tabs) + 검토결과입력/의견보내기/반송 Modal + Bar/Column/Pie 통계 차트 3종 + 표준업무시간 CRUD(dayjs 적용상태 자동계산) + Phase 1 공통기능 lazy 재사용 완성으로 SYS18 47개 프로세스 100% 커버

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | 관리자 조회/검토/통계 페이지 | 0c94709 | JobDescAdminPage.tsx, sys18.ts, job-desc.test.ts |
| 2 | 표준업무시간 + Phase 1 재사용 + index.tsx 완성 | e6486ba | StandardWorkTimePage.tsx, index.tsx, job-desc.test.ts |

## What Was Built

### Task 1: 관리자 조회/검토결과/통계 페이지

**JobDescAdminPage.tsx (JOB-02):**
- Tabs 3개: 개인직무기술서 | 부서직무기술서 | 통계
- DataTable 컬럼: diagnosisName, writerName, department, position, rank, status(StatusBadge), submittedAt, reviewResult
- 검색: 진단명(Select), 날짜범위(RangePicker), 부대(서)(Input), 직위(Input)
- toolBarRender: 인쇄(PrintableReport 미리보기 Modal), 엑셀 다운로드
- 행 액션 버튼: 상세 | 검토결과 입력 | 의견 보내기 | 반송

**3개 Modal:**
- 검토결과 입력 Modal: reviewResult(Select: 적합/수정필요/부적합 required) + reviewComment(TextArea 500자)
- 의견 보내기 Modal: opinionContent(TextArea 500자 required)
- 반송 Modal: returnReason(TextArea 500자 required) + danger 스타일

**통계 탭 (Bar/Column/Pie):**
- Bar(수평): 부대별 작성현황 — 스택(작성완료/작성중/미작성), color 3종
- Column: 직급별 현황 — x축 계급, color '#003366'
- Pie: 업무분류별 분포 — 정책/관리/지원/기타 4분류

**sys18.ts MSW API 추가 (8개 엔드포인트):**
- GET /api/sys18/job-descs/admin (type/status/keyword/unit 필터)
- PUT /api/sys18/job-descs/:id/review
- POST /api/sys18/job-descs/:id/opinion
- PUT /api/sys18/job-descs/:id/return
- GET /api/sys18/stats/by-unit
- GET /api/sys18/stats/by-rank
- GET /api/sys18/stats/by-task-type
- GET/POST/PUT/DELETE /api/sys18/standard-work-hours

**StandardWorkHour 타입 + Mock 5건:**
- 장관 40h (만료), 영관 42h (적용중), 부사관 44h (적용중), 원사 44h (적용중), 병 40h (예정)

### Task 2: 표준업무시간 관리 + Phase 1 재사용 + index.tsx 완성

**StandardWorkTimePage.tsx (JOB-08):**
- DataTable 컬럼: rankCategory, standardHours(주간 시간), periodStart, periodEnd, applyStatus(StatusBadge)
- 적용상태 자동계산 함수 `calcApplyStatus`:
  - `today.isAfter(periodEnd)` → 'expired' (적용만료, default)
  - `today.isBefore(periodStart)` → 'upcoming' (적용예정, processing)
  - else → 'active' (적용중, success)
- CrudForm 참조 + Modal 내 Form: rankCategory(Select), standardHours(InputNumber 1~60), applyPeriod(RangePicker)
- CRUD 완전 구현 (신규등록/수정/삭제)

**index.tsx 완성 (placeholder 교체):**
- `/sys18/1/5` → JobDescAdminPage (직무기술서 조회 관리자)
- `/sys18/2/2` → StandardWorkTimePage (표준업무시간관리)
- `/sys18/1/1` → BoardListPage(boardId='sys18') lazy import (JOB-05)
- `/sys18/2/1` → CodeManagementPage lazy import (JOB-06)
- `/sys18/2/3` → AuthGroupPage(index) lazy import (JOB-07)
- PlaceholderPage 완전 제거, 모든 라우트 실제 컴포넌트 연결

## Test Results

- 총 78개 테스트 PASSED (기존 53개 + 신규 25개)
- readFileSync 기반 파일 내용 검증 패턴 (jsdom 타임아웃 회피)
- TypeScript `tsc --noEmit` 타입 에러 없음

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] BoardListPage props 불일치**
- **Found during:** Task 2
- **Issue:** 플랜에서 `sysCode='sys18'` props를 명시했으나 BoardListPage는 `boardId` prop만 받음
- **Fix:** `boardId="sys18"` 으로 수정
- **Files modified:** navy-admin/src/pages/sys18-job-desc/index.tsx

**2. [Rule 1 - Bug] CodeGroupPage requires props (onSelectGroup, selectedGroupId)**
- **Found during:** Task 2
- **Issue:** 플랜에서 `CodeGroupPage` lazy import를 명시했으나 이 컴포넌트는 필수 props가 있어 독립 사용 불가
- **Fix:** `CodeManagementPage` (부모 래퍼)로 교체 — props 없이 독립 실행 가능
- **Files modified:** navy-admin/src/pages/sys18-job-desc/index.tsx

**3. [Rule 1 - Bug] 기존 /standard-hours 핸들러와 충돌 방지**
- **Found during:** Task 1
- **Issue:** 기존 `GET /api/sys18/standard-hours`가 단건 조회용으로 존재. CRUD용은 별도 엔드포인트 필요
- **Fix:** CRUD 표준업무시간은 `/api/sys18/standard-work-hours` 신규 엔드포인트로 분리
- **Files modified:** navy-admin/src/shared/api/mocks/handlers/sys18.ts

## Known Stubs

없음 — SYS18 모든 라우트가 실제 컴포넌트로 연결됨. placeholder 완전 제거.

## SYS18 완성 요약

| 요구사항 | 라우트 | 컴포넌트 | 상태 |
|---------|-------|---------|------|
| JOB-01 (직무기술서 작성/5단계) | /sys18/1/3 | JobDescListPage + JobDescFormPage | Plan 04 완료 |
| JOB-02 (관리자 조회/통계) | /sys18/1/5 | JobDescAdminPage | Plan 05 완료 |
| JOB-03 (결재 워크플로우) | /sys18/1/4 | JobDescApprovalPage | Plan 04 완료 |
| JOB-04 (조직진단 관리) | /sys18/1/2 | OrgDiagnosisPage | Plan 04 완료 |
| JOB-05 (게시판) | /sys18/1/1 | BoardListPage(boardId=sys18) | Plan 05 완료 |
| JOB-06 (코드관리) | /sys18/2/1 | CodeManagementPage | Plan 05 완료 |
| JOB-07 (권한관리) | /sys18/2/3 | AuthGroupPage | Plan 05 완료 |
| JOB-08 (표준업무시간) | /sys18/2/2 | StandardWorkTimePage | Plan 05 완료 |

**SYS18 직무기술서관리체계 47개 프로세스 전체 완성.**

## Self-Check: PASSED

- FOUND: JobDescAdminPage.tsx
- FOUND: StandardWorkTimePage.tsx
- FOUND: commit 0c94709
- FOUND: commit e6486ba
