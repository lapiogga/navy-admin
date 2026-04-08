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

interface NoticeItem {
  id: string
  title: string
  createdAt: string
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

// G27: 공지사항 조회
async function fetchNotices(): Promise<NoticeItem[]> {
  const res = await fetch('/api/sys14/notices')
  const json: ApiResult<NoticeItem[]> = await res.json()
  return json.data
}

const STATUS_COLOR_MAP: Record<string, string> = {
  registered: 'blue',
  received: 'cyan',
  processing: 'orange',
  completed: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  registered: '등록',
  received: '접수',
  processing: '진행',
  completed: '완료',
  rejected: '반려',
}

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

  // G27: 공지사항 데이터
  const { data: notices = [] } = useQuery({
    queryKey: ['sys14', 'notices'],
    queryFn: fetchNotices,
  })

  return (
    <PageContainer title={false}>
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

      {/* G27: 공지사항 + 최신 제언 양쪽 배치 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="공지사항"
            extra={
              <Button type="link" onClick={() => navigate('/sys14/1/2')}>
                전체보기
              </Button>
            }
            size="small"
          >
            <List
              dataSource={notices}
              renderItem={(item) => (
                <List.Item>
                  <Text ellipsis style={{ flex: 1 }}>{item.title}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>{item.createdAt}</Text>
                </List.Item>
              )}
              locale={{ emptyText: '공지사항이 없습니다' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="최신 제언"
            extra={
              <Button type="link" onClick={() => navigate('/sys14/1/3')}>
                전체보기
              </Button>
            }
            size="small"
          >
            <List
              dataSource={recent?.content ?? []}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
                    <Text ellipsis style={{ flex: 1, minWidth: 0 }}>{item.title}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{item.authorName}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{item.createdAt}</Text>
                    <StatusBadge
                      status={item.status}
                      colorMap={STATUS_COLOR_MAP}
                      labelMap={STATUS_LABEL_MAP}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}
