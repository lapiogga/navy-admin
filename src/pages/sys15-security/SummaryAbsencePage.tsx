import { useRef } from 'react'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface SummaryAbsenceRecord extends Record<string, unknown> {
  id: string
  department: string
  totalAbsence: number
  approvedCount: number
  pendingCount: number
  rejectedCount: number
  avgDays: number
  startDate: string
  endDate: string
}

async function fetchSummaryAbsence(params: PageRequest & { department?: string; startDate?: string; endDate?: string }): Promise<PageResponse<SummaryAbsenceRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SummaryAbsenceRecord>>>('/sys15/summary/absence', { params })
  return (res as ApiResult<PageResponse<SummaryAbsenceRecord>>).data ?? (res as unknown as PageResponse<SummaryAbsenceRecord>)
}

export default function SummaryAbsencePage() {
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<SummaryAbsenceRecord>[] = [
    { title: '부대(서)', dataIndex: 'department', width: 160 },
    { title: '부재 전체', dataIndex: 'totalAbsence', width: 100, align: 'right' },
    { title: '승인', dataIndex: 'approvedCount', width: 80, align: 'right' },
    { title: '처리중', dataIndex: 'pendingCount', width: 80, align: 'right' },
    { title: '반려', dataIndex: 'rejectedCount', width: 80, align: 'right' },
    { title: '평균 일수', dataIndex: 'avgDays', width: 100, align: 'right', render: (val) => `${val}일` },
    { title: '시작일', dataIndex: 'startDate', width: 120 },
    { title: '종료일', dataIndex: 'endDate', width: 120 },
  ]

  return (
    <PageContainer title="부재처리 종합현황">
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

      <DataTable<SummaryAbsenceRecord>
        columns={columns}
        request={(params) => fetchSummaryAbsence(params)}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="부재처리 현황 (부대별/기간별)"
        toolBarRender={() => [
          <Button key="export" icon={<DownloadOutlined />}>
            엑셀 저장
          </Button>,
        ]}
      />
    </PageContainer>
  )
}
