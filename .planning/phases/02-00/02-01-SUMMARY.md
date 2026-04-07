---
phase: 02-00
plan: 01
subsystem: 메인 포탈 (00_포탈)
tags: [announcements, dashboard, portal, msw, tests]
dependency_graph:
  requires: [01-04-SUMMARY.md]
  provides: [공지사항 feature slice, 대시보드 공지사항 섹션, 로그아웃 메시지, D-08 검증]
  affects: [portal/index.tsx, MainPortalLayout.tsx, PortalLayout.tsx(검증)]
tech_stack:
  added: []
  patterns: [TanStack Query useQuery, MSW http.get 핸들러, readFileSync Nyquist 테스트]
key_files:
  created:
    - navy-admin/src/features/announcements/types.ts
    - navy-admin/src/features/announcements/hooks/useAnnouncements.ts
    - navy-admin/src/features/announcements/components/AnnouncementSection.tsx
    - navy-admin/src/shared/api/mocks/handlers/announcements.ts
    - navy-admin/src/shared/api/mocks/handlers/announcements.test.ts
    - navy-admin/src/__tests__/portal/announcement.test.ts
    - navy-admin/src/__tests__/portal/header.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/pages/portal/index.tsx
    - navy-admin/src/app/layouts/MainPortalLayout.tsx
decisions:
  - 테스트 indexOf 버그 수정: handleGoPortal 블록만 슬라이싱하여 opener.focus() vs window.close() 순서 검증 (파일 전체 indexOf는 handleLogout의 window.close()와 충돌)
metrics:
  duration: 5 minutes
  completed: 2026-04-05
  tasks_completed: 2
  files_created: 7
  files_modified: 3
  tests_added: 18
  tests_total: 98
---

# Phase 2 Plan 1: 공지사항 Feature Slice + 대시보드 보강 Summary

공지사항 feature slice(타입/훅/컴포넌트/MSW)와 대시보드 통합, 로그아웃 메시지 추가, D-08 '메인포탈로 돌아가기' 검증 테스트로 PTL-01~PTL-05 요구사항 충족.

## Objective

대시보드에 공지사항 배너를 추가하고, 로그인/로그아웃 메시지를 보강하며, 서브시스템 헤더의 '메인포탈로 돌아가기' 버튼 동작을 검증하여 PTL-01~PTL-05 요구사항을 충족한다.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | 공지사항 feature slice + MSW 핸들러 생성 | 5f90235 | types.ts, hooks/useAnnouncements.ts, components/AnnouncementSection.tsx, handlers/announcements.ts, handlers/index.ts |
| 2 | 대시보드 보강 + 로그인/로그아웃 메시지 + D-08 검증 + 테스트 | c4ffb10 | portal/index.tsx, MainPortalLayout.tsx, 테스트 3개 |

## What Was Built

### Task 1: 공지사항 Feature Slice

- `Announcement` 타입 인터페이스 (id, title, content, createdAt, isUrgent)
- `useAnnouncements` 훅: TanStack Query, ApiResult 이중 래핑 방어 패턴 적용
- `AnnouncementSection` 컴포넌트: 최신 3건, 긴급공지 Alert type=warning, 빈 상태 처리
- MSW `GET /api/announcements` 핸들러: Mock 공지 3건 (긴급1, 일반2)
- `handlers/index.ts`에 announcementHandlers 등록

### Task 2: 대시보드 보강 + 검증

- `portal/index.tsx`: AnnouncementSection 통합, Phase 0 임시 '컴포넌트 데모' 카드 제거
- `MainPortalLayout.tsx`: `message.success('로그아웃 되었습니다')` 추가, fontSize 18→16px 조정
- `PortalLayout.tsx`: D-08 이미 올바르게 구현됨 확인 (opener.focus→close, navigate fallback)
- `login/index.tsx`: 변경 불필요 (기존 message.success('로그인 성공') 충족)

### 테스트 결과

- 신규 18개 테스트 추가 (announcement, header/D-08, MSW handler)
- 전체 98/98 테스트 통과

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] indexOf 테스트 로직 수정 — handleGoPortal vs handleLogout 충돌**
- **Found during:** Task 2 테스트 실행
- **Issue:** `header.test.ts`에서 `layoutContent.indexOf('window.close()')` 가 `handleLogout`의 `window.close()`(line 34)를 먼저 찾아 1304를 반환, `opener.focus()`의 1443보다 작아 테스트 실패. 코드 구현은 올바름.
- **Fix:** `handleGoPortal` 함수 시작 위치(indexOf('handleGoPortal'))부터 200자 블록을 슬라이싱하여 해당 범위 내에서 순서 검증
- **Files modified:** navy-admin/src/__tests__/portal/header.test.ts
- **Commit:** c4ffb10 (Task 2 커밋에 포함)

## Known Stubs

없음 — 공지사항 MSW Mock 데이터 3건이 완전히 와이어링되어 AnnouncementSection에 렌더링됨.

## Self-Check: PASSED

- FOUND: navy-admin/src/features/announcements/types.ts
- FOUND: navy-admin/src/features/announcements/hooks/useAnnouncements.ts
- FOUND: navy-admin/src/features/announcements/components/AnnouncementSection.tsx
- FOUND: navy-admin/src/shared/api/mocks/handlers/announcements.ts
- FOUND: navy-admin/src/__tests__/portal/announcement.test.ts
- FOUND: navy-admin/src/__tests__/portal/header.test.ts
- FOUND: commit 5f90235 (Task 1)
- FOUND: commit c4ffb10 (Task 2)
- 전체 98/98 테스트 통과

---

## GAP 수정 반영 (2026-04-07)

Plan 01 (대시보드/공지사항) 화면은 직접 수정 대상 아님. 공지사항 목록 테이블에 navy-bordered-table CSS가 자동 적용됨.
