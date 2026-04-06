import { useState, useRef } from 'react'
import { Tabs, Calendar, Modal, Form, Select, Button, message, Steps, Input } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { TextArea } = Input

interface DutySchedule extends Record<string, unknown> {
  id: string
  date: string
  officerName: string
  rank: string
  department: string
  status: 'draft' | 'submitted' | 'approved'
}

interface DutyInspection extends Record<string, unknown> {
  id: string
  date: string
  officerName: string
  inspectedUnit: string
  result: '이상없음' | '경미한이상' | '중대한이상'
  details: string
  status: 'draft' | 'submitted'
}

async function fetchDutySchedules(params: PageRequest): Promise<PageResponse<DutySchedule>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<DutySchedule>>>('/api/sys15/duty-officer', {
    params: { page: params.page, size: params.size, type: 'schedule' },
  })
  const data = (res as ApiResult<PageResponse<DutySchedule>>).data ?? (res as unknown as PageResponse<DutySchedule>)
  return data
}

async function fetchDutyInspections(params: PageRequest): Promise<PageResponse<DutyInspection>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<DutyInspection>>>('/api/sys15/duty-officer', {
    params: { page: params.page, size: params.size, type: 'inspection' },
  })
  const data = (res as ApiResult<PageResponse<DutyInspection>>).data ?? (res as unknown as PageResponse<DutyInspection>)
  return data
}

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  submitted: 'orange',
  approved: 'green',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  submitted: '결재대기',
  approved: '승인',
}

const DUTY_STEPS = [
  { title: '작성', description: '당직관' },
  { title: '결재대기', description: '결재자' },
  { title: '승인완료', description: '최종승인' },
]

function getStepCurrent(status: string): number {
  switch (status) {
    case 'draft': return 0
    case 'submitted': return 1
    case 'approved': return 2
    default: return 0
  }
}

interface DutyScheduleModalProps {
  open: boolean
  selectedDate: Dayjs | null
  record?: DutySchedule | null
  onClose: () => void
  onSuccess: () => void
}

function DutyScheduleModal({ open, selectedDate, record, onClose, onSuccess }: DutyScheduleModalProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (record) {
        return apiClient.put(`/api/sys15/duty-officer/${record.id}`, values)
      }
      return apiClient.post('/api/sys15/duty-officer', { ...values, type: 'schedule' })
    },
    onSuccess: () => {
      message.success('저장되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-duty-schedule'] })
      form.resetFields()
      onSuccess()
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  function handleOk() {
    form.validateFields().then((values) => {
      saveMutation.mutate({
        ...values,
        date: selectedDate?.format('YYYY-MM-DD') ?? record?.date,
      })
    })
  }

  const current = record ? getStepCurrent(record.status) : 0
  const stepItems = DUTY_STEPS.map((s, i) => ({
    title: s.title,
    description: s.description,
    status: i < current ? 'finish' as const : i === current ? 'process' as const : 'wait' as const,
  }))

  return (
    <Modal
      title={`당직표 배정 - ${selectedDate?.format('YYYY-MM-DD') ?? record?.date ?? ''}`}
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose() }}
      confirmLoading={saveMutation.isPending}
      okText="저장"
      width={560}
      destroyOnClose
    >
      {record && (
        <Steps
          items={stepItems}
          size="small"
          style={{ marginBottom: 16 }}
        />
      )}
      <Form
        form={form}
        layout="vertical"
        initialValues={record ? { officerName: record.officerName, rank: record.rank, department: record.department } : undefined}
      >
        <Form.Item name="officerName" label="당직관 성명" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="rank" label="계급" rules={[{ required: true }]}>
          <Select options={[
            { value: '중위', label: '중위' },
            { value: '대위', label: '대위' },
            { value: '소령', label: '소령' },
            { value: '중령', label: '중령' },
          ]} />
        </Form.Item>
        <Form.Item name="department" label="부대(서)" rules={[{ required: true }]}>
          <Select options={[
            { value: '1함대', label: '1함대' },
            { value: '2함대', label: '2함대' },
            { value: '3함대', label: '3함대' },
            { value: '해군사령부', label: '해군사령부' },
          ]} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

function DutyCalendarTab() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [currentYear, setCurrentYear] = useState(dayjs().year())
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1)
  const actionRef = useRef<ActionType>()

  // 이번 달 당직표 데이터 (간단한 mock)
  const mockSchedule: Record<string, string> = {}
  for (let d = 1; d <= 30; d += 3) {
    const date = dayjs(`${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    if (date.isValid()) {
      mockSchedule[date.format('YYYY-MM-DD')] = '홍길동'
    }
  }

  const cellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const officer = mockSchedule[dateStr]
    if (!officer) return null
    return (
      <div style={{ fontSize: 10, color: '#1890ff' }}>
        {officer}
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
      setScheduleModalOpen(true)
    }
  }

  const scheduleColumns: ProColumns<DutySchedule>[] = [
    { title: '날짜', dataIndex: 'date', width: 120 },
    { title: '당직관', dataIndex: 'officerName', width: 100 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '부대(서)', dataIndex: 'department' },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (val: unknown) => (
        <StatusBadge status={String(val)} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />
      ),
    },
  ]

  return (
    <div>
      <Calendar
        cellRender={cellRender}
        onSelect={handleSelect}
        onPanelChange={handlePanelChange}
      />
      <div style={{ marginTop: 24 }}>
        <DataTable<DutySchedule>
          actionRef={actionRef}
          queryKey={['sys15-duty-schedule', currentYear, currentMonth]}
          fetchFn={fetchDutySchedules}
          columns={scheduleColumns}
        />
      </div>
      <DutyScheduleModal
        open={scheduleModalOpen}
        selectedDate={selectedDate}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={() => { setScheduleModalOpen(false); actionRef.current?.reload() }}
      />
    </div>
  )
}

interface InspectionFormModalProps {
  open: boolean
  record?: DutyInspection | null
  onClose: () => void
  onSuccess: () => void
}

function InspectionFormModal({ open, record, onClose, onSuccess }: InspectionFormModalProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (record) {
        return apiClient.put(`/api/sys15/duty-officer/${record.id}`, values)
      }
      return apiClient.post('/api/sys15/duty-officer', { ...values, type: 'inspection' })
    },
    onSuccess: () => {
      message.success('점검결과가 저장되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-duty-inspection'] })
      form.resetFields()
      onSuccess()
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  return (
    <Modal
      title={record ? '점검결과 수정' : '점검결과 입력'}
      open={open}
      onOk={() => form.validateFields().then((v) => saveMutation.mutate(v))}
      onCancel={() => { form.resetFields(); onClose() }}
      confirmLoading={saveMutation.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical"
        initialValues={record ?? undefined}
      >
        <Form.Item name="date" label="점검일자" rules={[{ required: true }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="inspectedUnit" label="점검 부대(서)" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="result" label="점검결과" rules={[{ required: true }]}>
          <Select options={[
            { value: '이상없음', label: '이상없음' },
            { value: '경미한이상', label: '경미한이상' },
            { value: '중대한이상', label: '중대한이상' },
          ]} />
        </Form.Item>
        <Form.Item name="details" label="세부사항">
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

function DutyInspectionTab() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<DutyInspection | null>(null)
  const actionRef = useRef<ActionType>()

  const inspectionColumns: ProColumns<DutyInspection>[] = [
    { title: '날짜', dataIndex: 'date', width: 120 },
    { title: '당직관', dataIndex: 'officerName', width: 100 },
    { title: '점검 부대(서)', dataIndex: 'inspectedUnit' },
    {
      title: '결과',
      dataIndex: 'result',
      width: 100,
      render: (val: unknown) => {
        const v = String(val)
        const color = v === '이상없음' ? 'green' : v === '경미한이상' ? 'orange' : 'red'
        return <span style={{ color }}>{v}</span>
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (val: unknown) => (
        <StatusBadge status={String(val)} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />
      ),
    },
    {
      title: '작업',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          onClick={() => { setEditRecord(record); setModalOpen(true) }}
        >
          수정
        </Button>,
      ],
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setEditRecord(null); setModalOpen(true) }}>
          점검결과 입력
        </Button>
      </div>
      <DataTable<DutyInspection>
        actionRef={actionRef}
        queryKey={['sys15-duty-inspection']}
        fetchFn={fetchDutyInspections}
        columns={inspectionColumns}
      />
      <InspectionFormModal
        open={modalOpen}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); actionRef.current?.reload() }}
      />
    </div>
  )
}

export default function DutyOfficerPage() {
  const tabItems = [
    {
      key: 'schedule',
      label: '당직표 작성',
      children: <DutyCalendarTab />,
    },
    {
      key: 'inspection',
      label: '점검결과 입력',
      children: <DutyInspectionTab />,
    },
  ]

  return (
    <PageContainer title="점검관 당직표">
      <Tabs defaultActiveKey="schedule" items={tabItems} />
    </PageContainer>
  )
}
