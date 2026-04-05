import { describe, it, expect, vi } from 'vitest'
import { downloadCsv } from '@/shared/lib/csv'

describe('downloadCsv 유틸', () => {
  it('downloadCsv가 함수로 export된다', () => {
    expect(typeof downloadCsv).toBe('function')
  })

  it('CSV 문자열이 BOM과 헤더를 포함한다', () => {
    // Blob 생성을 spy하여 CSV 내용 검증
    const blobSpy = vi.fn()
    const originalBlob = global.Blob
    global.Blob = class MockBlob {
      constructor(parts: string[], _opts: object) {
        blobSpy(parts[0])
      }
    } as unknown as typeof Blob

    const originalCreateObjectURL = URL.createObjectURL
    URL.createObjectURL = vi.fn(() => 'blob:mock')
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.revokeObjectURL = vi.fn()

    // createElement mock
    const mockAnchor = { href: '', download: '', click: vi.fn() }
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = vi.fn(() => mockAnchor) as unknown as typeof document.createElement

    downloadCsv('test.csv', [{ name: '홍길동', age: 30 }], [
      { key: 'name', label: '이름' },
      { key: 'age', label: '나이' },
    ])

    expect(blobSpy).toHaveBeenCalled()
    const csvContent = blobSpy.mock.calls[0][0] as string
    expect(csvContent).toContain('\uFEFF') // BOM
    expect(csvContent).toContain('이름,나이') // 헤더
    expect(csvContent).toContain('"홍길동"')

    // cleanup
    global.Blob = originalBlob
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    document.createElement = originalCreateElement
  })
})
