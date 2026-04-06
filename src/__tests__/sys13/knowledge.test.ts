import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys13-knowledge')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('KnowledgeListPage', () => {
  const content = readFileSync(resolve(BASE, 'KnowledgeListPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('SearchForm 또는 검색 UI를 포함한다', () => {
    expect(content).toMatch(/SearchForm|검색/)
  })

  it('category 컬럼을 포함한다', () => {
    expect(content).toContain('category')
  })

  it('recommendCount 컬럼을 포함한다', () => {
    expect(content).toContain('recommendCount')
  })

  it('rating 컬럼을 포함한다', () => {
    expect(content).toContain('rating')
  })

  it('viewCount 컬럼을 포함한다', () => {
    expect(content).toContain('viewCount')
  })

  it('authorUnit 컬럼을 포함한다', () => {
    expect(content).toContain('authorUnit')
  })
})

describe('KnowledgeDetailPage', () => {
  const content = readFileSync(resolve(BASE, 'KnowledgeDetailPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Rate 컴포넌트를 포함한다', () => {
    expect(content).toContain('Rate')
  })

  it('추천 기능을 포함한다', () => {
    expect(content).toMatch(/LikeOutlined|추천/)
  })

  it('댓글 기능을 포함한다', () => {
    expect(content).toContain('댓글')
  })
})

describe('MyKnowledgePage', () => {
  const content = readFileSync(resolve(BASE, 'MyKnowledgePage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('지식 등록 버튼을 포함한다', () => {
    expect(content).toContain('지식 등록')
  })
})

describe('KnowledgeAdminPage', () => {
  const content = readFileSync(resolve(BASE, 'KnowledgeAdminPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('승인 기능을 포함한다', () => {
    expect(content).toContain('승인')
  })

  it('반려 기능을 포함한다', () => {
    expect(content).toContain('반려')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })
})

describe('KnowledgeStatsPage', () => {
  const content = readFileSync(resolve(BASE, 'KnowledgeStatsPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('@ant-design/charts import를 포함한다', () => {
    expect(content).toContain('@ant-design/charts')
  })

  it('Pie 차트를 포함한다', () => {
    expect(content).toContain('Pie')
  })

  it('Bar 차트를 포함한다', () => {
    expect(content).toContain('Bar')
  })

  it('DatePicker 또는 RangePicker 기간 필터를 포함한다', () => {
    expect(content).toMatch(/DatePicker|RangePicker/)
  })

  it('인기순 정렬을 포함한다', () => {
    expect(content).toMatch(/인기순|작성수순/)
  })
})

describe('sys13 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys13.ts'), 'utf-8')

  it('sys13Handlers를 export한다', () => {
    expect(content).toContain('export const sys13Handlers')
  })

  it('extends Record<string, unknown> 패턴을 포함한다', () => {
    expect(content).toContain('extends Record<string, unknown>')
  })

  it('/api/sys13/knowledge 경로를 포함한다', () => {
    expect(content).toContain('/api/sys13/knowledge')
  })

  it('/api/sys13/stats/ 경로를 포함한다', () => {
    expect(content).toContain('/api/sys13/stats/')
  })
})

describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys13Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys13Handlers')
  })
})

describe('sys13-knowledge index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('sys13 경로 매핑을 포함한다', () => {
    expect(content).toMatch(/sys13/)
  })

  it('BoardIndex (게시판 재사용)를 포함한다', () => {
    expect(content).toMatch(/BoardIndex|board/)
  })

  it('CodeMgmt (코드관리 재사용)를 포함한다', () => {
    expect(content).toMatch(/CodeMgmt|code-mgmt/)
  })

  it('AuthGroup (권한관리 재사용)를 포함한다', () => {
    expect(content).toMatch(/AuthGroup|auth-group/)
  })
})
