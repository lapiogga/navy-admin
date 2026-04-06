---
phase: 4
slug: a-6
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 |
| **Config file** | navy-admin/vite.config.ts (test 섹션) |
| **Quick run command** | `cd navy-admin && npx vitest run src/__tests__/sys{N}` |
| **Full suite command** | `cd navy-admin && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd navy-admin && npx vitest run src/__tests__/sys{N}`
- **After every plan wave:** Run `cd navy-admin && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | KNOW-01~04 | file-content | `npx vitest run src/__tests__/sys13` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | KNOW-05~08 | file-content | `npx vitest run src/__tests__/sys13` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | INSP-01~06 | file-content | `npx vitest run src/__tests__/sys17` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | INSP-07~12 | file-content | `npx vitest run src/__tests__/sys17` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 1 | MREG-01~08 | file-content | `npx vitest run src/__tests__/sys06` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 2 | SURV-01~04 | file-content | `npx vitest run src/__tests__/sys02` | ❌ W0 | ⬜ pending |
| 04-04-02 | 04 | 2 | SURV-05~07 | file-content | `npx vitest run src/__tests__/sys02` | ❌ W0 | ⬜ pending |
| 04-05-01 | 05 | 2 | DRCT-01~04 | file-content | `npx vitest run src/__tests__/sys12` | ❌ W0 | ⬜ pending |
| 04-05-02 | 05 | 2 | DRCT-05~07 | file-content | `npx vitest run src/__tests__/sys12` | ❌ W0 | ⬜ pending |
| 04-06-01 | 06 | 2 | HONOR-01~09 | file-content | `npx vitest run src/__tests__/sys09` | ❌ W0 | ⬜ pending |
| 04-06-02 | 06 | 2 | HONOR-10~17 | file-content | `npx vitest run src/__tests__/sys09` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/sys02/survey.test.ts` — SURV 요구사항 커버
- [ ] `src/__tests__/sys06/regulations.test.ts` — MREG 요구사항 커버
- [ ] `src/__tests__/sys09/memorial.test.ts` — HONOR 요구사항 커버
- [ ] `src/__tests__/sys12/directives.test.ts` — DRCT 요구사항 커버
- [ ] `src/__tests__/sys13/knowledge.test.ts` — KNOW 요구사항 커버
- [ ] `src/__tests__/sys17/inspection.test.ts` — INSP 요구사항 커버
- [ ] npm install: `@ant-design/charts@2.6.7` `@dnd-kit/core@6.3.1` `@dnd-kit/sortable@10.0.0`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Print CSS A4 레이아웃 | HONOR-10~16 | 브라우저 프린트 미리보기 필요 | window.print() 호출 → A4 세로 레이아웃 확인 |
| DnD 설문 문항 순서 변경 | SURV-02 | 마우스 드래그 상호작용 | 문항 드래그 → 순서 변경 → 저장 후 유지 확인 |
| 결재 Steps 진행 | INSP-05 | 다단계 UI 상호작용 | 결재선 선택 → 결재 요청 → 순차 승인 → 완료 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
