---
phase: 03-5
plan: 01
subsystem: ui
tags: [react, typescript, msw, antd, tanstack-query, sys04, certificate]

requires:
  - phase: 01-99
    provides: DataTable, CrudForm, StatusBadge, DetailModal 공통 컴포넌트 + 공통 기능 페이지(게시판/코드관리/권한관리)
  - phase: 02-00
    provides: SubsystemPage 레이아웃, 서브시스템 라우팅 패턴

provides:
  - sys04 인증서발급신청체계 3개 고유 페이지 (신청/승인관리/등록대장)
  - sys04 MSW 핸들러 6개 엔드포인트 (CRUD + 승인/반려)
  - CERT-04~06 공통 기능 라우트 연결 (게시판/코드관리/권한관리 재사용)
  - 32건 readFileSync 기반 테스트

affects: [03-02, 03-03, 03-04, 03-05]

tech-stack:
  added: []
  patterns:
    - "서브시스템 index.tsx: Routes/Route + Navigate 기본 리다이렉트 패턴"
    - "공통 기능 재사용: lazy import로 Phase 1 페이지를 서브시스템 라우트에 연결"
    - "CertStatus 타입: pending/approved/rejected 3단계 워크플로우"
    - "MSW 핸들러: let applications = [] 뮤터블 배열 + splice 삭제 패턴"

key-files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys04.ts
    - navy-admin/src/pages/sys04-certificate/CertificateApplyPage.tsx
    - navy-admin/src/pages/sys04-certificate/CertificateApprovalPage.tsx
    - navy-admin/src/pages/sys04-certificate/CertificateRegisterPage.tsx
    - navy-admin/src/__tests__/sys04/certificate.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
    - navy-admin/src/pages/sys04-certificate/index.tsx

key-decisions:
  - "공통 기능(게시판/코드관리/권한관리)은 lazy import로 Phase 1 페이지 직접 재사용 — 중복 구현 없음"
  - "코드관리 import 경로: @/pages/common/code-mgmt/CodeManagementPage (index.tsx 없음)"

patterns-established:
  - "서브시스템 고유 페이지 패턴: PageContainer + DataTable + useMutation + invalidateQueries"
  - "승인/반려 패턴: pending 상태 조건부 Popconfirm 렌더링, 처리 완료 시 StatusBadge 전환"

requirements-completed: [CERT-01, CERT-02, CERT-03, CERT-04, CERT-05, CERT-06]

duration: 12min
completed: 2026-04-05
---

# Phase 3 Plan 01: 04_인증서발급신청체계 Summary

**인증서 신청→승인→등록대장 워크플로우를 DataTable+CrudForm+StatusBadge+DetailModal 패턴으로 구현하고, 공통 기능(게시판/코드관리/권한관리)을 Phase 1 페이지 재사용으로 연결**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-05T16:07:01Z
- **Completed:** 2026-04-05T16:18:36Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- sys04 MSW 핸들러 6개 엔드포인트 구현 (GET 목록/POST 신청/PUT 수정/DELETE 삭제/PATCH 승인/PATCH 반려)
- 인증서 신청/승인관리/등록대장 3개 고유 페이지 완전 구현
- CERT-04~06 공통 기능 라우트 연결 (Phase 1 페이지 중복 없이 재사용)
- 32건 테스트 PASSED, TypeScript 0 errors

## Task Commits

1. **Task 1: sys04 MSW 핸들러 + index.tsx 라우팅** - `54c5d74` (feat)
2. **Task 2: sys04 고유 페이지 3개 + 테스트** - `a6ccfaa` (feat)

## Files Created/Modified

- `navy-admin/src/shared/api/mocks/handlers/sys04.ts` — CertApplication 타입 + 20건 Mock + 6개 핸들러
- `navy-admin/src/shared/api/mocks/handlers/index.ts` — sys04Handlers 스프레드 추가
- `navy-admin/src/pages/sys04-certificate/index.tsx` — 7개 Route 매핑 (3 고유 + 3 공통 + Navigate)
- `navy-admin/src/pages/sys04-certificate/CertificateApplyPage.tsx` — 신청 CRUD (DataTable+CrudForm+StatusBadge)
- `navy-admin/src/pages/sys04-certificate/CertificateApprovalPage.tsx` — 승인/반려 (Popconfirm+approveMutation+rejectMutation)
- `navy-admin/src/pages/sys04-certificate/CertificateRegisterPage.tsx` — 등록대장 (DetailModal onRow)
- `navy-admin/src/__tests__/sys04/certificate.test.ts` — 32건 readFileSync 패턴 테스트

## Decisions Made

- 코드관리 lazy import 경로를 `@/pages/common/code-mgmt/CodeManagementPage`로 지정 (해당 디렉토리에 index.tsx 없음)
- 공통 기능(게시판/코드관리/권한관리) Phase 1 페이지 직접 재사용으로 중복 구현 제거

## Deviations from Plan

None — 플랜대로 정확히 실행됨.

## Issues Encountered

- handlers/index.ts 읽기 시 다른 병렬 에이전트가 sys05Handlers 추가 완료 상태 — 충돌 없이 sys04Handlers 추가

## Known Stubs

None — 모든 데이터는 MSW 핸들러에서 실제 API 패턴으로 공급됨.

## Next Phase Readiness

- sys04 인증서발급신청체계 완전 구현 완료
- 동일 패턴(SubsystemIndex + 고유 페이지 + MSW 핸들러 + readFileSync 테스트)을 나머지 서브시스템(sys05, sys14, sys11, sys16)에 적용 가능

## Self-Check: PASSED

- FOUND: navy-admin/src/shared/api/mocks/handlers/sys04.ts
- FOUND: navy-admin/src/pages/sys04-certificate/CertificateApplyPage.tsx
- FOUND: navy-admin/src/pages/sys04-certificate/CertificateApprovalPage.tsx
- FOUND: navy-admin/src/pages/sys04-certificate/CertificateRegisterPage.tsx
- FOUND: navy-admin/src/__tests__/sys04/certificate.test.ts
- FOUND: .planning/phases/03-5/03-01-SUMMARY.md
- Commit 54c5d74: FOUND
- Commit a6ccfaa: FOUND

---

## GAP 수정 반영 (2026-04-07)

SYS04 인증서발급신청체계에 req_spec 기반 GAP 수정 적용:
- **R1**: CrudForm에 소속기관 필드, 활용동의 checkbox 추가
- **R2**: 목록 화면 상단에 SearchForm 3개 조건 (발급유형/상태/기간) 추가
- **R5**: DataTable에 navy-bordered-table CSS 적용
- **R6**: 신청자 컬럼에 militaryPersonColumn() 헬퍼 적용 (군번/계급/성명)

---
*Phase: 03-5*
*Completed: 2026-04-05*
