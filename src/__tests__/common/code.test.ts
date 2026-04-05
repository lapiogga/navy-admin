import { describe, it, expect } from 'vitest'
import type { CodeGroup, Code, CodeOption } from '@/entities/code/types'

describe('코드관리 타입', () => {
  it('CodeGroup 타입이 정의되어 있다', () => {
    const group: CodeGroup = {
      id: '1',
      groupCode: 'APPROVAL_STATUS',
      groupName: '결재상태',
      description: '',
      useYn: 'Y',
      createdAt: '',
      updatedAt: '',
    }
    expect(group.groupCode).toBe('APPROVAL_STATUS')
  })

  it('CodeOption 타입이 정의되어 있다', () => {
    const opt: CodeOption = { label: '승인', value: 'APPROVED' }
    expect(opt.value).toBe('APPROVED')
  })

  it('Code 타입이 정의되어 있다', () => {
    const code: Code = {
      id: '1',
      groupId: 'g1',
      groupCode: 'APPROVAL_STATUS',
      codeValue: 'APPROVED',
      codeName: '승인',
      sortOrder: 10,
      useYn: 'Y',
      description: '',
      createdAt: '',
    }
    expect(code.codeValue).toBe('APPROVED')
  })
})

describe('codeHandlers MSW 핸들러', () => {
  it('codeHandlers가 export된다', async () => {
    const { codeHandlers } = await import('@/shared/api/mocks/handlers/common/code')
    expect(Array.isArray(codeHandlers)).toBe(true)
    expect(codeHandlers.length).toBeGreaterThan(0)
  })
})

describe('commonHandlers에 codeHandlers 포함', () => {
  it('commonHandlers 배열이 비어있지 않다', async () => {
    const { commonHandlers } = await import('@/shared/api/mocks/handlers/common/index')
    expect(commonHandlers.length).toBeGreaterThan(0)
  })
})
