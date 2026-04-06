import { useState } from 'react'
import { Button } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable, DetailModal } from '@/shared/ui'
import type { DetailField } from '@/shared/ui'
import { downloadCsv } from '@/shared/lib/csv'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse } from '@/shared/api/types'

// ===== 타입 =====
interface AccessLog extends Record<string, unknown> {
  id: string
  userId: string
  userName: string
  loginTime: string
  logoutTime: string
  ipAddress: string
  userAgent: string
  subsystemCode: string
}

// ===== API =====
const accessLogApi = {
  list: (params: PageRequest): Promise<PageResponse<AccessLog>> =>
    apiClient.get('/common/access-logs', { params }) as Promise<PageResponse<AccessLog>>,
}

// ===== 상세 필드 =====
const detailFields: DetailField[] = [
  { key: 'userName', label: '사용자명' },
  { key: 'userId', label: '사용자 ID' },
  { key: 'loginTime', label: '접속 시간' },
  { key: 'logoutTime', label: '종료 시간' },
  { key: 'ipAddress', label: 'IP 주소' },
  { key: 'userAgent', label: 'User Agent' },
  { key: 'subsystemCode', label: '접속 체계' },
]

// ===== 컴포넌트 =====
export function AccessLogPage() {
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null)
  const [tableData, setTableData] = useState<AccessLog[]>([])

  const columns: ProColumns<AccessLog>[] = [
    { title: '사용자명', dataIndex: 'userName', key: 'userName', width: 120 },
    {
      title: '접속 시간',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 170,
      render: (_, record) => new Date(record.loginTime as string).toLocaleString('ko-KR'),
    },
    {
      title: '종료 시간',
      dataIndex: 'logoutTime',
      key: 'logoutTime',
      width: 170,
      render: (_, record) => new Date(record.logoutTime as string).toLocaleString('ko-KR'),
    },
    { title: 'IP 주소', dataIndex: 'ipAddress', key: 'ipAddress', width: 130 },
    { title: '접속 체계', dataIndex: 'subsystemCode', key: 'subsystemCode', width: 100 },
  ]

  const handleCsvDownload = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    downloadCsv(`접속로그_${today}.csv`, tableData, [
      { key: 'userName', label: '사용자명' },
      { key: 'loginTime', label: '접속시간' },
      { key: 'logoutTime', label: '종료시간' },
      { key: 'ipAddress', label: 'IP주소' },
      { key: 'subsystemCode', label: '접속체계' },
    ])
  }

  return (
    <div>
      <DataTable<AccessLog>
        columns={columns}
        request={async (params) => {
          const res = await accessLogApi.list(params)
          setTableData(res.content)
          return res
        }}
        rowKey="id"
        headerTitle="접속 로그"
        toolBarRender={() => [
          <Button key="csv" onClick={handleCsvDownload}>
            저장(CSV)
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => {
            setDetailData(record as unknown as Record<string, unknown>)
            setDetailOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />
      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="접속 로그 상세"
        data={detailData}
        fields={detailFields}
        width={600}
      />
    </div>
  )
}
