import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import InspectionUnitPage from './InspectionUnitPage'
import InspectionPlanPage from './InspectionPlanPage'
import InspectionResultPage from './InspectionResultPage'
import InspectionApprovalPage from './InspectionApprovalPage'
import InspectionProgressPage from './InspectionProgressPage'
import InspectionUnitMgmtPage from './InspectionUnitMgmtPage'
import InspectionPlanDataPage from './InspectionPlanDataPage'
import InspectionResultDataPage from './InspectionResultDataPage'

// 공통 기능 Phase 1 페이지 재사용 (per D-26, D-27)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))
const AccessLogIndex = lazy(() => import('@/pages/system-mgr/AccessLogPage'))

export default function Sys17Page() {
  return (
    <Routes>
      {/* 기본 경로: 공지사항으로 리다이렉트 */}
      <Route index element={<Navigate to="/sys17/1/1" replace />} />

      {/* 검열결과 관리 */}
      {/* 공지사항 (공통 재사용 - INSP-06) */}
      <Route
        path="1/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 검열부대 지정 (INSP-02) */}
      <Route path="1/2" element={<InspectionUnitPage />} />

      {/* 검열계획 (INSP-01) */}
      <Route path="1/3" element={<InspectionPlanPage />} />

      {/* 검열결과 - 조치과제 (INSP-03) */}
      <Route path="1/4" element={<InspectionResultPage />} />

      {/* 결재 (INSP-05) */}
      <Route path="1/5" element={<InspectionApprovalPage />} />

      {/* 추진현황 (INSP-03/04) */}
      <Route path="1/6" element={<InspectionProgressPage />} />

      {/* 시스템 관리 */}
      {/* 공통코드관리 (공통 재사용 - INSP-07) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtIndex />
          </Suspense>
        }
      />

      {/* 부대관리 (INSP-08) */}
      <Route path="2/2" element={<InspectionUnitMgmtPage />} />

      {/* 사용자별권한등록 (공통 재사용 - INSP-09) */}
      <Route
        path="2/3"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupIndex />
          </Suspense>
        }
      />

      {/* 접속로그 (Phase 1 재사용 - INSP-10) */}
      <Route
        path="2/4"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AccessLogIndex />
          </Suspense>
        }
      />

      {/* 데이터 */}
      {/* 검열계획 정보 읽기전용 (INSP-11) */}
      <Route path="3/1" element={<InspectionPlanDataPage />} />

      {/* 검열결과 정보 읽기전용 (INSP-12) */}
      <Route path="3/2" element={<InspectionResultDataPage />} />
    </Routes>
  )
}
