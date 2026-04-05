import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './app/styles/index.css'

async function enableMocking() {
  if (import.meta.env.MODE !== 'development') return
  const { worker } = await import('./shared/api/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
