---
phase: 3
slug: 5
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x + @testing-library/react 16.x |
| **Config file** | navy-admin/vite.config.ts (test section) |
| **Quick run command** | `cd navy-admin && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd navy-admin && npx vitest run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd navy-admin && npx vitest run`
- **After every plan wave:** Run `cd navy-admin && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | CERT-01~06 | unit | `npx vitest run src/__tests__/sys04/` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 0 | AREG-01~04 | unit | `npx vitest run src/__tests__/sys05/` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 0 | SUGST-01~05 | unit | `npx vitest run src/__tests__/sys14/` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 0 | RSRC-01~06 | unit | `npx vitest run src/__tests__/sys11/` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 0 | ROOM-01~07 | unit | `npx vitest run src/__tests__/sys16/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/sys04/certificate.test.ts` — stubs for CERT-01~06 (타입/핸들러/라우트)
- [ ] `src/__tests__/sys05/admin-rules.test.ts` — stubs for AREG-01~04 (타입/핸들러/즐겨찾기)
- [ ] `src/__tests__/sys11/research.test.ts` — stubs for RSRC-01~06 (타입/핸들러)
- [ ] `src/__tests__/sys14/suggestion.test.ts` — stubs for SUGST-01~05 (타입/핸들러/추천/신고)
- [ ] `src/__tests__/sys16/meeting-room.test.ts` — stubs for ROOM-01~07 (타입/핸들러)
- [ ] 디렉토리 생성: `src/__tests__/sys04/`, `sys05/`, `sys11/`, `sys14/`, `sys16/`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 회의실 사진 업로드 미리보기 | ROOM-04 | antd Upload 이미지 미리보기는 브라우저 필요 | 회의실 관리 > 사진관리 탭에서 이미지 선택 후 미리보기 확인 |
| 행정규칙 다운로드 버튼 동작 | AREG-01 | Mock 환경에서 실제 파일 다운로드 불가 | 현행규정 상세 > 다운로드 버튼 클릭 시 message.success 표시 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
