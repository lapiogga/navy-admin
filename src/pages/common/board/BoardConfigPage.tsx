import { useState } from 'react'
import { Button, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import { boardConfigApi } from '@/entities/board/api'
import type { BoardConfig } from '@/entities/board/types'

interface BoardConfigRecord extends BoardConfig, Record<string, unknown> {}

const formFields: CrudFormField[] = [
  { name: 'boardName', label: '게시판명', type: 'text', required: true, placeholder: '예: 공지사항' },
  {
    name: 'boardType',
    label: '게시판 유형',
    type: 'select',
    required: true,
    options: [
      { label: '공지사항', value: 'NOTICE' },
      { label: '질의응답', value: 'QNA' },
      { label: '자유게시판', value: 'FREE' },
      { label: '자료실', value: 'DATA' },
    ],
  },
  {
    name: 'subsystemCode',
    label: '서브시스템',
    type: 'select',
    required: true,
    options: [
      { label: '공통', value: 'common' },
      { label: '초과근무관리', value: 'sys01' },
      { label: '설문종합관리', value: 'sys02' },
      { label: '성과관리', value: 'sys03' },
    ],
  },
  { name: 'description', label: '설명', type: 'textarea', placeholder: '게시판 설명' },
  {
    name: 'useCategory',
    label: '카테고리 사용',
    type: 'select',
    options: [
      { label: '사용', value: 'true' },
      { label: '미사용', value: 'false' },
    ],
  },
  {
    name: 'useAttachment',
    label: '첨부파일 허용',
    type: 'select',
    options: [
      { label: '사용', value: 'true' },
      { label: '미사용', value: 'false' },
    ],
  },
  {
    name: 'useComment',
    label: '댓글 허용',
    type: 'select',
    options: [
      { label: '사용', value: 'true' },
      { label: '미사용', value: 'false' },
    ],
  },
  { name: 'maxAttachSize', label: '최대첨부크기(MB)', type: 'number', placeholder: '10' },
]

interface BoardConfigPageProps {
  onSelectBoard: (boardId: string | null) => void
}

export function BoardConfigPage({ onSelectBoard }: BoardConfigPageProps) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<BoardConfigRecord | null>(null)

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      boardConfigApi.create({
        boardName: data.boardName as string,
        boardType: data.boardType as string,
        subsystemCode: data.subsystemCode as string,
        description: (data.description as string) ?? '',
        useCategory: data.useCategory === 'true',
        useAttachment: data.useAttachment === 'true',
        useComment: data.useComment === 'true',
        maxAttachSize: Number(data.maxAttachSize ?? 10),
      }),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditRecord(null)
      queryClient.invalidateQueries({ queryKey: ['board-configs'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      boardConfigApi.update(id, {
        boardName: data.boardName as string,
        boardType: data.boardType as string,
        subsystemCode: data.subsystemCode as string,
        description: (data.description as string) ?? '',
        useCategory: data.useCategory === 'true' || data.useCategory === true,
        useAttachment: data.useAttachment === 'true' || data.useAttachment === true,
        useComment: data.useComment === 'true' || data.useComment === true,
        maxAttachSize: Number(data.maxAttachSize ?? 10),
      }),
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      setEditRecord(null)
      queryClient.invalidateQueries({ queryKey: ['board-configs'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => boardConfigApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['board-configs'] })
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

  const handleDelete = (record: BoardConfigRecord) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      danger: true,
      onConfirm: () => deleteMutation.mutateAsync(record.id),
    })
  }

  const columns: ProColumns<BoardConfigRecord>[] = [
    { title: '게시판명', dataIndex: 'boardName', width: 150 },
    {
      title: '유형',
      dataIndex: 'boardType',
      width: 100,
      render: (val) => {
        const map: Record<string, string> = {
          NOTICE: '공지사항',
          QNA: '질의응답',
          FREE: '자유게시판',
          DATA: '자료실',
        }
        return map[val as string] ?? String(val)
      },
    },
    { title: '서브시스템', dataIndex: 'subsystemCode', width: 120 },
    {
      title: '카테고리',
      dataIndex: 'useCategory',
      width: 90,
      render: (val) => (val ? '사용' : '미사용'),
    },
    {
      title: '첨부파일',
      dataIndex: 'useAttachment',
      width: 90,
      render: (val) => (val ? '허용' : '미허용'),
    },
    { title: '등록일', dataIndex: 'createdAt', width: 120 },
    {
      title: '관리',
      width: 140,
      render: (_, record) => (
        <>
          <Button
            size="small"
            style={{ marginRight: 4 }}
            onClick={(e) => {
              e.stopPropagation()
              setEditRecord(record)
              setModalOpen(true)
            }}
          >
            수정
          </Button>
          <Button
            size="small"
            danger
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(record)
            }}
          >
            삭제
          </Button>
        </>
      ),
    },
  ]

  return (
    <div>
      <DataTable<BoardConfigRecord>
        columns={columns}
        rowKey="id"
        request={(params) => boardConfigApi.list(params)}
        headerTitle="게시판 목록"
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
            등록
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => onSelectBoard(record.id),
          style: { cursor: 'pointer' },
        })}
      />

      <Modal
        title={editRecord ? '게시판 수정' : '게시판 등록'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditRecord(null)
        }}
        footer={null}
        destroyOnClose
        width={540}
      >
        <CrudForm<Record<string, unknown>>
          fields={formFields}
          onFinish={handleFinish}
          mode={editRecord ? 'edit' : 'create'}
          initialValues={
            editRecord
              ? {
                  ...editRecord,
                  useCategory: String(editRecord.useCategory),
                  useAttachment: String(editRecord.useAttachment),
                  useComment: String(editRecord.useComment),
                }
              : undefined
          }
        />
      </Modal>
    </div>
  )
}
