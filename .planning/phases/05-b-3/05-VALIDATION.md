---
phase: 5
slug: b-3
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x |
| **Config file** | navy-admin/vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | MDATA-01~04 | unit | `npx vitest run src/__tests__/sys07` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | BUS-01~09 | unit | `npx vitest run src/__tests__/sys10` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 1 | JOB-01~08 | unit | `npx vitest run src/__tests__/sys18` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/sys07/military-data.test.ts` — stubs for MDATA-01~04
- [ ] `src/__tests__/sys10/weekend-bus.test.ts` — stubs for BUS-01~09
- [ ] `src/__tests__/sys18/job-desc.test.ts` — stubs for JOB-01~08

*Existing infrastructure covers test framework. Only test stubs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 좌석 그리드 시각적 표시 | BUS-01 | CSS 색상 검증 불가 | 브라우저에서 좌석 색상 확인 |
| 인쇄 미리보기 | BUS-07 | print.css 렌더링 | Ctrl+P 실행 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---

## GAP 수정 반영 (2026-04-07)

req_spec 기반 전체 서브시스템 GAP 분석 후 Phase 5 소속 SYS07/SYS10/SYS18에 6대 규칙(R1~R6) 적용 완료.

### 검증 항목 추가

| 항목 | 대상 | 검증 방법 | 상태 |
|------|------|----------|------|
| R1 입력값 반영 | SYS07 CrudForm 17필드 | 필드 수 확인 | 적용완료 |
| R2 SearchForm | SYS07 14개 검색조건 | UI 렌더링 확인 | 적용완료 |
| R5 DataTable CSS | 전체 | navy-bordered-table 클래스 | 적용완료 |
| R6 militaryPersonColumn | SYS07, SYS10 | 군번/계급/성명 3항목 표시 | 적용완료 |
| R3 규칙/예외사항 | SYS18 결재자/엑셀/초과근무 | UI 로직 동작 | 적용완료 |

### 공통 컴포넌트 수정 사항

- `DataTable.tsx`: navy-bordered-table CSS 클래스 적용
- `index.css`: 글로벌 CSS (테이블 라인, 검색영역 컨테이너)
- `SearchForm.tsx`: search-form-container wrapper 추가
- `CrudForm.tsx`: file/dateRange 타입 필드 추가
- `military.ts`: formatMilitaryPerson(), militaryPersonColumn() 헬퍼 신규 생성
