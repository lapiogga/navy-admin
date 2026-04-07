---
phase: 04-a-6
plan: 03
subsystem: SYS06 해병대규정관리체계
tags: [sys06, regulations, reuse, msw, routing]
dependency_graph:
  requires:
    - Phase 1 공통게시판 (common/board)
    - Phase 1 권한관리 (common/auth-group)
    - Phase 3 sys05-admin-rules 페이지 (RegulationListPage, PrecedentHQPage, PrecedentUnitPage, DirectiveListPage)
  provides:
    - SYS06 30개 프로세스 화면 (MREG-01~08 커버)
    - sys06 MSW 핸들러 8개 엔드포인트
  affects:
    - navy-admin/src/shared/api/mocks/handlers/index.ts (sys06Handlers 추가)
tech_stack:
  added: []
  patterns:
    - sys05 페이지를 sysCode 래퍼로 재사용하는 패턴 확립
    - MSW 핸들러 sysCode 격리 패턴 (경로 /api/sys06/)
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys06.ts
    - navy-admin/src/__tests__/sys06/regulations.test.ts
  modified:
    - navy-admin/src/pages/sys06-regulations/index.tsx
    - navy-admin/src/shared/api/mocks/handlers/index.ts
decisions:
  - "sys06 index.tsx는 sys05 페이지를 직접 import하여 래퍼 컴포넌트로 재사용 — sysCode prop 확장은 백엔드 연동 시 수행"
  - "sys06 MSW 핸들러는 /api/sys06/ 경로로 완전 격리 — sys05와 별개 Mock 데이터 생성 (faker 시드 분리)"
metrics:
  duration: "5분"
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 4
---

# Phase 4 Plan 03: SYS06 해병대규정관리체계 Summary

**One-liner:** sys05 페이지 4개를 sysCode 래퍼로 재사용하고 공통게시판/권한관리를 붙여 30개 프로세스를 8개 Route로 완성

## Objective

SYS06 해병대규정관리체계 30개 프로세스 구현. Phase 3 sys05(행정규칙) 페이지를 Props 변경만으로 재사용하는 최소 코드 전략.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | MSW 핸들러 + 테스트 스캐폴드 | 3fcd914 | sys06.ts, index.ts, regulations.test.ts |
| 2 | 라우트 매핑 (sys05 재사용 + 공통 재사용) | e4b60d6 | sys06-regulations/index.tsx |

## Implementation Details

### Task 1: MSW 핸들러

`sys06.ts`에 8개 엔드포인트 구현:
- GET/POST/PUT/DELETE `/api/sys06/regulations` (현행규정 CRUD)
- GET/POST `/api/sys06/precedents/hq` (예규-사령부)
- GET `/api/sys06/precedents/units` (예하부대)
- GET/POST `/api/sys06/directives` (지시문서)
- POST `/api/sys06/regulations/:id/favorite` (즐겨찾기)

`handlers/index.ts`에 sys06Handlers 추가 (병렬 에이전트가 이미 sys09/sys12도 추가한 상태였음).

### Task 2: 라우트 매핑

`index.tsx` 8개 Route:
| 경로 | 컴포넌트 | 재사용 방식 | 요구사항 |
|------|----------|------------|---------|
| 1/1 | RegulationListPage (sys05) | 래퍼 | MREG-01 |
| 2/1 | PrecedentHQPage (sys05) | 래퍼 | MREG-02 |
| 2/2 | PrecedentUnitPage (sys05) | 래퍼 | MREG-03 |
| 3/1 | DirectiveListPage (sys05) | 래퍼 | MREG-04 |
| 4/1 | BoardIndex | lazy, boardType='notice' | MREG-05 |
| 4/2 | BoardIndex | lazy, boardType='regulation-notice' | MREG-06 |
| 4/3 | BoardIndex | lazy, boardType='archive' | MREG-07 |
| 5/1 | AuthGroupIndex | lazy | MREG-08 |

## Verification Results

```
Test Files  1 passed (1)
Tests  16 passed (16)
```

TypeScript 컴파일 오류: 없음

## Deviations from Plan

**없음** - 계획대로 정확히 실행됨.

단, 병렬 실행 중 다른 에이전트가 `handlers/index.ts`를 수정하여 sys09Handlers, sys12Handlers도 추가되어 있었음. sys06Handlers는 이미 포함된 상태였으므로 충돌 없이 처리됨.

## Known Stubs

sys05 페이지(RegulationListPage, PrecedentHQPage, DirectiveListPage)가 `/api/sys05/` 경로를 하드코딩하고 있어, 실제 브라우저에서 sys06로 접속 시 sys05 API를 호출함. sys06 MSW 핸들러(`/api/sys06/`)와의 실제 연결은 백엔드 연동 시 sysCode prop 방식으로 해소 예정.

- `navy-admin/src/pages/sys05-admin-rules/RegulationListPage.tsx:110` — `/api/sys05/regulations` 하드코딩
- `navy-admin/src/pages/sys05-admin-rules/PrecedentHQPage.tsx:42` — `/api/sys05/precedents/hq` 하드코딩
- `navy-admin/src/pages/sys05-admin-rules/DirectiveListPage.tsx:42` — `/api/sys05/directives` 하드코딩

## Self-Check

- [x] sys06.ts 파일 존재 확인
- [x] sys06-regulations/index.tsx 파일 존재 확인
- [x] regulations.test.ts 파일 존재 확인
- [x] 커밋 3fcd914 존재 확인
- [x] 커밋 e4b60d6 존재 확인
- [x] 테스트 16/16 통과 확인

---

## GAP 수정 반영 (2026-04-07)

SYS06 해병대규정관리체계에 req_spec 기반 GAP 수정 적용:
- **SYS05 독립**: SYS05 행정규칙포탈에서 분리, 전용 4페이지 신규 생성
- **R1**: 전용 API 핸들러(/api/sys06/) 신규 생성
- **R2**: 목록 화면 상단에 SearchForm 추가
- **R5**: DataTable에 navy-bordered-table CSS 적용
- **R6**: militaryPersonColumn() 헬퍼 적용
