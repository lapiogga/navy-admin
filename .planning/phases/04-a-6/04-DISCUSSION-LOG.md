# Phase 4: 중복잡도 서브시스템 A 6개 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 04-중복잡도 서브시스템 A 6개
**Areas discussed:** 결재 워크플로우, 설문 문항 편집기, 통계/차트, 보고서/확인서, 규정관리 재사용, 이행/처리현황
**Mode:** --auto (recommended 옵션 자동 선택)

---

## 결재 워크플로우 연동

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 1 결재선 연동 | 결재선 선택 → 순차 결재 → 완료/반려, Steps로 단계 시각화 | ✓ |
| Phase 3 단순 상태변경 | pending→approved/rejected 단순 전환, Popconfirm 확인 | |
| 별도 결재 모듈 신규 개발 | 검열 전용 결재 워크플로우 독립 구현 | |

**User's choice:** [auto] Phase 1 결재선 연동 (recommended default)
**Notes:** 중복잡도이므로 Phase 1 결재선 활용이 적합. Phase 3의 단순 방식은 저복잡도 전용.

---

## 설문 문항 편집기 UI

| Option | Description | Selected |
|--------|-------------|----------|
| antd Form.List + DnD 정렬 | antd 내장 동적 폼 + dnd-kit/react-beautiful-dnd 드래그 정렬 | ✓ |
| JSON Schema 기반 폼 빌더 | JSON 스키마로 문항 정의, 렌더러로 표시 | |
| 외부 폼 빌더 라이브러리 | formio, typeform 클론 등 전문 라이브러리 | |

**User's choice:** [auto] antd Form.List + DnD 정렬 (recommended default)
**Notes:** antd 생태계 내에서 구현하여 일관성 유지. 4가지 문항 유형(Radio/Checkbox/TextArea/Rate) 지원.

---

## 통계/차트 구현

| Option | Description | Selected |
|--------|-------------|----------|
| @ant-design/charts | antd 생태계 차트 라이브러리, 일관된 스타일 | ✓ |
| recharts | 가벼운 React 차트 라이브러리 | |
| antd Statistic만 사용 | 숫자 통계만, 시각적 차트 없음 | |

**User's choice:** [auto] @ant-design/charts (recommended default)

---

## 보고서/확인서 렌더링

| Option | Description | Selected |
|--------|-------------|----------|
| antd Descriptions + Print CSS | 화면은 Descriptions, 프린트는 @media print CSS | ✓ |
| PDF 생성 라이브러리 | jspdf/react-pdf로 서버리스 PDF 생성 | |
| 서버 측 PDF | 백엔드에서 PDF 생성 (MVP 이후) | |

**User's choice:** [auto] antd Descriptions + Print CSS (recommended default)
**Notes:** Mock 단계에서 가장 실용적. window.print() 활용.

---

## 규정관리 페이지 재사용

| Option | Description | Selected |
|--------|-------------|----------|
| sys05 페이지 컴포넌트 직접 재사용 | Props(타이틀/sysCode)만 변경하여 동일 컴포넌트 렌더링 | ✓ |
| sys05 복사 후 수정 | sys05 코드를 sys06에 복사하여 독립 관리 | |
| 별도 신규 구현 | sys06 전용 페이지 새로 작성 | |

**User's choice:** [auto] sys05 페이지 컴포넌트 직접 재사용 (recommended default)
**Notes:** MREG-01~04와 AREG-01~04가 거의 동일. 코드 중복 최소화.

---

## 이행/처리현황 추적

| Option | Description | Selected |
|--------|-------------|----------|
| Progress + StatusBadge + Timeline | 진행률(Progress), 상태(StatusBadge), 이력(Timeline) 조합 | ✓ |
| Kanban 보드 | 컬럼별 상태 이동 (Trello 스타일) | |
| 단순 테이블 | DataTable에 상태 컬럼만 추가 | |

**User's choice:** [auto] Progress + StatusBadge + Timeline (recommended default)
**Notes:** antd 내장 컴포넌트 조합으로 추가 의존성 불요.

---

## Claude's Discretion

- MSW Mock 데이터 구조, Faker.js 시드
- 검색 필터 조건, 테이블 컬럼, 상세 레이아웃
- 차트 색상/스타일, DnD 라이브러리 선택
- 검열 추진현황 테이블 구조

## Deferred Ideas

None
