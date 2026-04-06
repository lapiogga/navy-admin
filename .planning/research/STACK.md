# Technology Stack

**Project:** 해병대 행정포탈 시스템 (군 행정포탈 React+TS MVP)
**Researched:** 2026-04-05
**Confidence:** MEDIUM-HIGH (versions verified via npm/official docs, architecture patterns via community sources)

---

## Recommended Stack

### Core Framework (결정됨)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 18.x | UI 렌더링 | 팀 결정 사항. Concurrent Features 지원 (Zustand v5 의존) |
| TypeScript | 5.x | 타입 안전성 | 845개 프로세스 규모에서 타입 안전성은 필수 |
| Tailwind CSS | 3.x | 유틸리티 CSS | 팀 결정 사항. 커스텀 군 UI 디자인에 유연 |
| Vite | 5.x | 빌드 도구 | 팀 결정 사항. HMR 속도 우수, 대규모 SPA에 적합 |

### 상태 관리

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | 5.0.x | 클라이언트 UI 상태 | 최신 안정버전(5.0.12). React 18 네이티브 `useSyncExternalStore` 사용. Redux 대비 보일러플레이트 90% 감소. 18개 서브시스템에 독립 store slice 패턴 적용 용이 |
| TanStack Query | 5.x (5.96.x) | 서버/비동기 상태 | Mock API → 실 API 전환 시 코드 변경 최소화. 캐싱, 재시도, 백그라운드 갱신 내장. MVP 단계에서 MSW와 완벽 연동 |

**선택 근거:** Zustand(클라이언트 상태) + TanStack Query(서버 상태)의 역할 분리가 2025년 React 대규모 SPA의 표준 패턴. Redux Toolkit은 이 규모에서 과도한 엔지니어링에 해당하므로 제외.

**제외:** Redux Toolkit — 보일러플레이트가 크고, 18개 서브시스템 각각에 slice 작성 시 유지보수 부담이 과다.

### 라우팅

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Router | 7.x (7.11.x) | 포탈 + 서브시스템 라우팅 | SPA 모드 지원 확정. 팀에 친숙한 API. 중첩 라우트로 포탈 레이아웃 공유 구현. v7에서 타입 안전 강화 |

**선택 근거:** TanStack Router가 타입 안전성 우위이나, React Router v7은 SPA 모드에서 충분하고 학습곡선이 낮음. 845개 프로세스 개발 속도가 타입 안전성 극대화보다 중요.

**라우팅 전략:**
```
/login                          ← 로그인
/portal                         ← 메인 포탈 (Protected)
  /portal/dashboard             ← 18개 서브시스템 링크 대시보드
/common/*                       ← 공통 기능 (결재, 코드, 게시판, 권한)
/system/01-overtime/*           ← 초과근무 서브시스템
/system/02-survey/*             ← 설문 서브시스템
... (18개 서브시스템)
```

**제외:** TanStack Router — 타입 안전성이 우수하나 팀 학습 비용 및 18개 서브시스템 라우트 생성 파일 설정 복잡성이 MVP 속도를 저해.

### UI 컴포넌트 라이브러리

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Ant Design | 5.24.x | 엔터프라이즈 UI 컴포넌트 | 군 행정 포탈에 필요한 Table, Form, Tree, Transfer, DatePicker 등 60+ 컴포넌트 내장. ProComponents (ProTable, ProForm, ProLayout)로 개발 속도 극대화 |

**선택 근거:** shadcn/ui는 유연하지만 데이터 중심 행정 화면(테이블, 복잡한 폼, 트리)을 직접 조합해야 함. Ant Design 5는 행정 시스템에 필요한 컴포넌트가 모두 내장되어 있어 845개 프로세스 개발 속도에서 압도적 우위. Alibaba 내부 행정 도구에서 검증된 패턴.

**Ant Design Pro Components 활용:**
- `@ant-design/pro-table` — 서버사이드 정렬/필터/페이지네이션 내장 테이블
- `@ant-design/pro-form` — 복잡한 행정 폼 레이아웃 단순화
- `@ant-design/pro-layout` — 포탈 사이드바/헤더 레이아웃

**제외:** shadcn/ui — 기초 컴포넌트만 제공, 행정 UI 전용 컴포넌트(DatePicker, Transfer, Cascader) 직접 구현 필요. 845개 프로세스 규모에서 개발 부담 과다.

**제외:** MUI (Material UI) — Material Design 감성이 군 행정 포탈과 미스매치. 커스텀 테마 작업 부담.

### 폼 처리

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Hook Form | 7.x | 폼 상태 관리 | 비제어 컴포넌트 방식으로 50+ 필드 대형 폼에서 재렌더링 최소화. Ant Design과 Controller 패턴으로 연동 |
| Zod | 3.x | 폼 유효성 검사 | TypeScript 타입과 런타임 검증 일치. `@hookform/resolvers/zod`로 RHF와 직접 연동 |

**선택 근거:** 행정 시스템은 대형 폼이 다수(결재선 설정, 초과근무 신청, 성과관리 입력). Formik은 대형 폼에서 렌더링 성능 저하. RHF + Zod 조합이 2025년 표준.

**제외:** Formik — 제어 컴포넌트 방식으로 50+ 필드 폼에서 렌더링 지연 발생.

### 테이블 / 데이터그리드

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Ant Design ProTable | antd 5.x 번들 | 1차 테이블 (행정 목록 화면) | 서버사이드 페이지네이션, 컬럼 정렬/필터, 행 선택 내장. 행정 목록 화면에 최적화 |
| TanStack Table | 8.x | 2차 테이블 (고복잡도 커스텀) | ProTable로 커버 안 되는 복잡한 가상화/중첩 테이블 필요 시 사용. @tanstack/react-virtual 연동으로 1만+ 행 처리 |

**선택 근거:** 대부분의 행정 목록 화면은 ProTable로 처리. 보안일일결산(138개 프로세스), 부대계보(59개) 등 복잡한 데이터 시각화가 필요한 경우에만 TanStack Table 투입.

### Mock API 전략

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| MSW (Mock Service Worker) | 2.12.x | API 모킹 | 네트워크 레벨 인터셉션으로 실제 fetch/axios 코드 변경 없이 Mock→실API 전환. TanStack Query와 완벽 연동. 브라우저 Service Worker 기반으로 실제 HTTP 흐름 시뮬레이션 |
| Faker.js | 9.x | Mock 데이터 생성 | 한국어 로케일 지원. 실제처럼 보이는 군 행정 데이터 생성 |

**Mock 전략:**
```
src/mocks/
  handlers/
    auth.ts          ← 로그인/세션 Mock
    common.ts        ← 공통 기능 Mock
    system-01.ts     ← 초과근무 Mock
    ... (18개 서브시스템)
  browser.ts         ← 브라우저 MSW 설정
  server.ts          ← 테스트용 Node MSW 설정
  data/              ← Faker 생성 데이터
```

**제외:** json-server — 별도 프로세스 실행 필요, 코드와 분리되어 유지보수 어려움.
**제외:** axios-mock-adapter — 라이브러리 의존적, 실 API 전환 시 코드 수정 필요.

### 코드 구성 전략

**결론: 단일 저장소(Monorepo) + Feature-based 폴더 구조**

Module Federation 또는 다중 repo는 이 프로젝트에 과도한 엔지니어링. 18개 서브시스템이 공통 컴포넌트와 인증을 공유하므로 단일 Vite 앱이 최적.

```
src/
  app/
    App.tsx
    router.tsx        ← 전체 라우트 정의
    store.ts          ← Zustand store 진입점
  assets/
  mocks/              ← MSW 핸들러
  shared/
    components/       ← 공통 UI 컴포넌트 (게시판, 테이블, 모달 등)
    hooks/            ← 공통 커스텀 훅
    utils/            ← 유틸리티 함수
    types/            ← 공유 TypeScript 타입
    constants/        ← 공통 상수
  features/
    auth/             ← 로그인/세션
    portal/           ← 메인 포탈 대시보드
    common/           ← 99_공통기능 (시스템관리, 결재, 코드, 게시판, 권한)
    system-01/        ← 초과근무관리체계
    system-02/        ← 설문종합관리체계
    ... (system-03 ~ system-18)
  pages/              ← 라우트 진입점 (얇은 껍데기, 비즈니스 로직은 features에)
```

**각 feature 폴더 구조:**
```
features/system-01/
  components/         ← 서브시스템 전용 컴포넌트
  hooks/              ← 서브시스템 전용 훅
  queries/            ← TanStack Query 쿼리 정의
  store/              ← Zustand slice (필요 시)
  types/              ← 서브시스템 타입
  index.ts            ← 공개 API (barrel export)
```

**제외:** 마이크로 프론트엔드 / Module Federation — 독립 배포 요건 없음, 공통 모듈 공유가 필수적. 복잡성 대비 이점 없음.
**제외:** Turborepo/Nx 모노레포 — 팀 규모와 배포 요건 고려 시 단일 Vite 앱이 충분.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | 3.x | 날짜 처리 | 초과근무 날짜 계산, 일정 관리 전반 |
| `dayjs` | 1.x | Ant Design DatePicker 연동 | Ant Design 5 공식 추천 날짜 라이브러리 |
| `axios` | 1.x | HTTP 클라이언트 | 실 API 연동 단계에서 사용. MSW가 인터셉트 |
| `@tanstack/react-virtual` | 3.x | 대용량 목록 가상화 | 1000+ 행 테이블 성능 최적화 필요 시 |
| `vitest` | 2.x | 단위/통합 테스트 | Vite 기반 테스트 (Jest 대안) |
| `@testing-library/react` | 16.x | 컴포넌트 테스트 | Vitest와 연동 |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| 상태 관리 | Zustand + TanStack Query | Redux Toolkit | 보일러플레이트 과다, 18개 서브시스템에 slice 남발 |
| 상태 관리 | Zustand + TanStack Query | Jotai | 아토믹 모델은 서브시스템 격리에 불리 |
| 라우팅 | React Router v7 | TanStack Router | 학습 비용, 18개 서브시스템 라우트 파일 설정 복잡 |
| UI 라이브러리 | Ant Design 5 | shadcn/ui | 행정 전용 컴포넌트 직접 구현 필요, 속도 저하 |
| UI 라이브러리 | Ant Design 5 | MUI | Material Design 감성, 커스텀 테마 비용 |
| 폼 | React Hook Form | Formik | 대형 폼 렌더링 성능 열위 |
| 테이블 | ProTable (primary) | AG Grid | 유료 라이선스 (Enterprise 기능), 불필요 |
| Mock | MSW | json-server | 별도 프로세스, 실 API 전환 시 코드 변경 필요 |
| 코드 구성 | Monorepo + Feature-based | 마이크로 프론트엔드 | 공통 모듈 공유 요건과 충돌, 복잡성 과다 |

---

## Installation

```bash
# 프로젝트 생성 (결정됨)
npm create vite@latest marine-admin -- --template react-ts
cd marine-admin

# 핵심 의존성
npm install antd @ant-design/pro-components @ant-design/pro-table @ant-design/pro-form @ant-design/pro-layout
npm install zustand @tanstack/react-query
npm install react-router-dom
npm install react-hook-form zod @hookform/resolvers
npm install axios dayjs

# Mock
npm install msw @faker-js/faker

# 가상화 (고복잡도 서브시스템 단계에서)
npm install @tanstack/react-table @tanstack/react-virtual

# 개발 의존성
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D @tanstack/react-query-devtools
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Core Stack (React/TS/Tailwind/Vite) | HIGH | 팀 결정 사항 |
| Zustand 5 | HIGH | npm 버전 5.0.12 확인, 공식 릴리즈 |
| TanStack Query 5 | HIGH | npm 버전 5.96.2 확인 |
| React Router v7 | HIGH | 공식 v7.11.0 확인, SPA 모드 지원 확정 |
| Ant Design 5 | HIGH | v5.24 공식 확인, v6도 존재하나 v5가 더 안정적 |
| React Hook Form + Zod | HIGH | 2025 표준 패턴으로 다수 소스 확인 |
| MSW 2.x | HIGH | npm 버전 2.12.14 확인 |
| Feature-based 폴더 구조 | MEDIUM | 커뮤니티 소스 다수 확인, 공식 가이드 없음 |
| Monorepo 전략 거부 | MEDIUM | 프로젝트 요건 기반 추론, 실제 유사 사례 확인 필요 |

---

## Sources

- [Zustand v5 발표 및 npm 버전](https://github.com/pmndrs/zustand/releases)
- [TanStack Query v5 최신](https://tanstack.com/query/latest)
- [React Router v7 공식 문서](https://reactrouter.com/)
- [Ant Design 공식](https://ant.design/changelog/)
- [TanStack Router vs React Router 비교](https://tanstack.com/router/latest/docs/framework/react/comparison)
- [MSW 공식 문서](https://mswjs.io/)
- [shadcn vs Ant Design 비교 2025](https://www.subframe.com/tips/ant-design-vs-shadcn)
- [React 상태관리 2025 트렌드](https://makersden.io/blog/react-state-management-in-2025)
- [React Hook Form 공식](https://react-hook-form.com/)
- [TanStack Table v8 공식](https://tanstack.com/table/v8)
- [React 폴더 구조 2025 (Robin Wieruch)](https://www.robinwieruch.de/react-folder-structure/)
