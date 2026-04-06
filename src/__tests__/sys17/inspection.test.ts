import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys17-inspection')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('InspectionUnitPage', () => {
  const content = readFileSync(resolve(BASE, 'InspectionUnitPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Tree 컴포넌트를 포함한다', () => {
    expect(content).toContain('Tree')
  })

  it('checkable prop을 포함한다', () => {
    expect(content).toContain('checkable')
  })

  it('검열부대 지정 타이틀을 포함한다', () => {
    expect(content).toContain('검열부대 지정')
  })

  it('저장 버튼을 포함한다', () => {
    expect(content).toContain('저장')
  })
})

describe('InspectionPlanPage', () => {
  const content = readFileSync(resolve(BASE, 'InspectionPlanPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('검열계획 타이틀을 포함한다', () => {
    expect(content).toContain('검열계획')
  })

  it('검열계획 작성 버튼을 포함한다', () => {
    expect(content).toContain('검열계획 작성')
  })
})

describe('InspectionResultPage', () => {
  const content = readFileSync(resolve(BASE, 'InspectionResultPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('Timeline 컴포넌트를 포함한다', () => {
    expect(content).toContain('Timeline')
  })

  it('조치과제 텍스트를 포함한다', () => {
    expect(content).toContain('조치과제')
  })
})

describe('InspectionApprovalPage', () => {
  const content = readFileSync(resolve(BASE, 'InspectionApprovalPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Steps import를 포함한다', () => {
    expect(content).toContain('Steps')
  })

  it('접수 텍스트를 포함한다', () => {
    expect(content).toContain('접수')
  })

  it('반송 또는 반려 텍스트를 포함한다', () => {
    expect(content).toMatch(/반송|반려/)
  })
})

describe('InspectionProgressPage', () => {
  const content = readFileSync(resolve(BASE, 'InspectionProgressPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('@ant-design/charts import를 포함한다', () => {
    expect(content).toContain('@ant-design/charts')
  })

  it('Bar 컴포넌트를 포함한다', () => {
    expect(content).toContain('Bar')
  })

  it('Statistic 컴포넌트를 포함한다', () => {
    expect(content).toContain('Statistic')
  })

  it('Progress 컴포넌트를 포함한다', () => {
    expect(content).toContain('Progress')
  })
})

describe('InspectionPlanDataPage', () => {
  const content = readFileSync(resolve(BASE, 'InspectionPlanDataPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('검열계획 정보 타이틀을 포함한다', () => {
    expect(content).toContain('검열계획 정보')
  })
})

describe('InspectionResultDataPage', () => {
  const content = readFileSync(resolve(BASE, 'InspectionResultDataPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('검열결과 정보 타이틀을 포함한다', () => {
    expect(content).toContain('검열결과 정보')
  })
})

describe('sys17 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys17.ts'), 'utf-8')

  it('sys17Handlers를 export한다', () => {
    expect(content).toContain('export const sys17Handlers')
  })

  it('extends Record<string, unknown>를 포함한다', () => {
    expect(content).toContain('extends Record<string, unknown>')
  })

  it('GET /api/sys17/plans 핸들러를 포함한다', () => {
    expect(content).toContain('/sys17/plans')
  })

  it('GET /api/sys17/tasks 핸들러를 포함한다', () => {
    expect(content).toContain('/sys17/tasks')
  })

  it('/api/sys17/approval 핸들러를 포함한다', () => {
    expect(content).toContain('/sys17/approval')
  })

  it('/api/sys17/stats/progress 핸들러를 포함한다', () => {
    expect(content).toContain('/sys17/stats/progress')
  })

  it('/api/sys17/approval/:taskId/line 핸들러를 포함한다', () => {
    expect(content).toContain('/sys17/approval/:taskId/line')
  })
})

describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys17Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys17Handlers')
  })
})

describe('sys17-inspection index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('/sys17/ 경로 매핑을 포함한다', () => {
    expect(content).toContain('/sys17/')
  })

  it('InspectionApprovalPage 라우트를 포함한다', () => {
    expect(content).toContain('InspectionApprovalPage')
  })

  it('InspectionPlanDataPage 라우트를 포함한다', () => {
    expect(content).toContain('InspectionPlanDataPage')
  })

  it('InspectionResultDataPage 라우트를 포함한다', () => {
    expect(content).toContain('InspectionResultDataPage')
  })

  it('3/1 경로를 포함한다', () => {
    expect(content).toContain('3/1')
  })

  it('3/2 경로를 포함한다', () => {
    expect(content).toContain('3/2')
  })
})
