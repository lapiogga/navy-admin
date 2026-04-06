---
phase: 2
slug: 00-main-portal
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-05
---

# Phase 2 — UI Design Contract

> Phase 2: 메인 포탈 (00_포탈) — 로그인/대시보드/세션관리/서브시스템 전환의 시각·인터랙션 계약.
> gsd-ui-researcher 생성, gsd-ui-checker 검증 대상.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (shadcn 미사용 — Ant Design 5 ProComponents 채택, Phase 0 결정) |
| Preset | not applicable |
| Component library | Ant Design 5.29.3 + @ant-design/pro-components 2.8.10 |
| Icon library | @ant-design/icons (antd 번들 포함) |
| Font | Noto Sans KR, -apple-system, BlinkMacSystemFont, sans-serif (antd-theme.ts 동결값) |

**Registry Safety Gate:** shadcn 미초기화이므로 적용 안 함.

---

## Spacing Scale

Phase 1 동결값 그대로 상속. 4의 배수 원칙 유지.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 아이콘 간격, 인라인 패딩 |
| sm | 8px | 컴팩트 요소 간격, 카드 내부 소형 여백 |
| md | 16px | 기본 요소 간격, 카드 그리드 gutter (Row gutter={16}) |
| lg | 24px | 섹션 패딩, 카드 내부 패딩 (antd Card bodyStyle padding) |
| xl | 32px | 레이아웃 패널 간격 |
| 2xl | 48px | 주요 섹션 구분 위아래 (공지사항↔카드 그리드 사이) |
| 3xl | 64px | 페이지 레벨 상단 여백 |

Exceptions:
- 로그인 Card: width 400px 고정, 외부 여백은 flex center (Tailwind `min-h-screen bg-gray-100`)
- 세션 만료 Modal: antd Modal 기본 width=416px, 버튼 영역 하단 패딩 lg(24px)
- 서브시스템 카드 그리드: Row gutter={[16, 16]} (가로/세로 동일 gap)
- 공지사항 배너 높이: 최소 48px (antd List.Item 기본값 유지)

---

## Typography

### 스케일 토큰 (4개 고유 사이즈 — 최대 허용치 내)

Phase 1 antd-theme.ts 동결 토큰 기반. Phase 2 추가 요소를 아래 4개 토큰으로 매핑.

| Role | Size | Weight | Line Height | Phase 2 매핑 요소 |
|------|------|--------|-------------|-----------------|
| Body | 14px | 400 (regular) | 1.5 | 로그인 부제, 헤더 사용자 정보, 공지사항 배너 날짜 오버라이드 불가 시 fallback |
| Label | 14px | 600 (semibold) | 1.4 | 공지사항 배너 제목, 로그인 부제 레이블 |
| Display | 16px | 400 (regular) | 1.5 | 서브시스템 카드 타이틀 (`Title level={5}`), 헤더 시스템명 (`Text strong`) |
| Heading | 20px | 600 (semibold) | 1.2 | 세션 만료 Modal 카운트다운 숫자, 대시보드 섹션 타이틀 |

### antd 네이티브 예외 (스케일 토큰 외 — antd 기본 렌더 위임)

아래 요소들은 antd Typography 컴포넌트가 자체 크기를 결정하며, 스케일 토큰에서 제외한다. Executor는 이 요소에 별도 `fontSize` override를 적용하지 않는다.

| 요소 | antd 컴포넌트 | 실제 렌더 크기 | 처리 근거 |
|------|-------------|-------------|---------|
| 로그인 페이지 타이틀 | `Typography.Title level={3}` | ~24px (antd 기본값) | antd h3 네이티브 렌더. override 불필요 |
| 공지사항 날짜 | `Text type="secondary"` (small) | ~12px | antd secondary 텍스트. `font-size` override 금지 |
| 서브시스템 카드 부제 | `Text type="secondary"` | ~12px | antd secondary 텍스트. `font-size` override 금지 |

**적용 규칙:**
- 헤더 시스템명 (`Text strong`): Display 토큰 16px semibold, color `#ffffff`
- 헤더 사용자 정보 (`span`): Body 토큰 14px regular, color `#ffffff`
- 공지사항 배너 제목: Label 토큰 14px semibold (antd List.Item.Meta title)
- 세션 만료 Modal 카운트다운 숫자: Heading 토큰 20px semibold, color `#ff4d4f` (colorError)
- 로그인 부제 (`p.text-gray-500`): Body 토큰 14px regular, color `#8c8c8c`

---

## Color

Phase 1 antd-theme.ts 동결 토큰 그대로 상속:

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FFFFFF` (colorBgContainer) | 로그인 Card 배경, 공지사항 배너 배경, 서브시스템 카드 배경 |
| Secondary (30%) | `#F0F2F5` (colorBgLayout) | 로그인 페이지 전체 배경, 대시보드 Content 배경, 헤더 외부 영역 |
| Accent (10%) | `#1E3A5F` (colorPrimary, 해군 네이비) | 로그인 버튼, 헤더 배경, Primary Button, 활성 상태 |
| Destructive | `#ff4d4f` (colorError) | 로그아웃 확인 경고, 세션 만료 카운트다운 숫자 |

**Accent 사용 제한 목록 (이 요소들에만 적용):**
1. 로그인 `Button type="primary"` (로그인 버튼)
2. `Header` 배경 (`#001529` — antd ProLayout 다크 헤더, colorPrimary 계열)
3. antd Link 색상 (`colorPrimary` 상속)
4. 세션 연장 Modal의 `Button type="primary"` (연장 버튼)

**보조 시맨틱 색상 (Phase 1 상속):**
- 성공/완료: `#52c41a` (colorSuccess) — 로그인 성공 message
- 경고/대기: `#faad14` (colorWarning) — 세션 만료 경고 Modal 제목 아이콘

---

## Component Inventory (Phase 2 신규 패턴)

Phase 0/1 동결 컴포넌트 위에 Phase 2가 추가로 활용하는 antd 컴포넌트:

| 컴포넌트 | antd 경로 | 사용 화면 | 인터랙션 계약 |
|---------|----------|---------|------------|
| `List` | `antd/List` | 공지사항 배너 (PTL-02) | `size="small"`, `bordered={false}`, `dataSource` 최신 3건, 클릭 시 상세 Modal (별도 라우트 없음) |
| `Alert` | `antd/Alert` | 공지사항 긴급 알림 (선택적, PTL-02) | `type="warning"`, 닫기 버튼 제공 (`closable={true}`) |
| `Modal` | `antd/Modal` | 세션 만료 경고 (PTL-04) | `closable={false}`, `maskClosable={false}`, 카운트다운 30초, footer=[연장 버튼, 로그아웃 버튼] |
| `Countdown` | 커스텀 — `setInterval` 기반 | 세션 만료 카운트다운 (PTL-04) | 30초 카운트다운, `typography.Text`로 렌더링, 0 도달 시 자동 로그아웃 |
| `Card (hoverable)` | `antd/Card` | 서브시스템 바로가기 카드 (PTL-02) | `hoverable={true}`, 클릭 시 `window.open(path, '_blank')`, 카드 내 아이콘 + 이름 + 프로세스 수 |
| `Dropdown` | `antd/Dropdown` | 헤더 사용자 메뉴 (PTL-03, PTL-05) | items: [로그아웃], 트리거: hover+click |

---

## Interaction Contracts (패턴별)

### Pattern A: 로그인 플로우 (PTL-01)

1. `/login` 진입 — 로그인 Card 렌더링 (width=400px, shadow-lg)
2. ID/PW 입력 후 로그인 버튼 클릭 또는 Enter 키
3. `loading=true` → 버튼 로딩 스피너 표시, 입력 비활성화
4. MSW `/auth/login` POST 성공 → `authStore.login()` 호출 → `navigate(ROUTES.PORTAL, { replace: true })`
5. MSW `/auth/login` POST 실패 → `message.error(오류 메시지)` 4초 표시, 폼 유지
6. 이미 인증된 상태에서 `/login` 접근 → RequireAuth가 `/` (PORTAL)로 리다이렉트
7. 인증 없이 보호 경로 접근 → RequireAuth가 `/login`으로 리다이렉트

### Pattern B: 대시보드 레이아웃 (PTL-02)

```
MainPortalLayout
  Header (height=64px, background=#001529)
    Left: "해군 행정포탈" 텍스트 (Display 16px semibold, white)
    Right: 사용자 Dropdown (계급 + 이름 + 소속부대)
  Content (background=#F0F2F5, padding=24px)
    AnnouncementBanner
      List size="small" (공지사항 최신 3건)
      [긴급 공지 시] Alert type="warning"
    divider margin-bottom=48px (2xl)
    Title level={4}: "서브시스템 바로가기"
    Row gutter={[16,16]}
      Col xs={24} sm={12} md={8} lg={6} per subsystem
        Card hoverable
          아이콘 (24px, colorPrimary)
          Title level={5}: 서브시스템명
          Text type="secondary": N개 프로세스
```

### Pattern C: 서브시스템 전환 (PTL-04 D-07~09)

1. 카드 클릭 → `window.open(path, '_blank')` 호출
2. 새 창에서 SubsystemProLayout 로드
3. SubsystemProLayout 헤더 사용자 드롭다운에 "메인포탈로 돌아가기" 항목 표시
4. "메인포탈로 돌아가기" 클릭 → `window.opener.focus()` + `window.close()`
5. 사용자가 직접 창닫기(X) → 메인 포탈 창 그대로 유지 (자연 복귀)
6. `window.opener`가 없는 경우 (직접 URL 접근) → `navigate(ROUTES.PORTAL)` 대체 처리

### Pattern D: 세션 만료 플로우 (PTL-04 D-04~06)

```
Idle 이벤트 감지: mousemove, keydown, click, scroll, touchstart
Idle 타이머: 1분 (60초) — MVP 테스트 용이성 확보 (D-04)

타임라인:
  T=0s: 마지막 활동
  T=30s (만료 30초 전): 경고 Modal 표시 (D-05)
    Modal 제목: "세션 만료 경고"
    Modal 내용: "30초 후 자동으로 로그아웃됩니다." + 카운트다운 숫자
    Modal footer: [세션 연장 (primary)] [지금 로그아웃 (default)]
    Modal closable=false, maskClosable=false
  T=60s (타임아웃): authStore.logout() + navigate(ROUTES.LOGIN) + 만료 안내
    로그인 페이지 도달 후 message.warning("세션이 만료되었습니다. 다시 로그인하세요") 4초

  세션 연장 클릭: idle 타이머 리셋 → Modal 닫힘
  지금 로그아웃 클릭: authStore.logout() → navigate(ROUTES.LOGIN)
```

### Pattern E: 로그아웃 플로우 (PTL-03)

1. 헤더 사용자 Dropdown에서 "로그아웃" 클릭
2. `authStore.logout()` 호출 → Zustand persist localStorage 초기화
3. `navigate(ROUTES.LOGIN)` 이동
4. 로그인 페이지에서 `message.success("로그아웃 되었습니다")` 2초 표시
5. 별도 확인 Dialog 없음 (비파괴적 행동으로 간주)

### Pattern F: 사용자 정보 표시 (PTL-05)

- 헤더 우측: `{user.rank} {user.name} ({user.unit})` 형식으로 표시
- 예시: "대위 홍길동 (1해병사단)"
- `user`가 null인 경우 빈 문자열 표시 (에러 없음)
- 사용자 정보는 `/auth/me` MSW Mock 응답에서 로드 (로그인 직후 자동 호출)

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| 로그인 페이지 타이틀 | 해군 행정포탈 |
| 로그인 페이지 부제 | 시스템에 로그인하세요 |
| Primary CTA (로그인) | 로그인 |
| 아이디 입력 placeholder | 아이디 |
| 비밀번호 입력 placeholder | 비밀번호 |
| 아이디 필수 오류 | 아이디를 입력하세요 |
| 비밀번호 필수 오류 | 비밀번호를 입력하세요 |
| 로그인 성공 | 로그인 성공 |
| 로그인 실패 | 아이디 또는 비밀번호가 올바르지 않습니다 |
| 네트워크 오류 (로그인) | 서버 연결에 실패했습니다. 잠시 후 다시 시도하세요 |
| 헤더 시스템명 | 해군 행정포탈 |
| 대시보드 섹션 타이틀 | 서브시스템 바로가기 |
| 공지사항 섹션 타이틀 | 공지사항 |
| 공지사항 Empty state | 등록된 공지사항이 없습니다 |
| 서브시스템 카드 부제 | N개 프로세스 |
| 헤더 로그아웃 메뉴 | 로그아웃 |
| 로그아웃 완료 | 로그아웃 되었습니다 |
| 메인포탈 복귀 버튼 (서브시스템) | 메인포탈로 돌아가기 |
| 세션 만료 Modal 제목 | 세션 만료 경고 |
| 세션 만료 Modal 본문 | {N}초 후 자동으로 로그아웃됩니다. |
| 세션 연장 버튼 | 세션 연장 |
| 지금 로그아웃 버튼 | 지금 로그아웃 |
| 세션 만료 후 안내 | 세션이 만료되었습니다. 다시 로그인하세요 |
| Error state (데이터 로드 실패) | 데이터를 불러오지 못했습니다. 새로고침 후 다시 시도하세요 |
| 테스트 계정 안내 | 테스트 계정: admin / 1234 |

**파괴적 행동:** 이 Phase에는 파괴적 행동(데이터 삭제 등)이 없음. 로그아웃은 확인 Dialog 없이 즉시 실행.

---

## Page-Level Layout Contract

### 로그인 페이지 (PTL-01)

```
div.flex.items-center.justify-center.min-h-screen (background=#F0F2F5)
  Card width=400px, shadow-lg
    div.text-center.mb-8
      Title level={3}: "해군 행정포탈"  ← antd 네이티브 렌더 (예외 목록 참조)
      p.text-gray-500: "시스템에 로그인하세요"  ← Body 14px regular
    Form onFinish=handleSubmit, size="large"
      Form.Item name="username" (아이디 Input + UserOutlined)
      Form.Item name="password" (비밀번호 Input.Password + LockOutlined)
      Form.Item
        Button type="primary" block: "로그인"
    div.text-center.text-gray-400.text-sm: "테스트 계정: admin / 1234"
```

### 메인 대시보드 (PTL-02)

```
MainPortalLayout
  Layout.Header height=64px, background=#001529, px=24px
    Left: Text strong white Display(16px semibold): "해군 행정포탈"
    Right: Dropdown (UserOutlined + "계급 이름 (부대)")
      items: [로그아웃]
  Layout.Content background=#F0F2F5, p=24px
    AnnouncementSection
      Title level={5}: "공지사항"
      List size="small"
        3건 공지 항목 (제목 + 날짜)  ← 날짜: antd secondary 네이티브 렌더
    div margin-bottom=48px (구분 여백)
    Title level={4}: "서브시스템 바로가기"
    Row gutter={[16,16]}
      Col xs={24} sm={12} md={8} lg={6} per subsystem (18개)
        Card hoverable text-center
          Icon 24px colorPrimary mb=8px
          Title level={5}: 서브시스템명  ← Display 16px semibold
          Text type="secondary": "N개 프로세스"  ← antd secondary 네이티브 렌더
```

### 세션 만료 Modal

```
Modal
  title: "세션 만료 경고"
  open: isSessionWarning
  closable={false}
  maskClosable={false}
  footer: [
    Button type="primary": "세션 연장"
    Button: "지금 로그아웃"
  ]
  Content:
    Text: "{countdown}초 후 자동으로 로그아웃됩니다."
    Text Heading(20px semibold) colorError: countdown 숫자 (중앙 정렬)
```

---

## Idle 감지 구현 계약

`useSessionCheck` 훅을 아래 사양으로 리팩토링:

```
감지 이벤트: ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
Idle 임계값: 60초 (IDLE_TIMEOUT_MS = 60_000) — MVP 테스트 용이성 확보
경고 임계값: 30초 (WARN_BEFORE_MS = 30_000, 만료 30초 전)

상태:
  idleTimer: ReturnType<typeof setTimeout>
  warnTimer: ReturnType<typeof setTimeout>
  countdown: number (30 → 0, 1초 간격 setInterval)
  isWarningVisible: boolean

동작:
  - 이벤트 발생 시 두 타이머 모두 리셋
  - idleTimer 만료: authStore.logout() + navigate(LOGIN) + message.warning
  - warnTimer 만료: isWarningVisible=true + countdown setInterval 시작
  - 세션 연장: isWarningVisible=false + countdown=30 + 두 타이머 리셋
  - 로그인 상태 아닐 때 타이머 비활성화
```

---

## Frozen Constraints (Executor 준수 필수)

1. `shared/ui` 6개 컴포넌트 props 인터페이스 수정 금지 (Phase 0 동결)
2. `antd-theme.ts` 토큰 수정 금지 — colorPrimary `#1E3A5F` 변경 금지
3. Tailwind는 레이아웃 유틸리티만 사용 — antd 컴포넌트 내부에 Tailwind 클래스 주입 금지
4. 시스템 명칭: "해군 행정포탈" (NAVY) 통일 — "해병대" 명칭 사용 금지 (D-10, sys06 제외)
5. Idle timeout 1분(60초) 고정 — 상수 `IDLE_TIMEOUT_MS`로 분리하여 테스트 용이성 확보
6. 세션 만료 Modal: `closable=false`, `maskClosable=false` — 사용자가 Modal 회피 불가
7. 서브시스템 오픈 방식: `window.open(path, '_blank')` 고정 — 동일 창 이동 금지 (D-07)
8. 메인포탈 복귀: `window.opener.focus()` + `window.close()` 순서 고정 (D-08)
9. antd 네이티브 예외 요소(Title level={3}, Text type="secondary")에 `fontSize` override 금지

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable (shadcn 미사용) |
| antd (npm 공식) | List, Alert, Modal, Card, Dropdown, Layout, Typography | not required (공식 npm 패키지, Phase 0 동결) |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
