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
