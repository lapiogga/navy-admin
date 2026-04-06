import { useState } from 'react'
import { Modal, Button, message, Select, Tabs, Steps, Form, Input } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { InspectionTask } from '@/shared/api/mocks/handlers/sys17'

const { TextArea } = Input

const INSP_FIELD_OPTIONS = [
  { label: '전투준비태세', value: '전투준비태세' },
  { label: '교육훈련', value: '교육훈련' },
  { label: '군수', value: '군수' },
  { label: '인사', value: '인사' },
  { label: '정보화', value: '정보화' },
]

const UNIT_OPTIONS = [
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '교육훈련단', value: '교육훈련단' },
  { label: '상륙기동단', value: '상륙기동단' },
]

const APPROVAL_STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'orange',
  inReview: 'blue',
  approved: 'green',
  rejected: 'red',
}

const APPROVAL_STATUS_LABEL_MAP: Record<string, string> = {
  pending: '접수대기',
  inReview: '검토중',
  approved: '접수완료',
  rejected: '반송',
}

// 결재 단계 정의
const APPROVAL_STEPS_DEF = [
  { title: '조치결과 보고', description: '담당자' },
  { title: '중간 결재', description: '결재자' },
  { title: '최종 접수', description: '승인권자' },
]

function getApprovalCurrentStep(status: string): number {
  switch (status) {
    case 'pending':
      return 0
    case 'inReview':
      return 1
    case 'approved':
      return 2
    case 'rejected':
      return 1
    default:
      return 0
  }
}

async function fetchPendingTasks(params: PageRequest): Promise<PageResponse<InspectionTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InspectionTask>>>('/sys17/approval/pending', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<InspectionTask>>).data ?? (res as unknown as PageResponse<InspectionTask>)
  return data
}

async function fetchApprovedTasks(params: PageRequest): Promise<PageResponse<InspectionTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InspectionTask>>>('/sys17/tasks', {
    params: { page: params.page, size: params.size, approvalStatus: 'approved' },
  })
  const data = (res as ApiResult<PageResponse<InspectionTask>>).data ?? (res as unknown as PageResponse<InspectionTask>)
  return data
}

interface ApprovalDetailModalProps {
  task: InspectionTask | null
  open: boolean
  onClose: () => void
}

function ApprovalDetailModal({ task, open, onClose }: ApprovalDetailModalProps) {
  const queryClient = useQueryClient()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const { data: approvalLine } = useQuery({
    queryKey: ['sys17', 'approval', task?.id, 'line'],
    queryFn: async () => {
      if (!task) return []
      const res = await apiClient.get<ApiResult<Array<{ step: number; title: string; description: string; status: string; assignee: string }>>>(
        `/sys17/approval/${task.id}/line`,
      )
      const data = (res as ApiResult<typeof res>).data ?? res
      return data as Array<{ step: number; title: string; description: string; status: string; assignee: string }>
    },
    enabled: !!task,
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!task) return
      return apiClient.put(`/sys17/approval/${task.id}/approve`, {})
    },
    onSuccess: () => {
      message.success('접수(승인) 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys17', 'approval'] })
      queryClient.invalidateQueries({ queryKey: ['sys17', 'tasks'] })
      onClose()
    },
    onError: () => {
      message.error('처리에 실패했습니다.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!task) return
      return apiClient.put(`/sys17/approval/${task.id}/reject`, { reason })
    },
    onSuccess: () => {
      message.success('반송(반려) 처리되었습니다.')
      setRejectModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'approval'] })
      queryClient.invalidateQueries({ queryKey: ['sys17', 'tasks'] })
      onClose()
    },
    onError: () => {
      message.error('처리에 실패했습니다.')
    },
  })

  if (!task) return null

  const currentStep = getApprovalCurrentStep(task.approvalStatus)
  const stepItems = APPROVAL_STEPS_DEF.map((step, index) => {
    const lineInfo = approvalLine?.find((l) => l.step === index)
    let status: 'finish' | 'process' | 'wait' | 'error' = 'wait'
    if (task.approvalStatus === 'rejected' && index === currentStep) {
      status = 'error'
    } else if (index < currentStep) {
      status = 'finish'
    } else if (index === currentStep) {
      status = 'process'
    }
    return {
      title: step.title,
      description: lineInfo ? `${step.description}: ${lineInfo.assignee}` : step.description,
      status,
    }
  })

  return (
    <Modal
      title="결재 상세"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <strong>과제번호:</strong> {task.taskNo}
        <br />
        <strong>과제명:</strong> {task.taskName}
        <br />
        <strong>대상부대:</strong> {task.targetUnit}
        <br />
        <strong>검열분야:</strong> {task.inspField}
        <br />
        <strong>보고일:</strong> {task.submittedAt || '-'}
        <br />
        <strong>결재상태:</strong>{' '}
        <StatusBadge
          status={task.approvalStatus}
          colorMap={APPROVAL_STATUS_COLOR_MAP}
          labelMap={APPROVAL_STATUS_LABEL_MAP}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <strong>결재 진행 단계</strong>
        <div style={{ marginTop: 12 }}>
          <Steps current={currentStep} items={stepItems} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => approveMutation.mutate()}
          loading={approveMutation.isPending}
          disabled={task.approvalStatus === 'approved'}
        >
          접수 (승인)
        </Button>
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={() => setRejectModalOpen(true)}
          disabled={task.approvalStatus === 'rejected'}
        >
          반송 (반려)
        </Button>
      </div>

      <Modal
        title="반려 사유 입력"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={() => rejectMutation.mutate(rejectReason)}
        okText="반려"
        cancelText="취소"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <Form.Item label="반려 사유" required>
          <TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="반려 사유를 입력하세요"
          />
        </Form.Item>
      </Modal>
    </Modal>
  )
}

export default function InspectionApprovalPage() {
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const pendingColumns: ProColumns<InspectionTask>[] = [
    {
      title: '과제번호',
      dataIndex: 'taskNo',
      width: 100,
    },
    {
      title: '과제명',
      dataIndex: 'taskName',
      width: 200,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedTask(record)
            setDetailOpen(true)
          }}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '대상부대',
      dataIndex: 'targetUnit',
      width: 120,
    },
    {
      title: '검열분야',
      dataIndex: 'inspField',
      width: 100,
    },
    {
      title: '보고일',
      dataIndex: 'submittedAt',
      width: 120,
    },
    {
      title: '결재상태',
      dataIndex: 'approvalStatus',
      width: 120,
      render: (_, record) => (
        <StatusBadge
          status={record.approvalStatus}
          colorMap={APPROVAL_STATUS_COLOR_MAP}
          labelMap={APPROVAL_STATUS_LABEL_MAP}
        />
      ),
    },
  ]

  const searchFields = [
    {
      name: 'inspYear',
      label: '연도',
      render: () => <Select options={[]} placeholder="연도 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'targetUnit',
      label: '대상부대',
      render: () => <Select options={UNIT_OPTIONS} placeholder="부대 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'inspField',
      label: '검열분야',
      render: () => <Select options={INSP_FIELD_OPTIONS} placeholder="분야 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'actionUnit',
      label: '조치부대',
      render: () => <Select options={UNIT_OPTIONS} placeholder="부대 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'taskName',
      label: '과제명',
      type: 'text' as const,
    },
  ]

  const tabItems = [
    {
      key: '1',
      label: '접수대기',
      children: (
        <DataTable<InspectionTask>
          queryKey={['sys17', 'approval', 'pending']}
          requestFn={fetchPendingTasks}
          columns={pendingColumns}
          rowKey="id"
          searchFields={searchFields}
        />
      ),
    },
    {
      key: '2',
      label: '접수완료',
      children: (
        <DataTable<InspectionTask>
          queryKey={['sys17', 'approval', 'approved']}
          requestFn={fetchApprovedTasks}
          columns={pendingColumns}
          rowKey="id"
        />
      ),
    },
  ]

  return (
    <PageContainer title="결재">
      <Tabs items={tabItems} />

      <ApprovalDetailModal
        task={selectedTask}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedTask(null)
        }}
      />
    </PageContainer>
  )
}
