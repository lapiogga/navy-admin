---
phase: 03-5
plan: 02
subsystem: sys05-admin-rules
tags: [react, typescript, msw, ant-design, favorites, localStorage]
dependency_graph:
  requires: [shared/ui/DataTable, shared/ui/DetailModal, shared/api/types, faker-js]
  provides: [sys05 행정규칙포탈체계 4개 페이지, useFavorites 훅, sys05 MSW 핸들러]
  affects: [shared/api/mocks/handlers/index.ts]
tech_stack:
  added: []
  patterns: [DataTable+Modal 목록/상세 패턴, localStorage 즐겨찾기 훅, readFileSync 기반 테스트]
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys05.ts
    - navy-admin/src/pages/sys05-admin-rules/useFavorites.ts
    - navy-admin/src/pages/sys05-admin-rules/RegulationListPage.tsx
    - navy-admin/src/pages/sys05-admin-rules/PrecedentHQPage.tsx
    - navy-admin/src/pages/sys05-admin-rules/PrecedentUnitPage.tsx
    - navy-admin/src/pages/sys05-admin-rules/DirectiveListPage.tsx
    - navy-admin/src/__tests__/sys05/admin-rules.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/pages/sys05-admin-rules/index.tsx
decisions:
  - "DetailModal에 footer prop 없어 Modal + Descriptions 직접 조합으로 다운로드/프린트 버튼 구현"
  - "다운로드/프린트는 message.success Mock으로 처리 (D-13 패턴)"
metrics:
  duration_seconds: 657
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_created: 7
  files_modified: 2
  tests_passed: 21
---

# Phase 03 Plan 02: sys05 행정규칙포탈체계 Summary

## One-liner

LocalStorage 즐겨찾기 훅 + DataTable+Modal 패턴으로 현행규정/예규/지시문서 4개 조회 화면 + MSW 6개 핸들러 구현

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | sys05 MSW 핸들러 + 즐겨찾기 훅 + index.tsx 라우팅 | 5cc2cc7 | sys05.ts, useFavorites.ts, index.tsx, handlers/index.ts |
| 2 | sys05 고유 페이지 4개 + 테스트 | 2dc0176 | RegulationListPage.tsx, PrecedentHQPage.tsx, PrecedentUnitPage.tsx, DirectiveListPage.tsx, admin-rules.test.ts |

## What Was Built

### sys05 MSW 핸들러 (sys05.ts)
6개 엔드포인트:
- `GET /api/sys05/regulations` — 현행규정 목록 (keyword 필터 + 페이지네이션, 15건)
- `GET /api/sys05/regulations/:id` — 현행규정 상세
- `GET /api/sys05/precedents/hq` — 해군본부 예규 목록 (12건)
- `GET /api/sys05/precedents/unit` — 예하부대 예규 목록 (10건)
- `GET /api/sys05/directives` — 지시문서 목록 (8건)
- `GET /api/sys05/directives/:id` — 지시문서 상세

### useFavorites 훅 (useFavorites.ts)
- `useFavorites(storageKey)` 커스텀 훅
- useState 초기값: `localStorage.getItem(storageKey)` JSON 파싱
- `toggle(id)`: 즐겨찾기 추가/해제 + localStorage 동기화
- `isFavorite(id)`: 즐겨찾기 여부 확인
- 새로고침 후에도 즐겨찾기 유지

### 4개 고유 페이지
- **RegulationListPage**: 현행규정 목록 + 즐겨찾기(StarFilled/StarOutlined) + 상세 Modal + 다운로드/프린트 버튼
- **PrecedentHQPage**: 해군본부 예규 목록 + 상세 Modal + 다운로드 버튼
- **PrecedentUnitPage**: 예하부대 예규 목록 + 상세 Modal + 다운로드 버튼
- **DirectiveListPage**: 지시문서 목록 + 상세 Modal + 다운로드 버튼

### index.tsx 라우팅
```
/sys05        → Navigate to /sys05/1/1 (redirect)
/sys05/1/1    → RegulationListPage (현행규정)
/sys05/2/1    → PrecedentHQPage (예규-해군본부)
/sys05/2/2    → PrecedentUnitPage (예규-예하부대)
/sys05/3/1    → DirectiveListPage (지시문서)
```

## Verification Results

- TypeScript: 0 errors (`npx tsc --noEmit`)
- sys05 tests: 21/21 passed
- 기존 테스트: 72/72 passed (regression 없음)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DetailModal footer prop 부재**
- **Found during:** Task 2
- **Issue:** DetailModal 컴포넌트에 footer prop이 없어 다운로드/프린트 버튼을 추가할 수 없음
- **Fix:** DetailModal 대신 antd Modal + Descriptions 직접 조합으로 구현. Modal footer에 다운로드/프린트/닫기 버튼 배치
- **Files modified:** RegulationListPage.tsx, PrecedentHQPage.tsx, PrecedentUnitPage.tsx, DirectiveListPage.tsx
- **Commit:** 2dc0176

## Known Stubs

없음. 모든 페이지가 MSW 핸들러와 연결된 실제 데이터로 렌더링됩니다.

## Self-Check: PASSED
