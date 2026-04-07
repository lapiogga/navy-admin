import { useRef, useState } from 'react'
import { Button, Modal, Select, message } from 'antd'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import dayjs from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest } from '@/shared/api/types'

interface WaitlistItem {
  id: string
  waitingNo: number
  operationDate: string
  route: string
  userName: string
  rank: string
  unit: string
  waitingDate: string
  assignedSeat: string | null
  status: 'waiting' | 'assigned' | 'cancelled'
}

const STATUS_COLOR_MAP: Record<string, string> = {
  waiting: 'gold',
  assigned: 'green',
  cancelled: 'default',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  waiting: '대기중',
  assigned: '배정완료',
  cancelled: '취소됨',
}

export function BusWaitlistPage() {
  const actionRef = useRef<ActionType>()
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [selectedWaiting, setSelectedWaiting] = useState<WaitlistItem | null>(null)
  const [availableSeats, setAvailableSeats] = useState<{ id: string; seatNo: string }[]>([])
  const [selectedSeatId, setSelectedSeatId] = useState<string | undefined>()
  const [manualLoading, setManualLoading] = useState(false)

  const columns: ProColumns<WaitlistItem>[] = [
    { title: '순번', dataIndex: 'waitingNo', width: 60 },
    { title: '운행일', dataIndex: 'operationDate', width: 120 },
    { title: '노선', dataIndex: 'route', width: 120 },
    { title: '신청자', dataIndex: 'userName', width: 100 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '부대(서)', dataIndex: 'unit', width: 120 },
    {
      title: '대기 신청일',
      dataIndex: 'waitingDate',
      width: 120,
      render: (val) => val ? dayjs(val as string).format('YYYY-MM-DD') : '-',
    },
    { title: '배정 좌석', dataIndex: 'assignedSeat', width: 100, render: (val) => val ?? '-' },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          size="small"
          disabled={record.status !== 'waiting'}
          onClick={() => handleOpenManualAssign(record)}
        >
          수동 배정
        </Button>
      ),
    },
  ]

  async function fetchList(params: PageRequest) {
    const res = await apiClient.get('/sys10/waitlist', {
      params: { page: params.page, size: params.size },
    })
    return res.data
  }

  async function handleAutoAssign() {
    try {
      const res = await apiClient.post('/sys10/waitlist/auto-assign')
      const { assignedCount } = res.data as { assignedCount: number }
      if (assignedCount > 0) {
        message.success(`총 ${assignedCount}명이 자동 배정되었습니다.`)
      } else {
        message.warning('배정 가능한 빈좌석이 없습니다.')
      }
      actionRef.current?.reload()
    } catch {
      message.error('자동 배정 중 오류가 발생했습니다.')
    }
  }

  async function handleOpenManualAssign(record: WaitlistItem) {
    setSelectedWaiting(record)
    setSelectedSeatId(undefined)
    try {
      const res = await apiClient.get(`/sys10/waitlist/${record.id}/available-seats`)
      setAvailableSeats(res.data as { id: string; seatNo: string }[])
    } catch {
      setAvailableSeats([])
    }
    setManualModalOpen(true)
  }

  async function handleManualAssign() {
    if (!selectedWaiting || !selectedSeatId) return
    setManualLoading(true)
    try {
      await apiClient.post(`/sys10/waitlist/${selectedWaiting.id}/manual-assign`, {
        seatId: selectedSeatId,
      })
      message.success('수동 배정이 완료되었습니다.')
      setManualModalOpen(false)
      actionRef.current?.reload()
    } catch {
      message.error('수동 배정 중 오류가 발생했습니다.')
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <>
      <DataTable<WaitlistItem>
        headerTitle="대기자 관리"
        columns={columns}
        request={fetchList}
        rowKey="id"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            key="auto-assign"
            type="primary"
            onClick={handleAutoAssign}
          >
            자동 배정
          </Button>,
          <Button
            key="excel"
            onClick={() => message.success('엑셀 파일이 다운로드 되었습니다.')}
          >
            엑셀 다운로드
          </Button>,
        ]}
      />

      <Modal
        title="수동 배정"
        open={manualModalOpen}
        onCancel={() => setManualModalOpen(false)}
        onOk={handleManualAssign}
        confirmLoading={manualLoading}
        okText="배정"
        cancelText="취소"
      >
        <p>
          <strong>{selectedWaiting?.userName}</strong> ({selectedWaiting?.rank}) 에게 좌석을
          배정합니다.
        </p>
        <Select
          style={{ width: '100%' }}
          placeholder="빈좌석 선택"
          value={selectedSeatId}
          onChange={setSelectedSeatId}
          options={availableSeats.map((s) => ({ label: s.seatNo, value: s.id }))}
        />
      </Modal>
    </>
  )
}
