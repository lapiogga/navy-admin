import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'

// SYS01 Part 1 페이지 (신청서 관리 + 현황조회 + 부대관리 일부)
const OtRequestPage = React.lazy(() => import('./OtRequestPage'))
const OtApprovalPage = React.lazy(() => import('./OtApprovalPage'))
const OtBulkPage = React.lazy(() => import('./OtBulkPage'))
const OtBulkApprovalPage = React.lazy(() => import('./OtBulkApprovalPage'))
const OtMonthlyClosingPage = React.lazy(() => import('./OtMonthlyClosingPage'))
const OtMyStatusPage = React.lazy(() => import('./OtMyStatusPage'))
const OtAbsencePage = React.lazy(() => import('./OtAbsencePage'))
const OtUnitStatusPage = React.lazy(() => import('./OtUnitStatusPage'))
const OtMonthlyStatusPage = React.lazy(() => import('./OtMonthlyStatusPage'))
const OtUnitPersonnelPage = React.lazy(() => import('./OtUnitPersonnelPage'))

// SYS01 Part 2 페이지 (부대관리 + 당직업무 + 개인설정)
const OtMaxHoursPage = React.lazy(() => import('./OtMaxHoursPage'))
const OtWorkHoursPage = React.lazy(() => import('./OtWorkHoursPage'))
const OtHolidayPage = React.lazy(() => import('./OtHolidayPage'))
const OtApprovalLinePage = React.lazy(() => import('./OtApprovalLinePage'))
const OtDutyWorkerPage = React.lazy(() => import('./OtDutyWorkerPage'))
const OtDutyPostPage = React.lazy(() => import('./OtDutyPostPage'))
const OtDutyPostChangePage = React.lazy(() => import('./OtDutyPostChangePage'))
const OtPersonalDutyApprovalPage = React.lazy(() => import('./OtPersonalDutyApprovalPage'))
const OtPersonalDeptApprovalPage = React.lazy(() => import('./OtPersonalDeptApprovalPage'))
const OtPersonalSettingPage = React.lazy(() => import('./OtPersonalSettingPage'))
const OtPersonalDutyPage = React.lazy(() => import('./OtPersonalDutyPage'))
const OtPersonalDeptPage = React.lazy(() => import('./OtPersonalDeptPage'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = React.lazy(() => import('@/pages/common/AdminRoutes'))

// 공통 게시판 lazy import (7대 규칙 6번: sysCode=sys01)
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
      <BoardListPage boardId="sys01-notice" />
    </Suspense>
  )
}

function BoardQna() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BoardListPage boardId="sys01-qna" />
    </Suspense>
  )
}

export default function Sys01Page() {
  return (
    <Routes>
      {/* 신청서 관리 (1) */}
      <Route path="1/1" element={withSuspense(OtRequestPage)} />
      <Route path="1/2" element={withSuspense(OtApprovalPage)} />
      <Route path="1/3" element={withSuspense(OtBulkPage)} />
      <Route path="1/4" element={withSuspense(OtBulkApprovalPage)} />
      <Route path="1/5" element={withSuspense(OtMonthlyClosingPage)} />

      {/* 현황조회 (2) */}
      <Route path="2/1" element={withSuspense(OtMyStatusPage)} />
      <Route path="2/2" element={withSuspense(OtAbsencePage)} />
      <Route path="2/3" element={withSuspense(OtUnitStatusPage)} />
      <Route path="2/4" element={withSuspense(OtUnitStatusPage)} />
      <Route path="2/5" element={withSuspense(OtUnitStatusPage)} />
      <Route path="2/6" element={withSuspense(OtMonthlyStatusPage)} />
      <Route path="2/7" element={withSuspense(OtUnitPersonnelPage)} />

      {/* 부대관리 (3) */}
      <Route path="3/1" element={withSuspense(OtUnitPersonnelPage)} />
      <Route path="3/2" element={withSuspense(OtMaxHoursPage)} />
      <Route path="3/3" element={withSuspense(OtWorkHoursPage)} />
      <Route path="3/4" element={withSuspense(OtHolidayPage)} />
      <Route path="3/5" element={withSuspense(OtApprovalLinePage)} />

      {/* 당직업무 (4) */}
      <Route path="4/1" element={withSuspense(OtDutyWorkerPage)} />
      <Route path="4/2" element={withSuspense(OtDutyPostPage)} />
      <Route path="4/3" element={withSuspense(OtDutyPostChangePage)} />
      <Route path="4/4" element={withSuspense(OtPersonalDutyApprovalPage)} />
      <Route path="4/5" element={withSuspense(OtPersonalDeptApprovalPage)} />

      {/* 개인설정 (5) */}
      <Route path="5/1" element={withSuspense(OtPersonalSettingPage)} />
      <Route path="5/2" element={withSuspense(OtPersonalDutyPage)} />
      <Route path="5/3" element={withSuspense(OtPersonalDeptPage)} />

      {/* 게시판 (6) - Phase 1 공통게시판 재사용 (7대 규칙 6번) */}
      <Route path="6/1" element={<BoardNotice />} />
      <Route path="6/2" element={<BoardQna />} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
