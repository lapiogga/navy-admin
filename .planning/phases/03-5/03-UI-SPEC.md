---
phase: 3
slug: low-complexity-subsystems
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-06
type: retroactive
---

# Phase 3 -- UI Design Contract (Retroactive)

> Phase 3 서브시스템 5개에 대한 소급 UI Design Contract.
> req_analysis.txt 원본 요구사항 대비 현재 구현의 GAP 분석 포함.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Ant Design 사용) |
| Preset | not applicable |
| Component library | Ant Design 5.24.x + ProComponents |
| Icon library | @ant-design/icons |
| Font | system default (Ant Design 기본) |

---

## Spacing Scale

Ant Design 기본 스페이싱 토큰 사용:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing |
| md | 16px | Default element spacing, Card padding |
| lg | 24px | Section padding, Row gutter |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: none

---

## Typography

Ant Design 기본 Typography 토큰 사용:

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.5715 |
| Label | 14px | 600 | 1.5715 |
| Heading (h4) | 20px | 600 | 1.4 |
| Display (h2) | 30px | 600 | 1.35 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #ffffff | Background, surfaces |
| Secondary (30%) | #f5f5f5 | Card backgrounds, disabled areas |
| Accent (10%) | #1677ff | Primary CTA buttons, 링크 텍스트 |
| Destructive | #ff4d4f | 삭제/반려 버튼, danger 태그 |

Status 색상:
| Status | Color | 용도 |
|--------|-------|------|
| pending/대기 | orange (#faad14) | 승인대기, 처리대기 |
| approved/승인 | green (#52c41a) | 승인완료 |
| rejected/반려 | red (#ff4d4f) | 반려, 거부 |
| open/대기 | cyan (#13c2c2) | 제언 대기 |
| answered/답변완료 | green (#52c41a) | 제언 답변완료 |
| closed/종료 | default (#d9d9d9) | 제언 종료 |

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (sys04) | "신청서 작성" |
| Primary CTA (sys11) | "자료 등록" |
| Primary CTA (sys14) | "제언 작성" |
| Primary CTA (sys16) | "예약 신청" |
| Empty state heading | "데이터가 없습니다" |
| Empty state body | "아직 등록된 항목이 없습니다. 새로 등록해 주세요." |
| Error state | "처리에 실패했습니다. 다시 시도해 주세요." |
| Delete confirmation | "삭제하시겠습니까?" |
| Approve confirmation | "승인하시겠습니까?" |
| Reject confirmation | "반려하시겠습니까?" |
| Cancel reservation | "예약을 삭제하시겠습니까?" |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| Ant Design | ProTable, ProForm, ProLayout | not required (official) |
| Third-party | none | not applicable |

---

---

# 서브시스템별 상세 UI Contract

---

## SYS04: 인증서발급신청체계

### 04-1. 인증서 발급 신청 폼 (CertificateApplyPage)

**req_analysis 원본 필드:**
- 인증서 구분 (재직증명서/경력증명서/복무증명서)
- 신청구분
- 용도
- 사유
- 신청자정보: 계급/성명, 군번, 소속기관, 이메일, 전화번호
- 신청정보 (활용동의 및 인증서 발급을 신청)

#### 신청 폼 필드 상세

| 필드명 | dataIndex | 타입 | 필수 | 옵션/설명 |
|--------|-----------|------|------|-----------|
| 인증서구분 | certType | select | Y | 재직증명서, 경력증명서, 복무증명서 |
| 신청구분 | requestType | select | Y | **[GAP]** 신규발급, 재발급, 갱신 |
| 용도 | purpose | textarea | Y | 자유입력 |
| 사유 | reason | textarea | Y | **[GAP]** req에 명시된 별도 필드 |
| 계급/성명 | applicantRank, applicantName | text (readonly) | Y | 로그인 사용자정보 자동입력 |
| 군번 | militaryId | text (readonly) | Y | **[GAP]** 로그인 사용자정보 자동입력 |
| 소속기관 | applicantUnit | text (readonly) | Y | 로그인 사용자정보 자동입력 |
| 이메일 | email | text | Y | **[GAP]** 사용자 입력 |
| 전화번호 | phone | text | Y | **[GAP]** 사용자 입력 |

#### 신청 목록 테이블 컬럼

| 컬럼명 | dataIndex | width | 타입 | 비고 |
|--------|-----------|-------|------|------|
| 순번 | - | 80px | index render | 자동 순번 |
| 인증서구분 | certType | 120px | text | |
| 신청구분 | requestType | 100px | text | **[GAP]** 누락 |
| 용도 | purpose | auto | text/ellipsis | 현재 "신청목적"으로 표시 |
| 상태 | status | 80px | StatusBadge | pending/approved/rejected |
| 신청일 | appliedAt | 110px | date | |
| 액션 | - | 140px | buttons | 수정/삭제 (대기 상태만) |

#### 신청 회수 기능

- **[GAP]** 회수 기능 미구현. 진행상태 "승인대기" -> "회수" 상태변경 버튼 필요
- 대기 상태의 건에 대해 "회수" 버튼 추가 필요 (Popconfirm 확인)

### 04-2. 승인대기 목록 (CertificateApprovalPage)

**req_analysis 원본 컬럼:** 순번, 소속부서, 인증서구분, 신청구분, 신청자, 신청일시, 국방전자서명인증센터(진행상태), 진행상태(최종)

#### 승인대기 목록 테이블 컬럼

| 컬럼명 | dataIndex | width | 타입 | 비고 |
|--------|-----------|-------|------|------|
| 순번 | - | 80px | index render | |
| 소속부서 | applicantUnit | 120px | text | 현재 "소속"으로 구현됨 |
| 인증서구분 | certType | 120px | text | |
| 신청구분 | requestType | 100px | text | **[GAP]** 누락 |
| 신청자 | applicantName | 100px | text | |
| 신청일시 | appliedAt | 110px | date | |
| 국방전자서명인증센터 | ndscaStatus | 120px | StatusBadge | **[GAP]** 외부 시스템 상태 컬럼 누락 |
| 진행상태(최종) | status | 80px | StatusBadge | |
| 처리 | - | 160px | buttons | 승인/반려 |

### 04-3. 신청정보 상세 내용 (상세 모달)

**req_analysis 원본 필드:** 인증서 구분, 신청 구분, 신청자(계급/성명), 군번, 소속기관, 이메일, 전화번호, 용도, 사유, 신청일시

#### 상세 조회 필드

| 필드명 | key | 비고 |
|--------|-----|------|
| 인증서구분 | certType | |
| 신청구분 | requestType | **[GAP]** 누락 |
| 신청자(계급/성명) | applicantRank + applicantName | **[GAP]** 계급 누락 |
| 군번 | militaryId | **[GAP]** 누락 |
| 소속기관 | applicantUnit | |
| 이메일 | email | **[GAP]** 누락 |
| 전화번호 | phone | **[GAP]** 누락 |
| 용도 | purpose | |
| 사유 | reason | **[GAP]** purpose에 통합되어 있음 |
| 신청일시 | appliedAt | |
| 처리일시 | processedAt | |
| 진행상태 | status | |

### 04-4. 인증서 등록대장 (CertificateRegisterPage)

**req_analysis 기능:** 인증서 발급 목록 조회, 엑셀 다운로드, 발급 통계

#### 등록대장 테이블 컬럼

현재 구현된 컬럼은 승인 목록과 동일. 추가 필요 사항:

| 컬럼명 | dataIndex | width | 비고 |
|--------|-----------|-------|------|
| 순번 | - | 80px | |
| 신청자 | applicantName | 100px | |
| 소속 | applicantUnit | 120px | |
| 인증서구분 | certType | 120px | |
| 신청구분 | requestType | 100px | **[GAP]** 누락 |
| 용도 | purpose | auto | |
| 상태 | status | 80px | |
| 신청일 | appliedAt | 110px | |
| 처리일 | processedAt | 110px | |

#### 누락 기능

- **[GAP]** 엑셀 다운로드 버튼 미구현 (현재 "저장" 버튼만 존재)
- **[GAP]** 발급 통계 화면/탭 미구현

### 04-5. 반려 기능

**req_analysis:** 관리자가 반송의견 입력 후, 반송 처리

- **[GAP]** 현재 반려 시 반송의견(rejectReason) 입력 없이 바로 상태변경됨
- 반려 클릭 시 Input.TextArea로 반려사유 입력 모달 필요

---

## SYS05: 행정규칙포탈체계

### 05-1. 현행규정 (RegulationListPage)

**req_analysis 원본 기능:**
- 조직도 전시: 규정 소관 부/실/단 리스트 전시
- 현행규정 조회: 부/실/단별 규정 목록 조회
- 현행규정 등록/수정/삭제: 부/실/단별 현행규정 CRUD
- 현행규정 열람: 규정 전문 전시, 파일 다운로드

#### 현행규정 목록 테이블 컬럼

| 컬럼명 | dataIndex | width | 타입 | 비고 |
|--------|-----------|-------|------|------|
| 번호 | id | 80px | text | |
| 문서번호 | docNumber | 140px | text | |
| 규정명 | title | auto | text/ellipsis | |
| 분류 | category | 100px | text | **[GAP]** 규정 분류 컬럼 누락 |
| 소관부서 | department | 120px | text | "담당부서"로 구현됨 |
| 시행일 | effectiveDate | 120px | date | |
| 즐겨찾기 | - | 80px | StarIcon | |

#### 현행규정 등록/수정 폼 필드

| 필드명 | name | 타입 | 필수 | 비고 |
|--------|------|------|------|------|
| 규정명 | title | text | Y | |
| 문서번호 | docNumber | text | Y | **[GAP]** 등록 폼 자체가 없음 |
| 분류 | category | select | Y | **[GAP]** |
| 소관부서 | department | select | Y | **[GAP]** |
| 시행일 | effectiveDate | datepicker | Y | **[GAP]** |
| 내용 | content | textarea/editor | Y | **[GAP]** |
| 첨부파일 | fileUrl | upload | N | **[GAP]** |

#### 누락 기능

- **[GAP]** 조직도(부/실/단 트리) 전시 미구현
- **[GAP]** 규정 등록/수정/삭제 CRUD 미구현 (현재 조회/상세보기만 있음)
- **[GAP]** 상세 모달에서 파일 다운로드 버튼은 있으나 실제 파일 링크 미연결

### 05-2. 해군본부 예규 (PrecedentHQPage)

**req_analysis 원본 기능:** 예규 조회, 등록, 수정, 삭제

#### 예규 목록 테이블 컬럼

| 컬럼명 | dataIndex | width | 비고 |
|--------|-----------|-------|------|
| 번호 | id | 100px | |
| 문서번호 | docNumber | 160px | |
| 예규명 | title | auto | |
| 담당부서 | department | 120px | |
| 시행일 | effectiveDate | 120px | |

#### 누락 기능

- **[GAP]** 예규 등록/수정/삭제 CRUD 미구현 (현재 조회/상세보기만 있음)
- **[GAP]** 등록 폼 필요: 문서번호, 예규명, 담당부서, 시행일, 내용, 첨부파일

### 05-3. 예하부대 예규 (PrecedentUnitPage)

**req_analysis 원본 기능:** 조직도/링크 전시 - 예규 소관 부대(서) 리스트 및 예규 페이지 링크 전시

#### 누락 기능

- **[GAP]** 현재 해군본부 예규와 동일한 테이블 UI로 구현됨
- **[GAP]** req_analysis에 의하면 "조직도/링크 전시"로, 부대 리스트 + 외부 예규 페이지 링크 형태여야 함
- Card 그리드 형태로 부대별 예규 페이지 링크를 전시하는 UI가 적합

### 05-4. 지시문서 (DirectiveListPage)

**req_analysis 원본 기능:** 조회, 등록, 수정, 삭제

#### 지시문서 목록 테이블 컬럼

| 컬럼명 | dataIndex | width | 비고 |
|--------|-----------|-------|------|
| 번호 | id | 80px | |
| 문서번호 | docNumber | 140px | |
| 지시명 | title | auto | |
| 발령부서 | department | 120px | |
| 발령일 | effectiveDate | 120px | |

#### 누락 기능

- **[GAP]** 지시문서 등록/수정/삭제 CRUD 미구현 (현재 조회/상세보기만 있음)
- **[GAP]** 등록 폼 필요: 문서번호, 지시명, 발령부서, 발령일, 내용, 첨부파일

---

## SYS11: 연구자료종합관리체계

### 11-1. 메인화면 (ResearchMainPage)

**req_analysis 원본 기능:**
- 해군 연구용역 현황: 카테고리별 총과제수, 총 예산액 게시표 / 콤보박스로 년도 선택
- 소개자료(Introduce): 카테고리별 연구 소개 내용 및 해당 연구자료 게시판 링크

#### 현황 표시 필드

| 필드명 | 타입 | 비고 |
|--------|------|------|
| 전체 자료 | Statistic | |
| 이번달 등록 | Statistic | |
| 인기 분야 | Statistic | |
| 총 다운로드 | Statistic | |
| 년도 선택 | Select | **[GAP]** 콤보박스로 년도 선택 기능 누락 |
| 카테고리별 총과제수 | Table | **[GAP]** 카테고리별 통계 테이블 누락 |
| 카테고리별 총 예산액 | Table | **[GAP]** 예산액 정보 누락 |
| 소개자료 | Card grid | **[GAP]** 카테고리별 소개 내용 + 링크 누락 |

### 11-2. 연구자료 게시판 (ResearchListPage)

**req_analysis 원본 기능:**
- 목록 컬럼: 순번, 제목, 연구자, 연구년도, 연구예산
- 검색조건: (1)진행상황(최초평가, 중간평가, 최종평가), (2)키워드검색
- 엑셀 다운로드: 순번, 제목, 내용, ...

#### 연구자료 목록 테이블 컬럼

| 컬럼명 | dataIndex | width | 타입 | 비고 |
|--------|-----------|-------|------|------|
| 순번 | id | 80px | text | req: "순번" |
| 제목 | title | auto | text/ellipsis | |
| 연구자 | author | 100px | text | 현재 "저자"로 표시 |
| 연구년도 | researchYear | 100px | text | **[GAP]** 누락 - "연구년도" 컬럼 |
| 연구예산 | budget | 110px | number/currency | **[GAP]** 누락 - "연구예산" 컬럼 |
| 분야 | category | 100px | text | req에 없으나 유용 |
| 부서 | department | 120px | text | req에 없으나 현재 구현됨 |
| 다운로드 | downloadCount | 90px | number | req에 없으나 현재 구현됨 |
| 조회수 | viewCount | 80px | number | req에 없으나 현재 구현됨 |
| 등록일 | createdAt | 110px | date | |
| 관리 | - | 120px | buttons | 수정/삭제 |

#### 연구자료 검색 조건

| 검색조건 | name | 타입 | 비고 |
|----------|------|------|------|
| 진행상황 | progressStatus | select | **[GAP]** 최초평가/중간평가/최종평가 |
| 키워드 | keyword | text | **[GAP]** 검색 기능 미구현 |
| 카테고리 | category | select | 현재 CRUD_FIELDS에 select 있음 |

#### 연구자료 등록/수정 폼 필드

**req_analysis 원본:** 
1. 제목: 사용자 입력
2. 연구분야: 카테고리에 따른 연구분야 고정
3. 연구년도: 사용자 입력(숫자)
4. 기타 (잘린 부분)

| 필드명 | name | 타입 | 필수 | 비고 |
|--------|------|------|------|------|
| 제목 | title | text | Y | |
| 연구분야 | category | select (readonly) | Y | 카테고리에 따라 고정 |
| 연구년도 | researchYear | number | Y | **[GAP]** 누락 |
| 연구예산 | budget | number | Y | **[GAP]** 누락 |
| 진행상황 | progressStatus | select | Y | **[GAP]** 최초/중간/최종평가 |
| 연구자 | author | text | Y | |
| 부서 | department | text | N | |
| 설명 | description | textarea | Y | |
| 첨부파일 | file | upload | N | 현재 폼에 upload 컴포넌트 없음 **[GAP]** |

#### 엑셀 다운로드

- **[GAP]** 전체 목록 엑셀 다운로드 기능 미구현
- 컬럼: 순번, 제목, 내용, 연구자, 연구년도, 연구예산 등

#### 첨부파일 다운로드 이력

- **[GAP]** 다운로드 이력 저장/조회 기능 미구현
- 저장 필드: 다운로더 정보, 다운로드 일시, 파일명, 게시글 ID

### 11-3. 자료실 (ResearchFilePage)

현재 구현 적합. 일반 게시판 형태로 공통 기능 사용 가능.

### 11-4. 관리자 (ResearchAdminPage)

**req_analysis 원본 기능:**
- 관리자 목록 조회/등록/수정/삭제 (공통 권한관리 사용)
- 첨부파일 다운로드 이력 조회/검색

#### 다운로드 이력 검색 조건

| 검색조건 | name | 타입 | 비고 |
|----------|------|------|------|
| 게시판 선택 | boardType | select (default: 전체) | **[GAP]** 상세 검색 미구현 |
| 조건2 | - | - | req_analysis에서 잘림 |

#### 다운로드 이력 테이블 컬럼

| 컬럼명 | dataIndex | width | 비고 |
|--------|-----------|-------|------|
| 번호 | id | 80px | **[GAP]** 현재 Mock 데이터만 |
| 다운로더 | downloaderName | 100px | |
| 소속 | downloaderUnit | 120px | |
| 파일명 | fileName | auto | |
| 다운로드일시 | downloadedAt | 150px | |
| 게시판 | boardType | 100px | |

---

## SYS14: 나의 제언

### 14-1. 메인화면 (SuggestionMainPage)

**req_analysis 원본 기능:**
- 공지사항: 최신 5개 조회
- 제언확인: 제언 목록(번호, 제목, 진행상태, 작성일) - 최신 5개

현재 구현: 통계 카드 4개 + 최신 제언 5건. 적합하나 다음 GAP 존재:

- **[GAP]** 공지사항 최신 5건 영역 누락 (현재 통계 카드만 표시)
- 메인 레이아웃에 공지사항 Card + 제언확인 Card 양쪽 배치 필요

### 14-2. 제언확인 목록 (SuggestionListPage)

**req_analysis 원본 컬럼:** 순번, 제목, 제언자, 작성일, 진행상태, 담당부서, 조치일, 조치유형

#### 제언 목록 테이블 컬럼

| 컬럼명 | dataIndex | width | 타입 | 비고 |
|--------|-----------|-------|------|------|
| 순번 | - | 80px | index | req: 연도별 구분 ex) 2026-1, 2026-2 **[GAP]** |
| 제목 | title | auto | text/ellipsis | |
| 제언자 | authorName | 100px | text | |
| 작성일 | createdAt | 110px | date | |
| 진행상태 | status | 100px | StatusBadge | |
| 담당부서 | assignedDept | 100px | text | **[GAP]** 누락 |
| 조치일 | actionDate | 110px | date | **[GAP]** 누락 |
| 조치유형 | actionType | 100px | text | **[GAP]** 누락 |
| 소속 | authorUnit | 100px | text | 현재 구현됨 |
| 추천 | recommendCount | 70px | number | 현재 구현됨 |

**순번 규칙:** 연도별 구분 필요 (ex. 2026-1, 2026-2...) - 현재 단순 index 렌더

#### 엑셀 출력

- **[GAP]** 엑셀 출력 기능 미구현
- 컬럼: 제목, 내용, 제언자, 소속, 작성일, 진행상태, 담당부서, 조치일, 조치유형

### 14-3. 제언 상세 조회

**req_analysis 원본 필드:** 제목, 제언자, 작성일, 소속, 직책, 전화번호, 내용, 첨부파일, 진행상태

#### 상세 조회 필드

| 필드명 | key | 비고 |
|--------|-----|------|
| 제목 | title | |
| 제언자 | authorName | |
| 작성일 | createdAt | |
| 소속 | authorUnit | |
| 직책 | authorPosition | **[GAP]** 누락 |
| 전화번호 | authorPhone | **[GAP]** 누락 |
| 내용 | content | |
| 첨부파일 | attachments | **[GAP]** 첨부파일 필드 누락 |
| 진행상태 | status | |

### 14-4. 상태 변경 (관리자)

**req_analysis 원본:**
- 진행상태: SelectBox - 등록, 접수, 진행, 완료
- 조치유형 선택 시 조치일 설정(DatePicker)
- 반려 시 반려사유 입력

#### 진행상태 옵션 (현재 vs req)

| 현재 구현 | req_analysis | 비고 |
|-----------|-------------|------|
| open (대기) | 등록 | |
| - | 접수 | **[GAP]** 누락 |
| - | 진행 | **[GAP]** 누락 |
| answered (답변완료) | 완료 | |
| closed (종료) | - | req에 없음 |

**[GAP]** 상태 체계 불일치: req는 4단계(등록/접수/진행/완료), 현재 3단계(open/answered/closed)

#### 누락 기능

- **[GAP]** 조치유형 선택 기능 (SelectBox)
- **[GAP]** 조치유형 선택 시 조치일 DatePicker
- **[GAP]** 반려 시 반려사유 입력 기능

### 14-5. 제언 등록/수정 폼

**req_analysis 원본:** 제목, 내용, 첨부파일 등록 (소속, 제언자, 직책, 전화번호는 로그인 정보에서 자동)

#### 폼 필드

| 필드명 | name | 타입 | 필수 | 비고 |
|--------|------|------|------|------|
| 제목 | title | text | Y | |
| 내용 | content | textarea | Y | |
| 첨부파일 | attachments | upload | N | **[GAP]** 누락 |
| 소속 | authorUnit | text (readonly) | - | 로그인 정보 자동입력 **[GAP]** 표시 없음 |
| 제언자 | authorName | text (readonly) | - | 로그인 정보 자동입력 **[GAP]** 표시 없음 |
| 직책 | authorPosition | text (readonly) | - | **[GAP]** 누락 |
| 전화번호 | authorPhone | text (readonly) | - | **[GAP]** 누락 |

### 14-6. 댓글 기능

**req_analysis 원본:**
- 댓글 조회: 작성자, 작성일, 내용, 첨부파일 조회
- 댓글 등록: 내용, 첨부파일 등록
- 댓글 수정: 내용, 첨부파일 수정
- 댓글 삭제

**[GAP]** 댓글 기능 전체 미구현 (현재 상세 모달에 답변 영역만 존재)

#### 댓글 UI 설계

| 요소 | 타입 | 비고 |
|------|------|------|
| 댓글 목록 | List (antd) | 작성자, 작성일, 내용, 첨부파일 |
| 댓글 작성 | Input.TextArea + Upload | 내용 + 첨부파일 |
| 댓글 수정 | 인라인 편집 | 본인 댓글만 |
| 댓글 삭제 | Popconfirm | 본인 댓글만 |

### 14-7. 서식관리 (관리자)

**req_analysis 원본:** 관리자가 제언 등록 및 수정에서 받을 서식을 등록하는 기능

**[GAP]** 서식관리 기능 전체 미구현

- 서식 템플릿 목록 조회/등록/수정/삭제 CRUD 필요
- 제언 등록 시 서식 선택 드롭다운 연동

---

## SYS16: 회의실예약관리체계

### 16-1. 회의예약신청 (MeetingReservePage)

**req_analysis 원본 입력값:** 회의실 관리 부대, 회의실, 예약일자, 시작시간, 종료시간, 회의 목적, 참석 인원, 참석자 정보

#### 예약 신청 폼 필드

| 필드명 | name | 타입 | 필수 | 비고 |
|--------|------|------|------|------|
| 회의실 관리 부대 | managingUnit | select | Y | **[GAP]** 누락 - 부대 선택 후 회의실 필터 |
| 회의실 선택 | roomId | select | Y | |
| 예약일 | date | DatePicker | Y | |
| 시작 시간 | startTime | TimePicker | Y | |
| 종료 시간 | endTime | TimePicker | Y | |
| 회의 목적 | purpose | TextArea | Y | |
| 참석 인원 | attendeeCount | number | Y | **[GAP]** 누락 |
| 참석자 정보 | attendees | text/list | N | **[GAP]** 누락 |

### 16-2. 내예약확인 (MyReservationPage)

현재 구현 적합. 목록 컬럼:

| 컬럼명 | dataIndex | width | 비고 |
|--------|-----------|-------|------|
| 번호 | - | 80px | |
| 회의실 | roomName | 120px | |
| 예약일 | date | 110px | |
| 시간 | startTime~endTime | 130px | |
| 목적 | purpose | auto | |
| 상태 | status | 80px | |
| 신청일 | createdAt | 110px | |
| 액션 | - | 140px | 수정/삭제 (대기만) |

### 16-3. 회의현황 (MeetingStatusPage)

**req_analysis 원본 검색조건:** 회의실 관리 부대, 회의실, 회의일자

#### 회의현황 검색 조건

| 검색조건 | name | 타입 | 비고 |
|----------|------|------|------|
| 회의실 관리 부대 | managingUnit | select | **[GAP]** 누락 |
| 회의실 | roomId | select | 구현됨 |
| 회의일자 | dateRange | RangePicker | 구현됨 |

### 16-4. 회의예약관리 (ReservationMgmtPage)

**req_analysis 원본 기능:** 목록 엑셀 다운로드, 목록 출력(프린트), 승인, 승인취소

#### 누락 기능

- **[GAP]** 엑셀 다운로드 버튼 미구현
- **[GAP]** 프린트 출력 버튼 미구현
- 승인/반려 기능은 구현됨

### 16-5. 회의실 관리 (MeetingRoomMgmtPage)

현재 구현 충실. 좌측 목록 + 우측 Tabs(기본정보/시간대/장비/사진) 패턴.

모든 핵심 기능 구현됨:
- 회의실 CRUD
- 시간대 설정 (요일별 Switch + TimePicker.RangePicker)
- 장비 관리 (추가/삭제)
- 사진 관리 (Upload + Image)

#### 회의실 일정 관리

**req_analysis 원본:** 고정 일정 조회/추가/수정/삭제

현재 시간대 설정 탭에서 요일별 운영시간만 관리. 고정 일정(정기 회의 등)은 별도 개념일 수 있음.
- **[GAP - 경미]** "고정 일정"이 요일별 운영시간을 의미하는지, 정기 회의 일정을 의미하는지 해석 차이 가능

### 16-6. 사용자별권한등록

**req_analysis 원본:** 권한구분(총괄관리자, 부대관리자), 관리부대에 따른 담당자를 추가/삭제

- 공통 권한관리 페이지 재사용 (index.tsx에서 라우트 없음)
- **[GAP]** 현재 index.tsx에 사용자별권한등록 라우트 누락 (ROOM-07 공통코드관리만 있음)

---

# GAP 분석 종합

## Critical GAP (필수 패치 대상)

| ID | 서브시스템 | GAP 내용 | 심각도 |
|----|-----------|---------|--------|
| G01 | SYS04 | 신청폼: 신청구분, 사유, 군번, 이메일, 전화번호 필드 누락 | HIGH |
| G02 | SYS04 | 신청 회수 기능 미구현 (pending -> withdrawn) | HIGH |
| G03 | SYS04 | 반려 시 반송의견 입력 없음 | HIGH |
| G04 | SYS04 | 등록대장 엑셀 다운로드/통계 미구현 | MEDIUM |
| G05 | SYS04 | 승인대기목록: 신청구분, 국방전자서명인증센터 상태 컬럼 누락 | MEDIUM |
| G06 | SYS05 | 현행규정 등록/수정/삭제 CRUD 미구현 (조회만) | HIGH |
| G07 | SYS05 | 해군본부 예규 등록/수정/삭제 CRUD 미구현 (조회만) | HIGH |
| G08 | SYS05 | 지시문서 등록/수정/삭제 CRUD 미구현 (조회만) | HIGH |
| G09 | SYS05 | 조직도(부/실/단 트리) 전시 미구현 | MEDIUM |
| G10 | SYS05 | 예하부대 예규 = 조직도/링크 전시인데 테이블로 구현됨 | MEDIUM |
| G11 | SYS11 | 메인화면: 년도 선택, 카테고리별 통계표, 소개자료 누락 | MEDIUM |
| G12 | SYS11 | 연구자료 목록: 연구년도, 연구예산 컬럼 누락 | HIGH |
| G13 | SYS11 | 연구자료 등록폼: 연구년도, 연구예산, 진행상황, 첨부파일 필드 누락 | HIGH |
| G14 | SYS11 | 연구자료 검색조건(진행상황/키워드) 미구현 | MEDIUM |
| G15 | SYS11 | 엑셀 다운로드 미구현 | MEDIUM |
| G16 | SYS11 | 첨부파일 다운로드 이력 저장/조회 미구현 | MEDIUM |
| G17 | SYS14 | 제언 목록: 담당부서, 조치일, 조치유형 컬럼 누락 | HIGH |
| G18 | SYS14 | 순번 형식: 연도별 구분(2026-1) 미적용 | MEDIUM |
| G19 | SYS14 | 진행상태 4단계(등록/접수/진행/완료) 불일치 | HIGH |
| G20 | SYS14 | 조치유형 + 조치일 DatePicker 연동 미구현 | HIGH |
| G21 | SYS14 | 반려사유 입력 미구현 | HIGH |
| G22 | SYS14 | 상세: 직책, 전화번호, 첨부파일 필드 누락 | MEDIUM |
| G23 | SYS14 | 등록폼: 첨부파일 upload 누락, 로그인 정보 자동표시 누락 | MEDIUM |
| G24 | SYS14 | 댓글 CRUD 전체 미구현 | HIGH |
| G25 | SYS14 | 서식관리 기능 전체 미구현 | HIGH |
| G26 | SYS14 | 엑셀 출력 미구현 | MEDIUM |
| G27 | SYS14 | 메인화면: 공지사항 최신 5건 영역 누락 | LOW |
| G28 | SYS16 | 예약신청: 관리부대 선택, 참석인원, 참석자정보 필드 누락 | MEDIUM |
| G29 | SYS16 | 회의현황: 관리부대 검색조건 누락 | LOW |
| G30 | SYS16 | 회의예약관리: 엑셀 다운로드/프린트 미구현 | MEDIUM |
| G31 | SYS16 | 사용자별권한등록 라우트 누락 | LOW |

## GAP 심각도 집계

| 심각도 | 건수 | 설명 |
|--------|------|------|
| HIGH | 14 | 핵심 기능 누락, 요구사항 미충족 |
| MEDIUM | 14 | 보조 기능/컬럼 누락, UX 개선 필요 |
| LOW | 3 | 부가 기능, 우선순위 낮음 |
| **합계** | **31** | |

## 서브시스템별 GAP 요약

| 서브시스템 | HIGH | MEDIUM | LOW | 구현 완성도 |
|-----------|------|--------|-----|-----------|
| SYS04 인증서 | 3 | 2 | 0 | 60% |
| SYS05 행정규칙 | 3 | 2 | 0 | 40% (CRUD 누락) |
| SYS11 연구자료 | 2 | 4 | 0 | 55% |
| SYS14 나의제언 | 5 | 4 | 1 | 45% |
| SYS16 회의실예약 | 0 | 3 | 2 | 85% |

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

Phase 3 UI-SPEC에서 식별된 31개 GAP(HIGH 14, MEDIUM 14, LOW 3)에 대해 6개 규칙 기반 수정이 적용되었다.

### 적용된 공통 패턴

1. **SearchForm 패턴**: 모든 목록 화면 상단에 `<SearchForm>` 컴포넌트 배치 (높이 100px, search-form-container CSS)
2. **militaryPersonColumn 패턴**: 인물 관련 컬럼에 `militaryPersonColumn()` 헬퍼 적용 — 군번/계급/성명 3항목 동시 표시
3. **DataTable CSS 패턴**: `navy-bordered-table` 클래스로 최상단 군청색 2px, 최하단 1px 라인
4. **CrudForm 확장**: file/dateRange 타입 필드 추가, CSV 입력값 항목 전체 반영

### 서브시스템별 GAP 해소

| 서브시스템 | GAP 해소 건수 | 주요 변경 |
|-----------|-------------|----------|
| SYS04 | 5/5 | SearchForm 3개 조건, militaryPersonColumn, 소속기관/활용동의 |
| SYS05 | 5/5 | SearchForm (규정명/문서번호/분류), militaryPersonColumn |
| SYS14 | 10/10 | SearchForm 4개 조건, militaryPersonColumn('제언자'), 반려사유 모달 |
| SYS11 | 6/6 | SearchForm 5개 조건, militaryPersonColumn, 첨부파일 구분 4종 |
| SYS16 | 5/5 | 회의명/등급/주관부서 폼, SearchForm, militaryPersonColumn |
