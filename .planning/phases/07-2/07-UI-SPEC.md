# Phase 7 UI-SPEC: 최고복잡도 서브시스템 (SYS03 + SYS15)

**Phase:** 07
**Created:** 2026-04-06
**Status:** Complete

---

## 1. SYS03 성과관리체계 UI 설계

### 1.1 메인화면

**레이아웃:** 3종 차트 수평 배치

```
┌─────────────────────────────────────────────────────────────┐
│  [Gauge] 나의 부서 달성률  │  [Bar] 지휘방침별 업무추진율  │
│                           │                               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [Bar] 부/실/단별 업무추진율  (Grouped Bar, 비교용)          │
└─────────────────────────────────────────────────────────────┘
```

- **Gauge 차트:** 달성률 % 표시, 목표선(빨간 점선) 70% 기준
- **Bar 차트 1:** 지휘방침별 추진율. 가로 막대(Horizontal Bar). X축: 0~100%
- **Bar 차트 2:** 부서별 추진율. Grouped Bar (2개 시리즈: 목표/실적)
- **기간 선택:** Radio.Group (연간 / 월간). 상단 우측 배치

### 1.2 기준정보관리

#### 과제관리 (D-01 계단식 Master-Detail)

```
┌──────────────┬──────────────────────────────────────┐
│ 지휘방침 목록 │ 선택된 지휘방침의 추진중점과제 목록  │
│ DataTable    │ DataTable                            │
├──────────────┴──────────────────────────────────────┤
│ 선택된 추진중점과제의 중과제 목록                    │
│ DataTable                                           │
└─────────────────────────────────────────────────────┘
```

- **지휘방침 컬럼:** 번호, 방침명, 기간, 상태
- **추진중점과제 컬럼:** 번호, 과제명, 담당부서, 가중치
- **중과제 컬럼:** 번호, 과제명, 담당자, 목표값, 현재값, 달성률
- **상위 행 클릭 → 하위 DataTable 자동 로드** (QueryKey 연동)
- **각 DataTable 상단:** `등록` 버튼. 수정/삭제는 행 우측 Action 컬럼
- **중과제 일괄등록:** Upload.Dragger (엑셀 업로드)

#### 평가조직 관리

- DataTable: 조직명, 평가단위, 담당자
- CrudForm Modal: 조직명(Input), 평가단위(Select), 담당자(Input)

### 1.3 연간과제관리

#### 과제등록 (D-02)

```
┌──────────────────────────────────────────────────────────┐
│ [부서 Select 필터]  [검색 버튼]                           │
├──────────────────────────────────────────────────────────┤
│ 소과제 목록 DataTable                                    │
│ (행 클릭 시 하단 상세과제 DataTable 펼침)                │
├──────────────────────────────────────────────────────────┤
│ [선택한 소과제: {과제명}] 상세과제 목록 DataTable         │
└──────────────────────────────────────────────────────────┘
```

- **소과제 컬럼:** 번호, 과제명, 담당부서, 기간, 상태
- **상세과제 컬럼:** 번호, 세부과제명, 담당자, 목표, 진도율
- **소과제 일괄등록:** Upload.Dragger

#### 업무실적 입력 (D-09)

```
┌──────────────────────────────────────────────────────────┐
│ 추진현황 DataTable (중과제/소과제별)                      │
│   [행 클릭] → 상세과제 실적 입력 Modal 열기               │
└──────────────────────────────────────────────────────────┘

Modal: 상세과제 실적 입력
┌──────────────────────┐
│ 과제명: {과제명}      │
│ 추진내용: TextArea   │
│ 실적(%): InputNumber │
│ 증빙자료: Upload     │
│ [임시저장] [상신]    │
└──────────────────────┘
```

#### 과제실적 승인/평가 (D-10, D-11)

```
결재대기 DataTable
→ 행 클릭 → 상세 Modal

Modal: 과제실적 상세
┌────────────────────────────────────┐
│ Steps: 상신 → 1차결재 → 2차결재    │
│ 과제 정보 (읽기전용)                │
│ 실적 내용                          │
│ [승인] [반려 (사유 Input 필수)]     │
└────────────────────────────────────┘
```

### 1.4 추진진도율 (D-06)

```
┌──────────────────────────────────────────────────────────┐
│ Grouped Bar 차트                                          │
│ - X축: 부대/부서명                                        │
│ - Y축: 진도율(%)                                          │
│ - 시리즈: [목표] [실적]                                   │
├──────────────────────────────────────────────────────────┤
│ [드릴다운] 행 클릭 → 하위 DataTable 상세 (부서별 소과제)   │
└──────────────────────────────────────────────────────────┘
```

### 1.5 평가결과 (D-07)

```
┌─────────────────────┬────────────────────────────────────┐
│ Bar 차트             │ Stacked Bar + antd Progress        │
│ (부대별 평가율)      │ (입력현황 완료율)                  │
└─────────────────────┴────────────────────────────────────┘
```

---

## 2. SYS15 보안일일결산체계 UI 설계

### 2.1 메인화면 (D-30~32)

**컴포넌트:** antd `Calendar` + `Tabs`

```
┌──────────────────────────────────────────────────────────┐
│ Tabs: [개인보안결산] [사무실보안결산]                     │
├──────────────────────────────────────────────────────────┤
│ antd Calendar                                            │
│  - cellRender: 날짜별 Badge 표시                         │
│  - 초록 Badge: 실시완료                                  │
│  - 빨간 Badge: 미실시                                    │
│  - 회색 Badge: 부재                                      │
│  - Badge 없음: 미래일자                                  │
│  - onPanelChange: 월 네비게이션 (API 재조회)              │
│  - onSelect: 날짜 클릭 → 상세 Modal                      │
└──────────────────────────────────────────────────────────┘
```

### 2.2 비밀/매체관리 (D-17~20)

**SecretMediaPage type prop 분기 통합 컴포넌트**

```
type='secret'    → 비밀 관리 컬럼
type='media'     → 저장매체 관리 컬럼
type='equipment' → 보안자재/암호장비 관리 컬럼

공통 레이아웃:
┌──────────────────────────────────────────────────────────┐
│ SearchForm (비밀번호/분류/상태 등 type별 조건)            │
├──────────────────────────────────────────────────────────┤
│ DataTable                                                │
│ toolBarRender: [등록] [일괄등록] [엑셀저장] [관리대장인쇄] │
└──────────────────────────────────────────────────────────┘

등록 Modal (CrudForm):
- type='secret': 비밀명, 분류(급), 관리번호, 등록자, 예고일
  → 등록 완료 후 예고문 Modal 자동 오픈 (D-19)
- type='media': 매체명, 분류, 일련번호, 용량, 매체유형
- type='equipment': 장비명, 유형, 모델명, 설치위치
```

### 2.3 보안일일결산 체크리스트 (D-13~14)

**개인보안일일결산 UI (Checkbox.Group 기반):**

```
┌──────────────────────────────────────────────────────────┐
│ 날짜 선택 DatePicker                                     │
├──────────────────────────────────────────────────────────┤
│ [필수 점검항목] Checkbox.Group                           │
│ □ 항목 1  (미체크시 → 사유 TextArea 조건부 표시)          │
│ □ 항목 2                                                 │
│ ✓ 항목 3                                                 │
├──────────────────────────────────────────────────────────┤
│ [선택 점검항목] Checkbox.Group                           │
│ □ 선택항목 A                                             │
│ ✓ 선택항목 B                                             │
├──────────────────────────────────────────────────────────┤
│ [임시저장] [제출]                                        │
└──────────────────────────────────────────────────────────┘
```

**사무실보안일일결산 UI (추가 항목):**

```
미실시자 Input + 미실시 사유 TextArea
부재자 Input + 부재 사유 TextArea
```

### 2.4 관리자 - 점검항목관리 (D-24~26)

**Tabs 5개 구조:**

```
┌─────────────────────────────────────────────────────────┐
│ Tabs:                                                   │
│  [필수점검항목(개인)] [필수점검항목(사무실)]             │
│  [선택점검항목(개인)] [선택점검항목(사무실)]             │
│  [개인보안수준평가항목]                                 │
├─────────────────────────────────────────────────────────┤
│ [선택점검항목 탭에만] 부대(서) Select 필터              │
├─────────────────────────────────────────────────────────┤
│ DataTable: 항목명 | 분류 | 가중치 | 필수여부 | 주기     │
│ toolBarRender: [등록]                                   │
└─────────────────────────────────────────────────────────┘
```

### 2.5 관리자 - 예외처리관리 (D-27~29)

**Tree + DataTable Master-Detail (SYS08 패턴 재사용)**

```
┌──────────────┬───────────────────────────────────────────┐
│ [조직 트리]   │ [DataTable: 예외처리 인원 목록]           │
│              │                                           │
│ ▼ 해군       │ 성명 | 계급 | 부대(서) | 사유 | 기간 | 상태│
│   ▼ 1함대    │                                           │
│     ▼ 11전단 │ toolBarRender: [등록]                     │
│       1팀    │                                           │
│   ▶ 2함대    │ [등록/수정 Modal] [삭제 확인 Modal]        │
│ ▶ 해병대     │                                           │
└──────────────┴───────────────────────────────────────────┘

Tabs 3개: [체계기준 조직도] [1인사무실] [예외처리]
각 탭 동일 Tree+DataTable 구조
```

### 2.6 개인보안수준평가 (D-33~36)

**수시평가 UI:**

```
┌──────────────────────────────────────────────────────────┐
│ 대상자 DataTable                                         │
│ → 행 클릭 → 평가 Modal                                  │
│                                                         │
│ Modal:                                                  │
│   평가내용: TextArea                                    │
│   가점: InputNumber  감점: InputNumber                  │
│   [저장]                                                │
└──────────────────────────────────────────────────────────┘
```

**정기평가 UI (D-34):**

```
┌──────────────────────────────────────────────────────────┐
│ 항목별 점수 입력 (5개 항목)                              │
│   항목1: InputNumber (0~100점)                          │
│   항목2: InputNumber (0~100점)                          │
│   항목3: InputNumber (0~100점)                          │
│   항목4: InputNumber (0~100점)                          │
│   항목5: InputNumber (0~100점)                          │
│   가점: InputNumber  감점: InputNumber                  │
│                                                         │
│   총점: {자동계산} / 100                                │
│   [저장]                                                │
└──────────────────────────────────────────────────────────┘
```

**통계 (D-36):**

```
┌─────────────────┬──────────────┬─────────────────────────┐
│ Bar 차트         │ Pie 차트     │ Line 차트               │
│ (부대별 평균점수) │ (등급 분포)  │ (기간별 추이)            │
└─────────────────┴──────────────┴─────────────────────────┘
```

### 2.7 인계/인수 워크플로우 (D-21~23)

**Steps 기반 워크플로우:**

```
Steps:  [인계등록] → [인수확인/반송] → [결재처리]

인계등록:
  비밀/매체 보유현황 DataTable (체크박스 선택)
  → 인수자 Select (조직도 검색)
  → [인계등록] 버튼

인수:
  인수대기 목록 DataTable
  → [인수확인] [반송] 버튼

내역 조회:
  DataTable: 인계일시 | 인계자 | 인수자 | 항목 | 결재상태
```

---

## 3. 공통 컴포넌트 활용 패턴

### 3.1 DataTable (공통 ProTable 래퍼)

```tsx
<DataTable<T>
  columns={columns}
  request={fetchFn}
  rowKey="id"
  actionRef={actionRef}
  headerTitle="목록명"
  toolBarRender={() => [<Button>등록</Button>]}
/>
```

### 3.2 SearchForm (공통 검색 폼)

```tsx
<SearchForm
  fields={[
    { name: 'department', label: '부대(서)', type: 'select', options: UNIT_OPTIONS },
    { name: 'startDate', label: '시작일', type: 'date' },
    { name: 'endDate', label: '종료일', type: 'date' },
  ]}
  onSearch={handleSearch}
/>
```

### 3.3 Lazy Import 패턴 (7대 규칙 6번, 7번)

```tsx
// 공통 게시판 (7대 규칙 6번)
const BoardListPage = React.lazy(() =>
  import('@/pages/common/board/BoardListPage').then((m) => ({ default: m.BoardListPage }))
)

// 시스템 관리자 메뉴 (7대 규칙 7번)
const CodeManagementPage = React.lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupPage = React.lazy(() => import('@/pages/common/auth-group'))
```

### 3.4 Tree Master-Detail (SYS08 확립 패턴)

```tsx
<div style={{ display: 'flex', gap: 16 }}>
  <Card title="조직 계층" style={{ width: 280 }}>
    <Tree
      treeData={treeData}
      onSelect={(keys, info) => {
        setSelectedUnit(String(keys[0]))
        actionRef.current?.reload()
      }}
      defaultExpandAll
    />
  </Card>
  <div style={{ flex: 1 }}>
    <DataTable
      columns={columns}
      request={(params) => fetchData({ ...params, unitId: selectedUnit })}
    />
  </div>
</div>
```

---

## 4. 색상/스타일 가이드

### 결산 상태 색상

| 상태 | Badge 색상 | 의미 |
|------|-----------|------|
| `completed` | `success` (초록) | 실시완료 |
| `incomplete` | `error` (빨강) | 미실시 |
| `absence` | `default` (회색) | 부재 |
| `future` | 없음 | 미래일자 |

### 보안 등급 색상

| 등급 | 색상 |
|------|------|
| A | `#52c41a` (초록) |
| B | `#1677ff` (파랑) |
| C | `#faad14` (노랑) |
| D | `#ff4d4f` (빨강) |

---

## 5. 라우트 매핑

### SYS03 성과관리체계

| Path | 컴포넌트 | 기능 |
|------|---------|------|
| /sys03/1/1 | MainDashboardPage | 메인화면 (Gauge+Bar 차트) |
| /sys03/2/1 | SystemInfoPage | 기준정보>시스템 |
| /sys03/2/2 | EvalOrgPage | 기준정보>평가조직 |
| /sys03/2/3 | PersonalWorkPage | 기준정보>업무실적(개인) |
| /sys03/2/4 | TaskMgmtPage | 기준정보>과제관리 (계단식) |
| /sys03/3/1 | ProgressRatePage | 연간과제>추진진도율 |
| /sys03/3/2 | TaskRegistPage | 연간과제>과제등록 |
| /sys03/3/3 | WorkResultPage | 연간과제>업무실적입력 |
| /sys03/3/4 | ResultApprovalPage | 연간과제>과제실적승인 |
| /sys03/3/5 | ResultEvalPage | 연간과제>과제실적평가 |
| /sys03/3/6 | PersonalEvalPage | 연간과제>업무실적개인평가 |
| /sys03/4/1 | EvalResultPage | 평가결과>평가결과 |
| /sys03/4/2 | InputStatusPage | 평가결과>입력현황 |
| /sys03/5/1~3 | BoardListPage | 게시판 3종 (공지/질의/자료) |
| /sys03/6/1 | TaskSearchPage | 과제검색 |
| /sys03/7/1 | CodeManagementPage | 시스템>코드관리 |
| /sys03/7/2 | AuthGroupPage | 시스템>권한관리 |

### SYS15 보안일일결산체계

| Path | 컴포넌트 | 기능 |
|------|---------|------|
| /sys15/1/1 | SecMainPage | 메인화면 (Calendar) |
| /sys15/2/1~5 | MediaPage, SecretPage, NoticeDocPage, EquipmentPage, TransferPage | 비밀/매체관리 |
| /sys15/3/1~6 | PersonalSecDailyPage, OfficeSecDailyPage, DutyOfficerPage, SecurityLevelPage, AbsencePage, SecurityEduPage | 보안일일결산 |
| /sys15/4/1~2 | ApprovalPendingPage, ApprovalCompletedPage | 결재 |
| /sys15/5/1~4 | SummarySecretPage, SummaryPersonalPage, SummaryOfficePage, SummaryAbsencePage | 결산종합현황 |
| /sys15/6/1 | PersonalSettingPage | 개인설정 |
| /sys15/7/1~2 | BoardListPage (sys15-notice/qna) | 게시판 |
| /sys15/8/1~5 | CheckItemMgmtPage, HolidayMgmtPage, NotifyTimeMgmtPage, LogHistoryPage, ExceptionMgmtPage | 관리자 |
| /sys15/9/1~2 | CodeManagementPage, AuthGroupPage | 시스템 |
