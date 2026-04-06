# Phase 7: 최고복잡도 서브시스템 2개 - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

2개 최고복잡도 서브시스템(214개 프로세스)을 Phase 0~6의 공통 컴포넌트와 확립된 패턴을 최대 활용하여 완전 동작시킨다. 5단계 과제 계층 관리, KPI 차트 시각화, 보안점검 체크리스트, 비밀/매체 CRUD 3종, 인계/인수 결재 워크플로우, 대규모 점검항목 관리, 예외처리 트리구조, 캘린더 기반 결산 조회, 개인보안수준평가를 구현한다.

대상 서브시스템:
- 03_성과관리체계 (76개 프로세스): 메인화면(달성률/추진율 차트 3종), 기준정보관리(시스템/평가조직/업무실적개인/과제관리 4개 소메뉴), 연간과제관리(추진진도율/과제등록/업무실적입력/과제실적승인/과제실적평가/업무실적개인평가 6개 소메뉴), 평가결과(평가결과/입력현황 2개 소메뉴), 게시판(공지사항/질의응답/자료실 3종), 과제검색
- 15_보안일일결산체계 (138개 프로세스): 메인화면(캘린더 2종), 비밀/매체관리(저장매체/비밀/예고문/보안자재/인계인수 5개 소메뉴), 보안일일결산(개인/사무실/일일보안점검관/개인보안수준평가/부재처리/보안교육 6개 소메뉴), 결재(대기/완료 2개), 결산종합현황(비밀매체/개인/사무실/부재처리 4개 소메뉴), 개인설정, 게시판(공지사항/질의응답 2종), 관리자(점검항목/휴무일/알림시간/로그이력/예외처리 5개 소메뉴), 시스템(코드/권한 2종)

</domain>

<decisions>
## Implementation Decisions

### 과제 계층 관리 (성과관리)
- **D-01:** 지휘방침→추진중점과제→중과제는 기준정보관리>과제관리 내 계단식 Master-Detail로 구현. 상위 DataTable 행 선택 시 하위 DataTable 로드. Tree 대신 Select 필터링 (메뉴가 이미 레벨별 분리).
- **D-02:** 소과제→상세과제는 연간과제관리>과제등록에서 부서별 필터 Select + DataTable. 소과제 행 선택 → 상세과제 하단 DataTable 펼침.
- **D-03:** 중과제 일괄등록/저장: Upload.Dragger로 엑셀 업로드 (Phase 6 Upload 패턴), 엑셀 저장은 message.success Mock.
- **D-04:** 소과제 일괄등록/저장: 동일 패턴.

### KPI 차트 시각화 (성과관리)
- **D-05:** 메인화면 3종 차트: Gauge(나의 부서 달성률) + Bar(지휘방침별 업무추진율) + Bar(부/실/단별 업무추진율). @ant-design/charts 사용.
- **D-06:** 추진진도율: Grouped Bar 차트 (부대별/과제별 진도율). 부대별→부서별 상세 드릴다운은 행 클릭 시 하위 DataTable.
- **D-07:** 평가결과: Bar 차트 (부대별 평가율). 입력현황: Stacked Bar + antd Progress (입력완료율).
- **D-08:** 연간/월간 탭 전환은 Radio.Group 사용.

### 업무실적 입력/승인/평가 (성과관리)
- **D-09:** 업무실적 입력: 추진현황 DataTable(중과제/소과제) → 상세과제별 실적 입력 Modal(ProForm). 임시저장/상신 버튼 분리.
- **D-10:** 과제실적 승인: 결재대기 DataTable → 상세 Modal → 승인/반려 버튼. Phase 4~6 Steps 결재 패턴 재사용.
- **D-11:** 과제실적 평가: 평가대기 DataTable → 과제 상세+실적 조회 → 등급 Select 입력. 저장 후 상태 전환.
- **D-12:** 업무실적(개인) 평가: 동일 승인/평가 패턴. 개인별 실적 상세 조회 후 등급 부여.

### 보안점검 체크리스트 UI (보안일일결산)
- **D-13:** 개인보안일일결산: Checkbox.Group으로 필수/선택 항목 렌더링. 미체크 항목에 사유 TextArea 조건부 표시. 제출 시 결재 연동.
- **D-14:** 사무실보안일일결산: 동일 Checkbox.Group 패턴. 미실시자/부재자 사유 입력 필수 조건 추가.
- **D-15:** 일일보안점검관 당직표: Calendar 형태 월별 배정. 당직표 작성은 날짜별 인원 Select. 상신 시 Steps 결재.
- **D-16:** 결산 내역 조회: DataTable + 상세 Modal. 엑셀 저장 Mock.

### 비밀/매체관리 CRUD 구조 (보안일일결산)
- **D-17:** 비밀/저장매체/보안자재 3종은 동일 CRUD 구조. type prop ('secret'|'media'|'equipment')으로 컬럼/입력값 분기하는 공통 SecretMediaPage 컴포넌트.
- **D-18:** 각 종류별: 목록조회(DataTable+SearchForm) + 등록/수정(CrudForm Modal) + 삭제(삭제사유 필수) + 이력조회(기간 DatePicker) + 일괄등록(Upload.Dragger) + 엑셀저장 + 관리대장 출력(PrintableReport).
- **D-19:** 비밀 등록 시 예고문 등록 화면 전환: 저장 후 Modal로 예고문 작성 폼 자동 오픈.
- **D-20:** 비밀 예고문 관리: 예고문 알림은 UI에 팝업 Mock 표시 (실 메일 발송은 백엔드 v2).

### 인계/인수 워크플로우 (보안일일결산)
- **D-21:** 인계: 비밀/매체 보유현황 DataTable에서 체크박스 선택 → 인수자 Select(조직도 검색) → 인계등록 버튼.
- **D-22:** 인수: 인수대기 목록 DataTable → 인수확인/반송 버튼. 인수확인 시 보유현황에 자동 반영.
- **D-23:** 인계/인수 내역 조회: DataTable(결재정보 포함). 결재대기/결재 처리: Steps 결재 패턴.

### 점검항목관리 (보안일일결산 관리자)
- **D-24:** Tabs 5개: (개인)필수점검항목 / (사무실)필수점검항목 / (개인)선택점검항목 / (사무실)선택점검항목 / 개인보안수준평가항목. 각 탭 DataTable+CrudForm CRUD.
- **D-25:** 선택점검항목 탭에 부대(서) Select 필터 — 부대별 다른 선택항목 설정 가능.
- **D-26:** 관련규정 소메뉴: TextArea 기반 규정 조문 편집기. 별도 페이지(Tabs 밖).

### 예외처리 관리 (보안일일결산 관리자)
- **D-27:** 체계기준 조직도: antd Tree(좌측) + DataTable(우측) Master-Detail. Phase 6 SYS08 Tree 패턴 재사용. CRUD(생성/수정/삭제).
- **D-28:** 1인사무실: 동일 Tree+DataTable 구조. 예외처리 조직/인원 CRUD.
- **D-29:** 예외처리: Tree(좌측 조직 선택) + DataTable(우측 예외처리 인원 목록) + CrudForm(추가/수정/삭제).

### 보안결산 캘린더 메인화면 (보안일일결산)
- **D-30:** 메인화면: Tabs 2개 (개인보안결산/사무실보안결산). antd Calendar + cellRender로 일자별 실시여부 Badge 표시.
- **D-31:** Badge 색상: 실시완료(green/success) / 미실시(red/error) / 부재(gray/default) / 미래일자(none).
- **D-32:** Phase 6 SYS01 Calendar cellRender 패턴 직접 재사용. onPanelChange(월 네비게이션) / onSelect(날짜 클릭→상세 Modal) 분리.

### 개인보안수준평가 (보안일일결산)
- **D-33:** 수시평가: 대상자 DataTable → 평가 Modal (평가내용 TextArea + 가점/감점 InputNumber). 이력 조회 DataTable.
- **D-34:** 정기평가: 5개 항목 InputNumber(각 100점 만점) + 가점/감점. 총점 자동계산. 2차 결재자 결재 이전까지만 수정 가능.
- **D-35:** 정기평가 삭제: 관련근거 첨부파일 필수 (Upload.Dragger). 체계관리자 전용.
- **D-36:** 통계: Bar(부대별) + Pie(등급분포) + Line(기간별추이). @ant-design/charts 사용.

### 휴무일 관리 (보안일일결산 관리자)
- **D-37:** 공통 공휴일: DataTable + CrudForm. 구분(특정기간/특정요일) Select + 설명 + 기간 DatePicker.RangePicker. 엑셀 저장 Mock.
- **D-38:** 부대(서) 휴무일: 동일 구조 + 적용 부대(서) Select 추가 필터.

### 알림시간 관리 (보안일일결산 관리자)
- **D-39:** 부대(서)별 알림시간 설정: DataTable + CrudForm. 개인/사무실 결산 실시 가능 시간 범위 TimePicker.RangePicker.
- **D-40:** 최상위(해군/해병대) 설정 삭제 불가 — 삭제 버튼 disabled 조건.

### 로그이력 관리 (보안일일결산 관리자)
- **D-41:** 개인/사무실 결산 실시 이력: 기간/부대(서)/인원 SearchForm + DataTable. 종합이력은 별도 탭. 엑셀 저장 Mock.

### 보안교육 (보안일일결산)
- **D-42:** 보안교육 실시현황: DataTable + SearchForm. 결과작성: CrudForm Modal (교육구분/실시일자/소요시간/교관 정보). 엑셀 저장 Mock.
- **D-43:** 삭제는 체계관리자 전용.

### 게시판/시스템 (공통)
- **D-44:** SYS03 게시판 3종 (공지사항/질의응답/자료실): Phase 1 공통게시판 lazy import (sysCode=sys03).
- **D-45:** SYS15 게시판 2종 (공지사항/질의응답): Phase 1 공통게시판 lazy import (sysCode=sys15).
- **D-46:** SYS15 공통코드관리/권한관리: Phase 1 코드관리/권한관리 lazy import.
- **D-47:** SYS03 관리자 대메뉴: 기준정보관리가 관리자 역할 포함 (시스템관리/평가조직관리/업무실적개인/과제관리).
- **D-48:** SYS15 관리자 대메뉴: 관리자(점검항목/휴무일/알림시간/로그이력/예외처리) + 시스템(코드/권한).

### 서브시스템 분할 전략
- **D-49:** 6 plans, 3 waves 구조:
  - Plan 1 (W1): SYS03 기준정보관리 + 메인화면 + 과제검색 (MSW + 기반 CRUD)
  - Plan 2 (W1): SYS15 비밀/매체관리 5종 + 인계/인수 (독립 CRUD)
  - Plan 3 (W2, dep:P1): SYS03 연간과제관리 6종 (과제등록/실적/승인/평가)
  - Plan 4 (W2, dep:P2): SYS15 보안일일결산 6종 + 메인화면 + 결재
  - Plan 5 (W3, dep:P3): SYS03 평가결과 + 게시판3 + 라우터 완성
  - Plan 6 (W3, dep:P4): SYS15 결산종합현황4 + 관리자5 + 개인설정 + 게시판2 + 시스템2 + 라우터 완성

### Claude's Discretion
- MSW Mock 데이터 구조 및 Faker.js 시드
- 테이블 컬럼 구성 상세 (req_analysis 기반)
- 검색 필터 조건 조합
- 차트 색상/스타일 디테일
- Calendar cellRender 렌더링 상세
- Checkbox.Group 체크리스트 항목 구성
- Tree 노드 아이콘/스타일
- 관리대장/기록부 PrintableReport 레이아웃 상세

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 요구사항 원본
- `req_analysis.txt` lines 137-215 — SYS03 성과관리체계 77개 프로세스 상세
- `req_analysis.txt` lines 578-718 — SYS15 보안일일결산체계 139개 프로세스 상세
- `.planning/REQUIREMENTS.md` lines 268-284 — PERF-01~17 요구사항
- `.planning/REQUIREMENTS.md` lines 288-315 — SEC-01~28 요구사항

### 메뉴 구조
- `navy-admin/src/entities/subsystem/menus.ts` lines 101-152 — SYS03 6개 대메뉴 정의
- `navy-admin/src/entities/subsystem/menus.ts` lines 509-589 — SYS15 9개 대메뉴 정의

### 선행 Phase 패턴 (재사용 대상)
- `.planning/phases/06-2/06-CONTEXT.md` — Phase 6 Tree Master-Detail, Calendar cellRender, Upload.Dragger 패턴 결정
- `.planning/phases/04-a-6/04-CONTEXT.md` — Phase 4 Steps 결재, PrintableReport, @ant-design/charts 패턴 결정
- `.planning/phases/05-b-3/05-VERIFICATION.md` — Phase 5 검증 (173 tests)
- `.planning/phases/06-2/06-VERIFICATION.md` — Phase 6 검증 (871 tests)

### 기존 코드 스텁
- `navy-admin/src/pages/sys03-performance/index.tsx` — 현재 SubsystemPage 스텁
- `navy-admin/src/pages/sys15-security/index.tsx` — 현재 SubsystemPage 스텁

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **DataTable**: `@/shared/ui/DataTable` — ProTable 래퍼, 페이지네이션 내부 변환
- **CrudForm**: `@/shared/ui/CrudForm` — ProForm 기반 CRUD Modal
- **SearchForm**: `@/shared/ui/SearchForm` — 검색 조건 폼
- **StatusBadge**: `@/shared/ui/StatusBadge` — 상태별 색상 Badge
- **PrintableReport**: `@/shared/ui/PrintableReport` — 인쇄 미리보기 래퍼 + print.css
- **apiClient**: `@/shared/api/client` — axios 인스턴스 (NOT apiClient)
- **Phase 1 공통게시판**: `@/pages/common/board` — lazy import 재사용
- **Phase 1 코드관리**: `@/pages/common/code-management` — lazy import
- **Phase 1 권한관리**: `@/pages/common/auth-group` — lazy import
- **@ant-design/charts**: Bar, Pie, Line, Column, Gauge, DualAxes 등

### Established Patterns
- **Steps 결재**: 작성→결재대기→승인/반려 Steps 컴포넌트 + StatusBadge 조합
- **Tree Master-Detail**: Phase 6 antd Tree 좌측 Card + DataTable 우측, selectedKey queryKey 연동
- **Calendar cellRender**: Phase 6 antd Calendar + cellRender Badge, onPanelChange/onSelect 분리
- **Upload.Dragger + Base64**: beforeUpload return false, FileReader.readAsDataURL
- **Excel Mock**: message.success('엑셀 파일 다운로드가 시작됩니다')
- **Tabs 구조**: antd Tabs items prop + TabPane 내용
- **Chart 패턴**: @ant-design/charts 컴포넌트 직접 import, height/data prop

### Integration Points
- `navy-admin/src/app/router.tsx` — sys03, sys15 라우트 등록 (현재 스텁)
- `navy-admin/src/entities/subsystem/menus.ts` — 메뉴 이미 정의됨 (수정 불요)
- `navy-admin/src/mocks/handlers/index.ts` — MSW handler 등록점

</code_context>

<specifics>
## Specific Ideas

- SYS15 비밀/매체 3종은 CRUD 패턴이 동일하므로 type prop 기반 공통 컴포넌트로 코드량 최소화
- SYS03 과제 계층(5단)은 Tree 대신 계단식 DataTable로 — 메뉴가 이미 레벨별 분리됨
- SYS15 점검항목관리(21프로세스)는 Tabs 5개로 통합하여 화면 수 최소화
- SYS15 예외처리(체계기준 조직도 + 1인사무실 + 예외처리)는 Phase 6 Tree 패턴 3회 재사용
- SYS03 업무실적 상신→승인→평가 플로우는 Steps 3단계로 시각화

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 07-최고복잡도 서브시스템 2개*
*Context gathered: 2026-04-06*
