import { useState, useRef } from 'react'
import { Tabs, Button, Modal, message, Steps, Descriptions, Space, Input } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { CrudFormField } from '@/shared/ui/CrudForm/CrudForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { ApprovalItem, Approver, JobDescStatus } from '@/shared/api/mocks/handlers/sys18'

const { TextArea } = Input

// 결재 상태 맵
const APPROVAL_STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  submitted: 'gold',
  approved_1st: 'blue',
  completed: 'green',
  rejected: 'red',
}

const APPROVAL_STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  submitted: '결재대기',
  approved_1st: '1차완료',
  completed: '결재완료',
  rejected: '반려',
}

// 결재 Steps current 계산
function getApprovalCurrent(status: JobDescStatus): number {
  switch (status) {
    case 'submitted': return 1
    case 'approved_1st': return 2
    case 'completed': return 3
    case 'rejected': return 1
    default: return 0
  }
}

function getStepStatus(status: JobDescStatus, stepIndex: number): 'finish' | 'process' | 'error' | 'wait' {
  if (status === 'rejected' && stepIndex === 1) return 'error'
  const current = getApprovalCurrent(status)
  if (stepIndex < current) return 'finish'
  if (stepIndex === current) return 'process'
  return 'wait'
}

const APPROVAL_STEPS_DEF = [
  { title: '작성' },
  { title: '1차 결재' },
  { title: '2차 결재' },
  { title: '완료' },
]

async function fetchApprovals(params: PageRequest): Promise<PageResponse<ApprovalItem>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<ApprovalItem>>>('/api/sys18/approvals', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<ApprovalItem>>).data ?? (res as unknown as PageResponse<ApprovalItem>)
  return data
}

async function fetchApprovers(params: PageRequest): Promise<PageResponse<Approver>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Approver>>>('/api/sys18/approvers', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<Approver>>).data ?? (res as unknown as PageResponse<Approver>)
  return data
}

const DEPT_OPTIONS = [
  { label: '인사처', value: '인사처' },
  { label: '작전처', value: '작전처' },
  { label: '군수처', value: '군수처' },
  { label: '정보처', value: '정보처' },
  { label: '교육처', value: '교육처' },
  { label: '동원처', value: '동원처' },
]

const USER_OPTIONS = [
  { label: '김부서장 (중령)', value: 'user-a1' },
  { label: '이참모 (대령)', value: 'user-a2' },
  { label: '박대위 (대위)', value: 'user-a3' },
  { label: '최소령 (소령)', value: 'user-a4' },
]

const APPROVER_FORM_FIELDS: CrudFormField[] = [
  { name: 'department', label: '부서', type: 'select', required: true, options: DEPT_OPTIONS },
  { name: 'firstApproverId', label: '1차 결재자', type: 'select', required: true, options: USER_OPTIONS },
  { name: 'secondApproverId', label: '2차 결재자', type: 'select', required: true, options: USER_OPTIONS },
]

// 결재대기 탭
function ApprovalPendingTab() {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [detailRecord, setDetailRecord] = useState<ApprovalItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<ApprovalItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/api/sys18/approvals/${id}/approve`),
    onSuccess: () => {
      message.success('승인되었습니다.')
      setDetailOpen(false)
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys18-approvals'] })
    },
    onError: () => message.error('승인에 실패했습니다.'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.put(`/api/sys18/approvals/${id}/reject`, { rejectReason: reason }),
    onSuccess: () => {
      message.success('반려되었습니다.')
      setRejectModalOpen(false)
      setDetailOpen(false)
      setRejectReason('')
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys18-approvals'] })
    },
    onError: () => message.error('반려에 실패했습니다.'),
  })

  const resubmitMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/api/sys18/approvals/${id}/resubmit`),
    onSuccess: () => {
      message.success('재결재 요청이 완료되었습니다.')
      actionRef.current?.reload()
    },
    onError: () => message.error('재결재 요청에 실패했습니다.'),
  })

  const columns: ProColumns<ApprovalItem>[] = [
    { title: '작성자', dataIndex: 'writerName', width: 100 },
    { title: '부서', dataIndex: 'department', width: 120 },
    { title: '직무기술서 유형', dataIndex: 'jobDescType', width: 120 },
    { title: '제출일', dataIndex: 'submittedAt', width: 110 },
    { title: '결재단계', dataIndex: 'approvalStep', width: 90 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={APPROVAL_STATUS_COLOR_MAP}
          labelMap={APPROVAL_STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '관리',
      valueType: 'option',
      width: 180,
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          onClick={() => { setDetailRecord(record); setDetailOpen(true) }}
        >
          상세
        </Button>,
        record.status === 'rejected' && (
          <Button
            key="resubmit"
            type="link"
            size="small"
            onClick={() => resubmitMutation.mutate(record.id)}
          >
            재결재 요청
          </Button>
        ),
      ].filter(Boolean),
    },
  ]

  const stepItems = APPROVAL_STEPS_DEF.map((s, i) => ({
    ...s,
    status: detailRecord ? getStepStatus(detailRecord.status as JobDescStatus, i) : 'wait' as const,
  }))

  return (
    <>
      <DataTable<ApprovalItem>
        columns={columns}
        request={fetchApprovals}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="결재대기 목록"
        onRow={(record) => ({ onClick: () => { setDetailRecord(record); setDetailOpen(true) } })}
      />

      {/* 상세 Modal */}
      <Modal
        open={detailOpen}
        title="직무기술서 결재"
        onCancel={() => setDetailOpen(false)}
        width={720}
        footer={detailRecord && ['submitted', 'approved_1st'].includes(detailRecord.status) ? [
          <Button
            key="reject"
            danger
            icon={<CloseOutlined />}
            onClick={() => { setRejectTarget(detailRecord); setRejectModalOpen(true) }}
          >
            반려
          </Button>,
          <Button
            key="approve"
            type="primary"
            style={{ background: 'green' }}
            icon={<CheckOutlined />}
            onClick={() => approveMutation.mutate(detailRecord.id)}
            loading={approveMutation.isPending}
          >
            승인
          </Button>,
          <Button key="close" onClick={() => setDetailOpen(false)}>닫기</Button>,
        ] : [
          <Button key="close" onClick={() => setDetailOpen(false)}>닫기</Button>,
        ]}
      >
        {detailRecord && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Steps
              direction="horizontal"
              current={getApprovalCurrent(detailRecord.status as JobDescStatus)}
              items={stepItems}
              style={{ marginBottom: 24 }}
            />
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="작성자">{detailRecord.writerName}</Descriptions.Item>
              <Descriptions.Item label="부서">{detailRecord.department}</Descriptions.Item>
              <Descriptions.Item label="유형">{detailRecord.jobDescType}</Descriptions.Item>
              <Descriptions.Item label="결재단계">{detailRecord.approvalStep}</Descriptions.Item>
              <Descriptions.Item label="제출일">{detailRecord.submittedAt}</Descriptions.Item>
              <Descriptions.Item label="상태">
                <StatusBadge
                  status={detailRecord.status}
                  colorMap={APPROVAL_STATUS_COLOR_MAP}
                  labelMap={APPROVAL_STATUS_LABEL_MAP}
                />
              </Descriptions.Item>
              {detailRecord.rejectReason && (
                <Descriptions.Item label="반려사유" span={2}>{detailRecord.rejectReason}</Descriptions.Item>
              )}
            </Descriptions>
          </Space>
        )}
      </Modal>

      {/* 반려 사유 입력 Modal */}
      <Modal
        open={rejectModalOpen}
        title="반려 사유 입력"
        onCancel={() => { setRejectModalOpen(false); setRejectReason('') }}
        onOk={() => {
          if (!rejectReason.trim()) { message.warning('반려 사유를 입력하세요.'); return }
          if (rejectTarget) rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason })
        }}
        okText="반려"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <TextArea
          rows={4}
          placeholder="반려 사유를 입력하세요"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          maxLength={500}
          showCount
        />
      </Modal>
    </>
  )
}

// 결재자관리 탭
function ApproverMgmtTab() {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [crudOpen, setCrudOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<Approver | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: Partial<Approver>) => apiClient.post('/api/sys18/approvers', data),
    onSuccess: () => {
      message.success('등록되었습니다.')
      setCrudOpen(false)
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys18-approvers'] })
    },
    onError: () => message.error('등록에 실패했습니다.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Approver> }) =>
      apiClient.put(`/api/sys18/approvers/${id}`, data),
    onSuccess: () => {
      message.success('수정되었습니다.')
      setCrudOpen(false)
      setEditRecord(null)
      actionRef.current?.reload()
    },
    onError: () => message.error('수정에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/sys18/approvers/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      actionRef.current?.reload()
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<Approver>[] = [
    { title: '부서', dataIndex: 'department', width: 120 },
    { title: '1차 결재자', dataIndex: 'firstApprover', width: 150 },
    { title: '2차 결재자', dataIndex: 'secondApprover', width: 150 },
    {
      title: '관리',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          onClick={() => { setEditRecord(record); setCrudOpen(true) }}
        >
          수정
        </Button>,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          onClick={() => {
            Modal.confirm({
              title: '삭제 확인',
              content: '결재자 정보를 삭제하시겠습니까?',
              okType: 'danger',
              onOk: () => deleteMutation.mutate(record.id),
            })
          }}
        >
          삭제
        </Button>,
      ],
    },
  ]

  return (
    <>
      <DataTable<Approver>
        columns={columns}
        request={fetchApprovers}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="결재자 관리"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => { setEditRecord(null); setCrudOpen(true) }}
          >
            신규 등록
          </Button>,
        ]}
      />

      <Modal
        open={crudOpen}
        title={editRecord ? '결재자 수정' : '결재자 등록'}
        onCancel={() => { setCrudOpen(false); setEditRecord(null) }}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={APPROVER_FORM_FIELDS}
          initialValues={editRecord ? (editRecord as Record<string, unknown>) : undefined}
          mode={editRecord ? 'edit' : 'create'}
          onFinish={async (values) => {
            if (editRecord) {
              await updateMutation.mutateAsync({ id: editRecord.id, data: values as Partial<Approver> })
            } else {
              await createMutation.mutateAsync(values as Partial<Approver>)
            }
            return true
          }}
        />
      </Modal>
    </>
  )
}

export default function JobDescApprovalPage() {
  const tabItems = [
    {
      key: 'pending',
      label: '결재대기',
      children: <ApprovalPendingTab />,
    },
    {
      key: 'approvers',
      label: '결재자관리',
      children: <ApproverMgmtTab />,
    },
  ]

  return (
    <PageContainer title="결재">
      <Tabs items={tabItems} />
    </PageContainer>
  )
}
