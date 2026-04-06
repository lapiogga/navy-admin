import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import JobDescListPage from './JobDescListPage'
import JobDescApprovalPage from './JobDescApprovalPage'
import OrgDiagnosisPage from './OrgDiagnosisPage'

// 공통 기능 Phase 1 페이지 재사용 (규칙 6, 7)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// Plan 05에서 구현할 placeholder
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
      <p>{title} — Plan 05에서 구현 예정</p>
    </div>
  )
}

export default function Sys18Page() {
  return (
    <Routes>
      {/* 기본 경로 리다이렉트 */}
      <Route index element={<Navigate to="/sys18/1/3" replace />} />

      {/* 직무기술서 관리 */}
      {/* /sys18/1/1 — 게시판 (공통 기능, 규칙 6) */}
      <Route
        path="1/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* /sys18/1/2 — 조직진단 대상 관리 (JOB-04) */}
      <Route path="1/2" element={<OrgDiagnosisPage />} />

      {/* /sys18/1/3 — 직무기술서 작성 (JOB-01, Tabs: 나의개인JD/직책JD/부서JD) */}
      <Route path="1/3" element={<JobDescListPage />} />

      {/* /sys18/1/4 — 결재 (JOB-03) */}
      <Route path="1/4" element={<JobDescApprovalPage />} />

      {/* /sys18/1/5 — 직무기술서 조회(관리자) - Plan 05에서 구현 예정 */}
      <Route path="1/5" element={<PlaceholderPage title="직무기술서 조회(관리자)" />} />

      {/* 관리자 */}
      {/* /sys18/2/1 — 공통코드관리 (공통 기능, 규칙 7) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtIndex />
          </Suspense>
        }
      />

      {/* /sys18/2/2 — 표준업무시간관리 - Plan 05에서 구현 예정 */}
      <Route path="2/2" element={<PlaceholderPage title="표준업무시간관리" />} />

      {/* /sys18/2/3 — 사용자권한관리 (공통 기능, 규칙 7) */}
      <Route
        path="2/3"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupIndex />
          </Suspense>
        }
      />
    </Routes>
  )
}
