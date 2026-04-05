import { useState, useEffect } from 'react'
import { Button, Modal, Input, List, Space, Upload, message } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { boardCommentApi, boardCategoryApi } from '@/entities/board/api'
import type { BoardPost, BoardComment } from '@/entities/board/types'

interface BoardPostPageProps {
  open: boolean
  onClose: () => void
  boardId: string
  post: BoardPost | null
  mode: 'create' | 'edit' | 'view'
  useAttachment: boolean
  useComment: boolean
  onSuccess: () => void
}

export function BoardPostPage({
  open,
  onClose,
  boardId,
  post,
  mode,
  useAttachment,
  useComment,
  onSuccess,
}: BoardPostPageProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [newComment, setNewComment] = useState('')

  // 카테고리 목록
  const { data: categoriesResult } = useQuery({
    queryKey: ['board-categories', boardId],
    queryFn: () => boardCategoryApi.list(boardId),
    enabled: open,
  })

  const categoriesRaw = (categoriesResult as { data?: BoardComment[] } | undefined)?.data
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : Array.isArray(categoriesResult) ? categoriesResult as unknown[] : []

  // 댓글 목록
  const { data: commentsResult, refetch: refetchComments } = useQuery({
    queryKey: ['board-comments', post?.id],
    queryFn: () => boardCommentApi.list(post!.id),
    enabled: open && !!post?.id && useComment,
  })
  const commentsRaw = (commentsResult as { data?: BoardComment[] } | undefined)?.data
  const comments: BoardComment[] = Array.isArray(commentsRaw) ? commentsRaw : []

  useEffect(() => {
    if (post && open) {
      setTitle(post.title)
      setContent(post.content)
      setIsPinned(post.isPinned)
      setCategoryId(post.categoryId)
      setFileList(
        post.attachments.map((a) => ({
          uid: a.id,
          name: a.fileName,
          status: 'done',
          size: a.fileSize,
        })),
      )
    } else if (!post && open) {
      setTitle('')
      setContent('')
      setIsPinned(false)
      setCategoryId(undefined)
      setFileList([])
    }
    setNewComment('')
  }, [post, open])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { boardPostApi } = await import('@/entities/board/api')
      if (post && mode === 'edit') {
        return boardPostApi.update(boardId, post.id, { title, content, isPinned, categoryId })
      }
      return boardPostApi.create(boardId, { boardId, title, content, isPinned, status: 'ACTIVE', categoryId })
    },
    onSuccess: () => {
      message.success('저장되었습니다')
      onSuccess()
      onClose()
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { boardPostApi } = await import('@/entities/board/api')
      return boardPostApi.delete(boardId, post!.id)
    },
    onSuccess: () => {
      message.success('삭제되었습니다')
      onSuccess()
      onClose()
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: () => boardCommentApi.create(post!.id, { content: newComment }),
    onSuccess: () => {
      message.success('저장되었습니다')
      setNewComment('')
      queryClient.invalidateQueries({ queryKey: ['board-comments', post?.id] })
      void refetchComments()
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => boardCommentApi.delete(post!.id, commentId),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['board-comments', post?.id] })
      void refetchComments()
    },
  })

  const handleDelete = () => {
    Modal.confirm({
      title: '게시글 삭제',
      content: '게시글과 댓글, 첨부파일이 모두 삭제됩니다. 계속하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => deleteMutation.mutateAsync(),
    })
  }

  const isView = mode === 'view'
  const title_ = mode === 'create' ? '게시글 작성' : mode === 'edit' ? '게시글 수정' : '게시글 상세'

  const categoryOptions = (categories as Array<{ id: string; categoryName: string }>)
    .map((c) => ({ label: c.categoryName, value: c.id }))

  return (
    <Modal
      title={title_}
      open={open}
      onCancel={onClose}
      width={700}
      destroyOnClose
      footer={
        isView
          ? [
              <Button key="edit" onClick={() => onClose()}>
                닫기
              </Button>,
              post && (
                <Button key="delete" danger onClick={handleDelete}>
                  삭제
                </Button>
              ),
            ].filter(Boolean)
          : [
              <Button key="cancel" onClick={onClose}>
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
        {/* 카테고리 */}
        {categoryOptions.length > 0 && (
          <div>
            <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>카테고리</label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value || undefined)}
              disabled={isView}
              style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
            >
              <option value="">전체</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* 제목 */}
        <div>
          <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>
            제목 <span style={{ color: '#ff4d4f' }}>*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            disabled={isView}
          />
        </div>

        {/* 공지 고정 */}
        <div>
          <label style={{ fontWeight: 500, marginRight: 8 }}>공지 고정:</label>
          <select
            value={String(isPinned)}
            onChange={(e) => setIsPinned(e.target.value === 'true')}
            disabled={isView}
            style={{ padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
          >
            <option value="false">일반글</option>
            <option value="true">공지 고정</option>
          </select>
        </div>

        {/* 조회수 (view 모드) */}
        {isView && post && (
          <div style={{ color: '#666' }}>조회수: {post.viewCount.toLocaleString()}</div>
        )}

        {/* 내용 */}
        <div>
          <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>내용</label>
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            disabled={isView}
            rows={6}
          />
        </div>

        {/* 첨부파일 */}
        {useAttachment && (
          <div>
            <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>첨부파일</label>
            <Upload
              action="/api/common/board/attachments"
              listType="text"
              multiple
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList)}
              onPreview={() => message.info('Mock 환경에서는 파일 미리보기를 지원하지 않습니다')}
              disabled={isView}
            >
              {!isView && (
                <Button icon={<UploadOutlined />}>파일 첨부</Button>
              )}
            </Upload>
          </div>
        )}

        {/* 댓글 */}
        {useComment && isView && post && (
          <div>
            <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>댓글</label>
            <List
              size="small"
              dataSource={comments}
              renderItem={(comment) => (
                <List.Item
                  actions={[
                    <Button
                      key="del"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={`${comment.authorName} · ${new Date(comment.createdAt).toLocaleDateString()}`}
                    description={comment.content}
                  />
                </List.Item>
              )}
            />
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onPressEnter={() => {
                  if (newComment.trim()) addCommentMutation.mutate()
                }}
              />
              <Button
                type="primary"
                loading={addCommentMutation.isPending}
                onClick={() => {
                  if (newComment.trim()) addCommentMutation.mutate()
                }}
              >
                등록
              </Button>
            </Space.Compact>
          </div>
        )}
      </Space>
    </Modal>
  )
}
