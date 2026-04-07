# Feature Landscape

**Domain:** 군 행정포탈 시스템 (Military Administrative Portal)
**Researched:** 2026-04-05
**Overall confidence:** HIGH (요구사항 문서 직접 분석 + enterprise/government portal 패턴 검증)

---

## Table Stakes

이것이 없으면 시스템이 완성되지 않은 것으로 간주된다. 사용자 이탈 또는 시스템 불신으로 이어진다.

### 인증 및 세션 관리

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 로그인/로그아웃 화면 | 군 행정시스템 접근 통제 필수 | Low | Mock 인증, 실제 연동 추후 |
| 세션 만료 처리 | 보안 요건 - 방치된 세션 자동 종료 | Low | 세션 만료 시 로그인 화면으로 리다이렉트 |
| 서브시스템 exit 처리 | spec 7.5항 - exit/창닫기 시 메인으로 이동 | Low | beforeunload 이벤트 활용 |
| 직접 URL 접근 차단 | 메인 포탈 경유 필수 (spec 7.3항) | Medium | 미인증 상태에서 서브시스템 직접 접근 불가 |

### 메인 포탈 대시보드

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 18개 서브시스템 링크 목록 | 포탈의 핵심 기능 - 진입점 역할 | Low | 카드 또는 타일 형태 |
| 서브시스템 권한 기반 표시 | 권한 없는 시스템은 비활성화 | Medium | 권한관리 모듈과 연동 |
| 사용자 정보 표시 | 현재 로그인한 사용자 확인 | Low | 이름, 계급, 소속 부대 |

### 공통 CRUD 컴포넌트

군 행정 시스템 845개 단위 프로세스의 대부분이 아래 패턴을 반복한다.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 목록 조회 (페이지네이션 + 검색 + 필터) | 모든 서브시스템의 기본 화면 | Medium | TanStack Table 기반 |
| 상세 조회 | 목록에서 행 클릭 시 상세 | Low | 모달 또는 별도 페이지 |
| 등록/수정 폼 | CRUD의 C/U | Medium | React Hook Form + Zod 검증 |
| 삭제 확인 다이얼로그 | 실수 삭제 방지 | Low | 확인 모달 필수 |
| 엑셀 다운로드 | 군 행정에서 보고서 출력 필수 | Medium | 거의 모든 목록 조회에 존재 |

### 결재(승인) 워크플로우

99_공통기능 및 다수 서브시스템에 결재 흐름이 반복된다.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 결재선 설정 (결재선 CRUD) | 결재자 지정 기능 - 99_공통기능 | Medium | 결재선 조회/추가/수정/삭제 |
| 결재 대기 목록 | 결재자가 처리할 항목 확인 | Medium | 초과근무, 설문, 부서이동 등 다수 시스템에 동일 패턴 |
| 결재 승인/반려 | 핵심 결재 액션 | Medium | 반려 시 사유 입력 필수 |
| 결재 상태 표시 | 기안자가 진행 상태 추적 | Low | 대기/승인/반려 상태 뱃지 |
| 일괄 결재 | 다수 건 동시 처리 | High | 초과근무 일괄처리 등 |

### 권한관리 (RBAC)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 권한그룹 CRUD | 역할 정의 - 99_공통기능 | Medium | 체계관리자/부대관리자/일반사용자 등 |
| 권한그룹별 메뉴 설정 | 메뉴 접근 제어 | Medium | 권한 없는 메뉴 숨김 처리 |
| 사용자별 권한 배정 | 개인 단위 권한 부여 | Medium | 권한그룹 배정 |
| 부대별 권한 배정 | 군 조직 특성 - 부대 단위 접근 제어 | Medium | 부대 기준 데이터 격리 |

### 공통 게시판

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 공지사항 게시판 | 18개 서브시스템 모두 포함 | Medium | 재사용 컴포넌트 필수 |
| 질의응답 게시판 | 대부분 서브시스템 포함 | Medium | 댓글/답글 기능 포함 |
| 첨부파일 업로드/다운로드 | 행정 문서 첨부 필수 | Medium | 파일 크기 제한, 형식 제한 |
| 카테고리(말머리) 관리 | 게시글 분류 | Low | 관리자 설정 |
| 게시판 사용자/부대 접근 제어 | 게시판별 읽기/쓰기 권한 | Medium | 부대별 게시판 격리 |

### 시스템 관리

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 체계담당자(SuperAdmin) 관리 | 시스템 관리자 지정 - 99_공통기능 | Low | IP 접근 통제 포함 |
| 메뉴 관리 | 동적 메뉴 구성 | Medium | URI, 정렬순서, 상위메뉴 |
| 코드/코드그룹 관리 | 공통 코드 테이블 관리 | Medium | 서브시스템 간 공유 코드 |
| 접속 로그 조회 | 감사 추적 - 군 보안 요건 | Low | 엑셀 다운로드 포함 |
| 장애 로그 조회 | 시스템 이상 탐지 | Low | 오류 로그 조회 |
| 메시지 관리 | 다국어/공통 메시지 관리 | Low | 메시지 ID 기반 |

---

## Differentiators

없어도 기능하지만, 있으면 사용성을 크게 높이는 기능들.

### 서브시스템별 메인화면 대시보드

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| KPI 차트 위젯 (성과관리) | 업무 달성률을 즉각 파악 | High | 03_성과관리체계: 부서별/방침별 추진진도율 그래프 |
| 나의 근무현황 그래프 (초과근무) | 개인 현황 한눈 파악 | Medium | 01_초과근무: 연간/월간 그래프 |
| 보안 현황 요약 (보안결산) | 당일 보안 상태 즉시 확인 | High | 15_보안일일결산체계 메인 필요 |

### 캘린더 UI

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 근무시간 캘린더 입력 | 일별 근무시간 설정 직관적 | High | 01_초과근무: 일별 근무시간, 공휴일 관리 |
| 회의실 예약 캘린더 | 가용 시간 시각화 | High | 16_회의실예약: 타임슬롯 달력 뷰 |

### 엑셀 일괄 업로드

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 설문 문항 엑셀 업로드 | 대량 문항 등록 효율화 | High | 02_설문: 엑셀 양식 다운로드 → 작성 → 업로드 |
| 과제(중과제) 일괄 등록 | 성과관리 초기 데이터 입력 | High | 03_성과관리: 엑셀 일괄 등록 |

### 상태 기반 워크플로우 시각화

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 결재 진행 상태 타임라인 | 기안자가 결재 위치 추적 | Medium | 기안→검토→결재→완결 단계 시각화 |
| 부대계보 트리 뷰 | 계보 구조 직관적 표현 | High | 08_부대계보: 계층 트리 렌더링 |

### 사용자 편의 기능

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 최근 접속 서브시스템 | 자주 쓰는 시스템 빠른 접근 | Low | 포탈 대시보드에서 활용 |
| 결재 대기 알림 배지 | 처리해야 할 항목 즉각 인지 | Medium | 헤더 알림 영역 |
| 검색 결과 하이라이트 | 검색어가 어디 있는지 즉각 파악 | Low | 목록 검색 결과 강조 |

---

## Anti-Features

명시적으로 구축하지 말아야 할 것들.

### 모바일 반응형 디자인

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 모바일/태블릿 반응형 레이아웃 | 스코프 밖 (개발 spec 명시: 데스크톱 우선), 복잡성 급증 | 데스크톱 1280px 고정폭 기준으로만 개발 |

### 실시간 기능

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 실시간 알림 (WebSocket/SSE) | 백엔드 없는 MVP 단계에서 구현 불가, 아키텍처 복잡도 급증 | Mock 데이터로 알림 수 정적 표시 |
| 자동 새로고침/폴링 | 동일 이유 | 수동 새로고침으로 대체 |

### 백엔드 의존 기능 선행 개발

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 실제 파일 업로드/다운로드 처리 | 백엔드 없음 - MVP 이후 | UI 인터랙션만 구현, 실제 파일 처리 제외 |
| 실제 결재 이메일/SMS 발송 | 백엔드 없음 | 결재 화면 UI만 구현 |
| 실제 인증 연동 (OMS, 군 시스템) | 복잡한 외부 시스템 연동 | Mock 사용자 데이터로 대체 |

### 과도한 커스터마이징

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 서브시스템별 완전 다른 UI 테마 | 18개 시스템 유지보수 비용 폭증 | 공통 디자인 시스템 엄격히 적용 |
| 각 서브시스템마다 독립적인 CRUD 컴포넌트 재개발 | 코드 중복, 일관성 붕괴 | 공통 컴포넌트를 props로 재구성 |
| 위지윅(WYSIWYG) 에디터 | 군 행정 문서는 단순 텍스트/테이블 수준 | Textarea + 기본 서식 |

### 데이터 시각화 과잉

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 모든 서브시스템에 대시보드 차트 추가 | 요구사항 없는 곳에 차트 추가는 스코프 크립 | 요구사항 명시된 시스템(성과관리, 초과근무)에만 적용 |

---

## Feature Dependencies

```
인증(로그인) → 메인 포탈 대시보드 → 서브시스템 접근
권한그룹 → 권한그룹별 메뉴 → 사용자 메뉴 표시
권한그룹 → 권한그룹별 사용자 배정 → 서브시스템 접근 통제
코드/코드그룹 → 모든 서브시스템 드롭다운/선택 필드
결재선 관리 → 결재 워크플로우 (초과근무, 설문, 부서이동)
공통게시판 설정 → 서브시스템별 공지사항/질의응답 게시판
공통게시판 → 게시판 사용자/부대 접근 제어 → 권한관리

엑셀 다운로드: 거의 모든 목록 조회에 종속 (독립 기능)
파일 첨부: 게시판, 신청서 등에 공통 종속
```

---

## MVP Recommendation

MVP는 "프론트엔드 화면 우선" 원칙에 따라 실제 데이터 처리 없이 화면 인터랙션만 구현한다.

### 필수 우선순위 (Phase 0-2 완료 시 시연 가능)

1. **공통 컴포넌트 라이브러리** - 목록 테이블, 폼, 모달, 게시판이 모든 서브시스템의 기반
2. **인증 Mock + 세션 관리** - 진입 게이트 없으면 나머지가 무의미
3. **메인 포탈 대시보드** - 18개 서브시스템 진입점
4. **권한관리 (99_공통기능)** - 모든 서브시스템이 권한 컴포넌트 재사용
5. **공통 게시판** - 18개 서브시스템 전부 공지사항/질의응답 포함

### 단계적 확장 (Phase 3-7)

복잡도 순으로 서브시스템을 추가한다. 낮은 복잡도에서 공통 컴포넌트의 완성도를 높인 뒤 고복잡도 시스템에 적용한다.

### 명시적으로 뒤로 미룰 것

| Feature | Reason |
|---------|--------|
| 캘린더 UI (근무시간, 회의실) | 복잡한 전용 컴포넌트 필요, Phase 5-6까지 미룸 |
| 엑셀 일괄 업로드 | 파일 파싱 로직, 백엔드 연동 시 구현 |
| KPI 차트 (성과관리) | 최고복잡도 시스템 - Phase 7 |
| 부대계보 트리 뷰 | 트리 렌더링 전용 라이브러리 필요 - Phase 6 |
| 실제 파일 업로드 처리 | 백엔드 없는 MVP에서 UI만 |

---

## Phase-Specific Feature Notes

| Phase | 핵심 Feature | 주의사항 |
|-------|-------------|---------|
| Phase 0 (기반 구축) | 공통 컴포넌트 라이브러리, Routing, Layout | 이 단계 품질이 전체 845개 프로세스 속도 결정 |
| Phase 1 (공통기능 99) | 권한관리, 결재선, 코드관리, 공통게시판 | 서브시스템 개발 전 반드시 완료 필요 |
| Phase 2 (메인 포탈 00) | 로그인, 대시보드, 서브시스템 링크 | Mock 인증으로 완전 동작 시연 가능해야 함 |
| Phase 3-5 (저-중복잡도) | 서브시스템별 업무 화면 | 공통 컴포넌트 재사용 극대화 |
| Phase 6 (고복잡도) | 부대계보 트리, 초과근무 복잡 워크플로우 | 트리 컴포넌트, 캘린더 컴포넌트 신규 개발 필요 |
| Phase 7 (최고복잡도) | 성과관리 차트, 보안일일결산 복합 워크플로우 | Chart.js/Recharts 도입, 가장 많은 화면 수 |

---

## Sources

- 프로젝트 요구사항 직접 분석: `C:/Users/User/2nd_biz/req_analysis.txt` (845개 단위 프로세스)
- 개발 spec: `C:/Users/User/2nd_biz/개발 spec.txt`
- [Enterprise UI Design Best Practices 2024](https://www.softkraft.co/enterprise-ui-design/) — MEDIUM confidence
- [Table-stake Features in SaaS/Enterprise Products](https://www.linkedin.com/pulse/table-stake-features-saas-enterprise-products-rohit-pareek) — MEDIUM confidence
- [Korea eGovFrame Common Components](https://www.egovframe.go.kr/eng/main.do) — HIGH confidence (한국 정부 표준 프레임워크)
- [DoD Administrative System Access Control Patterns](https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/852004p.pdf) — MEDIUM confidence
- [Modern Enterprise UI Design - Tables](https://medium.com/pulsar/modern-enterprise-ui-design-part-1-tables-ad8ee1b9feb) — MEDIUM confidence

---

## GAP 수정 반영 (2026-04-07)

### 표준화된 GAP 규칙 6개 (전체 서브시스템 공통 적용)

req_spec 기반 GAP 분석 결과, 아래 6개 규칙이 18개 서브시스템 전체에 표준 기능으로 적용됨.

| 규칙 | 명칭 | 설명 | 적용 범위 |
|------|------|------|----------|
| **R1** | 입력값 컬럼 반영 | CSV '입력값' 항목의 모든 컬럼을 CrudForm 필드에 반영 | 등록/수정 화면 전체 |
| **R2** | 검색영역 100px | 목록 그리드 상단에 높이 100px SearchForm 고정 영역 | 목록 화면 전체 |
| **R3** | 규칙/예외사항 구현 | CSV '규칙/예외조건' 내용을 UI 로직/안내문/제한조건으로 구현 | 해당 프로세스 |
| **R4** | 관리자 메뉴 | 18개 서브시스템 각각에 관리자 기능 메뉴 포함 | 전체 서브시스템 |
| **R5** | 테이블 군청색 라인 | 최상단 군청색(#003366) 2px, 최하단 1px 보더 | DataTable 전체 |
| **R6** | 군번/계급/성명 표시 | 신청자/사용자 정보에 군번/계급/성명 3항목 동시 표시 | 인물 정보 컬럼 전체 |

### 공통 컴포넌트 기능 추가

| 컴포넌트 | 추가 기능 |
|----------|----------|
| DataTable | navy-bordered-table CSS 클래스 (R5) |
| SearchForm | search-form-container wrapper div (R2) |
| CrudForm | file, dateRange, checkbox 필드 타입 (R1) |
| DetailModal | render 시그니처 record 인자 추가 |
| military.ts (신규) | formatMilitaryPerson(), militaryPersonColumn() 헬퍼 (R6) |
| index.css | 글로벌 CSS: 테이블 보더 + 검색 컨테이너 (R2, R5) |
