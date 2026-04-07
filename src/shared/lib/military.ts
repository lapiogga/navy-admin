import type { ProColumns } from '@ant-design/pro-components'

/** 군번/계급/성명 표시용 인터페이스 */
export interface MilitaryPerson {
  serviceNumber?: string
  rank?: string
  name?: string
}

/** 군번/계급/성명을 "군번 / 계급 / 성명" 형태로 렌더링 */
export function formatMilitaryPerson(person: MilitaryPerson): string {
  const parts = [person.serviceNumber, person.rank, person.name].filter(Boolean)
  return parts.join(' / ')
}

/** 목록 테이블에서 신청자/담당자 컬럼에 군번/계급/성명을 표시하는 ProColumn 생성 */
export function militaryPersonColumn<T extends Record<string, unknown>>(
  title: string,
  fields: { serviceNumber: keyof T; rank: keyof T; name: keyof T },
): ProColumns<T> {
  return {
    title,
    dataIndex: fields.name as string,
    width: 220,
    render: (_, record) => {
      const sn = record[fields.serviceNumber] as string | undefined
      const rk = record[fields.rank] as string | undefined
      const nm = record[fields.name] as string | undefined
      return formatMilitaryPerson({ serviceNumber: sn, rank: rk, name: nm })
    },
  }
}
