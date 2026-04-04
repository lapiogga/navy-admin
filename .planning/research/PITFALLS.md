# Domain Pitfalls

**Domain:** 대규모 React 행정 포탈 (18 서브시스템, 845 단위 프로세스)
**Researched:** 2026-04-05
**Confidence:** MEDIUM (웹 서치 + 도메인 전문 지식 기반, 공식 문서 일부 교차 확인)

---

## Critical Pitfalls

### Pitfall 1: 공통 컴포넌트 없이 시스템별 독립 개발

**What goes wrong:**
각 서브시스템 담당 에이전트가 독립적으로 게시판, 테이블, 폼, 모달을 구현하기 시작한다.
18개 시스템이 끝날 때쯤 기능적으로 동일한 컴포넌트가 18~30개의 변종으로 존재한다.
버튼 스타일 하나 바꾸면 50개 파일을 수정해야 한다.

**Why it happens:**
Phase 0에서 공통 라이브러리를 확정하지 않고 바로 Phase 3 서브시스템으로 진입.
에이전트별 컨텍스트 격리로 인해 다른 에이전트가 만든 컴포넌트를 참조하지 않음.

**Consequences:**
- 공통 UX 일관성 붕괴 (같은 포탈 안에서 버튼이 제각각)
- 버그 수정 시 n개 위치 동시 수정 필요
- Tailwind 클래스 중복/충돌로 빌드 사이즈 증가

**Prevention:**
- Phase 0에서 `/src/components/common/` 컴포넌트 라이브러리를 완전히 완성한 뒤 Phase 1 진입
- 에이전트 프롬프트에 "공통 컴포넌트 목록 참조 필수" 규칙 포함
- 각 Phase 시작 전 공통 컴포넌트 목록을 context로 주입

**Detection (warning signs):**
- 서브시스템 폴더에 `Table.tsx`, `Modal.tsx` 등 공통 명칭 파일 발견 시
- 동일한 Tailwind 클래스 블록이 3개 이상 파일에 복제될 때

**Phase:** Phase 0에서 반드시 해결. Phase 1 전에 컴포넌트 목록 동결.

---

### Pitfall 2: Mock 데이터 구조와 실제 API 계약 불일치

**What goes wrong:**
프론트엔드 Mock 데이터를 개발 편의대로 설계한다 (예: `user.name` 단일 필드).
Java 백엔드 개발 시 DB 정규화 후 `user.lastName + user.firstName` 분리로 나온다.
모든 렌더링 코드, 테이블 컬럼 정의, 폼 필드를 재작성해야 한다.

**Why it happens:**
"프론트 먼저" MVP 접근법에서 백엔드 팀과 API 계약 없이 편의 데이터 구조 사용.
845개 프로세스에 걸쳐 수백 개 Mock 타입이 생기면 불일치 규모가 선형 증가.

**Consequences:**
- Mock-to-real 전환 시 전체 코드베이스 대규모 수정
- TypeScript 타입 변경이 연쇄적 컴파일 에러 유발
- "프론트 완성" 상태가 사실상 반제품으로 전락

**Prevention:**
- 개발 초기에 `개발 spec.txt` / `req_analysis.txt`를 분석하여 핵심 엔티티 DTO 스키마를 도출
- Mock 데이터를 Java DTO 관례 (camelCase, 중첩 객체 최소화)에 맞게 설계
- `/src/types/api/` 에 모든 API 응답 타입 중앙 관리, Mock도 같은 타입 사용
- MSW (Mock Service Worker) 사용으로 Mock 레이어를 실제 fetch 레이어에 삽입

**Detection:**
- Mock 객체에 flattened 데이터 (`employeeName`) vs. 실제 DB 정규화 (`employeeId`) 혼재 시
- `types/` 폴더 없이 컴포넌트 내부에 inline 타입 정의 발견 시

**Phase:** Phase 0에서 핵심 API 타입 스키마 초안 작성. Phase 1에서 공통 기능 개발 중 검증.

---

### Pitfall 3: 라우팅 구조 미확정으로 인한 URL 설계 혼란

**What goes wrong:**
Phase별로 에이전트가 서브시스템을 추가하면서 라우팅 패턴이 달라진다.
`/system04/cert-apply` vs `/04/certApply` vs `/certification/apply` 등 혼용.
나중에 메인 포탈 링크 테이블과 권한 관리 코드 전체를 재작성해야 한다.

**Why it happens:**
라우팅 컨벤션을 Phase 0에서 문서화하지 않고, 에이전트가 자율적으로 결정.
845개 프로세스 = 수백 개 경로를 사후에 일관성 있게 수정하는 비용은 막대.

**Consequences:**
- 메인 포탈 링크 관리 불가능
- 권한 관리 시스템(Phase 1)이 경로 기반으로 작동하면 전면 재설계 필요
- 브라우저 북마크 / 딥링크 지원 불가

**Prevention:**
- Phase 0에서 라우팅 컨벤션 확정: `/sys{번호}/{feature}/{action}` 패턴
  예: `/sys01/overtime/list`, `/sys01/overtime/create`, `/sys01/overtime/detail/:id`
- `routes/index.ts` 에 전체 경로 상수 테이블 관리
- 에이전트 프롬프트에 URL 패턴 규칙 포함

**Detection:**
- 2개 이상 서브시스템에서 다른 URL 패턴 발견 시
- 하드코딩된 경로 문자열(`'/sys01/overtime'`)이 여러 파일에 분산될 때

**Phase:** Phase 0에서 라우팅 규칙 확정 필수. 이후 변경 금지.

---

### Pitfall 4: 권한 관리 시스템을 Mock으로 방치하다가 전체 컴포넌트 재수정

**What goes wrong:**
MVP에서 모든 메뉴를 `if (isLoggedIn)` 단일 조건으로 표시.
실제 권한 관리(Phase 1: 권한그룹, 메뉴별 권한, 사용자 배정)가 구현되면
각 컴포넌트가 권한 체크 로직을 삽입받아야 한다.
845개 화면에 권한 Guard를 소급 적용하는 비용 = 전체 재개발 수준.

**Why it happens:**
"일단 화면만" 접근법에서 권한 계층 설계를 미루다가 나중에 cross-cutting concern으로 발목 잡힘.

**Consequences:**
- 권한 없는 사용자가 URL 직접 입력으로 모든 화면 접근 가능
- 메뉴 렌더링 조건 하드코딩으로 권한 변경 시 코드 수정 필요

**Prevention:**
- Phase 0에서 `ProtectedRoute` 래퍼 컴포넌트와 `usePermission` 훅 인터페이스를 먼저 설계
- Mock 단계에서는 훅이 항상 `true`를 반환하지만 인터페이스는 실제와 동일
- 모든 라우트는 `<ProtectedRoute requiredPermission="sys01.overtime.view">` 형태로 작성

**Detection:**
- 컴포넌트 내부에 `isAdmin` 불리언 직접 체크 시
- 라우팅 레벨 보호 없이 컴포넌트 레벨에서만 조건부 렌더링 시

**Phase:** Phase 0 (인터페이스 설계), Phase 1 (실제 구현). 둘이 분리되어 있어야 함.

---

## Moderate Pitfalls

### Pitfall 5: 한글 IME 이벤트 중복 처리

**What goes wrong:**
검색창, 폼 입력에서 Enter 키로 제출 시 한글 마지막 글자가 중복 입력되거나 제출 이벤트가 두 번 발생.

**Why it happens:**
한글은 IME(입력기) 조합 문자이므로 `onKeyDown` 이벤트가 조합 중과 완료 후 각각 발화.
`event.key === 'Enter'` 만 체크하면 조합 완료 Enter와 확정 Enter가 모두 잡힘.

**Consequences:**
- 검색어가 빈 상태로 두 번 제출
- 텍스트에 마지막 글자 중복 삽입

**Prevention:**
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.nativeEvent.isComposing) return; // IME 조합 중 차단
  if (e.key === 'Enter') handleSubmit();
};
```
모든 Enter 이벤트 핸들러에 `isComposing` 체크를 공통 훅으로 추상화.

**Detection:**
- `e.key === 'Enter'` 체크에 `isComposing` 가드 없을 때
- QA 중 한글 입력 후 Enter 시 이상 동작 발생 시

**Phase:** Phase 0 공통 훅 설계 시 포함. Phase 3+ 서브시스템 개발 전 검증.

---

### Pitfall 6: 전역 상태 남용 (Context Provider 스택 과적)

**What goes wrong:**
각 서브시스템이 자체 Context Provider를 추가하면서 앱 최상단에 20+ Provider 스택 생성.
사용자 정보, 코드 테이블, 권한, 알림, 모달... 모두 Context에 넣으면
관련 없는 컴포넌트도 리렌더링 촉발.

**Why it happens:**
"Context로 전역 상태 관리" 패턴을 서브시스템마다 독립적으로 적용.
공유 데이터(코드 테이블 등)는 단일 전역 스토어가 더 적합하지만 설계 없이 진행.

**Consequences:**
- 메인 포탈 대시보드 렌더링 시 전체 Provider 초기화로 초기 로딩 지연
- Context 변경 하나가 연관 없는 서브시스템 컴포넌트까지 리렌더링

**Prevention:**
- 전역 공유 데이터(세션, 코드 테이블, 권한)는 Zustand store 1개로 관리
- 서브시스템 로컬 상태는 컴포넌트 로컬 state 또는 서브시스템 경계 내 Context
- Provider는 앱 전체 최대 5개 이하 (Router, AuthStore, QueryClient, Theme, Toast)

**Detection:**
- `App.tsx` 최상단에 Context Provider가 5개 초과 시
- 코드 테이블 조회 API가 각 서브시스템마다 개별 호출될 때

**Phase:** Phase 0에서 상태 관리 구조 결정. Phase 1에서 코드 테이블 전역 캐시 구현.

---

### Pitfall 7: Vite 빌드 번들 미분할로 초기 로딩 지연

**What goes wrong:**
845개 화면 + 공통 컴포넌트를 단일 번들로 빌드하면 JS 번들이 수 MB 이상.
첫 페이지 로딩 시 전체 코드를 파싱해야 하므로 로그인 화면도 느려짐.

**Why it happens:**
React.lazy + Suspense를 사용하지 않고 정적 import만 사용.
서브시스템별 route 파일을 dynamic import로 분리하지 않음.

**Consequences:**
- 사용자가 접속하지 않는 서브시스템 코드까지 모두 다운로드
- 군 인트라넷 환경에서 네트워크 대역폭 제한 시 치명적

**Prevention:**
```typescript
// routes/index.tsx
const Sys01Overtime = React.lazy(() => import('../systems/sys01'));
const Sys15Security = React.lazy(() => import('../systems/sys15'));

// 각 서브시스템은 별도 청크로 분리됨
```
- 서브시스템 단위로 dynamic import 적용
- Vite `manualChunks` 설정으로 vendor 라이브러리 별도 청크
- 청크 크기 50~200KB 범위 유지

**Detection:**
- Vite 빌드 output에서 단일 청크가 500KB 초과 시
- 정적 `import sys01 from '../systems/sys01'` 패턴 사용 시

**Phase:** Phase 0 라우팅 설계 시 lazy loading 패턴 포함. Phase 2 포탈 완성 후 번들 분석 실행.

---

### Pitfall 8: 테이블 컴포넌트 UX 설계 오류

**What goes wrong:**
관리자 포탈의 데이터 테이블을 지나치게 많은 컬럼으로 구성.
대용량 텍스트 필드(비고, 설명)를 테이블 열에 직접 노출.
페이지네이션, 정렬, 검색 없이 전체 목록을 렌더링.

**Why it happens:**
Mock 데이터 20~30건으로 개발하면 문제 없어 보이지만 실제 수백~수천 건 데이터 시 붕괴.

**Consequences:**
- 대용량 텍스트로 테이블 행 높이 불균일, 가독성 저하
- 서버 없는 Mock 환경에서 전체 데이터 클라이언트 렌더링 시 성능 저하
- 백엔드 연동 후 페이지네이션 API 추가로 테이블 컴포넌트 재설계 필요

**Prevention:**
- 공통 `DataTable` 컴포넌트에 페이지네이션, 정렬, 검색 인터페이스를 Mock 단계부터 포함
- 대용량 텍스트 컬럼은 truncate + 상세보기 모달 패턴
- Mock 데이터는 최소 100건으로 렌더링 테스트

**Detection:**
- `<table>` 에 직접 `data.map()` 하며 페이지네이션 없을 때
- 설명/비고 컬럼이 `max-w` 제한 없이 테이블에 노출될 때

**Phase:** Phase 0 공통 DataTable 컴포넌트 설계 시 포함.

---

## Minor Pitfalls

### Pitfall 9: TypeScript `any` 남용으로 타입 안전성 형해화

**What goes wrong:**
API 응답 타입 불명확 시 `any`로 우선 처리 후 잊혀짐.
18개 시스템 개발 완료 후 수백 개 `any` 타입이 코드베이스에 잔존.
백엔드 연동 시 타입 에러를 컴파일 타임이 아닌 런타임에 발견.

**Prevention:**
- ESLint `@typescript-eslint/no-explicit-any` 규칙 error 레벨 설정
- API 응답에는 `unknown` 사용 후 zod 스키마로 파싱
- 에이전트 프롬프트에 "any 사용 금지, unknown + zod 사용" 명시

**Phase:** Phase 0 ESLint 설정 시 적용.

---

### Pitfall 10: 서브시스템 이름/코드 불일치 혼란

**What goes wrong:**
폴더명: `01_초과근무관리체계`
컴포넌트명: `OvertimeManagement`
라우트: `/overtime`
코드 상수: `SYS_01`
API 경로: `/api/extra-work`

모두 다른 용어로 동일 시스템을 지칭. 에이전트가 컨텍스트를 잃으면 혼란 가중.

**Prevention:**
- Phase 0에서 시스템별 명칭 대응표 작성:
  ```
  | 번호 | 폴더명 | 컴포넌트 prefix | 라우트 base | 상수 |
  | 01 | sys01-overtime | Overtime | /sys01 | SYS01 |
  ```
- 에이전트 컨텍스트에 이 대응표 항상 포함

**Phase:** Phase 0 프로젝트 구조 설계 시.

---

### Pitfall 11: 날짜/시간 포맷 불일치

**What goes wrong:**
서브시스템마다 날짜 표시 형식이 다름: `2024-01-15`, `2024.01.15`, `24년 1월 15일`
Mock 데이터에 ISO 문자열 사용하다가 실제 Java 백엔드가 타임스탬프 반환 시 파싱 에러.

**Prevention:**
- 공통 `formatDate`, `formatDateTime` 유틸 함수 Phase 0에서 정의
- Mock 데이터는 ISO 8601 (`2024-01-15T09:00:00`) 형식 통일
- 한국 행정 표준 날짜 형식 (`yyyy년 MM월 dd일`) 상수화

**Phase:** Phase 0 유틸 함수 설계 시.

---

### Pitfall 12: 단일 개발자 번아웃과 스코프 크리프

**What goes wrong:**
845개 화면을 1명(AI 보조)이 단계적으로 개발하는 구조에서,
각 Phase가 "조금만 더 완성도 높게"가 반복되면 Phase 0이 Phase 0.5, 1.0으로 연장.
초기 Phase가 지연되면 고복잡도 Phase 7(성과관리, 보안일일결산)에 도달하지 못함.

**Prevention:**
- 각 Phase의 완료 기준(Definition of Done)을 "화면 렌더링 + Mock 데이터 표시"로 엄격히 제한
- "완벽한 컴포넌트"보다 "18개 시스템 전체 커버리지" 우선
- Phase 완료 후 품질 개선은 별도 리팩토링 Phase로 분리

**Phase:** 전 Phase 공통. Phase 전환 시 DoD 체크리스트 실행.

---

## Phase-Specific Warnings

| Phase | 해당 시스템 | 주요 위험 | 완화 방법 |
|-------|-----------|---------|---------|
| Phase 0 | 기반 구조 | 공통 컴포넌트 미완성, 라우팅 컨벤션 미확정으로 이후 모든 Phase 오염 | Phase 1 진입 전 컴포넌트 목록 동결, URL 컨벤션 문서화 |
| Phase 1 | 공통 기능 (82개) | 권한 Mock 인터페이스 부실 설계로 Phase 3+ 전체 재수정 | ProtectedRoute 인터페이스 Phase 1에서 확정 |
| Phase 2 | 메인 포탈 | 세션 만료 처리 누락으로 인한 데이터 손실 UX | axios interceptor 기반 세션 만료 전역 처리 |
| Phase 3~5 | 저/중복잡도 서브시스템 | 공통 컴포넌트 무시하고 인라인 구현 | 에이전트 프롬프트에 공통 컴포넌트 목록 주입 |
| Phase 6 | 부대계보, 초과근무 | 복잡한 계층 구조 데이터를 flat Mock으로 설계 | 트리 구조 데이터 타입 사전 설계 |
| Phase 7 | 성과관리, 보안일일결산 | 138개 프로세스 단일 Phase에서 Mock 데이터 설계 폭발 | 서브 Phase로 분할, 에이전트 병렬 실행 |

---

## Sources

- [React Modularizing Applications - Martin Fowler](https://martinfowler.com/articles/modularizing-react-apps.html)
- [React Anti-Patterns - ITNEXT](https://itnext.io/6-common-react-anti-patterns-that-are-hurting-your-code-quality-904b9c32e933)
- [State Management 2025 - Developer Way](https://www.developerway.com/posts/react-state-management-2025)
- [Korean IME KeyboardEvent Error - Junhyunny's Devlogs](https://junhyunny.github.io/react/typescript/korean-keyboard-event-error/)
- [Frontend-only MVP pitfalls - DEV Community](https://dev.to/marie_berezhna/why-its-better-to-develop-frontend-only-after-the-api-is-ready-for-integration-2dej)
- [Vite performance optimization guide](https://vite.dev/guide/performance)
- [React Router lazy loading - Robin Wieruch](https://www.robinwieruch.de/react-router-lazy-loading/)
- [Common Mistakes in React Admin Dashboards - DEV Community](https://dev.to/vaibhavg/common-mistakes-in-react-admin-dashboards-and-how-to-avoid-them-1i70)
- [Your TypeScript Types Are a Lie - Medium](https://medium.com/@thinkingthroughcode/your-typescript-types-are-a-lie-and-youll-find-out-in-production-f0d16d1498b8)
- [React Architecture for Enterprise Application - DEV Community](https://dev.to/nilanth/react-architecture-for-enterprise-application-3pnh)
