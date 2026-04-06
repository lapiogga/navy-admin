import { useRef } from 'react'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { Tabs } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface LogRecord extends Record<string, unknown> {
  id: string
  logType: '결산실시' | '종합'
  eventAt: string
  userName: string
  department: string
  actionType: string
  detail: string
}

async function fetchLogs(logType: '결산실시' | '종합', params: PageRequest & { startDate?: string; endDate?: string; department?: string; userName?: string }): Promise<PageResponse<LogRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<LogRecord>>>('/sys15/logs', {
    params: { ...params, logType },
  })
  return (res as ApiResult<PageResponse<LogRecord>>).data ?? (res as unknown as PageResponse<LogRecord>)
}

function LogTab({ logType }: { logType: '결산실시' | '종합' }) {
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<LogRecord>[] = [
    { title: '일시', dataIndex: 'eventAt', width: 160 },
    { title: '사용자', dataIndex: 'userName', width: 100 },
    { title: '부대(서)', dataIndex: 'department', width: 140 },
    { title: '작업유형', dataIndex: 'actionType', width: 120 },
    { title: '상세내용', dataIndex: 'detail', ellipsis: true },
  ]

  return (
    <div>
      <SearchForm
        fields={[
          { name: 'startDate', label: '시작일', type: 'date' as const },
          { name: 'endDate', label: '종료일', type: 'date' as const },
          {
            name: 'department',
            label: '부대(서)',
            type: 'select' as const,
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
          { name: 'userName', label: '인원', type: 'text' as const },
        ]}
        onSearch={(values) => {
          actionRef.current?.setPageInfo?.({ current: 1 })
          actionRef.current?.reload()
          return values
        }}
      />

      <DataTable<LogRecord>
        columns={columns}
        request={(params) => fetchLogs(logType, params)}
        rowKey="id"
        actionRef={actionRef}
        headerTitle={logType === '결산실시' ? '결산실시이력' : '종합이력'}
        toolBarRender={() => [
          <Button key="export" icon={<DownloadOutlined />}>
            엑셀 저장
          </Button>,
        ]}
      />
    </div>
  )
}

export default function LogHistoryPage() {
  return (
    <PageContainer title="이력관리">
      <Tabs
        items={[
          { key: 'settlement', label: '결산실시이력', children: <LogTab logType="결산실시" /> },
          { key: 'total', label: '종합이력', children: <LogTab logType="종합" /> },
        ]}
      />
    </PageContainer>
  )
}
