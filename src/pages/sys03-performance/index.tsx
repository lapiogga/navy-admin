import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'

// SYS03 페이지 - 메인
const PerfMainPage = React.lazy(() => import('./PerfMainPage'))

// SYS03 페이지 - 기준정보관리
const PerfBaseYearPage = React.lazy(() => import('./PerfBaseYearPage'))
const PerfEvalOrgPage = React.lazy(() => import('./PerfEvalOrgPage'))
const PerfIndividualTargetPage = React.lazy(() => import('./PerfIndividualTargetPage'))
const PerfPolicyPage = React.lazy(() => import('./PerfPolicyPage'))
const PerfMainTaskPage = React.lazy(() => import('./PerfMainTaskPage'))
const PerfSubTaskPage = React.lazy(() => import('./PerfSubTaskPage'))
const PerfDetailTaskPage = React.lazy(() => import('./PerfDetailTaskPage'))

// SYS03 페이지 - 연간과제관리
const PerfProgressRatePage = React.lazy(() => import('./PerfProgressRatePage'))
const PerfTaskResultInputPage = React.lazy(() => import('./PerfTaskResultInputPage'))
const PerfTaskResultApprovalPage = React.lazy(() => import('./PerfTaskResultApprovalPage'))
const PerfTaskResultEvalPage = React.lazy(() => import('./PerfTaskResultEvalPage'))
const PerfIndividualResultEvalPage = React.lazy(() => import('./PerfIndividualResultEvalPage'))

// SYS03 페이지 - 평가결과
const PerfEvalResultPage = React.lazy(() => import('./PerfEvalResultPage'))
const PerfInputStatusPage = React.lazy(() => import('./PerfInputStatusPage'))

// SYS03 페이지 - 과제검색
const PerfTaskSearchPage = React.lazy(() => import('./PerfTaskSearchPage'))

// Phase 1 공통기능 lazy import (7대 규칙 7번: 관리자 대메뉴)
const AuthGroupPage = React.lazy(() => import('@/pages/common/auth-group/AuthGroupPage'))
const CodeGroupPage = React.lazy(() => import('@/pages/common/code-mgmt/CodeGroupPage'))

// 공통 게시판 lazy import (7대 규칙 6번: sysCode=sys03)
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
      <BoardListPage boardId="sys03-notice" />
    </Suspense>
  )
}

function BoardQna() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BoardListPage boardId="sys03-qna" />
    </Suspense>
  )
}

function BoardData() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BoardListPage boardId="sys03-data" />
    </Suspense>
  )
}

export default function Sys03Page() {
  return (
    <Routes>
      {/* 메인화면 (6) */}
      <Route path="6/1" element={withSuspense(PerfMainPage)} />
      <Route path="" element={withSuspense(PerfMainPage)} />

      {/* 기준정보관리 (1) */}
      <Route path="1/1" element={withSuspense(PerfBaseYearPage)} />
      <Route path="1/2" element={withSuspense(PerfEvalOrgPage)} />
      <Route path="1/3" element={withSuspense(PerfIndividualTargetPage)} />
      <Route path="1/4" element={withSuspense(PerfPolicyPage)} />
      <Route path="1/5" element={withSuspense(PerfMainTaskPage)} />
      <Route path="1/6" element={withSuspense(PerfSubTaskPage)} />
      <Route path="1/7" element={withSuspense(PerfDetailTaskPage)} />

      {/* 연간과제관리 (2) */}
      <Route path="2/1" element={withSuspense(PerfProgressRatePage)} />
      <Route path="2/2" element={withSuspense(PerfSubTaskPage)} />
      <Route path="2/3" element={withSuspense(PerfDetailTaskPage)} />
      <Route path="2/4" element={withSuspense(PerfTaskResultInputPage)} />
      <Route path="2/5" element={withSuspense(PerfTaskResultApprovalPage)} />
      <Route path="2/6" element={withSuspense(PerfTaskResultEvalPage)} />
      <Route path="2/7" element={withSuspense(PerfIndividualResultEvalPage)} />

      {/* 평가결과 (3) */}
      <Route path="3/1" element={withSuspense(PerfEvalResultPage)} />
      <Route path="3/2" element={withSuspense(PerfInputStatusPage)} />

      {/* 게시판 (4) - 7대 규칙 6번: 공통 게시판 */}
      <Route path="4/1" element={<BoardNotice />} />
      <Route path="4/2" element={<BoardQna />} />
      <Route path="4/3" element={<BoardData />} />

      {/* 과제검색 (5) */}
      <Route path="5/1" element={withSuspense(PerfTaskSearchPage)} />

      {/* 관리자 대메뉴 - 7대 규칙 7번 */}
      <Route path="admin/auth-group" element={withSuspense(AuthGroupPage)} />
      <Route path="admin/code-mgmt" element={withSuspense(CodeGroupPage)} />
    </Routes>
  )
}
