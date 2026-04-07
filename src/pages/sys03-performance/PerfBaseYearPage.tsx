import { useState, useRef } from 'react'
import { Modal, Button, message, Switch, Form, Input } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { BaseYear } from '@/shared/api/mocks/handlers/sys03-performance'

/** 검색 필드 정의 */
const searchFields: SearchField[] = [
  { name: 'keyword', label: '기준년도', type: 'text', placeholder: '기준년도 검색' },
]

async function fetchBaseYears(params: PageRequest & { keyword?: string }): Promise<PageResponse<BaseYear>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<BaseYear>>>('/sys03/base-years', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword },
  })
  return (res as ApiResult<PageResponse<BaseYear>>).data ?? (res as unknown as PageResponse<BaseYear>)
}

export default function PerfBaseYearPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BaseYear | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BaseYear | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<BaseYear>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/base-years/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/base-years', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'base-years'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/base-years/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'base-years'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<BaseYear>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '기준년도', dataIndex: 'year', width: 120 },
    {
      title: '활성여부',
      dataIndex: 'isActive',
      width: 100,
      render: (_, record) => (
        <Switch checked={record.isActive} size="small" disabled />
      ),
    },
    { title: '등록일', dataIndex: 'createdAt', width: 120 },
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
    <PageContainer title="기준년도 관리">
      <SearchForm fields={searchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<BaseYear>
        rowKey="id"
        columns={columns}
        headerTitle="기준년도 목록"
        actionRef={actionRef}
        request={(params) => fetchBaseYears({ ...params, ...searchParams } as PageRequest & { keyword?: string })}
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
            기준년도 등록
          </Button>,
        ]}
      />

      {/* 등록/수정 Modal */}
      <Modal
        title={editTarget ? '기준년도 수정' : '기준년도 등록'}
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
          form.resetFields()
        }}
        confirmLoading={saveMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => saveMutation.mutate(values)}
        >
          <Form.Item name="year" label="기준년도" rules={[{ required: true, message: '기준년도를 입력하세요' }]}>
            <Input placeholder="예) 2025" maxLength={4} />
          </Form.Item>
          <Form.Item name="isActive" label="활성여부" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 Modal */}
      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        confirmLoading={deleteMutation.isPending}
        okText="삭제"
        okButtonProps={{ danger: true }}
      >
        <p>기준년도 &quot;{deleteTarget?.year}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
