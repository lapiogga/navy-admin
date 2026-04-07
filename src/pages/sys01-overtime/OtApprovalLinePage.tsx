import { useState, useRef } from 'react'
import { Modal, Form, Input, InputNumber, Select, Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface ApprovalLineItem extends Record<string, unknown> {
  id: string
  approverName: string
  rank: string
  order: number
  unitName: string
}

const RANK_OPTIONS = [
  { label: '중위', value: '중위' },
  { label: '대위', value: '대위' },
  { label: '소령', value: '소령' },
  { label: '중령', value: '중령' },
  { label: '대령', value: '대령' },
]

const UNIT_OPTIONS = [
  { label: '1함대', value: '1함대' },
  { label: '2함대', value: '2함대' },
  { label: '3함대', value: '3함대' },
  { label: '해군사령부', value: '해군사령부' },
]

let approvalLines: ApprovalLineItem[] = [
  { id: '1', approverName: '김철수', rank: '소령', order: 1, unitName: '1함대' },
  { id: '2', approverName: '이영희', rank: '중령', order: 2, unitName: '1함대' },
  { id: '3', approverName: '박민준', rank: '대령', order: 3, unitName: '해군사령부' },
  { id: '4', approverName: '최동훈', rank: '대위', order: 1, unitName: '2함대' },
  { id: '5', approverName: '정수현', rank: '소령', order: 2, unitName: '2함대' },
  { id: '6', approverName: '한상우', rank: '중령', order: 3, unitName: '2함대' },
  { id: '7', approverName: '오지영', rank: '대위', order: 1, unitName: '3함대' },
  { id: '8', approverName: '윤태호', rank: '소령', order: 2, unitName: '3함대' },
  { id: '9', approverName: '임재현', rank: '대령', order: 3, unitName: '3함대' },
  { id: '10', approverName: '서민정', rank: '중위', order: 1, unitName: '해군사령부' },
  { id: '11', approverName: '강도윤', rank: '대위', order: 2, unitName: '해군사령부' },
  { id: '12', approverName: '송하늘', rank: '소령', order: 1, unitName: '1함대' },
  { id: '13', approverName: '배성진', rank: '중령', order: 2, unitName: '해군사령부' },
  { id: '14', approverName: '조은비', rank: '대위', order: 1, unitName: '2함대' },
  { id: '15', approverName: '문재혁', rank: '대령', order: 4, unitName: '해군사령부' },
]

async function fetchApprovalLines(params: PageRequest): Promise<PageResponse<ApprovalLineItem>> {
  const start = params.page * params.size
  const content = approvalLines.slice(start, start + params.size)
  return {
    content,
    totalElements: approvalLines.length,
    totalPages: Math.ceil(approvalLines.length / params.size),
    size: params.size,
    number: params.page,
  }
}

export default function OtApprovalLinePage() {
  const actionRef = useRef<ActionType>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<ApprovalLineItem | null>(null)
  const [form] = Form.useForm()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editRecord) {
        approvalLines = approvalLines.map((a) =>
          a.id === editRecord.id ? { ...a, ...values } : a
        )
        message.success('수정되었습니다.')
      } else {
        approvalLines = [{ id: String(Date.now()), ...values }, ...approvalLines]
        message.success('등록되었습니다.')
      }
      form.resetFields()
      setModalOpen(false)
      setEditRecord(null)
      setRefreshKey((k) => k + 1)
    } catch {
      // 검증 실패
    }
  }

  const columns: ProColumns<ApprovalLineItem>[] = [
    { title: '결재자명', dataIndex: 'approverName', width: 100 },
    { title: '직급', dataIndex: 'rank', width: 80 },
    { title: '순서', dataIndex: 'order', width: 60 },
    { title: '부대(서)', dataIndex: 'unitName', width: 120 },
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
              content: '결재선을 삭제하시겠습니까?',
              danger: true,
              onConfirm: () => {
                approvalLines = approvalLines.filter((a) => a.id !== record.id)
                setRefreshKey((k) => k + 1)
                message.success('삭제되었습니다.')
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
    <PageContainer title="결재선 관리">
      <div key={refreshKey}>
        <DataTable<ApprovalLineItem>
          columns={columns}
          request={fetchApprovalLines}
          rowKey="id"
          actionRef={actionRef}
          headerTitle="결재선 목록"
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setModalOpen(true) }}>
              결재자 등록
            </Button>,
          ]}
        />
      </div>
      <Modal
        open={modalOpen}
        title={editRecord ? '결재자 수정' : '결재자 등록'}
        onOk={handleOk}
        onCancel={() => { form.resetFields(); setModalOpen(false); setEditRecord(null) }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={editRecord ?? {}}>
          <Form.Item name="approverName" label="결재자명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rank" label="직급" rules={[{ required: true }]}>
            <Select options={RANK_OPTIONS} />
          </Form.Item>
          <Form.Item name="order" label="순서" rules={[{ required: true }]}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unitName" label="부대(서)" rules={[{ required: true }]}>
            <Select options={UNIT_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
