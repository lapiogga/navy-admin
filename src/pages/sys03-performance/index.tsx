import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage, SimpleBoardPage } from '@/shared/ui'

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

// 관리자 대메뉴 - 공통기능
const AdminRoutes = React.lazy(() => import('@/pages/common/AdminRoutes'))


function withSuspense(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Component />
    </Suspense>
  )
}


export default function Sys03Page() {
  return (
    <Routes>
      {/* 메인화면 (1) - menus.ts: /sys03/1 */}
      <Route path="1/1" element={withSuspense(PerfMainPage)} />
      <Route path="" element={
        <SubsystemHomePage
          sysCode="sys03"
          title="성과관리체계"
          noticeBoardPath="/sys03/5/1"
          qnaBoardPath="/sys03/5/2"
          dashboard={withSuspense(PerfMainPage)}
        />
      } />

      {/* 기준정보관리 (2) - menus.ts: /sys03/2 */}
      <Route path="2/1" element={withSuspense(PerfBaseYearPage)} />
      <Route path="2/2" element={withSuspense(PerfEvalOrgPage)} />
      <Route path="2/3" element={withSuspense(PerfIndividualTargetPage)} />
      <Route path="2/4" element={withSuspense(PerfPolicyPage)} />
      <Route path="2/5" element={withSuspense(PerfMainTaskPage)} />
      <Route path="2/6" element={withSuspense(PerfSubTaskPage)} />
      <Route path="2/7" element={withSuspense(PerfDetailTaskPage)} />

      {/* 연간과제관리 (3) - menus.ts: /sys03/3 */}
      <Route path="3/1" element={withSuspense(PerfProgressRatePage)} />
      <Route path="3/2" element={withSuspense(PerfSubTaskPage)} />
      <Route path="3/3" element={withSuspense(PerfTaskResultInputPage)} />
      <Route path="3/4" element={withSuspense(PerfTaskResultApprovalPage)} />
      <Route path="3/5" element={withSuspense(PerfTaskResultEvalPage)} />
      <Route path="3/6" element={withSuspense(PerfIndividualResultEvalPage)} />

      {/* 평가결과 (4) - menus.ts: /sys03/4 */}
      <Route path="4/1" element={withSuspense(PerfEvalResultPage)} />
      <Route path="4/2" element={withSuspense(PerfInputStatusPage)} />

      {/* 게시판 (5) - menus.ts: /sys03/5, 7대 규칙 6번: 공통 게시판 */}
      <Route path="5/1" element={<SimpleBoardPage boardId="sys03-notice" title="공지사항" />} />
      <Route path="5/2" element={<SimpleBoardPage boardId="sys03-qna" title="질의응답" />} />
      <Route path="5/3" element={<SimpleBoardPage boardId="sys03-data" title="자료실" />} />

      {/* 과제검색 (6) - menus.ts: /sys03/6 */}
      <Route path="6/1" element={withSuspense(PerfTaskSearchPage)} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
