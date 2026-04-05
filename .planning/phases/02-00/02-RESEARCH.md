# Phase 2: 메인 포탈 (00_포탈) - Research

**Researched:** 2026-04-05
**Domain:** React SPA 포탈 — Idle 세션 관리, 창간 통신, 공지사항 UI, MSW Mock API
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 대시보드 상단에 공지사항 배너 배치 (최신 3건, antd List/Alert 활용)
- **D-02:** 공지사항 하단에 서브시스템 바로가기 카드 그리드 유지 (현재 PortalPage 구조)
- **D-03:** 즐겨찾기/빠른 접근 기능은 이 Phase에서 구현하지 않음
- **D-04:** Idle 감지 방식 채택 — 마우스/키보드 활동 없이 60초 경과 시 세션 만료 (MVP 1분)
- **D-05:** 만료 30초 전 antd Modal 표시: 카운트다운 + [세션 연장]/[지금 로그아웃] 버튼. 응답 없으면 자동 로그아웃
- **D-06:** 세션 연장 시 idle 타이머 리셋, 만료 시 authStore.logout() + message.warning + /login 이동
- **D-07:** 서브시스템은 window.open()으로 새 창에서 열기
- **D-08:** 서브시스템 헤더에 '메인포탈로 돌아가기' 버튼 — 클릭 시 window.close() + opener.focus()
- **D-09:** 사용자가 직접 창 닫기(X)해도 메인 포탈 창이 남아있으므로 자연스럽게 복귀
- **D-10:** 전체 시스템 명칭: "해군 행정포탈" (NAVY). 해병대규정관리체계(sys06)만 해병대 전용
- **D-11:** 로그인 화면 보안 경고문 불필요 — MVP에서 생략
- **D-12:** 현재 로그인 Card 레이아웃 유지 (추가 로고/마크 이미지 없음)

### Claude's Discretion

- Idle 감지의 정확한 이벤트 목록 (mousemove, keydown, click, scroll, touchstart — UI-SPEC에서 확정됨)
- 공지사항 Mock 데이터 구조 및 MSW 핸들러 설계
- 세션 만료 Modal의 정확한 카운트다운 UI 패턴
- 서브시스템 헤더 '메인으로' 버튼의 위치/스타일

### Deferred Ideas (OUT OF SCOPE)

없음 — discussion이 Phase 범위 내에서 유지됨
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PTL-01 | 로그인 화면 (ID/PW 입력, Mock 인증) | LoginPage 기존 코드 완비. authStore.login() → MSW /auth/login 핸들러 연결. 구조 유지 + 로그아웃 후 message.success 추가 |
| PTL-02 | 메인 대시보드 (18개 서브시스템 링크, 공지사항) | PortalPage 확장. AnnouncementSection 컴포넌트 신규 생성. MSW /announcements 핸들러 추가. SUBSYSTEM_META 기반 카드 그리드 유지 |
| PTL-03 | 로그아웃 기능 | MainPortalLayout handleLogout 완비. 로그아웃 완료 message.success 추가 필요. authStore.logout() 호출 구조 유지 |
| PTL-04 | 세션 관리 (만료 시 로그인 이동, exit 시 메인 이동) | useSessionCheck 훅 Idle 기반으로 리팩토링 필수. SessionWarningModal 컴포넌트 신규 생성. authStore에 idleReset 액션 추가 |
| PTL-05 | 사용자 정보 표시 (이름, 소속부대, 권한) | MainPortalLayout 헤더 user.rank + user.name + user.unit 이미 표시됨. 구조 유지, 세부 포맷 확인 |
</phase_requirements>

---

## Summary

Phase 2는 Phase 0에서 구축한 인증/라우팅 기반 위에 **Idle 세션 관리**, **공지사항 UI**, **서브시스템 창간 통신** 3가지 핵심 기능을 추가한다. 기존 코드가 90% 완성 상태이므로 신규 코드 작성보다 기존 파일 보강이 주 작업이다.

가장 복잡한 부분은 `useSessionCheck` 훅 리팩토링이다. 현재 단순 interval 기반 체크에서 Idle 이벤트 기반 이중 타이머(warnTimer + idleTimer) 패턴으로 전환해야 한다. 이 패턴은 브라우저 이벤트 리스너 + setTimeout 조합으로 구현하며, `sessionExpiry` 기반 `checkSession()`은 보조 수단으로 남긴다.

공지사항은 신규 MSW 핸들러(`/announcements`)와 `AnnouncementSection` 컴포넌트를 추가하는 간단한 작업이다. 서브시스템 창간 통신(`window.opener`)은 이미 `SubsystemProLayout`에 구현되어 있으므로 헤더 버튼 노출 확인 수준이다.

**Primary recommendation:** useSessionCheck를 Idle 이중 타이머 패턴으로 리팩토링 후 SessionWarningModal을 RequireAuth 안에 렌더링하는 것이 가장 안전한 구조다.

---

## Standard Stack

### Core (Phase 0 동결 — 변경 금지)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.x | UI | 팀 결정, Concurrent Features |
| TypeScript | 5.x | 타입 안전성 | Phase 0 동결 |
| Ant Design | 5.29.3 | UI 컴포넌트 | Phase 0 동결 |
| Zustand | 5.0.12 | 인증 상태 관리 | Phase 0 동결 |
| React Router | 7.x | 라우팅 | Phase 0 동결 |
| MSW | 2.12.x | Mock API | Phase 0 동결 |
| Vitest | 4.1.2 | 테스트 | Phase 0 동결 |

### Phase 2 추가 없음

Phase 2는 기존 스택만으로 모든 기능 구현 가능. 신규 패키지 설치 불필요.

- Idle 감지: 브라우저 네이티브 이벤트 + setTimeout (외부 라이브러리 불필요)
- 세션 Modal 카운트다운: React useState + setInterval (외부 라이브러리 불필요)
- 공지사항: antd List + Alert (이미 설치됨)

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 변경 범위)

```
navy-admin/src/
├── features/auth/
│   ├── hooks/
│   │   └── useSessionCheck.ts          # MODIFY: Idle 이중 타이머로 리팩토링
│   ├── store/
│   │   └── authStore.ts                # MODIFY: idleReset 액션 추가 (선택)
│   └── components/
│       └── SessionWarningModal.tsx     # NEW: 세션 만료 경고 Modal
├── pages/portal/
│   └── index.tsx                       # MODIFY: AnnouncementSection 추가
├── features/announcements/             # NEW: 공지사항 feature slice
│   ├── types.ts
│   └── hooks/useAnnouncements.ts
├── shared/api/mocks/handlers/
│   └── announcements.ts               # NEW: MSW /announcements 핸들러
│   └── index.ts                       # MODIFY: announcementHandlers 추가
└── app/layouts/
    └── MainPortalLayout.tsx           # MODIFY: SessionWarningModal 렌더링 위치
```

### Pattern 1: Idle 이중 타이머 (useSessionCheck 리팩토링)

**What:** 사용자 활동 이벤트를 감지하여 두 개의 타이머를 관리. warnTimer가 먼저 만료되어 Modal 표시, idleTimer 만료 시 강제 로그아웃.

**When to use:** 세션 만료 전 사용자에게 경고를 주고 연장 기회를 제공할 때.

```typescript
// 핵심 패턴 (UI-SPEC Pattern D 기반)
const IDLE_TIMEOUT_MS = 60_000   // 1분
const WARN_BEFORE_MS  = 30_000   // 만료 30초 전 경고

export function useSessionCheck() {
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [countdown, setCountdown] = useState(30)

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllTimers = () => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
  }

  const resetTimers = useCallback(() => {
    clearAllTimers()
    setIsWarningVisible(false)
    setCountdown(30)

    warnTimerRef.current = setTimeout(() => {
      setIsWarningVisible(true)
      let cnt = 30
      countdownRef.current = setInterval(() => {
        cnt -= 1
        setCountdown(cnt)
        if (cnt <= 0) {
          clearInterval(countdownRef.current!)
        }
      }, 1000)
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS)  // 30초 후 경고

    idleTimerRef.current = setTimeout(() => {
      logout()
      navigate(ROUTES.LOGIN, { replace: true })
      message.warning('세션이 만료되었습니다. 다시 로그인하세요')
    }, IDLE_TIMEOUT_MS)  // 60초 후 로그아웃
  }, [logout, navigate])

  useEffect(() => {
    if (!isAuthenticated) return
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimers, { passive: true }))
    resetTimers()
    return () => {
      clearAllTimers()
      events.forEach((e) => window.removeEventListener(e, resetTimers))
    }
  }, [isAuthenticated, resetTimers])

  return { isWarningVisible, countdown, extendSession: resetTimers }
}
```

**주의:** `resetTimers`를 `useCallback`으로 감싸야 이벤트 리스너 등록/해제 시 참조 안정성 유지. `useEffect` dependency에 `resetTimers` 포함 필수.

### Pattern 2: SessionWarningModal 컴포넌트

**What:** useSessionCheck에서 반환된 상태를 받아 antd Modal로 렌더링.

**When to use:** RequireAuth 컴포넌트 또는 MainPortalLayout 내부에서 렌더링.

```typescript
// SessionWarningModal.tsx
interface Props {
  visible: boolean
  countdown: number
  onExtend: () => void
  onLogout: () => void
}

export function SessionWarningModal({ visible, countdown, onExtend, onLogout }: Props) {
  return (
    <Modal
      title="세션 만료 경고"
      open={visible}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="extend" type="primary" onClick={onExtend}>세션 연장</Button>,
        <Button key="logout" onClick={onLogout}>지금 로그아웃</Button>,
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        <Typography.Text>{countdown}초 후 자동으로 로그아웃됩니다.</Typography.Text>
        <br />
        <Typography.Text style={{ fontSize: 20, fontWeight: 600, color: '#ff4d4f' }}>
          {countdown}
        </Typography.Text>
      </div>
    </Modal>
  )
}
```

### Pattern 3: 공지사항 MSW 핸들러 + AnnouncementSection

**What:** /api/announcements GET 핸들러를 추가하고, PortalPage에 AnnouncementSection 컴포넌트를 삽입.

```typescript
// announcements MSW 핸들러
export interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  isUrgent: boolean
}

// handlers/announcements.ts
export const announcementHandlers = [
  http.get('/api/announcements', () => {
    const result: ApiResult<Announcement[]> = {
      success: true,
      data: [
        { id: '1', title: '시스템 점검 안내', content: '...', createdAt: '2026-04-05', isUrgent: true },
        { id: '2', title: '해군 행정포탈 v1.0 오픈', content: '...', createdAt: '2026-04-04', isUrgent: false },
        { id: '3', title: '사용자 매뉴얼 배포', content: '...', createdAt: '2026-04-03', isUrgent: false },
      ]
    }
    return HttpResponse.json(result)
  }),
]
```

### Pattern 4: useSessionCheck 반환값을 RequireAuth에서 소비

**What:** RequireAuth가 useSessionCheck를 호출하고 SessionWarningModal을 렌더링. 이렇게 하면 메인 포탈과 서브시스템 레이아웃 모두에 세션 체크가 적용됨.

```typescript
// RequireAuth.tsx (수정)
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const { isWarningVisible, countdown, extendSession } = useSessionCheck()

  // 크로스탭 로그아웃 동기화 (기존 유지)
  useEffect(() => { /* ... 기존 코드 유지 */ }, [])

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return (
    <>
      {children}
      <SessionWarningModal
        visible={isWarningVisible}
        countdown={countdown}
        onExtend={extendSession}
        onLogout={() => { logout(); navigate(ROUTES.LOGIN) }}
      />
    </>
  )
}
```

### Anti-Patterns to Avoid

- **단순 interval 세션 체크 유지:** 기존 `setInterval` + `checkSession()` 패턴으로는 Idle 감지 불가. 반드시 이벤트 기반으로 전환.
- **이벤트 리스너 cleanup 누락:** `useEffect` 반환 함수에서 `removeEventListener` 빠트리면 메모리 리크 + 언마운트 후 state 업데이트 경고 발생.
- **useCallback 없이 resetTimers를 이벤트 리스너에 등록:** 매 렌더마다 새 함수 참조가 생겨 리스너가 무한 재등록됨.
- **SessionWarningModal을 PortalPage에만 배치:** 서브시스템 창에서는 세션 경고가 표시되지 않음. RequireAuth 레벨에 배치해야 모든 보호 경로에 적용됨.
- **window.opener 없이 window.close() 호출:** opener가 없는 경우(직접 URL 접근) window.close()가 작동 안 할 수 있음. navigate(ROUTES.PORTAL) 대체 처리 필수.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 세션 만료 Modal UI | 커스텀 overlay div | antd Modal (closable=false, maskClosable=false) | 접근성, z-index 관리, 애니메이션 내장 |
| 공지사항 목록 UI | 커스텀 list 컴포넌트 | antd List + List.Item.Meta | 빈 상태, 로딩, 경계 스타일 내장 |
| 카운트다운 숫자 | dayjs diff | useState + setInterval (1초 단위) | 30초 카운트다운에 날짜 라이브러리 불필요 |
| Idle 이벤트 감지 | react-idle-timer 외부 라이브러리 | 브라우저 네이티브 addEventListener | 의존성 추가 없이 5개 이벤트로 충분 |

**Key insight:** Phase 2 요구사항 모두 이미 설치된 antd + 브라우저 네이티브 API로 해결 가능. 신규 패키지 설치 금지.

---

## Common Pitfalls

### Pitfall 1: useCallback 없는 resetTimers를 이벤트 핸들러로 등록

**What goes wrong:** 매 렌더마다 resetTimers 참조가 바뀌어 `useEffect`가 계속 재실행됨. 이벤트 리스너가 무한 추가/제거되고, 실제 idle 타이머가 리셋됨.

**Why it happens:** useEffect dependency array에 `resetTimers`를 포함하지만, `useCallback` 없이 함수를 정의하면 매 렌더마다 새 참조 생성.

**How to avoid:** `resetTimers`를 `useCallback`으로 정의. dependency는 `[logout, navigate]`만.

**Warning signs:** 브라우저 DevTools Network 탭에서 타이머가 계속 재시작되거나, React StrictMode에서 이중 실행 경고.

### Pitfall 2: 카운트다운 interval cleanup 누락

**What goes wrong:** 세션 연장 시 기존 카운트다운 interval이 남아있어 countdown이 음수로 내려가거나 중복 interval이 동작.

**Why it happens:** `clearAllTimers()`에서 `countdownRef.current` cleanup을 빠트림.

**How to avoid:** `clearAllTimers()`에서 warnTimer, idleTimer, countdown interval 세 가지 모두 클리어.

**Warning signs:** countdown 숫자가 30 → 0 → -1 → ... 계속 내려가거나, 두 개의 카운트다운이 동시에 실행.

### Pitfall 3: authStore.logout() 이후 navigate() 호출 타이밍

**What goes wrong:** `logout()` 호출이 Zustand 상태 업데이트이므로 비동기적으로 반영될 수 있음. `navigate()`가 먼저 실행되면 RequireAuth가 isAuthenticated=true 상태에서 렌더링되는 순간이 생길 수 있음.

**Why it happens:** Zustand의 `set()`은 동기이지만, React re-render는 배치 처리됨.

**How to avoid:** `logout()` 다음 바로 `navigate()`를 호출. Zustand 5.x에서 `set()`은 동기적으로 상태를 변경하므로 실질적 문제 없음. 단, navigate 후 message를 표시해야 메시지가 로그인 페이지에서 보임.

**Warning signs:** 로그아웃 후 0.1초 동안 보호 경로가 briefly 표시됨.

### Pitfall 4: window.opener.focus() + window.close() 순서

**What goes wrong:** `window.close()` 이후 `window.opener.focus()`를 호출하면 창이 닫힌 후 참조가 무효화되어 포커스 이동 실패.

**Why it happens:** window.close()는 동기적으로 창을 닫음. 닫힌 창에서 opener에 접근 시 실패.

**How to avoid:** `window.opener.focus()` 먼저, `window.close()` 나중. UI-SPEC D-08 순서대로.

**Warning signs:** 서브시스템 창 닫힘 후 메인 포탈 창이 백그라운드에 남음.

### Pitfall 5: authStore에 idleReset을 store 액션으로 추가하는 함정

**What goes wrong:** idle 타이머 리셋을 authStore에 넣으면 Zustand persist가 타이머 참조를 직렬화하려다 오류. 또는 store가 불필요하게 UI 로직을 가짐.

**Why it happens:** authStore는 인증 상태 관리 전용. 타이머는 컴포넌트 로컬 상태.

**How to avoid:** Idle 타이머는 `useSessionCheck` 훅 내부 useRef로만 관리. authStore에는 `logout()` 액션만 호출.

---

## Code Examples

### 공지사항 AnnouncementSection 컴포넌트

```typescript
// features/announcements/components/AnnouncementSection.tsx
import { List, Alert, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import type { Announcement } from '../types'

const { Title } = Typography

export function AnnouncementSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiClient.get<unknown, ApiResult<Announcement[]>>('/announcements')
      .then((r) => r.data),
  })

  const urgentItem = data?.find((a) => a.isUrgent)
  const items = data?.slice(0, 3) ?? []

  return (
    <div className="mb-12">
      <Title level={5}>공지사항</Title>
      {urgentItem && (
        <Alert
          type="warning"
          message={urgentItem.title}
          closable
          className="mb-2"
        />
      )}
      <List
        size="small"
        bordered={false}
        loading={isLoading}
        dataSource={items}
        locale={{ emptyText: '등록된 공지사항이 없습니다' }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.title}
              description={<Typography.Text type="secondary">{item.createdAt}</Typography.Text>}
            />
          </List.Item>
        )}
      />
    </div>
  )
}
```

### 로그아웃 후 message 표시 (PTL-03)

```typescript
// MainPortalLayout.tsx handleLogout 수정
const handleLogout = () => {
  logout()
  navigate(ROUTES.LOGIN)
  // navigate 완료 후 message는 LoginPage에서 표시하거나 여기서 즉시 표시
  message.success('로그아웃 되었습니다')
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| setInterval 세션 체크 (기존 useSessionCheck) | Idle 이벤트 + 이중 타이머 | Phase 2 | 만료 전 30초 경고 Modal 가능 |
| sessionExpiry timestamp 기반 만료 | Idle timeout 기반 만료 | Phase 2 | 사용자 활동 중엔 세션 유지 |

**Deprecated/outdated:**
- `useSessionCheck`의 `setInterval(60초)` 방식: Idle 감지 없음. Phase 2에서 이중 타이머로 교체.
- `authStore.checkSession()`: Idle 기반 전환 후 보조적으로만 사용하거나 제거 가능. (새 window.open 탭에서 토큰 유효성 체크에는 유지 가능)

---

## Open Questions

1. **SessionWarningModal 마운트 위치**
   - What we know: RequireAuth 또는 MainPortalLayout 중 하나에 위치해야 함
   - What's unclear: 서브시스템 새 창에서도 경고 Modal이 필요한가? (서브시스템 창은 별도 RequireAuth로 감싸져 있음)
   - Recommendation: RequireAuth에 배치. 메인 포탈과 서브시스템 모두 RequireAuth를 거치므로 양쪽에 Modal이 표시됨. 이것이 의도된 동작이라면 OK.

2. **공지사항 상세 보기 구현**
   - What we know: UI-SPEC에 "클릭 시 상세 Modal (별도 라우트 없음)" 명시
   - What's unclear: Phase 2에서 실제 구현이 필요한가, 아니면 클릭 이벤트만 준비?
   - Recommendation: D-03(즐겨찾기 불필요)과 마찬가지로 Phase 2 범위에서는 상세 Modal 구현을 포함. 코드량이 적고 PTL-02 성공 기준 충족에 필요.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 2는 순수 프론트엔드 코드 변경. 신규 외부 의존성 없음.

현재 환경 확인:
- Node.js: 사용 가능 (vitest 실행 확인됨)
- Vitest 4.1.2: 설치됨, 64 tests passed
- Ant Design 5.29.3: 설치됨
- Zustand 5.0.12: 설치됨
- MSW 2.12.x: 설치됨

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | navy-admin/vite.config.ts (test 섹션) |
| Quick run command | `cd navy-admin && npx vitest run src/features/auth` |
| Full suite command | `cd navy-admin && npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PTL-01 | 인증 성공 시 PORTAL 이동, 실패 시 error message | unit | `npx vitest run src/features/auth/store/authStore.test.ts` | ✅ (기존 확장) |
| PTL-02 | 공지사항 3건 렌더링, 서브시스템 카드 18개 렌더링 | unit | `npx vitest run src/__tests__/portal/` | ❌ Wave 0 |
| PTL-03 | 로그아웃 시 authStore 초기화 + /login 이동 | unit | `npx vitest run src/features/auth/store/authStore.test.ts` | ✅ (기존 확장) |
| PTL-04 | idle 60초 후 logout 호출, warnTimer 30초에 isWarningVisible=true | unit | `npx vitest run src/features/auth/hooks/useSessionCheck.test.ts` | ❌ Wave 0 |
| PTL-05 | user.rank + user.name + user.unit 헤더 표시 | unit | `npx vitest run src/__tests__/portal/header.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd navy-admin && npx vitest run src/features/auth`
- **Per wave merge:** `cd navy-admin && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/portal/announcement.test.ts` — covers PTL-02 (공지사항 렌더링)
- [ ] `src/__tests__/portal/header.test.ts` — covers PTL-05 (사용자 정보 표시)
- [ ] `src/features/auth/hooks/useSessionCheck.test.ts` — covers PTL-04 (Idle 타이머 동작)
- [ ] `src/shared/api/mocks/handlers/announcements.test.ts` — covers PTL-02 (MSW 핸들러)

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 2 |
|-----------|-------------------|
| React + TypeScript + Tailwind CSS + Vite 스택 고정 | 신규 패키지 설치 금지 |
| Tailwind preflight:false | antd 컴포넌트 내부에 Tailwind 클래스 사용 금지 |
| antd-theme.ts 수정 금지 | colorPrimary `#1E3A5F` 유지 |
| shared/ui 6개 컴포넌트 인터페이스 동결 | Phase 2에서 수정 금지 |
| 시스템 명칭 "해군 행정포탈" (NAVY) 통일 | sys06(해병대규정관리체계) 제외 |
| window.open() 방식 고정 (D-07) | 서브시스템은 항상 새 창 |
| window.opener.focus() → window.close() 순서 | 반드시 이 순서 유지 |
| MVP 1분 idle timeout (IDLE_TIMEOUT_MS 상수) | 하드코딩 금지 |
| 세션 만료 Modal closable=false, maskClosable=false | 변경 금지 |

---

## Sources

### Primary (HIGH confidence)

- 기존 코드 직접 분석 (`authStore.ts`, `useSessionCheck.ts`, `RequireAuth.tsx`, `PortalLayout.tsx`) — 현재 구현 상태 확인
- `02-UI-SPEC.md` — UI 계약 (Pattern A~F, Frozen Constraints, Idle 구현 계약)
- `02-CONTEXT.md` — 잠금 결정 D-01~D-12

### Secondary (MEDIUM confidence)

- 브라우저 Web API 표준 (addEventListener, setTimeout, clearTimeout) — MDN 기반 패턴

### Tertiary (LOW confidence)

- 없음

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Phase 0 동결값 그대로, 코드에서 직접 확인
- Architecture: HIGH — 기존 코드 구조 분석 + UI-SPEC 기반
- Pitfalls: HIGH — 코드 직접 분석으로 실제 리팩토링 포인트 식별

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (스택 변경 없는 안정적 Phase)
