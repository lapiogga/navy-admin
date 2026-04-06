import { useState } from 'react'
import { Tabs, Form, Input, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface ApprovalHistoryItem extends Record<string, unknown> {
  id: string
  requestedPost: string
  reason: string
  status: string
  createdAt: string
  approvedAt?: string
}

const STATUS_COLOR_MAP: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP: Record<string, string> = { pending: '결재대기', approved: '승인', rejected: '반려' }

const historyData: ApprovalHistoryItem[] = [
  { id: '1', requestedPost: '제2당직실', reason: '근무지 변경 요청', status: 'approved', createdAt: '2026-03-01', approvedAt: '2026-03-05' },
  { id: '2', requestedPost: '본부 당직실', reason: '이동 편의', status: 'pending', createdAt: '2026-04-01' },
]

async function fetchHistory(params: PageRequest): Promise<PageResponse<ApprovalHistoryItem>> {
  const start = params.page * params.size
  const content = historyData.slice(start, start + params.size)
  return {
    content,
    totalElements: historyData.length,
    totalPages: Math.ceil(historyData.length / params.size),
    size: params.size,
    number: params.page,
  }
}

// 당직개소 신청 탭
function DutyPostRequestTab() {
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      message.success(`당직개소 신청이 등록되었습니다. 사유: ${values.reason}`)
      form.resetFields()
    } catch {
      // 검증 실패
    }
  }

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
      <Form.Item name="reason" label="사유" rules={[{ required: true, message: '사유를 입력하세요' }]}>
        <Input.TextArea rows={4} placeholder="당직개소 변경 사유를 입력하세요" />
      </Form.Item>
      <Form.Item name="evidence" label="근거 첨부">
        <Upload
          beforeUpload={() => false}
          maxCount={3}
        >
          <Button icon={<UploadOutlined />}>파일 첨부</Button>
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSubmit}>
          신청
        </Button>
      </Form.Item>
    </Form>
  )
}

// 결재현황 탭
function ApprovalStatusTab() {
  const columns: ProColumns<ApprovalHistoryItem>[] = [
    { title: '신청 당직개소', dataIndex: 'requestedPost', width: 140 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '신청일', dataIndex: 'createdAt', width: 110 },
    { title: '결재일', dataIndex: 'approvedAt', width: 110 },
  ]

  return (
    <DataTable<ApprovalHistoryItem>
      columns={columns}
      request={fetchHistory}
      rowKey="id"
      headerTitle="결재현황"
    />
  )
}

export default function OtPersonalDutyPage() {
  const tabItems = [
    { key: 'request', label: '당직개소 신청', children: <DutyPostRequestTab /> },
    { key: 'status', label: '결재현황', children: <ApprovalStatusTab /> },
  ]

  return (
    <PageContainer title="개인별 당직개소 설정">
      <Tabs defaultActiveKey="request" items={tabItems} />
    </PageContainer>
  )
}
