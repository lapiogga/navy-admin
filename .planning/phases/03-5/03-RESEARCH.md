# Phase 3: 저복잡도 서브시스템 5개 - Research

**Researched:** 2026-04-05
**Domain:** React + Ant Design ProComponents 서브시스템 구현, MSW Mock 패턴 확장
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 게시판(CERT-04, SUGST-03, RSRC-04, ROOM-06)은 Phase 1의 `common/board/` 페이지를 라우트 매핑으로 재사용. `sysCode` 파라미터로 서브시스템별 데이터 격리.
- **D-02:** 코드관리(CERT-05, ROOM-07)는 Phase 1의 `common/code-mgmt/` 페이지를 동일 방식으로 재사용.
- **D-03:** 권한관리(CERT-06, RSRC-06, SUGST-05)는 Phase 1의 `common/auth-group/` 페이지를 재사용.
- **D-04:** MSW 핸들러는 `sysCode` 쿼리 파라미터 또는 URL 프리픽스로 서브시스템별 데이터 필터링.
- **D-05:** 인증서(CERT-02)와 회의실(ROOM-03)의 승인/반려는 간단한 상태변경 패턴(pending→approved/rejected). Phase 1 결재선 연동 불필요.
- **D-06:** 상태 표시는 Phase 0의 `StatusBadge` 컴포넌트 활용 (pending=processing, approved=success, rejected=error).
- **D-07:** 승인/반려 액션은 DataTable 행의 액션 버튼으로 구현 (antd Popconfirm 확인 후 상태 변경).
- **D-08:** 나의제언(SUGST-01)과 연구자료(RSRC-01) 메인화면은 antd Card + Statistic 조합으로 현황 카드 + 최신 5건 목록.
- **D-09:** 메인화면 상단에 현황 통계 (antd Row/Col + Statistic), 하단에 최신 목록 + "전체보기" 링크.
- **D-10:** 회의실 시간대 설정(ROOM-04)은 antd TimePicker.RangePicker + 요일별 운영시간 Table.
- **D-11:** 장비관리(ROOM-04)는 DataTable + CrudForm Modal 패턴으로 CRUD.
- **D-12:** 사진관리(ROOM-04)는 antd Upload 컴포넌트(이미지 미리보기 모드). 실제 업로드는 MSW Mock.
- **D-13:** 다운로드/프린트 기능은 Mock에서 `antd message.success('다운로드 시작')` 알림으로 처리. 실제 파일 다운로드는 백엔드 연동 시 구현.
- **D-14:** 즐겨찾기(AREG-01)는 localStorage 기반 클라이언트 측 구현.
- **D-15:** 각 서브시스템 라우트는 `pages/sys{번호}/` 디렉토리 내에 기능별 페이지 파일 생성. placeholder `index.tsx`는 메인화면이 있는 경우 대시보드로, 없는 경우 첫 번째 메뉴 리다이렉트로 교체.
- **D-16:** 공통 기능(게시판/코드관리/권한) 라우트는 서브시스템 내 중첩 라우트로 Phase 1 페이지 컴포넌트를 렌더링.
- **D-17:** 추천/신고(SUGST-02)는 독립 API 호출 + 카운트 표시. 비공개 처리는 관리자만 가능.
- **D-18:** 관리자 답변(SUGST-04)은 제언 상세 페이지 내 하단 답변 영역으로 구현 (별도 페이지 아님).

### Claude's Discretion

- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 한국어 시드
- 검색 필터 조건 조합 (키워드, 날짜범위, 상태 등)
- 테이블 컬럼 구성 및 정렬/필터 옵션
- 상세 페이지 레이아웃 (Descriptions vs Card vs Tabs)
- 연구자료 통계 차트 종류 (antd 기본 또는 간단한 Statistic)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CERT-01 | 인증서 신청 (신청서작성, 수정, 삭제) [3] | DataTable + CrudForm Modal 패턴으로 CRUD 구현 |
| CERT-02 | 인증서 승인/관리 (승인대기조회, 승인, 반려, 상태관리) [4] | StatusBadge + Popconfirm 액션 버튼 패턴 (D-05~D-07) |
| CERT-03 | 인증서 등록대장 (목록조회, 상세조회, 저장) [3] | DataTable + DetailModal 패턴 |
| CERT-04 | 게시판 (공지사항, 질의응답) [2] | Phase 1 `common/board/` 라우트 재사용 (D-01) |
| CERT-05 | 공통코드관리 [1] | Phase 1 `common/code-mgmt/` 라우트 재사용 (D-02) |
| CERT-06 | 사용자별권한등록 [1] | Phase 1 `common/auth-group/` 라우트 재사용 (D-03) |
| AREG-01 | 현행규정 조회 (목록조회, 상세조회, 검색, 다운로드, 프린트, 즐겨찾기) [6] | DataTable + DetailModal. 즐겨찾기는 localStorage (D-14). 다운로드는 Mock 알림 (D-13) |
| AREG-02 | 예규 - 해군본부 (목록조회, 상세조회, 검색, 다운로드) [4] | DataTable + SearchForm + DetailModal |
| AREG-03 | 예규 - 예하부대 [1] | AREG-02와 동일 패턴, 다른 카테고리 |
| AREG-04 | 지시문서 (목록조회, 상세조회, 검색, 다운로드) [4] | DataTable + SearchForm + DetailModal |
| SUGST-01 | 메인화면 (제언현황, 최신제언) [2] | antd Card + Statistic + 최신 5건 목록 (D-08, D-09) |
| SUGST-02 | 제언확인 (목록조회, 상세조회, 제언작성, 수정, 삭제, 답변, 비공개, 추천, 신고, 검색, 저장) [11] | DataTable + 상세 페이지 내 답변 영역 + 추천/신고 독립 API (D-17, D-18) |
| SUGST-03 | 공지사항 [1] | Phase 1 `common/board/` 라우트 재사용 (D-01) |
| SUGST-04 | 관리자 (제언관리) [1] | 제언 목록 + 비공개 처리 + 답변 관리 |
| SUGST-05 | 사용자별권한등록 [1] | Phase 1 `common/auth-group/` 라우트 재사용 (D-03) |
| RSRC-01 | 메인화면 (최신자료, 인기자료) [2] | antd Card + Statistic + 최신 5건 목록 (D-08, D-09) |
| RSRC-02 | 연구자료 (목록조회, 상세조회, 등록, 수정, 삭제, 다운로드, 검색, 저장) [8] | DataTable + CrudForm + 다운로드 Mock 알림 (D-13) |
| RSRC-03 | 관리자 (자료관리, 카테고리관리, 통계, 사용자관리, 삭제관리, 권한관리) [6] | Tabs 구조로 각 기능 분리. 통계는 antd Statistic |
| RSRC-04 | 공지사항 [1] | Phase 1 `common/board/` 라우트 재사용 (D-01) |
| RSRC-05 | 자료실 [1] | DataTable + 다운로드 Mock 알림 |
| RSRC-06 | 사용자별권한등록 [1] | Phase 1 `common/auth-group/` 라우트 재사용 (D-03) |
| ROOM-01 | 회의예약신청 [1] | CrudForm 기반 예약 신청 폼 (회의실 선택 + 날짜/시간 + 목적) |
| ROOM-02 | 내예약확인 (목록조회, 수정, 삭제, 상세조회) [4] | DataTable + StatusBadge + CrudForm Modal |
| ROOM-03 | 회의예약관리 (목록조회, 승인, 반려, 상세조회) [4] | DataTable + Popconfirm 승인/반려 (D-05~D-07) |
| ROOM-04 | 회의실 관리 (목록조회, 등록, 수정, 삭제, 상세조회, 시간대설정, 장비관리, 사진관리) [8] | Tabs 구조. 시간대: TimePicker.RangePicker (D-10). 장비: DataTable+CrudForm (D-11). 사진: Upload (D-12) |
| ROOM-05 | 회의현황 [1] | DataTable 또는 antd Calendar 기반 현황 표시 |
| ROOM-06 | 공지사항 [1] | Phase 1 `common/board/` 라우트 재사용 (D-01) |
| ROOM-07 | 공통코드관리 [1] | Phase 1 `common/code-mgmt/` 라우트 재사용 (D-02) |

</phase_requirements>

---

## Summary

Phase 3는 5개 저복잡도 서브시스템(85개 프로세스)을 구현하는 Phase다. 핵심 전략은 Phase 0/1에서 확립된 공통 컴포넌트(`DataTable`, `CrudForm`, `StatusBadge`, `ConfirmDialog`, `DetailModal`, `SearchForm`)와 공통 기능 페이지(`common/board/`, `common/code-mgmt/`, `common/auth-group/`)를 최대한 재사용하여 개발 속도를 극대화하는 것이다.

코드베이스 분석 결과, 각 서브시스템 페이지 디렉토리(`sys04-certificate`, `sys05-admin-rules`, `sys11-research`, `sys14-suggestion`, `sys16-meeting-room`)에 현재 placeholder `SubsystemPage`만 있으며, 라우터는 이미 각 시스템을 lazy 로드하도록 구성되어 있다. MSW 핸들러는 `shared/api/mocks/handlers/` 아래에 도메인별 파일로 관리되고 있으며, 새 서브시스템 핸들러를 추가하고 `handlers/index.ts`에 등록하는 패턴이 확립되어 있다.

5개 시스템 중 회의실예약(ROOM, 21개 프로세스)이 가장 복잡하다. 시간대 설정, 장비 관리, 사진 업로드라는 특수 UI가 필요하다. 나머지 4개는 표준 DataTable+CrudForm 패턴으로 커버된다.

**Primary recommendation:** 각 서브시스템 구현 시 "공통 기능 라우트 연결 → MSW 핸들러 추가 → 고유 기능 페이지 구현" 순서로 진행하고, Wave별로 서브시스템 단위로 묶어 병렬 실행한다.

---

## Standard Stack

### Core (이미 설치됨)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI 렌더링 | Phase 0 결정 사항 |
| TypeScript | 5.x | 타입 안전성 | Phase 0 결정 사항 |
| Ant Design | 5.29.3 | 엔터프라이즈 컴포넌트 | Phase 0 결정 사항 |
| @ant-design/pro-components | 2.x | ProTable/ProForm 래퍼 | Phase 0 결정 사항 |
| TanStack Query | 5.x | 서버 상태 관리 | Phase 0 결정 사항 |
| MSW | 2.12.x | API Mocking | Phase 0 결정 사항 |
| @faker-js/faker | 9.x (ko locale) | Mock 데이터 생성 | Phase 0 결정 사항 |
| Zustand | 5.x | 클라이언트 상태 | Phase 0 결정 사항 |
| React Router | 7.x | 라우팅 | Phase 0 결정 사항 |
| Vitest + @testing-library/react | 2.x / 16.x | 테스트 | Phase 0 결정 사항 |

추가 설치 불필요. 기존 스택으로 모든 Phase 3 요구사항 구현 가능.

---

## Architecture Patterns

### Recommended Project Structure (서브시스템 단위)

```
navy-admin/src/
├── pages/
│   ├── sys04-certificate/
│   │   ├── index.tsx              # 첫 번째 메뉴로 Navigate
│   │   ├── CertificateApplyPage.tsx    # CERT-01 신청
│   │   ├── CertificateApprovalPage.tsx # CERT-02 승인/관리
│   │   └── CertificateRegisterPage.tsx # CERT-03 등록대장
│   ├── sys05-admin-rules/
│   │   ├── index.tsx              # Navigate to /sys05/1/1
│   │   ├── RegulationListPage.tsx      # AREG-01 현행규정
│   │   ├── PrecedentHQPage.tsx         # AREG-02 예규(해군본부)
│   │   ├── PrecedentUnitPage.tsx       # AREG-03 예규(예하부대)
│   │   └── DirectiveListPage.tsx       # AREG-04 지시문서
│   ├── sys11-research/
│   │   ├── index.tsx              # 메인화면 (대시보드)
│   │   ├── ResearchMainPage.tsx        # RSRC-01 메인
│   │   ├── ResearchListPage.tsx        # RSRC-02 연구자료
│   │   ├── ResearchAdminPage.tsx       # RSRC-03 관리자
│   │   └── ResearchFilePage.tsx        # RSRC-05 자료실
│   ├── sys14-suggestion/
│   │   ├── index.tsx              # 메인화면 (대시보드)
│   │   ├── SuggestionMainPage.tsx      # SUGST-01 메인
│   │   ├── SuggestionListPage.tsx      # SUGST-02 제언확인
│   │   └── SuggestionAdminPage.tsx     # SUGST-04 관리자
│   └── sys16-meeting-room/
│       ├── index.tsx              # Navigate to /sys16/1/2
│       ├── MeetingReservePage.tsx      # ROOM-01 예약신청
│       ├── MyReservationPage.tsx       # ROOM-02 내예약확인
│       ├── ReservationMgmtPage.tsx     # ROOM-03 예약관리
│       ├── MeetingRoomMgmtPage.tsx     # ROOM-04 회의실관리
│       └── MeetingStatusPage.tsx       # ROOM-05 회의현황
└── shared/
    └── api/mocks/handlers/
        ├── sys04.ts               # 인증서 Mock 핸들러
        ├── sys05.ts               # 행정규칙 Mock 핸들러
        ├── sys11.ts               # 연구자료 Mock 핸들러
        ├── sys14.ts               # 제언 Mock 핸들러
        ├── sys16.ts               # 회의실 Mock 핸들러
        └── index.ts               # 핸들러 통합 (추가)
```

### Pattern 1: 서브시스템 index.tsx 라우팅

서브시스템이 메인화면을 가지는 경우(sys11, sys14) vs 첫 번째 메뉴로 리다이렉트하는 경우(sys04, sys05, sys16):

```typescript
// 메인화면 없는 경우 (sys04, sys05, sys16)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Page() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/sys04/1/2', { replace: true }) }, [navigate])
  return null
}

// 메인화면 있는 경우 (sys11, sys14) — 라우터에서 첫 경로로 렌더링
```

### Pattern 2: 공통 기능 페이지 중첩 라우트 연결 (D-01, D-02, D-03)

현재 라우터는 `sys04/*`를 `Sys04Page`에 위임하고, `Sys04Page`가 내부에서 React Router를 사용하여 하위 경로를 처리한다. 공통 기능을 중첩 라우트로 연결하는 방법:

```typescript
// pages/sys04-certificate/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy } from 'react'

const BoardIndex = lazy(() => import('@/pages/common/board'))
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))
import CertificateApplyPage from './CertificateApplyPage'
import CertificateApprovalPage from './CertificateApprovalPage'
import CertificateRegisterPage from './CertificateRegisterPage'

export default function Page() {
  return (
    <Routes>
      <Route index element={<Navigate to="/sys04/1/2" replace />} />
      {/* 공통 기능 재사용 */}
      <Route path="1/1" element={<BoardIndex />} />       {/* CERT-04 게시판 */}
      <Route path="2/1" element={<CodeMgmtIndex />} />    {/* CERT-05 코드관리 */}
      <Route path="2/2" element={<AuthGroupIndex />} />   {/* CERT-06 권한관리 */}
      {/* 고유 기능 */}
      <Route path="1/2" element={<CertificateApplyPage />} />
      <Route path="1/3" element={<CertificateApprovalPage />} />
      <Route path="1/4" element={<CertificateRegisterPage />} />
    </Routes>
  )
}
```

### Pattern 3: 승인/반려 워크플로우 (D-05~D-07)

```typescript
// StatusBadge 매핑
const statusLabelMap = { pending: '대기', approved: '승인', rejected: '반려' }
const statusColorMap = { pending: 'orange', approved: 'green', rejected: 'red' }

// 액션 컬럼 정의
const actionColumn: ProColumns<CertItem> = {
  title: '처리',
  width: 160,
  render: (_, record) => record.status === 'pending' ? (
    <>
      <Popconfirm title="승인하시겠습니까?" onConfirm={() => handleApprove(record.id)}>
        <Button type="primary" size="small">승인</Button>
      </Popconfirm>
      <Popconfirm title="반려하시겠습니까?" onConfirm={() => handleReject(record.id)}>
        <Button danger size="small" style={{ marginLeft: 8 }}>반려</Button>
      </Popconfirm>
    </>
  ) : <StatusBadge status={record.status} labelMap={statusLabelMap} colorMap={statusColorMap} />,
}
```

### Pattern 4: 메인화면 대시보드 (D-08, D-09)

```typescript
// SUGST-01, RSRC-01 메인화면 구조
import { Row, Col, Card } from 'antd'
import { Statistic } from 'antd'
import { useNavigate } from 'react-router-dom'

function MainPage() {
  const navigate = useNavigate()
  return (
    <PageContainer title="나의 제언">
      {/* 상단: 통계 카드 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="전체 제언" value={totalCount} /></Card></Col>
        <Col span={6}><Card><Statistic title="이번달 등록" value={monthCount} /></Card></Col>
        <Col span={6}><Card><Statistic title="답변 완료" value={answeredCount} /></Card></Col>
        <Col span={6}><Card><Statistic title="처리 대기" value={pendingCount} /></Card></Col>
      </Row>
      {/* 하단: 최신 목록 + 전체보기 */}
      <Card
        title="최신 제언"
        extra={<Button type="link" onClick={() => navigate('/sys14/1/3')}>전체보기</Button>}
      >
        <DataTable columns={columns} request={fetchRecent5} rowKey="id" />
      </Card>
    </PageContainer>
  )
}
```

### Pattern 5: MSW 핸들러 서브시스템 격리 (D-04)

```typescript
// shared/api/mocks/handlers/sys04.ts
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker/locale/ko'
import type { ApiResult, PageResponse } from '@/shared/api/types'

// 상태 타입
type CertStatus = 'pending' | 'approved' | 'rejected'

interface CertApplication {
  id: string
  applicantName: string
  applicantUnit: string
  certType: string
  purpose: string
  status: CertStatus
  appliedAt: string
  processedAt?: string
}

// Mock 데이터 (모듈 수준에서 초기화 — 인메모리 상태 유지)
const mockCerts: CertApplication[] = Array.from({ length: 20 }, (_, i) => ({
  id: `cert-${i + 1}`,
  applicantName: faker.person.fullName(),
  applicantUnit: faker.helpers.arrayElement(['1사단', '2사단', '해병대사령부']),
  certType: faker.helpers.arrayElement(['재직증명서', '경력증명서', '복무증명서']),
  purpose: faker.lorem.sentence(5),
  status: faker.helpers.arrayElement(['pending', 'approved', 'rejected']) as CertStatus,
  appliedAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
}))

export const sys04Handlers = [
  // 목록 조회 (페이지네이션)
  http.get('/api/sys04/certificates', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '0')
    const size = Number(url.searchParams.get('size') ?? '10')
    const status = url.searchParams.get('status')

    const filtered = status ? mockCerts.filter(c => c.status === status) : mockCerts
    const content = filtered.slice(page * size, (page + 1) * size)

    const result: ApiResult<PageResponse<CertApplication>> = {
      success: true,
      data: { content, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size), size, number: page },
    }
    return HttpResponse.json(result)
  }),

  // 승인
  http.patch('/api/sys04/certificates/:id/approve', ({ params }) => {
    const cert = mockCerts.find(c => c.id === params.id)
    if (!cert) return HttpResponse.json({ success: false, message: '없음' }, { status: 404 })
    cert.status = 'approved'
    cert.processedAt = new Date().toISOString().split('T')[0]
    return HttpResponse.json({ success: true, data: cert })
  }),

  // 반려
  http.patch('/api/sys04/certificates/:id/reject', ({ params }) => {
    const cert = mockCerts.find(c => c.id === params.id)
    if (!cert) return HttpResponse.json({ success: false, message: '없음' }, { status: 404 })
    cert.status = 'rejected'
    cert.processedAt = new Date().toISOString().split('T')[0]
    return HttpResponse.json({ success: true, data: cert })
  }),
]
```

### Pattern 6: 즐겨찾기 localStorage 구현 (D-14)

```typescript
// 즐겨찾기 훅
function useFavorites(storageKey: string) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    } catch { return [] }
  })

  const toggle = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id]
    setFavorites(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  return { favorites, toggle, isFavorite: (id: string) => favorites.includes(id) }
}
```

### Pattern 7: 회의실 시간대 설정 UI (D-10)

```typescript
// antd TimePicker.RangePicker + 요일별 Table
const DAYS = ['월', '화', '수', '목', '금', '토', '일']

interface DaySchedule {
  day: string
  enabled: boolean
  timeRange: [Dayjs, Dayjs] | null
}

// 컬럼 구성
const scheduleColumns: ProColumns<DaySchedule>[] = [
  { title: '요일', dataIndex: 'day', width: 60 },
  {
    title: '운영',
    dataIndex: 'enabled',
    width: 80,
    render: (_, record, index) => (
      <Switch checked={record.enabled} onChange={v => updateSchedule(index, 'enabled', v)} />
    ),
  },
  {
    title: '운영시간',
    dataIndex: 'timeRange',
    render: (_, record, index) => (
      <TimePicker.RangePicker
        disabled={!record.enabled}
        format="HH:mm"
        minuteStep={30}
        value={record.timeRange}
        onChange={v => updateSchedule(index, 'timeRange', v)}
      />
    ),
  },
]
```

### Pattern 8: 파일 업로드 Mock (D-12)

```typescript
// antd Upload + MSW 인터셉트
import { Upload, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

// MSW 핸들러
http.post('/api/sys16/meeting-rooms/:id/photos', async () => {
  // 업로드 성공 Mock 응답
  return HttpResponse.json({
    success: true,
    data: { id: faker.string.uuid(), url: `https://picsum.photos/400/300?random=${Math.random()}` }
  })
})

// 컴포넌트
<Upload
  action="/api/sys16/meeting-rooms/room-1/photos"
  listType="picture-card"
  maxCount={5}
  accept="image/*"
  onChange={({ file }) => {
    if (file.status === 'done') message.success('사진이 등록되었습니다')
    if (file.status === 'error') message.error('업로드 실패')
  }}
>
  <PlusOutlined />
</Upload>
```

### Pattern 9: 테스트 패턴 (기존 확립)

Phase 1/2에서 확립된 jsdom 환경 테스트 패턴:
- heavy antd 컴포넌트는 `readFileSync`로 파일 내용 기반 검증 (import 타임아웃 회피)
- MSW 핸들러 테스트는 `http`, `HttpResponse` 직접 단위 테스트
- 비즈니스 로직(타입 정의, 상태 변환 함수)은 순수 단위 테스트

```typescript
// 서브시스템 테스트 패턴 (src/__tests__/sys04/certificate.test.ts)
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'

describe('인증서 페이지 구조', () => {
  it('CertificateApplyPage 파일이 존재한다', () => {
    const content = readFileSync(
      resolve(__dirname, '../../pages/sys04-certificate/CertificateApplyPage.tsx'),
      'utf-8'
    )
    expect(content).toContain('CertificateApplyPage')
  })

  it('sys04 MSW 핸들러가 등록되어 있다', () => {
    const content = readFileSync(
      resolve(__dirname, '../../shared/api/mocks/handlers/index.ts'),
      'utf-8'
    )
    expect(content).toContain('sys04Handlers')
  })
})
```

### Anti-Patterns to Avoid

- **공통 기능 재구현 금지:** CERT-04 게시판을 별도 페이지로 만들지 말 것. Phase 1 `common/board/`를 라우트 연결로 재사용한다.
- **Mock 데이터 하드코딩 금지:** Faker.js ko locale 사용. 한국어 이름/부대명/날짜 데이터를 직접 작성하지 말 것.
- **승인 플로우 복잡화 금지:** D-05에 따라 Phase 1 결재선 연동 불필요. 단순 status 변경으로 구현.
- **MSW 핸들러 공유 금지:** 각 서브시스템별 독립 파일로 분리. `common/board.ts`의 핸들러를 직접 수정하지 말 것.
- **SubsystemPage placeholder 유지 금지:** Phase 3에서 모든 대상 시스템의 `index.tsx`를 실제 구현으로 교체해야 한다.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 게시판 CRUD | sys04 전용 게시판 | `common/board/` 라우트 재사용 | D-01: Phase 1에 완전 구현됨. sysCode로 데이터 격리 |
| 코드 관리 | sys04/sys16 전용 코드관리 | `common/code-mgmt/` 라우트 재사용 | D-02: Phase 1에 완전 구현됨 |
| 권한 관리 | 서브시스템별 권한관리 | `common/auth-group/` 라우트 재사용 | D-03: Phase 1에 완전 구현됨 |
| 목록 + 페이지네이션 | 커스텀 테이블 | `DataTable` 컴포넌트 | Phase 0 frozen contract. ProTable 서버사이드 페이지네이션 내장 |
| 등록/수정 폼 | 커스텀 폼 | `CrudForm` 컴포넌트 | Phase 0 frozen contract. ProForm 유효성 검사 내장 |
| 상태 표시 | 커스텀 뱃지 | `StatusBadge` 컴포넌트 | Phase 0 frozen contract. 승인/반려/대기 색상 일관성 |
| 파일 다운로드 로직 | 실제 파일 스트림 처리 | `message.success()` Mock | D-13: 백엔드 연동 전 Mock 단계에서 불필요 |
| 이미지 업로드 처리 | 커스텀 파일 핸들러 | antd `Upload` + MSW | D-12: MSW가 network 레벨에서 인터셉트 |

**Key insight:** Phase 3의 핵심 가치는 새로운 기술을 도입하는 것이 아니라 Phase 0/1에서 구축된 인프라를 최대한 활용하는 것이다. 새로 구현할 코드는 각 서브시스템 고유 비즈니스 로직과 MSW Mock 데이터에 집중한다.

---

## Common Pitfalls

### Pitfall 1: 서브시스템 내부 라우팅 미설정

**What goes wrong:** `sys04/*` 라우트는 `Sys04Page`에 위임되지만, `Sys04Page` 내부에 `<Routes>`가 없으면 모든 하위 경로(`/sys04/1/2`, `/sys04/1/3`)가 동일한 컴포넌트를 보여준다.

**Why it happens:** 최상위 라우터(`router.tsx`)가 `sys04/*`를 lazy import하기 때문에 내부 라우팅은 각 서브시스템 `index.tsx`가 직접 처리해야 한다.

**How to avoid:** 각 서브시스템 `index.tsx`에 반드시 `<Routes>` + `<Route path="...">` 구조를 포함시킨다.

**Warning signs:** 사이드바 메뉴를 클릭해도 페이지 내용이 바뀌지 않는 현상.

### Pitfall 2: MSW 핸들러 미등록

**What goes wrong:** 서브시스템 핸들러 파일(`sys04.ts`)을 만들었지만 `handlers/index.ts`에 추가하지 않으면 API 호출이 404를 반환한다.

**Why it happens:** MSW는 `handlers` 배열에 등록된 핸들러만 인터셉트한다.

**How to avoid:** 새 핸들러 파일 생성 직후 `handlers/index.ts` 업데이트를 함께 처리한다.

**Warning signs:** 브라우저 콘솔에 `[MSW] Warning: captured a request without a matching request handler`.

### Pitfall 3: 공통 기능 재사용 시 sysCode 격리 미처리

**What goes wrong:** 여러 서브시스템에서 동일한 `common/board/` 컴포넌트를 사용할 때 Mock 데이터가 섞인다.

**Why it happens:** 현재 `board.ts` 핸들러의 `subsystemCode`가 모두 `'common'`으로 하드코딩되어 있다. 서브시스템별 게시판 데이터를 격리하려면 `sysCode` 파라미터 또는 별도 게시판 ID 체계가 필요하다.

**How to avoid:** D-01에 따라 `sysCode` 쿼리 파라미터를 공통 게시판 컴포넌트에서 넘기고, 핸들러에서 필터링한다. 또는 각 서브시스템용 별도 게시판 ID를 Mock 데이터에 사전 등록한다.

**Warning signs:** sys04 게시판에 sys11 공지사항이 보이는 현상.

### Pitfall 4: antd TimePicker.RangePicker와 dayjs 의존성

**What goes wrong:** `TimePicker.RangePicker`는 antd 5.x에서 dayjs를 내부적으로 사용한다. dayjs 없이는 타입 오류 발생.

**Why it happens:** antd DatePicker/TimePicker 계열은 dayjs 기반이며, `value` prop이 `[Dayjs, Dayjs]` 타입을 요구한다.

**How to avoid:** `import dayjs from 'dayjs'`를 사용하여 초기값 생성. `package.json`에 dayjs가 이미 포함되어 있음 (확인됨).

**Warning signs:** `Type 'string[]' is not assignable to type '[Dayjs, Dayjs]'` TypeScript 오류.

### Pitfall 5: DataTable의 page 변환 내부화 (기존 결정)

**What goes wrong:** ProTable은 1-based `current`를 사용하고, Spring Boot Pageable은 0-based `page`를 사용한다.

**Why it happens:** Phase 0 결정: DataTable 내부에서 변환 처리 (`page: (params.current ?? 1) - 1`).

**How to avoid:** MSW 핸들러에서 `page`를 0-based로 처리한다. API 함수에서 별도 변환 불필요.

**Warning signs:** 첫 페이지에서 두 번째 페이지 데이터가 표시되는 현상.

---

## Code Examples

### MSW 핸들러 — 제언 추천/신고 (SUGST-02, D-17)

```typescript
// shared/api/mocks/handlers/sys14.ts
interface Suggestion {
  id: string
  title: string
  content: string
  authorName: string
  authorUnit: string
  likeCount: number
  reportCount: number
  isPrivate: boolean
  hasAnswer: boolean
  answer?: string
  createdAt: string
}

const mockSuggestions: Suggestion[] = Array.from({ length: 30 }, (_, i) => ({
  id: `sug-${i + 1}`,
  title: faker.lorem.sentence(5),
  content: faker.lorem.paragraphs(2),
  authorName: faker.person.fullName(),
  authorUnit: faker.helpers.arrayElement(['1사단', '2사단', '3사단']),
  likeCount: faker.number.int({ min: 0, max: 50 }),
  reportCount: faker.number.int({ min: 0, max: 5 }),
  isPrivate: faker.datatype.boolean(0.2),
  hasAnswer: faker.datatype.boolean(0.4),
  answer: faker.datatype.boolean(0.4) ? faker.lorem.sentences(2) : undefined,
  createdAt: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
}))

export const sys14Handlers = [
  // 추천
  http.post('/api/sys14/suggestions/:id/like', ({ params }) => {
    const sug = mockSuggestions.find(s => s.id === params.id)
    if (!sug) return HttpResponse.json({ success: false }, { status: 404 })
    sug.likeCount += 1
    return HttpResponse.json({ success: true, data: { likeCount: sug.likeCount } })
  }),
  // 신고
  http.post('/api/sys14/suggestions/:id/report', ({ params }) => {
    const sug = mockSuggestions.find(s => s.id === params.id)
    if (!sug) return HttpResponse.json({ success: false }, { status: 404 })
    sug.reportCount += 1
    return HttpResponse.json({ success: true, data: { reportCount: sug.reportCount } })
  }),
  // 비공개 처리 (관리자)
  http.patch('/api/sys14/suggestions/:id/private', ({ params }) => {
    const sug = mockSuggestions.find(s => s.id === params.id)
    if (!sug) return HttpResponse.json({ success: false }, { status: 404 })
    sug.isPrivate = !sug.isPrivate
    return HttpResponse.json({ success: true, data: sug })
  }),
]
```

### handlers/index.ts 업데이트 패턴

```typescript
import { authHandlers } from './auth'
import { demoHandlers } from './demo'
import { commonHandlers } from './common'
import { announcementHandlers } from './announcements'
import { sys04Handlers } from './sys04'
import { sys05Handlers } from './sys05'
import { sys11Handlers } from './sys11'
import { sys14Handlers } from './sys14'
import { sys16Handlers } from './sys16'

export const handlers = [
  ...authHandlers,
  ...demoHandlers,
  ...commonHandlers,
  ...announcementHandlers,
  ...sys04Handlers,
  ...sys05Handlers,
  ...sys11Handlers,
  ...sys14Handlers,
  ...sys16Handlers,
]
```

---

## Environment Availability

Step 2.6: 이 Phase는 기존 스택만 사용하며 새 외부 의존성이 없음.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | 빌드/테스트 | ✓ | 24.13.0 | — |
| npm | 패키지 관리 | ✓ | 11.6.2 | — |
| dayjs | antd TimePicker | ✓ | package.json 확인됨 | — |
| @faker-js/faker (ko) | MSW Mock 데이터 | ✓ | package.json 확인됨 | — |

**Missing dependencies:** 없음. 기존 설치된 패키지로 모든 요구사항 구현 가능.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + @testing-library/react 16.x |
| Config file | `navy-admin/vite.config.ts` (test 섹션 포함) |
| Quick run command | `cd navy-admin && npx vitest run --reporter=verbose` |
| Full suite command | `cd navy-admin && npx vitest run` |

**현재 기준:** 98 tests passed (19 test files) — Phase 2 완료 시점.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CERT-01~03 | 인증서 신청/승인/등록대장 타입 + MSW 핸들러 | unit | `npx vitest run src/__tests__/sys04/` | ❌ Wave 0 |
| CERT-04~06 | 공통 기능 라우트 연결 | unit (파일 내용) | `npx vitest run src/__tests__/sys04/` | ❌ Wave 0 |
| AREG-01~04 | 행정규칙 타입 + 즐겨찾기 localStorage | unit | `npx vitest run src/__tests__/sys05/` | ❌ Wave 0 |
| SUGST-01~05 | 제언 타입 + 추천/신고/비공개 핸들러 | unit | `npx vitest run src/__tests__/sys14/` | ❌ Wave 0 |
| RSRC-01~06 | 연구자료 타입 + 관리자 탭 구조 | unit | `npx vitest run src/__tests__/sys11/` | ❌ Wave 0 |
| ROOM-01~07 | 회의실 타입 + 예약 승인 핸들러 + 코드관리 라우트 | unit | `npx vitest run src/__tests__/sys16/` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd navy-admin && npx vitest run`
- **Per wave merge:** `cd navy-admin && npx vitest run`
- **Phase gate:** 전체 테스트 통과 후 `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/sys04/certificate.test.ts` — CERT-01~06 타입/핸들러/라우트 검증
- [ ] `src/__tests__/sys05/admin-rules.test.ts` — AREG-01~04 타입/핸들러/localStorage 즐겨찾기 검증
- [ ] `src/__tests__/sys11/research.test.ts` — RSRC-01~06 타입/핸들러 검증
- [ ] `src/__tests__/sys14/suggestion.test.ts` — SUGST-01~05 타입/핸들러 (추천/신고/비공개) 검증
- [ ] `src/__tests__/sys16/meeting-room.test.ts` — ROOM-01~07 타입/핸들러 검증
- [ ] 디렉토리 생성: `src/__tests__/sys04/`, `sys05/`, `sys11/`, `sys14/`, `sys16/`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 서브시스템별 독립 게시판 구현 | Phase 1 `common/board/` 재사용 | Phase 1 완료 | 개발량 약 60% 감소 |
| placeholder SubsystemPage | 실제 기능 페이지 컴포넌트 | Phase 3 (이번) | 서브시스템 실제 동작 가능 |
| 없음 | 서브시스템 고유 MSW 핸들러 | Phase 3 (이번) | 각 시스템 독립 Mock 데이터 |

**Deprecated/outdated:**
- `SubsystemPage` (placeholder): Phase 3 이후 `sys04~sys16`의 고유 기능 라우트에서는 사용하지 않는다. 단, `sys04/index.tsx` 전체 fallback으로 유지할 수 있다.

---

## Open Questions

1. **공통 게시판 sysCode 격리 방법**
   - What we know: 현재 `common/board/` 핸들러의 `subsystemCode`가 모두 `'common'`
   - What's unclear: 서브시스템별 게시판 데이터 격리를 위해 (a) 공통 핸들러에 `sysCode` 필터 추가 vs (b) 각 서브시스템용 게시판 ID를 사전에 Mock 데이터에 등록 중 어느 방식이 더 간단한가
   - Recommendation: (b)가 더 간단. 각 서브시스템 핸들러(`sys04.ts`)에서 해당 게시판 ID에 맞는 `BoardConfig` Mock 데이터를 반환하도록 구성. 공통 핸들러 수정 불필요.

2. **회의현황(ROOM-05) UI 방식**
   - What we know: 1개 프로세스. 회의실 예약 현황을 보여줘야 함.
   - What's unclear: 캘린더 뷰 vs 단순 DataTable 목록 중 어느 것이 적합한가
   - Recommendation: DataTable 목록으로 구현 (날짜/시간/회의실/예약자 컬럼). antd Calendar는 Phase 4 이상의 복잡도에서 도입. 저복잡도 Phase에서는 단순함 우선.

---

## Sources

### Primary (HIGH confidence)

- 코드베이스 직접 분석 — `navy-admin/src/` 전체 구조, 기존 패턴 확인
  - `shared/ui/DataTable`, `CrudForm`, `StatusBadge` 인터페이스
  - `shared/api/mocks/handlers/` 패턴
  - `entities/subsystem/menus.ts`, `config.ts` — Phase 3 대상 시스템 메뉴 구조 확인
  - `app/router.tsx` — lazy 라우트 구조 확인
  - `pages/common/board/index.tsx`, `pages/common/auth-group/index.tsx` — 재사용 인터페이스 확인
  - `pages/sys04-certificate/index.tsx` — 현재 placeholder 상태 확인
  - `vite.config.ts` test 섹션 — vitest 설정 확인
  - `package.json` — 의존성 목록 확인 (dayjs, faker 포함 확인)
- `.planning/phases/03-5/03-CONTEXT.md` — 18개 locked decision 확인
- Phase 1/2 테스트 패턴 확인 — `src/__tests__/common/board.test.ts` 등

### Secondary (MEDIUM confidence)

- Ant Design 5 TimePicker.RangePicker dayjs 의존성 — antd 5.x 공식 문서 기반 (antd 5가 dayjs 기반임은 Phase 0 RESEARCH에서 확인됨)
- MSW 모듈 수준 인메모리 상태 패턴 — Phase 1 핸들러 패턴 분석에서 확인

---

## Metadata

**Confidence breakdown:**

- Standard Stack: HIGH — 이미 설치된 패키지이며 package.json에서 직접 확인
- Architecture: HIGH — 코드베이스 직접 분석으로 확인, 기존 패턴 연속성
- Pitfalls: HIGH — 실제 코드에서 발견된 패턴 기반 (board subsystemCode 하드코딩 등)
- Test patterns: HIGH — Phase 1/2 테스트 파일 직접 분석

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (스택 안정적, 30일 유효)
