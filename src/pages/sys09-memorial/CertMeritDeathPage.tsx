import { useState } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { Descriptions, Select } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { PrintableReport } from './PrintableReport'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import type { Deceased } from '@/shared/api/mocks/handlers/sys09'

const DEATH_TYPE_LABEL: Record<string, string> = {
  combat: '전사',
  duty: '순직',
  disease: '병사',
  accident: '사고사',
}

async function fetchMeritDeath(id: string): Promise<Deceased> {
  const res = await apiClient.get<never, ApiResult<Deceased>>(`/sys09/reports/merit-death/${id}`)
  return (res as ApiResult<Deceased>).data ?? (res as unknown as Deceased)
}

export default function CertMeritDeathPage() {
  const [selectedId, setSelectedId] = useState<string>('deceased-1')

  const { data } = useQuery({
    queryKey: ['sys09/reports/merit-death', selectedId],
    queryFn: () => fetchMeritDeath(selectedId),
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <PageContainer title="국가유공자 요건 해당사실 확인서(사망자)">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>대상자 ID:</span>
        <Select
          value={selectedId}
          onChange={setSelectedId}
          style={{ width: 200 }}
          options={Array.from({ length: 10 }, (_, i) => ({
            label: `deceased-${i + 1}`,
            value: `deceased-${i + 1}`,
          }))}
        />
      </div>
      {data && (
        <PrintableReport title="국가유공자 요건 해당사실 확인서(사망자)">
          <Descriptions
            bordered
            column={2}
            title="인적사항"
          >
            <Descriptions.Item label="군번">{data.serviceNumber}</Descriptions.Item>
            <Descriptions.Item label="성명">{data.name}</Descriptions.Item>
            <Descriptions.Item label="계급">{data.rank}</Descriptions.Item>
            <Descriptions.Item label="소속">{data.unit}</Descriptions.Item>
            <Descriptions.Item label="입대일자">{data.enlistDate}</Descriptions.Item>
            <Descriptions.Item label="군구분">{data.militaryType}</Descriptions.Item>
          </Descriptions>
          <Descriptions
            bordered
            column={1}
            title="사망 관련 사항"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="사망구분">{DEATH_TYPE_LABEL[data.deathType]}</Descriptions.Item>
            <Descriptions.Item label="사망일자">{data.deathDate}</Descriptions.Item>
            <Descriptions.Item label="사망장소">{data.deathPlace}</Descriptions.Item>
            <Descriptions.Item label="사망원인">{data.deathCause}</Descriptions.Item>
            <Descriptions.Item label="안장지">{data.burialPlace}</Descriptions.Item>
          </Descriptions>
          <Descriptions
            bordered
            column={1}
            title="국가유공자 요건"
            style={{ marginTop: 16 }}
          >
            <Descriptions.Item label="요건 해당 여부">해당</Descriptions.Item>
            <Descriptions.Item label="근거법령">국가유공자 등 예우 및 지원에 관한 법률 제4조</Descriptions.Item>
          </Descriptions>
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            작성일자: {today}
          </div>
          <div className="signature-area">
            확인자: _________________ (인)
          </div>
        </PrintableReport>
      )}
    </PageContainer>
  )
}
