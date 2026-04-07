---
phase: 05-b-3
plan: "04"
subsystem: SYS18 직무기술서관리체계
tags: [job-desc, steps-form, form-list, approval-workflow, org-diagnosis]
requires: [05-03]
provides: [SYS18-core]
affects: [handlers/index.ts, menus.ts]
tech-stack-added: [dayjs/plugin/isBefore]
tech-patterns: [Steps+Form.List, ratio-validation, approval-steps-workflow]
key-files-created:
  - navy-admin/src/shared/api/mocks/handlers/sys18.ts
  - navy-admin/src/pages/sys18-job-desc/JobDescListPage.tsx
  - navy-admin/src/pages/sys18-job-desc/JobDescFormPage.tsx
  - navy-admin/src/pages/sys18-job-desc/JobDescApprovalPage.tsx
  - navy-admin/src/pages/sys18-job-desc/OrgDiagnosisPage.tsx
  - navy-admin/src/__tests__/sys18/job-desc.test.ts
key-files-modified:
  - navy-admin/src/shared/api/mocks/handlers/index.ts
  - navy-admin/src/pages/sys18-job-desc/index.tsx
  - navy-admin/src/entities/subsystem/menus.ts
decisions:
  - "직무기술서 5단계 폼: 단일 Form 인스턴스로 5단계 공유, Steps current로 단계 전환"
  - "비율 합계 검증: Form.useWatch('tasks') → reduce sum → 다음 단계 클릭 시 100% 체크"
  - "조직진단 수정/삭제 비활성화: dayjs().isBefore(diagnosisPeriodStart) 비교"
  - "결재 Steps: getApprovalCurrent(status) 함수로 현재 단계 계산"
requirements: [JOB-01, JOB-03, JOB-04]
duration: "약 15분"
completed: "2026-04-06"
tasks-completed: 2
files-created: 6
files-modified: 3
tests-added: 53
---

# Phase 5 Plan 04: SYS18 직무기술서관리체계 핵심 기능 Summary

**한 줄 요약:** 직무기술서 5단계 Steps 폼(Form.List 비율 100% 검증) + 결재 작성→1차→2차→완료 워크플로우 + 조직진단 CRUD(진단기간 이후 수정 비활성화) 구현

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | MSW 핸들러 + 라우트 분기 + 직무기술서 목록/5단계 폼 | faa9f98 | sys18.ts, index.tsx, JobDescListPage, JobDescFormPage, test |
| 2 | 결재 Steps 워크플로우 + 결재자 CRUD + 조직진단 관리 | 53b3beb | JobDescApprovalPage, OrgDiagnosisPage, test 업데이트 |

## What Was Built

### Task 1: MSW 핸들러 + 직무기술서 목록/5단계 폼

**sys18.ts MSW 핸들러 (20개 엔드포인트):**
- 직무기술서 CRUD + 임시저장(/draft) + 결재요청(/submit) + 복사(/copy)
- 조직진단 CRUD
- 결재대기 목록 + 승인/반려/재결재
- 결재자(부서별) CRUD
- 표준업무시간 조회

**JobDescListPage:** Tabs 3탭(나의개인JD/직책JD/부서JD) + DataTable + 인쇄 미리보기 Modal

**JobDescFormPage (5단계 Steps):**
- Step 1: 기본정보 (조직진단 Select, 군번/성명/계급 읽기전용, 직책/부서 입력, 대리작성 모드)
- Step 2: 업무분류/비율 — Form.List로 동적 추가/삭제, ratioSum 실시간 감시, 100% 미달 시 next 차단
- Step 3: 시간배분 — standardHours 조회, 주간시간 입력, 비율 자동계산
- Step 4: 역량/자격요건 — TextArea 5개
- Step 5: 완료/제출 — Descriptions 요약 + 결재선 확인 + 결재요청 버튼

**index.tsx:** /sys18/1/1~2/3 라우트 분기, 공통게시판/코드관리/권한관리 lazy import, menus.ts '시스템' → '관리자' (규칙 7)

### Task 2: 결재 + 조직진단

**JobDescApprovalPage:**
- 결재대기 탭: Steps(작성→1차→2차→완료) + 승인/반려(rejectReason TextArea) + 재결재 버튼
- 결재자관리 탭: 부서별 1차/2차 결재자 CrudForm CRUD

**OrgDiagnosisPage:**
- DataTable CRUD + 진단기간(diagnosisPeriodStart) 이전이면 수정/삭제 활성화
- dayjs().isBefore(diagnosisPeriodStart)로 진단기간 이후 비활성화 + Tooltip 안내

## Test Results

- 총 53개 테스트 PASSED
- readFileSync 기반 파일 내용 검증 패턴 (jsdom 타임아웃 회피)

## Deviations from Plan

### Auto-fixed Issues

없음 — 계획대로 실행됨.

### 참고 사항

- handlers/index.ts에 병렬 에이전트(05-01)가 sys07Handlers를 추가한 상태에서 sys18Handlers 추가 (충돌 없음)
- OrgDiagnosisPage의 RangePicker는 `require('antd').DatePicker`로 임포트 (CommonJS 호환)

## Known Stubs

- `/sys18/1/5` (직무기술서 조회 관리자): placeholder — Plan 05에서 구현 예정
- `/sys18/2/2` (표준업무시간관리): placeholder — Plan 05에서 구현 예정
- JobDescFormPage Step 5 결재선: Mock 하드코딩 (김부서장, 이참모) — Plan 05에서 동적 조회로 교체 예정

## Self-Check: PASSED

- FOUND: sys18.ts
- FOUND: JobDescFormPage.tsx
- FOUND: JobDescApprovalPage.tsx
- FOUND: OrgDiagnosisPage.tsx
- FOUND: commit faa9f98
- FOUND: commit 53b3beb

---

## GAP 수정 반영 (2026-04-07)

SYS18 직무기술서관리체계에 req_spec 기반 6대 규칙 적용. SearchForm 추가, 결재자지정 UI 로직 반영, 엑셀가져오기 기능 반영, 초과근무실적연동 규칙 반영. DataTable에 navy-bordered-table CSS 적용.
