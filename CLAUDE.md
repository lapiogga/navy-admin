# 해병대 행정포탈 시스템 (2nd_biz)

## 프로젝트 개요

해병대 행정업무 통합 포탈 시스템. 메인 포탈(00_포탈)과 18개 서브시스템 + 공통모듈로 구성.

## 개발 방침

- **MVP 우선**: 프론트엔드 화면 먼저 → 백엔드(Java) 추후 개발
- **로그인 필수**: 메인 시스템은 인증된 사용자만 접속 가능
- **서브시스템 연동**: 메인 포탈 링크를 통해 각 서브시스템 접속
- **세션 관리**: exit/창닫기 시 메인으로, 세션만료 시 로그인으로 이동

## 운영 규칙

1. **에이전트 구조**: 오케스트레이터(메인) + 팀 에이전트(Phase별) + 서브 에이전트(개별 작업)
2. **팀 에이전트**: 필요에 따라 서브 에이전트를 생성하여 작업 지시 및 감독
3. **GSD 워크플로우**: discuss → plan → execute → verify, 각 단계 완료 후 /compact 실행
4. **의사결정**: Recommended 옵션으로 자동 결정 후 진행 (사용자 확인 불요)
5. **진행 기록**: 각 타스크별 시작시간, 종료시간, 타스크명, 내용을 기록
6. **개발 요건**: `개발 spec.txt` 참조
7. **계획 승인**: 각 Phase 실행 전 계획 수립 → 승인 → 진행

## 기술 스택

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Java (Spring Boot) - 추후 개발
- **Database**: PostgreSQL - 추후 개발
- **Build**: Vite

## 서브시스템 목록 (총 845개 단위 프로세스)

| 번호 | 시스템명 | 기능 수 | 복잡도 |
|------|---------|--------|--------|
| 00 | 메인 포탈 | - | 기반 |
| 01 | 초과근무관리체계 | 99 | 상 |
| 02 | 설문종합관리체계 | 31 | 중 |
| 03 | 성과관리체계 | 76 | 상 |
| 04 | 인증서발급신청체계 | 14 | 하 |
| 05 | 행정규칙포탈체계 | 15 | 하 |
| 06 | 해병대규정관리체계 | 30 | 중 |
| 07 | 군사자료관리체계 | 40 | 중 |
| 08 | 부대계보관리체계 | 59 | 상 |
| 09 | 영현보훈체계 | 35 | 중 |
| 10 | 주말버스예약관리체계 | 44 | 중 |
| 11 | 연구자료종합관리체계 | 19 | 하 |
| 12 | 지시건의사항관리체계 | 32 | 중 |
| 13 | 지식관리체계 | 23 | 하 |
| 14 | 나의 제언 | 16 | 하 |
| 15 | 보안일일결산체계 | 138 | 최상 |
| 16 | 회의실예약관리체계 | 21 | 하 |
| 17 | 검열결과관리체계 | 25 | 중 |
| 18 | 직무기술서관리체계 | 47 | 중 |
| 99 | 공통 기능 | 82 | 상 |

## 개발 진행 방식

### GSD 워크플로우

각 Phase별: **Discuss → Plan → Execute → Verify → Compact**

### 에이전트 구조

- **오케스트레이터**: 전체 진행 관장, 의사결정
- **팀 에이전트**: Phase별 담당, 서브에이전트 생성/감독
- **서브 에이전트**: 개별 컴포넌트/화면 개발

### 의사결정 원칙

의사결정 필요 시 recommender 기반 자동 결정 후 진행
각각의 워크플로우가 완료가 되면 "/compact"를 한 후, 자동으로 다음 워크플로우로 실행

## 개발 순서 (Phase)

### Phase 0: 프로젝트 기반 구축
- React+TS+Vite 프로젝트 초기화
- 공통 레이아웃, 라우팅, 인증 Mock
- 공통 컴포넌트 라이브러리 (게시판, 테이블, 폼, 모달 등)

### Phase 1: 공통 기능 (99_공통기능, 82개)
- 시스템관리 (체계담당자, 메뉴관리, 메시지관리, 로그조회)
- 결재관리 (결재선 CRUD)
- 코드관리 (코드그룹/코드 CRUD)
- 공통게시판 (설정, 게시글, 카테고리, 관리자, 사용자, 부대)
- 권한관리 (권한그룹, 메뉴별/그룹별 권한, 사용자 배정)

### Phase 2: 메인 포탈 (00_포탈)
- 로그인/로그아웃 화면
- 메인 대시보드 (서브시스템 링크)
- 세션 관리 Mock

### Phase 3: 저복잡도 서브시스템 (5개, 85개 기능)
- 04_인증서발급신청체계 (14)
- 05_행정규칙포탈체계 (15)
- 14_나의 제언 (16)
- 11_연구자료종합관리체계 (19)
- 16_회의실예약관리체계 (21)

### Phase 4: 중복잡도 서브시스템 A (6개, 176개 기능)
- 13_지식관리체계 (23)
- 17_검열결과관리체계 (25)
- 06_해병대규정관리체계 (30)
- 02_설문종합관리체계 (31)
- 12_지시건의사항관리체계 (32)
- 09_영현보훈체계 (35)

### Phase 5: 중복잡도 서브시스템 B (3개, 131개 기능)
- 07_군사자료관리체계 (40)
- 10_주말버스예약관리체계 (44)
- 18_직무기술서관리체계 (47)

### Phase 6: 고복잡도 서브시스템 (2개, 158개 기능)
- 08_부대계보관리체계 (59)
- 01_초과근무관리체계 (99)

### Phase 7: 최고복잡도 서브시스템 (2개, 214개 기능)
- 03_성과관리체계 (76)
- 15_보안일일결산체계 (138)

## 진행 기록

| 시작시간 | 종료시간 | Phase | 타스크명 | 내용 | 상태 |
|---------|---------|-------|---------|------|------|
| 2026-04-05 00:56 | 2026-04-05 01:15 | - | GSD 초기화 | config.json, PROJECT.md 생성 | 완료 |
| 2026-04-05 01:15 | 2026-04-05 01:25 | - | 도메인 리서치 | Stack/Features/Architecture/Pitfalls 4개 병렬 연구 | 완료 |
| 2026-04-05 01:25 | 2026-04-05 01:30 | - | 리서치 종합 | SUMMARY.md 작성 | 완료 |
| 2026-04-05 01:30 | 2026-04-05 01:35 | - | 요구사항 정의 | REQUIREMENTS.md (209개 요구사항, 845개 프로세스) | 완료 |
| 2026-04-05 01:35 | 2026-04-05 01:40 | - | 로드맵 생성 | ROADMAP.md (8 Phase), STATE.md | 완료 |
| 2026-04-05 01:40 | 2026-04-05 01:45 | 0 | Phase 0 Context | 24개 구현 결정 수집 (FSD/URL/테마/MSW/상태관리/라우팅/IME) | 완료 |
| 2026-04-05 01:50 | 2026-04-05 02:15 | 0 | Phase 0 Plan | Research→Plan(3 plans, 3 waves)→Verify(2회) 완료 | 완료 |
| 2026-04-05 11:44 | 2026-04-05 12:46 | 0 | Phase 0 검증/개선 | 빌드에러, 크로스탭 로그아웃, 메뉴구조, 네비게이션 수정 | 완료 |
| 2026-04-05 13:00 | 2026-04-05 14:31 | 1 | Phase 1 Plan | Research→Plan(4)→UI-SPEC→Replan→Verify PASSED | 완료 |
| 2026-04-05 19:00 | 2026-04-05 20:30 | 1 | Phase 1 Execute | 4 Wave 순차 실행, 66 tests PASSED, VERIFICATION 5/5 | 완료 |
| 2026-04-05 20:30 | 2026-04-05 20:45 | 2 | Phase 2 Discuss | 4개 gray area (대시보드/세션/전환/브랜딩), 12 decisions | 완료 |
| 2026-04-05 20:45 | 2026-04-05 21:15 | 2 | Phase 2 UI-SPEC | UI Design Contract 생성→검증→수정→재검증 APPROVED | 완료 |
| 2026-04-05 21:15 | 2026-04-05 22:00 | 2 | Phase 2 Plan | Research→Plan(2)→Verify→Revision→Re-verify PASSED | 완료 |
| 2026-04-05 22:00 | 2026-04-05 23:00 | 2 | Phase 2 Execute | Wave 1 병렬(02-01, 02-02), 98 tests PASSED | 완료 |
| 2026-04-05 23:00 | 2026-04-05 23:20 | 2 | Phase 2 Verify | Verifier 11/11 passed, Phase 완료 | 완료 |
| 2026-04-06 01:25 | 2026-04-06 01:42 | 3 | Phase 3 Execute | 5 plans 병렬(03-01~05), 152 new tests, 250/250 총 | 완료 |
| 2026-04-06 01:42 | 2026-04-06 01:50 | 3 | Phase 3 Verify | Verifier 5/5 passed, REQUIREMENTS gap fix | 완료 |

## 재개 방법 (Resume Instructions)

**다음 세션에서 실행할 명령:**
```
/gsd:discuss-phase 4 --auto
```
**주의:** 사용자가 자동 실행을 요청함. 의견을 묻지 않고 자동 진행할 것.

**현재 상태:**
- Phase 0: 실행 완료 (프로젝트 기반, 공통 컴포넌트)
- Phase 1: **실행 완료** + 검증 통과 (공통 기능 82개 프로세스)
- Phase 2: **실행 완료** + 검증 통과 (메인 포탈)
- Phase 3: **실행 완료** + 검증 통과 (저복잡도 서브시스템 5개, 250 tests)
- Phase 4: **대기** (중복잡도 서브시스템 A 6개, 176개 프로세스)

**산출물 위치:**
- `.planning/phases/01-99/01-VERIFICATION.md` — Phase 1 검증 리포트
- `.planning/phases/02-00/02-VERIFICATION.md` — Phase 2 검증 리포트
- `.planning/phases/03-5/03-VERIFICATION.md` — Phase 3 검증 리포트
- `.planning/phases/03-5/03-01-SUMMARY.md` ~ `03-05-SUMMARY.md` — 실행 결과 5개

**GitHub:** https://github.com/lapiogga/navy-admin.git (master branch)

## 참조 문서

- `개발 spec.txt`: 시스템 개발 요건 명세
- `req_func/*.xls`: 서브시스템별 기능 요구사항
- `req_analysis.txt`: XLS 추출 요구사항 (텍스트)
- `WORK-LOG.md`: 모든 작업의 시계열 기록 (시작/종료/Duration/작업명/내용)
- `TERMINAL-LOG.md`: 터미널 출력 결과 전체 기록

<!-- GSD:project-start source:PROJECT.md -->
## Project

**해병대 행정포탈 시스템**

해병대 행정업무를 통합 관리하는 포탈 시스템. 메인 포탈(00_포탈)을 통해 로그인한 사용자가 18개 서브시스템에 접속하여 초과근무, 설문, 성과, 인증서, 규정, 보안 등 행정업무를 처리한다. 총 845개 단위 프로세스를 포함하며, MVP 전략으로 프론트엔드 화면을 우선 개발한다.

**Core Value:** 인증된 사용자가 메인 포탈에서 모든 행정 서브시스템에 원활하게 접속하여 업무를 처리할 수 있어야 한다.

### Constraints

- **Tech Stack**: React + TypeScript + Tailwind CSS + Vite (Frontend)
- **Backend**: Java (Spring Boot) -- 추후 개발
- **MVP**: 프론트엔드 화면 우선, 백엔드 추후
- **Authentication**: Mock 인증 사용 (실 인증 추후)
- **Navigation**: 메인 포탈 경유 필수, 직접 서브시스템 접근 불가
- **Session**: exit/창닫기 -> 메인으로, 세션만료 -> 로그인으로
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
### 라우팅
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Router | 7.x (7.11.x) | 포탈 + 서브시스템 라우팅 | SPA 모드 지원 확정. 팀에 친숙한 API. 중첩 라우트로 포탈 레이아웃 공유 구현. v7에서 타입 안전 강화 |
### UI 컴포넌트 라이브러리
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Ant Design | 5.24.x | 엔터프라이즈 UI 컴포넌트 | 군 행정 포탈에 필요한 Table, Form, Tree, Transfer, DatePicker 등 60+ 컴포넌트 내장. ProComponents (ProTable, ProForm, ProLayout)로 개발 속도 극대화 |
- `@ant-design/pro-table` — 서버사이드 정렬/필터/페이지네이션 내장 테이블
- `@ant-design/pro-form` — 복잡한 행정 폼 레이아웃 단순화
- `@ant-design/pro-layout` — 포탈 사이드바/헤더 레이아웃
### 폼 처리
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Hook Form | 7.x | 폼 상태 관리 | 비제어 컴포넌트 방식으로 50+ 필드 대형 폼에서 재렌더링 최소화. Ant Design과 Controller 패턴으로 연동 |
| Zod | 3.x | 폼 유효성 검사 | TypeScript 타입과 런타임 검증 일치. `@hookform/resolvers/zod`로 RHF와 직접 연동 |
### 테이블 / 데이터그리드
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Ant Design ProTable | antd 5.x 번들 | 1차 테이블 (행정 목록 화면) | 서버사이드 페이지네이션, 컬럼 정렬/필터, 행 선택 내장. 행정 목록 화면에 최적화 |
| TanStack Table | 8.x | 2차 테이블 (고복잡도 커스텀) | ProTable로 커버 안 되는 복잡한 가상화/중첩 테이블 필요 시 사용. @tanstack/react-virtual 연동으로 1만+ 행 처리 |
### Mock API 전략
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| MSW (Mock Service Worker) | 2.12.x | API 모킹 | 네트워크 레벨 인터셉션으로 실제 fetch/axios 코드 변경 없이 Mock→실API 전환. TanStack Query와 완벽 연동. 브라우저 Service Worker 기반으로 실제 HTTP 흐름 시뮬레이션 |
| Faker.js | 9.x | Mock 데이터 생성 | 한국어 로케일 지원. 실제처럼 보이는 군 행정 데이터 생성 |
### 코드 구성 전략
## Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | 3.x | 날짜 처리 | 초과근무 날짜 계산, 일정 관리 전반 |
| `dayjs` | 1.x | Ant Design DatePicker 연동 | Ant Design 5 공식 추천 날짜 라이브러리 |
| `axios` | 1.x | HTTP 클라이언트 | 실 API 연동 단계에서 사용. MSW가 인터셉트 |
| `@tanstack/react-virtual` | 3.x | 대용량 목록 가상화 | 1000+ 행 테이블 성능 최적화 필요 시 |
| `vitest` | 2.x | 단위/통합 테스트 | Vite 기반 테스트 (Jest 대안) |
| `@testing-library/react` | 16.x | 컴포넌트 테스트 | Vitest와 연동 |
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
## Installation
# 프로젝트 생성 (결정됨)
# 핵심 의존성
# Mock
# 가상화 (고복잡도 서브시스템 단계에서)
# 개발 의존성
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
