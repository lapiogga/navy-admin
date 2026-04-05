import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RequireAuth } from './components/RequireAuth'
import { PortalLayout } from './layouts/PortalLayout'
import { PageSpinner } from './components/PageSpinner'
import LoginPage from '@/pages/login'
import PortalPage from '@/pages/portal'

// 서브시스템: React.lazy 코드 스플리팅 (per D-22)
const Sys01Page = lazy(() => import('@/pages/sys01-overtime'))
const Sys02Page = lazy(() => import('@/pages/sys02-survey'))
const Sys03Page = lazy(() => import('@/pages/sys03-performance'))
const Sys04Page = lazy(() => import('@/pages/sys04-certificate'))
const Sys05Page = lazy(() => import('@/pages/sys05-admin-rules'))
const Sys06Page = lazy(() => import('@/pages/sys06-regulations'))
const Sys07Page = lazy(() => import('@/pages/sys07-mil-data'))
const Sys08Page = lazy(() => import('@/pages/sys08-unit-lineage'))
const Sys09Page = lazy(() => import('@/pages/sys09-memorial'))
const Sys10Page = lazy(() => import('@/pages/sys10-weekend-bus'))
const Sys11Page = lazy(() => import('@/pages/sys11-research'))
const Sys12Page = lazy(() => import('@/pages/sys12-directives'))
const Sys13Page = lazy(() => import('@/pages/sys13-knowledge'))
const Sys14Page = lazy(() => import('@/pages/sys14-suggestion'))
const Sys15Page = lazy(() => import('@/pages/sys15-security'))
const Sys16Page = lazy(() => import('@/pages/sys16-meeting-room'))
const Sys17Page = lazy(() => import('@/pages/sys17-inspection'))
const Sys18Page = lazy(() => import('@/pages/sys18-job-desc'))
const CommonPage = lazy(() => import('@/pages/common'))

function withSuspense(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <PortalLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <PortalPage /> },
      { path: 'sys01/*', element: withSuspense(Sys01Page) },
      { path: 'sys02/*', element: withSuspense(Sys02Page) },
      { path: 'sys03/*', element: withSuspense(Sys03Page) },
      { path: 'sys04/*', element: withSuspense(Sys04Page) },
      { path: 'sys05/*', element: withSuspense(Sys05Page) },
      { path: 'sys06/*', element: withSuspense(Sys06Page) },
      { path: 'sys07/*', element: withSuspense(Sys07Page) },
      { path: 'sys08/*', element: withSuspense(Sys08Page) },
      { path: 'sys09/*', element: withSuspense(Sys09Page) },
      { path: 'sys10/*', element: withSuspense(Sys10Page) },
      { path: 'sys11/*', element: withSuspense(Sys11Page) },
      { path: 'sys12/*', element: withSuspense(Sys12Page) },
      { path: 'sys13/*', element: withSuspense(Sys13Page) },
      { path: 'sys14/*', element: withSuspense(Sys14Page) },
      { path: 'sys15/*', element: withSuspense(Sys15Page) },
      { path: 'sys16/*', element: withSuspense(Sys16Page) },
      { path: 'sys17/*', element: withSuspense(Sys17Page) },
      { path: 'sys18/*', element: withSuspense(Sys18Page) },
      { path: 'common/*', element: withSuspense(CommonPage) },
    ],
  },
])
