import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import SuggestionMainPage from './SuggestionMainPage'
import SuggestionListPage from './SuggestionListPage'
import SuggestionAdminPage from './SuggestionAdminPage'

// 공통 기능 Phase 1 페이지 재사용 (SUGST-03, SUGST-05)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

export default function Sys14Page() {
  return (
    <Routes>
      {/* 기본 경로: 메인화면으로 리다이렉트 */}
      <Route index element={<Navigate to="/sys14/1/1" replace />} />

      {/* 메인화면 (고유 페이지 - SUGST-01) */}
      <Route path="1/1" element={<SuggestionMainPage />} />

      {/* 공지사항 (공통 게시판 재사용 - SUGST-03) */}
      <Route
        path="1/2"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 제언확인 (고유 페이지 - SUGST-02) */}
      <Route path="1/3" element={<SuggestionListPage />} />

      {/* 관리자 (고유 페이지 - SUGST-04) */}
      <Route path="1/4" element={<SuggestionAdminPage />} />

      {/* 사용자별권한등록 (공통 권한관리 재사용 - SUGST-05) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <AuthGroupIndex />
          </Suspense>
        }
      />
    </Routes>
  )
}
