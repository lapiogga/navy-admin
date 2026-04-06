import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys02-survey')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('MySurveyPage', () => {
  const content = readFileSync(resolve(BASE, 'MySurveyPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('설문명 컬럼을 포함한다', () => {
    expect(content).toContain('surveyName')
  })

  it('상태 컬럼을 포함한다', () => {
    expect(content).toContain('status')
  })

  it('나의 설문관리 타이틀을 포함한다', () => {
    expect(content).toContain('나의 설문관리')
  })
})

describe('SurveyQuestionEditor', () => {
  const content = readFileSync(resolve(BASE, 'SurveyQuestionEditor.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('@dnd-kit import를 포함한다', () => {
    expect(content).toMatch(/@dnd-kit/)
  })

  it('DndContext를 포함한다', () => {
    expect(content).toContain('DndContext')
  })

  it('SortableContext를 포함한다', () => {
    expect(content).toContain('SortableContext')
  })

  it('useSortable을 포함한다', () => {
    expect(content).toContain('useSortable')
  })

  it('HolderOutlined 아이콘을 포함한다', () => {
    expect(content).toContain('HolderOutlined')
  })

  it('문항 추가 텍스트를 포함한다', () => {
    expect(content).toContain('문항 추가')
  })

  it('arrayMove를 사용한다', () => {
    expect(content).toContain('arrayMove')
  })
})

describe('SurveyParticipationPage', () => {
  const content = readFileSync(resolve(BASE, 'SurveyParticipationPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('설문참여 관련 텍스트를 포함한다', () => {
    expect(content).toMatch(/설문참여|surveyName/)
  })
})

describe('SurveyFormPage', () => {
  const content = readFileSync(resolve(BASE, 'SurveyFormPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Radio 컴포넌트를 포함한다', () => {
    expect(content).toContain('Radio')
  })

  it('Checkbox 컴포넌트를 포함한다', () => {
    expect(content).toContain('Checkbox')
  })

  it('Rate 컴포넌트를 포함한다', () => {
    expect(content).toContain('Rate')
  })

  it('제출 버튼 텍스트를 포함한다', () => {
    expect(content).toContain('제출')
  })
})

describe('SurveyResultPage', () => {
  const content = readFileSync(resolve(BASE, 'SurveyResultPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('@ant-design/charts import를 포함한다', () => {
    expect(content).toContain('@ant-design/charts')
  })

  it('Bar 차트를 포함한다', () => {
    expect(content).toContain('Bar')
  })

  it('Statistic 컴포넌트를 포함한다', () => {
    expect(content).toContain('Statistic')
  })
})

describe('PastSurveyPage', () => {
  const content = readFileSync(resolve(BASE, 'PastSurveyPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('closed 상태 참조를 포함한다', () => {
    expect(content).toContain('closed')
  })
})

describe('SurveyAdminPage', () => {
  const content = readFileSync(resolve(BASE, 'SurveyAdminPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('승인 텍스트를 포함한다', () => {
    expect(content).toContain('승인')
  })

  it('반려 텍스트를 포함한다', () => {
    expect(content).toContain('반려')
  })

  it('Tabs import를 포함한다', () => {
    expect(content).toContain('Tabs')
  })

  it('카테고리 텍스트를 포함한다', () => {
    expect(content).toContain('카테고리')
  })

  it('통계 텍스트를 포함한다', () => {
    expect(content).toContain('통계')
  })

  it('대상자 텍스트를 포함한다', () => {
    expect(content).toContain('대상자')
  })

  it('템플릿 텍스트를 포함한다', () => {
    expect(content).toContain('템플릿')
  })
})

describe('sys02 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys02.ts'), 'utf-8')

  it('sys02Handlers를 export한다', () => {
    expect(content).toContain('sys02Handlers')
  })

  it('/api/sys02/surveys 핸들러를 포함한다', () => {
    expect(content).toContain('/sys02/surveys')
  })

  it('/api/sys02/surveys/participation 핸들러를 포함한다', () => {
    expect(content).toContain('/sys02/surveys/participation')
  })

  it('/api/sys02/surveys/pending 핸들러를 포함한다', () => {
    expect(content).toContain('/sys02/surveys/pending')
  })

  it('/api/sys02/categories 핸들러를 포함한다', () => {
    expect(content).toContain('/sys02/categories')
  })

  it('/api/sys02/templates 핸들러를 포함한다', () => {
    expect(content).toContain('/sys02/templates')
  })

  it('/api/sys02/stats 핸들러를 포함한다', () => {
    expect(content).toContain('/sys02/stats')
  })

  it('extends Record<string, unknown> 타입을 포함한다', () => {
    expect(content).toContain('extends Record<string, unknown>')
  })
})

describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys02Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys02Handlers')
  })
})

describe('sys02-survey index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('/sys02/ 경로 매핑을 포함한다', () => {
    expect(content).toContain('/sys02/')
  })

  it('SurveyQuestionEditor를 포함한다', () => {
    expect(content).toContain('SurveyQuestionEditor')
  })
})
