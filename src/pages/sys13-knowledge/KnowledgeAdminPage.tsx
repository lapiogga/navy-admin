import { useRef, useState } from 'react'
import { Button, Modal, Input, message, Tag, Popconfirm } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageResponse, ApiResult } from '@/shared/api/types'
import type { Knowledge, KnowledgeStatus } from '@/shared/api/mocks/handlers/sys13'

const STATUS_COLOR_MAP: Record<KnowledgeStatus, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  hidden: 'default',
}

const STATUS_LABEL_MAP: Record<KnowledgeStatus, string> = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
  hidden: '숨김',
}

const CATEGORY_COLOR: Record<string, string> = {
  업무지식: 'blue',
  기술지식: 'green',
  행정지식: 'orange',
  법규지식: 'red',
  기타: 'default',
}

export default function KnowledgeAdminPage() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<Knowledge | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchAllKnowledge = async (params: { page: number; size: number }): Promise<PageResponse<Knowledge>> => {
    const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
    const res = await fetch(`/api/sys13/knowledge?${query}`)
    const json: ApiResult<PageResponse<Knowledge>> = await res.json()
    if (!json.success) throw new Error('지식 목록 조회 실패')
    return json.data
  }

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: KnowledgeStatus }) => {
      const res = await fetch(`/api/sys13/knowledge/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json: ApiResult<Knowledge> = await res.json()
      if (!json.success) throw new Error('상태 변경 실패')
      return json.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
      actionRef.current?.reload()
    },
    onError: () => {
      void message.error('상태 변경에 실패했습니다')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys13/knowledge/${id}`, { method: 'DELETE' })
      const json: ApiResult<null> = await res.json()
      if (!json.success) throw new Error('삭제 실패')
    },
    onSuccess: () => {
      void message.success('지식이 삭제되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
      actionRef.current?.reload()
    },
    onError: () => {
      void message.error('삭제에 실패했습니다')
    },
  })

  const handleApprove = (record: Knowledge) => {
    statusMutation.mutate(
      { id: record.id, status: 'approved' },
      { onSuccess: () => void message.success('승인되었습니다') },
    )
  }

  const handleRejectOpen = (record: Knowledge) => {
    setRejectTarget(record)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = () => {
    if (!rejectTarget) return
    statusMutation.mutate(
      { id: rejectTarget.id, status: 'rejected' },
      {
        onSuccess: () => {
          void message.success('반려되었습니다')
          setRejectModalOpen(false)
          setRejectTarget(null)
        },
      },
    )
  }

  const handleHide = (record: Knowledge) => {
    statusMutation.mutate(
      { id: record.id, status: 'hidden' },
      { onSuccess: () => void message.success('숨김 처리되었습니다') },
    )
  }

  const columns: ProColumns<Knowledge>[] = [
    {
      title: '제목',
      dataIndex: 'title',
      width: 250,
      ellipsis: true,
    },
    {
      title: '유형',
      dataIndex: 'category',
      width: 100,
      render: (_, record) => (
        <Tag color={CATEGORY_COLOR[record.category] || 'default'}>{record.category}</Tag>
      ),
    },
    {
      title: '작성자',
      dataIndex: 'authorName',
      width: 100,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 120,
    },
    {
      title: '관리',
      width: 220,
      render: (_, record) => (
        <Button.Group>
          <Popconfirm
            title="이 지식을 승인하시겠습니까?"
            onConfirm={() => handleApprove(record)}
            okText="승인"
            cancelText="취소"
            disabled={record.status === 'approved'}
          >
            <Button
              size="small"
              type="primary"
              disabled={record.status === 'approved'}
              loading={statusMutation.isPending}
            >
              승인
            </Button>
          </Popconfirm>
          <Button
            size="small"
            danger
            onClick={() => handleRejectOpen(record)}
            disabled={record.status === 'rejected'}
          >
            반려
          </Button>
          <Button
            size="small"
            onClick={() => handleHide(record)}
            disabled={record.status === 'hidden'}
          >
            숨김
          </Button>
          <Popconfirm
            title="이 지식을 삭제하시겠습니까?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button size="small" danger>
              삭제
            </Button>
          </Popconfirm>
        </Button.Group>
      ),
    },
  ]

  return (
    <PageContainer title="지식 관리">
      <DataTable<Knowledge>
        columns={columns}
        request={fetchAllKnowledge}
        rowKey="id"
        actionRef={actionRef}
      />

      {/* 반려 사유 입력 Modal */}
      <Modal
        open={rejectModalOpen}
        title="반려 사유 입력"
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalOpen(false)}
        okText="반려"
        cancelText="취소"
        okButtonProps={{ danger: true, loading: statusMutation.isPending }}
      >
        <p>반려 사유를 입력하세요.</p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="반려 사유를 입력하세요"
        />
      </Modal>
    </PageContainer>
  )
}
