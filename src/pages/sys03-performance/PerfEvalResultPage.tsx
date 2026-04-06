import { Button, Progress, Card } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { DownloadOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { EvalResult } from '@/shared/api/mocks/handlers/sys03-performance'

async function fetchEvalResults(params: PageRequest): Promise<PageResponse<EvalResult>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<EvalResult>>>('/sys03/eval-results', {
    params: { current: params.page + 1, pageSize: params.size },
  })
  return (res as ApiResult<PageResponse<EvalResult>>).data ?? (res as unknown as PageResponse<EvalResult>)
}

async function fetchAllEvalResults(): Promise<EvalResult[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<EvalResult>>>('/sys03/eval-results', {
    params: { current: 1, pageSize: 100 },
  })
  const data = (res as ApiResult<PageResponse<EvalResult>>).data ?? (res as unknown as PageResponse<EvalResult>)
  return data.content ?? []
}

function getRateColor(rate: number): string {
  if (rate >= 80) return '#52c41a'
  if (rate >= 60) return '#faad14'
  return '#ff4d4f'
}

export default function PerfEvalResultPage() {
  const { data: allResults = [] } = useQuery({
    queryKey: ['sys03', 'eval-results', 'all'],
    queryFn: fetchAllEvalResults,
  })

  const exportMutation = useMutation({
    mutationFn: async () => apiClient.post('/sys03/eval-results/export'),
    onSuccess: () => void 0,
  })

  const columns: ProColumns<EvalResult>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '부대(서)', dataIndex: 'deptName' },
    { title: '전체 과제 수', dataIndex: 'totalTasks', width: 120 },
    { title: '평가완료 수', dataIndex: 'evaluatedTasks', width: 110 },
    { title: '평균 등급', dataIndex: 'avgGrade', width: 100 },
    {
      title: '평가율(%)',
      dataIndex: 'evalRate',
      width: 110,
      render: (val) => `${String(val)}%`,
    },
  ]

  return (
    <PageContainer title="평가결과">
      <DataTable<EvalResult>
        rowKey="id"
        columns={columns}
        headerTitle="부대(서)별 평가결과"
        request={(params) => fetchEvalResults(params)}
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

      {/* 부대(서)별 평가율 시각화 */}
      <Card title="부대(서)별 평가율 현황" style={{ marginTop: 24 }}>
        {allResults.map((item) => (
          <div key={item.id} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>{item.deptName}</span>
              <span>평균 등급: <strong>{item.avgGrade}</strong> | 평가율: {item.evalRate}%</span>
            </div>
            <Progress
              percent={item.evalRate}
              strokeColor={getRateColor(item.evalRate)}
              format={(pct) => `${pct}%`}
            />
          </div>
        ))}
      </Card>
    </PageContainer>
  )
}
