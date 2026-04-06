import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Spin } from 'antd'
import { BusReservationPage } from './BusReservationPage'
import { BusReservationStatusPage } from './BusReservationStatusPage'
import { BusDispatchPage } from './BusDispatchPage'
import { BusSchedulePage } from './BusSchedulePage'
import { BusUsagePage } from './BusUsagePage'

// 공통 게시판 lazy import (sysCode=sys10)
const BoardListPage = lazy(() =>
  import('@/pages/common/board/BoardListPage').then((m) => ({ default: m.BoardListPage }))
)

// 관리자 대메뉴 - lazy import (Phase 1 공통 기능 재사용)
const CodeGroupPage = lazy(() =>
  import('@/pages/common/code-mgmt/CodeGroupPage').then((m) => ({ default: m.CodeGroupPage }))
)
const PermissionGroupPage = lazy(() =>
  import('@/pages/common/auth-group/PermissionGroupPage').then((m) => ({ default: m.PermissionGroupPage }))
)

function Loading() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <Spin size="large" />
    </div>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
      <h3>{title}</h3>
      <p>준비중입니다</p>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* /sys10/1/1 - 게시판 (공지+질의응답) */}
        <Route path="1/1" element={<BoardListPage boardId="sys10-notice" />} />

        {/* /sys10/1/2 - 주말버스 예약 */}
        <Route path="1/2" element={<BusReservationPage />} />

        {/* /sys10/1/3 - 대기자관리 (Plan 03에서 구현) */}
        <Route path="1/3" element={<PlaceholderPage title="대기자관리 준비중" />} />

        {/* /sys10/1/4 - 예약현황 */}
        <Route path="1/4" element={<BusReservationStatusPage />} />

        {/* /sys10/1/5 - 배차관리 */}
        <Route path="1/5" element={<BusDispatchPage />} />

        {/* /sys10/1/6 - 예약시간관리 */}
        <Route path="1/6" element={<BusSchedulePage />} />

        {/* /sys10/1/7 - 사용현황 */}
        <Route path="1/7" element={<BusUsagePage />} />

        {/* /sys10/1/8 - 위규자관리 (Plan 03에서 구현) */}
        <Route path="1/8" element={<PlaceholderPage title="위규자관리 준비중" />} />

        {/* /sys10/1/9 - 타군 사용자관리 (Plan 03에서 구현) */}
        <Route path="1/9" element={<PlaceholderPage title="타군 사용자관리 준비중" />} />

        {/* 관리자 대메뉴 [규칙 7] */}
        <Route path="2/1" element={<CodeGroupPage />} />
        <Route path="2/2" element={<PermissionGroupPage />} />
      </Routes>
    </Suspense>
  )
}
