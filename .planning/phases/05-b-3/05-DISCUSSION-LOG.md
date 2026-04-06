# Phase 5: 중복잡도 서브시스템 B 3개 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 05-중복잡도 서브시스템 B 3개
**Areas discussed:** 좌석 선택 UI, 보안등급 자료관리, 열람/대출/반납 워크플로우, 직무기술서 작성 폼, 개인/부서 JD 구분, 타군 사용자 인증, 타군 로그인 경로, 승차권 인쇄, 평가심의/파기, 대기자 자동배정, 위규자 제재, 표준업무시간

---

## 좌석 선택 UI (주말버스)

| Option | Description | Selected |
|--------|-------------|----------|
| 그리드 격자 (추천) | antd Row/Col 기반 Button 그리드, 색상으로 상태 구분 | ✓ |
| CSS 버스 도식 | CSS Grid로 실제 버스 내부 모양 근사 | |
| 단순 테이블 선택 | DataTable에 체크박스 선택 | |

**User's choice:** 그리드 격자 (추천)
**Notes:** 파랑=빈좌석, 회색=예약됨, 초록=내선택, 빨간=불가 색상 체계

---

## 보안등급 분류 (군사자료)

| Option | Description | Selected |
|--------|-------------|----------|
| Tag 색상 구분 (추천) | antd Tag로 등급 표시 (red/orange/blue), 필터 조회 | ✓ |
| Badge + 등급별 탭 분리 | Tabs로 등급별 탭 분리 | |

**User's choice:** Tag 색상 구분 (추천)
**Notes:** MVP에서는 모든 등급 접근 가능, 시각적 구분만 제공

---

## 열람/대출/반납 워크플로우

| Option | Description | Selected |
|--------|-------------|----------|
| Steps + StatusBadge (추천) | Phase 4 Steps 결재 패턴 재사용 | ✓ |
| 상태 전환 버튼만 | Phase 3 단순 상태변경 패턴 | |

**User's choice:** Steps + StatusBadge (추천)
**Notes:** 열람신청→승인→대출→반납완료 4단계 Steps

---

## 직무기술서 작성 폼

| Option | Description | Selected |
|--------|-------------|----------|
| antd Steps 단계별 폼 (추천) | 5단계: 기본정보→업무분류→시간배분→역량→완료 | ✓ |
| Tabs 구분 단일 폼 | Tabs로 섹션 구분, 하나의 Form | |

**User's choice:** antd Steps 단계별 폼 (추천)
**Notes:** 임시저장 지원, 업무분류에서 Form.List 동적 추가

---

## 개인 vs 부서 직무기술서 구분

| Option | Description | Selected |
|--------|-------------|----------|
| 동일 폼 + 유형 탭 (추천) | type prop으로 구분, Tabs로 3개 탭 | ✓ |
| 별도 페이지 분리 | 개인JD/부서JD 완전 분리 | |

**User's choice:** 동일 폼 + 유형 탭 (추천)
**Notes:** 나의개인JD/직책JD/부서JD 3개 탭

---

## 타군 사용자 인증

| Option | Description | Selected |
|--------|-------------|----------|
| Mock 회원가입 플로우 (추천) | 관리자 CRUD + 승인/반려만 | |
| 타군 전용 로그인 페이지 | 별도 /sys10/login 경로 | ✓ |
| 관리자 CRUD만 | 로그인/회원가입 UI 생략 | |

**User's choice:** 타군 전용 로그인 페이지
**Notes:** 추천 옵션 대신 별도 로그인 페이지 선택 — req_analysis 회원등록/로그인 요건 완전 충족

---

## 타군 로그인 경로

| Option | Description | Selected |
|--------|-------------|----------|
| /sys10/login 별도 경로 (추천) | RequireAuth 바깥, 메인 포탈 접근 불가 | ✓ |
| 메인 로그인에 탭 추가 | 기존 /login에 해병대/타군 탭 | |

**User's choice:** /sys10/login 별도 경로 (추천)
**Notes:** 타군 사용자는 주말버스 예약 화면만 접근 가능

---

## 승차권 인쇄

| Option | Description | Selected |
|--------|-------------|----------|
| PrintableReport 재사용 (추천) | Phase 4 인쇄 패턴 재사용 | ✓ |
| 모달 보기만 | 인쇄 기능 없이 Modal 표시만 | |

**User's choice:** PrintableReport 재사용 (추천)

---

## 평가심의/파기 워크플로우

| Option | Description | Selected |
|--------|-------------|----------|
| antd Upload + 검증 모달 (추천) | 엑셀 업로드→파싱→검증→일괄저장 | ✓ |
| 인라인 테이블 직접 입력 | DataTable 내 행별 편집 | |

**User's choice:** antd Upload + 검증 모달 (추천)
**Notes:** 결과값 ①파기 ②보존기간연장 ③연장기간

---

## 대기자 자동배정

| Option | Description | Selected |
|--------|-------------|----------|
| FIFO 순번 + 버튼 (추천) | 대기순번대로 빈좌석 자동배정 | ✓ |
| 수동배정만 | 관리자 개별 선택 배정 | |

**User's choice:** FIFO 순번 + 버튼 (추천)
**Notes:** 계급별 우선순위는 예약시간관리에서 오픈시간 차등으로 간접 구현

---

## 위규자 제재

| Option | Description | Selected |
|--------|-------------|----------|
| DataTable + 제재기간 필드 (추천) | CRUD + DatePicker.RangePicker + 예약차단 | ✓ |
| 단순 목록 관리 | 제재기간/차단 로직 없이 기록만 | |

**User's choice:** DataTable + 제재기간 필드 (추천)
**Notes:** 제재중 사용자 예약 시 400 응답

---

## 표준업무시간 관리

| Option | Description | Selected |
|--------|-------------|----------|
| DataTable + 상태 자동계산 (추천) | 신분별 CRUD + 적용만료/적용중/적용예정 자동 | ✓ |
| 단순 CRUD만 | 상태 자동계산 없이 수동 입력 | |

**User's choice:** DataTable + 상태 자동계산 (추천)
**Notes:** 현재일 기준 날짜 비교로 프론트엔드 자동 계산

---

## Claude's Discretion

- MSW Mock 데이터 구조 및 Faker.js 시드
- 검색 필터 조건 조합
- 테이블 컬럼 구성
- 좌석 그리드 세부 스타일링
- 차트 종류/색상
- Steps 폼 필드 상세 배치
- 타군 로그인 페이지 레이아웃

## Deferred Ideas

None — discussion stayed within phase scope
