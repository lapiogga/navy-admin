---
phase: 0
slug: project-foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-05
---

# Phase 0 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 |
| **Config file** | vite.config.ts (test block) |
| **Setup file** | src/test/setup.ts |
| **Quick run command** | `npm run test -- --run --reporter=dot` |
| **Full suite command** | `npm run test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run --reporter=dot`
- **After every plan wave:** Run `npm run test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green + `npm run build` success
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 00-01-01 | 01 | 1 | BASE-01 | smoke | `npx vitest run --reporter=dot 2>&1 \| tail -5` | Plan 01 Task 1 | pending |
| 00-01-02 | 01 | 1 | BASE-02 | unit | `npx vitest run src/shared/lib src/shared/api/client.test` | Plan 01 Task 2 | pending |
| 00-02-01 | 02 | 2 | BASE-04 | unit | `npx vitest run src/features/auth/store/authStore.test` | Plan 02 Task 1 | pending |
| 00-02-02 | 02 | 2 | BASE-05 | integration | `npx vitest run src/shared/api/mocks/handlers/auth.test` | Plan 02 Task 1 | pending |
| 00-02-03 | 02 | 2 | BASE-03 | unit | `npx vitest run src/app/router.test` | Plan 02 Task 2 | pending |
| 00-02-04 | 02 | 2 | BASE-08 | unit | useSessionCheck in RequireAuth (code review) | Plan 02 Task 1+2 | pending |
| 00-03-01 | 03 | 3 | BASE-07 | unit | `npx vitest run src/shared/ui` | Plan 03 Task 1 | pending |
| 00-03-02 | 03 | 3 | BASE-09 | smoke | `test -f docs/URL-CONVENTION.md` | Plan 03 Task 2 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements (Covered by Plan 01 Task 1)

- [x] `src/test/setup.ts` — @testing-library/jest-dom matcher setup (Plan 01 Task 1)
- [x] Vitest config block in `vite.config.ts` — jsdom environment setup (Plan 01 Task 1)

## Test Files Created Per Plan

### Plan 01 (Wave 1)
- `src/shared/lib/date.test.ts` — date 유틸리티 테스트
- `src/shared/lib/ime.test.ts` — IME 가드 훅 테스트
- `src/shared/api/client.test.ts` — axios 클라이언트 설정 테스트

### Plan 02 (Wave 2)
- `src/features/auth/store/authStore.test.ts` — Zustand authStore 단위 테스트 (BASE-04)
- `src/shared/api/mocks/handlers/auth.test.ts` — MSW auth 핸들러 통합 테스트 (BASE-05)
- `src/app/router.test.tsx` — 라우터 구성 + ROUTES 상수 테스트 (BASE-03)

### Plan 03 (Wave 3)
- `src/shared/ui/DataTable/DataTable.test.tsx` — DataTable 컴포넌트 테스트 (BASE-07)
- `src/shared/ui/StatusBadge/StatusBadge.test.tsx` — StatusBadge 렌더링 테스트

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| MSW network tab visibility | BASE-05 | Browser DevTools inspection | 1. Run dev server 2. Open Network tab 3. Verify Mock API requests appear |
| FSD folder structure visual | BASE-01 | Directory layout check | `ls -R src/` confirms 6 FSD layers |
| Lazy-loaded route chunks | BASE-03 | Bundle verification | `npm run build` + check dist/assets for sys* chunks |
| Session auto-check | BASE-08 | Timed behavior | Login, wait 30+ min (or modify SESSION_DURATION for testing), verify auto-redirect to /login |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (Plan 01 Task 1)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
