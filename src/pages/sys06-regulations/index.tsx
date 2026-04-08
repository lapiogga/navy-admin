/**
 * SYS06 해병대규정관리체계 라우트 매핑
 *
 * MREG-01: 현행규정 (조직도 + 규정 목록/등록/수정/삭제/열람)
 * MREG-02: 예규 - 해병대사령부 (예규 목록/등록/수정/삭제)
 * MREG-03: 예규 - 예하부대 (조직도/링크 전시)
 * MREG-04: 지시문서 (목록/등록/수정/삭제)
 * MREG-05~07: 게시판 3종 (공지사항, 규정예고, 자료실) - Phase 1 공통게시판 재사용
 * MREG-08: 권한관리 - Phase 1 auth-group 재사용
 * 관리자: AdminRoutes - 공통기능
 */
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage, SimpleBoardPage } from '@/shared/ui'

// SYS06 전용 페이지 (API 경로 /api/sys06/ 사용)
const RegulationListPage = lazy(() => import('./RegulationListPage'))
const PrecedentHQPage = lazy(() => import('./PrecedentHQPage'))
const PrecedentUnitPage = lazy(() => import('./PrecedentUnitPage'))
const DirectiveListPage = lazy(() => import('./DirectiveListPage'))

// Phase 1 공통 기능 재사용
const AuthGroupIndex = lazy(() => import('@/pages/common/auth-group'))

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

const sysCode = 'sys06'

export default function Sys06Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* 메인화면 */}
        <Route index element={
          <SubsystemHomePage
            sysCode="sys06"
            title="해병대규정관리체계"
            noticeBoardPath="/sys06/4/1"
            qnaBoardPath="/sys06/4/1"
          />
        } />

        {/* MREG-01: 현행규정 (SYS06 전용, /api/sys06/regulations) */}
        <Route path="1/1" element={
          <Suspense fallback={<PageSpinner />}>
            <RegulationListPage />
          </Suspense>
        } />

        {/* MREG-02: 예규 - 해병대사령부 (SYS06 전용, /api/sys06/precedents/hq) */}
        <Route path="2/1" element={
          <Suspense fallback={<PageSpinner />}>
            <PrecedentHQPage />
          </Suspense>
        } />

        {/* MREG-03: 예규 - 예하부대 (조직도/링크 카드) */}
        <Route path="2/2" element={
          <Suspense fallback={<PageSpinner />}>
            <PrecedentUnitPage />
          </Suspense>
        } />

        {/* MREG-04: 지시문서 (SYS06 전용, /api/sys06/directives) */}
        <Route path="3/1" element={
          <Suspense fallback={<PageSpinner />}>
            <DirectiveListPage />
          </Suspense>
        } />

        {/* MREG-05: 공지사항 */}
        <Route path="4/1" element={<SimpleBoardPage boardId="sys06-notice" title="공지사항" />} />

        {/* MREG-06: 규정예고 */}
        <Route path="4/2" element={<SimpleBoardPage boardId="sys06-regulation" title="규정예고" />} />

        {/* MREG-07: 자료실 */}
        <Route path="4/3" element={<SimpleBoardPage boardId="sys06-data" title="자료실" />} />

        {/* MREG-08: 권한관리 (Phase 1 auth-group 재사용) */}
        <Route
          path="5/1"
          element={
            <Suspense fallback={<PageSpinner />}>
              <AuthGroupIndex sysCode={sysCode} />
            </Suspense>
          }
        />

        {/* 관리자 대메뉴 - 공통기능 (R4) */}
        <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
      </Routes>
    </Suspense>
  )
}
