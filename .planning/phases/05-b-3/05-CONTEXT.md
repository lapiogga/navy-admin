# Phase 5: 중복잡도 서브시스템 B 3개 - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

3개 중복잡도 서브시스템 B(131개 프로세스)를 Phase 0~4의 공통 컴포넌트와 확립된 패턴을 활용하여 완전 동작시킨다. Phase 4의 중복잡도 패턴(결재/차트/인쇄)을 재사용하며, 좌석 선택 그리드 UI, 보안등급 기반 자료관리, 멀티스텝 직무기술서 작성 폼이라는 신규 패턴을 구현한다.

대상 서브시스템:
- 07_군사자료관리체계 (40개 프로세스): 보안등급별 자료관리, 열람/대출/반납 플로우, 평가심의, 해기단자료, 통계
- 10_주말버스예약관리체계 (44개 프로세스): 좌석선택 예약, 대기자관리/자동배정, 배차관리, 예약시간관리, 위규자관리, 타군사용자관리
- 18_직무기술서관리체계 (47개 프로세스): 개인/부서 직무기술서 작성(멀티스텝), 결재, 관리자 조회/검토, 조직진단대상, 표준업무시간

</domain>

<decisions>
## Implementation Decisions

### 좌석 선택 UI (주말버스)
- **D-01:** 버스 좌석은 antd Row/Col 기반 그리드 격자로 구현한다. 각 좌석을 Button으로 렌더링하고 색상으로 상태를 구분한다 (파랑=빈좌석, 회색=예약됨, 초록=내선택, 빨간=불가). 추가 라이브러리 불요.
- **D-02:** 그리드 상단에 운전석 위치 표시, 하단에 범례(색상 설명) 배치. 좌석 클릭 시 선택/해제 토글.
- **D-03:** 좌석 배치(행수, 열수)는 배차 정보의 좌석수에 따라 동적으로 4열 그리드 생성.

### 보안등급 분류 시스템 (군사자료)
- **D-04:** 비밀등급은 antd Tag 색상으로 구분 (red=[비밀], orange=[대외비], blue=[일반]). 목록 테이블에 Tag 컬럼으로 표시.
- **D-05:** 목록 필터에 보안등급 Select 추가로 등급별 조회 가능.
- **D-06:** 열람신청 시 비밀등급 자료에 경고 Modal 표시 ("이 자료는 [비밀] 등급입니다. 열람사유를 입력하세요").
- **D-07:** MVP Mock에서는 모든 등급 접근 가능. Tag로 시각적 구분만 제공. 실 접근 제어는 백엔드 연동 시 구현.

### 열람/대출/반납 워크플로우 (군사자료)
- **D-08:** 열람신청→승인→대출→반납완료 플로우를 antd Steps로 시각화한다 (Phase 4 검열결과 Steps 결재 패턴 재사용).
- **D-09:** 각 단계 전환은 StatusBadge로 현재 상태를 표시하고, 관리자 액션 버튼으로 상태 전환.

### 평가심의/파기 워크플로우 (군사자료)
- **D-10:** 보존기간 만료 자료 → 평가심의 대상 목록 자동 표시 (MSW에서 만료 데이터 생성).
- **D-11:** 평가심의 결과 일괄입력은 antd Upload로 엑셀 파일 업로드 → 파싱 → 검증결과 모달(OK/에러행 표시) → 확인 후 일괄 저장. 결과값: ①파기 ②보존기간연장 ③연장기간.
- **D-12:** 군사자료 일괄등록도 동일 패턴(Upload + 검증 모달). req_analysis의 "데이터 무결성 검증 기능 구현 필수" 요건 충족.

### 직무기술서 작성 폼
- **D-13:** antd Steps 단계별 폼으로 구현: Step 1(기본정보) → Step 2(업무분류/비율) → Step 3(시간배분) → Step 4(역량/자격요건) → Step 5(완료/제출). 각 단계별 Form 영역.
- **D-14:** 업무분류 단계에서 Form.List로 동적 업무 추가/삭제/비율 입력. 비율 합계 100% 검증.
- **D-15:** 임시저장 지원: 각 단계에서 '임시저장' 버튼으로 draft 상태 저장. '다음 단계'로 진행.
- **D-16:** 개인 vs 부서 직무기술서는 동일 폼 컴포넌트에 type='personal'|'department' prop. Tabs로 나의개인JD/직책JD/부서JD 3개 탭 구분. 코드 재사용 극대화.

### 직무기술서 결재
- **D-17:** 1차/2차 결재자 설정은 DataTable+CrudForm CRUD. 부서별로 결재자를 지정.
- **D-18:** 결재 플로우는 Phase 4 Steps 결재 패턴 재사용: 작성→1차결재→2차결재→완료. 반려 시 재결재요청 가능.
- **D-19:** 대리작성: 부서관리자가 다른 사용자의 직무기술서를 대리 작성 가능. 작성자 선택 드롭다운 추가.
- **D-20:** 관리자 검토결과 입력/의견보내기/반송은 상세 조회 페이지 내 액션으로 구현.

### 타군 사용자 인증 (주말버스)
- **D-21:** /sys10/login 별도 경로에 타군 전용 로그인 페이지 구현. RequireAuth 바깥에 배치. 메인 포탈 대시보드 접근 불가.
- **D-22:** 회원등록신청 폼(군번/성명/직책/계급/소속/전화번호/메일주소/비밀번호) → 관리자 승인/반려 → 승인 후 로그인 가능.
- **D-23:** 패스워드 초기화는 message.success('메일 발송 완료') Mock. 실제 메일 발송은 백엔드 연동 시.
- **D-24:** 타군 사용자 로그인 후에는 주말버스 예약 화면만 접근 가능한 제한된 레이아웃.

### 주말버스 대기자/자동배정
- **D-25:** 대기자 목록에 '자동배정' 버튼. 클릭 시 FIFO(대기순번) 순서대로 빈좌석에 자동 배정. MSW에서 순번 로직 처리.
- **D-26:** 수동배정은 대기자 선택 → 좌석 드롭다운 선택으로 개별 배정.
- **D-27:** 계급별 우선순위는 예약시간관리에서 계급별 예약오픈시간/마감시간을 다르게 설정하여 간접 구현.

### 위규자/제재 관리 (주말버스)
- **D-28:** 위규자 CRUD는 DataTable + CrudForm 패턴. 제재기간은 DatePicker.RangePicker, 위규사유는 TextArea.
- **D-29:** 제재중인 사용자가 예약 시도 시 StatusBadge로 '제재중' 표시 + 예약 차단 (MSW에서 400 응답).

### 표준업무시간 관리 (직무기술서)
- **D-30:** 신분별(장관/영관/부사관/원사/병) 표준업무시간 CRUD. DataTable + CrudForm 패턴.
- **D-31:** 적용기간(시작일~종료일) + 상태 자동계산: 현재일 기준 적용만료/적용중/적용예정 StatusBadge 표시. 상태는 프론트엔드에서 날짜 비교로 계산.

### 승차권 인쇄
- **D-32:** Phase 4 PrintableReport + print.css 패턴 재사용. 승차권 양식(노선/좌석/일시 정보)을 antd Descriptions로 렌더링 후 window.print(). QR코드 자리는 placeholder 이미지 표시.

### 서브시스템 공통 패턴
- **D-33:** Phase 3~4에서 확립된 패턴 동일 적용: pages/sys{번호}/ 디렉토리, index.tsx 라우트 매핑, lazy import, sysCode MSW 격리.
- **D-34:** 게시판(BUS-09 공지/질의응답, JOB-05 공지/질의응답/자료실)은 Phase 1 공통게시판 sysCode 재사용.
- **D-35:** 코드관리(JOB-06)는 Phase 1 common/code-mgmt/ 재사용.
- **D-36:** 권한관리(JOB-07)는 Phase 1 common/auth-group/ 재사용.
- **D-37:** 통계 차트(군사자료 MDATA-03)는 @ant-design/charts (Bar/Pie/Line/Column) Phase 4 패턴 재사용.
- **D-38:** 엑셀 출력은 Phase 3~4 패턴(message.success Mock) 재사용.

### Claude's Discretion
- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합 (키워드, 날짜범위, 상태 등)
- 테이블 컬럼 구성 및 정렬/필터 옵션
- 좌석 그리드 세부 스타일링 (색상 정확값, 좌석 크기)
- 군사자료 통계 차트 종류/조합
- 직무기술서 Steps 내 각 단계별 필드 상세 배치
- 타군 로그인 페이지 레이아웃/스타일

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 개발 요건
- `개발 spec.txt` — 시스템 개발 요건 (로그인, 세션, 서브시스템 연동 규칙)

### 요구사항 (Phase 5 범위)
- `.planning/REQUIREMENTS.md` — MDATA-01~04, BUS-01~09, JOB-01~08
- `req_analysis.txt` — 군사자료(284~327행), 주말버스(427~472행), 직무기술서(771~819행) 상세 컬럼/입력값

### 기존 코드 (Phase 0~4 산출물 — 재사용 대상)
- `navy-admin/src/shared/ui/DataTable/DataTable.tsx` — ProTable 래퍼 (목록 화면)
- `navy-admin/src/shared/ui/CrudForm/CrudForm.tsx` — ProForm 래퍼 (등록/수정 폼)
- `navy-admin/src/shared/ui/DetailModal/` — 상세 조회 모달
- `navy-admin/src/shared/ui/SearchForm/` — 검색 폼
- `navy-admin/src/shared/ui/StatusBadge/` — 상태 뱃지
- `navy-admin/src/shared/ui/ConfirmDialog/` — 확인 대화상자
- `navy-admin/src/pages/common/board/` — 공통게시판
- `navy-admin/src/pages/common/code-mgmt/` — 코드관리
- `navy-admin/src/pages/common/approval/` — 결재선 관리
- `navy-admin/src/pages/common/auth-group/` — 권한관리
- `navy-admin/src/pages/sys09-memorial/PrintableReport.tsx` — 인쇄 래퍼 (승차권 재사용)
- `navy-admin/src/pages/sys09-memorial/print.css` — 인쇄 CSS
- `navy-admin/src/entities/subsystem/menus.ts` — sys07/10/18 메뉴 구조 이미 정의
- `navy-admin/src/entities/subsystem/config.ts` — SUBSYSTEM_META 설정
- `navy-admin/src/app/router.tsx` — 전체 라우터 구조
- `navy-admin/src/shared/api/mocks/handlers/` — MSW 핸들러 팩토리 패턴

### Phase 4 패턴 참조
- `navy-admin/src/pages/sys17-inspection/InspectionApprovalPage.tsx` — Steps 결재 시각화 패턴
- `navy-admin/src/pages/sys12-directives/DirectiveProgressPage.tsx` — Progress + StatusBadge + Timeline 패턴
- `navy-admin/src/pages/sys13-knowledge/KnowledgeStatsPage.tsx` — @ant-design/charts 차트 패턴
- `navy-admin/src/pages/sys02-survey/SurveyQuestionEditor.tsx` — Form.List 동적 추가/삭제 패턴

### 이전 Phase Context
- `.planning/phases/00-project-foundation/00-CONTEXT.md` — FSD 구조, URL 컨벤션, 공통 컴포넌트 계약
- `.planning/phases/02-00/02-CONTEXT.md` — NAVY 브랜딩, 세션 관리, 서브시스템 전환 방식
- `.planning/phases/03-5/03-CONTEXT.md` — 서브시스템 재사용 패턴, 단순 승인, 대시보드 패턴
- `.planning/phases/04-a-6/04-CONTEXT.md` — 결재연동, 차트, 인쇄, 설문편집기, 재사용 극대화 패턴

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DataTable` — ProTable 래퍼. 모든 목록 화면에 사용
- `CrudForm` — ProForm 래퍼. 등록/수정 폼에 사용
- `DetailModal` — 상세 조회 팝업
- `StatusBadge` — 상태 뱃지 (보안등급Tag, 결재상태, 제재상태 표시)
- `BoardListPage`/`BoardPostPage` — 공통게시판. sysCode로 재사용
- `PrintableReport` + `print.css` — 승차권/보고서 인쇄
- `@ant-design/charts` — Bar/Pie/Line/Column (Phase 4에서 설치됨)
- Phase 4 Steps 결재 패턴 — 직무기술서 결재, 군사자료 대출 플로우 재사용
- Phase 4 Form.List 패턴 — 직무기술서 업무분류 동적 추가

### Established Patterns
- Zustand store: authStore, uiStore 전역 상태
- TanStack Query: useQuery/useMutation으로 서버 데이터 관리
- MSW: shared/api/mocks/handlers/{domain}.ts 파일별 핸들러
- sysCode 파라미터로 서브시스템별 데이터 격리
- lazy import로 Phase 1 공통 페이지 재사용
- jsdom 테스트: readFileSync 파일 내용 기반 검증
- `extends Record<string, unknown>` 제약조건 for DataTable<T>

### Integration Points
- `router.tsx` — sys07/sys10/sys18 lazy 라우트 + /sys10/login 별도 경로 추가
- `SUBSYSTEM_MENUS` — sys07/10/18 메뉴 구조 이미 정의됨
- `SUBSYSTEM_META` — 서브시스템 메타데이터 이미 정의됨
- `shared/api/mocks/handlers/` — sys07/sys10/sys18 MSW 핸들러 추가

</code_context>

<specifics>
## Specific Ideas

- Phase 5는 "신규 UI 패턴 확장" Phase — 좌석 그리드(주말버스), 멀티스텝 폼(직무기술서), 별도 로그인(타군)이 이후 Phase에서도 참조될 수 있는 패턴
- 주말버스가 가장 복잡 (44개 프로세스) — 좌석선택, 대기자관리, 타군인증 등 신규 패턴이 집중
- 직무기술서는 폼 복잡도가 핵심 — Steps 단계별 폼 + 임시저장이 차별 포인트
- 군사자료는 보안등급 분류와 대출 워크플로우가 핵심 — 나머지는 기존 패턴 재사용
- 3개 서브시스템 모두 엑셀 출력/인쇄 기능 필요 — Phase 4 패턴 재사용
- 타군 사용자 별도 인증은 이 프로젝트 유일의 별도 로그인 체계 — /sys10/login 경로로 격리

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-b-3*
*Context gathered: 2026-04-06*
