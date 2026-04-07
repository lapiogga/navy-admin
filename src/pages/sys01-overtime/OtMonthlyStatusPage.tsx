import { useState } from 'react'
import { Modal, Button, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtMonthlyClosing } from '@/shared/api/mocks/handlers/sys01-overtime'

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'orange',
  closed: 'green',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  closed: '마감완료',
}

async function fetchMonthlyStatus(params: PageRequest): Promise<PageResponse<OtMonthlyClosing>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtMonthlyClosing>>>('/sys01/monthly-status', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtMonthlyClosing>>).data ?? (res as unknown as PageResponse<OtMonthlyClosing>)
  return data
}

export default function OtMonthlyStatusPage() {
  const [detailRecord, setDetailRecord] = useState<OtMonthlyClosing | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const columns: ProColumns<OtMonthlyClosing>[] = [
    { title: '연도', dataIndex: 'year', width: 80 },
    { title: '월', dataIndex: 'month', width: 60, render: (_, r) => `${r.month}월` },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '총초과근무(h)', dataIndex: 'totalOtHours', width: 130 },
    { title: '대상인원', dataIndex: 'applicantCount', width: 90 },
    { title: '마감기한', dataIndex: 'deadline', width: 110, render: (v) => v ?? '-' },
    { title: '마감일시', dataIndex: 'closedAt', width: 110, render: (v) => v ?? '-' },
    {
      title: '작업',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Button key="view" type="link" size="small"
          onClick={() => { setDetailRecord(record); setDetailOpen(true) }}
        >상세</Button>,
      ],
    },
  ]

  return (
    <PageContainer title="월말결산 현황">
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Button icon={<DownloadOutlined />} onClick={() => void message.success('엑셀 저장이 완료되었습니다.')}>
          엑셀저장
        </Button>
      </div>
      <DataTable<OtMonthlyClosing>
        columns={columns}
        request={fetchMonthlyStatus}
        rowKey="id"
        headerTitle="월말결산 현황 조회"
      />

      <Modal
        title="월말결산 상세"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setDetailRecord(null) }}
        footer={[<Button key="close" onClick={() => { setDetailOpen(false); setDetailRecord(null) }}>닫기</Button>]}
        width={480}
      >
        {detailRecord && (
          <div>
            <p><strong>연도:</strong> {detailRecord.year}년</p>
            <p><strong>월:</strong> {detailRecord.month}월</p>
            <p><strong>상태:</strong> <StatusBadge status={detailRecord.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} /></p>
            <p><strong>총초과근무시간:</strong> {detailRecord.totalOtHours}시간</p>
            <p><strong>대상인원:</strong> {detailRecord.applicantCount}명</p>
            <p><strong>마감기한:</strong> {detailRecord.deadline ?? '-'}</p>
            <p><strong>마감일시:</strong> {detailRecord.closedAt ?? '-'}</p>
            <p><strong>비고:</strong> {detailRecord.remarks || '-'}</p>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
