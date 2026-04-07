import { Tabs, Button, Select, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { Column, Bar } from '@ant-design/charts'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtUnitStatus, OtAbsence } from '@/shared/api/mocks/handlers/sys01-overtime'

/** 부대 근무현황 검색 필드 */
const unitStatusSearchFields: SearchField[] = [
  { name: 'unitName', label: '부대(서)', type: 'select', options: [
    { label: '전체', value: '' },
    { label: '1함대', value: '1함대' },
    { label: '2함대', value: '2함대' },
    { label: '3함대', value: '3함대' },
    { label: '해군사령부', value: '해군사령부' },
  ]},
  { name: 'month', label: '기간', type: 'date' },
]

const UNIT_OPTIONS = [
  { label: '전체', value: '' },
  { label: '1함대', value: '1함대' },
  { label: '2함대', value: '2함대' },
  { label: '3함대', value: '3함대' },
  { label: '해군사령부', value: '해군사령부' },
  { label: '교육사령부', value: '교육사령부' },
]

async function fetchUnitStatus(params: PageRequest): Promise<PageResponse<OtUnitStatus>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtUnitStatus>>>('/sys01/unit-status', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtUnitStatus>>).data ?? (res as unknown as PageResponse<OtUnitStatus>)
  return data
}

async function fetchUnitAbsence(params: PageRequest): Promise<PageResponse<OtAbsence>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtAbsence>>>('/sys01/unit-absence', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtAbsence>>).data ?? (res as unknown as PageResponse<OtAbsence>)
  return data
}

interface UnitStat {
  unit: string
  jan: number
  feb: number
  mar: number
  apr: number
}

function UnitStatusTab() {
  const statusColumns: ProColumns<OtUnitStatus>[] = [
    { title: '부대(서)', dataIndex: 'unitName', width: 120 },
    { title: '기간', dataIndex: 'month', width: 100 },
    { title: '총초과근무(h)', dataIndex: 'totalOtHours', width: 130 },
    { title: '신청인원', dataIndex: 'applicantCount', width: 90 },
    { title: '승인건수', dataIndex: 'approvedCount', width: 90 },
    { title: '평균시간(h)', dataIndex: 'avgHours', width: 100 },
  ]

  return (
    <div>
      <SearchForm fields={unitStatusSearchFields} onSearch={(values) => console.log('검색:', values)} />
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Button icon={<DownloadOutlined />} onClick={() => void message.success('엑셀 저장이 완료되었습니다.')}>
          엑셀저장
        </Button>
      </div>
      <DataTable<OtUnitStatus>
        columns={statusColumns}
        request={fetchUnitStatus}
        rowKey="id"
        headerTitle="부대 근무현황"
      />
    </div>
  )
}

function UnitStatsTab() {
  const { data: statsRaw } = useQuery({
    queryKey: ['sys01-unit-stats'],
    queryFn: async () => {
      const res = await apiClient.get<never, ApiResult<UnitStat[]>>('/sys01/unit-stats')
      const data = (res as ApiResult<UnitStat[]>).data ?? (res as unknown as UnitStat[])
      return data
    },
  })

  const chartData = (statsRaw ?? []).flatMap(row =>
    (['jan', 'feb', 'mar', 'apr'] as const).map(m => ({
      unit: row.unit,
      month: m === 'jan' ? '1월' : m === 'feb' ? '2월' : m === 'mar' ? '3월' : '4월',
      hours: row[m],
    }))
  )

  const colConfig = {
    data: chartData,
    xField: 'unit',
    yField: 'hours',
    seriesField: 'month',
    isGroup: true,
    height: 320,
    meta: { unit: { alias: '부대(서)' }, hours: { alias: '초과근무시간(h)' } },
  }

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <Select options={UNIT_OPTIONS} defaultValue="" style={{ width: 160 }} placeholder="부대(서) 선택" />
        <Button type="primary">조회</Button>
        <Button icon={<DownloadOutlined />} onClick={() => void message.success('엑셀 저장이 완료되었습니다.')}>
          엑셀저장
        </Button>
      </div>
      <Column {...colConfig} />
    </div>
  )
}

function UnitAbsenceTab() {
  const absenceColumns: ProColumns<OtAbsence>[] = [
    { title: '부재유형', dataIndex: 'absenceType', width: 100 },
    { title: '신청자', dataIndex: 'applicantName', width: 90 },
    { title: '부대(서)', dataIndex: 'applicantUnit', width: 100 },
    { title: '시작일', dataIndex: 'startDate', width: 110 },
    { title: '종료일', dataIndex: 'endDate', width: 110 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
  ]

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <Select options={UNIT_OPTIONS} defaultValue="" style={{ width: 160 }} placeholder="부대(서) 선택" />
        <Button type="primary">조회</Button>
        <Button icon={<DownloadOutlined />} onClick={() => void message.success('엑셀 저장이 완료되었습니다.')}>
          엑셀저장
        </Button>
      </div>
      <DataTable<OtAbsence>
        columns={absenceColumns}
        request={fetchUnitAbsence}
        rowKey="id"
        headerTitle="부대 부재현황"
      />
    </div>
  )
}

export default function OtUnitStatusPage() {
  const tabItems = [
    { key: 'status', label: '부대 근무현황', children: <UnitStatusTab /> },
    { key: 'stats', label: '부대 근무통계', children: <UnitStatsTab /> },
    { key: 'absence', label: '부대 부재현황', children: <UnitAbsenceTab /> },
  ]

  return (
    <PageContainer title="부대 근무 현황">
      <Tabs defaultActiveKey="status" items={tabItems} />
    </PageContainer>
  )
}
