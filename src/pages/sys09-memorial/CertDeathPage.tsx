import { useState } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { Descriptions, Select, Button } from 'antd'
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

async function fetchDeathCert(id: string): Promise<Deceased> {
  const res = await apiClient.get<never, ApiResult<Deceased>>(`/sys09/reports/death-cert/${id}`)
  return (res as ApiResult<Deceased>).data ?? (res as unknown as Deceased)
}

export default function CertDeathPage() {
  const [selectedId, setSelectedId] = useState<string>('deceased-1')

  const { data } = useQuery({
    queryKey: ['sys09/reports/death-cert', selectedId],
    queryFn: () => fetchDeathCert(selectedId),
  })

  const today = new Date().toISOString().split('T')[0]
  const docNumber = `제${today.replace(/-/g, '')}-001호`

  return (
    <PageContainer title="순직/사망확인서">
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
        <PrintableReport title="순직/사망확인서">
          <div style={{ marginBottom: 16 }}>
            문서번호: {docNumber}
          </div>
          <Descriptions
            bordered
            column={2}
            title="확인서 내용"
          >
            <Descriptions.Item label="군번">{data.serviceNumber}</Descriptions.Item>
            <Descriptions.Item label="성명">{data.name}</Descriptions.Item>
            <Descriptions.Item label="계급">{data.rank}</Descriptions.Item>
            <Descriptions.Item label="소속">{data.unit}</Descriptions.Item>
            <Descriptions.Item label="사망일자">{data.deathDate}</Descriptions.Item>
            <Descriptions.Item label="사망장소">{data.deathPlace}</Descriptions.Item>
            <Descriptions.Item label="사망원인" span={2}>{data.deathCause}</Descriptions.Item>
          </Descriptions>
          <p style={{ marginTop: 24 }}>
            위 사람은 {data.deathDate}에 {data.deathPlace}에서 {DEATH_TYPE_LABEL[data.deathType]}하였음을 확인합니다.
          </p>
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
