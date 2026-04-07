import { useState } from 'react'
import { Modal, Button, message, Steps, Form, Input, Tabs } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtApproval } from '@/shared/api/mocks/handlers/sys01-overtime'

const { TextArea } = Input

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  pending: '결재대기',
  approved: '승인',
  rejected: '반려',
}

const APPROVAL_STEPS = [
  { title: '작성', description: '신청자' },
  { title: '결재대기', description: '결재자' },
  { title: '승인완료', description: '최종승인' },
]

function getStepCurrent(status: string): number {
  switch (status) {
    case 'draft': return 0
    case 'pending': return 1
    case 'approved': return 2
    case 'rejected': return 1
    default: return 0
  }
}

async function fetchApprovals(params: PageRequest): Promise<PageResponse<OtApproval>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtApproval>>>('/sys01/approvals', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtApproval>>).data ?? (res as unknown as PageResponse<OtApproval>)
  return data
}

interface ApprovalModalProps {
  record: OtApproval | null
  open: boolean
  onClose: () => void
}

function ApprovalModal({ record, open, onClose }: ApprovalModalProps) {
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const approveMutation = useMutation({
    mutationFn: () => apiClient.put(`/sys01/approvals/${record?.id}/approve`, {}),
    onSuccess: () => {
      message.success('승인 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys01-approvals'] })
      onClose()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiClient.put(`/sys01/approvals/${record?.id}/reject`, { reason }),
    onSuccess: () => {
      message.success('반려 처리되었습니다.')
      setRejectOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys01-approvals'] })
      onClose()
    },
  })

  if (!record) return null

  const current = getStepCurrent(record.approvalStatus)
  const stepItems = APPROVAL_STEPS.map((s, i) => ({
    title: s.title,
    description: s.description,
    status: record.approvalStatus === 'rejected' && i === current
      ? 'error' as const
      : i < current ? 'finish' as const : i === current ? 'process' as const : 'wait' as const,
  }))

  return (
    <Modal title="결재 상세" open={open} onCancel={onClose} footer={null} width={580} destroyOnClose>
      <div style={{ marginBottom: 16 }}>
        <p><strong>신청자:</strong> {record.applicantName}</p>
        <p><strong>부대(서):</strong> {record.applicantUnit}</p>
        <p><strong>신청서 종류:</strong> {record.requestType}</p>
        <p><strong>근무일:</strong> {record.workDate}</p>
        <p><strong>총근무시간:</strong> {record.totalHours}시간</p>
        <p><strong>근무사유:</strong> {record.reason}</p>
        <p><strong>결재상태:</strong> <StatusBadge status={record.approvalStatus} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} /></p>
      </div>
      <div style={{ marginBottom: 24 }}>
        <strong>결재 진행 단계</strong>
        <div style={{ marginTop: 12 }}>
          <Steps current={current} items={stepItems} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" icon={<CheckOutlined />}
          disabled={record.approvalStatus === 'approved'}
          loading={approveMutation.isPending}
          onClick={() => approveMutation.mutate()}
        >승인</Button>
        <Button danger icon={<CloseOutlined />}
          disabled={record.approvalStatus === 'rejected'}
          onClick={() => setRejectOpen(true)}
        >반려</Button>
      </div>
      <Modal
        title="반려 사유 입력"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={() => rejectMutation.mutate(rejectReason)}
        okText="반려" cancelText="취소"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <Form.Item label="반려 사유" required>
          <TextArea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="반려 사유를 입력하세요" />
        </Form.Item>
      </Modal>
    </Modal>
  )
}

export default function OtApprovalPage() {
  const [selected, setSelected] = useState<OtApproval | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const columns: ProColumns<OtApproval>[] = [
    { title: '신청서 종류', dataIndex: 'requestType', width: 100 },
    { title: '근무일', dataIndex: 'workDate', width: 110 },
    { title: '총근무시간(h)', dataIndex: 'totalHours', width: 110 },
    { title: '신청자', dataIndex: 'applicantName', width: 90 },
    { title: '부대(서)', dataIndex: 'applicantUnit', width: 100 },
    { title: '근무사유', dataIndex: 'reason', ellipsis: true },
    {
      title: '결재상태',
      dataIndex: 'approvalStatus',
      width: 100,
      render: (_, r) => <StatusBadge status={r.approvalStatus} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    {
      title: '작업',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Button key="view" type="link" size="small"
          onClick={() => { setSelected(record); setDetailOpen(true) }}
        >상세</Button>,
      ],
    },
  ]

  const tabItems = [
    {
      key: 'pending',
      label: '결재대기',
      children: (
        <DataTable<OtApproval>
          columns={columns}
          request={(params) => fetchApprovals(params)}
          rowKey="id"
          headerTitle="결재대기 목록"
        />
      ),
    },
    {
      key: 'approved',
      label: '결재완료',
      children: (
        <DataTable<OtApproval>
          columns={columns}
          request={(params) => fetchApprovals(params)}
          rowKey="id"
          headerTitle="결재완료 목록"
        />
      ),
    },
  ]

  return (
    <PageContainer title="신청서 결재">
      <Tabs items={tabItems} />
      <ApprovalModal
        record={selected}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelected(null) }}
      />
    </PageContainer>
  )
}
