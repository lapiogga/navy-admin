import { useRef, useState } from 'react'
import { Button, Modal, message, Popconfirm, Form, Select, DatePicker, TimePicker, InputNumber } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest } from '@/shared/api/types'

interface ScheduleRecord extends Record<string, unknown> {
  id: string
  routeId: string
  rank: string
  operationDate: string
  reservationRank: number
  openTime: string
  closeTime: string
}

const ROUTE_OPTIONS = [
  { label: '서울→포항', value: 'r1' },
  { label: '서울→청주', value: 'r2' },
  { label: '서울→대전', value: 'r3' },
  { label: '서울→광주', value: 'r4' },
  { label: '서울→부산', value: 'r5' },
]

const RANK_OPTIONS = [
  { label: '대령', value: '대령' },
  { label: '중령', value: '중령' },
  { label: '소령', value: '소령' },
  { label: '대위', value: '대위' },
  { label: '중위', value: '중위' },
  { label: '소위', value: '소위' },
  { label: '준위', value: '준위' },
  { label: '원사', value: '원사' },
  { label: '상사', value: '상사' },
  { label: '중사', value: '중사' },
  { label: '하사', value: '하사' },
  { label: '병장', value: '병장' },
  { label: '상병', value: '상병' },
  { label: '일병', value: '일병' },
  { label: '이병', value: '이병' },
]

export function BusSchedulePage() {
  const actionRef = useRef<ActionType>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editRecord, setEditRecord] = useState<ScheduleRecord | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [form] = Form.useForm()

  // 검색 필드 정의 (CSV: 구간별, 계급별, 일자별)
  const searchFields: SearchField[] = [
    {
      name: 'routeId',
      label: '구간(노선)',
      type: 'select',
      options: ROUTE_OPTIONS,
    },
    {
      name: 'rank',
      label: '계급',
      type: 'select',
      options: RANK_OPTIONS,
    },
    { name: 'dateRange', label: '운행일자', type: 'dateRange' },
  ]

  const fetchSchedules = async (params: PageRequest) => {
    const qs = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      ...Object.fromEntries(
        Object.entries(searchParams)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ),
    })
    const res = await apiClient.get<{ content: ScheduleRecord[]; totalElements: number }>(
      `/sys10/schedule?${qs.toString()}`
    )
    return {
      content: res.data.content,
      totalElements: res.data.totalElements,
      totalPages: Math.ceil(res.data.totalElements / params.size),
    }
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (modalMode === 'create') {
        await apiClient.post('/sys10/schedule', values)
        message.success('등록되었습니다')
      } else {
        await apiClient.put(`/sys10/schedule/${editRecord?.id}`, values)
        message.success('수정되었습니다')
      }
      setModalOpen(false)
      form.resetFields()
      actionRef.current?.reload()
    } catch {
      message.error('처리에 실패했습니다')
    }
  }

  const handleDelete = async (record: ScheduleRecord) => {
    try {
      await apiClient.delete(`/sys10/schedule/${record.id}`)
      message.success('삭제되었습니다')
      actionRef.current?.reload()
    } catch {
      message.error('삭제에 실패했습니다')
    }
  }

  const openCreate = () => {
    setModalMode('create')
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record: ScheduleRecord) => {
    setModalMode('edit')
    setEditRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const routeLabel = (id: string) => ROUTE_OPTIONS.find((r) => r.value === id)?.label ?? id

  const columns: ProColumns<ScheduleRecord>[] = [
    {
      title: '노선',
      dataIndex: 'routeId',
      width: 120,
      render: (_, record) => routeLabel(record.routeId),
    },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '운행일자', dataIndex: 'operationDate', width: 110 },
    { title: '예약순위', dataIndex: 'reservationRank', width: 80 },
    { title: '예약오픈', dataIndex: 'openTime', width: 90 },
    { title: '예약마감', dataIndex: 'closeTime', width: 90 },
    {
      title: '작업',
      width: 150,
      render: (_, record) => (
        <span>
          <Button size="small" onClick={() => openEdit(record)} style={{ marginRight: 8 }}>
            수정
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={() => handleDelete(record)}
            okText="확인"
            cancelText="취소"
          >
            <Button size="small" danger>
              삭제
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>예약시간관리</h2>

      {/* 검색영역 (R2: CSV 검색조건 - 구간별, 계급별, 일자별) */}
      <SearchForm
        fields={searchFields}
        onSearch={(values) => {
          setSearchParams(values)
          actionRef.current?.reload()
        }}
        onReset={() => {
          setSearchParams({})
          actionRef.current?.reload()
        }}
      />

      <DataTable<ScheduleRecord>
        columns={columns}
        request={fetchSchedules}
        rowKey="id"
        headerTitle="예약시간 목록"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            신규 등록
          </Button>,
        ]}
      />

      {/* 등록/수정 Modal */}
      <Modal
        title={modalMode === 'create' ? '예약시간 등록' : '예약시간 수정'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="저장"
        cancelText="취소"
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="routeId" label="노선" rules={[{ required: true }]}>
            <Select options={ROUTE_OPTIONS} />
          </Form.Item>
          <Form.Item name="rank" label="계급" rules={[{ required: true }]}>
            <Select options={RANK_OPTIONS} />
          </Form.Item>
          <Form.Item name="operationDate" label="운행일자" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reservationRank" label="예약순위" rules={[{ required: true }]}>
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="openTime" label="예약오픈시간" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="closeTime" label="예약마감시간" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
