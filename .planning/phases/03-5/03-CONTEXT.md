# Phase 3: 저복잡도 서브시스템 5개 - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

5개 저복잡도 서브시스템(85개 프로세스)을 Phase 0/1의 공통 컴포넌트와 공통 기능을 재사용하여 완전 동작시킨다. 각 서브시스템은 placeholder SubsystemPage를 실제 기능 화면으로 교체한다. 이 Phase에서 서브시스템 개발의 재사용 패턴을 확립하여 Phase 4~7의 템플릿이 된다.

대상 서브시스템:
- 04_인증서발급신청체계 (14개 프로세스): 신청→승인/반려→등록대장
- 05_행정규칙포탈체계 (15개 프로세스): 현행규정/예규/지시문서 조회/다운로드
- 14_나의제언 (16개 프로세스): 제언작성/추천/신고/비공개/답변
- 11_연구자료종합관리체계 (19개 프로세스): 자료등록/카테고리/다운로드/통계
- 16_회의실예약관리체계 (21개 프로세스): 예약신청→승인/반려, 회의실CRUD/시간대/장비/사진

</domain>

<decisions>
## Implementation Decisions

### 공통 기능 재사용 방식
- **D-01:** 게시판(CERT-04, SUGST-03, RSRC-04, ROOM-06)은 Phase 1의 `common/board/` 페이지를 라우트 매핑으로 재사용한다. 각 서브시스템 메뉴에서 해당 라우트로 이동 시 `sysCode` 파라미터를 통해 서브시스템별 데이터를 격리한다.
- **D-02:** 코드관리(CERT-05, ROOM-07)는 Phase 1의 `common/code-mgmt/` 페이지를 동일 방식으로 재사용한다.
- **D-03:** 권한관리(CERT-06, RSRC-06, SUGST-05)는 Phase 1의 `common/auth-group/` 페이지를 재사용한다.
- **D-04:** MSW 핸들러는 `sysCode` 쿼리 파라미터 또는 URL 프리픽스로 서브시스템별 데이터를 필터링하여 격리된 Mock 데이터를 반환한다.

### 승인/반려 워크플로우
- **D-05:** 인증서(CERT-02)와 회의실(ROOM-03)의 승인/반려는 간단한 상태변경 패턴(pending→approved/rejected)을 사용한다. Phase 1의 결재선 연동은 하지 않는다.
- **D-06:** 상태 표시는 Phase 0의 `StatusBadge` 컴포넌트를 활용한다 (pending=processing, approved=success, rejected=error).
- **D-07:** 승인/반려 액션은 DataTable 행의 액션 버튼으로 구현한다 (antd Popconfirm 확인 후 상태 변경).

### 서브시스템 메인화면
- **D-08:** 나의제언(SUGST-01)과 연구자료(RSRC-01) 메인화면은 antd Card + Statistic 조합으로 현황 카드 + 최신 5건 목록을 표시한다.
- **D-09:** 메인화면 상단에 현황 통계 (총 건수, 이번 달 등록건수 등)를 antd Row/Col + Statistic으로 배치하고, 하단에 최신 목록 + "전체보기" 링크를 배치한다.

### 회의실 특수 UI
- **D-10:** 회의실 시간대 설정(ROOM-04)은 antd TimePicker.RangePicker + 요일별 운영시간 Table로 구현한다.
- **D-11:** 장비관리(ROOM-04)는 DataTable + CrudForm Modal 패턴으로 CRUD 구현한다.
- **D-12:** 사진관리(ROOM-04)는 antd Upload 컴포넌트(이미지 미리보기 모드)를 사용한다. 실제 업로드는 MSW Mock으로 처리.

### 파일/문서 다운로드
- **D-13:** 행정규칙(AREG-01~04)과 연구자료(RSRC-02)의 다운로드/프린트 기능은 Mock에서는 antd message.success('다운로드 시작') 알림으로 처리한다. 실제 파일 다운로드는 백엔드 연동 시 구현.
- **D-14:** 즐겨찾기(AREG-01)는 localStorage 기반 클라이언트 측 구현으로 Mock 단계에서도 동작하게 한다.

### 서브시스템 라우팅 패턴
- **D-15:** 각 서브시스템의 라우트는 `pages/sys{번호}/` 디렉토리 내에 기능별 페이지 파일을 생성한다. 기존 placeholder `index.tsx`는 메인화면이 있는 경우 대시보드로, 없는 경우 첫 번째 메뉴 리다이렉트로 교체한다.
- **D-16:** 공통 기능(게시판/코드관리/권한) 라우트는 서브시스템 내 중첩 라우트로 Phase 1 페이지 컴포넌트를 렌더링한다.

### 제언 특수 기능
- **D-17:** 추천/신고(SUGST-02)는 각각 독립 API 호출 + 카운트 표시. 비공개 처리는 관리자만 가능하며 목록에서 필터링된다.
- **D-18:** 관리자 답변(SUGST-04)은 제언 상세 페이지 내 하단 답변 영역으로 구현 (별도 페이지 아님).

### Claude's Discretion
- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 한국어 시드
- 검색 필터 조건 조합 (키워드, 날짜범위, 상태 등)
- 테이블 컬럼 구성 및 정렬/필터 옵션
- 상세 페이지 레이아웃 (Descriptions vs Card vs Tabs)
- 연구자료 통계 차트 종류 (antd 기본 또는 간단한 Statistic)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 개발 요건
- `개발 spec.txt` — 시스템 개발 요건 (로그인, 세션, 서브시스템 연동 규칙)

### 요구사항 (Phase 3 범위)
- `.planning/REQUIREMENTS.md` — CERT-01~06, AREG-01~04, SUGST-01~05, RSRC-01~06, ROOM-01~07

### 기존 코드 (Phase 0/1 산출물 — 재사용 대상)
- `navy-admin/src/shared/ui/DataTable/DataTable.tsx` — ProTable 래퍼 (목록 화면)
- `navy-admin/src/shared/ui/CrudForm/CrudForm.tsx` — ProForm 래퍼 (등록/수정 폼)
- `navy-admin/src/shared/ui/DetailModal/` — 상세 조회 모달
- `navy-admin/src/shared/ui/SearchForm/` — 검색 폼
- `navy-admin/src/shared/ui/StatusBadge/` — 상태 뱃지 (승인/반려 표시)
- `navy-admin/src/shared/ui/ConfirmDialog/` — 확인 대화상자
- `navy-admin/src/pages/common/board/` — 공통게시판 (BoardListPage, BoardPostPage 등)
- `navy-admin/src/pages/common/code-mgmt/` — 코드관리
- `navy-admin/src/pages/common/approval/` — 결재선
- `navy-admin/src/pages/common/auth-group/` — 권한관리
- `navy-admin/src/entities/subsystem/menus.ts` — 서브시스템 메뉴 구조 (sys04/05/11/14/16)
- `navy-admin/src/entities/subsystem/config.ts` — SUBSYSTEM_META 설정
- `navy-admin/src/app/router.tsx` — 전체 라우터 구조

### 이전 Phase Context
- `.planning/phases/00-project-foundation/00-CONTEXT.md` — FSD 구조, URL 컨벤션, 공통 컴포넌트 계약
- `.planning/phases/02-00/02-CONTEXT.md` — NAVY 브랜딩, 세션 관리, 서브시스템 전환 방식

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DataTable` — ProTable 래퍼. 서버사이드 페이지네이션, 정렬, 필터 내장. 모든 목록 화면에 사용
- `CrudForm` — ProForm 래퍼. 등록/수정 폼에 사용 (Modal 또는 페이지)
- `DetailModal` — 상세 조회 팝업
- `SearchForm` — 검색 조건 입력 폼
- `StatusBadge` — 상태 뱃지 (D-06에서 승인/반려 표시용)
- `ConfirmDialog` — 삭제/승인 확인 대화상자
- `SubsystemPage` — 현재 placeholder. 실제 페이지로 교체 대상
- `BoardListPage`/`BoardPostPage` — 공통게시판. sysCode 파라미터로 재사용 가능
- MSW handler factory pattern — `shared/api/mocks/handlers/`

### Established Patterns
- Zustand store: authStore, uiStore 전역 상태
- TanStack Query: `useQuery`/`useMutation`으로 서버 데이터 관리
- MSW: `shared/api/mocks/handlers/{domain}.ts` 파일별 핸들러
- apiClient interceptor: `(res as ApiResult).data ?? res` 이중 래핑 방어
- 비페이지 list API: `requestFn` 래퍼로 `PageResponse` 변환
- jsdom 테스트: readFileSync 파일 내용 기반 검증 (heavy antd 모듈 회피)

### Integration Points
- `router.tsx` — 각 서브시스템 lazy 라우트에 실제 페이지 컴포넌트 연결
- `SUBSYSTEM_MENUS` — 메뉴 구조 이미 정의됨 (sys04/05/11/14/16)
- `SUBSYSTEM_META` — 서브시스템 메타데이터 이미 정의됨
- `shared/api/mocks/handlers/` — 서브시스템별 MSW 핸들러 추가

</code_context>

<specifics>
## Specific Ideas

- Phase 3은 "재사용 패턴 확립" Phase — 여기서 확립된 서브시스템 개발 패턴이 Phase 4~7의 템플릿이 됨
- 5개 서브시스템 모두 저복잡도이므로 DataTable + CrudForm + StatusBadge 조합으로 대부분 커버 가능
- 게시판/코드관리/권한관리는 Phase 1 컴포넌트 재사용으로 개발 시간 최소화
- 회의실 예약이 가장 복잡 (21개 프로세스) — 시간대/장비/사진 관리에 특수 UI 필요

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-5*
*Context gathered: 2026-04-05*
