import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table, Button, message } from 'antd'
import { Pie } from '@ant-design/charts'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface TypeStat {
  type: string
  combat: number
  duty: number
  disease: number
  accident: number
  total: number
  value: number
}

async function fetchTypeStats(): Promise<TypeStat[]> {
  const res = await apiClient.get<never, ApiResult<TypeStat[]>>('/sys09/stats/type')
  return (res as ApiResult<TypeStat[]>).data ?? (res as unknown as TypeStat[])
}

const columns = [
  { title: '신분구분', dataIndex: 'type', key: 'type' },
  { title: '전사', dataIndex: 'combat', key: 'combat' },
  { title: '순직', dataIndex: 'duty', key: 'duty' },
  { title: '병사', dataIndex: 'disease', key: 'disease' },
  { title: '사고사', dataIndex: 'accident', key: 'accident' },
  { title: '계', dataIndex: 'total', key: 'total', render: (v: number) => <strong>{v}</strong> },
]

export default function StatsTypePage() {
  const { data = [] } = useQuery({
    queryKey: ['sys09/stats/type'],
    queryFn: fetchTypeStats,
  })

  const chartConfig = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    height: 300,
    label: {
      type: 'spider',
      content: '{name}: {value}',
    },
  }

  return (
    <PageContainer title="신분별 사망자 현황">
      <div style={{ marginBottom: 24 }}>
        <Pie {...chartConfig} />
      </div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={() => message.info('엑셀 다운로드')}>엑셀 다운로드</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="type"
        pagination={false}
      />
    </PageContainer>
  )
}
