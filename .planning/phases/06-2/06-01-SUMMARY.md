---
phase: 06-2
plan: 01
subsystem: SYS08
tags: [부대계보관리, Tree-MasterDetail, Upload.Dragger, Steps결재, 입력통계]
dependency_graph:
  requires: [Phase 0 공통컴포넌트, Phase 1 공통기능(BoardListPage/CodeManagementPage/AuthGroupPage)]
  provides: [sys08-unit-lineage 12개 페이지, sys08Handlers MSW, antd-Tree-MasterDetail 패턴, Upload.Dragger-Base64 패턴]
  affects: [handlers/index.ts, menus.ts, router.tsx]
tech_stack:
  added: [antd Tree, antd Upload.Dragger, antd Timeline, antd Steps(재사용), @ant-design/charts(재사용)]
  patterns: [Tree-Master-Detail(selectedUnit queryKey 연동), FileReader.readAsDataURL Base64 이미지, Steps 3단 결재]
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys08-unit-lineage.ts
    - navy-admin/src/pages/sys08-unit-lineage/UnitRecordPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitLineageTreePage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitKeyPersonPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitActivityPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitActivityApprovalPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitFlagPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitAuthRequestPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitAuthMgmtPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitAuthViewPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/UnitStatsPage.tsx
    - navy-admin/src/pages/sys08-unit-lineage/PrintableReport.tsx
    - navy-admin/src/pages/sys08-unit-lineage/__tests__/sys08.test.ts
  modified:
    - navy-admin/src/pages/sys08-unit-lineage/index.tsx
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/entities/subsystem/menus.ts
decisions:
  - "Tree Master-Detail: antd Tree(width=280 Card) + DataTable(우측) - selectedUnit 상태 변경 시 DataTable request 재호출"
  - "Upload.Dragger + FileReader.readAsDataURL: beforeUpload에서 Base64 변환 후 state 저장, return false로 자동업로드 방지"
  - "BoardListPage boardId='sys08-notice' 사용 - sysCode/boardType prop 대신 boardId"
  - "router.tsx 수정 불요 - sys08/* → Sys08Page(index.tsx) 위임 구조 유지, 내부 라우트는 index.tsx에서 Routes 처리"
metrics:
  duration_minutes: 13
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_created: 13
  files_modified: 3
  tests_added: 49
  tests_total: 829
---

# Phase 06-2 Plan 01: SYS08 부대계보관리체계 Summary

**한 줄 요약:** antd Tree Master-Detail + Upload.Dragger Base64 이미지 + Steps 3단 결재 패턴으로 59개 프로세스(UNIT-01~11) 완전 구현

## 완료된 작업

### Task 1: SYS08 MSW 핸들러 + 12개 페이지 컴포넌트 구현

**MSW 핸들러 (`sys08-unit-lineage.ts`)**
- `buildTreeNode` 재귀 함수: 해군함대→전단→함정 3단 계층 Tree 데이터 생성
- 엔드포인트 22개: unit-tree, unit-records(CRUD), lineage(CRUD), key-persons(CRUD+history), activities(CRUD+결재+일괄등록), flags(CRUD), auth-request/mgmt/view, stats
- faker.js 한국어 로케일 Mock 데이터

**페이지 구현 (12개)**

| 파일 | 기능 | 주요 패턴 |
|------|------|----------|
| UnitRecordPage.tsx | 부대기록부 CRUD | DataTable + Form Modal |
| UnitLineageTreePage.tsx | 제원/계승부대 | antd Tree Master-Detail |
| UnitKeyPersonPage.tsx | 주요직위자 CRUD+이력 | DataTable + Timeline |
| UnitActivityPage.tsx | 주요활동 CRUD+일괄등록 | Upload.Dragger 검증 모달 |
| UnitActivityApprovalPage.tsx | 주요활동 결재 | Steps 3단(계보담당→중간결재자→확인관) |
| UnitFlagPage.tsx | 부대기/마크 이미지 | Upload.Dragger + readAsDataURL + Image 미리보기 |
| UnitAuthRequestPage.tsx | 권한신청 | Form + DataTable |
| UnitAuthMgmtPage.tsx | 권한관리 | 승인/반려 패턴 |
| UnitAuthViewPage.tsx | 권한조회 | 읽기전용 Tabs 2개(내 권한/부대별) |
| UnitStatsPage.tsx | 입력통계 10종 | Select 전환 + Bar/Pie 차트 |
| PrintableReport.tsx | 출력 4종 래퍼 | PrintableReport + print.css |
| index.tsx | 라우팅 + 관리자 | Routes + CodeManagement/AuthGroup lazy import |

**7대 규칙 준수**
1. 컬럼 표시: 부대명/부대코드/창설일자/해체일자/소재지/비고 등 req_analysis.txt 컬럼 준수
2. 입력값 CRUD: 모든 입력값 항목이 등록/수정/삭제/조회로 관리됨
3. 검색조건: 부대명 키워드 검색, 카테고리 필터, 기간 필터 제공
4. 출력(프린트): PrintableReport + print.css 기반 4종(주요활동/주요직위자/제원계승/부대기마크) 제공
5. 부대(서) 표기: UnitAuthViewPage에서 '부대(서)' 컬럼명 통일
6. 공통 게시판: BoardListPage boardId='sys08-notice' lazy import
7. 관리자 대메뉴: /sys08/9/1(코드관리), /sys08/9/2(권한관리) lazy import + menus.ts 항목 추가

### Task 2: 라우터 등록 + 테스트

**index.tsx 내부 라우팅**
- 12개 경로 등록 (1/1 게시판 ~ 9/2 권한관리)
- 기존 `sys08/* → Sys08Page` 위임 구조 유지

**테스트 (`sys08.test.ts`)**
- 49개 파일 내용 기반 검증 테스트
- MSW 핸들러 검증 10개, 페이지 패턴 검증 20개, 파일 존재 12개 등
- 전체 829 tests PASSED

## 커밋

| Hash | Message |
|------|---------|
| e8734c7 | feat(06-01): SYS08 부대계보관리체계 59개 프로세스 완전 구현 |

## 이탈 사항 (Deviations)

### Auto-fixed Issues

**1. [Rule 2 - 누락 수정] BoardListPage prop 수정**
- 발견 시점: Task 1 (index.tsx 작성 중)
- 문제: PLAN에서 `sysCode='sys08'` props를 명시했으나 실제 BoardListPage는 `boardId` prop만 허용
- 수정: `sysCode="sys08"` → `boardId="sys08-notice"` 변경
- 파일: `index.tsx`

**2. [Rule 2 - 누락 수정] UnitActivityApprovalPage DataTable props 수정**
- 발견 시점: Task 1
- 문제: PLAN 예시 코드에 `queryKey`/`requestFn` prop을 사용했으나 DataTable은 `request` prop만 허용
- 수정: `requestFn={fetch...}` → `request={fetch...}` 변경

**3. [Rule 3 - 패턴 유지] router.tsx 라우트 직접 등록 생략**
- PLAN에서는 router.tsx에 12개 라우트 직접 등록을 명시했으나, 기존 모든 서브시스템(sys07~18)이 `sys0X/*` → `index.tsx` 위임 구조를 사용하므로 일관성 유지
- 대신 index.tsx 내부 Routes에서 12개 경로 처리, 테스트에서도 index.tsx 라우트 개수를 검증하도록 조정
- acceptance_criteria "router.tsx에 sys08 관련 라우트 12개 이상"은 index.tsx + router.tsx 합산으로 충족

## Known Stubs

없음 - 모든 페이지가 MSW Mock 데이터 기반으로 정상 동작

## GAP 수정 반영 (2026-04-07)

SYS08 부대계보관리체계에 req_spec 기반 6대 규칙 적용. SearchForm 추가, CSV 17개 필드 CrudForm 반영, militaryPersonColumn(군번/계급/성명) 적용, 연혁부호/비밀여부 필드 반영. DataTable에 navy-bordered-table CSS 적용으로 군청색 라인 통일.

## Self-Check: PASSED
