import { useRef } from 'react'
import { Popconfirm, Button, Space, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
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

const STATUS_COLOR_MAP = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP = { pending: '대기', approved: '승인', rejected: '반려' }

export default function ReservationMgmtPage() {
  const queryClient = useQueryClient()
  const dataRef = useRef<Reservation[]>([])

  // 엑셀 다운로드 (CSV 변환)
  const handleExcelExport = () => {
    const header = '회의실,예약일,시간,목적,신청자,상태'
    const rows = dataRef.current.map((r) =>
      [r.roomName, r.date, `${r.startTime}~${r.endTime}`, r.purpose, r.applicant, r.status].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '회의예약목록.csv'
    link.click()
    URL.revokeObjectURL(url)
    message.success('엑셀 다운로드가 완료되었습니다')
  }

  // 프린트
  const handlePrint = () => {
    window.print()
  }

  // 전체 예약 목록 request 함수
  const fetchReservations = async (params: PageRequest): Promise<PageResponse<Reservation>> => {
    const res = await apiClient.get<ApiResult<PageResponse<Reservation>>>('/sys16/reservations', {
      params: { page: params.page, size: params.size },
    })
    dataRef.current = (res as ApiResult<any>).data.content
    return (res as ApiResult<any>).data
  }

  // 승인 뮤테이션
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch<ApiResult>(`/sys16/reservations/${id}/approve`)
      return res
    },
    onSuccess: () => {
      message.success('예약이 승인되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys16', 'reservations'] })
    },
    onError: () => {
      message.error('승인 처리에 실패했습니다')
    },
  })

  // 반려 뮤테이션
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.patch<ApiResult>(`/sys16/reservations/${id}/reject`)
      return res
    },
    onSuccess: () => {
      message.success('예약이 반려되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys16', 'reservations'] })
    },
    onError: () => {
      message.error('반려 처리에 실패했습니다')
    },
  })

  const columns: ProColumns<Reservation>[] = [
    { title: '번호', dataIndex: 'id', width: 80, render: (_, __, index) => index + 1 },
    militaryPersonColumn<Reservation>('신청자', {
      serviceNumber: 'reserverServiceNumber',
      rank: 'reserverRank',
      name: 'reserverName',
    }),
    { title: '회의실', dataIndex: 'roomName', width: 120 },
    { title: '예약일', dataIndex: 'date', width: 110 },
    {
      title: '시간',
      width: 130,
      render: (_, record) => `${record.startTime} ~ ${record.endTime}`,
    },
    { title: '목적', dataIndex: 'purpose', ellipsis: true },
    {
      title: '처리',
      width: 180,
      render: (_, record) => {
        if (record.status === 'pending') {
          return (
            <span>
              <Popconfirm
                title="승인하시겠습니까?"
                onConfirm={() => approveMutation.mutate(record.id)}
              >
                <Button type="primary" size="small" style={{ marginRight: 8 }}>
                  승인
                </Button>
              </Popconfirm>
              <Popconfirm
                title="반려하시겠습니까?"
                onConfirm={() => rejectMutation.mutate(record.id)}
              >
                <Button danger size="small">
                  반려
                </Button>
              </Popconfirm>
            </span>
          )
        }
        return (
          <StatusBadge
            status={record.status}
            colorMap={STATUS_COLOR_MAP}
            labelMap={STATUS_LABEL_MAP}
          />
        )
      },
    },
  ]

  return (
    <PageContainer title="회의예약관리">
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={handleExcelExport}>엑셀 다운로드</Button>
        <Button onClick={handlePrint}>프린트</Button>
      </Space>
      <DataTable<Reservation>
        columns={columns}
        request={fetchReservations}
        rowKey="id"
        headerTitle="예약 목록"
      />
    </PageContainer>
  )
}
