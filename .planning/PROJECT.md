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

- [ ] 저복잡도 서브시스템 5개 (인증서, 행정규칙, 나의제언, 연구자료, 회의실) 85개 프로세스
- [ ] 중복잡도 서브시스템 A 6개 (지식, 검열, 규정, 설문, 지시건의, 영현보훈) 176개 프로세스
- [ ] 중복잡도 서브시스템 B 3개 (군사자료, 주말버스, 직무기술서) 131개 프로세스
- [ ] 고복잡도 서브시스템 2개 (부대계보, 초과근무) 158개 프로세스
- [ ] 최고복잡도 서브시스템 2개 (성과관리, 보안일일결산) 214개 프로세스

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
| React + TypeScript + Tailwind CSS + Vite | 빠른 개발, 타입 안전성, 유틸리티 CSS | -- Pending |
| MVP: 프론트엔드 우선 | 빠른 의사결정을 위한 화면 프로토타입 | -- Pending |
| 8단계 Phase 구조 | 복잡도 순 점진적 개발 | -- Pending |
| 오케스트레이터 + 팀 에이전트 구조 | 대규모 시스템 병렬 개발 효율화 | -- Pending |
| Recommended 자동 의사결정 | 개발 속도 최적화 | -- Pending |

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

---
*Last updated: 2026-04-05 after Phase 2 completion*
