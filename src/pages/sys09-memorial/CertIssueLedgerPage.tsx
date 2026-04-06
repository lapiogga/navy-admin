import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table } from 'antd'
import { PrintableReport } from './PrintableReport'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse } from '@/shared/api/types'

interface LedgerItem {
  id: string
  issueDate: string
  serviceNumber: string
  name: string
  rank: string
  unit: string
  purpose: string
  recipient: string
}

async function fetchIssueLedger(): Promise<LedgerItem[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<LedgerItem>>>('/sys09/reports/issue-ledger', {
    params: { page: 0, size: 100 },
  })
  const data = (res as ApiResult<PageResponse<LedgerItem>>).data ?? (res as unknown as PageResponse<LedgerItem>)
  return data.content || []
}

const columns = [
  { title: '연번', key: 'index', render: (_: unknown, __: LedgerItem, i: number) => i + 1 },
  { title: '발급일자', dataIndex: 'issueDate', key: 'issueDate' },
  { title: '군번', dataIndex: 'serviceNumber', key: 'serviceNumber' },
  { title: '성명', dataIndex: 'name', key: 'name' },
  { title: '계급', dataIndex: 'rank', key: 'rank' },
  { title: '소속', dataIndex: 'unit', key: 'unit' },
  { title: '용도', dataIndex: 'purpose', key: 'purpose' },
  { title: '수령인', dataIndex: 'recipient', key: 'recipient' },
]

export default function CertIssueLedgerPage() {
  const { data = [] } = useQuery({
    queryKey: ['sys09/reports/issue-ledger'],
    queryFn: fetchIssueLedger,
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <PageContainer title="전사망자 확인증 발급대장">
      <PrintableReport title="전사망자 확인증 발급대장">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={false}
          bordered
        />
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          작성일자: {today}
        </div>
        <div className="signature-area">
          담당: _________________ (인)
        </div>
      </PrintableReport>
    </PageContainer>
  )
}
