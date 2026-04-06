import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const BASE = resolve(__dirname, '..')

function read(filePath: string): string {
  return readFileSync(filePath, 'utf-8')
}

describe('sys03 연간과제관리 (Plan 03)', () => {
  describe('PerfProgressRatePage.tsx (추진진도율)', () => {
    const content = read(resolve(BASE, 'PerfProgressRatePage.tsx'))

    it('PageContainer 사용', () => {
      expect(content).toContain('PageContainer')
    })

    it('Bar 차트 import', () => {
      expect(content).toContain("import { Bar } from '@ant-design/charts'")
    })

    it('Tabs로 부대별/부서별 분기', () => {
      expect(content).toContain('부대별 추진진도율')
      expect(content).toContain('부서별 과제별 추진진도율')
    })

    it('엑셀 저장 버튼 존재', () => {
      expect(content).toContain('엑셀 저장')
    })

    it('인쇄 버튼 존재 (7대 규칙 4번)', () => {
      expect(content).toContain('PrinterOutlined')
      expect(content).toContain('인쇄')
    })

    it('부대(서) 컬럼 표기 (7대 규칙 5번)', () => {
      expect(content).toContain('부대(서)')
    })
  })

  describe('PerfTaskResultInputPage.tsx (업무실적입력)', () => {
    const content = read(resolve(BASE, 'PerfTaskResultInputPage.tsx'))

    it('PageContainer 사용', () => {
      expect(content).toContain('PageContainer')
    })

    it('DataTable 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('상신 기능 존재', () => {
      expect(content).toContain('submit')
    })

    it('진도율 필드 존재', () => {
      expect(content).toContain('progressRate')
    })
  })

  describe('PerfTaskResultApprovalPage.tsx (과제실적승인)', () => {
    const content = read(resolve(BASE, 'PerfTaskResultApprovalPage.tsx'))

    it('PageContainer 사용', () => {
      expect(content).toContain('PageContainer')
    })

    it('Steps 결재 워크플로우 존재', () => {
      expect(content).toContain('Steps')
      expect(content).toContain('결재대기')
      expect(content).toContain('승인완료')
    })

    it('승인/반려 Mutation 존재', () => {
      expect(content).toContain('approveMutation')
      expect(content).toContain('rejectMutation')
    })

    it('반려 사유 입력 Modal', () => {
      expect(content).toContain('반려 사유')
    })

    it('부대(서) 컬럼 표기 (7대 규칙 5번)', () => {
      expect(content).toContain('부대(서)')
    })
  })

  describe('PerfTaskResultEvalPage.tsx (과제실적평가)', () => {
    const content = read(resolve(BASE, 'PerfTaskResultEvalPage.tsx'))

    it('PageContainer 사용', () => {
      expect(content).toContain('PageContainer')
    })

    it('DataTable 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('평가 관련 UI 존재', () => {
      expect(content).toContain('평가')
    })
  })

  describe('PerfIndividualResultEvalPage.tsx (업무실적개인평가)', () => {
    const content = read(resolve(BASE, 'PerfIndividualResultEvalPage.tsx'))

    it('PageContainer 사용', () => {
      expect(content).toContain('PageContainer')
    })

    it('DataTable 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('개인 평가 관련 UI', () => {
      expect(content).toContain('평가')
    })
  })
})
