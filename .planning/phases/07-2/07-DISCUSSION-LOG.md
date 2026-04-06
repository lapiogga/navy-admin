# Phase 7: 최고복잡도 서브시스템 2개 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 07-최고복잡도 서브시스템 2개
**Areas discussed:** 과제계층관리, KPI차트시각화, 보안점검체크리스트UI, 비밀매체CRUD구조, 인계인수워크플로우, 점검항목관리대규모CRUD, 예외처리트리구조, 보안결산캘린더메인, 개인보안수준평가, 서브시스템분할전략
**Mode:** Auto (all areas auto-selected, recommended options chosen)

---

## 과제 계층 관리 (성과관리)

| Option | Description | Selected |
|--------|-------------|----------|
| 계단식 Master-Detail 페이지 | 기준정보 내 레벨별 독립 소메뉴 CRUD, 과제등록에서 소과제→상세과제 연동 | v |
| antd Tree 5단 계층 | 전체 과제를 하나의 Tree로 표현 | |
| Cascading Select 필터 | 상위 Select 선택 → 하위 Select 로드 연쇄 | |

**User's choice:** [auto] 계단식 Master-Detail 페이지 (recommended)
**Notes:** 메뉴 구조가 이미 레벨별로 분리되어 있으므로 (지휘방침/추진중점과제/중과제/소과제) 각각 독립 CRUD가 자연스러움.

---

## KPI 차트 시각화 (성과관리)

| Option | Description | Selected |
|--------|-------------|----------|
| @ant-design/charts Bar+Gauge+Progress | 메인 Gauge+Bar 3종, 추진진도율 Grouped Bar, 평가결과 Bar, 입력현황 Stacked Bar+Progress | v |
| echarts 커스텀 | 고도 커스텀이 필요할 때 | |
| antd 내장 Statistic만 | 차트 없이 수치만 표시 | |

**User's choice:** [auto] @ant-design/charts Bar+Gauge+Progress (recommended)
**Notes:** Phase 4~6에서 이미 @ant-design/charts를 사용중. 동일 라이브러리로 통일.

---

## 보안점검 체크리스트 UI (보안일일결산)

| Option | Description | Selected |
|--------|-------------|----------|
| Checkbox.Group + Form.List 체크리스트 | 필수/선택 그룹별 체크박스, 미체크 시 사유 입력 | v |
| antd Steps 단계별 체크 | 점검항목을 Steps로 순서대로 | |
| 카드 기반 점검 | 각 항목을 Card로 표현 | |

**User's choice:** [auto] Checkbox.Group + Form.List 체크리스트 (recommended)
**Notes:** 보안점검은 항목 수가 많으므로 Checkbox.Group이 가장 효율적. 미체크 사유는 조건부 TextArea.

---

## 비밀/매체관리 CRUD 구조 (보안일일결산)

| Option | Description | Selected |
|--------|-------------|----------|
| 공통 SecretMediaPage + type prop | 3종 동일 구조를 type='secret'|'media'|'equipment'로 분기 | v |
| 3개 독립 페이지 | 비밀/저장매체/보안자재 각각 별도 페이지 세트 | |

**User's choice:** [auto] 공통 SecretMediaPage + type prop (recommended)
**Notes:** 3종의 CRUD 구조가 거의 동일 (목록/등록/수정/삭제/이력/일괄등록/엑셀/출력). 코드 중복 최소화.

---

## 인계/인수 워크플로우 (보안일일결산)

| Option | Description | Selected |
|--------|-------------|----------|
| Steps 워크플로우 + 선택적 인수 | 인계(항목선택→인수자지정→등록) → 인수(인수확인/반송) → 결재 | v |
| 단순 버튼 전환 | 인계/인수 토글 버튼만 | |

**User's choice:** [auto] Steps 워크플로우 + 선택적 인수 (recommended)
**Notes:** 인수확인/반송 선택이 필요하고 결재 연동이 있으므로 Steps 워크플로우가 적합.

---

## 점검항목관리 대규모 CRUD (보안일일결산)

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs 5개 통합 | 필수개인/필수사무실/선택개인/선택사무실/평가항목 각 탭 CRUD | v |
| 개별 페이지 5종 | 각 점검항목 유형별 독립 페이지 | |
| 3단 Tabs | 개인/사무실/평가 상위탭 → 필수/선택 하위탭 | |

**User's choice:** [auto] Tabs 5개 통합 (recommended)
**Notes:** 21개 프로세스를 단일 페이지 Tabs로 통합. 관련규정은 별도 소메뉴.

---

## 예외처리 관리 트리구조 (보안일일결산)

| Option | Description | Selected |
|--------|-------------|----------|
| antd Tree + DataTable Master-Detail | Phase 6 SYS08 Tree 패턴 재사용, 3개 소메뉴 각각 Tree+DataTable | v |
| DataTable만 (부대 Select 필터) | Tree 없이 Select 드롭다운으로 조직 필터 | |

**User's choice:** [auto] antd Tree + DataTable Master-Detail (recommended)
**Notes:** req_analysis에 "트리구조"가 명시되어 있으므로 Tree 필수. Phase 6 패턴 직접 재사용.

---

## 보안결산 캘린더 메인화면

| Option | Description | Selected |
|--------|-------------|----------|
| antd Calendar + cellRender 상태 Badge | Phase 6 SYS01 Calendar 패턴 재사용, 개인/사무실 탭 전환 | v |
| DataTable 날짜별 목록 | 캘린더 대신 날짜 컬럼 DataTable | |
| 주간 뷰 캘린더 | 월간 대신 주간 캘린더 | |

**User's choice:** [auto] antd Calendar + cellRender 상태 Badge (recommended)
**Notes:** req_analysis에 "캘린더 형태"가 명시. Phase 6 cellRender 패턴으로 green/red/gray Badge 표시.

---

## 개인보안수준평가

| Option | Description | Selected |
|--------|-------------|----------|
| Tabs 2개 (수시/정기) + 차트 3종 | 수시평가 Modal 입력 + 정기평가 5항목 + Bar/Pie/Line 통계 | v |
| 단일 페이지 전체 통합 | 수시/정기 구분 없이 하나의 DataTable | |

**User's choice:** [auto] Tabs 2개 (수시/정기) + 차트 3종 (recommended)
**Notes:** 수시/정기가 입력 방식이 다르므로 Tabs 분리. 통계는 Phase 4~6 차트 패턴.

---

## 서브시스템 분할 전략

| Option | Description | Selected |
|--------|-------------|----------|
| 6 plans, 3 waves | SYS03(2+1+1) + SYS15(1+1+1+1) = P1~P6, W1(P1+P2)/W2(P3+P4)/W3(P5+P6) | v |
| 4 plans, 2 waves | SYS03(1+1) + SYS15(1+1) | |
| 8 plans, 4 waves | 더 세분화 | |

**User's choice:** [auto] 6 plans, 3 waves (recommended)
**Notes:** 214개 프로세스를 6개 plan으로 분할. Wave별 의존성으로 MSW handler/타입 충돌 방지.

---

## Claude's Discretion

- MSW Mock 데이터 구조 및 Faker.js 시드
- 테이블 컬럼 구성 상세 (req_analysis 기반)
- 검색 필터 조건 조합
- 차트 색상/스타일 디테일
- Calendar cellRender 렌더링 상세
- Checkbox.Group 체크리스트 항목 구성
- Tree 노드 아이콘/스타일
- 관리대장/기록부 PrintableReport 레이아웃 상세

## Deferred Ideas

None
