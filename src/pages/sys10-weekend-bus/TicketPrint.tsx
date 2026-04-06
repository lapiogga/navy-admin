import { Descriptions } from 'antd'
import { PrintableReport } from '@/pages/sys09-memorial/PrintableReport'

interface TicketInfo {
  routeName: string
  operationDate: string
  departureTime: string
  departure: string
  destination: string
  stopover: string
  seatNo: string
  userName: string
  rank: string
  militaryId: string
  unit: string
}

interface TicketPrintProps {
  reservation: TicketInfo
}

export function TicketPrint({ reservation }: TicketPrintProps) {
  return (
    <PrintableReport title="주말버스 승차권">
      <Descriptions bordered column={2} layout="vertical" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="노선">{reservation.routeName}</Descriptions.Item>
        <Descriptions.Item label="좌석번호">{reservation.seatNo}</Descriptions.Item>
        <Descriptions.Item label="운행일자">{reservation.operationDate}</Descriptions.Item>
        <Descriptions.Item label="출발시간">{reservation.departureTime}</Descriptions.Item>
        <Descriptions.Item label="출발지">{reservation.departure}</Descriptions.Item>
        <Descriptions.Item label="도착지">{reservation.destination}</Descriptions.Item>
        <Descriptions.Item label="경유지" span={2}>{reservation.stopover}</Descriptions.Item>
        <Descriptions.Item label="예약자 성명">{reservation.userName}</Descriptions.Item>
        <Descriptions.Item label="계급">{reservation.rank}</Descriptions.Item>
        <Descriptions.Item label="군번">{reservation.militaryId}</Descriptions.Item>
        <Descriptions.Item label="소속">{reservation.unit}</Descriptions.Item>
      </Descriptions>

      {/* QR코드 자리 */}
      <div
        style={{
          width: 120,
          height: 120,
          background: '#d9d9d9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '16px auto',
          fontSize: 18,
          color: '#666',
        }}
      >
        QR
      </div>

      <p style={{ textAlign: 'center', color: '#333', fontSize: 13 }}>
        본 승차권은 탑승 시 제시하여야 합니다.
      </p>
    </PrintableReport>
  )
}
