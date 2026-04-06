# Phase 4: 중복잡도 서브시스템 A 6개 - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

6개 중복잡도 서브시스템(176개 프로세스)을 Phase 0/1/3의 공통 컴포넌트와 재사용 패턴을 활용하여 완전 동작시킨다. Phase 3의 저복잡도 패턴에서 확장하여, 결재 워크플로우 연동, 설문 문항 편집기, 통계/차트, 보고서/확인서 등 중복잡도 특유의 패턴을 구현한다.

대상 서브시스템:
- 13_지식관리체계 (23개 프로세스): 지식열람/추천/즐겨찾기, 나의지식, 관리자승인, 통계
- 17_검열결과관리체계 (25개 프로세스): 검열계획/부대/결과/추진/결재/통계/차트
- 06_해병대규정관리체계 (30개 프로세스): 현행규정/예규/지시/공지/규정예고/자료실
- 02_설문종합관리체계 (31개 프로세스): 설문참여/문항편집/결과분석/체계관리
- 12_지시건의사항관리체계 (32개 프로세스): 지시사항/건의사항/이행·처리현황/통계
- 09_영현보훈체계 (35개 프로세스): 사망자/상이자/심사/현황통계/보고서/확인서

</domain>

<decisions>
## Implementation Decisions

### 결재 워크플로우 연동
- **D-01:** 검열(INSP-05)의 결재대기/결재완료/반려는 Phase 1의 결재선 관리(common/approval/)와 연동한다. Phase 3의 단순 상태변경과 달리, 결재선 선택 → 순차 결재 → 완료/반려 플로우를 구현한다.
- **D-02:** 결재 상태는 Phase 0의 StatusBadge를 활용하되, 다단계 결재 진행 시 antd Steps 컴포넌트로 현재 단계를 시각화한다.
- **D-03:** 결재 API는 기존 approval 핸들러를 확장하여 서브시스템별 결재 컨텍스트(검열계획ID 등)를 전달한다.

### 설문 문항 편집기 UI
- **D-04:** SURV-02 문항편집은 antd Form.List + 드래그&드롭 정렬(dnd-kit 또는 react-beautiful-dnd)로 구현한다. 동적으로 문항을 추가/삭제/재정렬할 수 있어야 한다.
- **D-05:** 문항 유형은 단일선택(Radio), 복수선택(Checkbox), 주관식(TextArea), 평점(Rate) 4가지를 지원한다.
- **D-06:** 설문 결과분석은 문항별 응답 비율을 antd Progress 또는 간단한 바 차트로 표시한다.
- **D-07:** 설문 배포/마감은 상태 전환(draft→active→closed)으로 관리하며, 배포 시 대상자 선택은 부대/직급 기반 다중 선택으로 구현한다.

### 통계/차트 구현
- **D-08:** 통계가 필요한 서브시스템(KNOW-04, INSP-03, DRCT-01/04/05, SURV-04)은 @ant-design/charts를 사용한다. antd 생태계와 일관된 스타일을 유지한다.
- **D-09:** 차트 종류: 막대차트(Bar - 분야별/부대별), 꺾은선차트(Line - 기간별/연도별), 파이차트(Pie - 비율), 테이블형 통계(Statistic + Card). 각 서브시스템의 요구사항에 맞게 선택.
- **D-10:** 통계 데이터는 MSW에서 faker.js로 생성한 집계 데이터를 반환한다. 백엔드에서 집계하는 것을 시뮬레이션.

### 보고서/확인서 렌더링 (영현보훈)
- **D-11:** HONOR-10~16 보고서와 확인서는 antd Descriptions + Print CSS 패턴으로 구현한다. 화면에서는 Descriptions로 데이터를 표시하고, 프린트 버튼 클릭 시 @media print CSS로 출력 레이아웃을 적용한다.
- **D-12:** Mock 단계에서는 window.print() 호출로 처리. 실 서비스에서는 서버 측 PDF 생성으로 전환 가능하도록 프린트 영역을 별도 컴포넌트로 분리한다.
- **D-13:** 확인서 양식은 antd Typography + Descriptions 조합으로 공문서 스타일을 근사하게 재현한다.

### 규정관리 페이지 재사용
- **D-14:** MREG-01~04 (해병대규정 현행규정/예규/지시)는 Phase 3 sys05(행정규칙)의 페이지 컴포넌트를 Props(타이틀, sysCode, 카테고리)만 변경하여 직접 재사용한다. 별도 페이지 생성 불요.
- **D-15:** MREG-05~07 (공지사항/규정예고/자료실)은 Phase 1 공통게시판을 sysCode 파라미터로 재사용한다. 규정예고는 별도 게시판 카테고리로 구분.
- **D-16:** MREG-08 (권한관리)는 Phase 1 common/auth-group/ 재사용.

### 이행/처리현황 추적 (지시건의)
- **D-17:** DRCT-01 지시사항 이행현황과 DRCT-04 건의사항 처리현황은 antd Progress + StatusBadge 조합으로 진행률을 표시한다. 각 항목별 상태(미착수/진행중/완료/지연)를 StatusBadge로, 전체 진행률을 Progress로 시각화.
- **D-18:** 이행/처리 이력은 antd Timeline 컴포넌트로 시간순 기록을 표시한다. 각 이력에 담당자, 내용, 일시를 포함.

### 지식관리 특수 기능
- **D-19:** KNOW-01 추천/즐겨찾기/신고는 Phase 3 나의제언(sys14)의 독립 API 호출 패턴을 재사용한다.
- **D-20:** KNOW-03 관리자 승인/반려는 Phase 3의 단순 상태변경 패턴(pending→approved/rejected)을 사용한다. 지식은 결재선 연동 불요.
- **D-21:** KNOW-04 통계는 @ant-design/charts로 분야별/부대별/기간별 Bar/Line 차트를 구현한다.

### 영현보훈 데이터 관리
- **D-22:** HONOR-01~03 사망자/상이자/심사 관리는 DataTable + CrudForm 기본 패턴으로 구현한다.
- **D-23:** HONOR-04~09 현황(부대별/신분별/연도별/월별 등)은 DataTable + @ant-design/charts 조합으로 테이블과 차트를 함께 표시한다.

### 서브시스템 공통 패턴
- **D-24:** Phase 3에서 확립된 서브시스템 개발 패턴을 동일하게 적용: pages/sys{번호}/ 디렉토리, index.tsx 라우트 매핑, lazy import, sysCode MSW 격리.
- **D-25:** 각 서브시스템의 메인화면이 있는 경우(지식, 지시건의) antd Card + Statistic 대시보드 패턴을 사용한다.
- **D-26:** 게시판(KNOW-05, SURV-05, DRCT-06/07, HONOR-17)은 Phase 1 공통게시판 재사용.
- **D-27:** 코드관리(KNOW-08, SURV-06, INSP-07), 권한관리(KNOW-06, SURV-07, INSP-09)는 Phase 1 공통 페이지 재사용.

### Claude's Discretion
- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합
- 테이블 컬럼 구성 및 정렬/필터 옵션
- 상세 페이지 레이아웃 (Descriptions vs Card vs Tabs)
- 차트 색상/스타일 세부 설정
- 설문 문항 편집기 DnD 라이브러리 선택 (dnd-kit vs react-beautiful-dnd)
- 검열 추진현황 테이블 구조

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 개발 요건
- `개발 spec.txt` — 시스템 개발 요건 (로그인, 세션, 서브시스템 연동 규칙)

### 요구사항 (Phase 4 범위)
- `.planning/REQUIREMENTS.md` — KNOW-01~08, INSP-01~12, MREG-01~08, SURV-01~07, DRCT-01~07, HONOR-01~17

### 기존 코드 (Phase 0/1/3 산출물 — 재사용 대상)
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
- `navy-admin/src/pages/sys05-admin-rules/` — 행정규칙 페이지 (MREG 재사용 대상)
- `navy-admin/src/pages/sys14-suggestion/` — 나의제언 페이지 (추천/신고 패턴 참조)
- `navy-admin/src/entities/subsystem/menus.ts` — 서브시스템 메뉴 구조
- `navy-admin/src/entities/subsystem/config.ts` — SUBSYSTEM_META 설정
- `navy-admin/src/app/router.tsx` — 전체 라우터 구조
- `navy-admin/src/shared/api/mocks/handlers/` — MSW 핸들러 팩토리 패턴

### 이전 Phase Context
- `.planning/phases/00-project-foundation/00-CONTEXT.md` — FSD 구조, URL 컨벤션, 공통 컴포넌트 계약
- `.planning/phases/02-00/02-CONTEXT.md` — NAVY 브랜딩, 세션 관리, 서브시스템 전환 방식
- `.planning/phases/03-5/03-CONTEXT.md` — 서브시스템 재사용 패턴, 단순 승인, 대시보드 패턴

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DataTable` — ProTable 래퍼. 모든 목록 화면에 사용
- `CrudForm` — ProForm 래퍼. 등록/수정 폼에 사용
- `DetailModal` — 상세 조회 팝업
- `StatusBadge` — 상태 뱃지 (승인/반려/결재 상태 표시)
- `BoardListPage`/`BoardPostPage` — 공통게시판. sysCode로 재사용
- Phase 3 sys05 페이지 — MREG-01~04 직접 재사용 가능
- Phase 3 sys14 추천/신고 패턴 — KNOW-01 추천/즐겨찾기/신고 재사용
- `useFavorites` 훅 (sys05) — KNOW-01 즐겨찾기 재사용

### Established Patterns
- Zustand store: authStore, uiStore 전역 상태
- TanStack Query: useQuery/useMutation으로 서버 데이터 관리
- MSW: shared/api/mocks/handlers/{domain}.ts 파일별 핸들러
- sysCode 파라미터로 서브시스템별 데이터 격리
- lazy import로 Phase 1 공통 페이지 재사용
- jsdom 테스트: readFileSync 파일 내용 기반 검증

### Integration Points
- `router.tsx` — 각 서브시스템 lazy 라우트에 실제 페이지 컴포넌트 연결
- `SUBSYSTEM_MENUS` — sys02/06/09/12/13/17 메뉴 구조 이미 정의됨
- `SUBSYSTEM_META` — 서브시스템 메타데이터 이미 정의됨
- `shared/api/mocks/handlers/` — 서브시스템별 MSW 핸들러 추가
- `common/approval/` — 결재선 연동 진입점 (INSP-05)

</code_context>

<specifics>
## Specific Ideas

- Phase 4는 "중복잡도 패턴 확립" Phase — 결재 연동, 통계/차트, 설문 편집기 패턴이 Phase 5~7에서도 재사용됨
- MREG (해병대규정)는 Phase 3 AREG (행정규칙)와 거의 동일 → 최대한 재사용하여 개발 시간 최소화
- 영현보훈의 보고서/확인서는 군 공문서 형식 → Print CSS로 A4 세로 레이아웃 근사
- 설문은 가장 복잡 (31개 프로세스) — 문항 편집기가 핵심 차별 포인트
- @ant-design/charts는 npm install 필요 — 새로운 의존성 추가

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-a-6*
*Context gathered: 2026-04-06*
