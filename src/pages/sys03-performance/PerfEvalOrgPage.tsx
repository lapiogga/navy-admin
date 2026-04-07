import { useState, useRef } from 'react'
import { Modal, Button, message, Switch, Form, Input, Tabs, Transfer } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { EvalOrg, EvalGroup } from '@/shared/api/mocks/handlers/sys03-performance'

/** 평가대상부서 검색 필드 */
const orgSearchFields: SearchField[] = [
  { name: 'keyword', label: '부대(서)명/코드', type: 'text', placeholder: '부대(서)명 또는 코드 검색' },
]

/** 평가그룹 검색 필드 */
const groupSearchFields: SearchField[] = [
  { name: 'keyword', label: '그룹명', type: 'text', placeholder: '그룹명 검색' },
]

async function fetchEvalOrgs(params: PageRequest & { keyword?: string }): Promise<PageResponse<EvalOrg>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<EvalOrg>>>('/sys03/eval-orgs', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword },
  })
  return (res as ApiResult<PageResponse<EvalOrg>>).data ?? (res as unknown as PageResponse<EvalOrg>)
}

async function fetchEvalGroups(params: PageRequest & { keyword?: string }): Promise<PageResponse<EvalGroup>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<EvalGroup>>>('/sys03/eval-groups', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword },
  })
  return (res as ApiResult<PageResponse<EvalGroup>>).data ?? (res as unknown as PageResponse<EvalGroup>)
}

async function fetchAllOrgs(): Promise<EvalOrg[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<EvalOrg>>>('/sys03/eval-orgs', {
    params: { current: 1, pageSize: 100 },
  })
  const data = (res as ApiResult<PageResponse<EvalOrg>>).data ?? (res as unknown as PageResponse<EvalOrg>)
  return data.content ?? []
}

// 평가 대상 부서 탭
function EvalOrgTab() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EvalOrg | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EvalOrg | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<EvalOrg>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/eval-orgs/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/eval-orgs', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'eval-orgs'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/eval-orgs/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'eval-orgs'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<EvalOrg>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '부대(서)명', dataIndex: 'deptName' },
    { title: '부서코드', dataIndex: 'deptCode', width: 120 },
    {
      title: '활성여부',
      dataIndex: 'isActive',
      width: 100,
      render: (_, record) => <Switch checked={record.isActive} size="small" disabled />,
    },
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
    <>
      <SearchForm fields={orgSearchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<EvalOrg>
        rowKey="id"
        columns={columns}
        headerTitle="평가 대상 부대(서) 목록"
        actionRef={actionRef}
        request={(params) => fetchEvalOrgs({ ...params, ...searchParams } as PageRequest & { keyword?: string })}
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
            부대(서) 등록
          </Button>,
        ]}
      />
      <Modal
        title={editTarget ? '부대(서) 수정' : '부대(서) 등록'}
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
          <Form.Item name="deptName" label="부대(서)명" rules={[{ required: true, message: '부대(서)명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="deptCode" label="부서코드" rules={[{ required: true, message: '부서코드를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="활성여부" valuePropName="checked">
            <Switch />
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
        <p>부대(서) &quot;{deleteTarget?.deptName}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </>
  )
}

// 평가그룹 탭
function EvalGroupTab() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EvalGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EvalGroup | null>(null)
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const { data: allOrgs = [] } = useQuery({
    queryKey: ['sys03', 'eval-orgs', 'all'],
    queryFn: fetchAllOrgs,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<EvalGroup>) => {
      const payload = { ...values, deptIds: targetKeys, deptCount: targetKeys.length }
      if (editTarget) {
        return apiClient.put(`/sys03/eval-groups/${editTarget.id}`, payload)
      }
      return apiClient.post('/sys03/eval-groups', payload)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'eval-groups'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      setTargetKeys([])
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/eval-groups/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'eval-groups'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<EvalGroup>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '그룹명', dataIndex: 'groupName' },
    { title: '포함 부대(서) 수', dataIndex: 'deptCount', width: 130 },
    {
      title: '활성여부',
      dataIndex: 'isActive',
      width: 100,
      render: (_, record) => <Switch checked={record.isActive} size="small" disabled />,
    },
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
              setTargetKeys(record.deptIds as string[])
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

  const transferData = allOrgs.map((org) => ({
    key: org.id,
    title: org.deptName,
  }))

  return (
    <>
      <SearchForm fields={groupSearchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<EvalGroup>
        rowKey="id"
        columns={columns}
        headerTitle="평가그룹 목록"
        actionRef={actionRef}
        request={(params) => fetchEvalGroups({ ...params, ...searchParams } as PageRequest & { keyword?: string })}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setEditTarget(null)
              setTargetKeys([])
              form.resetFields()
              setModalOpen(true)
            }}
          >
            평가그룹 등록
          </Button>,
        ]}
      />
      <Modal
        title={editTarget ? '평가그룹 수정' : '평가그룹 등록'}
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
          setTargetKeys([])
          form.resetFields()
        }}
        confirmLoading={saveMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
          <Form.Item name="groupName" label="그룹명" rules={[{ required: true, message: '그룹명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="포함 부대(서)">
            <Transfer
              dataSource={transferData}
              targetKeys={targetKeys}
              onChange={(keys) => setTargetKeys(keys as string[])}
              render={(item) => item.title ?? ''}
              showSearch
              titles={['전체 부대(서)', '선택된 부대(서)']}
            />
          </Form.Item>
          <Form.Item name="isActive" label="활성여부" valuePropName="checked">
            <Switch />
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
        <p>평가그룹 &quot;{deleteTarget?.groupName}&quot;을(를) 삭제하시겠습니까?</p>
      </Modal>
    </>
  )
}

export default function PerfEvalOrgPage() {
  return (
    <PageContainer title="평가조직 관리">
      <Tabs
        items={[
          { key: 'orgs', label: '평가 대상 부대(서)', children: <EvalOrgTab /> },
          { key: 'groups', label: '평가그룹', children: <EvalGroupTab /> },
        ]}
      />
    </PageContainer>
  )
}
