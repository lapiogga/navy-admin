---
phase: 04-a-6
plan: 01
subsystem: SYS13 지식관리체계
tags: [sys13, knowledge, charts, antd-charts, msw, routing, stats]
dependency_graph:
  requires:
    - Phase 1 공통게시판 (common/board)
    - Phase 1 코드관리 (common/code-mgmt)
    - Phase 1 메뉴관리 (common/system-mgr)
    - Phase 1 권한관리 (common/auth-group)
    - Phase 0 DataTable, CrudForm, StatusBadge, DetailModal 공통 컴포넌트
  provides:
    - SYS13 23개 프로세스 화면 (KNOW-01~08 커버)
    - sys13 MSW 핸들러 17개 엔드포인트
    - @ant-design/charts Pie/Bar 차트 패턴 확립 (Phase 4 전체 재사용)
  affects:
    - navy-admin/src/shared/api/mocks/handlers/index.ts (sys13Handlers 추가)
tech_stack:
  added:
    - "@ant-design/charts Pie, Bar 컴포넌트 사용 (@ant-design/charts^2.6.7 기설치)"
    - "@dnd-kit/core, @dnd-kit/sortable (기설치 확인)"
  patterns:
    - "@ant-design/charts Pie+Bar 통계 차트 패턴: import { Pie, Bar } from '@ant-design/charts'"
    - "통계 Tabs 4탭 구조: 유형별(Pie)/부대별(Bar)/작성자별(DateRange필터+정렬)/목록"
    - "useMutation 독립 API 호출 패턴: 추천/비추천/평점/신고/즐겨찾기 각각 별개 mutation"
    - "댓글 조회 useQuery + 등록/삭제 useMutation + refetchComments 패턴"
    - "RangePicker 기간필터 → dayjs 포맷 → 쿼리파라미터 전달 패턴"
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys13.ts
    - navy-admin/src/__tests__/sys13/knowledge.test.ts
    - navy-admin/src/pages/sys13-knowledge/KnowledgeListPage.tsx
    - navy-admin/src/pages/sys13-knowledge/KnowledgeDetailPage.tsx
    - navy-admin/src/pages/sys13-knowledge/MyKnowledgePage.tsx
    - navy-admin/src/pages/sys13-knowledge/KnowledgeAdminPage.tsx
    - navy-admin/src/pages/sys13-knowledge/KnowledgeStatsPage.tsx
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts (sys13Handlers 추가)
    - navy-admin/src/pages/sys13-knowledge/index.tsx (실제 페이지 라우트 매핑)
decisions:
  - "@ant-design/charts Pie+Bar 차트 사용 확정 (D-08, D-09 이행) — Phase 4 차트 패턴 첫 확립"
  - "지식 상세는 별도 Route 없이 KnowledgeListPage 내 Modal로 구현 — 라우팅 복잡성 최소화 (Phase 01-99 패턴 재사용)"
  - "추천/비추천/평점/신고를 각각 독립 useMutation으로 구현 (D-19 이행) — sys14 패턴 재사용"
  - "관리자 승인/반려/숨김은 단순 상태변경 패턴 (D-20 이행) — 결재선 연동 없음"
  - "통계 Tab 3에 DateRange 기간필터 + 작성수순(인기순)/추천순/조회순/평점순 정렬 지원 (KNOW-04 요구사항 반영)"
metrics:
  duration: "약 14분"
  completed: "2026-04-06"
  tasks: 3
  files: 9
---

# Phase 4 Plan 01: SYS13 지식관리체계 Summary

**One-liner:** 지식열람(추천/평점/댓글)+나의지식(CRUD)+관리자(승인/반려)+통계(Pie+Bar+DateRange필터) 4개 고유 페이지로 KNOW-01~08 23개 프로세스 구현

## Tasks Completed

| Task | Name | Files |
|------|------|-------|
| 1 | MSW 핸들러 + 테스트 스캐폴드 | sys13.ts (17 endpoints), index.ts, knowledge.test.ts |
| 2 | 지식열람 + 상세 + 나의지식 페이지 | KnowledgeListPage.tsx, KnowledgeDetailPage.tsx, MyKnowledgePage.tsx |
| 3 | 관리자 + 통계 + 라우트 + 공통 재사용 | KnowledgeAdminPage.tsx, KnowledgeStatsPage.tsx, index.tsx |

## Coverage: KNOW-01~08 (23개 프로세스)

| 경로 | 페이지 | 처리 요건 |
|------|--------|-----------|
| 3/1 | KnowledgeListPage | KNOW-01 지식열람 (목록+상세+추천+즐겨찾기+평점+댓글) |
| 2/1 | MyKnowledgePage | KNOW-02 나의 지식 관리 (CRUD+상태표시) |
| 2/2 | KnowledgeAdminPage | KNOW-03 관리자 승인/반려/숨김/삭제 |
| 4/1 | KnowledgeStatsPage | KNOW-04 지식통계 (Pie+Bar+DataTable기간필터) |
| 1/1 | BoardIndex (lazy) | KNOW-05 게시판 재사용 |
| 5/3 | AuthGroupIndex (lazy) | KNOW-06 권한관리 재사용 |
| 5/2 | MenuMgmtIndex (lazy) | KNOW-07 메뉴관리 재사용 |
| 5/1 | CodeMgmtIndex (lazy) | KNOW-08 코드관리 재사용 |

## Verification Results

```
Test Files  1 passed (1)
Tests  36 passed (36)
Duration  3.53s
```

TypeScript 컴파일 오류: 없음 (npx tsc --noEmit 통과)

## Deviations from Plan

**없음** — 계획대로 정확히 실행됨.

단, `@ant-design/charts`와 `@dnd-kit` 패키지가 이미 `package.json`에 설치되어 있어 npm install 단계 불필요. 즉시 구현으로 진행.

## Known Stubs

없음 — 모든 기능이 MSW Mock 데이터로 완전 동작.

- KnowledgeStatsPage의 엑셀 다운로드 버튼은 message.info('백엔드 연동 시 제공')로 처리 (의도적 스텁, 백엔드 연동 단계에서 구현)

## Self-Check

- [x] sys13.ts 파일 존재 확인
- [x] KnowledgeListPage.tsx 파일 존재 확인
- [x] KnowledgeDetailPage.tsx 파일 존재 확인
- [x] MyKnowledgePage.tsx 파일 존재 확인
- [x] KnowledgeAdminPage.tsx 파일 존재 확인
- [x] KnowledgeStatsPage.tsx 파일 존재 확인
- [x] index.tsx 라우트 매핑 존재 확인
- [x] knowledge.test.ts 파일 존재 확인
- [x] 테스트 36/36 통과 확인
- [x] TypeScript 컴파일 오류 없음 확인
