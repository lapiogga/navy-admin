import { Button, Progress, Card } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { DownloadOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { InputStatus } from '@/shared/api/mocks/handlers/sys03-performance'

async function fetchInputStatuses(params: PageRequest): Promise<PageResponse<InputStatus>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InputStatus>>>('/sys03/input-status', {
    params: { current: params.page + 1, pageSize: params.size },
  })
  return (res as ApiResult<PageResponse<InputStatus>>).data ?? (res as unknown as PageResponse<InputStatus>)
}

async function fetchAllInputStatuses(): Promise<InputStatus[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InputStatus>>>('/sys03/input-status', {
    params: { current: 1, pageSize: 100 },
  })
  const data = (res as ApiResult<PageResponse<InputStatus>>).data ?? (res as unknown as PageResponse<InputStatus>)
  return data.content ?? []
}

function getRateColor(rate: number): string {
  if (rate >= 80) return '#52c41a'
  if (rate >= 60) return '#faad14'
  return '#ff4d4f'
}

export default function PerfInputStatusPage() {
  const { data: allStatuses = [] } = useQuery({
    queryKey: ['sys03', 'input-status', 'all'],
    queryFn: fetchAllInputStatuses,
  })

  const exportMutation = useMutation({
    mutationFn: async () => apiClient.post('/sys03/input-status/export'),
    onSuccess: () => void 0,
  })

  const columns: ProColumns<InputStatus>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '부대(서)', dataIndex: 'deptName' },
    { title: '전체 과제 수', dataIndex: 'totalTasks', width: 120 },
    { title: '입력완료 수', dataIndex: 'inputTasks', width: 110 },
    {
      title: '입력율(%)',
      dataIndex: 'inputRate',
      width: 110,
      render: (val) => `${String(val)}%`,
    },
  ]

  return (
    <PageContainer title="업무실적 입력현황">
      <DataTable<InputStatus>
        rowKey="id"
        columns={columns}
        headerTitle="부대(서)별 업무실적 입력현황"
        request={(params) => fetchInputStatuses(params)}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => exportMutation.mutate()}
            loading={exportMutation.isPending}
          >
            엑셀 저장
          </Button>,
        ]}
      />

      {/* 부대(서)별 입력율 시각화 */}
      <Card title="부대(서)별 업무실적 입력현황" style={{ marginTop: 24 }}>
        {allStatuses.map((item) => (
          <div key={item.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>{item.deptName}</span>
              <span>
                {item.inputTasks}/{item.totalTasks} 건 | 입력율: {item.inputRate}%
              </span>
            </div>
            <Progress
              percent={item.inputRate}
              strokeColor={getRateColor(item.inputRate)}
              format={(pct) => `${pct}%`}
            />
          </div>
        ))}
      </Card>
    </PageContainer>
  )
}
