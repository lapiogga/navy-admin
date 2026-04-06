import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys04-certificate')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('CertificateApplyPage', () => {
  const content = readFileSync(resolve(BASE, 'CertificateApplyPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DataTable 컴포넌트를 포함한다', () => {
    expect(content).toContain('DataTable')
  })

  it('CrudForm 컴포넌트를 포함한다', () => {
    expect(content).toContain('CrudForm')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('신청서 작성 버튼을 포함한다', () => {
    expect(content).toContain('신청서 작성')
  })

  it('인증서 신청 페이지 타이틀을 포함한다', () => {
    expect(content).toContain('인증서 신청')
  })
})

describe('CertificateApprovalPage', () => {
  const content = readFileSync(resolve(BASE, 'CertificateApprovalPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('Popconfirm 컴포넌트를 포함한다', () => {
    expect(content).toContain('Popconfirm')
  })

  it('StatusBadge 컴포넌트를 포함한다', () => {
    expect(content).toContain('StatusBadge')
  })

  it('approveMutation을 포함한다', () => {
    expect(content).toContain('approveMutation')
  })

  it('rejectMutation을 포함한다', () => {
    expect(content).toContain('rejectMutation')
  })

  it('승인 Popconfirm 타이틀을 포함한다', () => {
    expect(content).toContain('승인하시겠습니까?')
  })

  it('반려사유 입력 모달을 포함한다', () => {
    expect(content).toContain('반려사유 입력')
  })
})

describe('CertificateRegisterPage', () => {
  const content = readFileSync(resolve(BASE, 'CertificateRegisterPage.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('DetailModal 컴포넌트를 포함한다', () => {
    expect(content).toContain('DetailModal')
  })

  it('onRow prop을 포함한다', () => {
    expect(content).toContain('onRow')
  })

  it('인증서 등록대장 타이틀을 포함한다', () => {
    expect(content).toContain('인증서 등록대장')
  })
})

describe('sys04 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys04.ts'), 'utf-8')

  it('sys04Handlers를 export한다', () => {
    expect(content).toContain('export const sys04Handlers')
  })

  it('GET /api/sys04/certificates 핸들러를 포함한다', () => {
    expect(content).toContain("http.get('/api/sys04/certificates'")
  })

  it('PATCH approve 핸들러를 포함한다', () => {
    expect(content).toContain("http.patch('/api/sys04/certificates/:id/approve'")
  })

  it('PATCH reject 핸들러를 포함한다', () => {
    expect(content).toContain("http.patch('/api/sys04/certificates/:id/reject'")
  })

  it('POST 핸들러를 포함한다', () => {
    expect(content).toContain("http.post('/api/sys04/certificates'")
  })

  it('PUT 핸들러를 포함한다', () => {
    expect(content).toContain("http.put('/api/sys04/certificates/:id'")
  })

  it('DELETE 핸들러를 포함한다', () => {
    expect(content).toContain("http.delete('/api/sys04/certificates/:id'")
  })
})

describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys04Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys04Handlers')
  })
})

describe('sys04-certificate index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('Navigate to /sys04/1/2 리다이렉트를 포함한다', () => {
    expect(content).toContain('Navigate to="/sys04/1/2"')
  })

  it('BoardIndex (CERT-04 게시판 재사용)를 포함한다', () => {
    expect(content).toContain('BoardIndex')
  })

  it('CodeMgmtIndex (CERT-05 코드관리 재사용)를 포함한다', () => {
    expect(content).toContain('CodeMgmtIndex')
  })

  it('AuthGroupIndex (CERT-06 권한관리 재사용)를 포함한다', () => {
    expect(content).toContain('AuthGroupIndex')
  })

  it('CertificateApplyPage 라우트를 포함한다', () => {
    expect(content).toContain('CertificateApplyPage')
  })

  it('CertificateApprovalPage 라우트를 포함한다', () => {
    expect(content).toContain('CertificateApprovalPage')
  })

  it('CertificateRegisterPage 라우트를 포함한다', () => {
    expect(content).toContain('CertificateRegisterPage')
  })
})

describe('CertificateApplyPage GAP 패치', () => {
  const content = readFileSync(resolve(BASE, 'CertificateApplyPage.tsx'), 'utf-8')

  it('G01: 신청구분 필드가 존재한다', () => {
    expect(content).toContain('requestType')
    expect(content).toContain('신청구분')
  })

  it('G01: 사유 필드가 존재한다', () => {
    expect(content).toContain("name: 'reason'")
  })

  it('G01: 군번 필드가 존재한다', () => {
    expect(content).toContain('militaryId')
  })

  it('G01: 이메일 필드가 존재한다', () => {
    expect(content).toContain("name: 'email'")
  })

  it('G01: 전화번호 필드가 존재한다', () => {
    expect(content).toContain("name: 'phone'")
  })

  it('G02: 회수 기능이 존재한다', () => {
    expect(content).toContain('withdraw')
    expect(content).toContain('회수')
  })
})

describe('CertificateApprovalPage GAP 패치', () => {
  const content = readFileSync(resolve(BASE, 'CertificateApprovalPage.tsx'), 'utf-8')

  it('G03: 반려사유 입력 모달이 존재한다', () => {
    expect(content).toContain('rejectReason')
    expect(content).toContain('반려사유')
  })

  it('G05: 신청구분 컬럼이 존재한다', () => {
    expect(content).toContain('requestType')
  })

  it('G05: 국방전자서명인증센터 컬럼이 존재한다', () => {
    expect(content).toContain('ndscaStatus')
  })
})

describe('CertificateRegisterPage GAP 패치', () => {
  const content = readFileSync(resolve(BASE, 'CertificateRegisterPage.tsx'), 'utf-8')

  it('G04: 엑셀 다운로드 기능이 존재한다', () => {
    expect(content).toMatch(/excel|csv|엑셀/i)
  })

  it('G04: 발급 통계가 존재한다', () => {
    expect(content).toMatch(/Statistic|통계/)
  })

  it('G04: 신청구분 컬럼이 존재한다', () => {
    expect(content).toContain('requestType')
  })
})

describe('sys04 MSW 핸들러 GAP 패치', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys04.ts'), 'utf-8')

  it('withdrawn 상태가 정의되어 있다', () => {
    expect(content).toContain('withdrawn')
  })

  it('rejectReason 필드가 존재한다', () => {
    expect(content).toContain('rejectReason')
  })

  it('ndscaStatus 필드가 존재한다', () => {
    expect(content).toContain('ndscaStatus')
  })

  it('withdraw 핸들러가 존재한다', () => {
    expect(content).toContain('/withdraw')
  })
})
