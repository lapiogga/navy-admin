---
phase: 2
slug: 00
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 |
| **Config file** | navy-admin/vite.config.ts (test 섹션) |
| **Quick run command** | `cd navy-admin && npx vitest run src/features/auth` |
| **Full suite command** | `cd navy-admin && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd navy-admin && npx vitest run src/features/auth`
- **After every plan wave:** Run `cd navy-admin && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | PTL-04 | unit | `npx vitest run src/features/auth/hooks/useSessionCheck.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | PTL-02 | unit | `npx vitest run src/__tests__/portal/announcement.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 0 | PTL-05 | unit | `npx vitest run src/__tests__/portal/header.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | PTL-01 | unit | `npx vitest run src/features/auth/store/authStore.test.ts` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 1 | PTL-03 | unit | `npx vitest run src/features/auth/store/authStore.test.ts` | ✅ | ⬜ pending |
| 02-03-01 | 03 | 1 | PTL-04 | unit | `npx vitest run src/features/auth/hooks/useSessionCheck.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 1 | PTL-02 | unit | `npx vitest run src/__tests__/portal/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/features/auth/hooks/useSessionCheck.test.ts` — stubs for PTL-04 (Idle 타이머 동작)
- [ ] `src/__tests__/portal/announcement.test.ts` — stubs for PTL-02 (공지사항 렌더링)
- [ ] `src/__tests__/portal/header.test.ts` — stubs for PTL-05 (사용자 정보 표시)
- [ ] `src/shared/api/mocks/handlers/announcements.test.ts` — stubs for PTL-02 (MSW 핸들러)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| window.open 서브시스템 전환 | PTL-04 | jsdom에서 window.open 완전 시뮬레이션 불가 | 브라우저에서 서브시스템 카드 클릭 → 새 창 열림 확인 |
| window.close + opener.focus 복귀 | PTL-04 | jsdom에서 opener 참조 불가 | 서브시스템 '메인으로' 버튼 클릭 → 창 닫힘 + 포탈 창 포커스 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
