import { useState } from 'react'
import { Tabs, Modal, Form, TimePicker, DatePicker, InputNumber, Input, Button, Calendar, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import type { PageRequest, PageResponse } from '@/shared/api/types'

const { TextArea } = Input

interface WorkHourEntry extends Record<string, unknown> {
  id: string
  date: string
  startTime: string
  endTime: string
  memo: string
}

interface ExceptionEntry extends Record<string, unknown> {
  id: string
  exceptionDate: string
  reason: string
  appliedHours: number
}

let workHours: WorkHourEntry[] = [
  { id: '1', date: '2026-04-07', startTime: '09:00', endTime: '18:00', memo: '정상 근무' },
  { id: '2', date: '2026-04-08', startTime: '09:00', endTime: '20:00', memo: '초과 근무' },
  { id: '3', date: '2026-04-09', startTime: '08:00', endTime: '17:00', memo: '조기 출근' },
  { id: '4', date: '2026-04-14', startTime: '09:00', endTime: '19:00', memo: '훈련 지원' },
  { id: '5', date: '2026-04-21', startTime: '09:00', endTime: '21:00', memo: '작전 준비' },
]

let exceptionEntries: ExceptionEntry[] = [
  { id: '1', exceptionDate: '2026-04-10', reason: '부대 행사', appliedHours: 4 },
  { id: '2', exceptionDate: '2026-04-15', reason: '긴급 작전', appliedHours: 8 },
]

async function fetchExceptions(params: PageRequest): Promise<PageResponse<ExceptionEntry>> {
  const start = params.page * params.size
  const content = exceptionEntries.slice(start, start + params.size)
  return {
    content,
    totalElements: exceptionEntries.length,
    totalPages: Math.ceil(exceptionEntries.length / params.size),
    size: params.size,
    number: params.page,
  }
}

// 근무시간 Calendar 탭
function WorkHoursCalendarTab() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  // Pitfall 2 대응: onPanelChange로 월 네비게이션 처리, onSelect는 날짜 클릭만
  const handlePanelChange = (_value: Dayjs) => {
    setSelectedDate(null)
  }

  const handleSelect = (date: Dayjs) => {
    setSelectedDate(date)
    setModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const dateStr = selectedDate!.format('YYYY-MM-DD')
      const existing = workHours.find((w) => w.date === dateStr)
      if (existing) {
        workHours = workHours.map((w) =>
          w.date === dateStr
            ? {
                ...w,
                startTime: values.timeRange[0].format('HH:mm'),
                endTime: values.timeRange[1].format('HH:mm'),
                memo: values.memo ?? '',
              }
            : w
        )
        message.success('근무시간이 수정되었습니다.')
      } else {
        workHours = [
          ...workHours,
          {
            id: String(Date.now()),
            date: dateStr,
            startTime: values.timeRange[0].format('HH:mm'),
            endTime: values.timeRange[1].format('HH:mm'),
            memo: values.memo ?? '',
          },
        ]
        message.success('근무시간이 등록되었습니다.')
      }
      form.resetFields()
      setModalOpen(false)
    } catch {
      // 검증 실패
    }
  }

  const cellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const entry = workHours.find((w) => w.date === dateStr)
    if (!entry) return null
    return (
      <div>
        <span className="text-blue-500 text-xs">
          {entry.startTime}~{entry.endTime}
        </span>
      </div>
    )
  }

  return (
    <>
      <Calendar
        cellRender={cellRender}
        onSelect={handleSelect}
        onPanelChange={handlePanelChange}
      />
      <Modal
        open={modalOpen}
        title={`근무시간 ${selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}`}
        onOk={handleOk}
        onCancel={() => { form.resetFields(); setModalOpen(false) }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="날짜">
            <Input value={selectedDate?.format('YYYY-MM-DD')} readOnly style={{ background: '#f5f5f5' }} />
          </Form.Item>
          <Form.Item name="timeRange" label="근무시간" rules={[{ required: true }]}>
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="memo" label="비고">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// 예외처리 탭
function WorkHoursExceptionTab() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<ExceptionEntry | null>(null)
  const [form] = Form.useForm()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editRecord) {
        exceptionEntries = exceptionEntries.map((e) =>
          e.id === editRecord.id
            ? {
                ...e,
                exceptionDate: values.exceptionDate.format('YYYY-MM-DD'),
                reason: values.reason,
                appliedHours: values.appliedHours,
              }
            : e
        )
      } else {
        exceptionEntries = [
          {
            id: String(Date.now()),
            exceptionDate: values.exceptionDate.format('YYYY-MM-DD'),
            reason: values.reason,
            appliedHours: values.appliedHours,
          },
          ...exceptionEntries,
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

  const columns: ProColumns<ExceptionEntry>[] = [
    { title: '예외일', dataIndex: 'exceptionDate', width: 120 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    { title: '적용시간(h)', dataIndex: 'appliedHours', width: 110 },
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
              content: '예외처리를 삭제하시겠습니까?',
              danger: true,
              onConfirm: () => {
                exceptionEntries = exceptionEntries.filter((e) => e.id !== record.id)
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
    <div key={refreshKey}>
      <DataTable<ExceptionEntry>
        columns={columns}
        request={fetchExceptions}
        rowKey="id"
        headerTitle="예외처리 목록"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setModalOpen(true) }}>
            예외처리 등록
          </Button>,
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
          <Form.Item name="exceptionDate" label="예외일" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="사유" rules={[{ required: true }]}>
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="appliedHours" label="적용시간" rules={[{ required: true }]}>
            <InputNumber min={0} max={24} addonAfter="시간" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default function OtWorkHoursPage() {
  const tabItems = [
    { key: 'calendar', label: '근무시간 관리', children: <WorkHoursCalendarTab /> },
    { key: 'exception', label: '예외처리', children: <WorkHoursExceptionTab /> },
  ]

  return (
    <PageContainer title="근무시간 관리">
      <Tabs defaultActiveKey="calendar" items={tabItems} />
    </PageContainer>
  )
}
