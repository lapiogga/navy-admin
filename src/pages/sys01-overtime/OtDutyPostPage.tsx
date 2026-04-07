import { useState, useRef } from 'react'
import { Modal, Form, Input, Select, Button, message, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

/** 검색 필드 정의 */
const dutyPostSearchFields: SearchField[] = [
  { name: 'postName', label: '개소명', type: 'text', placeholder: '개소명 검색' },
  { name: 'unitName', label: '부대명', type: 'select', options: [
    { label: '1함대', value: '1함대' },
    { label: '2함대', value: '2함대' },
    { label: '3함대', value: '3함대' },
    { label: '해군사령부', value: '해군사령부' },
    { label: '교육사령부', value: '교육사령부' },
  ]},
]

interface DutyPost extends Record<string, unknown> {
  id: string
  postName: string
  postId: string
  macAddress: string
  unitNames: string[]
  isActive: boolean
}

const UNIT_OPTIONS = [
  { label: '1함대', value: '1함대' },
  { label: '2함대', value: '2함대' },
  { label: '3함대', value: '3함대' },
  { label: '해군사령부', value: '해군사령부' },
  { label: '교육사령부', value: '교육사령부' },
  { label: '군수사령부', value: '군수사령부' },
]

async function fetchDutyPosts(params: PageRequest): Promise<PageResponse<DutyPost>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<DutyPost>>>('/sys01/duty-posts', {
    params: { page: params.page, size: params.size },
  })
  return (res as ApiResult<PageResponse<DutyPost>>).data ?? (res as unknown as PageResponse<DutyPost>)
}

export default function OtDutyPostPage() {
  const actionRef = useRef<ActionType>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<DutyPost | null>(null)
  const [form] = Form.useForm()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editRecord) {
        message.success('수정되었습니다.')
      } else {
        message.success('등록되었습니다.')
      }
      form.resetFields()
      setModalOpen(false)
      setEditRecord(null)
      actionRef.current?.reload()
    } catch {
      // 검증 실패
    }
  }

  const columns: ProColumns<DutyPost>[] = [
    { title: '개소명', dataIndex: 'postName', width: 140 },
    { title: 'ID', dataIndex: 'postId', width: 100 },
    { title: 'MAC주소', dataIndex: 'macAddress', width: 150 },
    {
      title: '부대명',
      dataIndex: 'unitNames',
      render: (_, r) => (
        <>
          {(r.unitNames as string[]).map((u) => (
            <Tag key={u}>{u}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      width: 80,
      render: (_, r) => <Tag color={r.isActive ? 'green' : 'default'}>{r.isActive ? '활성' : '비활성'}</Tag>,
    },
    {
      title: '작업',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" size="small" onClick={() => { setEditRecord(record); setModalOpen(true) }}>
          수정
        </Button>,
        <Button
          key="del"
          type="link"
          danger
          size="small"
          onClick={() => {
            showConfirmDialog({
              title: '삭제 확인',
              content: '당직개소를 삭제하시겠습니까?',
              danger: true,
              onConfirm: () => {
                message.success('삭제되었습니다.')
                actionRef.current?.reload()
              },
            })
          }}
        >
          삭제
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer title="당직개소 관리">
      <SearchForm fields={dutyPostSearchFields} onSearch={(values) => { console.log('검색:', values); actionRef.current?.reload() }} />
      <DataTable<DutyPost>
        columns={columns}
        request={fetchDutyPosts}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="당직개소 목록"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setModalOpen(true) }}>
            당직개소 등록
          </Button>,
        ]}
      />
      <Modal
        open={modalOpen}
        title={editRecord ? '당직개소 수정' : '당직개소 등록'}
        onOk={handleOk}
        onCancel={() => { form.resetFields(); setModalOpen(false); setEditRecord(null) }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={editRecord ?? {}}>
          {/* D-10: 부대명은 다중선택 Select mode=multiple */}
          <Form.Item name="unitNames" label="부대명" rules={[{ required: true }]}>
            <Select mode="multiple" options={UNIT_OPTIONS} placeholder="부대를 선택하세요 (다중선택)" />
          </Form.Item>
          <Form.Item name="postName" label="개소명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="postId" label="ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="macAddress" label="MAC주소">
            <Input placeholder="예: AA:BB:CC:DD:EE:FF" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
