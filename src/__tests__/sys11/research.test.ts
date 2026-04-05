import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys11-research')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('ResearchMainPage', () => {
  const content = readFileSync(resolve(BASE, 'ResearchMainPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Statistic 컴포넌트를 포함한다', () => {
    expect(content).toContain('Statistic')
  })

  it('전체보기 버튼을 포함한다', () => {
    expect(content).toContain('전체보기')
  })

  it('최신 자료 카드를 포함한다', () => {
    expect(content).toContain('최신 자료')
  })

  it('인기 자료 카드를 포함한다', () => {
    expect(content).toContain('인기 자료')
  })
})

describe('ResearchListPage', () => {
  const content = readFileSync(resolve(BASE, 'ResearchListPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('다운로드 버튼을 포함한다', () => {
    expect(content).toContain('다운로드')
  })

  it('message.success 호출을 포함한다', () => {
    expect(content).toContain('message.success')
  })

  it('자료 등록 버튼을 포함한다', () => {
    expect(content).toContain('자료 등록')
  })
})

describe('ResearchFilePage', () => {
  const content = readFileSync(resolve(BASE, 'ResearchFilePage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('message.success 호출을 포함한다', () => {
    expect(content).toContain('message.success')
  })

  it('자료실 타이틀을 포함한다', () => {
    expect(content).toContain('자료실')
  })

  it('다운로드 버튼을 포함한다', () => {
    expect(content).toContain('다운로드')
  })
})

describe('ResearchAdminPage', () => {
  const content = readFileSync(resolve(BASE, 'ResearchAdminPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Tabs 컴포넌트를 포함한다', () => {
    expect(content).toContain('Tabs')
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('자료관리 탭을 포함한다', () => {
    expect(content).toContain('자료관리')
  })

  it('카테고리관리 탭을 포함한다', () => {
    expect(content).toContain('카테고리관리')
  })

  it('통계 탭을 포함한다', () => {
    expect(content).toContain('통계')
  })
})

describe('sys11 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys11.ts'), 'utf-8')

  it('sys11Handlers를 export한다', () => {
    expect(content).toContain('export const sys11Handlers')
  })

  it('GET /api/sys11/research 핸들러를 포함한다', () => {
    expect(content).toContain("http.get('/api/sys11/research'")
  })

  it('GET /api/sys11/research/stats 핸들러를 포함한다', () => {
    expect(content).toContain("http.get('/api/sys11/research/stats'")
  })

  it('GET /api/sys11/categories 핸들러를 포함한다', () => {
    expect(content).toContain("http.get('/api/sys11/categories'")
  })

  it('POST /api/sys11/research 핸들러를 포함한다', () => {
    expect(content).toContain("http.post('/api/sys11/research'")
  })

  it('PUT /api/sys11/research/:id 핸들러를 포함한다', () => {
    expect(content).toContain("http.put('/api/sys11/research/:id'")
  })

  it('DELETE /api/sys11/research/:id 핸들러를 포함한다', () => {
    expect(content).toContain("http.delete('/api/sys11/research/:id'")
  })
})

describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys11Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys11Handlers')
  })
})

describe('sys11-research index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('Navigate to /sys11/1/1 리다이렉트를 포함한다', () => {
    expect(content).toContain('Navigate to="/sys11/1/1"')
  })

  it('BoardIndex (RSRC-04 공지사항 재사용)를 포함한다', () => {
    expect(content).toContain('BoardIndex')
  })

  it('AuthGroupIndex (RSRC-06 권한관리 재사용)를 포함한다', () => {
    expect(content).toContain('AuthGroupIndex')
  })

  it('ResearchMainPage 라우트를 포함한다', () => {
    expect(content).toContain('ResearchMainPage')
  })

  it('ResearchListPage 라우트를 포함한다', () => {
    expect(content).toContain('ResearchListPage')
  })

  it('ResearchFilePage 라우트를 포함한다', () => {
    expect(content).toContain('ResearchFilePage')
  })

  it('ResearchAdminPage 라우트를 포함한다', () => {
    expect(content).toContain('ResearchAdminPage')
  })
})
