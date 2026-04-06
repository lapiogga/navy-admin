import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const BASE = resolve(__dirname, '../../pages/sys05-admin-rules')
const HANDLERS = resolve(__dirname, '../../shared/api/mocks/handlers/sys05.ts')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')
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

    it('Card 레이아웃 사용 (G10 패치)', () => {
      expect(content).toContain('Card')
    })

    it('부대별 카드 링크가 존재한다 (G10 패치)', () => {
      expect(content).toMatch(/1사단|2사단|교육훈련단/)
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

  // GAP 패치 테스트 (G06-G10)
  describe('RegulationListPage GAP 패치', () => {
    const content = read(resolve(BASE, 'RegulationListPage.tsx'))

    it('G06: CrudForm으로 등록/수정 기능이 존재한다', () => {
      expect(content).toContain('CrudForm')
    })

    it('G06: 분류 컬럼이 존재한다', () => {
      expect(content).toContain('category')
    })

    it('G06: 등록 버튼이 존재한다', () => {
      expect(content).toMatch(/규정 등록|등록/)
    })

    it('G09: 조직도 트리가 존재한다', () => {
      expect(content).toContain('Tree')
    })

    it('G09: 조직도 트리 데이터가 존재한다', () => {
      expect(content).toContain('ORG_TREE_DATA')
    })

    it('G06: POST 요청이 존재한다', () => {
      expect(content).toContain("method: 'POST'")
    })

    it('G06: 소관부서 컬럼이 존재한다', () => {
      expect(content).toContain('소관부서')
    })
  })

  describe('PrecedentHQPage GAP 패치', () => {
    const content = read(resolve(BASE, 'PrecedentHQPage.tsx'))

    it('G07: CrudForm으로 등록/수정 기능이 존재한다', () => {
      expect(content).toContain('CrudForm')
    })

    it('G07: 등록 버튼이 존재한다', () => {
      expect(content).toMatch(/예규 등록|등록/)
    })

    it('G07: POST 요청이 존재한다', () => {
      expect(content).toContain("method: 'POST'")
    })
  })

  describe('DirectiveListPage GAP 패치', () => {
    const content = read(resolve(BASE, 'DirectiveListPage.tsx'))

    it('G08: CrudForm으로 등록/수정 기능이 존재한다', () => {
      expect(content).toContain('CrudForm')
    })

    it('G08: 등록 버튼이 존재한다', () => {
      expect(content).toMatch(/지시문서 등록|등록/)
    })

    it('G08: POST 요청이 존재한다', () => {
      expect(content).toContain("method: 'POST'")
    })
  })

  describe('PrecedentUnitPage GAP 패치', () => {
    const content = read(resolve(BASE, 'PrecedentUnitPage.tsx'))

    it('G10: Card 레이아웃으로 변환되었다', () => {
      expect(content).toContain('Card')
    })

    it('G10: 부대 링크가 존재한다', () => {
      expect(content).toMatch(/1사단|2사단|교육훈련단/)
    })

    it('G10: DataTable이 제거되었다', () => {
      expect(content).not.toContain('DataTable')
    })
  })

  describe('sys05 MSW 핸들러 GAP 패치', () => {
    const content = read(resolve(HANDLERS_BASE, 'sys05.ts'))

    it('POST 핸들러가 존재한다', () => {
      expect(content).toContain('http.post')
    })

    it('PUT 핸들러가 존재한다', () => {
      expect(content).toContain('http.put')
    })

    it('DELETE 핸들러가 존재한다', () => {
      expect(content).toContain('http.delete')
    })
  })
})
