import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import MilDataListPage from './MilDataListPage'
import MilDataUsagePage from './MilDataUsagePage'
import MilDataStatsPage from './MilDataStatsPage'
import HaegidanListPage from './HaegidanListPage'

// 공통 기능 Phase 1 페이지 재사용 (규칙 7 - 관리자 대메뉴)
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys07Page() {
  return (
    <Routes>
      {/* 기본 경로: 군사자료 관리로 리다이렉트 */}
      <Route index element={<Navigate to="/sys07/1/1" replace />} />

      {/* 군사자료 관리 */}
      {/* 군사자료 관리 (MDATA-01) */}
      <Route path="1/1" element={<MilDataListPage />} />

      {/* 군사자료 활용 - 대출/열람 (MDATA-02) */}
      <Route path="1/2" element={<MilDataUsagePage />} />

      {/* 통계자료 (MDATA-03) */}
      <Route path="1/3" element={<MilDataStatsPage />} />

      {/* 해기단자료 */}
      {/* 해기단자료 관리 (MDATA-04) */}
      <Route path="2/1" element={<HaegidanListPage />} />

      {/* 관리자 - 코드관리 (공통 재사용, 규칙 7) */}
      <Route
        path="3/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtIndex />
          </Suspense>
        }
      />

      {/* 관리자 - 권한관리 (공통 재사용, 규칙 7) */}
      <Route
        path="3/2"
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
