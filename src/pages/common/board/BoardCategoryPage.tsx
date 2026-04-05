import { useState } from 'react'
import { Button, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import { boardCategoryApi } from '@/entities/board/api'
import type { BoardCategory } from '@/entities/board/types'

interface BoardCategoryRecord extends BoardCategory, Record<string, unknown> {}

const formFields: CrudFormField[] = [
  { name: 'categoryName', label: '카테고리명', type: 'text', required: true, placeholder: '예: 일반공지' },
  { name: 'sortOrder', label: '정렬순서', type: 'number', placeholder: '1' },
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

const emptyStyle: React.CSSProperties = {
  backgroundColor: '#F0F2F5',
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  borderRadius: 4,
}

interface BoardCategoryPageProps {
  boardId: string | null
}

export function BoardCategoryPage({ boardId }: BoardCategoryPageProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<BoardCategoryRecord | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      boardCategoryApi.create(boardId!, {
        categoryName: data.categoryName as string,
        sortOrder: Number(data.sortOrder ?? 0),
        useYn: (data.useYn as string) ?? 'Y',
      }),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditRecord(null)
      queryClient.invalidateQueries({ queryKey: ['board-categories', boardId] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      boardCategoryApi.update(boardId!, id, {
        categoryName: data.categoryName as string,
        sortOrder: Number(data.sortOrder ?? 0),
        useYn: (data.useYn as string) ?? 'Y',
      }),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditRecord(null)
      queryClient.invalidateQueries({ queryKey: ['board-categories', boardId] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => boardCategoryApi.delete(boardId!, id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['board-categories', boardId] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다. 잠시 후 다시 시도하세요')
    },
  })

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    try {
      if (editRecord) {
        await updateMutation.mutateAsync({ id: editRecord.id, data: values })
      } else {
        await createMutation.mutateAsync(values)
      }
      return true
    } catch {
      return false
    }
  }

  const handleDelete = (record: BoardCategoryRecord) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      danger: true,
      onConfirm: () => deleteMutation.mutateAsync(record.id),
    })
  }

  if (!boardId) {
    return <div style={emptyStyle}>게시판 설정 탭에서 게시판을 먼저 선택하세요</div>
  }

  const columns: ProColumns<BoardCategoryRecord>[] = [
    { title: '카테고리명', dataIndex: 'categoryName' },
    { title: '정렬순서', dataIndex: 'sortOrder', width: 100 },
    { title: '사용여부', dataIndex: 'useYn', width: 100 },
    {
      title: '관리',
      width: 140,
      render: (_, record) => (
        <>
          <Button
            size="small"
            style={{ marginRight: 4 }}
            onClick={() => {
              setEditRecord(record)
              setModalOpen(true)
            }}
          >
            수정
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDelete(record)}
          >
            삭제
          </Button>
        </>
      ),
    },
  ]

  // 카테고리는 비페이지 전체 반환이므로 list를 PageResponse 형태로 변환
  const requestFn = async (params: { page: number; size: number }) => {
    const result = await boardCategoryApi.list(boardId)
    const data = (result as { data?: BoardCategory[] }).data ?? (result as unknown as BoardCategory[])
    const items = Array.isArray(data) ? data : []
    const start = params.page * params.size
    return {
      content: items.slice(start, start + params.size) as BoardCategoryRecord[],
      totalElements: items.length,
      totalPages: Math.ceil(items.length / params.size),
      size: params.size,
      number: params.page,
    }
  }

  return (
    <div>
      <DataTable<BoardCategoryRecord>
        columns={columns}
        rowKey="id"
        request={requestFn}
        headerTitle="카테고리 목록"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditRecord(null)
              setModalOpen(true)
            }}
          >
            카테고리 추가
          </Button>,
        ]}
      />

      <Modal
        title={editRecord ? '카테고리 수정' : '카테고리 추가'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditRecord(null)
        }}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={formFields}
          onFinish={handleFinish}
          mode={editRecord ? 'edit' : 'create'}
          initialValues={editRecord ?? undefined}
        />
      </Modal>
    </div>
  )
}
