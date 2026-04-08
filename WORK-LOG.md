# Work Log - 해병대 행정포탈 시스템

> 모든 작업을 시계열 순서로 기록. 시작시간, 종료시간, 소요시간, 작업명, 내용 포함.

---

## 2026-04-05 (Day 1)

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 1 | 2026-04-05 | 00:56 | 2026-04-05 | 01:15 | 19m | - | GSD 초기화 | `/gsd:new-project` 실행. config.json, PROJECT.md 생성 | config.json, PROJECT.md |
| 2 | 2026-04-05 | 01:15 | 2026-04-05 | 01:25 | 10m | - | 도메인 리서치 | 4개 병렬 연구: Stack/Features/Architecture/Pitfalls | 4개 리서치 문서 생성 |
| 3 | 2026-04-05 | 01:25 | 2026-04-05 | 01:30 | 5m | - | 리서치 종합 | gsd-research-synthesizer로 4개 결과 종합 | SUMMARY.md |
| 4 | 2026-04-05 | 01:30 | 2026-04-05 | 01:35 | 5m | - | 요구사항 정의 | 845개 프로세스 → 209개 요구사항 정리 | REQUIREMENTS.md |
| 5 | 2026-04-05 | 01:35 | 2026-04-05 | 01:40 | 5m | - | 로드맵 생성 | 8 Phase 로드맵 + STATE.md 초기화 | ROADMAP.md, STATE.md |
| 6 | 2026-04-05 | 01:40 | 2026-04-05 | 01:45 | 5m | 0 | Phase 0 Context | 24개 구현 결정 자동 수집 | 00-CONTEXT.md |
| 7 | 2026-04-05 | 01:50 | 2026-04-05 | 02:15 | 25m | 0 | Phase 0 Plan | Research→Plan(3)→Verify(2회) 완료 | 3 plans, 3 waves |
| 8 | 2026-04-05 | 11:44 | 2026-04-05 | 12:46 | 62m | 0 | Phase 0 검증/개선 | 빌드에러, 크로스탭 로그아웃, 메뉴구조, 네비게이션 수정 | 커밋 9bc648d |
| 9 | 2026-04-05 | 13:00 | 2026-04-05 | 13:53 | 53m | 1 | Phase 1 Plan (1차) | Research→Plan(4)→Verify(3회, 3 iteration) 완료 | 4 plans, 4 waves |
| 10 | 2026-04-05 | 13:53 | 2026-04-05 | 14:10 | 17m | 1 | UI-SPEC 생성 | UI Design Contract 생성→Verify(1회) APPROVED | 01-UI-SPEC.md |
| 11 | 2026-04-05 | 14:10 | 2026-04-05 | 14:31 | 21m | 1 | Phase 1 Plan (UI-SPEC 반영) | Replan(UI-SPEC 통합)→Verify(1회) PASSED | 4 plans 업데이트 |
| 12 | 2026-04-05 | 14:31 | 2026-04-05 | 14:35 | 4m | - | GitHub Push + 세션 정리 | origin/master push, 문서 정리 | 커밋 d1dc7f6 |

## 2026-04-05 (Day 2 - Session 2)

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 13 | 2026-04-05 | 19:00 | 2026-04-05 | 20:30 | 90m | 1 | Phase 1 Execute | 4 Wave 순차 실행, 66→98 tests | VERIFICATION 5/5 |
| 14 | 2026-04-05 | 20:30 | 2026-04-05 | 20:45 | 15m | 2 | Phase 2 Discuss | 4개 gray area 토론 (대시보드/세션/전환/브랜딩) | 02-CONTEXT.md, 12 decisions |
| 15 | 2026-04-05 | 20:45 | 2026-04-05 | 21:15 | 30m | 2 | Phase 2 UI-SPEC | UI researcher→checker→revision→re-check APPROVED | 02-UI-SPEC.md |
| 16 | 2026-04-05 | 21:15 | 2026-04-05 | 22:00 | 45m | 2 | Phase 2 Plan | Research→Plan(2)→Verify→Revision→Re-verify PASSED | 2 plans, 1 wave |
| 17 | 2026-04-05 | 22:00 | 2026-04-05 | 23:00 | 60m | 2 | Phase 2 Execute | Wave 1 병렬 실행 (02-01, 02-02) | 98 tests passed |
| 18 | 2026-04-05 | 23:00 | 2026-04-05 | 23:20 | 20m | 2 | Phase 2 Verify | Verifier 11/11 passed, Phase 완료 처리 | 02-VERIFICATION.md |

### Day 2 누적 통계

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 6 (세션 2) |
| 총 소요 시간 | ~260분 (~4.3시간) |
| Phase 진행 | Phase 1 실행 완료, Phase 2 전체 완료 |
| 테스트 | 98/98 passed (19 test files) |
| Git 커밋 수 | ~15 (세션 2) |

### 전체 누적 통계

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 20 |
| 총 소요 시간 | ~526분 (~8.8시간) |
| Phase 진행 | Phase 0, 1, 2, 3 실행 완료 → Phase 4 대기 |
| 테스트 | 250/250 passed (24 test files) |
| Git 커밋 수 | ~50 |
| GitHub | https://github.com/lapiogga/navy-admin.git (master) |

## 2026-04-06 (Day 3 - Session 3)

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 19 | 2026-04-06 | 01:25 | 2026-04-06 | 01:42 | 17m | 3 | Phase 3 Execute | 5 plans 병렬 실행 (03-01~05), 152 new tests | 250/250 tests, 5/5 plans |
| 20 | 2026-04-06 | 01:42 | 2026-04-06 | 01:50 | 8m | 3 | Phase 3 Verify | Verifier 5/5 must-haves, REQUIREMENTS gap fix | 03-VERIFICATION.md |
| 21 | 2026-04-06 | 01:50 | 2026-04-06 | 01:55 | 5m | 4 | Phase 4 Discuss | 6개 gray area 자동 결정 (결재/설문/차트/보고서/규정재사용/현황) | 04-CONTEXT.md, 27 decisions |

### Day 3 누적 통계

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 3 (세션 3) |
| 총 소요 시간 | ~30분 |
| Phase 진행 | Phase 3 실행+검증 완료, Phase 4 discuss 완료 |
| 테스트 | 250/250 passed (24 test files) |
| Git 커밋 수 | ~15 (세션 3) |

### 전체 누적 통계 (업데이트)

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 21 |
| 총 소요 시간 | ~556분 (~9.3시간) |
| Phase 진행 | Phase 0, 1, 2, 3 실행 완료 → Phase 4 plan 대기 |
| 테스트 | 250/250 passed (24 test files) |
| Git 커밋 수 | ~65 |
| GitHub | https://github.com/lapiogga/navy-admin.git (master) |

## 2026-04-06 (Day 4 - Session 5)

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 22 | 2026-04-06 | 10:40 | 2026-04-06 | 10:45 | 5m | 3 | 빌드 에러 수정 | Record<string,unknown> 누락, 미사용 변수/import 수정 | 빌드 에러 61→28 |
| 23 | 2026-04-06 | 10:45 | 2026-04-06 | 10:59 | 14m | 3 | Phase 3 패치 실행 | 03-06~10 (SYS04/05/11/14/16) 5개 병렬 에이전트 | SYS04,11,16 이미 완료, SYS05 CRUD 보강, SYS14 반려모달/엑셀/검색 패치 |
| 24 | 2026-04-06 | 10:59 | 2026-04-06 | 11:10 | 11m | 1 | common/ 타입 에러 수정 + 빌드/테스트 | Phase 1 공통기능 28개 에러 수정, 빌드 0 에러, 328/328 tests | 빌드 성공, 테스트 전체 통과 |
| 25 | 2026-04-06 | 11:10 | 2026-04-06 | 12:04 | 54m | 4 | Phase 4 Execute | 6 plans 1 wave 병렬 실행 (SYS13/17/06/02/12/09) | 574/574 tests, 6/6 plans 완료 |
| 26 | 2026-04-06 | 12:04 | 2026-04-06 | 12:25 | 21m | 4 | Phase 4 Verify + 완료 | Verifier 통과, REQUIREMENTS 업데이트, Phase 4 완료 | 04-VERIFICATION.md |
| 27 | 2026-04-06 | 12:25 | 2026-04-06 | 13:00 | 35m | 5 | Phase 5 Discuss | 12개 gray area 토론 (좌석UI/보안등급/열람대출/JD폼/타군인증/평가심의/대기자/위규자/표준시간) | 05-CONTEXT.md, 38 decisions |
| 28 | 2026-04-06 | 13:00 | 2026-04-06 | 13:06 | 6m | - | 문서 현행화 + Push | WORK-LOG/STATE 현행화, navy-admin push, 대기 상태 전환 | GitHub 배포 완료 |

### Day 4-5 누적 통계

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 7 (세션 4-5) |
| 총 소요 시간 | ~146분 (~2.4시간) |
| Phase 진행 | Phase 3 패치, Phase 4 전체 완료, Phase 5 discuss 완료 |
| 테스트 | 574/574 passed (30 test files) |
| Git 커밋 수 | ~30 (세션 4-5) |

## 2026-04-06 (Day 4 - Session 6)

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 29 | 2026-04-06 | 13:10 | 2026-04-06 | 14:30 | 80m | 5 | Phase 5 Plan+Execute | Research→Plan(5)→Execute Wave1+2 (SYS07/10/18) | 173 tests, 5/5 plans, Phase 5 완료 |
| 30 | 2026-04-06 | 14:30 | 2026-04-06 | 15:00 | 30m | 6 | Phase 6 Discuss+Plan | 7개 gray area, 42 decisions, 3 plans 2 waves | 06-CONTEXT.md, 06-01~03-PLAN.md |
| 31 | 2026-04-06 | 15:00 | 2026-04-06 | 17:00 | 120m | 6 | Phase 6 Execute | Wave1+2 병렬 (SYS08/SYS01), 871 tests | 6/6 commits, Phase 6 완료 |
| 32 | 2026-04-06 | 17:00 | 2026-04-06 | 18:30 | 90m | 7 | Phase 7 Discuss+Plan | 10개 gray area 자동결정, 49 decisions, 6 plans 3 waves | 07-CONTEXT/RESEARCH/VALIDATION/01~06-PLAN.md |
| 33 | 2026-04-06 | 20:00 | 2026-04-06 | 21:00 | 60m | 7 | Phase 7 Execute Wave1+2 | SYS03 전체 17페이지 + SYS15 비밀매체+일일결산 | 1092 tests, Wave1+2 완료 |
| 34 | 2026-04-06 | 21:00 | 2026-04-06 | 21:40 | 40m | 7 | Phase 7 Execute Wave3 | SYS15 관리자+종합현황 11페이지 + UI-SPEC | 1159 tests, Wave3 완료 |
| 35 | 2026-04-06 | 21:40 | 2026-04-06 | 22:10 | 30m | 7 | Phase 7 Verify+Gap Fix | 4 gaps 수정 (Gauge+Bar 차트, Steps, 인쇄, 테스트) | 1195 tests, 14/14 passed |
| 36 | 2026-04-06 | 22:10 | 2026-04-06 | 22:20 | 10m | - | Push + 로그 업데이트 | 2nd_biz + navy-admin push, WORK-LOG 현행화 | GitHub 배포 완료 |

## 2026-04-07 (Day 5 - Session 8)

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 37 | 2026-04-07 | 13:20 | 2026-04-07 | 13:23 | 3m | - | v1.0.0 태그 + Push | 107개 파일 커밋, GitHub push, git tag v1.0.0 | v1.0.0 태그 생성 |
| 38 | 2026-04-07 | 13:23 | 2026-04-07 | 13:35 | 12m | - | 서브시스템 메인화면 구현 | 18개 서브시스템 메인화면(타이틀200px+대시보드+공지/질의응답) 공통 컴포넌트 생성, Mock API 추가, 라우트 수정, CSV 업데이트 | SubsystemHomePage, 18 index.tsx, 18 CSV |

| 39 | 2026-04-07 | 13:35 | 2026-04-07 | 14:00 | 25m | - | spec-doc 5종 생성 | 시스템조감도/업무분석서/다이어그램/메뉴구조도/상관관계도 신규 생성 | spec-doc/01~05_*.md |
| 40 | 2026-04-07 | 14:00 | 2026-04-07 | 14:30 | 30m | - | GAP 분석 + 공통 컴포넌트 수정 | req_spec CSV vs 구현화면 비교, DataTable/SearchForm/CrudForm/military.ts 수정 | 06_GAP분석.md, 4개 공통 컴포넌트 |
| 41 | 2026-04-07 | 14:30 | 2026-04-07 | 15:00 | 30m | 3 | Wave 1 GAP 수정 | SYS04/05/14/11/16 (저복잡도 5개) SearchForm+militaryPersonColumn+입력값 반영 | 21개 파일 수정 |
| 42 | 2026-04-07 | 15:00 | 2026-04-07 | 15:40 | 40m | 4 | Wave 2 GAP 수정 | SYS13/17/06/02/12/09 (중복잡도A 6개) SearchForm+militaryPersonColumn+독립화(SYS06) | 31개 파일 수정 |
| 43 | 2026-04-07 | 15:40 | 2026-04-07 | 16:20 | 40m | 5 | Wave 3 GAP 수정 | SYS07/10/18 (중복잡도B 3개) 검색조건 확장+CSV 입력값 전부 반영 | 21개 파일 수정 |
| 44 | 2026-04-07 | 16:20 | 2026-04-07 | 17:30 | 70m | 6,7 | Wave 4 GAP 수정 | SYS08/01/03/15 (고/최고복잡도 4개) 47개 파일 대규모 수정 | 47개 파일 수정 |
| 45 | 2026-04-07 | 17:30 | 2026-04-07 | 18:00 | 30m | - | spec-doc 5종 재생성 | GAP 수정 반영하여 5개 문서 전면 재작성 | spec-doc/01~05_*.md |
| 46 | 2026-04-07 | 18:00 | 2026-04-07 | 18:30 | 30m | - | 마크다운 문서 전체 업그레이드 | .planning/ 80+ 마크다운 파일 GAP 수정 내역 반영, PPT 생성 | 80+ 파일 업데이트 |
| 47 | 2026-04-07 | 18:30 | 2026-04-07 | 19:00 | 30m | - | UI 공통 7개 수정 | 검색영역 가변높이, 타이틀삭제, 헤더/사이드바 시인성, 날짜1줄, 상태태그, 버튼3D, 여백통일 | 6개 공통 컴포넌트 수정 |
| 48 | 2026-04-07 | 19:00 | 2026-04-07 | 19:30 | 30m | - | 군번 규칙 적용 | 해군 군번 부여규칙 기반 mockServiceNumber.ts 생성, 18개 핸들러 일괄 교체 | 19개 파일 수정 |
| 49 | 2026-04-07 | 19:30 | 2026-04-07 | 20:00 | 30m | - | 부대 조직도 적용 | 해군/해병대 조직도 기반 mockUnits.ts 생성, 14개 핸들러 부대명 교체 | 15개 파일 수정 |
| 50 | 2026-04-07 | 20:00 | 2026-04-07 | 20:15 | 15m | - | 문서 현행화 + GitHub 배포 | WORK-LOG/TERMINAL-LOG/CLAUDE.md 업데이트, git push | GitHub 배포 |

## 2026-04-08 (Day 6) - 세션 10~11

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 52 | 2026-04-08 | - | 2026-04-08 | - | - | - | SYS03 과제관리 메뉴/화면 수정 | 과제관리 단일메뉴→5개 children 확장, 중과제 관리 페이지 신규 생성 | menus.ts, PerfMidTaskPage.tsx, index.tsx |
| 53 | 2026-04-08 | - | 2026-04-08 | - | - | - | SYS02 DataTable 수정 | DataTable에 dataSource/loading props 추가, SYS02 설문 데이터 표시 복구 | DataTable.tsx |
| 54 | 2026-04-08 | - | 2026-04-08 | - | - | - | SYS07 검색영역 높이 예외처리 | SearchForm에 containerStyle prop 추가, MilDataListPage maxHeight:240 적용 | SearchForm.tsx, MilDataListPage.tsx |
| 55 | 2026-04-08 | - | 2026-04-08 | - | - | - | SYS08 권한신청 폼 콤팩트화 | 세로 나열 → Row/Col 3열 그리드 배치 | UnitAuthRequestPage.tsx |
| 56 | 2026-04-08 | - | 2026-04-08 | - | - | - | SYS08 입력통계 차트 수정 | Bar(가로막대) → Column(세로막대) 컴포넌트 교체 | UnitStatsPage.tsx |
| 57 | 2026-04-08 | - | 2026-04-08 | - | - | - | SYS09 자료입력 데이터 미표시 수정 | DataTable queryKey/requestFn → request/rowKey 변경 (3개 페이지) | DeceasedPage, InjuredPage, ReviewPage |
| 58 | 2026-04-08 | - | 2026-04-08 | - | - | - | SYS09 확인서 4개 페이지 재구성 | Select→DataTable 목록+Modal 팝업 미리보기 구조로 전면 재작성 | CertMerit*, CertReview*, CertDeath* |

### Day 6 세션 10~11 통계

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 7 |
| 변경 파일 | 15개 (신규 1, 수정 14) |
| 수정 서브시스템 | SYS02, SYS03, SYS07, SYS08, SYS09 + 공통(DataTable, SearchForm) |

### Day 5 누적 통계

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 14 (세션 8) |
| 총 소요 시간 | ~385분 (~6.4시간) |
| 신규 컴포넌트 | SubsystemHomePage, military.ts, mockServiceNumber.ts, mockUnits.ts |
| GAP 수정 | 18개 서브시스템 전체, 120+ 파일 수정 |
| Mock 데이터 | 해군 군번 규칙 + 부대 조직도 반영 (18개 핸들러) |
| UI 공통 수정 | 검색영역/헤더/사이드바/상태태그/버튼/여백 7개 항목 |
| spec-doc | 6개 문서 + PPT 18개 |

### Day 4 Session 6-7 누적 통계

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 8 (세션 6-7) |
| 총 소요 시간 | ~460분 (~7.7시간) |
| Phase 진행 | Phase 5~7 전체 완료 (마지막 Phase) |
| 테스트 | 1195/1195 passed (42 test files) |
| Git 커밋 수 | ~40 (세션 6-7) |

### 전체 누적 통계 (최종)

| 항목 | 값 |
|------|-----|
| 총 작업 수 | 58 |
| 총 소요 시간 | ~1547분+ (~25.8시간+) |
| Phase 진행 | **Phase 0~7 전체 완료 + GAP 수정 + Mock 데이터 현행화 + 버그 수정 2차** |
| GAP 수정 | 18개 서브시스템 x 6 규칙 = 120+ 파일 수정 |
| Mock 데이터 | 해군 군번 규칙 + 부대 조직도 반영 완료 |
| UI 공통 | 7개 항목 개선 (검색영역/헤더/사이드바/태그/버튼/여백) |
| 테스트 | 1195/1195 passed (42 test files) |
| Git 커밋 수 | ~155 |
| GitHub | https://github.com/lapiogga/navy-admin.git (master) |

---

## 작업 상세 기록

### #7 Phase 0 Plan 수립 상세

**Research (gsd-phase-researcher, sonnet)**
- npm registry에서 최신 버전 확인 (React 19.2.4, Vite 8.x beta, antd 6.3.5)
- antd v5 vs v6 결정 플래그 설정 (설치 시 peer dependency 확인)
- Tailwind v3 유지 (v4는 antd 충돌 미검증)
- MSW 비동기 초기화 패턴 확인
- Tailwind preflight:false 필수 확인
- SUBSYSTEM_META 상수 테이블 작성
- Validation Architecture (Vitest 설정, Wave 0 Gap 6개 식별)

**Plan (gsd-planner, opus)**
- Plan 00-01 (Wave 1): Vite+FSD 초기화, Tailwind+antd 테마, API 타입, Vitest
- Plan 00-02 (Wave 2): Zustand, MSW, React Router, ProLayout, 인증
- Plan 00-03 (Wave 3): 공통 UI 6개, 데모 페이지, URL 문서

**Verify 1차 (gsd-plan-checker, sonnet)** -- 5 blocker, 3 warning
1. Wave 0 테스트 인프라 누락
2. Sampling Continuity 위반 (5개 연속 태스크 테스트 없음)
3. VALIDATION.md의 Plan 04 참조 오류 (3-plan 구조 불일치)
4. BASE-08 세션 만료 자동 체크 구조 누락
5. CLAUDE.md TDD 요건 미충족 (테스트 파일 없음)

**Revision (gsd-planner, opus)** -- 8/8 issues resolved
- Plan 01 Task 1에 Vitest 설정 추가
- 각 Plan에 테스트 파일 생성 (총 8개 테스트)
- useSessionCheck 훅 추가 (세션 만료 자동 체크)
- VALIDATION.md 태스크 맵 수정

**Verify 2차 (gsd-plan-checker, sonnet)** -- PASSED
- 10개 Dimension 전부 통과
- 9/9 요구사항 커버 확인

---

## 2026-04-07 (Day 3) - 세션 9

| # | 시작일자 | 시작시간 | 종료일자 | 종료시간 | Duration | Phase | 작업명 | 내용 | 결과 |
|---|---------|---------|---------|---------|----------|-------|--------|------|------|
| 51 | 2026-04-07 | 21:00 | 2026-04-07 | 22:30 | 90min | - | 10개 버그/개선 수정 | SYS02 설문 오류, SYS03 타이틀, SYS05 조직도, SYS08 병과/차트, SYS09 대상자, SYS10 Mock, SYS11 순번, SYS12 지시사항, SYS99 결재선 | 24개 파일 수정 |

### 세션 9 상세

**수정 항목 (10개):**

| 시스템 | 문제 | 수정 내용 | 파일 수 |
|--------|------|---------|--------|
| SYS02 | surveys.filter 오류 | ApiResult 래퍼 data 추출 수정 (3개 페이지) | 3 |
| SYS03 | 메인 타이틀 제거 | PageContainer title={false} | 1 |
| SYS05 | 조직도/예하부대 해군 변경 | ORG_TREE_DATA, 부서목록, 예하부대 카드 해군 조직으로 | 4 |
| SYS08 | 병과 해군으로 + 차트축 | 육군 병과→해군 병과(항해/기관/전투체계 등), xField/yField 교환 | 3 |
| SYS09 | 대상자 군번/계급/성명 선택 | 4개 증명서 페이지에서 API 목록 조회 + Select label 변경 | 4 |
| SYS10 | Mock 데이터 미표시 | ApiResult 래퍼 누락 - 30개 handler 수정 | 1 |
| SYS11 | 순번 2줄 표시 | width 60 + render index+1 | 3 |
| SYS12 | 대통령/국방부장관 지시사항 구조 | DirectiveList/Progress에 category prop, Mock 데이터 30건+API 16개 추가 | 4 |
| SYS99 | users.map 오류 | Array.isArray 방어 코드 추가 | 1 |
| SYS06 | 해병대규정관리 | 변경 불필요 (현재 해병대 조직 정확) | 0 |

**총 변경**: 24개 파일, +538/-149 lines

---

## 범례

- **Duration**: 작업 소요 시간 (분 단위)
- **Phase**: 해당 Phase 번호 (- = Phase 무관)
- **결과**: 생성/수정된 주요 산출물
