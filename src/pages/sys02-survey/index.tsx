import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import MySurveyPage from './MySurveyPage'
import SurveyQuestionEditor from './SurveyQuestionEditor'
import SurveyParticipationPage from './SurveyParticipationPage'
import SurveyFormPage from './SurveyFormPage'
import PastSurveyPage from './PastSurveyPage'
import SurveyAdminPage from './SurveyAdminPage'

// 공통 기능 Phase 1 페이지 재사용 (SURV-05, SURV-06, SURV-07)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

export default function Sys02Page() {
  return (
    <Routes>
      {/* 기본 경로: 나의 설문관리로 리다이렉트 */}
      <Route index element={<Navigate to="/sys02/1/2" replace />} />

      {/* 게시판 (공통 페이지 재사용 - SURV-05) */}
      <Route
        path="1/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

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
    </Routes>
  )
}
