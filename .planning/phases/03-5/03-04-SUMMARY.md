---
phase: 03-5
plan: 04
subsystem: sys11-research
status: complete
tags: [sys11, research, crud, msw, tabs]
dependency_graph:
  requires:
    - Phase 1 공통 게시판 (board)
    - Phase 1 권한관리 (auth-group)
    - shared/ui/DataTable
    - shared/ui/CrudForm
    - shared/ui/DetailModal
  provides:
    - sys11 연구자료종합관리체계 4개 페이지
    - sys11 MSW 핸들러 12개 엔드포인트
  affects:
    - shared/api/mocks/handlers/index.ts (sys11Handlers 등록됨)
tech_stack:
  added: []
  patterns:
    - MSW 핸들러 + PageResponse 패턴
    - TanStack Query useQuery (stats/recent/popular)
    - Ant Design Tabs 6탭 관리자 레이아웃
    - DataTable + CrudForm 조합 CRUD
key_files:
  created:
    - navy-admin/src/pages/sys11-research/ResearchMainPage.tsx
    - navy-admin/src/pages/sys11-research/ResearchListPage.tsx
    - navy-admin/src/pages/sys11-research/ResearchFilePage.tsx
    - navy-admin/src/pages/sys11-research/ResearchAdminPage.tsx
    - navy-admin/src/shared/api/mocks/handlers/sys11.ts
    - navy-admin/src/__tests__/sys11/research.test.ts
  modified:
    - navy-admin/src/pages/sys11-research/index.tsx
decisions:
  - "ResearchListPage 상세 모달: DetailModal 대신 직접 Modal+Descriptions 사용 — footer에 다운로드 버튼 추가 필요"
  - "ResearchAdminPage 권한관리 탭: Navigate 버튼으로 /sys11/2/1 공통 페이지 연결 (탭 내 iframe 불필요)"
metrics:
  duration_seconds: 900
  completed_date: "2026-04-05T16:21:23Z"
  tasks_completed: 2
  files_created: 6
  files_modified: 1
  tests_added: 37
---

# Phase 3 Plan 04: 연구자료종합관리체계 (sys11) Summary

sys11 연구자료종합관리체계 — 통계 메인화면 + CRUD + 자료실 + 6탭 관리자 4개 페이지, 12개 MSW 엔드포인트, 37개 테스트 완전 구현.

## What Was Built

### Task 1: sys11 MSW 핸들러 + index.tsx 라우팅
- `sys11.ts`: 연구자료 30건 faker Mock, 12개 MSW 엔드포인트 (CRUD + stats/recent/popular + categories + files)
- `handlers/index.ts`: `sys11Handlers` spread 등록 (이미 완료된 상태였음)
- `index.tsx`: Navigate `/sys11/1/1` 기본 리다이렉트 + 6개 라우트 + BoardIndex/AuthGroupIndex lazy 공통 재사용

### Task 2: sys11 고유 페이지 4개 + 테스트
- `ResearchMainPage.tsx`: 통계 4카드 (전체/이번달/인기분야/총다운로드) + 최신/인기 각 5건 List + 전체보기 링크
- `ResearchListPage.tsx`: DataTable + CrudForm CRUD + 상세 모달(Descriptions) + 다운로드 Mock + Popconfirm 삭제
- `ResearchFilePage.tsx`: DataTable 자료실 목록 + 각 행 다운로드 버튼 (message.success)
- `ResearchAdminPage.tsx`: 6탭 (자료관리/카테고리관리/통계/사용자관리/삭제관리/권한관리)
- `research.test.ts`: Nyquist readFileSync 기반 37개 테스트

## Verification Results

- TypeScript: `npx tsc --noEmit` — 에러 0건
- sys11 테스트: `npx vitest run src/__tests__/sys11/` — 37/37 통과
- 전체 테스트: `npx vitest run` — 250/250 통과 (24개 테스트 파일)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Feature] 상세 모달 다운로드 버튼**
- **Found during:** Task 2
- **Issue:** 공유 `DetailModal` 컴포넌트는 `footer=null` 고정이라 다운로드 버튼 추가 불가
- **Fix:** `ResearchListPage`에서 `DetailModal` 대신 직접 `Modal + Descriptions` 패턴으로 구현, footer에 다운로드 버튼 포함
- **Files modified:** ResearchListPage.tsx

## Success Criteria Verification

1. /sys11/1/1 통계 카드 4개 + 최신/인기 자료 각 5건 — ResearchMainPage 구현 완료
2. /sys11/1/2 연구자료 CRUD + 상세 모달 + 다운로드 Mock — ResearchListPage 구현 완료
3. /sys11/1/3 자료실 목록 + 다운로드 Mock — ResearchFilePage 구현 완료
4. /sys11/1/5 관리자 6개 탭 전환 — ResearchAdminPage 구현 완료
5. /sys11/1/4 공지사항 BoardIndex 재사용, /sys11/2/1 AuthGroupIndex 재사용 — index.tsx 라우팅 완료
6. TypeScript 0 errors, 테스트 전체 통과 — 확인 완료

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 4e2f55f | feat | sys11 MSW 핸들러 12개 엔드포인트, index.tsx 6개 라우트 매핑 |
| 3c58f35 | feat | sys11 연구자료 4개 페이지 + 37개 테스트 통과 |

## Self-Check: PASSED

---

## GAP 수정 반영 (2026-04-07)

SYS11 연구자료종합관리체계에 req_spec 기반 GAP 수정 적용:
- **R1**: CrudForm에 첨부파일 구분 4종 (연구보고서/논문/발표자료/기타) 필드 추가
- **R2**: 목록 화면 상단에 SearchForm 5개 조건 추가
- **R5**: DataTable에 navy-bordered-table CSS 적용
- **R6**: 작성자/등록자 컬럼에 militaryPersonColumn() 헬퍼 적용 (군번/계급/성명)
