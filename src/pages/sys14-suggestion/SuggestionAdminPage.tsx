import { useState } from 'react'
import { Modal, Button, Input, Popconfirm, Tag, Space, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface Suggestion {
  id: string
  title: string
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

async function fetchSuggestions(params: PageRequest): Promise<PageResponse<Suggestion>> {
  const qs = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  })
  const res = await fetch(`/api/sys14/suggestions?${qs}`)
  const json: ApiResult<PageResponse<Suggestion>> = await res.json()
  return json.data
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

  return (
    <PageContainer title="제언관리 (관리자)">
      <DataTable<Suggestion>
        columns={columns}
        rowKey="id"
        request={fetchSuggestions}
        headerTitle="제언 목록"
      />

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
