# Phase 5 -- UI Review (Project-Wide Audit)

**Audited:** 2026-04-06
**Baseline:** Phase 1/2 UI-SPEC.md + abstract 6-pillar standards (no single UI-SPEC covers all phases)
**Screenshots:** not captured (Playwright browsers not installed)
**Scope:** 전체 프로젝트 -- 18개 서브시스템 + 메인 포탈 + 공통 모듈 (230 TSX files)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | 한국어 레이블 일관적, 에러 메시지가 구체적이나 일부 generic 패턴 존재 |
| 2. Visuals | 3/4 | antd ProLayout 기반 시각 위계 양호, aria-label 전무 |
| 3. Color | 2/4 | antd 테마 토큰 잘 정의되었으나 하드코딩 색상 184건 과다 |
| 4. Typography | 3/4 | antd-theme.ts 토큰 동결 준수, inline fontSize 43건으로 약간의 이탈 |
| 5. Spacing | 3/4 | antd style 기반 spacing 일관적, Tailwind 유틸리티 최소 사용으로 충돌 적음 |
| 6. Experience Design | 3/4 | loading/error/empty 상태 대부분 커버, ErrorBoundary 미구현, 삭제 미확인 1건 |

**Overall: 17/24**

---

## Top 3 Priority Fixes

1. **하드코딩 색상 184건 -- antd 토큰 변수로 교체 필요** -- 테마 변경(다크모드 등) 시 전체 색상이 깨짐 -- `#52c41a` -> `token.colorSuccess`, `#ff4d4f` -> `token.colorError`, `#faad14` -> `token.colorWarning` 등 antd ConfigProvider token 참조 패턴으로 교체
2. **aria-label 전무 (0건) -- 접근성 최소 기준 미달** -- 스크린 리더 사용자가 아이콘 버튼/인터랙티브 요소 식별 불가 -- EditOutlined/DeleteOutlined/UserOutlined 등 아이콘 전용 버튼에 `aria-label` 추가 (예: `<Button aria-label="수정" icon={<EditOutlined />} />`)
3. **ErrorBoundary 미구현 -- 런타임 에러 시 흰 화면** -- 서브시스템 렌더링 에러 시 전체 앱이 크래시됨 -- `src/app/components/ErrorBoundary.tsx` 생성 후 각 서브시스템 라우트에 래핑

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**양호한 점:**
- 모든 버튼/레이블이 한국어로 일관 작성: "신청서 작성", "제언 작성", "지시문서 등록" 등 도메인 적합한 CTA
- 에러 메시지가 구체적: "저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요" (src/pages/common/auth-group/GroupUnitPage.tsx:38)
- 빈 상태 메시지 도메인 특화: "등록된 공지사항이 없습니다", "댓글이 없습니다", "게시판 설정 탭에서 게시판을 먼저 선택하세요"
- Popconfirm 확인 텍스트 한국어화: "삭제하시겠습니까?" + "삭제"/"취소" 버튼

**개선 필요:**
- 일부 에러 메시지가 generic: "등록 중 오류가 발생했습니다" (src/pages/sys18-job-desc/StandardWorkTimePage.tsx:66) -- 구체적 사유 표시 권장
- sys04 CertificateApplyPage에서 "등록에 실패했습니다" (line 64) -- 어떤 등록인지 컨텍스트 부재
- 성공 메시지의 일관성 양호하나, 일부 시스템은 "되었습니다" 일부는 "했습니다" 혼용 (미미한 수준)

### Pillar 2: Visuals (3/4)

**양호한 점:**
- PageContainer(antd ProComponents)가 모든 페이지 타이틀의 시각 위계 제공
- MainPortalLayout: 네이비 헤더(#001529) + 회색 콘텐츠 배경(#f0f2f5) 명확한 시각 분리
- SubsystemLayout + PageContainer 이중 레이어로 구조화된 계층
- PortalPage 카드 그리드: xs=24, sm=12, md=8, lg=6 반응형 그리드 적용
- 마스터-디테일 패턴(sys08 UnitLineageTreePage): 좌측 Tree 280px + 우측 DataTable flex:1 구조 양호
- StatusBadge 컴포넌트로 상태 표시 시각적 일관성 확보

**개선 필요:**
- **aria-label 전무 (0건)**: 아이콘 전용 버튼(EditOutlined, DeleteOutlined, PlusOutlined 등)에 접근성 레이블 없음
  - src/pages/sys08-unit-lineage/UnitLineageTreePage.tsx:93 `<Button icon={<EditOutlined />} />` -- aria-label 없음
  - src/pages/sys08-unit-lineage/UnitLineageTreePage.tsx:97 `<Button icon={<DeleteOutlined />} />` -- aria-label 없음
- sys09 DeceasedPage (line 197-203): 삭제 버튼이 `<a style={{ color: 'red' }}>` -- antd Button 대신 raw anchor 사용으로 일관성 부재
- SeatGrid(sys10): 좌석 상태를 색상만으로 구분 -- 색각 이상 사용자 고려 부족 (아이콘 또는 패턴 추가 권장)

### Pillar 3: Color (2/4)

**양호한 점:**
- antd-theme.ts에서 5개 핵심 토큰 정의: colorPrimary(#1E3A5F), colorSuccess(#52c41a), colorWarning(#faad14), colorError(#ff4d4f), colorBgContainer(#FFFFFF)
- 60/30/10 분할 의도: 흰색(60%) 카드/테이블 배경, 회색 #F0F2F5(30%) 페이지 배경, 네이비 #1E3A5F(10%) 액센트/헤더
- StatusBadge 컴포넌트에서 상태별 색상 중앙 관리

**개선 필요 (심각):**
- **하드코딩 색상 184건** (60개 파일): antd 테마 토큰을 style prop에 직접 하드코딩
  - `#52c41a` (colorSuccess) 직접 사용: PerfMainPage.tsx:33, PerfInputStatusPage.tsx:27, CertificateRegisterPage.tsx:207
  - `#ff4d4f` (colorError) 직접 사용: SessionWarningModal.tsx:37, PerfMainPage.tsx:35, CertificateRegisterPage.tsx:210
  - `#faad14` (colorWarning) 직접 사용: RegulationListPage.tsx:212, PerfMainPage.tsx:34
  - `#1890ff` (구 antd v4 primary -- v5에서 deprecated): PrecedentUnitPage.tsx:44, PerfProgressRatePage.tsx:32, PerfMainPage.tsx:120
  - `#001529` (headerBg) 하드코딩: MainPortalLayout.tsx:23
  - `#f0f2f5` (colorBgLayout) 하드코딩: MainPortalLayout.tsx:40
  - `#bbb`, `#666`, `#ccc` 등 antd 토큰 외 색상: SurveyQuestionEditor.tsx:91,276, PrecedentUnitPage.tsx:55
- **`#1890ff` 사용은 v5 전환 미완**: antd v5 primary는 `#1E3A5F` (antd-theme.ts)인데 v4 기본값 `#1890ff` 직접 사용 3건
- SeatGrid(sys10): 4가지 좌석 상태를 하드코딩 색상으로 구분 -- 테마 토큰 미참조

**해결 방안:**
```typescript
// antd v5 토큰 참조 패턴
import { theme } from 'antd'
const { useToken } = theme
// 컴포넌트 내부:
const { token } = useToken()
// style={{ color: token.colorSuccess }} 로 교체
```

### Pillar 4: Typography (3/4)

**양호한 점:**
- antd-theme.ts에서 `fontSize: 14` 기본 토큰 동결 -- 대부분의 텍스트가 antd 기본 14px 준수
- antd Typography.Title level={3,4,5} 사용으로 제목 크기 자동 관리
- Tailwind 타이포그래피 클래스 사용 최소(text-sm 2건, text-xs 2건만) -- antd 네이티브 위임 원칙 준수
- font-weight Tailwind 클래스 0건 -- antd `Text strong`, `fontWeight: 500/600` style로 일관

**개선 필요:**
- inline `fontSize` 직접 지정 43건 (22개 파일):
  - 대부분 antd-theme 예외 허용 범위 내 (12px secondary, 16px display, 20px heading)
  - 문제 사례: `fontSize: 18` (SurveyQuestionEditor.tsx:91 drag handle), `fontSize: 13` (OtMyStatusPage.tsx:39 직접 테이블), `fontSize: 24` inline string (PerfMainPage.tsx:105 gauge label)
  - JobDescAdminPage.tsx에서 fontSize: 12, 14 직접 하드코딩 (line 192, 498, 502, 507)
- `fontWeight: 'bold'`과 `fontWeight: 500`, `fontWeight: 600` 혼용 -- 통일 권장
- src/index.css에 Vite 기본 스타일 잔재: `font-family: Inter, system-ui` -- antd-theme.ts의 `Noto Sans KR` 선언과 충돌 가능

### Pillar 5: Spacing (3/4)

**양호한 점:**
- antd Row gutter={[16,16]} 패턴 일관적 (PortalPage, PerfMainPage 등)
- PageContainer가 기본 패딩 제공하여 페이지 간 여백 일관
- MainPortalLayout: Content className="p-6" (24px -- lg 토큰과 일치)
- Modal width 일관: 600px(폼), 700-800px(상세), 416px(세션만료 경고)
- Card style maxWidth 패턴 (MeetingReservePage: 600px) 폼 읽기성 확보

**개선 필요:**
- Tailwind 임의값 2건: `w-[400px]` (LoginPage:32), `min-h-[400px]` (PageSpinner:5) -- UI-SPEC Phase 2에서 400px 고정으로 명시되어 허용 범위
- inline style 기반 spacing이 688건 (157개 파일)으로 Tailwind 유틸리티(9건) 대비 압도적 -- **이 자체가 문제는 아님** (antd 컴포넌트 style prop 기반 프로젝트), 단 일관성을 위해 한쪽으로 통일 권장
- gap 하드코딩: `gap: 8`, `gap: 16` 등 inline -- antd Space component 활용이 더 일관적
- marginBottom 하드코딩 패턴 다양: `marginBottom: 8`, `marginBottom: 12`, `marginBottom: 16`, `marginBottom: 24` -- 4의 배수 원칙은 준수하나 값이 불규칙

### Pillar 6: Experience Design (3/4)

**양호한 점:**
- **Loading 상태**: PageSpinner 컴포넌트, Suspense fallback, antd Spin, ProTable 내장 로딩 -- 102건 (30+개 파일)에서 로딩 처리
- **Empty 상태**: antd locale.emptyText 커스텀 + 빈 상태 안내 텍스트 15건 -- 주요 목록 화면에서 빈 상태 처리
- **Error 상태**: onError 콜백에서 message.error 표시 -- 105건 (30+개 파일)에서 에러 처리
- **Disabled 상태**: 75건 (37개 파일) -- 상태별 버튼 비활성화 (예: pending 아닌 신청은 수정 불가)
- **파괴적 액션 확인**: Popconfirm 66건 (18개 파일) -- 삭제 전 확인 대화상자 사용
- **세션 만료 경고**: SessionWarningModal 컴포넌트 -- 카운트다운 + 연장/로그아웃 선택지 제공
- **크로스탭 로그아웃**: authStore에서 구현 (CLAUDE.md 기록)

**개선 필요:**
- **ErrorBoundary 미구현**: 렌더링 에러 시 전체 앱 크래시. `src` 전체에서 `ErrorBoundary` 0건 발견
  - React 18에서는 렌더링 중 throw된 에러를 잡을 ErrorBoundary 필수
  - 각 서브시스템 라우트 또는 최소한 앱 루트에 ErrorBoundary 래핑 필요
- **sys09 DeceasedPage 삭제 확인 누락**: line 200 `onClick={() => deleteMutation.mutate(record.id)}` -- Popconfirm 없이 즉시 삭제 실행
  - 같은 파일의 다른 페이지(InjuredPage 등)에서도 유사 패턴 확인 필요
- **Vite 기본 index.css 잔재**: `background-color: #242424`, `color: rgba(255, 255, 255, 0.87)` 다크모드 스타일이 남아있어 antd 테마와 충돌 가능
  - src/index.css를 정리하여 antd-theme.ts + app/styles/index.css만 사용하도록 변경 필요
- **일부 서브시스템에서 apiClient와 raw fetch 혼용**: sys05, sys11, sys13, sys14에서 `fetch()` 직접 호출 -- apiClient(axios 래퍼) 통일 권장 (에러 핸들링 일관성)

---

## Registry Safety

Registry audit: shadcn 미초기화 (components.json 없음). 적용 안 함.

---

## Files Audited

### Layout / Theme (4 files)
- `src/app/layouts/MainPortalLayout.tsx`
- `src/app/layouts/SubsystemLayout.tsx`
- `src/app/styles/antd-theme.ts`
- `src/app/styles/index.css`

### Shared UI Components (5 files)
- `src/shared/ui/DataTable/DataTable.tsx`
- `src/shared/ui/CrudForm/CrudForm.tsx`
- `src/shared/ui/StatusBadge/StatusBadge.tsx`
- `src/shared/ui/DetailModal/DetailModal.tsx`
- `src/shared/ui/SearchForm/SearchForm.tsx`

### Portal / Login (3 files)
- `src/pages/login/index.tsx`
- `src/pages/portal/index.tsx`
- `src/features/auth/components/SessionWarningModal.tsx`

### Low Complexity Subsystems (8 files sampled)
- `src/pages/sys04-certificate/CertificateApplyPage.tsx`
- `src/pages/sys05-admin-rules/DirectiveListPage.tsx`
- `src/pages/sys05-admin-rules/RegulationListPage.tsx`
- `src/pages/sys11-research/ResearchListPage.tsx`
- `src/pages/sys14-suggestion/SuggestionListPage.tsx`
- `src/pages/sys14-suggestion/SuggestionMainPage.tsx`
- `src/pages/sys16-meeting-room/MeetingReservePage.tsx`
- `src/pages/sys16-meeting-room/MeetingRoomMgmtPage.tsx`

### Medium Complexity Subsystems (8 files sampled)
- `src/pages/sys02-survey/SurveyFormPage.tsx`
- `src/pages/sys02-survey/SurveyQuestionEditor.tsx`
- `src/pages/sys06-regulations/index.tsx`
- `src/pages/sys09-memorial/DeceasedPage.tsx`
- `src/pages/sys12-directives/DirectiveListPage.tsx`
- `src/pages/sys13-knowledge/KnowledgeListPage.tsx`
- `src/pages/sys17-inspection/InspectionPlanPage.tsx`
- `src/pages/sys18-job-desc/JobDescAdminPage.tsx`

### High Complexity Subsystems (7 files sampled)
- `src/pages/sys01-overtime/index.tsx`
- `src/pages/sys03-performance/PerfMainPage.tsx`
- `src/pages/sys08-unit-lineage/UnitLineageTreePage.tsx`
- `src/pages/sys10-weekend-bus/SeatGrid.tsx`
- `src/pages/sys15-security/SecMainPage.tsx`
- `src/pages/sys15-security/PersonalSecDailyPage.tsx`
- `src/pages/sys15-security/SecretMediaPage.tsx`

### Configuration / Root (4 files)
- `tailwind.config.js`
- `src/index.css`
- `src/App.tsx`
- `src/app/components/PageSpinner.tsx`

### Planning Docs (2 files)
- `.planning/phases/01-99/01-UI-SPEC.md`
- `.planning/phases/02-00/02-UI-SPEC.md`

**Total: 41 files directly audited + grep scan across all 230 TSX files**
