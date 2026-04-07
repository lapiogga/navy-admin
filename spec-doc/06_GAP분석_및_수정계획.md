# GAP 분석 및 수정 계획

## 완료된 작업 (세션 8-2)

### 공통 컴포넌트 수정 완료
1. **DataTable.tsx** - `navy-bordered-table` CSS 클래스 + `borderTop` 인라인 스타일 적용
2. **index.css** - 글로벌 CSS 추가:
   - `.navy-bordered-table .ant-table`: 상단 2px solid #003366
   - `.navy-bordered-table .ant-table-container`: 하단 1px solid #003366
   - `.navy-bordered-table .ant-table-thead > tr > th`: 헤더 배경 #f0f5ff, 하단선 1px
   - `.search-form-container`: 높이 100px, 배경 #fafafa, border, padding
3. **SearchForm.tsx** - `search-form-container` div wrapper 추가
4. **CrudForm.tsx** - `file`, `dateRange` 타입 필드 추가 (ProFormUploadButton, ProFormDateRangePicker)
5. **military.ts** - 신규 생성:
   - `formatMilitaryPerson()`: 군번/계급/성명 문자열 포맷
   - `militaryPersonColumn()`: ProTable 컬럼 생성 헬퍼
6. **spec-doc/** - 5개 문서 생성 (조감도, 업무분석서, 다이어그램, 메뉴구조도, 사용자상관관계도)

---

## 미완료 작업: 18개 서브시스템 페이지 수정

### 적용 규칙 6개 (모든 서브시스템 공통)

| # | 규칙 | 적용 방법 |
|---|------|----------|
| R1 | 입력값 컬럼 반영 | CrudForm fields에 CSV '입력값' 항목 전부 추가 |
| R2 | 검색영역 100px | SearchForm 컴포넌트를 목록 페이지 상단에 추가, CSV '검색기능' 항목 반영 |
| R3 | 규칙/예외사항 반영 | CSV '규칙/예외조건' 컬럼 내용을 UI 로직/안내문/제한조건으로 구현 |
| R4 | 관리자 메뉴 포함 | 각 서브시스템에 관리자 메뉴 (시스템관리/코드관리/권한관리/게시판설정) 라우트 확인 |
| R5 | 테이블 군청색 라인 | DataTable에 이미 적용됨 (글로벌 CSS). HTML table 사용 페이지는 DataTable로 전환 |
| R6 | 신청자 = 군번/계급/성명 | `militaryPersonColumn()` 헬퍼 사용하여 사용자 관련 컬럼 교체 |

### 서브시스템별 상세 GAP 목록

#### SYS01 초과근무관리체계 (99 프로세스)
- [ ] OtRequestPage: SearchForm 추가 (검색조건: 신청서종류, 근무일, 상태)
- [ ] OtRequestPage: 입력값 반영 - 신청서 종류(사전/사후), 신청자IP, 당직개소 필드 추가
- [ ] OtRequestPage: 신청자 컬럼 → militaryPersonColumn으로 교체
- [ ] OtApprovalPage: 결재자 군번/계급/성명 표시
- [ ] OtMyStatusPage: HTML table → DataTable 전환
- [ ] OtMonthlyClosingPage: 결산년월 검색, 입력필드 확인
- [ ] 부대관리 페이지들: 부대인원 컬럼에 군번/계급/성명 적용
- [ ] 당직업무 페이지들: SearchForm, 군번/계급/성명 적용

#### SYS02 설문종합관리체계 (31 프로세스)
- [ ] MySurveyPage: SearchForm 추가 (검색조건: 설문상태, 기간)
- [ ] MySurveyPage: 입력값 반영 - 대상계급, 대상부대, 대상직책, 대상성별 필드 추가
- [ ] MySurveyPage: 첨부파일(관련근거, 설문지, 보안성검토) file 필드 추가
- [ ] SurveyParticipationPage: 참여자 군번/계급/성명 표시

#### SYS03 성과관리체계 (76 프로세스)
- [ ] PerfTaskSearchPage: SearchForm 추가
- [ ] 과제등록/실적입력: 입력값 필드 확인 (과제명, 담당부서, 목표, 실적)
- [ ] 평가자 목록: 군번/계급/성명 표시
- [ ] PerfProgressRatePage: 검색조건 (연도, 부서, 과제유형)

#### SYS04 인증서발급신청체계 (14 프로세스)
- [ ] CertificateApplyPage: SearchForm 추가
- [ ] CertificateApplyPage: 입력값 반영 - 신청정보 활용동의, 소속기관 필드 추가
- [ ] CertificateApplyPage: 신청자 컬럼 → 군번/계급/성명
- [ ] CertificateApprovalPage: 승인자/신청자 군번/계급/성명

#### SYS05 행정규칙포탈체계 (15 프로세스)
- [ ] RegulationListPage: SearchForm 추가 (검색조건: 규정명, 문서번호, 분류)
- [ ] 등록 폼: 입력값 확인 (규정명, 문서번호, 소관부서, 발효일 등)

#### SYS06 해병대규정관리체계 (30 프로세스)
- [ ] SYS05 컴포넌트 재사용 확인, sysCode 동적 처리
- [ ] 게시판 3종 확인 (공지, 규정예고, 자료실)

#### SYS07 군사자료관리체계 (40 프로세스)
- [x] SearchForm 이미 적용됨
- [ ] 입력값 반영 - 비밀등급, 보관장소, 관리번호 등 17개 필드 확인
- [ ] 검색조건 확인 - 보관형태, 보존기간, 이관년도 등 11개 조건
- [ ] 활용관리(대출/열람/지출): 대출자 군번/계급/성명
- [ ] 통계자료: 문서별 보유/접수용관리기록부/활용지원기록부/활용실적

#### SYS08 부대계보관리체계 (59 프로세스)
- [ ] UnitKeyPersonPage: 군번 컬럼 추가
- [ ] 주요직위자 입력값: 계승번호, 역대, 보직/면직일자, 한글/한자 성명, 병과, 임관구분, 직무대리여부, 지휘관 표어/방침
- [ ] 주요활동 입력값: 연혁부호, 비밀여부/구분, 카테고리, 대표사진
- [ ] 권한신청 입력값: 관리부대, 요청권한, 군 전화번호, 인사명령 근거
- [ ] 각 목록 페이지: SearchForm 추가

#### SYS09 영현보훈체계 (35 프로세스)
- [ ] DeceasedPage: SearchForm 추가 (사망구분, 계급, 부대)
- [ ] 사망자 입력값: 주민등록번호, 사망구분기호, 사망자주소 등 추가 필드
- [ ] 상이자 입력값: 현주소, 보훈청명, 병명, 전공상 여부
- [ ] 전공사상심사: 심사차수, 심사일자, 분류 등
- [ ] 통계 출력 페이지: 필터 조건 추가 (부대별/계급별)

#### SYS10 주말버스예약관리체계 (44 프로세스)
- [ ] BusReservationPage: 예약자 군번/계급/성명 표시
- [ ] BusSchedulePage, BusViolatorPage: SearchForm 추가
- [ ] 배차관리 검색조건: 상하행구분, 운행일자, 출발시간, 출발지, 도착지
- [ ] 타군사용자: 군구분, 부대명, 군번, 계급, 성명, 직책, 전화, 메일

#### SYS11 연구자료종합관리체계 (19 프로세스)
- [ ] ResearchListPage: SearchForm 추가 (검색조건: 진행상황, 제목, 연구자, 연구년도, 과제담당관)
- [ ] 입력값: 연구분야(카테고리), 연구년도, 연구예산, 연구자(군내/외부), 진행사항, 과제담당관
- [ ] 게시판 컬럼: 순번, 제목, 연구자, 연구년도, 연구예산, 과제담당관, 게시자, 게시일자, 진행상황

#### SYS12 지시건의사항관리체계 (32 프로세스)
- [ ] DirectiveListPage: SearchForm 추가
- [ ] 지시사항 입력값: 지시자, 지시일자, 수명부대, 추진상태, 지시내용, 종류(문서/구두)
- [ ] 조치사항 입력값: 업무담당자, 추진상태, 추진계획, 추진내용, 첨부파일
- [ ] 건의사항 입력값: 건의자, 건의일자, 주관부대, 추진상태, 건의내용

#### SYS13 지식관리체계 (23 프로세스)
- [ ] KnowledgeListPage: SearchForm 추가 (카테고리, 키워드, 제목, 내용, 작성자, 작성부대)
- [ ] 입력값: 제목, 지식유형, 출처(생산/카피), 키워드(다수), 내용, 첨부파일
- [ ] 작성자 컬럼 → 군번/계급/성명

#### SYS14 나의 제언 (16 프로세스)
- [ ] SuggestionListPage: SearchForm 추가 (제목, 작성자, 진행상태, 조치유형)
- [ ] 목록 컬럼: 순번, 제목, 제언자, 작성일, 진행상태, 담당부서, 조치일, 조치유형
- [ ] 상세: 소속, 직책, 전화번호, 첨부파일
- [ ] 상태변경: 진행상태, 조치유형, 조치일(DatePicker), 담당부서, 반려사유
- [ ] 제언자 컬럼 → 군번/계급/성명 (로그인정보 연동)

#### SYS15 보안일일결산체계 (138 프로세스)
- [x] 일부 SearchForm 이미 적용됨
- [ ] 저장매체 관리: 매체구분, 등급, 증감수량, 비고 입력값 확인
- [ ] 비밀 관리: 비밀등급, 증감, 증감현황, 수량 입력값 확인
- [ ] 인계/인수: 결재 정보 포함
- [ ] 개인보안결산: 캘린더 형태 확인
- [ ] 사무실보안결산: 미실시자, 부재자 사유 입력 필수 규칙
- [ ] 점검관 당직표: 결재자 기본 지정/변경 가능 규칙
- [ ] 미적용 페이지 SearchForm 추가

#### SYS16 회의실예약관리체계 (21 프로세스)
- [ ] MeetingReservePage: 예약자 군번/계급/성명
- [ ] MeetingStatusPage: SearchForm 추가 (회의실 관리부대, 회의실, 회의일자)
- [ ] 입력값: 회의실 관리부대, 회의실, 회의명, 회의일시, 회의등급, 주관부서

#### SYS17 검열결과관리체계 (25 프로세스)
- [ ] InspectionPlanPage: SearchForm 추가 (연도, 대상부대, 과제명, 진행상태, 검열분야)
- [ ] 검열계획 입력값: 검열연도, 검열계획명, 검열기간, 대상부대, 비고, 첨부파일
- [ ] 조치과제 입력값: 검열계획, 대상부대, 주관부서, 담당검열관, 공개여부, 과제번호, 검열분야, 처분종류, 과제명, 주요내용
- [ ] 과제처리 입력값: 진행상태, 문제점, 조치계획/결과, 첨부파일

#### SYS18 직무기술서관리체계 (47 프로세스)
- [ ] JobDescListPage: SearchForm 추가
- [ ] 조직진단 입력값: 조직진단명, 조직진단부대, 작성기간, 진단기간, 대상자, 제외대상자
- [ ] 규칙: 진단기간 이전까지만 수정/삭제 가능
- [ ] 직무기술서 작성: 엑셀 가져오기, 결재자 지정, 초과근무 실적 연동
- [ ] 관리자 조회 검색조건: 진단명, 검색기간, 부대명, 직책명
- [ ] 표준업무시간: 신분별, 적용기간, 적용여부(만료/적용중/예정)

---

## 실행 전략

### Wave 1: 저복잡도 (5개, 병렬)
- SYS04 (14), SYS05 (15), SYS14 (16), SYS11 (19), SYS16 (21)

### Wave 2: 중복잡도 A (6개, 병렬)
- SYS13 (23), SYS17 (25), SYS06 (30), SYS02 (31), SYS12 (32), SYS09 (35)

### Wave 3: 중복잡도 B (3개, 병렬)
- SYS07 (40), SYS10 (44), SYS18 (47)

### Wave 4: 고/최고복잡도 (4개, 병렬)
- SYS08 (59), SYS01 (99), SYS03 (76), SYS15 (138)

### Wave 5: 문서 업데이트
- PLAN.md, SUMMARY.md, RESEARCH.md, VALIDATION.md, UI-SPEC.md 등 전체 현행화

---

## 다음 세션 재개 지침

```
1. 이 문서를 읽는다: spec-doc/06_GAP분석_및_수정계획.md
2. req_spec CSV 파일들을 참조한다: /c/Users/User/2nd_biz/req_spec/*.csv
3. Wave 1부터 순차 실행한다 (각 Wave 내 병렬 에이전트 사용)
4. 각 서브시스템별 적용 사항:
   - SearchForm 추가 (CSV '검색기능' 항목 기반)
   - CrudForm 필드 추가 (CSV '입력값' 항목 기반)
   - 규칙/예외사항 UI 로직 반영
   - militaryPersonColumn() 적용 (사용자 관련 컬럼)
   - 관리자 메뉴 라우트 확인
5. Wave 5에서 마크다운 문서 전체 업데이트
```
