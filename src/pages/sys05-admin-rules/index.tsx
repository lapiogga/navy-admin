import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { PageSpinner } from '@/app/components/PageSpinner'

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

const RegulationListPage = lazy(() => import('./RegulationListPage'))
const PrecedentHQPage = lazy(() => import('./PrecedentHQPage'))
const PrecedentUnitPage = lazy(() => import('./PrecedentUnitPage'))
const DirectiveListPage = lazy(() => import('./DirectiveListPage'))

export default function Page() {
  return (
    <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '100px auto' }} />}>
      <Routes>
        <Route index element={<Navigate to="/sys05/1/1" replace />} />
        <Route path="1/1" element={<RegulationListPage />} />
        <Route path="2/1" element={<PrecedentHQPage />} />
        <Route path="2/2" element={<PrecedentUnitPage />} />
        <Route path="3/1" element={<DirectiveListPage />} />

        {/* 관리자 대메뉴 - 공통기능 */}
        <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
      </Routes>
    </Suspense>
  )
}
