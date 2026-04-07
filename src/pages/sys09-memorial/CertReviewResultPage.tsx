import { useState } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { Descriptions, Table, Select } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { PrintableReport } from './PrintableReport'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import type { CombatReview } from '@/shared/api/mocks/handlers/sys09'

const RESULT_LABEL: Record<string, string> = {
  eligible: '해당',
  ineligible: '비해당',
}

async function fetchReviewResult(id: string): Promise<CombatReview> {
  const res = await apiClient.get<never, ApiResult<CombatReview>>(`/sys09/reports/review-result/${id}`)
  return (res as ApiResult<CombatReview>).data ?? (res as unknown as CombatReview)
}

const committeeColumns = [
  { title: '직책', dataIndex: 'role', key: 'role' },
  { title: '성명', dataIndex: 'name', key: 'name' },
  { title: '서명', dataIndex: 'signature', key: 'signature' },
]

const committeeData = [
  { key: '1', role: '위원장', name: '', signature: '' },
  { key: '2', role: '위원', name: '', signature: '' },
  { key: '3', role: '위원', name: '', signature: '' },
  { key: '4', role: '간사', name: '', signature: '' },
]

export default function CertReviewResultPage() {
  const [selectedId, setSelectedId] = useState<string>('review-1')

  const { data: listData } = useQuery({
    queryKey: ['sys09/review-list'],
    queryFn: async () => {
      const res = await apiClient.get<never, ApiResult<{ content: CombatReview[] }>>('/sys09/reviews?page=0&size=100')
      const d = (res as ApiResult<{ content: CombatReview[] }>).data
      return d?.content ?? []
    },
  })

  const { data } = useQuery({
    queryKey: ['sys09/reports/review-result', selectedId],
    queryFn: () => fetchReviewResult(selectedId),
  })

  return (
    <PageContainer title="전공사상심사결과">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>대상자:</span>
        <Select
          value={selectedId}
          onChange={setSelectedId}
          style={{ width: 350 }}
          showSearch
          optionFilterProp="label"
          options={(listData ?? []).map((d) => ({
            label: `${d.serviceNumber} / ${d.rank} / ${d.name}`,
            value: d.id,
          }))}
        />
      </div>
      {data && (
        <PrintableReport title="전공사상심사결과">
          <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="심사차수">{data.reviewRound}</Descriptions.Item>
            <Descriptions.Item label="심사일자">{data.reviewDate}</Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={2} title="대상자 정보" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="성명">{data.name}</Descriptions.Item>
            <Descriptions.Item label="군번">{data.serviceNumber}</Descriptions.Item>
            <Descriptions.Item label="계급">{data.rank}</Descriptions.Item>
            <Descriptions.Item label="소속">{data.unit}</Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={1} title="사고 내용" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="사고유형">{data.incidentType}</Descriptions.Item>
            <Descriptions.Item label="사고일자">{data.incidentDate}</Descriptions.Item>
            <Descriptions.Item label="사고원인">{data.incidentCause}</Descriptions.Item>
          </Descriptions>
          <Descriptions bordered column={1} title="심사결과" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="결과">
              <strong style={{ color: data.result === 'eligible' ? 'green' : 'red' }}>
                {RESULT_LABEL[data.result]}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="상세">{data.resultDetail}</Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 8 }}>위원 서명</div>
            <Table
              columns={committeeColumns}
              dataSource={committeeData}
              pagination={false}
              bordered
            />
          </div>
        </PrintableReport>
      )}
    </PageContainer>
  )
}
