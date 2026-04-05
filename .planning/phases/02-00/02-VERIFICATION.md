---
phase: 02-00
verified: 2026-04-05T14:17:45Z
status: passed
score: 11/11 must-haves verified
re_verification: false
---

# Phase 2: 메인 포탈 (00_포탈) Verification Report

**Phase Goal:** 인증된 사용자가 로그인 -> 대시보드 -> 18개 서브시스템 접속의 전체 플로우가 Mock으로 완전 동작한다
**Verified:** 2026-04-05T14:17:45Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | 사용자가 ID/PW를 입력하면 Mock 인증이 완료되고 메인 대시보드로 이동하며, 사용자 이름과 소속부대가 헤더에 표시된다 | VERIFIED | `login/index.tsx`: `message.success('로그인 성공')` + `navigate(ROUTES.PORTAL)`. `MainPortalLayout.tsx`: `${user.rank} ${user.name} (${user.unit})` 렌더링 |
| 2 | 대시보드에서 서브시스템 링크를 클릭하면 해당 서브시스템 화면으로 이동하고, 서브시스템 내 exit/창닫기 시 메인 대시보드로 돌아온다 | VERIFIED | `portal/index.tsx`: `window.open(path, '_blank')`. `PortalLayout.tsx`: `handleGoPortal` — `opener.focus()` + `window.close()`, fallback `navigate(ROUTES.PORTAL)` |
| 3 | 세션 만료(1분 idle 감지)가 발생하면 자동으로 로그인 화면으로 이동하고 만료 안내 메시지가 표시된다 | VERIFIED | `useSessionCheck.ts`: `IDLE_TIMEOUT_MS = 60_000`, 만료 시 `logout()` + `navigate(ROUTES.LOGIN)` + `message.warning('세션이 만료되었습니다. 다시 로그인하세요')` |
| 4 | 로그아웃 버튼을 클릭하면 세션이 초기화되고 로그인 화면으로 이동한다 | VERIFIED | `MainPortalLayout.tsx`: `handleLogout` — `logout()` + `navigate(ROUTES.LOGIN)` + `message.success('로그아웃 되었습니다')` |
| 5 | 대시보드 상단에 공지사항 최신 3건이 표시된다 | VERIFIED | `AnnouncementSection.tsx`: `data?.slice(0, 3)` + `List size="small"`. MSW 핸들러가 3건 반환 |
| 6 | 긴급 공지사항은 antd Alert type=warning으로 별도 표시된다 | VERIFIED | `AnnouncementSection.tsx`: `urgentItem && <Alert type="warning" message={urgentItem.title} closable />` |
| 7 | 서브시스템 카드 그리드가 18개 표시되고 클릭 시 새 창이 열린다 | VERIFIED | `portal/index.tsx`: `Object.values(SUBSYSTEM_META)` 매핑. `config.ts`에 sys01~sys18 정확히 18개 정의. `window.open(path, '_blank')` |
| 8 | 로그아웃 시 message.success('로그아웃 되었습니다')가 표시된다 | VERIFIED | `MainPortalLayout.tsx` line 18 |
| 9 | 헤더에 계급 이름 (소속부대) 형식으로 사용자 정보가 표시된다 | VERIFIED | `${user.rank} ${user.name} (${user.unit})` — 계급/이름/소속부대 형식 |
| 10 | 만료 30초 전에 세션 만료 경고 Modal이 표시되고 카운트다운이 진행된다 | VERIFIED | `useSessionCheck.ts`: `WARN_BEFORE_MS = 30_000`. warnTimer가 IDLE_TIMEOUT_MS - WARN_BEFORE_MS 후 `setIsWarningVisible(true)` + setInterval 카운트다운 |
| 11 | 세션 경고 Modal에서 세션 연장/지금 로그아웃 버튼이 동작하며 RequireAuth에 연동된다 | VERIFIED | `SessionWarningModal.tsx`: `closable={false}`, `maskClosable={false}`. `RequireAuth.tsx`: `<SessionWarningModal visible={isWarningVisible} countdown={countdown} onExtend={extendSession} onLogout={...} />` |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/features/announcements/types.ts` | Announcement 타입 정의 | VERIFIED | `export interface Announcement` — id, title, content, createdAt, isUrgent 5개 필드 |
| `src/features/announcements/hooks/useAnnouncements.ts` | TanStack Query 기반 공지사항 훅 | VERIFIED | `queryKey: ['announcements']`, ApiResult 이중 래핑 방어 패턴 |
| `src/features/announcements/components/AnnouncementSection.tsx` | 공지사항 섹션 컴포넌트 | VERIFIED | `export function AnnouncementSection`, Alert type=warning, List size=small, emptyText 포함. 35줄 |
| `src/shared/api/mocks/handlers/announcements.ts` | 공지사항 MSW 핸들러 | VERIFIED | `export const announcementHandlers`, `http.get('/api/announcements')`, Mock 3건, isUrgent, success:true |
| `src/shared/api/mocks/handlers/index.ts` | 핸들러 통합 등록 | VERIFIED | `...announcementHandlers` spread 포함 |
| `src/pages/portal/index.tsx` | 대시보드 페이지 | VERIFIED | `import { AnnouncementSection }`, `<AnnouncementSection />`, 18개 서브시스템 카드, window.open |
| `src/app/layouts/MainPortalLayout.tsx` | 메인 포탈 헤더 레이아웃 | VERIFIED | user.rank/name/unit 표시, `message.success('로그아웃 되었습니다')`, fontSize:16, 배경색 #001529 |
| `src/app/layouts/PortalLayout.tsx` | 서브시스템 레이아웃 — 메인포탈 복귀 | VERIFIED | `handleGoPortal`: `opener.focus()` → `window.close()` 순서, `navigate(ROUTES.PORTAL)` fallback, '메인포탈로 돌아가기' 메뉴 항목 |
| `src/features/auth/hooks/useSessionCheck.ts` | Idle 이중 타이머 세션 체크 훅 | VERIFIED | IDLE_TIMEOUT_MS=60_000, WARN_BEFORE_MS=30_000, 5개 이벤트, 3개 Ref, useCallback, `{ isWarningVisible, countdown, extendSession }` 반환. 87줄 |
| `src/features/auth/components/SessionWarningModal.tsx` | 세션 경고 Modal | VERIFIED | `export function SessionWarningModal`, closable={false}, maskClosable={false}, fontSize:20, color:#ff4d4f, 세션 연장/지금 로그아웃 버튼 |
| `src/app/components/RequireAuth.tsx` | 인증 가드 + Modal 연동 | VERIFIED | `import { SessionWarningModal }`, destructure `{ isWarningVisible, countdown, extendSession }`, `<SessionWarningModal>` 렌더링, auth-storage 크로스탭 동기화 유지 |
| `src/pages/login/index.tsx` | 로그인 화면 | VERIFIED | ID/PW Form, `message.success('로그인 성공')`, `navigate(ROUTES.PORTAL)`, 테스트 계정 안내 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `AnnouncementSection.tsx` | `/api/announcements` | useQuery + apiClient | WIRED | `queryKey: ['announcements']`, `apiClient.get('/announcements')` |
| `portal/index.tsx` | `AnnouncementSection.tsx` | import AnnouncementSection | WIRED | `import { AnnouncementSection }` + `<AnnouncementSection />` 렌더링 |
| `handlers/index.ts` | `handlers/announcements.ts` | spread announcementHandlers | WIRED | `...announcementHandlers` in handlers 배열 |
| `PortalLayout.tsx` | window.opener.focus() + window.close() | handleGoPortal 함수 | WIRED | opener.focus() 먼저(line 42) → window.close()(line 43) 순서 확인 |
| `useSessionCheck.ts` | `authStore.ts` | useAuthStore((s) => s.logout) | WIRED | `const logout = useAuthStore((s) => s.logout)` |
| `RequireAuth.tsx` | `SessionWarningModal.tsx` | import SessionWarningModal | WIRED | import + `<SessionWarningModal visible={isWarningVisible} ...>` |
| `RequireAuth.tsx` | `useSessionCheck.ts` | useSessionCheck() destructured | WIRED | `const { isWarningVisible, countdown, extendSession } = useSessionCheck()` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `AnnouncementSection.tsx` | `data` (Announcement[]) | `useAnnouncements` → apiClient.get('/announcements') → MSW `http.get('/api/announcements')` | MSW 핸들러가 Mock 3건 반환 | FLOWING |
| `portal/index.tsx` | `subsystems` (SubsystemMeta[]) | `Object.values(SUBSYSTEM_META)` — config.ts에서 sys01~sys18 정적 정의 | 18개 정적 메타데이터 | FLOWING |
| `MainPortalLayout.tsx` | `user` (User) | `useAuthStore((s) => s.user)` — Zustand store, 로그인 시 Mock 인증으로 주입 | Zustand persist store | FLOWING |
| `SessionWarningModal.tsx` | `countdown` (number) | `useSessionCheck` → setInterval 카운트다운 → RequireAuth props | 30에서 0까지 실시간 감소 | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 전체 테스트 스위트 통과 | `npx vitest run` | 98/98 passed (19 test files) | PASS |
| Phase 2 전용 테스트 통과 | `npx vitest run src/__tests__/portal/ src/shared/api/mocks/handlers/announcements.test.ts src/features/auth/hooks/useSessionCheck.test.ts` | 32/32 passed (4 test files) | PASS |
| TypeScript 컴파일 오류 없음 | `npx tsc --noEmit` | 출력 없음 (0 errors) | PASS |
| 18개 서브시스템 등록 확인 | `grep -c "sys[0-9]" src/entities/subsystem/config.ts` | 18 | PASS |
| handleGoPortal opener.focus() 순서 | index 비교 (header.test.ts 검증) | focusIdx(42) < closeIdx(43) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| PTL-01 | 02-01-PLAN.md | 로그인 화면 (ID/PW 입력, Mock 인증) | SATISFIED | `login/index.tsx`: Form + Mock 인증 + `message.success('로그인 성공')` |
| PTL-02 | 02-01-PLAN.md | 메인 대시보드 (18개 서브시스템 링크, 공지사항) | SATISFIED | `portal/index.tsx`: AnnouncementSection + 18개 카드 그리드 |
| PTL-03 | 02-01-PLAN.md | 로그아웃 기능 | SATISFIED | `MainPortalLayout.tsx`: handleLogout + `message.success('로그아웃 되었습니다')` |
| PTL-04 | 02-01-PLAN.md, 02-02-PLAN.md | 세션 관리 (만료 시 로그인 이동, exit 시 메인 이동) | SATISFIED | `useSessionCheck.ts`: 60초 idle 감지 + 30초 경고 Modal. `PortalLayout.tsx`: exit → 메인 이동 |
| PTL-05 | 02-01-PLAN.md | 사용자 정보 표시 (이름, 소속부대, 권한) | SATISFIED | `MainPortalLayout.tsx`: `${user.rank} ${user.name} (${user.unit})` |

모든 5개 요구사항 SATISFIED. 미커버 요구사항(ORPHANED) 없음.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `login/index.tsx` | 39, 42 | `placeholder="아이디"`, `placeholder="비밀번호"` | INFO | Input placeholder — antd 폼 필드 레이블용. 렌더링 스텁 아님 |

INFO 수준 1건 — 실제 스텁이 아닌 antd Input placeholder 속성. 차단 이슈 없음.

### Human Verification Required

#### 1. 로그인 → 대시보드 전체 플로우 시각 검증

**Test:** 브라우저에서 `npm run dev` 실행 후 `admin/1234`로 로그인
**Expected:** 메인 대시보드 이동, 헤더에 "소령 홍길동 (1사단)" 형식 표시, 공지사항 3건 표시, 긴급공지 Alert(warning) 표시
**Why human:** 실제 렌더링 결과, 폰트/색상, 레이아웃 일치는 코드 분석으로 확인 불가

#### 2. 서브시스템 새 창 열기 → 복귀 시각 검증

**Test:** 대시보드 서브시스템 카드 클릭 → 새 창 열림 확인 → 드롭다운에서 '메인포탈로 돌아가기' 클릭
**Expected:** 새 창이 닫히고 메인 포탈 창이 포커스됨
**Why human:** window.open/window.close/window.opener 동작은 브라우저 실행 환경에서만 검증 가능

#### 3. 세션 만료 경고 Modal 시각 검증

**Test:** `IDLE_TIMEOUT_MS`를 5_000으로 임시 변경 후 30초 활동 없이 대기
**Expected:** 30초 후 경고 Modal 표시, 카운트다운 진행, '세션 연장' 클릭 시 Modal 닫힘
**Why human:** 타이머 실시간 동작, Modal UI, 카운트다운 숫자 색상(#ff4d4f)은 브라우저에서만 검증 가능

### Gaps Summary

없음. 모든 must-haves가 검증되었다.

---

_Verified: 2026-04-05T14:17:45Z_
_Verifier: Claude (gsd-verifier)_
