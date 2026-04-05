import { RouterProvider } from 'react-router-dom'
import { Providers } from './app/providers'
import { router } from './app/router'

function App() {
  return (
    <Providers>
      {/* 아키텍처 경계 주석:
       * Providers: ConfigProvider(antd 테마/로케일) + QueryClientProvider (서버 상태)
       *   - 라우팅 독립적 (Router 바깥)
       *   - useNavigate 등 라우팅 훅 사용 불가
       * RouterProvider: createBrowserRouter 기반 라우팅
       *   - Providers 내부에서 렌더링되어 antd/QueryClient 컨텍스트 접근 가능
       *   - 라우팅 의존 코드(useNavigate, useLocation 등)는 반드시 router 내부 컴포넌트에서만 사용
       */}
      <RouterProvider router={router} />
    </Providers>
  )
}

export default App
