import { useState, useRef } from 'react'
import { Modal, Form, Input, DatePicker, Button, message } from 'antd'
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
import type { AbsenceRecord } from '@/shared/api/mocks/handlers/sys15-security'

const { TextArea } = Input
const { RangePicker } = DatePicker

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  pending: '결재대기',
  approved: '승인',
  rejected: '반려',
}

async function fetchAbsences(params: PageRequest): Promise<PageResponse<AbsenceRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<AbsenceRecord>>>('/api/sys15/absences', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<AbsenceRecord>>).data ?? (res as unknown as PageResponse<AbsenceRecord>)
  return data
}

interface AbsenceFormModalProps {
  open: boolean
  record?: AbsenceRecord | null
  onClose: () => void
  onSuccess: () => void
}

function AbsenceFormModal({ open, record, onClose, onSuccess }: AbsenceFormModalProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (record) {
        return apiClient.put(`/api/sys15/absences/${record.id}`, values)
      }
      return apiClient.post('/api/sys15/absences', values)
    },
    onSuccess: () => {
      message.success(record ? '수정되었습니다.' : '부재신청이 등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-absences'] })
      form.resetFields()
      onSuccess()
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  function handleOk() {
    form.validateFields().then((values) => {
      const dateRange = values.dateRange as [Dayjs, Dayjs]
      saveMutation.mutate({
        personnelName: values.personnelName,
        department: values.department,
        absenceStart: dateRange[0].format('YYYY-MM-DD'),
        absenceEnd: dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
      })
    })
  }

  return (
    <Modal
      title={record ? '부재 수정' : '부재신청'}
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose() }}
      confirmLoading={saveMutation.isPending}
      okText={record ? '수정' : '신청'}
      destroyOnClose
    >
      <Form form={form} layout="vertical"
        initialValues={record ? {
          personnelName: record.personnelName,
          department: record.department,
          reason: record.reason,
        } : undefined}
      >
        <Form.Item name="personnelName" label="성명" rules={[{ required: true, message: '성명을 입력하세요' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="department" label="부대(서)" rules={[{ required: true, message: '부대(서)를 입력하세요' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="dateRange"
          label="부재기간"
          rules={[{ required: true, message: '부재기간을 선택하세요' }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="reason" label="사유" rules={[{ required: true, message: '사유를 입력하세요' }]}>
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function AbsencePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<AbsenceRecord | null>(null)
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/sys15/absences/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-absences'] })
    },
  })

  const columns: ProColumns<AbsenceRecord>[] = [
    { title: '성명', dataIndex: 'personnelName', width: 100 },
    { title: '부대(서)', dataIndex: 'department', width: 120 },
    { title: '부재시작', dataIndex: 'absenceStart', width: 120 },
    { title: '부재종료', dataIndex: 'absenceEnd', width: 120 },
    { title: '사유', dataIndex: 'reason' },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (val: unknown) => (
        <StatusBadge
          status={String(val)}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    { title: '신청일', dataIndex: 'createdAt', width: 120 },
    {
      title: '작업',
      valueType: 'option',
      width: 120,
      render: (_, record) => record.status === 'pending' ? [
        <Button
          key="edit"
          type="link"
          size="small"
          onClick={() => { setEditRecord(record); setModalOpen(true) }}
        >
          수정
        </Button>,
        <Button
          key="del"
          type="link"
          size="small"
          danger
          onClick={() =>
            showConfirmDialog({
              title: '삭제 확인',
              content: '부재신청을 삭제하시겠습니까?',
              onOk: () => deleteMutation.mutateAsync(record.id),
            })
          }
        >
          삭제
        </Button>,
      ] : [],
    },
  ]

  return (
    <PageContainer
      title="부재관리"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditRecord(null); setModalOpen(true) }}
        >
          부재신청
        </Button>
      }
    >
      <DataTable<AbsenceRecord>
        actionRef={actionRef}
        queryKey={['sys15-absences']}
        fetchFn={fetchAbsences}
        columns={columns}
      />
      <AbsenceFormModal
        open={modalOpen}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); actionRef.current?.reload() }}
      />
    </PageContainer>
  )
}
