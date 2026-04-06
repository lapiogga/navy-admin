import { Card, Row, Col, Statistic, Progress, Spin } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface PolicyRate {
  policyTitle: string
  rate: number
}

interface DeptRate {
  deptName: string
  rate: number
}

interface StatsData {
  myDeptRate: number
  policyRates: PolicyRate[]
  deptRates: DeptRate[]
  totalTasks: number
  completedTasks: number
  avgProgressRate: number
}

async function fetchStats(): Promise<StatsData> {
  const res = await apiClient.get<never, ApiResult<StatsData>>('/sys03/stats')
  return (res as ApiResult<StatsData>).data ?? (res as unknown as StatsData)
}

function getRateColor(rate: number): string {
  if (rate >= 80) return '#52c41a'
  if (rate >= 60) return '#faad14'
  return '#ff4d4f'
}

export default function PerfMainPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['sys03', 'stats'],
    queryFn: fetchStats,
  })

  if (isLoading) return <Spin />

  const stats = data ?? {
    myDeptRate: 0,
    policyRates: [],
    deptRates: [],
    totalTasks: 0,
    completedTasks: 0,
    avgProgressRate: 0,
  }

  return (
    <PageContainer title="성과관리체계 메인">
      {/* 요약 통계 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="나의 부서 업무 달성률"
              value={stats.myDeptRate}
              suffix="%"
              valueStyle={{ color: getRateColor(stats.myDeptRate) }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="전체 과제 수" value={stats.totalTasks} suffix="개" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="완료 과제 수" value={stats.completedTasks} suffix="개" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="평균 추진율"
              value={stats.avgProgressRate}
              suffix="%"
              valueStyle={{ color: getRateColor(stats.avgProgressRate) }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 지휘방침별 업무추진율 */}
        <Col span={12}>
          <Card title="지휘방침별 업무추진율" style={{ marginBottom: 16 }}>
            {stats.policyRates.map((item) => (
              <div key={item.policyTitle} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.policyTitle}</span>
                  <span style={{ color: getRateColor(item.rate) }}>{item.rate}%</span>
                </div>
                <Progress
                  percent={item.rate}
                  strokeColor={getRateColor(item.rate)}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* 부/실/단별 업무추진율 */}
        <Col span={12}>
          <Card title="부/실/단별 업무추진율" style={{ marginBottom: 16 }}>
            {stats.deptRates.map((item) => (
              <div key={item.deptName} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.deptName}</span>
                  <span style={{ color: getRateColor(item.rate) }}>{item.rate}%</span>
                </div>
                <Progress
                  percent={item.rate}
                  strokeColor={getRateColor(item.rate)}
                  showInfo={false}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 나의 부서 업무 달성률 상세 */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="나의 부서 업무 달성률 상세">
            <Row gutter={16}>
              {stats.deptRates.slice(0, 4).map((item) => (
                <Col key={item.deptName} span={6}>
                  <Progress
                    type="circle"
                    percent={item.rate}
                    strokeColor={getRateColor(item.rate)}
                    format={(pct) => `${pct}%`}
                  />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>{item.deptName}</div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}
