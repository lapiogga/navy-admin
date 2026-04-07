import { ReactNode } from 'react'
import { Card, List, Row, Col, Button, Typography, Empty, Spin } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/date'

const { Title, Text } = Typography

interface RecentPost {
  id: string
  title: string
  authorName: string
  createdAt: string
  viewCount: number
}

interface SubsystemHomePageProps {
  sysCode: string
  title: string
  dashboard?: ReactNode
  noticeBoardPath: string
  qnaBoardPath: string
}

async function fetchRecentPosts(boardId: string): Promise<RecentPost[]> {
  const res = await apiClient.get<never, ApiResult<RecentPost[]>>(
    `/common/boards/${boardId}/recent`,
    { params: { limit: 5 } },
  )
  return (res as ApiResult<RecentPost[]>).data ?? (res as unknown as RecentPost[])
}

function RecentBoardCard({
  title,
  boardId,
  morePath,
}: {
  title: string
  boardId: string
  morePath: string
}) {
  const navigate = useNavigate()
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['board-recent', boardId],
    queryFn: () => fetchRecentPosts(boardId),
  })

  return (
    <Card
      title={title}
      extra={
        <Button type="link" size="small" onClick={() => navigate(morePath)}>
          더보기 <RightOutlined />
        </Button>
      }
      style={{ height: '100%' }}
    >
      <Spin spinning={isLoading}>
        {posts.length === 0 && !isLoading ? (
          <Empty description="등록된 글이 없습니다" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            size="small"
            dataSource={posts}
            renderItem={(item, idx) => (
              <List.Item style={{ padding: '6px 0' }}>
                <Text type="secondary" style={{ minWidth: 24 }}>{idx + 1}</Text>
                <Text ellipsis style={{ flex: 1, marginLeft: 8 }}>{item.title}</Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12, whiteSpace: 'nowrap' }}>
                  {formatDate(item.createdAt)}
                </Text>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )
}

export function SubsystemHomePage({
  sysCode,
  title,
  dashboard,
  noticeBoardPath,
  qnaBoardPath,
}: SubsystemHomePageProps) {
  return (
    <div>
      {/* 상단영역: 200px, 타이틀 40pt, 해군 네이비 블루 그라데이션 */}
      <div
        style={{
          height: 200,
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 50%, #1E3A5F 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <Title
          level={1}
          style={{
            color: '#FFFFFF',
            fontSize: 40,
            margin: 0,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          {title}
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 14 }}>
          해병대 행정포탈 시스템
        </Text>
      </div>

      {/* 중단영역: 대시보드 (optional) */}
      {dashboard && (
        <div style={{ marginBottom: 24 }}>
          {dashboard}
        </div>
      )}

      {/* 하단영역: 공지사항 / 질의응답 2분할 */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <RecentBoardCard
            title="공지사항"
            boardId={`${sysCode}-notice`}
            morePath={noticeBoardPath}
          />
        </Col>
        <Col xs={24} md={12}>
          <RecentBoardCard
            title="질의응답"
            boardId={`${sysCode}-qna`}
            morePath={qnaBoardPath}
          />
        </Col>
      </Row>
    </div>
  )
}
