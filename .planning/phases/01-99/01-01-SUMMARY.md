---
phase: 01-99
plan: 01
subsystem: 공통기능 (코드관리)
tags: [code-management, msw, tanstack-query, react-router, crud]
dependency_graph:
  requires: [Phase 0 frozen contract (DataTable, CrudForm, shared/ui)]
  provides: [useCodeOptions 훅, codeGroupApi, codeApi, 코드관리 2패널 화면, 공통 라우팅 인프라]
  affects: [01-02 (권한관리), 01-03 (결재선/시스템관리), 01-04 (공통게시판) — 모두 useCodeOptions 참조]
tech_stack:
  added: []
  patterns:
    - TanStack Query useMutation + invalidateQueries 패턴
    - MSW 핸들러 분리 구조 (common/index.ts 집합 파일)
    - React Router lazy Routes/Route 서브경로 분기 패턴
    - DataTable onRow 클릭 선택 상태 패턴
key_files:
  created:
    - navy-admin/src/entities/code/types.ts
    - navy-admin/src/entities/code/api.ts
    - navy-admin/src/entities/code/index.ts
    - navy-admin/src/features/common/hooks/useCodeOptions.ts
    - navy-admin/src/shared/api/mocks/handlers/common/code.ts
    - navy-admin/src/shared/api/mocks/handlers/common/index.ts
    - navy-admin/src/pages/common/code-mgmt/CodeManagementPage.tsx
    - navy-admin/src/pages/common/code-mgmt/CodeGroupPage.tsx
    - navy-admin/src/pages/common/code-mgmt/CodeListPanel.tsx
    - navy-admin/src/__tests__/common/code.test.ts
    - navy-admin/src/__tests__/common/useCodeOptions.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/shared/config/routes.ts
    - navy-admin/src/pages/common/index.tsx
    - navy-admin/src/shared/ui/DataTable/DataTable.tsx
decisions:
  - "DataTable에 onRow prop 추가 — 코드그룹 행 클릭 시 코드목록 연동 필요 (최소 확장, Phase 0 frozen contract 준수)"
  - "apiClient interceptor 반환값 처리 — response.data 이중 접근 패턴 확립 (res.data 또는 res 직접 사용)"
  - "fetchGroups/fetchCodes에서 ApiResult.data 추출 패턴 적용"
metrics:
  duration: "8분 (508초)"
  completed_date: "2026-04-05"
  tasks: 2
  files_created: 11
  files_modified: 4
requirements: [COM-07, COM-08]
---

# Phase 1 Plan 01: 코드관리 (COM-07, COM-08) Summary

코드그룹/코드 CRUD 2패널 화면 + MSW 핸들러 + useCodeOptions 5분 캐시 훅 + 공통 기능 라우팅 인프라를 구현했다.

## What Was Built

**Task 1: 코드 인프라 레이어**
- `entities/code/types.ts` — CodeGroup, Code, CodeOption 인터페이스
- `entities/code/api.ts` — codeGroupApi (list/create/update/delete), codeApi (listByGroup/create/update/delete/getOptions)
- `features/common/hooks/useCodeOptions.ts` — `staleTime: 5 * 60 * 1000` TanStack Query 훅, 이후 모든 화면의 Select/Radio 옵션 소스
- `shared/api/mocks/handlers/common/code.ts` — 10개 코드그룹 + 그룹당 코드 MSW 핸들러 (군 행정 실제 코드값)
- `shared/api/mocks/handlers/common/index.ts` — commonHandlers 집합 파일 (Plan 02~04에서 확장 예정)
- `shared/api/mocks/handlers/index.ts` — commonHandlers 통합
- `shared/config/routes.ts` — ACCESS_LOG, ERROR_LOG, MESSAGE_MGMT 경로 추가
- `pages/common/index.tsx` — SubsystemPage 제거, React Router 서브경로 분기 (code-mgmt 구현, 나머지 NotImplemented)
- 테스트 스캐폴드 6/6 통과

**Task 2: 코드관리 2패널 화면**
- `CodeManagementPage.tsx` — Row gutter={16}, Col span={10/14} 마스터-디테일 레이아웃
- `CodeGroupPage.tsx` — DataTable 기반 코드그룹 CRUD, 행 클릭 시 우측 패널 연동, 선택 행 #E6F4FF 하이라이트
- `CodeListPanel.tsx` — DataTable 기반 코드 CRUD, key={groupId} 자동 리로드, code-options 캐시 동시 무효화
- UI-SPEC 디자인 계약 적용: #F0F2F5 빈 상태 배경, Copywriting Contract 준수

## Verification

- TypeScript noEmit: 0 errors
- 전체 테스트: 35/35 통과 (code.test.ts 5개, useCodeOptions.test.ts 1개 포함)
- /common 접속 시 /common/code-mgmt로 Navigate 리다이렉트
- MSW 핸들러: 10개 코드그룹 (APPROVAL_STATUS, USER_RANK 등) Mock 데이터 포함

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - 누락 기능] DataTable에 onRow prop 추가**
- **Found during:** Task 2
- **Issue:** 코드그룹 행 클릭 시 우측 패널 연동을 위해 onRow가 필요하나 DataTable에 해당 prop 없음
- **Fix:** DataTable.tsx에 `onRow` prop 추가 (React.CSSProperties 타입 포함) — ProTable 기본 onRow를 pass-through
- **Files modified:** navy-admin/src/shared/ui/DataTable/DataTable.tsx
- **Commit:** 9fe13a2

**2. [Rule 1 - Bug] apiClient interceptor 이중 래핑 처리**
- **Found during:** Task 2
- **Issue:** apiClient interceptor가 response.data를 반환하므로 PageResponse<T>를 직접 반환하지만, ApiResult 래핑 구조와 충돌 가능
- **Fix:** fetchGroups/fetchCodes에서 `(res as { data: PageResponse<T> }).data ?? res` 패턴으로 방어적 추출
- **Files modified:** CodeGroupPage.tsx, CodeListPanel.tsx
- **Commit:** 9fe13a2

## Known Stubs

- `pages/common/index.tsx` — `NotImplemented` 컴포넌트: auth-group, board, approval, system-mgr, menu-mgmt, access-log, error-log, message-mgmt 경로에 "준비 중인 기능입니다" 표시. Plan 02~04에서 실제 컴포넌트로 교체 예정 (의도된 스텁).

## Self-Check

### 파일 존재 확인

- FOUND: navy-admin/src/entities/code/types.ts
- FOUND: navy-admin/src/entities/code/api.ts
- FOUND: navy-admin/src/entities/code/index.ts
- FOUND: navy-admin/src/features/common/hooks/useCodeOptions.ts
- FOUND: navy-admin/src/shared/api/mocks/handlers/common/code.ts
- FOUND: navy-admin/src/shared/api/mocks/handlers/common/index.ts
- FOUND: navy-admin/src/pages/common/code-mgmt/CodeManagementPage.tsx
- FOUND: navy-admin/src/pages/common/code-mgmt/CodeGroupPage.tsx
- FOUND: navy-admin/src/pages/common/code-mgmt/CodeListPanel.tsx

### 커밋 존재 확인

- Task 1: 0ee3ba3
- Task 2: 9fe13a2
