# Phase 0: 프로젝트 기반 구축 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 00-project-foundation
**Areas discussed:** FSD 구조, URL 컨벤션, Ant Design 테마, 공통 컴포넌트 범위, Mock API 전략, 상태관리, 라우팅, 한글 IME
**Mode:** Recommender auto-decision (운영 규칙 #4)

---

## FSD 프로젝트 구조

| Option | Description | Selected |
|--------|-------------|----------|
| Feature-Sliced Design | 6-layer FSD (app/pages/widgets/features/entities/shared) | ✓ |
| Feature-based flat | src/features/{name} 단일 레벨 | |
| Module Federation | 마이크로 프론트엔드 분리 배포 | |

**User's choice:** Feature-Sliced Design (recommended)
**Notes:** 리서치에서 FSD가 18개 서브시스템 경계 격리에 최적으로 확인됨

## URL 컨벤션

| Option | Description | Selected |
|--------|-------------|----------|
| /sys{번호}/{메뉴}/{소메뉴} | 서브시스템 번호 기반 계층 URL | ✓ |
| /subsystem/{이름}/{메뉴} | 서브시스템 이름 기반 | |
| /app/{기능그룹}/{화면} | 기능 그룹 기반 | |

**User's choice:** /sys{번호} 패턴 (recommended)
**Notes:** 18개 서브시스템 번호가 이미 확립되어 있어 자연스러운 매핑

## Ant Design 테마

| Option | Description | Selected |
|--------|-------------|----------|
| 중립 블루/그레이 | 군 행정 시스템에 적합한 공식적 톤 | ✓ |
| Ant Design 기본 | 커스텀 없이 기본 테마 사용 | |
| 다크 모드 지원 | 라이트/다크 전환 지원 | |

**User's choice:** 중립 블루/그레이 (recommended)
**Notes:** 군 행정 시스템 특성상 공식적이고 가독성 높은 색상 필요

## Mock API 전략

| Option | Description | Selected |
|--------|-------------|----------|
| MSW + Java DTO 관례 | MSW 2.x, camelCase, PageResponse 래핑 | ✓ |
| MSW + 자유형 | MSW 사용, 편의적 데이터 구조 | |
| json-server | 별도 프로세스 Mock 서버 | |

**User's choice:** MSW + Java DTO 관례 (recommended)
**Notes:** 리서치에서 Mock-to-real 전환 위험 방지를 위해 DTO 관례 일치 강력 권고

## Claude's Discretion

- Tailwind 설정 상세값
- Vite manualChunks 전략
- ESLint/Prettier 설정
- Vitest 초기 설정 범위

## Deferred Ideas

None
