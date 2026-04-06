import { useState } from 'react'
import { Modal, Button, Input, Popconfirm, Tag, Space, Tabs, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface Suggestion extends Record<string, unknown> {
  id: string
  title: string
  authorName: string
  authorUnit: string
  status: 'registered' | 'received' | 'processing' | 'completed' | 'rejected'
  isPrivate: boolean
  recommendCount: number
  reportCount: number
  answer?: string
  answeredAt?: string
  answeredBy?: string
  createdAt: string
  updatedAt: string
}

// G25: 서식 타입
interface Template extends Record<string, unknown> {
  id: string
  name: string
  content: string
  createdAt: string
}

const STATUS_COLOR_MAP: Record<string, string> = {
  registered: 'blue',
  received: 'cyan',
  processing: 'orange',
  completed: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  registered: '등록',
  received: '접수',
  processing: '진행',
  completed: '완료',
  rejected: '반려',
}

async function fetchSuggestions(params: PageRequest): Promise<PageResponse<Suggestion>> {
  const qs = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  })
  const res = await fetch(`/api/sys14/suggestions?${qs}`)
  const json: ApiResult<PageResponse<Suggestion>> = await res.json()
  return json.data
}

// G25: 서식 목록 조회
async function fetchTemplates(): Promise<PageResponse<Template>> {
  const res = await fetch('/api/sys14/templates')
  const json: ApiResult<PageResponse<Template>> = await res.json()
  return json.data
}

// G25: 서식관리 컴포넌트
function TemplateManager() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Template | null>(null)

  const queryClient = useQueryClient()

  const TEMPLATE_FIELDS = [
    { name: 'name', label: '서식명', type: 'text' as const, required: true },
    { name: 'content', label: '서식 내용', type: 'textarea' as const, required: true },
  ]

  const createTemplateMutation = useMutation({
    mutationFn: async (values: { name: string; content: string }) => {
      const res = await fetch('/api/sys14/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('서식이 등록되었습니다')
      setFormOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['sys14', 'templates'] })
    },
  })

  const updateTemplateMutation = useMutation({
    mutationFn: async (values: { name: string; content: string }) => {
      const res = await fetch(`/api/sys14/templates/${editTarget?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('서식이 수정되었습니다')
      setFormOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['sys14', 'templates'] })
    },
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/templates/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      message.success('서식이 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys14', 'templates'] })
    },
  })

  const templateColumns: ProColumns<Template>[] = [
    { title: '번호', dataIndex: 'id', width: 100 },
    { title: '서식명', dataIndex: 'name', ellipsis: true },
    { title: '등록일', dataIndex: 'createdAt', width: 120 },
    {
      title: '액션',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditTarget(record)
              setFormOpen(true)
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={() => deleteTemplateMutation.mutate(record.id)}
            okText="확인"
            cancelText="취소"
          >
            <Button size="small" danger>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <DataTable<Template>
        columns={templateColumns}
        rowKey="id"
        request={async (_params) => {
          // 서식 목록은 고정 데이터이므로 전체 조회
          const result = await fetchTemplates()
          return result
        }}
        headerTitle="서식 목록"
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}
          >
            서식 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '서식 수정' : '서식 등록'}
        open={formOpen}
        onCancel={() => { setFormOpen(false); setEditTarget(null) }}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={TEMPLATE_FIELDS}
          initialValues={editTarget ?? {}}
          onFinish={async (values) => {
            const typed = values as { name: string; content: string }
            if (editTarget) {
              await updateTemplateMutation.mutateAsync(typed)
            } else {
              await createTemplateMutation.mutateAsync(typed)
            }
            return true
          }}
          mode={editTarget ? 'edit' : 'create'}
        />
      </Modal>
    </>
  )
}

export default function SuggestionAdminPage() {
  const [answerOpen, setAnswerOpen] = useState(false)
  const [answerTarget, setAnswerTarget] = useState<Suggestion | null>(null)
  const [answerText, setAnswerText] = useState('')

  const queryClient = useQueryClient()

  const privateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/suggestions/${id}/private`, { method: 'PATCH' })
      return res.json()
    },
    onSuccess: () => {
      message.success('비공개 처리되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const answerMutation = useMutation({
    mutationFn: async ({ id, answer }: { id: string; answer: string }) => {
      const res = await fetch(`/api/sys14/suggestions/${id}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('답변이 등록되었습니다')
      setAnswerOpen(false)
      setAnswerTarget(null)
      setAnswerText('')
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const columns: ProColumns<Suggestion>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '작성자', dataIndex: 'authorName', width: 100 },
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
    {
      title: '비공개',
      dataIndex: 'isPrivate',
      width: 80,
      render: (_, record) =>
        record.isPrivate ? <Tag color="red">비공개</Tag> : <Tag color="default">공개</Tag>,
    },
    { title: '추천', dataIndex: 'recommendCount', width: 70 },
    { title: '신고', dataIndex: 'reportCount', width: 70 },
    { title: '작성일', dataIndex: 'createdAt', width: 110 },
    {
      title: '액션',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          {!record.isPrivate && (
            <Popconfirm
              title="비공개 처리하시겠습니까?"
              onConfirm={() => privateMutation.mutate(record.id)}
              okText="확인"
              cancelText="취소"
            >
              <Button size="small">비공개</Button>
            </Popconfirm>
          )}
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setAnswerTarget(record)
              setAnswerText(record.answer ?? '')
              setAnswerOpen(true)
            }}
          >
            답변
          </Button>
        </Space>
      ),
    },
  ]

  // G25: 탭으로 제언관리 + 서식관리 배치
  const tabItems = [
    {
      key: 'manage',
      label: '제언관리',
      children: (
        <DataTable<Suggestion>
          columns={columns}
          rowKey="id"
          request={fetchSuggestions}
          headerTitle="제언 목록"
        />
      ),
    },
    {
      key: 'templates',
      label: '서식관리',
      children: <TemplateManager />,
    },
  ]

  return (
    <PageContainer title="관리자">
      <Tabs items={tabItems} />

      {/* 답변 등록 모달 */}
      <Modal
        title="답변 등록"
        open={answerOpen}
        onCancel={() => { setAnswerOpen(false); setAnswerTarget(null); setAnswerText('') }}
        onOk={() => {
          if (!answerTarget || !answerText.trim()) {
            message.warning('답변 내용을 입력하세요')
            return
          }
          answerMutation.mutate({ id: answerTarget.id, answer: answerText })
        }}
        okText="등록"
        cancelText="취소"
        destroyOnClose
      >
        <div style={{ marginBottom: 8 }}>
          <strong>{answerTarget?.title}</strong>
        </div>
        <Input.TextArea
          rows={5}
          placeholder="답변 내용을 입력하세요"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
        />
      </Modal>
    </PageContainer>
  )
}
