/**
 * SYS08 부대계보관리체계 파일 내용 기반 검증 테스트
 * jsdom 환경에서 heavy antd 모듈 회피를 위해 readFileSync 방식 사용
 */
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'

const SRC = resolve(__dirname, '../../../..')
const SYS08 = resolve(SRC, 'src/pages/sys08-unit-lineage')
const HANDLERS = resolve(SRC, 'src/shared/api/mocks/handlers')
const MENUS = resolve(SRC, 'src/entities/subsystem/menus.ts')
const ROUTER = resolve(SRC, 'src/app/router.tsx')

function read(filePath: string): string {
  return readFileSync(filePath, 'utf-8')
}

describe('SYS08 부대계보관리체계 파일 검증', () => {
  // ==================== MSW 핸들러 ====================
  describe('sys08-unit-lineage.ts MSW 핸들러', () => {
    const handler = read(resolve(HANDLERS, 'sys08-unit-lineage.ts'))

    it('buildTreeNode 함수 포함', () => {
      expect(handler).toContain('buildTreeNode')
    })

    it('sys08Handlers export 포함', () => {
      expect(handler).toContain('export const sys08Handlers')
    })

    it('/api/sys08/unit-tree 핸들러 포함', () => {
      expect(handler).toContain('/api/sys08/unit-tree')
    })

    it('/api/sys08/unit-records 핸들러 포함', () => {
      expect(handler).toContain('/api/sys08/unit-records')
    })

    it('/api/sys08/lineage 핸들러 포함', () => {
      expect(handler).toContain('/api/sys08/lineage')
    })

    it('/api/sys08/key-persons 핸들러 포함', () => {
      expect(handler).toContain('/api/sys08/key-persons')
    })

    it('/api/sys08/activities 핸들러 포함', () => {
      expect(handler).toContain('/api/sys08/activities')
    })

    it('/api/sys08/flags 핸들러 포함 (imageBase64)', () => {
      expect(handler).toContain('/api/sys08/flags')
      expect(handler).toContain('imageBase64')
    })

    it('/api/sys08/auth-request 핸들러 포함', () => {
      expect(handler).toContain('/api/sys08/auth-request')
    })

    it('/api/sys08/stats 핸들러 포함', () => {
      expect(handler).toContain('/api/sys08/stats')
    })
  })

  // ==================== handlers/index.ts 등록 ====================
  describe('handlers/index.ts', () => {
    const index = read(resolve(HANDLERS, 'index.ts'))

    it('sys08Handlers 등록', () => {
      expect(index).toContain('sys08Handlers')
    })
  })

  // ==================== UnitLineageTreePage ====================
  describe('UnitLineageTreePage.tsx', () => {
    const content = read(resolve(SYS08, 'UnitLineageTreePage.tsx'))

    it('<Tree 포함 (D-01)', () => {
      expect(content).toContain('<Tree')
    })

    it('queryKey 포함 (Master-Detail queryKey 패턴)', () => {
      expect(content).toContain('queryKey')
    })

    it('draggable 미포함 (D-02: 조회 전용 Tree)', () => {
      expect(content).not.toContain('draggable')
    })

    it('selectedUnit 상태 기반 계승관계 조회', () => {
      expect(content).toContain('selectedUnit')
    })
  })

  // ==================== UnitFlagPage ====================
  describe('UnitFlagPage.tsx', () => {
    const content = read(resolve(SYS08, 'UnitFlagPage.tsx'))

    it('Upload.Dragger 포함 (D-16)', () => {
      expect(content).toContain('Upload.Dragger')
    })

    it('beforeUpload에서 return false 포함 (Pitfall 3)', () => {
      expect(content).toContain('return false')
    })

    it('readAsDataURL 포함 (Base64 변환)', () => {
      expect(content).toContain('readAsDataURL')
    })

    it('Image 미리보기 포함', () => {
      expect(content).toContain('previewImage')
    })
  })

  // ==================== UnitActivityApprovalPage ====================
  describe('UnitActivityApprovalPage.tsx', () => {
    const content = read(resolve(SYS08, 'UnitActivityApprovalPage.tsx'))

    it('<Steps 포함 (D-27)', () => {
      expect(content).toContain('<Steps')
    })

    it('계보담당 결재 단계 포함', () => {
      expect(content).toContain('계보담당')
    })

    it('승인/반려 버튼 포함', () => {
      expect(content).toContain('승인')
      expect(content).toContain('반려')
    })
  })

  // ==================== UnitStatsPage ====================
  describe('UnitStatsPage.tsx', () => {
    const content = read(resolve(SYS08, 'UnitStatsPage.tsx'))

    it('<Select 포함 (D-19)', () => {
      expect(content).toContain('<Select')
    })

    it('@ant-design/charts import 포함', () => {
      expect(content).toContain('@ant-design/charts')
    })

    it('10종 통계 Select 옵션 포함', () => {
      expect(content).toContain('주요직위자입력현황')
      expect(content).toContain('종합통계')
    })
  })

  // ==================== PrintableReport ====================
  describe('PrintableReport.tsx', () => {
    const content = read(resolve(SYS08, 'PrintableReport.tsx'))

    it('PrintableReport 컴포넌트 포함', () => {
      expect(content).toContain('PrintableReport')
    })

    it('4종 출력 래퍼 포함', () => {
      expect(content).toContain('ActivityPrintableReport')
      expect(content).toContain('KeyPersonPrintableReport')
      expect(content).toContain('LineagePrintableReport')
      expect(content).toContain('FlagPrintableReport')
    })
  })

  // ==================== index.tsx ====================
  describe('index.tsx', () => {
    const content = read(resolve(SYS08, 'index.tsx'))

    it('AdminRoutes lazy import 포함 (7대 규칙 7번)', () => {
      expect(content).toContain('AdminRoutes')
    })

    it('BoardListPage lazy import 포함 (7대 규칙 6번)', () => {
      expect(content).toContain('BoardListPage')
    })

    it('sys08 관리자 대메뉴 라우트 admin/* 포함', () => {
      expect(content).toContain('admin/*')
    })

    it('12개 라우트 경로 이상 포함', () => {
      const pathMatches = content.match(/path=["'][^"']+["']/g) ?? []
      expect(pathMatches.length).toBeGreaterThanOrEqual(12)
    })
  })

  // ==================== menus.ts ====================
  describe('menus.ts', () => {
    const content = read(MENUS)

    it('sys08 관리자 대메뉴 포함 (/sys08/admin)', () => {
      expect(content).toContain('/sys08/admin')
    })

    it('sys08 관리자 하위 adminChildren 포함', () => {
      expect(content).toContain("adminChildren('sys08')")
    })
  })

  // ==================== router.tsx ====================
  describe('router.tsx', () => {
    const content = read(ROUTER)

    it('sys08 라우트 등록', () => {
      expect(content).toContain('sys08')
    })

    it('Sys08Page lazy import 포함', () => {
      expect(content).toContain('sys08-unit-lineage')
    })
  })

  // ==================== 12개 페이지 파일 존재 ====================
  describe('12개 페이지 파일 존재 확인', () => {
    const files = [
      'index.tsx',
      'UnitRecordPage.tsx',
      'UnitLineageTreePage.tsx',
      'UnitKeyPersonPage.tsx',
      'UnitActivityPage.tsx',
      'UnitActivityApprovalPage.tsx',
      'UnitFlagPage.tsx',
      'UnitAuthRequestPage.tsx',
      'UnitAuthMgmtPage.tsx',
      'UnitAuthViewPage.tsx',
      'UnitStatsPage.tsx',
      'PrintableReport.tsx',
    ]

    files.forEach((file) => {
      it(`${file} 존재`, () => {
        const content = read(resolve(SYS08, file))
        expect(content.length).toBeGreaterThan(0)
      })
    })
  })
})
