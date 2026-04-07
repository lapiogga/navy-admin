import { faker } from '@faker-js/faker/locale/ko'

/**
 * 해군 군번 부여규칙에 따른 Mock 군번 생성
 *
 * - 장교(officer):  YY-1NNNN   (임관연도 + 1만대 일련번호)
 * - 부사관(nco):    YY-2NNNN   (임관연도 + 2만대 일련번호)
 * - 병(enlisted):   YY-7NNNNNNN (입영연도 + 7천만대 일련번호)
 * - 군무원(civilian): YY-5NNNN  (채용연도 + 5만대 일련번호)
 */
export type MilitaryType = 'officer' | 'nco' | 'enlisted' | 'civilian'

const YEAR_RANGE = { min: 10, max: 26 }

const SERIAL_RANGES: Record<MilitaryType, { min: number; max: number }> = {
  officer:  { min: 10000, max: 19999 },
  nco:      { min: 20000, max: 29999 },
  enlisted: { min: 70000000, max: 79999999 },
  civilian: { min: 50000, max: 59999 },
}

export function generateServiceNumber(type: MilitaryType = 'officer'): string {
  const year = faker.number.int(YEAR_RANGE).toString().padStart(2, '0')
  const serial = faker.number.int(SERIAL_RANGES[type])
  return `${year}-${serial}`
}

/** 랜덤 신분의 군번 생성 (장교 40%, 부사관 30%, 병 20%, 군무원 10%) */
export function randomServiceNumber(): string {
  const roll = faker.number.int({ min: 1, max: 100 })
  if (roll <= 40) return generateServiceNumber('officer')
  if (roll <= 70) return generateServiceNumber('nco')
  if (roll <= 90) return generateServiceNumber('enlisted')
  return generateServiceNumber('civilian')
}
