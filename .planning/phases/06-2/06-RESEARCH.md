# Phase 6: 고복잡도 서브시스템 2개 - Research

**Researched:** 2026-04-06
**Domain:** React/Ant Design Tree + Calendar + 결재 워크플로우 (sys08 부대계보, sys01 초과근무)
**Confidence:** HIGH

## Summary

Phase 6은 2개 고복잡도 서브시스템(158개 프로세스)을 구현한다. sys08 부대계보관리체계(59개)는 antd Tree 컴포넌트를 이용한 부대 계층 조회가 핵심 신규 패턴이며, 나머지(기록부/직위자/활동/이미지/통계)는 기존 DataTable+CrudForm 패턴 재사용이다. sys01 초과근무관리체계(99개)는 이 프로젝트 최대 단일 서브시스템으로, antd Calendar 기반 근무시간/공휴일 관리와 월말결산 마감 워크플로우가 신규이며 신청서/결재/현황/통계는 Phase 4~5 패턴 재사용이다.

두 서브시스템 모두 이미 `navy-admin/src/pages/sys08-unit-lineage/` 및 `sys01-overtime/`에 스텁 index.tsx가 존재한다. 라우터 구조와 SUBSYSTEM_MENUS에 sys01/sys08이 이미 정의되어 있으므로 메뉴 구조 신규 작업은 불필요하다. 실질 작업은 각 서브시스템 디렉토리 하위에 페이지 컴포넌트와 MSW 핸들러를 추가하는 것이다.

**Primary recommendation:** sys08(Tree 중심, 12개 페이지) → sys01(Calendar/월말결산 중심, 20개 페이지) 순서로 Wave를 분리. 두 서브시스템 공통 신규 UI 패턴(Tree, Calendar, Upload.Dragger)을 Wave 1에서 먼저 확보하고, 이후 Wave에서 반복 적용한다.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 제원/계승부대 조회는 antd Tree — 좌측 패널 계층, 우측 DataTable Master-Detail 레이아웃
- **D-02:** 계승관계 편집은 폼 기반(CrudForm), 트리는 조회 전용 (드래그&드롭 없음)
- **D-03:** 트리 데이터는 MSW 계층 JSON (함대->전단->함정 3~4단)
- **D-04:** 신청서 작성: 종류 Select + DatePicker + TimePicker.RangePicker + TextArea, 총 근무시간 자동 계산
- **D-05:** 나의 근무현황: @ant-design/charts Column+Line 조합, 연간/월간 탭
- **D-06:** 신청서 결재: Phase 4~5 Steps 결재 패턴 재사용
- **D-07~09:** 월말결산: StatusBadge + ConfirmDialog 상태 전환, 마감취소는 완료 상태에서만, 마감기한은 DatePicker
- **D-10~15:** 당직개소/부서 관리: DataTable+CrudForm CRUD, 승인/반려 패턴
- **D-16~18:** 부대기/부대마크: Upload.Dragger + Image 미리보기, Base64 로컬 표시
- **D-19~21:** 입력통계: Select로 종류 선택 → DataTable+차트, Progress+StatusBadge 완료율
- **D-22~25:** 권한신청/관리: 별도 페이지, Phase 1 공통 권한관리 포함 (7대 규칙 7번)
- **D-26~42:** 서브시스템 공통: 일괄등록(Upload+검증모달), 결재(Steps 3단), 일괄처리, 근무현황 차트, 최대인정시간 Tabs, 근무시간 Calendar+Modal, 공휴일 Calendar+Modal, 부대인원 DataTable, 엑셀 Mock, 게시판 sysCode 재사용, 관리자 대메뉴 lazy import, 결재선 DataTable+CrudForm, 개인설정 읽기전용, 부대기록부 CRUD, 주요직위자 Timeline, 출력 PrintableReport+print.css, 부재관리 DatePicker.RangePicker+DataTable

### Claude's Discretion
- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합 (키워드, 날짜범위, 상태 등)
- 테이블 컬럼 구성 및 정렬/필터 옵션
- Tree 노드 아이콘/스타일 상세
- Calendar 셀 렌더링 상세
- 차트 색상/스타일 디테일
- 부대계보 통계 차트 종류/조합

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UNIT-01 | 부대기록부 목록조회/등록/수정/삭제 [4] | DataTable+CrudForm 기존 패턴 직접 적용 |
| UNIT-02 | 제원/계승부대 관리 트리조회/CRUD/계승관계/저장 [7] | antd Tree Master-Detail (D-01~03) |
| UNIT-03 | 주요직위자 관리 CRUD+이력조회+저장 [7] | DataTable+CrudForm+Timeline 패턴 |
| UNIT-04 | 주요활동 관리 CRUD+첨부+분류+저장 [8] | DataTable+CrudForm+Upload 패턴 |
| UNIT-05 | 주요활동 결재 결재대기/승인/반려/이력 [4] | Phase 4~5 Steps 결재 패턴 (D-27) |
| UNIT-06 | 부대기/부대마크 관리 CRUD+이미지업로드+저장 [7] | Upload.Dragger+Image (D-16~18) |
| UNIT-07 | 권한신청 신청/승인대기 [2] | 별도 신청폼 페이지 (D-22) |
| UNIT-08 | 권한관리 목록/승인/반려/이력/등급/저장 [6] | 승인/반려 패턴 (D-23) |
| UNIT-09 | 권한조회 내 권한/부대별 권한 [2] | 읽기전용 DataTable (D-24) |
| UNIT-10 | 입력 통계 10종+차트+저장+인쇄 [10] | Select+DataTable+차트+Progress (D-19~21) |
| UNIT-11 | 게시판 공지사항/질의응답 [2] | Phase 1 공통게시판 sysCode=sys08 (D-35) |
| OT-01 | 신청서 작성 목록/상세/작성/수정/삭제 [5] | DatePicker+TimePicker.RangePicker+자동계산 (D-04) |
| OT-02 | 신청서 결재 결재대기/상세/결재/반려 [4] | Phase 4~5 Steps 결재 패턴 (D-06) |
| OT-03 | 일괄처리 목록/상세/작성/수정/삭제 [5] | DataTable+CrudForm 다중선택 (D-28) |
| OT-04 | 일괄처리 승인 대기/상세/승인/반려 [4] | 승인/반려 패턴 (D-28) |
| OT-05 | 월말결산 9개 프로세스 [9] | StatusBadge+ConfirmDialog 마감 워크플로우 (D-07~09) |
| OT-06 | 나의 근무현황 목록/그래프 [2] | Column+Line 차트 연간/월간 탭 (D-05) |
| OT-07 | 나의 부재관리 CRUD [4] | DatePicker.RangePicker+DataTable (D-42) |
| OT-08 | 부대 근무 현황 조회/상세/저장 [3] | DataTable+엑셀 Mock (D-29) |
| OT-09 | 부대 근무 통계 목록/그래프 [2] | Column/Bar 차트 (D-29) |
| OT-10 | 부대 부재 현황 [1] | DataTable 조회 |
| OT-11 | 월말결산 현황 조회/상세/저장 [3] | DataTable (D-07) |
| OT-12 | 자료 출력 [1] | 엑셀 Mock message.success (D-34) |
| OT-13 | 부대인원 조회/저장 [2] | DataTable+엑셀 Mock (D-33) |
| OT-14 | 최대인정시간 12개 프로세스 [12] | 연도/월 Select+DataTable Tabs (D-30) |
| OT-15 | 근무시간 관리 8개 프로세스 [8] | antd Calendar+Modal (D-31) |
| OT-16 | 공휴일 관리 CRUD [4] | antd Calendar+Modal (D-32) |
| OT-17 | 결재선 관리 조회/등록/삭제 [3] | DataTable+CrudForm (D-37) |
| OT-18 | 초과근무자 관리 조회/상세/확인/반려/저장 [5] | 승인/반려 패턴 (D-12) |
| OT-19 | 당직개소 관리 CRUD [4] | DataTable+CrudForm (D-10) |
| OT-20 | 당직개소 변경 조회/변경 [2] | Select 변경 페이지 (D-11) |
| OT-21 | 개인별 당직개소 승인 조회/승인/반려 [3] | 승인/반려 패턴 (D-12) |
| OT-22 | 개인별 부서 이동 승인 조회/승인/반려 [3] | 승인/반려 패턴 (D-13) |
| OT-23 | 개인설정 정보 조회 [1] | 읽기전용 표시 페이지 (D-38) |
| OT-24 | 개인별 당직개소 설정 신청/결재현황 [2] | 신청폼+Tabs (D-14) |
| OT-25 | 개인별 부서 설정 이동신청/복구/결재현황 [3] | 신청폼+복구버튼+Tabs (D-15) |
| OT-26 | 공지사항 게시판 [1] | Phase 1 공통게시판 sysCode=sys01 (D-35) |
| OT-27 | 질의응답 게시판 [1] | Phase 1 공통게시판 sysCode=sys01 (D-35) |
| OT-28 | 권한관리 권한별메뉴/사용자별권한 [2] | Phase 1 공통 권한관리 lazy import (D-36) |
</phase_requirements>

## Standard Stack

### Core (확정 — 변경 불가)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| antd | 5.29.3 | UI 컴포넌트 (Tree, Calendar, Upload, Image 포함) | Phase 0 동결 계약 |
| @ant-design/pro-components | 2.8.10 | ProTable, ProForm 래퍼 | Phase 0 동결 계약 |
| @ant-design/charts | 2.6.7 | Column, Line, Bar, Pie 차트 | Phase 4에서 설치됨 |
| react | 18.3.1 | UI 렌더링 | Phase 0 동결 계약 |
| zustand | 5.0.12 | 전역 상태 (authStore, uiStore) | Phase 0 동결 계약 |
| @tanstack/react-query | 5.96.2 | 서버 상태/MSW 연동 | Phase 0 동결 계약 |
| react-router-dom | 7.14.0 | 라우팅 | Phase 0 동결 계약 |
| msw | 2.12.14 | Mock API | Phase 0 동결 계약 |
| @faker-js/faker | 10.4.0 | Mock 데이터 생성 | Phase 0 동결 계약 |
| dayjs | 1.11.20 | DatePicker/Calendar 연동 | Phase 0 동결 계약 |
| vitest | 4.1.2 | 테스트 | Phase 0 동결 계약 |

**신규 설치 불필요.** 모든 필요 라이브러리가 이미 package.json에 포함되어 있다.

## Architecture Patterns

### 디렉토리 구조
```
navy-admin/src/pages/
├── sys08-unit-lineage/
│   ├── index.tsx                    # 서브시스템 진입점 (이미 존재, 내용 채우기)
│   ├── UnitRecordPage.tsx           # 부대기록부 CRUD
│   ├── UnitLineageTreePage.tsx      # 제원/계승부대 Tree Master-Detail
│   ├── UnitKeyPersonPage.tsx        # 주요직위자 CRUD+Timeline
│   ├── UnitActivityPage.tsx         # 주요활동 CRUD+Upload
│   ├── UnitActivityApprovalPage.tsx # 주요활동 결재 Steps
│   ├── UnitFlagPage.tsx             # 부대기/마크 Upload.Dragger+Image
│   ├── UnitAuthRequestPage.tsx      # 권한신청
│   ├── UnitAuthMgmtPage.tsx         # 권한관리 (관리자)
│   ├── UnitAuthViewPage.tsx         # 권한조회
│   ├── UnitStatsPage.tsx            # 입력통계 대시보드
│   └── PrintableReport.tsx          # 출력 래퍼 (sys09 패턴 복사)
│
├── sys01-overtime/
│   ├── index.tsx                    # 서브시스템 진입점 (이미 존재, 내용 채우기)
│   ├── OtRequestPage.tsx            # 신청서 작성/목록
│   ├── OtApprovalPage.tsx           # 신청서 결재 Steps
│   ├── OtBulkPage.tsx               # 일괄처리
│   ├── OtBulkApprovalPage.tsx       # 일괄처리 승인
│   ├── OtMonthlyClosingPage.tsx     # 월말결산
│   ├── OtMyStatusPage.tsx           # 나의 근무현황 차트
│   ├── OtAbsencePage.tsx            # 나의 부재관리
│   ├── OtUnitStatusPage.tsx         # 부대 근무현황/통계
│   ├── OtMonthlyStatusPage.tsx      # 월말결산 현황
│   ├── OtUnitPersonnelPage.tsx      # 부대인원 조회
│   ├── OtMaxHoursPage.tsx           # 최대인정시간 (Tabs)
│   ├── OtWorkHoursPage.tsx          # 근무시간 관리 Calendar
│   ├── OtHolidayPage.tsx            # 공휴일 관리 Calendar
│   ├── OtApprovalLinePage.tsx       # 결재선 관리
│   ├── OtDutyWorkerPage.tsx         # 초과근무자 관리
│   ├── OtDutyPostPage.tsx           # 당직개소 관리
│   ├── OtDutyPostChangePage.tsx     # 당직개소 변경
│   ├── OtPersonalDutyApprovalPage.tsx # 개인별 당직개소 승인
│   ├── OtPersonalDeptApprovalPage.tsx # 개인별 부서 이동 승인
│   ├── OtPersonalSettingPage.tsx    # 개인설정 정보
│   ├── OtPersonalDutyPage.tsx       # 개인별 당직개소 설정
│   └── OtPersonalDeptPage.tsx       # 개인별 부서 설정
│
navy-admin/src/shared/api/mocks/handlers/
├── sys08-unit-lineage.ts            # 부대계보 MSW 핸들러
└── sys01-overtime.ts                # 초과근무 MSW 핸들러
```

### Pattern 1: antd Tree Master-Detail (UNIT-02 전용)
**What:** 좌측 antd Tree로 계층 탐색, 우측 DataTable로 선택 부대 상세
**When to use:** 부대 계층 구조 조회 (제원/계승부대)
```typescript
// antd Tree - 좌측 패널
import { Tree } from 'antd';

const UnitLineageTreePage = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>();

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Card style={{ width: 280 }}>
        <Tree
          treeData={treeData}   // { key, title, children } 재귀 구조
          onSelect={(keys) => setSelectedUnit(keys[0] as string)}
          defaultExpandedKeys={['root']}
        />
      </Card>
      <div style={{ flex: 1 }}>
        <DataTable<LineageRecord>
          columns={columns}
          requestFn={({ current, pageSize }) =>
            fetchLineage({ unitId: selectedUnit, current, pageSize })
          }
          queryKey={['lineage', selectedUnit]}
        />
      </div>
    </div>
  );
};
```

### Pattern 2: antd Calendar + Modal CRUD (OT-15, OT-16)
**What:** antd Calendar에서 날짜 클릭 시 Modal로 등록/수정/삭제
**When to use:** 근무시간 관리, 공휴일 관리
```typescript
import { Calendar, Modal } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const OtHolidayPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>();
  const [modalOpen, setModalOpen] = useState(false);

  const cellRender = (date: Dayjs) => {
    const holidays = getHolidaysForDate(date);
    return holidays.map(h => (
      <div key={h.id} className="text-red-500 text-xs">{h.name}</div>
    ));
  };

  return (
    <>
      <Calendar
        cellRender={cellRender}
        onSelect={(date) => { setSelectedDate(date); setModalOpen(true); }}
      />
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)}>
        <CrudForm
          initialValues={{ date: selectedDate?.format('YYYY-MM-DD') }}
          onFinish={handleSave}
        />
      </Modal>
    </>
  );
};
```

### Pattern 3: 월말결산 마감 상태 전환 (OT-05)
**What:** StatusBadge + ConfirmDialog로 마감/마감취소 전환
**When to use:** 월말결산 마감 워크플로우
```typescript
// 마감 버튼 — 작성중 상태에서만 활성화
<ConfirmDialog
  title="월말결산 마감"
  content="마감 처리하면 수정이 불가합니다. 마감하시겠습니까?"
  onConfirm={() => closeMonthly(record.id)}
>
  <Button disabled={record.status !== 'draft'}>마감</Button>
</ConfirmDialog>

// 마감취소 — 마감완료 상태 + 사유 입력
<ConfirmDialog
  title="마감 취소"
  content={<Input placeholder="마감취소 사유를 입력하세요" />}
  onConfirm={(reason) => cancelClose(record.id, reason)}
>
  <Button disabled={record.status !== 'closed'}>마감취소</Button>
</ConfirmDialog>
```

### Pattern 4: Upload.Dragger + Image 미리보기 (UNIT-06)
**What:** antd Upload.Dragger로 이미지 업로드, Base64 로컬 미리보기
**When to use:** 부대기/부대마크 이미지 등록
```typescript
import { Upload, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

// Upload.Dragger — 드래그 업로드
<Dragger
  accept="image/*"
  beforeUpload={(file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    return false; // 서버 업로드 방지 (MVP Base64 로컬)
  }}
>
  <p><InboxOutlined /></p>
  <p>이미지를 드래그하거나 클릭하여 업로드</p>
</Dragger>

// 미리보기
{preview && <Image src={preview} width={200} />}

// 목록 썸네일
const columns = [
  { title: '이미지', render: (_, r) => <Image src={r.imageBase64} width={50} /> },
  // ...
];
```

### Anti-Patterns to Avoid
- **트리 드래그&드롭 구현:** D-02 결정에 따라 편집은 폼 기반. Tree의 draggable prop 사용 금지
- **Calendar를 스케줄러로 사용:** antd Calendar는 표시 전용. 드래그 이동 등 스케줄러 기능 구현 금지
- **이미지 서버 업로드 구현:** MVP에서는 Base64 로컬 표시. 실제 파일 업로드 API 구현 금지
- **새 라이브러리 설치:** 모든 필요 라이브러리 기존 설치 완료. react-big-calendar 등 추가 금지

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 계층 트리 UI | 재귀 ul/li | antd Tree | 키보드 접근성, 가상화, 아이콘 내장 |
| 달력 UI | div 그리드 | antd Calendar | cellRender API로 커스텀 셀 지원, dayjs 연동 |
| 이미지 미리보기 | img 태그 직접 | antd Image | 줌, 회전, 에러 핸들링 내장 |
| 파일 드래그 업로드 | drop 이벤트 | antd Upload.Dragger | 다중 파일, 진행률, 검증 내장 |
| 차트 | SVG 직접 | @ant-design/charts | Column/Line/Bar/Pie 이미 설치됨 |
| 결재 Steps | 커스텀 진행 표시 | antd Steps + 기존 패턴 | Phase 4~5에서 검증된 패턴 |
| 타임라인 | ul/li 목록 | antd Timeline | 시간순 이력 표시에 최적화 |
| 엑셀 저장 | SheetJS 구현 | message.success Mock | MVP 전략, 백엔드 연동 시 구현 |

**Key insight:** antd 5.x에 Tree/Calendar/Upload/Image 모두 내장. 신규 패키지 설치 없이 Phase 6 신규 UI 패턴 모두 커버 가능.

## Common Pitfalls

### Pitfall 1: antd Tree treeData 타입 — key 중복
**What goes wrong:** MSW에서 동일 key를 가진 노드가 존재하면 트리 렌더링 오류 또는 선택 오동작
**Why it happens:** Faker로 Mock 데이터 생성 시 key 충돌 발생 가능
**How to avoid:** Faker uuid로 유니크 key 보장. `{ key: faker.string.uuid(), title, children }` 패턴
**Warning signs:** 트리에서 한 노드 클릭 시 다른 노드도 선택됨

### Pitfall 2: antd Calendar onSelect vs onChange
**What goes wrong:** onSelect는 날짜 클릭마다 호출(셀 클릭 포함), onChange는 월/년 변경 시만 호출. 혼용 시 Modal이 원치 않은 타이밍에 열림
**Why it happens:** antd Calendar API 혼동
**How to avoid:** 날짜 클릭 시 Modal 열기는 반드시 `onSelect` 사용. 월 네비게이션 콜백은 `onPanelChange` 사용
**Warning signs:** 달력 헤더의 월 변경 Select 클릭 시 Modal이 열림

### Pitfall 3: Upload beforeUpload return false
**What goes wrong:** beforeUpload에서 false를 반환하지 않으면 antd가 action URL로 자동 업로드 시도 → 404 에러
**Why it happens:** antd Upload 기본 동작이 action prop URL에 POST
**How to avoid:** MVP Base64 패턴에서는 `beforeUpload={() => { /* ... */ return false; }}` 반드시 명시
**Warning signs:** 브라우저 콘솔에 404 POST 에러

### Pitfall 4: TimePicker.RangePicker dayjs 값
**What goes wrong:** TimePicker.RangePicker의 value는 `[Dayjs, Dayjs]` 타입. 총 근무시간 계산 시 `diff('minutes')` 사용 필요
**Why it happens:** antd DatePicker 계열은 모두 dayjs 객체 반환
**How to avoid:** `const minutes = end.diff(start, 'minutes'); const hours = Math.floor(minutes/60);` 패턴
**Warning signs:** 총 근무시간이 NaN으로 표시됨

### Pitfall 5: 초과근무 99 프로세스 — 페이지 수 과다로 라우팅 누락
**What goes wrong:** 20개 페이지를 router.tsx에 등록하다 일부 누락하면 흰 화면
**Why it happens:** sys01은 가장 많은 페이지 수
**How to avoid:** sys01 라우트 등록을 한 블록으로 묶어 체크리스트 방식으로 검증. SUBSYSTEM_MENUS 항목과 라우트 경로 1:1 매핑 확인
**Warning signs:** 사이드바 메뉴 클릭 시 일부 항목만 흰 화면

### Pitfall 6: DataTable queryKey 재조회 누락 (Tree 연동)
**What goes wrong:** Tree에서 부대 선택 시 우측 DataTable이 이전 부대 데이터를 캐시에서 보여줌
**Why it happens:** TanStack Query queryKey에 selectedUnit 포함 안 함
**How to avoid:** `queryKey={['lineage', selectedUnit]}` — selectedUnit이 변경되면 자동 재조회
**Warning signs:** 트리에서 다른 부대 선택해도 우측 데이터 변화 없음

## Code Examples

### MSW Tree 데이터 핸들러 패턴
```typescript
// shared/api/mocks/handlers/sys08-unit-lineage.ts
import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker/locale/ko';

const buildTreeNode = (depth: number, maxDepth: number): TreeNode => ({
  key: faker.string.uuid(),
  title: depth === 0 ? '해군 함대' : depth === 1 ? `${faker.number.int({min:1,max:5}}전단` : `${faker.number.int({min:1,max:10}}}함정`,
  children: depth < maxDepth ? Array.from({ length: faker.number.int({min:2,max:4}) }, () => buildTreeNode(depth+1, maxDepth)) : [],
});

export const sys08Handlers = [
  http.get('/api/sys08/unit-tree', () =>
    HttpResponse.json({ data: buildTreeNode(0, 3) })
  ),
  // ...
];
```

### 나의 근무현황 차트 패턴 (D-05)
```typescript
// @ant-design/charts Column+Line 조합
import { Column } from '@ant-design/charts';

const OtMyStatusPage = () => {
  const config = {
    data: monthlyData,  // [{ month: '1월', hours: 12 }, ...]
    xField: 'month',
    yField: 'hours',
    label: { style: { fill: '#fff' } },
  };
  return (
    <Tabs items={[
      { key: 'annual', label: '연간', children: <Column {...config} /> },
      { key: 'monthly', label: '월간', children: <Column {...config} data={weeklyData} /> },
    ]} />
  );
};
```

### Phase 4~5 Steps 결재 패턴 재사용
```typescript
// InspectionApprovalPage.tsx 패턴 참조
import { Steps } from 'antd';

const APPROVAL_STEPS = ['작성', '결재대기', '승인완료'];
const statusToStep = { draft: 0, pending: 1, approved: 2, rejected: 1 };

<Steps
  current={statusToStep[record.status]}
  status={record.status === 'rejected' ? 'error' : 'process'}
  items={APPROVAL_STEPS.map(title => ({ title }))}
/>
```

## Environment Availability

Step 2.6: SKIPPED (외부 의존성 없음 — 모든 라이브러리 기존 설치, 신규 설치 불필요)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.2 |
| Config file | vite.config.ts (vitest 설정 포함) |
| Quick run command | `cd navy-admin && npx vitest run --reporter=verbose 2>&1 \| tail -20` |
| Full suite command | `cd navy-admin && npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UNIT-02 | Tree 렌더링 + 부대 선택 시 DataTable 갱신 | unit | `vitest run src/pages/sys08*/UnitLineageTreePage` | Wave 0 필요 |
| UNIT-05 | 주요활동 결재 Steps 상태 전환 | unit | `vitest run src/pages/sys08*/UnitActivityApprovalPage` | Wave 0 필요 |
| UNIT-06 | Upload.Dragger beforeUpload Base64 변환 | unit | `vitest run src/pages/sys08*/UnitFlagPage` | Wave 0 필요 |
| OT-01 | 신청서 작성 TimePicker 자동 계산 | unit | `vitest run src/pages/sys01*/OtRequestPage` | Wave 0 필요 |
| OT-05 | 월말결산 마감/마감취소 상태 전환 | unit | `vitest run src/pages/sys01*/OtMonthlyClosingPage` | Wave 0 필요 |
| OT-15 | Calendar 날짜 클릭 Modal 오픈 | unit | `vitest run src/pages/sys01*/OtWorkHoursPage` | Wave 0 필요 |
| OT-16 | 공휴일 Calendar CRUD | unit | `vitest run src/pages/sys01*/OtHolidayPage` | Wave 0 필요 |

### Sampling Rate
- **Per task commit:** `cd navy-admin && npx vitest run --reporter=verbose 2>&1 | tail -20`
- **Per wave merge:** `cd navy-admin && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/pages/sys08-unit-lineage/` 하위 테스트 파일 전체 — UNIT-01~11 커버
- [ ] `src/pages/sys01-overtime/` 하위 테스트 파일 전체 — OT-01~28 커버
- [ ] `src/shared/api/mocks/handlers/sys08-unit-lineage.ts` — MSW 핸들러
- [ ] `src/shared/api/mocks/handlers/sys01-overtime.ts` — MSW 핸들러

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| antd Tree basicDemo | antd Tree treeData + onSelect | antd 4→5 | DataNode 타입 변경, key는 string|number 모두 허용 |
| antd Calendar dateCellRender | antd Calendar cellRender | antd 5.4+ | dateCellRender deprecated, cellRender로 통합 |
| antd Upload beforeUpload return Promise | return false (동기) | antd 5 | 비동기 reject도 동작하나 MVP에서는 동기 false 권장 |

**Deprecated:**
- `dateCellRender` / `monthCellRender`: antd 5.4부터 `cellRender`로 통합. 사용 금지

## Open Questions

1. **sys01/sys08 index.tsx 기존 내용**
   - What we know: 두 파일 모두 존재 (ls 확인)
   - What's unclear: 기존 내용이 스텁인지 일부 구현인지 미확인
   - Recommendation: 플랜 착수 전 두 index.tsx 내용 확인 후 덮어쓰기 여부 결정

2. **SUBSYSTEM_MENUS sys01/sys08 기존 정의 내용**
   - What we know: CONTEXT.md에 "이미 정의됨"으로 명시
   - What's unclear: 메뉴 항목이 요구사항 대메뉴와 정확히 일치하는지 미확인
   - Recommendation: menus.ts 파일 내용 확인 후 누락 메뉴 보완

## Project Constraints (from CLAUDE.md)

- **기술 스택 동결:** React 18 + TypeScript 5 + Vite 5 + Tailwind 3 + Ant Design 5 + ProComponents 2
- **MVP 우선:** 백엔드 없음, MSW Mock API 필수
- **인증:** Mock 인증 사용
- **세션:** exit → 메인, 세션만료 → 로그인
- **7대 화면 구현 규칙 필수 적용:**
  1. req_analysis.txt 컬럼 반드시 표시
  2. 입력값 = CRUD 관리 항목
  3. 검색조건 = 검색 기능 필수
  4. 출력(프린트) = PrintableReport + print.css
  5. 부대(서) 표기 통일
  6. 공통게시판 = Phase 1 lazy import (sysCode)
  7. 관리자 대메뉴 필수 + Phase 1 공통기능 포함
- **에이전트 규칙:** 의사결정 시 Recommended 자동 결정, 사용자 확인 불요
- **Git:** 명시 요청 시만 커밋
- **코드 스타일:** 파일 800줄 이하, 함수 50줄 이하, 불변성 패턴, any 금지

## Sources

### Primary (HIGH confidence)
- 프로젝트 package.json — 실제 설치 버전 직접 확인
- `.planning/phases/06-2/06-CONTEXT.md` — Phase 6 구현 결정 42개 (D-01~D-42)
- `req_analysis.txt` 초과근무관리체계 (행 1~100), 부대계보관리체계 (행 327~388)
- `.planning/REQUIREMENTS.md` UNIT-01~11, OT-01~28
- 기존 코드 디렉토리 구조 확인 (ls 명령어)

### Secondary (MEDIUM confidence)
- antd 5.x 공식 문서 패턴 (학습 데이터 기반, antd 5 stable 주요 API 변경 없음)
- Phase 4~5 CONTEXT.md 패턴 참조 (검증된 기존 패턴)

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — package.json 직접 확인
- Architecture: HIGH — CONTEXT.md 42개 결정 + 기존 코드 패턴
- Pitfalls: MEDIUM — antd Tree/Calendar 학습 데이터 기반, 일부 버전 특이사항 확인 필요

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (antd 5.x stable, 30일)
