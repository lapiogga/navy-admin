import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage } from '@/shared/ui/SubsystemHomePage'
import KnowledgeListPage from './KnowledgeListPage'
import MyKnowledgePage from './MyKnowledgePage'
import KnowledgeAdminPage from './KnowledgeAdminPage'
import KnowledgeStatsPage from './KnowledgeStatsPage'

// 공통 기능 Phase 1 페이지 재사용 (KNOW-05, KNOW-06, KNOW-07, KNOW-08)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const MenuMgmtIndex = lazy(() => import('@/pages/common/system-mgr/MenuManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys13Page() {
  return (
    <Routes>
      {/* 메인화면 */}
      <Route index element={
        <SubsystemHomePage
          sysCode="sys13"
          title="지식관리체계"
          noticeBoardPath="/sys13/1/1"
          qnaBoardPath="/sys13/1/1"
        />
      } />

      {/* 게시판 (공통 페이지 재사용 - KNOW-05) */}
      <Route
        path="1/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 나의 지식 관리 (고유 페이지 - KNOW-02) */}
      <Route path="2/1" element={<MyKnowledgePage />} />

      {/* 지식 관리(관리자) (고유 페이지 - KNOW-03) */}
      <Route path="2/2" element={<KnowledgeAdminPage />} />

      {/* 지식열람 (고유 페이지 - KNOW-01) */}
      <Route path="3/1" element={<KnowledgeListPage />} />

      {/* 지식통계 (고유 페이지 - KNOW-04) */}
      <Route path="4/1" element={<KnowledgeStatsPage />} />

      {/* 코드관리 (공통 페이지 재사용 - KNOW-08) */}
      <Route
        path="5/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtIndex />
          </Suspense>
        }
      />

      {/* 메뉴관리 (공통 페이지 재사용 - KNOW-07) */}
      <Route
        path="5/2"
        element={
          <Suspense fallback={<PageSpinner />}>
            <MenuMgmtIndex />
          </Suspense>
        }
      />

      {/* 권한관리 (공통 페이지 재사용 - KNOW-06) */}
      <Route
        path="5/3"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupIndex />
          </Suspense>
        }
      />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
