import { useRef } from 'react'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface SummaryPersonalRecord extends Record<string, unknown> {
  id: string
  department: string
  totalPersonnel: number
  completedCount: number
  incompletedCount: number
  absenceCount: number
  completionRate: number
  startDate: string
  endDate: string
}

async function fetchSummaryPersonal(params: PageRequest & { department?: string; startDate?: string; endDate?: string }): Promise<PageResponse<SummaryPersonalRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SummaryPersonalRecord>>>('/sys15/summary/personal', { params })
  return (res as ApiResult<PageResponse<SummaryPersonalRecord>>).data ?? (res as unknown as PageResponse<SummaryPersonalRecord>)
}

export default function SummaryPersonalPage() {
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<SummaryPersonalRecord>[] = [
    { title: '부대(서)', dataIndex: 'department', width: 160 },
    { title: '전체 인원', dataIndex: 'totalPersonnel', width: 100, align: 'right' },
    { title: '완료', dataIndex: 'completedCount', width: 80, align: 'right' },
    { title: '미완료', dataIndex: 'incompletedCount', width: 80, align: 'right' },
    { title: '부재', dataIndex: 'absenceCount', width: 80, align: 'right' },
    {
      title: '완료율',
      dataIndex: 'completionRate',
      width: 100,
      align: 'right',
      render: (val) => `${val}%`,
    },
    { title: '시작일', dataIndex: 'startDate', width: 120 },
    { title: '종료일', dataIndex: 'endDate', width: 120 },
  ]

  return (
    <PageContainer title="개인 보안결산 종합현황">
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

      <DataTable<SummaryPersonalRecord>
        columns={columns}
        request={(params) => fetchSummaryPersonal(params)}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="개인결산 현황 (부대별/기간별)"
      />
    </PageContainer>
  )
}
