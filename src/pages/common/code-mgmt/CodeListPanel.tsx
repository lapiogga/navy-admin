import { useRef, useState } from 'react'
import { Button, Modal, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import type { ActionType } from '@ant-design/pro-components'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import { codeApi } from '@/entities/code/api'
import type { Code } from '@/entities/code/types'
import type { ListParams, PageResponse } from '@/shared/api/types'

interface CodeListPanelProps {
  groupId: string
  groupCode: string
}

const formFields: CrudFormField[] = [
  { name: 'codeValue', label: '코드값', type: 'text', required: true, placeholder: '예: APPROVED' },
  { name: 'codeName', label: '코드명', type: 'text', required: true, placeholder: '예: 승인' },
  { name: 'sortOrder', label: '정렬순서', type: 'number' },
  {
    name: 'useYn',
    label: '사용여부',
    type: 'select',
    options: [
      { label: '사용', value: 'Y' },
      { label: '미사용', value: 'N' },
    ],
  },
  { name: 'description', label: '설명', type: 'textarea' },
]

interface CodeRecord extends Code, Record<string, unknown> {}

export function CodeListPanel({ groupId, groupCode }: CodeListPanelProps) {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Code | null>(null)

  const fetchCodes = async (params: ListParams): Promise<PageResponse<CodeRecord>> => {
    const res = await codeApi.listByGroup(groupId, params)
    const data = (res as unknown as { data: PageResponse<CodeRecord> }).data ?? res
    return data as PageResponse<CodeRecord>
  }

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['codes', groupId] })
    void queryClient.invalidateQueries({ queryKey: ['code-options'] })
    actionRef.current?.reload()
  }

  const createMutation = useMutation({
    mutationFn: (values: Omit<Code, 'id' | 'createdAt'>) => codeApi.create(values),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      invalidateAll()
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요', 4)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Code> }) =>
      codeApi.update(id, data),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      invalidateAll()
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요', 4)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => codeApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      invalidateAll()
    },
  })

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    const data = { ...values, groupId, groupCode } as Omit<Code, 'id' | 'createdAt'>
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    return true
  }

  const handleDelete = (record: CodeRecord) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      danger: true,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(record.id)
      },
    })
  }

  return (
    <>
      <DataTable<CodeRecord>
        key={groupId}
        headerTitle={`코드 목록 (${groupCode})`}
        rowKey="id"
        request={fetchCodes}
        searchable
        searchPlaceholder="코드값, 코드명으로 검색"
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
        columns={[
          { title: '코드값', dataIndex: 'codeValue', ellipsis: true },
          { title: '코드명', dataIndex: 'codeName', ellipsis: true },
          { title: '정렬순서', dataIndex: 'sortOrder', width: 80 },
          {
            title: '사용여부',
            dataIndex: 'useYn',
            width: 80,
            render: (v) => (v === 'Y' ? '사용' : '미사용'),
          },
          {
            title: '관리',
            width: 100,
            render: (_, record) => (
              <Space>
                <a
                  onClick={() => {
                    setEditTarget(record as Code)
                    setModalOpen(true)
                  }}
                >
                  수정
                </a>
                <a className="text-red-500" onClick={() => handleDelete(record)}>
                  삭제
                </a>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editTarget ? '코드 수정' : '코드 등록'}
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
