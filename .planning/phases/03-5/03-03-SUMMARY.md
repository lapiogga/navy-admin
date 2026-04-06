---
phase: 03-5
plan: 03
subsystem: sys14-suggestion
tags: [나의제언, CRUD, 추천신고, 답변관리, MSW]
dependency_graph:
  requires: [Phase 0 공통 컴포넌트, Phase 1 공통 기능]
  provides: [sys14 나의제언 전체 화면]
  affects: []
tech_stack:
  added: []
  patterns: [DataTable+CrudForm CRUD, useMutation 독립 API 호출, Statistic 대시보드]
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys14.ts
    - navy-admin/src/pages/sys14-suggestion/SuggestionMainPage.tsx
    - navy-admin/src/pages/sys14-suggestion/SuggestionListPage.tsx
    - navy-admin/src/pages/sys14-suggestion/SuggestionAdminPage.tsx
    - navy-admin/src/__tests__/sys14/suggestion.test.ts
  modified:
    - navy-admin/src/pages/sys14-suggestion/index.tsx
    - navy-admin/src/shared/api/mocks/handlers/index.ts
decisions:
  - "[D-SUGST-01] 추천/신고를 독립 useMutation으로 구현 — 상세 Modal 내 버튼에서 별개 API 호출"
  - "[D-SUGST-02] 답변 영역을 상세 Modal 하단 회색 배경 박스로 구현 — 답변이 있는 경우만 표시"
  - "[D-SUGST-03] 관리자 답변 등록을 Modal + Input.TextArea 패턴으로 구현"
metrics:
  duration: 14m
  completed_date: "2026-04-05"
  tasks_completed: 2
  files_created: 5
  files_modified: 2
---

# Phase 03 Plan 03: 14_나의제언 Summary

제언 MSW 핸들러(11개 엔드포인트) + 메인화면(통계 4개+최신목록) + 제언확인(CRUD+추천/신고+답변표시) + 관리자(비공개+답변등록) 3개 고유 페이지를 구현하고 공통 기능(게시판/권한관리)을 Phase 1 공통 페이지로 연결.

## What Was Built

### sys14 MSW 핸들러 (`sys14.ts`)

25건 faker Mock 데이터 (status 분포: open 60%, answered 30%, closed 10%)로 11개 엔드포인트 구현:
- `GET /api/sys14/suggestions/stats` — 통계 (total/thisMonth/answered/pending)
- `GET /api/sys14/suggestions/recent` — 최신 5건
- `GET /api/sys14/suggestions` — 목록 (keyword/status 필터 + 페이지네이션)
- `GET /api/sys14/suggestions/:id` — 상세 단건
- `POST /api/sys14/suggestions` — 등록
- `PUT /api/sys14/suggestions/:id` — 수정
- `DELETE /api/sys14/suggestions/:id` — 삭제
- `POST /api/sys14/suggestions/:id/recommend` — 추천 +1
- `POST /api/sys14/suggestions/:id/report` — 신고 +1
- `PATCH /api/sys14/suggestions/:id/private` — 비공개 처리
- `PATCH /api/sys14/suggestions/:id/answer` — 관리자 답변 등록

### SuggestionMainPage (`/sys14/1/1`)

- Row/Col + Card + Statistic 4개 (전체/이번달/답변완료/처리대기)
- 최신 제언 antd List (5건, StatusBadge + 전체보기 버튼)
- useQuery로 stats/recent API 호출

### SuggestionListPage (`/sys14/1/3`)

- DataTable 제언 목록 (6개 컬럼, StatusBadge)
- "제언 작성" 버튼 → Modal + CrudForm
- 행 클릭 → 상세 Modal (Descriptions)
- 추천(LikeOutlined) / 신고(WarningOutlined) 독립 버튼
- 답변 있을 때 회색 박스 하단 표시
- 수정/삭제 + invalidateQueries

### SuggestionAdminPage (`/sys14/1/4`)

- DataTable (비공개 여부 Tag 컬럼 포함)
- 비공개 버튼 → Popconfirm → PATCH /private
- 답변 버튼 → Modal + Input.TextArea → PATCH /answer
- message.success 피드백

### index.tsx 라우팅

- `/sys14/1/1` 기본 리다이렉트
- `/sys14/1/2` 공지사항 → BoardIndex (Phase 1 공통)
- `/sys14/2/1` 권한관리 → AuthGroupIndex (Phase 1 공통)

## Test Results

- `src/__tests__/sys14/suggestion.test.ts`: **32개 모두 통과**
- `npx tsc --noEmit`: **에러 0건**
- 전체 regression: **248 tests passed**

## Deviations from Plan

None - 플랜대로 정확히 실행됨.

## Known Stubs

없음. 모든 API는 MSW 핸들러로 연결되어 있으며 통계/목록/상세가 실제 데이터를 반환함.

## Self-Check: PASSED

파일 존재 확인:
- navy-admin/src/shared/api/mocks/handlers/sys14.ts: FOUND
- navy-admin/src/pages/sys14-suggestion/SuggestionMainPage.tsx: FOUND
- navy-admin/src/pages/sys14-suggestion/SuggestionListPage.tsx: FOUND
- navy-admin/src/pages/sys14-suggestion/SuggestionAdminPage.tsx: FOUND
- navy-admin/src/__tests__/sys14/suggestion.test.ts: FOUND

커밋 존재 확인:
- 248e0f8: feat(03-03): 14_나의제언 구현 — FOUND
