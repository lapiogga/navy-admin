import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse } from '@/shared/api/types'

// ===== 타입 =====
interface ErrorLog extends Record<string, unknown> {
  id: string
  errorCode: string
  errorMessage: string
  errorLevel: string
  occurredAt: string
  resolvedAt: string | null
}

// ===== API =====
const errorLogApi = {
  list: (params: PageRequest): Promise<PageResponse<ErrorLog>> =>
    apiClient.get('/common/error-logs', { params }) as Promise<PageResponse<ErrorLog>>,
}

// ===== 컴포넌트 =====
export function ErrorLogPage() {
  const columns: ProColumns<ErrorLog>[] = [
    { title: '오류 코드', dataIndex: 'errorCode', key: 'errorCode', width: 160 },
    { title: '오류 메시지', dataIndex: 'errorMessage', key: 'errorMessage', ellipsis: true },
    { title: '심각도', dataIndex: 'errorLevel', key: 'errorLevel', width: 90 },
    {
      title: '발생 시간',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      width: 170,
      render: (_, record) =>
        record.occurredAt ? new Date(record.occurredAt as string).toLocaleString('ko-KR') : '-',
    },
    {
      title: '해결 시간',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      width: 170,
      render: (_, record) =>
        record.resolvedAt ? new Date(record.resolvedAt as string).toLocaleString('ko-KR') : '미해결',
    },
  ]

  return (
    <DataTable<ErrorLog>
      columns={columns}
      request={(params) => errorLogApi.list(params)}
      rowKey="id"
      headerTitle="장애 로그"
    />
  )
}
