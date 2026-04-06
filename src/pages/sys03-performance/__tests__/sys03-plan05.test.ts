import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const BASE = resolve(__dirname, '..')

function read(filePath: string): string {
  return readFileSync(filePath, 'utf-8')
}

describe('sys03 평가결과+게시판+라우터 (Plan 05)', () => {
  describe('PerfEvalResultPage.tsx (평가결과)', () => {
    const content = read(resolve(BASE, 'PerfEvalResultPage.tsx'))

    it('PageContainer 사용', () => {
      expect(content).toContain('PageContainer')
    })

    it('DataTable 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('평가결과 관련 UI', () => {
      expect(content).toContain('평가결과')
    })
  })

  describe('PerfInputStatusPage.tsx (입력현황)', () => {
    const content = read(resolve(BASE, 'PerfInputStatusPage.tsx'))

    it('PageContainer 사용', () => {
      expect(content).toContain('PageContainer')
    })

    it('입력현황 관련 UI', () => {
      expect(content).toContain('입력현황')
    })
  })

  describe('index.tsx (SYS03 라우터)', () => {
    const content = read(resolve(BASE, 'index.tsx'))

    it('Routes/Route import', () => {
      expect(content).toContain('Routes')
      expect(content).toContain('Route')
    })

    it('React.lazy 사용', () => {
      expect(content).toContain('React.lazy')
    })

    it('메인화면 라우트', () => {
      expect(content).toContain('PerfMainPage')
    })

    it('기준정보관리 라우트 (path 1/x)', () => {
      expect(content).toContain('path="1/1"')
      expect(content).toContain('path="1/2"')
    })

    it('연간과제관리 라우트 (path 2/x)', () => {
      expect(content).toContain('path="2/1"')
    })

    it('평가결과 라우트 (path 3/x)', () => {
      expect(content).toContain('path="3/1"')
      expect(content).toContain('path="3/2"')
    })

    it('게시판 lazy import (7대 규칙 6번)', () => {
      expect(content).toContain('BoardListPage')
      expect(content).toContain('sys03-notice')
    })

    it('관리자 대메뉴 라우트 (7대 규칙 7번)', () => {
      expect(content).toContain('AuthGroupPage')
      expect(content).toContain('CodeGroupPage')
      expect(content).toContain('admin/')
    })

    it('과제검색 라우트 (path 5/x)', () => {
      expect(content).toContain('PerfTaskSearchPage')
      expect(content).toContain('path="5/1"')
    })

    it('@ant-design/charts 차트 import (메인 Gauge+Bar)', () => {
      const mainContent = read(resolve(BASE, 'PerfMainPage.tsx'))
      expect(mainContent).toContain("import { Bar, Gauge } from '@ant-design/charts'")
    })
  })
})
