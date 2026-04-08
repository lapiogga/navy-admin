import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage } from '@/shared/ui/SubsystemHomePage'
import { SimpleBoardPage } from '@/shared/ui'

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

const RegulationListPage = lazy(() => import('./RegulationListPage'))
const PrecedentHQPage = lazy(() => import('./PrecedentHQPage'))
const PrecedentUnitPage = lazy(() => import('./PrecedentUnitPage'))
const DirectiveListPage = lazy(() => import('./DirectiveListPage'))

export default function Page() {
  return (
    <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '100px auto' }} />}>
      <Routes>
        <Route index element={
          <SubsystemHomePage
            sysCode="sys05"
            title="행정규칙포탈체계"
            noticeBoardPath="/sys05/board/1"
            qnaBoardPath="/sys05/board/2"
          />
        } />
        <Route path="1/1" element={<RegulationListPage />} />
        <Route path="2/1" element={<PrecedentHQPage />} />
        <Route path="2/2" element={<PrecedentUnitPage />} />
        <Route path="3/1" element={<DirectiveListPage />} />

        {/* 게시판 */}
        <Route path="board/1" element={<SimpleBoardPage boardId="sys05-notice" title="공지사항" />} />
        <Route path="board/2" element={<SimpleBoardPage boardId="sys05-qna" title="질의응답" />} />

        {/* 관리자 대메뉴 - 공통기능 */}
        <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
      </Routes>
    </Suspense>
  )
}
