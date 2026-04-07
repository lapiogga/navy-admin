import { useState, useRef } from 'react'
import { Modal, Form, Button, TimePicker, DatePicker, Select, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtRequest } from '@/shared/api/mocks/handlers/sys01-overtime'

const { TextArea } = Input

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  pending: '결재대기',
  approved: '승인',
  rejected: '반려',
}

const REQUEST_TYPE_OPTIONS = [
  { label: '사전', value: '사전' },
  { label: '사후', value: '사후' },
]

async function fetchRequests(params: PageRequest): Promise<PageResponse<OtRequest>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtRequest>>>('/sys01/requests', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtRequest>>).data ?? (res as unknown as PageResponse<OtRequest>)
  return data
}

const DUTY_POST_OPTIONS = [
  { label: '제1당직실', value: '제1당직실' },
  { label: '제2당직실', value: '제2당직실' },
  { label: '제3당직실', value: '제3당직실' },
  { label: '본부 당직실', value: '본부 당직실' },
  { label: '지휘통제실', value: '지휘통제실' },
  { label: '통신당직실', value: '통신당직실' },
  { label: '함정당직실', value: '함정당직실' },
]

/** 검색 필드 정의 */
const searchFields: SearchField[] = [
  { name: 'requestType', label: '신청서 종류', type: 'select', options: REQUEST_TYPE_OPTIONS },
  { name: 'workDate', label: '근무일', type: 'date' },
  { name: 'status', label: '상태', type: 'select', options: [
    { label: '작성중', value: 'draft' },
    { label: '결재대기', value: 'pending' },
    { label: '승인', value: 'approved' },
    { label: '반려', value: 'rejected' },
  ]},
]

interface FormValues {
  requestType: string
  workDate: Dayjs
  timeRange: [Dayjs, Dayjs]
  applicantIp: string
  dutyPost: string
  reason: string
}

interface OtRequestFormProps {
  open: boolean
  editRecord?: OtRequest | null
  onClose: () => void
  onSuccess: () => void
}

function OtRequestForm({ open, editRecord, onClose, onSuccess }: OtRequestFormProps) {
  const [form] = Form.useForm<FormValues>()
  const [totalHours, setTotalHours] = useState<string>('0.0')
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const startTime = values.timeRange[0].format('HH:mm')
      const endTime = values.timeRange[1].format('HH:mm')
      const minutes = values.timeRange[1].diff(values.timeRange[0], 'minutes')
      const hours = parseFloat((minutes / 60).toFixed(1))
      const payload = {
        requestType: values.requestType,
        workDate: values.workDate.format('YYYY-MM-DD'),
        startTime,
        endTime,
        totalHours: hours,
        applicantIp: values.applicantIp,
        dutyPost: values.dutyPost,
        reason: values.reason,
      }
      if (editRecord) {
        return apiClient.put(`/sys01/requests/${editRecord.id}`, payload)
      }
      return apiClient.post('/sys01/requests', payload)
    },
    onSuccess: () => {
      message.success(editRecord ? '수정되었습니다.' : '신청서가 등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys01-requests'] })
      onSuccess()
      form.resetFields()
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  const handleTimeChange = (times: [Dayjs | null, Dayjs | null] | null) => {
    if (times && times[0] && times[1]) {
      const minutes = times[1].diff(times[0], 'minutes')
      setTotalHours((minutes / 60).toFixed(1))
    } else {
      setTotalHours('0.0')
    }
  }

  return (
    <Modal
      title={editRecord ? '신청서 수정' : '신청서 작성'}
      open={open}
      onCancel={() => { onClose(); form.resetFields() }}
      footer={null}
      width={520}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => saveMutation.mutate(values)}
      >
        <Form.Item name="requestType" label="신청서 종류" rules={[{ required: true }]}>
          <Select options={REQUEST_TYPE_OPTIONS} placeholder="종류 선택" />
        </Form.Item>
        <Form.Item name="workDate" label="근무일" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="timeRange" label="시작/종료 시간" rules={[{ required: true }]}>
          <TimePicker.RangePicker
            format="HH:mm"
            style={{ width: '100%' }}
            onChange={handleTimeChange}
          />
        </Form.Item>
        <Form.Item label="총 근무시간">
          <Input value={`${totalHours} 시간`} readOnly style={{ background: '#f5f5f5' }} />
        </Form.Item>
        <Form.Item name="applicantIp" label="신청자 IP">
          <Input placeholder="예: 192.168.1.1" />
        </Form.Item>
        <Form.Item name="dutyPost" label="당직개소" rules={[{ required: true }]}>
          <Select options={DUTY_POST_OPTIONS} placeholder="당직개소 선택" />
        </Form.Item>
        <Form.Item name="reason" label="근무사유" rules={[{ required: true }]}>
          <TextArea rows={3} placeholder="근무사유를 입력하세요" />
        </Form.Item>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={() => { onClose(); form.resetFields() }}>취소</Button>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>저장</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default function OtRequestPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<OtRequest | null>(null)
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sys01/requests/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys01-requests'] })
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<OtRequest>[] = [
    { title: '신청서 종류', dataIndex: 'requestType', width: 100 },
    { title: '근무일', dataIndex: 'workDate', width: 110 },
    { title: '시작시간', dataIndex: 'startTime', width: 90 },
    { title: '종료시간', dataIndex: 'endTime', width: 90 },
    { title: '총근무시간(h)', dataIndex: 'totalHours', width: 110 },
    { title: '당직개소', dataIndex: 'dutyPost', width: 120 },
    { title: '근무사유', dataIndex: 'reason', ellipsis: true },
    militaryPersonColumn<OtRequest>('신청자', { serviceNumber: 'serviceNumber', rank: 'rank', name: 'applicantName' }),
    { title: '부대(서)', dataIndex: 'applicantUnit', width: 100 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    {
      title: '작업',
      valueType: 'option',
      width: 140,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          size="small"
          disabled={record.status !== 'draft'}
          onClick={() => { setEditRecord(record); setFormOpen(true) }}
        >
          수정
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          size="small"
          disabled={record.status !== 'draft'}
          onClick={() => showConfirmDialog({
            title: '삭제 확인',
            content: '신청서를 삭제하시겠습니까?',
            danger: true,
            onConfirm: () => deleteMutation.mutate(record.id),
          })}
        >
          삭제
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer title="신청서 작성">
      <SearchForm fields={searchFields} onSearch={(values) => { console.log('검색:', values); actionRef.current?.reload() }} />
      <DataTable<OtRequest>
        columns={columns}
        request={fetchRequests}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="초과근무 신청서 목록"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditRecord(null); setFormOpen(true) }}
          >
            신청서 작성
          </Button>,
        ]}
      />
      <OtRequestForm
        open={formOpen}
        editRecord={editRecord}
        onClose={() => { setFormOpen(false); setEditRecord(null) }}
        onSuccess={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload() }}
      />
    </PageContainer>
  )
}
