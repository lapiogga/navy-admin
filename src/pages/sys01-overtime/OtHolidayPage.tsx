import { useState } from 'react'
import { Modal, Form, DatePicker, Select, Input, Button, Calendar, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { Dayjs } from 'dayjs'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'

interface HolidayEntry {
  id: string
  date: string
  name: string
  type: '법정' | '대체' | '지정'
}

const HOLIDAY_TYPE_OPTIONS = [
  { label: '법정', value: '법정' },
  { label: '대체', value: '대체' },
  { label: '지정', value: '지정' },
]

let holidays: HolidayEntry[] = [
  { id: '1', date: '2026-01-01', name: '신정', type: '법정' },
  { id: '2', date: '2026-02-16', name: '설날', type: '법정' },
  { id: '3', date: '2026-03-01', name: '삼일절', type: '법정' },
  { id: '4', date: '2026-05-05', name: '어린이날', type: '법정' },
  { id: '5', date: '2026-06-06', name: '현충일', type: '법정' },
  { id: '6', date: '2026-08-15', name: '광복절', type: '법정' },
  { id: '7', date: '2026-10-01', name: '추석', type: '법정' },
  { id: '8', date: '2026-10-03', name: '개천절', type: '법정' },
  { id: '9', date: '2026-10-09', name: '한글날', type: '법정' },
  { id: '10', date: '2026-12-25', name: '성탄절', type: '법정' },
]

export default function OtHolidayPage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<HolidayEntry | null>(null)
  const [form] = Form.useForm()
  const [, forceUpdate] = useState(0)

  const handlePanelChange = (_value: Dayjs) => {
    setSelectedDate(null)
  }

  const handleSelect = (date: Dayjs) => {
    setSelectedDate(date)
    const dateStr = date.format('YYYY-MM-DD')
    const existing = holidays.find((h) => h.date === dateStr)
    if (existing) {
      setEditRecord(existing)
    } else {
      setEditRecord(null)
    }
    setModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const dateStr = selectedDate!.format('YYYY-MM-DD')
      if (editRecord) {
        holidays = holidays.map((h) =>
          h.id === editRecord.id ? { ...h, name: values.name, type: values.type } : h
        )
        message.success('공휴일이 수정되었습니다.')
      } else {
        holidays = [
          ...holidays,
          { id: String(Date.now()), date: dateStr, name: values.name, type: values.type },
        ]
        message.success('공휴일이 등록되었습니다.')
      }
      form.resetFields()
      setModalOpen(false)
      setEditRecord(null)
      forceUpdate((k) => k + 1)
    } catch {
      // 검증 실패
    }
  }

  const handleDelete = () => {
    if (!editRecord) return
    showConfirmDialog({
      title: '삭제 확인',
      content: `${editRecord.name} 공휴일을 삭제하시겠습니까?`,
      danger: true,
      onConfirm: () => {
        holidays = holidays.filter((h) => h.id !== editRecord.id)
        message.success('삭제되었습니다.')
        form.resetFields()
        setModalOpen(false)
        setEditRecord(null)
        forceUpdate((k) => k + 1)
      },
    })
  }

  const cellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const holiday = holidays.find((h) => h.date === dateStr)
    if (!holiday) return null
    return (
      <div>
        <span className="text-red-500 text-xs">{holiday.name}</span>
      </div>
    )
  }

  const modalFooter = [
    editRecord && (
      <Button key="delete" danger onClick={handleDelete}>
        삭제
      </Button>
    ),
    <Button key="cancel" onClick={() => { form.resetFields(); setModalOpen(false); setEditRecord(null) }}>
      취소
    </Button>,
    <Button key="ok" type="primary" onClick={handleOk}>
      저장
    </Button>,
  ].filter(Boolean)

  return (
    <PageContainer title="공휴일 관리">
      <Calendar
        cellRender={cellRender}
        onSelect={handleSelect}
        onPanelChange={handlePanelChange}
      />
      <Modal
        open={modalOpen}
        title={editRecord ? '공휴일 수정' : `공휴일 등록 (${selectedDate?.format('YYYY-MM-DD')})`}
        onCancel={() => { form.resetFields(); setModalOpen(false); setEditRecord(null) }}
        footer={modalFooter}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={editRecord ? { name: editRecord.name, type: editRecord.type } : {}}>
          <Form.Item label="날짜">
            <Input value={selectedDate?.format('YYYY-MM-DD')} readOnly style={{ background: '#f5f5f5' }} />
          </Form.Item>
          <Form.Item name="name" label="공휴일명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="종류" rules={[{ required: true }]}>
            <Select options={HOLIDAY_TYPE_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
