import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage } from '@/shared/ui/SubsystemHomePage'
import { SimpleBoardPage } from '@/shared/ui'
import DirectiveProgressPage from './DirectiveProgressPage'
import DirectiveListPage from './DirectiveListPage'
import ProposalProgressPage from './ProposalProgressPage'
import ProposalListPage from './ProposalListPage'
import DirectiveAdminPage from './DirectiveAdminPage'

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

// 지시사항 통합 뷰 (추진현황 + 목록 Tabs)
import type { DirectiveCategory } from './DirectiveProgressPage'

const DirectiveView = ({ category = 'commander' }: { category?: DirectiveCategory }) => (
  <div>
    <DirectiveProgressPage category={category} />
    <DirectiveListPage category={category} />
  </div>
)

// 건의사항 통합 뷰 (추진현황 + 목록 Tabs)
const ProposalView = () => (
  <div>
    <ProposalProgressPage />
    <ProposalListPage />
  </div>
)

export default function Sys12Page() {
  return (
    <Routes>
      {/* 기본 경로: 지휘관 지시사항으로 리다이렉트 */}
      <Route index element={
        <SubsystemHomePage
          sysCode="sys12"
          title="지시건의사항관리체계"
          noticeBoardPath="/sys12/1/1"
          qnaBoardPath="/sys12/1/2"
        />
      } />

      {/* 게시판 - 공지사항 (DRCT-06) */}
      <Route path="1/1" element={<SimpleBoardPage boardId="sys12-notice" title="공지사항" />} />

      {/* 게시판 - 질의응답 (DRCT-07) */}
      <Route path="1/2" element={<SimpleBoardPage boardId="sys12-qna" title="질의응답" />} />

      {/* 대통령 지시사항 (DRCT-02, 추진현황 + 목록) */}
      <Route path="2/1" element={<DirectiveView category="president" />} />

      {/* 국방부장관 지시사항 (DRCT-03, 추진현황 + 목록) */}
      <Route path="2/2" element={<DirectiveView category="minister" />} />

      {/* 지휘관 지시사항 (DRCT-01: 추진현황 + 목록) */}
      <Route path="2/3" element={<DirectiveView />} />

      {/* 건의사항 (DRCT-04: 추진현황 + 목록) */}
      <Route path="3/1" element={<ProposalView />} />

      {/* 관리자 (DRCT-05) */}
      <Route path="4/1" element={<DirectiveAdminPage />} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
