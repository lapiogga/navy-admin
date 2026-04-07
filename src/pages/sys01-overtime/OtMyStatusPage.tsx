import { Tabs } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { Column } from '@ant-design/charts'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import type { OtMyStatus } from '@/shared/api/mocks/handlers/sys01-overtime'

async function fetchMyStatus(): Promise<OtMyStatus[]> {
  const res = await apiClient.get<never, ApiResult<OtMyStatus[]>>('/sys01/my-status')
  const data = (res as ApiResult<OtMyStatus[]>).data ?? (res as unknown as OtMyStatus[])
  return data
}

function AnnualChart({ data }: { data: OtMyStatus[] }) {
  const config = {
    data,
    xField: 'month',
    yField: 'hours',
    height: 300,
    label: {
      text: 'hours',
      style: { fill: '#fff', opacity: 0.8 },
    },
    axis: {
      x: { label: { autoHide: true, autoRotate: false } },
    },
    scale: {
      month: { alias: '월' },
      hours: { alias: '초과근무 시간(h)' },
    },
    style: { fill: '#1890ff' },
  }
  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>연간 초과근무 현황</h3>
      <Column {...config} />
      <div style={{ marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>월</th>
              <th style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>초과근무시간(h)</th>
              <th style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>승인건수</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.month}>
                <td style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>{row.month}</td>
                <td style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>{typeof row.hours === 'number' ? row.hours.toFixed(1) : row.hours}</td>
                <td style={{ padding: '6px 12px', border: '1px solid #ddd', textAlign: 'center' }}>{row.approvedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MonthlyChart({ data }: { data: OtMyStatus[] }) {
  const currentMonth = data.slice(-1)[0]
  const config = {
    data: data.slice(-6),
    xField: 'month',
    yField: 'hours',
    height: 250,
    label: {
      text: 'hours',
    },
    scale: {
      month: { alias: '월' },
      hours: { alias: '초과근무 시간(h)' },
    },
    style: { fill: '#52c41a' },
  }
  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>최근 6개월 초과근무 현황</h3>
      {currentMonth && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f0f9ff', borderRadius: 6 }}>
          <strong>이번달 ({currentMonth.month})</strong>: 초과근무 {typeof currentMonth.hours === 'number' ? currentMonth.hours.toFixed(1) : currentMonth.hours}시간 / 승인 {currentMonth.approvedCount}건
        </div>
      )}
      <Column {...config} />
    </div>
  )
}

export default function OtMyStatusPage() {
  const { data: myStatus = [] } = useQuery({
    queryKey: ['sys01-my-status'],
    queryFn: fetchMyStatus,
  })

  const tabItems = [
    {
      key: 'annual',
      label: '연간 현황',
      children: <AnnualChart data={myStatus} />,
    },
    {
      key: 'monthly',
      label: '월간 현황',
      children: <MonthlyChart data={myStatus} />,
    },
  ]

  return (
    <PageContainer title="나의 근무현황">
      <Tabs defaultActiveKey="annual" items={tabItems} />
    </PageContainer>
  )
}
