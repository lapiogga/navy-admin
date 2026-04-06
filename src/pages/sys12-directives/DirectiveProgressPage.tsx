import { Row, Col, Card, Statistic, Progress, Button } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

// 추진현황 통계 타입
interface CategoryStat extends Record<string, unknown> {
  category: string
  totalCount: number
  completedCount: number
  inProgressCount: number
  notStartedCount: number
  delayedCount: number
  completionRate: number
}

interface DirectiveProgress {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  delayed: number
  completionRate: number
  categoryStats: CategoryStat[]
}

async function fetchDirectiveProgress(): Promise<DirectiveProgress> {
  const res = await apiClient.get<never, ApiResult<DirectiveProgress>>('/sys12/directives/progress')
  const data = (res as ApiResult<DirectiveProgress>).data ?? (res as unknown as DirectiveProgress)
  return data
}

// 매트릭스 테이블 컬럼 정의
const columns: ProColumns<CategoryStat>[] = [
  {
    title: '구분(지시자)',
    dataIndex: 'category',
    width: 150,
    valueType: 'text',
  },
  {
    title: '지시 건수',
    dataIndex: 'totalCount',
    width: 100,
    valueType: 'digit',
  },
  {
    title: '완료',
    dataIndex: 'completedCount',
    width: 80,
    render: (_, record) => (
      <span style={{ color: '#52c41a', fontWeight: 600 }}>{record.completedCount}</span>
    ),
  },
  {
    title: '진행중',
    dataIndex: 'inProgressCount',
    width: 80,
    render: (_, record) => (
      <span style={{ color: '#1677ff', fontWeight: 600 }}>{record.inProgressCount}</span>
    ),
  },
  {
    title: '미착수',
    dataIndex: 'notStartedCount',
    width: 80,
  },
  {
    title: '지연',
    dataIndex: 'delayedCount',
    width: 80,
    render: (_, record) => (
      <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{record.delayedCount}</span>
    ),
  },
  {
    title: '추진율',
    dataIndex: 'completionRate',
    width: 120,
    render: (_, record) => <Progress percent={record.completionRate} size="small" />,
  },
]

export default function DirectiveProgressPage() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['sys12-directive-progress'],
    queryFn: fetchDirectiveProgress,
  })

  const categoryStats = progress?.categoryStats ?? []

  return (
    <PageContainer title="지시사항 추진현황">
      {/* 요약 통계 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic title="총 지시" value={progress?.total ?? 0} loading={isLoading} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="완료"
              value={progress?.completed ?? 0}
              valueStyle={{ color: '#52c41a' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="진행중"
              value={progress?.inProgress ?? 0}
              valueStyle={{ color: '#1677ff' }}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="미착수" value={progress?.notStarted ?? 0} loading={isLoading} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="추진율"
              value={progress?.completionRate ?? 0}
              suffix="%"
              loading={isLoading}
            />
            <Progress
              percent={progress?.completionRate ?? 0}
              status={
                (progress?.completionRate ?? 0) >= 80
                  ? 'success'
                  : (progress?.completionRate ?? 0) >= 50
                    ? 'active'
                    : 'exception'
              }
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 카테고리별 매트릭스 테이블 */}
      <Card
        title="카테고리별 추진현황"
        extra={
          <Button onClick={() => { /* 엑셀 다운로드 */ }}>
            엑셀 다운로드
          </Button>
        }
      >
        <DataTable<CategoryStat>
          rowKey="category"
          columns={columns}
          request={async () => ({
            content: categoryStats,
            totalElements: categoryStats.length,
            totalPages: 1,
            size: categoryStats.length,
            number: 0,
          })}
        />
      </Card>
    </PageContainer>
  )
}
