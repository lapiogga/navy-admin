---
phase: 03-5
verified: 2026-04-05T16:30:18Z
status: gaps_found
score: 5/5 truths verified (implementation), 1 documentation gap
re_verification: false
gaps:
  - truth: "REQUIREMENTS.md 체크박스가 구현 완료 상태를 반영한다"
    status: partial
    reason: "AREG-01~04(sys05)와 RSRC-01~06(sys11)은 코드 구현 완료이나 REQUIREMENTS.md에서 미체크([ ]) 상태 — 문서 동기화 누락"
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "AREG-01, AREG-02, AREG-03, AREG-04, RSRC-01, RSRC-02, RSRC-03, RSRC-04, RSRC-05, RSRC-06 — 체크박스가 [ ] (미완료)로 표시됨"
    missing:
      - "REQUIREMENTS.md의 AREG-01~04 체크박스를 [x]로 업데이트"
      - "REQUIREMENTS.md의 RSRC-01~06 체크박스를 [x]로 업데이트"
human_verification:
  - test: "sys05 행정규칙 즐겨찾기 localStorage 영속성 확인"
    expected: "현행규정 즐겨찾기 클릭 후 페이지 새로고침 시 별표 상태가 유지됨"
    why_human: "localStorage 읽기/쓰기는 브라우저 환경에서만 동작 — 코드 검증으로 대체 불가"
  - test: "sys16 예약 신청 -> 내예약확인 자동 이동 플로우"
    expected: "예약 신청 폼 제출 성공 시 /sys16/1/3(내예약확인) 화면으로 자동 이동하고 신규 예약이 목록에 표시됨"
    why_human: "navigate + query invalidation 연동은 런타임 동작 — 정적 분석으로 확인 불가"
---

# Phase 3: 저복잡도 서브시스템 5개 검증 리포트

**Phase Goal:** 5개 저복잡도 서브시스템(85개 프로세스)이 공통 컴포넌트를 재사용하여 완전 동작하고, 재사용 패턴이 확립된다
**Verified:** 2026-04-05T16:30:18Z
**Status:** gaps_found (문서 동기화 누락 — 코드 구현 자체는 완전)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 인증서발급신청체계에서 사용자가 신청서를 작성하고 관리자가 승인/반려하면 상태가 변경되어 등록대장에 반영된다 | VERIFIED | CertificateApplyPage(DataTable+CrudForm+useMutation), CertificateApprovalPage(Popconfirm+approveMutation+rejectMutation), CertificateRegisterPage(DetailModal), sys04.ts(6 엔드포인트+PATCH approve/reject) |
| 2 | 행정규칙포탈에서 현행규정과 예규를 목록/상세 조회하고 다운로드 버튼을 클릭할 수 있다 | VERIFIED | RegulationListPage(useFavorites+DataTable+Modal+Descriptions), PrecedentHQPage, PrecedentUnitPage, DirectiveListPage — 4개 페이지 구현, sys05.ts 6 엔드포인트 |
| 3 | 나의 제언에서 사용자가 제언을 작성하고 추천/신고/비공개 처리가 동작하며 관리자가 답변을 달 수 있다 | VERIFIED | SuggestionListPage(LikeOutlined/WarningOutlined 추천/신고 useMutation), SuggestionAdminPage(PATCH /private+/answer), sys14.ts 11 엔드포인트 |
| 4 | 연구자료관리체계에서 자료를 등록하고 카테고리별 조회, 다운로드, 통계 화면이 표시된다 | VERIFIED | ResearchMainPage(통계 4카드+최신/인기 List), ResearchListPage(DataTable+CrudForm), ResearchFilePage(다운로드), ResearchAdminPage(6탭), sys11.ts 12 엔드포인트 |
| 5 | 회의실예약체계에서 예약 신청 -> 관리자 승인 -> 내 예약 확인 플로우가 동작하고, 회의실 정보와 현황을 조회할 수 있다 | VERIFIED | MeetingReservePage(POST+navigate('/sys16/1/3')), ReservationMgmtPage(approveMutation+rejectMutation+Popconfirm), MyReservationPage, MeetingStatusPage, MeetingRoomMgmtPage(4탭), sys16.ts 20 엔드포인트 |

**Score:** 5/5 truths verified (코드 구현 기준)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|---------|--------|---------|
| `src/pages/sys04-certificate/CertificateApplyPage.tsx` | 인증서 신청 CRUD | VERIFIED | DataTable+CrudForm+StatusBadge+useMutation 완전 구현 |
| `src/pages/sys04-certificate/CertificateApprovalPage.tsx` | 승인/반려 화면 | VERIFIED | Popconfirm+approveMutation+rejectMutation 구현 |
| `src/pages/sys04-certificate/CertificateRegisterPage.tsx` | 등록대장 | VERIFIED | DetailModal+onRow 구현 |
| `src/shared/api/mocks/handlers/sys04.ts` | sys04 MSW 핸들러 | VERIFIED | 6 엔드포인트(GET/POST/PUT/DELETE/PATCH approve/PATCH reject) |
| `src/pages/sys05-admin-rules/RegulationListPage.tsx` | 현행규정 조회 | VERIFIED | useFavorites+DataTable+Modal+Descriptions 구현 |
| `src/pages/sys05-admin-rules/useFavorites.ts` | localStorage 즐겨찾기 훅 | VERIFIED | useState 초기값에서 localStorage 읽기, toggle 시 저장 |
| `src/shared/api/mocks/handlers/sys05.ts` | sys05 MSW 핸들러 | VERIFIED | 6 엔드포인트(규정/예규HQ/예규Unit/지시문서 목록+상세) |
| `src/pages/sys14-suggestion/SuggestionMainPage.tsx` | 제언 메인(통계) | VERIFIED | useQuery(stats+recent)+Statistic 4카드 |
| `src/pages/sys14-suggestion/SuggestionListPage.tsx` | 제언 목록/CRUD | VERIFIED | DataTable+CrudForm+추천/신고 useMutation |
| `src/pages/sys14-suggestion/SuggestionAdminPage.tsx` | 관리자 답변 | VERIFIED | PATCH /private+/answer, Popconfirm |
| `src/shared/api/mocks/handlers/sys14.ts` | sys14 MSW 핸들러 | VERIFIED | 11 엔드포인트(CRUD+stats+recent+recommend+report+private+answer) |
| `src/pages/sys11-research/ResearchMainPage.tsx` | 연구자료 메인 | VERIFIED | useQuery(stats+recent+popular)+통계 4카드 |
| `src/pages/sys11-research/ResearchListPage.tsx` | 연구자료 CRUD | VERIFIED | DataTable+CrudForm+Modal+Descriptions+다운로드 |
| `src/pages/sys11-research/ResearchFilePage.tsx` | 자료실 | VERIFIED | DataTable+다운로드 버튼 |
| `src/pages/sys11-research/ResearchAdminPage.tsx` | 관리자 6탭 | VERIFIED | Tabs(자료관리/카테고리/통계/사용자/삭제/권한관리) |
| `src/shared/api/mocks/handlers/sys11.ts` | sys11 MSW 핸들러 | VERIFIED | 12 엔드포인트(CRUD+stats+recent+popular+categories+files) |
| `src/pages/sys16-meeting-room/MeetingReservePage.tsx` | 예약 신청 | VERIFIED | Select+DatePicker+TimePicker+POST+navigate 구현 |
| `src/pages/sys16-meeting-room/MyReservationPage.tsx` | 내 예약 확인 | VERIFIED | DataTable+StatusBadge+수정/삭제+Descriptions Modal |
| `src/pages/sys16-meeting-room/ReservationMgmtPage.tsx` | 예약 관리(승인/반려) | VERIFIED | DataTable+Popconfirm+approveMutation+rejectMutation |
| `src/pages/sys16-meeting-room/MeetingStatusPage.tsx` | 회의 현황 | VERIFIED | DatePicker.RangePicker+회의실 Select 필터+DataTable |
| `src/pages/sys16-meeting-room/MeetingRoomMgmtPage.tsx` | 회의실 관리 | VERIFIED | Row+Col 레이아웃+4탭(기본/시간대/장비/사진)+CrudForm |
| `src/shared/api/mocks/handlers/sys16.ts` | sys16 MSW 핸들러 | VERIFIED | 20 엔드포인트(예약 9개+회의실 12개) |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `handlers/index.ts` | sys04Handlers | spread import | WIRED | `...sys04Handlers` 등록 확인 |
| `handlers/index.ts` | sys05Handlers | spread import | WIRED | `...sys05Handlers` 등록 확인 |
| `handlers/index.ts` | sys11Handlers | spread import | WIRED | `...sys11Handlers` 등록 확인 |
| `handlers/index.ts` | sys14Handlers | spread import | WIRED | `...sys14Handlers` 등록 확인 |
| `handlers/index.ts` | sys16Handlers | spread import | WIRED | `...sys16Handlers` 등록 확인 |
| `sys04/index.tsx` | BoardIndex, CodeMgmtIndex, AuthGroupIndex | lazy import + Route | WIRED | 3개 공통 페이지 lazy 재사용 확인 |
| `sys05/index.tsx` | Navigate to /sys05/1/1 | React Router | WIRED | 기본 리다이렉트 + 4개 고유 라우트 |
| `sys14/index.tsx` | BoardIndex, AuthGroupIndex | lazy import + Route | WIRED | 공통 페이지 재사용 확인 |
| `sys16/index.tsx` | BoardIndex, CodeMgmtIndex | lazy import + Route | WIRED | ROOM-06, ROOM-07 공통 재사용 확인 |
| `CertificateApprovalPage` | PATCH /sys04/certificates/:id/approve | apiClient.patch | WIRED | approveMutation.mutate(id) 확인 |
| `MeetingReservePage` | navigate('/sys16/1/3') | useNavigate | WIRED | 예약 성공 후 내예약확인 이동 확인 |
| `SuggestionListPage` | POST /api/sys14/suggestions/:id/recommend | fetch PATCH | WIRED | LikeOutlined 버튼 클릭 시 useMutation 호출 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| CertificateApplyPage | DataTable request | GET /api/sys04/certificates (MSW) | sys04.ts: 20건 faker Mock + 페이지네이션 | FLOWING |
| CertificateApprovalPage | approveMutation | PATCH /api/sys04/certificates/:id/approve (MSW) | sys04.ts: applications 배열 상태 변경 | FLOWING |
| RegulationListPage | DataTable request | GET /api/sys05/regulations (MSW) | sys05.ts: 15건 faker Mock | FLOWING |
| SuggestionMainPage | stats, recent | GET /api/sys14/suggestions/stats + /recent (MSW) | sys14.ts: 25건 Mock에서 통계 계산 | FLOWING |
| ResearchMainPage | stats, recent, popular | GET /api/sys11/research/stats + /recent + /popular (MSW) | sys11.ts: 30건 Mock에서 집계 | FLOWING |
| MeetingReservePage | roomsData | GET /api/sys16/meeting-rooms (MSW) | sys16.ts: 5개 회의실 Mock | FLOWING |
| ReservationMgmtPage | DataTable request | GET /api/sys16/reservations (MSW) | sys16.ts: 25건 예약 Mock | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 전체 250개 테스트 통과(Phase 3 포함) | `npx vitest run` | 250/250 PASS | PASS |
| sys04 전용 테스트 32건 통과 | `npx vitest run src/__tests__/sys04/` | 32/32 PASS | PASS |
| sys05 전용 테스트 21건 통과 | `npx vitest run src/__tests__/sys05/` | 21/21 PASS | PASS |
| sys14 전용 테스트 32건 통과 | `npx vitest run src/__tests__/sys14/` | 32/32 PASS | PASS |
| sys11 전용 테스트 37건 통과 | `npx vitest run src/__tests__/sys11/` | 37/37 PASS | PASS |
| sys16 전용 테스트 30건 통과 | `npx vitest run src/__tests__/sys16/` | 30/30 PASS | PASS |
| TypeScript 컴파일 에러 0건 | `npx tsc --noEmit` | 출력 없음(에러 0) | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CERT-01 | 03-01-PLAN | 인증서 신청(작성/수정/삭제) | SATISFIED | CertificateApplyPage — DataTable+CrudForm+DELETE useMutation |
| CERT-02 | 03-01-PLAN | 인증서 승인/관리 | SATISFIED | CertificateApprovalPage — Popconfirm+PATCH approve/reject |
| CERT-03 | 03-01-PLAN | 인증서 등록대장 | SATISFIED | CertificateRegisterPage — DetailModal+onRow |
| CERT-04 | 03-01-PLAN | 게시판(공통) | SATISFIED | index.tsx Route 1/1 → BoardIndex lazy 재사용 |
| CERT-05 | 03-01-PLAN | 공통코드관리(공통) | SATISFIED | index.tsx Route 2/1 → CodeMgmtIndex lazy 재사용 |
| CERT-06 | 03-01-PLAN | 사용자별권한등록(공통) | SATISFIED | index.tsx Route 2/2 → AuthGroupIndex lazy 재사용 |
| AREG-01 | 03-02-PLAN | 현행규정 조회(즐겨찾기+다운로드+프린트) | SATISFIED | RegulationListPage — useFavorites+DataTable+Modal+다운로드/프린트 버튼. REQUIREMENTS.md 체크박스 미업데이트(문서 gap) |
| AREG-02 | 03-02-PLAN | 예규 해군본부 | SATISFIED | PrecedentHQPage — DataTable+Modal+다운로드 구현 |
| AREG-03 | 03-02-PLAN | 예규 예하부대 | SATISFIED | PrecedentUnitPage 구현 |
| AREG-04 | 03-02-PLAN | 지시문서 | SATISFIED | DirectiveListPage — DataTable+Modal+다운로드 구현 |
| SUGST-01 | 03-03-PLAN | 메인화면(통계) | SATISFIED | SuggestionMainPage — useQuery+Statistic 4카드 |
| SUGST-02 | 03-03-PLAN | 제언확인(CRUD+추천/신고+답변) | SATISFIED | SuggestionListPage — 추천/신고 useMutation, 답변 표시 |
| SUGST-03 | 03-03-PLAN | 공지사항(공통) | SATISFIED | index.tsx Route 1/2 → BoardIndex |
| SUGST-04 | 03-03-PLAN | 관리자(답변/비공개) | SATISFIED | SuggestionAdminPage — PATCH /private+/answer |
| SUGST-05 | 03-03-PLAN | 사용자별권한등록(공통) | SATISFIED | index.tsx Route 2/1 → AuthGroupIndex |
| RSRC-01 | 03-04-PLAN | 메인화면(최신/인기 자료) | SATISFIED | ResearchMainPage — useQuery(stats/recent/popular)+카드 4개. REQUIREMENTS.md 체크박스 미업데이트 |
| RSRC-02 | 03-04-PLAN | 연구자료 CRUD+다운로드 | SATISFIED | ResearchListPage — DataTable+CrudForm+Modal+다운로드 |
| RSRC-03 | 03-04-PLAN | 관리자 6탭 | SATISFIED | ResearchAdminPage — Tabs 6개(자료/카테고리/통계/사용자/삭제/권한) |
| RSRC-04 | 03-04-PLAN | 공지사항(공통) | SATISFIED | index.tsx Route 1/4 → BoardIndex |
| RSRC-05 | 03-04-PLAN | 자료실 | SATISFIED | ResearchFilePage — DataTable+다운로드 버튼 |
| RSRC-06 | 03-04-PLAN | 사용자별권한등록(공통) | SATISFIED | index.tsx Route 2/1 → AuthGroupIndex |
| ROOM-01 | 03-05-PLAN | 회의예약신청 | SATISFIED | MeetingReservePage — Form+POST+navigate 구현 |
| ROOM-02 | 03-05-PLAN | 내예약확인 | SATISFIED | MyReservationPage — DataTable+StatusBadge+수정/삭제 |
| ROOM-03 | 03-05-PLAN | 회의예약관리(승인/반려) | SATISFIED | ReservationMgmtPage — Popconfirm+approveMutation+rejectMutation |
| ROOM-04 | 03-05-PLAN | 회의실 관리(4탭) | SATISFIED | MeetingRoomMgmtPage — Row+Col+Tabs(기본/시간대/장비/사진) |
| ROOM-05 | 03-05-PLAN | 회의현황 | SATISFIED | MeetingStatusPage — RangePicker+Select+DataTable |
| ROOM-06 | 03-05-PLAN | 공지사항(공통) | SATISFIED | index.tsx Route 1/1 → BoardIndex lazy |
| ROOM-07 | 03-05-PLAN | 공통코드관리(공통) | SATISFIED | index.tsx Route 2/1 → CodeMgmtIndex lazy |

**총 28개 요구사항 — 모두 코드 구현 완료. AREG-01~04, RSRC-01~06은 REQUIREMENTS.md 체크박스 미업데이트.**

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.planning/REQUIREMENTS.md` | 74-77, 89-94 | AREG-01~04, RSRC-01~06 체크박스 `[ ]` 미업데이트 | Warning | 진행 상태 추적 오류. 코드는 완전 구현됨 |

---

### Human Verification Required

#### 1. sys05 즐겨찾기 localStorage 영속성

**Test:** 행정규칙포탈 RegulationListPage에서 규정 행의 별표 아이콘 클릭 → 페이지 새로고침
**Expected:** 즐겨찾기 상태(StarFilled)가 새로고침 후에도 유지됨
**Why human:** useFavorites 훅이 localStorage를 읽는 동작은 브라우저 환경에서만 실행 가능

#### 2. sys16 예약 -> 내예약확인 자동 이동

**Test:** 회의예약신청 폼에서 회의실 선택, 날짜/시간 입력 후 제출
**Expected:** 성공 메시지 표시 후 내예약확인(/sys16/1/3) 화면으로 자동 이동, 신규 예약이 목록에 표시
**Why human:** navigate('/sys16/1/3') + queryClient.invalidateQueries 연동은 런타임 동작

---

### Gaps Summary

**구현 완료, 문서 동기화 1건 미흡:**

5개 서브시스템(85개 프로세스)의 코드 구현은 완전하다. 28개 요구사항 모두 아티팩트가 존재하고, 실질적 로직이 구현되었으며, MSW 데이터가 연결되어 있다. 250개 테스트가 전체 통과하고 TypeScript 에러는 0건이다.

유일한 gap은 `.planning/REQUIREMENTS.md`의 체크박스 상태다. AREG-01~04(sys05)와 RSRC-01~06(sys11)은 구현 완료이나 `[ ]`(미완료)로 남아 있다. 이는 실행 시 executor가 SUMMARY.md에 요구사항 완료를 기록하였으나 REQUIREMENTS.md 체크박스를 업데이트하지 않은 문서 동기화 문제다. 코드 품질이나 기능 동작에는 영향이 없다.

---

## GAP 수정 반영 (2026-04-07)

2026-04-07 req_spec 기반 전체 GAP 분석 후 Phase 3 소속 5개 서브시스템에 6개 규칙을 일괄 적용하였다.

### 적용 규칙

| 규칙 | 내용 | 적용 결과 |
|------|------|----------|
| R1 | 입력값 컬럼 반영 (CSV 입력값 → CrudForm fields) | 각 서브시스템 등록/수정 폼에 누락 필드 추가 |
| R2 | 검색영역 100px SearchForm 추가 | 목록 그리드 상단에 SearchForm 컴포넌트 배치 |
| R3 | 규칙/예외사항 UI 로직 반영 | 조건부 표시, 안내문, 제한조건 구현 |
| R4 | 관리자 메뉴 포함 | 공통기능 관리자 메뉴 서브시스템별 배포 |
| R5 | 테이블 군청색 라인 (DataTable CSS) | navy-bordered-table 클래스 전역 적용 |
| R6 | 신청자 = 군번/계급/성명 (militaryPersonColumn) | formatMilitaryPerson() 헬퍼 사용 |

### 서브시스템별 수정 내역

| 서브시스템 | SearchForm | militaryPersonColumn | CrudForm 필드 추가 | 기타 |
|-----------|-----------|---------------------|-------------------|------|
| SYS04 인증서 | 3개 조건 (발급유형/상태/기간) | 적용 | 소속기관, 활용동의 checkbox | - |
| SYS05 행정규칙 | 3개 조건 (규정명/문서번호/분류) | 적용 | - | - |
| SYS14 나의제언 | 4개 조건 | 적용 ('제언자') | - | 반려사유 모달 추가 |
| SYS11 연구자료 | 5개 조건 | 적용 | 첨부파일 구분 4종 | - |
| SYS16 회의실예약 | 적용 | 적용 | 회의명/등급/주관부서 | - |

### 검증 상태

- GAP 수정 코드 반영: 완료
- 공통 컴포넌트(DataTable, SearchForm, CrudForm, military.ts) 수정: 완료
- 기존 테스트 regression: 없음

---

_Verified: 2026-04-05T16:30:18Z_
_Verifier: Claude (gsd-verifier)_
