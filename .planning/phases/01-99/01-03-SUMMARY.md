---
phase: 01-99
plan: 03
subsystem: 공통기능 (99)
tags: [결재선관리, 시스템관리, Transfer, CSV, MSW, CRUD]
dependency_graph:
  requires: [01-01, 01-02]
  provides: [approval-entity, approval-api, csv-util, approval-msw, system-msw, approval-page, system-mgr-page]
  affects: [common-routing, common-handlers]
tech_stack:
  added: []
  patterns:
    - Transfer 컴포넌트 + orderedApproverIds 분리 상태 관리 (결재자 순서 보존)
    - downloadCsv 유틸 (BOM 포함, 엑셀 한글 깨짐 방지)
    - antd Tabs type="line" + 하위 컴포넌트 Named Export 패턴
    - antd Tree + 우측 선택 상세/수정 폼 (메뉴 트리)
key_files:
  created:
    - navy-admin/src/entities/approval/types.ts
    - navy-admin/src/entities/approval/api.ts
    - navy-admin/src/entities/approval/index.ts
    - navy-admin/src/shared/lib/csv.ts
    - navy-admin/src/shared/api/mocks/handlers/common/approval.ts
    - navy-admin/src/shared/api/mocks/handlers/common/system.ts
    - navy-admin/src/pages/common/approval/ApprovalLinePage.tsx
    - navy-admin/src/pages/common/system-mgr/index.tsx
    - navy-admin/src/pages/common/system-mgr/SystemManagerPage.tsx
    - navy-admin/src/pages/common/system-mgr/MenuManagementPage.tsx
    - navy-admin/src/pages/common/system-mgr/MessageManagementPage.tsx
    - navy-admin/src/pages/common/system-mgr/AccessLogPage.tsx
    - navy-admin/src/pages/common/system-mgr/ErrorLogPage.tsx
    - navy-admin/src/__tests__/common/approval.test.ts
    - navy-admin/src/__tests__/common/downloadCsv.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/common/index.ts
    - navy-admin/src/pages/common/index.tsx
decisions:
  - Transfer + orderedApproverIds 분리: Transfer targetKeys만으로는 순서 유지 불가. RESEARCH Pitfall 3 대응으로 별도 상태 관리
  - system.ts 단일 파일 집약: 5개 도메인을 한 파일에 섹션 주석으로 구분 (관련 핸들러가 적고 도메인 간 공유 상수 있음)
  - approvalHandlers + systemHandlers 무조건 등록: wave 3 의존성(01-01, 01-02)이 충족된 상태이므로 조건부 처리 불필요
metrics:
  duration_minutes: 30
  completed_date: "2026-04-05"
  tasks_completed: 3
  tasks_total: 3
  files_created: 15
  files_modified: 2
---

# Phase 01 Plan 03: 결재선관리 + 시스템관리 Summary

결재선 CRUD(Transfer 결재자 선택 + 순서 지정), 시스템관리 5개 탭(체계담당자/메뉴/메시지/접속로그/장애로그), CSV 내보내기 유틸을 구현하여 COM-01~COM-06 요구사항을 완성했다.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | 결재선 entity/API, CSV 유틸, MSW 핸들러, 테스트 스캐폴드 | c970e34 | 9개 파일 생성 |
| 2 | 결재선 관리 페이지 (Transfer + 순서 지정) | 56bffbb | 1개 파일 생성 |
| 3 | 시스템관리 5개 탭 페이지 + 라우팅 연결 | 57430e5 | 7개 파일 생성/수정 |

## What Was Built

**결재선 관리 (COM-06):**
- `ApprovalLine` / `Approver` 타입 및 `approvalLineApi` CRUD (list/detail/create/update/delete)
- MSW 핸들러: 15개 Mock 결재선, 50명 Mock 사용자 목록 (`/api/common/users`)
- UI: Transfer `showSearch` + 결재자 순서 List + 위/아래 버튼
- 빈 상태: "결재자를 추가하세요" / 안내 메시지 포함

**CSV 유틸 (`downloadCsv`):**
- BOM(`\uFEFF`) 포함으로 엑셀 한글 깨짐 방지
- 파일명 패턴: `접속로그_YYYYMMDD.csv`

**시스템관리 (COM-01~05):**
- `index.tsx`: Tabs `type="line"` 5개 탭
- `SystemManagerPage`: 체계담당자 DataTable + CrudForm CRUD
- `MenuManagementPage`: antd Tree 계층 조회 + 우측 수정 폼 + 메뉴 추가 모달
- `MessageManagementPage`: 메시지 코드/내용 CRUD (INFO/WARN/ERROR)
- `AccessLogPage`: 읽기전용 + "저장(CSV)" 버튼 + DetailModal 행 클릭 상세
- `ErrorLogPage`: 읽기전용 DataTable

**라우팅:**
- `/common/approval` → `ApprovalLinePage` (lazy)
- `/common/system-mgr` → `SystemMgrIndex` (lazy)

## Verification Results

- TypeScript noEmit: 0 errors
- Tests: 58개 전체 통과 (approval.test.ts 4개 + downloadCsv.test.ts 2개 포함)

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - 모든 UI가 MSW Mock 데이터와 연결되어 실제 API 패턴과 동일하게 동작한다.

## Self-Check: PASSED

Files verified:
- navy-admin/src/entities/approval/types.ts: FOUND
- navy-admin/src/entities/approval/api.ts: FOUND
- navy-admin/src/shared/lib/csv.ts: FOUND
- navy-admin/src/pages/common/approval/ApprovalLinePage.tsx: FOUND
- navy-admin/src/pages/common/system-mgr/index.tsx: FOUND
- navy-admin/src/shared/api/mocks/handlers/common/index.ts: approvalHandlers + systemHandlers 포함

Commits verified:
- c970e34: Task 1 (entity/MSW/tests)
- 56bffbb: Task 2 (ApprovalLinePage)
- 57430e5: Task 3 (system-mgr pages + routing)

---

## GAP 수정 반영 (2026-04-07)

Plan 03 (결재관리/시스템관리) 화면은 직접 수정 대상 아님. 공통 컴포넌트 강화(DataTable CSS, SearchForm wrapper)가 자동 적용됨.
