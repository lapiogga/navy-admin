import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5176'
const OUTPUT_ROOT = join(process.cwd(), 'screenshots-1680')

// 공통 관리자 메뉴 (대부분 서브시스템 공통)
function adminPages(sys) {
  return [
    { path: `/${sys}/admin/system-mgr`, name: 'admin-1_시스템관리' },
    { path: `/${sys}/admin/code-mgmt`, name: 'admin-2_코드관리' },
    { path: `/${sys}/admin/auth-group`, name: 'admin-3_권한관리' },
    { path: `/${sys}/admin/approval-line`, name: 'admin-4_결재선관리' },
    { path: `/${sys}/admin/board`, name: 'admin-5_게시판설정' },
  ]
}

const ALL_SYSTEMS = {
  sys01: {
    name: '초과근무관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys01', name: '00_홈' },
      { path: '/sys01/1/1', name: '01-1_신청서작성' },
      { path: '/sys01/1/2', name: '01-2_신청서결재' },
      { path: '/sys01/1/3', name: '01-3_일괄처리' },
      { path: '/sys01/1/4', name: '01-4_일괄처리승인' },
      { path: '/sys01/1/5', name: '01-5_월말결산' },
      { path: '/sys01/2/1', name: '02-1_나의근무현황' },
      { path: '/sys01/2/2', name: '02-2_나의부재관리' },
      { path: '/sys01/2/3', name: '02-3_부대근무현황' },
      { path: '/sys01/2/4', name: '02-4_부대근무통계' },
      { path: '/sys01/2/5', name: '02-5_부대부재현황' },
      { path: '/sys01/2/6', name: '02-6_월말결산현황' },
      { path: '/sys01/2/7', name: '02-7_자료출력' },
      { path: '/sys01/3/1', name: '03-1_부대인원조회' },
      { path: '/sys01/3/2', name: '03-2_최대인정시간' },
      { path: '/sys01/3/3', name: '03-3_근무시간관리' },
      { path: '/sys01/3/4', name: '03-4_공휴일관리' },
      { path: '/sys01/3/5', name: '03-5_결재선관리' },
      { path: '/sys01/4/1', name: '04-1_초과근무자관리' },
      { path: '/sys01/4/2', name: '04-2_당직개소관리' },
      { path: '/sys01/4/3', name: '04-3_당직개소변경' },
      { path: '/sys01/4/4', name: '04-4_개인별당직개소승인' },
      { path: '/sys01/4/5', name: '04-5_개인별부서이동승인' },
      { path: '/sys01/5/1', name: '05-1_개인설정정보' },
      { path: '/sys01/5/2', name: '05-2_개인별당직개소설정' },
      { path: '/sys01/5/3', name: '05-3_개인별부서설정' },
      { path: '/sys01/6/1', name: '06-1_공지사항' },
      { path: '/sys01/6/2', name: '06-2_질의응답' },
    ],
  },
  sys02: {
    name: '설문종합관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys02', name: '00_홈' },
      { path: '/sys02/1/2', name: '01-2_나의설문관리' },
      { path: '/sys02/1/3', name: '01-3_설문참여' },
      { path: '/sys02/1/4', name: '01-4_지난설문보기' },
      { path: '/sys02/1/5', name: '01-5_체계관리' },
      { path: '/sys02/board/1', name: '02-1_공지사항' },
      { path: '/sys02/board/2', name: '02-2_질의응답' },
      { path: '/sys02/2/1', name: '03-1_공통코드관리' },
      { path: '/sys02/2/2', name: '03-2_권한관리' },
    ],
  },
  sys03: {
    name: '성과관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys03', name: '00_홈' },
      { path: '/sys03/1/1', name: '01-1_메인화면' },
      { path: '/sys03/2/1', name: '02-1_시스템관리_기준년도' },
      { path: '/sys03/2/2', name: '02-2_평가조직관리' },
      { path: '/sys03/2/3', name: '02-3_업무실적개인관리' },
      { path: '/sys03/2/4', name: '02-4_지휘방침관리' },
      { path: '/sys03/2/5', name: '02-5_추진중점과제관리' },
      { path: '/sys03/2/6', name: '02-6_소과제관리' },
      { path: '/sys03/2/7', name: '02-7_상세과제관리' },
      { path: '/sys03/2/8', name: '02-8_중과제관리' },
      { path: '/sys03/3/1', name: '03-1_추진진도율' },
      { path: '/sys03/3/2', name: '03-2_과제등록' },
      { path: '/sys03/3/3', name: '03-3_업무실적입력' },
      { path: '/sys03/3/4', name: '03-4_과제실적승인' },
      { path: '/sys03/3/5', name: '03-5_과제실적평가' },
      { path: '/sys03/3/6', name: '03-6_업무실적개인평가' },
      { path: '/sys03/4/1', name: '04-1_평가결과' },
      { path: '/sys03/4/2', name: '04-2_입력현황' },
      { path: '/sys03/5/1', name: '05-1_공지사항' },
      { path: '/sys03/5/2', name: '05-2_질의응답' },
      { path: '/sys03/5/3', name: '05-3_자료실' },
      { path: '/sys03/6/1', name: '06-1_과제검색' },
    ],
  },
  sys04: {
    name: '인증서발급신청체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys04', name: '00_홈' },
      { path: '/sys04/1/1', name: '01-1_공지사항' },
      { path: '/sys04/1/2', name: '01-2_인증서신청' },
      { path: '/sys04/1/3', name: '01-3_인증서승인관리' },
      { path: '/sys04/1/4', name: '01-4_인증서등록대장' },
      { path: '/sys04/board/1', name: '02-1_공지사항' },
      { path: '/sys04/board/2', name: '02-2_질의응답' },
      { path: '/sys04/2/1', name: '03-1_공통코드관리' },
      { path: '/sys04/2/2', name: '03-2_사용자별권한등록' },
    ],
  },
  sys05: {
    name: '행정규칙포탈체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys05', name: '00_홈' },
      { path: '/sys05/1/1', name: '01-1_현행규정' },
      { path: '/sys05/2/1', name: '02-1_예규_해군본부' },
      { path: '/sys05/2/2', name: '02-2_예규_예하부대' },
      { path: '/sys05/3/1', name: '03-1_지시문서' },
      { path: '/sys05/board/1', name: '04-1_공지사항' },
      { path: '/sys05/board/2', name: '04-2_질의응답' },
    ],
  },
  sys06: {
    name: '해병대규정관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys06', name: '00_홈' },
      { path: '/sys06/1/1', name: '01-1_현행규정' },
      { path: '/sys06/2/1', name: '02-1_예규_해병대사령부' },
      { path: '/sys06/2/2', name: '02-2_예규_예하부대' },
      { path: '/sys06/3/1', name: '03-1_지시문서' },
      { path: '/sys06/4/1', name: '04-1_공지사항' },
      { path: '/sys06/4/2', name: '04-2_규정예고' },
      { path: '/sys06/4/3', name: '04-3_자료실' },
      { path: '/sys06/5/1', name: '05-1_권한관리' },
    ],
  },
  sys07: {
    name: '군사자료관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys07', name: '00_홈' },
      { path: '/sys07/1/1', name: '01-1_군사자료관리' },
      { path: '/sys07/1/2', name: '01-2_군사자료활용' },
      { path: '/sys07/1/3', name: '01-3_통계자료' },
      { path: '/sys07/2/1', name: '02-1_해기단자료' },
      { path: '/sys07/3/1', name: '03-1_코드관리' },
      { path: '/sys07/3/2', name: '03-2_권한관리' },
      { path: '/sys07/board/1', name: '04-1_공지사항' },
      { path: '/sys07/board/2', name: '04-2_질의응답' },
    ],
  },
  sys08: {
    name: '부대계보관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys08', name: '00_홈' },
      { path: '/sys08/1/1', name: '01-1_공지사항' },
      { path: '/sys08/2/1', name: '02-1_권한신청' },
      { path: '/sys08/2/2', name: '02-2_권한관리' },
      { path: '/sys08/2/3', name: '02-3_권한조회' },
      { path: '/sys08/3/1', name: '03-1_주요활동관리' },
      { path: '/sys08/3/2', name: '03-2_주요활동결재' },
      { path: '/sys08/4/1', name: '04-1_주요직위자관리' },
      { path: '/sys08/5/1', name: '05-1_제원계승부대관리' },
      { path: '/sys08/6/1', name: '06-1_부대기부대마크관리' },
      { path: '/sys08/7/1', name: '07-1_입력통계' },
      { path: '/sys08/8/1', name: '08-1_부대기록부' },
      { path: '/sys08/board/1', name: '09-1_공지사항' },
      { path: '/sys08/board/2', name: '09-2_질의응답' },
    ],
  },
  sys09: {
    name: '영현보훈체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys09', name: '00_홈' },
      { path: '/sys09/1/1', name: '01-1_공지사항' },
      { path: '/sys09/2/1', name: '02-1_사망자관리' },
      { path: '/sys09/2/2', name: '02-2_상이자관리' },
      { path: '/sys09/2/3', name: '02-3_전공사상심사관리' },
      { path: '/sys09/3/1', name: '03-1_확인서_사망자' },
      { path: '/sys09/3/2', name: '03-2_확인서_상이자' },
      { path: '/sys09/3/3', name: '03-3_전공사상심사결과' },
      { path: '/sys09/3/4', name: '03-4_순직사망확인서' },
      { path: '/sys09/3/5', name: '03-5_사망자현황보고서' },
      { path: '/sys09/3/6', name: '03-6_상이자현황보고서' },
      { path: '/sys09/3/7', name: '03-7_신분별사망자현황' },
      { path: '/sys09/3/8', name: '03-8_월별사망자현황' },
      { path: '/sys09/3/9', name: '03-9_연도별사망자현황' },
      { path: '/sys09/3/10', name: '03-10_부대별사망자현황' },
      { path: '/sys09/3/11', name: '03-11_부대별사망자명부' },
      { path: '/sys09/3/12', name: '03-12_전사망자명부' },
      { path: '/sys09/3/13', name: '03-13_전사망자확인증발급대장' },
      { path: '/sys09/board/1', name: '04-1_공지사항' },
      { path: '/sys09/board/2', name: '04-2_질의응답' },
    ],
  },
  sys10: {
    name: '주말버스예약관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys10', name: '00_홈' },
      { path: '/sys10/1/1', name: '01-1_공지사항' },
      { path: '/sys10/1/2', name: '01-2_주말버스예약' },
      { path: '/sys10/1/3', name: '01-3_대기자관리' },
      { path: '/sys10/1/4', name: '01-4_예약현황' },
      { path: '/sys10/1/5', name: '01-5_배차관리' },
      { path: '/sys10/1/6', name: '01-6_예약시간관리' },
      { path: '/sys10/1/7', name: '01-7_사용현황' },
      { path: '/sys10/1/8', name: '01-8_위규자관리' },
      { path: '/sys10/1/9', name: '01-9_타군사용자관리' },
      { path: '/sys10/2/1', name: '02-1_코드관리' },
      { path: '/sys10/2/2', name: '02-2_권한관리' },
      { path: '/sys10/board/1', name: '03-1_공지사항' },
      { path: '/sys10/board/2', name: '03-2_질의응답' },
    ],
  },
  sys11: {
    name: '연구자료종합관리체계',
    includeCommonAdmin: true,
    pages: [
      { path: '/sys11', name: '00_홈' },
      { path: '/sys11/1/1', name: '01-1_메인화면' },
      { path: '/sys11/1/2', name: '01-2_연구자료CRUD' },
      { path: '/sys11/1/3', name: '01-3_자료실' },
      { path: '/sys11/1/4', name: '01-4_공지사항' },
      { path: '/sys11/1/5', name: '01-5_관리자' },
      { path: '/sys11/2/1', name: '02-1_권한관리' },
      { path: '/sys11/board/1', name: '03-1_공지사항' },
      { path: '/sys11/board/2', name: '03-2_질의응답' },
    ],
  },
  sys12: {
    name: '지시건의사항관리체계',
    includeCommonAdmin: true,
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
    includeCommonAdmin: true,
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
    includeCommonAdmin: true,
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
    includeCommonAdmin: true,
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
    includeCommonAdmin: true,
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
    includeCommonAdmin: true,
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
    includeCommonAdmin: true,
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

function sanitize(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_')
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1680, height: 1050 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  const allRoles = Array.from({ length: 18 }, (_, i) => `SYS${String(i + 1).padStart(2, '0')}_USER`)
  const authData = JSON.stringify({
    state: {
      user: {
        id: 'mock-uuid',
        name: '홍길동',
        rank: '대위',
        unit: '해군본부',
        username: 'admin',
        roles: ['ADMIN', ...allRoles],
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

  const summary = []
  let totalSuccess = 0
  let totalFail = 0

  for (const [sysKey, system] of Object.entries(ALL_SYSTEMS)) {
    const sysDir = join(OUTPUT_ROOT, sysKey)
    mkdirSync(sysDir, { recursive: true })

    const allPages = [...system.pages]
    if (system.includeCommonAdmin) allPages.push(...adminPages(sysKey))

    console.log(`\n=== ${sysKey.toUpperCase()} (${system.name}) - ${allPages.length}개 페이지 ===`)

    let sysSuccess = 0
    let sysFail = 0
    for (const { path, name } of allPages) {
      const safeName = sanitize(name)
      try {
        process.stdout.write(`  ${name}...`)
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForTimeout(1500)
        await page.screenshot({ path: join(sysDir, `${safeName}.png`), fullPage: true })
        console.log(' OK')
        sysSuccess++
      } catch (err) {
        console.log(` FAIL (${err.message.slice(0, 60)})`)
        try {
          await page.screenshot({ path: join(sysDir, `${safeName}_error.png`), fullPage: true })
        } catch {}
        sysFail++
      }
    }
    totalSuccess += sysSuccess
    totalFail += sysFail
    summary.push(`${sysKey}: ${sysSuccess}/${allPages.length} (실패 ${sysFail})`)
    console.log(`  -> ${sysKey}: ${sysSuccess}/${allPages.length} 성공`)
  }

  console.log(`\n========================================`)
  console.log(`전체 요약:`)
  summary.forEach((line) => console.log('  ' + line))
  console.log(`----------------------------------------`)
  console.log(`전체 완료: 성공 ${totalSuccess}개, 실패 ${totalFail}개`)
  console.log(`저장 위치: ${OUTPUT_ROOT}`)
  console.log(`해상도: 1680x1050`)
  await browser.close()
}

main().catch((err) => {
  console.error('치명적 오류:', err)
  process.exit(1)
})
