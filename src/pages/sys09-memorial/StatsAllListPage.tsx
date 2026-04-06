import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table, Button, message } from 'antd'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { Deceased } from '@/shared/api/mocks/handlers/sys09'

const DEATH_TYPE_LABEL: Record<string, string> = {
  combat: '전사',
  duty: '순직',
  disease: '병사',
  accident: '사고사',
}

async function fetchAllList(): Promise<Deceased[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Deceased>>>('/sys09/stats/all-list', {
    params: { page: 0, size: 100 },
  })
  const data = (res as ApiResult<PageResponse<Deceased>>).data ?? (res as unknown as PageResponse<Deceased>)
  return data.content || []
}

const columns = [
  { title: '연번', key: 'index', render: (_: unknown, __: Deceased, i: number) => i + 1 },
  { title: '군번', dataIndex: 'serviceNumber', key: 'serviceNumber' },
  { title: '성명', dataIndex: 'name', key: 'name' },
  { title: '계급', dataIndex: 'rank', key: 'rank' },
  { title: '소속', dataIndex: 'unit', key: 'unit' },
  {
    title: '사망구분',
    dataIndex: 'deathType',
    key: 'deathType',
    render: (v: string) => DEATH_TYPE_LABEL[v] || v,
  },
  { title: '사망일자', dataIndex: 'deathDate', key: 'deathDate' },
  { title: '사망장소', dataIndex: 'deathPlace', key: 'deathPlace' },
]

export default function StatsAllListPage() {
  const { data = [] } = useQuery({
    queryKey: ['sys09/stats/all-list'],
    queryFn: fetchAllList,
  })

  return (
    <PageContainer title="전사망자 명부">
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={() => message.info('엑셀 다운로드')}>엑셀 다운로드</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </PageContainer>
  )
}
