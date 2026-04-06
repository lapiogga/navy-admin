import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Row, Col, Card, Statistic, List, Button, Typography, Select, Table } from 'antd'
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

interface CategoryStat {
  category: string
  totalCount: number
  totalBudget: number
}

interface ApiResult<T> {
  success: boolean
  data: T
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
}

// 소개자료 카드 데이터
const INTRO_DATA = [
  { category: '전략연구', description: '해병대 전략 및 정책 관련 연구자료를 제공합니다.' },
  { category: '작전연구', description: '작전 수행 관련 연구 및 분석 자료입니다.' },
  { category: '교육훈련', description: '교육훈련 개선 및 발전 관련 연구자료입니다.' },
  { category: '인사관리', description: '인사제도 및 관리 관련 연구자료입니다.' },
  { category: '군수지원', description: '군수지원 체계 및 개선 관련 자료입니다.' },
  { category: '기타', description: '기타 분야 연구자료를 확인할 수 있습니다.' },
]

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

async function fetchCategoryStats(year: number): Promise<CategoryStat[]> {
  const res = await fetch(`/api/sys11/stats?year=${year}`)
  const json: ApiResult<CategoryStat[]> = await res.json()
  return json.data
}

export default function ResearchMainPage() {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState(2026)

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

  const { data: categoryStats = [] } = useQuery({
    queryKey: ['sys11', 'categoryStats', selectedYear],
    queryFn: () => fetchCategoryStats(selectedYear),
  })

  return (
    <PageContainer title="연구자료종합관리">
      {/* 년도 선택 */}
      <Select
        value={selectedYear}
        onChange={setSelectedYear}
        style={{ width: 120, marginBottom: 16 }}
        options={[
          { label: '2026', value: 2026 },
          { label: '2025', value: 2025 },
          { label: '2024', value: 2024 },
        ]}
      />

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

      {/* 카테고리별 통계 테이블 */}
      <Card title={`${selectedYear}년 카테고리별 현황`} size="small" style={{ marginBottom: 16 }}>
        <Table
          dataSource={categoryStats}
          pagination={false}
          columns={[
            { title: '카테고리', dataIndex: 'category' },
            { title: '총 과제수', dataIndex: 'totalCount' },
            { title: '총 예산액', dataIndex: 'totalBudget', render: (v: number) => `${v?.toLocaleString()}원` },
          ]}
          rowKey="category"
          size="small"
        />
      </Card>

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

      {/* 소개자료 카드 그리드 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {INTRO_DATA.map((item) => (
          <Col span={8} key={item.category}>
            <Card
              title={item.category}
              size="small"
              hoverable
              onClick={() => navigate(`/sys11/1/2?category=${item.category}`)}
            >
              <Text>{item.description}</Text>
              <div style={{ marginTop: 8 }}>
                <Button type="link" size="small">자료 보기</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  )
}
