import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Row, Col, Card, Statistic, List, Button, Typography, Select } from 'antd'
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

// CSV 스펙 기준 10개 카테고리 소개자료
const INTRO_DATA = [
  { category: '국방정책', description: '국방정책 관련 연구자료를 제공합니다.' },
  { category: '개별사업', description: '개별사업 관련 연구 및 분석 자료입니다.' },
  { category: '해사학술', description: '해사학술 분야 연구자료입니다.' },
  { category: '군사학술', description: '군사학술 분야 연구자료입니다.' },
  { category: '해군발전', description: '해군발전 관련 연구자료입니다.' },
  { category: '함정정비', description: '함정정비 관련 연구자료입니다.' },
  { category: '전투발전', description: '전투발전 관련 연구자료입니다.' },
  { category: '전투실험', description: '전투실험 관련 연구자료입니다.' },
  { category: '함정기술', description: '함정기술 관련 연구자료입니다.' },
  { category: '장성정책연구', description: '장성정책연구 관련 자료입니다.' },
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
    <PageContainer title={false}>
      {/* 통계 카드 4개 + 년도 선택 (1행) */}
      <Row gutter={8} style={{ marginBottom: 8 }}>
        <Col span={1}>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            size="small"
            style={{ width: '100%' }}
            options={[
              { label: '2026', value: 2026 },
              { label: '2025', value: 2025 },
              { label: '2024', value: 2024 },
            ]}
          />
        </Col>
        <Col span={5}><Card size="small" bodyStyle={{ padding: '8px 12px' }}><Statistic title="전체 자료" value={stats?.total ?? 0} suffix="건" valueStyle={{ fontSize: 20 }} /></Card></Col>
        <Col span={5}><Card size="small" bodyStyle={{ padding: '8px 12px' }}><Statistic title="이번달 등록" value={stats?.thisMonth ?? 0} suffix="건" valueStyle={{ fontSize: 20 }} /></Card></Col>
        <Col span={5}><Card size="small" bodyStyle={{ padding: '8px 12px' }}><Statistic title="인기 분야" value={stats?.topCategory ?? '-'} valueStyle={{ fontSize: 20 }} /></Card></Col>
        <Col span={5}><Card size="small" bodyStyle={{ padding: '8px 12px' }}><Statistic title="총 다운로드" value={stats?.totalDownloads ?? 0} suffix="회" valueStyle={{ fontSize: 20 }} /></Card></Col>
      </Row>

      {/* 카테고리별 현황 (한 줄에 2개씩, 간격 축소) */}
      <Card title={`${selectedYear}년 카테고리별 현황`} size="small" bodyStyle={{ padding: '8px 12px' }} style={{ marginBottom: 8 }}>
        <Row gutter={[8, 4]}>
          {categoryStats.map((cat) => (
            <Col span={12} key={cat.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: '#fafafa', borderRadius: 4 }}>
                <Text strong style={{ fontSize: 13 }}>{cat.category}</Text>
                <div>
                  <Text type="secondary" style={{ marginRight: 12, fontSize: 12 }}>과제수: {cat.totalCount}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>예산액: {cat.totalBudget?.toLocaleString()}원</Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 최신/인기 자료 목록 (3건만, 콤팩트) */}
      <Row gutter={8} style={{ marginBottom: 8 }}>
        <Col span={12}>
          <Card size="small" bodyStyle={{ padding: '4px 12px' }} title="최신 자료" extra={<Button type="link" size="small" onClick={() => navigate('/sys11/1/2')}>전체보기</Button>}>
            <List
              size="small"
              dataSource={recentItems.slice(0, 3)}
              renderItem={(item) => (
                <List.Item style={{ padding: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Text ellipsis style={{ flex: 1, fontSize: 13 }}>{item.title}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap', marginLeft: 12, fontSize: 12 }}>{item.category} · {item.createdAt}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" bodyStyle={{ padding: '4px 12px' }} title="인기 자료" extra={<Button type="link" size="small" onClick={() => navigate('/sys11/1/2')}>전체보기</Button>}>
            <List
              size="small"
              dataSource={popularItems.slice(0, 3)}
              renderItem={(item) => (
                <List.Item style={{ padding: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Text ellipsis style={{ flex: 1, fontSize: 13 }}>{item.title}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap', marginLeft: 12, fontSize: 12 }}>{item.category}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'nowrap', marginLeft: 8, fontSize: 12 }}>다운로드 {item.downloadCount}회</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 소개자료 카드 그리드 (10개 카테고리, 5열x2행, 콤팩트) */}
      <Row gutter={[8, 8]}>
        {INTRO_DATA.map((item) => (
          <Col span={4} key={item.category}>
            <Card
              size="small"
              bodyStyle={{ padding: '8px' }}
              hoverable
              onClick={() => navigate(`/sys11/1/2?category=${item.category}`)}
            >
              <Text strong style={{ fontSize: 13 }}>{item.category}</Text>
              <div><Button type="link" size="small" style={{ padding: 0, fontSize: 12 }}>자료 보기</Button></div>
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  )
}
