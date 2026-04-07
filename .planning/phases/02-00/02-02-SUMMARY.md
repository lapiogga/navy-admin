---
phase: 02-00
plan: 02
subsystem: auth/session
tags: [session, idle-timer, modal, RequireAuth, PTL-04]
dependency_graph:
  requires: [02-01]
  provides: [세션 만료 경고 Modal, Idle 이중 타이머 세션 관리]
  affects: [RequireAuth, useSessionCheck, SessionWarningModal]
tech_stack:
  added: []
  patterns: [Idle 이중 타이머 패턴, useCallback 참조 안정성, Ref 기반 타이머 정리]
key_files:
  created:
    - navy-admin/src/features/auth/components/SessionWarningModal.tsx
    - navy-admin/src/features/auth/hooks/useSessionCheck.test.ts
  modified:
    - navy-admin/src/features/auth/hooks/useSessionCheck.ts
    - navy-admin/src/app/components/RequireAuth.tsx
decisions:
  - "Idle 이중 타이머 패턴 채택: warnTimer(30초) + idleTimer(60초)로 경고와 로그아웃을 분리"
  - "useCallback으로 resetTimers/clearAllTimers 감싸서 이벤트 리스너 참조 안정성 확보"
  - "경고 Modal 표시 중 일반 활동(mousemove 등)으로 타이머 리셋 허용 (버튼 클릭 외에도 활동으로 연장 가능)"
metrics:
  duration: 4분
  completed_date: "2026-04-05"
  tasks: 2
  files: 4
---

# Phase 2 Plan 02: 세션 관리 — Idle 이중 타이머 + SessionWarningModal 연동 Summary

useSessionCheck 훅을 setInterval 단순 체크에서 Idle 이중 타이머 패턴으로 전면 리팩토링하고, SessionWarningModal을 RequireAuth에 연동하여 PTL-04 세션 관리 요구사항 완전 충족.

## What Was Built

### Task 1: useSessionCheck Idle 이중 타이머 리팩토링 + SessionWarningModal 생성 (b120f8f)

`useSessionCheck.ts`를 기존 `setInterval` 기반 단순 만료 체크에서 Idle 이중 타이머 패턴으로 전면 교체했다.

- `IDLE_TIMEOUT_MS = 60_000` (1분), `WARN_BEFORE_MS = 30_000` (30초) 상수를 export
- 5개 이벤트 감지: `mousemove`, `keydown`, `click`, `scroll`, `touchstart`
- `warnTimerRef`: IDLE_TIMEOUT_MS - WARN_BEFORE_MS 후 경고 Modal 표시 + 카운트다운 시작
- `idleTimerRef`: IDLE_TIMEOUT_MS 후 `logout()` + `navigate(ROUTES.LOGIN)` + `message.warning`
- `clearAllTimers`: 3개 타이머(warnTimer, idleTimer, countdownInterval) 일괄 정리
- 반환값: `{ isWarningVisible, countdown, extendSession }`

`SessionWarningModal.tsx` 신규 생성:
- `closable={false}`, `maskClosable={false}` — 사용자가 Modal 회피 불가 (UI-SPEC 동결 제약)
- 카운트다운 숫자: `fontSize: 20, fontWeight: 600, color: '#ff4d4f'`
- footer: [세션 연장 (primary)] [지금 로그아웃 (default)]

### Task 2: RequireAuth SessionWarningModal 연동 + 테스트 생성 (e96f63c)

`RequireAuth.tsx` 수정:
- `useSessionCheck()` 반환값 destructure: `{ isWarningVisible, countdown, extendSession }`
- `SessionWarningModal`을 `children` 하단에 렌더링
- `onLogout` 핸들러: `logout()` + `navigate(ROUTES.LOGIN)`
- 크로스탭 로그아웃 동기화 유지 (`auth-storage` storage event)
- `useNavigate` 추가 (SessionWarningModal onLogout 핸들러 필요)

`useSessionCheck.test.ts` 생성 (14개 테스트):
- `useSessionCheck` 코드 구조 검증 (10개): 상수, 이벤트 목록, useCallback, 3개 Ref, 반환값, 로그아웃/네비게이트, 메시지, passive 리스너, 언마운트 정리
- `RequireAuth` SessionWarningModal 연동 검증 (4개): import, destructure, props, 크로스탭 동기화

## Verification Results

- `npx vitest run src/features/auth/hooks/useSessionCheck.test.ts`: 14/14 PASS
- `npx vitest run`: 80/80 PASS (16 test files)
- `npx tsc --noEmit`: TypeScript errors 0

## Deviations from Plan

None — 플랜에 정의된 코드를 정확히 구현했다.

## Known Stubs

없음. 모든 로직이 완전히 구현되었다.

## Self-Check: PASSED

- [x] `navy-admin/src/features/auth/hooks/useSessionCheck.ts` — 존재, IDLE_TIMEOUT_MS 포함
- [x] `navy-admin/src/features/auth/components/SessionWarningModal.tsx` — 존재, closable={false} 포함
- [x] `navy-admin/src/app/components/RequireAuth.tsx` — 존재, SessionWarningModal 렌더링
- [x] `navy-admin/src/features/auth/hooks/useSessionCheck.test.ts` — 존재, 14 tests PASS
- [x] commit b120f8f — feat(02-02): useSessionCheck Idle 이중 타이머 리팩토링
- [x] commit e96f63c — feat(02-02): RequireAuth SessionWarningModal 연동

---

## GAP 수정 반영 (2026-04-07)

Plan 02 (세션관리/SessionWarningModal) 화면은 직접 수정 대상 아님. 세션 관리 로직 및 RequireAuth 컴포넌트는 GAP 수정 영향 없음.
