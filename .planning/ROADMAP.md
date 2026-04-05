# Roadmap: 해병대 행정포탈 시스템

## Overview

React + TypeScript + Vite 기반 단일 SPA로 18개 서브시스템(845개 단위 프로세스)을 구현한다. Phase 0에서 FSD 아키텍처와 공통 컴포넌트를 동결하고, Phase 1에서 공통 기능(권한/결재/게시판)을 완성한 뒤, Phase 2에서 포탈 진입점을 완성한다. Phase 3~7은 복잡도 순서로 서브시스템을 적층하여 845개 프로세스를 100% 커버한다. 백엔드(Java)는 v2 범위이며, 전 단계 MSW Mock으로 동작한다.

## Phases

**Phase Numbering:**
- Integer phases (0~7): 계획된 마일스톤 작업
- Decimal phases (X.1, X.2): 긴급 삽입 (INSERTED 표시)

Decimal phases는 숫자 순서대로 정수 Phase 사이에 실행된다.

- [x] **Phase 0: 프로젝트 기반 구축** - FSD 구조, 공통 컴포넌트 라이브러리, MSW/라우팅/상태관리 기반 동결 (completed 2026-04-05)
- [ ] **Phase 1: 공통 기능 (99_공통기능)** - 권한관리, 결재선, 코드관리, 공통게시판, 시스템관리 82개 프로세스
- [ ] **Phase 2: 메인 포탈 (00_포탈)** - 로그인/로그아웃, 대시보드, 세션관리 완전 동작
- [ ] **Phase 3: 저복잡도 서브시스템 5개** - 인증서/행정규칙/나의제언/연구자료/회의실 85개 프로세스
- [ ] **Phase 4: 중복잡도 서브시스템 A 6개** - 지식/검열/규정/설문/지시건의/영현보훈 176개 프로세스
- [ ] **Phase 5: 중복잡도 서브시스템 B 3개** - 군사자료/주말버스/직무기술서 131개 프로세스
- [ ] **Phase 6: 고복잡도 서브시스템 2개** - 부대계보(트리뷰)/초과근무(캘린더) 158개 프로세스
- [ ] **Phase 7: 최고복잡도 서브시스템 2개** - 성과관리(KPI차트)/보안일일결산(복합워크플로우) 214개 프로세스

## Phase Details

### Phase 0: 프로젝트 기반 구축
**Goal**: 이후 845개 화면을 일관성 있게 개발할 수 있는 컨벤션과 공통 기반이 동결된다
**Depends on**: 없음 (첫 번째 Phase)
**Requirements**: BASE-01, BASE-02, BASE-03, BASE-04, BASE-05, BASE-06, BASE-07, BASE-08, BASE-09
**Success Criteria** (what must be TRUE):
  1. 개발자가 `npm run dev`로 앱을 실행하면 FSD 폴더 구조(`app/pages/widgets/features/entities/shared`)가 설정된 빈 프로젝트가 브라우저에 열린다
  2. `shared/ui`의 DataTable, ProForm, Modal, SearchForm 컴포넌트를 import하여 샘플 화면을 만들 수 있다
  3. MSW가 활성화된 상태에서 Mock API 응답이 네트워크 탭에 보이며, 컴포넌트가 해당 데이터를 렌더링한다
  4. `/sys01/`, `/sys02/` 등 URL 컨벤션 문서에 정의된 경로로 접근하면 lazy-loaded 서브시스템 레이아웃이 로드된다
  5. Zustand AuthStore에 Mock 사용자를 설정하면 ProtectedRoute가 접근을 허용하고, 미인증 시 로그인으로 리다이렉트한다
**Plans**: 3 plans
Plans:
- [x] 00-01-PLAN.md -- Vite+FSD 프로젝트 초기화, Tailwind+antd 테마, 공통 타입
- [x] 00-02-PLAN.md -- Zustand/MSW/TanStack Query, React Router 라우팅, ProLayout 레이아웃, 인증
- [x] 00-03-PLAN.md -- 공통 UI 컴포넌트 6개, 데모 페이지, URL 컨벤션 문서
**UI hint**: yes

### Phase 1: 공통 기능 (99_공통기능)
**Goal**: 18개 서브시스템이 공유하는 권한관리, 결재선, 코드관리, 공통게시판, 시스템관리가 완전 동작한다
**Depends on**: Phase 0
**Requirements**: COM-01, COM-02, COM-03, COM-04, COM-05, COM-06, COM-07, COM-08, COM-09, COM-10, COM-11, COM-12, COM-13, COM-14
**Success Criteria** (what must be TRUE):
  1. 관리자가 권한그룹을 생성하고, 메뉴별 권한과 사용자/부대를 배정하면 해당 사용자는 지정된 메뉴에만 접근할 수 있다
  2. 사용자가 결재선을 등록하고 수정/삭제하면 결재선 목록에 즉시 반영된다
  3. 코드그룹과 코드를 CRUD 조작하면 다른 화면의 Select/Radio 옵션에 즉시 반영된다
  4. 공통게시판 설정에서 게시판을 생성하면 해당 서브시스템에서 게시글 작성/조회/첨부파일 업로드가 동작한다
  5. 접속로그 화면에서 사용자별 접속 이력을 조회하고 CSV 저장이 동작한다
**Plans**: TBD
**UI hint**: yes

### Phase 2: 메인 포탈 (00_포탈)
**Goal**: 인증된 사용자가 로그인 → 대시보드 → 18개 서브시스템 접속의 전체 플로우가 Mock으로 완전 동작한다
**Depends on**: Phase 1
**Requirements**: PTL-01, PTL-02, PTL-03, PTL-04, PTL-05
**Success Criteria** (what must be TRUE):
  1. 사용자가 ID/PW를 입력하면 Mock 인증이 완료되고 메인 대시보드로 이동하며, 사용자 이름과 소속부대가 헤더에 표시된다
  2. 대시보드에서 서브시스템 링크를 클릭하면 해당 서브시스템 화면으로 이동하고, 서브시스템 내 exit/창닫기 시 메인 대시보드로 돌아온다
  3. 세션 만료(1분 idle 감지)가 발생하면 자동으로 로그인 화면으로 이동하고 만료 안내 메시지가 표시된다
  4. 로그아웃 버튼을 클릭하면 세션이 초기화되고 로그인 화면으로 이동한다
**Plans**: TBD
**UI hint**: yes

### Phase 3: 저복잡도 서브시스템 5개
**Goal**: 5개 저복잡도 서브시스템(85개 프로세스)이 공통 컴포넌트를 재사용하여 완전 동작하고, 재사용 패턴이 확립된다
**Depends on**: Phase 2
**Requirements**: CERT-01, CERT-02, CERT-03, CERT-04, CERT-05, CERT-06, AREG-01, AREG-02, AREG-03, AREG-04, SUGST-01, SUGST-02, SUGST-03, SUGST-04, SUGST-05, RSRC-01, RSRC-02, RSRC-03, RSRC-04, RSRC-05, RSRC-06, ROOM-01, ROOM-02, ROOM-03, ROOM-04, ROOM-05, ROOM-06, ROOM-07
**Success Criteria** (what must be TRUE):
  1. 인증서발급신청체계에서 사용자가 신청서를 작성하고 관리자가 승인/반려하면 상태가 변경되어 등록대장에 반영된다
  2. 행정규칙포탈에서 현행규정과 예규를 목록/상세 조회하고 다운로드 버튼을 클릭할 수 있다
  3. 나의 제언에서 사용자가 제언을 작성하고 추천/신고/비공개 처리가 동작하며 관리자가 답변을 달 수 있다
  4. 연구자료관리체계에서 자료를 등록하고 카테고리별 조회, 다운로드, 통계 화면이 표시된다
  5. 회의실예약체계에서 예약 신청 → 관리자 승인 → 내 예약 확인 플로우가 동작하고, 회의실 정보와 현황을 조회할 수 있다
**Plans**: TBD
**UI hint**: yes

### Phase 4: 중복잡도 서브시스템 A 6개
**Goal**: 6개 중복잡도 서브시스템 A(176개 프로세스)가 결재 워크플로우, 통계 차트, 설문 문항 등 복합 패턴을 포함하여 완전 동작한다
**Depends on**: Phase 3
**Requirements**: KNOW-01, KNOW-02, KNOW-03, KNOW-04, KNOW-05, KNOW-06, KNOW-07, KNOW-08, INSP-01, INSP-02, INSP-03, INSP-04, INSP-05, INSP-06, INSP-07, INSP-08, INSP-09, INSP-10, INSP-11, INSP-12, MREG-01, MREG-02, MREG-03, MREG-04, MREG-05, MREG-06, MREG-07, MREG-08, SURV-01, SURV-02, SURV-03, SURV-04, SURV-05, SURV-06, SURV-07, DRCT-01, DRCT-02, DRCT-03, DRCT-04, DRCT-05, DRCT-06, DRCT-07, HONOR-01, HONOR-02, HONOR-03, HONOR-04, HONOR-05, HONOR-06, HONOR-07, HONOR-08, HONOR-09, HONOR-10, HONOR-11, HONOR-12, HONOR-13, HONOR-14, HONOR-15, HONOR-16, HONOR-17
**Success Criteria** (what must be TRUE):
  1. 지식관리체계에서 지식을 등록하면 관리자가 승인/반려할 수 있고, 분야별/부대별 통계 차트가 표시된다
  2. 검열결과관리체계에서 검열계획 등록 → 결과 입력 → 결재 대기/승인 플로우가 동작하고, 추진현황 통계 차트가 표시된다
  3. 설문종합관리체계에서 관리자가 설문 문항을 생성하고 배포하면, 사용자가 응답하고 결과 분석 화면에서 응답 통계를 확인할 수 있다
  4. 지시건의사항관리체계에서 지휘관 지시/건의 사항을 등록하고 이행현황을 추적하며 통계 차트를 조회할 수 있다
  5. 영현보훈체계에서 사망자/상이자를 등록하고 부대별/신분별/연도별 현황 보고서를 조회 및 저장할 수 있다
**Plans**: TBD
**UI hint**: yes

### Phase 5: 중복잡도 서브시스템 B 3개
**Goal**: 3개 중복잡도 서브시스템 B(131개 프로세스)가 보안등급 분류, 좌석 선택 UI, 계층 구조 직무기술서 결재를 포함하여 완전 동작한다
**Depends on**: Phase 4
**Requirements**: MDATA-01, MDATA-02, MDATA-03, MDATA-04, BUS-01, BUS-02, BUS-03, BUS-04, BUS-05, BUS-06, BUS-07, BUS-08, BUS-09, JOB-01, JOB-02, JOB-03, JOB-04, JOB-05, JOB-06, JOB-07, JOB-08
**Success Criteria** (what must be TRUE):
  1. 군사자료관리체계에서 자료를 보안등급별로 분류하여 등록하고, 열람신청 → 대출 → 반납 플로우가 동작하며, 다양한 각도의 통계 현황을 차트로 확인할 수 있다
  2. 주말버스예약관리체계에서 사용자가 노선을 조회하고 좌석을 선택하여 예약하면, 관리자가 배차를 관리하고 대기자 자동배정을 실행할 수 있다
  3. 직무기술서관리체계에서 사용자가 직무기술서를 작성(업무분류, 시간배분, 역량입력 포함)하고 결재를 요청하면, 결재선에 따른 승인/반려가 동작한다
**Plans**: TBD
**UI hint**: yes

### Phase 6: 고복잡도 서브시스템 2개
**Goal**: 2개 고복잡도 서브시스템(158개 프로세스)이 부대 계층 트리 뷰와 캘린더 기반 초과근무 입력이라는 신규 UI 패턴을 포함하여 완전 동작한다
**Depends on**: Phase 5
**Requirements**: UNIT-01, UNIT-02, UNIT-03, UNIT-04, UNIT-05, UNIT-06, UNIT-07, UNIT-08, UNIT-09, UNIT-10, UNIT-11, OT-01, OT-02, OT-03, OT-04, OT-05, OT-06, OT-07, OT-08, OT-09, OT-10, OT-11, OT-12, OT-13, OT-14, OT-15, OT-16, OT-17, OT-18, OT-19, OT-20, OT-21, OT-22, OT-23, OT-24, OT-25, OT-26, OT-27, OT-28
**Success Criteria** (what must be TRUE):
  1. 부대계보관리체계에서 계층 트리 뷰로 부대 계승 관계를 시각적으로 탐색하고, 부대기록부/주요직위자/주요활동을 CRUD할 수 있으며, 입력 완료율 통계가 표시된다
  2. 부대계보 주요활동에 대한 결재 요청 → 승인/반려 플로우가 동작하고, 권한 신청 → 관리자 승인 프로세스가 완전히 작동한다
  3. 초과근무관리체계에서 사용자가 신청서를 작성하고 결재를 받으면, 나의 근무현황 그래프에 반영되고 월말결산에 집계된다
  4. 초과근무 일괄처리 승인, 최대인정시간/근무시간 관리, 당직개소 설정 등 관리자 기능 전체가 동작한다
**Plans**: TBD
**UI hint**: yes

### Phase 7: 최고복잡도 서브시스템 2개
**Goal**: 2개 최고복잡도 서브시스템(214개 프로세스)이 KPI 차트 기반 성과관리와 138개 프로세스 규모의 보안일일결산 복합 워크플로우를 포함하여 완전 동작한다
**Depends on**: Phase 6
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08, PERF-09, PERF-10, PERF-11, PERF-12, PERF-13, PERF-14, PERF-15, PERF-16, PERF-17, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06, SEC-07, SEC-08, SEC-09, SEC-10, SEC-11, SEC-12, SEC-13, SEC-14, SEC-15, SEC-16, SEC-17, SEC-18, SEC-19, SEC-20, SEC-21, SEC-22, SEC-23, SEC-24, SEC-25, SEC-26, SEC-27, SEC-28
**Success Criteria** (what must be TRUE):
  1. 성과관리체계에서 과제를 등록하고 하위 과제와 지표를 설정하면, 업무실적 입력 → 승인 → 평가 플로우가 동작하고, 추진진도율과 평가결과를 차트로 시각화할 수 있다
  2. 성과관리 기준정보(과제분류, 평가기준, 가중치, 평가기간)와 평가조직(평가자/피평가자 지정)을 설정하면 전체 평가 프로세스가 해당 설정에 따라 동작한다
  3. 보안일일결산체계에서 개인/사무실/일일보안점검관 결산 체크리스트를 작성하고 제출하면 결재 대기 목록에 나타나 승인/반려가 가능하다
  4. 비밀/저장매체/보안자재 관리 CRUD와 인계/인수 플로우가 동작하고, 부대별 종합현황을 조회할 수 있다
  5. 보안일일결산 점검항목 관리, 예외처리, 알림시간, 휴무일 설정 등 전체 관리자 기능이 동작하고, 개인보안수준평가 통계 차트가 표시된다
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. 프로젝트 기반 구축 | 3/3 | Complete   | 2026-04-05 |
| 1. 공통 기능 (99_공통기능) | 0/TBD | Not started | - |
| 2. 메인 포탈 (00_포탈) | 0/TBD | Not started | - |
| 3. 저복잡도 서브시스템 5개 | 0/TBD | Not started | - |
| 4. 중복잡도 서브시스템 A 6개 | 0/TBD | Not started | - |
| 5. 중복잡도 서브시스템 B 3개 | 0/TBD | Not started | - |
| 6. 고복잡도 서브시스템 2개 | 0/TBD | Not started | - |
| 7. 최고복잡도 서브시스템 2개 | 0/TBD | Not started | - |
