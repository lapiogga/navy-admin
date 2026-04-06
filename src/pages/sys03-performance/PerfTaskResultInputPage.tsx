import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Input, Slider, Popconfirm, Tag, Alert } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { TaskResult } from '@/shared/api/mocks/handlers/sys03-performance'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: '미입력', color: 'default' },
  pending: { label: '상신', color: 'processing' },
  approved: { label: '승인', color: 'success' },
  rejected: { label: '반려', color: 'error' },
}

async function fetchTaskResults(params: PageRequest): Promise<PageResponse<TaskResult>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<TaskResult>>>('/sys03/task-results', {
    params: { current: params.page + 1, pageSize: params.size },
  })
  return (res as ApiResult<PageResponse<TaskResult>>).data ?? (res as unknown as PageResponse<TaskResult>)
}

export default function PerfTaskResultInputPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TaskResult | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<TaskResult>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/task-results/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/task-results', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'task-results'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const submitMutation = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/sys03/task-results/${id}/submit`),
    onSuccess: () => {
      message.success('상신되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'task-results'] })
      actionRef.current?.reload()
    },
    onError: () => message.error('상신에 실패했습니다.'),
  })

  const columns: ProColumns<TaskResult>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '상세과제명', dataIndex: 'detailTaskTitle' },
    { title: '부대(서)', dataIndex: 'deptName', width: 120 },
    {
      title: '진도율(%)',
      dataIndex: 'progressRate',
      width: 100,
      render: (val) => `${String(val)}%`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={STATUS_MAP[record.status]?.color ?? 'default'}>
          {STATUS_MAP[record.status]?.label ?? record.status}
        </Tag>
      ),
    },
    { title: '상신일', dataIndex: 'submittedAt', width: 110 },
    {
      title: '관리',
      width: 160,
      render: (_, record) => (
        <>
          {record.status === 'draft' || record.status === 'rejected' ? (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setEditTarget(record)
                  form.setFieldsValue(record)
                  setModalOpen(true)
                }}
              >
                수정
              </Button>
              <Popconfirm
                title="상신하시겠습니까?"
                onConfirm={() => submitMutation.mutate(record.id)}
              >
                <Button type="link" size="small">
                  상신
                </Button>
              </Popconfirm>
            </>
          ) : null}
        </>
      ),
    },
  ]

  return (
    <PageContainer title="업무실적 입력">
      <DataTable<TaskResult>
        rowKey="id"
        columns={columns}
        headerTitle="업무실적 목록"
        actionRef={actionRef}
        request={(params) => fetchTaskResults(params)}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setEditTarget(null)
              form.resetFields()
              setModalOpen(true)
            }}
          >
            업무실적 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '업무실적 수정' : '업무실적 등록'}
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
          form.resetFields()
        }}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
          {editTarget?.rejectedReason && (
            <Alert
              message={`반려 사유: ${editTarget.rejectedReason}`}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Form.Item name="content" label="진행 내용" rules={[{ required: true, message: '진행 내용을 입력하세요' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="progressRate" label="진도율 (%)">
            <Slider min={0} max={100} marks={{ 0: '0%', 50: '50%', 100: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
