import { useRef } from 'react'
import { Modal, message, Button, Tag } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageResponse, ApiResult } from '@/shared/api/types'
import type { Knowledge, KnowledgeStatus } from '@/shared/api/mocks/handlers/sys13'
import { useState } from 'react'

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

// R1: CSV 입력값 - 제목, 지식유형(카테고리), 출처(생산/카피), 키워드(다수), 내용, 첨부파일
const CRUD_FIELDS = [
  {
    name: 'title',
    label: '제목',
    type: 'text' as const,
    required: true,
    placeholder: '제목을 입력하세요 (최대 200자)',
  },
  {
    name: 'category',
    label: '지식유형',
    type: 'select' as const,
    required: true,
    options: ['업무지식', '기술지식', '행정지식', '법규지식', '기타'].map((v) => ({ label: v, value: v })),
  },
  {
    name: 'source',
    label: '출처',
    type: 'select' as const,
    required: true,
    options: [
      { label: '생산', value: '생산' },
      { label: '카피', value: '카피' },
    ],
  },
  {
    name: 'keywords',
    label: '키워드',
    type: 'text' as const,
    required: false,
    placeholder: '키워드를 쉼표(,)로 구분하여 입력 (다수 입력 가능)',
  },
  {
    name: 'content',
    label: '내용',
    type: 'textarea' as const,
    required: true,
    placeholder: '지식 내용을 입력하세요',
  },
  {
    name: 'attachments',
    label: '첨부파일',
    type: 'file' as const,
    required: false,
  },
]

export default function MyKnowledgePage() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Knowledge | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const fetchMyKnowledge = async (params: { page: number; size: number }): Promise<PageResponse<Knowledge>> => {
    // 나의 지식: status 필터 없이 전체 조회 (실제에서는 현재 사용자 기준)
    const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
    const res = await fetch(`/api/sys13/knowledge?${query}`)
    const json: ApiResult<PageResponse<Knowledge>> = await res.json()
    if (!json.success) throw new Error('나의 지식 조회 실패')
    return json.data
  }

  const createMutation = useMutation({
    mutationFn: async (values: Partial<Knowledge>) => {
      const res = await fetch('/api/sys13/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json: ApiResult<Knowledge> = await res.json()
      if (!json.success) throw new Error('지식 등록 실패')
      return json.data
    },
    onSuccess: () => {
      void message.success('지식이 등록되었습니다')
      setModalOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
      actionRef.current?.reload()
    },
    onError: () => {
      void message.error('지식 등록에 실패했습니다')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Knowledge> }) => {
      const res = await fetch(`/api/sys13/knowledge/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json: ApiResult<Knowledge> = await res.json()
      if (!json.success) throw new Error('지식 수정 실패')
      return json.data
    },
    onSuccess: () => {
      void message.success('지식이 수정되었습니다')
      setModalOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
      actionRef.current?.reload()
    },
    onError: () => {
      void message.error('지식 수정에 실패했습니다')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys13/knowledge/${id}`, { method: 'DELETE' })
      const json: ApiResult<null> = await res.json()
      if (!json.success) throw new Error('지식 삭제 실패')
    },
    onSuccess: () => {
      void message.success('지식이 삭제되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
      actionRef.current?.reload()
    },
    onError: () => {
      void message.error('지식 삭제에 실패했습니다')
    },
  })

  const handleCreate = () => {
    setEditingItem(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (record: Knowledge) => {
    setEditingItem(record)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleFormSubmit = async (values: Record<string, unknown>): Promise<boolean> => {
    if (modalMode === 'create') {
      createMutation.mutate(values as Partial<Knowledge>)
    } else if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, values: values as Partial<Knowledge> })
    }
    return true
  }

  const columns: ProColumns<Knowledge>[] = [
    {
      title: '제목',
      dataIndex: 'title',
      width: 300,
      render: (_, record) => (
        <a onClick={() => handleEdit(record)}>{record.title}</a>
      ),
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
      title: '조회수',
      dataIndex: 'viewCount',
      width: 80,
      valueType: 'digit',
    },
    {
      title: '추천',
      dataIndex: 'recommendCount',
      width: 80,
      valueType: 'digit',
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 120,
    },
    {
      title: '관리',
      width: 120,
      render: (_, record) => (
        <Button.Group>
          <Button size="small" onClick={() => handleEdit(record)}>
            수정
          </Button>
          <Button
            size="small"
            danger
            disabled={record.status !== 'pending'}
            onClick={() => deleteMutation.mutate(record.id)}
          >
            삭제
          </Button>
        </Button.Group>
      ),
    },
  ]

  return (
    <PageContainer title="나의 지식 관리">
      <DataTable<Knowledge>
        columns={columns}
        request={fetchMyKnowledge}
        rowKey="id"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleCreate}>
            지식 등록
          </Button>,
        ]}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        title={modalMode === 'create' ? '지식 등록' : '지식 수정'}
        width={640}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={CRUD_FIELDS}
          onFinish={handleFormSubmit}
          initialValues={editingItem ? (editingItem as unknown as Record<string, unknown>) : undefined}
          mode={modalMode}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </PageContainer>
  )
}
