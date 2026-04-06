# Phase 6: 고복잡도 서브시스템 2개 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 06-고복잡도 서브시스템 2개
**Areas discussed:** 제원/계승부대 트리뷰, 초과근무 시간입력 UI, 월말결산 마감 워크플로우, 당직개소 구조, 부대기/마크 이미지, 입력통계 대시보드, 권한신청/관리 플로우
**Mode:** Auto (all areas auto-selected, recommended options chosen)

---

## 제원/계승부대 트리 뷰

| Option | Description | Selected |
|--------|-------------|----------|
| antd Tree + 리스트 병행 | 좌측 Tree 패널 + 우측 DataTable Master-Detail | v |
| 리스트 전용 | 트리 없이 DataTable + 부대 필터 드롭다운 | |
| 커스텀 계보도 | D3.js 기반 시각화 다이어그램 | |

**User's choice:** [auto] antd Tree + 리스트 병행 (recommended)
**Notes:** 트리는 조회 용도, 편집은 CrudForm. MSW에서 3~4단 계층 데이터 생성.

---

## 초과근무 시간입력 UI

| Option | Description | Selected |
|--------|-------------|----------|
| TimePicker.RangePicker + DatePicker | antd 기본 시간/날짜 선택기 조합 | v |
| 캘린더 뷰 직접 입력 | 캘린더에서 날짜 선택 후 시간 입력 | |
| 텍스트 입력 | 수동 시간 텍스트 입력 (HH:MM) | |

**User's choice:** [auto] TimePicker.RangePicker + DatePicker (recommended)
**Notes:** 총 근무시간 자동 계산. 나의 근무현황은 Column+Line 차트.

---

## 월말결산 마감 워크플로우

| Option | Description | Selected |
|--------|-------------|----------|
| 상태 전환 기반 | 작성중->마감->마감취소, ConfirmDialog 사용 | v |
| Steps 워크플로우 | 작성->검토->마감 다단계 Steps UI | |
| 단순 버튼 | 마감/마감취소 토글 버튼만 | |

**User's choice:** [auto] 상태 전환 기반 (recommended)
**Notes:** 마감취소 시 사유 입력 필수. 마감기한은 체계관리자 전용 설정.

---

## 당직개소 구조

| Option | Description | Selected |
|--------|-------------|----------|
| CRUD 페이지 그룹 + 승인 워크플로우 | 관리/변경/개인설정 각각 독립 페이지 | v |
| 통합 관리 페이지 | 단일 페이지에 Tabs로 모든 당직 기능 | |

**User's choice:** [auto] CRUD 페이지 그룹 + 승인 워크플로우 (recommended)
**Notes:** 메뉴 구조가 이미 세분화되어 있으므로 독립 페이지가 자연스러움.

---

## 부대기/부대마크 이미지

| Option | Description | Selected |
|--------|-------------|----------|
| antd Upload + Image 미리보기 | Upload.Dragger + Image 컴포넌트 | v |
| Base64 직접 입력 | 파일 선택 없이 직접 인코딩 | |

**User's choice:** [auto] antd Upload + Image 미리보기 (recommended)
**Notes:** MVP에서 Base64 로컬 표시. 목록에 썸네일, 상세에 원본.

---

## 입력통계 대시보드

| Option | Description | Selected |
|--------|-------------|----------|
| 단일 페이지 + Select 전환 | 통계종류 Select로 5종 전환 | v |
| Tabs 5개 | 각 통계별 Tab 패널 | |
| 개별 페이지 5개 | 각 통계별 독립 라우트 | |

**User's choice:** [auto] 단일 페이지 + Select 전환 (recommended)
**Notes:** req_analysis에 소메뉴가 "입력 통계" 하나이므로 단일 페이지가 적합. 완료율은 Progress 컴포넌트.

---

## 권한신청/관리 플로우

| Option | Description | Selected |
|--------|-------------|----------|
| 전용 권한신청 + Phase 1 관리 재사용 | 부대계보 전용 신청 페이지 + Phase 1 auth-group lazy | v |
| Phase 1 권한관리만 재사용 | 부대계보 전용 신청 없이 Phase 1 관리만 | |

**User's choice:** [auto] 전용 권한신청 + Phase 1 관리 재사용 (recommended)
**Notes:** 부대계보는 독자적 권한체계(계보담당/중간결재자/확인관/부대관리자)가 있으므로 전용 신청 필요.

---

## Claude's Discretion

- MSW Mock 데이터 구조 및 Faker.js 시드
- 테이블 컬럼 구성 상세 (req_analysis 기반)
- 검색 필터 조건 조합
- 차트 색상/스타일 디테일
- Tree 노드 아이콘/스타일
- Calendar 셀 렌더링 상세

## Deferred Ideas

None
