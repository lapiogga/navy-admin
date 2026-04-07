import { Tabs } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { Column } from '@ant-design/charts'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { OtMyStatus } from '@/shared/api/mocks/handlers/sys01-overtime'

/** 검색 필드 정의 */
const myStatusSearchFields: SearchField[] = [
  { name: 'year', label: '연도', type: 'select', options: [
    { label: '2026', value: '2026' },
    { label: '2025', value: '2025' },
  ]},
]

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

  const statusColumns: ProColumns<OtMyStatus>[] = [
    { title: '월', dataIndex: 'month', width: 80 },
    { title: '초과근무시간(h)', dataIndex: 'hours', width: 140, render: (_, r) => typeof r.hours === 'number' ? r.hours.toFixed(1) : r.hours },
    { title: '승인건수', dataIndex: 'approvedCount', width: 100 },
  ]

  /** 인라인 데이터를 PageResponse로 변환 */
  const fetchInline = async (): Promise<PageResponse<OtMyStatus>> => ({
    content: data,
    totalElements: data.length,
    totalPages: 1,
    size: data.length,
    number: 0,
  })

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>연간 초과근무 현황</h3>
      <Column {...config} />
      <div style={{ marginTop: 16 }}>
        <DataTable<OtMyStatus>
          columns={statusColumns}
          request={fetchInline}
          rowKey="month"
          headerTitle="월별 상세"
          search={false}
        />
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
      <SearchForm fields={myStatusSearchFields} onSearch={(values) => console.log('검색:', values)} />
      <Tabs defaultActiveKey="annual" items={tabItems} />
    </PageContainer>
  )
}
