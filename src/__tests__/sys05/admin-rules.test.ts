import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const BASE = resolve(__dirname, '../../pages/sys05-admin-rules')
const HANDLERS = resolve(__dirname, '../../shared/api/mocks/handlers/sys05.ts')
const INDEX = resolve(BASE, 'index.tsx')

function read(filePath: string): string {
  return readFileSync(filePath, 'utf-8')
}

describe('sys05 행정규칙포탈체계', () => {
  describe('RegulationListPage.tsx', () => {
    const content = read(resolve(BASE, 'RegulationListPage.tsx'))

    it('useFavorites 훅 사용', () => {
      expect(content).toContain('useFavorites')
    })

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('StarFilled 또는 StarOutlined 아이콘 사용', () => {
      const hasStar = content.includes('StarFilled') || content.includes('StarOutlined')
      expect(hasStar).toBe(true)
    })

    it('message.success 다운로드/프린트 Mock 포함', () => {
      expect(content).toContain('message.success')
    })
  })

  describe('PrecedentHQPage.tsx', () => {
    const content = read(resolve(BASE, 'PrecedentHQPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('/api/sys05/precedents/hq 엔드포인트 사용', () => {
      expect(content).toContain('precedents/hq')
    })
  })

  describe('PrecedentUnitPage.tsx', () => {
    const content = read(resolve(BASE, 'PrecedentUnitPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('/api/sys05/precedents/unit 엔드포인트 사용', () => {
      expect(content).toContain('precedents/unit')
    })
  })

  describe('DirectiveListPage.tsx', () => {
    const content = read(resolve(BASE, 'DirectiveListPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('DetailModal 또는 Modal 사용', () => {
      const hasModal = content.includes('DetailModal') || content.includes('Modal')
      expect(hasModal).toBe(true)
    })
  })

  describe('sys05.ts MSW 핸들러', () => {
    const content = read(HANDLERS)

    it('sys05Handlers export 포함', () => {
      expect(content).toContain('sys05Handlers')
    })

    it('regulations 엔드포인트 포함', () => {
      expect(content).toContain('/api/sys05/regulations')
    })

    it('precedents/hq 엔드포인트 포함', () => {
      expect(content).toContain('/api/sys05/precedents/hq')
    })

    it('precedents/unit 엔드포인트 포함', () => {
      expect(content).toContain('/api/sys05/precedents/unit')
    })

    it('directives 엔드포인트 포함', () => {
      expect(content).toContain('/api/sys05/directives')
    })
  })

  describe('index.tsx 라우팅', () => {
    const content = read(INDEX)

    it('1/1 (현행규정) 라우트 포함', () => {
      expect(content).toContain('1/1')
    })

    it('2/1 (해군본부) 라우트 포함', () => {
      expect(content).toContain('2/1')
    })

    it('2/2 (예하부대) 라우트 포함', () => {
      expect(content).toContain('2/2')
    })

    it('3/1 (지시문서) 라우트 포함', () => {
      expect(content).toContain('3/1')
    })

    it('RegulationListPage import 포함', () => {
      expect(content).toContain('RegulationListPage')
    })

    it('Navigate to="/sys05/1/1" 포함', () => {
      expect(content).toContain('/sys05/1/1')
    })
  })
})
