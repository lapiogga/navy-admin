/**
 * sys16 회의실예약관리체계 Nyquist 테스트
 * readFileSync 기반으로 컴포넌트 존재 여부와 핵심 요소를 검증한다.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys16-meeting-room')
const HANDLERS_DIR = resolve(__dirname, '../../shared/api/mocks/handlers')

function readFile(filePath: string): string {
  return readFileSync(filePath, 'utf-8')
}

describe('sys16 회의실예약관리체계 — Nyquist 테스트', () => {
  describe('MeetingReservePage (ROOM-01 — 회의예약신청)', () => {
    const content = readFile(resolve(BASE, 'MeetingReservePage.tsx'))

    it('DatePicker를 포함한다', () => {
      expect(content).toContain('DatePicker')
    })

    it('TimePicker를 포함한다', () => {
      expect(content).toContain('TimePicker')
    })

    it('회의실 Select를 포함한다', () => {
      expect(content).toContain('Select')
    })

    it('예약 신청 POST API를 호출한다', () => {
      expect(content).toContain('/api/sys16/reservations')
    })
  })

  describe('MyReservationPage (ROOM-02 — 내예약확인)', () => {
    const content = readFile(resolve(BASE, 'MyReservationPage.tsx'))

    it('DataTable을 포함한다', () => {
      expect(content).toContain('DataTable')
    })

    it('StatusBadge를 포함한다', () => {
      expect(content).toContain('StatusBadge')
    })

    it('수정 Popconfirm 또는 Modal을 포함한다', () => {
      expect(content.includes('Modal') || content.includes('Popconfirm')).toBe(true)
    })

    it('삭제 Popconfirm을 포함한다', () => {
      expect(content).toContain('Popconfirm')
    })
  })

  describe('ReservationMgmtPage (ROOM-03 — 회의예약관리)', () => {
    const content = readFile(resolve(BASE, 'ReservationMgmtPage.tsx'))

    it('Popconfirm을 포함한다', () => {
      expect(content).toContain('Popconfirm')
    })

    it('승인(approve) API를 호출한다', () => {
      expect(content).toContain('approve')
    })

    it('반려(reject) API를 호출한다', () => {
      expect(content).toContain('reject')
    })

    it('DataTable을 포함한다', () => {
      expect(content).toContain('DataTable')
    })
  })

  describe('MeetingRoomMgmtPage (ROOM-04 — 회의실관리)', () => {
    const content = readFile(resolve(BASE, 'MeetingRoomMgmtPage.tsx'))

    it('Tabs를 포함한다', () => {
      expect(content).toContain('Tabs')
    })

    it('TimePicker.RangePicker 또는 TimePicker를 포함한다 (시간대 설정)', () => {
      expect(content.includes('TimePicker.RangePicker') || content.includes('TimePicker')).toBe(true)
    })

    it('Upload를 포함한다 (사진 관리)', () => {
      expect(content).toContain('Upload')
    })

    it('Switch를 포함한다 (요일별 운영여부)', () => {
      expect(content).toContain('Switch')
    })

    it('schedule 관련 로직을 포함한다', () => {
      expect(content).toContain('schedule')
    })

    it('equipment 관련 로직을 포함한다', () => {
      expect(content).toContain('equipment')
    })
  })

  describe('MeetingStatusPage (ROOM-05 — 회의현황)', () => {
    const content = readFile(resolve(BASE, 'MeetingStatusPage.tsx'))

    it('DataTable을 포함한다', () => {
      expect(content).toContain('DataTable')
    })

    it('StatusBadge를 포함한다', () => {
      expect(content).toContain('StatusBadge')
    })

    it('날짜 범위 필터를 포함한다', () => {
      expect(content).toContain('RangePicker')
    })
  })

  describe('sys16 MSW 핸들러', () => {
    const content = readFile(resolve(HANDLERS_DIR, 'sys16.ts'))

    it('sys16Handlers를 export한다', () => {
      expect(content).toContain('sys16Handlers')
    })

    it('예약 POST 엔드포인트를 포함한다', () => {
      expect(content).toContain("http.post('/api/sys16/reservations'")
    })

    it('예약 승인 PATCH 엔드포인트를 포함한다', () => {
      expect(content).toContain('/api/sys16/reservations/:id/approve')
    })

    it('시간대 설정 PUT 엔드포인트를 포함한다', () => {
      expect(content).toContain('/api/sys16/meeting-rooms/:id/schedule')
    })

    it('사진 업로드 POST 엔드포인트를 포함한다', () => {
      expect(content).toContain('/api/sys16/meeting-rooms/:id/photos')
    })
  })

  describe('index.tsx (라우팅)', () => {
    const content = readFile(resolve(BASE, 'index.tsx'))

    it('Navigate to /sys16/1/2 기본 경로를 포함한다', () => {
      expect(content).toContain('Navigate to="/sys16/1/2"')
    })

    it('공통 게시판(BoardIndex)을 lazy import한다 (ROOM-06)', () => {
      expect(content).toContain('BoardIndex')
    })

    it('공통 코드관리(CodeMgmtIndex)를 lazy import한다 (ROOM-07)', () => {
      expect(content).toContain('CodeMgmtIndex')
    })
  })

  // === GAP 패치 테스트 (G28-G31) ===

  describe('MeetingReservePage GAP 패치', () => {
    const content = readFile(resolve(BASE, 'MeetingReservePage.tsx'))

    it('G28: 관리부대 선택 필드가 존재한다', () => {
      expect(content).toContain('managingUnit')
    })

    it('G28: 참석인원 필드가 존재한다', () => {
      expect(content).toContain('attendeeCount')
    })

    it('G28: 참석자정보 필드가 존재한다', () => {
      expect(content).toContain('attendees')
    })
  })

  describe('MeetingStatusPage GAP 패치', () => {
    const content = readFile(resolve(BASE, 'MeetingStatusPage.tsx'))

    it('G29: 관리부대 검색조건이 존재한다', () => {
      expect(content).toContain('managingUnit')
    })
  })

  describe('ReservationMgmtPage GAP 패치', () => {
    const content = readFile(resolve(BASE, 'ReservationMgmtPage.tsx'))

    it('G30: 엑셀 다운로드가 존재한다', () => {
      expect(content).toMatch(/excel|csv|엑셀/i)
    })

    it('G30: 프린트가 존재한다', () => {
      expect(content).toMatch(/print|프린트/i)
    })
  })

  describe('Sys16 index.tsx GAP 패치', () => {
    const content = readFile(resolve(BASE, 'index.tsx'))

    it('G31: 사용자별권한등록 라우트가 존재한다', () => {
      expect(content).toContain('AuthGroupIndex')
      expect(content).toContain('auth-group')
    })
  })

  describe('sys16 MSW 핸들러 GAP 패치', () => {
    const content = readFile(resolve(HANDLERS_DIR, 'sys16.ts'))

    it('managingUnit 필드가 존재한다', () => {
      expect(content).toContain('managingUnit')
    })

    it('attendeeCount 필드가 존재한다', () => {
      expect(content).toContain('attendeeCount')
    })
  })

  describe('handlers/index.ts', () => {
    const content = readFile(resolve(HANDLERS_DIR, 'index.ts'))

    it('sys16Handlers를 import하고 spread한다', () => {
      expect(content).toContain('sys16Handlers')
    })
  })
})
