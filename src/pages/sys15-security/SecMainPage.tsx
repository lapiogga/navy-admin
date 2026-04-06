import { useState } from 'react'
import { Tabs, Calendar, Badge, Modal, Alert, Spin } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

type DayStatus = 'completed' | 'incomplete' | 'absence' | 'future' | 'none'

interface DailyStatus {
  date: string
  personalStatus: DayStatus
  officeStatus: DayStatus
}

async function fetchDailyStatus(year: number, month: number, type: 'personal' | 'office'): Promise<DailyStatus[]> {
  const res = await apiClient.get<never, ApiResult<DailyStatus[]>>('/api/sys15/daily-status', {
    params: { year, month, type },
  })
  const data = (res as ApiResult<DailyStatus[]>).data ?? (res as unknown as DailyStatus[])
  return data
}

function getStatusBadge(status: DayStatus) {
  switch (status) {
    case 'completed': return { status: 'success' as const, text: '완료' }
    case 'incomplete': return { status: 'error' as const, text: '미실시' }
    case 'absence': return { status: 'default' as const, text: '부재' }
    default: return null
  }
}

interface CalendarTabProps {
  type: 'personal' | 'office'
}

function CalendarTab({ type }: CalendarTabProps) {
  const [currentYear, setCurrentYear] = useState(dayjs().year())
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const { data: statusList = [], isLoading } = useQuery({
    queryKey: ['sys15-daily-status', type, currentYear, currentMonth],
    queryFn: () => fetchDailyStatus(currentYear, currentMonth, type),
  })

  const statusMap: Record<string, DayStatus> = {}
  statusList.forEach((s) => {
    statusMap[s.date] = type === 'personal' ? s.personalStatus : s.officeStatus
  })

  // 오늘 미실시 항목 확인
  const today = dayjs().format('YYYY-MM-DD')
  const todayStatus = statusMap[today]
  const showAlert = todayStatus === 'incomplete'

  const cellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const status = statusMap[dateStr]
    const badge = getStatusBadge(status ?? 'none')
    if (!badge) return null
    return (
      <div style={{ lineHeight: 1 }}>
        <Badge status={badge.status} text={<span style={{ fontSize: 10 }}>{badge.text}</span>} />
      </div>
    )
  }

  const handlePanelChange = (date: Dayjs) => {
    setCurrentYear(date.year())
    setCurrentMonth(date.month() + 1)
    setSelectedDate(null)
  }

  const handleSelect = (date: Dayjs, info: { source: string }) => {
    if (info.source === 'date') {
      setSelectedDate(date)
      setDetailOpen(true)
    }
  }

  const selectedDateStr = selectedDate?.format('YYYY-MM-DD') ?? ''
  const selectedStatus = statusMap[selectedDateStr]

  return (
    <div>
      {showAlert && (
        <Alert
          message="오늘 보안일일결산이 미실시 상태입니다. 결산을 진행해주세요."
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      <Spin spinning={isLoading}>
        <Calendar
          cellRender={cellRender}
          onSelect={handleSelect}
          onPanelChange={handlePanelChange}
        />
      </Spin>
      <Modal
        title={`${selectedDateStr} 결산 상세`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        destroyOnClose
      >
        <p>
          <strong>날짜:</strong> {selectedDateStr}
        </p>
        <p>
          <strong>상태:</strong>{' '}
          {selectedStatus === 'completed' ? '완료' :
           selectedStatus === 'incomplete' ? '미실시' :
           selectedStatus === 'absence' ? '부재' : '미래/미정'}
        </p>
      </Modal>
    </div>
  )
}

export default function SecMainPage() {
  const tabItems = [
    {
      key: 'personal',
      label: '개인보안결산',
      children: <CalendarTab type="personal" />,
    },
    {
      key: 'office',
      label: '사무실보안결산',
      children: <CalendarTab type="office" />,
    },
  ]

  return (
    <PageContainer title="보안일일결산 메인">
      <Tabs defaultActiveKey="personal" items={tabItems} />
    </PageContainer>
  )
}
