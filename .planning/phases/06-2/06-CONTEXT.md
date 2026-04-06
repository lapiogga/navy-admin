# Phase 6: 고복잡도 서브시스템 2개 - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

2개 고복잡도 서브시스템(158개 프로세스)을 Phase 0~5의 공통 컴포넌트와 확립된 패턴을 활용하여 완전 동작시킨다. 부대 계층 Tree 뷰, 캘린더 기반 근무시간/공휴일 관리, 다단계 결재 워크플로우, 월말결산 마감이라는 신규 UI 패턴을 구현한다.

대상 서브시스템:
- 08_부대계보관리체계 (59개 프로세스): 부대기록부 CRUD, 제원/계승부대 Tree, 주요직위자/주요활동 CRUD+결재, 부대기/마크 이미지, 권한신청/관리, 입력통계 10종, 게시판 2종
- 01_초과근무관리체계 (99개 프로세스): 신청서 작성/결재, 일괄처리/승인, 월말결산(마감/마감취소), 나의근무현황 그래프, 부재관리, 부대근무현황/통계, 최대인정시간(12종), 근무시간관리(8종), 공휴일관리, 결재선, 초과근무자관리, 당직개소관리/변경, 개인별설정, 게시판, 권한관리

</domain>

<decisions>
## Implementation Decisions

### 제원/계승부대 트리 뷰 (부대계보)
- **D-01:** 제원/계승부대 조회는 antd Tree 컴포넌트로 부대 계층을 좌측 패널에 표시하고, 우측에 선택된 부대의 상세정보를 DataTable로 표시하는 Master-Detail 레이아웃. 트리에서 부대 선택 시 해당 부대의 제원/계승 이력이 우측에 로드됨.
- **D-02:** 계승관계 설정은 트리에서 드래그&드롭 대신 폼 기반 — 계승번호/부대명/창설일자/관련기관 입력 후 저장. 트리는 조회 목적, 편집은 CrudForm.
- **D-03:** 트리 데이터는 MSW에서 계층 구조(부모-자식) JSON 생성. 해군 함대->전단->함정 같은 3~4단 계층.

### 초과근무 신청서/결재
- **D-04:** 신청서 작성 폼: 신청서 종류(사전/사후) Select + 근무일 DatePicker + 시작/종료시간 TimePicker.RangePicker + 근무사유 TextArea. 총 근무시간은 시작/종료에서 자동 계산 표시.
- **D-05:** 나의 근무현황 그래프는 @ant-design/charts Column(월별 시간) + Line(누적) 차트 조합. 연간/월간 탭 전환.
- **D-06:** 신청서 결재는 Phase 4~5 Steps 결재 패턴 재사용: 작성->결재대기->승인/반려. StatusBadge 표시.

### 월말결산 마감 워크플로우
- **D-07:** 월말결산 목록에 StatusBadge로 상태 표시 (작성중/마감완료). 마감 버튼 클릭 시 ConfirmDialog 후 상태 전환.
- **D-08:** 마감취소는 마감완료 상태에서만 가능. 마감취소 시 ConfirmDialog + 사유 입력.
- **D-09:** 마감기한 입력은 체계관리자 전용 — DatePicker로 마감기한 설정. 기한 경과 시 StatusBadge 색상 변경(red).

### 당직개소/부서 관리
- **D-10:** 당직개소 관리(체계관리자): DataTable + CrudForm CRUD. 입력값: 부대명(다중선택), 개소명, ID, MAC 주소. MAC 주소 필드는 Input으로 표시만.
- **D-11:** 당직개소 변경(부대관리자): 우리부대 당직개소 조회 + Select 변경. 단순 조회/변경 페이지.
- **D-12:** 개인별 당직개소 승인: 승인대기 목록 DataTable + 승인/반려 버튼. Phase 4~5 승인/반려 패턴.
- **D-13:** 개인별 부서 이동 승인: 동일 패턴. 이동신청->관리자 승인/반려.
- **D-14:** 개인별 당직개소 설정(개인): 신청 폼(사유+근거 첨부) + 결재현황 조회 Tabs 구조.
- **D-15:** 개인별 부서 설정(개인): 이동신청 폼 + 복구 버튼 + 결재현황 Tabs 구조.

### 부대기/부대마크 이미지
- **D-16:** 부대기/부대마크 등록 폼에 antd Upload.Dragger로 이미지 업로드. 미리보기는 antd Image 컴포넌트. MVP에서는 Base64로 로컬 표시.
- **D-17:** 목록 테이블에 썸네일 컬럼 (antd Image width=50). 상세 조회에 원본 이미지 표시.
- **D-18:** 구분(부대기/부대마크) Select, 개정일자 DatePicker, 부대명 자동표시.

### 입력통계 대시보드
- **D-19:** 입력통계는 단일 페이지에 Select로 통계종류 선택 (주요직위자/주요활동/부대기마크/입력대상부대수/계급별계보담당). 선택에 따라 DataTable + 차트(Bar/Pie) 렌더링.
- **D-20:** 각 통계에 '엑셀 저장' 버튼 (Phase 4 패턴 message.success Mock).
- **D-21:** 완료율/미입력현황은 Progress + StatusBadge 조합으로 시각화.

### 권한신청/관리 (부대계보 전용)
- **D-22:** 부대계보 권한신청은 별도 페이지 — 신청 폼(관리부대 Select, 요청권한 Select[계보담당/중간결재자/확인관/부대관리자], 사유 TextArea) + 진행조회 DataTable.
- **D-23:** 권한관리(관리자)는 별도 페이지 — 신청목록 DataTable + 승인/반려 버튼. Phase 4~5 승인/반려 패턴.
- **D-24:** 권한조회는 읽기전용 DataTable (계보담당자 목록, 부대별 필터).
- **D-25:** Phase 1 공통 권한관리(auth-group)도 관리자 대메뉴에 포함 (7대 규칙 7번).

### 서브시스템 공통 패턴
- **D-26:** 주요활동 일괄등록은 antd Upload + 엑셀 파싱 검증 -> Phase 5 D-11/D-12 패턴 재사용 (검증결과 모달).
- **D-27:** 주요활동 결재는 Phase 4~5 Steps 결재 패턴 (계보담당->중간결재자->확인관 3단).
- **D-28:** 초과근무 일괄처리: DataTable로 대상자 다중선택 + 일괄 신청서 작성. 일괄처리 승인은 결재 패턴.
- **D-29:** 부대 근무현황/통계: DataTable(부대별 목록) + Column/Bar 차트(월별/연별). 부대(서) 필터.
- **D-30:** 최대인정시간: 연도/월 선택 후 DataTable CRUD. 예외처리/예외구분은 같은 페이지 Tabs.
- **D-31:** 근무시간 관리: antd Calendar 형식으로 일별 근무시간 표시. 날짜 클릭 시 Modal로 근무시간 등록/수정. 예외처리는 별도 Tab.
- **D-32:** 공휴일 관리: antd Calendar 형식으로 공휴일 표시. 날짜 클릭 시 Modal로 등록/수정/삭제.
- **D-33:** 부대인원 조회: DataTable + 엑셀 다운로드 버튼.
- **D-34:** 자료 출력(OT-12): 엑셀 다운로드 Mock (message.success).
- **D-35:** 게시판(부대계보/초과근무): Phase 1 공통게시판 sysCode 재사용 (sys08/sys01).
- **D-36:** 관리자 대메뉴: 7대 규칙 7번. 두 서브시스템 모두 Phase 1 공통기능 lazy import.
- **D-37:** 초과근무 결재선 관리: Phase 1 결재선 관리 컴포넌트 재사용 또는 단순 DataTable+CrudForm(결재자 조회/등록/삭제).
- **D-38:** 개인설정 정보(OT-23): 읽기전용 정보 표시 페이지 (결재부서, 결재자, 당직개소).
- **D-39:** 부대기록부 CRUD: DataTable + CrudForm 기본 패턴.
- **D-40:** 주요직위자 CRUD: DataTable + CrudForm. 입력값 구분(지휘관/부지휘관/참모장/주임원사 등) Select. 이력조회는 Timeline 컴포넌트.
- **D-41:** 주요활동 상세출력 + 주요직위자 출력 + 제원/계승부대 출력 + 부대기/마크 출력: PrintableReport + print.css 패턴 재사용.
- **D-42:** 부재관리(OT-07): 부재유형(휴가/휴직/출장/파견) Select + DatePicker.RangePicker + DataTable CRUD.

### Claude's Discretion
- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합 (키워드, 날짜범위, 상태 등)
- 테이블 컬럼 구성 및 정렬/필터 옵션
- Tree 노드 아이콘/스타일 상세
- Calendar 셀 렌더링 상세
- 차트 색상/스타일 디테일
- 부대계보 통계 차트 종류/조합

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 개발 요건
- `개발 spec.txt` -- 시스템 개발 요건 (로그인, 세션, 서브시스템 연동 규칙)

### 요구사항 (Phase 6 범위)
- `.planning/REQUIREMENTS.md` -- UNIT-01~11, OT-01~28
- `req_analysis.txt` -- 초과근무관리체계(0~99행), 부대계보관리체계(327~388행) 상세 컬럼/입력값

### 기존 코드 (Phase 0~5 산출물 -- 재사용 대상)
- `navy-admin/src/shared/ui/DataTable/DataTable.tsx` -- ProTable 래퍼 (목록 화면)
- `navy-admin/src/shared/ui/CrudForm/CrudForm.tsx` -- ProForm 래퍼 (등록/수정 폼)
- `navy-admin/src/shared/ui/DetailModal/` -- 상세 조회 모달
- `navy-admin/src/shared/ui/SearchForm/` -- 검색 폼
- `navy-admin/src/shared/ui/StatusBadge/` -- 상태 뱃지
- `navy-admin/src/shared/ui/ConfirmDialog/` -- 확인 대화상자
- `navy-admin/src/pages/common/board/` -- 공통게시판
- `navy-admin/src/pages/common/code-mgmt/` -- 코드관리
- `navy-admin/src/pages/common/approval/` -- 결재선 관리
- `navy-admin/src/pages/common/auth-group/` -- 권한관리
- `navy-admin/src/pages/sys09-memorial/PrintableReport.tsx` -- 인쇄 래퍼
- `navy-admin/src/pages/sys09-memorial/print.css` -- 인쇄 CSS
- `navy-admin/src/entities/subsystem/menus.ts` -- sys01/08 메뉴 구조 이미 정의
- `navy-admin/src/entities/subsystem/config.ts` -- SUBSYSTEM_META 설정
- `navy-admin/src/app/router.tsx` -- 전체 라우터 구조
- `navy-admin/src/shared/api/mocks/handlers/` -- MSW 핸들러 팩토리 패턴

### Phase 4~5 패턴 참조
- `navy-admin/src/pages/sys17-inspection/InspectionApprovalPage.tsx` -- Steps 결재 시각화 패턴
- `navy-admin/src/pages/sys13-knowledge/KnowledgeStatsPage.tsx` -- @ant-design/charts 차트 패턴
- `navy-admin/src/pages/sys02-survey/SurveyQuestionEditor.tsx` -- Form.List 동적 추가/삭제 패턴
- `navy-admin/src/pages/sys07-mil-data/MilDataUsagePage.tsx` -- Steps 워크플로우 + 승인/반려 패턴
- `navy-admin/src/pages/sys10-weekend-bus/ExternalUserPage.tsx` -- 승인/반려 관리 페이지 패턴

### 이전 Phase Context
- `.planning/phases/00-project-foundation/00-CONTEXT.md` -- FSD 구조, URL 컨벤션, 공통 컴포넌트 계약
- `.planning/phases/02-00/02-CONTEXT.md` -- NAVY 브랜딩, 세션 관리, 서브시스템 전환 방식
- `.planning/phases/03-5/03-CONTEXT.md` -- 서브시스템 재사용 패턴, 단순 승인, 대시보드 패턴
- `.planning/phases/04-a-6/04-CONTEXT.md` -- 결재연동, 차트, 인쇄, 설문편집기, 재사용 극대화 패턴
- `.planning/phases/05-b-3/05-CONTEXT.md` -- 좌석그리드, 보안등급, Steps 결재, 타군인증 패턴

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DataTable` -- ProTable 래퍼. 모든 목록 화면에 사용
- `CrudForm` -- ProForm 래퍼. 등록/수정 폼에 사용
- `DetailModal` -- 상세 조회 팝업
- `StatusBadge` -- 상태 뱃지 (결재상태, 마감상태 등)
- `SearchForm` -- 검색 폼 (부대/기간/상태 필터)
- `BoardListPage`/`BoardPostPage` -- 공통게시판. sysCode로 재사용
- `PrintableReport` + `print.css` -- 보고서/목록 인쇄
- `@ant-design/charts` -- Bar/Pie/Line/Column (Phase 4에서 설치됨)
- Phase 4~5 Steps 결재 패턴 -- 신청서결재, 주요활동결재 재사용
- Phase 5 Upload + 검증 모달 패턴 -- 일괄등록 재사용

### Established Patterns
- Zustand store: authStore, uiStore 전역 상태
- TanStack Query: useQuery/useMutation으로 서버 데이터 관리
- MSW: shared/api/mocks/handlers/{domain}.ts 파일별 핸들러
- sysCode 파라미터로 서브시스템별 데이터 격리
- lazy import로 Phase 1 공통 페이지 재사용
- `extends Record<string, unknown>` 제약조건 for DataTable<T>
- apiClient import: `@/shared/api/client` (NOT apiClient)

### Integration Points
- `router.tsx` -- sys01/sys08 lazy 라우트 추가
- `SUBSYSTEM_MENUS` -- sys01(7개 대메뉴)/sys08(8개 대메뉴) 이미 정의됨
- `SUBSYSTEM_META` -- 서브시스템 메타데이터 이미 정의됨
- `shared/api/mocks/handlers/` -- sys01/sys08 MSW 핸들러 추가
- sys01: 페이지 약 20개 (신청서/결재/일괄/월말/현황/부대관리/당직/개인설정/게시판/관리자)
- sys08: 페이지 약 12개 (기록부/제원Tree/주요직위자/주요활동/결재/부대기마크/권한/통계/게시판)

</code_context>

<specifics>
## Specific Ideas

- Phase 6은 "신규 UI 패턴 확장" Phase -- antd Tree(부대계층), antd Calendar(근무시간/공휴일), antd Upload.Dragger(이미지)가 이후 Phase에서도 참조될 수 있는 패턴
- 초과근무가 99 프로세스로 가장 크고 복잡 -- 신청서 관리(결재), 현황조회(차트), 부대관리(설정), 당직업무(승인), 개인설정, 게시판, 관리자 7개 대메뉴
- 부대계보는 Tree 뷰가 핵심 차별점 -- 나머지는 기존 패턴 재사용
- 두 서브시스템 모두 다수의 승인/반려 워크플로우 존재 -- Phase 4~5 패턴 일관 적용
- 월말결산 마감/마감취소는 이 프로젝트의 유일한 "마감" 워크플로우 -- 상태 전환 기반으로 간단 구현
- 근무시간/공휴일 관리에 antd Calendar 사용은 이 프로젝트 최초 -- req_analysis에서 "캘린더 화면 사용"을 명시

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 06-2*
*Context gathered: 2026-04-06*
