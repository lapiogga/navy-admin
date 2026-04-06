import { useState } from 'react'
import { Select, Button, message, Progress } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { Bar, Pie } from '@ant-design/charts'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import type { UnitStats } from '@/shared/api/mocks/handlers/sys08-unit-lineage'

const STATS_TYPE_OPTIONS = [
  { label: '주요직위자 입력현황', value: '주요직위자입력현황' },
  { label: '주요활동 입력현황', value: '주요활동입력현황' },
  { label: '부대기/마크 입력현황', value: '부대기마크입력현황' },
  { label: '입력대상 부대수', value: '입력대상부대수' },
  { label: '계급별 계보담당', value: '계급별계보담당' },
  { label: '완료율', value: '완료율' },
  { label: '미입력 현황', value: '미입력현황' },
  { label: '부대별 비교', value: '부대별비교' },
  { label: '기간별 추이', value: '기간별추이' },
  { label: '종합통계', value: '종합통계' },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  완료: 'green',
  미완료: 'orange',
}

interface StatsResponse {
  type: string
  table: UnitStats[]
  chart: { unit: string; value: number; type: string; index: number }[]
}

async function fetchStats(type: string): Promise<StatsResponse> {
  const res = await apiClient.get<never, ApiResult<StatsResponse>>('/sys08/stats', { params: { type } })
  return (res as ApiResult<StatsResponse>).data ?? (res as unknown as StatsResponse)
}

const PIE_TYPES = ['계급별계보담당', '완료율', '부대기마크입력현황']

export default function UnitStatsPage() {
  const [statsType, setStatsType] = useState('주요직위자입력현황')

  const { data, isLoading } = useQuery({
    queryKey: ['sys08', 'stats', statsType],
    queryFn: () => fetchStats(statsType),
  })

  const handleExcelDownload = () => {
    message.success(`${STATS_TYPE_OPTIONS.find((o) => o.value === statsType)?.label} 엑셀 저장 완료`)
  }

  const columns: ProColumns<UnitStats>[] = [
    { title: '부대명', dataIndex: 'unitName', width: 160 },
    { title: '입력건수', dataIndex: 'count', width: 100 },
    {
      title: '완료율',
      dataIndex: 'completionRate',
      width: 180,
      render: (v) => (
        <Progress percent={v as number} size="small" style={{ marginBottom: 0 }} />
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge status={record.status} colorMap={STATUS_COLOR_MAP} />
      ),
    },
  ]

  const isPie = PIE_TYPES.includes(statsType)

  const chartConfig = isPie
    ? {
        data: data?.chart ?? [],
        angleField: 'value',
        colorField: 'unit',
        height: 280,
        label: { text: 'unit' },
      }
    : {
        data: data?.chart ?? [],
        xField: 'value',
        yField: 'unit',
        colorField: 'unit',
        height: 280,
        legend: false as const,
      }

  return (
    <PageContainer title="입력 통계">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Select
          options={STATS_TYPE_OPTIONS}
          value={statsType}
          onChange={setStatsType}
          style={{ width: 240 }}
          placeholder="통계 종류 선택"
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExcelDownload}
        >
          엑셀 저장
        </Button>
      </div>

      <div style={{ marginBottom: 24 }}>
        {isPie ? (
          <Pie {...chartConfig} />
        ) : (
          <Bar {...chartConfig} />
        )}
      </div>

      {data && (
        <DataTable<UnitStats>
          columns={columns}
          request={async (params) => {
            const res = await fetchStats(statsType)
            const start = (params.page ?? 0) * (params.size ?? 10)
            const items = res.table.slice(start, start + (params.size ?? 10))
            return {
              content: items,
              totalElements: res.table.length,
              totalPages: Math.ceil(res.table.length / (params.size ?? 10)),
              size: params.size ?? 10,
              number: params.page ?? 0,
            }
          }}
          rowKey="id"
          headerTitle={`통계: ${STATS_TYPE_OPTIONS.find((o) => o.value === statsType)?.label}`}
        />
      )}
    </PageContainer>
  )
}
