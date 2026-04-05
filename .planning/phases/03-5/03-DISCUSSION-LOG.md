# Phase 3: 저복잡도 서브시스템 5개 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 03-저복잡도 서브시스템 5개
**Areas discussed:** 공통 기능 재사용 방식, 승인/반려 워크플로우, 서브시스템 메인화면, 회의실 특수 UI
**Mode:** --auto (recommended 옵션 자동 선택)

---

## 공통 기능 재사용 방식

### 게시판/코드관리/권한 호출 방식

| Option | Description | Selected |
|--------|-------------|----------|
| 라우트 매핑으로 Phase 1 페이지 재사용 | 서브시스템 메뉴에서 Phase 1 common/ 페이지를 sysCode 파라미터로 렌더링 | ✓ |
| 서브시스템별 복사본 생성 | 각 서브시스템에 독립 게시판/코드관리 페이지 생성 | |
| 위젯 방식 임베딩 | Phase 1 기능을 위젯으로 감싸서 서브시스템에 삽입 | |

**User's choice:** [auto] 라우트 매핑으로 Phase 1 페이지 재사용 (recommended default)

### 서브시스템별 데이터 격리

| Option | Description | Selected |
|--------|-------------|----------|
| sysCode 파라미터로 MSW 핸들러 필터링 | URL 또는 쿼리 파라미터로 서브시스템 식별, 핸들러에서 필터링 | ✓ |
| 별도 API 엔드포인트 | 서브시스템별 별도 엔드포인트 (/api/sys04/board, /api/sys16/board) | |

**User's choice:** [auto] sysCode 파라미터로 MSW 핸들러 필터링 (recommended default)

---

## 승인/반려 워크플로우

### 승인 패턴

| Option | Description | Selected |
|--------|-------------|----------|
| 간단한 상태변경 + StatusBadge | pending→approved/rejected 단순 전환, Popconfirm 확인 | ✓ |
| Phase 1 결재선 연동 | 결재선 관리와 연동하여 다단계 결재 | |
| Claude 재량 | | |

**User's choice:** [auto] 간단한 상태변경 + StatusBadge (recommended default)
**Notes:** 저복잡도 서브시스템이므로 단순 승인/반려 충분. 결재선 연동은 Phase 6+ 고복잡도에서 적용.

---

## 서브시스템 메인화면

### 메인화면 구성 방식

| Option | Description | Selected |
|--------|-------------|----------|
| antd Card + Statistic 대시보드 | 상단 통계 카드 + 하단 최신 5건 목록 + 전체보기 링크 | ✓ |
| 단순 목록 리다이렉트 | 메인화면 없이 첫 번째 기능 목록으로 바로 이동 | |
| 탭 기반 대시보드 | 여러 카테고리를 탭으로 분류 | |

**User's choice:** [auto] antd Card + Statistic 대시보드 (recommended default)

---

## 회의실 특수 UI

### 시간대 선택 UI

| Option | Description | Selected |
|--------|-------------|----------|
| TimePicker.RangePicker + 요일별 Table | 요일별 운영시간을 테이블로 관리, TimePicker로 시간 입력 | ✓ |
| 캘린더 기반 시간 슬롯 | FullCalendar 등으로 시각적 시간 선택 | |
| 간단한 텍스트 입력 | 시간대를 텍스트로 입력 | |

**User's choice:** [auto] TimePicker.RangePicker + 요일별 Table (recommended default)

### 장비/사진 관리

| Option | Description | Selected |
|--------|-------------|----------|
| Upload + DataTable 조합 | antd Upload(이미지 미리보기) + DataTable 목록 | ✓ |
| 별도 관리 페이지 | 장비/사진을 별도 페이지로 분리 | |

**User's choice:** [auto] Upload + DataTable 조합 (recommended default)

---

## Claude's Discretion

- 각 서브시스템별 MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합
- 테이블 컬럼 구성 및 정렬/필터 옵션
- 상세 페이지 레이아웃
- 연구자료 통계 차트 종류

## Deferred Ideas

None
