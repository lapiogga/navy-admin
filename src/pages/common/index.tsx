import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { PageSpinner } from '@/app/components/PageSpinner'

const CodeManagementPage = lazy(() => import('./code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('./auth-group'))
const ApprovalLinePage = lazy(() => import('./approval/ApprovalLinePage'))
const SystemMgrIndex = lazy(() => import('./system-mgr'))

// 아직 구현되지 않은 페이지들은 임시 컴포넌트로 표시
function NotImplemented() {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
      준비 중인 기능입니다.
    </div>
  )
}

export default function Page() {
  return (
    <Routes>
      <Route
        path="code-mgmt"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeManagementPage />
          </Suspense>
        }
      />
      <Route
        path="auth-group/*"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupIndex />
          </Suspense>
        }
      />
      <Route
        path="approval"
        element={
          <Suspense fallback={<PageSpinner />}>
            <ApprovalLinePage />
          </Suspense>
        }
      />
      <Route
        path="system-mgr"
        element={
          <Suspense fallback={<PageSpinner />}>
            <SystemMgrIndex />
          </Suspense>
        }
      />
      <Route path="board" element={<NotImplemented />} />
      <Route path="menu-mgmt" element={<NotImplemented />} />
      <Route path="access-log" element={<NotImplemented />} />
      <Route path="error-log" element={<NotImplemented />} />
      <Route path="message-mgmt" element={<NotImplemented />} />
      <Route path="*" element={<Navigate to="code-mgmt" replace />} />
    </Routes>
  )
}
