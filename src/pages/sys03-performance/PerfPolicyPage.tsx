import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Input, Select, InputNumber } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { Policy } from '@/shared/api/mocks/handlers/sys03-performance'

const YEARS = ['2022', '2023', '2024', '2025', '2026']

/** 검색 필드 정의 */
const searchFields: SearchField[] = [
  { name: 'keyword', label: '지휘방침명', type: 'text', placeholder: '지휘방침명 검색' },
  { name: 'year', label: '기준년도', type: 'select', options: YEARS.map((y) => ({ label: y, value: y })) },
]

async function fetchPolicies(params: PageRequest & { keyword?: string; year?: string }): Promise<PageResponse<Policy>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Policy>>>('/sys03/policies', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword, year: params.year },
  })
  return (res as ApiResult<PageResponse<Policy>>).data ?? (res as unknown as PageResponse<Policy>)
}

export default function PerfPolicyPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Policy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<Policy>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/policies/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/policies', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'policies'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/policies/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'policies'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<Policy>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '기준년도', dataIndex: 'year', width: 100 },
    { title: '지휘방침명', dataIndex: 'title' },
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
    <PageContainer title="지휘방침 관리">
      <SearchForm fields={searchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<Policy>
        rowKey="id"
        columns={columns}
        headerTitle="지휘방침 목록"
        actionRef={actionRef}
        request={(params) => fetchPolicies({ ...params, ...searchParams } as PageRequest & { keyword?: string; year?: string })}
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
            지휘방침 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '지휘방침 수정' : '지휘방침 등록'}
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
          <Form.Item name="year" label="기준년도" rules={[{ required: true, message: '기준년도를 선택하세요' }]}>
            <Select options={YEARS.map((y) => ({ label: y, value: y }))} />
          </Form.Item>
          <Form.Item name="title" label="지휘방침명" rules={[{ required: true, message: '지휘방침명을 입력하세요' }]}>
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
        <p>지휘방침 &quot;{deleteTarget?.title}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
