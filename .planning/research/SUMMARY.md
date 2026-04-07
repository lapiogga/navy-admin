# Project Research Summary

**Project:** 해병대 행정포탈 시스템 (2nd_biz)
**Domain:** 대규모 군 행정 포탈 (18개 서브시스템, 845 단위 프로세스)
**Researched:** 2026-04-05
**Confidence:** HIGH (스택 공식 버전 확인, 요구사항 문서 직접 분석, 아키텍처 패턴 다수 소스 검증)

---

## Executive Summary

이 프로젝트는 18개 서브시스템(845개 단위 프로세스)을 단일 React SPA로 구현하는 대규모 군 행정 포탈이다. 백엔드(Java)는 추후 개발 예정이므로 프론트엔드 화면과 MSW 기반 Mock API를 먼저 완성하는 "화면 우선" MVP 전략을 취한다. 핵심 과제는 18개 서브시스템이 공통 컴포넌트를 재사용하면서도 도메인별로 독립 유지하는 구조 설계다.

권장 접근법은 Feature-Sliced Design(FSD) 아키텍처 + Ant Design 5 ProComponents 조합이다. FSD의 엄격한 레이어 의존성 규칙(`app → pages → widgets → features → entities → shared`)이 18개 서브시스템 간 코드 오염을 방지하고, Ant Design ProTable/ProForm이 행정 데이터 화면(테이블, 복잡한 폼, 트리) 개발 속도를 극대화한다. 상태 관리는 Zustand(클라이언트) + TanStack Query(서버 상태)로 역할을 분리하며, MSW가 네트워크 레벨 Mock으로 실 API 전환 시 코드 변경을 최소화한다.

가장 큰 리스크는 **Phase 0에서 공통 기반을 완성하지 않고 서브시스템 개발로 진입하는 것**이다. 공통 컴포넌트, URL 컨벤션, 권한 인터페이스, API 타입 스키마를 Phase 0에서 동결하지 않으면 이후 845개 화면 전체에 소급 수정이 발생한다. Phase 0의 완성도가 전체 프로젝트의 속도를 결정한다.

---

## Key Findings

### Recommended Stack

팀이 결정한 React 18 + TypeScript 5 + Tailwind CSS 3 + Vite 5 기반 위에, 상태 관리는 Zustand 5(클라이언트) + TanStack Query 5(서버), 라우팅은 React Router v7, UI는 Ant Design 5 ProComponents를 추가한다. 폼 처리는 React Hook Form 7 + Zod 3 조합, Mock은 MSW 2.x + Faker.js 9.x다. 코드 구성은 단일 Vite 앱 + Feature-Sliced Design 구조로 마이크로프론트엔드나 Turborepo는 명시적으로 제외한다.

**Core technologies:**
- React 18 + TypeScript 5: UI 렌더링 + 타입 안전성 — 845개 프로세스 규모에서 타입 에러 조기 발견 필수
- Zustand 5 + TanStack Query 5: 상태 관리 분리 — Zustand(세션/권한), TanStack Query(목록/상세 서버 데이터)로 역할 명확히 분리
- Ant Design 5 ProComponents: 엔터프라이즈 UI — ProTable/ProForm/ProLayout으로 행정 화면 개발 속도 극대화
- React Router v7: 라우팅 — SPA 모드 + 중첩 라우트로 포탈 레이아웃 공유
- MSW 2.x: Mock API — 네트워크 레벨 인터셉션으로 실 API 전환 시 비즈니스 로직 코드 무수정
- React Hook Form 7 + Zod 3: 폼 처리 — 50+ 필드 대형 행정 폼에서 렌더링 성능 유지

**버전 확정:**
- Zustand 5.0.12, TanStack Query 5.96.x, React Router 7.11.x, Ant Design 5.24.x, MSW 2.12.x

### Expected Features

**Must have (table stakes):**
- 로그인/로그아웃 + 세션 만료 처리 — 군 행정시스템 접근 통제 필수
- 메인 포탈 대시보드 (18개 서브시스템 링크) — 포탈의 핵심 진입점
- 공통 CRUD 컴포넌트 (목록/상세/등록/수정/삭제) — 845개 프로세스의 80% 이상이 이 패턴 반복
- 결재 워크플로우 (결재선 CRUD, 승인/반려) — 다수 서브시스템에 공통 패턴
- 권한관리 RBAC (권한그룹, 메뉴별 권한, 사용자/부대 배정) — 모든 서브시스템의 접근 통제 기반
- 공통 게시판 (공지사항, 질의응답, 첨부파일) — 18개 서브시스템 전부 포함
- 시스템 관리 (메뉴관리, 코드관리, 접속로그) — 운영 필수
- 엑셀 다운로드 — 거의 모든 목록 화면 포함, 군 행정 보고 필수

**Should have (differentiators):**
- 결재 진행 상태 타임라인 시각화 — 기안자 추적 UX 개선
- KPI 차트 위젯 (03_성과관리) — 업무 달성률 직관적 파악
- 캘린더 UI (01_초과근무, 16_회의실예약) — 일별/시간대별 데이터 입력 UX
- 부대계보 트리 뷰 (08_부대계보) — 계층 구조 직관적 표현
- 결재 대기 알림 배지 — 처리 항목 즉각 인지
- 최근 접속 서브시스템 — 자주 사용하는 시스템 빠른 접근

**Defer (v2+):**
- 모바일 반응형 레이아웃 — 데스크톱 전용 시스템, 스코프 외
- 실시간 알림 (WebSocket/SSE) — 백엔드 없는 MVP에서 불가
- 실제 파일 업로드/다운로드 처리 — 백엔드 연동 후 구현
- 엑셀 일괄 업로드 — 파싱 로직 복잡, 백엔드 의존
- 실제 결재 이메일/SMS 발송 — 백엔드 의존

### Architecture Approach

Feature-Sliced Design(FSD) 레이어 구조를 채택한다. `app/pages/widgets/features/entities/shared` 6계층으로 코드를 분리하며 상위 레이어만 하위 레이어를 import할 수 있는 단방향 의존성을 엄격히 적용한다. 18개 서브시스템은 `pages/` 슬라이스로 분리되고, 공통 기능(결재, 게시판, 권한)은 `widgets/`와 `features/`에 위치한다. React.lazy + Suspense로 서브시스템별 코드 분할을 적용하여 초기 번들을 login + portal 수준으로 제한한다.

**Major components:**
1. `shared/` (원자 UI + API 클라이언트 + 유틸) — 모든 레이어의 의존 기반, 도메인 무관
2. `widgets/bulletin-board`, `widgets/approval-flow`, `widgets/session-guard` — 여러 서브시스템에서 설정 기반으로 재사용되는 복합 UI 블록
3. `features/auth`, `features/permission`, `features/approval` — 사용자 인터랙션 단위 비즈니스 로직
4. `pages/system-*` (18개 서브시스템) — FSD 슬라이스로 도메인별 격리, React.lazy 적용
5. `AuthStore` + `PermissionStore` (Zustand) — 세션/권한 전역 상태, SessionGuard가 1분 간격 만료 체크

### Critical Pitfalls

1. **공통 컴포넌트 없이 서브시스템별 독립 개발** — Phase 0에서 `shared/ui` 컴포넌트 라이브러리 동결 후 Phase 1 진입. 에이전트 프롬프트에 "공통 컴포넌트 목록 참조 필수" 규칙 포함.

2. **Mock 데이터 구조와 실제 API 계약 불일치** — Phase 0에서 핵심 엔티티 DTO 스키마 초안 작성. `shared/types/api/`에 모든 API 응답 타입 중앙 관리, Mock도 동일 타입 사용.

3. **라우팅 컨벤션 미확정** — Phase 0에서 `/sys{번호}/{feature}/{action}` 패턴 확정 및 문서화. `routes/index.ts`에 전체 경로 상수 테이블 관리.

4. **권한 Mock 인터페이스 부실 설계** — Phase 0에서 `ProtectedRoute` + `usePermission` 인터페이스 먼저 설계 (Mock 단계에서는 항상 true 반환하되 인터페이스는 실제와 동일).

5. **스코프 크리프로 인한 Phase 0 연장** — 각 Phase의 DoD를 "화면 렌더링 + Mock 데이터 표시"로 엄격 제한. 완성도 개선은 별도 리팩토링 Phase로 분리.

---

## Implications for Roadmap

### Phase 0: 프로젝트 기반 구축
**Rationale:** 이후 모든 Phase의 품질과 속도를 결정한다. 공통 컴포넌트, URL 컨벤션, 권한 인터페이스, API 타입 스키마를 이 단계에서 동결해야 845개 화면 전체에 소급 수정이 발생하지 않는다.
**Delivers:** React+TS+Vite 프로젝트 초기화, FSD 폴더 구조, Ant Design 테마 설정, 공통 컴포넌트 라이브러리(DataTable/Form/Modal/Button 등), MSW 기반 Mock 클라이언트, 라우팅 컨벤션 문서, 핵심 API 타입 스키마 초안
**Addresses:** 공통 CRUD 컴포넌트 (table stakes), 엑셀 다운로드 인터페이스
**Avoids:** Pitfall 1(공통 컴포넌트 부재), Pitfall 3(URL 혼란), Pitfall 2(API 타입 불일치 일부), Pitfall 7(lazy loading 미설계), Pitfall 9(any 남용), Pitfall 10(명칭 불일치), Pitfall 11(날짜 포맷 불일치)
**Research Flag:** 표준 패턴 (skip research-phase). Vite + FSD 구성은 문서화 충분.

### Phase 1: 공통 기능 (99_공통기능, 82개 프로세스)
**Rationale:** 권한관리, 결재선, 코드관리, 공통게시판은 모든 서브시스템의 전제 조건이다. Phase 1 완료 전에 서브시스템 개발을 시작하면 권한/게시판 컴포넌트를 각 서브시스템이 중복 구현하게 된다.
**Delivers:** 권한그룹 CRUD + 메뉴별/사용자별 권한 배정, 결재선 CRUD, 코드/코드그룹 관리, 공통게시판 위젯(설정 기반), 시스템관리(체계담당자, 메뉴관리, 메시지관리, 접속로그)
**Implements:** `widgets/bulletin-board`, `widgets/approval-flow`, `features/permission`, `features/code-management`
**Avoids:** Pitfall 4(권한 인터페이스 부실 - Phase 1에서 실제 구현 완성)
**Research Flag:** 표준 패턴 (skip research-phase). RBAC + 게시판은 확립된 패턴.

### Phase 2: 메인 포탈 (00_포탈)
**Rationale:** 공통 기능이 완성된 후 포탈 대시보드를 완성한다. 이 단계에서 로그인 → 포탈 → 서브시스템 접근 전체 플로우가 Mock으로 완전 동작해야 한다.
**Delivers:** 로그인/로그아웃 화면, 메인 대시보드(18개 서브시스템 링크), 세션 만료 처리(SessionGuard), 권한 기반 서브시스템 표시
**Implements:** `AuthStore`, `PermissionStore`, `PortalLayout`, `RequireAuth`, `SessionGuard`
**Avoids:** Pitfall 2(Phase 2에서 세션 만료 처리 누락 경고)
**Research Flag:** 표준 패턴 (skip research-phase).

### Phase 3: 저복잡도 서브시스템 (5개, 85개 프로세스)
대상: 04_인증서발급신청(14), 05_행정규칙포탈(15), 14_나의제언(16), 11_연구자료종합관리(19), 16_회의실예약관리(21)
**Rationale:** 복잡도가 낮은 시스템으로 공통 컴포넌트 재사용 패턴을 검증한다. 회의실예약은 캘린더 UI가 differentiator이나 우선 기본 목록 화면으로 구현.
**Delivers:** 5개 서브시스템 완전 동작 화면, 공통 컴포넌트 재사용 패턴 확립
**Avoids:** Pitfall 1(공통 컴포넌트 무시 인라인 구현) — 에이전트 프롬프트에 공통 컴포넌트 목록 주입 필수
**Research Flag:** 표준 패턴 (skip research-phase).

### Phase 4: 중복잡도 서브시스템 A (6개, 176개 프로세스)
대상: 13_지식관리(23), 17_검열결과관리(25), 06_해병대규정관리(30), 02_설문종합관리(31), 12_지시건의사항관리(32), 09_영현보훈(35)
**Rationale:** 결재 워크플로우, 설문 문항 구조 등 복합 패턴이 처음 등장한다.
**Delivers:** 6개 서브시스템 완전 동작 화면, 결재 워크플로우 재사용 검증
**Research Flag:** 설문 문항 복합 구조 (설문종합관리)는 데이터 모델 설계 시 추가 검토 필요.

### Phase 5: 중복잡도 서브시스템 B (3개, 131개 프로세스)
대상: 07_군사자료관리(40), 10_주말버스예약관리(44), 18_직무기술서관리(47)
**Rationale:** 버스 예약 시간 슬롯, 직무기술서 계층 구조 등 특수 데이터 패턴 등장.
**Delivers:** 3개 서브시스템 완전 동작 화면
**Research Flag:** 버스 예약 시간 슬롯 UI는 캘린더 컴포넌트 선택 시 추가 연구 필요.

### Phase 6: 고복잡도 서브시스템 (2개, 158개 프로세스)
대상: 08_부대계보관리(59), 01_초과근무관리(99)
**Rationale:** 트리 렌더링(부대계보)과 캘린더 기반 근무시간 입력(초과근무)이라는 신규 컴포넌트가 필요한 첫 단계. 이전 Phase들에서 공통 컴포넌트 기반이 충분히 검증된 후 진입.
**Delivers:** 부대계보 트리 뷰, 초과근무 캘린더 입력, 일괄 결재 처리
**Avoids:** Pitfall 6(Phase 6에서 계층 구조 데이터를 flat Mock으로 설계 금지)
**Research Flag:** 트리 렌더링 라이브러리(Ant Design Tree vs rc-tree) 선택 연구 필요. 초과근무 일괄 결재 패턴 추가 설계 필요.

### Phase 7: 최고복잡도 서브시스템 (2개, 214개 프로세스)
대상: 03_성과관리(76), 15_보안일일결산(138)
**Rationale:** 가장 많은 화면 수와 복잡한 데이터 구조. 보안일일결산(138개)은 서브 Phase 분할 필요.
**Delivers:** 성과관리 KPI 차트, 보안일일결산 복합 워크플로우
**Avoids:** Pitfall 12(스코프 크리프) — 138개 프로세스는 서브 Phase로 분할하여 에이전트 병렬 실행
**Research Flag:** Chart.js vs Recharts 선택 연구 필요. 보안일일결산 복합 워크플로우 사전 상세 분석 필요.

### Phase Ordering Rationale

- **Phase 0 → 1 의존성**: 공통 컴포넌트 없이는 Phase 1 공통기능 개발 불가
- **Phase 1 → 2 의존성**: 권한관리 없이 포탈 대시보드의 권한 기반 서브시스템 표시 불가
- **Phase 2 → 3 의존성**: 로그인/세션 흐름이 완성되어야 서브시스템 개발 의미 있음
- **복잡도 순 Phase 3~7**: 낮은 복잡도에서 공통 컴포넌트 재사용 패턴을 검증하고 고복잡도로 진입
- **FSD 레이어 빌드 순서**: `shared` → `entities` → `features` → `widgets` → `pages` 순으로 하위 레이어 먼저 완성

### Research Flags

**추가 연구 필요한 Phase:**
- **Phase 6:** 트리 렌더링 라이브러리 선택 (Ant Design Tree 기본 제공이나 대용량 데이터 시 rc-tree 또는 가상화 필요), 일괄 결재 UX 패턴
- **Phase 7:** 차트 라이브러리 선택 (Recharts vs Chart.js vs Ant Design Charts), 보안일일결산 138개 프로세스 상세 요구사항 사전 분석

**표준 패턴으로 연구 생략 가능한 Phase:**
- **Phase 0:** Vite + FSD + Ant Design 설정은 충분히 문서화됨
- **Phase 1:** RBAC + 게시판 + 코드관리는 확립된 행정 시스템 패턴
- **Phase 2:** 로그인 + 세션 관리 패턴은 표준
- **Phase 3~5:** 공통 컴포넌트 조합으로 구현, 별도 연구 불필요

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | 모든 핵심 라이브러리 npm 버전 직접 확인. React Router v7 SPA 모드 공식 확인. |
| Features | HIGH | 요구사항 문서(req_analysis.txt, 개발 spec.txt) 직접 분석. 기능 목록 출처 명확. |
| Architecture | HIGH | FSD 공식 문서 + 다수 커뮤니티 소스 교차 검증. 빌드 순서 의존성 논리적 확인. |
| Pitfalls | MEDIUM | 커뮤니티 소스 + 도메인 전문 지식 기반. 군 행정 포탈 특화 사례는 공식 문서 없음. |

**Overall confidence:** HIGH

### Gaps to Address

- **Ant Design v5 vs v6 선택**: STACK.md에서 v5가 더 안정적이라 했으나 v6 존재 확인됨. 실제 ProComponents v6 호환성 검증 필요 (Phase 0 초기에 확인).
- **군 인트라넷 환경 제약**: 네트워크 대역폭, 브라우저 버전(IE 지원 여부) 미확인. 빌드 최적화 목표값 재조정 필요할 수 있음.
- **보안일일결산(138개) 세부 요구사항**: 단일 Phase로는 과대하여 내부 서브 Phase 경계 설정이 추후 필요.
- **Mock DTO 스키마 정합성**: Java 백엔드 팀과 API 계약이 없는 상태에서 Mock 타입이 얼마나 실제와 근접한지는 백엔드 설계 시점에 재검증 필요.

---

## Sources

### Primary (HIGH confidence)
- `C:/Users/User/2nd_biz/req_analysis.txt` — 845개 단위 프로세스 기능 목록 직접 분석
- `C:/Users/User/2nd_biz/개발 spec.txt` — 시스템 개발 요건 명세
- [Zustand v5 npm](https://www.npmjs.com/package/zustand) — v5.0.12 버전 확인
- [TanStack Query v5](https://tanstack.com/query/latest) — v5.96.x 확인
- [React Router v7 공식](https://reactrouter.com/) — v7.11.0 SPA 모드 확인
- [Ant Design v5 공식](https://ant.design/) — v5.24 확인
- [MSW 공식](https://mswjs.io/) — v2.12.x 확인
- [Feature-Sliced Design 공식](https://feature-sliced.design/) — 아키텍처 레이어 규칙

### Secondary (MEDIUM confidence)
- [Korean IME KeyboardEvent - Junhyunny's Devlogs](https://junhyunny.github.io/react/typescript/korean-keyboard-event-error/) — IME isComposing 패턴
- [React 상태관리 2025 트렌드](https://makersden.io/blog/react-state-management-in-2025) — Zustand vs Redux 비교
- [Vite Code Splitting](https://sambitsahoo.com/blog/vite-code-splitting-that-works.html) — manualChunks 전략
- [shadcn vs Ant Design 비교 2025](https://www.subframe.com/tips/ant-design-vs-shadcn) — UI 라이브러리 선택 근거
- [Korea eGovFrame](https://www.egovframe.go.kr/) — 한국 정부 표준 프레임워크 패턴

### Tertiary (LOW confidence)
- [DoD Administrative System Access Control](https://www.esd.whs.mil/) — 군 행정 시스템 접근 통제 패턴 (참고용)
- [Enterprise UI Design Best Practices 2024](https://www.softkraft.co/enterprise-ui-design/) — 엔터프라이즈 UI 패턴 일반론

---

*Research completed: 2026-04-05*
*Ready for roadmap: yes*

---

## GAP 수정 반영 (2026-04-07)

### 프로젝트 최종 상태 업데이트

리서치 단계에서 수립한 아키텍처/기능/스택 결정은 모두 유효하다. GAP 분석(req_spec vs 구현 비교)에 따라 공통 컴포넌트가 강화되었으며, 이는 초기 리서치의 "공통 컴포넌트 재사용 극대화" 전략을 실증적으로 검증한 결과이다.

### 리서치 예측 vs 실제 결과

| 리서치 예측 | 실제 결과 | 평가 |
|------------|----------|------|
| FSD shared 레이어로 공통 UI 재사용 | DataTable/SearchForm/CrudForm이 18개 서브시스템에서 100% 재사용 | 적중 |
| ProTable/ProForm으로 행정 화면 개발 가속 | CrudForm이 ProForm 래퍼로 동작, 필드 타입 3종 추가 확장 | 적중 |
| MSW Mock API로 프론트엔드 독립 개발 | 845개 프로세스 전체 Mock API 연동 완료 | 적중 |
| Ant Design 5 테마 커스터마이징 | 군청색(#003366) 테이블 보더 CSS로 군 행정 브랜딩 강화 | 적중 (CSS 추가) |
| 군 도메인 특수 요구사항 | military.ts 헬퍼(군번/계급/성명) 신규 생성 필요 | 추가 발견 |

### GAP 규칙 6개 요약

1. R1: 입력값 컬럼 반영 (CrudForm 필드 확장)
2. R2: 검색영역 100px 고정 (SearchForm wrapper)
3. R3: 규칙/예외사항 UI 구현 (각 서브시스템별)
4. R4: 관리자 메뉴 포함 (18개 서브시스템)
5. R5: 테이블 군청색 보더 (DataTable CSS)
6. R6: 군번/계급/성명 3항목 표시 (military.ts 헬퍼)

### 문서 현행화 범위

- Phase 0~2 planning 문서: GAP 수정 영향 사항 추가
- Research ARCHITECTURE/FEATURES/SUMMARY: 아키텍처 패턴 및 표준 기능 업데이트
- spec-doc 5종: 전면 재생성 완료

*GAP 수정 반영: 2026-04-07*
