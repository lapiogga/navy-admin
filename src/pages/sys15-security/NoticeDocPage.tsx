import { useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { NoticeDoc } from '@/shared/api/mocks/handlers/sys15-security'

const UNIT_OPTIONS = [
  { label: '1함대', value: '1함대' },
  { label: '2함대', value: '2함대' },
  { label: '3함대', value: '3함대' },
  { label: '해군사령부', value: '해군사령부' },
  { label: '교육사령부', value: '교육사령부' },
  { label: '군수사령부', value: '군수사령부' },
  { label: '해병대사령부', value: '해병대사령부' },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  sent: 'blue',
  confirmed: 'green',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  sent: '발송완료',
  confirmed: '확인완료',
}

const STATUS_OPTIONS = [
  { label: '작성중', value: 'draft' },
  { label: '발송완료', value: 'sent' },
  { label: '확인완료', value: 'confirmed' },
]

async function fetchNoticeDocs(params: PageRequest): Promise<PageResponse<NoticeDoc>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<NoticeDoc>>>('/api/sys15/notice-docs', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<NoticeDoc>>).data ?? (res as unknown as PageResponse<NoticeDoc>)
  return data
}

// ── 등록/수정 Modal ──
interface FormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<NoticeDoc>
  onOk: (values: Record<string, unknown>) => void
  onCancel: () => void
  loading: boolean
}

function NoticeDocFormModal({ open, mode, initialValues, onOk, onCancel, loading }: FormModalProps) {
  const [form] = Form.useForm()

  return (
    <Modal
      title={mode === 'create' ? '예고문 등록' : '예고문 수정'}
      open={open}
      onOk={() => form.validateFields().then((values) => onOk(values))}
      onCancel={() => { form.resetFields(); onCancel() }}
      confirmLoading={loading}
      okText={mode === 'create' ? '등록' : '수정'}
      width={560}
      destroyOnClose
    >
      <Form form={form} initialValues={initialValues} layout="vertical">
        <Form.Item name="secretName" label="비밀 명칭" rules={[{ required: true, message: '비밀 명칭을 입력하세요' }]}>
          <Input placeholder="비밀 문서 명칭" />
        </Form.Item>
        <Form.Item name="title" label="예고문 제목" rules={[{ required: true, message: '제목을 입력하세요' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력하세요' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="notifyDate" label="예고일자" rules={[{ required: true, message: '예고일자를 선택하세요' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="recipients" label="수신 부대(서)" rules={[{ required: true, message: '수신 부대(서)를 선택하세요' }]}>
          <Select options={UNIT_OPTIONS} mode="multiple" />
        </Form.Item>
        <Form.Item name="status" label="상태">
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function NoticeDocPage() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editRecord, setEditRecord] = useState<NoticeDoc | null>(null)

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      apiClient.post('/api/sys15/notice-docs', values),
    onSuccess: () => {
      message.success('예고문이 등록되었습니다.')
      message.info('예고문 알림이 발송되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-notice-docs'] })
      actionRef.current?.reload()
      setFormOpen(false)
    },
    onError: () => message.error('등록에 실패했습니다.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) =>
      apiClient.put(`/api/sys15/notice-docs/${id}`, values),
    onSuccess: () => {
      message.success('수정되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-notice-docs'] })
      actionRef.current?.reload()
      setFormOpen(false)
    },
    onError: () => message.error('수정에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/sys15/notice-docs/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-notice-docs'] })
      actionRef.current?.reload()
    },
  })

  const columns: ProColumns<NoticeDoc>[] = [
    { title: '문서번호', dataIndex: 'id', width: 130, render: (_, r) => r.id.slice(0, 8).toUpperCase() },
    { title: '비밀 명칭', dataIndex: 'secretName', ellipsis: true },
    { title: '예고문 제목', dataIndex: 'title', ellipsis: true },
    { title: '예고일자', dataIndex: 'notifyDate', width: 110 },
    { title: '수신자', dataIndex: 'recipients', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => (
        <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />
      ),
    },
    { title: '등록일자', dataIndex: 'createdAt', width: 110 },
    {
      title: '관리',
      valueType: 'option',
      width: 130,
      render: (_, record) => [
        <Button key="edit" type="link" size="small" onClick={() => { setFormMode('edit'); setEditRecord(record); setFormOpen(true) }}>수정</Button>,
        <Button key="delete" type="link" size="small" danger onClick={() => deleteMutation.mutate(record.id)}>삭제</Button>,
      ],
    },
  ]

  return (
    <PageContainer title="비밀 예고문 관리">
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setFormMode('create'); setEditRecord(null); setFormOpen(true) }}>
          예고문 등록
        </Button>
      </div>

      <DataTable<NoticeDoc>
        columns={columns}
        request={fetchNoticeDocs}
        rowKey="id"
        headerTitle="예고문 목록"
        actionRef={actionRef}
      />

      <NoticeDocFormModal
        open={formOpen}
        mode={formMode}
        initialValues={editRecord ?? undefined}
        onOk={(values) => {
          if (formMode === 'create') {
            createMutation.mutate(values)
          } else if (editRecord) {
            updateMutation.mutate({ id: editRecord.id, values })
          }
        }}
        onCancel={() => setFormOpen(false)}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </PageContainer>
  )
}
