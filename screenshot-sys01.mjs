import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:5176'
const OUTPUT_DIR = join(process.cwd(), 'screenshots', 'sys01')

// SYS01 전체 페이지 목록
const pages = [
  { path: '/sys01', name: '00_홈_초과근무관리체계' },
  // 1. 신청서 관리
  { path: '/sys01/1/1', name: '01-1_신청서작성' },
  { path: '/sys01/1/2', name: '01-2_신청서결재' },
  { path: '/sys01/1/3', name: '01-3_일괄처리' },
  { path: '/sys01/1/4', name: '01-4_일괄처리승인' },
  { path: '/sys01/1/5', name: '01-5_월말결산' },
  // 2. 현황조회
  { path: '/sys01/2/1', name: '02-1_나의근무현황' },
  { path: '/sys01/2/2', name: '02-2_나의부재관리' },
  { path: '/sys01/2/3', name: '02-3_부대근무현황' },
  { path: '/sys01/2/4', name: '02-4_부대근무통계' },
  { path: '/sys01/2/5', name: '02-5_부대부재현황' },
  { path: '/sys01/2/6', name: '02-6_월말결산현황' },
  { path: '/sys01/2/7', name: '02-7_자료출력' },
  // 3. 부대관리
  { path: '/sys01/3/1', name: '03-1_부대인원조회' },
  { path: '/sys01/3/2', name: '03-2_최대인정시간' },
  { path: '/sys01/3/3', name: '03-3_근무시간관리' },
  { path: '/sys01/3/4', name: '03-4_공휴일관리' },
  { path: '/sys01/3/5', name: '03-5_결재선관리' },
  // 4. 당직업무
  { path: '/sys01/4/1', name: '04-1_초과근무자관리' },
  { path: '/sys01/4/2', name: '04-2_당직개소관리' },
  { path: '/sys01/4/3', name: '04-3_당직개소변경' },
  { path: '/sys01/4/4', name: '04-4_개인별당직개소승인' },
  { path: '/sys01/4/5', name: '04-5_개인별부서이동승인' },
  // 5. 개인설정
  { path: '/sys01/5/1', name: '05-1_개인설정정보' },
  { path: '/sys01/5/2', name: '05-2_개인별당직개소설정' },
  { path: '/sys01/5/3', name: '05-3_개인별부서설정' },
  // 6. 게시판
  { path: '/sys01/6/1', name: '06-1_공지사항' },
  { path: '/sys01/6/2', name: '06-2_질의응답' },
  // 7. 관리자
  { path: '/sys01/admin/system-mgr', name: '07-1_시스템관리' },
  { path: '/sys01/admin/code-mgmt', name: '07-2_코드관리' },
  { path: '/sys01/admin/auth-group', name: '07-3_권한관리' },
  { path: '/sys01/admin/approval-line', name: '07-4_결재선관리_관리자' },
  { path: '/sys01/admin/board', name: '07-5_게시판설정' },
]

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  })

  const page = await context.newPage()

  // 로그인 - localStorage에 auth-storage 직접 설정
  const authData = JSON.stringify({
    state: {
      user: {
        id: 'mock-uuid',
        name: '홍길동',
        rank: '대위',
        unit: '해군본부',
        username: 'admin',
        roles: ['ADMIN', 'SYS01_USER'],
      },
      token: 'mock-jwt-token-screenshot',
      isAuthenticated: true,
      sessionExpiry: Date.now() + 30 * 60 * 1000,
    },
    version: 0,
  })

  // 먼저 base URL로 이동하여 localStorage 설정
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate((data) => {
    localStorage.setItem('auth-storage', data)
  }, authData)

  // MSW 초기화 대기
  await page.waitForTimeout(2000)

  let success = 0
  let fail = 0

  for (const { path, name } of pages) {
    try {
      console.log(`캡처 중: ${name} (${path})`)
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 15000 })
      // 페이지 렌더링 + 데이터 로딩 대기
      await page.waitForTimeout(2000)

      const filePath = join(OUTPUT_DIR, `${name}.png`)
      await page.screenshot({ path: filePath, fullPage: true })
      console.log(`  -> 저장: ${filePath}`)
      success++
    } catch (err) {
      console.error(`  -> 실패: ${name} - ${err.message}`)
      // 실패해도 현재 화면 캡처 시도
      try {
        const filePath = join(OUTPUT_DIR, `${name}_error.png`)
        await page.screenshot({ path: filePath, fullPage: true })
      } catch {}
      fail++
    }
  }

  console.log(`\n완료: 성공 ${success}개, 실패 ${fail}개`)
  console.log(`저장 위치: ${OUTPUT_DIR}`)

  await browser.close()
}

main().catch(console.error)
