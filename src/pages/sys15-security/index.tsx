import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'

// SYS15 Wave 1: 비밀/매체/보안자재 CRUD
const SecretPage = React.lazy(() => import('./SecretPage'))
const MediaPage = React.lazy(() => import('./MediaPage'))
const EquipmentPage = React.lazy(() => import('./EquipmentPage'))
const NoticeDocPage = React.lazy(() => import('./NoticeDocPage'))
const TransferPage = React.lazy(() => import('./TransferPage'))

// SYS15 Wave 2: 일일결산 + 결재
const SecMainPage = React.lazy(() => import('./SecMainPage'))
const PersonalSecDailyPage = React.lazy(() => import('./PersonalSecDailyPage'))
const OfficeSecDailyPage = React.lazy(() => import('./OfficeSecDailyPage'))
const DutyOfficerPage = React.lazy(() => import('./DutyOfficerPage'))
const SecurityLevelPage = React.lazy(() => import('./SecurityLevelPage'))
const AbsencePage = React.lazy(() => import('./AbsencePage'))
const SecurityEduPage = React.lazy(() => import('./SecurityEduPage'))
const ApprovalPendingPage = React.lazy(() => import('./ApprovalPendingPage'))
const ApprovalCompletedPage = React.lazy(() => import('./ApprovalCompletedPage'))

// Phase 1 공통기능 lazy import (7대 규칙 7번: 관리자 대메뉴)
const AuthGroupPage = React.lazy(() => import('@/pages/common/auth-group/AuthGroupPage'))
const CodeGroupPage = React.lazy(() => import('@/pages/common/code-mgmt/CodeGroupPage'))

// 공통 게시판 lazy import (7대 규칙 6번: sysCode=sys15)
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
      <BoardListPage boardId="sys15-notice" />
    </Suspense>
  )
}

function BoardQna() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BoardListPage boardId="sys15-qna" />
    </Suspense>
  )
}

export default function Sys15Page() {
  return (
    <Routes>
      {/* 메인화면 (1) */}
      <Route path="1/1" element={withSuspense(SecMainPage)} />
      <Route path="" element={withSuspense(SecMainPage)} />

      {/* 개인보안일일결산 (2) */}
      <Route path="2/1" element={withSuspense(PersonalSecDailyPage)} />
      <Route path="2/2" element={withSuspense(OfficeSecDailyPage)} />
      <Route path="2/3" element={withSuspense(DutyOfficerPage)} />

      {/* 비밀 관리 (3) */}
      <Route path="3/1" element={withSuspense(SecretPage)} />
      <Route path="3/2" element={withSuspense(MediaPage)} />
      <Route path="3/3" element={withSuspense(EquipmentPage)} />
      <Route path="3/4" element={withSuspense(NoticeDocPage)} />
      <Route path="3/5" element={withSuspense(TransferPage)} />

      {/* 보안수준평가 (4) */}
      <Route path="4/1" element={withSuspense(SecurityLevelPage)} />

      {/* 부재/교육관리 (5) */}
      <Route path="5/1" element={withSuspense(AbsencePage)} />
      <Route path="5/2" element={withSuspense(SecurityEduPage)} />

      {/* 결재 (6) */}
      <Route path="6/1" element={withSuspense(ApprovalPendingPage)} />
      <Route path="6/2" element={withSuspense(ApprovalCompletedPage)} />

      {/* 게시판 (7) - 7대 규칙 6번: 공통 게시판 */}
      <Route path="7/1" element={<BoardNotice />} />
      <Route path="7/2" element={<BoardQna />} />

      {/* 관리자 대메뉴 - 7대 규칙 7번 */}
      <Route path="admin/auth-group" element={withSuspense(AuthGroupPage)} />
      <Route path="admin/code-mgmt" element={withSuspense(CodeGroupPage)} />
    </Routes>
  )
}
