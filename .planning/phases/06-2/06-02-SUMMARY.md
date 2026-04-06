---
phase: 06-2
plan: 02
subsystem: sys01-overtime
tags: [overtime, TimePicker, Steps, ConfirmDialog, Column-chart, MSW, rowSelection]
dependency_graph:
  requires: [Phase 0 공통 컴포넌트, Phase 1 공통기능, MSW 핸들러 패턴]
  provides: [sys01-overtime 11개 페이지, sys01 MSW 핸들러 전체(Plan03 포함)]
  affects: [handlers/index.ts, Plan 03 (공통 MSW 핸들러 재사용)]
tech_stack:
  added: []
  patterns:
    - TimePicker.RangePicker + dayjs diff('minutes') 자동계산 패턴
    - Steps 결재 시각화 패턴 (Phase 4~5 재사용)
    - ConfirmDialog 마감/마감취소 상태 전환 패턴
    - Column 차트 연간/월간 Tabs 패턴
    - rowSelection 다중선택 일괄처리 패턴
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys01-overtime.ts
    - navy-admin/src/pages/sys01-overtime/OtRequestPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtApprovalPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtBulkPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtBulkApprovalPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtMonthlyClosingPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtMyStatusPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtAbsencePage.tsx
    - navy-admin/src/pages/sys01-overtime/OtUnitStatusPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtMonthlyStatusPage.tsx
    - navy-admin/src/pages/sys01-overtime/OtUnitPersonnelPage.tsx
    - navy-admin/src/pages/sys01-overtime/__tests__/sys01-part1.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
decisions:
  - TimePicker.RangePicker diff('minutes') 패턴으로 총 근무시간 자동계산 구현 (Pitfall 4 대응)
  - OtMonthlyClosingPage에서 antd Modal 대신 커스텀 오버레이로 마감취소 사유 입력 구현 (간결성)
  - Plan 03용 MSW 핸들러도 sys01-overtime.ts에 포함하여 단일 파일로 관리
metrics:
  duration: 664초 (약 11분)
  completed_date: 2026-04-06
  tasks: 2
  files: 13
requirements: [OT-01, OT-02, OT-03, OT-04, OT-05, OT-06, OT-07, OT-08, OT-09, OT-10, OT-11, OT-12, OT-13]
---

# Phase 6 Plan 02: SYS01 초과근무관리 Part 1 Summary

TimePicker 자동계산 + Steps 결재 + ConfirmDialog 마감 워크플로우 + Column 차트 패턴으로 SYS01 초과근무관리 신청서관리(OT-01~05) 5종 + 현황조회(OT-06~13) 8종 총 11개 페이지 구현.

## What Was Built

### Task 1: MSW 핸들러 + 11개 페이지

**sys01-overtime.ts MSW 핸들러 (전체)**
- 신청서 CRUD `/api/sys01/requests`
- 결재 승인/반려 `/api/sys01/approvals`
- 일괄처리 CRUD + 승인 `/api/sys01/bulk-requests`, `/api/sys01/bulk-approvals`
- 월말결산 CRUD + 마감/마감취소 `/api/sys01/monthly-closing/:id/close`, `/cancel-close`
- 나의 근무현황 `/api/sys01/my-status`
- 부재관리 CRUD `/api/sys01/absences`
- 부대현황/통계/부재 `/api/sys01/unit-status`, `/unit-stats`, `/unit-absence`
- 부대인원 조회 `/api/sys01/unit-personnel`
- Plan 03용 핸들러: max-hours, work-hours, holidays, approval-lines, duty-workers, duty-posts, personal-*

**OtRequestPage (OT-01)**: TimePicker.RangePicker + dayjs diff('minutes') 자동계산. 신청서종류/근무일/시간범위/근무사유 입력. CRUD 완전 구현.

**OtApprovalPage (OT-02)**: Steps 결재 시각화(작성→결재대기→승인완료). 승인/반려 Modal. StatusBadge 상태 표시.

**OtBulkPage (OT-03)**: DataTable rowSelection 다중선택 → 일괄 신청서 작성 Modal. 일괄처리 현황 목록 병렬 표시.

**OtBulkApprovalPage (OT-04)**: 일괄처리 대기목록 + 승인/반려 버튼 패턴.

**OtMonthlyClosingPage (OT-05)**: 월별 결산 목록 + StatusBadge. 마감 버튼→ConfirmDialog("마감 처리하면 수정 불가합니다. 마감하시겠습니까?")→PUT close API. 마감취소→사유입력→PUT cancel-close API. 마감기한 경과 시 Tag color='red'.

**OtMyStatusPage (OT-06)**: Column 차트(@ant-design/charts) 연간/월간 Tabs. useQuery로 /api/sys01/my-status 조회. 월별 데이터 테이블 병렬 표시.

**OtAbsencePage (OT-07)**: DatePicker.RangePicker 기간 선택. 부재유형(휴가/휴직/출장/파견) Select. CRUD 완전 구현. 부대(서) 표기 통일.

**OtUnitStatusPage (OT-08~10)**: Tabs 3개(부대근무현황/부대근무통계/부대부재현황). 현황탭: DataTable + 부대(서) Select 필터 + 엑셀저장 Mock. 통계탭: Column 차트(부대별 월별 isGroup). 부재현황탭: DataTable.

**OtMonthlyStatusPage (OT-11)**: 월말결산 현황 DataTable + 상세 Modal + 엑셀저장 Mock.

**OtUnitPersonnelPage (OT-12/13)**: 부대인원 목록 DataTable + 자료출력(엑셀) Mock.

### Task 2: 테스트

33개 테스트 전체 통과 (780/780 총 테스트 포함).

## Deviations from Plan

### Auto-fixed Issues

없음 - 계획대로 실행.

### 판단 사항

**1. 마감취소 사유 입력 방식**
- 계획: ConfirmDialog(TextArea 사유입력)
- 구현: 커스텀 오버레이 Modal (antd Modal의 TextArea 포함 방식은 Modal.confirm 내부에서 제어 어려움)
- 이유: showConfirmDialog는 정적 함수형으로 state 연동이 불가. state 기반 오버레이로 구현.

**2. OT-12 자료출력 통합**
- 계획: OtUnitStatusPage 내 엑셀버튼 또는 별도 버튼
- 구현: OtUnitPersonnelPage에 자료출력(엑셀) 버튼 통합 + OtUnitStatusPage에도 엑셀저장 버튼 포함
- 이유: 두 화면 모두 출력 기능 제공으로 요구사항 충족.

## Known Stubs

- 엑셀저장/자료출력: `message.success('자료 출력이 완료되었습니다.')` Mock (백엔드 연동 시 실제 파일 생성 필요)
- 마감기한 설정 저장: `message.success('마감기한이 설정되었습니다.')` Mock (PUT /api/sys01/monthly-closing/deadline 미연동)

## Self-Check: PASSED

| 항목 | 결과 |
|------|------|
| 11개 페이지 파일 존재 | FOUND |
| sys01-overtime.ts MSW 핸들러 존재 | FOUND |
| 테스트 파일 존재 | FOUND |
| 커밋 7292306 존재 | FOUND |
| 전체 테스트 780/780 통과 | PASSED |
