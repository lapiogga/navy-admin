import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import DirectiveProgressPage from './DirectiveProgressPage'
import DirectiveListPage from './DirectiveListPage'
import ProposalProgressPage from './ProposalProgressPage'
import ProposalListPage from './ProposalListPage'
import DirectiveAdminPage from './DirectiveAdminPage'

// Phase 1 공통게시판 재사용 (DRCT-02, DRCT-03, DRCT-06, DRCT-07)
const BoardIndex = lazy(() => import('@/pages/common/board'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

// 지시사항 통합 뷰 (추진현황 + 목록 Tabs)
const DirectiveView = () => (
  <div>
    <DirectiveProgressPage />
    <DirectiveListPage />
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
      <Route index element={<Navigate to="/sys12/2/3" replace />} />

      {/* 게시판 - 공지사항 (DRCT-06, 공통게시판 재사용) */}
      <Route
        path="1/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 게시판 - 질의응답 (DRCT-07, 공통게시판 재사용) */}
      <Route
        path="1/2"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 대통령 지시사항 (DRCT-02, 공통게시판 읽기전용) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 국방부장관 지시사항 (DRCT-03, 공통게시판 읽기전용) */}
      <Route
        path="2/2"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

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
