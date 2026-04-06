import { useState } from 'react'
import { Button, message, Modal, Form, Input } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtBulkRequest } from '@/shared/api/mocks/handlers/sys01-overtime'

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

async function fetchBulkApprovals(params: PageRequest): Promise<PageResponse<OtBulkRequest>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtBulkRequest>>>('/api/sys01/bulk-approvals', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtBulkRequest>>).data ?? (res as unknown as PageResponse<OtBulkRequest>)
  return data
}

export default function OtBulkApprovalPage() {
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<OtBulkRequest | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/api/sys01/bulk-approvals/${id}/approve`, {}),
    onSuccess: () => {
      message.success('승인 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys01-bulk-approvals'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.put(`/api/sys01/bulk-approvals/${id}/reject`, { reason }),
    onSuccess: () => {
      message.success('반려 처리되었습니다.')
      setRejectOpen(false)
      setRejectReason('')
      queryClient.invalidateQueries({ queryKey: ['sys01-bulk-approvals'] })
    },
  })

  const columns: ProColumns<OtBulkRequest>[] = [
    { title: '근무일', dataIndex: 'workDate', width: 110 },
    { title: '시작시간', dataIndex: 'startTime', width: 90 },
    { title: '종료시간', dataIndex: 'endTime', width: 90 },
    { title: '총근무시간(h)', dataIndex: 'totalHours', width: 110 },
    { title: '대상인원', dataIndex: 'applicantCount', width: 90 },
    { title: '근무사유', dataIndex: 'reason', ellipsis: true },
    { title: '등록자', dataIndex: 'createdBy', width: 90 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    {
      title: '작업',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <Button
          key="approve"
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          disabled={record.status !== 'pending'}
          loading={approveMutation.isPending}
          onClick={() => approveMutation.mutate(record.id)}
        >
          승인
        </Button>,
        <Button
          key="reject"
          danger
          size="small"
          icon={<CloseOutlined />}
          disabled={record.status !== 'pending'}
          style={{ marginLeft: 4 }}
          onClick={() => { setRejectTarget(record); setRejectOpen(true) }}
        >
          반려
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer title="일괄처리 승인">
      <DataTable<OtBulkRequest>
        columns={columns}
        request={fetchBulkApprovals}
        rowKey="id"
        headerTitle="일괄처리 승인 대기 목록"
      />
      <Modal
        title="반려 사유 입력"
        open={rejectOpen}
        onCancel={() => { setRejectOpen(false); setRejectReason('') }}
        onOk={() => {
          if (rejectTarget) rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason })
        }}
        okText="반려" cancelText="취소"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <Form.Item label="반려 사유" required>
          <TextArea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="반려 사유를 입력하세요" />
        </Form.Item>
      </Modal>
    </PageContainer>
  )
}
