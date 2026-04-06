import { useState, useRef } from 'react'
import { Modal, Form, Button, DatePicker, Select, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtAbsence } from '@/shared/api/mocks/handlers/sys01-overtime'

const { RangePicker } = DatePicker
const { TextArea } = Input

const ABSENCE_TYPE_OPTIONS = [
  { label: '휴가', value: '휴가' },
  { label: '휴직', value: '휴직' },
  { label: '출장', value: '출장' },
  { label: '파견', value: '파견' },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
}

async function fetchAbsences(params: PageRequest): Promise<PageResponse<OtAbsence>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtAbsence>>>('/api/sys01/absences', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtAbsence>>).data ?? (res as unknown as PageResponse<OtAbsence>)
  return data
}

interface AbsenceFormValues {
  absenceType: string
  dateRange: [Dayjs, Dayjs]
  reason: string
}

interface AbsenceFormProps {
  open: boolean
  editRecord?: OtAbsence | null
  onClose: () => void
  onSuccess: () => void
}

function AbsenceForm({ open, editRecord, onClose, onSuccess }: AbsenceFormProps) {
  const [form] = Form.useForm<AbsenceFormValues>()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (values: AbsenceFormValues) => {
      const payload = {
        absenceType: values.absenceType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
      }
      if (editRecord) {
        return apiClient.put(`/api/sys01/absences/${editRecord.id}`, payload)
      }
      return apiClient.post('/api/sys01/absences', payload)
    },
    onSuccess: () => {
      message.success(editRecord ? '수정되었습니다.' : '부재 신청이 등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys01-absences'] })
      onSuccess()
      form.resetFields()
    },
  })

  return (
    <Modal
      title={editRecord ? '부재 수정' : '부재 신청'}
      open={open}
      onCancel={() => { onClose(); form.resetFields() }}
      footer={null}
      width={480}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
        <Form.Item name="absenceType" label="부재유형" rules={[{ required: true }]}>
          <Select options={ABSENCE_TYPE_OPTIONS} placeholder="부재유형 선택" />
        </Form.Item>
        <Form.Item name="dateRange" label="기간" rules={[{ required: true }]}>
          <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="reason" label="사유" rules={[{ required: true }]}>
          <TextArea rows={3} placeholder="사유를 입력하세요" />
        </Form.Item>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={() => { onClose(); form.resetFields() }}>취소</Button>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>저장</Button>
        </div>
      </Form>
    </Modal>
  )
}

export default function OtAbsencePage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<OtAbsence | null>(null)
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/sys01/absences/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys01-absences'] })
    },
  })

  const columns: ProColumns<OtAbsence>[] = [
    { title: '부재유형', dataIndex: 'absenceType', width: 100 },
    { title: '시작일', dataIndex: 'startDate', width: 110 },
    { title: '종료일', dataIndex: 'endDate', width: 110 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    { title: '신청자', dataIndex: 'applicantName', width: 90 },
    { title: '부대(서)', dataIndex: 'applicantUnit', width: 100 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '등록일', dataIndex: 'createdAt', width: 110 },
    {
      title: '작업',
      valueType: 'option',
      width: 140,
      render: (_, record) => [
        <Button key="edit" type="link" size="small"
          disabled={record.status !== 'pending'}
          onClick={() => { setEditRecord(record); setFormOpen(true) }}
        >수정</Button>,
        <Button key="delete" type="link" danger size="small"
          disabled={record.status !== 'pending'}
          onClick={() => showConfirmDialog({
            title: '삭제 확인', content: '부재 신청을 삭제하시겠습니까?',
            danger: true, onConfirm: () => deleteMutation.mutate(record.id),
          })}
        >삭제</Button>,
      ],
    },
  ]

  return (
    <PageContainer title="나의 부재관리">
      <DataTable<OtAbsence>
        columns={columns}
        request={fetchAbsences}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="부재 목록"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />}
            onClick={() => { setEditRecord(null); setFormOpen(true) }}
          >부재 신청</Button>,
        ]}
      />
      <AbsenceForm
        open={formOpen}
        editRecord={editRecord}
        onClose={() => { setFormOpen(false); setEditRecord(null) }}
        onSuccess={() => { setFormOpen(false); setEditRecord(null); actionRef.current?.reload() }}
      />
    </PageContainer>
  )
}
