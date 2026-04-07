import { useState } from 'react'
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Rate,
  Button,
  Space,
  Input,
  List,
  Divider,
  message,
  Popconfirm,
} from 'antd'
import {
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
  StarOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiResult } from '@/shared/api/types'
import { formatMilitaryPerson } from '@/shared/lib/military'
import type { Knowledge, KnowledgeComment } from '@/shared/api/mocks/handlers/sys13'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface KnowledgeDetailPageProps {
  knowledge: Knowledge
  onClose?: () => void
}

export default function KnowledgeDetailPage({ knowledge, onClose }: KnowledgeDetailPageProps) {
  const queryClient = useQueryClient()
  const [commentInput, setCommentInput] = useState('')
  const [userRating, setUserRating] = useState<number>(0)
  const [hasRecommended, setHasRecommended] = useState(false)
  const [hasUnrecommended, setHasUnrecommended] = useState(false)

  // 댓글 목록 조회
  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ['sys13-comments', knowledge.id],
    queryFn: async () => {
      const res = await fetch(`/api/sys13/knowledge/${knowledge.id}/comments`)
      const json: ApiResult<KnowledgeComment[]> = await res.json()
      return json.data || []
    },
  })

  const comments = commentsData || []

  // 추천 뮤테이션
  const recommendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sys13/knowledge/${knowledge.id}/recommend`, { method: 'POST' })
      const json: ApiResult<null> = await res.json()
      if (!json.success) throw new Error('추천 처리 실패')
    },
    onSuccess: () => {
      setHasRecommended(true)
      setHasUnrecommended(false)
      void message.success('추천했습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
    },
  })

  // 비추천 뮤테이션
  const unrecommendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sys13/knowledge/${knowledge.id}/unrecommend`, { method: 'POST' })
      const json: ApiResult<null> = await res.json()
      if (!json.success) throw new Error('비추천 처리 실패')
    },
    onSuccess: () => {
      setHasUnrecommended(true)
      setHasRecommended(false)
      void message.success('비추천했습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
    },
  })

  // 평점 뮤테이션
  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await fetch(`/api/sys13/knowledge/${knowledge.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
      const json: ApiResult<null> = await res.json()
      if (!json.success) throw new Error('평점 처리 실패')
    },
    onSuccess: () => {
      void message.success('평점을 등록했습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
    },
  })

  // 신고 뮤테이션
  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sys13/knowledge/${knowledge.id}/report`, { method: 'POST' })
      const json: ApiResult<null> = await res.json()
      if (!json.success) throw new Error('신고 처리 실패')
    },
    onSuccess: () => {
      void message.success('신고가 접수되었습니다')
    },
  })

  // 댓글 등록 뮤테이션
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/sys13/knowledge/${knowledge.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const json: ApiResult<KnowledgeComment> = await res.json()
      if (!json.success) throw new Error('댓글 등록 실패')
    },
    onSuccess: () => {
      setCommentInput('')
      void refetchComments()
      void message.success('댓글이 등록되었습니다')
    },
  })

  // 댓글 삭제 뮤테이션
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/sys13/knowledge/${knowledge.id}/comments/${commentId}`, { method: 'DELETE' })
      const json: ApiResult<null> = await res.json()
      if (!json.success) throw new Error('댓글 삭제 실패')
    },
    onSuccess: () => {
      void refetchComments()
      void message.success('댓글이 삭제되었습니다')
    },
  })

  const handleAddComment = () => {
    if (!commentInput.trim()) {
      void message.warning('댓글 내용을 입력하세요')
      return
    }
    addCommentMutation.mutate(commentInput)
  }

  return (
    <div style={{ padding: '0 4px' }}>
      {/* 제목 + 카테고리 */}
      <Space style={{ marginBottom: 12 }}>
        <Tag color="blue">{knowledge.category}</Tag>
        {knowledge.source === '카피' && <Tag color="orange">카피</Tag>}
      </Space>
      <Title level={4} style={{ marginTop: 0, marginBottom: 12 }}>
        {knowledge.title}
      </Title>

      {/* 메타 정보 */}
      <Descriptions size="small" bordered column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="작성자">
          {formatMilitaryPerson({
            serviceNumber: knowledge.serviceNumber,
            rank: knowledge.rank,
            name: knowledge.authorName,
          })}
        </Descriptions.Item>
        <Descriptions.Item label="소속">{knowledge.authorUnit}</Descriptions.Item>
        <Descriptions.Item label="등록일">{knowledge.createdAt}</Descriptions.Item>
        <Descriptions.Item label="출처">{knowledge.source}</Descriptions.Item>
        <Descriptions.Item label="조회수">{knowledge.viewCount}</Descriptions.Item>
        <Descriptions.Item label="상태">
          <Tag>{knowledge.status}</Tag>
        </Descriptions.Item>
      </Descriptions>

      {/* 키워드 */}
      {knowledge.keywords.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>키워드: </Text>
          {knowledge.keywords.map((kw, i) => (
            <Tag key={i} style={{ marginBottom: 4 }}>
              {kw}
            </Tag>
          ))}
        </div>
      )}

      {/* 본문 */}
      <Card style={{ marginBottom: 16 }}>
        <Paragraph>{knowledge.content}</Paragraph>
      </Card>

      {/* 첨부파일 */}
      {knowledge.attachments.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>첨부파일</Text>
          <List
            size="small"
            dataSource={knowledge.attachments}
            renderItem={(file) => (
              <List.Item>
                <Button type="link" href={file} target="_blank">
                  {file}
                </Button>
              </List.Item>
            )}
          />
        </div>
      )}

      <Divider />

      {/* 평점 + 추천/비추천 영역 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 평점 */}
          <div>
            <Text strong>평점: </Text>
            <Rate
              allowHalf
              value={userRating || knowledge.rating}
              onChange={(val) => {
                setUserRating(val)
                rateMutation.mutate(val)
              }}
            />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              ({knowledge.ratingCount}명 참여, 평균 {knowledge.rating}점)
            </Text>
          </div>

          {/* 추천/비추천/신고 */}
          <Space>
            <Button
              icon={hasRecommended ? <LikeFilled /> : <LikeOutlined />}
              type={hasRecommended ? 'primary' : 'default'}
              onClick={() => !hasRecommended && recommendMutation.mutate()}
              loading={recommendMutation.isPending}
              disabled={hasRecommended}
            >
              추천 ({knowledge.recommendCount})
            </Button>
            <Button
              icon={hasUnrecommended ? <DislikeFilled /> : <DislikeOutlined />}
              type={hasUnrecommended ? 'default' : 'default'}
              onClick={() => !hasUnrecommended && unrecommendMutation.mutate()}
              loading={unrecommendMutation.isPending}
              disabled={hasUnrecommended}
            >
              비추천
            </Button>
            <Button
              icon={<StarOutlined />}
              onClick={async () => {
                await fetch(`/api/sys13/knowledge/${knowledge.id}/favorite`, { method: 'POST' })
                void message.success('즐겨찾기가 변경되었습니다')
              }}
            >
              {knowledge.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
            </Button>
            <Popconfirm
              title="이 지식을 신고하시겠습니까?"
              onConfirm={() => reportMutation.mutate()}
              okText="신고"
              cancelText="취소"
            >
              <Button icon={<WarningOutlined />} danger>
                신고
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      </Card>

      {/* 댓글 영역 */}
      <div>
        <Text strong style={{ fontSize: 15 }}>
          댓글 ({comments.length})
        </Text>
        <Divider style={{ margin: '8px 0' }} />

        {/* 댓글 목록 */}
        {comments.length > 0 && (
          <List
            size="small"
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    danger
                    size="small"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                  >
                    삭제
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{comment.authorName}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {comment.createdAt}
                      </Text>
                    </Space>
                  }
                  description={comment.content}
                />
              </List.Item>
            )}
            style={{ marginBottom: 12 }}
          />
        )}

        {/* 댓글 작성 */}
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            placeholder="댓글을 입력하세요"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows={2}
            style={{ flex: 1 }}
          />
        </Space.Compact>
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={handleAddComment}
            loading={addCommentMutation.isPending}
          >
            댓글 등록
          </Button>
        </div>
      </div>

      {onClose && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={onClose}>닫기</Button>
        </div>
      )}
    </div>
  )
}
