import { useState } from 'react'
import { Button, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import type { ProColumns } from '@ant-design/pro-components'
import { permissionGroupApi } from '@/entities/permission/api'
import type { PermissionGroup } from '@/entities/permission/types'
import type { PageResponse } from '@/shared/api/types'

interface PermissionGroupRecord extends PermissionGroup, Record<string, unknown> {}

const formFields: CrudFormField[] = [
  { name: 'groupCode', label: '권한그룹 코드', type: 'text', required: true, placeholder: '예: ADMIN, SYS01_USER' },
  { name: 'groupName', label: '권한그룹명', type: 'text', required: true },
  { name: 'description', label: '설명', type: 'textarea' },
]

export function PermissionGroupPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PermissionGroup | null>(null)

  const { refetch: _refetch } = useQuery({
    queryKey: ['permission-groups'],
    queryFn: () => permissionGroupApi.list({ page: 0, size: 100 }),
    enabled: false,
  })

  const createMutation = useMutation({
    mutationFn: (data: Omit<PermissionGroup, 'id' | 'createdAt' | 'updatedAt'>) =>
      permissionGroupApi.create(data),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PermissionGroup> }) =>
      permissionGroupApi.update(id, data),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => permissionGroupApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['permission-groups'] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다. 다시 시도하세요')
    },
  })

  const handleDelete = (record: PermissionGroup) => {
    showConfirmDialog({
      title: '권한그룹 삭제',
      content: '해당 그룹에 배정된 사용자의 권한이 모두 해제됩니다. 계속하시겠습니까?',
      danger: true,
      onConfirm: () => deleteMutation.mutateAsync(record.id),
    })
  }

  const handleEdit = (record: PermissionGroup) => {
    setEditTarget(record)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const columns: ProColumns<PermissionGroupRecord>[] = [
    { title: '권한그룹 코드', dataIndex: 'groupCode', width: 180 },
    { title: '권한그룹명', dataIndex: 'groupName', width: 160 },
    { title: '설명', dataIndex: 'description', ellipsis: true },
    { title: '등록일', dataIndex: 'createdAt', width: 120 },
    {
      title: '관리',
      width: 120,
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => handleEdit(record as PermissionGroup)} style={{ marginRight: 8 }}>
            수정
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record as PermissionGroup)}>
            삭제
          </Button>
        </>
      ),
    },
  ]

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, data: values as Partial<PermissionGroup> })
      } else {
        await createMutation.mutateAsync(values as Omit<PermissionGroup, 'id' | 'createdAt' | 'updatedAt'>)
      }
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <DataTable<PermissionGroupRecord>
        columns={columns}
        rowKey="id"
        request={(params) => permissionGroupApi.list(params) as Promise<PageResponse<PermissionGroupRecord>>}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditTarget(null)
              setModalOpen(true)
            }}
          >
            등록
          </Button>,
        ]}
        headerTitle="권한그룹 목록"
      />
      <Modal
        title={editTarget ? '권한그룹 수정' : '권한그룹 등록'}
        open={modalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={formFields}
          onFinish={handleFinish}
          initialValues={editTarget ? { groupCode: editTarget.groupCode, groupName: editTarget.groupName, description: editTarget.description } : undefined}
          mode={editTarget ? 'edit' : 'create'}
        />
      </Modal>
    </>
  )
}
