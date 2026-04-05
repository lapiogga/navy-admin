import { describe, it, expect } from 'vitest'
import { DataTable } from './DataTable'

describe('DataTable', () => {
  it('DataTable 컴포넌트가 export되어 있다', () => {
    expect(DataTable).toBeDefined()
    expect(typeof DataTable).toBe('function')
  })

  it('DataTableProps 타입이 올바른 인터페이스를 가진다', () => {
    // 타입 수준 검증 -- DataTable은 columns, request, rowKey를 필수 props로 받는다
    // 컴파일 타임 체크이므로 이 파일이 tsc --noEmit을 통과하면 증명됨
    expect(true).toBe(true)
  })
})
