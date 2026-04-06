import { useState, useRef } from 'react'
import { Button, Modal, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import type { ActionType } from '@ant-design/pro-components'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import { codeGroupApi } from '@/entities/code/api'
import type { CodeGroup } from '@/entities/code/types'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface CodeGroupPageProps {
  onSelectGroup: (groupId: string, groupCode: string) => void
  selectedGroupId: string | null
}

const formFields: CrudFormField[] = [
  { name: 'groupCode', label: '코드그룹코드', type: 'text', required: true, placeholder: '예: APPROVAL_STATUS' },
  { name: 'groupName', label: '코드그룹명', type: 'text', required: true, placeholder: '예: 결재상태' },
  { name: 'description', label: '설명', type: 'textarea' },
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

interface CodeGroupRecord extends CodeGroup, Record<string, unknown> {}

export function CodeGroupPage({ onSelectGroup, selectedGroupId }: CodeGroupPageProps) {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CodeGroup | null>(null)

  const fetchGroups = async (params: PageRequest): Promise<PageResponse<CodeGroupRecord>> => {
    const res = await codeGroupApi.list(params)
    // apiClient interceptor가 response.data를 반환하므로 ApiResult.data를 꺼냄
    const data = (res as unknown as { data: PageResponse<CodeGroupRecord> }).data ?? res
    return data as PageResponse<CodeGroupRecord>
  }

  const createMutation = useMutation({
    mutationFn: (values: Omit<CodeGroup, 'id' | 'createdAt' | 'updatedAt'>) =>
      codeGroupApi.create(values),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['code-groups'] })
      actionRef.current?.reload()
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요', 4)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CodeGroup> }) =>
      codeGroupApi.update(id, data),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      void queryClient.invalidateQueries({ queryKey: ['code-groups'] })
      actionRef.current?.reload()
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요', 4)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => codeGroupApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['code-groups'] })
      actionRef.current?.reload()
    },
  })

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    const data = values as Omit<CodeGroup, 'id' | 'createdAt' | 'updatedAt'>
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    return true
  }

  const handleDelete = (record: CodeGroupRecord) => {
    showConfirmDialog({
      title: '코드그룹 삭제',
      content: '하위 코드가 모두 삭제됩니다. 계속하시겠습니까?',
      danger: true,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(record.id)
      },
    })
  }

  return (
    <>
      <DataTable<CodeGroupRecord>
        headerTitle="코드그룹 목록"
        rowKey="id"
        request={fetchGroups}
        toolBarRender={() => [
          <Button
            key="create"
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
        onRow={(record) => ({
          onClick: () => onSelectGroup(record.id, record.groupCode),
          style: {
            cursor: 'pointer',
            background: selectedGroupId === record.id ? '#E6F4FF' : undefined,
          },
        })}
        columns={[
          { title: '코드그룹코드', dataIndex: 'groupCode', ellipsis: true },
          { title: '코드그룹명', dataIndex: 'groupName', ellipsis: true },
          {
            title: '사용여부',
            dataIndex: 'useYn',
            width: 80,
            render: (v) => (v === 'Y' ? '사용' : '미사용'),
          },
          { title: '등록일', dataIndex: 'createdAt', width: 100 },
          {
            title: '관리',
            width: 100,
            render: (_, record) => (
              <Space
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  onClick={() => {
                    setEditTarget(record as CodeGroup)
                    setModalOpen(true)
                  }}
                >
                  수정
                </a>
                <a
                  className="text-red-500"
                  onClick={() => handleDelete(record)}
                >
                  삭제
                </a>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editTarget ? '코드그룹 수정' : '코드그룹 등록'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={formFields}
          onFinish={handleFinish}
          initialValues={(editTarget as unknown as Partial<Record<string, unknown>>) ?? undefined}
          mode={editTarget ? 'edit' : 'create'}
        />
      </Modal>
    </>
  )
}
