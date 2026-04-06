import { useState } from 'react'
import { Row, Col, Form, DatePicker, Select, Input, Button, message, Modal } from 'antd'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { SeatGrid } from './SeatGrid'
import type { Seat } from './SeatGrid'
import { TicketPrint } from './TicketPrint'

interface Route {
  id: string
  name: string
  departure: string
  destination: string
  stopover: string
  timetable: string[]
}

interface ReservationResult {
  id: string
  routeId: string
  operationDate: string
  departureTime: string
  seatId: string
  seatNo?: string
}

export function BusReservationPage() {
  const [form] = Form.useForm()
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [reservationResult, setReservationResult] = useState<ReservationResult | null>(null)

  // 노선 목록 조회
  const { data: routeData } = useQuery({
    queryKey: ['sys10-routes'],
    queryFn: () => apiClient.get<{ content: Route[] }>('/api/sys10/routes').then((r) => r.data),
  })

  const routes = routeData?.content ?? []
  const selectedRoute = routes.find((r) => r.id === selectedRouteId)

  // 좌석 현황 조회
  const { refetch: refetchSeats } = useQuery({
    queryKey: ['sys10-seats', selectedRouteId, selectedDate, selectedTime],
    queryFn: async () => {
      if (!selectedRouteId || !selectedDate || !selectedTime) return { content: [] }
      const res = await apiClient.get<{ content: Seat[] }>(
        `/api/sys10/routes/${selectedRouteId}/seats?date=${selectedDate}&time=${selectedTime}`
      )
      const fetchedSeats = res.data.content
      setSeats(fetchedSeats)
      setSelectedSeatId(null)
      return res.data
    },
    enabled: !!(selectedRouteId && selectedDate && selectedTime),
  })

  // 예약 신청 뮤테이션
  const reservationMutation = useMutation({
    mutationFn: (data: { routeId: string; operationDate: string; departureTime: string; seatId: string }) =>
      apiClient.post<ReservationResult>('/api/sys10/reservations', data).then((r) => r.data),
    onSuccess: (result) => {
      message.success('예약이 완료되었습니다')
      setReservationResult(result)
    },
    onError: () => {
      message.error('예약 신청에 실패했습니다')
    },
  })

  const handleSeatClick = (seatId: string) => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.id !== seatId) return seat
        if (seat.status === 'available') return { ...seat, status: 'selected' }
        if (seat.status === 'selected') return { ...seat, status: 'available' }
        return seat
      })
    )
    setSelectedSeatId((prev) => (prev === seatId ? null : seatId))
  }

  const handleReservation = () => {
    if (!selectedRouteId || !selectedDate || !selectedTime) {
      message.warning('노선, 일자, 출발시간을 선택해주세요')
      return
    }
    if (!selectedSeatId) {
      message.warning('좌석을 선택해주세요')
      return
    }
    reservationMutation.mutate({
      routeId: selectedRouteId,
      operationDate: selectedDate,
      departureTime: selectedTime,
      seatId: selectedSeatId,
    })
  }

  const loadSeats = () => {
    if (selectedRouteId && selectedDate && selectedTime) {
      refetchSeats()
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>주말버스 예약</h2>
      <Row gutter={[16, 16]}>
        {/* 좌측: 버스 정보 선택 */}
        <Col span={12}>
          <Form form={form} layout="vertical">
            <Form.Item name="operationDate" label="운행일자" rules={[{ required: true }]}>
              <DatePicker
                style={{ width: '100%' }}
                onChange={(_, dateString) => {
                  setSelectedDate(typeof dateString === 'string' ? dateString : null)
                  loadSeats()
                }}
              />
            </Form.Item>

            <Form.Item name="routeId" label="노선" rules={[{ required: true }]}>
              <Select
                placeholder="노선을 선택하세요"
                options={routes.map((r) => ({ label: r.name, value: r.id }))}
                onChange={(val) => {
                  setSelectedRouteId(val)
                  setSelectedTime(null)
                  form.setFieldValue('departureTime', undefined)
                  loadSeats()
                }}
              />
            </Form.Item>

            <Form.Item name="departureTime" label="출발시간" rules={[{ required: true }]}>
              <Select
                placeholder="출발시간을 선택하세요"
                disabled={!selectedRouteId}
                options={(selectedRoute?.timetable ?? []).map((t) => ({ label: t, value: t }))}
                onChange={(val) => {
                  setSelectedTime(val)
                  loadSeats()
                }}
              />
            </Form.Item>

            {selectedRoute && (
              <Form.Item label="경유지">
                <Input value={selectedRoute.stopover} readOnly />
              </Form.Item>
            )}
          </Form>

          <Button
            type="primary"
            onClick={handleReservation}
            loading={reservationMutation.isPending}
            disabled={!selectedSeatId}
            style={{ marginTop: 16 }}
          >
            예약 신청
          </Button>

          {reservationResult && (
            <Button
              style={{ marginTop: 8, marginLeft: 8 }}
              onClick={() => setTicketModalOpen(true)}
            >
              승차권 발급
            </Button>
          )}
        </Col>

        {/* 우측: 좌석 그리드 */}
        <Col span={12}>
          <div style={{ padding: '16px', border: '1px solid #d9d9d9', borderRadius: 4 }}>
            <h3>좌석 선택</h3>
            {seats.length > 0 ? (
              <SeatGrid seats={seats} onSeatClick={handleSeatClick} />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                노선, 일자, 출발시간을 선택하면 좌석이 표시됩니다
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* 승차권 발급 Modal */}
      <Modal
        title="승차권 발급"
        open={ticketModalOpen}
        onCancel={() => setTicketModalOpen(false)}
        footer={null}
        width={600}
      >
        {reservationResult && selectedRoute && (
          <TicketPrint
            reservation={{
              routeName: selectedRoute.name,
              operationDate: reservationResult.operationDate ?? selectedDate ?? '',
              departureTime: reservationResult.departureTime ?? selectedTime ?? '',
              departure: selectedRoute.departure,
              destination: selectedRoute.destination,
              stopover: selectedRoute.stopover,
              seatNo: reservationResult.seatNo ?? selectedSeatId ?? '',
              userName: '홍길동',
              rank: '상병',
              militaryId: '24-1234567',
              unit: '1사단',
            }}
          />
        )}
      </Modal>
    </div>
  )
}
