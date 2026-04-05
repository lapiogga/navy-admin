import { useState } from 'react'
import { Space, Select, DatePicker } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface Reservation {
  id: string
  roomId: string
  roomName: string
  applicant: string
  unit: string
  purpose: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  processedAt?: string
}

interface MeetingRoom {
  id: string
  name: string
}

const STATUS_COLOR_MAP = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP = { pending: '대기', approved: '승인', rejected: '반려' }

export default function MeetingStatusPage() {
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [dateRange, setDateRange] = useState<[string, string] | null>(null)

  // 회의실 목록 (필터용)
  const { data: roomsData } = useQuery({
    queryKey: ['sys16', 'meeting-rooms', 'list'],
    queryFn: async () => {
      const res = await axios.get<ApiResult<PageResponse<MeetingRoom>>>('/api/sys16/meeting-rooms', {
        params: { page: 0, size: 100 },
      })
      return res.data.data.content
    },
  })
  const rooms = roomsData ?? []

  // 회의현황 request 함수
  const fetchStatus = async (params: PageRequest): Promise<PageResponse<Reservation>> => {
    const queryParams: Record<string, unknown> = {
      page: params.page,
      size: params.size,
    }
    if (selectedRoom) queryParams.roomId = selectedRoom
    if (dateRange) {
      queryParams.startDate = dateRange[0]
      queryParams.endDate = dateRange[1]
    }
    const res = await axios.get<ApiResult<PageResponse<Reservation>>>('/api/sys16/reservations/status', {
      params: queryParams,
    })
    return res.data.data
  }

  const columns: ProColumns<Reservation>[] = [
    { title: '번호', dataIndex: 'id', width: 80, render: (_, __, index) => index + 1 },
    { title: '회의실', dataIndex: 'roomName', width: 120 },
    { title: '신청자', dataIndex: 'applicant', width: 100 },
    { title: '예약일', dataIndex: 'date', width: 110 },
    {
      title: '시간',
      width: 130,
      render: (_, record) => `${record.startTime} ~ ${record.endTime}`,
    },
    { title: '목적', dataIndex: 'purpose', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 80,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
  ]

  return (
    <PageContainer title="회의현황">
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="회의실 선택"
          style={{ width: 180 }}
          allowClear
          value={selectedRoom || undefined}
          onChange={(value) => setSelectedRoom(value ?? '')}
        >
          {rooms.map((room) => (
            <Select.Option key={room.id} value={room.id}>
              {room.name}
            </Select.Option>
          ))}
        </Select>
        <DatePicker.RangePicker
          onChange={(_, dateStrings) => {
            if (dateStrings[0] && dateStrings[1]) {
              setDateRange([dateStrings[0], dateStrings[1]])
            } else {
              setDateRange(null)
            }
          }}
        />
      </Space>
      <DataTable<Reservation>
        columns={columns}
        request={fetchStatus}
        rowKey="id"
        headerTitle="전체 회의 현황"
      />
    </PageContainer>
  )
}
