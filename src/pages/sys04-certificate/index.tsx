import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage, SimpleBoardPage } from '@/shared/ui'
import CertificateApplyPage from './CertificateApplyPage'
import CertificateApprovalPage from './CertificateApprovalPage'
import CertificateRegisterPage from './CertificateRegisterPage'

// 공통 기능 Phase 1 페이지 재사용 (CERT-05, CERT-06)
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys04Page() {
  return (
    <Routes>
      {/* 메인화면 */}
      <Route index element={
        <SubsystemHomePage
          sysCode="sys04"
          title="인증서발급신청체계"
          noticeBoardPath="/sys04/board/1"
          qnaBoardPath="/sys04/board/2"
        />
      } />

      {/* 게시판 (공통 페이지 재사용 - CERT-04) */}
      <Route path="1/1" element={<SimpleBoardPage boardId="sys04-notice" title="공지사항" />} />

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

      {/* 게시판 */}
      <Route path="board/1" element={<SimpleBoardPage boardId="sys04-notice" title="공지사항" />} />
      <Route path="board/2" element={<SimpleBoardPage boardId="sys04-qna" title="질의응답" />} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
