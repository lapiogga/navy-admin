import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const BASE = resolve(__dirname, '../../pages/sys14-suggestion')
const HANDLERS = resolve(__dirname, '../../shared/api/mocks/handlers/sys14.ts')
const INDEX = resolve(BASE, 'index.tsx')

function read(filePath: string): string {
  return readFileSync(filePath, 'utf-8')
}

describe('sys14 나의제언', () => {
  describe('SuggestionMainPage.tsx', () => {
    const content = read(resolve(BASE, 'SuggestionMainPage.tsx'))

    it('Statistic 컴포넌트 사용', () => {
      expect(content).toContain('Statistic')
    })

    it('Card 컴포넌트 사용', () => {
      expect(content).toContain('Card')
    })

    it('navigate 전체보기 포함', () => {
      expect(content).toContain('navigate')
    })

    it('전체보기 버튼 포함', () => {
      expect(content).toContain('전체보기')
    })

    it('/api/sys14/suggestions/stats 호출', () => {
      expect(content).toContain('suggestions/stats')
    })

    it('/api/sys14/suggestions/recent 호출', () => {
      expect(content).toContain('suggestions/recent')
    })
  })

  describe('SuggestionListPage.tsx', () => {
    const content = read(resolve(BASE, 'SuggestionListPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('CrudForm 컴포넌트 사용', () => {
      expect(content).toContain('CrudForm')
    })

    it('recommend 추천 기능 포함', () => {
      expect(content).toContain('recommend')
    })

    it('report 신고 기능 포함', () => {
      expect(content).toContain('report')
    })

    it('LikeOutlined 아이콘 사용', () => {
      expect(content).toContain('LikeOutlined')
    })

    it('WarningOutlined 아이콘 사용', () => {
      expect(content).toContain('WarningOutlined')
    })

    it('답변 영역 표시', () => {
      expect(content).toContain('answer')
    })
  })

  describe('SuggestionAdminPage.tsx', () => {
    const content = read(resolve(BASE, 'SuggestionAdminPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('답변 등록 기능 포함', () => {
      expect(content).toContain('answer')
    })

    it('비공개 처리 기능 포함', () => {
      const hasPrivate = content.includes('private') || content.includes('isPrivate')
      expect(hasPrivate).toBe(true)
    })

    it('Popconfirm 사용', () => {
      expect(content).toContain('Popconfirm')
    })

    it('message.success 포함', () => {
      expect(content).toContain('message.success')
    })
  })

  describe('sys14.ts MSW 핸들러', () => {
    const content = read(HANDLERS)

    it('sys14Handlers export 포함', () => {
      expect(content).toContain('sys14Handlers')
    })

    it('추천 API 포함', () => {
      expect(content).toContain('/api/sys14/suggestions/:id/recommend')
    })

    it('신고 API 포함', () => {
      expect(content).toContain('/api/sys14/suggestions/:id/report')
    })

    it('비공개 API 포함', () => {
      expect(content).toContain('/api/sys14/suggestions/:id/private')
    })

    it('답변 API 포함', () => {
      expect(content).toContain('/api/sys14/suggestions/:id/answer')
    })

    it('통계 API 포함', () => {
      expect(content).toContain('/api/sys14/suggestions/stats')
    })

    it('최신목록 API 포함', () => {
      expect(content).toContain('/api/sys14/suggestions/recent')
    })
  })

  describe('index.tsx 라우팅', () => {
    const content = read(INDEX)

    it('SuggestionMainPage import 포함', () => {
      expect(content).toContain('SuggestionMainPage')
    })

    it('BoardIndex (공통 게시판) 포함', () => {
      expect(content).toContain('BoardIndex')
    })

    it('AuthGroupIndex (공통 권한관리) 포함', () => {
      expect(content).toContain('AuthGroupIndex')
    })

    it('Navigate to="/sys14/1/1" 포함', () => {
      expect(content).toContain('/sys14/1/1')
    })

    it('1/3 (제언확인) 라우트 포함', () => {
      expect(content).toContain('1/3')
    })

    it('1/4 (관리자) 라우트 포함', () => {
      expect(content).toContain('1/4')
    })

    it('2/1 (권한관리) 라우트 포함', () => {
      expect(content).toContain('2/1')
    })
  })
})
