import { describe, it, expect } from 'vitest'
import type { ApprovalLine, Approver } from '@/entities/approval/types'

describe('결재선 타입', () => {
  it('ApprovalLine 타입이 정의되어 있다', () => {
    const line: ApprovalLine = {
      id: '1',
      lineName: '기본결재선',
      description: '',
      approvers: [],
      createdBy: 'user1',
      createdAt: '',
      updatedAt: '',
    }
    expect(line.lineName).toBe('기본결재선')
  })

  it('Approver 타입이 정의되어 있다', () => {
    const approver: Approver = {
      userId: '1',
      userName: '홍길동',
      userRank: '대위',
      userUnit: '1사단',
      order: 1,
    }
    expect(approver.order).toBe(1)
  })
})

describe('approvalHandlers MSW 핸들러', () => {
  it('approvalHandlers가 export된다', async () => {
    const { approvalHandlers } = await import('@/shared/api/mocks/handlers/common/approval')
    expect(Array.isArray(approvalHandlers)).toBe(true)
    expect(approvalHandlers.length).toBeGreaterThan(0)
  })
})

describe('systemHandlers MSW 핸들러', () => {
  it('systemHandlers가 export된다', async () => {
    const { systemHandlers } = await import('@/shared/api/mocks/handlers/common/system')
    expect(Array.isArray(systemHandlers)).toBe(true)
    expect(systemHandlers.length).toBeGreaterThan(0)
  })
})
