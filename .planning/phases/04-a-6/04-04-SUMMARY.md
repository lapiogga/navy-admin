---
phase: 04-a-6
plan: "04"
subsystem: SYS02
tags: [survey, dnd-kit, charts, tabs, msw]
dependency_graph:
  requires: [Phase0-shared-ui, Phase1-board, Phase1-code-mgmt, Phase1-auth-group]
  provides: [SYS02-all-pages, SYS02-msw-handlers, SYS02-dnd-kit-pattern]
  affects: [handlers/index.ts, sys02-survey router]
tech_stack:
  added: ["@ant-design/charts", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"]
  patterns: [dnd-kit-sortable, ant-design-charts-bar, antd-tabs-6, msw-crud-handlers]
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys02.ts
    - navy-admin/src/__tests__/sys02/survey.test.ts
    - navy-admin/src/pages/sys02-survey/MySurveyPage.tsx
    - navy-admin/src/pages/sys02-survey/SurveyQuestionEditor.tsx
    - navy-admin/src/pages/sys02-survey/SurveyParticipationPage.tsx
    - navy-admin/src/pages/sys02-survey/SurveyFormPage.tsx
    - navy-admin/src/pages/sys02-survey/SurveyResultPage.tsx
    - navy-admin/src/pages/sys02-survey/PastSurveyPage.tsx
    - navy-admin/src/pages/sys02-survey/SurveyAdminPage.tsx
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/pages/sys02-survey/index.tsx
decisions:
  - "@ant-design/charts 설치: SurveyResultPage/SurveyAdminPage 차트 요구로 신규 패키지 추가"
  - "dnd-kit 드래그 패턴: SortableContext + useSortable + arrayMove로 문항 순서 관리"
  - "SurveyResultPage를 독립 컴포넌트로 분리: PastSurveyPage/SurveyAdminPage에서 Modal로 재사용"
metrics:
  duration: "35분"
  completed: "2026-04-06"
  tasks: 2
  files: 11
requirements:
  - SURV-01
  - SURV-02
  - SURV-03
  - SURV-04
  - SURV-05
  - SURV-06
  - SURV-07
---

# Phase 4 Plan 04: SYS02 설문종합관리체계 Summary

**One-liner:** dnd-kit 기반 드래그 문항 편집기 + @ant-design/charts Bar 결과분석 + 6탭 체계관리로 설문 전체 라이프사이클 구현

## Objective

SYS02 설문종합관리체계 31개 프로세스 구현. 설문 생성→배포→응답→결과분석 전체 라이프사이클 + SURV-04 체계관리 13개 프로세스 6탭으로 100% 커버.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | MSW 핸들러 + 나의설문관리 + 문항편집기 | (already in HEAD) | sys02.ts, MySurveyPage, SurveyQuestionEditor, survey.test.ts, handlers/index.ts |
| 2 | 설문참여/응답폼/결과분석/지난설문/체계관리/라우트 | 5137654 | SurveyParticipationPage, SurveyFormPage, SurveyResultPage, PastSurveyPage, SurveyAdminPage, index.tsx |

## Implementation Details

### MSW 핸들러 (sys02.ts)
- 29개 엔드포인트: 설문 CRUD + 상태전환 8개(submit/deploy/close/approve/reject/past/pending/all) + 문항 + 카테고리 + 템플릿 + 대상자 + 통계
- Mock 데이터: 설문 15건(6상태 분포), 카테고리 5건, 템플릿 5건, 대상자 50건, 응답 30건
- `extends Record<string, unknown>` 타입 패턴 준수

### MySurveyPage.tsx (SURV-02)
- DataTable + StatusBadge (6상태: draft/submitted/approved/rejected/active/closed)
- CrudForm: 설문명/내용/날짜/대상구분/공개여부/익명여부 (9개 필드)
- 상태 전환 Dropdown: 승인요청/배포/마감

### SurveyQuestionEditor.tsx (SURV-02 핵심)
- @dnd-kit/core DndContext + @dnd-kit/sortable SortableContext + useSortable
- SortableQuestionItem: HolderOutlined 드래그 핸들, isDragging opacity/border 효과
- arrayMove로 재정렬 + orderIndex 자동 재계산
- 4유형 편집: radio(선택지 Form.List)/checkbox/textarea/rate
- 좌우 분할 레이아웃 (Col 14/10)

### SurveyParticipationPage.tsx (SURV-01)
- active 설문만 목록 표시, 참여여부 StatusBadge
- 설문명 클릭 → SurveyFormPage로 navigate

### SurveyFormPage.tsx (SURV-01)
- 문항 유형별 동적 렌더링: Radio.Group / Checkbox.Group / TextArea / Rate
- 제출/임시저장 버튼, 제출 완료 시 Result status="success"

### SurveyResultPage.tsx (SURV-02/04)
- Statistic 3개: 총 대상자/응답자/응답률
- @ant-design/charts Bar: 객관식 옵션별 응답수/비율
- List: 주관식 텍스트 목록 (pagination)
- Rate + Bar: 평점 평균/분포
- isPublicResult=false → Result status="info" 비공개 처리

### PastSurveyPage.tsx (SURV-03)
- closed 상태 설문 목록 (GET /sys02/surveys/past)
- 공개 설문만 결과 조회 가능, Modal로 SurveyResultPage 재사용

### SurveyAdminPage.tsx (SURV-04 - 13개 프로세스 6탭 커버)
- Tab 1 승인대기: 승인/반려 버튼, 반려 사유 Modal
- Tab 2 전체설문관리: 상태별 필터 DataTable
- Tab 3 카테고리관리: CRUD CrudForm 패턴
- Tab 4 통계: Statistic 4개 + @ant-design/charts Bar (월별 추이)
- Tab 5 대상자관리: 설문 Select → 대상자 목록, 응답여부 StatusBadge
- Tab 6 설문템플릿: CRUD + 카테고리 연동 Select

### index.tsx 라우트 (9개)
- Navigate → /sys02/1/2 (나의설문관리)
- 1/1: BoardIndex (lazy, SURV-05)
- 1/2: MySurveyPage / 1/2/edit/:id: SurveyQuestionEditor
- 1/3: SurveyParticipationPage / 1/3/:id: SurveyFormPage
- 1/4: PastSurveyPage / 1/5: SurveyAdminPage
- 2/1: CodeMgmtIndex (lazy, SURV-06) / 2/2: AuthGroupIndex (lazy, SURV-07)

## Test Results

```
Test Files  1 passed (1)
     Tests  49 passed (49)
  Duration  3.55s
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @ant-design/charts 패키지 미설치**
- **Found during:** Task 1 (SurveyResultPage 구현 준비)
- **Issue:** SurveyResultPage와 SurveyAdminPage에서 Bar 차트를 위해 @ant-design/charts가 필요했으나 패키지가 설치되지 않은 상태
- **Fix:** `npm install @ant-design/charts --save` 실행
- **Files modified:** package.json

**2. [Rule 1 - Discovery] Task 1 파일들이 이미 HEAD에 존재**
- **Found during:** Task 1 커밋 시도
- **Issue:** 병렬 실행 중 다른 에이전트가 sys02.ts, MySurveyPage.tsx, SurveyQuestionEditor.tsx, survey.test.ts를 이미 커밋한 상태
- **Fix:** 기존 커밋된 파일 내용과 우리가 작성한 파일 내용이 동일하므로 Task 2 파일만 신규 커밋
- **Impact:** Task 1 커밋 해시 없음 (이미 다른 커밋에 포함)

## Known Stubs

없음. 모든 API 호출은 MSW 핸들러와 연결되어 있으며, UI 데이터는 실제 Mock 데이터를 사용.

## Self-Check: PASSED

- FOUND: navy-admin/src/pages/sys02-survey/MySurveyPage.tsx
- FOUND: navy-admin/src/pages/sys02-survey/SurveyQuestionEditor.tsx
- FOUND: navy-admin/src/pages/sys02-survey/SurveyParticipationPage.tsx
- FOUND: navy-admin/src/pages/sys02-survey/SurveyFormPage.tsx
- FOUND: navy-admin/src/pages/sys02-survey/SurveyResultPage.tsx
- FOUND: navy-admin/src/pages/sys02-survey/PastSurveyPage.tsx
- FOUND: navy-admin/src/pages/sys02-survey/SurveyAdminPage.tsx
- FOUND: navy-admin/src/pages/sys02-survey/index.tsx
- FOUND: navy-admin/src/shared/api/mocks/handlers/sys02.ts
- FOUND: navy-admin/src/__tests__/sys02/survey.test.ts
- FOUND commit: 5137654 (Task 2 - 7페이지 + 라우트)
- Tests: 49/49 PASSED
