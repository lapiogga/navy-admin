import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys12-directives')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

// DirectiveProgressPage 테스트
describe('DirectiveProgressPage', () => {
  const content = readFileSync(resolve(BASE, 'DirectiveProgressPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Statistic 컴포넌트를 포함한다', () => {
    expect(content).toContain('Statistic')
  })

  it('Progress 컴포넌트를 포함한다', () => {
    expect(content).toContain('Progress')
  })

  it('category 컬럼을 포함한다', () => {
    expect(content).toContain('category')
  })

  it('추진율 텍스트를 포함한다', () => {
    expect(content).toContain('추진율')
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })
})

// DirectiveListPage 테스트
describe('DirectiveListPage', () => {
  const content = readFileSync(resolve(BASE, 'DirectiveListPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('Timeline 컴포넌트를 포함한다', () => {
    expect(content).toContain('Timeline')
  })

  it('지시사항 텍스트를 포함한다', () => {
    expect(content).toContain('지시사항')
  })

  it('조치사항 등록 기능을 포함한다', () => {
    expect(content).toContain('조치사항')
  })
})

// ProposalProgressPage 테스트
describe('ProposalProgressPage', () => {
  const content = readFileSync(resolve(BASE, 'ProposalProgressPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Statistic 컴포넌트를 포함한다', () => {
    expect(content).toContain('Statistic')
  })

  it('Progress 컴포넌트를 포함한다', () => {
    expect(content).toContain('Progress')
  })

  it('건의사항 텍스트를 포함한다', () => {
    expect(content).toContain('건의')
  })
})

// ProposalListPage 테스트
describe('ProposalListPage', () => {
  const content = readFileSync(resolve(BASE, 'ProposalListPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('Timeline 컴포넌트를 포함한다', () => {
    expect(content).toContain('Timeline')
  })

  it('건의사항 텍스트를 포함한다', () => {
    expect(content).toContain('건의사항')
  })
})

// DirectiveAdminPage 테스트
describe('DirectiveAdminPage', () => {
  const content = readFileSync(resolve(BASE, 'DirectiveAdminPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Tabs 컴포넌트를 포함한다', () => {
    expect(content).toContain('Tabs')
  })

  it('@ant-design/charts Bar를 포함한다', () => {
    expect(content).toMatch(/@ant-design\/charts|Bar/)
  })

  it('관리자 기능 탭을 포함한다', () => {
    expect(content).toContain('관리자')
  })
})

// sys12 MSW 핸들러 테스트
describe('sys12 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys12.ts'), 'utf-8')

  it('sys12Handlers를 export한다', () => {
    expect(content).toContain('export const sys12Handlers')
  })

  it('/sys12/directives 핸들러를 포함한다', () => {
    expect(content).toContain('/sys12/directives')
  })

  it('/sys12/proposals 핸들러를 포함한다', () => {
    expect(content).toContain('/sys12/proposals')
  })

  it('extends Record<string, unknown> 패턴을 포함한다', () => {
    expect(content).toContain('extends Record<string, unknown>')
  })

  it('ProgressStatus 타입을 포함한다', () => {
    expect(content).toContain('ProgressStatus')
  })

  it('GET 지시사항 목록 핸들러를 포함한다', () => {
    expect(content).toContain("http.get('/api/sys12/directives'")
  })

  it('POST 지시사항 등록 핸들러를 포함한다', () => {
    expect(content).toContain("http.post('/api/sys12/directives'")
  })

  it('PUT 지시사항 수정 핸들러를 포함한다', () => {
    expect(content).toContain("http.put('/api/sys12/directives/:id'")
  })

  it('DELETE 지시사항 삭제 핸들러를 포함한다', () => {
    expect(content).toContain("http.delete('/api/sys12/directives/:id'")
  })

  it('GET 지시사항 추진현황 통계 핸들러를 포함한다', () => {
    expect(content).toContain('/sys12/directives/progress')
  })

  it('GET 이행 이력 핸들러를 포함한다', () => {
    expect(content).toContain('/history')
  })

  it('GET 건의사항 목록 핸들러를 포함한다', () => {
    expect(content).toContain("http.get('/api/sys12/proposals'")
  })
})

// handlers/index.ts 테스트
describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys12Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys12Handlers')
  })
})

// index.tsx 라우팅 테스트
describe('sys12-directives index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('/sys12/ 경로 매핑을 포함한다', () => {
    expect(content).toMatch(/sys12|Navigate/)
  })

  it('common/board lazy import를 포함한다', () => {
    expect(content).toMatch(/common\/board|BoardIndex/)
  })

  it('DirectiveProgressPage 라우트를 포함한다', () => {
    expect(content).toContain('DirectiveProgressPage')
  })

  it('ProposalProgressPage 라우트를 포함한다', () => {
    expect(content).toContain('ProposalProgressPage')
  })

  it('DirectiveAdminPage 라우트를 포함한다', () => {
    expect(content).toContain('DirectiveAdminPage')
  })
})
