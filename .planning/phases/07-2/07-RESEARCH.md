# Phase 7: 최고복잡도 서브시스템 2개 - Research

**Researched:** 2026-04-06
**Domain:** React + Ant Design 5 기반 성과관리(SYS03, 76개) + 보안일일결산(SYS15, 138개) 서브시스템 구현
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**과제 계층 관리 (성과관리)**
- D-01: 지휘방침→추진중점과제→중과제는 기준정보관리>과제관리 내 계단식 Master-Detail로 구현. Tree 대신 Select 필터링
- D-02: 소과제→상세과제는 연간과제관리>과제등록에서 부서별 필터 Select + DataTable
- D-03: 중과제 일괄등록/저장: Upload.Dragger 엑셀 업로드 (Phase 6 Upload 패턴)
- D-04: 소과제 일괄등록/저장: 동일 패턴

**KPI 차트 시각화 (성과관리)**
- D-05: 메인화면 3종 차트: Gauge(달성률) + Bar(지휘방침별) + Bar(부/실/단별). @ant-design/charts 사용
- D-06: 추진진도율: Grouped Bar 차트. 행 클릭 시 하위 DataTable
- D-07: 평가결과: Bar 차트. 입력현황: Stacked Bar + antd Progress
- D-08: 연간/월간 탭 전환은 Radio.Group

**업무실적 입력/승인/평가 (성과관리)**
- D-09: 업무실적 입력: DataTable → 상세과제별 실적 입력 Modal(ProForm). 임시저장/상신 버튼 분리
- D-10: 과제실적 승인: Steps 결재 패턴 재사용
- D-11: 과제실적 평가: 평가대기 DataTable → 등급 Select 입력
- D-12: 업무실적(개인) 평가: 동일 패턴

**보안점검 체크리스트 UI (보안일일결산)**
- D-13: 개인보안일일결산: Checkbox.Group, 미체크 시 사유 TextArea 조건부 표시
- D-14: 사무실보안일일결산: 동일 패턴 + 미실시자/부재자 사유 필수
- D-15: 일일보안점검관 당직표: Calendar 월별 배정 + Steps 결재
- D-16: 결산 내역 조회: DataTable + 상세 Modal

**비밀/매체관리 CRUD 구조 (보안일일결산)**
- D-17: type prop ('secret'|'media'|'equipment') 공통 SecretMediaPage 컴포넌트
- D-18: 목록조회+등록/수정 Modal+삭제(사유필수)+이력+일괄등록+엑셀저장+관리대장 출력
- D-19: 비밀 등록 시 예고문 Modal 자동 오픈
- D-20: 비밀 예고문: UI 팝업 Mock (실 메일 발송은 v2)

**인계/인수 워크플로우**
- D-21: 인계: DataTable 체크박스 선택 → 인수자 Select → 인계등록
- D-22: 인수: 인수대기 DataTable → 인수확인/반송
- D-23: 인계/인수 내역: Steps 결재 패턴

**점검항목관리**
- D-24: Tabs 5개 (개인필수/사무실필수/개인선택/사무실선택/보안수준평가) 각 탭 DataTable+CrudForm
- D-25: 선택점검항목에 부대(서) Select 필터
- D-26: 관련규정: TextArea 기반 규정 편집기

**예외처리 관리**
- D-27: 체계기준 조직도: antd Tree + DataTable Master-Detail (Phase 6 SYS08 패턴)
- D-28: 1인사무실: 동일 Tree+DataTable
- D-29: 예외처리: Tree+DataTable+CrudForm

**보안결산 캘린더 메인화면**
- D-30: Tabs 2개 (개인/사무실). antd Calendar + cellRender Badge
- D-31: Badge 색상: 완료(green)/미실시(red)/부재(gray)/미래(none)
- D-32: Phase 6 SYS01 Calendar cellRender 패턴 직접 재사용

**개인보안수준평가**
- D-33: 수시평가: 대상자 DataTable → 평가 Modal
- D-34: 정기평가: 5개 항목 InputNumber + 가점/감점, 총점 자동계산
- D-35: 정기평가 삭제: 관련근거 첨부파일 필수, 체계관리자 전용
- D-36: 통계: Bar(부대별) + Pie(등급분포) + Line(기간별추이). @ant-design/charts

**휴무일/알림시간 관리**
- D-37: 공통 공휴일: DataTable + CrudForm. 구분 Select + DatePicker.RangePicker
- D-38: 부대(서) 휴무일: + 적용 부대(서) Select
- D-39: 알림시간: TimePicker.RangePicker
- D-40: 최상위 설정 삭제 불가

**로그이력/보안교육**
- D-41: 로그이력: SearchForm + DataTable. 종합이력 별도 탭
- D-42: 보안교육 실시현황: DataTable + CrudForm Modal
- D-43: 삭제 체계관리자 전용

**게시판/시스템 (공통)**
- D-44: SYS03 게시판 3종 lazy import (sysCode=sys03)
- D-45: SYS15 게시판 2종 lazy import (sysCode=sys15)
- D-46: SYS15 공통코드/권한관리 Phase 1 lazy import
- D-47: SYS03 관리자 대메뉴: 기준정보관리가 관리자 역할 포함
- D-48: SYS15 관리자 대메뉴: 관리자5 + 시스템2

**서브시스템 분할 전략**
- D-49: 6 plans, 3 waves 구조:
  - Plan 1 (W1): SYS03 기준정보관리 + 메인화면 + 과제검색
  - Plan 2 (W1): SYS15 비밀/매체관리 5종 + 인계/인수
  - Plan 3 (W2, dep:P1): SYS03 연간과제관리 6종
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

### Deferred Ideas (OUT OF SCOPE)
없음 — 논의가 Phase 범위 내에서만 진행됨
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PERF-01 | 메인화면 (과제현황, 실적현황, 알림) [3] | D-05: Gauge+Bar+Bar 차트 패턴, @ant-design/charts Column 검증 완료(Phase 6) |
| PERF-02 | 과제등록 (목록조회, 신규등록, 수정, 삭제, 상세조회, 하위과제, 지표설정, 목표값, 담당자, 저장) [10] | D-01~D-04: 계단식 Master-Detail, Upload.Dragger 엑셀 업로드 패턴 확립 |
| PERF-03 | 업무실적 입력 (목록조회, 실적입력, 수정, 첨부파일, 제출, 임시저장, 저장) [7] | D-09: DataTable → Modal(ProForm) + 임시저장/상신 분리 패턴 |
| PERF-04 | 과제실적 승인 (대기목록, 승인, 반려, 상세조회) [4] | D-10: Phase 4~6 Steps 결재 패턴 (OtApprovalPage.tsx 실증) |
| PERF-05 | 과제실적 평가 (평가대상, 평가입력, 저장) [3] | D-11: 등급 Select 입력 패턴 |
| PERF-06 | 업무실적(개인) 평가 (대상조회, 평가입력, 저장) [3] | D-12: PERF-05와 동일 패턴 |
| PERF-07 | 추진진도율 (과제별, 부대별, 기간별, 차트, 저장, 인쇄) [6] | D-06: Grouped Bar + 드릴다운 DataTable + PrintableReport |
| PERF-08 | 입력현황 (부대별, 기간별, 저장) [3] | D-07: Stacked Bar + antd Progress |
| PERF-09 | 평가결과 (과제별, 부대별, 저장) [3] | D-07: Bar 차트 |
| PERF-10 | 과제검색 [1] | DataTable + SearchForm 기본 패턴 |
| PERF-11 | 과제관리 (기준정보: 과제분류, 평가기준, 가중치, 기간설정 등) [14] | D-01~D-04: 계단식 DataTable CRUD |
| PERF-12 | 업무실적(개인) 기준정보 (평가항목, 평가기준, 가중치, 저장) [4] | DataTable + CrudForm 패턴 |
| PERF-13 | 평가조직 관리 (조직설정, 평가자지정, 피평가자, 평가기간 등) [8] | DataTable + CrudForm, Phase 1 Transfer 패턴 참조 |
| PERF-14 | 시스템관리 (사용자, 부대, 권한, 저장) [4] | DataTable + CrudForm |
| PERF-15 | 공지사항 [1] | D-44: Phase 1 공통게시판 lazy import (sysCode=sys03) |
| PERF-16 | 자료실 [1] | D-44: Phase 1 공통게시판 lazy import (sysCode=sys03) |
| PERF-17 | 질의응답 [1] | D-44: Phase 1 공통게시판 lazy import (sysCode=sys03) |
| SEC-01 | 메인화면 (결산현황, 미결산알림) [2] | D-30~D-32: antd Calendar + cellRender Badge (Phase 6 SYS01 패턴 재사용) |
| SEC-02 | 개인보안일일결산 (점검항목체크, 저장, 제출, 이력) [4] | D-13: Checkbox.Group + 조건부 TextArea |
| SEC-03 | 사무실보안일일결산 (점검항목체크, 저장, 제출, 이력) [4] | D-14: 동일 패턴 + 미실시자 사유 필수 |
| SEC-04 | 일일보안점검관 (점검대상, 점검결과입력, 저장, 제출, 이력) [5] | D-15: Calendar 당직표 + Steps 결재 |
| SEC-05 | 부재처리 (부재신청, 수정, 삭제, 이력) [4] | DataTable + CrudForm, DatePicker.RangePicker |
| SEC-06 | 보안교육 (교육등록, 수정, 삭제, 이수현황, 저장) [5] | D-42~D-43: DataTable + CrudForm, 관리자 전용 삭제 |
| SEC-07 | 개인보안수준평가 (평가항목, 자가평가, 저장, 이력, 통계, 차트) [9] | D-33~D-36: InputNumber 5개 + @ant-design/charts Bar/Pie/Line |
| SEC-08 | 결재대기 (목록조회, 승인, 반려, 상세조회) [4] | Steps 결재 패턴 |
| SEC-09 | 결재완료 [1] | DataTable 조회 전용 |
| SEC-10 | 개인보안일일결산 종합현황 [2] | DataTable + SearchForm |
| SEC-11 | 사무실보안일일결산 종합현황 [2] | DataTable + SearchForm |
| SEC-12 | 부재처리 종합현황 [3] | DataTable + SearchForm + 엑셀 Mock |
| SEC-13 | 비밀/매체관리 종합현황 [2] | DataTable + SearchForm |
| SEC-14 | 비밀 관리 [8] | D-17~D-19: SecretMediaPage(type='secret') + 예고문 Modal 자동 오픈 |
| SEC-15 | 저장매체 관리 [8] | D-17: SecretMediaPage(type='media') |
| SEC-16 | 보안자재/암호장비 관리 [8] | D-17: SecretMediaPage(type='equipment') |
| SEC-17 | 비밀 예고문 관리 [1] | D-20: 팝업 Mock |
| SEC-18 | 비밀/매체 인계/인수 [7] | D-21~D-23: 체크박스 선택 → Steps 결재 |
| SEC-19 | 점검항목관리 [21] | D-24~D-26: Tabs 5개 + TextArea 규정 편집기 |
| SEC-20 | 예외처리 관리 [12] | D-27~D-29: Tree + DataTable Master-Detail 3회 재사용 |
| SEC-21 | 알림시간 관리 [4] | D-39~D-40: TimePicker.RangePicker, 최상위 삭제 비활성 |
| SEC-22 | 휴무일 관리 [10] | D-37~D-38: DataTable + CrudForm + DatePicker.RangePicker |
| SEC-23 | 로그이력 관리 [6] | D-41: SearchForm + DataTable + 종합이력 Tabs |
| SEC-24 | 개인설정 관리 [2] | DataTable + CrudForm (알림설정) |
| SEC-25 | 공지사항 [1] | D-45: Phase 1 공통게시판 lazy import (sysCode=sys15) |
| SEC-26 | 질의응답 [1] | D-45: Phase 1 공통게시판 lazy import (sysCode=sys15) |
| SEC-27 | 공통코드관리 [1] | D-46: Phase 1 코드관리 lazy import |
| SEC-28 | 권한관리 [1] | D-46: Phase 1 권한관리 lazy import |
</phase_requirements>

---

## Summary

Phase 7은 전체 프로젝트의 최종 Phase로, 성과관리체계(76개 프로세스)와 보안일일결산체계(138개 프로세스) 총 214개 프로세스를 구현한다. Phase 0~6에서 확립된 공통 컴포넌트와 패턴(DataTable, CrudForm, SearchForm, Steps 결재, Tree Master-Detail, Calendar cellRender, @ant-design/charts, Upload.Dragger)을 최대한 재사용하여 신규 작성량을 최소화하는 것이 핵심 전략이다.

SYS03 성과관리체계는 5단계 과제 계층(지휘방침→추진중점과제→중과제→소과제→상세과제)을 계단식 Master-Detail로 구현하고, KPI 차트(Gauge/Bar/GroupedBar/StackedBar) 시각화와 업무실적 입력→승인→평가 플로우를 구현해야 한다. SYS15 보안일일결산체계는 비밀/매체 3종 CRUD(공통 컴포넌트로 통합), 체크리스트 기반 일일결산, 캘린더 메인화면, 대규모 관리자 기능(점검항목관리 21개, 예외처리 12개)을 포함한다.

두 서브시스템 모두 3 waves 구조로 분할(Plan 1-2: W1 독립, Plan 3-4: W2 직렬 의존, Plan 5-6: W3 직렬 의존)하여 병렬 실행 가능한 부분을 최대화한다. 현재 테스트 베이스라인은 871개이며 Phase 7 완료 후 증가 예상.

**Primary recommendation:** Phase 6 패턴(Tree Master-Detail, Calendar cellRender, Upload.Dragger, Steps 결재)을 그대로 재사용하고, 신규 패턴은 Checkbox.Group 체크리스트와 SecretMediaPage type prop 분기에 집중하라.

---

## Project Constraints (from CLAUDE.md)

| 규칙 | 내용 |
|------|------|
| 화면 구현 7대 규칙 | 컬럼표시/입력값CRUD/검색조건/출력미리보기/부대(서)/게시판/관리자메뉴 — 전 Phase 소급 |
| Tech Stack | React 18 + TypeScript 5 + Tailwind 3 + Ant Design 5 + Vite 5 |
| 상태 관리 | Zustand 5 + TanStack Query 5 |
| Mock | MSW 2.x + Faker.js 9 |
| 테스트 | vitest 2.x, 80% 커버리지 목표 |
| 관리자 대메뉴 필수 | SYS03: 기준정보관리 포함, SYS15: 관리자5+시스템2 |
| 공통 게시판 | lazy import, Phase 1 BoardPage 재사용 |
| 코드 관리 대장 출력 | PrintableReport + print.css |

---

## Standard Stack

### Core (동결된 스택 — Phase 0 계약)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI 렌더링 | Phase 0 frozen |
| TypeScript | 5.x | 타입 안전성 | Phase 0 frozen |
| Ant Design | 5.x (5.24+) | UI 컴포넌트 | 행정 UI 전용 컴포넌트 다수 내장 |
| @ant-design/pro-components | 2.x | ProTable/ProForm/PageContainer | 서버사이드 페이지네이션/폼 단순화 |
| @ant-design/charts | latest | 차트 시각화 | Column/Bar/Gauge/Pie/Line 통합 |
| TanStack Query | 5.x | 서버 상태 | MSW와 완벽 연동 |
| MSW | 2.x | API Mock | 네트워크 레벨 인터셉션 |
| Faker.js | 9.x | Mock 데이터 | 한국어 로케일 |
| dayjs | 1.x | 날짜 처리 | Ant Design DatePicker 공식 연동 |
| vitest | 2.x | 테스트 | Vite 기반 |

### 재사용 공통 컴포넌트 (Phase 0~6에서 확립)
| 컴포넌트 | 경로 | Phase 7 활용 |
|----------|------|-------------|
| DataTable | @/shared/ui/DataTable | 모든 목록 화면 |
| CrudForm | @/shared/ui/CrudForm | 모든 등록/수정 Modal |
| SearchForm | @/shared/ui/SearchForm | 모든 검색 조건 폼 |
| StatusBadge | @/shared/ui/StatusBadge | 결재 상태 표시 |
| PrintableReport | @/shared/ui/PrintableReport | 관리대장/기록부 출력 |
| apiClient | @/shared/api/client | axios 인스턴스 |
| 공통게시판 | @/pages/common/board | lazy import |
| 코드관리 | @/pages/common/code-management | lazy import |
| 권한관리 | @/pages/common/auth-group | lazy import |

---

## Architecture Patterns

### SYS03 성과관리체계 폴더 구조
```
src/pages/sys03-performance/
├── index.tsx                          # 라우터 (현재 스텁, 전면 교체)
├── PerformanceMainPage.tsx            # 메인화면 (Gauge+Bar+Bar 차트)
├── SysManagementPage.tsx              # 기준정보>시스템관리
├── EvalOrgPage.tsx                    # 기준정보>평가조직관리
├── IndividualPerfBasePage.tsx         # 기준정보>업무실적(개인)
├── TaskManagementPage.tsx             # 기준정보>과제관리 (계단식 Master-Detail)
├── ProgressRatePage.tsx               # 연간>추진진도율
├── TaskRegistrationPage.tsx           # 연간>과제등록
├── WorkRecordInputPage.tsx            # 연간>업무실적 입력
├── TaskApprovalPage.tsx               # 연간>과제실적 승인
├── TaskEvalPage.tsx                   # 연간>과제실적 평가
├── IndividualWorkEvalPage.tsx         # 연간>업무실적(개인) 평가
├── EvalResultPage.tsx                 # 평가결과>평가결과
├── InputStatusPage.tsx                # 평가결과>입력현황
└── TaskSearchPage.tsx                 # 과제검색
```

### SYS15 보안일일결산체계 폴더 구조
```
src/pages/sys15-security/
├── index.tsx                          # 라우터 (현재 스텁, 전면 교체)
├── SecMainPage.tsx                    # 메인화면 (캘린더 2종 Tabs)
├── SecretMediaPage.tsx                # 비밀/매체/보안자재 공통 컴포넌트 (type prop)
├── SecretPage.tsx                     # 비밀관리 (type='secret')
├── MediaPage.tsx                      # 저장매체관리 (type='media')
├── EquipmentPage.tsx                  # 보안자재관리 (type='equipment')
├── NoticeDocPage.tsx                  # 비밀 예고문 관리
├── TransferPage.tsx                   # 인계/인수
├── PersonalSecDailyPage.tsx           # 개인보안일일결산
├── OfficeSecDailyPage.tsx             # 사무실보안일일결산
├── DutyOfficerPage.tsx                # 일일보안점검관
├── SecurityLevelPage.tsx              # 개인보안수준평가
├── AbsencePage.tsx                    # 부재처리
├── SecurityEduPage.tsx                # 보안교육
├── ApprovalPendingPage.tsx            # 결재대기
├── ApprovalCompletedPage.tsx          # 결재완료
├── SummarySecretPage.tsx              # 결산종합현황>비밀/매체
├── SummaryPersonalPage.tsx            # 결산종합현황>개인
├── SummaryOfficePage.tsx              # 결산종합현황>사무실
├── SummaryAbsencePage.tsx             # 결산종합현황>부재처리
├── PersonalSettingPage.tsx            # 개인설정 관리
├── CheckItemMgmtPage.tsx              # 관리자>점검항목관리 (Tabs 5개)
├── HolidayMgmtPage.tsx                # 관리자>휴무일 관리
├── NotifyTimeMgmtPage.tsx             # 관리자>알림시간 관리
├── LogHistoryPage.tsx                 # 관리자>로그이력 관리
└── ExceptionMgmtPage.tsx              # 관리자>예외처리 관리 (Tree 3개)
```

### MSW 핸들러 파일 구조
```
src/shared/api/mocks/handlers/
├── sys03-performance.ts               # SYS03 MSW handlers + 타입 정의
└── sys15-security.ts                  # SYS15 MSW handlers + 타입 정의
```

handlers/index.ts에 `sys03Handlers`, `sys15Handlers` 등록 필수.

### Pattern 1: Steps 결재 패턴 (Phase 4~6에서 확립, Phase 7 재사용)
**What:** 작성→결재대기→승인/반려 3단계 Steps + StatusBadge 조합
**When to use:** 과제실적 승인/평가, 인계/인수 결재, 일일보안점검관 당직표 상신
**참조 파일:** `navy-admin/src/pages/sys01-overtime/OtApprovalPage.tsx`

```typescript
// Source: Phase 4~6 확립 패턴
const steps = [
  { title: '작성', status: currentStep > 0 ? 'finish' : 'process' },
  { title: '결재대기', status: currentStep > 1 ? 'finish' : currentStep === 1 ? 'process' : 'wait' },
  { title: '승인완료', status: currentStep > 2 ? 'finish' : 'wait' },
]
<Steps current={currentStep} items={steps} />
```

### Pattern 2: Tree Master-Detail (Phase 6 SYS08 확립, SYS15 예외처리 재사용)
**What:** antd Tree(좌측 Card) + DataTable(우측), selectedKey를 queryKey에 연동
**When to use:** SEC-20 예외처리 관리 3종 (체계기준 조직도/1인사무실/예외처리)
**참조 파일:** `navy-admin/src/pages/sys08-unit-lineage/UnitLineageTreePage.tsx`

```typescript
// Source: Phase 6 UnitLineageTreePage.tsx
const [selectedUnit, setSelectedUnit] = useState<string | undefined>()
useQuery({
  queryKey: ['sys15', 'exception', selectedUnit],  // selectedUnit 변경 시 자동 재조회
  queryFn: () => fetchExceptions({ unitId: selectedUnit }),
})
<Tree
  treeData={treeData}
  onSelect={(keys) => setSelectedUnit(keys[0] as string)}
/>
```

### Pattern 3: Calendar cellRender + Badge (Phase 6 SYS01 확립, SYS15 메인 재사용)
**What:** antd Calendar cellRender로 일자별 결산 상태 Badge 표시
**When to use:** SEC-01 보안결산 메인화면, SEC-02/03 개인/사무실 결산 내역
**참조 파일:** `navy-admin/src/pages/sys01-overtime/OtWorkHoursPage.tsx`

```typescript
// Source: Phase 6 Calendar 패턴
const cellRender = (current: Dayjs) => {
  const status = dailyStatus[current.format('YYYY-MM-DD')]
  if (!status) return null
  const badgeMap = {
    done: { status: 'success', text: '완료' },
    undone: { status: 'error', text: '미실시' },
    absent: { status: 'default', text: '부재' },
  }
  return <Badge {...badgeMap[status]} />
}
// onPanelChange: 월 네비게이션 / onSelect: 날짜 클릭→상세 Modal 분리
<Calendar
  cellRender={cellRender}
  onPanelChange={(date) => setCurrentMonth(date)}
  onSelect={(date) => openDetailModal(date)}
/>
```

### Pattern 4: @ant-design/charts Column/Bar (Phase 6 SYS01 확립)
**What:** @ant-design/charts Column/Bar 컴포넌트 직접 import
**When to use:** PERF-01 메인화면 차트, PERF-07 추진진도율, PERF-09 평가결과, SEC-07 보안수준평가 통계
**참조 파일:** `navy-admin/src/pages/sys01-overtime/OtMyStatusPage.tsx`

```typescript
// Source: Phase 6 OtMyStatusPage.tsx
import { Column, Bar, Gauge, Pie, Line } from '@ant-design/charts'

// Gauge (나의 부서 달성률)
const gaugeConfig = {
  percent: 0.75,
  range: { color: '#30BF78' },
  indicator: { pointer: { style: { stroke: '#D0D0D0' } } },
  statistic: { title: { content: '달성률' } },
}
<Gauge {...gaugeConfig} />

// Bar (추진진도율 Grouped)
const barConfig = {
  data,
  xField: 'value',
  yField: 'task',
  seriesField: 'type',
  isGroup: true,
  height: 400,
}
<Bar {...barConfig} />
```

### Pattern 5: Checkbox.Group 체크리스트 (신규 패턴)
**What:** Checkbox.Group으로 점검항목 렌더링, 미체크 시 사유 TextArea 조건부 표시
**When to use:** SEC-02 개인보안일일결산, SEC-03 사무실보안일일결산
**참조:** Ant Design 5 공식 패턴

```typescript
// Source: Ant Design 5 Checkbox.Group
const [checkedItems, setCheckedItems] = useState<string[]>([])
const [reasons, setReasons] = useState<Record<string, string>>({})

const checklistItems = [
  { id: 'item1', label: '비밀문서 잠금 확인', required: true },
  { id: 'item2', label: '개인컴퓨터 화면보호기 확인', required: true },
  // ...
]

{checklistItems.map(item => (
  <div key={item.id}>
    <Checkbox
      checked={checkedItems.includes(item.id)}
      onChange={(e) => handleCheck(item.id, e.target.checked)}
    >
      {item.label}
    </Checkbox>
    {/* 미체크 시 사유 입력 조건부 표시 */}
    {!checkedItems.includes(item.id) && (
      <TextArea
        placeholder="미실시 사유를 입력하세요"
        value={reasons[item.id] || ''}
        onChange={(e) => setReasons(prev => ({ ...prev, [item.id]: e.target.value }))}
        required
      />
    )}
  </div>
))}
```

### Pattern 6: SecretMediaPage type prop 분기 (신규 패턴)
**What:** type prop으로 비밀/저장매체/보안자재 컬럼/API 분기
**When to use:** SEC-14/15/16 비밀/저장매체/보안자재 관리
**설계 근거:** D-17 결정, 동일 CRUD 구조 3종 코드 중복 방지

```typescript
// Source: D-17 설계 결정
type SecretMediaType = 'secret' | 'media' | 'equipment'

interface SecretMediaPageProps {
  type: SecretMediaType
}

const CONFIG: Record<SecretMediaType, { title: string; apiPath: string; columns: ProColumns[] }> = {
  secret: { title: '비밀 관리', apiPath: '/api/sys15/secret', columns: secretColumns },
  media: { title: '저장매체 관리', apiPath: '/api/sys15/media', columns: mediaColumns },
  equipment: { title: '보안자재/암호장비 관리', apiPath: '/api/sys15/equipment', columns: equipColumns },
}

export default function SecretMediaPage({ type }: SecretMediaPageProps) {
  const config = CONFIG[type]
  // 공통 DataTable + CrudForm + Upload.Dragger + PrintableReport
}
```

### Anti-Patterns to Avoid
- **과제 계층을 antd Tree로 구현:** D-01/D-02 결정으로 계단식 DataTable 사용. Tree는 SYS15 예외처리에서만 사용
- **각 비밀/매체/보안자재 별도 컴포넌트:** D-17로 공통 SecretMediaPage 사용
- **Calendar onSelect만 사용:** Phase 6 Pitfall — onPanelChange(월 네비게이션)와 onSelect(날짜 클릭) 반드시 분리
- **TaskQuery에 선택 상태 포함 안 함:** Tree Master-Detail에서 selectedUnit이 queryKey에 없으면 선택 변경 시 재조회 안 됨

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 서버사이드 페이지네이션 테이블 | 직접 구현 | DataTable(@/shared/ui) | Phase 0 frozen contract, 0-based/1-based 변환 내부화 |
| CRUD Modal 폼 | 직접 ProForm | CrudForm(@/shared/ui) | 열기/닫기/저장/리셋 패턴 표준화 |
| 게시판 3종 (SYS03) | 별도 구현 | lazy import Phase 1 BoardPage | sysCode=sys03 파라미터만 변경 |
| 게시판 2종 (SYS15) | 별도 구현 | lazy import Phase 1 BoardPage | sysCode=sys15 파라미터만 변경 |
| 공통코드/권한관리 (SYS15) | 별도 구현 | lazy import Phase 1 | CodeManagementPage / AuthGroupPage |
| 차트 (KPI, 통계) | 직접 SVG/Canvas | @ant-design/charts | Bar/Column/Gauge/Pie/Line 모두 내장 |
| 인쇄 미리보기 | 직접 window.print | PrintableReport + print.css | Phase 4에서 확립, 관리대장 출력 필수 |
| Steps 결재 상태 표시 | 직접 StatusTag | StatusBadge(@/shared/ui) | 일관된 색상/텍스트 매핑 |

**Key insight:** Phase 7은 신규 패턴보다 재사용 패턴의 조합. 새로 작성해야 하는 것은 Checkbox.Group 체크리스트와 SecretMediaPage type prop 분기뿐이다.

---

## Common Pitfalls

### Pitfall 1: Calendar onPanelChange vs onSelect 혼용
**What goes wrong:** onSelect만 사용하면 antd Calendar에서 월 이동 시에도 onSelect가 발생하여 의도치 않은 상세 Modal이 열림
**Why it happens:** antd Calendar v5에서 날짜 셀 클릭과 헤더 월/년 변경 모두 onSelect를 트리거함
**How to avoid:** `onPanelChange`로 월 네비게이션 처리, `onSelect`는 날짜 클릭만 처리
**Warning signs:** 월 이동 버튼 클릭 시 상세 Modal이 뜨면 이 문제
**확인:** Phase 6 STATE.md - "[Phase 06-2]: antd Calendar onPanelChange 월 네비게이션 / onSelect 날짜 클릭 분리 (Pitfall 2 대응)"

### Pitfall 2: Tree Master-Detail queryKey 미연동
**What goes wrong:** Tree에서 다른 노드 선택 시 우측 DataTable이 갱신되지 않음
**Why it happens:** queryKey가 selectedUnit을 포함하지 않으면 TanStack Query가 캐시를 재사용
**How to avoid:** `queryKey: ['sys15', 'exception', selectedUnit]` — selectedUnit을 queryKey에 반드시 포함
**Warning signs:** Tree 노드 클릭해도 DataTable 내용이 변하지 않는 현상

### Pitfall 3: Checkbox.Group 미체크 사유 미검증으로 제출
**What goes wrong:** 미체크 항목에 사유 입력 없이 제출(상신) 버튼 클릭 가능
**Why it happens:** antd Form 검증이 동적 조건부 필드를 자동으로 처리하지 못함
**How to avoid:** 제출 전 수동 검증 로직 추가 — 미체크 항목 중 사유 미입력 항목이 있으면 message.error 표시 후 return
**Warning signs:** 빈 사유로 결재 요청이 MSW에 전달되는 현상

### Pitfall 4: SYS03 비밀관리 등록 후 예고문 Modal 자동 오픈 누락
**What goes wrong:** 비밀 등록 성공 후 예고문 Modal이 열리지 않음 (req_analysis 규칙 미반영)
**Why it happens:** req_analysis.txt line 591: "비밀 보유 현황 등록 시 예고문 등록 화면으로 전환" — 이 규칙을 놓치기 쉬움
**How to avoid:** D-19 결정 준수: saveMutation.onSuccess에서 `setNoticeDocModalOpen(true)` 호출
**Warning signs:** 비밀 등록 후 예고문 화면 미전환

### Pitfall 5: 비밀/매체관리 삭제 시 사유 필수 조건 누락
**What goes wrong:** 삭제 Confirm Dialog에 사유 입력 없이 삭제 가능
**Why it happens:** req_analysis.txt에 명시: "삭제 기능 (입력 필수값 : 삭제 사유)" — CrudForm 기본 삭제와 다름
**How to avoid:** 삭제 시 사유 TextArea가 있는 Modal 사용 (기본 ConfirmDialog 사용 불가)
**Warning signs:** 삭제 API 호출 payload에 reason 필드 없음

### Pitfall 6: SYS15 라우터 등록 시 서브 라우트 누락
**What goes wrong:** 9개 대메뉴 × 평균 3개 소메뉴 = 26+ 라우트가 index.tsx에 미등록
**Why it happens:** Phase 6 SYS01(28개 sub-route) 사례처럼 대규모 라우트 목록 작성 시 누락 발생
**How to avoid:** menus.ts의 sys15 정의(509-591번 줄)를 기준으로 라우트 목록 생성, 완성 후 cross-check

### Pitfall 7: 부재처리 비즈니스 규칙 미반영
**What goes wrong:** 과거 부재기간 수정 가능, 일일보안점검관 지정 기간 부재신청 가능
**Why it happens:** req_analysis.txt line 638: "부재기간은 오늘 일자 기준 이전 정보는 수정 불가", line 637: "일일보안점검관으로 지정되어 있으면 저장 불가"
**How to avoid:** 저장 전 날짜 유효성 검사 + 당직관 지정 여부 Mock 확인 로직

---

## Code Examples

### MSW 핸들러 기본 구조 (참조: sys01-overtime.ts 패턴)
```typescript
// Source: Phase 6 sys01-overtime.ts 패턴 참조
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'

export interface PerformanceTask extends Record<string, unknown> {
  id: string
  taskCode: string
  taskName: string
  departmentId: string
  status: 'draft' | 'submitted' | 'approved' | 'evaluated'
  progress: number
  createdAt: string
}

export const sys03Handlers = [
  http.get('/api/sys03/tasks', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const tasks: PerformanceTask[] = Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      taskCode: `TASK-${String(i + 1).padStart(3, '0')}`,
      taskName: faker.helpers.arrayElement(['추진중점과제1', '추진중점과제2', '중과제A', '소과제B']),
      departmentId: faker.helpers.arrayElement(['dept1', 'dept2', 'dept3']),
      status: faker.helpers.arrayElement(['draft', 'submitted', 'approved', 'evaluated']),
      progress: faker.number.int({ min: 0, max: 100 }),
      createdAt: faker.date.recent({ days: 90 }).toISOString(),
    }))
    const start = page * size
    return HttpResponse.json({
      success: true,
      data: {
        content: tasks.slice(start, start + size),
        totalElements: tasks.length,
        totalPages: Math.ceil(tasks.length / size),
        size,
        number: page,
      }
    })
  }),
]
```

### 계단식 Master-Detail (PERF-11 과제관리)
```typescript
// Source: D-01 결정 — Tree 대신 계단식 DataTable
// 지휘방침 선택 → 추진중점과제 DataTable 로드 → 중과제 DataTable 로드
const [selectedPolicy, setSelectedPolicy] = useState<string>()
const [selectedMainTask, setSelectedMainTask] = useState<string>()

// DataTable onRow로 행 클릭 처리
const policyTableProps = {
  onRow: (record: Policy) => ({
    onClick: () => {
      setSelectedPolicy(record.id)
      setSelectedMainTask(undefined)  // 하위 선택 초기화
    },
    style: { cursor: 'pointer', background: selectedPolicy === record.id ? '#e6f7ff' : undefined }
  })
}
```

### 개인보안일일결산 제출 검증 (SEC-02)
```typescript
// Source: D-13 결정 + Pitfall 3 방어
const handleSubmit = () => {
  const requiredItems = checklistItems.filter(item => item.required)
  const unchecked = requiredItems.filter(item => !checkedItems.includes(item.id))
  
  // 미체크 항목 중 사유 미입력 검증
  const missingReasons = unchecked.filter(item => !reasons[item.id]?.trim())
  if (missingReasons.length > 0) {
    message.error(`미실시 항목에 대한 사유를 입력하세요: ${missingReasons.map(i => i.label).join(', ')}`)
    return
  }
  
  // 제출 처리
  submitMutation.mutate({ checkedItems, reasons })
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tree 기반 과제 계층 | 계단식 Master-Detail DataTable | D-01~D-02 | 메뉴 구조가 이미 레벨별 분리되어 있으므로 Tree 불필요 |
| 각 타입별 독립 컴포넌트 | type prop 기반 공통 SecretMediaPage | D-17 | 코드량 ~66% 감소 (3개 파일 → 1개 공통 컴포넌트) |
| antd Checkbox 개별 | Checkbox.Group + 조건부 TextArea | D-13~D-14 | 체크리스트 항목 구성 일관성 확보 |

---

## Environment Availability

Phase 7는 외부 서비스 없이 코드/MSW Mock 전용이므로 이 섹션을 간략히 기록.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite/Vitest | ✓ | — | — |
| npm | 패키지 관리 | ✓ | — | — |
| @ant-design/charts | 차트 시각화 | ✓ (설치됨) | — | — |
| vitest | 테스트 실행 | ✓ | 2.x | — |

**현재 테스트 베이스라인:** 871개 (36 test files), Phase 7 완료 후 증가 예상.

**Missing dependencies:** 없음 — 모든 필요 패키지 설치 완료 확인 (Phase 6 기준)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 2.x |
| Config file | navy-admin/vite.config.ts (vitest 설정 포함) |
| Quick run command | `cd navy-admin && npx vitest run --reporter=dot` |
| Full suite command | `cd navy-admin && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | 메인화면 3종 차트 렌더링 | unit | `npx vitest run --reporter=dot src/pages/sys03-performance` | ❌ Wave 0 |
| PERF-02 | 과제등록 CRUD + 계층 Master-Detail | unit | `npx vitest run --reporter=dot src/pages/sys03-performance` | ❌ Wave 0 |
| PERF-03 | 업무실적 입력 Modal + 임시저장/상신 분리 | unit | `npx vitest run --reporter=dot src/pages/sys03-performance` | ❌ Wave 0 |
| PERF-04 | 과제실적 승인 Steps 결재 | unit | `npx vitest run --reporter=dot src/pages/sys03-performance` | ❌ Wave 0 |
| PERF-07 | 추진진도율 차트 + 드릴다운 DataTable | unit | `npx vitest run --reporter=dot src/pages/sys03-performance` | ❌ Wave 0 |
| PERF-11 | 과제관리 CRUD 5단계 계층 | unit | `npx vitest run --reporter=dot src/pages/sys03-performance` | ❌ Wave 0 |
| SEC-01 | 보안결산 메인 캘린더 Badge 상태 | unit | `npx vitest run --reporter=dot src/pages/sys15-security` | ❌ Wave 0 |
| SEC-02 | 개인결산 체크리스트 + 사유 검증 | unit | `npx vitest run --reporter=dot src/pages/sys15-security` | ❌ Wave 0 |
| SEC-14/15/16 | SecretMediaPage type prop 분기 | unit | `npx vitest run --reporter=dot src/pages/sys15-security` | ❌ Wave 0 |
| SEC-18 | 인계/인수 Steps 결재 플로우 | unit | `npx vitest run --reporter=dot src/pages/sys15-security` | ❌ Wave 0 |
| SEC-19 | 점검항목관리 Tabs 5개 CRUD | unit | `npx vitest run --reporter=dot src/pages/sys15-security` | ❌ Wave 0 |
| SEC-20 | 예외처리 Tree Master-Detail 3종 | unit | `npx vitest run --reporter=dot src/pages/sys15-security` | ❌ Wave 0 |

**테스트 전략 (Phase 6 패턴 유지):**
- jsdom 환경에서 heavy antd 모듈 테스트 시 readFileSync 파일 내용 기반 검증 (타임아웃 회피)
- MSW 핸들러 타입 정의 검증: 파일 read + 타입 export 확인 패턴

### Sampling Rate
- **Per task commit:** `cd navy-admin && npx vitest run --reporter=dot`
- **Per wave merge:** `cd navy-admin && npx vitest run`
- **Phase gate:** Full suite green (871+ tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `navy-admin/src/pages/sys03-performance/` 디렉토리 내 페이지 파일들 (index.tsx 교체 포함)
- [ ] `navy-admin/src/pages/sys15-security/` 디렉토리 내 페이지 파일들
- [ ] `navy-admin/src/shared/api/mocks/handlers/sys03-performance.ts` — MSW 핸들러
- [ ] `navy-admin/src/shared/api/mocks/handlers/sys15-security.ts` — MSW 핸들러
- [ ] `navy-admin/src/shared/api/mocks/handlers/index.ts` — sys03/sys15 핸들러 등록

---

## Open Questions

1. **SYS03 기준정보>관리자 대메뉴 구조**
   - What we know: D-47 — 기준정보관리가 관리자 역할 포함(시스템관리/평가조직관리/업무실적개인/과제관리)
   - What's unclear: 기준정보관리 대메뉴가 관리자 대메뉴를 겸하는지, 별도 "관리자" 대메뉴를 추가해야 하는지
   - Recommendation: D-47 해석 — 기준정보관리가 관리자 역할이므로 별도 추가 불필요. menus.ts 수정 없음

2. **SYS15 alarmTime 최상위 삭제 불가 구현**
   - What we know: D-40 — 최상위(해군/해병대) 설정 삭제 불가, 삭제 버튼 disabled 조건
   - What's unclear: MSW Mock에서 어떤 unitCode가 최상위인지
   - Recommendation: Mock에서 `isTopLevel: true` 플래그 필드 추가, 삭제 버튼에 `disabled={record.isTopLevel}` 조건

3. **보안교육 삭제 체계관리자 전용 구현**
   - What we know: D-43 — 삭제는 체계관리자 전용
   - What's unclear: Phase 7 MVP에서 체계관리자 판별 방법 (Mock 인증)
   - Recommendation: useAuthStore의 role 필드 'admin' 여부로 판별 (기존 Phase 1 usePermission 패턴)

---

## Sources

### Primary (HIGH confidence)
- Phase 6 CONTEXT.md — Tree Master-Detail, Calendar cellRender, Upload.Dragger 결정 (직접 읽음)
- Phase 6 VERIFICATION.md — 871 tests, 4/4 must-haves verified (직접 읽음)
- navy-admin/src/pages/sys01-overtime/OtMyStatusPage.tsx — @ant-design/charts Column 실제 코드 (직접 읽음)
- navy-admin/src/pages/sys08-unit-lineage/UnitLineageTreePage.tsx — Tree Master-Detail 실제 코드 (직접 읽음)
- navy-admin/src/pages/sys01-overtime/OtWorkHoursPage.tsx — Calendar + TimePicker 실제 코드 (직접 읽음)
- req_analysis.txt lines 137-215 — SYS03 77개 프로세스 상세 (직접 읽음)
- req_analysis.txt lines 578-657 — SYS15 138개 프로세스 상세 (직접 읽음, 일부)
- .planning/REQUIREMENTS.md lines 264-315 — PERF-01~17, SEC-01~28 (직접 읽음)
- navy-admin/src/entities/subsystem/menus.ts — SYS03/SYS15 메뉴 구조 (직접 읽음)
- navy-admin/src/app/router.tsx — 라우터 현황 (직접 읽음)
- navy-admin/src/shared/api/mocks/handlers/index.ts — MSW 핸들러 등록 현황 (직접 읽음)

### Secondary (MEDIUM confidence)
- STATE.md Accumulated Context — Phase 0~6 모든 결정 사항 (직접 읽음)
- CLAUDE.md (project) — 화면 구현 7대 규칙 (직접 읽음)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Phase 0~6에서 동결된 스택, 변경 없음
- Architecture: HIGH — 기존 패턴 재사용, 실제 코드 파일 확인 완료
- Pitfalls: HIGH — Phase 6 STATE.md에 실증된 pitfall 포함 (Calendar, queryKey)
- New patterns: MEDIUM — Checkbox.Group/SecretMediaPage는 설계 결정 기반, 아직 구현 전

**Research date:** 2026-04-06
**Valid until:** Phase 7 실행 완료 시까지 (30일)
