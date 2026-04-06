---
phase: 5
slug: 05-b-3-medium-subsystems-b
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-06
---

# Phase 5 -- UI Design Contract

> Phase 5: 중복잡도 서브시스템 B 3개 (131개 프로세스) -- 군사자료관리(sys07), 주말버스예약관리(sys10), 직무기술서관리(sys18)
> gsd-ui-researcher 생성, gsd-ui-checker 검증 대상.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (shadcn 미사용 -- Ant Design 5 ProComponents 채택, Phase 0 결정) |
| Preset | not applicable |
| Component library | Ant Design 5.29.3 + @ant-design/pro-components 2.8.10 |
| Chart library | @ant-design/charts 2.6.7 (Phase 4에서 설치됨) |
| DnD library | @dnd-kit/core 6.3.1 (설치됨, Phase 5에서 미사용) |
| Icon library | @ant-design/icons (antd 번들 포함) |
| Font | Noto Sans KR, -apple-system, BlinkMacSystemFont, sans-serif (Phase 0 동결값) |

**신규 설치 패키지:** 없음 -- 기존 스택으로 완전 구현 가능.

**Registry Safety Gate:** shadcn 미초기화이므로 적용 안 함.

---

## Spacing Scale

Phase 1~4 동결값 상속. 4의 배수 원칙.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 아이콘 간격, 인라인 패딩, 태그 내부, 좌석 버튼 간격 |
| sm | 8px | 컴팩트 요소 간격, StatusBadge 간 여백, 좌석 그리드 gutter |
| md | 16px | 기본 요소 간격, SearchForm gutter, Card gutter |
| lg | 24px | 섹션 패딩, Card bodyStyle padding, Steps 내 폼 영역 패딩 |
| xl | 32px | 레이아웃 패널 간격, 보고서/승차권 섹션 간격 |
| 2xl | 48px | 주요 섹션 구분 (통계 차트와 테이블 사이) |
| 3xl | 64px | 페이지 레벨 상단 여백 |

Exceptions:
- 좌석 그리드(SeatGrid): 좌석 버튼 gutter `[4, 4]`, 행 간격 4px, 범례 상단 margin 12px
- 직무기술서 Steps 폼: 단계 콘텐츠 영역 padding lg(24px), 단계 전환 버튼 Space size="small"
- 승차권 Print CSS: A4 margin 20mm, 내부 padding xl(32px) (Phase 4 print.css 재사용)
- 차트 컨테이너: padding lg(24px), 차트 높이 300px 고정

---

## Typography

Phase 0 동결값 상속 (antd theme token 기반).

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 (regular) | 1.5 |
| Label | 14px | 500 (medium) | 1.4 |
| Heading | 20px | 600 (semibold) | 1.3 |
| Display | 28px | 600 (semibold) | 1.2 |

Phase 5 추가:
- 보안등급 Tag: 12px, weight 500, antd Tag 내부 (preset color 사용)
- 좌석 번호: 12px, weight 400, 좌석 Button 내부 (white on color background)
- Steps 단계 제목: 14px, weight 600, antd Steps title
- 승차권 제목: 24px, weight 700, line-height 1.2, text-align center
- 승차권 본문: 14px, weight 400, line-height 1.8 (antd Descriptions 기반)
- 통계 숫자 (Statistic): 28px, weight 600, antd colorPrimary
- 차트 축 레이블: 12px, weight 400, color #8c8c8c

---

## Color

Phase 0 동결값 상속 (antd NAVY 테마).

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #ffffff | PageContainer 배경, 테이블 배경, 폼 배경 |
| Secondary (30%) | #f5f5f5 | Sider 배경, SearchForm 배경, Card hover |
| Accent (10%) | #003366 (NAVY blue) | Primary 버튼, 선택된 탭, 활성 메뉴, 차트 기본색 |
| Destructive | #ff4d4f (antd red-5) | 삭제 버튼, 반려 상태, 에러 메시지 |

Accent 예약 대상:
- Primary 버튼 (등록, 저장, 승인, 제출, 예약신청, 배정)
- 활성 메뉴 아이템 하이라이트
- Steps 컴포넌트 현재 단계 아이콘
- 차트 기본 막대/선 색상

### Phase 5 신규 시맨틱 색상

**보안등급 Tag (D-04):**

| 등급 | Color | antd preset | 표시 텍스트 |
|------|-------|-------------|-----------|
| 비밀 | #ff4d4f | red | [비밀] |
| 대외비 | #fa8c16 | orange | [대외비] |
| 일반 | #1890ff | blue | [일반] |

**좌석 상태 Button 배경색 (D-01):**

| 상태 | Color | 의미 |
|------|-------|------|
| available | #1677ff | 빈좌석 (선택 가능) |
| reserved | #8c8c8c | 예약됨 (선택 불가) |
| selected | #52c41a | 내선택 (현재 선택됨) |
| unavailable | #ff4d4f | 불가 (비활성화) |

**상태 StatusBadge (Phase 4 상속 + Phase 5 추가):**

| status | label | color | 사용처 |
|--------|-------|-------|--------|
| approved | 승인 | green | 대출/열람 승인, 타군회원 승인 |
| pending | 대기 | gold | 열람대기, 대출대기, 결재대기 |
| on_loan | 대출중 | blue | 군사자료 대출 중 |
| returned | 반납완료 | default | 반납 완료 |
| rejected | 반려 | red | 반려 상태 |
| sanctioned | 제재중 | red | 주말버스 위규자 |
| sanction_expired | 제재만료 | default | 제재기간 종료 |
| active | 적용중 | green | 표준업무시간 적용 중 |
| upcoming | 적용예정 | blue | 표준업무시간 미래 |
| expired | 적용만료 | default | 표준업무시간 기간 만료 |
| draft | 작성중 | default | 직무기술서 임시저장 |
| submitted | 제출됨 | orange | 직무기술서 결재 요청 |
| completed | 완료 | green | 직무기술서 결재 완료 |
| reserved | 예약됨 | green | 주말버스 예약 완료 |
| waiting | 대기중 | gold | 주말버스 대기자 |
| cancelled | 취소됨 | default | 예약 취소 |

**차트 팔레트 (Phase 4 상속):**
- 시리즈 1: #003366 (NAVY, accent)
- 시리즈 2: #1890ff (blue-6)
- 시리즈 3: #52c41a (green-6)
- 시리즈 4: #faad14 (gold-6)
- 시리즈 5: #ff4d4f (red-5)

---

## Copywriting Contract

### 서브시스템 공통 (Phase 4 상속)

| Element | Copy |
|---------|------|
| Primary CTA (등록) | "등록" / "신규 등록" |
| Primary CTA (저장) | "저장" |
| Primary CTA (수정) | "수정" |
| Primary CTA (승인) | "승인" |
| Primary CTA (반려) | "반려" |
| Primary CTA (삭제) | "삭제" |
| Primary CTA (제출) | "제출" |
| Primary CTA (엑셀 다운) | "엑셀 다운로드" |
| Primary CTA (인쇄) | "인쇄" |
| Empty state heading | "등록된 데이터가 없습니다" |
| Empty state body | "우측 상단의 '신규 등록' 버튼을 클릭하여 데이터를 등록하세요." |
| Error state | "데이터를 불러오는 중 오류가 발생했습니다. 새로고침 후 다시 시도하세요." |
| Destructive (삭제) | "선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다." |
| Destructive (반려) | "해당 항목을 반려하시겠습니까? 반려 사유를 입력하세요." |
| 검색 결과 없음 | "검색 조건에 해당하는 데이터가 없습니다." |

### sys07 군사자료관리체계 전용

| Element | Copy |
|---------|------|
| 자료 등록 CTA | "군사자료 등록" |
| 일괄 등록 CTA | "일괄 등록 (엑셀)" |
| 열람신청 CTA | "열람 신청" |
| 대출신청 CTA | "대출 신청" |
| 반납 CTA | "반납 처리" |
| 평가심의 결과 입력 CTA | "평가심의 결과 업로드" |
| 비밀등급 경고 제목 | "비밀 자료 열람 신청" |
| 비밀등급 경고 본문 | "이 자료는 [비밀] 등급입니다. 열람 사유를 입력하세요." |
| 대비등급 경고 본문 | "이 자료는 [대외비] 등급입니다. 열람 사유를 입력하세요." |
| 삭제 사유 입력 | "삭제 사유를 입력하세요 (필수)" |
| Empty (군사자료) | "등록된 군사자료가 없습니다." |
| Empty (평가심의) | "보존기간 만료 자료가 없습니다." |
| Empty (해기단자료) | "등록된 해기단 자료가 없습니다." |
| 일괄 등록 결과 성공 | "총 {n}건이 정상 등록되었습니다." |
| 일괄 등록 결과 오류 | "{n}건 중 {e}건 오류가 발생했습니다. 아래 오류 목록을 확인하세요." |

### sys10 주말버스예약관리체계 전용

| Element | Copy |
|---------|------|
| 예약신청 CTA | "예약 신청" |
| 예약취소 CTA | "예약 취소" |
| 자동배정 CTA | "자동 배정" |
| 승차권 발급 CTA | "승차권 발급" |
| 승차권 인쇄 CTA | "승차권 인쇄" |
| 타군 로그인 제목 | "주말버스 예약 시스템" |
| 타군 로그인 부제목 | "타군 사용자 로그인" |
| 회원등록 신청 CTA | "회원등록 신청" |
| 패스워드 초기화 CTA | "패스워드 초기화" |
| 패스워드 초기화 성공 | "임시 패스워드가 등록된 메일로 발송되었습니다." |
| 제재중 예약 차단 | "현재 제재 중인 사용자입니다. 제재기간 종료 후 예약 가능합니다." |
| Empty (예약현황) | "예약된 버스가 없습니다." |
| Empty (대기자) | "대기 중인 사용자가 없습니다." |
| Empty (위규자) | "등록된 위규자가 없습니다." |
| 자동배정 완료 | "총 {n}명이 자동 배정되었습니다." |
| 자동배정 실패 | "배정 가능한 빈좌석이 없습니다." |
| 승차권 헤더 | "주말버스 예약 승차권" |
| 승차권 하단 문구 | "본 승차권은 탑승 시 제시하여야 합니다." |

### sys18 직무기술서관리체계 전용

| Element | Copy |
|---------|------|
| 직무기술서 작성 CTA | "직무기술서 작성" |
| 임시저장 CTA | "임시저장" |
| 다음 단계 CTA | "다음 단계" |
| 이전 단계 CTA | "이전 단계" |
| 제출 CTA | "결재 요청" |
| 대리작성 CTA | "대리작성" |
| 검토결과 입력 CTA | "검토결과 입력" |
| 의견보내기 CTA | "의견 보내기" |
| 반송 CTA | "반송" |
| 업무항목 추가 CTA | "업무 추가" |
| 임시저장 완료 | "임시저장되었습니다." |
| 비율 합계 오류 | "업무 비율 합계가 100%가 되어야 합니다. 현재: {n}%" |
| 결재 요청 완료 | "결재 요청이 완료되었습니다." |
| Empty (나의 JD) | "작성된 직무기술서가 없습니다. '직무기술서 작성' 버튼으로 시작하세요." |
| Empty (결재대기) | "결재 대기 중인 직무기술서가 없습니다." |
| Empty (표준업무시간) | "등록된 표준업무시간이 없습니다." |
| Destructive (반송) | "직무기술서를 반송하시겠습니까? 반송 사유를 입력하세요." |
| 진단기간 제한 | "진단기간 이후에는 수정/삭제할 수 없습니다." |

---

## Component Inventory

### Phase 0~4 재사용 컴포넌트 (변경 없음)

| Component | Path | 사용처 |
|-----------|------|--------|
| DataTable | shared/ui/DataTable/ | 모든 목록 화면 |
| CrudForm | shared/ui/CrudForm/ | 등록/수정 폼 |
| DetailModal | shared/ui/DetailModal/ | 상세 조회 팝업 |
| SearchForm | shared/ui/SearchForm/ | 검색 폼 |
| StatusBadge | shared/ui/StatusBadge/ | 상태 표시 |
| ConfirmDialog | shared/ui/ConfirmDialog/ | 삭제/반려/반송 확인 |
| BoardListPage | pages/common/board/ | 게시판 (sysCode=sys07/sys10/sys18) |
| auth-group pages | pages/common/auth-group/ | 권한관리 (JOB-07) |
| code-mgmt pages | pages/common/code-mgmt/ | 코드관리 (JOB-06) |
| PrintableReport | pages/sys09-memorial/PrintableReport.tsx | 승차권/통계보고서 인쇄 |
| print.css | pages/sys09-memorial/print.css | 인쇄 CSS |

### Phase 5 신규 UI 패턴

| Pattern | antd 컴포넌트 | 파일 위치 | 사용처 |
|---------|--------------|-----------|--------|
| 좌석 선택 그리드 | Row + Col + Button | sys10-weekend-bus/SeatGrid.tsx | BUS-01 예약, BUS-03 배차 |
| 보안등급 Tag | antd Tag (preset color) | 인라인 렌더러 | MDATA-01 목록, 상세 |
| 비밀등급 경고 Modal | antd Modal + Form | 인라인 | MDATA-02 열람신청 |
| 대출 워크플로우 Steps | antd Steps + StatusBadge | MilDataUsagePage | MDATA-02 |
| 엑셀 Upload + 검증 Modal | antd Upload + Table Modal | 인라인 | MDATA-01 일괄등록, 평가심의결과 |
| 직무기술서 멀티스텝 폼 | antd Steps + Form + Form.List + Tabs | JobDescFormPage | JOB-01 |
| 결재 Steps 시각화 | antd Steps + StatusBadge | JobDescApprovalPage | JOB-03 |
| 통계 차트 | @ant-design/charts Bar/Pie/Line/Column | MilDataStatsPage, JobDescAdminPage | MDATA-03, JOB-02 |
| 타군 전용 로그인 | antd Form (standalone) | sys10/ExternalLoginPage | BUS-08 |
| 표준업무시간 상태계산 | StatusBadge + dayjs | StandardWorkTimePage | JOB-08 |

---

## 서브시스템별 상세 UI Contract

---

### SYS07: 군사자료관리체계 (40개 프로세스)

---

#### 07-A. 군사자료 목록 (MDATA-01)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| securityLevel | 비밀등급 | 90 | Tag (red/orange/blue) | Y | D-04: 비밀/대외비/일반 |
| storageType | 보관형태 | 100 | text | Y | 이관비밀/존안비밀/군비밀 등 |
| docNumber | 관리번호 | 140 | text | N | |
| docType | 문서구분 | 100 | text | Y | |
| title | 자료명 | 250 | text (링크) | N | 클릭 시 상세 조회 |
| transferDate | 이관일자 | 120 | date | Y | YYYY-MM-DD |
| retentionPeriod | 보존기간 | 100 | text | Y | |
| status | 상태 | 100 | StatusBadge | Y | active/on_loan/evaluation |
| registeredAt | 등록일 | 120 | date | Y | |

**StatusBadge colorMap (군사자료):**

| status | label | color |
|--------|-------|-------|
| active | 보존중 | green |
| on_loan | 대출중 | blue |
| evaluation | 평가심의 | gold |
| disposed | 파기 | default |

**toolBarRender:** `[신규 등록]` `[일괄 등록 (엑셀)]` `[엑셀 다운로드]` `[인쇄]`

**SearchForm 필드:**

| name | label | type | options |
|------|-------|------|---------|
| securityLevel | 비밀등급 | Select | 전체/비밀/대외비/일반 (D-05) |
| storageType | 보관형태 | Select | 전체/이관비밀/존안비밀/군비밀 |
| docType | 문서구분 | Select | 전체 + 코드 목록 |
| keyword | 자료명/관리번호 | Input | 키워드 검색 |
| transferDateRange | 이관일자 | DatePicker.RangePicker | |
| status | 상태 | Select | 전체/보존중/대출중/평가심의/파기 |

---

#### 07-B. 군사자료 등록/수정 폼 (MDATA-01)

**폼 필드:**

| name | label | type | required | validation | 비고 |
|------|-------|------|----------|------------|------|
| securityLevel | 비밀등급 | Select | Y | required | 비밀/대외비/일반 |
| storageLocation | 보관장소 | Input | Y | max 100 | |
| docNumber | 관리번호 | Input | Y | max 50 | |
| docType | 문서구분 | Select | Y | required | 코드 목록 |
| transferDate | 이관일자 | DatePicker | Y | required | |
| title | 자료명 | Input | Y | max 200 | |
| author | 작성자 | Input | N | max 50 | |
| retentionPeriod | 보존기간 | Select | Y | required | 5년/10년/30년/영구 |
| retentionExpireDate | 보존기간 만료일 | DatePicker | N | | 자동 계산 또는 수동 입력 |
| pages | 쪽수 | InputNumber | N | min 1 | |
| attachFile | 첨부파일 | Upload | N | | dragger 형태 |
| remarks | 비고 | TextArea | N | max 500 | |

수정 폼 추가 필드:
- `disposeFlag` (파기 여부): Checkbox
- `retentionExtend` (보존기간 연장): Checkbox (D-06 규칙)
- `newRetentionDate` (연장 후 보존기간): DatePicker (retentionExtend=true 시 노출)

삭제 시: `deleteReason` (삭제 사유) TextArea 필수 입력 ConfirmDialog.

---

#### 07-C. 군사자료 일괄 등록 -- Upload + 검증 Modal (MDATA-01, D-11/12)

**Upload 컴포넌트:**
- type: dragger (antd Upload.Dragger)
- accept: `.xlsx, .xls`
- maxCount: 1
- 안내 문구: "엑셀 템플릿을 이용하여 군사자료를 일괄 등록합니다. '템플릿 다운로드' 버튼으로 양식을 먼저 다운로드하세요."
- 버튼: `[템플릿 다운로드]` `[업로드]`

**검증 결과 Modal:**
- title: "일괄 등록 검증 결과"
- 성공행: "총 {n}건 정상" (green 텍스트)
- 오류행 테이블:

| row | column | errorMessage |
|-----|--------|-------------|
| 행번호 | 오류 컬럼 | 오류 내용 |

- footer 버튼: `[취소]` `[확인 후 저장]` (오류 없을 때만 활성화)

---

#### 07-D. 군사자료 상세 조회 (MDATA-01)

antd Descriptions (layout="vertical", column=3):
- 비밀등급, 보관형태, 관리번호
- 문서구분, 이관일자, 보존기간
- 자료명, 작성자, 쪽수
- 보관장소, 등록일, 상태

관리자 전용 섹션: 변경 이력 DataTable (변경일시 / 변경자 / 변경항목 / 변경전 / 변경후)

---

#### 07-E. 평가심의 목록 (MDATA-01)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| securityLevel | 비밀등급 | 90 | Tag | Y | |
| docNumber | 관리번호 | 140 | text | N | |
| title | 자료명 | 250 | text | N | |
| retentionExpireDate | 보존기간 만료일 | 120 | date | Y | 만료된 건만 자동 표시 (D-10) |
| status | 심의상태 | 100 | StatusBadge | Y | pending/disposed/extended |
| evaluationResult | 심의결과 | 120 | text | N | 파기/보존기간연장 |
| newRetentionDate | 연장기간 | 120 | date | N | 연장 시만 표시 |

**toolBarRender:** `[평가심의 결과 업로드]` `[엑셀 다운로드]`

**SearchForm 필드:**

| name | label | type |
|------|-------|------|
| securityLevel | 비밀등급 | Select |
| keyword | 관리번호/자료명 | Input |
| expireDateRange | 만료일 범위 | DatePicker.RangePicker |

---

#### 07-F. 군사자료 활용 -- 대출/열람 목록 (MDATA-02)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| usageType | 활용형태 | 90 | Tag | Y | 대출/열람/지출 |
| docTitle | 자료명 | 200 | text (링크) | N | |
| securityLevel | 비밀등급 | 90 | Tag | Y | |
| userName | 성명 | 80 | text | N | |
| militaryId | 군번 | 100 | text | N | |
| rank | 계급 | 80 | text | N | |
| position | 직책 | 100 | text | N | |
| unit | 소속 | 120 | text | N | |
| usageDate | 활용일자 | 120 | date | Y | |
| returnDueDate | 반납예정일 | 120 | date | Y | |
| returnDate | 반납일자 | 120 | date | Y | 반납완료 시 |
| status | 상태 | 100 | StatusBadge | Y | pending/approved/on_loan/returned |

**StatusBadge colorMap (활용):**

| status | label | color |
|--------|-------|-------|
| pending | 신청대기 | gold |
| approved | 승인완료 | blue |
| on_loan | 대출중 | cyan |
| returned | 반납완료 | green |
| rejected | 반려 | red |

**SearchForm 필드:**

| name | label | type | options |
|------|-------|------|---------|
| usageType | 활용형태 | Select | 전체/대출/열람/지출 |
| status | 상태 | Select | 전체/신청대기/승인완료/대출중/반납완료 |
| keyword | 성명/군번 | Input | |
| usageDateRange | 활용일자 범위 | DatePicker.RangePicker | |

---

#### 07-G. 대출/열람 처리 폼 + Steps 워크플로우 (MDATA-02, D-08/09)

**Steps 시각화 (antd Steps, direction="horizontal"):**

```
[1. 신청] → [2. 승인] → [3. 대출/열람] → [4. 반납완료]
```

| step | title | status 조건 |
|------|-------|------------|
| 0 | 신청 | finish (항상) |
| 1 | 승인 | finish/wait/error |
| 2 | 대출/열람 | finish/wait |
| 3 | 반납완료 | finish/wait |

**처리 폼 필드:**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| usageType | 활용형태 | Select | Y | 대출/열람/지출 |
| militaryId | 군번 | Input | Y | max 10 |
| userName | 성명 | Input | Y | max 20 |
| rank | 계급 | Select | Y | 계급 코드 목록 |
| position | 직책 | Input | Y | max 50 |
| unit | 소속 | Input | Y | max 100 |
| phone | 전화번호 | Input | N | |
| usagePurpose | 열람사유 | TextArea | 비밀등급 시 Y | max 500 (D-06: 비밀등급 경고 Modal) |
| returnDueDate | 반납예정일 | DatePicker | 대출 시 Y | |

관리자 액션 버튼:
- 상태 `pending`: `[승인]` `[반려]`
- 상태 `approved`: `[대출처리]`
- 상태 `on_loan`: `[반납처리]`

---

#### 07-H. 통계자료 (MDATA-03, D-37)

**차트 구성 (4개 차트 + 3개 DataTable):**

**차트 1: 문서별 보유현황 -- Column Chart**
- x축: 문서구분 (코드 목록)
- y축: 보유 건수
- 색상: NAVY 팔레트
- 높이: 300px
- 필터: 기간 DatePicker.RangePicker

**차트 2: 보안등급별 현황 -- Pie Chart**
- 분류: 비밀/대외비/일반
- 색상: red/#fa8c16/#1890ff (보안등급 매핑)
- 높이: 300px
- 필터: 기준년도 Select

**차트 3: 활용실적 추이 -- Line Chart**
- x축: 월 (1~12월)
- y축: 활용 건수
- 시리즈: 대출/열람/지출 3선
- 높이: 300px
- 필터: 기준년도 Select

**차트 4: 등급별/상태별 연도별 현황 -- 크로스탭 테이블 + Bar Chart**
- antd Table (커스텀 컬럼 그룹핑)
- x축: 연도
- 색상: 비밀등급 색상 일치

**접수용관리기록부 DataTable:**

| dataIndex | title | width | type |
|-----------|-------|-------|------|
| securityLevel | 비밀구분 | 90 | Tag |
| docStatus | 문서상태 | 100 | text |
| baseYear | 기준년도 | 80 | number |
| totalCount | 총건수 | 80 | number |
| newCount | 신규접수 | 80 | number |
| disposedCount | 파기 | 80 | number |
| remainCount | 잔존 | 80 | number |

**활용지원기록부 DataTable:**

| dataIndex | title | width | type |
|-----------|-------|-------|------|
| baseYear | 기준년도 | 80 | number |
| securityLevel | 비밀구분 | 90 | Tag |
| usageType | 활용형태 | 90 | text |
| totalCount | 총활용수 | 80 | number |
| unitCount | 부대별 건수 | 80 | number |

**SearchForm (통계공통):**

| name | label | type |
|------|-------|------|
| dateRange | 기간 | DatePicker.RangePicker |
| baseYear | 기준년도 | Select (연도 목록) |
| securityLevel | 비밀구분 | Select |
| usageType | 활용형태 | Select |

**toolBarRender (통계):** `[엑셀 다운로드]` `[인쇄]`

---

#### 07-I. 해기단자료 목록 (MDATA-04)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| department | 부서 | 120 | text | Y | |
| managerPosition | 관리자직책 | 100 | text | N | |
| fileFolder | 파일철 | 150 | text | N | |
| title | 자료명 | 250 | text (링크) | N | |
| dataType | 자료형태 | 100 | text | Y | |
| publisher | 발행처 | 120 | text | N | |
| securityLevel | 비밀등급 | 90 | Tag | Y | |
| publishYear | 발행년도 | 80 | number | Y | |
| storageLocation | 보관위치 | 150 | text | N | |
| registeredAt | 등록일 | 120 | date | Y | |

**toolBarRender:** `[신규 등록]` `[엑셀 다운로드]` `[인쇄]`

**SearchForm 필드:**

| name | label | type |
|------|-------|------|
| department | 부서선택 | Select |
| managerPosition | 관리자직책 | Input |
| fileFolder | 파일철 | Input |
| keyword | 자료명 | Input |

---

#### 07-J. 해기단자료 등록/수정 폼 (MDATA-04)

**폼 필드:**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| title | 자료명 | Input | Y | max 200 |
| dataType | 자료형태 | Select | Y | 코드 목록 |
| publisher | 발행처 | Input | N | max 100 |
| securityLevel | 비밀등급 | Select | Y | 비밀/대외비/일반 |
| publishYear | 발행년도 | InputNumber | Y | 4자리 연도 |
| storageLocation | 보관위치 | Input | N | max 200 (폐가식/개가식/서고번호/단/층) |
| pages | 쪽수 | InputNumber | N | min 1 |
| attachFile | 첨부파일 | Upload | N | |
| remarks | 비고 | TextArea | N | max 500 |

삭제 시: `deleteReason` TextArea 필수 입력 ConfirmDialog.

---

### SYS10: 주말버스예약관리체계 (44개 프로세스)

---

#### 10-A. 타군 전용 로그인 페이지 (BUS-08, D-21~24)

**레이아웃:** 페이지 중앙 정렬, 배경 #f5f5f5, 카드 너비 400px, 상단 로고 영역.

**로그인 폼 (antd Form):**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| militaryId | 군번 | Input | Y | max 10 |
| password | 비밀번호 | Password | Y | min 8 |

버튼: `[로그인]` (primary, block) `[회원등록 신청]` (default, block)

링크: "패스워드를 잊으셨나요?" → 패스워드 초기화 Modal

**패스워드 초기화 Modal:**
- title: "패스워드 초기화"
- 폼: militaryId(군번), email(등록 메일)
- 확인 시: `message.success('임시 패스워드가 등록된 메일로 발송되었습니다.')`

**회원등록 신청 폼 (BUS-08, D-22):**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| militaryBranch | 군구분 | Select | Y | 육군/공군/해군/해병대 등 |
| unitName | 부대명 | Input | Y | max 100 |
| militaryId | 군번 | Input | Y | max 10 |
| rank | 계급 | Select | Y | 계급 코드 |
| name | 성명 | Input | Y | max 20 |
| position | 직책 | Input | Y | max 50 |
| phone | 전화번호 | Input | N | format 010-XXXX-XXXX |
| email | 메일주소 | Input | Y | email format |
| password | 비밀번호 | Password | Y | min 8 |
| passwordConfirm | 비밀번호 확인 | Password | Y | password 일치 |

---

#### 10-B. 주말버스 예약 -- 좌석 선택 (BUS-01, D-01~03)

**페이지 레이아웃 (antd Row, gutter=[16,16]):**
- 좌측 Col(span=12): 버스 정보 선택 폼
- 우측 Col(span=12): SeatGrid 컴포넌트

**버스 정보 선택 폼:**

| name | label | type | required |
|------|-------|------|----------|
| operationDate | 운행일자 | DatePicker | Y |
| routeId | 노선 (출발지→도착지) | Select | Y |
| departureTime | 출발시간 | Select | Y (노선 선택 후 동적 로드) |
| stopover | 경유지 | text (읽기전용) | N |

버스 정보 선택 후 SeatGrid 렌더링.

**SeatGrid 컴포넌트 (D-01~03):**

```
[운전석]                              (Row justify="end")
[1A][1B] [통로] [1C][1D]              (Row gutter=[4,4])
[2A][2B] [통로] [2C][2D]
...
[범례: 빈좌석(파랑) / 예약됨(회색) / 내선택(초록) / 불가(빨간)]
```

- 좌석 Button size: 40px x 40px, border-radius 4px
- 좌석 배치: seats.length / 4 행, 4열 + 통로(Col span=2)
- onClick: available 좌석만 클릭 가능, selected ↔ available 토글
- readOnly: BUS-03 배차관리 좌석확인 시 true

**예약 완료 후:** `[승차권 발급]` 버튼 노출 → PrintableReport 렌더링

---

#### 10-C. 승차권 (BUS-01, D-32)

**PrintableReport 기반 antd Descriptions (layout="vertical"):**

```
[주말버스 예약 승차권]                    (제목, 24px, 700, center)
─────────────────────────────────────
노선:     서울 → 포항          좌석: 2B
운행일자:  2026-04-12 (일)     출발: 09:00
출발지:   서울 용산             도착지: 경북 포항
경유지:   충북 청주
─────────────────────────────────────
예약자:   홍길동 (해병 상사)
군번:     20-123456           소속: 1사단
─────────────────────────────────────
[QR코드 자리: placeholder 이미지 120x120]
─────────────────────────────────────
본 승차권은 탑승 시 제시하여야 합니다.
```

**print.css:** A4 portrait, margin 20mm, font-size 12pt.

---

#### 10-D. 주말버스 예약현황 (BUS-02)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| operationDate | 운행일자 | 120 | date | Y | |
| route | 노선 | 150 | text | Y | 출발지→도착지 |
| direction | 상하행 | 70 | text | N | 상행/하행 |
| departureTime | 출발시간 | 80 | time | Y | |
| totalSeats | 총좌석 | 70 | number | N | |
| reservedCount | 예약인원 | 80 | number | Y | |
| unit | 소속부대 | 120 | text | N | |
| userName | 예약자 | 80 | text | N | |
| seatNo | 좌석번호 | 70 | text | N | |
| status | 상태 | 100 | StatusBadge | Y | reserved/cancelled/waiting |

**toolBarRender:** `[엑셀 다운로드]` `[인쇄]`

**행 액션:** `[승차권 발급]` `[예약 취소]`

**SearchForm 필드:**

| name | label | type |
|------|-------|------|
| operationDate | 운행일자 | DatePicker.RangePicker |
| routeId | 노선 | Select |
| unit | 부대명 | Input |
| keyword | 예약자 성명/군번 | Input |

---

#### 10-E. 배차관리 (BUS-03)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| direction | 상하행구분 | 80 | text | Y | 상행/하행 |
| operationDate | 운행일자 | 120 | date | Y | |
| departureTime | 출발시간 | 80 | time | Y | |
| departure | 출발지 | 120 | text | N | |
| destination | 도착지 | 120 | text | N | |
| totalSeats | 좌석수 | 70 | number | N | |
| assignStatus | 배정여부 | 100 | StatusBadge | Y | assigned/unassigned |
| reservedCount | 예약인원 | 80 | number | N | |

**toolBarRender:** `[신규 등록]`

**행 액션:** `[배정]` `[배정취소]` `[좌석배치 확인]` (SeatGrid readOnly=true Modal)

**배차 등록/수정 폼:**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| direction | 상하행구분 | Select | Y | 상행/하행 |
| operationDate | 운행일자 | DatePicker | Y | |
| departureTime | 출발시간 | TimePicker | Y | HH:mm |
| departure | 출발지 | Input | Y | max 100 |
| destination | 도착지 | Input | Y | max 100 |
| stopover | 경유지 | Input | N | max 200 |
| totalSeats | 좌석수 | InputNumber | Y | min 1, max 50 |
| vehicleNo | 차량번호 | Input | N | max 20 |

---

#### 10-F. 예약시간관리 (BUS-04, D-27)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| routeId | 구간 | 150 | text | Y | |
| rank | 계급 | 80 | text | Y | |
| operationDate | 일자 | 120 | date | Y | |
| reservationRank | 예약순위 | 80 | number | Y | |
| openTime | 예약시작시간 | 80 | time | Y | |
| closeTime | 예약종료시간 | 80 | time | Y | |

**toolBarRender:** `[신규 등록]`

**등록/수정 폼:**

| name | label | type | required |
|------|-------|------|----------|
| routeId | 구간 | Select | Y |
| rank | 계급 | Select | Y |
| operationDate | 일자 | DatePicker | Y |
| reservationRank | 예약순위 | InputNumber | Y |
| openTime | 예약시작시간 | TimePicker | Y |
| closeTime | 예약종료시간 | TimePicker | Y |

---

#### 10-G. 대기자관리 (BUS-05, D-25/26)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| waitingNo | 대기순번 | 70 | number | Y | FIFO 기준 |
| operationDate | 운행일자 | 120 | date | Y | |
| route | 노선 | 150 | text | N | |
| userName | 성명 | 80 | text | N | |
| rank | 계급 | 80 | text | Y | |
| unit | 소속 | 120 | text | N | |
| waitingDate | 대기신청일 | 120 | date | Y | |
| assignedSeat | 배정좌석 | 80 | text | N | 배정 후 표시 |
| status | 상태 | 100 | StatusBadge | Y | waiting/assigned/cancelled |

**toolBarRender:** `[자동 배정]` (D-25) `[엑셀 다운로드]`

**행 액션:** `[수동 배정]` (좌석 Select 드롭다운, D-26)

**수동 배정 폼 (Modal):**

| name | label | type |
|------|-------|------|
| seatId | 배정 좌석 선택 | Select (빈좌석 목록) |

---

#### 10-H. 위규자관리 (BUS-07, D-28/29)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| userName | 성명 | 80 | text | N | |
| militaryId | 군번 | 100 | text | N | |
| rank | 계급 | 80 | text | Y | |
| unit | 소속 | 120 | text | N | |
| violationType | 위규유형 | 120 | text | Y | |
| sanctionStart | 제재시작일 | 120 | date | Y | |
| sanctionEnd | 제재종료일 | 120 | date | Y | |
| sanctionStatus | 제재상태 | 100 | StatusBadge | Y | sanctioned/sanction_expired |
| registeredAt | 등록일 | 120 | date | Y | |

**toolBarRender:** `[신규 등록]` `[인쇄]`

**등록/수정 폼 (D-28):**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| militaryId | 군번 | Input | Y | max 10 |
| userName | 성명 | Input | Y | max 20 |
| rank | 계급 | Select | Y | |
| unit | 소속 | Input | Y | max 100 |
| violationType | 위규유형 | Select | Y | 무단취소/탑승거부/기타 |
| violationReason | 위규사유 | TextArea | Y | max 500 |
| sanctionPeriod | 제재기간 | DatePicker.RangePicker | Y | (D-28) |

---

#### 10-I. 타군 사용자 관리 (BUS-08)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| militaryBranch | 군구분 | 80 | text | Y | |
| unitName | 부대명 | 120 | text | N | |
| militaryId | 군번 | 100 | text | N | |
| rank | 계급 | 80 | text | Y | |
| name | 성명 | 80 | text | N | |
| position | 직책 | 100 | text | N | |
| phone | 전화번호 | 120 | text | N | |
| email | 메일주소 | 150 | text | N | |
| status | 상태 | 100 | StatusBadge | Y | pending/approved/rejected |
| registeredAt | 등록일 | 120 | date | Y | |

**toolBarRender:** `[신규 등록]` `[패스워드 초기화]` (선택 행 활성화) `[엑셀 다운로드]`

**행 액션:** `[승인]` `[반려]` (상태 pending 시만 노출)

---

#### 10-J. 사용현황 (BUS-06)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable |
|-----------|-------|-------|------|----------|
| operationDate | 운행일자 | 120 | date | Y |
| route | 노선 | 150 | text | Y |
| unit | 소속부대 | 120 | text | Y |
| totalSeats | 총좌석 | 70 | number | N |
| usedSeats | 사용좌석 | 70 | number | N |
| usageRate | 사용률 | 80 | percent | Y |

**toolBarRender:** `[인쇄]`

**SearchForm:**

| name | label | type |
|------|-------|------|
| dateRange | 기간 | DatePicker.RangePicker |
| routeId | 노선 | Select |
| unit | 부대명 | Input |

---

### SYS18: 직무기술서관리체계 (47개 프로세스)

---

#### 18-A. 직무기술서 작성 -- Tabs + Steps 폼 (JOB-01, D-13~16)

**페이지 구조:**

```
[Tabs]
  [나의 개인직무기술서] | [직책 개인직무기술서] | [부서직무기술서]
```

각 탭은 동일한 `JobDescFormPage` 컴포넌트, `type='personal'|'position'|'department'` prop.

**목록 테이블 컬럼 (각 탭 공통):**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| diagnosisName | 조직진단명 | 150 | text | N | |
| writerName | 작성자 | 80 | text | N | 개인JD만 |
| department | 부서 | 120 | text | Y | |
| position | 직책 | 100 | text | N | |
| status | 상태 | 100 | StatusBadge | Y | draft/submitted/completed/rejected |
| createdAt | 작성일 | 120 | date | Y | |
| submittedAt | 제출일 | 120 | date | N | |

**toolBarRender:** `[직무기술서 작성]` `[인쇄]`

**행 액션:** `[상세]` `[수정]` `[복사]` `[삭제]` `[인쇄]`

---

#### 18-B. 직무기술서 5단계 Steps 폼 (JOB-01, D-13~15)

**Steps 헤더 (antd Steps, direction="horizontal"):**

```
[1. 기본정보] → [2. 업무분류/비율] → [3. 시간배분] → [4. 역량/자격요건] → [5. 완료/제출]
```

**각 단계별 하단 버튼:**

| 단계 | 왼쪽 | 오른쪽 |
|------|------|--------|
| 1 | - | `[임시저장]` `[다음 단계]` |
| 2~3 | `[이전 단계]` | `[임시저장]` `[다음 단계]` |
| 4 | `[이전 단계]` | `[임시저장]` `[다음 단계]` |
| 5 | `[이전 단계]` | `[결재 요청]` |

**대리작성 모드 (D-19):** CrudForm 상단에 "작성자 선택" Select 드롭다운 추가 (부서관리자 권한).

---

#### 18-C. Step 1 -- 기본정보

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| diagnosisId | 조직진단 | Select | Y | 조직진단 목록에서 선택 |
| writerMilitaryId | 군번 | Input (읽기전용) | Y | 로그인 사용자 자동 |
| writerName | 성명 | Input (읽기전용) | Y | |
| rank | 계급 | Input (읽기전용) | Y | |
| position | 직책 | Input | Y | max 50 |
| department | 부서 | Input | Y | max 100 |
| unit | 소속 | Input (읽기전용) | Y | |
| phone | 전화번호 | Input | N | |
| submissionPeriod | 작성기간 | text (읽기전용) | N | 조직진단에서 자동 |

---

#### 18-D. Step 2 -- 업무분류/비율 (Form.List, D-14)

**Form.List 동적 업무 항목:**

각 항목 필드:

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| taskType | 업무유형 | Select | Y | 정책/관리/지원/기타 |
| taskName | 업무명 | Input | Y | max 100 |
| taskDetail | 세부내용 | TextArea | N | max 300 |
| ratio | 비율(%) | InputNumber | Y | min 1, max 100 |

- `[업무 추가]` 버튼으로 항목 추가
- 각 항목 우측 `[삭제]` 아이콘
- 비율 합계 실시간 표시: "합계: {n}%" (100% 이탈 시 #ff4d4f 텍스트 경고)
- 저장 시 합계 100% 검증 (D-14)

---

#### 18-E. Step 3 -- 시간배분

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| standardHours | 표준업무시간 (주간) | InputNumber (읽기전용) | - | 표준업무시간관리에서 자동 로드 |
| taskTimeList | 업무별 시간배분 | Form.List | Y | 각 업무 (Step 2 항목 연동) |

Form.List (업무별 시간):

| name | label | type | required |
|------|-------|------|----------|
| taskName | 업무명 | text (읽기전용) | - |
| weeklyHours | 주간 시간 | InputNumber | Y |
| percentage | 비율(%) | text (자동계산) | - |

---

#### 18-F. Step 4 -- 역량/자격요건

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| requiredCompetency | 필요역량 | TextArea | N | max 500 |
| requiredQualification | 자격요건 | TextArea | N | max 500 |
| educationRequired | 교육이수 요건 | TextArea | N | max 300 |
| experienceRequired | 경력요건 | TextArea | N | max 300 |
| specialNote | 특이사항 | TextArea | N | max 300 |

---

#### 18-G. Step 5 -- 완료/제출

**antd Descriptions (layout="vertical", column=2)로 입력 내용 최종 확인:**
- 기본정보 요약 (성명, 직책, 부서)
- 업무분류 건수, 시간배분 요약
- 상태: draft → submitted (결재 요청 시)

**결재선 확인 영역:**
- 1차 결재자 / 2차 결재자 (부서별 설정값 표시)

---

#### 18-H. 직무기술서 조회(관리자) -- 목록 (JOB-02)

**Tabs:**
- `[개인직무기술서]` `[부서직무기술서]`

**개인직무기술서 테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| diagnosisName | 진단명 | 150 | text | Y | |
| writerName | 작성자 | 80 | text | N | |
| department | 부서 | 120 | text | Y | |
| position | 직책 | 100 | text | N | |
| rank | 계급 | 80 | text | Y | |
| status | 상태 | 100 | StatusBadge | Y | |
| submittedAt | 제출일 | 120 | date | Y | |
| reviewResult | 검토결과 | 120 | text | N | |

**toolBarRender:** `[인쇄]` `[엑셀 다운로드]`

**행 액션:** `[상세]` `[검토결과 입력]` `[의견 보내기]` `[반송]`

**SearchForm 필드:**

| name | label | type |
|------|-------|------|
| diagnosisName | 진단명 | Select |
| dateRange | 검색기간 | DatePicker.RangePicker |
| unit | 부대명 | Input |
| position | 직책명 | Input |

---

#### 18-I. 검토결과 입력 / 의견보내기 Modal (JOB-02, D-20)

**검토결과 입력 Modal:**

| name | label | type | required |
|------|-------|------|----------|
| reviewResult | 검토결과 | Select | Y (적합/수정필요/부적합) |
| reviewComment | 검토의견 | TextArea | Y (max 500) |

**의견보내기 Modal:**

| name | label | type | required |
|------|-------|------|----------|
| opinionContent | 의견 내용 | TextArea | Y (max 500) |

**반송 ConfirmDialog:**
- title: "직무기술서 반송"
- 추가 입력: `returnReason` TextArea (필수, max 500)

---

#### 18-J. 관리자 통계 차트 (JOB-02)

**차트 1: 작성 현황 -- Bar Chart (수평)**
- y축: 부대 목록
- x축: 작성완료 / 작성중 / 미작성 건수 (스택)
- 색상: green / blue / default
- 높이: 300px

**차트 2: 직급별 현황 -- Column Chart**
- x축: 계급 구분
- y축: 완료 건수
- 색상: NAVY accent
- 높이: 300px

**차트 3: 업무분류별 분포 -- Pie Chart**
- 분류: 정책/관리/지원/기타
- 색상: 4-색 팔레트
- 높이: 300px

**SearchForm (통계):**

| name | label | type |
|------|-------|------|
| diagnosisName | 진단명 | Select |
| dateRange | 기간 | DatePicker.RangePicker |
| unit | 부대명 | Input |

---

#### 18-K. 결재 -- Steps 워크플로우 (JOB-03, D-17~18)

**Steps 시각화 (antd Steps, direction="horizontal"):**

```
[1. 작성] → [2. 1차 결재] → [3. 2차 결재] → [4. 완료]
```

| step | title | status 조건 |
|------|-------|------------|
| 0 | 작성 | finish (항상) |
| 1 | 1차 결재 | finish/process/error/wait |
| 2 | 2차 결재 | finish/process/error/wait |
| 3 | 완료 | finish/wait |

**결재대기 목록 테이블:**

| dataIndex | title | width | type | sortable |
|-----------|-------|-------|------|----------|
| writerName | 작성자 | 80 | text | N |
| department | 부서 | 120 | text | Y |
| jobDescType | 유형 | 80 | text | Y | 개인/부서 |
| submittedAt | 제출일 | 120 | date | Y |
| approvalStep | 결재단계 | 100 | text | N | 1차/2차 |
| status | 상태 | 100 | StatusBadge | Y |

**결재 액션 버튼:**
- `[승인]` (primary, green) `[반려]` (danger)
- 반려 시: `rejectReason` TextArea ConfirmDialog

**결재자 관리 DataTable (D-17):**

| dataIndex | title | width | type |
|-----------|-------|-------|------|
| department | 부서 | 150 | text |
| firstApprover | 1차 결재자 | 120 | text |
| secondApprover | 2차 결재자 | 120 | text |

CrudForm 폼:

| name | label | type | required |
|------|-------|------|----------|
| department | 부서 | Select | Y |
| firstApproverId | 1차 결재자 | Select (사용자 목록) | Y |
| secondApproverId | 2차 결재자 | Select (사용자 목록) | Y |

---

#### 18-L. 조직진단 대상 관리 (JOB-04, D-30)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| diagnosisName | 조직진단명 | 200 | text (링크) | N | |
| diagnosisUnit | 조직진단부대 | 150 | text | Y | |
| writePeriodStart | 작성기간 시작 | 120 | date | Y | |
| writePeriodEnd | 작성기간 종료 | 120 | date | Y | |
| diagnosisPeriodStart | 진단기간 시작 | 120 | date | Y | |
| diagnosisPeriodEnd | 진단기간 종료 | 120 | date | Y | |
| targetCount | 진단대상자 수 | 80 | number | N | |
| progressStatus | 진행현황 | 100 | StatusBadge | N | |

**toolBarRender:** `[신규 등록]`

**행 액션:** 진단기간 이전이면 `[수정]` `[삭제]`, 이후이면 비활성화 + tooltip "진단기간 이후 수정/삭제 불가" (D-30 규칙)

**등록/수정 폼:**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| diagnosisName | 조직진단명 | Input | Y | max 100 |
| diagnosisUnit | 조직진단부대 | Input | Y | max 100 |
| writePeriod | 작성기간 | DatePicker.RangePicker | Y | |
| diagnosisPeriod | 진단기간 | DatePicker.RangePicker | Y | |
| targetUsers | 진단대상자 | Select (다중선택) | N | 사용자 목록 |

---

#### 18-M. 표준업무시간 관리 (JOB-08, D-30~31)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| rankCategory | 신분 | 100 | text | Y | 장관/영관/부사관/원사/병 |
| standardHours | 표준업무시간 (주간) | 120 | number | Y | 단위: 시간 |
| periodStart | 적용시작일 | 120 | date | Y | |
| periodEnd | 적용종료일 | 120 | date | Y | |
| applyStatus | 적용상태 | 120 | StatusBadge | Y | active/upcoming/expired (D-31 프론트 자동계산) |

**StatusBadge 자동계산 로직:**
```
today = dayjs()
if today > periodEnd → 'expired' (적용만료, default)
if today >= periodStart && today <= periodEnd → 'active' (적용중, green)
if today < periodStart → 'upcoming' (적용예정, blue)
```

**toolBarRender:** `[신규 등록]`

**등록/수정 폼:**

| name | label | type | required | validation |
|------|-------|------|----------|------------|
| rankCategory | 신분 | Select | Y | 장관/영관/부사관/원사/병 |
| standardHours | 표준업무시간 (주간, 시간) | InputNumber | Y | min 1, max 60 |
| applyPeriod | 적용기간 | DatePicker.RangePicker | Y | |

---

## 재사용 컴포넌트 매핑 (Phase 3~4 패턴 재사용)

| Phase | 원본 컴포넌트 | Phase 5 재사용처 |
|-------|-------------|----------------|
| Phase 4 | InspectionApprovalPage Steps 결재 | JOB-03 결재, MDATA-02 대출 워크플로우 |
| Phase 4 | KnowledgeStatsPage @ant-design/charts | MDATA-03 통계, JOB-02 관리자 통계 |
| Phase 4 | SurveyQuestionEditor Form.List | JOB-01 Step2 업무분류 동적 추가 |
| Phase 4 | sys09 PrintableReport + print.css | BUS-01 승차권 발급, MDATA-03 통계 인쇄 |
| Phase 1 | BoardListPage (sysCode=sys07) | MDATA 게시판 없음 (해당 없음) |
| Phase 1 | BoardListPage (sysCode=sys10) | BUS-09 공지/질의응답 |
| Phase 1 | BoardListPage (sysCode=sys18) | JOB-05 공지/질의응답/자료실 |
| Phase 1 | code-mgmt | JOB-06 공통코드관리 |
| Phase 1 | auth-group | JOB-07 사용자권한관리 |

---

## 신규 UI 패턴 상세 계약

### Pattern A: SeatGrid 컴포넌트 (BUS-01~03)

**파일:** `navy-admin/src/pages/sys10-weekend-bus/SeatGrid.tsx`

**Props:**
```typescript
interface SeatGridProps {
  seats: Seat[]           // 전체 좌석 배열
  onSeatClick: (seatId: string) => void
  readOnly?: boolean      // true: 배차관리 확인용 (클릭 불가)
}
```

**Seat 타입:**
```typescript
type SeatStatus = 'available' | 'reserved' | 'selected' | 'unavailable'
interface Seat {
  id: string
  seatNo: string          // 예: "1A", "2C"
  status: SeatStatus
}
```

**색상 상수:**
```typescript
const STATUS_COLOR: Record<SeatStatus, string> = {
  available: '#1677ff',
  reserved: '#8c8c8c',
  selected: '#52c41a',
  unavailable: '#ff4d4f',
}
```

**그리드 레이아웃:**
- 행수: `Math.ceil(seats.length / 4)`
- 열배치: `[Col(5)][Col(5)]` + `[Col(2) 통로]` + `[Col(5)][Col(5)]`
- 좌석 Button: width 40px, height 40px, border-radius 4px, white 텍스트
- 운전석: Row justify="end" 상단 배치, disabled Button
- 범례: Row, gutter=8, 하단 margin-top 12px

---

### Pattern B: Upload + 검증 Modal (MDATA-01 일괄등록, MDATA-01 평가심의)

**Upload 설정:**
- component: `antd Upload.Dragger`
- accept: `.xlsx, .xls`
- maxCount: 1
- beforeUpload: 클라이언트 사이드 파일 검증 후 MSW POST 요청

**검증 Modal 구조:**
- antd Modal, title: "업로드 검증 결과"
- 성공 건수: `<Text type="success">정상 {n}건</Text>`
- 오류 건수: `<Text type="danger">오류 {e}건</Text>`
- 오류 테이블: antd Table, columns: [행번호, 오류컬럼, 오류내용]
- footer: `[취소]` `[저장]` (오류 0건일 때만 저장 버튼 활성화)

---

### Pattern C: 비밀등급 경고 Modal (MDATA-02)

- antd Modal.confirm 변형 사용
- title: `<><Tag color="red">[비밀]</Tag> 자료 열람 신청</>`
- content: "이 자료는 [비밀] 등급입니다. 열람 사유를 입력하세요."
- TextArea: `usagePurpose` (열람사유, required, max 500)
- 버튼: `[취소]` `[신청]`

---

### Pattern D: 직무기술서 멀티스텝 폼 임시저장

**임시저장 로직:**
1. `[임시저장]` 클릭 → form.validateFields() 생략 → draft 상태로 PATCH
2. `message.success('임시저장되었습니다.')`
3. URL 파라미터에 jobDescId 유지 (새로고침 후 이어쓰기 가능)

**제출 로직:**
1. 마지막 단계에서 `[결재 요청]` 클릭
2. 전체 폼 최종 검증 (비율 합계 100% 포함)
3. 상태 draft → submitted 변경
4. `message.success('결재 요청이 완료되었습니다.')`

---

## Pre-Population 출처

| 항목 | 출처 |
|------|------|
| Design system (Ant Design 5) | CONTEXT.md D-01~38, Phase 0 결정 |
| 보안등급 Tag 색상 | CONTEXT.md D-04 |
| 좌석 상태 색상 | CONTEXT.md D-01 |
| Steps 대출 워크플로우 | CONTEXT.md D-08/09 |
| Upload + 검증 Modal | CONTEXT.md D-11/12 |
| Steps 5단계 JD 폼 | CONTEXT.md D-13~16 |
| Form.List 비율 검증 | CONTEXT.md D-14 |
| 타군 로그인 경로 | CONTEXT.md D-21~24 |
| 자동배정 FIFO | CONTEXT.md D-25 |
| 위규자 RangePicker | CONTEXT.md D-28 |
| 표준업무시간 상태계산 | CONTEXT.md D-31 |
| 승차권 PrintableReport | CONTEXT.md D-32 |
| 게시판/코드/권한 재사용 | CONTEXT.md D-34~36 |
| 차트 패턴 | CONTEXT.md D-37, Phase 4 UI-SPEC |
| 테이블 컬럼 상세 | req_analysis.txt 284~327행, 427~472행, 771~819행 |
| 색상/폰트/스페이싱 | Phase 4 UI-SPEC (동결값 상속) |
