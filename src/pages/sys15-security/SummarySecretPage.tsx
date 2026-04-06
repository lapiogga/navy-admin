import { useRef } from 'react'
import { Button, Space } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface SummarySecretRecord extends Record<string, unknown> {
  id: string
  department: string
  totalSecrets: number
  activeSecrets: number
  expiredSecrets: number
  totalMedia: number
  activeMedia: number
  totalEquipment: number
  activeEquipment: number
  reportDate: string
}

async function fetchSummarySecret(params: PageRequest & { department?: string }): Promise<PageResponse<SummarySecretRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SummarySecretRecord>>>('/sys15/summary/secret', { params })
  return (res as ApiResult<PageResponse<SummarySecretRecord>>).data ?? (res as unknown as PageResponse<SummarySecretRecord>)
}

export default function SummarySecretPage() {
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<SummarySecretRecord>[] = [
    { title: '부대(서)', dataIndex: 'department', width: 160 },
    { title: '비밀 전체', dataIndex: 'totalSecrets', width: 100, align: 'right' },
    { title: '비밀 현용', dataIndex: 'activeSecrets', width: 100, align: 'right' },
    { title: '비밀 기간경과', dataIndex: 'expiredSecrets', width: 120, align: 'right' },
    { title: '매체 전체', dataIndex: 'totalMedia', width: 100, align: 'right' },
    { title: '매체 현용', dataIndex: 'activeMedia', width: 100, align: 'right' },
    { title: '보안자재 전체', dataIndex: 'totalEquipment', width: 120, align: 'right' },
    { title: '보안자재 현용', dataIndex: 'activeEquipment', width: 120, align: 'right' },
    { title: '기준일', dataIndex: 'reportDate', width: 120 },
  ]

  return (
    <PageContainer title="비밀/매체 종합현황">
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
        ]}
        onSearch={(values) => {
          actionRef.current?.setPageInfo?.({ current: 1 })
          actionRef.current?.reload()
          return values
        }}
      />

      <DataTable<SummarySecretRecord>
        columns={columns}
        request={(params) => fetchSummarySecret(params)}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="비밀/매체 보유현황"
        toolBarRender={() => [
          <Button key="export" icon={<DownloadOutlined />}>
            엑셀 저장
          </Button>,
        ]}
      />
    </PageContainer>
  )
}
