---
phase: 7
slug: 2
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x |
| **Config file** | navy-admin/vitest.config.ts |
| **Quick run command** | `cd navy-admin && npx vitest run --reporter=verbose 2>&1 \| tail -20` |
| **Full suite command** | `cd navy-admin && npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before verify-work:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Validation Architecture

### SYS03 성과관리체계 (76 processes)
- **기준정보 CRUD**: File-based test (readFileSync) — columns/forms match req_analysis
- **과제 계층**: Master-Detail DataTable 연동 — 상위 선택 시 하위 로드
- **업무실적 입력/승인/평가**: Steps 결재 패턴 — StatusBadge 전환
- **차트 시각화**: @ant-design/charts 컴포넌트 렌더링 확인
- **엑셀 저장/일괄등록**: Mock message.success + Upload.Dragger

### SYS15 보안일일결산체계 (138 processes)
- **비밀/매체 3종 CRUD**: SecretMediaPage type prop 분기 — 컬럼/폼 필드 분기 검증
- **체크리스트 UI**: Checkbox.Group 필수/선택 항목 + 사유 TextArea
- **Calendar 메인화면**: cellRender Badge 색상 (green/red/gray)
- **Tree 예외처리**: Master-Detail selectedKey 연동
- **인계/인수**: Steps 워크플로우 + 인수확인/반송
- **관리자 Tabs**: 점검항목 5탭 CRUD

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Status |
|---------|------|------|-------------|-----------|--------|
| TBD | 07-01 | 1 | PERF-01~17 | unit+file | pending |
| TBD | 07-02 | 1 | SEC-14~18 | unit+file | pending |
| TBD | 07-03 | 2 | PERF-02~06 | unit+file | pending |
| TBD | 07-04 | 2 | SEC-01~09 | unit+file | pending |
| TBD | 07-05 | 3 | PERF-07~17 | unit+file | pending |
| TBD | 07-06 | 3 | SEC-10~28 | unit+file | pending |
