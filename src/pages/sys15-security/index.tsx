import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageSpinner } from '@/app/components/PageSpinner'

// SYS15 Wave 1: 비밀/매체/보안자재 CRUD
const SecretPage = React.lazy(() => import('./SecretPage'))
const MediaPage = React.lazy(() => import('./MediaPage'))
const EquipmentPage = React.lazy(() => import('./EquipmentPage'))
const NoticeDocPage = React.lazy(() => import('./NoticeDocPage'))
const TransferPage = React.lazy(() => import('./TransferPage'))

// SYS15 Wave 2: 일일결산 + 결재
const SecMainPage = React.lazy(() => import('./SecMainPage'))
const PersonalSecDailyPage = React.lazy(() => import('./PersonalSecDailyPage'))
const OfficeSecDailyPage = React.lazy(() => import('./OfficeSecDailyPage'))
const DutyOfficerPage = React.lazy(() => import('./DutyOfficerPage'))
const SecurityLevelPage = React.lazy(() => import('./SecurityLevelPage'))
const AbsencePage = React.lazy(() => import('./AbsencePage'))
const SecurityEduPage = React.lazy(() => import('./SecurityEduPage'))
const ApprovalPendingPage = React.lazy(() => import('./ApprovalPendingPage'))
const ApprovalCompletedPage = React.lazy(() => import('./ApprovalCompletedPage'))

// SYS15 Wave 3: 결산종합현황 4종
const SummarySecretPage = React.lazy(() => import('./SummarySecretPage'))
const SummaryPersonalPage = React.lazy(() => import('./SummaryPersonalPage'))
const SummaryOfficePage = React.lazy(() => import('./SummaryOfficePage'))
const SummaryAbsencePage = React.lazy(() => import('./SummaryAbsencePage'))

// SYS15 Wave 3: 개인설정
const PersonalSettingPage = React.lazy(() => import('./PersonalSettingPage'))

// SYS15 Wave 3: 관리자 5종
const CheckItemMgmtPage = React.lazy(() => import('./CheckItemMgmtPage'))
const HolidayMgmtPage = React.lazy(() => import('./HolidayMgmtPage'))
const NotifyTimeMgmtPage = React.lazy(() => import('./NotifyTimeMgmtPage'))
const LogHistoryPage = React.lazy(() => import('./LogHistoryPage'))
const ExceptionMgmtPage = React.lazy(() => import('./ExceptionMgmtPage'))

// Phase 1 공통기능 lazy import (7대 규칙 7번: 관리자 대메뉴 시스템)
const CodeManagementPage = React.lazy(() => import('@/pages/common/code-mgmt/CodeManagementPage'))
const AuthGroupPage = React.lazy(() => import('@/pages/common/auth-group'))

// 공통 게시판 lazy import (7대 규칙 6번: sysCode=sys15)
const BoardListPage = React.lazy(() =>
  import('@/pages/common/board/BoardListPage').then((m) => ({ default: m.BoardListPage })),
)

function withSuspense(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Component />
    </Suspense>
  )
}

function BoardNotice() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BoardListPage boardId="sys15-notice" />
    </Suspense>
  )
}

function BoardQna() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <BoardListPage boardId="sys15-qna" />
    </Suspense>
  )
}

export default function Sys15Page() {
  return (
    <Routes>
      {/* 메인화면 (1) */}
      <Route path="1/1" element={withSuspense(SecMainPage)} />
      <Route path="" element={withSuspense(SecMainPage)} />

      {/* 비밀/매체관리 (2) */}
      <Route path="2/1" element={withSuspense(MediaPage)} />
      <Route path="2/2" element={withSuspense(SecretPage)} />
      <Route path="2/3" element={withSuspense(NoticeDocPage)} />
      <Route path="2/4" element={withSuspense(EquipmentPage)} />
      <Route path="2/5" element={withSuspense(TransferPage)} />

      {/* 보안일일결산 (3) */}
      <Route path="3/1" element={withSuspense(PersonalSecDailyPage)} />
      <Route path="3/2" element={withSuspense(OfficeSecDailyPage)} />
      <Route path="3/3" element={withSuspense(DutyOfficerPage)} />
      <Route path="3/4" element={withSuspense(SecurityLevelPage)} />
      <Route path="3/5" element={withSuspense(AbsencePage)} />
      <Route path="3/6" element={withSuspense(SecurityEduPage)} />

      {/* 결재 (4) */}
      <Route path="4/1" element={withSuspense(ApprovalPendingPage)} />
      <Route path="4/2" element={withSuspense(ApprovalCompletedPage)} />

      {/* 결산종합현황 (5) */}
      <Route path="5/1" element={withSuspense(SummarySecretPage)} />
      <Route path="5/2" element={withSuspense(SummaryPersonalPage)} />
      <Route path="5/3" element={withSuspense(SummaryOfficePage)} />
      <Route path="5/4" element={withSuspense(SummaryAbsencePage)} />

      {/* 개인설정 (6) */}
      <Route path="6/1" element={withSuspense(PersonalSettingPage)} />

      {/* 게시판 (7) - 7대 규칙 6번: 공통 게시판 lazy import */}
      <Route path="7/1" element={<BoardNotice />} />
      <Route path="7/2" element={<BoardQna />} />

      {/* 관리자 대메뉴 (8) - 7대 규칙 7번 */}
      <Route path="8/1" element={withSuspense(CheckItemMgmtPage)} />
      <Route path="8/2" element={withSuspense(HolidayMgmtPage)} />
      <Route path="8/3" element={withSuspense(NotifyTimeMgmtPage)} />
      <Route path="8/4" element={withSuspense(LogHistoryPage)} />
      <Route path="8/5" element={withSuspense(ExceptionMgmtPage)} />

      {/* 시스템 (9) - 공통기능 lazy import */}
      <Route path="9/1" element={withSuspense(CodeManagementPage)} />
      <Route path="9/2" element={withSuspense(AuthGroupPage)} />
    </Routes>
  )
}
