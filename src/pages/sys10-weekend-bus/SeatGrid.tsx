import { Button, Row, Col } from 'antd'
import { UserOutlined } from '@ant-design/icons'

export type SeatStatus = 'available' | 'reserved' | 'selected' | 'unavailable'

export interface Seat {
  id: string
  seatNo: string
  status: SeatStatus
}

export interface SeatGridProps {
  seats: Seat[]
  onSeatClick: (seatId: string) => void
  readOnly?: boolean
}

const STATUS_COLOR: Record<SeatStatus, string> = {
  available: '#1677ff',
  reserved: '#8c8c8c',
  selected: '#52c41a',
  unavailable: '#ff4d4f',
}

const STATUS_LABEL: Record<SeatStatus, string> = {
  available: '빈좌석',
  reserved: '예약됨',
  selected: '내선택',
  unavailable: '불가',
}

export function SeatGrid({ seats, onSeatClick, readOnly = false }: SeatGridProps) {
  const rowCount = Math.ceil(seats.length / 4)

  return (
    <div>
      {/* 운전석 */}
      <Row justify="end" style={{ marginBottom: 8 }}>
        <Col>
          <Button disabled icon={<UserOutlined />} size="small">
            운전석
          </Button>
        </Col>
      </Row>

      {/* 좌석 그리드 */}
      {Array.from({ length: rowCount }, (_, rowIdx) => {
        const rowSeats = seats.slice(rowIdx * 4, rowIdx * 4 + 4)
        const [s1, s2, s3, s4] = rowSeats

        return (
          <Row key={rowIdx} gutter={[4, 4]} style={{ marginBottom: 4 }} align="middle">
            {/* 좌석 1 */}
            <Col span={5}>
              {s1 ? (
                <Button
                  size="small"
                  block
                  style={{
                    width: 40,
                    height: 40,
                    background: STATUS_COLOR[s1.status],
                    color: '#fff',
                    borderColor: STATUS_COLOR[s1.status],
                  }}
                  disabled={readOnly || s1.status === 'reserved' || s1.status === 'unavailable'}
                  onClick={() => onSeatClick(s1.id)}
                >
                  {s1.seatNo}
                </Button>
              ) : null}
            </Col>

            {/* 좌석 2 */}
            <Col span={5}>
              {s2 ? (
                <Button
                  size="small"
                  block
                  style={{
                    width: 40,
                    height: 40,
                    background: STATUS_COLOR[s2.status],
                    color: '#fff',
                    borderColor: STATUS_COLOR[s2.status],
                  }}
                  disabled={readOnly || s2.status === 'reserved' || s2.status === 'unavailable'}
                  onClick={() => onSeatClick(s2.id)}
                >
                  {s2.seatNo}
                </Button>
              ) : null}
            </Col>

            {/* 통로 */}
            <Col span={2} />

            {/* 좌석 3 */}
            <Col span={5}>
              {s3 ? (
                <Button
                  size="small"
                  block
                  style={{
                    width: 40,
                    height: 40,
                    background: STATUS_COLOR[s3.status],
                    color: '#fff',
                    borderColor: STATUS_COLOR[s3.status],
                  }}
                  disabled={readOnly || s3.status === 'reserved' || s3.status === 'unavailable'}
                  onClick={() => onSeatClick(s3.id)}
                >
                  {s3.seatNo}
                </Button>
              ) : null}
            </Col>

            {/* 좌석 4 */}
            <Col span={5}>
              {s4 ? (
                <Button
                  size="small"
                  block
                  style={{
                    width: 40,
                    height: 40,
                    background: STATUS_COLOR[s4.status],
                    color: '#fff',
                    borderColor: STATUS_COLOR[s4.status],
                  }}
                  disabled={readOnly || s4.status === 'reserved' || s4.status === 'unavailable'}
                  onClick={() => onSeatClick(s4.id)}
                >
                  {s4.seatNo}
                </Button>
              ) : null}
            </Col>
          </Row>
        )
      })}

      {/* 범례 */}
      <Row gutter={8} style={{ marginTop: 12 }}>
        {(['available', 'reserved', 'selected', 'unavailable'] as SeatStatus[]).map((status) => (
          <Col key={status}>
            <Button
              size="small"
              style={{
                background: STATUS_COLOR[status],
                color: '#fff',
                borderColor: STATUS_COLOR[status],
                pointerEvents: 'none',
                marginRight: 4,
              }}
              disabled
            >
              &nbsp;
            </Button>
            <span style={{ fontSize: 12 }}>{STATUS_LABEL[status]}</span>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default SeatGrid
