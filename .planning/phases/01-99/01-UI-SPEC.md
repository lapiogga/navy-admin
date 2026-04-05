---
phase: 1
slug: 99-common-features
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-05
---

# Phase 1 — UI Design Contract

> Phase 1: 공통 기능 (99_공통기능) — 82개 프로세스의 시각·인터랙션 계약.
> gsd-ui-researcher 생성, gsd-ui-checker 검증 대상.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (shadcn 미사용 — Ant Design 5 ProComponents 채택, RESEARCH.md) |
| Preset | not applicable |
| Component library | Ant Design 5.29.3 + @ant-design/pro-components 2.8.10 |
| Icon library | @ant-design/icons (antd 번들 포함) |
| Font | Noto Sans KR, -apple-system, BlinkMacSystemFont, sans-serif (antd-theme.ts) |

**Registry Safety Gate:** shadcn 미초기화이므로 적용 안 함.

---

## Spacing Scale

Declared values (Tailwind 유틸리티 + antd Gutter로 표현, 4의 배수 원칙):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | 아이콘 간격, 인라인 패딩 (antd `gap-1`) |
| sm | 8px | 컴팩트 요소 간격, 태그 내부 패딩 (antd `gap-2`) |
| md | 16px | 기본 요소 간격, 폼 필드 사이 (antd `gap-4`, Row gutter={16}) |
| lg | 24px | 섹션 패딩, 카드 내부 패딩 (antd `gap-6`) |
| xl | 32px | 레이아웃 패널 간격 (Row gutter={32}) |
| 2xl | 48px | 주요 섹션 구분선 위아래 |
| 3xl | 64px | 페이지 레벨 상단 여백 |

Exceptions:
- 마스터-디테일 2패널 (COM-07~08): Row gutter={16}, Col span={10/14}
- antd Transfer 컴포넌트 내부 패딩은 antd 기본값 유지 (커스텀 금지)
- antd Tree 체크박스 터치 타겟: 최소 32px (antd 기본값, 마우스 전용 환경)

---

## Typography

antd-theme.ts에서 동결된 토큰 기준:

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 (regular) | 1.5 (antd 기본) |
| Label | 14px | 600 (semibold) | 1.4 |
| Heading | 20px | 600 (semibold) | 1.2 |
| Display | 16px | 400 (regular) | 1.5 |

**규칙:**
- antd `fontSize: 14` 토큰 동결 — 직접 font-size 지정 금지
- 페이지 타이틀 (`PageContainer title`): 20px semibold (antd ProLayout 기본)
- 폼 라벨: 14px semibold (antd Form.Item label 기본)
- 테이블 헤더 셀: 14px semibold
- 테이블 데이터 셀: 14px regular
- 주석/도움말 텍스트 (antd `Typography.Text type="secondary"`): 12px regular (antd 예외 허용)

---

## Color

antd-theme.ts에서 이미 확정된 토큰 사용:

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#FFFFFF` (colorBgContainer) | 카드 배경, 폼 영역, 테이블 배경 |
| Secondary (30%) | `#F0F2F5` (colorBgLayout) | 페이지 배경, 사이드바 외부, 섹션 구분 배경 |
| Accent (10%) | `#1E3A5F` (colorPrimary, 해군 네이비) | Primary Button, 활성 메뉴 하이라이트, 링크 호버, 테이블 선택 행 배경 |
| Destructive | `#ff4d4f` (colorError) | 삭제 버튼, 반려 상태 Badge, ConfirmDialog 위험 경고 텍스트 |

**Accent 사용 제한 목록 (이 요소들에만 적용):**
1. `Button type="primary"` — 등록, 저장, 조회 등 주 행동
2. 사이드바 활성 메뉴 항목 배경 (`#001529` 다크 사이드바 위)
3. 테이블 행 선택 상태 배경 (antd 자동 처리)
4. antd Link 색상 (`colorPrimary` 상속)

**보조 시맨틱 색상:**
- 성공/완료: `#52c41a` (colorSuccess) — 승인·완료 StatusBadge
- 경고/대기: `#faad14` (colorWarning) — 대기·보류 StatusBadge
- 정보/진행: antd blue (`#1677ff`) — 진행 StatusBadge

**StatusBadge 색상 매핑 (Phase 0 동결, 변경 금지):**
- 승인: green / 완료: blue / 진행: cyan / 대기: orange / 반려: red / 삭제: default

---

## Component Inventory (Phase 1 신규 패턴)

Phase 0에서 동결된 6개 공통 컴포넌트 위에 Phase 1이 추가로 활용하는 antd 컴포넌트:

| 컴포넌트 | antd 경로 | 사용 화면 | 인터랙션 계약 |
|---------|----------|---------|------------|
| `Transfer` | `antd/Transfer` | COM-06 결재선 관리 | 좌우 패널, 검색 활성화(`showSearch`), 우측 패널 = 결재자 순서 배열, 순서 변경은 위/아래 버튼 제공 |
| `Tree (checkable)` | `antd/Tree` | COM-02 메뉴관리, COM-11~12 메뉴-권한 배정 | `checkable={true}`, 기본 펼침 depth=1, 체크 상태 = 배정된 메뉴 경로 배열 |
| `Upload` | `antd/Upload` | COM-09 게시판 첨부파일 | `action="/api/common/board/attachments"` (MSW 인터셉트), `listType="text"`, 다중 파일 허용, Mock 업로드 응답 = `{ url: "/mock/files/{id}" }` |
| `Tabs` | `antd/Tabs` | COM-09 게시판 설정 (6탭), 권한관리 (5탭), 시스템관리 (5탭) | `type="line"`, 탭 전환 시 폼 상태 유지 (각 탭 독립 컴포넌트 마운트) |
| `Row + Col` | `antd/Grid` | COM-07~08 마스터-디테일 2패널 | `gutter={16}`, Col span left=10, Col span right=14, 우측 패널 선택된 그룹 없으면 "코드그룹을 선택하세요" 빈 상태 |

---

## Interaction Contracts (패턴별)

### Pattern A: 표준 CRUD (COM-01, 03, 07, 10, 13, 14)

1. 페이지 진입 시 DataTable 자동 로드 (ProTable request 자동 호출)
2. 등록 버튼 클릭 → CrudForm 모달 열림 (`mode="create"`)
3. 행 클릭(상세) → DetailModal 열림
4. 행 우측 수정 버튼 → CrudForm 모달 열림 (`mode="edit"`, initialValues 주입)
5. 삭제 버튼 → ConfirmDialog 표시 → 확인 시 DELETE 요청 → 목록 즉시 갱신 (invalidateQueries)
6. 폼 제출 성공 → 모달 닫힘 + 목록 갱신 + `antd message.success` 표시 (2초)
7. 폼 제출 실패 → 모달 유지 + `antd message.error` 표시 (4초)

### Pattern B: 마스터-디테일 2패널 (COM-07~08)

1. 좌측 코드그룹 DataTable 로드
2. 행 클릭 → 해당 그룹 ID를 selectedGroupId state에 저장 → 우측 패널 즉시 갱신
3. 우측 패널: 선택된 코드그룹의 코드 목록 DataTable
4. 양쪽 패널 모두 독립 CRUD 가능 (각각 CrudForm 모달)
5. 좌측 그룹 선택 없으면 우측 패널 = 빈 상태 (아래 빈 상태 copy 참조)

### Pattern C: Transfer 결재선 (COM-06)

1. 결재선 등록/수정 모달 열림
2. 좌측 패널: 전체 사용자 목록 (계급 + 이름 표시)
3. 우측 패널: 현재 결재자 순서 배열
4. 검색: `showSearch={true}`, 계급·이름으로 필터
5. 순서 변경: 우측 패널 아이템 위/아래 버튼 (또는 DnD 미적용 — MVP 범위 단순 위/아래 버튼)
6. 저장 → 결재자 ID 배열 + 순서 인덱스를 API에 전송

### Pattern D: Tree + Checkbox 권한-메뉴 배정 (COM-11~12)

1. 권한그룹 목록에서 그룹 선택
2. 우측/하단 메뉴 트리 표시 (SUBSYSTEM_MENUS 기반)
3. 체크박스로 접근 허용 메뉴 경로 선택
4. 저장 버튼 클릭 → 선택된 경로 배열 PUT 요청
5. 전체 선택/전체 해제 버튼 제공

### Pattern E: 게시판 첨부파일 Upload (COM-09)

1. 파일 선택 또는 드래그 앤 드롭
2. antd Upload `onChange` → fileList state 갱신
3. MSW handler가 `/api/common/board/attachments` POST 인터셉트 → Mock 파일 ID 반환
4. 업로드 완료 파일: 파일명 + 삭제(X) 버튼 표시
5. 다운로드: Mock URL(`/mock/files/{id}`) 클릭 시 브라우저 다운로드 트리거

### Pattern F: CSV 내보내기 (COM-04 접속로그)

1. 테이블 상단 우측 "저장(CSV)" 버튼
2. 클릭 → `downloadCsv()` 유틸 호출 → BOM 포함 UTF-8 CSV 생성
3. 파일명: `접속로그_YYYYMMDD.csv`
4. 다운로드 완료 → 별도 알림 없음 (브라우저 다운로드 바 표시)

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA (목록 등록) | 등록 |
| Primary CTA (폼 저장) | 저장 |
| Primary CTA (조회) | 조회 |
| Primary CTA (삭제) | 삭제 |
| Empty state heading (테이블) | 데이터가 없습니다 |
| Empty state body (테이블) | 등록 버튼을 눌러 첫 번째 항목을 추가하세요 |
| Empty state (코드 우측 패널) | 코드그룹을 선택하세요 |
| Empty state body (코드 우측 패널) | 좌측 목록에서 코드그룹을 선택하면 해당 코드 목록이 표시됩니다 |
| Empty state (Transfer 우측) | 결재자를 추가하세요 |
| Empty state body (Transfer 우측) | 좌측 목록에서 결재자를 선택하여 오른쪽으로 이동하세요 |
| Error state (네트워크 오류) | 데이터를 불러오지 못했습니다. 새로고침 후 다시 시도하세요 |
| Error state (폼 저장 실패) | 저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요 |
| Error state (삭제 실패) | 삭제에 실패했습니다. 잠시 후 다시 시도하세요 |
| Success (저장 완료) | 저장되었습니다 |
| Success (삭제 완료) | 삭제되었습니다 |
| Destructive confirmation (삭제) | 삭제 확인: 선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다 |
| Destructive confirmation (게시글 삭제) | 게시글 삭제: 게시글과 댓글, 첨부파일이 모두 삭제됩니다. 계속하시겠습니까? |
| Destructive confirmation (권한그룹 삭제) | 권한그룹 삭제: 해당 그룹에 배정된 사용자의 권한이 모두 해제됩니다. 계속하시겠습니까? |
| Destructive confirmation (코드그룹 삭제) | 코드그룹 삭제: 하위 코드가 모두 삭제됩니다. 계속하시겠습니까? |
| CSV 내보내기 버튼 | 저장(CSV) |
| 파일 첨부 버튼 | 파일 첨부 |
| 전체 선택 (Tree) | 전체 선택 |
| 전체 해제 (Tree) | 전체 해제 |

---

## Page-Level Layout Contract

### 시스템관리 (COM-01~05) — 5탭 구조

```
PageContainer title="시스템관리"
  Tabs type="line"
    TabPane key="system-manager" tab="체계담당자"   → COM-01
    TabPane key="menu"           tab="메뉴관리"      → COM-02
    TabPane key="message"        tab="메시지관리"    → COM-03
    TabPane key="access-log"     tab="접속로그"      → COM-04
    TabPane key="error-log"      tab="장애로그"      → COM-05
```

### 코드관리 (COM-07~08) — 2패널

```
PageContainer title="코드관리"
  Row gutter={16}
    Col span={10}
      DataTable (코드그룹 목록) + 등록/수정/삭제
    Col span={14}
      CodeListPanel (선택된 그룹의 코드 목록) | 빈 상태
```

### 권한관리 (COM-10~14) — 5탭 구조

```
PageContainer title="권한관리"
  Tabs type="line"
    TabPane key="group"      tab="권한그룹"         → COM-10
    TabPane key="menu-perm"  tab="메뉴별 권한그룹"  → COM-11
    TabPane key="group-menu" tab="권한그룹별 메뉴"  → COM-12
    TabPane key="unit"       tab="권한그룹별 부대"  → COM-13
    TabPane key="user"       tab="권한그룹별 사용자" → COM-14
```

### 결재선관리 (COM-06) — 단일 CRUD 페이지

```
PageContainer title="결재선관리"
  DataTable (결재선 목록)
  Modal (등록/수정) → Transfer 컴포넌트 포함
```

### 공통게시판 (COM-09) — 6탭 구조

```
PageContainer title="공통게시판"
  Tabs type="line"
    TabPane key="config"    tab="게시판 설정"    → 게시판 생성/수정/삭제
    TabPane key="category"  tab="카테고리관리"   → 카테고리 CRUD
    TabPane key="post"      tab="게시글관리"     → 게시글 CRUD + 댓글
    TabPane key="attach"    tab="첨부파일"       → Upload + 파일 목록
    TabPane key="admin"     tab="관리자설정"     → 관리자 배정
    TabPane key="unit"      tab="부대설정"       → 부대별 게시판 접근 설정
```

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable (shadcn 미사용) |
| antd (npm 공식) | Transfer, Tree, Upload, Tabs, Row, Col | not required (공식 npm 패키지, Phase 0 동결) |

---

## Frozen Constraints (Executor 준수 필수)

1. `shared/ui` 6개 컴포넌트(DataTable, CrudForm, DetailModal, SearchForm, StatusBadge, SubsystemPage) props 인터페이스 수정 금지
2. antd-theme.ts 토큰 수정 금지 — 색상/폰트 변경 시 Phase 0~7 전체 영향
3. Tailwind는 레이아웃 유틸리티(`flex`, `grid`, `gap-*`, `w-*`, `h-*`)만 사용 — antd 컴포넌트 내부에 Tailwind 클래스 주입 금지
4. 코드 관리 Select/Radio 옵션을 컴포넌트 내부에 하드코딩 금지 — `useCodeOptions` 훅 사용
5. 권한 체크는 `usePermission` 훅 단일 진입점으로만 구현

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: FLAG (CTA 단일 동사 — 군 행정 컨텍스트 수용)
- [x] Dimension 2 Visuals: FLAG (focal point 미명시 — PageContainer title이 암시적 앵커)
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: FLAG (Display/Body 2px 차이 — antd 기본값 수용)
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-05
