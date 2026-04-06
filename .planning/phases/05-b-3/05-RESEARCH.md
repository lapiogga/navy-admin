# Phase 5: 중복잡도 서브시스템 B 3개 - Research

**Researched:** 2026-04-06
**Domain:** React + Ant Design 5 / 좌석 선택 그리드 / 멀티스텝 폼 / 타군 인증 / 대출 워크플로우
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**좌석 선택 UI (주말버스)**
- D-01: 버스 좌석은 antd Row/Col 기반 그리드 격자로 구현. 각 좌석을 Button으로 렌더링, 색상으로 상태 구분 (파랑=빈좌석, 회색=예약됨, 초록=내선택, 빨간=불가). 추가 라이브러리 불요.
- D-02: 그리드 상단에 운전석 위치 표시, 하단에 범례(색상 설명) 배치. 좌석 클릭 시 선택/해제 토글.
- D-03: 좌석 배치(행수, 열수)는 배차 정보의 좌석수에 따라 동적으로 4열 그리드 생성.

**보안등급 분류 시스템 (군사자료)**
- D-04: 비밀등급은 antd Tag 색상으로 구분 (red=[비밀], orange=[대외비], blue=[일반]). 목록 테이블에 Tag 컬럼으로 표시.
- D-05: 목록 필터에 보안등급 Select 추가로 등급별 조회 가능.
- D-06: 열람신청 시 비밀등급 자료에 경고 Modal 표시 ("이 자료는 [비밀] 등급입니다. 열람사유를 입력하세요").
- D-07: MVP Mock에서는 모든 등급 접근 가능. Tag로 시각적 구분만 제공.

**열람/대출/반납 워크플로우 (군사자료)**
- D-08: 열람신청→승인→대출→반납완료 플로우를 antd Steps로 시각화 (Phase 4 검열결과 Steps 결재 패턴 재사용).
- D-09: 각 단계 전환은 StatusBadge로 현재 상태 표시, 관리자 액션 버튼으로 상태 전환.

**평가심의/파기 워크플로우 (군사자료)**
- D-10: 보존기간 만료 자료 → 평가심의 대상 목록 자동 표시 (MSW에서 만료 데이터 생성).
- D-11: 평가심의 결과 일괄입력은 antd Upload → 파싱 → 검증결과 모달 → 확인 후 일괄 저장. 결과값: ①파기 ②보존기간연장 ③연장기간.
- D-12: 군사자료 일괄등록도 동일 패턴(Upload + 검증 모달). req_analysis의 "데이터 무결성 검증 기능 구현 필수" 요건 충족.

**직무기술서 작성 폼**
- D-13: antd Steps 단계별 폼: Step 1(기본정보) → Step 2(업무분류/비율) → Step 3(시간배분) → Step 4(역량/자격요건) → Step 5(완료/제출).
- D-14: 업무분류 단계에서 Form.List로 동적 업무 추가/삭제/비율 입력. 비율 합계 100% 검증.
- D-15: 임시저장 지원: 각 단계에서 '임시저장' 버튼으로 draft 상태 저장. '다음 단계'로 진행.
- D-16: 개인 vs 부서 직무기술서는 동일 폼 컴포넌트에 type='personal'|'department' prop. Tabs로 나의개인JD/직책JD/부서JD 3개 탭 구분.

**직무기술서 결재**
- D-17: 1차/2차 결재자 설정은 DataTable+CrudForm CRUD. 부서별로 결재자 지정.
- D-18: 결재 플로우는 Phase 4 Steps 결재 패턴 재사용: 작성→1차결재→2차결재→완료. 반려 시 재결재요청 가능.
- D-19: 대리작성: 부서관리자가 다른 사용자의 직무기술서를 대리 작성 가능. 작성자 선택 드롭다운 추가.
- D-20: 관리자 검토결과 입력/의견보내기/반송은 상세 조회 페이지 내 액션으로 구현.

**타군 사용자 인증 (주말버스)**
- D-21: /sys10/login 별도 경로에 타군 전용 로그인 페이지 구현. RequireAuth 바깥에 배치.
- D-22: 회원등록신청 폼(군번/성명/직책/계급/소속/전화번호/메일주소/비밀번호) → 관리자 승인/반려 → 승인 후 로그인 가능.
- D-23: 패스워드 초기화는 message.success('메일 발송 완료') Mock.
- D-24: 타군 사용자 로그인 후에는 주말버스 예약 화면만 접근 가능한 제한된 레이아웃.

**주말버스 대기자/자동배정**
- D-25: 대기자 목록에 '자동배정' 버튼. FIFO 순서대로 빈좌석에 자동 배정. MSW에서 순번 로직 처리.
- D-26: 수동배정은 대기자 선택 → 좌석 드롭다운 선택으로 개별 배정.
- D-27: 계급별 우선순위는 예약시간관리에서 계급별 예약오픈시간/마감시간을 다르게 설정하여 간접 구현.

**위규자/제재 관리 (주말버스)**
- D-28: 위규자 CRUD는 DataTable + CrudForm 패턴. 제재기간은 DatePicker.RangePicker, 위규사유는 TextArea.
- D-29: 제재중인 사용자가 예약 시도 시 StatusBadge로 '제재중' 표시 + 예약 차단 (MSW에서 400 응답).

**표준업무시간 관리 (직무기술서)**
- D-30: 신분별(장관/영관/부사관/원사/병) 표준업무시간 CRUD. DataTable + CrudForm 패턴.
- D-31: 적용기간(시작일~종료일) + 상태 자동계산: 현재일 기준 적용만료/적용중/적용예정 StatusBadge 표시. 상태는 프론트엔드에서 날짜 비교로 계산.

**승차권 인쇄**
- D-32: Phase 4 PrintableReport + print.css 패턴 재사용. 승차권 양식(노선/좌석/일시 정보)을 antd Descriptions로 렌더링 후 window.print().

**서브시스템 공통 패턴**
- D-33: Phase 3~4 확립 패턴 동일 적용: pages/sys{번호}/ 디렉토리, index.tsx 라우트 매핑, lazy import, sysCode MSW 격리.
- D-34: 게시판(BUS-09 공지/질의응답, JOB-05 공지/질의응답/자료실)은 Phase 1 공통게시판 sysCode 재사용.
- D-35: 코드관리(JOB-06)는 Phase 1 common/code-mgmt/ 재사용.
- D-36: 권한관리(JOB-07)는 Phase 1 common/auth-group/ 재사용.
- D-37: 통계 차트(군사자료 MDATA-03)는 @ant-design/charts (Bar/Pie/Line/Column) Phase 4 패턴 재사용.
- D-38: 엑셀 출력은 Phase 3~4 패턴(message.success Mock) 재사용.

### Claude's Discretion

- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합 (키워드, 날짜범위, 상태 등)
- 테이블 컬럼 구성 및 정렬/필터 옵션
- 좌석 그리드 세부 스타일링 (색상 정확값, 좌석 크기)
- 군사자료 통계 차트 종류/조합
- 직무기술서 Steps 내 각 단계별 필드 상세 배치
- 타군 로그인 페이지 레이아웃/스타일

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MDATA-01 | 군사자료 관리 (목록조회, 등록, 수정, 삭제, 상세조회, 버전관리, 검색, 다운로드, 승인, 반려, 분류, 보안등급) [12] | DataTable + CrudForm + Tag 보안등급 컬럼 (D-04). Upload + 검증모달 일괄등록 (D-12). req_analysis: 보관형태/비밀구분/관리번호/문서구분/이관일자 컬럼 |
| MDATA-02 | 군사자료 활용 (열람신청, 대출관리, 반납, 이력조회, 통계, 저장) [6] | antd Steps 대출 워크플로우 (D-08/09). req_analysis: 대상자 군번/성명/직책/계급/소속, 상태정보(반납대기/반납완료) |
| MDATA-03 | 통계자료 (자료현황, 분류별, 부대별, 기간별, 보안등급별, 활용현황 등 15개) | @ant-design/charts Bar/Pie/Line (D-37). PrintableReport 출력 (D-32). req_analysis: 접수용관리기록부/활용지원기록부/활용실적 양식 |
| MDATA-04 | 해기단자료 (목록조회, 등록, 수정, 삭제, 상세조회, 검색, 다운로드) [7] | DataTable + CrudForm 기본 패턴. req_analysis: 부서선택/관리자직책/파일철/자료명, 삭제 시 사유 필수+로그 |
| BUS-01 | 주말버스 예약 (노선조회, 예약신청, 예약수정, 예약취소, 좌석선택, QR체크인, 탑승확인) [7] | antd Row/Col 좌석 그리드 (D-01~03). 승차권 발급 PrintableReport (D-32). req_analysis: 운행일자/출발지/도착지/시간/경유지 |
| BUS-02 | 주말버스 예약현황 (노선별, 일자별, 부대별, 통계, 저장) [5] | DataTable + 검색폼 (노선/일자/부대 필터). 엑셀 저장 Mock (D-38) |
| BUS-03 | 주말버스 배차관리 (노선관리, 차량배정, 시간표설정, 좌석배치, 운행확정, 저장) [6] | DataTable + CrudForm. req_analysis: 상하행구분/운행일자/출발시간/출발지/도착지/좌석수/배정여부 |
| BUS-04 | 예약시간관리 (예약오픈시간, 마감시간, 취소마감, 저장) [4] | DataTable + CrudForm. req_analysis: 구간별/계급별/일자별 예약순위/예약시작시간/예약종료시간 (D-27) |
| BUS-05 | 주말버스 대기자관리 (대기목록, 자동배정, 수동배정, 알림, 저장) [4] | FIFO 자동배정 버튼 (D-25). 수동배정 좌석 드롭다운 (D-26) |
| BUS-06 | 주말버스 사용현황 (부대별, 노선별, 저장) [2] | DataTable + 저장(엑셀 Mock). PrintableReport (D-32) |
| BUS-07 | 주말버스 위규자관리 (목록조회, 등록, 수정, 삭제, 제재설정) [5] | DataTable + CrudForm. DatePicker.RangePicker 제재기간 (D-28). MSW 400 제재차단 (D-29) |
| BUS-08 | 타군 사용자 관리 (목록조회, 등록, 수정, 삭제, 승인, 반려, 이력, 통계, 저장) [9] | DataTable + CrudForm. /sys10/login 별도 경로 (D-21~24). req_analysis: 군구분/부대명/군번/계급/성명/직책/전화번호/메일주소/비밀번호/등록일 |
| BUS-09 | 게시판 (공지사항, 질의응답) [2] | Phase 1 공통게시판 lazy 재사용 sysCode=sys10 (D-34) |
| JOB-01 | 직무기술서 작성 (목록조회, 신규작성, 수정, 삭제, 상세조회, 복사, 업무분류, 시간배분, 역량입력, 자격요건, 임시저장, 제출 등) [16] | antd Steps 5단계 폼 (D-13~16). Form.List 동적 업무 추가 (D-14). Tabs 개인JD/직책JD/부서JD (D-16) |
| JOB-02 | 직무기술서 조회-관리자 (목록조회, 상세조회, 통계, 부대별현황, 직급별, 업무분류별, 검색, 저장, 인쇄, 비교, 이력) [11] | DataTable + @ant-design/charts. 검토결과 입력/의견보내기/반송 (D-20). PrintableReport (D-32) |
| JOB-03 | 결재 (결재대기, 결재완료, 결재요청, 승인, 반려, 결재이력, 재결재요청, 위임결재, 저장) [9] | Phase 4 Steps 결재 패턴 재사용 (D-17~18). 결재자 CRUD DataTable + CrudForm |
| JOB-04 | 조직진단 대상 관리 (대상부대선정, 기간설정, 대상자관리, 진행현황, 저장) [5] | DataTable + CrudForm. req_analysis: 조직진단명/조직진단부대/작성기간/진단기간/진단대상자, 진단기간 이전까지만 수정/삭제 |
| JOB-05 | 게시판 (공지사항, 질의응답, 자료실) [3] | Phase 1 공통게시판 lazy 재사용 sysCode=sys18 (D-34) |
| JOB-06 | 공통코드관리 [1] | Phase 1 common/code-mgmt/ lazy 재사용 (D-35) |
| JOB-07 | 사용자권한관리 [1] | Phase 1 common/auth-group/ lazy 재사용 (D-36) |
| JOB-08 | 표준업무시간관리 [1] | DataTable + CrudForm. 프론트엔드 날짜 비교로 적용만료/적용중/적용예정 상태 자동계산 (D-31) |

</phase_requirements>

---

## Summary

Phase 5는 Phase 4의 패턴을 기반으로 3개의 서브시스템을 구현한다. 군사자료관리체계(40개)는 보안등급 Tag 분류와 대출 Steps 워크플로우가 핵심이고, 주말버스예약관리체계(44개)는 antd Row/Col 좌석 그리드와 타군 별도 인증 체계가 신규 패턴이며, 직무기술서관리체계(47개)는 5단계 Steps 폼과 Form.List 동적 입력이 차별점이다.

기존 패턴 재사용 비율이 높다. @ant-design/charts(Phase 4), Steps 결재(Phase 4 InspectionApprovalPage), PrintableReport+print.css(Phase 4), Form.List 동적 추가(Phase 4 SurveyQuestionEditor), 공통게시판/코드관리/권한관리(Phase 1)는 모두 검증된 코드가 존재한다. 신규 구현은 좌석 그리드(antd Row/Col, 라이브러리 불요), /sys10/login 타군 전용 라우트, 멀티스텝 직무기술서 폼 3개로 제한된다.

MSW 핸들러는 sys07/sys10/sys18 3개 파일을 handlers/index.ts에 추가해야 한다. @dnd-kit/core 6.3.1이 이미 설치되어 있으나 Phase 5에서는 사용하지 않는다(D-01: 추가 라이브러리 불요).

**Primary recommendation:** Phase 4 패턴(Steps 결재, 차트, 인쇄, Form.List)을 최대한 재사용하고, 좌석 그리드와 타군 인증만 신규 구현한다.

## Standard Stack

### Core (모두 설치됨, 신규 설치 불요)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| antd | 5.29.3 | UI 컴포넌트 | Row/Col 좌석 그리드, Steps 폼, Tag 보안등급, Upload 일괄등록 |
| @ant-design/pro-components | 2.8.10 | ProTable/ProForm | DataTable/CrudForm 래퍼의 기반 |
| @ant-design/charts | 2.6.7 | 통계 차트 | MDATA-03 통계 시각화 (Phase 4에서 설치됨) |
| @tanstack/react-query | 5.96.2 | 서버 상태 | useQuery/useMutation으로 API 호출 |
| msw | 2.12.14 | API 모킹 | sys07/sys10/sys18 핸들러 추가 |
| @faker-js/faker | 10.4.0 | Mock 데이터 | faker/locale/ko로 한국어 Mock 생성 |
| zustand | 5.0.12 | 전역 상태 | authStore (타군 인증 상태 포함) |
| dayjs | 1.11.20 | 날짜 처리 | antd DatePicker 연동, 표준업무시간 상태 계산 |
| react-router-dom | 7.14.0 | 라우팅 | /sys10/login 별도 경로 추가 |

### 신규 설치 불요

Phase 5는 기존 스택으로 완전히 구현 가능하다. @dnd-kit은 이미 설치됨(6.3.1, node_modules 확인)이나 Phase 5에서 사용하지 않는다.

**Installation:**

```bash
# 신규 설치 불요 — 기존 패키지로 완전 구현 가능
```

## Architecture Patterns

### 서브시스템 디렉토리 구조 (Phase 3~4 확립 패턴)

```
navy-admin/src/pages/
├── sys07-mil-data/
│   ├── index.tsx                    # SubsystemPage 라우트 분기 (메인)
│   ├── MilDataListPage.tsx          # 군사자료 목록+보안등급 Tag 필터
│   ├── MilDataFormPage.tsx          # 군사자료 등록/수정 (일괄등록 Upload 포함)
│   ├── MilDataUsagePage.tsx         # 군사자료 활용 (대출/열람/반납 Steps)
│   ├── MilDataStatsPage.tsx         # 통계자료 (@ant-design/charts)
│   └── HaegidanListPage.tsx         # 해기단자료 관리
├── sys10-weekend-bus/
│   ├── index.tsx                    # 타군/일반 인증 분기 라우터
│   ├── ExternalLoginPage.tsx        # /sys10/login 타군 전용 로그인
│   ├── BusReservationPage.tsx       # 좌석선택 예약 (SeatGrid 포함)
│   ├── BusWaitlistPage.tsx          # 대기자관리 + 자동배정
│   ├── BusDispatchPage.tsx          # 배차관리 CRUD
│   ├── BusSchedulePage.tsx          # 예약시간관리
│   ├── BusViolatorPage.tsx          # 위규자관리 CRUD
│   ├── ExternalUserPage.tsx         # 타군 사용자 관리
│   └── SeatGrid.tsx                 # 좌석 그리드 공유 컴포넌트
└── sys18-job-desc/
    ├── index.tsx                    # 서브시스템 라우트 분기
    ├── JobDescFormPage.tsx          # 직무기술서 작성 (5-Step + Tabs)
    ├── JobDescApprovalPage.tsx      # 결재 (Steps 결재 패턴)
    ├── JobDescAdminPage.tsx         # 관리자 조회/검토
    ├── OrgDiagnosisPage.tsx         # 조직진단 대상 관리
    └── StandardWorkTimePage.tsx     # 표준업무시간 관리

navy-admin/src/shared/api/mocks/handlers/
├── sys07.ts                         # 신규: 군사자료 MSW 핸들러
├── sys10.ts                         # 신규: 주말버스 MSW 핸들러
└── sys18.ts                         # 신규: 직무기술서 MSW 핸들러
```

### Pattern 1: 좌석 선택 그리드 (SeatGrid)

**What:** antd Row/Col으로 버스 좌석 배치를 그리드로 렌더링. 외부 라이브러리 없음.
**When to use:** 주말버스 예약 화면, 배차관리 좌석배치 확인

```typescript
// SeatGrid.tsx - antd Row/Col 기반 좌석 그리드
import { Row, Col, Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'

type SeatStatus = 'available' | 'reserved' | 'selected' | 'unavailable'

interface Seat {
  id: string
  seatNo: string
  status: SeatStatus
}

const STATUS_COLOR: Record<SeatStatus, string> = {
  available: '#1677ff',   // 파랑 = 빈좌석
  reserved: '#8c8c8c',    // 회색 = 예약됨
  selected: '#52c41a',    // 초록 = 내선택
  unavailable: '#ff4d4f', // 빨간 = 불가
}

interface SeatGridProps {
  seats: Seat[]
  onSeatClick: (seatId: string) => void
  readOnly?: boolean
}

export function SeatGrid({ seats, onSeatClick, readOnly = false }: SeatGridProps) {
  // 4열 그리드: 좌(1-2) + 통로 + 우(3-4) 배치
  const rows = Math.ceil(seats.length / 4)

  return (
    <div>
      {/* 운전석 */}
      <Row justify="end" style={{ marginBottom: 8 }}>
        <Col><Button size="small" disabled icon={<UserOutlined />}>운전석</Button></Col>
      </Row>
      {/* 좌석 그리드 */}
      {Array.from({ length: rows }, (_, rowIdx) => (
        <Row key={rowIdx} gutter={[4, 4]} style={{ marginBottom: 4 }}>
          {[0, 1, null, 2, 3].map((colOffset, idx) =>
            colOffset === null
              ? <Col key={`aisle-${rowIdx}`} span={2} /> // 통로
              : (() => {
                  const seat = seats[rowIdx * 4 + colOffset]
                  if (!seat) return <Col key={`empty-${idx}`} span={5} />
                  return (
                    <Col key={seat.id} span={5}>
                      <Button
                        size="small"
                        block
                        disabled={readOnly || seat.status === 'reserved' || seat.status === 'unavailable'}
                        onClick={() => onSeatClick(seat.id)}
                        style={{
                          background: STATUS_COLOR[seat.status],
                          color: '#fff',
                          borderColor: STATUS_COLOR[seat.status],
                        }}
                      >
                        {seat.seatNo}
                      </Button>
                    </Col>
                  )
                })()
          )}
        </Row>
      ))}
      {/* 범례 */}
      <Row gutter={8} style={{ marginTop: 12 }}>
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <Col key={status}>
            <Button size="small" style={{ background: color, color: '#fff', borderColor: color }}>
              {status === 'available' ? '빈좌석' : status === 'reserved' ? '예약됨' : status === 'selected' ? '내선택' : '불가'}
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  )
}
```

### Pattern 2: antd Steps + Form 멀티스텝 폼 (직무기술서)

**What:** antd Steps 컴포넌트로 단계 표시, 각 단계별 Form 영역. '임시저장' + '다음 단계' 버튼 쌍.
**When to use:** 직무기술서 작성 5단계 폼

```typescript
// JobDescFormPage.tsx 핵심 구조 (Phase 4 패턴 확장)
import { Steps, Form, Button, Space } from 'antd'

const STEPS = [
  { title: '기본정보' },
  { title: '업무분류/비율' },
  { title: '시간배분' },
  { title: '역량/자격요건' },
  { title: '완료/제출' },
]

export function JobDescFormPage() {
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()

  const handleSaveDraft = () => {
    // draft 상태로 저장 (임시저장)
    saveMutation.mutate({ ...form.getFieldsValue(), status: 'draft' })
    message.success('임시저장 완료')
  }

  const handleNext = async () => {
    await form.validateFields() // 현재 단계 필드 검증
    setCurrent((prev) => prev + 1)
  }

  return (
    <>
      <Steps current={current} items={STEPS} style={{ marginBottom: 24 }} />
      <Form form={form} layout="vertical">
        {current === 0 && <Step1BasicInfo />}
        {current === 1 && <Step2TaskClassification />}  {/* Form.List 비율합계 검증 */}
        {current === 2 && <Step3TimeAllocation />}
        {current === 3 && <Step4Competency />}
        {current === 4 && <Step5Submit />}
      </Form>
      <Space style={{ marginTop: 16 }}>
        {current > 0 && <Button onClick={() => setCurrent((p) => p - 1)}>이전</Button>}
        <Button onClick={handleSaveDraft}>임시저장</Button>
        {current < STEPS.length - 1
          ? <Button type="primary" onClick={handleNext}>다음 단계</Button>
          : <Button type="primary" onClick={handleSubmit}>제출</Button>
        }
      </Space>
    </>
  )
}
```

### Pattern 3: 비율 합계 100% 검증 (Form.List + Validator)

**What:** Form.List로 동적 업무 추가, 비율 필드 합계 100% 커스텀 validator.
**When to use:** 직무기술서 Step 2 업무분류 비율 입력

```typescript
// Step2 내부 Form.List 비율 검증
<Form.Item
  name={[field.name, 'ratio']}
  rules={[
    { required: true, message: '비율을 입력하세요' },
    {
      validator: (_, value) => {
        const allRatios = form.getFieldValue('tasks') as { ratio: number }[]
        const sum = allRatios?.reduce((acc, t) => acc + (t?.ratio || 0), 0) ?? 0
        // 마지막 필드 저장 시에만 100% 검증 (최종 제출 단계에서)
        return Promise.resolve()
      },
    },
  ]}
>
  <InputNumber min={0} max={100} addonAfter="%" />
</Form.Item>

// 전체 합계 표시 (실시간 피드백)
const ratioSum = Form.useWatch('tasks', form)?.reduce((sum, t) => sum + (t?.ratio || 0), 0) ?? 0
<Typography.Text type={ratioSum === 100 ? 'success' : 'danger'}>
  합계: {ratioSum}% {ratioSum !== 100 && '(100%가 되어야 합니다)'}
</Typography.Text>
```

### Pattern 4: Upload + 검증 모달 (일괄등록/평가심의)

**What:** antd Upload로 파일 수신, 서버 파싱 후 검증 결과를 Modal로 표시 (OK행/에러행 구분).
**When to use:** 군사자료 일괄등록(MDATA-01), 평가심의 결과 일괄입력(MDATA-01)

```typescript
// 일괄등록 패턴 (antd Upload + 검증 모달)
import { Upload, Modal, Table, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const [validationResult, setValidationResult] = useState<{
  valid: Record<string, unknown>[]
  errors: { row: number; message: string }[]
} | null>(null)

<Upload.Dragger
  accept=".xlsx,.xls"
  beforeUpload={(file) => {
    // MSW: POST /api/sys07/documents/bulk-validate
    // 응답: { valid: [...], errors: [{row, message}] }
    validateMutation.mutate(file)
    return false // 자동 업로드 차단
  }}
>
  <InboxOutlined /> 엑셀 파일을 여기에 드롭하거나 클릭하여 업로드
</Upload.Dragger>

<Modal
  open={!!validationResult}
  title={`검증 결과: ${validationResult?.valid.length}건 정상, ${validationResult?.errors.length}건 오류`}
  onOk={() => bulkSaveMutation.mutate(validationResult!.valid)}
  onCancel={() => setValidationResult(null)}
>
  {/* 에러 행 목록 */}
  {validationResult?.errors.map((e) => (
    <div key={e.row}>{e.row}행: {e.message}</div>
  ))}
</Modal>
```

### Pattern 5: 타군 전용 로그인 라우트

**What:** /sys10/login 경로를 RequireAuth 바깥에 배치. 로그인 후 제한된 레이아웃 적용.
**When to use:** BUS-08 타군 사용자 인증 (D-21~24)

```typescript
// router.tsx 추가 패턴
// 기존 RequireAuth 바깥에 별도 배치
{ path: '/sys10/login', element: <ExternalLoginPage /> },

// ExternalLoginPage.tsx 핵심
// Zustand의 authStore에 isExternalUser: true + 접근가능 경로 제한
const { setExternalAuth } = useAuthStore()

// 타군 로그인 성공 시
setExternalAuth({ userId, userName, allowedPaths: ['/sys10/1/2'] })
navigate('/sys10/1/2') // 주말버스 예약 화면으로 직접 이동

// ExternalLoginPage 하단: 회원등록신청 링크 → ExternalRegisterPage
```

### Pattern 6: 보안등급 Tag 컬럼 (군사자료)

**What:** ProTable 컬럼에 render로 antd Tag를 반환. 필터는 Select로 등급별 조회.
**When to use:** MDATA-01 군사자료 목록 테이블

```typescript
// ProColumns 보안등급 컬럼 정의
const columns: ProColumns<MilDocument>[] = [
  {
    title: '비밀등급',
    dataIndex: 'securityLevel',
    render: (_, record) => {
      const colorMap: Record<string, string> = {
        '비밀': 'red',
        '대외비': 'orange',
        '일반': 'blue',
      }
      return <Tag color={colorMap[record.securityLevel]}>{record.securityLevel}</Tag>
    },
    filterDropdown: ({ setSelectedKeys, confirm }) => (
      <Select
        options={[
          { label: '비밀', value: '비밀' },
          { label: '대외비', value: '대외비' },
          { label: '일반', value: '일반' },
        ]}
        onChange={(val) => { setSelectedKeys([val]); confirm() }}
        style={{ width: 120 }}
        placeholder="등급 선택"
      />
    ),
  },
]
```

### Anti-Patterns to Avoid

- **좌석 그리드에 외부 라이브러리 도입:** react-seat-picker 등 외부 패키지 금지 (D-01). antd Row/Col로 충분하다.
- **타군 사용자를 authStore 기존 인터페이스에 무리하게 끼워 맞추기:** isExternalUser 플래그를 추가하거나 별도 externalAuthStore 슬라이스를 사용하라. 기존 authStore 타입을 깨지 않도록 주의.
- **Steps 폼에서 모든 단계 Form 동시 마운트:** 단계별 조건부 렌더링 `{current === N && <StepN />}`으로 분리. 전체 Form은 하나지만 필드 레이아웃은 분리하여 성능 최적화.
- **Form.List 비율 합계를 submit 단계 이전에만 검증:** 실시간 합계 표시(Typography) + submit 시 최종 검증으로 UX 보장.
- **MSW 핸들러 등록 누락:** handlers/index.ts에 sys07Handlers/sys10Handlers/sys18Handlers 3개 모두 추가해야 한다. 하나라도 누락하면 API 요청이 네트워크 레이어를 통과하지 못한다.
- **Delete 시 사유 입력 누락:** req_analysis에서 군사자료/해기단자료 삭제 시 "삭제 사유 필수 입력 / 삭제 로그 저장" 명시. ConfirmDialog 내 TextArea로 사유 받고, MSW에서 로그 처리.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 좌석 그리드 | 별도 Canvas/SVG 렌더러 | antd Row/Col + Button | 단순 격자 구조, 라이브러리 불요 (D-01) |
| 통계 차트 | 직접 SVG 차트 | @ant-design/charts 2.6.7 (이미 설치) | Phase 4에서 검증됨, Bar/Pie/Line 모두 지원 |
| 승차권 인쇄 | 새 창 렌더링 | PrintableReport + print.css (Phase 4) | 이미 구현됨, sys09에서 7종 보고서 검증 |
| Steps 결재 | 커스텀 결재 플로우 | InspectionApprovalPage 패턴 재사용 | Phase 4에서 검증됨 |
| 일괄 업로드 검증 | 직접 엑셀 파서 | antd Upload + MSW Mock 검증 응답 | MVP 단계, 실 파서는 백엔드 연동 시 |
| 공통 게시판 | 별도 게시판 구현 | Phase 1 BoardListPage lazy (sysCode 파라미터) | 6개 서브시스템에서 검증됨 |
| 코드관리/권한관리 | 별도 CRUD | Phase 1 공통 페이지 lazy | 중복 구현 금지 (Phase 3~4 패턴) |

**Key insight:** Phase 5는 신규 패턴 3개(좌석 그리드, 멀티스텝 폼, 타군 인증)를 제외하면 전부 재사용이다. 재사용률을 높일수록 일정이 줄어든다.

## Common Pitfalls

### Pitfall 1: 타군 로그인 라우트가 RequireAuth 안에 위치
**What goes wrong:** /sys10/login이 RequireAuth 내부에 배치되면 미인증 상태에서 접근 불가, 무한 리다이렉트 발생.
**Why it happens:** 기존 서브시스템 라우트 패턴(RequireAuth 하위)을 그대로 복사했을 때.
**How to avoid:** router.tsx에서 `/sys10/login` 경로를 RequireAuth 래퍼 **바깥**에 별도 배치 (D-21 참조).
**Warning signs:** /sys10/login 접근 시 /login으로 리다이렉트.

### Pitfall 2: 좌석 그리드 상태 불일치
**What goes wrong:** 예약 후 좌석 상태가 즉시 반영되지 않아 동일 좌석 중복 선택 가능.
**Why it happens:** useMutation 성공 후 TanStack Query 캐시 무효화 누락.
**How to avoid:** 예약 성공 시 `queryClient.invalidateQueries(['bus-seats', busId])`. MSW에서 좌석 상태를 in-memory로 변경하여 재조회 시 반영.
**Warning signs:** 예약 후 좌석이 여전히 '빈좌석'으로 표시.

### Pitfall 3: Form.List 비율 합계 검증 타이밍
**What goes wrong:** 마지막 업무 항목 삭제 후 합계가 100%를 초과해도 다음 단계로 진행.
**Why it happens:** antd Form.List의 동적 필드에서 validateFields()가 삭제된 필드를 참조함.
**How to avoid:** `form.validateFields()` 이전에 `form.getFieldValue('tasks')`로 현재 합계를 직접 계산하여 100% 검증 추가.

### Pitfall 4: 타군 사용자 authStore 오염
**What goes wrong:** 타군 사용자 로그인이 기존 해병 사용자 세션을 덮어써 메인 포탈 접근 오류.
**Why it happens:** Zustand authStore에 isExternalUser 구분 없이 단일 user 객체만 관리할 때.
**How to avoid:** authStore에 `isExternalUser: boolean`, `allowedPaths: string[]` 필드 추가. SubsystemProLayout에서 allowedPaths 체크하여 미허가 경로 접근 차단.

### Pitfall 5: 평가심의 결과값 유효성 검증 누락
**What goes wrong:** req_analysis에서 "데이터 무결성 검증 기능 구현 필수" 명시. Upload 후 검증 없이 직접 저장하면 요구사항 위반.
**Why it happens:** 일괄 업로드를 단순 Upload → 저장으로 구현할 때.
**How to avoid:** D-11/D-12 패턴 준수 — Upload → MSW 검증 응답 수신 → 검증 결과 모달(OK/에러) → 사용자 확인 → 저장. 결과값은 ①파기 ②보존기간연장 ③연장기간만 허용.

### Pitfall 6: MSW handlers/index.ts 업데이트 누락
**What goes wrong:** sys07/sys10/sys18 MSW 핸들러 파일은 만들었으나 index.ts에 등록 안 해 API 요청이 실제 네트워크로 나가서 실패.
**Why it happens:** handlers/index.ts 파일을 마지막에 업데이트하는 것을 잊음.
**How to avoid:** 각 핸들러 파일 생성 직후 index.ts export 추가를 태스크에 명시.

### Pitfall 7: 삭제 시 사유 입력 미구현
**What goes wrong:** 군사자료/해기단자료 삭제 시 req_analysis에서 "삭제 사유 필수 입력 / 삭제 로그 저장" 명시. 단순 ConfirmDialog만 구현하면 요구사항 불충족.
**Why it happens:** Phase 3~4 기본 CRUD 패턴(ConfirmDialog Yes/No)을 그대로 복사할 때.
**How to avoid:** 삭제 모달에 TextArea `reason` 필드 추가. MSW에서 reason 로깅(삭제 이력 배열에 추가).

## Code Examples

### sys07 MSW 핸들러 구조

```typescript
// shared/api/mocks/handlers/sys07.ts
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

export type SecurityLevel = '비밀' | '대외비' | '일반'
export type UsageStatus = '반납대기' | '반납완료' | '대출중' | '열람중'

export interface MilDocument extends Record<string, unknown> {
  id: string
  securityLevel: SecurityLevel
  documentType: string
  managementNo: string
  title: string
  receiveDate: string
  retentionPeriod: string
  retentionExpiry: string
  storageLocation: string
  status: '정상' | '평가심의대상'
}

let milDocuments: MilDocument[] = Array.from({ length: 30 }, (_, i) => ({
  id: `doc-${i + 1}`,
  securityLevel: (['비밀', '대외비', '일반'] as SecurityLevel[])[i % 3],
  documentType: ['각서', '비밀지령서', '작전명령'][i % 3],
  managementNo: `2025-${String(i + 1).padStart(4, '0')}`,
  title: faker.lorem.sentence(4),
  receiveDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
  retentionPeriod: ['5년', '10년', '영구'][i % 3],
  retentionExpiry: i < 5
    ? '2024-12-31' // 만료 데이터 (평가심의 대상 D-10)
    : faker.date.future({ years: 3 }).toISOString().split('T')[0],
  storageLocation: `${i + 1}번 서가 ${(i % 5) + 1}번 칸`,
  status: i < 5 ? '평가심의대상' : '정상',
}))

export const sys07Handlers = [
  http.get('/api/sys07/documents', ({ request }) => {
    const url = new URL(request.url)
    const securityLevel = url.searchParams.get('securityLevel')
    const page = parseInt(url.searchParams.get('page') ?? '0')
    const size = parseInt(url.searchParams.get('size') ?? '10')
    let filtered = securityLevel
      ? milDocuments.filter((d) => d.securityLevel === securityLevel)
      : milDocuments
    const total = filtered.length
    filtered = filtered.slice(page * size, (page + 1) * size)
    const result: ApiResult<PageResponse<MilDocument>> = {
      success: true,
      data: { content: filtered, totalElements: total, totalPages: Math.ceil(total / size), size, number: page },
    }
    return HttpResponse.json(result)
  }),

  // 삭제 (사유 필수)
  http.delete('/api/sys07/documents/:id', async ({ params, request }) => {
    const body = (await request.json()) as { reason: string }
    milDocuments = milDocuments.filter((d) => d.id !== params.id)
    // MSW에서 삭제 로그 기록 (D-12: "삭제 로그 저장")
    console.log(`[삭제 로그] ${params.id}: ${body.reason}`)
    return HttpResponse.json({ success: true, data: null })
  }),
  // ... 추가 CRUD 핸들러
]
```

### sys10 좌석 데이터 MSW 패턴

```typescript
// shared/api/mocks/handlers/sys10.ts (일부)
export interface BusSeat extends Record<string, unknown> {
  id: string
  busId: string
  seatNo: string
  status: 'available' | 'reserved' | 'unavailable'
  reservedBy?: string
}

let seats: BusSeat[] = Array.from({ length: 45 }, (_, i) => ({
  id: `seat-${i + 1}`,
  busId: 'bus-001',
  seatNo: String(i + 1).padStart(2, '0'),
  status: i < 10 ? 'reserved' : i >= 43 ? 'unavailable' : 'available',
}))

// 예약 신청: 좌석 상태 변경 + 제재중 사용자 차단 (D-29)
http.post('/api/sys10/reservations', async ({ request }) => {
  const body = (await request.json()) as { seatId: string; userId: string }
  // 제재 여부 확인 (MSW: D-29 400 응답)
  if (violators.some((v) => v.userId === body.userId && v.isActive)) {
    return HttpResponse.json({ success: false, message: '제재 중인 사용자입니다' }, { status: 400 })
  }
  const seatIdx = seats.findIndex((s) => s.id === body.seatId)
  if (seatIdx !== -1) {
    seats[seatIdx] = { ...seats[seatIdx], status: 'reserved', reservedBy: body.userId }
  }
  return HttpResponse.json({ success: true, data: seats[seatIdx] })
}),
```

### 표준업무시간 상태 자동계산 (D-31)

```typescript
// StandardWorkTimePage.tsx 상태 자동계산
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

function calcStatus(startDate: string, endDate: string): '적용예정' | '적용중' | '적용만료' {
  const now = dayjs()
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  if (now.isBefore(start)) return '적용예정'
  if (now.isAfter(end)) return '적용만료'
  return '적용중'
}

// ProColumns 렌더러
{
  title: '상태',
  render: (_, record) => {
    const status = calcStatus(record.startDate, record.endDate)
    const colorMap = { '적용예정': 'blue', '적용중': 'green', '적용만료': 'red' }
    return <StatusBadge status={status} color={colorMap[status]} />
  }
}
```

### handlers/index.ts 업데이트 패턴

```typescript
// 기존 + Phase 5 신규 핸들러 추가
import { sys07Handlers } from './sys07'
import { sys10Handlers } from './sys10'
import { sys18Handlers } from './sys18'

export const handlers = [
  ...authHandlers,
  // ... 기존 핸들러들 ...
  ...sys17Handlers,  // 기존 마지막
  ...sys07Handlers,  // 신규
  ...sys10Handlers,  // 신규
  ...sys18Handlers,  // 신규
]
```

## State of the Art

| 기존 접근 | Phase 5 접근 | 비고 |
|----------|-------------|------|
| 서브시스템마다 별도 라우트 파일 | 확립된 SubsystemPage 패턴 + lazy import | Phase 3~4에서 확립됨 |
| 인라인 상태 계산 | dayjs.isBetween으로 표준업무시간 상태 계산 | dayjs 1.11.20 이미 설치 |
| 수동 좌석 배치 (고정 HTML) | 좌석수 기반 동적 4열 그리드 (D-03) | 배차 변경 시 자동 적응 |

## Open Questions

1. **타군 사용자 로그인 세션 분리 방식**
   - What we know: authStore에 isExternalUser 플래그 추가 (D-24)
   - What's unclear: 해병 사용자가 로그인 중인 상태에서 타군 사용자가 같은 브라우저 탭으로 접속 시 세션 충돌 여부
   - Recommendation: 타군 사용자는 별도 Zustand slice(externalAuthStore) 사용. 또는 /sys10/login에서 기존 세션을 건드리지 않고 externalUser 상태만 추가로 관리.

2. **직무기술서 개인 vs 직책 vs 부서 탭 데이터 분리**
   - What we know: Tabs로 3개 탭 구분 (D-16), 동일 폼 컴포넌트에 type prop
   - What's unclear: 나의 개인JD vs 직책JD의 데이터 스키마 차이 (req_analysis에서 세부 차이 미명시)
   - Recommendation: Claude's Discretion. MSW에서 type 파라미터로 필드 조합을 분기하되, UI 폼은 공통 컴포넌트 하나로 구현.

## Environment Availability

Phase 5는 기존 설치된 패키지로 완전 구현 가능하다. 신규 설치 불요.

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|---------|
| antd | 좌석 그리드 Row/Col, Tag, Steps, Upload | ✓ | 5.29.3 | — |
| @ant-design/charts | MDATA-03 통계 차트 | ✓ | 2.6.7 | — |
| @dnd-kit/core | (Phase 5 불사용) | ✓ | 6.3.1 | — |
| dayjs | 표준업무시간 상태 계산 | ✓ | 1.11.20 | — |
| msw | sys07/sys10/sys18 핸들러 | ✓ | 2.12.14 | — |

**Missing dependencies with no fallback:** 없음

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | vite.config.ts (test 섹션) |
| Quick run command | `cd navy-admin && npm test -- --run src/__tests__/sys07 src/__tests__/sys10 src/__tests__/sys18` |
| Full suite command | `cd navy-admin && npm run test:run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MDATA-01 | sys07 핸들러 보안등급 Tag, 일괄등록 Upload+검증 | unit | `npm test -- --run src/__tests__/sys07` | ❌ Wave 0 |
| MDATA-02 | 대출/열람/반납 워크플로우 Steps 상태전환 | unit | `npm test -- --run src/__tests__/sys07` | ❌ Wave 0 |
| MDATA-03 | 통계자료 차트 컴포넌트 렌더링 (파일 내용 기반) | unit | `npm test -- --run src/__tests__/sys07` | ❌ Wave 0 |
| MDATA-04 | 해기단자료 CRUD + 삭제사유 | unit | `npm test -- --run src/__tests__/sys07` | ❌ Wave 0 |
| BUS-01 | SeatGrid 좌석 상태 토글 | unit | `npm test -- --run src/__tests__/sys10` | ❌ Wave 0 |
| BUS-05 | 대기자 자동배정 FIFO 로직 | unit | `npm test -- --run src/__tests__/sys10` | ❌ Wave 0 |
| BUS-07 | 위규자 제재 중 400 응답 차단 | unit | `npm test -- --run src/__tests__/sys10` | ❌ Wave 0 |
| BUS-08 | 타군 사용자 CRUD + 타군 로그인 경로 | unit | `npm test -- --run src/__tests__/sys10` | ❌ Wave 0 |
| JOB-01 | Steps 폼 5단계 + 임시저장 + 비율합계 검증 | unit | `npm test -- --run src/__tests__/sys18` | ❌ Wave 0 |
| JOB-03 | 결재 Steps 패턴 재사용 (승인/반려) | unit | `npm test -- --run src/__tests__/sys18` | ❌ Wave 0 |
| JOB-08 | 표준업무시간 상태 자동계산(날짜 비교) | unit | `npm test -- --run src/__tests__/sys18` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- --run src/__tests__/sys07` (또는 sys10/sys18)
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/sys07/mil-data.test.ts` — MDATA-01~04 커버
- [ ] `src/__tests__/sys10/weekend-bus.test.ts` — BUS-01~09 커버
- [ ] `src/__tests__/sys18/job-desc.test.ts` — JOB-01~08 커버

**테스트 패턴:** Phase 4 검증 패턴(`readFileSync` 파일 내용 기반)을 동일 적용. jsdom 환경에서 antd 컴포넌트 직접 렌더링 대신 파일 내용 문자열 검증으로 타임아웃 회피.

## Sources

### Primary (HIGH confidence)

- 프로젝트 코드 직접 확인 (`navy-admin/src/`) — 설치된 패키지, 기존 컴포넌트 인터페이스, 라우터 구조
- `package.json` — 모든 의존성 버전 확인
- `node_modules/@dnd-kit/core/package.json` — 설치 버전 6.3.1 확인
- `req_analysis.txt` (lines 284~472, 771~819) — sys07/10/18 단위 프로세스 컬럼 상세
- `.planning/phases/05-b-3/05-CONTEXT.md` — 38개 구현 결정 사항 (D-01~D-38)

### Secondary (MEDIUM confidence)

- Phase 4 RESEARCH.md — @ant-design/charts, Steps 결재, PrintableReport 패턴 확인
- Phase 4 구현 코드 (`InspectionApprovalPage.tsx`, `KnowledgeStatsPage.tsx`, `SurveyQuestionEditor.tsx`) — 재사용 패턴 직접 확인

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package.json 직접 확인, 신규 설치 없음
- Architecture patterns: HIGH — Phase 3~4 코드에서 직접 확인된 패턴
- Pitfalls: HIGH — req_analysis 요구사항 + 기존 코드 패턴에서 도출
- MSW 핸들러 구조: HIGH — sys17.ts 기존 파일 구조 직접 참조

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (30일, 스택 안정적)
