import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const BASE = resolve(__dirname, '../../pages/sys14-suggestion')
const HANDLERS = resolve(__dirname, '../../shared/api/mocks/handlers/sys14.ts')
const INDEX = resolve(BASE, 'index.tsx')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

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

  // === GAP 패치 검증 테스트 ===

  describe('SuggestionListPage GAP 패치', () => {
    const content = read(resolve(BASE, 'SuggestionListPage.tsx'))

    it('G17: 담당부서 컬럼이 존재한다', () => {
      expect(content).toContain('assignedDept')
    })

    it('G17: 조치일 컬럼이 존재한다', () => {
      expect(content).toContain('actionDate')
    })

    it('G17: 조치유형 컬럼이 존재한다', () => {
      expect(content).toContain('actionType')
    })

    it('G18: 연도별 순번 형식이 적용되었다', () => {
      expect(content).toMatch(/year.*index|getFullYear/)
    })

    it('G19: 4단계 진행상태가 정의되어 있다', () => {
      expect(content).toContain('registered')
      expect(content).toContain('received')
      expect(content).toContain('processing')
      expect(content).toContain('completed')
    })

    it('G20: 조치유형 Select가 존재한다', () => {
      expect(content).toMatch(/조치유형|actionType/)
    })

    it('G21: 반려사유 입력이 존재한다', () => {
      expect(content).toContain('rejectReason')
    })

    it('G22: 직책 필드가 존재한다', () => {
      expect(content).toContain('authorPosition')
    })

    it('G22: 전화번호 필드가 존재한다', () => {
      expect(content).toContain('authorPhone')
    })

    it('G23: Upload 컴포넌트가 존재한다', () => {
      expect(content).toContain('Upload')
    })

    it('G24: 댓글 기능이 존재한다', () => {
      expect(content).toContain('comments')
      expect(content).toContain('댓글')
    })

    it('G26: 엑셀 출력 기능이 존재한다', () => {
      expect(content).toMatch(/excel|csv|엑셀/i)
    })
  })

  describe('SuggestionMainPage GAP 패치', () => {
    const content = read(resolve(BASE, 'SuggestionMainPage.tsx'))

    it('G27: 공지사항 영역이 존재한다', () => {
      expect(content).toContain('공지사항')
    })

    it('G27: notices 데이터 조회가 존재한다', () => {
      expect(content).toContain('notices')
    })
  })

  describe('SuggestionAdminPage GAP 패치', () => {
    const content = read(resolve(BASE, 'SuggestionAdminPage.tsx'))

    it('G25: 서식관리 탭/기능이 존재한다', () => {
      expect(content).toContain('서식관리')
    })

    it('G25: 서식 CRUD가 존재한다', () => {
      expect(content).toMatch(/template|서식/)
    })
  })

  describe('sys14 MSW 핸들러 GAP 패치', () => {
    const content = read(resolve(HANDLERS_BASE, 'sys14.ts'))

    it('댓글 API가 존재한다', () => {
      expect(content).toContain('comments')
    })

    it('서식 API가 존재한다', () => {
      expect(content).toContain('templates')
    })

    it('확장 필드가 존재한다', () => {
      expect(content).toContain('assignedDept')
      expect(content).toContain('actionType')
    })

    it('상태변경 API가 존재한다', () => {
      expect(content).toContain('rejectReason')
    })

    it('공지사항 API가 존재한다', () => {
      expect(content).toContain('/api/sys14/notices')
    })
  })
})
