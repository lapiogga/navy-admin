import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'
import MeetingReservePage from './MeetingReservePage'
import MyReservationPage from './MyReservationPage'
import MeetingStatusPage from './MeetingStatusPage'
import ReservationMgmtPage from './ReservationMgmtPage'
import MeetingRoomMgmtPage from './MeetingRoomMgmtPage'

// 공통 기능 Phase 1 페이지 재사용 (ROOM-06, ROOM-07)
const BoardIndex = lazy(() => import('@/pages/common/board'))
const CodeMgmtIndex = lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))

export default function Sys16Page() {
  return (
    <Routes>
      {/* 기본 경로: 회의예약신청으로 리다이렉트 */}
      <Route index element={<Navigate to="/sys16/1/2" replace />} />

      {/* 공지사항 (공통 게시판 재사용 - ROOM-06) */}
      <Route
        path="1/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <BoardIndex />
          </Suspense>
        }
      />

      {/* 회의예약신청 (고유 페이지 - ROOM-01) */}
      <Route path="1/2" element={<MeetingReservePage />} />

      {/* 내예약확인 (고유 페이지 - ROOM-02) */}
      <Route path="1/3" element={<MyReservationPage />} />

      {/* 회의현황 (고유 페이지 - ROOM-05) */}
      <Route path="1/4" element={<MeetingStatusPage />} />

      {/* 회의예약관리 (고유 페이지 - ROOM-03) */}
      <Route path="1/5" element={<ReservationMgmtPage />} />

      {/* 회의실 관리 (고유 페이지 - ROOM-04) */}
      <Route path="1/6" element={<MeetingRoomMgmtPage />} />

      {/* 공통코드관리 (공통 페이지 재사용 - ROOM-07) */}
      <Route
        path="2/1"
        element={
          <Suspense fallback={<PageSpinner />}>
            <CodeMgmtIndex />
          </Suspense>
        }
      />
    </Routes>
  )
}
