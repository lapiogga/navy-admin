import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Input, Select } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { SubTask, MidTask } from '@/shared/api/mocks/handlers/sys03-performance'

const DEPT_NAMES = ['작전처', '정보처', '인사처', '군수처', '기획처', '교육훈련처', '통신처', '동원처']

async function fetchSubTasks(params: PageRequest): Promise<PageResponse<SubTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SubTask>>>('/sys03/sub-tasks', {
    params: { current: params.page + 1, pageSize: params.size },
  })
  return (res as ApiResult<PageResponse<SubTask>>).data ?? (res as unknown as PageResponse<SubTask>)
}

async function fetchAllMidTasks(): Promise<MidTask[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<MidTask>>>('/sys03/mid-tasks', {
    params: { current: 1, pageSize: 100 },
  })
  const data = (res as ApiResult<PageResponse<MidTask>>).data ?? (res as unknown as PageResponse<MidTask>)
  return data.content ?? []
}

export default function PerfSubTaskPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SubTask | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubTask | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const { data: midTasks = [] } = useQuery({
    queryKey: ['sys03', 'mid-tasks', 'all'],
    queryFn: fetchAllMidTasks,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<SubTask>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/sub-tasks/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/sub-tasks', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'sub-tasks'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/sub-tasks/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'sub-tasks'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const exportMutation = useMutation({
    mutationFn: async () => apiClient.post('/sys03/sub-tasks/export'),
    onSuccess: () => message.success('엑셀 파일 준비 완료'),
    onError: () => message.error('다운로드에 실패했습니다.'),
  })

  const columns: ProColumns<SubTask>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '중과제', dataIndex: 'midTaskTitle' },
    { title: '소과제명', dataIndex: 'title' },
    { title: '부대(서)', dataIndex: 'deptName', width: 120 },
    { title: '목표값', dataIndex: 'targetValue', width: 120 },
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
    <PageContainer title="소과제 관리">
      <DataTable<SubTask>
        rowKey="id"
        columns={columns}
        headerTitle="소과제 목록"
        actionRef={actionRef}
        request={(params) => fetchSubTasks(params)}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => exportMutation.mutate()}
            loading={exportMutation.isPending}
          >
            엑셀 저장
          </Button>,
          <Button key="import" icon={<UploadOutlined />}>
            일괄 등록
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setEditTarget(null)
              form.resetFields()
              setModalOpen(true)
            }}
          >
            소과제 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '소과제 수정' : '소과제 등록'}
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
          <Form.Item name="midTaskId" label="중과제" rules={[{ required: true, message: '중과제를 선택하세요' }]}>
            <Select
              options={midTasks.map((m) => ({ label: m.title, value: m.id }))}
              placeholder="중과제 선택"
            />
          </Form.Item>
          <Form.Item name="title" label="소과제명" rules={[{ required: true, message: '소과제명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deptName" label="부대(서)" rules={[{ required: true, message: '부대(서)를 선택하세요' }]}>
            <Select options={DEPT_NAMES.map((d) => ({ label: d, value: d }))} />
          </Form.Item>
          <Form.Item name="targetValue" label="목표값" rules={[{ required: true, message: '목표값을 입력하세요' }]}>
            <Input placeholder="예) 100건" />
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
        <p>소과제 &quot;{deleteTarget?.title}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
