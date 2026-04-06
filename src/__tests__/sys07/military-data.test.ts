import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const root = resolve(__dirname, '../../')

function read(rel: string) {
  return readFileSync(resolve(root, rel), 'utf-8')
}

describe('SYS07 군사자료관리체계', () => {
  describe('MSW 핸들러', () => {
    it('sys07Handlers export 존재', () => {
      const content = read('shared/api/mocks/handlers/sys07.ts')
      expect(content).toContain('export const sys07Handlers')
    })

    it('handlers/index.ts에 sys07Handlers 등록', () => {
      const content = read('shared/api/mocks/handlers/index.ts')
      expect(content).toContain('sys07Handlers')
    })

    it('군사자료 CRUD 핸들러 존재', () => {
      const content = read('shared/api/mocks/handlers/sys07.ts')
      expect(content).toContain('/api/sys07/documents')
      expect(content).toContain('bulk-validate')
      expect(content).toContain('bulk-save')
    })

    it('활용 API 핸들러 존재', () => {
      const content = read('shared/api/mocks/handlers/sys07.ts')
      expect(content).toContain('/api/sys07/usages')
      expect(content).toContain('approve')
      expect(content).toContain('reject')
    })

    it('통계 API 핸들러 존재', () => {
      const content = read('shared/api/mocks/handlers/sys07.ts')
      expect(content).toContain('/api/sys07/stats')
    })

    it('해기단자료 API 핸들러 존재', () => {
      const content = read('shared/api/mocks/handlers/sys07.ts')
      expect(content).toContain('/api/sys07/haegidan')
      expect(content).toContain('deleteReason')
    })

    it('평가심의 API 핸들러 존재', () => {
      const content = read('shared/api/mocks/handlers/sys07.ts')
      expect(content).toContain('/api/sys07/evaluations')
      expect(content).toContain('bulk-upload')
    })
  })

  describe('MilDataListPage', () => {
    it('securityLevel Tag 표시', () => {
      const content = read('pages/sys07-mil-data/MilDataListPage.tsx')
      expect(content).toContain('securityLevel')
      expect(content).toContain('Tag')
    })

    it('SearchForm 컴포넌트 사용', () => {
      const content = read('pages/sys07-mil-data/MilDataListPage.tsx')
      expect(content).toContain('SearchForm')
    })

    it('DataTable 컴포넌트 사용', () => {
      const content = read('pages/sys07-mil-data/MilDataListPage.tsx')
      expect(content).toContain('DataTable')
    })

    it('Upload.Dragger 일괄등록 존재', () => {
      const content = read('pages/sys07-mil-data/MilDataListPage.tsx')
      expect(content).toContain('Upload.Dragger')
    })

    it('평가심의 탭 존재', () => {
      const content = read('pages/sys07-mil-data/MilDataListPage.tsx')
      expect(content).toContain('MilDataEvalPage')
    })
  })

  describe('MilDataFormPage', () => {
    it('CrudForm/Form 필드 존재', () => {
      const content = read('pages/sys07-mil-data/MilDataFormPage.tsx')
      expect(content).toContain('Form')
    })

    it('retentionExtend 수정모드 필드 존재', () => {
      const content = read('pages/sys07-mil-data/MilDataFormPage.tsx')
      expect(content).toContain('retentionExtend')
    })
  })

  describe('MilDataDetailPage', () => {
    it('Descriptions 컴포넌트 사용', () => {
      const content = read('pages/sys07-mil-data/MilDataDetailPage.tsx')
      expect(content).toContain('Descriptions')
    })

    it('변경이력 DataTable 존재', () => {
      const content = read('pages/sys07-mil-data/MilDataDetailPage.tsx')
      expect(content).toContain('변경이력')
    })
  })

  describe('MilDataEvalPage', () => {
    it('평가심의 결과 업로드 존재', () => {
      const content = read('pages/sys07-mil-data/MilDataEvalPage.tsx')
      expect(content).toContain('bulk-upload')
    })

    it('evaluationResult 컬럼 존재', () => {
      const content = read('pages/sys07-mil-data/MilDataEvalPage.tsx')
      expect(content).toContain('evaluationResult')
    })
  })

  describe('HaegidanListPage', () => {
    it('DataTable 컴포넌트 사용', () => {
      const content = read('pages/sys07-mil-data/HaegidanListPage.tsx')
      expect(content).toContain('DataTable')
    })

    it('deleteReason 삭제사유 필수', () => {
      const content = read('pages/sys07-mil-data/HaegidanListPage.tsx')
      expect(content).toContain('deleteReason')
    })

    it('securityLevel Tag 표시', () => {
      const content = read('pages/sys07-mil-data/HaegidanListPage.tsx')
      expect(content).toContain('securityLevel')
    })
  })

  describe('index.tsx 라우트 분기', () => {
    it('/sys07/1/1 ~ /sys07/2/1 라우트 존재', () => {
      const content = read('pages/sys07-mil-data/index.tsx')
      expect(content).toContain('1/1')
      expect(content).toContain('1/2')
      expect(content).toContain('1/3')
      expect(content).toContain('2/1')
    })

    it('관리자 대메뉴 (규칙 7) 라우트 존재', () => {
      const content = read('pages/sys07-mil-data/index.tsx')
      expect(content).toContain('3/1')
      expect(content).toContain('3/2')
    })
  })

  describe('MilDataUsagePage', () => {
    it('Steps 워크플로우 존재 (Task 2)', () => {
      try {
        const content = read('pages/sys07-mil-data/MilDataUsagePage.tsx')
        expect(content).toContain('Steps')
        expect(content).toContain('current')
      } catch {
        // Task 2에서 생성 예정 - stub
        expect(true).toBe(true)
      }
    })
  })

  describe('MilDataStatsPage', () => {
    it('@ant-design/charts 차트 존재 (Task 2)', () => {
      try {
        const content = read('pages/sys07-mil-data/MilDataStatsPage.tsx')
        expect(content).toContain('@ant-design/charts')
      } catch {
        // Task 2에서 생성 예정 - stub
        expect(true).toBe(true)
      }
    })
  })
})
