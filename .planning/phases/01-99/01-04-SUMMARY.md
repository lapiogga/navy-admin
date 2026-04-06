---
phase: "01-99"
plan: "04"
subsystem: "공통게시판 (COM-09)"
tags: [board, crud, upload, comment, msw, antd, tabs]
dependency_graph:
  requires: [01-01, 01-02, 01-03]
  provides: [COM-09-board-entity, COM-09-board-pages]
  affects: [future-subsystems-board-reuse]
tech_stack:
  added: []
  patterns:
    - "비페이지 API → PageResponse 변환 requestFn 패턴"
    - "antd Upload action='/api/...' MSW 인터셉트 패턴"
    - "selectedBoardId prop wiring으로 탭 간 컨텍스트 공유"
    - "key={refreshKey} 강제 재마운트로 DataTable 갱신"
key_files:
  created:
    - navy-admin/src/entities/board/types.ts
    - navy-admin/src/entities/board/api.ts
    - navy-admin/src/entities/board/index.ts
    - navy-admin/src/shared/api/mocks/handlers/common/board.ts
    - navy-admin/src/pages/common/board/index.tsx
    - navy-admin/src/pages/common/board/BoardConfigPage.tsx
    - navy-admin/src/pages/common/board/BoardCategoryPage.tsx
    - navy-admin/src/pages/common/board/BoardListPage.tsx
    - navy-admin/src/pages/common/board/BoardPostPage.tsx
    - navy-admin/src/pages/common/board/BoardAdminPage.tsx
    - navy-admin/src/pages/common/board/BoardUserPage.tsx
    - navy-admin/src/pages/common/board/BoardUnitPage.tsx
    - navy-admin/src/__tests__/common/board.test.ts
  modified:
    - navy-admin/src/shared/api/mocks/handlers/common/index.ts
    - navy-admin/src/pages/common/index.tsx
decisions:
  - "비페이지 list API는 requestFn 래퍼로 PageResponse 형태로 변환 (DataTable 인터페이스 호환)"
  - "BoardPostPage는 별도 Route 없이 BoardListPage 내부 Modal로 구현"
  - "첨부파일 업로드: antd Upload action 직접 호출, MSW가 multipart/form-data 인터셉트"
metrics:
  duration_minutes: 9
  completed_date: "2026-04-05"
  task_count: 2
  file_count: 15
---

# Phase 01-99 Plan 04: 공통게시판 Summary

공통게시판(COM-09) 32개 프로세스를 구현 — antd Tabs type="line" 6탭 구조(게시판설정/카테고리/게시글/관리자/사용자/부대), antd Upload MSW 인터셉트, selectedBoardId prop wiring.

## Completed Tasks

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | 게시판 entity/API/MSW 핸들러 8개 서브도메인 | d9c2fec | entities/board/types.ts, api.ts, handlers/common/board.ts |
| 2 | 게시판 관리 페이지 구현 (6탭 구조 전체) | caa1536 | pages/common/board/* (8 files), pages/common/index.tsx |

## What Was Built

### Task 1: Entity / MSW
- `entities/board/types.ts`: 8개 인터페이스 (BoardConfig, BoardPost, BoardComment, BoardAttachment, BoardCategory, BoardAdmin, BoardUser, BoardUnit)
- `entities/board/api.ts`: 8개 API 객체 (boardConfigApi, boardCategoryApi, boardPostApi, boardCommentApi, boardAttachmentApi, boardAdminApi, boardUserApi, boardUnitApi)
- `shared/api/mocks/handlers/common/board.ts`: 29개 MSW 핸들러 (게시판설정 5, 카테고리 4, 게시글 5, 댓글 3, 첨부파일 2, 관리자 3, 사용자 3, 부대 3)
- 테스트 스캐폴드: 8개 타입 + boardHandlers export 테스트 통과

### Task 2: Pages
- `board/index.tsx`: PageContainer + Tabs type="line" 6탭, selectedBoardId state 공유
- `BoardConfigPage`: 게시판 CRUD, 행 클릭 → onSelectBoard(id) 콜백
- `BoardCategoryPage`: 카테고리 CRUD, boardId null 시 #F0F2F5 빈 상태, 비페이지 API → DataTable 변환
- `BoardListPage`: 게시글 목록 (isPinned Tag, viewCount), boardConfigApi.detail로 useAttachment/useComment 확인
- `BoardPostPage`: 게시글 작성/수정/상세 모달, Upload listType="text" 파일 첨부, 댓글 CRUD
- `BoardAdminPage`: 관리자 배정/해제, 사용자 검색 Modal (checkbox 다중선택)
- `BoardUserPage`: 사용자 배정/해제 (페이지네이션 DataTable)
- `BoardUnitPage`: 부대 추가/해제 (CrudForm 패턴)

## UI-SPEC Compliance

| Contract | Implementation |
|----------|---------------|
| Tabs type="line" | index.tsx: `<Tabs type="line">` |
| Upload listType="text" | BoardPostPage: `listType="text"` |
| 파일 첨부 버튼 | BoardPostPage: `<Button>파일 첨부</Button>` |
| 빈 상태 #F0F2F5 | BoardCategoryPage/BoardAdminPage/BoardUserPage/BoardUnitPage: `backgroundColor: '#F0F2F5'` |
| 게시글 삭제 확인 | BoardPostPage: `'게시글과 댓글, 첨부파일이 모두 삭제됩니다. 계속하시겠습니까?'` |
| 저장 성공 | `message.success('저장되었습니다')` |
| 삭제 성공 | `message.success('삭제되었습니다')` |
| 저장 실패 | `message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')` |

## Deviations from Plan

### Auto-fixed Issues

없음 — 계획대로 실행.

### Design Decisions

**1. BoardPostPage 구현 방식**
- **계획**: "모달 또는 별도 패널"
- **구현**: Modal 선택 (Route 추가 없이 단순 Modal 내부 구현)
- **이유**: BoardListPage 내부에서 create/edit/view 세 모드를 하나의 Modal로 처리하는 것이 라우팅 복잡성 대비 구현 용이성이 높음

**2. 비페이지 API → DataTable 변환 패턴**
- `boardCategoryApi.list`, `boardAdminApi.list`, `boardUnitApi.list`는 페이지네이션 없이 전체 반환
- DataTable의 `request` 인터페이스는 `PageResponse<T>`를 요구
- requestFn 래퍼로 내부 변환: `{ content: items, totalElements: items.length, totalPages: 1, ... }`

## Test Results

```
Test Files  15 passed (15)
Tests  66 passed (66)
```

board.test.ts 8개 테스트 포함 전체 테스트 통과.

## Known Stubs

없음. 모든 MSW 핸들러가 실제 데이터를 반환하며, 화면과 연결 완료.

## Self-Check: PASSED

- [x] `navy-admin/src/entities/board/types.ts` — FOUND
- [x] `navy-admin/src/entities/board/api.ts` — FOUND
- [x] `navy-admin/src/shared/api/mocks/handlers/common/board.ts` — FOUND
- [x] `navy-admin/src/pages/common/board/index.tsx` — FOUND
- [x] `navy-admin/src/pages/common/board/BoardAdminPage.tsx` — FOUND
- [x] `navy-admin/src/pages/common/board/BoardUserPage.tsx` — FOUND
- [x] `navy-admin/src/pages/common/board/BoardUnitPage.tsx` — FOUND
- [x] Commit d9c2fec — FOUND
- [x] Commit caa1536 — FOUND
