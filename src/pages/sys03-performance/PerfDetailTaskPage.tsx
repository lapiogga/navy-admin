import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Input, Select, InputNumber } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { DetailTask, SubTask } from '@/shared/api/mocks/handlers/sys03-performance'

const DEPT_NAMES = ['작전처', '정보처', '인사처', '군수처', '기획처', '교육훈련처', '통신처', '동원처']

async function fetchDetailTasks(params: PageRequest): Promise<PageResponse<DetailTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<DetailTask>>>('/sys03/detail-tasks', {
    params: { current: params.page + 1, pageSize: params.size },
  })
  return (res as ApiResult<PageResponse<DetailTask>>).data ?? (res as unknown as PageResponse<DetailTask>)
}

async function fetchAllSubTasks(): Promise<SubTask[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SubTask>>>('/sys03/sub-tasks', {
    params: { current: 1, pageSize: 100 },
  })
  const data = (res as ApiResult<PageResponse<SubTask>>).data ?? (res as unknown as PageResponse<SubTask>)
  return data.content ?? []
}

export default function PerfDetailTaskPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DetailTask | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DetailTask | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const { data: subTasks = [] } = useQuery({
    queryKey: ['sys03', 'sub-tasks', 'all'],
    queryFn: fetchAllSubTasks,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<DetailTask>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/detail-tasks/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/detail-tasks', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'detail-tasks'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/detail-tasks/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'detail-tasks'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<DetailTask>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '소과제', dataIndex: 'subTaskTitle' },
    { title: '상세과제명', dataIndex: 'title' },
    { title: '부대(서)', dataIndex: 'deptName', width: 120 },
    { title: '담당자', dataIndex: 'manager', width: 100 },
    { title: '가중치(%)', dataIndex: 'weight', width: 100 },
    {
      title: '관리',
      width: 120,
      render: (_, record) => (
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
          <Button type="link" size="small" danger onClick={() => setDeleteTarget(record)}>
            삭제
          </Button>
        </>
      ),
    },
  ]

  return (
    <PageContainer title="상세과제 관리">
      <DataTable<DetailTask>
        rowKey="id"
        columns={columns}
        headerTitle="상세과제 목록"
        actionRef={actionRef}
        request={(params) => fetchDetailTasks(params)}
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
            상세과제 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '상세과제 수정' : '상세과제 등록'}
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
          <Form.Item name="subTaskId" label="소과제" rules={[{ required: true, message: '소과제를 선택하세요' }]}>
            <Select
              options={subTasks.map((s) => ({ label: s.title, value: s.id }))}
              placeholder="소과제 선택"
            />
          </Form.Item>
          <Form.Item name="title" label="상세과제명" rules={[{ required: true, message: '상세과제명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deptName" label="부대(서)" rules={[{ required: true, message: '부대(서)를 선택하세요' }]}>
            <Select options={DEPT_NAMES.map((d) => ({ label: d, value: d }))} />
          </Form.Item>
          <Form.Item name="manager" label="담당자" rules={[{ required: true, message: '담당자를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="weight" label="가중치(%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        confirmLoading={deleteMutation.isPending}
        okText="삭제"
        okButtonProps={{ danger: true }}
      >
        <p>상세과제 &quot;{deleteTarget?.title}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
