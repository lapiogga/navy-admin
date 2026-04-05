import { useState } from 'react'
import { Button, Modal, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import type { ProColumns } from '@ant-design/pro-components'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

// ===== 타입 =====
interface SystemManager extends Record<string, unknown> {
  id: string
  managerName: string
  managerRank: string
  subsystemCode: string
  contactInfo: string
  description: string
  createdAt: string
  updatedAt: string
}

// ===== 서브시스템 옵션 =====
const SUBSYSTEM_OPTIONS = [
  { label: 'SYS01 초과근무관리', value: 'SYS01' },
  { label: 'SYS02 설문종합관리', value: 'SYS02' },
  { label: 'SYS03 성과관리', value: 'SYS03' },
  { label: 'SYS04 인증서발급', value: 'SYS04' },
  { label: 'SYS05 행정규칙포탈', value: 'SYS05' },
  { label: 'SYS06 해병대규정관리', value: 'SYS06' },
  { label: 'SYS07 군사자료관리', value: 'SYS07' },
  { label: 'SYS08 부대계보관리', value: 'SYS08' },
  { label: 'SYS09 영현보훈', value: 'SYS09' },
  { label: 'SYS10 주말버스예약', value: 'SYS10' },
  { label: 'SYS99 공통기능', value: 'SYS99' },
]

// ===== 폼 필드 =====
const formFields: CrudFormField[] = [
  { name: 'managerName', label: '담당자명', type: 'text', required: true, placeholder: '담당자 이름을 입력하세요' },
  { name: 'managerRank', label: '계급', type: 'text', required: true, placeholder: '예: 대위, 소령' },
  { name: 'subsystemCode', label: '담당 서브시스템', type: 'select', required: true, options: SUBSYSTEM_OPTIONS },
  { name: 'contactInfo', label: '연락처', type: 'text', placeholder: '전화번호를 입력하세요' },
  { name: 'description', label: '비고', type: 'textarea' },
]

// ===== API 함수 =====
const managerApi = {
  list: (params: PageRequest): Promise<PageResponse<SystemManager>> =>
    apiClient.get('/common/system-managers', { params }) as Promise<PageResponse<SystemManager>>,
  create: (data: Omit<SystemManager, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResult<SystemManager>> =>
    apiClient.post('/common/system-managers', data) as Promise<ApiResult<SystemManager>>,
  update: (id: string, data: Partial<SystemManager>): Promise<ApiResult<SystemManager>> =>
    apiClient.put(`/common/system-managers/${id}`, data) as Promise<ApiResult<SystemManager>>,
  delete: (id: string): Promise<ApiResult<void>> =>
    apiClient.delete(`/common/system-managers/${id}`) as Promise<ApiResult<void>>,
}

// ===== 컴포넌트 =====
export function SystemManagerPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingRecord, setEditingRecord] = useState<SystemManager | null>(null)

  const createMutation = useMutation({
    mutationFn: managerApi.create,
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['system-managers'] })
    },
    onError: () => { message.error('저장에 실패했습니다') },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SystemManager> }) => managerApi.update(id, data),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['system-managers'] })
    },
    onError: () => { message.error('저장에 실패했습니다') },
  })

  const deleteMutation = useMutation({
    mutationFn: managerApi.delete,
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['system-managers'] })
    },
    onError: () => { message.error('삭제에 실패했습니다') },
  })

  const handleDelete = (record: SystemManager) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      onConfirm: () => deleteMutation.mutate(record.id),
    })
  }

  const columns: ProColumns<SystemManager>[] = [
    { title: '담당자명', dataIndex: 'managerName', key: 'managerName', width: 120 },
    { title: '계급', dataIndex: 'managerRank', key: 'managerRank', width: 80 },
    { title: '담당 서브시스템', dataIndex: 'subsystemCode', key: 'subsystemCode', width: 140 },
    { title: '연락처', dataIndex: 'contactInfo', key: 'contactInfo', width: 130 },
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
      <DataTable<SystemManager>
        columns={columns}
        request={(params) => managerApi.list(params)}
        rowKey="id"
        headerTitle="체계담당자 관리"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setModalMode('create'); setEditingRecord(null); setModalOpen(true) }}>
            등록
          </Button>,
        ]}
      />
      <Modal
        title={modalMode === 'create' ? '체계담당자 등록' : '체계담당자 수정'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <CrudForm<SystemManager>
          fields={formFields}
          initialValues={modalMode === 'edit' && editingRecord ? editingRecord : undefined}
          mode={modalMode}
          onFinish={async (values) => {
            if (modalMode === 'create') {
              createMutation.mutate(values as Omit<SystemManager, 'id' | 'createdAt' | 'updatedAt'>)
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
