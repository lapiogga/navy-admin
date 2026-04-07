import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'

const SystemMgrIndex = lazy(() => import('./system-mgr'))
const CodeManagementPage = lazy(() => import('./code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('./auth-group'))
const ApprovalLinePage = lazy(() => import('./approval/ApprovalLinePage'))
const BoardIndex = lazy(() => import('./board'))

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="system-mgr" replace />} />
      <Route path="system-mgr" element={<Wrap><SystemMgrIndex /></Wrap>} />
      <Route path="code-mgmt" element={<Wrap><CodeManagementPage /></Wrap>} />
      <Route path="auth-group" element={<Wrap><AuthGroupIndex /></Wrap>} />
      <Route path="approval-line" element={<Wrap><ApprovalLinePage /></Wrap>} />
      <Route path="board" element={<Wrap><BoardIndex /></Wrap>} />
    </Routes>
  )
}
