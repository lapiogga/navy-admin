import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Input, Select, InputNumber } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { MidTask, MainTask } from '@/shared/api/mocks/handlers/sys03-performance'

const DEPT_NAMES = ['작전처', '정보처', '인사처', '군수처', '기획처', '교육훈련처', '통신처', '동원처']

/** 검색 필드 정의 */
const searchFields: SearchField[] = [
  { name: 'keyword', label: '중과제명/부대(서)', type: 'text', placeholder: '중과제명 또는 부대(서) 검색' },
]

async function fetchMidTasks(params: PageRequest & { keyword?: string }): Promise<PageResponse<MidTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<MidTask>>>('/sys03/mid-tasks', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword },
  })
  return (res as ApiResult<PageResponse<MidTask>>).data ?? (res as unknown as PageResponse<MidTask>)
}

async function fetchAllMainTasks(): Promise<MainTask[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<MainTask>>>('/sys03/main-tasks', {
    params: { current: 1, pageSize: 100 },
  })
  const data = (res as ApiResult<PageResponse<MainTask>>).data ?? (res as unknown as PageResponse<MainTask>)
  return data.content ?? []
}

export default function PerfMidTaskPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MidTask | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MidTask | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const { data: mainTasks = [] } = useQuery({
    queryKey: ['sys03', 'main-tasks', 'all'],
    queryFn: fetchAllMainTasks,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<MidTask>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/mid-tasks/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/mid-tasks', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'mid-tasks'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/mid-tasks/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'mid-tasks'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<MidTask>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '추진중점과제', dataIndex: 'mainTaskTitle' },
    { title: '중과제명', dataIndex: 'title' },
    { title: '부대(서)', dataIndex: 'deptName', width: 120 },
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
    <PageContainer title="중과제 관리">
      <SearchForm fields={searchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<MidTask>
        rowKey="id"
        columns={columns}
        headerTitle="중과제 목록"
        actionRef={actionRef}
        request={(params) => fetchMidTasks({ ...params, ...searchParams } as PageRequest & { keyword?: string })}
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
            중과제 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '중과제 수정' : '중과제 등록'}
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
          <Form.Item name="mainTaskId" label="추진중점과제" rules={[{ required: true, message: '추진중점과제를 선택하세요' }]}>
            <Select
              options={mainTasks.map((m) => ({ label: m.title, value: m.id }))}
              placeholder="추진중점과제 선택"
            />
          </Form.Item>
          <Form.Item name="title" label="중과제명" rules={[{ required: true, message: '중과제명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deptName" label="부대(서)" rules={[{ required: true, message: '부대(서)를 선택하세요' }]}>
            <Select options={DEPT_NAMES.map((d) => ({ label: d, value: d }))} />
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
        <p>중과제 &quot;{deleteTarget?.title}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
