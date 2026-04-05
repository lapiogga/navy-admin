import { Card, Col, Row, List, Button, Typography } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { Statistic } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'

const { Text } = Typography

interface SuggestionStats {
  total: number
  thisMonth: number
  answered: number
  pending: number
}

interface SuggestionItem {
  id: string
  title: string
  authorName: string
  createdAt: string
  status: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
}

interface ApiResult<T> {
  success: boolean
  data: T
}

async function fetchStats(): Promise<SuggestionStats> {
  const res = await fetch('/api/sys14/suggestions/stats')
  const json: ApiResult<SuggestionStats> = await res.json()
  return json.data
}

async function fetchRecent(): Promise<PageResponse<SuggestionItem>> {
  const res = await fetch('/api/sys14/suggestions/recent')
  const json: ApiResult<PageResponse<SuggestionItem>> = await res.json()
  return json.data
}

const STATUS_COLOR_MAP = { open: 'cyan', answered: 'green', closed: 'default' }
const STATUS_LABEL_MAP = { open: '대기', answered: '답변완료', closed: '종료' }

export default function SuggestionMainPage() {
  const navigate = useNavigate()

  const { data: stats } = useQuery({
    queryKey: ['sys14', 'stats'],
    queryFn: fetchStats,
  })

  const { data: recent } = useQuery({
    queryKey: ['sys14', 'recent'],
    queryFn: fetchRecent,
  })

  return (
    <PageContainer title="나의 제언">
      {/* 통계 카드 4개 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="전체 제언" value={stats?.total ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="이번달 등록" value={stats?.thisMonth ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="답변 완료" value={stats?.answered ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="처리 대기" value={stats?.pending ?? 0} />
          </Card>
        </Col>
      </Row>

      {/* 최신 제언 5건 */}
      <Card
        title="최신 제언"
        extra={
          <Button type="link" onClick={() => navigate('/sys14/1/3')}>
            전체보기
          </Button>
        }
      >
        <List
          dataSource={recent?.content ?? []}
          renderItem={(item) => (
            <List.Item
              extra={
                <StatusBadge
                  status={item.status}
                  colorMap={STATUS_COLOR_MAP}
                  labelMap={STATUS_LABEL_MAP}
                />
              }
            >
              <List.Item.Meta
                title={item.title}
                description={
                  <Text type="secondary">
                    {item.authorName} · {item.createdAt}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </PageContainer>
  )
}
