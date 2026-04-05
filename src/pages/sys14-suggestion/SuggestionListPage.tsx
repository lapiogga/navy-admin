import { useState } from 'react'
import { Modal, Button, Descriptions, Space, Typography, Divider, message } from 'antd'
import { LikeOutlined, WarningOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { Text, Title } = Typography

interface Suggestion {
  id: string
  title: string
  content: string
  authorName: string
  authorUnit: string
  status: 'open' | 'answered' | 'closed'
  isPrivate: boolean
  recommendCount: number
  reportCount: number
  answer?: string
  answeredAt?: string
  answeredBy?: string
  createdAt: string
  updatedAt: string
}

const STATUS_COLOR_MAP = { open: 'cyan', answered: 'green', closed: 'default' }
const STATUS_LABEL_MAP = { open: '대기', answered: '답변완료', closed: '종료' }

const CRUD_FIELDS = [
  { name: 'title', label: '제목', type: 'text' as const, required: true },
  { name: 'content', label: '내용', type: 'textarea' as const, required: true },
]

async function fetchSuggestions(params: PageRequest & { keyword?: string }): Promise<PageResponse<Suggestion>> {
  const qs = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    ...(params.keyword ? { keyword: params.keyword } : {}),
  })
  const res = await fetch(`/api/sys14/suggestions?${qs}`)
  const json: ApiResult<PageResponse<Suggestion>> = await res.json()
  return json.data
}

async function fetchDetail(id: string): Promise<Suggestion> {
  const res = await fetch(`/api/sys14/suggestions/${id}`)
  const json: ApiResult<Suggestion> = await res.json()
  return json.data
}

export default function SuggestionListPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<Suggestion | null>(null)

  const queryClient = useQueryClient()

  const { data: detail } = useQuery({
    queryKey: ['sys14', 'detail', selectedId],
    queryFn: () => fetchDetail(selectedId!),
    enabled: !!selectedId,
  })

  const createMutation = useMutation({
    mutationFn: async (values: { title: string; content: string }) => {
      const res = await fetch('/api/sys14/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('제언이 등록되었습니다')
      setCreateOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const editMutation = useMutation({
    mutationFn: async (values: { title: string; content: string }) => {
      const res = await fetch(`/api/sys14/suggestions/${editTarget?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('제언이 수정되었습니다')
      setEditOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/suggestions/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      message.success('제언이 삭제되었습니다')
      setDetailOpen(false)
      setSelectedId(null)
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const recommendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/suggestions/${id}/recommend`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sys14', 'detail', selectedId] })
    },
  })

  const reportMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/suggestions/${id}/report`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sys14', 'detail', selectedId] })
    },
  })

  const columns: ProColumns<Suggestion>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '작성자', dataIndex: 'authorName', width: 100 },
    { title: '소속', dataIndex: 'authorUnit', width: 100 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    { title: '추천', dataIndex: 'recommendCount', width: 70 },
    { title: '작성일', dataIndex: 'createdAt', width: 110 },
  ]

  return (
    <PageContainer title="제언확인">
      <DataTable<Suggestion>
        columns={columns}
        rowKey="id"
        request={fetchSuggestions}
        headerTitle="제언 목록"
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateOpen(true)}>
            제언 작성
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => {
            setSelectedId(record.id)
            setDetailOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />

      {/* 제언 작성 모달 */}
      <Modal
        title="제언 작성"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={CRUD_FIELDS}
          onFinish={async (values) => {
            await createMutation.mutateAsync(values as { title: string; content: string })
            return true
          }}
          mode="create"
        />
      </Modal>

      {/* 제언 수정 모달 */}
      <Modal
        title="제언 수정"
        open={editOpen}
        onCancel={() => { setEditOpen(false); setEditTarget(null) }}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={CRUD_FIELDS}
          initialValues={editTarget ?? {}}
          onFinish={async (values) => {
            await editMutation.mutateAsync(values as { title: string; content: string })
            return true
          }}
          mode="edit"
        />
      </Modal>

      {/* 제언 상세 모달 */}
      <Modal
        title="제언 상세"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedId(null) }}
        footer={
          detail ? (
            <Space>
              <Button
                icon={<LikeOutlined />}
                onClick={() => recommendMutation.mutate(detail.id)}
              >
                추천 {detail.recommendCount}
              </Button>
              <Button
                icon={<WarningOutlined />}
                danger
                onClick={() => reportMutation.mutate(detail.id)}
              >
                신고 {detail.reportCount}
              </Button>
              <Button
                onClick={() => {
                  setEditTarget(detail)
                  setDetailOpen(false)
                  setEditOpen(true)
                }}
              >
                수정
              </Button>
              <Button danger onClick={() => deleteMutation.mutate(detail.id)}>
                삭제
              </Button>
            </Space>
          ) : null
        }
        width={700}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="제목" span={2}>{detail.title}</Descriptions.Item>
              <Descriptions.Item label="작성자">{detail.authorName}</Descriptions.Item>
              <Descriptions.Item label="소속">{detail.authorUnit}</Descriptions.Item>
              <Descriptions.Item label="상태">
                <StatusBadge
                  status={detail.status}
                  colorMap={STATUS_COLOR_MAP}
                  labelMap={STATUS_LABEL_MAP}
                />
              </Descriptions.Item>
              <Descriptions.Item label="작성일">{detail.createdAt}</Descriptions.Item>
              <Descriptions.Item label="내용" span={2}>
                <Text>{detail.content}</Text>
              </Descriptions.Item>
            </Descriptions>

            {/* 답변 영역 */}
            {detail.answer && (
              <>
                <Divider />
                <div style={{ background: '#f5f5f5', padding: '12px 16px', borderRadius: 4 }}>
                  <Title level={5} style={{ marginTop: 0 }}>
                    관리자 답변
                  </Title>
                  <Text>{detail.answer}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      {detail.answeredBy} · {detail.answeredAt}
                    </Text>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
