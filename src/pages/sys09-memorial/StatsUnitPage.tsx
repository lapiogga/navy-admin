import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table, Button, message } from 'antd'
import { Bar } from '@ant-design/charts'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface UnitStat {
  unit: string
  combat: number
  duty: number
  disease: number
  accident: number
  total: number
}

async function fetchUnitStats(): Promise<UnitStat[]> {
  const res = await apiClient.get<never, ApiResult<UnitStat[]>>('/sys09/stats/unit')
  return (res as ApiResult<UnitStat[]>).data ?? (res as unknown as UnitStat[])
}

const columns = [
  { title: '부대명', dataIndex: 'unit', key: 'unit' },
  { title: '전사', dataIndex: 'combat', key: 'combat' },
  { title: '순직', dataIndex: 'duty', key: 'duty' },
  { title: '병사', dataIndex: 'disease', key: 'disease' },
  { title: '사고사', dataIndex: 'accident', key: 'accident' },
  { title: '계', dataIndex: 'total', key: 'total', render: (v: number) => <strong>{v}</strong> },
]

export default function StatsUnitPage() {
  const { data = [] } = useQuery({
    queryKey: ['sys09/stats/unit'],
    queryFn: fetchUnitStats,
  })

  const chartConfig = {
    data,
    xField: 'total',
    yField: 'unit',
    height: 300,
    label: {
      position: 'middle' as const,
    },
  }

  return (
    <PageContainer title="부대별 사망자 현황">
      <div style={{ marginBottom: 24 }}>
        <Bar {...chartConfig} />
      </div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={() => message.info('엑셀 다운로드')}>엑셀 다운로드</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="unit"
        pagination={false}
        summary={(rows) => {
          const total = rows.reduce((sum, r) => sum + r.total, 0)
          const combat = rows.reduce((sum, r) => sum + r.combat, 0)
          const duty = rows.reduce((sum, r) => sum + r.duty, 0)
          const disease = rows.reduce((sum, r) => sum + r.disease, 0)
          const accident = rows.reduce((sum, r) => sum + r.accident, 0)
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><strong>합계</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={1}><strong>{combat}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={2}><strong>{duty}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={3}><strong>{disease}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={4}><strong>{accident}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={5}><strong>{total}</strong></Table.Summary.Cell>
            </Table.Summary.Row>
          )
        }}
      />
    </PageContainer>
  )
}
