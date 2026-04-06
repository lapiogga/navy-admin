import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Select, DatePicker, TimePicker, Input, InputNumber, Button, message, Card } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { ApiResult, PageResponse } from '@/shared/api/types'

interface MeetingRoom {
  id: string
  name: string
  location: string
  capacity: number
  description: string
  managingUnit?: string
}

interface ReserveFormValues {
  managingUnit: string
  roomId: string
  date: import('dayjs').Dayjs
  startTime: import('dayjs').Dayjs
  endTime: import('dayjs').Dayjs
  purpose: string
  attendeeCount: number
  attendees: string
}

const UNIT_OPTIONS = [
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
]

export default function MeetingReservePage() {
  const [form] = Form.useForm<ReserveFormValues>()
  const navigate = useNavigate()
  const [selectedUnit, setSelectedUnit] = useState<string>('')

  // 회의실 목록 조회
  const { data: roomsData } = useQuery({
    queryKey: ['sys16', 'meeting-rooms'],
    queryFn: async () => {
      const res = await axios.get<ApiResult<PageResponse<MeetingRoom>>>('/api/sys16/meeting-rooms', {
        params: { page: 0, size: 100 },
      })
      return res.data.data.content
    },
  })

  const allRooms = roomsData ?? []
  const rooms = selectedUnit
    ? allRooms.filter((r) => r.managingUnit === selectedUnit)
    : allRooms

  // 부대 선택 시 회의실 필터링 + 선택 초기화
  const handleUnitChange = (value: string) => {
    setSelectedUnit(value)
    form.setFieldValue('roomId', undefined)
  }

  // 예약 신청 뮤테이션
  const reserveMutation = useMutation({
    mutationFn: async (values: ReserveFormValues) => {
      const payload = {
        managingUnit: values.managingUnit,
        roomId: values.roomId,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        purpose: values.purpose,
        attendeeCount: values.attendeeCount,
        attendees: values.attendees,
      }
      const res = await axios.post<ApiResult>('/api/sys16/reservations', payload)
      return res.data
    },
    onSuccess: () => {
      message.success('예약이 신청되었습니다')
      form.resetFields()
      navigate('/sys16/1/3')
    },
    onError: () => {
      message.error('예약 신청에 실패했습니다')
    },
  })

  const handleFinish = (values: ReserveFormValues) => {
    reserveMutation.mutate(values)
  }

  return (
    <PageContainer title="회의예약신청">
      <Card style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="managingUnit"
            label="회의실 관리 부대"
            rules={[{ required: true, message: '관리 부대를 선택하세요' }]}
          >
            <Select
              placeholder="부대 선택"
              onChange={handleUnitChange}
              options={UNIT_OPTIONS}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="roomId"
            label="회의실 선택"
            rules={[{ required: true, message: '회의실을 선택하세요' }]}
          >
            <Select placeholder="회의실을 선택하세요">
              {rooms.map((room) => (
                <Select.Option key={room.id} value={room.id}>
                  {room.name} ({room.location}, 수용 {room.capacity}명)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="예약일"
            rules={[{ required: true, message: '예약일을 선택하세요' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="시작 시간"
            rules={[{ required: true, message: '시작 시간을 선택하세요' }]}
          >
            <TimePicker format="HH:mm" minuteStep={30} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="종료 시간"
            rules={[{ required: true, message: '종료 시간을 선택하세요' }]}
          >
            <TimePicker format="HH:mm" minuteStep={30} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="purpose"
            label="회의 목적"
            rules={[{ required: true, message: '회의 목적을 입력하세요' }]}
          >
            <Input.TextArea rows={3} placeholder="회의 목적을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="attendeeCount"
            label="참석 인원"
            rules={[{ required: true, message: '참석 인원을 입력하세요' }]}
          >
            <InputNumber min={1} max={200} placeholder="인원 수" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="attendees"
            label="참석자 정보"
          >
            <Input.TextArea rows={2} placeholder="참석자 목록 (성명, 소속 등)" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={reserveMutation.isPending}
              block
            >
              예약 신청
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  )
}
