import { useState } from 'react'
import { Button, Tag, Modal, Input, Space, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable'
import { boardPostApi } from '@/entities/board/api'
import { useMutation } from '@tanstack/react-query'
import type { BoardPost } from '@/entities/board/types'
import type { PageResponse } from '@/shared/api/types'

interface BoardPostRecord extends BoardPost, Record<string, unknown> {}

interface SimpleBoardPageProps {
  boardId: string
  title?: string
}

export function SimpleBoardPage({ boardId, title }: SimpleBoardPageProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BoardPostRecord | null>(null)
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formPinned, setFormPinned] = useState(false)

  const refresh = () => setRefreshKey((k) => k + 1)

  const openCreate = () => {
    setSelectedPost(null)
    setFormTitle('')
    setFormContent('')
    setFormPinned(false)
    setMode('create')
    setModalOpen(true)
  }

  const openView = (record: BoardPostRecord) => {
    setSelectedPost(record)
    setFormTitle(record.title)
    setFormContent(record.content)
    setFormPinned(record.isPinned)
    setMode('view')
    setModalOpen(true)
  }

  const openEdit = () => {
    setMode('edit')
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (selectedPost && mode === 'edit') {
        return boardPostApi.update(boardId, selectedPost.id, {
          title: formTitle,
          content: formContent,
          isPinned: formPinned,
        })
      }
      return boardPostApi.create(boardId, {
        boardId,
        title: formTitle,
        content: formContent,
        isPinned: formPinned,
        status: 'ACTIVE',
      })
    },
    onSuccess: () => {
      message.success('저장되었습니다')
      setModalOpen(false)
      refresh()
    },
    onError: () => message.error('저장에 실패했습니다'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => boardPostApi.delete(boardId, selectedPost!.id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      setModalOpen(false)
      refresh()
    },
  })

  const handleDelete = () => {
    Modal.confirm({
      title: '게시글 삭제',
      content: '삭제된 게시글은 복구할 수 없습니다. 계속하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => deleteMutation.mutateAsync(),
    })
  }

  const columns: ProColumns<BoardPostRecord>[] = [
    {
      title: '번호',
      dataIndex: 'index',
      width: 60,
      render: (_, __, idx) => idx + 1,
    },
    {
      title: '공지',
      dataIndex: 'isPinned',
      width: 60,
      render: (val) => (val ? <Tag color="red">공지</Tag> : null),
    },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '작성자', dataIndex: 'authorName', width: 100 },
    { title: '소속', dataIndex: 'authorUnit', width: 120 },
    { title: '조회', dataIndex: 'viewCount', width: 70, align: 'center' },
    { title: '등록일', dataIndex: 'createdAt', width: 120 },
    {
      title: '작업',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPost(record)
              setFormTitle(record.title)
              setFormContent(record.content)
              setFormPinned(record.isPinned)
              setMode('edit')
              setModalOpen(true)
            }}
          >
            수정
          </Button>
          <Button
            type="link"
            danger
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedPost(record)
              Modal.confirm({
                title: '게시글 삭제',
                content: '삭제된 게시글은 복구할 수 없습니다.',
                okText: '삭제',
                okType: 'danger',
                cancelText: '취소',
                onOk: () =>
                  boardPostApi.delete(boardId, record.id).then(() => {
                    message.success('삭제되었습니다')
                    refresh()
                  }),
              })
            }}
          >
            삭제
          </Button>
        </Space>
      ),
    },
  ]

  const isView = mode === 'view'
  const modalTitle =
    mode === 'create' ? '게시글 작성' : mode === 'edit' ? '게시글 수정' : '게시글 상세'

  return (
    <div key={refreshKey}>
      <DataTable<BoardPostRecord>
        columns={columns}
        rowKey="id"
        request={async (params) => {
          const raw = await boardPostApi.list(boardId, params)
          const res = (raw as unknown as { data?: { content: BoardPostRecord[] } }).data ?? raw
          return res as unknown as PageResponse<BoardPostRecord>
        }}
        headerTitle={title}
        searchable
        searchPlaceholder="제목, 내용으로 검색"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            글쓰기
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => openView(record),
          style: { cursor: 'pointer' },
        })}
      />

      <Modal
        title={modalTitle}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={700}
        destroyOnClose
        footer={
          isView
            ? [
                <Button key="edit" type="primary" onClick={openEdit}>
                  수정
                </Button>,
                <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  삭제
                </Button>,
                <Button key="close" onClick={() => setModalOpen(false)}>
                  닫기
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={() => setModalOpen(false)}>
                  취소
                </Button>,
                <Button
                  key="save"
                  type="primary"
                  loading={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  저장
                </Button>,
              ]
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>
              제목 <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              disabled={isView}
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, marginRight: 8 }}>공지 고정:</label>
            <select
              value={String(formPinned)}
              onChange={(e) => setFormPinned(e.target.value === 'true')}
              disabled={isView}
              style={{
                padding: '4px 8px',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
              }}
            >
              <option value="false">일반글</option>
              <option value="true">공지 고정</option>
            </select>
          </div>
          {isView && selectedPost && (
            <div style={{ color: '#666', fontSize: 13 }}>
              작성자: {selectedPost.authorName} ({selectedPost.authorUnit}) | 조회수:{' '}
              {selectedPost.viewCount.toLocaleString()} | 등록일: {selectedPost.createdAt}
            </div>
          )}
          <div>
            <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>내용</label>
            <Input.TextArea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="내용을 입력하세요"
              disabled={isView}
              rows={8}
            />
          </div>
        </Space>
      </Modal>
    </div>
  )
}
