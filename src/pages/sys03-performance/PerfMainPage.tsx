import { Card, Row, Col, Statistic, Progress, Spin } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { Column, Gauge } from '@ant-design/charts'
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
    <PageContainer title={false}>
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

      {/* Gauge + Bar 차트 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="나의 부서 업무 달성률">
            <Gauge
              percent={stats.myDeptRate / 100}
              range={{ color: ['#30BF78', '#E8EDF3'] }}
              indicator={{
                pointer: { style: { stroke: '#D0D0D0' } },
                pin: { style: { stroke: '#D0D0D0' } },
              }}
              statistic={{
                content: {
                  formatter: () => `${stats.myDeptRate}%`,
                  style: { fontSize: '24px', color: getRateColor(stats.myDeptRate) },
                },
              }}
              height={200}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="지휘방침별 업무추진율">
            <Column
              data={stats.policyRates.map((r) => ({ name: r.policyTitle, value: r.rate }))}
              xField="name"
              yField="value"
              height={200}
              label={{ position: 'top' as const, formatter: (d: { value?: number }) => `${d.value ?? 0}%` }}
              color="#1890ff"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="부/실/단별 업무추진율">
            <Column
              data={stats.deptRates.map((r) => ({ name: r.deptName, value: r.rate }))}
              xField="name"
              yField="value"
              height={200}
              label={{ position: 'top' as const, formatter: (d: { value?: number }) => `${d.value ?? 0}%` }}
              color="#faad14"
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}
