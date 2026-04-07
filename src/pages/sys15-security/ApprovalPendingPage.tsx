import { useState, useRef } from 'react'
import { Modal, Button, Steps, Form, Input, message } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { ApprovalRecord } from '@/shared/api/mocks/handlers/sys15-security'

const { TextArea } = Input

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

const APPROVAL_STEPS = [
  { title: '작성', description: '제출자' },
  { title: '결재대기', description: '결재자' },
  { title: '승인완료', description: '최종승인' },
]

function getStepCurrent(status: string): number {
  switch (status) {
    case 'submitted': return 1
    case 'approved': return 2
    case 'rejected': return 1
    default: return 0
  }
}

async function fetchPendingApprovals(params: PageRequest): Promise<PageResponse<ApprovalRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<ApprovalRecord>>>('/sys15/approvals/pending', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<ApprovalRecord>>).data ?? (res as unknown as PageResponse<ApprovalRecord>)
  return data
}

interface ApprovalDetailModalProps {
  record: ApprovalRecord | null
  open: boolean
  onClose: () => void
}

function ApprovalDetailModal({ record, open, onClose }: ApprovalDetailModalProps) {
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const approveMutation = useMutation({
    mutationFn: () => apiClient.put(`/sys15/approvals/${record?.id}/approve`, {}),
    onSuccess: () => {
      message.success('승인 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-approvals-pending'] })
      onClose()
    },
    onError: () => message.error('승인 처리에 실패했습니다.'),
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) =>
      apiClient.put(`/sys15/approvals/${record?.id}/reject`, { reason }),
    onSuccess: () => {
      message.success('반려 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-approvals-pending'] })
      setRejectOpen(false)
      setRejectReason('')
      onClose()
    },
    onError: () => message.error('반려 처리에 실패했습니다.'),
  })

  if (!record) return null

  const current = getStepCurrent(record.status)
  const stepItems = APPROVAL_STEPS.map((s, i) => ({
    title: s.title,
    description: s.description,
    status:
      record.status === 'rejected' && i === current
        ? ('error' as const)
        : i < current
          ? ('finish' as const)
          : i === current
            ? ('process' as const)
            : ('wait' as const),
  }))

  return (
    <Modal
      title="결재 상세"
      open={open}
      onCancel={onClose}
      footer={null}
      width={580}
      destroyOnClose
    >
      <Steps items={stepItems} style={{ marginBottom: 24 }} />

      <div style={{ marginBottom: 16 }}>
        <p><strong>문서유형:</strong> {record.docType}</p>
        <p><strong>제목:</strong> {record.title}</p>
        <p><strong>제출자:</strong> {record.submitter}</p>
        <p><strong>부대(서):</strong> {record.department}</p>
        <p><strong>제출일:</strong> {record.submittedAt}</p>
        <p>
          <strong>상태:</strong>{' '}
          <StatusBadge
            status={record.status}
            colorMap={STATUS_COLOR_MAP}
            labelMap={STATUS_LABEL_MAP}
          />
        </p>
        {record.rejectReason && (
          <p style={{ color: '#ff4d4f' }}><strong>반려사유:</strong> {record.rejectReason}</p>
        )}
      </div>

      {record.status === 'submitted' && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => approveMutation.mutate()}
            loading={approveMutation.isPending}
          >
            승인
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => setRejectOpen(true)}
          >
            반려
          </Button>
        </div>
      )}

      <Modal
        title="반려 사유 입력"
        open={rejectOpen}
        onOk={() => {
          if (!rejectReason.trim()) {
            message.warning('반려 사유를 입력하세요.')
            return
          }
          rejectMutation.mutate(rejectReason)
        }}
        onCancel={() => { setRejectReason(''); setRejectOpen(false) }}
        confirmLoading={rejectMutation.isPending}
        okText="반려"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="반려 사유" required>
            <TextArea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력하세요 (필수)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  )
}

export default function ApprovalPendingPage() {
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRecord | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<ApprovalRecord>[] = [
    { title: '문서유형', dataIndex: 'docType', width: 120 },
    { title: '제목', dataIndex: 'title' },
    { title: '제출자', dataIndex: 'submitter', width: 100 },
    { title: '부대(서)', dataIndex: 'department', width: 120 },
    { title: '제출일', dataIndex: 'submittedAt', width: 120 },
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
      title: '작업',
      valueType: 'option',
      width: 100,
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          onClick={() => {
            setSelectedRecord(record)
            setDetailOpen(true)
          }}
        >
          상세
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer title="결재대기">
      <DataTable<ApprovalRecord>
        actionRef={actionRef}
        queryKey={['sys15-approvals-pending']}
        fetchFn={fetchPendingApprovals}
        columns={columns}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRecord(record)
            setDetailOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />
      <ApprovalDetailModal
        record={selectedRecord}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); actionRef.current?.reload() }}
      />
    </PageContainer>
  )
}
