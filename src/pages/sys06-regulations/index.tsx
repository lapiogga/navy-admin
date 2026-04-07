/**
 * SYS06 해병대규정관리체계 라우트 매핑
 *
 * MREG-01~04: sys05-admin-rules 페이지를 sysCode='sys06' 래퍼로 재사용
 * MREG-05~07: Phase 1 공통게시판 재사용 (sysCode='sys06', boardType별)
 * MREG-08: Phase 1 권한관리(auth-group) 재사용 (sysCode='sys06')
 */
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'

// sys05-admin-rules 페이지 재사용 (sysCode='sys06' prop 전달)
import RegulationListPageBase from '@/pages/sys05-admin-rules/RegulationListPage'
import PrecedentHQPageBase from '@/pages/sys05-admin-rules/PrecedentHQPage'
import PrecedentUnitPageBase from '@/pages/sys05-admin-rules/PrecedentUnitPage'
import DirectiveListPageBase from '@/pages/sys05-admin-rules/DirectiveListPage'

// Phase 1 공통 기능 재사용
const BoardIndex = lazy(() => import('@/pages/common/board'))
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

// sysCode='sys06' 래퍼 컴포넌트 (sys05 페이지를 sys06 컨텍스트로 재사용)
// 현재 sys05 페이지들은 API 경로가 하드코딩되어 있으므로,
// sys06 MSW 핸들러가 동일 패턴을 /api/sys06/ 경로로 처리한다.
// 향후 백엔드 연동 시 sysCode prop으로 경로 동적화 예정.
const sysCode = 'sys06'

function Sys06RegulationList() {
  // sys05-admin-rules/RegulationListPage 재사용 (sysCode='sys06')
  return <RegulationListPageBase key={sysCode} />
}

function Sys06PrecedentHQ() {
  // sys05-admin-rules/PrecedentHQPage 재사용 (sysCode='sys06')
  return <PrecedentHQPageBase key={sysCode} />
}

function Sys06PrecedentUnit() {
  // sys05-admin-rules/PrecedentUnitPage 재사용 (sysCode='sys06')
  return <PrecedentUnitPageBase key={sysCode} />
}

function Sys06DirectiveList() {
  // sys05-admin-rules/DirectiveListPage 재사용 (sysCode='sys06')
  return <DirectiveListPageBase key={sysCode} />
}

export default function Sys06Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* 기본 경로: 현행규정으로 리다이렉트 */}
        <Route index element={<Navigate to="/sys06/1/1" replace />} />

        {/* MREG-01: 현행규정 (sys05-admin-rules 재사용, sysCode='sys06') */}
        <Route path="1/1" element={<Sys06RegulationList />} />

        {/* MREG-02: 예규 - 해병대사령부 (sys05-admin-rules 재사용, sysCode='sys06') */}
        <Route path="2/1" element={<Sys06PrecedentHQ />} />

        {/* MREG-03: 예규 - 예하부대 (sys05-admin-rules 재사용, sysCode='sys06') */}
        <Route path="2/2" element={<Sys06PrecedentUnit />} />

        {/* MREG-04: 지시문서 (sys05-admin-rules 재사용, sysCode='sys06') */}
        <Route path="3/1" element={<Sys06DirectiveList />} />

        {/* MREG-05: 공지사항 (Phase 1 공통게시판 재사용, sysCode='sys06', boardType='notice') */}
        <Route
          path="4/1"
          element={
            <Suspense fallback={<PageSpinner />}>
              <BoardIndex sysCode={sysCode} boardType="notice" />
            </Suspense>
          }
        />

        {/* MREG-06: 규정예고 (Phase 1 공통게시판 재사용, sysCode='sys06', boardType='regulation-notice') */}
        <Route
          path="4/2"
          element={
            <Suspense fallback={<PageSpinner />}>
              <BoardIndex sysCode={sysCode} boardType="regulation-notice" />
            </Suspense>
          }
        />

        {/* MREG-07: 자료실 (Phase 1 공통게시판 재사용, sysCode='sys06', boardType='archive') */}
        <Route
          path="4/3"
          element={
            <Suspense fallback={<PageSpinner />}>
              <BoardIndex sysCode={sysCode} boardType="archive" />
            </Suspense>
          }
        />

        {/* MREG-08: 권한관리 (Phase 1 auth-group 재사용, sysCode='sys06') */}
        <Route
          path="5/1"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AuthGroupIndex sysCode={sysCode} />
            </Suspense>
          }
        />

        {/* 관리자 대메뉴 - 공통기능 */}
        <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
      </Routes>
    </Suspense>
  )
}
