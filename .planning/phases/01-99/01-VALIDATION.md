---
phase: 1
slug: 99
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 + @testing-library/react 16.x |
| **Config file** | navy-admin/vite.config.ts (test 설정 포함) |
| **Quick run command** | `cd navy-admin && npm run test -- --run --reporter=verbose` |
| **Full suite command** | `cd navy-admin && npm run test:run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd navy-admin && npm run test -- --run --reporter=verbose`
- **After every plan wave:** Run `cd navy-admin && npm run test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | COM-07 | unit | `npm run test:run -- common/code` | W0 in-task | pending |
| 01-01-02 | 01 | 1 | COM-08 | unit | `npm run test:run -- useCodeOptions` | W0 in-task | pending |
| 01-02-01 | 02 | 2 | COM-10 | unit | `npm run test:run -- common/permission` | W0 in-task | pending |
| 01-02-02 | 02 | 2 | COM-11/12/13/14 | unit | `npm run test:run -- common/permission-ui` | W0 in-task | pending |
| 01-03-01 | 03 | 3 | COM-06 | unit | `npm run test:run -- common/approval` | W0 in-task | pending |
| 01-03-02 | 03 | 3 | COM-04 | unit | `npm run test:run -- downloadCsv` | W0 in-task | pending |
| 01-03-03 | 03 | 3 | COM-01/02/03/05 | unit | `npm run test:run -- common/system` | W0 in-task | pending |
| 01-04-01 | 04 | 4 | COM-09 | unit | `npm run test:run -- common/board` | W0 in-task | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

All test scaffold files are created within each plan's tasks (Wave 0 in-task pattern):
- Plan 01: `code.test.ts`, `useCodeOptions.test.ts`
- Plan 02: `permission.test.ts`, `permission-ui.test.ts`
- Plan 03: `approval.test.ts`, `downloadCsv.test.ts`
- Plan 04: `board.test.ts`

*Existing infrastructure covers Vitest setup from Phase 0.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ProLayout 메뉴 렌더링 | COM-02 | Visual layout verification | 1. /common 접속 2. 좌측 메뉴 확인 3. 대메뉴/소메뉴 동작 확인 |
| Transfer 컴포넌트 드래그 | COM-06 | Drag interaction | 1. 결재선 등록 화면 진입 2. 사용자 이동/순서 변경 확인 |
| 첨부파일 미리보기 | COM-09 | File upload mock | 1. 게시글 작성 2. 파일 첨부 3. 미리보기 동작 확인 |
| CSV 파일 다운로드 | COM-04 | Browser download | 1. 접속로그 조회 2. CSV 저장 클릭 3. 파일 내용 확인 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (in-task pattern)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---

## GAP 수정 반영 (2026-04-07)

Phase 1 검증 전략은 변경 없음. 공통 컴포넌트 강화(DataTable CSS, SearchForm wrapper, CrudForm 필드 타입 추가)는 Phase 1 테스트에 영향을 주지 않으며, 기존 66개 테스트는 유효.
