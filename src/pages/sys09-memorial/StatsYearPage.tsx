import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table, Button, message } from 'antd'
import { Line } from '@ant-design/charts'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface YearStat {
  year: string
  combat: number
  duty: number
  disease: number
  accident: number
  total: number
}

async function fetchYearStats(): Promise<YearStat[]> {
  const res = await apiClient.get<never, ApiResult<YearStat[]>>('/sys09/stats/year')
  return (res as ApiResult<YearStat[]>).data ?? (res as unknown as YearStat[])
}

const columns = [
  { title: '연도', dataIndex: 'year', key: 'year' },
  { title: '전사', dataIndex: 'combat', key: 'combat' },
  { title: '순직', dataIndex: 'duty', key: 'duty' },
  { title: '병사', dataIndex: 'disease', key: 'disease' },
  { title: '사고사', dataIndex: 'accident', key: 'accident' },
  { title: '계', dataIndex: 'total', key: 'total', render: (v: number) => <strong>{v}</strong> },
]

export default function StatsYearPage() {
  const { data = [] } = useQuery({
    queryKey: ['sys09/stats/year'],
    queryFn: fetchYearStats,
  })

  const chartConfig = {
    data,
    xField: 'year',
    yField: 'total',
    height: 300,
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
  }

  return (
    <PageContainer title="연도별 사망자 현황">
      <div style={{ marginBottom: 24 }}>
        <Line {...chartConfig} />
      </div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={() => message.info('엑셀 다운로드')}>엑셀 다운로드</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="year"
        pagination={false}
      />
    </PageContainer>
  )
}
