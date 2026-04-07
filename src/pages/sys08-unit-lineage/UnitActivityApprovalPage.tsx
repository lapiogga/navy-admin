import { useState } from 'react'
import { Modal, Button, message, Tabs, Steps, Form, Input } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitActivity } from '@/shared/api/mocks/handlers/sys08-unit-lineage'

const { TextArea } = Input

// 결재 단계 정의: 계보담당 -> 중간결재자 -> 확인관
const APPROVAL_STEPS_DEF = [
  { title: '계보담당', description: '작성 완료' },
  { title: '중간결재자', description: '1차 검토' },
  { title: '확인관', description: '최종 승인' },
]

const APPROVAL_STATUS_COLOR_MAP: Record<string, string> = {
  결재대기: 'orange',
  승인: 'green',
  반려: 'red',
}

// 검색 필드 정의 (R2 규칙)
const searchFields: SearchField[] = [
  { name: 'keyword', label: '활동명', type: 'text', placeholder: '활동명 검색' },
]

function getApprovalCurrentStep(status: string): number {
  switch (status) {
    case '결재대기':
      return 1
    case '승인':
      return 3
    case '반려':
      return 1
    default:
      return 0
  }
}

async function fetchPendingActivities(params: PageRequest & Record<string, unknown>): Promise<PageResponse<UnitActivity>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitActivity>>>('/sys08/activity-approvals', {
    params: { ...params, approvalStatus: '결재대기' },
  })
  return (res as ApiResult<PageResponse<UnitActivity>>).data ?? (res as unknown as PageResponse<UnitActivity>)
}

async function fetchAllActivities(params: PageRequest & Record<string, unknown>): Promise<PageResponse<UnitActivity>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitActivity>>>('/sys08/activity-approvals', {
    params,
  })
  return (res as ApiResult<PageResponse<UnitActivity>>).data ?? (res as unknown as PageResponse<UnitActivity>)
}

interface ApprovalDetailModalProps {
  activity: UnitActivity | null
  open: boolean
  onClose: () => void
}

function ApprovalDetailModal({ activity, open, onClose }: ApprovalDetailModalProps) {
  const queryClient = useQueryClient()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!activity) return
      return apiClient.put(`/sys08/activity-approvals/${activity.id}/approve`, {})
    },
    onSuccess: () => {
      message.success('승인 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08', 'activity-approvals'] })
      onClose()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!activity) return
      return apiClient.put(`/sys08/activity-approvals/${activity.id}/reject`, { reason })
    },
    onSuccess: () => {
      message.success('반려 처리되었습니다.')
      setRejectModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys08', 'activity-approvals'] })
      onClose()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  if (!activity) return null

  const currentStep = getApprovalCurrentStep(activity.approvalStatus)
  const stepItems = APPROVAL_STEPS_DEF.map((step, index) => {
    let status: 'finish' | 'process' | 'wait' | 'error' = 'wait'
    if (activity.approvalStatus === '반려' && index === 1) {
      status = 'error'
    } else if (index < currentStep) {
      status = 'finish'
    } else if (index === currentStep - 1 || (activity.approvalStatus === '승인' && index === 2)) {
      status = 'finish'
    } else if (index === currentStep && activity.approvalStatus === '결재대기') {
      status = 'process'
    }
    return { title: step.title, description: step.description, status }
  })

  return (
    <Modal
      title="주요활동 결재 상세"
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <strong>활동명:</strong> {activity.activityName}
        <br />
        <strong>연혁부호:</strong> {activity.historySymbol || '-'}
        <br />
        <strong>카테고리:</strong> {activity.category}
        <br />
        <strong>일시:</strong> {activity.activityDate}
        <br />
        <strong>비밀여부:</strong> {activity.isSecret ? activity.secretGrade : '일반'}
        <br />
        <strong>결재상태:</strong>{' '}
        <StatusBadge status={activity.approvalStatus} colorMap={APPROVAL_STATUS_COLOR_MAP} />
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
          disabled={activity.approvalStatus === '승인'}
        >
          승인
        </Button>
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={() => setRejectModalOpen(true)}
          disabled={activity.approvalStatus === '반려'}
        >
          반려
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

export default function UnitActivityApprovalPage() {
  const [selectedActivity, setSelectedActivity] = useState<UnitActivity | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const handleSearch = (values: Record<string, unknown>) => {
    setSearchParams(values)
  }

  const handleSearchReset = () => {
    setSearchParams({})
  }

  const pendingColumns: ProColumns<UnitActivity>[] = [
    {
      title: '활동명',
      dataIndex: 'activityName',
      width: 200,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedActivity(record)
            setDetailOpen(true)
          }}
          style={{ padding: 0 }}
        >
          {text as string}
        </Button>
      ),
    },
    { title: '연혁부호', dataIndex: 'historySymbol', width: 100 },
    { title: '카테고리', dataIndex: 'category', width: 110 },
    { title: '일시', dataIndex: 'activityDate', width: 120 },
    {
      title: '결재상태',
      dataIndex: 'approvalStatus',
      width: 100,
      render: (_, record) => (
        <StatusBadge status={record.approvalStatus} colorMap={APPROVAL_STATUS_COLOR_MAP} />
      ),
    },
  ]

  const tabItems = [
    {
      key: '1',
      label: '결재대기',
      children: (
        <DataTable<UnitActivity>
          request={(params) => fetchPendingActivities({ ...params, ...searchParams })}
          columns={pendingColumns}
          rowKey="id"
        />
      ),
    },
    {
      key: '2',
      label: '전체 결재',
      children: (
        <DataTable<UnitActivity>
          request={(params) => fetchAllActivities({ ...params, ...searchParams })}
          columns={pendingColumns}
          rowKey="id"
        />
      ),
    },
  ]

  return (
    <PageContainer title="주요활동 결재">
      {/* 검색영역 (R2 규칙) */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleSearchReset} />

      <Tabs items={tabItems} />

      <ApprovalDetailModal
        activity={selectedActivity}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedActivity(null)
        }}
      />
    </PageContainer>
  )
}
