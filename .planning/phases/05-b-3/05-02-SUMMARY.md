---
phase: 05-b-3
plan: 02
subsystem: SYS10 주말버스예약관리체계
tags: [sys10, weekend-bus, seat-grid, reservation, dispatch]
completed: 2026-04-06
duration: 64min
tasks_completed: 2
files_created: 9
files_modified: 3
requires: [05-01]
provides: [SeatGrid, BusReservationPage, BusDispatchPage, BusSchedulePage, BusUsagePage, BusReservationStatusPage, sys10Handlers]
affects: [menus.ts, handlers/index.ts]
tech_stack_added: []
tech_stack_patterns: [SeatGrid antd Row/Col 4열 좌석 그리드, PrintableReport 재사용 승차권, SeatGrid readOnly 배차 확인]
key_files_created:
  - navy-admin/src/pages/sys10-weekend-bus/SeatGrid.tsx
  - navy-admin/src/pages/sys10-weekend-bus/BusReservationPage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/TicketPrint.tsx
  - navy-admin/src/pages/sys10-weekend-bus/BusReservationStatusPage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/BusDispatchPage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/BusSchedulePage.tsx
  - navy-admin/src/pages/sys10-weekend-bus/BusUsagePage.tsx
  - navy-admin/src/shared/api/mocks/handlers/sys10.ts
  - navy-admin/src/__tests__/sys10/weekend-bus.test.ts
key_files_modified:
  - navy-admin/src/shared/api/mocks/handlers/index.ts
  - navy-admin/src/pages/sys10-weekend-bus/index.tsx
  - navy-admin/src/entities/subsystem/menus.ts
key_decisions:
  - SeatGrid 독립 컴포넌트로 분리 — BusReservationPage(인터랙티브)와 BusDispatchPage(readOnly) 양쪽 재사용
  - TicketPrint는 sys09의 PrintableReport를 직접 재사용 — 별도 구현 없이 승차권 인쇄 구현
  - menus.ts에 관리자 대메뉴 추가 (규칙 7 적용) — 코드관리/권한관리 Phase 1 페이지 lazy import
requirements: [BUS-01, BUS-02, BUS-03, BUS-04, BUS-06, BUS-09]
---

# Phase 5 Plan 02: SYS10 주말버스예약관리체계 Summary

SeatGrid antd Row/Col 4열 좌석 그리드 + 주말버스 예약/배차/시간관리/사용현황 6개 페이지 + MSW 핸들러 구현.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | SeatGrid + MSW 핸들러 + 예약 페이지 | 219bb27 | SeatGrid.tsx, BusReservationPage.tsx, TicketPrint.tsx, sys10.ts, index.tsx, menus.ts |
| 2 | 예약현황 + 배차관리 + 예약시간관리 + 사용현황 | 65b935a | BusReservationStatusPage.tsx, BusDispatchPage.tsx, BusSchedulePage.tsx, BusUsagePage.tsx |

## What Was Built

### SeatGrid 컴포넌트 (핵심 신규 패턴)
- antd Row/Col 기반 4열 좌석 그리드 (통로 Col span=2 포함)
- STATUS_COLOR: available(파랑)/reserved(회색)/selected(초록)/unavailable(빨강)
- readOnly 모드 지원 — 배차관리 좌석배치 확인에 재사용
- 하단 범례 포함

### 예약 플로우 (BUS-01)
- BusReservationPage: 노선/일자/시간 선택 → SeatGrid 좌석 선택 → 예약 신청
- TicketPrint: PrintableReport(sys09) 재사용, Descriptions 레이아웃, QR placeholder, 인쇄 버튼

### 예약현황 (BUS-02)
- DataTable + SearchForm(노선/일자/부대/예약자)
- StatusBadge: reserved(초록)/cancelled(기본)/waiting(금색)
- 승차권 발급 Modal, 예약 취소 Popconfirm, 엑셀/인쇄 toolBar

### 배차관리 (BUS-03)
- DataTable CRUD + 배정/배정취소 액션
- 좌석배치 확인: Modal 내 SeatGrid readOnly=true
- CrudForm(Form): direction/operationDate/departureTime/departure/destination/stopover/totalSeats/vehicleNo

### 예약시간관리 (BUS-04)
- DataTable CRUD: routeId/rank/operationDate/reservationRank/openTime/closeTime
- 계급별 예약오픈/마감 시간 관리

### 사용현황 (BUS-06)
- DataTable + SearchForm(일자/노선/부대)
- usageRate % 표시, 인쇄 미리보기 Modal (규칙 4 적용)

### MSW 핸들러 (sys10.ts)
- 노선 5개, 배차 10건, 좌석 40석/배차, 예약 15건, 시간 12건, 사용현황 10건
- 15개 API 엔드포인트 (GET/POST/PUT/DELETE)

### 라우트 분기 + 관리자 대메뉴 (규칙 7)
- /sys10/1/1~1/9, /sys10/2/1~2/2
- 관리자: CodeGroupPage, PermissionGroupPage lazy import

## Test Results

- 총 36개 테스트 통과 (Task 1: 20개, Task 2: 16개)
- `npx tsc --noEmit`: 에러 없음

## Deviations from Plan

None - 계획대로 실행됨.

다만 handlers/index.ts에 병렬 에이전트(05-04 sys18)가 sys18Handlers를 추가한 상태에서 sys10Handlers를 추가했으므로, 최종 handlers 배열에 sys10 + sys18 모두 포함됨. 기능에 영향 없음.

## Known Stubs

- BusReservationPage: `userName: '홍길동'`, `rank: '상병'`, `militaryId: '24-1234567'`, `unit: '1사단'` — 로그인 사용자 정보 연동 필요 (실 API 전환 시 해결)
- TicketPrint QR코드: placeholder img (120x120 회색 박스) — QR 생성 라이브러리 추후 연동
- BusWaitlistPage, BusViolatorPage, ExternalUserPage: placeholder ('준비중') — Plan 03에서 구현 예정

## Self-Check: PASSED

- SeatGrid.tsx: FOUND
- BusReservationPage.tsx: FOUND
- BusDispatchPage.tsx: FOUND
- sys10.ts: FOUND
- commit 219bb27: FOUND
- commit 65b935a: FOUND
