import { useRef, useState } from 'react'
import { Tabs, Button, Modal, Form, Input, Select, InputNumber, Switch, Space, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface CheckItem extends Record<string, unknown> {
  id: string
  itemName: string
  category: string
  weight: number
  required: boolean
  cycle: string
  department?: string
}

type TabKey = 'personal-required' | 'office-required' | 'personal-optional' | 'office-optional' | 'security-level'

const TAB_LABELS: Record<TabKey, string> = {
  'personal-required': '(개인)필수점검항목',
  'office-required': '(사무실)필수점검항목',
  'personal-optional': '(개인)선택점검항목',
  'office-optional': '(사무실)선택점검항목',
  'security-level': '개인보안수준평가항목',
}

const UNITS = ['전체', '1함대', '2함대', '3함대', '해군사령부', '교육사령부', '군수사령부', '해병대사령부']

async function fetchCheckItems(tabKey: TabKey, params: PageRequest & { department?: string }): Promise<PageResponse<CheckItem>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<CheckItem>>>('/sys15/check-items', {
    params: { ...params, tabKey },
  })
  return (res as ApiResult<PageResponse<CheckItem>>).data ?? (res as unknown as PageResponse<CheckItem>)
}

function CheckItemTab({ tabKey }: { tabKey: TabKey }) {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CheckItem | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<CheckItem | undefined>()
  const [deptFilter, setDeptFilter] = useState<string>('')

  const isOptional = tabKey === 'personal-optional' || tabKey === 'office-optional'

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<CheckItem>) => {
      if (editTarget) {
        return apiClient.put(`/sys15/check-items/${editTarget.id}`, values)
      }
      return apiClient.post('/sys15/check-items', { ...values, tabKey })
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15', 'check-items', tabKey] })
      actionRef.current?.reload()
      setOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys15/check-items/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15', 'check-items', tabKey] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<CheckItem>[] = [
    { title: '항목명', dataIndex: 'itemName', ellipsis: true },
    { title: '분류', dataIndex: 'category', width: 100 },
    { title: '가중치', dataIndex: 'weight', width: 80, align: 'right' },
    {
      title: '필수여부',
      dataIndex: 'required',
      width: 90,
      render: (val) => (val ? '필수' : '선택'),
    },
    { title: '주기', dataIndex: 'cycle', width: 100 },
    ...(isOptional
      ? [{ title: '부대(서)', dataIndex: 'department' as keyof CheckItem, width: 140 } as ProColumns<CheckItem>]
      : []),
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
    <div>
      {isOptional && (
        <div style={{ marginBottom: 12 }}>
          <span style={{ marginRight: 8 }}>부대(서) 필터:</span>
          <Select
            value={deptFilter}
            onChange={(v) => {
              setDeptFilter(v)
              actionRef.current?.reload()
            }}
            options={UNITS.map((u) => ({ label: u, value: u === '전체' ? '' : u }))}
            style={{ width: 160 }}
          />
        </div>
      )}

      <DataTable<CheckItem>
        columns={columns}
        request={(params) => fetchCheckItems(tabKey, { ...params, department: deptFilter || undefined })}
        rowKey="id"
        actionRef={actionRef}
        headerTitle={TAB_LABELS[tabKey]}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditTarget(undefined)
              form.resetFields()
              setOpen(true)
            }}
          >
            등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '항목 수정' : '항목 등록'}
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
          <Form.Item name="itemName" label="항목명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="분류" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="weight" label="가중치" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="required" label="필수여부" valuePropName="checked">
            <Switch checkedChildren="필수" unCheckedChildren="선택" />
          </Form.Item>
          <Form.Item name="cycle" label="주기" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '일일', value: '일일' },
                { label: '주간', value: '주간' },
                { label: '월간', value: '월간' },
                { label: '분기', value: '분기' },
              ]}
            />
          </Form.Item>
          {isOptional && (
            <Form.Item name="department" label="부대(서)">
              <Select options={UNITS.filter((u) => u !== '전체').map((u) => ({ label: u, value: u }))} />
            </Form.Item>
          )}
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
        <p>'{deleteTarget?.itemName}' 항목을 삭제하시겠습니까?</p>
      </Modal>
    </div>
  )
}

const TAB_KEYS: TabKey[] = [
  'personal-required',
  'office-required',
  'personal-optional',
  'office-optional',
  'security-level',
]

export default function CheckItemMgmtPage() {
  return (
    <PageContainer title="점검항목관리">
      <Tabs
        items={TAB_KEYS.map((key) => ({
          key,
          label: TAB_LABELS[key],
          children: <CheckItemTab tabKey={key} />,
        }))}
      />
    </PageContainer>
  )
}
