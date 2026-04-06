# Phase 0: 프로젝트 기반 구축 - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

React + TypeScript + Vite 프로젝트를 초기화하고, FSD(Feature-Sliced Design) 아키텍처, 공통 컴포넌트 라이브러리, MSW Mock API, 라우팅 구조, 상태관리, URL 컨벤션을 동결한다. 이 Phase의 산출물은 이후 845개 화면 개발의 불변 계약이 된다.

</domain>

<decisions>
## Implementation Decisions

### FSD 프로젝트 구조
- **D-01:** Feature-Sliced Design 레이어 구조 채택: `app/` > `pages/` > `widgets/` > `features/` > `entities/` > `shared/`
- **D-02:** 각 서브시스템은 `pages/` 레이어의 독립 슬라이스로 구현 (예: `pages/sys01-overtime/`, `pages/sys02-survey/`)
- **D-03:** 같은 레이어 간 import 금지 원칙 적용 (서브시스템 간 의존성 차단)
- **D-04:** `shared/` 레이어에 ui, api, lib, config, types 슬라이스 배치

### URL 컨벤션
- **D-05:** 서브시스템 URL 패턴: `/sys{번호}/{대메뉴슬러그}/{소메뉴슬러그}` (예: `/sys01/application/write`)
- **D-06:** 메인 포탈: `/`, 로그인: `/login`
- **D-07:** 공통 기능: `/common/{기능슬러그}` (예: `/common/auth-group`, `/common/code-mgmt`)

### Ant Design 테마/컴포넌트
- **D-08:** Ant Design 5.24 + ProComponents 사용 (ProTable, ProForm, ProLayout)
- **D-09:** Tailwind CSS는 Ant Design 컴포넌트 외부 레이아웃/간격에만 사용, 컴포넌트 내부 스타일은 antd 토큰 시스템
- **D-10:** 군 행정 포탈에 맞는 중립적 블루/그레이 톤 커스텀 테마 토큰 설정

### 공통 컴포넌트 범위 (Phase 0)
- **D-11:** Phase 0에서 구현하는 shared/ui 컴포넌트: DataTable(ProTable 래퍼), CrudForm(ProForm 래퍼), DetailModal, SearchForm, StatusBadge, ConfirmDialog
- **D-12:** Phase 0에서 구현하는 shared/api: MSW 핸들러 팩토리, 공통 API 타입(PageRequest, PageResponse, ApiResult), axios 인스턴스
- **D-13:** Phase 1에서 구현하는 widgets: BoardWidget(게시판), ApprovalWidget(결재), AuthGroupWidget(권한)

### Mock API 전략
- **D-14:** MSW 2.x 브라우저 Service Worker 모드 사용
- **D-15:** Mock 데이터 구조는 Java Spring Boot DTO 관례를 따름 (camelCase 필드, PageResponse 래핑)
- **D-16:** Faker.js 9.x 한국어 로케일로 군 행정 도메인 목데이터 생성
- **D-17:** MSW 핸들러는 `shared/api/mocks/handlers/` 에 서브시스템별 분리

### 상태관리
- **D-18:** Zustand 5.x: authStore(인증/세션), uiStore(사이드바/테마) 글로벌 스토어
- **D-19:** TanStack Query 5.x: 모든 서버 데이터(CRUD 목록, 상세조회) 관리
- **D-20:** 서브시스템별 로컬 상태는 각 pages/ 슬라이스 내부에서 관리

### 라우팅
- **D-21:** React Router v7 SPA 모드, 중첩 라우트로 포탈/서브시스템 레이아웃 공유
- **D-22:** 서브시스템별 React.lazy() 코드 스플리팅 적용
- **D-23:** ProtectedRoute 컴포넌트: authStore 확인 후 미인증 시 /login 리다이렉트

### 한글 IME 대응
- **D-24:** 모든 검색/입력 컴포넌트에 `e.nativeEvent.isComposing` 가드 적용 (한글 IME 이중 이벤트 방지)

### Claude's Discretion
- 정확한 Tailwind 설정값 (색상 팔레트, 간격 스케일)
- Vite 빌드 최적화 (manualChunks 전략)
- ESLint/Prettier 설정 상세
- 테스트 프레임워크(Vitest) 초기 설정 범위

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 개발 요건
- `개발 spec.txt` -- 시스템 개발 요건 8개 항목 (로그인, 세션, 서브시스템 연동 규칙)

### 요구사항
- `.planning/REQUIREMENTS.md` -- BASE-01~09 요구사항 상세

### 리서치
- `.planning/research/STACK.md` -- 기술 스택 권고안 (버전, 설치 명령)
- `.planning/research/ARCHITECTURE.md` -- FSD 구조, 라우팅, 상태관리 아키텍처
- `.planning/research/PITFALLS.md` -- Phase 0 피트폴 (컴포넌트 동결, Mock DTO, IME)
- `.planning/research/FEATURES.md` -- 공통 컴포넌트 요구사항 도출 근거

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 없음 (Greenfield 프로젝트, Phase 0)

### Established Patterns
- 없음 (이 Phase에서 패턴 확립)

### Integration Points
- 없음 (이 Phase가 모든 후속 Phase의 기반)

</code_context>

<specifics>
## Specific Ideas

- Phase 0 산출물은 "불변 계약" -- Phase 1 진입 전 컴포넌트 목록, URL 패턴, API 타입 스키마, 권한 인터페이스 동결
- 에이전트 프롬프트에 공통 컴포넌트 목록과 URL 컨벤션을 컨텍스트로 주입하는 메커니즘 필요
- Ant Design ProTable + ProForm 패턴을 Phase 0에서 확립하면 이후 18개 서브시스템 845개 화면 개발 속도 극대화

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 00-project-foundation*
*Context gathered: 2026-04-05*
