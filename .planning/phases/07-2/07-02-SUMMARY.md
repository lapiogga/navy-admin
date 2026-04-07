---
phase: "07-2"
plan: "02"
subsystem: "SYS15"
tags: ["sys15", "security", "secret", "media", "equipment", "notice", "transfer", "msw"]
dependency_graph:
  requires: []
  provides: ["sys15-msw-handlers", "SecretMediaPage", "NoticeDocPage", "TransferPage"]
  affects: ["07-2-03"]
tech_stack:
  added: []
  patterns:
    - "SecretMediaPage type prop 분기 패턴 (secret/media/equipment 3종 공통 CRUD)"
    - "비밀 등록 후 예고문 Modal 자동 오픈 콜백 패턴"
    - "Tabs + Steps + Checkbox 인계/인수 워크플로우"
key_files:
  created:
    - navy-admin/src/shared/api/mocks/handlers/sys15-security.ts
    - navy-admin/src/pages/sys15-security/SecretMediaPage.tsx
    - navy-admin/src/pages/sys15-security/SecretPage.tsx
    - navy-admin/src/pages/sys15-security/MediaPage.tsx
    - navy-admin/src/pages/sys15-security/EquipmentPage.tsx
    - navy-admin/src/pages/sys15-security/NoticeDocPage.tsx
    - navy-admin/src/pages/sys15-security/TransferPage.tsx
    - navy-admin/src/pages/sys15-security/__tests__/sys15-plan02.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/index.ts
decisions:
  - "[Phase 07-2]: SecretMediaPage type prop으로 비밀/매체/보안자재 3종 통합 관리 — 코드 중복 최소화"
  - "[Phase 07-2]: 비밀 등록 후 예고문 자동 오픈 콜백(onSecretCreated) — SecretPage에서 NoticeDocAutoModal 연결"
  - "[Phase 07-2]: TransferPage Tabs(인계/인수) + Steps(결재흐름) + Checkbox(다중선택) 패턴 — D-21/D-22/D-23 요구사항 충족"
  - "[Phase 07-2]: Wave 2 스텁 엔드포인트 사전 생성 — /checklist, /daily-settlement, /approval (Wave 2 준비)"
metrics:
  duration: "약 15분"
  completed_date: "2026-04-06"
  tasks_completed: 2
  files_changed: 9
---

# Phase 07-2 Plan 02: SYS15 비밀/매체관리 5종 Summary

한 줄 요약: SecretMediaPage type prop으로 비밀/저장매체/보안자재 3종 통합 CRUD + 예고문 자동 오픈 + 인계/인수 Steps 워크플로우 구현, MSW handlers 전체 등록 완료.

## 완료된 작업

### Task 1: SYS15 MSW handlers + SecretMediaPage 공통 컴포넌트 + 비밀/매체/보안자재 3종
- 커밋: `50b5728`
- sys15-security.ts: 비밀/저장매체/보안자재/예고문/인계인수 5종 + Wave 2 스텁(checklist/daily-settlement/approval) MSW handlers 생성
- SecretMediaPage.tsx: type='secret'|'media'|'equipment' prop 분기 공통 CRUD 컴포넌트
  - DataTable + SearchForm(기간/부대(서)/상태/키워드), CrudForm Modal, DeleteModal(사유 입력 필수)
  - Upload.Dragger 일괄등록, 엑셀 저장, PrintableReport 관리대장 출력, Tabs(목록/이력조회)
- SecretPage.tsx / MediaPage.tsx / EquipmentPage.tsx: SecretMediaPage 래퍼 3종
- handlers/index.ts: sys15Handlers 등록

### Task 2: 예고문 관리 + 인계/인수 워크플로우 + 테스트
- 커밋: `3ab79e9`
- NoticeDocPage.tsx: 예고문 목록조회/등록/수정/삭제, 예고문 알림 발송(message.info), StatusBadge 상태 표시
- TransferPage.tsx: Tabs(인계/인수), Steps(인계등록→결재대기→인수확인), Checkbox 다중 선택, 인수확인/반송 버튼
- sys15-plan02.test.ts: 54개 파일 내용 검증 테스트 전체 통과

## 테스트 결과

- 신규 테스트: 54개 (sys15-plan02.test.ts)
- 전체 테스트: 925개 PASSED (871 기존 + 54 신규)

## Deviations from Plan

None - 계획대로 실행됨.

## Known Stubs

- TransferPage.tsx: 인계 대상 자산 목록은 비밀 목록(/api/sys15/secrets)만 사용. 저장매체/보안자재도 인계 대상이나 Wave 2에서 확장 예정.
- SecretMediaPage.tsx: 관리대장 출력 시 현재 페이지 데이터 대신 실제로는 전체 목록 fetch 필요. Wave 2에서 개선 예정.

## Self-Check: PASSED

파일 생성 확인:
- navy-admin/src/shared/api/mocks/handlers/sys15-security.ts: FOUND
- navy-admin/src/pages/sys15-security/SecretMediaPage.tsx: FOUND
- navy-admin/src/pages/sys15-security/SecretPage.tsx: FOUND
- navy-admin/src/pages/sys15-security/MediaPage.tsx: FOUND
- navy-admin/src/pages/sys15-security/EquipmentPage.tsx: FOUND
- navy-admin/src/pages/sys15-security/NoticeDocPage.tsx: FOUND
- navy-admin/src/pages/sys15-security/TransferPage.tsx: FOUND
- navy-admin/src/pages/sys15-security/__tests__/sys15-plan02.test.ts: FOUND

커밋 확인:
- 50b5728: FOUND (Task 1)
- 3ab79e9: FOUND (Task 2)

---

## GAP 수정 반영 (2026-04-07)

SYS15 보안일일결산체계 비밀/매체관리 페이지에 req_spec 기반 6대 규칙 적용. SearchForm 추가, militaryPersonColumn 적용 (보안담당자/점검자), DataTable navy-bordered-table CSS 적용.
