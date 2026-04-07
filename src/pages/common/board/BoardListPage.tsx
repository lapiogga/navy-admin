import { useState } from 'react'
import { Button, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui'
import { boardPostApi, boardConfigApi } from '@/entities/board/api'
import { useQuery } from '@tanstack/react-query'
import type { BoardPost } from '@/entities/board/types'
import type { PageResponse } from '@/shared/api/types'
import { BoardPostPage } from './BoardPostPage'

interface BoardPostRecord extends BoardPost, Record<string, unknown> {}

const emptyStyle: React.CSSProperties = {
  backgroundColor: '#F0F2F5',
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  borderRadius: 4,
}

interface BoardListPageProps {
  boardId: string | null
}

export function BoardListPage({ boardId }: BoardListPageProps) {
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BoardPostRecord | null>(null)
  const [postMode, setPostMode] = useState<'create' | 'edit' | 'view'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  // 게시판 설정 조회 (첨부파일/댓글 사용 여부)
  const { data: configResult } = useQuery({
    queryKey: ['board-config', boardId],
    queryFn: () => boardConfigApi.detail(boardId!),
    enabled: !!boardId,
  })
  const config = (configResult as { data?: { useAttachment: boolean; useComment: boolean } } | undefined)?.data
  const useAttachment = config?.useAttachment ?? true
  const useComment = config?.useComment ?? true

  if (!boardId) {
    return <div style={emptyStyle}>게시판 설정 탭에서 게시판을 먼저 선택하세요</div>
  }

  const columns: ProColumns<BoardPostRecord>[] = [
    {
      title: '공지',
      dataIndex: 'isPinned',
      width: 60,
      render: (val) => val ? <Tag color="red">공지</Tag> : null,
    },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '작성자', dataIndex: 'authorName', width: 100 },
    { title: '소속', dataIndex: 'authorUnit', width: 120 },
    { title: '조회', dataIndex: 'viewCount', width: 70 },
    { title: '등록일', dataIndex: 'createdAt', width: 120 },
  ]

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div key={refreshKey}>
      <DataTable<BoardPostRecord>
        columns={columns}
        rowKey="id"
        request={(params) => boardPostApi.list(boardId, params) as Promise<PageResponse<BoardPostRecord>>}
        headerTitle="게시글 목록"
        searchable
        searchPlaceholder="제목, 내용으로 검색"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedPost(null)
              setPostMode('create')
              setPostModalOpen(true)
            }}
          >
            게시글 작성
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => {
            setSelectedPost(record)
            setPostMode('view')
            setPostModalOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />

      <BoardPostPage
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        boardId={boardId}
        post={selectedPost as BoardPost | null}
        mode={postMode}
        useAttachment={useAttachment}
        useComment={useComment}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
