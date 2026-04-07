import { useState, useRef } from 'react'
import { Button, Modal, Space, Popconfirm, message } from 'antd'
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest } from '@/shared/api/types'
import { TicketPrint } from './TicketPrint'
import { PrintableReport } from '@/pages/sys09-memorial/PrintableReport'

interface ReservationRecord extends Record<string, unknown> {
  id: string
  routeName: string
  operationDate: string
  departureTime: string
  totalSeats: number
  reservedCount: number
  unit: string
  userName: string
  seatNo: string
  status: 'reserved' | 'cancelled' | 'waiting'
}

const STATUS_COLOR_MAP: Record<string, string> = {
  reserved: 'green',
  cancelled: 'default',
  waiting: 'gold',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  reserved: '예약됨',
  cancelled: '취소됨',
  waiting: '대기중',
}

export function BusReservationStatusPage() {
  const actionRef = useRef<ActionType>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ReservationRecord | null>(null)
  const [allData, setAllData] = useState<ReservationRecord[]>([])

  const fetchReservations = async (params: PageRequest) => {
    const qs = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      ...Object.fromEntries(
        Object.entries(searchParams)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ),
    })
    const res = await apiClient.get<{ content: ReservationRecord[]; totalElements: number }>(
      `/sys10/reservations?${qs.toString()}`
    )
    setAllData(res.data.content)
    return {
      content: res.data.content,
      totalElements: res.data.totalElements,
      totalPages: Math.ceil(res.data.totalElements / params.size),
    }
  }

  const handleCancel = async (record: ReservationRecord) => {
    try {
      await apiClient.put(`/sys10/reservations/${record.id}/cancel`, {})
      message.success('예약이 취소되었습니다')
      actionRef.current?.reload()
    } catch {
      message.error('예약 취소에 실패했습니다')
    }
  }

  const columns: ProColumns<ReservationRecord>[] = [
    { title: '운행일자', dataIndex: 'operationDate', width: 110 },
    { title: '노선', dataIndex: 'routeName', width: 120 },
    { title: '출발시간', dataIndex: 'departureTime', width: 90 },
    { title: '전체좌석', dataIndex: 'totalSeats', width: 80 },
    { title: '예약인원', dataIndex: 'reservedCount', width: 80 },
    { title: '부대(서)', dataIndex: 'unit', width: 100 },
    { title: '예약자', dataIndex: 'userName', width: 90 },
    { title: '좌석번호', dataIndex: 'seatNo', width: 80 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
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
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setSelectedRecord(record)
              setTicketModalOpen(true)
            }}
          >
            승차권 발급
          </Button>
          <Popconfirm
            title="예약을 취소하시겠습니까?"
            onConfirm={() => handleCancel(record)}
            okText="확인"
            cancelText="취소"
          >
            <Button size="small" danger disabled={record.status === 'cancelled'}>
              예약 취소
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>주말버스 예약현황</h2>

      <SearchForm
        fields={[
          { name: 'dateRange', label: '운행일자', type: 'dateRange' },
          {
            name: 'routeId',
            label: '노선',
            type: 'select',
            options: [
              { label: '서울→포항', value: 'r1' },
              { label: '서울→청주', value: 'r2' },
              { label: '서울→대전', value: 'r3' },
              { label: '서울→광주', value: 'r4' },
              { label: '서울→부산', value: 'r5' },
            ],
          },
          { name: 'unit', label: '부대(서)', type: 'text', placeholder: '부대(서) 입력' },
          { name: 'keyword', label: '예약자 성명/군번', type: 'text', placeholder: '예약자 검색' },
        ]}
        onSearch={(values) => {
          setSearchParams(values)
          actionRef.current?.reload()
        }}
        onReset={() => {
          setSearchParams({})
          actionRef.current?.reload()
        }}
      />

      <DataTable<ReservationRecord>
        columns={columns}
        request={fetchReservations}
        rowKey="id"
        headerTitle="예약 목록"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            key="excel"
            icon={<DownloadOutlined />}
            onClick={() => message.info('엑셀 다운로드')}
          >
            엑셀 다운로드
          </Button>,
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => setPrintModalOpen(true)}
          >
            인쇄
          </Button>,
        ]}
      />

      {/* 승차권 발급 Modal */}
      <Modal
        title="승차권 발급"
        open={ticketModalOpen}
        onCancel={() => setTicketModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <TicketPrint
            reservation={{
              routeName: selectedRecord.routeName,
              operationDate: selectedRecord.operationDate,
              departureTime: selectedRecord.departureTime,
              departure: '서울',
              destination: '포항',
              stopover: '-',
              seatNo: selectedRecord.seatNo,
              userName: selectedRecord.userName,
              rank: '-',
              militaryId: '-',
              unit: selectedRecord.unit,
            }}
          />
        )}
      </Modal>

      {/* 예약현황 인쇄 미리보기 Modal */}
      <Modal
        title="예약현황 인쇄"
        open={printModalOpen}
        onCancel={() => setPrintModalOpen(false)}
        footer={null}
        width={800}
      >
        <PrintableReport title="주말버스 예약현황">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['운행일자', '노선', '출발시간', '부대(서)', '예약자', '좌석번호', '상태'].map((h) => (
                  <th
                    key={h}
                    style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f5f5f5' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allData.map((row) => (
                <tr key={row.id}>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.operationDate}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.routeName}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.departureTime}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.unit}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.userName}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.seatNo}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>
                    {STATUS_LABEL_MAP[row.status] ?? row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintableReport>
      </Modal>
    </div>
  )
}
