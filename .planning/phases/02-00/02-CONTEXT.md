# Phase 2: 메인 포탈 (00_포탈) - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

인증된 사용자의 로그인 → 대시보드 → 18개 서브시스템 접속 전체 플로우를 완성한다. Phase 0에서 구축한 LoginPage, PortalPage, MainPortalLayout, authStore, useSessionCheck, RequireAuth를 보강하여 PTL-01~05 요구사항을 충족시킨다.

</domain>

<decisions>
## Implementation Decisions

### 대시보드 구성 (PTL-02)
- **D-01:** 대시보드 상단에 공지사항 배너 배치 (최신 3건 표시, antd List/Alert 활용)
- **D-02:** 공지사항 하단에 서브시스템 바로가기 카드 그리드 유지 (현재 PortalPage 구조)
- **D-03:** 즐겨찾기/빠른 접근 기능은 이 Phase에서 구현하지 않음

### 세션 관리 (PTL-04)
- **D-04:** Idle 감지 방식 채택 — 마우스/키보드 활동 없이 N분 경과 시 세션 만료 (MVP에서는 1분 idle로 테스트 용이성 확보)
- **D-05:** 만료 30초 전 antd Modal 표시: 카운트다운 + [연장]/[로그아웃] 버튼. 응답 없으면 자동 로그아웃 후 로그인 페이지 이동
- **D-06:** 세션 연장 시 idle 타이머 리셋, 만료 시 authStore.logout() 호출 + 만료 안내 메시지와 함께 /login 이동

### 서브시스템 전환 (PTL-04)
- **D-07:** 서브시스템은 window.open()으로 새 창에서 열기 (현재 방식 유지)
- **D-08:** 서브시스템 헤더에 '메인으로' 버튼 추가 — 클릭 시 window.close() + opener.focus()
- **D-09:** 사용자가 직접 창 닫기(X 버튼)해도 메인 포탈 창이 남아있으므로 자연스럽게 복귀

### 브랜딩/명칭
- **D-10:** 전체 시스템 명칭: "해군 행정포탈" (NAVY). 해병대규정관리체계(06번)만 해병대 전용, 나머지 17개 서브시스템 + 메인 포탈은 해군(NAVY) 통일
- **D-11:** 로그인 화면 보안 경고문 불필요 — MVP에서 생략
- **D-12:** 현재 로그인 Card 레이아웃 유지 (추가 로고/마크 이미지 없음)

### Claude's Discretion
- Idle 감지의 정확한 이벤트 목록 (mousemove, keydown, click 등)
- 공지사항 Mock 데이터 구조 및 MSW 핸들러 설계
- 세션 만료 Modal의 정확한 카운트다운 UI 패턴
- 서브시스템 헤더 '메인으로' 버튼의 위치/스타일

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 개발 요건
- `개발 spec.txt` — 로그인, 세션, 서브시스템 연동 규칙 (항목 1~4 특히 관련)

### 기존 코드 (Phase 0 산출물)
- `navy-admin/src/pages/login/index.tsx` — 현재 로그인 페이지
- `navy-admin/src/pages/portal/index.tsx` — 현재 대시보드 페이지
- `navy-admin/src/app/layouts/MainPortalLayout.tsx` — 메인 포탈 헤더 레이아웃
- `navy-admin/src/app/layouts/PortalLayout.tsx` — 서브시스템 ProLayout
- `navy-admin/src/features/auth/store/authStore.ts` — Zustand 인증 스토어
- `navy-admin/src/features/auth/hooks/useSessionCheck.ts` — 세션 체크 훅
- `navy-admin/src/app/components/RequireAuth.tsx` — 인증 가드
- `navy-admin/src/app/router.tsx` — 전체 라우터 구조
- `navy-admin/src/shared/api/mocks/handlers/auth.ts` — 인증 MSW 핸들러
- `navy-admin/src/entities/user/types.ts` — User, LoginCredentials 타입

### 요구사항
- `.planning/REQUIREMENTS.md` — PTL-01~05 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LoginPage` — 기본 로그인 폼 완성 (antd Form + Input). ID/PW 입력 → authStore.login() → navigate('/')
- `PortalPage` — 서브시스템 카드 그리드 (SUBSYSTEM_META 기반). 공지사항 영역 추가 필요
- `MainPortalLayout` — Header with user info + logout dropdown. 구조 유지
- `SubsystemProLayout` — ProLayout 사이드바 레이아웃. '메인으로' 버튼 추가 필요
- `authStore` — login/logout/checkSession 완비. Idle 감지 로직 추가 필요
- `useSessionCheck` — 1분 간격 체크. Idle 기반으로 리팩토링 필요
- `auth MSW handlers` — /auth/login, /auth/me, /auth/logout 핸들러 완비

### Established Patterns
- Zustand persist로 인증 상태 localStorage 저장
- TanStack Query로 서버 데이터 관리
- MSW 브라우저 Service Worker로 API 모킹
- antd 컴포넌트 + Tailwind 외부 레이아웃

### Integration Points
- `router.tsx` — 새 라우트 추가 불필요 (이미 완비)
- `authStore` — idle 감지 로직 추가/수정
- `useSessionCheck` — idle 기반으로 리팩토링
- `PortalPage` — 공지사항 영역 추가
- `SubsystemProLayout` — 헤더에 '메인으로' 버튼 추가

</code_context>

<specifics>
## Specific Ideas

- 해병대규정관리체계(06번)만 해병대 명칭, 나머지는 모두 해군(NAVY)으로 통일
- marine이라는 용어 사용하지 않음 (navy 사용)
- MVP에서 idle timeout은 1분으로 설정하여 테스트 용이성 확보

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-00*
*Context gathered: 2026-04-05*
