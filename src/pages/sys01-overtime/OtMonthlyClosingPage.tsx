import { useState, useRef } from 'react'
import { Button, message, Input, DatePicker, Form, Space, Tag } from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
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

async function fetchMonthlyClosings(params: PageRequest): Promise<PageResponse<OtMonthlyClosing>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtMonthlyClosing>>>('/sys01/monthly-closing', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtMonthlyClosing>>).data ?? (res as unknown as PageResponse<OtMonthlyClosing>)
  return data
}

function isDeadlinePassed(deadline?: string): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

export default function OtMonthlyClosingPage() {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [cancelReasonOpen, setCancelReasonOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<OtMonthlyClosing | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [deadlineEditOpen, setDeadlineEditOpen] = useState(false)

  const closeMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/sys01/monthly-closing/${id}/close`, {}),
    onSuccess: () => {
      message.success('마감 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys01-monthly-closing'] })
      actionRef.current?.reload()
    },
  })

  const cancelCloseMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.put(`/sys01/monthly-closing/${id}/cancel-close`, { reason }),
    onSuccess: () => {
      message.success('마감 취소되었습니다.')
      setCancelReasonOpen(false)
      setCancelReason('')
      queryClient.invalidateQueries({ queryKey: ['sys01-monthly-closing'] })
      actionRef.current?.reload()
    },
  })

  const handleClose = (record: OtMonthlyClosing) => {
    showConfirmDialog({
      title: '마감 처리',
      content: '마감 처리하면 수정 불가합니다. 마감하시겠습니까?',
      danger: true,
      onConfirm: () => closeMutation.mutate(record.id),
    })
  }

  const handleCancelClose = (record: OtMonthlyClosing) => {
    setCancelTarget(record)
    setCancelReasonOpen(true)
  }

  const columns: ProColumns<OtMonthlyClosing>[] = [
    { title: '연도', dataIndex: 'year', width: 80 },
    { title: '월', dataIndex: 'month', width: 60, render: (_, r) => `${r.month}월` },
    {
      title: '마감기한',
      dataIndex: 'deadline',
      width: 110,
      render: (_, r) => r.deadline ? (
        <Tag color={isDeadlinePassed(r.deadline) ? 'red' : 'default'}>{r.deadline}</Tag>
      ) : '-',
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '총초과근무(h)', dataIndex: 'totalOtHours', width: 120 },
    { title: '대상인원', dataIndex: 'applicantCount', width: 90 },
    { title: '마감일시', dataIndex: 'closedAt', width: 110, render: (v) => v ?? '-' },
    { title: '비고', dataIndex: 'remarks', ellipsis: true },
    {
      title: '작업',
      valueType: 'option',
      width: 160,
      render: (_, record) => {
        const isDraft = record.status === 'draft'
        const isClosed = record.status === 'closed'
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<LockOutlined />}
              disabled={!isDraft}
              loading={closeMutation.isPending}
              onClick={() => handleClose(record)}
            >
              마감
            </Button>
            <Button
              danger
              size="small"
              icon={<UnlockOutlined />}
              disabled={!isClosed}
              onClick={() => handleCancelClose(record)}
            >
              마감취소
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <PageContainer title="월말결산">
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Button onClick={() => setDeadlineEditOpen(true)}>마감기한 설정 (관리자)</Button>
      </div>
      <DataTable<OtMonthlyClosing>
        columns={columns}
        request={fetchMonthlyClosings}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="월말결산 목록"
      />

      {/* 마감취소 사유 Modal */}
      <div>
        {cancelReasonOpen && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.45)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400 }}>
              <h3 style={{ marginBottom: 16 }}>마감취소 사유 입력</h3>
              <Form.Item label="마감취소 사유" required>
                <Input.TextArea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={4}
                  placeholder="마감취소 사유를 입력하세요"
                />
              </Form.Item>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button onClick={() => { setCancelReasonOpen(false); setCancelReason('') }}>취소</Button>
                <Button
                  danger
                  loading={cancelCloseMutation.isPending}
                  onClick={() => {
                    if (cancelTarget) cancelCloseMutation.mutate({ id: cancelTarget.id, reason: cancelReason })
                  }}
                >
                  마감취소
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 마감기한 설정 Modal */}
      {deadlineEditOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.45)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 360 }}>
            <h3 style={{ marginBottom: 16 }}>마감기한 설정 (체계관리자)</h3>
            <Form.Item label="마감기한">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button onClick={() => setDeadlineEditOpen(false)}>취소</Button>
              <Button type="primary" onClick={() => { message.success('마감기한이 설정되었습니다.'); setDeadlineEditOpen(false) }}>저장</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
