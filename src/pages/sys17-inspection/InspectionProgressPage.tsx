import { useState } from 'react'
import { Card, Row, Col, Statistic, Progress, Select, Tabs } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { Bar } from '@ant-design/charts'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { InspectionTask } from '@/shared/api/mocks/handlers/sys17'

const INSP_FIELD_OPTIONS = [
  { label: '전투준비태세', value: '전투준비태세' },
  { label: '교육훈련', value: '교육훈련' },
  { label: '군수', value: '군수' },
  { label: '인사', value: '인사' },
  { label: '정보화', value: '정보화' },
]

interface UnitStat {
  unitName: string
  totalTasks: number
  completed: number
  inProgress: number
  notStarted: number
  completionRate: number
}

interface ProgressStats {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  unitStats: UnitStat[]
}

async function fetchProgressStats(): Promise<ProgressStats> {
  const res = await apiClient.get<ApiResult<ProgressStats>>('/sys17/stats/progress')
  const data = (res as ApiResult<ProgressStats>).data ?? (res as unknown as ProgressStats)
  return data
}

async function fetchTasksByUnit(unitName: string, params: PageRequest): Promise<PageResponse<InspectionTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InspectionTask>>>('/sys17/tasks', {
    params: { page: params.page, size: params.size, targetUnit: unitName },
  })
  const data = (res as ApiResult<PageResponse<InspectionTask>>).data ?? (res as unknown as PageResponse<InspectionTask>)
  return data
}

function getProgressColor(rate: number): string {
  if (rate <= 30) return '#ff4d4f'
  if (rate <= 70) return '#faad14'
  return '#52c41a'
}

export default function InspectionProgressPage() {
  const [_searchParams, setSearchParams] = useState({})

  const { data: stats, isLoading } = useQuery({
    queryKey: ['sys17', 'stats', 'progress'],
    queryFn: fetchProgressStats,
  })

  // 스택 차트 데이터 준비
  const chartData = (stats?.unitStats || []).flatMap((unit) => [
    { unitName: unit.unitName, count: unit.completed, status: '완료' },
    { unitName: unit.unitName, count: unit.inProgress, status: '진행중' },
    { unitName: unit.unitName, count: unit.notStarted, status: '미조치' },
  ])

  const barConfig = {
    data: chartData,
    xField: 'count' as const,
    yField: 'unitName' as const,
    seriesField: 'status' as const,
    isStack: true,
    height: 300,
    color: ['#52c41a', '#1890ff', '#d9d9d9'],
    legend: { position: 'top-left' as const },
  }

  const totalRate = stats ? Math.round(((stats.completed) / (stats.total || 1)) * 100) : 0

  const detailColumns: ProColumns<UnitStat>[] = [
    {
      title: '부대명',
      dataIndex: 'unitName',
      width: 150,
    },
    {
      title: '총 과제',
      dataIndex: 'totalTasks',
      width: 80,
      valueType: 'digit',
    },
    {
      title: '완료',
      dataIndex: 'completed',
      width: 80,
      render: (text) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{text}</span>,
    },
    {
      title: '진행중',
      dataIndex: 'inProgress',
      width: 80,
      render: (text) => <span style={{ color: '#1890ff' }}>{text}</span>,
    },
    {
      title: '미조치',
      dataIndex: 'notStarted',
      width: 80,
      render: (text) => <span style={{ color: '#d9d9d9' }}>{text}</span>,
    },
    {
      title: '추진율',
      dataIndex: 'completionRate',
      width: 120,
      render: (_, record) => (
        <Progress
          percent={record.completionRate}
          size="small"
          strokeColor={getProgressColor(record.completionRate)}
        />
      ),
    },
  ]

  const subTaskColumns: ProColumns<InspectionTask>[] = [
    { title: '과제번호', dataIndex: 'taskNo', width: 100 },
    { title: '과제명', dataIndex: 'taskName', width: 200 },
    { title: '검열분야', dataIndex: 'inspField', width: 100 },
    { title: '완료기한', dataIndex: 'dueDate', width: 120 },
    { title: '진행상태', dataIndex: 'progressStatus', width: 100 },
  ]

  const tabItems = [
    {
      key: '1',
      label: '종합현황',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Row gutter={8}>
              <Col span={6}>
                <Select options={[]} placeholder="기간 선택" allowClear style={{ width: '100%' }} />
              </Col>
              <Col span={6}>
                <Select options={[]} placeholder="대상부대 선택" allowClear style={{ width: '100%' }} />
              </Col>
              <Col span={6}>
                <Select options={INSP_FIELD_OPTIONS} placeholder="검열분야 선택" allowClear style={{ width: '100%' }} />
              </Col>
            </Row>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card loading={isLoading}>
                <Statistic title="총 과제 수" value={stats?.total || 0} />
              </Card>
            </Col>
            <Col span={6}>
              <Card loading={isLoading}>
                <Statistic
                  title="완료"
                  value={stats?.completed || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card loading={isLoading}>
                <Statistic
                  title="진행중"
                  value={stats?.inProgress || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card loading={isLoading}>
                <Statistic title="미조치" value={stats?.notStarted || 0} />
              </Card>
            </Col>
          </Row>

          {!isLoading && chartData.length > 0 && (
            <Card title="대상부대별 추진현황" style={{ marginBottom: 24 }}>
              <Bar {...barConfig} />
            </Card>
          )}

          <Card title="전체 추진율">
            <Progress
              percent={totalRate}
              strokeColor={getProgressColor(totalRate)}
              status="active"
              style={{ maxWidth: 400 }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: '세부현황',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Row gutter={8}>
              <Col span={6}>
                <Select options={[]} placeholder="기간 선택" allowClear style={{ width: '100%' }} />
              </Col>
              <Col span={6}>
                <Select options={INSP_FIELD_OPTIONS} placeholder="검열분야 선택" allowClear style={{ width: '100%' }} />
              </Col>
            </Row>
          </div>

          {!isLoading && stats && (
            <DataTable<UnitStat>
              queryKey={['sys17', 'stats', 'detail']}
              requestFn={async () => ({
                content: stats.unitStats,
                totalElements: stats.unitStats.length,
                totalPages: 1,
                size: stats.unitStats.length,
                number: 0,
              })}
              columns={detailColumns}
              rowKey="unitName"
              onSearch={(values) => setSearchParams(values)}
              expandable={{
                expandedRowRender: (record: UnitStat) => (
                  <DataTable<InspectionTask>
                    queryKey={['sys17', 'tasks', record.unitName]}
                    requestFn={(params) => fetchTasksByUnit(record.unitName, params)}
                    columns={subTaskColumns}
                    rowKey="id"
                  />
                ),
              }}
            />
          )}

          {!isLoading && chartData.length > 0 && (
            <Card title="부대별 추진현황 그래프" style={{ marginTop: 16 }}>
              <Bar {...barConfig} />
            </Card>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageContainer title="추진현황">
      <Tabs items={tabItems} />
    </PageContainer>
  )
}
