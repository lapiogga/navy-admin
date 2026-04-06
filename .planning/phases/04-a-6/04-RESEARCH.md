# Phase 4: 중복잡도 서브시스템 A 6개 - Research

**Researched:** 2026-04-06
**Domain:** React + Ant Design 5 / 결재 워크플로우 / 통계 차트 / 설문 편집기 / 보고서 출력
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**결재 워크플로우 연동**
- D-01: 검열(INSP-05) 결재대기/결재완료/반려는 Phase 1 `common/approval/`과 연동. 결재선 선택 → 순차 결재 → 완료/반려 플로우 구현
- D-02: 결재 상태는 StatusBadge + antd Steps 컴포넌트로 현재 단계 시각화
- D-03: 결재 API는 기존 approval 핸들러 확장, 서브시스템별 결재 컨텍스트(검열계획ID 등) 전달

**설문 문항 편집기 UI**
- D-04: SURV-02 문항편집은 antd Form.List + 드래그&드롭 정렬(dnd-kit 또는 react-beautiful-dnd)로 구현
- D-05: 문항 유형: 단일선택(Radio), 복수선택(Checkbox), 주관식(TextArea), 평점(Rate) 4가지
- D-06: 설문 결과분석은 문항별 응답 비율을 antd Progress 또는 간단한 바 차트로 표시
- D-07: 설문 배포/마감 상태 전환(draft→active→closed), 대상자 선택은 부대/직급 기반 다중 선택

**통계/차트 구현**
- D-08: 통계가 필요한 서브시스템(KNOW-04, INSP-03, DRCT-01/04/05, SURV-04)은 `@ant-design/charts` 사용
- D-09: 차트 종류: Bar(분야별/부대별), Line(기간별/연도별), Pie(비율), Statistic + Card(테이블형)
- D-10: 통계 데이터는 MSW + faker.js 집계 데이터로 시뮬레이션

**보고서/확인서 렌더링 (영현보훈)**
- D-11: HONOR-10~16은 antd Descriptions + Print CSS 패턴
- D-12: Mock 단계는 window.print() 호출. 프린트 영역은 별도 컴포넌트로 분리
- D-13: 확인서 양식은 antd Typography + Descriptions 조합으로 공문서 스타일 재현

**규정관리 페이지 재사용**
- D-14: MREG-01~04는 sys05 페이지 컴포넌트를 Props만 변경하여 직접 재사용
- D-15: MREG-05~07은 Phase 1 공통게시판을 sysCode 파라미터로 재사용
- D-16: MREG-08 권한관리는 Phase 1 `common/auth-group/` 재사용

**이행/처리현황 추적 (지시건의)**
- D-17: DRCT-01 이행현황, DRCT-04 처리현황은 antd Progress + StatusBadge 조합
- D-18: 이행/처리 이력은 antd Timeline 컴포넌트로 시간순 기록

**지식관리 특수 기능**
- D-19: KNOW-01 추천/즐겨찾기/신고는 sys14 나의제언 독립 API 호출 패턴 재사용
- D-20: KNOW-03 관리자 승인/반려는 단순 상태변경 패턴(pending→approved/rejected), 결재선 연동 불요
- D-21: KNOW-04 통계는 @ant-design/charts Bar/Line 차트

**영현보훈 데이터 관리**
- D-22: HONOR-01~03 사망자/상이자/심사는 DataTable + CrudForm 기본 패턴
- D-23: HONOR-04~09 현황은 DataTable + @ant-design/charts 조합

**서브시스템 공통 패턴**
- D-24: Phase 3 패턴 동일 적용: pages/sys{번호}/ 디렉토리, index.tsx 라우트 매핑, lazy import, sysCode MSW 격리
- D-25: 메인화면 있는 서브시스템(지식, 지시건의)은 antd Card + Statistic 대시보드 패턴
- D-26: 게시판(KNOW-05, SURV-05, DRCT-06/07, HONOR-17)은 Phase 1 공통게시판 재사용
- D-27: 코드관리(KNOW-08, SURV-06, INSP-07), 권한관리(KNOW-06, SURV-07, INSP-09)는 Phase 1 공통 페이지 재사용

### Claude's Discretion

- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합
- 테이블 컬럼 구성 및 정렬/필터 옵션
- 상세 페이지 레이아웃 (Descriptions vs Card vs Tabs)
- 차트 색상/스타일 세부 설정
- 설문 문항 편집기 DnD 라이브러리 선택 (dnd-kit vs react-beautiful-dnd)
- 검열 추진현황 테이블 구조

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| KNOW-01 | 지식열람 (목록조회, 상세조회, 검색, 추천, 즐겨찾기, 다운로드, 신고) [7] | sys14 추천/즐겨찾기 패턴 재사용 (D-19). DataTable + DetailModal |
| KNOW-02 | 나의 지식 관리 (등록, 수정, 삭제, 목록조회) [4] | DataTable + CrudForm 기본 패턴 |
| KNOW-03 | 지식 관리 관리자 승인/반려 [2] | 단순 상태변경 패턴 (D-20). Phase 3 승인 패턴 |
| KNOW-04 | 지식통계 (분야별, 부대별, 기간별, 인기순, 저장) [5] | @ant-design/charts Bar + Line (D-21) |
| KNOW-05 | 게시판 (공지사항, 질의응답) [2] | Phase 1 공통게시판 lazy 재사용 (D-26) |
| KNOW-06 | 권한관리 [1] | Phase 1 common/auth-group/ 재사용 (D-27) |
| KNOW-07 | 메뉴관리 [1] | Phase 1 common/system-mgr/ 재사용 |
| KNOW-08 | 코드관리 [1] | Phase 1 common/code-mgmt/ 재사용 (D-27) |
| INSP-01 | 검열계획 (등록, 수정, 삭제) [3] | DataTable + CrudForm 기본 패턴 |
| INSP-02 | 검열부대 지정 [1] | DataTable + 다중선택 패턴 |
| INSP-03 | 검열결과 (목록조회, 등록, 수정, 삭제, 상세조회, 저장, 통계, 차트) [8] | @ant-design/charts 통계 (D-08/09) |
| INSP-04 | 추진현황 (조회, 저장) [2] | DataTable + Progress 시각화 (D-17) |
| INSP-05 | 결재 (결재대기, 결재완료, 반려) [3] | Phase 1 approval 확장 + antd Steps (D-01~03) |
| INSP-06 | 공지사항 [1] | Phase 1 공통게시판 재사용 |
| INSP-07 | 공통코드관리 [1] | Phase 1 공통 재사용 (D-27) |
| INSP-08 | 부대관리 [1] | DataTable + CrudForm |
| INSP-09 | 사용자별권한등록 [1] | Phase 1 auth-group 재사용 (D-27) |
| INSP-10 | 접속로그 [1] | Phase 1 system-mgr/AccessLogPage 재사용 |
| INSP-11 | 검열계획 정보 (데이터) [1] | DataTable 조회 전용 |
| INSP-12 | 검열결과 정보 (데이터) [1] | DataTable 조회 전용 |
| MREG-01 | 현행규정 (목록조회, 상세조회, 검색, 다운로드, 프린트, 즐겨찾기) [6] | sys05 RegulationListPage 재사용 (D-14) |
| MREG-02 | 예규 - 해병대사령부 (목록조회, 상세조회, 검색, 다운로드) [4] | sys05 PrecedentHQPage 재사용 (D-14) |
| MREG-03 | 예규 - 예하부대 [1] | sys05 PrecedentUnitPage 재사용 (D-14) |
| MREG-04 | 지시문서 (목록조회, 상세조회, 검색, 다운로드) [4] | sys05 DirectiveListPage 재사용 (D-14) |
| MREG-05 | 공지사항 (목록조회, 등록, 수정, 삭제) [4] | Phase 1 공통게시판 sysCode='sys06' 재사용 (D-15) |
| MREG-06 | 규정예고 (목록조회, 등록, 수정, 삭제) [4] | Phase 1 공통게시판 sysCode='sys06-notice' 재사용 (D-15) |
| MREG-07 | 자료실 (목록조회, 등록, 수정, 삭제) [4] | Phase 1 공통게시판 sysCode='sys06-archive' 재사용 (D-15) |
| MREG-08 | 권한관리 (조회, 등록, 삭제) [3] | Phase 1 auth-group 재사용 (D-16) |
| SURV-01 | 설문참여 (목록조회, 설문응답, 결과보기) [3] | DataTable + 설문응답 폼 |
| SURV-02 | 나의 설문관리 (설문생성, 문항편집, 수정, 삭제, 배포, 마감, 결과분석, 저장) [8] | Form.List + dnd-kit (D-04~07) — 가장 복잡 |
| SURV-03 | 지난 설문보기 (목록조회, 상세조회, 결과보기) [3] | DataTable + DetailModal |
| SURV-04 | 체계관리 (설문관리, 사용자관리, 카테고리관리, 통계, 설문템플릿, 대상자관리) [13] | @ant-design/charts 통계 (D-08) |
| SURV-05 | 게시판 (공지사항, 질의응답) [2] | Phase 1 공통게시판 재사용 (D-26) |
| SURV-06 | 공통코드관리 [1] | Phase 1 공통 재사용 (D-27) |
| SURV-07 | 권한관리 [1] | Phase 1 auth-group 재사용 (D-27) |
| DRCT-01 | 지휘관 지시사항 (목록조회, 등록, 수정, 삭제, 상세조회, 이행현황, 저장, 검색, 통계, 차트) [10] | Progress + Timeline + @ant-design/charts (D-17/18) |
| DRCT-02 | 대통령 지시사항 [1] | DataTable 조회 전용 |
| DRCT-03 | 국방부장관 지시사항 [1] | DataTable 조회 전용 |
| DRCT-04 | 지휘관 건의사항 (목록조회, 등록, 수정, 삭제, 상세조회, 처리현황, 저장, 검색, 통계) [9] | Progress + Timeline + @ant-design/charts (D-17/18) |
| DRCT-05 | 관리자 (지시사항관리, 건의사항관리, 카테고리, 통계, 사용자, 부대, 기간설정, 알림, 권한) [9] | @ant-design/charts + DataTable 복합 |
| DRCT-06 | 공지사항 [1] | Phase 1 공통게시판 재사용 (D-26) |
| DRCT-07 | 질의응답 [1] | Phase 1 공통게시판 재사용 (D-26) |
| HONOR-01 | 사망자 관리 (목록조회, 등록, 수정, 삭제, 상세조회) [5] | DataTable + CrudForm (D-22) |
| HONOR-02 | 상이자 관리 (목록조회, 등록, 수정, 삭제, 상세조회) [5] | DataTable + CrudForm (D-22) |
| HONOR-03 | 전공사상심사 관리 (목록조회, 등록, 수정, 삭제, 상세조회) [5] | DataTable + CrudForm (D-22) |
| HONOR-04 | 부대별 사망자 현황 (조회, 저장) [2] | DataTable + @ant-design/charts Bar (D-23) |
| HONOR-05 | 부대별 사망자 명부 (조회, 저장) [2] | DataTable + 저장 버튼 |
| HONOR-06 | 신분별 사망자 현황 (조회, 저장) [2] | DataTable + @ant-design/charts Pie (D-23) |
| HONOR-07 | 연도별 사망자 현황 (조회, 저장) [2] | DataTable + @ant-design/charts Line (D-23) |
| HONOR-08 | 월별 사망자 현황 (조회, 저장) [2] | DataTable + @ant-design/charts Bar (D-23) |
| HONOR-09 | 전사망자 명부 (조회, 저장) [2] | DataTable 조회 + CSV 저장 |
| HONOR-10 | 사망자 현황 보고서 [1] | Descriptions + Print CSS (D-11~13) |
| HONOR-11 | 상이자 현황 보고서 [1] | Descriptions + Print CSS (D-11~13) |
| HONOR-12 | 순직/사망확인서 [1] | Typography + Descriptions + Print CSS (D-13) |
| HONOR-13 | 국가유공자 요건 해당사실 확인서(사망자) [1] | Typography + Descriptions + Print CSS (D-13) |
| HONOR-14 | 국가유공자 요건 해당사실 확인서(상이자) [1] | Typography + Descriptions + Print CSS (D-13) |
| HONOR-15 | 전공사상심사결과 [1] | Descriptions + Print CSS (D-11~13) |
| HONOR-16 | 전사망자 확인증 발급대장 [1] | DataTable + Print CSS (D-11) |
| HONOR-17 | 게시판 [1] | Phase 1 공통게시판 재사용 (D-26) |

</phase_requirements>

---

## Summary

Phase 4는 Phase 3(저복잡도)에서 확립한 패턴 위에 3가지 신규 패턴을 추가하는 단계다. (1) 결재 워크플로우 연동(INSP-05), (2) @ant-design/charts 통계 차트, (3) 설문 문항 편집기(Form.List + dnd-kit)가 핵심 신규 기술이다. 나머지 기능(MREG 규정관리, 공통게시판 재사용, DataTable+CrudForm CRUD)은 Phase 0~3 패턴의 직접 적용이다.

새로운 npm 의존성은 2개다: `@ant-design/charts`(차트)와 `@dnd-kit/core` + `@dnd-kit/sortable`(설문 문항 DnD). `react-beautiful-dnd`는 React 18 Strict Mode 호환 문제가 있어 dnd-kit이 권장된다. 두 패키지 모두 현재 환경(React 18, navy-admin)에 설치되어 있지 않으므로 Wave 0에서 install이 필요하다.

176개 프로세스 중 약 60개는 Phase 1 공통 페이지 또는 Phase 3 sys05 페이지의 lazy 재사용이므로, 실제 신규 구현은 약 116개 프로세스다. 6개 서브시스템은 복잡도 차이가 있어(MREG는 sys05 거의 복사, SURV가 가장 복잡) 병렬 실행이 가능하다.

**Primary recommendation:** Wave 0에서 `@ant-design/charts` + `@dnd-kit` 설치 후, 복잡도 역순으로 6개 서브시스템을 병렬 개발한다. MREG(재사용 최대), KNOW(단순 CRUD+통계), INSP(결재 연동), HONOR(보고서+현황), DRCT(이행추적+통계), SURV(문항편집기 — 최복잡) 순으로 난이도가 올라간다.

---

## Project Constraints (from CLAUDE.md)

- **Tech Stack 고정**: React 18 + TypeScript + Tailwind CSS + Vite + Ant Design 5.x (ProComponents)
- **Backend 없음**: Java Spring Boot 추후. 현재는 MSW Mock API로 모든 기능 구현
- **인증**: Mock 인증 사용 (Phase 0 authStore 기반)
- **FSD 구조**: pages/sys{번호}/ 디렉토리 구조 유지
- **테스트**: readFileSync 기반 파일 내용 검증 패턴 (jsdom heavy import 회피)
- **라우팅**: sysCode URL 패턴 (`/sys{번호}/{대메뉴}/{소메뉴}`) 기존 menus.ts에 정의된 경로 사용
- **현재 의존성 확인됨** (package.json 기준):
  - antd 5.29.3, @ant-design/pro-components 2.8.10
  - zustand 5.0.12, @tanstack/react-query 5.96.2
  - msw 2.12.14, @faker-js/faker 10.4.0
  - vitest 4.1.2, @testing-library/react 16.3.2
  - **미설치**: @ant-design/charts, @dnd-kit/core, @dnd-kit/sortable

---

## Standard Stack

### Core (기존 — 변경 없음)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| antd | 5.29.3 | UI 컴포넌트 (Steps, Descriptions, Progress, Timeline, Rate) | Phase 0 결정. 행정 포탈 전체 기반 |
| @ant-design/pro-components | 2.8.10 | ProTable, ProForm, PageContainer | Phase 0 결정. DataTable/CrudForm 래퍼 기반 |
| zustand | 5.0.12 | 전역 상태 (authStore, uiStore) | Phase 0 결정 |
| @tanstack/react-query | 5.96.2 | 서버 상태 (useQuery, useMutation) | Phase 0 결정 |
| msw | 2.12.14 | Mock API 핸들러 | Phase 0 결정 |
| @faker-js/faker | 10.4.0 | Mock 데이터 생성 (ko locale) | Phase 0 결정 |

### New Dependencies (Phase 4 신규 설치 필요)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @ant-design/charts | 2.6.7 | 통계 차트 (Bar, Line, Pie) | D-08 결정. antd 생태계 일관 스타일. peerDeps: React>=16.8.4 (충족) |
| @dnd-kit/core | 6.3.1 | DnD 기반 엔진 | D-04 결정. React 18 Strict Mode 완벽 지원. react-beautiful-dnd 대비 안정적 |
| @dnd-kit/sortable | 10.0.0 | 드래그 정렬 (설문 문항 재정렬) | @dnd-kit/core 6.3.0+ 요구. 설문 문항 편집기에서 사용 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @ant-design/charts | recharts | recharts가 더 경량이나 antd 테마 연동 없음. D-08에서 @ant-design/charts로 결정 |
| @ant-design/charts | @ant-design/plots | plots는 차트 단독. charts는 plots 상위 래퍼. 동일 Ant Design 생태계, charts 선택 |
| @dnd-kit | react-beautiful-dnd | rbd는 React 18 Strict Mode에서 `console.error` 발생 및 유지보수 중단 상태. dnd-kit 우선 |

**Installation:**
```bash
cd navy-admin
npm install @ant-design/charts@2.6.7
npm install @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0
```

---

## Architecture Patterns

### Phase 4 서브시스템 디렉토리 구조 (Phase 3 패턴 동일)

```
navy-admin/src/
├── pages/
│   ├── sys02-survey/           # 설문종합관리체계 (신규 구현)
│   │   ├── index.tsx           # Routes 정의 + lazy import
│   │   ├── SurveyListPage.tsx  # 설문참여 목록
│   │   ├── SurveyFormPage.tsx  # 설문 응답
│   │   ├── MySurveyPage.tsx    # 나의 설문관리 (문항편집기 포함)
│   │   ├── SurveyAdminPage.tsx # 체계관리
│   │   └── SurveyQuestionEditor.tsx  # 문항 편집기 컴포넌트
│   ├── sys06-regulations/      # 해병대규정관리체계 (sys05 재사용)
│   │   └── index.tsx           # sys05 컴포넌트 re-export + sysCode 변경
│   ├── sys09-memorial/         # 영현보훈체계 (신규 구현)
│   │   ├── index.tsx
│   │   ├── DeceasedPage.tsx    # 사망자 관리
│   │   ├── InjuredPage.tsx     # 상이자 관리
│   │   ├── ReviewPage.tsx      # 전공사상심사 관리
│   │   ├── StatusPages.tsx     # 현황 통계 (부대별/신분별/연도별/월별)
│   │   └── ReportPages.tsx     # 보고서/확인서 (Print CSS)
│   ├── sys12-directives/       # 지시건의사항관리체계 (신규 구현)
│   │   ├── index.tsx
│   │   ├── DirectivePage.tsx   # 지시사항 (이행현황 + 통계)
│   │   └── ProposalPage.tsx    # 건의사항 (처리현황 + 통계)
│   ├── sys13-knowledge/        # 지식관리체계 (신규 구현)
│   │   ├── index.tsx
│   │   ├── KnowledgeListPage.tsx    # 지식열람
│   │   ├── MyKnowledgePage.tsx      # 나의 지식 관리
│   │   ├── KnowledgeAdminPage.tsx   # 지식 관리 (승인/반려)
│   │   └── KnowledgeStatsPage.tsx   # 지식통계
│   └── sys17-inspection/       # 검열결과관리체계 (신규 구현)
│       ├── index.tsx
│       ├── InspectionPlanPage.tsx   # 검열계획
│       ├── InspectionResultPage.tsx # 검열결과
│       ├── ApprovalPage.tsx         # 결재 (Phase 1 연동)
│       └── ProgressPage.tsx         # 추진현황
└── shared/api/mocks/handlers/
    ├── sys02.ts     # 설문 Mock
    ├── sys06.ts     # 규정 Mock (sys05 핸들러 sysCode 변형)
    ├── sys09.ts     # 영현보훈 Mock
    ├── sys12.ts     # 지시건의 Mock
    ├── sys13.ts     # 지식관리 Mock
    └── sys17.ts     # 검열결과 Mock
```

### Pattern 1: sys05 페이지 재사용 (MREG)

**What:** sys06은 sys05의 RegulationListPage, PrecedentHQPage 등을 직접 import하여 `sysCode` prop만 변경
**When to use:** 동일 레이아웃·기능, URL만 다른 경우

```typescript
// navy-admin/src/pages/sys06-regulations/index.tsx
import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Spin } from 'antd'

// sys05 페이지 컴포넌트 직접 재사용 (D-14)
const RegulationListPage = lazy(() => import('../sys05-admin-rules/RegulationListPage'))
const PrecedentHQPage = lazy(() => import('../sys05-admin-rules/PrecedentHQPage'))
const PrecedentUnitPage = lazy(() => import('../sys05-admin-rules/PrecedentUnitPage'))
const DirectiveListPage = lazy(() => import('../sys05-admin-rules/DirectiveListPage'))

// 공통게시판 재사용 (D-15)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

export default function Page() {
  return (
    <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '100px auto' }} />}>
      <Routes>
        <Route index element={<Navigate to="/sys06/1/1" replace />} />
        <Route path="1/1" element={<RegulationListPage />} />  {/* MREG-01 */}
        <Route path="2/1" element={<PrecedentHQPage />} />     {/* MREG-02 */}
        <Route path="2/2" element={<PrecedentUnitPage />} />   {/* MREG-03 */}
        <Route path="3/1" element={<DirectiveListPage />} />   {/* MREG-04 */}
        <Route path="4/1" element={<BoardIndex />} />          {/* MREG-05 공지사항 */}
        <Route path="4/2" element={<BoardIndex />} />          {/* MREG-06 규정예고 */}
        <Route path="4/3" element={<BoardIndex />} />          {/* MREG-07 자료실 */}
        <Route path="5/1" element={<AuthGroupIndex />} />      {/* MREG-08 권한관리 */}
      </Routes>
    </Suspense>
  )
}
```

### Pattern 2: @ant-design/charts 통계 차트

**What:** Bar, Line, Pie 차트를 @ant-design/charts로 구현. MSW에서 집계 데이터 반환
**When to use:** KNOW-04, INSP-03, DRCT-01/04/05, SURV-04, HONOR-04~09

```typescript
// 막대차트 (분야별/부대별 통계)
import { Bar } from '@ant-design/charts'

const config = {
  data: statsData,      // [{ category: '전술', count: 42 }, ...]
  xField: 'category',
  yField: 'count',
  colorField: 'category',
  label: { position: 'top' },
}
return <Bar {...config} />

// 꺾은선차트 (기간별 추이)
import { Line } from '@ant-design/charts'

// 파이차트 (비율)
import { Pie } from '@ant-design/charts'
const pieConfig = {
  data: ratioData,    // [{ type: '사망자', value: 45 }, ...]
  angleField: 'value',
  colorField: 'type',
  label: { type: 'outer' },
}
```

### Pattern 3: 결재 워크플로우 연동 (INSP-05)

**What:** Phase 1 ApprovalLinePage에서 정의된 결재선을 검열계획에 연결하여 순차 결재 플로우 구현
**When to use:** 결재대기 → 결재 → 완료/반려 상태 전환이 필요한 경우

```typescript
// 검열결재 페이지 핵심 구조
import { Steps, Button } from 'antd'
import { StatusBadge } from '@/shared/ui/StatusBadge'

// 결재 단계 시각화 (D-02)
const approvalSteps = approvers.map((a, idx) => ({
  title: `${a.userRank} ${a.userName}`,
  description: a.status === 'approved' ? '결재완료' : 
               a.status === 'rejected' ? '반려' : '대기',
  status: a.status === 'approved' ? 'finish' : 
          a.status === 'rejected' ? 'error' : 
          idx === currentStep ? 'process' : 'wait',
}))

<Steps items={approvalSteps} />

// MSW 핸들러 확장 (D-03)
// POST /api/sys17/approval/approve  — 결재
// POST /api/sys17/approval/reject   — 반려
// GET  /api/sys17/approval/pending  — 결재대기 목록
```

### Pattern 4: 설문 문항 편집기 (SURV-02)

**What:** antd Form.List + @dnd-kit/sortable로 동적 문항 추가/삭제/재정렬 구현
**When to use:** SURV-02 나의 설문관리의 문항편집 기능

```typescript
import { Form, Radio, Checkbox, Input, Rate, Button } from 'antd'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 정렬 가능한 문항 아이템
function SortableQuestion({ id, index, remove }: { id: string; index: number; remove: (i: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <span {...listeners} style={{ cursor: 'grab' }}>⠿</span>
      <Form.Item name={[index, 'type']}>
        <Radio.Group>
          <Radio value="radio">단일선택</Radio>
          <Radio value="checkbox">복수선택</Radio>
          <Radio value="text">주관식</Radio>
          <Radio value="rate">평점</Radio>
        </Radio.Group>
      </Form.Item>
      <Button onClick={() => remove(index)} danger>삭제</Button>
    </div>
  )
}

// Form.List + DndContext 조합
<Form.List name="questions">
  {(fields, { add, remove, move }) => (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (active.id !== over?.id) {
          const oldIndex = fields.findIndex(f => f.key === active.id)
          const newIndex = fields.findIndex(f => f.key === over?.id)
          move(oldIndex, newIndex)
        }
      }}
    >
      <SortableContext
        items={fields.map(f => String(f.key))}
        strategy={verticalListSortingStrategy}
      >
        {fields.map((field, index) => (
          <SortableQuestion key={field.key} id={String(field.key)} index={index} remove={remove} />
        ))}
      </SortableContext>
    </DndContext>
  )}
</Form.List>
```

### Pattern 5: 보고서/확인서 Print CSS (HONOR-10~16)

**What:** antd Descriptions + @media print CSS로 A4 공문서 레이아웃 구현
**When to use:** 영현보훈 보고서, 확인서, 발급대장

```typescript
// PrintableReport.tsx — 프린트 영역 격리 (D-12)
import { Descriptions, Typography, Button } from 'antd'

export function PrintableReport({ data }: { data: ReportData }) {
  return (
    <>
      <Button onClick={() => window.print()} className="no-print">
        프린트
      </Button>
      <div className="print-area">
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          {data.title}
        </Typography.Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="부대">{data.unit}</Descriptions.Item>
          <Descriptions.Item label="기준일">{data.date}</Descriptions.Item>
          {/* ... */}
        </Descriptions>
      </div>
    </>
  )
}
```

```css
/* print.css — @media print 스타일 */
@media print {
  .no-print { display: none !important; }
  .print-area {
    width: 210mm;         /* A4 너비 */
    min-height: 297mm;    /* A4 높이 */
    padding: 20mm;
    font-size: 12pt;
    font-family: '맑은 고딕', sans-serif;
  }
  /* antd 컴포넌트 프린트 최적화 */
  .ant-descriptions-item-label { font-weight: bold; }
}
```

### Pattern 6: 이행/처리현황 추적 (DRCT-01/04)

**What:** antd Progress + Timeline 조합으로 이행 진행률과 이력을 시각화
**When to use:** 지시사항 이행현황, 건의사항 처리현황

```typescript
import { Progress, Timeline, Tag } from 'antd'
import { StatusBadge } from '@/shared/ui/StatusBadge'

// 진행률 표시 (D-17)
<Progress percent={item.progressRate} status={item.status === 'delayed' ? 'exception' : 'active'} />

// 이행 이력 (D-18)
<Timeline
  items={item.history.map(h => ({
    children: (
      <>
        <Tag>{h.date}</Tag>
        <strong>{h.handler}</strong>: {h.content}
      </>
    ),
  }))}
/>
```

### Anti-Patterns to Avoid

- **sys06 독립 구현**: MREG는 sys05와 동일한 기능. 새로 만들지 말고 sys05 컴포넌트를 import하라
- **결재를 완전 새로 만들기**: Phase 1 ApprovalLinePage의 결재선 데이터와 API를 반드시 연동하라. 독립 결재 구현 금지
- **@ant-design/plots 혼용**: charts와 plots 패키지는 별도다. `@ant-design/charts`만 설치·사용
- **react-beautiful-dnd 사용**: React 18 Strict Mode에서 동작 불안정. dnd-kit만 사용
- **설문 문항을 별도 페이지로 분리**: 문항 편집기는 MySurveyPage 내 Modal 또는 inline 섹션으로 구현 (라우팅 복잡성 최소화)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 통계 차트 | 직접 SVG/Canvas 구현 | @ant-design/charts | 반응형, 테마, 툴팁, 범례 모두 내장 |
| 드래그 정렬 | mousedown/mousemove 이벤트 | @dnd-kit/sortable | 접근성, 터치 지원, 애니메이션 포함 |
| 결재 순서 UI | 커스텀 스텝 컴포넌트 | antd Steps | 상태(wait/process/finish/error) 내장 |
| 진행률 표시 | 직접 width 퍼센트 bar | antd Progress | 애니메이션, 상태 색상 자동 처리 |
| 이력 타임라인 | ul/li 직접 구현 | antd Timeline | 아이콘, 색상, 레이아웃 내장 |
| 공문서 A4 레이아웃 | 별도 PDF 라이브러리 | @media print CSS + window.print() | Mock 단계에서 서버 불필요. D-12에서 결정 |

**Key insight:** Phase 4 신규 기술(차트, DnD, 결재 Steps)은 모두 antd/dnd-kit 생태계가 완전히 커버한다. 직접 구현 시 엣지케이스(터치, 접근성, 반응형)를 놓치게 된다.

---

## Common Pitfalls

### Pitfall 1: @ant-design/charts 번들 크기
**What goes wrong:** `@ant-design/charts` 전체 import 시 번들 크기가 크게 증가한다
**Why it happens:** AntV G2 기반으로 전체 차트 라이브러리를 포함
**How to avoid:** named import 사용. `import { Bar } from '@ant-design/charts'` (트리쉐이킹 지원)
**Warning signs:** 빌드 후 chunk 크기가 비정상적으로 클 경우

### Pitfall 2: dnd-kit Form.List 인덱스 불일치
**What goes wrong:** DndContext의 `onDragEnd`에서 `move(oldIndex, newIndex)` 호출 시 인덱스가 Form.List의 field.key와 다를 수 있다
**Why it happens:** field.key는 삭제 후에도 유지되는 고유 키, index는 현재 배열 위치
**How to avoid:** `fields.findIndex(f => f.key === active.id)`로 key 기반 index 탐색
**Warning signs:** 문항 재정렬 후 폼 값이 예상과 다른 순서로 저장됨

### Pitfall 3: 결재선 연동 시 컨텍스트 누락
**What goes wrong:** 결재 승인/반려 API 호출 시 어떤 검열계획의 결재인지 컨텍스트 없이 호출
**Why it happens:** Phase 1 approval API는 결재선 자체를 관리하고, 서브시스템별 결재는 추가 컨텍스트 필요
**How to avoid:** D-03 준수 — MSW 핸들러에서 `inspectionPlanId` 포함 요청 처리. POST body에 `{ approvalLineId, contextId: inspectionId, action: 'approve'|'reject' }` 구조
**Warning signs:** 결재 완료 후 검열결과 상태가 변경되지 않음

### Pitfall 4: Print CSS와 Tailwind 충돌
**What goes wrong:** `@media print` 스타일이 Tailwind의 utility class와 충돌하여 출력 레이아웃 깨짐
**Why it happens:** Tailwind preflight가 일부 print 스타일을 재정의
**How to avoid:** 프린트 영역은 Tailwind class 대신 antd 컴포넌트와 인라인 스타일 사용. `print-area` 클래스를 별도 CSS 파일로 관리
**Warning signs:** 화면과 출력물 레이아웃 불일치

### Pitfall 5: 설문 상태 전환 (draft→active→closed) 일관성
**What goes wrong:** 배포된 설문(active)을 사용자가 응답 중에 관리자가 문항 수정 가능
**Why it happens:** 상태 체크 없이 편집 API 허용
**How to avoid:** `draft` 상태일 때만 문항 편집 허용. CrudForm `mode='view'` 또는 버튼 비활성화로 처리
**Warning signs:** active 설문의 문항이 응답 중에 변경됨

### Pitfall 6: MSW 핸들러 index.ts 등록 누락
**What goes wrong:** `shared/api/mocks/handlers/sys{N}.ts` 파일을 만들었지만 `handlers/index.ts`에 추가를 안 해서 API가 404 반환
**Why it happens:** 기존 index.ts는 수동으로 handlers 배열에 추가해야 함
**How to avoid:** 각 MSW 핸들러 파일 생성 즉시 `index.ts`에 등록. 테스트에서 핸들러 export 확인
**Warning signs:** 브라우저 Network 탭에서 `/api/sys{N}/...` 요청이 실제 서버로 나가며 CORS 에러

---

## Code Examples

### MSW 핸들러 패턴 (sys13 예시)

```typescript
// navy-admin/src/shared/api/mocks/handlers/sys13.ts
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'

interface Knowledge {
  id: string
  title: string
  category: string        // '전술', '군수', '인사', '정보', '작전'
  unit: string
  authorName: string
  status: 'pending' | 'approved' | 'rejected'
  recommendCount: number
  isFavorite: boolean
  createdAt: string
}

function paginate<T>(items: T[], page: number, size: number) {
  const start = page * size
  return {
    content: items.slice(start, start + size),
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    size,
    number: page,
  }
}

const CATEGORIES = ['전술', '군수', '인사', '정보', '작전']
const knowledgeList: Knowledge[] = Array.from({ length: 30 }, (_, i) => ({
  id: `know-${i + 1}`,
  title: faker.lorem.words({ min: 3, max: 6 }),
  category: CATEGORIES[i % CATEGORIES.length],
  unit: `제${faker.number.int({ min: 1, max: 5 })}대대`,
  authorName: faker.person.lastName() + faker.person.firstName(),
  status: i % 5 === 0 ? 'pending' : i % 8 === 0 ? 'rejected' : 'approved',
  recommendCount: faker.number.int({ min: 0, max: 50 }),
  isFavorite: false,
  createdAt: faker.date.recent({ days: 180 }).toISOString().split('T')[0],
}))

export const sys13Handlers = [
  // 지식 목록
  http.get('/api/sys13/knowledge', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    return HttpResponse.json({ success: true, data: paginate(knowledgeList, page, size) })
  }),
  // 추천
  http.post('/api/sys13/knowledge/:id/recommend', ({ params }) => {
    const item = knowledgeList.find(k => k.id === params.id)
    if (item) item.recommendCount += 1
    return HttpResponse.json({ success: true })
  }),
  // 관리자 승인/반려
  http.patch('/api/sys13/knowledge/:id/status', async ({ params, request }) => {
    const { status } = await request.json() as { status: 'approved' | 'rejected' }
    const item = knowledgeList.find(k => k.id === params.id)
    if (item) item.status = status
    return HttpResponse.json({ success: true })
  }),
  // 통계 (집계 데이터)
  http.get('/api/sys13/stats', () => {
    const byCategory = CATEGORIES.map(cat => ({
      category: cat,
      count: knowledgeList.filter(k => k.category === cat && k.status === 'approved').length,
    }))
    return HttpResponse.json({ success: true, data: { byCategory } })
  }),
]
```

### 테스트 패턴 (readFileSync 기반)

```typescript
// navy-admin/src/__tests__/sys13/knowledge.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys13-knowledge')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('KnowledgeListPage', () => {
  const content = readFileSync(resolve(BASE, 'KnowledgeListPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => expect(content.length).toBeGreaterThan(0))
  it('DataTable 컴포넌트를 포함한다', () => expect(content).toContain('DataTable'))
  it('추천 기능을 포함한다', () => expect(content).toContain('recommend'))
  it('즐겨찾기 기능을 포함한다', () => expect(content).toContain('Favorite') || expect(content).toContain('favorite'))
})

describe('sys13 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys13.ts'), 'utf-8')

  it('sys13Handlers를 export한다', () => expect(content).toContain('sys13Handlers'))
  it('지식 목록 API를 포함한다', () => expect(content).toContain('/api/sys13/knowledge'))
  it('통계 API를 포함한다', () => expect(content).toContain('/api/sys13/stats'))
})
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | navy-admin/vite.config.ts (test 섹션) |
| Quick run command | `cd navy-admin && npx vitest run src/__tests__/sys13` |
| Full suite command | `cd navy-admin && npx vitest run` |

현재 상태: 24 test files, **250 tests all passing** (2026-04-06 기준)

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KNOW-01 | KnowledgeListPage 파일 + DataTable + 추천/즐겨찾기 포함 | file-content | `npx vitest run src/__tests__/sys13` | ❌ Wave 0 |
| KNOW-02 | MyKnowledgePage 파일 + CrudForm 포함 | file-content | `npx vitest run src/__tests__/sys13` | ❌ Wave 0 |
| KNOW-03 | KnowledgeAdminPage 파일 + 승인/반려 포함 | file-content | `npx vitest run src/__tests__/sys13` | ❌ Wave 0 |
| KNOW-04 | KnowledgeStatsPage 파일 + @ant-design/charts import | file-content | `npx vitest run src/__tests__/sys13` | ❌ Wave 0 |
| INSP-01~04 | InspectionPlanPage, InspectionResultPage 파일 + DataTable | file-content | `npx vitest run src/__tests__/sys17` | ❌ Wave 0 |
| INSP-05 | ApprovalPage 파일 + Steps 컴포넌트 포함 | file-content | `npx vitest run src/__tests__/sys17` | ❌ Wave 0 |
| MREG-01~04 | sys06 index.tsx가 sys05 컴포넌트 import | file-content | `npx vitest run src/__tests__/sys06` | ❌ Wave 0 |
| SURV-02 | SurveyQuestionEditor 파일 + Form.List + dnd-kit | file-content | `npx vitest run src/__tests__/sys02` | ❌ Wave 0 |
| DRCT-01 | DirectivePage 파일 + Progress + Timeline | file-content | `npx vitest run src/__tests__/sys12` | ❌ Wave 0 |
| HONOR-01~03 | DeceasedPage, InjuredPage, ReviewPage 파일 + DataTable | file-content | `npx vitest run src/__tests__/sys09` | ❌ Wave 0 |
| HONOR-10~16 | ReportPages 파일 + window.print + print-area | file-content | `npx vitest run src/__tests__/sys09` | ❌ Wave 0 |
| MSW 등록 | handlers/index.ts에 sys02~17 핸들러 등록 | file-content | `npx vitest run src/__tests__` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd navy-admin && npx vitest run src/__tests__/sys{N}`
- **Per wave merge:** `cd navy-admin && npx vitest run`
- **Phase gate:** Full suite green (250+ tests) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/sys02/survey.test.ts` — SURV 요구사항 커버
- [ ] `src/__tests__/sys06/regulations.test.ts` — MREG 요구사항 커버
- [ ] `src/__tests__/sys09/memorial.test.ts` — HONOR 요구사항 커버
- [ ] `src/__tests__/sys12/directives.test.ts` — DRCT 요구사항 커버
- [ ] `src/__tests__/sys13/knowledge.test.ts` — KNOW 요구사항 커버
- [ ] `src/__tests__/sys17/inspection.test.ts` — INSP 요구사항 커버
- [ ] npm install: `@ant-design/charts@2.6.7` `@dnd-kit/core@6.3.1` `@dnd-kit/sortable@10.0.0`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | (npm 사용 중) | — |
| @ant-design/charts | D-08 통계 차트 | ✗ | — | Wave 0 install 필요 |
| @dnd-kit/core | D-04 설문 편집기 | ✗ | — | Wave 0 install 필요 |
| @dnd-kit/sortable | D-04 설문 편집기 | ✗ | — | Wave 0 install 필요 |
| vitest | 테스트 실행 | ✓ | 4.1.2 | — |

**Missing dependencies with no fallback:**

- `@ant-design/charts`: D-08(통계 차트) 결정을 지키려면 반드시 install. `npm install @ant-design/charts@2.6.7`
- `@dnd-kit/core` + `@dnd-kit/sortable`: D-04(설문 문항 편집기) 결정을 지키려면 반드시 install. `npm install @dnd-kit/core@6.3.1 @dnd-kit/sortable@10.0.0`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit/core + @dnd-kit/sortable | React 18 출시 이후 | rbd는 Strict Mode에서 동작 불안정, dnd-kit이 사실상 표준 |
| @ant-design/charts v1 | @ant-design/charts v2 (AntV G2 v5 기반) | 2023년 | API 변경: `config` prop 직접 사용 → named chart component + props 방식 |

**Deprecated/outdated:**

- `react-beautiful-dnd`: React 18 Strict Mode 미지원, 유지보수 종료. dnd-kit 사용
- `@ant-design/charts v1.x`: G2Plot 기반. v2는 G2 v5 기반으로 API 변경됨. v2.6.7 사용

---

## Open Questions

1. **sys06 MSW 핸들러 전략**
   - What we know: sys05 핸들러(`/api/sys05/regulations`)와 sys06 핸들러(`/api/sys06/regulations`)가 URL만 다르고 데이터 구조 동일
   - What's unclear: sys05 핸들러 파일을 그대로 복사해야 하는지, URL 파라미터로 sysCode를 처리하는 단일 핸들러를 만드는 것이 나은지
   - Recommendation: 단순성 우선. `/api/sys06/regulations` 별도 핸들러로 sys05 핸들러와 동일 로직 복사. Phase 4 목표는 단일 핸들러 패턴 확립이 아님

2. **영현보훈 현황 페이지 컴포넌트 분리 수준**
   - What we know: HONOR-04~09는 유사한 패턴(DataTable + 저장 + 선택적 차트). 13개 경로
   - What's unclear: 하나의 `StatusPage.tsx`에 `type` prop으로 통합할지, 개별 파일로 분리할지
   - Recommendation: 13개를 2~3개 컴포넌트로 통합. `type: 'unit' | 'rank' | 'year' | 'month' | 'all'` prop 활용. 파일 수 최소화가 Phase 4 목표에 부합

---

## Sources

### Primary (HIGH confidence)

- 기존 코드 직접 검사 (navy-admin/src/): DataTable, CrudForm, sys05, sys14 페이지 구조 확인
- navy-admin/package.json: 설치된 의존성 버전 전수 확인
- navy-admin/src/entities/subsystem/menus.ts: sys02/06/09/12/13/17 메뉴 구조 확인
- npm registry: @ant-design/charts@2.6.7, @dnd-kit/core@6.3.1, @dnd-kit/sortable@10.0.0 버전 확인

### Secondary (MEDIUM confidence)

- @ant-design/charts peerDeps 확인: React>=16.8.4 (React 18 충족)
- @dnd-kit/core peerDeps: react>=16.8.0, @dnd-kit/sortable peerDeps: @dnd-kit/core>=6.3.0 (버전 호환 확인)
- vitest run 결과: 250 tests passing 확인 (2026-04-06 09:02)

### Tertiary (LOW confidence)

- react-beautiful-dnd의 React 18 Strict Mode 비호환: 커뮤니티 이슈 기반, 공식 마이그레이션 가이드 없음. dnd-kit 사용 권장은 커뮤니티 합의 수준

---

## Metadata

**Confidence breakdown:**

- Standard Stack: HIGH — package.json에서 버전 직접 확인. 신규 패키지(charts, dnd-kit) npm registry 버전 확인
- Architecture: HIGH — Phase 3 패턴이 실제 코드로 존재하며 동일 적용. menus.ts로 라우트 구조 확인
- Pitfalls: MEDIUM — dnd-kit Form.List 인덱스 이슈는 코드 패턴 분석 기반. 결재 컨텍스트 누락은 Phase 1 코드 구조 확인 기반

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (antd, dnd-kit은 안정적. charts v2는 7일 내 마이너 업데이트 가능하나 API 변경 없음)
