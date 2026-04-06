import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table } from 'antd'
import { PrintableReport } from './PrintableReport'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface UnitStat {
  unit: string
  combat: number
  duty: number
  total: number
}

async function fetchInjuredReport(): Promise<UnitStat[]> {
  const res = await apiClient.get<never, ApiResult<UnitStat[]>>('/sys09/reports/injured')
  return (res as ApiResult<UnitStat[]>).data ?? (res as unknown as UnitStat[])
}

const columns = [
  { title: '부대명', dataIndex: 'unit', key: 'unit' },
  { title: '전상', dataIndex: 'combat', key: 'combat' },
  { title: '공상', dataIndex: 'duty', key: 'duty' },
  { title: '계', dataIndex: 'total', key: 'total', render: (v: number) => <strong>{v}</strong> },
]

export default function ReportInjuredPage() {
  const { data = [] } = useQuery({
    queryKey: ['sys09/reports/injured'],
    queryFn: fetchInjuredReport,
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <PageContainer title="상이자 현황 보고서">
      <PrintableReport title="상이자 현황 보고서">
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          작성일자: {today}
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="unit"
          pagination={false}
          summary={(rows) => {
            const totals = rows.reduce(
              (acc, r) => ({
                combat: acc.combat + r.combat,
                duty: acc.duty + r.duty,
                total: acc.total + r.total,
              }),
              { combat: 0, duty: 0, total: 0 },
            )
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>합계</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1}><strong>{totals.combat}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2}><strong>{totals.duty}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={3}><strong>{totals.total}</strong></Table.Summary.Cell>
              </Table.Summary.Row>
            )
          }}
        />
        <div className="signature-area">
          확인자: _________________ (인)
        </div>
      </PrintableReport>
    </PageContainer>
  )
}
