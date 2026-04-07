---
phase: 04-a-6
plan: 05
subsystem: SYS12
tags: [directives, proposals, timeline, progress, charts, msw]
dependency_graph:
  requires: [Phase 0 공통 컴포넌트, Phase 1 공통게시판]
  provides: [SYS12 지시건의사항관리체계 32개 프로세스]
  affects: [메인 포탈 sys12 라우팅]
tech_stack:
  added: ["@ant-design/charts Bar (Stacked)"]
  patterns:
    - "Progress + StatusBadge + Timeline 이행/처리현황 패턴"
    - "Statistic 5개 요약 + 매트릭스 DataTable 추진현황 패턴"
    - "지시/건의 대칭 구조 (DirectiveX / ProposalX)"
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys12.ts
    - navy-admin/src/pages/sys12-directives/DirectiveProgressPage.tsx
    - navy-admin/src/pages/sys12-directives/DirectiveListPage.tsx
    - navy-admin/src/pages/sys12-directives/ProposalProgressPage.tsx
    - navy-admin/src/pages/sys12-directives/ProposalListPage.tsx
    - navy-admin/src/pages/sys12-directives/DirectiveAdminPage.tsx
    - navy-admin/src/__tests__/sys12/directives.test.ts
  modified:
    - navy-admin/src/pages/sys12-directives/index.tsx
decisions:
  - "지시/건의 대칭 구조: DirectiveX/ProposalX 쌍으로 코드 재사용 극대화"
  - "추진현황+목록 단일 화면 통합: Tabs 대신 두 컴포넌트 수직 배치 (단순성 우선)"
  - "@ant-design/charts Bar isStack: 관리자 탭 카테고리별 처리현황 시각화"
metrics:
  duration: "9분"
  completed: "2026-04-06T03:12:39Z"
  tasks_completed: 2
  files_created: 7
  files_modified: 1
  tests_added: 45
---

# Phase 4 Plan 05: SYS12 지시건의사항관리체계 Summary

**한 줄 요약:** Progress+StatusBadge+Timeline 이행현황 패턴 + Statistic 매트릭스 추진현황 + Stacked Bar 차트로 지시사항/건의사항 대칭 구조 32개 프로세스 구현

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | MSW 핸들러 + 테스트 + 지시사항 추진현황/목록 | 814298e | sys12.ts, DirectiveProgressPage.tsx, DirectiveListPage.tsx, directives.test.ts |
| 2 | 건의사항 + 관리자 + 라우트 + 공통 재사용 | 89a9b08 | ProposalProgressPage.tsx, ProposalListPage.tsx, DirectiveAdminPage.tsx, index.tsx |

## What Was Built

### MSW 핸들러 (sys12.ts)
- 타입 정의: `Directive`, `Proposal`, `ActionItem`, `ActionHistory` (모두 `extends Record<string, unknown>`)
- `ProgressStatus`: `notStarted | inProgress | completed | delayed`
- 19개 엔드포인트: 지시사항 CRUD(5) + 조치사항/이력(3) + 추진현황(1) + 건의사항 CRUD(5) + 조치사항/이력(3) + 관리자통계(1) + 처리현황(1)
- Mock 데이터: 지시사항 20건, 건의사항 15건, 조치사항 30건, 이력 60건

### 지시사항 추진현황 (DirectiveProgressPage)
- Statistic 5개 요약: 총 지시 / 완료(green) / 진행중(blue) / 미착수 / 추진율(%)
- antd Progress 바 (추진율 시각화)
- 카테고리별 매트릭스 DataTable: 7컬럼 (구분/건수/완료/진행중/미착수/지연/추진율)
- 엑셀 다운로드 버튼

### 지시사항 목록 (DirectiveListPage)
- DataTable 7컬럼 + StatusBadge (4색: notStarted/inProgress/completed/delayed)
- CrudForm: 지시자/지시일자/수명부대/추진상태/지시내용/종류 6개 필드
- 상세 Modal: 기본정보 + 조치사항 등록 서브 Modal + Timeline 이행이력

### 건의사항 추진현황/목록 (ProposalProgress/ListPage)
- DirectiveX와 동일 패턴, 필드명 변경 (director→proposer, targetUnit→managingUnit 등)

### 관리자 (DirectiveAdminPage)
- Tabs 9개: 지시사항관리/건의사항관리/카테고리관리/통계/사용자관리/부대관리/기간설정/알림설정/권한관리
- `@ant-design/charts Bar` Stacked 차트 (카테고리별 지시/건의 처리현황)

### 라우트 (index.tsx)
- Navigate to="/sys12/2/3" (기본: 지휘관 지시사항)
- 공통게시판 재사용 4개 (공지/질의응답/대통령/국방부장관)
- 고유 페이지 4개 (지시사항/건의사항/관리자 + 통합뷰)

## Test Results

- 테스트 파일: `navy-admin/src/__tests__/sys12/directives.test.ts`
- 결과: **45/45 PASSED**
- TypeScript: `tsc --noEmit` **에러 없음**

## Deviations from Plan

### Auto-fixed Issues

없음.

### 참고: 다른 에이전트 병렬 실행
handlers/index.ts가 병렬 실행 에이전트들에 의해 이미 sys02/sys13/sys17 핸들러가 추가된 상태였음. sys12Handlers도 이미 다른 에이전트가 등록한 상태 확인. 충돌 없이 진행.

## Known Stubs

- `DirectiveAdminPage.tsx`: 카테고리 관리 폼 submit 시 실제 API 호출 없이 `message.success` 만 표시 (Mock). 향후 백엔드 연동 시 wiring 필요.
- `DirectiveAdminPage.tsx`: 기간 설정 / 알림 설정 폼은 submit 없이 UI만 구현. 향후 `/sys12/settings` API 연동 필요.

## Self-Check: PASSED

- FOUND: navy-admin/src/shared/api/mocks/handlers/sys12.ts
- FOUND: navy-admin/src/pages/sys12-directives/DirectiveProgressPage.tsx
- FOUND: navy-admin/src/pages/sys12-directives/DirectiveListPage.tsx
- FOUND: navy-admin/src/pages/sys12-directives/ProposalProgressPage.tsx
- FOUND: navy-admin/src/pages/sys12-directives/ProposalListPage.tsx
- FOUND: navy-admin/src/pages/sys12-directives/DirectiveAdminPage.tsx
- FOUND: navy-admin/src/__tests__/sys12/directives.test.ts
- FOUND: .planning/phases/04-a-6/04-05-SUMMARY.md
- COMMIT 814298e: FOUND
- COMMIT 89a9b08: FOUND

---

## GAP 수정 반영 (2026-04-07)

SYS12 지시건의사항관리체계에 req_spec 기반 GAP 수정 적용:
- **R1**: CrudForm에 directiveType(문서/구두) 필드 추가
- **R2**: 목록 화면 상단에 SearchForm 추가
- **R5**: DataTable에 navy-bordered-table CSS 적용
- **R6**: 지시자/건의자 컬럼에 militaryPersonColumn() 헬퍼 적용 (군번/계급/성명)
