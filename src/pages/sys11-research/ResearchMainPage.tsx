import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Row, Col, Card, Statistic, List, Button, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

interface ResearchStats {
  total: number
  thisMonth: number
  topCategory: string
  totalDownloads: number
}

interface ResearchItem {
  id: string
  title: string
  author: string
  department: string
  category: string
  description: string
  fileUrl: string
  fileName: string
  downloadCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

interface ApiResult<T> {
  success: boolean
  data: T
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
}

async function fetchStats(): Promise<ResearchStats> {
  const res = await fetch('/api/sys11/research/stats')
  const json: ApiResult<ResearchStats> = await res.json()
  return json.data
}

async function fetchRecent(): Promise<ResearchItem[]> {
  const res = await fetch('/api/sys11/research/recent')
  const json: ApiResult<PageResponse<ResearchItem>> = await res.json()
  return json.data.content
}

async function fetchPopular(): Promise<ResearchItem[]> {
  const res = await fetch('/api/sys11/research/popular')
  const json: ApiResult<PageResponse<ResearchItem>> = await res.json()
  return json.data.content
}

export default function ResearchMainPage() {
  const navigate = useNavigate()

  const { data: stats } = useQuery({
    queryKey: ['sys11', 'stats'],
    queryFn: fetchStats,
  })

  const { data: recentItems = [] } = useQuery({
    queryKey: ['sys11', 'recent'],
    queryFn: fetchRecent,
  })

  const { data: popularItems = [] } = useQuery({
    queryKey: ['sys11', 'popular'],
    queryFn: fetchPopular,
  })

  return (
    <PageContainer title="연구자료종합관리">
      {/* 통계 카드 4개 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="전체 자료" value={stats?.total ?? 0} suffix="건" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="이번달 등록" value={stats?.thisMonth ?? 0} suffix="건" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="인기 분야" value={stats?.topCategory ?? '-'} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="총 다운로드" value={stats?.totalDownloads ?? 0} suffix="회" />
          </Card>
        </Col>
      </Row>

      {/* 최신/인기 자료 목록 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="최신 자료"
            extra={
              <Button type="link" onClick={() => navigate('/sys11/1/2')}>
                전체보기
              </Button>
            }
          >
            <List
              dataSource={recentItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <Text type="secondary">
                        {item.category} · {item.createdAt}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="인기 자료"
            extra={
              <Button type="link" onClick={() => navigate('/sys11/1/2')}>
                전체보기
              </Button>
            }
          >
            <List
              dataSource={popularItems}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Text type="secondary">다운로드 {item.downloadCount}회</Text>
                  }
                >
                  <List.Item.Meta title={item.title} description={item.category} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}
