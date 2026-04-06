import { useRef, useState } from 'react'
import { Card, Tree, Button, Modal, Form, Input, Select, Space, message, Tabs } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { TreeDataNode } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface OrgTreeNode extends Record<string, unknown> {
  key: string
  title: string
  children?: OrgTreeNode[]
}

interface ExceptionRecord extends Record<string, unknown> {
  id: string
  personnelName: string
  rank: string
  department: string
  reason: string
  startDate: string
  endDate: string
  status: '적용중' | '만료'
  exceptionType: 'org' | 'single' | 'exception'
}

type ExTabKey = 'org' | 'single' | 'exception'

const TAB_LABELS: Record<ExTabKey, string> = {
  org: '체계기준 조직도',
  single: '1인사무실',
  exception: '예외처리',
}

const UNITS = ['1함대', '2함대', '3함대', '해군사령부', '교육사령부', '군수사령부', '해병대사령부']

const MOCK_TREE: OrgTreeNode[] = [
  {
    key: 'navy',
    title: '해군',
    children: [
      { key: '1fleet', title: '1함대', children: [{ key: '11div', title: '11전단' }, { key: '12div', title: '12전단' }] },
      { key: '2fleet', title: '2함대', children: [{ key: '21div', title: '21전단' }, { key: '22div', title: '22전단' }] },
      { key: '3fleet', title: '3함대', children: [{ key: '31div', title: '31전단' }] },
      { key: 'hq', title: '해군사령부' },
    ],
  },
  {
    key: 'marines',
    title: '해병대',
    children: [
      { key: 'mhq', title: '해병대사령부' },
      { key: 'm1div', title: '1사단' },
      { key: 'm2div', title: '2사단' },
    ],
  },
]

async function fetchOrgTree(): Promise<OrgTreeNode[]> {
  const res = await apiClient.get<never, ApiResult<OrgTreeNode[]>>('/sys15/org-tree')
  return (res as ApiResult<OrgTreeNode[]>).data ?? (res as unknown as OrgTreeNode[])
}

async function fetchExceptions(exType: ExTabKey, params: PageRequest & { unitId?: string }): Promise<PageResponse<ExceptionRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<ExceptionRecord>>>('/sys15/exceptions', {
    params: { ...params, exceptionType: exType },
  })
  return (res as ApiResult<PageResponse<ExceptionRecord>>).data ?? (res as unknown as PageResponse<ExceptionRecord>)
}

function ExceptionTab({ tabKey }: { tabKey: ExTabKey }) {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExceptionRecord | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ExceptionRecord | undefined>()
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>()
  const [selectedUnitName, setSelectedUnitName] = useState<string>('조직을 선택하세요')

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ['sys15', 'org-tree'],
    queryFn: fetchOrgTree,
    placeholderData: MOCK_TREE,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<ExceptionRecord>) => {
      if (editTarget) {
        return apiClient.put(`/sys15/exceptions/${editTarget.id}`, values)
      }
      return apiClient.post('/sys15/exceptions', { ...values, exceptionType: tabKey, unitId: selectedUnit })
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15', 'exceptions', tabKey, selectedUnit] })
      actionRef.current?.reload()
      setOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys15/exceptions/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15', 'exceptions', tabKey, selectedUnit] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<ExceptionRecord>[] = [
    { title: '성명', dataIndex: 'personnelName', width: 100 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '부대(서)', dataIndex: 'department', width: 140 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    { title: '시작일', dataIndex: 'startDate', width: 110 },
    { title: '종료일', dataIndex: 'endDate', width: 110 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (val) => (
        <span style={{ color: val === '적용중' ? '#52c41a' : '#ff4d4f' }}>{val as string}</span>
      ),
    },
    {
      title: '관리',
      width: 110,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditTarget(record)
              form.setFieldsValue(record)
              setOpen(true)
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteTarget(record)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* 좌측 조직 트리 */}
      <Card
        title="조직 계층"
        style={{ width: 280, flexShrink: 0, height: 'fit-content' }}
        loading={treeLoading}
      >
        <Tree
          treeData={treeData as TreeDataNode[]}
          onSelect={(selectedKeys, info) => {
            if (selectedKeys.length > 0) {
              setSelectedUnit(String(selectedKeys[0]))
              setSelectedUnitName(String((info.node as TreeDataNode).title ?? ''))
              actionRef.current?.reload()
            }
          }}
          defaultExpandAll
        />
      </Card>

      {/* 우측 예외처리 DataTable */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong>{selectedUnitName}</strong>
          {selectedUnit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditTarget(undefined)
                form.resetFields()
                setOpen(true)
              }}
            >
              등록
            </Button>
          )}
        </div>

        <DataTable<ExceptionRecord>
          columns={columns}
          request={(params) => fetchExceptions(tabKey, { ...params, unitId: selectedUnit })}
          rowKey="id"
          actionRef={actionRef}
          headerTitle={TAB_LABELS[tabKey]}
        />
      </div>

      <Modal
        title={editTarget ? '예외처리 수정' : '예외처리 등록'}
        open={open}
        onOk={() => form.validateFields().then((v) => saveMutation.mutate(v))}
        onCancel={() => {
          setOpen(false)
          setEditTarget(undefined)
          form.resetFields()
        }}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="personnelName" label="성명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rank" label="계급" rules={[{ required: true }]}>
            <Select
              options={['중위', '대위', '소령', '중령', '대령', '하사', '중사', '상사', '준위'].map((r) => ({ label: r, value: r }))}
            />
          </Form.Item>
          <Form.Item name="department" label="부대(서)" rules={[{ required: true }]}>
            <Select options={UNITS.map((u) => ({ label: u, value: u }))} />
          </Form.Item>
          <Form.Item name="reason" label="사유" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="startDate" label="시작일" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="endDate" label="종료일" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(undefined)}
        okText="삭제"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteMutation.isPending}
      >
        <p>'{deleteTarget?.personnelName}' 항목을 삭제하시겠습니까?</p>
      </Modal>
    </div>
  )
}

export default function ExceptionMgmtPage() {
  return (
    <PageContainer title="예외처리관리">
      <Tabs
        items={[
          { key: 'org', label: '체계기준 조직도', children: <ExceptionTab tabKey="org" /> },
          { key: 'single', label: '1인사무실', children: <ExceptionTab tabKey="single" /> },
          { key: 'exception', label: '예외처리', children: <ExceptionTab tabKey="exception" /> },
        ]}
      />
    </PageContainer>
  )
}
