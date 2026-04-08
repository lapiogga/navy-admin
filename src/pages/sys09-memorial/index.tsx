import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import { SubsystemHomePage } from '@/shared/ui/SubsystemHomePage'
import { SimpleBoardPage } from '@/shared/ui'
import DeceasedPage from './DeceasedPage'
import InjuredPage from './InjuredPage'
import ReviewPage from './ReviewPage'
import StatsUnitPage from './StatsUnitPage'
import StatsUnitListPage from './StatsUnitListPage'
import StatsTypePage from './StatsTypePage'
import StatsYearPage from './StatsYearPage'
import StatsMonthPage from './StatsMonthPage'
import StatsAllListPage from './StatsAllListPage'
import ReportDeceasedPage from './ReportDeceasedPage'
import ReportInjuredPage from './ReportInjuredPage'
import CertDeathPage from './CertDeathPage'
import CertMeritDeathPage from './CertMeritDeathPage'
import CertMeritInjuredPage from './CertMeritInjuredPage'
import CertReviewResultPage from './CertReviewResultPage'
import CertIssueLedgerPage from './CertIssueLedgerPage'

// 관리자 대메뉴 - 공통기능
const AdminRoutes = lazy(() => import('@/pages/common/AdminRoutes'))

export default function Sys09Page() {
  return (
    <Routes>
      {/* 기본 경로: 사망자 관리로 리다이렉트 */}
      <Route index element={
        <SubsystemHomePage
          sysCode="sys09"
          title="영현보훈체계"
          noticeBoardPath="/sys09/board/1"
          qnaBoardPath="/sys09/board/2"
        />
      } />

      {/* sys09/1/1: 게시판 (HONOR-17) */}
      <Route path="1/1" element={<SimpleBoardPage boardId="sys09-notice" title="공지사항" />} />

      {/* sys09/2/1: 사망자 관리 (HONOR-01) */}
      <Route path="2/1" element={<DeceasedPage />} />

      {/* sys09/2/2: 상이자 관리 (HONOR-02) */}
      <Route path="2/2" element={<InjuredPage />} />

      {/* sys09/2/3: 전공사상심사 관리 (HONOR-03) */}
      <Route path="2/3" element={<ReviewPage />} />

      {/* sys09/3/1: 국가유공자 요건 해당사실 확인서(사망자) (HONOR-13) */}
      <Route path="3/1" element={<CertMeritDeathPage />} />

      {/* sys09/3/2: 국가유공자 요건 해당사실 확인서(상이자) (HONOR-14) */}
      <Route path="3/2" element={<CertMeritInjuredPage />} />

      {/* sys09/3/3: 전공사상심사결과 (HONOR-15) */}
      <Route path="3/3" element={<CertReviewResultPage />} />

      {/* sys09/3/4: 순직/사망확인서 (HONOR-12) */}
      <Route path="3/4" element={<CertDeathPage />} />

      {/* sys09/3/5: 사망자 현황 보고서 (HONOR-10) */}
      <Route path="3/5" element={<ReportDeceasedPage />} />

      {/* sys09/3/6: 상이자 현황 보고서 (HONOR-11) */}
      <Route path="3/6" element={<ReportInjuredPage />} />

      {/* sys09/3/7: 신분별 사망자 현황 (HONOR-06) */}
      <Route path="3/7" element={<StatsTypePage />} />

      {/* sys09/3/8: 월별 사망자 현황 (HONOR-08) */}
      <Route path="3/8" element={<StatsMonthPage />} />

      {/* sys09/3/9: 연도별 사망자 현황 (HONOR-07) */}
      <Route path="3/9" element={<StatsYearPage />} />

      {/* sys09/3/10: 부대별 사망자 현황 (HONOR-04) */}
      <Route path="3/10" element={<StatsUnitPage />} />

      {/* sys09/3/11: 부대별 사망자 명부 (HONOR-05) */}
      <Route path="3/11" element={<StatsUnitListPage />} />

      {/* sys09/3/12: 전사망자 명부 (HONOR-09) */}
      <Route path="3/12" element={<StatsAllListPage />} />

      {/* sys09/3/13: 전사망자 확인증 발급대장 (HONOR-16) */}
      <Route path="3/13" element={<CertIssueLedgerPage />} />

      {/* 게시판 */}
      <Route path="board/1" element={<SimpleBoardPage boardId="sys09-notice" title="공지사항" />} />
      <Route path="board/2" element={<SimpleBoardPage boardId="sys09-qna" title="질의응답" />} />

      {/* 관리자 대메뉴 - 공통기능 */}
      <Route path="admin/*" element={<Suspense fallback={<PageSpinner />}><AdminRoutes /></Suspense>} />
    </Routes>
  )
}
