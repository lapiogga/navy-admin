import { useState, useRef } from 'react'
import { Button, Modal, message, Space, Form, Select, DatePicker, TimePicker, Input, InputNumber, Popconfirm } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest } from '@/shared/api/types'
import { SeatGrid } from './SeatGrid'
import type { Seat } from './SeatGrid'

interface DispatchRecord extends Record<string, unknown> {
  id: string
  direction: string
  operationDate: string
  departureTime: string
  departure: string
  destination: string
  stopover: string
  totalSeats: number
  vehicleNo: string
  assignStatus: 'assigned' | 'unassigned'
  reservedCount: number
}

const ASSIGN_COLOR_MAP: Record<string, string> = {
  assigned: 'green',
  unassigned: 'default',
}

const ASSIGN_LABEL_MAP: Record<string, string> = {
  assigned: '배정',
  unassigned: '미배정',
}

export function BusDispatchPage() {
  const actionRef = useRef<ActionType>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editRecord, setEditRecord] = useState<DispatchRecord | null>(null)
  const [seatModalOpen, setSeatModalOpen] = useState(false)
  const [seatModalSeats, setSeatModalSeats] = useState<Seat[]>([])
  const [form] = Form.useForm()

  const fetchDispatches = async (params: PageRequest) => {
    const res = await apiClient.get<{ content: DispatchRecord[]; totalElements: number }>(
      `/sys10/dispatches?page=${params.page}&size=${params.size}`
    )
    return {
      content: res.data.content,
      totalElements: res.data.totalElements,
      totalPages: Math.ceil(res.data.totalElements / params.size),
    }
  }

  const handleSeatView = async (record: DispatchRecord) => {
    try {
      const res = await apiClient.get<{ content: Seat[] }>(`/sys10/dispatches/${record.id}/seats`)
      setSeatModalSeats(res.data.content)
      setSeatModalOpen(true)
    } catch {
      message.error('좌석 현황 조회에 실패했습니다')
    }
  }

  const handleAssign = async (record: DispatchRecord, assign: boolean) => {
    try {
      await apiClient.put(`/sys10/dispatches/${record.id}`, {
        ...record,
        assignStatus: assign ? 'assigned' : 'unassigned',
      })
      message.success(assign ? '배정되었습니다' : '배정이 취소되었습니다')
      actionRef.current?.reload()
    } catch {
      message.error('처리에 실패했습니다')
    }
  }

  const handleDelete = async (record: DispatchRecord) => {
    try {
      await apiClient.delete(`/sys10/dispatches/${record.id}`)
      message.success('삭제되었습니다')
      actionRef.current?.reload()
    } catch {
      message.error('삭제에 실패했습니다')
    }
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (modalMode === 'create') {
        await apiClient.post('/sys10/dispatches', values)
        message.success('등록되었습니다')
      } else {
        await apiClient.put(`/sys10/dispatches/${editRecord?.id}`, values)
        message.success('수정되었습니다')
      }
      setModalOpen(false)
      form.resetFields()
      actionRef.current?.reload()
    } catch {
      message.error('처리에 실패했습니다')
    }
  }

  const openCreate = () => {
    setModalMode('create')
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record: DispatchRecord) => {
    setModalMode('edit')
    setEditRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const columns: ProColumns<DispatchRecord>[] = [
    {
      title: '방향',
      dataIndex: 'direction',
      width: 80,
    },
    { title: '운행일자', dataIndex: 'operationDate', width: 110 },
    { title: '출발시간', dataIndex: 'departureTime', width: 90 },
    { title: '출발지', dataIndex: 'departure', width: 90 },
    { title: '도착지', dataIndex: 'destination', width: 90 },
    { title: '전체좌석', dataIndex: 'totalSeats', width: 80 },
    {
      title: '배정상태',
      dataIndex: 'assignStatus',
      width: 90,
      render: (_, record) => (
        <StatusBadge
          status={record.assignStatus}
          colorMap={ASSIGN_COLOR_MAP}
          labelMap={ASSIGN_LABEL_MAP}
        />
      ),
    },
    { title: '예약인원', dataIndex: 'reservedCount', width: 80 },
    {
      title: '작업',
      width: 230,
      render: (_, record) => (
        <Space>
          {record.assignStatus === 'unassigned' ? (
            <Button size="small" type="primary" onClick={() => handleAssign(record, true)}>
              배정
            </Button>
          ) : (
            <Button size="small" onClick={() => handleAssign(record, false)}>
              배정취소
            </Button>
          )}
          <Button size="small" onClick={() => handleSeatView(record)}>
            좌석배치 확인
          </Button>
          <Button size="small" onClick={() => openEdit(record)}>
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
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>주말버스 배차관리</h2>

      <DataTable<DispatchRecord>
        columns={columns}
        request={fetchDispatches}
        rowKey="id"
        headerTitle="배차 목록"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            신규 등록
          </Button>,
        ]}
      />

      {/* 배차 등록/수정 Modal */}
      <Modal
        title={modalMode === 'create' ? '배차 등록' : '배차 수정'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="저장"
        cancelText="취소"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="direction" label="방향" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '상행', value: '상행' },
                { label: '하행', value: '하행' },
              ]}
            />
          </Form.Item>
          <Form.Item name="operationDate" label="운행일자" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="departureTime" label="출발시간" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="departure" label="출발지" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destination" label="도착지" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="stopover" label="경유지">
            <Input />
          </Form.Item>
          <Form.Item name="totalSeats" label="전체좌석" rules={[{ required: true }]}>
            <InputNumber min={1} max={50} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="vehicleNo" label="차량번호" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 좌석배치 확인 Modal (SeatGrid readOnly) */}
      <Modal
        title="좌석배치 확인"
        open={seatModalOpen}
        onCancel={() => setSeatModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setSeatModalOpen(false)}>
            닫기
          </Button>,
        ]}
        width={400}
      >
        <SeatGrid
          seats={seatModalSeats}
          onSeatClick={() => {}}
          readOnly={true}
        />
      </Modal>
    </div>
  )
}
