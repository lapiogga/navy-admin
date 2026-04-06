import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const BASE = resolve(__dirname, '..')
const HANDLERS = resolve(__dirname, '../../../shared/api/mocks/handlers/sys03-performance.ts')
const HANDLERS_INDEX = resolve(__dirname, '../../../shared/api/mocks/handlers/index.ts')
const INDEX = resolve(BASE, 'index.tsx')

function read(filePath: string): string {
  return readFileSync(filePath, 'utf-8')
}

describe('sys03 성과관리체계', () => {
  // ==================== 핸들러 검증 ====================
  describe('sys03-performance.ts (MSW 핸들러)', () => {
    const content = read(HANDLERS)

    it('sys03Handlers export 존재', () => {
      expect(content).toContain('export const sys03Handlers')
    })

    it('/api/sys03/stats 핸들러 존재', () => {
      expect(content).toContain('/api/sys03/stats')
    })

    it('/api/sys03/base-years 핸들러 존재', () => {
      expect(content).toContain('/api/sys03/base-years')
    })

    it('/api/sys03/policies 핸들러 존재', () => {
      expect(content).toContain('/api/sys03/policies')
    })

    it('/api/sys03/task-results 핸들러 존재', () => {
      expect(content).toContain('/api/sys03/task-results')
    })

    it('/submit 엔드포인트 존재 (업무실적 상신)', () => {
      expect(content).toContain('/submit')
    })

    it('/approve 엔드포인트 존재 (업무실적 승인)', () => {
      expect(content).toContain('/approve')
    })

    it('/reject 엔드포인트 존재 (업무실적 반려)', () => {
      expect(content).toContain('/reject')
    })

    it('/api/sys03/eval-results 핸들러 존재', () => {
      expect(content).toContain('/api/sys03/eval-results')
    })

    it('/api/sys03/input-status 핸들러 존재', () => {
      expect(content).toContain('/api/sys03/input-status')
    })

    it('content/totalElements 페이지네이션 형식 사용', () => {
      expect(content).toContain('content:')
      expect(content).toContain('totalElements:')
    })
  })

  // ==================== handlers/index.ts 검증 ====================
  describe('handlers/index.ts', () => {
    const content = read(HANDLERS_INDEX)

    it('sys03Handlers import 존재', () => {
      expect(content).toContain("from './sys03-performance'")
    })

    it('sys03Handlers handlers 배열에 포함', () => {
      expect(content).toContain('...sys03Handlers')
    })
  })

  // ==================== index.tsx 검증 ====================
  describe('index.tsx (SYS03 라우터)', () => {
    const content = read(INDEX)

    it('React lazy import 사용', () => {
      expect(content).toContain('React.lazy')
    })

    it('PerfMainPage 라우트 등록', () => {
      expect(content).toContain('PerfMainPage')
    })

    it('PerfBaseYearPage 라우트 등록', () => {
      expect(content).toContain('PerfBaseYearPage')
    })

    it('PerfTaskResultInputPage 라우트 등록', () => {
      expect(content).toContain('PerfTaskResultInputPage')
    })

    it('PerfTaskResultApprovalPage 라우트 등록', () => {
      expect(content).toContain('PerfTaskResultApprovalPage')
    })

    it('PerfEvalResultPage 라우트 등록', () => {
      expect(content).toContain('PerfEvalResultPage')
    })

    it('BoardListPage 공통 게시판 lazy import (7대 규칙 6번)', () => {
      expect(content).toContain('BoardListPage')
    })

    it('AuthGroupPage 관리자 대메뉴 (7대 규칙 7번)', () => {
      expect(content).toContain('AuthGroupPage')
    })

    it('sys03-notice 게시판 등록', () => {
      expect(content).toContain('sys03-notice')
    })

    it('Routes 컴포넌트 사용', () => {
      expect(content).toContain('<Routes>')
    })
  })

  // ==================== 메인 페이지 검증 ====================
  describe('PerfMainPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfMainPage.tsx'))

    it('Statistic 컴포넌트 사용 (달성률 수치 표시)', () => {
      expect(content).toContain('Statistic')
    })

    it('Progress 컴포넌트 사용 (추진율 시각화)', () => {
      expect(content).toContain('Progress')
    })

    it('/sys03/stats API 호출', () => {
      expect(content).toContain('sys03/stats')
    })

    it('useQuery 사용', () => {
      expect(content).toContain('useQuery')
    })

    it('지휘방침별 업무추진율 표시', () => {
      expect(content).toContain('지휘방침별')
    })

    it('부/실/단별 업무추진율 표시', () => {
      expect(content).toContain('부/실/단별')
    })
  })

  // ==================== 기준정보관리 페이지 검증 ====================
  describe('PerfBaseYearPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfBaseYearPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('기준년도 컬럼 표시', () => {
      expect(content).toContain('기준년도')
    })

    it('/sys03/base-years API 호출', () => {
      expect(content).toContain('sys03/base-years')
    })

    it('CRUD 기능 (저장/삭제 mutation)', () => {
      expect(content).toContain('useMutation')
    })
  })

  // ==================== 평가조직 페이지 검증 ====================
  describe('PerfEvalOrgPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfEvalOrgPage.tsx'))

    it('Tabs 컴포넌트 사용 (평가대상부서/평가그룹)', () => {
      expect(content).toContain('Tabs')
    })

    it('Transfer 컴포넌트 사용 (부서 매핑)', () => {
      expect(content).toContain('Transfer')
    })

    it('부대(서) 컬럼 표시 (7대 규칙 5번)', () => {
      expect(content).toContain('부대(서)')
    })
  })

  // ==================== 업무실적 입력 페이지 검증 ====================
  describe('PerfTaskResultInputPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfTaskResultInputPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('StatusBadge 또는 Tag로 상태 표시', () => {
      expect(content).toContain('StatusBadge') || expect(content).toContain('Tag')
    })

    it('상신 기능 (submit API 호출)', () => {
      expect(content).toContain('submit')
    })

    it('Popconfirm 확인 모달 사용', () => {
      expect(content).toContain('Popconfirm')
    })

    it('Slider로 진도율 입력', () => {
      expect(content).toContain('Slider')
    })

    it('반려 사유 표시 (Alert)', () => {
      expect(content).toContain('rejectedReason')
    })
  })

  // ==================== 업무실적 승인 페이지 검증 ====================
  describe('PerfTaskResultApprovalPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfTaskResultApprovalPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('승인 기능 (approve API 호출)', () => {
      expect(content).toContain('approve')
    })

    it('반려 기능 (reject API 호출)', () => {
      expect(content).toContain('reject')
    })

    it('status=pending 필터링', () => {
      expect(content).toContain('pending')
    })
  })

  // ==================== 평가결과 페이지 검증 ====================
  describe('PerfEvalResultPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfEvalResultPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('Progress 컴포넌트로 시각화', () => {
      expect(content).toContain('Progress')
    })

    it('엑셀 저장 버튼 존재', () => {
      expect(content).toContain('엑셀 저장')
    })

    it('평가율 컬럼 표시', () => {
      expect(content).toContain('evalRate')
    })
  })

  // ==================== 입력현황 페이지 검증 ====================
  describe('PerfInputStatusPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfInputStatusPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('Progress 컴포넌트로 시각화', () => {
      expect(content).toContain('Progress')
    })

    it('엑셀 저장 버튼 존재', () => {
      expect(content).toContain('엑셀 저장')
    })

    it('입력율 컬럼 표시', () => {
      expect(content).toContain('inputRate')
    })
  })

  // ==================== 소과제 페이지 검증 ====================
  describe('PerfSubTaskPage.tsx', () => {
    const content = read(resolve(BASE, 'PerfSubTaskPage.tsx'))

    it('DataTable 컴포넌트 사용', () => {
      expect(content).toContain('DataTable')
    })

    it('엑셀 저장 버튼 (DownloadOutlined)', () => {
      expect(content).toContain('DownloadOutlined')
    })

    it('일괄 등록 버튼 (UploadOutlined)', () => {
      expect(content).toContain('UploadOutlined')
    })

    it('목표값 컬럼 표시', () => {
      expect(content).toContain('targetValue')
    })

    it('부대(서) 컬럼 (7대 규칙 5번)', () => {
      expect(content).toContain('부대(서)')
    })
  })
})
