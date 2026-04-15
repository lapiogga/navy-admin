import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

// BASE_URL은 dev 서버 실제 포트를 환경변수로 받거나 기본값 5176
const BASE_URL = process.env.BASE_URL || 'http://localhost:5176'
const OUTPUT_ROOT = join(process.cwd(), 'screenshots')

// 공통 관리자 메뉴
function adminPages(sys) {
  return [
    { path: `/${sys}/admin/system-mgr`, name: 'admin-1_시스템관리' },
    { path: `/${sys}/admin/code-mgmt`, name: 'admin-2_코드관리' },
    { path: `/${sys}/admin/auth-group`, name: 'admin-3_권한관리' },
    { path: `/${sys}/admin/approval-line`, name: 'admin-4_결재선관리' },
    { path: `/${sys}/admin/board`, name: 'admin-5_게시판설정' },
  ]
}

const SYSTEMS = {
  sys12: {
    name: '지시건의사항관리체계',
    pages: [
      { path: '/sys12', name: '00_홈' },
      { path: '/sys12/1/1', name: '01-1_공지사항' },
      { path: '/sys12/1/2', name: '01-2_질의응답' },
      { path: '/sys12/2/1', name: '02-1_대통령지시사항' },
      { path: '/sys12/2/2', name: '02-2_국방부장관지시사항' },
      { path: '/sys12/2/3', name: '02-3_지휘관지시사항' },
      { path: '/sys12/3/1', name: '03-1_건의사항' },
      { path: '/sys12/4/1', name: '04-1_관리자' },
      { path: '/sys12/board/1', name: '05-1_공지사항' },
      { path: '/sys12/board/2', name: '05-2_질의응답' },
    ],
  },
  sys13: {
    name: '지식관리체계',
    pages: [
      { path: '/sys13', name: '00_홈' },
      { path: '/sys13/1/1', name: '01-1_공지사항' },
      { path: '/sys13/2/1', name: '02-1_나의지식관리' },
      { path: '/sys13/2/2', name: '02-2_지식관리_관리자' },
      { path: '/sys13/3/1', name: '03-1_지식열람' },
      { path: '/sys13/4/1', name: '04-1_지식통계' },
      { path: '/sys13/5/1', name: '05-1_코드관리' },
      { path: '/sys13/5/2', name: '05-2_메뉴관리' },
      { path: '/sys13/5/3', name: '05-3_권한관리' },
      { path: '/sys13/board/1', name: '06-1_공지사항' },
      { path: '/sys13/board/2', name: '06-2_질의응답' },
    ],
  },
  sys14: {
    name: '나의제언',
    pages: [
      { path: '/sys14', name: '00_홈' },
      { path: '/sys14/1/1', name: '01-1_메인화면' },
      { path: '/sys14/1/2', name: '01-2_공지사항' },
      { path: '/sys14/1/3', name: '01-3_제언확인' },
      { path: '/sys14/1/4', name: '01-4_관리자' },
      { path: '/sys14/2/1', name: '02-1_권한관리' },
      { path: '/sys14/board/1', name: '03-1_공지사항' },
      { path: '/sys14/board/2', name: '03-2_질의응답' },
    ],
  },
  sys15: {
    name: '보안일일결산체계',
    pages: [
      { path: '/sys15', name: '00_홈' },
      { path: '/sys15/1/1', name: '01-1_메인화면' },
      { path: '/sys15/2/1', name: '02-1_저장매체관리' },
      { path: '/sys15/2/2', name: '02-2_비밀관리' },
      { path: '/sys15/2/3', name: '02-3_비밀예고문관리' },
      { path: '/sys15/2/4', name: '02-4_보안자재암호장비관리' },
      { path: '/sys15/2/5', name: '02-5_비밀매체인계인수' },
      { path: '/sys15/3/1', name: '03-1_개인보안일일결산' },
      { path: '/sys15/3/2', name: '03-2_사무실보안일일결산' },
      { path: '/sys15/3/3', name: '03-3_일일보안점검관' },
      { path: '/sys15/3/4', name: '03-4_개인보안수준평가' },
      { path: '/sys15/3/5', name: '03-5_부재처리' },
      { path: '/sys15/3/6', name: '03-6_보안교육' },
      { path: '/sys15/4/1', name: '04-1_결재대기' },
      { path: '/sys15/4/2', name: '04-2_결재완료' },
      { path: '/sys15/5/1', name: '05-1_비밀매체관리종합' },
      { path: '/sys15/5/2', name: '05-2_개인보안일일결산종합' },
      { path: '/sys15/5/3', name: '05-3_사무실보안일일결산종합' },
      { path: '/sys15/5/4', name: '05-4_부재처리종합' },
      { path: '/sys15/6/1', name: '06-1_개인설정관리' },
      { path: '/sys15/7/1', name: '07-1_공지사항' },
      { path: '/sys15/7/2', name: '07-2_질의응답' },
      { path: '/sys15/8/1', name: '08-1_점검항목관리' },
      { path: '/sys15/8/2', name: '08-2_휴무일관리' },
      { path: '/sys15/8/3', name: '08-3_알림시간관리' },
      { path: '/sys15/8/4', name: '08-4_로그이력관리' },
      { path: '/sys15/8/5', name: '08-5_예외처리관리' },
    ],
  },
  sys16: {
    name: '회의실예약관리체계',
    pages: [
      { path: '/sys16', name: '00_홈' },
      { path: '/sys16/1/1', name: '01-1_공지사항' },
      { path: '/sys16/1/2', name: '01-2_회의예약신청' },
      { path: '/sys16/1/3', name: '01-3_내예약확인' },
      { path: '/sys16/1/4', name: '01-4_회의현황' },
      { path: '/sys16/1/5', name: '01-5_회의예약관리' },
      { path: '/sys16/1/6', name: '01-6_회의실관리' },
      { path: '/sys16/2/1', name: '02-1_공통코드관리' },
      { path: '/sys16/2/2', name: '02-2_권한관리' },
      { path: '/sys16/board/1', name: '03-1_공지사항' },
      { path: '/sys16/board/2', name: '03-2_질의응답' },
    ],
  },
  sys17: {
    name: '검열결과관리체계',
    pages: [
      { path: '/sys17', name: '00_홈' },
      { path: '/sys17/1/1', name: '01-1_공지사항' },
      { path: '/sys17/1/2', name: '01-2_검열부대지정' },
      { path: '/sys17/1/3', name: '01-3_검열계획' },
      { path: '/sys17/1/4', name: '01-4_검열결과_조치과제' },
      { path: '/sys17/1/5', name: '01-5_결재' },
      { path: '/sys17/1/6', name: '01-6_추진현황' },
      { path: '/sys17/2/1', name: '02-1_공통코드관리' },
      { path: '/sys17/2/2', name: '02-2_부대관리' },
      { path: '/sys17/2/3', name: '02-3_권한관리' },
      { path: '/sys17/2/4', name: '02-4_접속로그' },
      { path: '/sys17/3/1', name: '03-1_검열계획정보' },
      { path: '/sys17/3/2', name: '03-2_검열결과정보' },
      { path: '/sys17/board/1', name: '04-1_공지사항' },
      { path: '/sys17/board/2', name: '04-2_질의응답' },
    ],
  },
  sys18: {
    name: '직무기술서관리체계',
    pages: [
      { path: '/sys18', name: '00_홈' },
      { path: '/sys18/1/1', name: '01-1_공지사항' },
      { path: '/sys18/1/2', name: '01-2_조직진단대상관리' },
      { path: '/sys18/1/3', name: '01-3_직무기술서작성' },
      { path: '/sys18/1/4', name: '01-4_결재' },
      { path: '/sys18/1/5', name: '01-5_직무기술서조회_관리자' },
      { path: '/sys18/2/1', name: '02-1_공통코드관리' },
      { path: '/sys18/2/2', name: '02-2_표준업무시간관리' },
      { path: '/sys18/2/3', name: '02-3_권한관리' },
      { path: '/sys18/board/1', name: '03-1_공지사항' },
      { path: '/sys18/board/2', name: '03-2_질의응답' },
      { path: '/sys18/board/3', name: '03-3_자료실' },
    ],
  },
}

async function main() {
  console.log(`[INFO] BASE_URL = ${BASE_URL}`)
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  // 로그인 설정
  const authData = JSON.stringify({
    state: {
      user: {
        id: 'mock-uuid',
        name: '홍길동',
        rank: '대위',
        unit: '해군본부',
        username: 'admin',
        roles: ['ADMIN', 'SYS01_USER', 'SYS02_USER', 'SYS03_USER', 'SYS04_USER', 'SYS05_USER',
          'SYS06_USER', 'SYS07_USER', 'SYS08_USER', 'SYS09_USER', 'SYS10_USER',
          'SYS11_USER', 'SYS12_USER', 'SYS13_USER', 'SYS14_USER', 'SYS15_USER',
          'SYS16_USER', 'SYS17_USER', 'SYS18_USER'],
      },
      token: 'mock-jwt-token-screenshot',
      isAuthenticated: true,
      sessionExpiry: Date.now() + 60 * 60 * 1000,
    },
    version: 0,
  })

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate((data) => localStorage.setItem('auth-storage', data), authData)
  await page.waitForTimeout(2000)

  let totalSuccess = 0
  let totalFail = 0

  for (const [sysKey, system] of Object.entries(SYSTEMS)) {
    const sysDir = join(OUTPUT_ROOT, sysKey)
    mkdirSync(sysDir, { recursive: true })

    const allPages = [...system.pages, ...adminPages(sysKey)]
    console.log(`\n=== ${sysKey.toUpperCase()} (${system.name}) - ${allPages.length}개 페이지 ===`)

    let sysSuccess = 0
    for (const { path, name } of allPages) {
      try {
        process.stdout.write(`  ${name}...`)
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForTimeout(1800)
        await page.screenshot({ path: join(sysDir, `${name}.png`), fullPage: true })
        console.log(' OK')
        sysSuccess++
      } catch (err) {
        console.log(` FAIL (${err.message.slice(0, 60)})`)
        try {
          await page.screenshot({ path: join(sysDir, `${name}_error.png`), fullPage: true })
        } catch {}
        totalFail++
      }
    }
    totalSuccess += sysSuccess
    console.log(`  -> ${sysKey}: ${sysSuccess}/${allPages.length} 성공`)
  }

  console.log(`\n========================================`)
  console.log(`전체 완료: 성공 ${totalSuccess}개, 실패 ${totalFail}개`)
  console.log(`저장 위치: ${OUTPUT_ROOT}`)
  await browser.close()
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
