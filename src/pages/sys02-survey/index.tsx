import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage, SimpleBoardPage } from '@/shared/ui'
import MySurveyPage from './MySurveyPage'
import SurveyQuestionEditor from './SurveyQuestionEditor'
import SurveyParticipationPage from './SurveyParticipationPage'
import SurveyFormPage from './SurveyFormPage'
import PastSurveyPage from './PastSurveyPage'
import SurveyAdminPage from './SurveyAdminPage'

// 공통 기능 Phase 1 페이지 재사용 (SURV-06, SURV-07)
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys02Page() {
  return (
    <Routes>
      {/* 메인화면 */}
      <Route index element={
        <SubsystemHomePage
          sysCode="sys02"
          title="설문종합관리체계"
          noticeBoardPath="/sys02/board/1"
          qnaBoardPath="/sys02/board/2"
        />
      } />

      {/* 게시판 (공통 페이지 재사용 - SURV-05) */}
      <Route path="1/1" element={<SimpleBoardPage boardId="sys02-notice" title="공지사항" />} />

      {/* 나의 설문관리 (SURV-02) */}
      <Route path="1/2" element={<MySurveyPage />} />

      {/* 문항 편집 (SURV-02) */}
      <Route path="1/2/edit/:id" element={<SurveyQuestionEditor />} />

      {/* 설문참여 목록 (SURV-01) */}
      <Route path="1/3" element={<SurveyParticipationPage />} />

      {/* 설문 응답 폼 (SURV-01) */}
      <Route path="1/3/:id" element={<SurveyFormPage />} />

      {/* 지난 설문보기 (SURV-03) */}
      <Route path="1/4" element={<PastSurveyPage />} />

      {/* 체계관리 (SURV-04) */}
      <Route path="1/5" element={<SurveyAdminPage />} />

      {/* 공통코드관리 (공통 페이지 재사용 - SURV-06) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtIndex />
          </Suspense>
        }
      />

      {/* 권한관리 (공통 페이지 재사용 - SURV-07) */}
      <Route
        path="2/2"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupIndex />
          </Suspense>
        }
      />

      {/* 게시판 */}
      <Route path="board/1" element={<SimpleBoardPage boardId="sys02-notice" title="공지사항" />} />
      <Route path="board/2" element={<SimpleBoardPage boardId="sys02-qna" title="질의응답" />} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
