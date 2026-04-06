import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table, Button, message } from 'antd'
import { Column } from '@ant-design/charts'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface MonthRow {
  year: string
  m1: number
  m2: number
  m3: number
  m4: number
  m5: number
  m6: number
  m7: number
  m8: number
  m9: number
  m10: number
  m11: number
  m12: number
  total: number
}

interface MonthChartItem {
  month: string
  count: number
}

async function fetchMonthStats(): Promise<MonthRow[]> {
  const res = await apiClient.get<never, ApiResult<MonthRow[]>>('/sys09/stats/month')
  return (res as ApiResult<MonthRow[]>).data ?? (res as unknown as MonthRow[])
}

const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const tableColumns = [
  { title: '연도', dataIndex: 'year', key: 'year' },
  ...monthNames.map((name, i) => ({
    title: name,
    dataIndex: `m${i + 1}`,
    key: `m${i + 1}`,
  })),
  { title: '계', dataIndex: 'total', key: 'total', render: (v: number) => <strong>{v}</strong> },
]

export default function StatsMonthPage() {
  const { data = [] } = useQuery({
    queryKey: ['sys09/stats/month'],
    queryFn: fetchMonthStats,
  })

  // 최신 연도 데이터로 차트 생성
  const chartData: MonthChartItem[] = data.length > 0
    ? monthNames.map((name, i) => ({
        month: name,
        count: (data[data.length - 1] as Record<string, unknown>)[`m${i + 1}`] as number || 0,
      }))
    : []

  const chartConfig = {
    data: chartData,
    xField: 'month',
    yField: 'count',
    height: 300,
    label: {
      position: 'top' as const,
    },
  }

  return (
    <PageContainer title="월별 사망자 현황">
      <div style={{ marginBottom: 24 }}>
        <Column {...chartConfig} />
      </div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={() => message.info('엑셀 다운로드')}>엑셀 다운로드</Button>
      </div>
      <Table
        columns={tableColumns}
        dataSource={data}
        rowKey="year"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </PageContainer>
  )
}
