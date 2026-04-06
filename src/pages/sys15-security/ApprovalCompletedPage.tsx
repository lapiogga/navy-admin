import { useState } from 'react'
import { DatePicker, Select } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { ApprovalRecord } from '@/shared/api/mocks/handlers/sys15-security'

const { RangePicker } = DatePicker

const STATUS_COLOR_MAP: Record<string, string> = {
  submitted: 'orange',
  approved: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  submitted: '결재대기',
  approved: '승인',
  rejected: '반려',
}

const DOC_TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: '개인일일결산', label: '개인일일결산' },
  { value: '사무실결산', label: '사무실결산' },
  { value: '당직표', label: '당직표' },
  { value: '보안교육', label: '보안교육' },
  { value: '부재', label: '부재' },
]

async function fetchCompletedApprovals(params: PageRequest & { startDate?: string; endDate?: string; docType?: string }): Promise<PageResponse<ApprovalRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<ApprovalRecord>>>('/api/sys15/approvals/completed', {
    params: { page: params.page, size: params.size, startDate: params.startDate, endDate: params.endDate, docType: params.docType },
  })
  const data = (res as ApiResult<PageResponse<ApprovalRecord>>).data ?? (res as unknown as PageResponse<ApprovalRecord>)
  return data
}

export default function ApprovalCompletedPage() {
  const [filterDates, setFilterDates] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [filterDocType, setFilterDocType] = useState<string | undefined>()

  const columns: ProColumns<ApprovalRecord>[] = [
    { title: '문서유형', dataIndex: 'docType', width: 120 },
    { title: '제목', dataIndex: 'title' },
    { title: '제출자', dataIndex: 'submitter', width: 100 },
    { title: '부대(서)', dataIndex: 'department', width: 120 },
    { title: '제출일', dataIndex: 'submittedAt', width: 120 },
    { title: '결재일', dataIndex: 'approvedAt', width: 120 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (val: unknown) => (
        <StatusBadge
          status={String(val)}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '반려사유',
      dataIndex: 'rejectReason',
      render: (val: unknown) => val ? <span style={{ color: '#ff4d4f' }}>{String(val)}</span> : '-',
    },
  ]

  const startDate = filterDates?.[0]?.format('YYYY-MM-DD')
  const endDate = filterDates?.[1]?.format('YYYY-MM-DD')

  return (
    <PageContainer title="결재완료">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span>조회기간:</span>
        <RangePicker
          onChange={(dates) => setFilterDates(dates as [Dayjs | null, Dayjs | null] | null)}
        />
        <span>문서유형:</span>
        <Select
          options={DOC_TYPE_OPTIONS}
          style={{ width: 140 }}
          onChange={(val) => setFilterDocType(val || undefined)}
          defaultValue=""
        />
      </div>
      <DataTable<ApprovalRecord>
        queryKey={['sys15-approvals-completed', startDate, endDate, filterDocType]}
        fetchFn={(params) => fetchCompletedApprovals({ ...params, startDate, endDate, docType: filterDocType })}
        columns={columns}
      />
    </PageContainer>
  )
}
