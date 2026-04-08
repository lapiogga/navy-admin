import { useState, useCallback } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface Reservation extends Record<string, unknown> {
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
  reserverServiceNumber: string
  reserverRank: string
  reserverName: string
}

interface MeetingRoom {
  id: string
  name: string
}

const STATUS_COLOR_MAP = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP = { pending: '대기', approved: '승인', rejected: '반려' }

const UNIT_OPTIONS = [
  { label: '전체', value: '' },
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
]

export default function MeetingStatusPage() {
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  // 회의실 목록 (필터용)
  const { data: roomsData } = useQuery({
    queryKey: ['sys16', 'meeting-rooms', 'list'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResult<PageResponse<MeetingRoom>>>('/sys16/meeting-rooms', {
        params: { page: 0, size: 100 },
      })
      return (res as ApiResult<any>).data.content
    },
  })
  const rooms = roomsData ?? []

  // 검색 필드 정의 (CSV 검색조건: 회의실 관리 부대, 회의실, 회의일자)
  const searchFields: SearchField[] = [
    {
      name: 'managingUnit',
      label: '관리부대',
      type: 'select',
      options: UNIT_OPTIONS,
    },
    {
      name: 'roomId',
      label: '회의실',
      type: 'select',
      options: rooms.map((r) => ({ label: r.name, value: r.id })),
    },
    { name: 'meetingDate', label: '회의일자', type: 'date' },
  ]

  // 검색 핸들러
  const handleSearch = useCallback((values: Record<string, unknown>) => {
    setSearchParams(values)
  }, [])

  const handleReset = useCallback(() => {
    setSearchParams({})
  }, [])

  // 회의현황 request 함수
  const fetchStatus = async (params: PageRequest): Promise<PageResponse<Reservation>> => {
    const queryParams: Record<string, unknown> = {
      page: params.page,
      size: params.size,
    }
    if (searchParams.managingUnit) queryParams.managingUnit = searchParams.managingUnit
    if (searchParams.roomId) queryParams.roomId = searchParams.roomId
    if (searchParams.meetingDate) {
      const dateVal = searchParams.meetingDate as import('dayjs').Dayjs
      queryParams.meetingDate = dateVal.format('YYYY-MM-DD')
    }
    const res = await apiClient.get<ApiResult<PageResponse<Reservation>>>('/sys16/reservations/status', {
      params: queryParams,
    })
    return (res as ApiResult<any>).data
  }

  const columns: ProColumns<Reservation>[] = [
    { title: '번호', dataIndex: 'id', width: 80, render: (_, __, index) => index + 1 },
    { title: '회의실', dataIndex: 'roomName', width: 120 },
    militaryPersonColumn<Reservation>('예약자', {
      serviceNumber: 'reserverServiceNumber',
      rank: 'reserverRank',
      name: 'reserverName',
    }),
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
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <DataTable<Reservation>
        columns={columns}
        request={fetchStatus}
        rowKey="id"
        headerTitle="전체 회의 현황"
      />
    </PageContainer>
  )
}
