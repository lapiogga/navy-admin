import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = resolve(__dirname, '..')
const handlersDir = resolve(__dirname, '../../../shared/api/mocks/handlers')

function readPage(name: string): string {
  return readFileSync(resolve(root, name), 'utf-8')
}

function readHandler(name: string): string {
  return readFileSync(resolve(handlersDir, name), 'utf-8')
}

// ──────────────────────────────────────────────────
// 파일 존재 확인
// ──────────────────────────────────────────────────
describe('SYS15 Plan02: 파일 존재 확인', () => {
  const pages = [
    'SecretMediaPage.tsx',
    'SecretPage.tsx',
    'MediaPage.tsx',
    'EquipmentPage.tsx',
    'NoticeDocPage.tsx',
    'TransferPage.tsx',
  ]

  pages.forEach((page) => {
    it(`${page} 파일이 존재한다`, () => {
      expect(existsSync(resolve(root, page))).toBe(true)
    })
  })

  it('sys15-security.ts handler 파일이 존재한다', () => {
    expect(existsSync(resolve(handlersDir, 'sys15-security.ts'))).toBe(true)
  })
})

// ──────────────────────────────────────────────────
// SecretMediaPage: 공통 컴포넌트 검증
// ──────────────────────────────────────────────────
describe('SYS15 SecretMediaPage: 공통 컴포넌트', () => {
  it('type prop이 secret | media | equipment 3종을 포함한다 (D-17)', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain("type: 'secret' | 'media' | 'equipment'")
  })

  it('DataTable 컴포넌트를 사용한다', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('CrudForm 또는 Form Modal을 포함한다 (등록/수정)', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('Form')
  })

  it('Upload 컴포넌트를 포함한다 (일괄등록)', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('Upload')
  })

  it('PrintableReport를 포함한다 (관리대장 출력)', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('PrintableReport')
  })

  it('DatePicker.RangePicker로 기간 검색이 가능하다', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('RangePicker')
  })

  it('부대(서) 검색 Select가 있다 (7대 규칙 5번)', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('부대(서)')
  })

  it('비밀등급(classification) 컬럼이 포함된다 (7대 규칙 1번)', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('classification')
  })

  it('엑셀 저장 기능이 포함된다', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('엑셀')
  })

  it('삭제 사유 입력 Modal이 있다 (TextArea)', () => {
    const content = readPage('SecretMediaPage.tsx')
    expect(content).toContain('TextArea')
  })
})

// ──────────────────────────────────────────────────
// SecretPage / MediaPage / EquipmentPage: 래퍼 확인
// ──────────────────────────────────────────────────
describe('SYS15 SecretPage: SecretMediaPage type=secret 래퍼', () => {
  it('SecretMediaPage를 import한다', () => {
    const content = readPage('SecretPage.tsx')
    expect(content).toContain('SecretMediaPage')
  })

  it("type='secret'로 렌더링한다", () => {
    const content = readPage('SecretPage.tsx')
    expect(content).toContain("type=\"secret\"")
  })

  it('비밀 등록 후 예고문 Modal 자동 오픈 콜백이 있다 (D-19)', () => {
    const content = readPage('SecretPage.tsx')
    expect(content).toContain('onSecretCreated')
  })
})

describe('SYS15 MediaPage: SecretMediaPage type=media 래퍼', () => {
  it('SecretMediaPage를 import한다', () => {
    const content = readPage('MediaPage.tsx')
    expect(content).toContain('SecretMediaPage')
  })

  it("type='media'로 렌더링한다", () => {
    const content = readPage('MediaPage.tsx')
    expect(content).toContain("type=\"media\"")
  })
})

describe('SYS15 EquipmentPage: SecretMediaPage type=equipment 래퍼', () => {
  it('SecretMediaPage를 import한다', () => {
    const content = readPage('EquipmentPage.tsx')
    expect(content).toContain('SecretMediaPage')
  })

  it("type='equipment'로 렌더링한다", () => {
    const content = readPage('EquipmentPage.tsx')
    expect(content).toContain("type=\"equipment\"")
  })
})

// ──────────────────────────────────────────────────
// NoticeDocPage: 예고문 관리
// ──────────────────────────────────────────────────
describe('SYS15 NoticeDocPage: 예고문 관리', () => {
  it('DataTable 컴포넌트를 사용한다 (목록 조회)', () => {
    const content = readPage('NoticeDocPage.tsx')
    expect(content).toContain('DataTable')
  })

  it('Form Modal(등록/수정)이 있다', () => {
    const content = readPage('NoticeDocPage.tsx')
    expect(content).toContain('Form')
  })

  it('예고일자 DatePicker가 있다 (SEC-17)', () => {
    const content = readPage('NoticeDocPage.tsx')
    expect(content).toContain('DatePicker')
  })

  it('예고문 알림 발송 message.info가 있다 (D-20)', () => {
    const content = readPage('NoticeDocPage.tsx')
    expect(content).toContain('예고문 알림이 발송되었습니다')
  })

  it('수신자 Select가 있다', () => {
    const content = readPage('NoticeDocPage.tsx')
    expect(content).toContain('recipients')
  })

  it('StatusBadge로 상태를 표시한다', () => {
    const content = readPage('NoticeDocPage.tsx')
    expect(content).toContain('StatusBadge')
  })

  it('내용 TextArea가 있다', () => {
    const content = readPage('NoticeDocPage.tsx')
    expect(content).toContain('TextArea')
  })
})

// ──────────────────────────────────────────────────
// TransferPage: 인계/인수 워크플로우
// ──────────────────────────────────────────────────
describe('SYS15 TransferPage: 인계/인수 워크플로우', () => {
  it('Tabs 컴포넌트로 인계/인수를 분리한다 (D-21)', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('Tabs')
  })

  it('Steps 컴포넌트로 결재 흐름을 표시한다 (D-23)', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('Steps')
  })

  it('Checkbox로 인계 대상을 다중 선택한다 (D-21)', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('Checkbox')
  })

  it('StatusBadge로 인계/인수 상태를 표시한다', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('StatusBadge')
  })

  it('인수자 Select가 있다 (D-21)', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('Select')
  })

  it('인계 등록 Button이 있다', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('인계 등록')
  })

  it('인수확인 버튼이 있다 (D-22)', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('인수확인')
  })

  it('반송 버튼이 있다 (D-22)', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('반송')
  })

  it('인계자/인수자 정보를 Descriptions로 표시한다', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('Descriptions')
  })

  it('DataTable로 인계 내역을 조회한다', () => {
    const content = readPage('TransferPage.tsx')
    expect(content).toContain('DataTable')
  })
})

// ──────────────────────────────────────────────────
// MSW Handler: sys15-security.ts 검증
// ──────────────────────────────────────────────────
describe('SYS15 MSW Handler: sys15-security.ts', () => {
  it('sys15Handlers가 export된다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('export const sys15Handlers')
  })

  it('비밀 GET/POST/PUT/DELETE 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/secrets')
  })

  it('저장매체 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/media')
  })

  it('보안자재 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/equipment')
  })

  it('예고문 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/notice-docs')
  })

  it('인계/인수 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/transfers')
  })

  it('Wave 2 스텁 checklist 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/checklist')
  })

  it('Wave 2 스텁 daily-settlement 엔드포인트가 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('/api/sys15/daily-settlement')
  })

  it('Faker.js 한국어 로케일을 사용한다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain("'@faker-js/faker/locale/ko'")
  })

  it('SecretItem 타입이 정의되어 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('SecretItem')
  })

  it('TransferRecord 타입이 정의되어 있다', () => {
    const content = readHandler('sys15-security.ts')
    expect(content).toContain('TransferRecord')
  })
})

// ──────────────────────────────────────────────────
// handlers/index.ts: sys15Handlers 등록 확인
// ──────────────────────────────────────────────────
describe('SYS15 handlers/index.ts: sys15Handlers 등록', () => {
  it('sys15Handlers가 handlers 배열에 포함된다', () => {
    const content = readHandler('index.ts')
    expect(content).toContain('sys15Handlers')
  })

  it('sys15-security 모듈을 import한다', () => {
    const content = readHandler('index.ts')
    expect(content).toContain('./sys15-security')
  })
})
