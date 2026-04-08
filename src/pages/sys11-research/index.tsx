import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage } from '@/shared/ui/SubsystemHomePage'
import { SimpleBoardPage } from '@/shared/ui'
import ResearchMainPage from './ResearchMainPage'
import ResearchListPage from './ResearchListPage'
import ResearchFilePage from './ResearchFilePage'
import ResearchAdminPage from './ResearchAdminPage'

// 공통 기능 Phase 1 페이지 재사용 (RSRC-06)
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys11Page() {
  return (
    <Routes>
      {/* 기본 경로: 메인화면으로 리다이렉트 */}
      <Route index element={
        <SubsystemHomePage
          sysCode="sys11"
          title="연구자료종합관리체계"
          noticeBoardPath="/sys11/board/1"
          qnaBoardPath="/sys11/board/2"
          dashboard={<ResearchMainPage />}
        />
      } />

      {/* 메인화면 — 통계 + 최신/인기 자료 (RSRC-01) */}
      <Route path="1/1" element={<ResearchMainPage />} />

      {/* 연구자료 CRUD (RSRC-02) */}
      <Route path="1/2" element={<ResearchListPage />} />

      {/* 자료실 (RSRC-05) */}
      <Route path="1/3" element={<ResearchFilePage />} />

      {/* 공지사항 (RSRC-04) */}
      <Route path="1/4" element={<SimpleBoardPage boardId="sys11-notice" title="공지사항" />} />

      {/* 관리자 (RSRC-03) */}
      <Route path="1/5" element={<ResearchAdminPage />} />

      {/* 사용자별권한등록 — 공통 권한관리 재사용 (RSRC-06) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupIndex />
          </Suspense>
        }
      />

      {/* 게시판 */}
      <Route path="board/1" element={<SimpleBoardPage boardId="sys11-notice" title="공지사항" />} />
      <Route path="board/2" element={<SimpleBoardPage boardId="sys11-qna" title="질의응답" />} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
