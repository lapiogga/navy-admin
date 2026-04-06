import { useRef } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface SummaryOfficeRecord extends Record<string, unknown> {
  id: string
  department: string
  totalOffices: number
  completedCount: number
  incompletedCount: number
  completionRate: number
  nonCompliantCount: number
  startDate: string
  endDate: string
}

async function fetchSummaryOffice(params: PageRequest & { department?: string; startDate?: string; endDate?: string }): Promise<PageResponse<SummaryOfficeRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SummaryOfficeRecord>>>('/sys15/summary/office', { params })
  return (res as ApiResult<PageResponse<SummaryOfficeRecord>>).data ?? (res as unknown as PageResponse<SummaryOfficeRecord>)
}

export default function SummaryOfficePage() {
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<SummaryOfficeRecord>[] = [
    { title: '부대(서)', dataIndex: 'department', width: 160 },
    { title: '전체 사무실', dataIndex: 'totalOffices', width: 110, align: 'right' },
    { title: '완료', dataIndex: 'completedCount', width: 80, align: 'right' },
    { title: '미완료', dataIndex: 'incompletedCount', width: 80, align: 'right' },
    {
      title: '완료율',
      dataIndex: 'completionRate',
      width: 100,
      align: 'right',
      render: (val) => `${val}%`,
    },
    { title: '불이행 인원', dataIndex: 'nonCompliantCount', width: 110, align: 'right' },
    { title: '시작일', dataIndex: 'startDate', width: 120 },
    { title: '종료일', dataIndex: 'endDate', width: 120 },
  ]

  return (
    <PageContainer title="사무실 보안결산 종합현황">
      <SearchForm
        fields={[
          {
            name: 'department',
            label: '부대(서)',
            type: 'select',
            options: [
              { label: '전체', value: '' },
              { label: '1함대', value: '1함대' },
              { label: '2함대', value: '2함대' },
              { label: '3함대', value: '3함대' },
              { label: '해군사령부', value: '해군사령부' },
              { label: '교육사령부', value: '교육사령부' },
              { label: '군수사령부', value: '군수사령부' },
              { label: '해병대사령부', value: '해병대사령부' },
            ],
          },
          { name: 'startDate', label: '시작일', type: 'date' as const },
          { name: 'endDate', label: '종료일', type: 'date' as const },
        ]}
        onSearch={(values) => {
          actionRef.current?.setPageInfo?.({ current: 1 })
          actionRef.current?.reload()
          return values
        }}
      />

      <DataTable<SummaryOfficeRecord>
        columns={columns}
        request={(params) => fetchSummaryOffice(params)}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="사무실결산 현황 (부대별/기간별)"
      />
    </PageContainer>
  )
}
