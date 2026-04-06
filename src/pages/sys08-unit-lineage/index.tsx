import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'

// SYS08 페이지
const UnitRecordPage = React.lazy(() => import('./UnitRecordPage'))
const UnitLineageTreePage = React.lazy(() => import('./UnitLineageTreePage'))
const UnitKeyPersonPage = React.lazy(() => import('./UnitKeyPersonPage'))
const UnitActivityPage = React.lazy(() => import('./UnitActivityPage'))
const UnitActivityApprovalPage = React.lazy(() => import('./UnitActivityApprovalPage'))
const UnitFlagPage = React.lazy(() => import('./UnitFlagPage'))
const UnitAuthRequestPage = React.lazy(() => import('./UnitAuthRequestPage'))
const UnitAuthMgmtPage = React.lazy(() => import('./UnitAuthMgmtPage'))
const UnitAuthViewPage = React.lazy(() => import('./UnitAuthViewPage'))
const UnitStatsPage = React.lazy(() => import('./UnitStatsPage'))

// Phase 1 공통기능 lazy import (7대 규칙 7번: 관리자 대메뉴)
const CodeManagementPage = React.lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupPage = React.lazy(() => import('@/pages/common/auth-group/AuthGroupPage'))

// 공통 게시판 lazy import (7대 규칙 6번: sysCode=sys08)
const BoardListPage = React.lazy(() =>
  import('@/pages/common/board/BoardListPage').then((m) => ({ default: m.BoardListPage })),
)

function withSuspense(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Component />
    </Suspense>
  )
}

function BoardNotice() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BoardListPage boardId="sys08-notice" />
    </Suspense>
  )
}

export default function Sys08Page() {
  return (
    <Routes>
      {/* 게시판 */}
      <Route path="1/1" element={<BoardNotice />} />

      {/* 권한신청 */}
      <Route path="2/1" element={withSuspense(UnitAuthRequestPage)} />
      <Route path="2/2" element={withSuspense(UnitAuthMgmtPage)} />
      <Route path="2/3" element={withSuspense(UnitAuthViewPage)} />

      {/* 주요활동 */}
      <Route path="3/1" element={withSuspense(UnitActivityPage)} />
      <Route path="3/2" element={withSuspense(UnitActivityApprovalPage)} />

      {/* 주요직위자 */}
      <Route path="4/1" element={withSuspense(UnitKeyPersonPage)} />

      {/* 제원/계승부대 */}
      <Route path="5/1" element={withSuspense(UnitLineageTreePage)} />

      {/* 부대기/부대마크 */}
      <Route path="6/1" element={withSuspense(UnitFlagPage)} />

      {/* 통계 및 출력 */}
      <Route path="7/1" element={withSuspense(UnitStatsPage)} />

      {/* 부대기록부 */}
      <Route path="8/1" element={withSuspense(UnitRecordPage)} />

      {/* 관리자 (Phase 1 공통기능 lazy import) */}
      <Route path="9/1" element={withSuspense(CodeManagementPage)} />
      <Route path="9/2" element={withSuspense(AuthGroupPage)} />
    </Routes>
  )
}
