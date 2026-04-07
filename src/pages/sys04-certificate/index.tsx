import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import CertificateApplyPage from './CertificateApplyPage'
import CertificateApprovalPage from './CertificateApprovalPage'
import CertificateRegisterPage from './CertificateRegisterPage'

// 공통 기능 Phase 1 페이지 재사용 (CERT-04, CERT-05, CERT-06)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys04Page() {
  return (
    <Routes>
      {/* 기본 경로: 인증서 신청으로 리다이렉트 */}
      <Route index element={<Navigate to="/sys04/1/2" replace />} />

      {/* 게시판 (공통 페이지 재사용 - CERT-04) */}
      <Route
        path="1/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 인증서 신청 (고유 페이지 - CERT-01) */}
      <Route path="1/2" element={<CertificateApplyPage />} />

      {/* 인증서 승인/관리 (고유 페이지 - CERT-02) */}
      <Route path="1/3" element={<CertificateApprovalPage />} />

      {/* 인증서 등록대장 (고유 페이지 - CERT-03) */}
      <Route path="1/4" element={<CertificateRegisterPage />} />

      {/* 공통코드관리 (공통 페이지 재사용 - CERT-05) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtIndex />
          </Suspense>
        }
      />

      {/* 사용자별권한등록 (공통 페이지 재사용 - CERT-06) */}
      <Route
        path="2/2"
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
