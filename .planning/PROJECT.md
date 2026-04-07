# 해병대 행정포탈 시스템

## What This Is

해병대 행정업무를 통합 관리하는 포탈 시스템. 메인 포탈(00_포탈)을 통해 로그인한 사용자가 18개 서브시스템에 접속하여 초과근무, 설문, 성과, 인증서, 규정, 보안 등 행정업무를 처리한다. 총 845개 단위 프로세스를 포함하며, MVP 전략으로 프론트엔드 화면을 우선 개발한다.

## Core Value

인증된 사용자가 메인 포탈에서 모든 행정 서브시스템에 원활하게 접속하여 업무를 처리할 수 있어야 한다.

## Requirements

### Validated

- [x] 공통 기능 모듈 (시스템관리, 결재관리, 코드관리, 게시판, 권한관리) 82개 프로세스 — Validated in Phase 1
- [x] 메인 포탈 로그인/로그아웃 및 세션 관리 — Validated in Phase 2
- [x] 메인 대시보드에서 18개 서브시스템 링크 접속 — Validated in Phase 2
- [x] 서브시스템 exit/창닫기 시 메인 포탈로 이동 — Validated in Phase 2
- [x] 세션 만료 시 로그인 화면으로 이동 — Validated in Phase 2

### Active

- [x] 저복잡도 서브시스템 5개 (인증서, 행정규칙, 나의제언, 연구자료, 회의실) 85개 프로세스 — Validated in Phase 3, GAP Fixed in Phase 8
- [x] 중복잡도 서브시스템 A 6개 (지식, 검열, 규정, 설문, 지시건의, 영현보훈) 176개 프로세스 — Validated in Phase 4, GAP Fixed in Phase 8
- [x] 중복잡도 서브시스템 B 3개 (군사자료, 주말버스, 직무기술서) 131개 프로세스 — Validated in Phase 5, GAP Fixed in Phase 8
- [x] 고복잡도 서브시스템 2개 (부대계보, 초과근무) 158개 프로세스 — Validated in Phase 6, GAP Fixed in Phase 8
- [x] 최고복잡도 서브시스템 2개 (성과관리, 보안일일결산) 214개 프로세스 — Validated in Phase 7, GAP Fixed in Phase 8
- [x] GAP 수정 6대 규칙 전체 적용 (입력값 컬럼, 검색영역, 규칙/예외, 관리자 메뉴, 테이블 라인, 군번/계급/성명) — Completed in Phase 8

### Out of Scope

- 백엔드 API 구현 (Java Spring Boot) -- MVP 이후 단계
- 데이터베이스 스키마/마이그레이션 (PostgreSQL) -- MVP 이후 단계
- 실제 인증 시스템 연동 -- Mock 인증으로 대체
- 모바일 반응형 -- 데스크톱 우선

## Context

- 해병대 행정업무 통합 포탈 시스템 신규 개발
- 기존 요구사항 문서: `개발 spec.txt` (8개 항목), `req_func/*.xls` (19개 파일), `req_analysis.txt` (845개 프로세스)
- MVP 접근법: 프론트엔드 화면 우선 완성 후, 백엔드(Java Spring Boot) 및 DB(PostgreSQL) 추후 개발
- 각 서브시스템은 공통 기능(게시판, 권한관리 등)을 공유

## Constraints

- **Tech Stack**: React + TypeScript + Tailwind CSS + Vite (Frontend)
- **Backend**: Java (Spring Boot) -- 추후 개발
- **MVP**: 프론트엔드 화면 우선, 백엔드 추후
- **Authentication**: Mock 인증 사용 (실 인증 추후)
- **Navigation**: 메인 포탈 경유 필수, 직접 서브시스템 접근 불가
- **Session**: exit/창닫기 -> 메인으로, 세션만료 -> 로그인으로

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + TypeScript + Tailwind CSS + Vite | 빠른 개발, 타입 안전성, 유틸리티 CSS | Complete (Phase 0) |
| MVP: 프론트엔드 우선 | 빠른 의사결정을 위한 화면 프로토타입 | Complete (v1.0) |
| 9단계 Phase 구조 (0~8) | 복잡도 순 점진적 개발 + GAP 수정 | Complete |
| 오케스트레이터 + 팀 에이전트 구조 | 대규모 시스템 병렬 개발 효율화 | Complete |
| Recommended 자동 의사결정 | 개발 속도 최적화 | Complete |
| GAP 6대 규칙 일괄 적용 (Phase 8) | req_spec 기반 화면 품질 보장 | Complete (2026-04-07) |
| SYS06 독립화 | SYS05 의존성 제거, 독립 운영 가능 | Complete (2026-04-07) |
| 공통 컴포넌트 강화 (military.ts 등) | 군번/계급/성명 일관성, 테이블 스타일 통일 | Complete (2026-04-07) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check -- still the right priority?
3. Audit Out of Scope -- reasons still valid?
4. Update Context with current state

## Milestone: v1.0 MVP Frontend Complete (2026-04-07)

- Phase 0~7: 전체 완료 (845개 단위 프로세스, 18개 서브시스템)
- Phase 8: GAP 수정 완료 (6대 규칙 x 18개 서브시스템 일괄 적용)
- 공통 컴포넌트 강화: DataTable/SearchForm/CrudForm/military.ts
- spec-doc 5종 재생성: 조감도, 업무분석서, 다이어그램, 메뉴구조도, 상관관계도
- v1.0.0 태그 생성 및 GitHub 배포 완료

**다음 단계**: v2 백엔드(Java Spring Boot) + DB(PostgreSQL) 연동

---
*Last updated: 2026-04-07 after Phase 8 GAP fix completion*
