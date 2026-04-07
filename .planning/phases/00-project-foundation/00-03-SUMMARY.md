---
phase: 00-project-foundation
plan: 03
subsystem: shared-ui
tags: [antd, pro-components, msw, react-router, vitest, common-components]

# Dependency graph
requires:
  - "00-01 (Vite+FSD 기반, Vitest 인프라, MSW placeholder, axios 클라이언트)"
  - "00-02 (Zustand authStore, MSW authHandlers, ROUTES 경로 상수, React Router 라우팅)"
provides:
  - "DataTable: ProTable 래퍼, PageRequest 0-based 변환, 페이지네이션+정렬 내장"
  - "CrudForm: ProForm 래퍼, create/edit/view 모드, 동적 필드 렌더링"
  - "DetailModal: Modal+Descriptions 읽기 전용 상세 모달"
  - "SearchForm: antd Form+Row/Col 검색 폼, IME Enter 가드(useEnterSubmit) 적용"
  - "StatusBadge: antd Tag 기반 5종 상태 배지 (승인/반려/대기/완료/진행)"
  - "showConfirmDialog: Modal.confirm 래퍼 함수형 API"
  - "shared/ui 배럴 export (단일 import 지점)"
  - "MSW demoHandlers (/api/demo/items GET/POST/DELETE, faker.js 87건)"
  - "DemoPage (/demo): 6개 컴포넌트 MSW 연동 통합 데모"
  - "docs/URL-CONVENTION.md: /sys{번호} 패턴, 18개 서브시스템, /common/* 경로 문서"
affects:
  - "phase-1 (공통 기능 82개 화면이 DataTable, SearchForm, CrudForm 재사용)"
  - "phase-2 (메인 포탈 화면이 공통 컴포넌트 사용)"
  - "all-phases (845개 화면 공통 컴포넌트 재사용 — Phase 0 frozen contract)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DataTable<T extends Record<string, unknown>>: 제네릭 ProTable 래퍼, page 0-based 변환"
    - "CrudForm mode prop: create/edit/view 모드로 submitter 조건부 렌더링"
    - "showConfirmDialog 함수형 API: React 컴포넌트 비의존 Modal.confirm 래퍼"
    - "SearchForm + useEnterSubmit: 한글 IME Enter 이중 발화 방지 (D-24 적용)"
    - "shared/ui/index.ts 배럴 export: 모든 공통 컴포넌트를 단일 import로 접근"

key-files:
  created:
    - marine-admin/src/shared/ui/DataTable/DataTable.tsx
    - marine-admin/src/shared/ui/DataTable/DataTable.test.tsx
    - marine-admin/src/shared/ui/DataTable/index.ts
    - marine-admin/src/shared/ui/CrudForm/CrudForm.tsx
    - marine-admin/src/shared/ui/CrudForm/index.ts
    - marine-admin/src/shared/ui/DetailModal/DetailModal.tsx
    - marine-admin/src/shared/ui/DetailModal/index.ts
    - marine-admin/src/shared/ui/SearchForm/SearchForm.tsx
    - marine-admin/src/shared/ui/SearchForm/index.ts
    - marine-admin/src/shared/ui/StatusBadge/StatusBadge.tsx
    - marine-admin/src/shared/ui/StatusBadge/StatusBadge.test.tsx
    - marine-admin/src/shared/ui/StatusBadge/index.ts
    - marine-admin/src/shared/ui/ConfirmDialog/ConfirmDialog.tsx
    - marine-admin/src/shared/ui/ConfirmDialog/index.ts
    - marine-admin/src/shared/ui/index.ts
    - marine-admin/src/shared/api/mocks/handlers/demo.ts
    - marine-admin/src/pages/portal/DemoPage.tsx
    - marine-admin/docs/URL-CONVENTION.md
  modified:
    - marine-admin/src/shared/api/mocks/handlers/index.ts
    - marine-admin/src/app/router.tsx

key-decisions:
  - "Phase 0 frozen contract 확립: shared/ui 6개 컴포넌트 인터페이스를 이 시점에서 동결 — 845개 화면에서 재사용"
  - "DataTable page 변환: ProTable current(1-based) -> PageRequest page(0-based) 내부 처리 — 호출 측 변환 불필요"
  - "showConfirmDialog 함수형 API: React 컴포넌트 외부에서도 호출 가능한 순수 함수 패턴"

requirements-completed:
  - BASE-07
  - BASE-09

# Metrics
duration: 7min
completed: 2026-04-05
---

# Phase 00 Plan 03: 공통 UI 컴포넌트 라이브러리 Summary

**ProTable/ProForm/antd 기반 6개 공통 UI 컴포넌트(DataTable, CrudForm, DetailModal, SearchForm, StatusBadge, ConfirmDialog) 구현 및 shared/ui 배럴 export 확립, MSW faker.js 87건 데모 핸들러, /demo 라우트 통합 데모 페이지, docs/URL-CONVENTION.md 경로 규칙 문서화 — 전체 29개 단위 테스트 통과**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-05T01:47:29Z
- **Completed:** 2026-04-05T01:54:50Z
- **Tasks:** 2 (+ checkpoint)
- **Files modified:** 20

## Accomplishments

- DataTable: ProTable 래퍼, params.current(1-based)→page(0-based) 자동 변환, 페이지네이션+정렬 내장
- CrudForm: ProForm 래퍼, create/edit/view 3가지 모드, text/textarea/select/date/number 5종 필드 지원
- DetailModal: antd Modal+Descriptions 읽기 전용 모달, 커스텀 render 함수 지원
- SearchForm: antd Form+Row/Col 반응형 레이아웃, useEnterSubmit IME 가드 적용, 검색/초기화 버튼
- StatusBadge: 5종 기본 상태 (승인/반려/대기/완료/진행) colorMap, 커스텀 확장 가능
- showConfirmDialog: Modal.confirm 함수형 래퍼, danger 옵션 지원
- shared/ui/index.ts: 단일 import 지점 (`import { DataTable, CrudForm, ... } from '@/shared/ui'`)
- MSW demoHandlers: faker.js 한국어 로케일 87건 데이터, 키워드 필터링, 페이지네이션
- DemoPage: 6개 컴포넌트 완전 통합 데모, MSW Mock 데이터 연동 확인 가능
- docs/URL-CONVENTION.md: /sys{번호} 패턴, 18개 서브시스템 대응표, /common/* 경로, frozen contract 항목

## Task Commits

1. **Task 1: 공통 UI 컴포넌트 6개 구현 + 단위 테스트** - `5d7ba12` (feat)
2. **Task 2: 데모 페이지 + MSW 데모 핸들러 + URL 컨벤션 문서** - `f1e2d96` (feat)

## Files Created/Modified

- `marine-admin/src/shared/ui/DataTable/DataTable.tsx` — ProTable 래퍼, 제네릭 DataTableProps
- `marine-admin/src/shared/ui/DataTable/DataTable.test.tsx` — DataTable export 검증 테스트
- `marine-admin/src/shared/ui/CrudForm/CrudForm.tsx` — ProForm 래퍼, CrudFormField 동적 렌더링
- `marine-admin/src/shared/ui/DetailModal/DetailModal.tsx` — Modal+Descriptions 상세 모달
- `marine-admin/src/shared/ui/SearchForm/SearchForm.tsx` — IME 가드 검색 폼
- `marine-admin/src/shared/ui/StatusBadge/StatusBadge.tsx` — antd Tag 상태 배지
- `marine-admin/src/shared/ui/StatusBadge/StatusBadge.test.tsx` — 4개 단위 테스트
- `marine-admin/src/shared/ui/ConfirmDialog/ConfirmDialog.tsx` — showConfirmDialog 함수
- `marine-admin/src/shared/ui/index.ts` — 6개 컴포넌트 배럴 export
- `marine-admin/src/shared/api/mocks/handlers/demo.ts` — faker.js 87건 데모 핸들러
- `marine-admin/src/shared/api/mocks/handlers/index.ts` — demoHandlers spread 추가
- `marine-admin/src/pages/portal/DemoPage.tsx` — 6개 컴포넌트 통합 데모 페이지
- `marine-admin/src/app/router.tsx` — { path: 'demo', element: withSuspense(DemoPage) } 추가
- `marine-admin/docs/URL-CONVENTION.md` — URL 경로 규칙 및 frozen contract 문서

## Decisions Made

- **Phase 0 frozen contract 확립**: shared/ui 6개 컴포넌트 인터페이스를 이 시점에서 동결. 이후 845개 화면이 이 인터페이스에 의존하므로 Phase 0 이후 Props 변경 금지.
- **DataTable page 변환 내부화**: ProTable은 1-based current를 사용하지만 Spring Boot 관례는 0-based. DataTable 내부에서 변환 처리하여 호출 측에서는 PageRequest(0-based)만 신경 쓰면 됨.
- **showConfirmDialog 함수형 API**: React 컴포넌트가 아닌 순수 함수로 구현하여 이벤트 핸들러에서 직접 호출 가능.

## Deviations from Plan

None — 계획대로 정확히 실행.

## Known Stubs

없음 — 모든 공통 컴포넌트가 실제 MSW Mock 데이터와 연동되어 동작함.

## Awaiting User Verification (Task 3)

브라우저에서 다음 항목을 검증 대기 중:

1. `npm run dev` 실행 후 http://localhost:5173 접속 — /login 리다이렉트 확인
2. admin / 1234 로그인 — 포탈 대시보드 이동 확인
3. /demo URL 접속 — 데모 페이지 표시 확인
4. DataTable에 Mock 데이터(87건) 페이지네이션 표시 확인
5. SearchForm 검색 — 테이블 필터링 확인
6. 행 상세 클릭 — DetailModal 팝업 확인
7. 등록 버튼 — CrudForm 표시 확인
8. StatusBadge 5종 색상 확인
9. 삭제 클릭 — ConfirmDialog 팝업 확인
10. 로그아웃 — /login 이동 확인

## Self-Check: PASSED

- FOUND: marine-admin/src/shared/ui/DataTable/DataTable.tsx
- FOUND: marine-admin/src/shared/ui/CrudForm/CrudForm.tsx
- FOUND: marine-admin/src/shared/ui/DetailModal/DetailModal.tsx
- FOUND: marine-admin/src/shared/ui/SearchForm/SearchForm.tsx
- FOUND: marine-admin/src/shared/ui/StatusBadge/StatusBadge.tsx
- FOUND: marine-admin/src/shared/ui/ConfirmDialog/ConfirmDialog.tsx
- FOUND: marine-admin/src/shared/ui/index.ts
- FOUND: marine-admin/src/shared/api/mocks/handlers/demo.ts
- FOUND: marine-admin/src/pages/portal/DemoPage.tsx
- FOUND: marine-admin/docs/URL-CONVENTION.md
- FOUND commit 5d7ba12: Task 1
- FOUND commit f1e2d96: Task 2
- TypeScript noEmit: 0 errors
- Vitest: 29/29 tests passed
- shared/ui/index.ts: 6개 컴포넌트 모두 배럴 export 확인

---

## GAP 수정 반영 (2026-04-07)

Plan 03에서 제공한 공통 UI 컴포넌트가 GAP 분석에 따라 강화되었다. 기존 provides 목록은 유효하며, 아래 변경사항이 추가됨.

### 공통 컴포넌트 변경 사항

- **DataTable**: `navy-bordered-table` CSS 클래스 자동 적용 (군청색 상단 2px/하단 1px 보더)
- **SearchForm**: `search-form-container` wrapper div 추가 (height 100px, background #fafafa, 고정 검색 영역)
- **CrudForm**: `file` (ProFormUploadButton), `dateRange` (ProFormDateRangePicker), `checkbox` (ProFormCheckbox) 필드 타입 3종 추가
- **DetailModal**: render 콜백 시그니처에 두 번째 `record` 인자 추가 (상세 모달에서 원본 레코드 접근 가능)
- **index.css**: 글로벌 CSS로 navy 테이블 보더 및 검색 폼 컨테이너 스타일 정의

### 신규 헬퍼

- **shared/lib/military.ts**: `formatMilitaryPerson(record)` (군번/계급/성명 문자열 포맷), `militaryPersonColumn(fieldPrefix)` (ProTable 컬럼 정의 헬퍼)

### 영향 범위

- Phase 3~7의 모든 서브시스템(18개)이 이 변경된 공통 컴포넌트를 사용
- GAP 규칙 R5(테이블 보더), R6(군인정보 표시)는 공통 컴포넌트 레벨에서 해결되어 서브시스템별 개별 수정 불필요

---
*Phase: 00-project-foundation*
*Completed: 2026-04-05*
*GAP 수정: 2026-04-07*
