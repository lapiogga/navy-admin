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
  { id: '3', requestedPost: '지휘통제실', reason: '보직 변경에 따른 이동 요청', status: 'approved', createdAt: '2026-02-15', approvedAt: '2026-02-20' },
  { id: '4', requestedPost: '제1당직실', reason: '건강상 사유', status: 'rejected', createdAt: '2026-01-20' },
  { id: '5', requestedPost: '통신당직실', reason: '부대 이전으로 인한 변경', status: 'approved', createdAt: '2026-01-10', approvedAt: '2026-01-15' },
  { id: '6', requestedPost: '제3당직실', reason: '교대 일정 조정', status: 'pending', createdAt: '2026-04-03' },
  { id: '7', requestedPost: '함정당직실', reason: '업무 효율화 목적', status: 'approved', createdAt: '2025-12-20', approvedAt: '2025-12-28' },
  { id: '8', requestedPost: '본부 당직실', reason: '전문성 강화를 위한 이동', status: 'rejected', createdAt: '2025-12-05' },
  { id: '9', requestedPost: '제2당직실', reason: '거리 이유로 이동 희망', status: 'approved', createdAt: '2025-11-15', approvedAt: '2025-11-22' },
  { id: '10', requestedPost: '지휘통제실', reason: '부대 개편에 따른 재배치', status: 'pending', createdAt: '2026-04-05' },
  { id: '11', requestedPost: '제1당직실', reason: '교육 파견 복귀 후 원복', status: 'approved', createdAt: '2025-11-01', approvedAt: '2025-11-08' },
  { id: '12', requestedPost: '통신당직실', reason: '통신 전문 인력 배치', status: 'approved', createdAt: '2025-10-20', approvedAt: '2025-10-25' },
  { id: '13', requestedPost: '제3당직실', reason: '인사 발령에 따른 이동', status: 'rejected', createdAt: '2025-10-10' },
  { id: '14', requestedPost: '함정당직실', reason: '함정 근무 경험 축적', status: 'pending', createdAt: '2026-03-28' },
  { id: '15', requestedPost: '본부 당직실', reason: '조직 재편에 따른 재배치', status: 'approved', createdAt: '2025-09-15', approvedAt: '2025-09-22' },
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
