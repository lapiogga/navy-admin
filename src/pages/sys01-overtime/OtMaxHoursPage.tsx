import { useState, useRef } from 'react'
import { Tabs, Button, Select, Form, InputNumber, DatePicker, Input, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { TextArea } = Input

// 최대인정시간 타입
interface MaxHoursItem extends Record<string, unknown> {
  id: string
  year: number
  month: number
  maxHours: number
  exceptionHours: number
}

// 예외처리 타입
interface ExceptionItem extends Record<string, unknown> {
  id: string
  reason: string
  startDate: string
  endDate: string
  exceptionHours: number
}

// 예외구분 타입
interface ExceptionCategory extends Record<string, unknown> {
  id: string
  categoryName: string
  description: string
}

const YEAR_OPTIONS = [2024, 2025, 2026, 2027].map((y) => ({ label: `${y}년`, value: y }))

async function fetchMaxHours(params: PageRequest): Promise<PageResponse<MaxHoursItem>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<MaxHoursItem>>>('/api/sys01/max-hours', {
    params: { page: params.page, size: params.size },
  })
  return (res as ApiResult<PageResponse<MaxHoursItem>>).data ?? (res as unknown as PageResponse<MaxHoursItem>)
}

let exceptionItems: ExceptionItem[] = [
  { id: '1', reason: '긴급 작전', startDate: '2026-01-01', endDate: '2026-01-31', exceptionHours: 10 },
  { id: '2', reason: '훈련 지원', startDate: '2026-02-01', endDate: '2026-02-28', exceptionHours: 8 },
]

let exceptionCategories: ExceptionCategory[] = [
  { id: '1', categoryName: '작전 예외', description: '긴급 작전 수행 시 적용' },
  { id: '2', categoryName: '훈련 예외', description: '대규모 훈련 기간 적용' },
]

async function fetchExceptions(params: PageRequest): Promise<PageResponse<ExceptionItem>> {
  const start = params.page * params.size
  const content = exceptionItems.slice(start, start + params.size)
  return { content, totalElements: exceptionItems.length, totalPages: Math.ceil(exceptionItems.length / params.size), size: params.size, number: params.page }
}

async function fetchCategories(params: PageRequest): Promise<PageResponse<ExceptionCategory>> {
  const start = params.page * params.size
  const content = exceptionCategories.slice(start, start + params.size)
  return { content, totalElements: exceptionCategories.length, totalPages: Math.ceil(exceptionCategories.length / params.size), size: params.size, number: params.page }
}

// 예외처리 탭
function ExceptionTab() {
  const actionRef = useRef<ActionType>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<ExceptionItem | null>(null)
  const [form] = Form.useForm()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editRecord) {
        exceptionItems = exceptionItems.map((e) =>
          e.id === editRecord.id
            ? { ...e, reason: values.reason, startDate: values.period[0].format('YYYY-MM-DD'), endDate: values.period[1].format('YYYY-MM-DD'), exceptionHours: values.exceptionHours }
            : e
        )
      } else {
        exceptionItems = [
          {
            id: String(Date.now()),
            reason: values.reason,
            startDate: values.period[0].format('YYYY-MM-DD'),
            endDate: values.period[1].format('YYYY-MM-DD'),
            exceptionHours: values.exceptionHours,
          },
          ...exceptionItems,
        ]
      }
      message.success(editRecord ? '수정되었습니다.' : '등록되었습니다.')
      form.resetFields()
      setModalOpen(false)
      setEditRecord(null)
      setRefreshKey((k) => k + 1)
    } catch {
      // 검증 실패
    }
  }

  const columns: ProColumns<ExceptionItem>[] = [
    { title: '예외사유', dataIndex: 'reason', ellipsis: true },
    { title: '적용시작일', dataIndex: 'startDate', width: 120 },
    { title: '적용종료일', dataIndex: 'endDate', width: 120 },
    { title: '예외시간(h)', dataIndex: 'exceptionHours', width: 100 },
    {
      title: '작업',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" size="small" onClick={() => { setEditRecord(record); setModalOpen(true) }}>수정</Button>,
        <Button key="del" type="link" danger size="small" onClick={() => {
          showConfirmDialog({
            title: '삭제 확인',
            content: '예외처리를 삭제하시겠습니까?',
            danger: true,
            onConfirm: () => {
              exceptionItems = exceptionItems.filter((e) => e.id !== record.id)
              setRefreshKey((k) => k + 1)
              message.success('삭제되었습니다.')
            },
          })
        }}>삭제</Button>,
      ],
    },
  ]

  return (
    <div key={refreshKey}>
      <DataTable<ExceptionItem>
        columns={columns}
        request={fetchExceptions}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="예외처리 목록"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setModalOpen(true) }}>예외처리 등록</Button>,
        ]}
      />
      <Modal
        open={modalOpen}
        title={editRecord ? '예외처리 수정' : '예외처리 등록'}
        onOk={handleOk}
        onCancel={() => { form.resetFields(); setModalOpen(false); setEditRecord(null) }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="예외사유" rules={[{ required: true }]}>
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="period" label="적용기간" rules={[{ required: true }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="exceptionHours" label="예외시간" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} addonAfter="시간" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// 예외구분 탭
function ExceptionCategoryTab() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<ExceptionCategory | null>(null)
  const [form] = Form.useForm()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editRecord) {
        exceptionCategories = exceptionCategories.map((c) =>
          c.id === editRecord.id ? { ...c, ...values } : c
        )
      } else {
        exceptionCategories = [{ id: String(Date.now()), ...values }, ...exceptionCategories]
      }
      message.success(editRecord ? '수정되었습니다.' : '등록되었습니다.')
      form.resetFields()
      setModalOpen(false)
      setEditRecord(null)
      setRefreshKey((k) => k + 1)
    } catch {
      // 검증 실패
    }
  }

  const columns: ProColumns<ExceptionCategory>[] = [
    { title: '구분명', dataIndex: 'categoryName', width: 160 },
    { title: '설명', dataIndex: 'description', ellipsis: true },
    {
      title: '작업',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" size="small" onClick={() => { setEditRecord(record); setModalOpen(true) }}>수정</Button>,
        <Button key="del" type="link" danger size="small" onClick={() => {
          showConfirmDialog({
            title: '삭제 확인',
            content: '예외구분을 삭제하시겠습니까?',
            danger: true,
            onConfirm: () => {
              exceptionCategories = exceptionCategories.filter((c) => c.id !== record.id)
              setRefreshKey((k) => k + 1)
              message.success('삭제되었습니다.')
            },
          })
        }}>삭제</Button>,
      ],
    },
  ]

  return (
    <div key={refreshKey}>
      <DataTable<ExceptionCategory>
        columns={columns}
        request={fetchCategories}
        rowKey="id"
        headerTitle="예외구분 목록"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setModalOpen(true) }}>예외구분 등록</Button>,
        ]}
      />
      <Modal
        open={modalOpen}
        title={editRecord ? '예외구분 수정' : '예외구분 등록'}
        onOk={handleOk}
        onCancel={() => { form.resetFields(); setModalOpen(false); setEditRecord(null) }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="categoryName" label="구분명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// 최대인정시간 탭
function MaxHoursTab() {
  const actionRef = useRef<ActionType>()
  const [selectedYear, setSelectedYear] = useState(2026)

  const columns: ProColumns<MaxHoursItem>[] = [
    { title: '연도', dataIndex: 'year', width: 80 },
    { title: '월', dataIndex: 'month', width: 60, render: (v) => `${v}월` },
    { title: '최대인정시간(h)', dataIndex: 'maxHours', width: 140 },
    { title: '예외시간(h)', dataIndex: 'exceptionHours', width: 110 },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>연도:</span>
        <Select
          value={selectedYear}
          options={YEAR_OPTIONS}
          onChange={(v) => {
            setSelectedYear(v)
            actionRef.current?.reload()
          }}
          style={{ width: 100 }}
        />
      </div>
      <DataTable<MaxHoursItem>
        columns={columns}
        request={fetchMaxHours}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="최대인정시간 목록"
      />
    </div>
  )
}

export default function OtMaxHoursPage() {
  const tabItems = [
    { key: 'max-hours', label: '최대인정시간', children: <MaxHoursTab /> },
    { key: 'exception', label: '예외처리', children: <ExceptionTab /> },
    { key: 'category', label: '예외구분', children: <ExceptionCategoryTab /> },
  ]

  return (
    <PageContainer title="최대인정시간 관리">
      <Tabs defaultActiveKey="max-hours" items={tabItems} />
    </PageContainer>
  )
}
