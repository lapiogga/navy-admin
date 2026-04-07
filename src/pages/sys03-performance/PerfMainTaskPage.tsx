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
import type { MainTask, Policy } from '@/shared/api/mocks/handlers/sys03-performance'

/** 검색 필드 정의 */
const searchFields: SearchField[] = [
  { name: 'keyword', label: '과제명/지휘방침', type: 'text', placeholder: '과제명 또는 지휘방침 검색' },
]

async function fetchMainTasks(params: PageRequest & { keyword?: string }): Promise<PageResponse<MainTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<MainTask>>>('/sys03/main-tasks', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword },
  })
  return (res as ApiResult<PageResponse<MainTask>>).data ?? (res as unknown as PageResponse<MainTask>)
}

async function fetchAllPolicies(): Promise<Policy[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Policy>>>('/sys03/policies', {
    params: { current: 1, pageSize: 100 },
  })
  const data = (res as ApiResult<PageResponse<Policy>>).data ?? (res as unknown as PageResponse<Policy>)
  return data.content ?? []
}

export default function PerfMainTaskPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MainTask | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MainTask | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const { data: policies = [] } = useQuery({
    queryKey: ['sys03', 'policies', 'all'],
    queryFn: fetchAllPolicies,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<MainTask>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/main-tasks/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/main-tasks', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'main-tasks'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/main-tasks/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'main-tasks'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<MainTask>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '지휘방침', dataIndex: 'policyTitle' },
    { title: '추진중점과제명', dataIndex: 'title' },
    { title: '순서', dataIndex: 'orderNo', width: 80 },
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
    <PageContainer title="추진중점과제 관리">
      <SearchForm fields={searchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<MainTask>
        rowKey="id"
        columns={columns}
        headerTitle="추진중점과제 목록"
        actionRef={actionRef}
        request={(params) => fetchMainTasks({ ...params, ...searchParams } as PageRequest & { keyword?: string })}
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
            추진중점과제 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '추진중점과제 수정' : '추진중점과제 등록'}
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
          <Form.Item name="policyId" label="지휘방침" rules={[{ required: true, message: '지휘방침을 선택하세요' }]}>
            <Select
              options={policies.map((p) => ({ label: `[${p.year}] ${p.title}`, value: p.id }))}
              placeholder="지휘방침 선택"
            />
          </Form.Item>
          <Form.Item name="title" label="추진중점과제명" rules={[{ required: true, message: '과제명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="orderNo" label="순서">
            <InputNumber min={1} style={{ width: '100%' }} />
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
        <p>추진중점과제 &quot;{deleteTarget?.title}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
