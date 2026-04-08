import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage } from '@/shared/ui/SubsystemHomePage'
import { SimpleBoardPage } from '@/shared/ui'
import JobDescListPage from './JobDescListPage'
import JobDescApprovalPage from './JobDescApprovalPage'
import OrgDiagnosisPage from './OrgDiagnosisPage'
import JobDescAdminPage from './JobDescAdminPage'
import StandardWorkTimePage from './StandardWorkTimePage'

// 공통 기능 Phase 1 페이지 재사용 (규칙 7)
const CodeMgmtPage = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupPage = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys18Page() {
  return (
    <Routes>
      {/* 메인화면 */}
      <Route index element={
        <SubsystemHomePage
          sysCode="sys18"
          title="직무기술서관리체계"
          noticeBoardPath="/sys18/board/1"
          qnaBoardPath="/sys18/board/2"
        />
      } />

      {/* 직무기술서 관리 */}
      {/* /sys18/1/1 — 게시판 (공통 기능, 규칙 6): sysCode=sys18 */}
      <Route path="1/1" element={<SimpleBoardPage boardId="sys18-notice" title="공지사항" />} />

      {/* /sys18/1/2 — 조직진단 대상 관리 (JOB-04) */}
      <Route path="1/2" element={<OrgDiagnosisPage />} />

      {/* /sys18/1/3 — 직무기술서 작성 (JOB-01, Tabs: 나의개인JD/직책JD/부서JD) */}
      <Route path="1/3" element={<JobDescListPage />} />

      {/* /sys18/1/4 — 결재 (JOB-03) */}
      <Route path="1/4" element={<JobDescApprovalPage />} />

      {/* /sys18/1/5 — 직무기술서 조회(관리자) (JOB-02) */}
      <Route path="1/5" element={<JobDescAdminPage />} />

      {/* 관리자 */}
      {/* /sys18/2/1 — 공통코드관리 (공통 기능, 규칙 7) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtPage />
          </Suspense>
        }
      />

      {/* /sys18/2/2 — 표준업무시간관리 (JOB-08) */}
      <Route path="2/2" element={<StandardWorkTimePage />} />

      {/* /sys18/2/3 — 사용자권한관리 (공통 기능, 규칙 7) */}
      <Route
        path="2/3"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupPage />  {/* AuthGroupIndex — 권한그룹/메뉴별/그룹별/그룹사용자/부대 Tabs */}
          </Suspense>
        }
      />

      {/* 게시판 */}
      <Route path="board/1" element={<SimpleBoardPage boardId="sys18-notice" title="공지사항" />} />
      <Route path="board/2" element={<SimpleBoardPage boardId="sys18-qna" title="질의응답" />} />
      <Route path="board/3" element={<SimpleBoardPage boardId="sys18-archive" title="자료실" />} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
