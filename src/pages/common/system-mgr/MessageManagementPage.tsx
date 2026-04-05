import { useState } from 'react'
import { Button, Modal, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import type { ProColumns } from '@ant-design/pro-components'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

// ===== 타입 =====
interface MessageItem extends Record<string, unknown> {
  id: string
  messageCode: string
  messageContent: string
  messageType: string
  useYn: string
  createdAt: string
  updatedAt: string
}

// ===== API =====
const messageApi = {
  list: (params: PageRequest): Promise<PageResponse<MessageItem>> =>
    apiClient.get('/common/messages', { params }) as Promise<PageResponse<MessageItem>>,
  create: (data: Omit<MessageItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResult<MessageItem>> =>
    apiClient.post('/common/messages', data) as Promise<ApiResult<MessageItem>>,
  update: (id: string, data: Partial<MessageItem>): Promise<ApiResult<MessageItem>> =>
    apiClient.put(`/common/messages/${id}`, data) as Promise<ApiResult<MessageItem>>,
  delete: (id: string): Promise<ApiResult<void>> =>
    apiClient.delete(`/common/messages/${id}`) as Promise<ApiResult<void>>,
}

// ===== 폼 필드 =====
const formFields: CrudFormField[] = [
  { name: 'messageCode', label: '메시지 코드', type: 'text', required: true, placeholder: '예: MSG_SUCCESS_SAVE' },
  { name: 'messageContent', label: '메시지 내용', type: 'textarea', required: true },
  {
    name: 'messageType',
    label: '메시지 유형',
    type: 'select',
    required: true,
    options: [
      { label: '정보', value: 'INFO' },
      { label: '경고', value: 'WARN' },
      { label: '오류', value: 'ERROR' },
    ],
  },
  {
    name: 'useYn',
    label: '사용여부',
    type: 'select',
    options: [
      { label: '사용', value: 'Y' },
      { label: '미사용', value: 'N' },
    ],
  },
]

// ===== 컴포넌트 =====
export function MessageManagementPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingRecord, setEditingRecord] = useState<MessageItem | null>(null)

  const createMutation = useMutation({
    mutationFn: messageApi.create,
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
    onError: () => { message.error('저장에 실패했습니다') },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MessageItem> }) => messageApi.update(id, data),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
    onError: () => { message.error('저장에 실패했습니다') },
  })

  const deleteMutation = useMutation({
    mutationFn: messageApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
    onError: () => { message.error('삭제에 실패했습니다') },
  })

  const handleDelete = (record: MessageItem) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      onConfirm: () => deleteMutation.mutate(record.id),
    })
  }

  const columns: ProColumns<MessageItem>[] = [
    { title: '메시지 코드', dataIndex: 'messageCode', key: 'messageCode', width: 200 },
    { title: '메시지 내용', dataIndex: 'messageContent', key: 'messageContent', ellipsis: true },
    { title: '유형', dataIndex: 'messageType', key: 'messageType', width: 80 },
    { title: '사용여부', dataIndex: 'useYn', key: 'useYn', width: 80 },
    { title: '등록일', dataIndex: 'createdAt', key: 'createdAt', width: 110 },
    {
      title: '액션',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => { setModalMode('edit'); setEditingRecord(record); setModalOpen(true) }}>수정</Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>삭제</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <DataTable<MessageItem>
        columns={columns}
        request={(params) => messageApi.list(params)}
        rowKey="id"
        headerTitle="메시지 관리"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setModalMode('create'); setEditingRecord(null); setModalOpen(true) }}>
            등록
          </Button>,
        ]}
      />
      <Modal
        title={modalMode === 'create' ? '메시지 등록' : '메시지 수정'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <CrudForm<MessageItem>
          fields={formFields}
          initialValues={modalMode === 'edit' && editingRecord ? editingRecord : undefined}
          mode={modalMode}
          onFinish={async (values) => {
            if (modalMode === 'create') {
              createMutation.mutate(values as Omit<MessageItem, 'id' | 'createdAt' | 'updatedAt'>)
            } else if (editingRecord) {
              updateMutation.mutate({ id: editingRecord.id, data: values })
            }
            return true
          }}
        />
      </Modal>
    </div>
  )
}
