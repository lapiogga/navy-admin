---
phase: 04-a-6
verified: 2026-04-06T10:30:00Z
status: gaps_found
score: 5/7 truths verified
re_verification: null
gaps:
  - truth: "KNOW-01~08 지식관리체계 요구사항이 REQUIREMENTS.md에서 미완료([ ])로 표시됨"
    status: partial
    reason: "코드는 구현되어 있으나 REQUIREMENTS.md의 KNOW-01~08 체크박스가 [ ]로 미완료 상태"
    artifacts:
      - path: "C:/Users/User/2nd_biz/.planning/REQUIREMENTS.md"
        issue: "KNOW-01~08 항목이 [ ] 미완료 상태 (INSP/MREG/DRCT/HONOR는 [x] 완료)"
    missing:
      - "REQUIREMENTS.md에서 KNOW-01~08을 [x]로 업데이트"
  - truth: "SURV-01~07 설문종합관리체계 요구사항이 REQUIREMENTS.md에서 미완료([ ])로 표시됨"
    status: partial
    reason: "코드는 구현되어 있으나 REQUIREMENTS.md의 SURV-01~07 체크박스가 [ ]로 미완료 상태"
    artifacts:
      - path: "C:/Users/User/2nd_biz/.planning/REQUIREMENTS.md"
        issue: "SURV-01~07 항목이 [ ] 미완료 상태"
    missing:
      - "REQUIREMENTS.md에서 SURV-01~07을 [x]로 업데이트"
human_verification:
  - test: "SYS02 설문 문항 편집기 dnd-kit 드래그 동작 확인"
    expected: "문항 카드를 드래그하여 순서 변경 시 목록이 실시간 재정렬됨"
    why_human: "브라우저 드래그 인터랙션은 자동화 검증 불가"
  - test: "SYS17 결재 플로우 단계 표시 확인"
    expected: "결재 대기 탭에서 승인/반려 버튼 클릭 시 Steps 컴포넌트가 다음 단계로 진행"
    why_human: "다단계 결재 UI 상태 전이는 시각적 확인 필요"
  - test: "SYS09 보고서 인쇄 확인"
    expected: "보고서 페이지에서 인쇄 버튼 클릭 시 A4 레이아웃으로 프린트 미리보기 표시"
    why_human: "print.css 적용 결과는 브라우저에서만 확인 가능"
---

# Phase 4: 중복잡도 서브시스템 A 검증 보고서

**Phase Goal:** 6개 중복잡도 서브시스템 A(176개 프로세스)가 결재 워크플로우, 통계 차트, 설문 문항 등 복합 패턴을 포함하여 완전 동작한다

**Verified:** 2026-04-06T10:30:00Z
**Status:** gaps_found
**Re-verification:** No — 초기 검증

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 6개 서브시스템 페이지가 router.tsx에 wired되어 lazy import + 라우트 매핑이 존재 | VERIFIED | router.tsx:12,16,19,22,23,27 + 65,69,72,75,76,80 라인 확인 |
| 2 | MSW 핸들러 6개(sys02/06/09/12/13/17)가 handlers/index.ts에 등록됨 | VERIFIED | handlers/index.ts:5,8,9,11,12,15 import + 17라인 spread 확인 |
| 3 | 통계 차트(@ant-design/charts)가 실제 컴포넌트에서 import+렌더링 됨 | VERIFIED | KnowledgeStatsPage: Pie/Bar, DirectiveAdminPage: Bar, StatsUnitPage: Bar 확인 |
| 4 | SYS17 결재 워크플로우(approve/reject/Steps)가 구현됨 | VERIFIED | InspectionApprovalPage.tsx:34~58 결재 단계+상태+useMutation 확인 |
| 5 | SYS02 설문 문항 편집기에 dnd-kit이 import+사용됨 | VERIFIED | SurveyQuestionEditor.tsx:21~28 @dnd-kit/core, @dnd-kit/sortable import 확인 |
| 6 | KNOW-01~08 / SURV-01~07이 REQUIREMENTS.md에서 완료 처리됨 | FAILED | REQUIREMENTS.md에서 KNOW-01~08, SURV-01~07 모두 `[ ]` 미완료 상태 |
| 7 | SYS09 보고서/확인서에 print.css + window.print() 와이어링 존재 | VERIFIED | PrintableReport.tsx:4 print.css import, :15 window.print() 확인 |

**Score:** 5/7 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/sys13-knowledge/KnowledgeListPage.tsx` | 지식열람 목록+검색 (KNOW-01) | VERIFIED | 203줄, DataTable+useQueryClient 사용 |
| `src/pages/sys13-knowledge/MyKnowledgePage.tsx` | 나의 지식 CRUD (KNOW-02) | VERIFIED | 267줄, useQuery+useMutation 확인 |
| `src/pages/sys13-knowledge/KnowledgeAdminPage.tsx` | 관리자 승인/반려 (KNOW-03) | VERIFIED | 235줄, StatusBadge+반려사유 Modal 포함 |
| `src/pages/sys13-knowledge/KnowledgeStatsPage.tsx` | 지식통계 차트 (KNOW-04) | VERIFIED | 288줄, Pie+Bar @ant-design/charts 사용 |
| `src/pages/sys17-inspection/InspectionApprovalPage.tsx` | 결재 워크플로우 (INSP-05) | VERIFIED | 363줄, approve/reject useMutation 포함 |
| `src/pages/sys17-inspection/InspectionProgressPage.tsx` | 추진현황 통계 (INSP-03/04) | VERIFIED | 262줄, Card+Statistic+Progress 사용 |
| `src/pages/sys17-inspection/InspectionResultDataPage.tsx` | 검열결과 정보 읽기전용 (INSP-12) | VERIFIED | 152줄 존재 |
| `src/pages/sys06-regulations/index.tsx` | 전체 라우트 매핑 (MREG-01~08) | VERIFIED | 109줄, sys05 재사용+Phase1 공통게시판+권한관리 wired |
| `src/pages/sys02-survey/SurveyQuestionEditor.tsx` | 설문 문항 편집기 dnd-kit (SURV-02) | VERIFIED | 404줄, @dnd-kit/core+sortable+utilities import |
| `src/pages/sys02-survey/SurveyAdminPage.tsx` | 체계관리 13개 프로세스 (SURV-04) | VERIFIED | 647줄 (가장 큰 파일) |
| `src/pages/sys12-directives/DirectiveListPage.tsx` | 지시사항 CRUD+Timeline (DRCT-01) | VERIFIED | 447줄 |
| `src/pages/sys12-directives/DirectiveProgressPage.tsx` | 추진현황 Card+Statistic (DRCT-01) | VERIFIED | 175줄, Row/Col/Card/Statistic/Progress import |
| `src/pages/sys09-memorial/DeceasedPage.tsx` | 사망자 CRUD (HONOR-01) | VERIFIED | 302줄, DataTable+SearchForm |
| `src/pages/sys09-memorial/PrintableReport.tsx` | 인쇄 래퍼 (HONOR-10~16) | VERIFIED | 31줄, print.css import + window.print() |
| `src/pages/sys09-memorial/print.css` | Print CSS A4 레이아웃 | VERIFIED | 파일 존재 확인 |
| `src/shared/api/mocks/handlers/sys02.ts` | MSW SYS02 핸들러 | VERIFIED | sys02Handlers export, http.get/post/put/delete 다수 |
| `src/shared/api/mocks/handlers/sys06.ts` | MSW SYS06 핸들러 | VERIFIED | 파일 존재 + handlers/index.ts에 wired |
| `src/shared/api/mocks/handlers/sys09.ts` | MSW SYS09 핸들러 | VERIFIED | 파일 존재 + handlers/index.ts에 wired |
| `src/shared/api/mocks/handlers/sys12.ts` | MSW SYS12 핸들러 | VERIFIED | 파일 존재 + handlers/index.ts에 wired |
| `src/shared/api/mocks/handlers/sys13.ts` | MSW SYS13 핸들러 | VERIFIED | sys13Handlers export, http.get/post/put/delete 다수 |
| `src/shared/api/mocks/handlers/sys17.ts` | MSW SYS17 핸들러 | VERIFIED | 파일 존재 + handlers/index.ts에 wired |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| router.tsx | sys02/06/09/12/13/17 pages | lazy import + Route path | WIRED | 6개 모두 router.tsx에 lazy import + 라우트 매핑 확인 |
| handlers/index.ts | sys02/06/09/12/13/17 handlers | spread import | WIRED | 모든 6개 핸들러가 handlers 배열에 spread됨 |
| KnowledgeStatsPage.tsx | @ant-design/charts | Pie, Bar import | WIRED | line 6: `import { Pie, Bar } from '@ant-design/charts'` |
| DirectiveAdminPage.tsx | @ant-design/charts | Bar import | WIRED | line 4: `import { Bar } from '@ant-design/charts'` |
| StatsUnitPage.tsx | @ant-design/charts | Bar import | WIRED | line 4: `import { Bar } from '@ant-design/charts'` |
| SurveyQuestionEditor.tsx | @dnd-kit/core+sortable | DndContext, SortableContext | WIRED | line 21~28 import 확인 |
| sys06-regulations/index.tsx | sys05-admin-rules pages | direct import + Route | WIRED | MREG-01~04 sys05 재사용 확인 |
| sys06-regulations/index.tsx | common/board + auth-group | lazy import + Route | WIRED | MREG-05~08 Phase1 재사용 확인 |
| sys09-memorial/index.tsx | common/board | lazy import | WIRED | line 22: BoardIndex lazy import, HONOR-17 |
| PrintableReport.tsx | print.css | CSS import | WIRED | line 4: `import './print.css'` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| KnowledgeListPage.tsx | knowledge 목록 | `/api/sys13/knowledge` MSW handler | MSW에서 목 데이터 배열 반환 | FLOWING |
| MySurveyPage.tsx | surveys | `/api/sys02/surveys` MSW handler | useQuery + MSW http.get 확인 | FLOWING |
| InspectionApprovalPage.tsx | tasks/approvalStatus | `/api/sys17` MSW handler | useMutation으로 상태 업데이트 | FLOWING |
| KnowledgeStatsPage.tsx | Pie/Bar 차트 | `/api/sys13/stats` MSW handler | @ant-design/charts에 data prop | FLOWING |
| DirectiveProgressPage.tsx | Statistic values | useQuery → `/api/sys12` | Card+Statistic에 ?? 0 fallback | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: 모든 574개 테스트 PASSED (사용자 제공 정보) — 추가 런타임 spot-check 불필요.

| Behavior | Result | Status |
|----------|--------|--------|
| 전체 테스트 통과 (574/574) | 사용자 확인 | PASS |
| TypeScript 타입 에러 0건 | 사용자 확인 | PASS |

---

### Requirements Coverage

| Requirement | Plan | Description | Status | Evidence |
|-------------|------|-------------|--------|----------|
| KNOW-01 | 04-01 | 지식열람 목록/상세/검색/추천/즐겨찾기 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | KnowledgeListPage.tsx+KnowledgeDetailPage.tsx 구현 확인 |
| KNOW-02 | 04-01 | 나의 지식 관리 CRUD | SATISFIED (코드) / REQUIREMENTS.md 미완료 | MyKnowledgePage.tsx 267줄 |
| KNOW-03 | 04-01 | 지식 관리 승인/반려 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | KnowledgeAdminPage.tsx 235줄 |
| KNOW-04 | 04-01 | 지식통계 차트 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | KnowledgeStatsPage.tsx Pie+Bar |
| KNOW-05 | 04-01 | 게시판 공지사항/질의응답 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | index.tsx Phase1 공통게시판 재사용 |
| KNOW-06 | 04-01 | 권한관리 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | index.tsx auth-group 재사용 |
| KNOW-07 | 04-01 | 메뉴관리 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | index.tsx Phase1 재사용 |
| KNOW-08 | 04-01 | 코드관리 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | index.tsx Phase1 재사용 |
| INSP-01 | 04-02 | 검열계획 등록/수정/삭제 | SATISFIED | InspectionPlanPage.tsx 303줄 |
| INSP-02 | 04-02 | 검열부대 지정 | SATISFIED | InspectionUnitPage.tsx 142줄 |
| INSP-03 | 04-02 | 검열결과 목록/통계/차트 | SATISFIED | InspectionResultPage.tsx 577줄 |
| INSP-04 | 04-02 | 추진현황 조회/저장 | SATISFIED | InspectionProgressPage.tsx 262줄 |
| INSP-05 | 04-02 | 결재 워크플로우 | SATISFIED | InspectionApprovalPage.tsx 363줄 |
| INSP-06 | 04-02 | 공지사항 | SATISFIED | index.tsx Phase1 재사용 |
| INSP-07 | 04-02 | 공통코드관리 | SATISFIED | index.tsx Phase1 재사용 |
| INSP-08 | 04-02 | 부대관리 | SATISFIED | InspectionUnitMgmtPage.tsx 250줄 |
| INSP-09 | 04-02 | 사용자별권한등록 | SATISFIED | index.tsx Phase1 재사용 |
| INSP-10 | 04-02 | 접속로그 | SATISFIED | index.tsx Phase1 재사용 |
| INSP-11 | 04-02 | 검열계획 정보 데이터 | SATISFIED | InspectionPlanDataPage.tsx 117줄 |
| INSP-12 | 04-02 | 검열결과 정보 데이터 | SATISFIED | InspectionResultDataPage.tsx 152줄 |
| MREG-01 | 04-03 | 현행규정 목록/상세/검색 | SATISFIED | sys05 PrecedentHQ 재사용 |
| MREG-02 | 04-03 | 예규 해병대사령부 | SATISFIED | sys05 재사용 |
| MREG-03 | 04-03 | 예규 예하부대 | SATISFIED | sys05 PrecedentUnitPage 재사용 |
| MREG-04 | 04-03 | 지시문서 | SATISFIED | sys05 DirectiveListPage 재사용 |
| MREG-05 | 04-03 | 공지사항 게시판 | SATISFIED | Phase1 BoardIndex sysCode=sys06 boardType=notice |
| MREG-06 | 04-03 | 규정예고 | SATISFIED | Phase1 BoardIndex sysCode=sys06 boardType=regulation-notice |
| MREG-07 | 04-03 | 자료실 | SATISFIED | Phase1 BoardIndex sysCode=sys06 boardType=archive |
| MREG-08 | 04-03 | 권한관리 | SATISFIED | Phase1 AuthGroupIndex sysCode=sys06 |
| SURV-01 | 04-04 | 설문참여 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | SurveyParticipationPage.tsx 78줄 |
| SURV-02 | 04-04 | 나의 설문관리+문항편집 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | SurveyQuestionEditor.tsx 404줄 + dnd-kit |
| SURV-03 | 04-04 | 지난 설문보기 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | PastSurveyPage.tsx 122줄 |
| SURV-04 | 04-04 | 체계관리 13개 프로세스 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | SurveyAdminPage.tsx 647줄 |
| SURV-05 | 04-04 | 게시판 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | index.tsx Phase1 재사용 |
| SURV-06 | 04-04 | 공통코드관리 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | index.tsx Phase1 재사용 |
| SURV-07 | 04-04 | 권한관리 | SATISFIED (코드) / REQUIREMENTS.md 미완료 | index.tsx Phase1 재사용 |
| DRCT-01 | 04-05 | 지휘관 지시사항 CRUD+통계 | SATISFIED | DirectiveListPage.tsx 447줄 + DirectiveProgressPage.tsx |
| DRCT-02 | 04-05 | 대통령 지시사항 | SATISFIED | Phase1 공통게시판 읽기전용 |
| DRCT-03 | 04-05 | 국방부장관 지시사항 | SATISFIED | Phase1 공통게시판 읽기전용 |
| DRCT-04 | 04-05 | 지휘관 건의사항 | SATISFIED | ProposalListPage.tsx 446줄 + ProposalProgressPage.tsx |
| DRCT-05 | 04-05 | 관리자 | SATISFIED | DirectiveAdminPage.tsx 323줄 |
| DRCT-06 | 04-05 | 공지사항 | SATISFIED | index.tsx Phase1 재사용 |
| DRCT-07 | 04-05 | 질의응답 | SATISFIED | index.tsx Phase1 재사용 |
| HONOR-01 | 04-06 | 사망자 CRUD | SATISFIED | DeceasedPage.tsx 302줄 |
| HONOR-02 | 04-06 | 상이자 CRUD | SATISFIED | InjuredPage.tsx 299줄 |
| HONOR-03 | 04-06 | 전공사상심사 CRUD | SATISFIED | ReviewPage.tsx 300줄 |
| HONOR-04 | 04-06 | 부대별 사망자 현황 | SATISFIED | StatsUnitPage.tsx 80줄 |
| HONOR-05 | 04-06 | 부대별 사망자 명부 | SATISFIED | StatsUnitListPage.tsx 57줄 |
| HONOR-06 | 04-06 | 신분별 사망자 현황 | SATISFIED | StatsTypePage.tsx 66줄 |
| HONOR-07 | 04-06 | 연도별 사망자 현황 | SATISFIED | StatsYearPage.tsx 65줄 |
| HONOR-08 | 04-06 | 월별 사망자 현황 | SATISFIED | StatsMonthPage.tsx 88줄 |
| HONOR-09 | 04-06 | 전사망자 명부 | SATISFIED | StatsAllListPage.tsx 58줄 |
| HONOR-10 | 04-06 | 사망자 현황 보고서 | SATISFIED | ReportDeceasedPage.tsx 79줄 |
| HONOR-11 | 04-06 | 상이자 현황 보고서 | SATISFIED | ReportInjuredPage.tsx 71줄 |
| HONOR-12 | 04-06 | 순직/사망확인서 | SATISFIED | CertDeathPage.tsx 78줄 |
| HONOR-13 | 04-06 | 국가유공자 요건 확인서 - 사망자 | SATISFIED | CertMeritDeathPage.tsx 91줄 |
| HONOR-14 | 04-06 | 국가유공자 요건 확인서 - 상이자 | SATISFIED | CertMeritInjuredPage.tsx 90줄 |
| HONOR-15 | 04-06 | 전공사상심사결과 | SATISFIED | CertReviewResultPage.tsx 93줄 |
| HONOR-16 | 04-06 | 전사망자 확인증 발급대장 | SATISFIED | CertIssueLedgerPage.tsx 65줄 |
| HONOR-17 | 04-06 | 게시판 | SATISFIED | sys09/index.tsx: BoardIndex sysCode=sys09 |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| SurveyFormPage.tsx | 150 | `return null` | Info | 조건부 렌더링(문항유형 미매칭), 실제 stub 아님 |
| InspectionApprovalPage.tsx | 140 | `return null` | Info | 조건부 렌더링(task 없을 때), 정상 패턴 |
| `placeholder=` 다수 | 전체 | placeholder 속성 | Info | antd Input/TextArea의 정상 prop, stub 아님 |

blocker 수준 anti-pattern 없음. 모든 `return null`은 조건부 렌더링이며 데이터 fetching 경로와 별개.

---

### Human Verification Required

#### 1. SYS02 설문 문항 편집기 dnd-kit 드래그

**Test:** SYS02 > 나의 설문관리 > 설문 생성 후 문항 편집기 열어서 문항 카드 드래그
**Expected:** 문항 순서가 드래그로 변경되고 저장 시 순서 반영
**Why human:** dnd-kit 드래그 인터랙션은 자동화 테스트로 검증 어려움

#### 2. SYS17 결재 워크플로우 Steps 진행

**Test:** SYS17 > 결재관리 > 결재대기 항목 선택 > 승인 버튼 클릭
**Expected:** Steps 컴포넌트가 다음 단계로 이동하고, 결재완료 탭으로 이동 시 항목이 이동됨
**Why human:** 다단계 결재 Steps 시각적 전이는 브라우저 확인 필요

#### 3. SYS09 보고서 A4 인쇄

**Test:** SYS09 > 사망자 현황 보고서 > 인쇄 버튼 클릭
**Expected:** 브라우저 인쇄 다이얼로그에서 A4 레이아웃, 사이드바/헤더 숨김 확인
**Why human:** print.css @media print 적용 결과는 브라우저에서만 확인 가능

---

### Gaps Summary

**코드 구현은 완성됨.** 57개 요구사항(KNOW-01~08, INSP-01~12, MREG-01~08, SURV-01~07, DRCT-01~07, HONOR-01~17) 전체에 대한 페이지/컴포넌트/MSW 핸들러/테스트가 존재하고, 라우터와 MSW 인덱스에 모두 wired되어 있음. 574/574 테스트 통과, TypeScript 에러 0건.

**유일한 갭:** REQUIREMENTS.md에서 KNOW-01~08, SURV-01~07 (총 15개 항목)이 `[ ]` 미완료 상태로 남아있음. 다른 4개 서브시스템(INSP/MREG/DRCT/HONOR)은 `[x]`로 올바르게 완료 처리되어 있으나 이 2개 서브시스템만 누락됨.

**조치 필요:** REQUIREMENTS.md에서 해당 15개 항목을 `[x]`로 업데이트하면 phase 목표 달성 완료.

---

## GAP 수정 반영 (2026-04-07)

2026-04-07 req_spec 기반 전체 GAP 분석 후 Phase 4 소속 6개 서브시스템에 6개 규칙을 일괄 적용하였다.

### 적용 규칙

| 규칙 | 내용 | 적용 결과 |
|------|------|----------|
| R1 | 입력값 컬럼 반영 (CSV 입력값 → CrudForm fields) | 각 서브시스템 등록/수정 폼에 누락 필드 추가 |
| R2 | 검색영역 100px SearchForm 추가 | 목록 그리드 상단에 SearchForm 컴포넌트 배치 |
| R3 | 규칙/예외사항 UI 로직 반영 | 조건부 표시, 안내문, 제한조건 구현 |
| R4 | 관리자 메뉴 포함 | 공통기능 관리자 메뉴 서브시스템별 배포 |
| R5 | 테이블 군청색 라인 (DataTable CSS) | navy-bordered-table 클래스 전역 적용 |
| R6 | 신청자 = 군번/계급/성명 (militaryPersonColumn) | formatMilitaryPerson() 헬퍼 사용 |

### 서브시스템별 수정 내역

| 서브시스템 | SearchForm | militaryPersonColumn | CrudForm 필드 추가 | 기타 |
|-----------|-----------|---------------------|-------------------|------|
| SYS13 지식관리 | 5개 조건 | 적용 | keywords, attachments | - |
| SYS17 검열결과 | 적용 | 적용 | CSV 11 입력항목 전부 반영 | 공개여부/처분종류 필드 |
| SYS06 해병대규정 | 적용 | 적용 | 전용 4페이지 신규 생성 | SYS05에서 독립, API 핸들러 신규 |
| SYS02 설문관리 | 적용 | - | 대상필드 4개, 첨부파일 3종 | - |
| SYS12 지시건의 | 적용 | 적용 | directiveType(문서/구두) | - |
| SYS09 영현보훈 | 7개 필드 | - | 추가 필드 다수 | - |

### 검증 상태

- GAP 수정 코드 반영: 완료
- 공통 컴포넌트(DataTable, SearchForm, CrudForm, military.ts) 수정: 완료
- 기존 테스트 regression: 없음

---

_Verified: 2026-04-06T10:30:00Z_
_Verifier: Claude (gsd-verifier)_
