# 다음 세션 작업 지시서 — 1440x900 레이아웃 재구성

**기준 일자**: 2026-04-15 (v1.4.0 이후)
**작업 범위**: SYS01~SYS18 전체 334개 페이지 1440x900 반응형 대응
**전제 상태**: `screenshots-1440/` 캡처본 보유 (334 PNG, 로컬 전용)

---

## 목표

1440x900 해상도에서 넘침/잘림 없이 자연스럽게 보이도록 레이아웃 재구성.
- 검색영역: 공간 부족 시 높이 확장 (현재 고정 100px → auto 또는 min-height)
- 테이블 영역: 폭 초과 시 필수 컬럼만 노출, 보조 컬럼 숨김/축약

---

## Phase A — 공통 컴포넌트 반응형 (1회 수정으로 전역 영향)

### A-1. `src/shared/ui/SearchForm.tsx`
**현재 상태** (세션 15까지):
- `search-form-container` wrapper 높이 100px 고정 (`index.css` 글로벌)
- `containerStyle` prop으로 예외 처리 가능 (SYS07에서 사용)

**수정 방향**:
- 고정 100px → `min-height: 100px; height: auto`
- 필드 4개 초과 시 자동 `wrap`으로 2줄 배치
- 1440px 이하 viewport에서 `col span` 동적 조정 (8→12)
- Breakpoint: antd `useBreakpoint()` 활용

### A-2. `src/shared/ui/DataTable.tsx`
**현재 상태**:
- `navy-bordered-table` CSS 클래스 (상단 2px, 하단 1px)
- `dataSource` / `request` prop 혼용 가능
- `militaryPersonColumn()` 헬퍼로 군번/계급/성명 3컬럼 고정

**수정 방향**:
- 기본 `scroll: { x: 'max-content' }` 추가 — 폭 초과 시 가로 스크롤
- 컬럼에 `priority` 메타 추가 (`high`/`medium`/`low`)
- 1440px 이하에서 `priority: 'low'` 컬럼 자동 `hidden: true`
- 좌측 첫 컬럼(군번/순번 등) `fixed: 'left'` 기본 적용

### A-3. `src/shared/ui/CrudForm.tsx` (선택)
- 폼 내부도 Row/Col 반응형 점검
- 1440에서 2열 → 1440 이하 1열 전환 breakpoint

### A-4. `src/index.css` 글로벌
- `.search-form-container` 규칙 업데이트
- 테이블 `min-width` 관련 미디어쿼리 추가

---

## Phase B — 개별 페이지 진단 및 조정

### B-1. 문제 페이지 식별 (캡처 기반)

`screenshots-1440/` 를 스캔하여 다음 조건 페이지 리스트업:
- 검색영역 필드 5개 이상 → 줄바꿈 필요
- 테이블 컬럼 8개 이상 → 컬럼 우선순위 필요
- 특수 레이아웃 (2열 Form, 차트+테이블 병렬 등)

### B-2. 예상 우선 수정 페이지 (세션 12~15 버그 기록 기반)

| SYS | 페이지 | 예상 이슈 |
|-----|-------|---------|
| SYS01 | 01-1 신청서작성 / 02-3 부대근무현황 | 필드 많음, 테이블 컬럼 많음 |
| SYS03 | 02-5 추진중점과제 / 03-3 업무실적입력 | 폼 복잡 |
| SYS08 | 02-1 권한신청 / 07-1 입력통계 | 3열 폼 + 차트 |
| SYS09 | 03-* 확인서/보고서 13종 | 긴 테이블 |
| SYS15 | 02-* 비밀관리 5종 / 03-* 일일결산 6종 | 긴 폼 + 테이블 |
| SYS17 | 01-3 검열계획 / 01-4 검열결과 | 복합 레이아웃 |

### B-3. 컬럼 우선순위 지정 규칙

**필수 유지 (priority: 'high')**:
- 순번 / ID / 군번 / 계급 / 성명 / 부대
- 제목 / 상태 / 작성일 / 액션 버튼

**숨김 가능 (priority: 'low')**:
- 최종수정자 / 최종수정일 / 등록자
- 첨부파일수 / 조회수 / 분류코드
- 승인자 / 승인일 (상태 컬럼이 있는 경우)

---

## 실행 순서 (권장)

1. **Compact/새 세션 시작**
2. `/gsd-execute-phase` 또는 수동 진행
3. Phase A 공통 수정 (약 2~3시간)
4. `npm run dev` 후 `screenshot-all-1440.mjs` 재실행
5. 새 `screenshots-1440/` 과 비교하여 B-1 문제 페이지 자동 식별
6. Phase B 개별 수정 (예상 30~50 페이지, 병렬 Wave로 처리)
7. 재캡처 후 최종 검증
8. 커밋 메시지: `refactor: 1440x900 반응형 레이아웃 전면 대응`
9. 태그: `v1.5.0`

---

## 참조 산출물

- `screenshot-all-1440.mjs` — 재캡처 스크립트 (BASE_URL 환경변수)
- `screenshot-all-1680.mjs` — 1680 회귀 확인용
- `screenshots-1440/` — 현재 상태 스냅샷 (로컬, gitignore)
- `screenshots-1680/` — 참고용 (로컬, gitignore)
- `WORK-LOG.md` 세션 16 — 캡처 배경 기록
- `src/shared/ui/{SearchForm,DataTable,CrudForm}.tsx` — 수정 대상
- `src/index.css` — 글로벌 CSS
- `src/shared/lib/military.ts` — 군번 헬퍼 (유지)

---

## 주의사항

- Phase A 수정 시 **기존 페이지 회귀 방지** 필수 — 1680 재캡처 비교 필수
- `containerStyle` prop으로 예외 처리한 SYS07 군사자료목록 동작 유지
- DataTable `fixed: 'left'` 적용 시 가로 스크롤바 UX 확인
- antd Breakpoint는 `xs/sm/md/lg/xl/xxl` 중 `xl`(1200) / `xxl`(1600) 활용
