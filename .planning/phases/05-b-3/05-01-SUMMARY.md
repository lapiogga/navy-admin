---
phase: 05-b-3
plan: "01"
subsystem: SYS07
tags: [군사자료관리, 보안등급, Steps워크플로우, 통계차트, 해기단]
dependency_graph:
  requires: [Phase 0 공통컴포넌트, Phase 1 공통기능]
  provides: [sys07 군사자료 40개 프로세스, sys07Handlers MSW]
  affects: [handlers/index.ts, menus.ts]
tech_stack:
  added: []
  patterns:
    - "보안등급 Tag 색상 분류 (red=비밀, orange=대외비, blue=일반)"
    - "Steps current 계산 함수 (pending→0, approved→1, on_loan→2, returned→3)"
    - "Upload.Dragger + bulk-validate + 검증결과 Modal 패턴"
    - "@ant-design/charts Column/Pie/Line/Bar 4종 차트"
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys07.ts
    - navy-admin/src/pages/sys07-mil-data/index.tsx
    - navy-admin/src/pages/sys07-mil-data/MilDataListPage.tsx
    - navy-admin/src/pages/sys07-mil-data/MilDataFormPage.tsx
    - navy-admin/src/pages/sys07-mil-data/MilDataDetailPage.tsx
    - navy-admin/src/pages/sys07-mil-data/MilDataEvalPage.tsx
    - navy-admin/src/pages/sys07-mil-data/MilDataUsagePage.tsx
    - navy-admin/src/pages/sys07-mil-data/MilDataStatsPage.tsx
    - navy-admin/src/pages/sys07-mil-data/HaegidanListPage.tsx
    - navy-admin/src/pages/sys07-mil-data/HaegidanFormPage.tsx
    - navy-admin/src/__tests__/sys07/military-data.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/entities/subsystem/menus.ts
decisions:
  - "sys07 관리자 대메뉴(코드관리/권한관리) Phase 1 공통 lazy import 재사용 — 규칙 7 준수"
  - "보안등급 경고는 Modal 내부 조건부 경고 배너로 구현 — 별도 Modal 없이 인라인 처리"
  - "평가심의 목록은 MilDataListPage 내부 Tabs 2탭으로 통합 — 라우트 분리 없음"
metrics:
  duration: "약 42분"
  completed_date: "2026-04-06"
  tasks: 2
  files: 13
requirements:
  - MDATA-01
  - MDATA-02
  - MDATA-03
  - MDATA-04
---

# Phase 5 Plan 01: SYS07 군사자료관리체계 Summary

보안등급 Tag 분류(비밀/대외비/일반), 열람/대출/반납 Steps 워크플로우, 일괄등록 Upload 검증 Modal, 통계 차트 4종, 해기단자료 CRUD+삭제사유 필수 구현 완료.

## 구현 내용

### Task 1: MSW 핸들러 + 목록/등록/상세/평가심의/해기단 (커밋 306f0ac)

- **sys07.ts MSW 핸들러**: 군사자료 30건 + 활용 20건 + 해기단 20건 Mock 데이터
  - CRUD, 일괄등록 검증/저장, 평가심의 결과 업로드, 통계 6종 API
- **handlers/index.ts**: sys07Handlers 등록
- **menus.ts**: sys07 관리자 대메뉴(코드관리/권한관리) 추가 — 규칙 7
- **index.tsx**: Routes 분기 (1/1~3/2)
- **MilDataListPage**: 보안등급 Tag + SearchForm + Upload.Dragger 일괄등록 + 검증결과 Modal + 평가심의 탭 + 인쇄 PrintableReport
- **MilDataFormPage**: 등록/수정 Form + retentionExtend 보존연장 조건부 표시
- **MilDataDetailPage**: Descriptions(12항목) + 변경이력 Table
- **MilDataEvalPage**: 평가심의 목록 + bulk-upload Modal
- **HaegidanListPage/FormPage**: 해기단자료 CRUD + deleteReason 필수 삭제 확인 Modal

### Task 2: 대출/열람 Steps 워크플로우 + 통계 차트 4종 (커밋 9762511)

- **MilDataUsagePage**:
  - Steps current prop: pending→0, approved→1, on_loan→2, returned→3
  - 비밀등급 경고 배너: secret/confidential 선택 시 경고 + usagePurpose required 전환
  - 관리자 액션: [승인][반려] → [대출처리] → [반납처리] 상태별 전환
- **MilDataStatsPage**:
  - Chart 1: Column (문서별 보유현황, color #003366)
  - Chart 2: Pie (등급별 현황, 3색)
  - Chart 3: Line (활용실적 추이, 3 series)
  - Chart 4: Bar (등급별/상태별, isStack) + Table 크로스탭
  - DataTable: 접수용관리기록부, 활용지원기록부
  - 인쇄 PrintableReport 미리보기

## 테스트 결과

- **28/28 테스트 통과** (readFileSync 기반 파일 내용 검증)
  - MSW 핸들러 7개
  - MilDataListPage 5개
  - MilDataFormPage 2개
  - MilDataDetailPage 2개
  - MilDataEvalPage 2개
  - HaegidanListPage 3개
  - index.tsx 라우트 2개
  - MilDataUsagePage 3개
  - MilDataStatsPage 2개

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ConfirmDialog 컴포넌트 API 불일치**
- **Found during:** Task 1
- **Issue:** Plan에서 `<ConfirmDialog open={...}>` JSX 패턴으로 작성했으나 실제 컴포넌트는 `showConfirmDialog()` 함수형 API
- **Fix:** Modal 컴포넌트로 직접 교체하여 삭제사유 TextArea 입력 포함 Modal 구현
- **Files modified:** MilDataListPage.tsx, HaegidanListPage.tsx

## Known Stubs

없음 - 모든 기능이 MSW Mock 데이터로 완전 동작.

## Self-Check: PASSED

- navy-admin/src/shared/api/mocks/handlers/sys07.ts: FOUND
- navy-admin/src/pages/sys07-mil-data/MilDataListPage.tsx: FOUND
- navy-admin/src/pages/sys07-mil-data/MilDataUsagePage.tsx: FOUND
- navy-admin/src/pages/sys07-mil-data/MilDataStatsPage.tsx: FOUND
- navy-admin/src/pages/sys07-mil-data/HaegidanListPage.tsx: FOUND
- 커밋 306f0ac: FOUND
- 커밋 9762511: FOUND
