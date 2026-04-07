---
phase: 4
slug: 04-a-6-medium-subsystems
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-06
---

# Phase 4 -- UI Design Contract

> Phase 4: 중복잡도 서브시스템 A 6개 (176개 프로세스) -- 설문종합(sys02), 해병대규정(sys06), 영현보훈(sys09), 지시건의사항(sys12), 지식관리(sys13), 검열결과(sys17)
> gsd-ui-researcher 생성, gsd-ui-checker 검증 대상.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (shadcn 미사용 -- Ant Design 5 ProComponents 채택, Phase 0 결정) |
| Preset | not applicable |
| Component library | Ant Design 5.29.3 + @ant-design/pro-components 2.8.10 |
| Chart library | @ant-design/charts 2.6.7 (Phase 4 신규 설치) |
| DnD library | @dnd-kit/core 6.3.1 + @dnd-kit/sortable 10.0.0 (Phase 4 신규 설치) |
| Icon library | @ant-design/icons (antd 번들 포함) |
| Font | Noto Sans KR, -apple-system, BlinkMacSystemFont, sans-serif (Phase 0 동결값) |

**Registry Safety Gate:** shadcn 미초기화이므로 적용 안 함. 신규 npm 패키지(@ant-design/charts, @dnd-kit)는 공식 npm 레지스트리에서 설치.

---

## Spacing Scale

Phase 1/2 동결값 상속. 4의 배수 원칙.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 아이콘 간격, 인라인 패딩, 태그 내부 |
| sm | 8px | 컴팩트 요소 간격, StatusBadge 간 여백 |
| md | 16px | 기본 요소 간격, SearchForm gutter, Card gutter |
| lg | 24px | 섹션 패딩, Card bodyStyle padding, Descriptions 패딩 |
| xl | 32px | 레이아웃 패널 간격, 보고서 섹션 간격 |
| 2xl | 48px | 주요 섹션 구분 (통계 차트와 테이블 사이) |
| 3xl | 64px | 페이지 레벨 상단 여백 |

Exceptions:
- 설문 문항 편집기: DnD 아이템 간격 12px (4의 배수, 드래그 핸들 터치 영역 확보)
- 보고서/확인서 Print CSS: A4 margin 20mm, 내부 padding xl(32px)
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

추가 타이포그래피 (Phase 4 신규):
- 보고서 제목: 24px, weight 700, line-height 1.2, text-align center
- 보고서 본문: 14px, weight 400, line-height 1.8 (가독성 강화)
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
- Primary 버튼 (등록, 저장, 승인, 제출)
- 활성 메뉴 아이템 하이라이트
- Steps 컴포넌트 현재 단계 아이콘
- 차트 기본 막대/선 색상
- Progress 바 완료 영역

추가 시맨틱 색상 (Phase 4 신규):

| Status | Color | antd preset | 사용처 |
|--------|-------|-------------|--------|
| 승인/완료 | #52c41a | green-6 | StatusBadge, Steps 완료 |
| 진행중 | #1890ff | blue-6 | StatusBadge, Progress |
| 대기 | #faad14 | gold-6 | StatusBadge, Steps 대기 |
| 반려/지연 | #ff4d4f | red-5 | StatusBadge, Steps 에러 |
| 미착수 | #d9d9d9 | gray-5 | StatusBadge 기본값 |
| 마감 | #8c8c8c | gray-7 | 설문 마감, 지난 설문 |

차트 팔레트 (@ant-design/charts 기본):
- 시리즈 1: #003366 (NAVY, accent)
- 시리즈 2: #1890ff (blue-6)
- 시리즈 3: #52c41a (green-6)
- 시리즈 4: #faad14 (gold-6)
- 시리즈 5: #ff4d4f (red-5)

---

## Copywriting Contract

### 서브시스템 공통

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

### sys02 설문종합관리체계 전용

| Element | Copy |
|---------|------|
| 설문 생성 CTA | "설문 생성" |
| 문항 추가 CTA | "문항 추가" |
| 설문 배포 CTA | "설문 배포" |
| 설문 마감 CTA | "설문 마감" |
| 설문 제출 CTA | "승인 요청" |
| 설문 재작성 CTA | "재작성 (복사)" |
| 설문 참여 CTA | "설문 참여" |
| 설문 대상 아님 | "본 설문의 대상자가 아닙니다." |
| 설문 마감됨 | "설문 조사 기간이 종료되었습니다." |
| 설문 결과 비공개 | "결과가 비공개 처리된 설문입니다." |
| Empty (나의 설문) | "등록한 설문이 없습니다. '설문 생성' 버튼으로 새 설문을 만드세요." |
| Empty (설문참여) | "현재 참여 가능한 설문이 없습니다." |
| 응답 완료 | "설문 응답이 완료되었습니다." |
| 반려 사유 입력 | "반려 사유를 입력하세요 (필수)" |

### sys09 영현보훈체계 전용

| Element | Copy |
|---------|------|
| 보고서 출력 CTA | "보고서 인쇄" |
| 확인서 출력 CTA | "확인서 인쇄" |
| Empty (사망자) | "등록된 사망자 정보가 없습니다." |
| Empty (상이자) | "등록된 상이자 정보가 없습니다." |
| Empty (심사) | "등록된 전공사상심사 정보가 없습니다." |
| 보고서 헤더 | "해병대 영현보훈 관리" |
| 확인서 서명란 | "확인자: _________________ (인)" |

### sys12 지시건의사항관리체계 전용

| Element | Copy |
|---------|------|
| 지시 등록 CTA | "지시사항 등록" |
| 건의 등록 CTA | "건의사항 등록" |
| 조치 등록 CTA | "조치사항 등록" |
| Empty (지시사항) | "등록된 지시사항이 없습니다." |
| Empty (건의사항) | "등록된 건의사항이 없습니다." |
| 추진현황 제목 | "추진현황 총괄" |

### sys13 지식관리체계 전용

| Element | Copy |
|---------|------|
| 지식 등록 CTA | "지식 등록" |
| 추천 CTA | "추천" |
| 비추천 CTA | "비추천" |
| 댓글 작성 CTA | "댓글 등록" |
| 지식 숨김 CTA | "숨김 처리" |
| Empty (지식열람) | "등록된 지식이 없습니다. 검색 조건을 변경해 보세요." |
| Empty (나의 지식) | "등록한 지식이 없습니다. '지식 등록' 버튼으로 새 지식을 등록하세요." |

### sys17 검열결과관리체계 전용

| Element | Copy |
|---------|------|
| 검열계획 등록 CTA | "검열계획 작성" |
| 조치과제 등록 CTA | "조치과제 작성" |
| 조치결과 입력 CTA | "조치결과 입력" |
| 결재 접수 CTA | "접수 (승인)" |
| 결재 반송 CTA | "반송 (반려)" |
| Empty (검열계획) | "등록된 검열계획이 없습니다." |
| Empty (조치과제) | "등록된 조치과제가 없습니다." |

---

## Component Inventory

### Phase 0/1 재사용 컴포넌트 (변경 없음)

| Component | Path | 사용처 |
|-----------|------|--------|
| DataTable | shared/ui/DataTable/ | 모든 목록 화면 |
| CrudForm | shared/ui/CrudForm/ | 등록/수정 폼 |
| DetailModal | shared/ui/DetailModal/ | 상세 조회 팝업 |
| SearchForm | shared/ui/SearchForm/ | 검색 폼 |
| StatusBadge | shared/ui/StatusBadge/ | 상태 표시 |
| ConfirmDialog | shared/ui/ConfirmDialog/ | 삭제/반려 확인 |
| BoardListPage | pages/common/board/ | 공통게시판 (sysCode 재사용) |
| ApprovalLinePage | pages/common/approval/ | 결재선 관리 |
| auth-group pages | pages/common/auth-group/ | 권한관리 |
| code-mgmt pages | pages/common/code-mgmt/ | 코드관리 |
| sys05 pages | pages/sys05-admin-rules/ | 규정관리 재사용 (D-14) |
| sys14 pages | pages/sys14-suggestion/ | 추천/신고 패턴 참조 (D-19) |

### Phase 4 신규 UI 패턴

| Pattern | antd 컴포넌트 | 사용처 |
|---------|--------------|--------|
| 결재 플로우 시각화 | Steps + StatusBadge | sys17 결재 (INSP-05) |
| 설문 문항 편집기 | Form.List + dnd-kit | sys02 나의 설문 (SURV-02) |
| 통계 차트 | @ant-design/charts (Bar, Line, Pie) | sys02/09/12/13/17 통계 |
| 대시보드 카드 | Card + Statistic | sys12/13 메인화면 |
| 이행/처리현황 | Progress + Timeline | sys12 지시/건의 (DRCT-01/04) |
| 보고서/확인서 | Descriptions + Typography + Print CSS | sys09 보고서 (HONOR-10~16) |
| 문서 뷰어 | antd iframe/embed | sys06 규정 열람 (MREG-01) |
| 추진현황 매트릭스 | antd Table (커스텀 컬럼) + Progress | sys12/17 추진현황 |

---

## 서브시스템별 상세 UI Contract

---

### SYS02: 설문종합관리체계 (31개 프로세스)

#### 02-A. 나의 설문관리 -- 목록 (나의 설문관리)

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| surveyName | 설문명 | 250 | text (링크) | N | 클릭 시 상세 조회 |
| status | 상태 | 100 | StatusBadge | Y | draft/submitted/approved/rejected/active/closed |
| targetCount | 대상자 수 | 100 | number | Y | |
| responseCount | 응답자 수 | 100 | number | Y | |
| createdAt | 등록일 | 120 | date | Y | YYYY-MM-DD |
| startDate | 시작일 | 120 | date | Y | |
| endDate | 종료일 | 120 | date | Y | |

**StatusBadge colorMap:**

| status | label | color |
|--------|-------|-------|
| draft | 작성중 | default |
| submitted | 제출됨 | orange |
| approved | 승인 | blue |
| rejected | 반려 | red |
| active | 진행중 | cyan |
| closed | 마감 | gray |

**toolBarRender:** `[신규 등록]` 버튼 (primary)

#### 02-B. 설문조사 설정 등록/수정 폼

**CrudForm fields:**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| surveyName | 설문명 | text | Y | maxLength: 100 |
| description | 설문내용(개요) | textarea | Y | maxLength: 2000 |
| startDate | 시작일 | date | Y | |
| endDate | 종료일 | date | Y | startDate 이후만 선택 가능 |
| targetType | 대상 구분 | select | Y | 부대/직급/전체 |
| targetUnits | 대상 부대 | select (multiple) | 조건부 | targetType='부대' 시 표시 |
| targetRanks | 대상 직급 | select (multiple) | 조건부 | targetType='직급' 시 표시 |
| isPublicResult | 결과 공개 | select | Y | 공개/비공개 |
| isAnonymous | 익명 여부 | select | Y | 익명/실명 |

#### 02-C. 설문 문항 편집기 (SurveyQuestionEditor)

**UI 구조:** antd Form.List + @dnd-kit/sortable
- 좌측: 문항 목록 (드래그 핸들 + 문항번호 + 문항 미리보기)
- 우측: 선택된 문항 편집 영역

**문항 필드:**

| name | label | type | required | 비고 |
|------|-------|------|----------|------|
| questionText | 문항 내용 | textarea | Y | maxLength: 500 |
| questionType | 문항 유형 | select | Y | radio/checkbox/textarea/rate |
| isRequired | 필수 응답 | switch | N | default: true |
| options | 선택지 목록 | Form.List (동적) | 조건부 | questionType이 radio/checkbox일 때 |

**문항 유형별 렌더링:**
- `radio`: antd Radio.Group -- 선택지 목록 표시
- `checkbox`: antd Checkbox.Group -- 선택지 목록 표시
- `textarea`: antd TextArea -- 자유 입력
- `rate`: antd Rate -- 별점 1~5

**DnD 인터랙션:**
- 드래그 핸들: 좌측 `HolderOutlined` 아이콘 (24x24px, 커서 grab)
- 드래그 중: opacity 0.5, border 2px dashed #003366
- 드롭 완료: 문항 번호 자동 재정렬

**추가 기능:**
- `[문항 추가]` 버튼: 목록 하단, type="dashed" 전체 너비
- `[엑셀 업로드]` 버튼: 엑셀 파일에서 문항 일괄 등록
- `[엑셀 양식 다운로드]` 버튼: 업로드용 양식 파일 다운로드
- 엑셀 업로드 시 데이터 오류 표시: antd Alert type="error" + 오류 행 목록

#### 02-D. 설문 참여 -- 목록

**테이블 컬럼:**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| surveyName | 설문명 | 300 | text (링크) | 클릭 시 설문 응답 페이지 |
| authorName | 등록자 | 100 | text | |
| startDate | 시작일 | 120 | date | |
| endDate | 종료일 | 120 | date | |
| isParticipated | 참여 여부 | 100 | StatusBadge | 참여/미참여 |

#### 02-E. 설문 응답 폼 (SurveyFormPage)

**UI 구조:** antd Card 안에 문항별 Form.Item 동적 렌더링
- 문항번호 + 문항내용 (Typography.Text strong)
- 필수 문항 표시: 빨간 * 마크
- 문항 유형에 따라 Radio.Group / Checkbox.Group / TextArea / Rate 렌더링
- 하단: `[제출]` 버튼 (primary) + `[임시 저장]` 버튼 (default)

**대상자 체크:** 설문 대상이 아닌 경우 antd Result status="warning" + "본 설문의 대상자가 아닙니다." 표시

#### 02-F. 설문 결과 분석 (결과 조회)

**UI 구조:** 문항별 Card 나열
- 각 문항 Card 내부:
  - 문항 내용 (Heading)
  - 객관식: @ant-design/charts Bar (가로 막대) -- 선택지별 응답 수/비율
  - 주관식: antd List -- 응답 텍스트 나열 (페이지네이션)
  - 평점: antd Rate (평균) + @ant-design/charts Bar (점수 분포)
- 상단 통계 요약: Card + Statistic (총 대상자, 응답자, 응답률)
- `[엑셀 다운로드]` 버튼: 전체 결과 엑셀 출력

**결과 공개 규칙:** 설정값이 '결과 공개'인 설문만 결과 조회 가능. 비공개 시 antd Result status="info" + "결과가 비공개 처리된 설문입니다."

#### 02-G. 체계관리 -- 승인 대기/완료

**승인 대기 테이블 컬럼:**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| surveyName | 설문명 | 250 | text (링크) | 클릭 시 상세 조회 |
| authorName | 등록자 | 100 | text | |
| submittedAt | 제출일 | 120 | date | |
| targetCount | 대상자 수 | 100 | number | |
| questionCount | 문항 수 | 80 | number | |

**상세 조회:** 설문 설정 + 문항 목록 읽기 전용 표시
**액션:** `[승인]` 버튼 (primary) + `[반려]` 버튼 (danger) -- 반려 시 사유 입력 Modal

#### 02-H. 체계관리 -- 전체 설문관리

**테이블 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| surveyName | 설문명 | 200 | text (링크) | N | |
| status | 상태 | 100 | StatusBadge | Y | 전체 상태 표시 |
| authorName | 등록자 | 100 | text | Y | |
| targetCount | 대상자 수 | 100 | number | Y | |
| responseCount | 응답자 수 | 100 | number | Y | |
| startDate | 시작일 | 120 | date | Y | |
| endDate | 종료일 | 120 | date | Y | |

**액션:** 설정 수정, 문항 수정, 삭제, 결과 조회 (드롭다운 메뉴)

#### 02-I. 지난 설문보기

승인 완료 목록과 동일 컬럼. 상태 필터: `closed`만 표시.
결과 조회 시 02-F 결과 분석 화면 재사용. 결과 공개 설문만 조회 가능.

---

### SYS06: 해병대규정관리체계 (30개 프로세스)

**재사용 전략 (D-14~16):**

| 기능 | 재사용 소스 | 변경 사항 |
|------|------------|----------|
| 현행규정 | sys05 RegulationListPage | sysCode='sys06', 타이틀 변경 |
| 해병대사령부 예규 | sys05 PrecedentHQPage | sysCode='sys06', 타이틀 변경 |
| 예하부대 예규 | sys05 PrecedentUnitPage | sysCode='sys06', 타이틀 변경 |
| 지시문서 | sys05 DirectiveListPage | sysCode='sys06', 타이틀 변경 |
| 공지사항 | common/board BoardListPage | sysCode='sys06', boardType='notice' |
| 규정예고 | common/board BoardListPage | sysCode='sys06', boardType='regulation-notice' |
| 자료실 | common/board BoardListPage | sysCode='sys06', boardType='archive' |
| 권한관리 | common/auth-group | sysCode='sys06' |

#### 06-A. 현행규정 (RegulationListPage 재사용)

**기존 sys05 테이블 컬럼 (변경 없음):**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| regulationName | 규정명 | 300 | text (링크) | 클릭 시 규정 전문 열람 |
| department | 소관부서 | 150 | text | 부/실/단 |
| version | 버전 | 80 | text | |
| effectiveDate | 시행일 | 120 | date | |
| fileCount | 첨부 | 60 | number | 파일 아이콘 + 수 |

**추가 기능:**
- 좌측 트리: 부/실/단 조직도 (antd Tree) -- 선택 시 해당 부서 규정 필터
- 규정 열람: 문서 뷰어 (PDF embed 또는 iframe). 파일 다운로드 버튼 제공
- 즐겨찾기: sys05 useFavorites 훅 재사용

#### 06-B. 예규 (예하부대) -- 조직도/링크 전시

**UI 구조:** antd Card Grid
- 각 부대(서) Card: 부대명 + 예규 페이지 외부 링크
- 링크 클릭 시 새 탭으로 이동

---

### SYS09: 영현보훈체계 (35개 프로세스)

#### 09-A. 사망자 관리

**SearchForm fields:**

| name | label | type | options | 비고 |
|------|-------|------|---------|------|
| militaryType | 군구분 | select | 해병/해군/육군/공군 | |
| serviceNumber | 군번 | text | | |
| name | 성명 | text | | |
| birthDate | 주민번호(생년월일) | text | | 6자리 또는 full |
| rank | 계급 | select | 계급 목록 | |
| unit | 소속 | select | 부대 목록 | |

**DataTable 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| serviceNumber | 군번 | 120 | text | Y | |
| name | 성명 | 100 | text (링크) | Y | 클릭 시 상세 조회 |
| rank | 계급 | 80 | text | Y | |
| unit | 소속 | 150 | text | Y | |
| deathType | 사망구분 | 100 | StatusBadge | Y | 전사/순직/병사/사고사 |
| deathDate | 사망일자 | 120 | date | Y | |
| enlistDate | 입대일자 | 120 | date | Y | |

**CrudForm fields (사망자 등록/수정):**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| serviceNumber | 군번 | text | Y | |
| name | 성명 | text | Y | |
| residentNumber | 주민등록번호 | text | Y | 마스킹 표시 (앞6-*******) |
| rank | 계급 | select | Y | 계급 목록 |
| unit | 소속 | select | Y | 부대 목록 |
| enlistDate | 입대일자 | date | Y | |
| phone | 전화번호 | text | N | |
| deathType | 사망구분 | select | Y | 전사/순직/병사/사고사 |
| deathDate | 사망일자 | date | Y | |
| deathPlace | 사망장소 | text | N | |
| deathCause | 사망원인 | textarea | N | |
| burialPlace | 안장지 | text | N | |
| familyContact | 유족 연락처 | text | N | |
| remarks | 비고 | textarea | N | |

**toolBarRender:** `[신규 등록]` (primary) + `[엑셀 다운로드]` (default)

#### 09-B. 상이자 관리

**SearchForm:** 사망자와 동일 (군구분, 군번, 성명, 생년월일, 계급, 소속)

**DataTable 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| serviceNumber | 군번 | 120 | text | Y | |
| name | 성명 | 100 | text (링크) | Y | |
| rank | 계급 | 80 | text | Y | |
| unit | 소속 | 150 | text | Y | |
| injuryType | 상이구분 | 100 | StatusBadge | Y | 전상/공상 |
| injuryGrade | 상이등급 | 80 | text | Y | |
| injuryDate | 상이일자 | 120 | date | Y | |

**CrudForm fields (상이자 등록/수정):**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| serviceNumber | 군번 | text | Y | |
| name | 성명 | text | Y | |
| residentNumber | 주민등록번호 | text | Y | 마스킹 |
| rank | 계급 | select | Y | |
| unit | 소속 | select | Y | |
| enlistDate | 입대일자 | date | Y | |
| phone | 전화번호 | text | N | |
| address | 현주소 | text | N | |
| injuryType | 상이구분 | select | Y | 전상/공상 |
| injuryGrade | 상이등급 | select | Y | 1~7급 |
| injuryDate | 상이일자 | date | Y | |
| injuryPlace | 상이장소 | text | N | |
| injuryCause | 상이원인 | textarea | N | |
| hospitalName | 치료병원 | text | N | |
| remarks | 비고 | textarea | N | |

#### 09-C. 전공사상심사 관리

**SearchForm:** 군구분, 군번, 성명, 생년월일, 계급, 소속 (공통)

**DataTable 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| reviewRound | 심사차수 | 80 | text | Y | 예: "제1차" |
| reviewDate | 심사일자 | 120 | date | Y | |
| name | 성명 | 100 | text (링크) | Y | |
| serviceNumber | 군번 | 120 | text | Y | |
| rank | 계급 | 80 | text | Y | |
| unit | 소속 | 150 | text | Y | |
| result | 심사결과 | 100 | StatusBadge | Y | 해당/비해당 |

**CrudForm fields (전공사상심사 등록/수정):**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| reviewRound | 심사차수 | text | Y | 예: "제1차" |
| reviewDate | 심사일자 | date | Y | |
| name | 성명 | text | Y | |
| serviceNumber | 군번 | text | Y | |
| birthDate | 주민번호(생년월일) | text | Y | |
| enlistDate | 입대일자 | date | Y | |
| rank | 계급 | select | Y | |
| unit | 소속 | select | Y | |
| incidentType | 사고유형 | select | Y | 전사/순직/전상/공상 |
| incidentDate | 사고일자 | date | Y | |
| incidentCause | 사고원인 | textarea | Y | |
| result | 심사결과 | select | Y | 해당/비해당 |
| resultDetail | 결과 상세 | textarea | N | |
| remarks | 비고 | textarea | N | |

#### 09-D. 통계 현황 페이지 (HONOR-04~09)

**공통 레이아웃:** 상단 SearchForm + 중앙 차트 + 하단 DataTable

**신분별 사망자 현황 (HONOR-06):**
- 차트: @ant-design/charts Pie -- 신분별(장교/부사관/병사/군무원) 비율
- 테이블 컬럼: 신분구분, 전사, 순직, 병사, 사고사, 계

**월별 사망자 현황 (HONOR-08):**
- 차트: @ant-design/charts Bar (세로) -- 월별 사망자 수
- 테이블 컬럼: 연도, 1월~12월, 계

**연도별 사망자 현황 (HONOR-07):**
- 차트: @ant-design/charts Line -- 연도별 추이
- 테이블 컬럼: 연도, 전사, 순직, 병사, 사고사, 계

**부대별 사망자 현황 (HONOR-04):**
- 차트: @ant-design/charts Bar (가로) -- 부대별 사망자 수
- 테이블 컬럼: 부대명, 전사, 순직, 병사, 사고사, 계

**부대별 사망자 명부 (HONOR-05):**
- 테이블 전용 (차트 없음)
- 컬럼: 연번, 부대명, 군번, 성명, 계급, 사망구분, 사망일자

**전사망자 명부 (HONOR-09):**
- 테이블 전용 (차트 없음)
- 컬럼: 연번, 군번, 성명, 계급, 소속, 사망구분, 사망일자, 사망장소

**공통 기능:** 모든 현황/명부 페이지에 `[엑셀 다운로드]` 버튼

#### 09-E. 보고서/확인서 (HONOR-10~16) -- Print CSS 패턴

**공통 레이아웃 (D-11~13):**
- 화면: antd Descriptions (bordered) + 하단 `[인쇄]` 버튼
- 인쇄: @media print CSS로 A4 세로 레이아웃 적용
- 프린트 컴포넌트: 별도 `PrintableReport` 래퍼 (ref + window.print())

**사망자 현황 보고서 (HONOR-10):**

| 필드 | 레이아웃 |
|------|---------|
| 보고서 제목 | 중앙정렬, 24px bold |
| 작성일자 | 우측정렬 |
| 사망자 현황 테이블 | 부대별 x 사망구분 매트릭스 |
| 합계 행 | 하단 bold |
| 확인자 서명란 | 하단 우측 |

**상이자 현황 보고서 (HONOR-11):** 사망자 보고서와 동일 레이아웃, 상이구분/상이등급으로 변경

**순직/사망확인서 (HONOR-12):**

| 필드 | 레이아웃 | Descriptions column |
|------|---------|-------------------|
| 문서번호 | 상단 좌측 | |
| 제목: "순직/사망확인서" | 중앙 bold 24px | |
| 군번 | Descriptions | label-value |
| 성명 | Descriptions | label-value |
| 계급 | Descriptions | label-value |
| 소속 | Descriptions | label-value |
| 사망일자 | Descriptions | label-value |
| 사망장소 | Descriptions | label-value |
| 사망원인 | Descriptions | label-value (full width) |
| 확인 문구 | 본문 paragraph | |
| 작성일자 | 중앙정렬 | |
| 확인자 서명란 | 우측정렬 | "확인자: _________ (인)" |

**국가유공자 요건 해당사실 확인서(사망자) (HONOR-13):** 순직/사망확인서와 유사 레이아웃. 제목 변경 + 국가유공자 요건 항목 추가

**국가유공자 요건 해당사실 확인서(상이자) (HONOR-14):** 사망자 확인서와 유사. 상이 관련 필드(상이구분, 상이등급, 상이일자)로 변경

**전공사상심사결과 (HONOR-15):**

| 필드 | 레이아웃 |
|------|---------|
| 제목: "전공사상심사결과" | 중앙 bold |
| 심사차수/심사일자 | Descriptions 2열 |
| 대상자 정보 | Descriptions (성명, 군번, 계급, 소속) |
| 사고 내용 | Descriptions (사고유형, 사고일자, 사고원인) full width |
| 심사결과 | Descriptions (결과, 상세) bold 강조 |
| 위원 서명란 | 하단 테이블 (위원 직책, 성명, 서명) |

**전사망자 확인증 발급대장 (HONOR-16):**

| 필드 | 레이아웃 |
|------|---------|
| 제목 | 중앙 bold |
| 대장 테이블 | antd Table (연번, 발급일자, 군번, 성명, 계급, 소속, 용도, 수령인) |
| 하단 서명란 | 우측정렬 |

---

### SYS12: 지시건의사항관리체계 (32개 프로세스)

#### 12-A. 지휘관 지시사항 -- 추진현황 (매트릭스)

**UI 구조:** 상단 통계 요약 + 매트릭스 테이블

**통계 요약 (antd Card + Statistic row):**

| Statistic | label | 비고 |
|-----------|-------|------|
| 지시 건수 | "총 지시" | 전체 수 |
| 완료 건수 | "완료" | green 색상 |
| 진행중 건수 | "진행중" | blue 색상 |
| 미착수 건수 | "미착수" | default 색상 |
| 추진율 | "추진율" | % 표시, Progress 포함 |

**매트릭스 테이블 컬럼:**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| category | 구분 (지시자) | 150 | text | 카테고리별 행 |
| totalCount | 지시 건수 | 100 | number | |
| completedCount | 완료 | 80 | number (green) | |
| inProgressCount | 진행중 | 80 | number (blue) | |
| notStartedCount | 미착수 | 80 | number (default) | |
| delayedCount | 지연 | 80 | number (red) | |
| completionRate | 추진율 | 120 | Progress | antd Progress percent |

**카테고리 전환:** antd Tabs 또는 Select로 지시자 구분에 따라 통계 전환
**`[엑셀 다운로드]`** 버튼

#### 12-B. 지휘관 지시사항 -- 목록/상세/등록/수정

**SearchForm fields:**

| name | label | type | options | 비고 |
|------|-------|------|---------|------|
| directiveDate | 지시일 | dateRange | | |
| director | 지시자 | select | 지시자 목록 | |
| targetUnit | 수명부대 | select | 부대 목록 | |
| progressStatus | 진행상황 | select | 미착수/진행중/완료/지연 | |
| keyword | 지시내용 | text | | 키워드 검색 |

**DataTable 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| directiveNo | 관리번호 | 100 | text | Y | |
| director | 지시자 | 100 | text | Y | |
| directiveDate | 지시일자 | 120 | date | Y | |
| targetUnit | 수명부대 | 150 | text | Y | |
| content | 지시내용 | 300 | text (ellipsis) | N | 말줄임 처리 |
| progressStatus | 추진상태 | 100 | StatusBadge | Y | 미착수/진행중/완료/지연 |
| category | 종류 | 100 | text | Y | |

**CrudForm fields (지시사항 등록):**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| director | 지시자 | select | Y | 지시자 목록 |
| directiveDate | 지시일자 | date | Y | |
| targetUnit | 수명부대 | select (multiple) | Y | 부대 목록 |
| progressStatus | 추진상태 | select | Y | 미착수/진행중/완료/지연 |
| content | 지시내용 | textarea | Y | maxLength: 2000 |
| category | 지시사항 종류 | select | Y | 카테고리 목록 |
| attachments | 첨부파일 | upload | N | antd Upload, maxCount: 5 |

**조치사항 등록 폼 (서브 Modal):**

| name | label | type | required | 비고 |
|------|-------|------|----------|------|
| assignee | 업무담당자 | text | Y | |
| progressStatus | 추진상태 | select | Y | 미착수/진행중/완료 |
| plan | 추진계획 | textarea | Y | |
| result | 추진내용 | textarea | N | |
| attachments | 첨부파일 | upload | N | |

**이행 이력 (antd Timeline):**
- 각 이력 아이템: dot(StatusBadge color) + 날짜 + 담당자 + 내용
- 최신순 정렬

#### 12-C. 지휘관 건의사항 -- 추진현황/목록/상세/등록/수정

지시사항과 동일 패턴. 필드명 차이:

| 지시사항 | 건의사항 | 비고 |
|---------|---------|------|
| director (지시자) | proposer (건의자) | |
| directiveDate (지시일자) | proposalDate (건의일자) | |
| targetUnit (수명부대) | managingUnit (주관부대) | |
| content (지시내용) | content (건의내용) | |

**검색조건:** 건의일자, 건의자, 주관부대, 추진상태, 건의내용

#### 12-D. 대통령 / 국방부장관 지시사항

**공통게시판 재사용** (D-26): BoardListPage에 sysCode='sys12', boardType='president' / 'minister' 파라미터
- 읽기 전용 게시판 (등록/수정/삭제 권한 없음, 관리자만 가능)

---

### SYS13: 지식관리체계 (23개 프로세스)

#### 13-A. 지식열람 -- 목록

**SearchForm fields:**

| name | label | type | options | 비고 |
|------|-------|------|---------|------|
| category | 카테고리 | select | 지식유형 목록 | |
| keyword | 키워드 | text | | |
| searchType | 검색 대상 | select | 제목/내용/작성자/전체 | |
| sortBy | 정렬 | select | 최신순/추천순/조회순/평점순 | |

**DataTable 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| title | 제목 | 300 | text (링크) | N | 클릭 시 상세 |
| category | 유형 | 100 | Tag | Y | 카테고리 태그 |
| authorName | 작성자 | 100 | text | Y | |
| authorUnit | 소속 | 150 | text | Y | |
| viewCount | 조회수 | 80 | number | Y | |
| recommendCount | 추천 | 80 | number | Y | 좋아요 수 |
| rating | 평점 | 100 | Rate (readonly, small) | Y | 별점 표시 |
| createdAt | 등록일 | 120 | date | Y | |

#### 13-B. 지식 상세 조회

**UI 구조:** antd Card 기반

| 영역 | 컴포넌트 | 내용 |
|------|---------|------|
| 헤더 | Typography.Title + Tag | 제목 + 카테고리 태그 |
| 메타 | Descriptions (horizontal) | 작성자, 소속, 등록일, 출처, 조회수 |
| 키워드 | Tag 목록 | 키워드 태그 (여러 개) |
| 본문 | Typography.Paragraph | 지식 내용 (HTML 렌더링) |
| 첨부파일 | antd List | 파일명 + 다운로드 링크 |
| 평점/추천 | Rate + Button (추천/비추천) | D-19 패턴 재사용 |
| 댓글 | antd Comment (또는 커스텀) | 댓글 목록 + 작성 폼 |

**추천 인터랙션 (D-19, sys14 패턴 재사용):**
- `[추천]` 버튼 (LikeOutlined) + `[비추천]` 버튼 (DislikeOutlined)
- 이미 추천/비추천 시 filled 아이콘 + 비활성화
- 카운트 실시간 반영 (useMutation + invalidateQueries)

**평점 인터랙션:**
- antd Rate 컴포넌트 (1~5점)
- 이미 평가한 경우 disabled + 현재 평점 표시
- 평균 평점 Typography.Text 표시

**댓글:**
- 목록: 작성자, 작성일, 내용 / 수정/삭제 버튼 (본인 댓글만)
- 작성: TextArea + `[댓글 등록]` 버튼

#### 13-C. 나의 지식 관리

**CrudForm fields (지식 등록/수정):**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| title | 제목 | text | Y | maxLength: 200 |
| category | 지식유형(카테고리) | select | Y | 카테고리 목록 |
| source | 출처 | select | Y | 생산/카피 |
| keywords | 키워드 | select (multiple, tags mode) | Y | 자유 입력, 다수 등록 |
| content | 내용 | textarea | Y | maxLength: 10000 |
| attachments | 첨부파일 | upload | N | antd Upload, maxCount: 10 |

**DataTable 컬럼 (나의 지식 목록):**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| title | 제목 | 300 | text (링크) | |
| category | 유형 | 100 | Tag | |
| status | 상태 | 100 | StatusBadge | pending/approved/rejected/hidden |
| viewCount | 조회수 | 80 | number | |
| recommendCount | 추천 | 80 | number | |
| createdAt | 등록일 | 120 | date | |

#### 13-D. 지식 관리 (관리자)

**DataTable 컬럼:**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| title | 제목 | 250 | text (링크) | |
| category | 유형 | 100 | Tag | |
| authorName | 작성자 | 100 | text | |
| status | 상태 | 100 | StatusBadge | |
| createdAt | 등록일 | 120 | date | |

**액션 (D-20):** `[승인]` / `[반려]` / `[숨김]` / `[삭제]` -- 단순 상태변경 패턴 (결재선 연동 없음)

#### 13-E. 지식통계 (KNOW-04) -- @ant-design/charts

**유형별 작성 통계:**
- 차트: Pie 차트 -- 지식유형별 등록 비율
- 테이블: 유형명, 건수, 비율(%)

**부대별 작성 통계:**
- 차트: Bar 차트 (가로) -- 부대별 등록 건수
- 테이블: 부대명, 건수, 추천수, 평균평점

**부대별 작성자별 통계:**
- 테이블 전용 (DataTable)
- 컬럼: 부대명, 작성자, 작성수, 추천수, 평점, 조회수
- 정렬: 작성수/추천수/평점/조회수 기준 드롭다운 (D-21 참고, `* 정렬 조건`)
- `[엑셀 다운로드]` 버튼

**부대별 작성 목록:**
- 테이블 전용
- 컬럼: 부대명, 제목, 작성자, 유형, 등록일, 조회수, 추천수
- `[엑셀 다운로드]` 버튼

---

### SYS17: 검열결과관리체계 (25개 프로세스)

#### 17-A. 검열부대 지정

**UI 구조:** 좌측 조직도 트리 (antd Tree, checkable) + 우측 선택된 부대 목록 (antd Table)
- 조직도에서 부대 체크 시 우측 목록에 추가
- 우측 목록에서 제거 가능
- 저장 버튼으로 일괄 저장

#### 17-B. 검열계획

**SearchForm fields:**

| name | label | type | options | 비고 |
|------|-------|------|---------|------|
| inspYear | 검열연도 | select | 연도 목록 | |
| planName | 검열계획명 | text | | 키워드 검색 |
| targetUnit | 대상부대 | select | 부대 목록 | |
| inspPeriod | 검열기간 | dateRange | | |

**DataTable 컬럼:**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| planName | 검열계획명 | 250 | text (링크) | N | 클릭 시 상세 |
| inspYear | 검열연도 | 80 | text | Y | |
| targetUnit | 대상부대 | 150 | text | Y | |
| startDate | 시작일 | 120 | date | Y | |
| endDate | 종료일 | 120 | date | Y | |
| taskCount | 과제 수 | 80 | number | Y | |
| fileCount | 첨부 | 60 | number | N | |

**CrudForm fields (검열계획 작성):**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| inspYear | 검열연도 | select | Y | 연도 목록 |
| planName | 검열계획명 | text | Y | maxLength: 200 |
| startDate | 시작일 | date | Y | |
| endDate | 종료일 | date | Y | startDate 이후 |
| targetUnit | 대상부대 | select (multiple) | Y | 검열부대 목록 |
| remarks | 비고 | textarea | N | |
| attachments | 첨부파일 | upload | N | antd Upload |

#### 17-C. 검열결과 -- 조치과제

**SearchForm fields:**

| name | label | type | options | 비고 |
|------|-------|------|---------|------|
| inspYear | 연도 | select | | |
| targetUnit | 대상부대 | select | | |
| taskName | 과제명 | text | | 키워드 |
| progressStatus | 진행상태 | select | 미조치/진행중/조치완료/접수완료 | |
| inspField | 검열분야 | select | 분야 목록 | |

**DataTable 컬럼 (조치과제 목록):**

| dataIndex | title | width | type | sortable | 비고 |
|-----------|-------|-------|------|----------|------|
| taskNo | 과제번호 | 100 | text | Y | |
| taskName | 과제명 | 250 | text (링크) | N | 클릭 시 상세 |
| planName | 검열계획 | 150 | text | Y | |
| targetUnit | 대상부대 | 120 | text | Y | |
| managingDept | 주관부서 | 120 | text | Y | |
| inspField | 검열분야 | 100 | text | Y | |
| progressStatus | 진행상태 | 100 | StatusBadge | Y | |
| dueDate | 완료기한 | 120 | date | Y | |

**CrudForm fields (조치과제 작성):**

| name | label | type | required | options/비고 |
|------|-------|------|----------|-------------|
| planId | 검열계획 | select | Y | 상단 검열계획 목록에서 선택 |
| targetUnit | 대상부대 | select | Y | |
| managingDept | 주관부서 | select | Y | |
| inspField | 검열분야 | select | Y | 분야 목록 |
| taskName | 과제명 | text | Y | maxLength: 200 |
| taskContent | 과제내용 | textarea | Y | |
| dueDate | 완료기한 | date | Y | |
| remarks | 비고 | textarea | N | |
| attachments | 첨부파일 | upload | N | |

**조치결과 목록 (별도 탭 또는 하단 테이블):**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| taskNo | 과제번호 | 100 | text | |
| taskName | 과제명 | 200 | text | |
| managingDept | 주관부서 | 120 | text | |
| progressStatus | 진행상태 | 100 | StatusBadge | |
| lastUpdated | 최종 수정일 | 120 | date | |

**과제처리 (조치결과 입력) 폼:**

| name | label | type | required | 비고 |
|------|-------|------|----------|------|
| progressStatus | 진행상태 | select | Y | 미조치/진행중/조치완료 |
| issues | 문제점 | textarea | N | |
| actionResult | 조치계획/결과 | textarea | Y | |
| attachments | 첨부파일 | upload | N | |

**과제처리 이력 조회:**
- antd Timeline 컴포넌트 (D-18 패턴)
- 각 이력: 날짜 + 처리자 + 진행상태 변경 + 내용 요약

**`[엑셀 다운로드]`** 조치과제 목록 엑셀 출력

#### 17-D. 결재 (INSP-05) -- Phase 1 approval 연동 (D-01~03)

**접수대기 목록 SearchForm:**

| name | label | type | options | 비고 |
|------|-------|------|---------|------|
| inspYear | 연도 | select | | |
| targetUnit | 대상부대 | select | | |
| inspField | 검열분야 | select | | |
| actionUnit | 조치부대 | select | | |
| taskName | 과제명 | text | | |

**접수대기 DataTable 컬럼:**

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| taskNo | 과제번호 | 100 | text | |
| taskName | 과제명 | 200 | text (링크) | |
| targetUnit | 대상부대 | 120 | text | |
| inspField | 검열분야 | 100 | text | |
| submittedAt | 보고일 | 120 | date | |
| approvalStatus | 결재상태 | 120 | StatusBadge | 대기/진행중/접수완료/반송 |

**결재 플로우 시각화 (D-02):**
- antd Steps 컴포넌트 (horizontal)
- Step 1: 조치결과 보고 (담당자)
- Step 2: 중간 결재 (결재자)
- Step 3: 최종 접수 (승인권자)
- 현재 단계: current prop으로 하이라이트
- 완료 단계: finish 상태 (green checkmark)
- 반송 시: error 상태 (red)

**액션 버튼:**
- `[접수 (승인)]` -- primary, ConfirmDialog 확인
- `[반송 (반려)]` -- danger, 반려 사유 입력 Modal

#### 17-E. 추진현황 (INSP-03/04)

**종합현황:**
- SearchForm: 기간 (dateRange), 대상부대 (select), 검열분야 (select)
- 상단: Card + Statistic (총 과제 수, 완료, 진행중, 미조치)
- 중앙: @ant-design/charts Bar (가로) -- 대상부대별 추진현황 (완료/진행중/미조치 스택)
- 하단: Progress 바 -- 전체 추진율

**세부현황:**
- SearchForm: 기간 (dateRange), 검열분야 (select)
- 테이블: 부대별 조치과제 진행현황

| dataIndex | title | width | type | 비고 |
|-----------|-------|-------|------|------|
| unitName | 부대명 | 150 | text | |
| totalTasks | 총 과제 | 80 | number | |
| completed | 완료 | 80 | number (green) | |
| inProgress | 진행중 | 80 | number (blue) | |
| notStarted | 미조치 | 80 | number (default) | |
| completionRate | 추진율 | 120 | Progress | antd Progress percent |

- 각 행 클릭 시 해당 부대의 과제 상세 목록 확장 (expandedRowRender)
- 차트: @ant-design/charts Bar (스택) -- 부대별 추진현황 그래프

---

## Print CSS 계약 (영현보훈 보고서/확인서)

```css
/* 공통 Print CSS 규칙 */
@media print {
  /* 페이지 설정 */
  @page {
    size: A4 portrait;
    margin: 20mm;
  }

  /* antd 레이아웃 숨김 */
  .ant-layout-sider,
  .ant-layout-header,
  .ant-breadcrumb,
  .ant-btn,
  .no-print {
    display: none !important;
  }

  /* 프린트 영역 */
  .print-area {
    width: 100%;
    padding: 0;
    margin: 0;
  }

  /* 보고서 제목 */
  .report-title {
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 32px;
  }

  /* 서명란 */
  .signature-area {
    margin-top: 48px;
    text-align: right;
  }

  /* 테이블 */
  .ant-descriptions {
    border: 1px solid #000 !important;
  }
  .ant-descriptions-item-label {
    font-weight: 600 !important;
    background: #f0f0f0 !important;
  }

  /* 페이지 나눔 방지 */
  .no-break {
    page-break-inside: avoid;
  }
}
```

---

## 차트 계약 (@ant-design/charts)

### 공통 차트 설정

```typescript
// 공통 차트 테마 설정
const CHART_THEME = {
  defaultColor: '#003366', // NAVY accent
  padding: [24, 24, 48, 48],
  animate: { enter: { type: 'scaleInY' } },
};

// 차트 컨테이너: height 300px, padding lg(24px)
// 차트 범례: 하단 중앙 (position: 'bottom')
// 축 레이블: 12px, color #8c8c8c
// 툴팁: antd 기본 스타일
```

### 차트 유형별 사용처

| 차트 | 컴포넌트 | 사용처 | 데이터 구조 |
|------|---------|--------|------------|
| Bar (가로) | `<Bar />` | 부대별 현황 (sys09/12/17) | `[{unit, count, category}]` |
| Bar (세로) | `<Column />` | 월별 현황 (sys09), 응답분포 (sys02) | `[{month, count}]` |
| Line | `<Line />` | 연도별 추이 (sys09) | `[{year, count}]` |
| Pie | `<Pie />` | 비율 분석 (sys09 신분별, sys13 유형별) | `[{type, value}]` |
| Stacked Bar | `<Bar />` (isStack) | 추진현황 (sys12/17) | `[{unit, count, status}]` |

---

## 설문 문항 편집기 DnD 계약

### @dnd-kit 설정

```typescript
// DnD 컨텍스트
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

// 각 문항 아이템: useSortable 훅 적용
// 드래그 핸들: HolderOutlined 아이콘 (터치 영역 44x44px)
// 드래그 중 시각: transform + boxShadow + opacity 0.7
// 드롭 후: 문항 번호 자동 재계산 (1-based index)
```

### 문항 편집기 레이아웃

```
+----------------------------------------------+
| [엑셀 양식 다운] [엑셀 업로드] [문항 추가]      |
+----------------------------------------------+
| # | 문항 | 유형  | 필수 | 삭제 |              |
|----|------|-------|------|------|              |
| :: | Q1.. | Radio |  V   |  X   |  <-- 편집   |
| :: | Q2.. | Text  |  V   |  X   |    영역     |
| :: | Q3.. | Rate  |      |  X   |  (선택된    |
|    |      |       |      |      |   문항의    |
| [+ 문항 추가 (dashed)]         |   상세 폼)  |
+----------------------------------------------+
:: = 드래그 핸들 (HolderOutlined)
```

---

## 결재 플로우 계약 (sys17)

### antd Steps 구성

```typescript
// 결재 상태에 따른 Steps 렌더링
const APPROVAL_STEPS = [
  { title: '조치결과 보고', description: '담당자' },
  { title: '중간 결재', description: '결재자' },
  { title: '최종 접수', description: '승인권자' },
];

// 상태 매핑
// pending -> current=0
// inReview -> current=1
// approved -> current=2, status='finish'
// rejected -> 해당 step status='error'
```

---

## 이행/처리현황 계약 (sys12)

### antd Timeline 구성

```typescript
// 각 이력 아이템
interface ActionHistory {
  id: string;
  date: string;        // YYYY-MM-DD HH:mm
  assignee: string;    // 담당자
  status: string;      // 상태 변경값
  content: string;     // 처리 내용
}

// Timeline.Item
// dot: StatusBadge 색상과 동일한 원형 아이콘
// children: [날짜] 담당자 - 상태변경 \n 내용
// 최신순 정렬 (상단이 최신)
```

### antd Progress 구성

```typescript
// 이행률/처리율 Progress
// type="line", strokeColor={추진율에 따라 동적}
// 0-30%: #ff4d4f (red)
// 31-70%: #faad14 (gold)
// 71-100%: #52c41a (green)
// format: (percent) => `${percent}%`
```

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| npm (@ant-design/charts) | Bar, Line, Pie, Column | 공식 antd 생태계 -- 안전 |
| npm (@dnd-kit/core) | DndContext, closestCenter | 공식 npm 패키지 -- 안전 |
| npm (@dnd-kit/sortable) | SortableContext, useSortable | 공식 npm 패키지 -- 안전 |
| shadcn | 미사용 | not applicable |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

## GAP 수정 반영 (2026-04-07)

Phase 4 UI-SPEC 기반 176개 프로세스에 대해 6개 규칙 기반 GAP 수정이 적용되었다.

### 적용된 공통 패턴

1. **SearchForm 패턴**: 모든 목록 화면 상단에 `<SearchForm>` 컴포넌트 배치 (높이 100px, search-form-container CSS)
2. **militaryPersonColumn 패턴**: 인물 관련 컬럼에 `militaryPersonColumn()` 헬퍼 적용 — 군번/계급/성명 3항목 동시 표시
3. **DataTable CSS 패턴**: `navy-bordered-table` 클래스로 최상단 군청색 2px, 최하단 1px 라인
4. **CrudForm 확장**: file/dateRange 타입 필드 추가, CSV 입력값 항목 전체 반영

### 서브시스템별 GAP 해소

| 서브시스템 | 주요 변경 |
|-----------|----------|
| SYS13 지식관리 | SearchForm 5개 조건, militaryPersonColumn, keywords/attachments 필드 |
| SYS17 검열결과 | CSV 11 입력항목 전부 반영, militaryPersonColumn, 공개여부/처분종류 |
| SYS06 해병대규정 | SYS05에서 독립, 전용 4페이지 신규 생성 + API 핸들러 |
| SYS02 설문관리 | SearchForm, 대상필드 4개, 첨부파일 3종 |
| SYS12 지시건의 | SearchForm, militaryPersonColumn, directiveType(문서/구두) |
| SYS09 영현보훈 | SearchForm 7개 필드, 추가 필드 다수 |
