import { useState, useRef } from 'react'
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message } from 'antd'
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { SecurityEduRecord } from '@/shared/api/mocks/handlers/sys15-security'

const { TextArea } = Input
const { RangePicker } = DatePicker

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  completed: 'green',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  completed: '완료',
}

const EDU_TYPE_OPTIONS = [
  { value: '정기교육', label: '정기교육' },
  { value: '특별교육', label: '특별교육' },
  { value: '직무교육', label: '직무교육' },
  { value: '기타', label: '기타' },
]

async function fetchSecurityEdu(params: PageRequest & { startDate?: string; endDate?: string; eduType?: string }): Promise<PageResponse<SecurityEduRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SecurityEduRecord>>>('/sys15/security-edu', {
    params: { page: params.page, size: params.size, startDate: params.startDate, endDate: params.endDate, eduType: params.eduType },
  })
  const data = (res as ApiResult<PageResponse<SecurityEduRecord>>).data ?? (res as unknown as PageResponse<SecurityEduRecord>)
  return data
}

interface EduFormModalProps {
  open: boolean
  record?: SecurityEduRecord | null
  onClose: () => void
  onSuccess: () => void
}

function EduFormModal({ open, record, onClose, onSuccess }: EduFormModalProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (record) {
        return apiClient.put(`/sys15/security-edu/${record.id}`, values)
      }
      return apiClient.post('/sys15/security-edu', values)
    },
    onSuccess: () => {
      message.success(record ? '수정되었습니다.' : '교육결과가 등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-security-edu'] })
      form.resetFields()
      onSuccess()
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  function handleOk() {
    form.validateFields().then((values) => {
      const eduDate = (values.eduDate as Dayjs).format('YYYY-MM-DD')
      saveMutation.mutate({ ...values, eduDate })
    })
  }

  return (
    <Modal
      title={record ? '교육결과 수정' : '교육결과 작성'}
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose() }}
      confirmLoading={saveMutation.isPending}
      okText={record ? '수정' : '등록'}
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={record ?? undefined}
      >
        <Form.Item name="eduType" label="교육구분" rules={[{ required: true }]}>
          <Select options={EDU_TYPE_OPTIONS} />
        </Form.Item>
        <Form.Item name="eduDate" label="실시일자" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="duration" label="소요시간(h)" rules={[{ required: true }]}>
          <InputNumber min={0.5} max={24} step={0.5} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="instructor" label="교관" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="participants" label="이수인원" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="department" label="부대(서)" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="content" label="교육내용">
          <TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function SecurityEduPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<SecurityEduRecord | null>(null)
  const [filterDates, setFilterDates] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [filterEduType, setFilterEduType] = useState<string | undefined>()
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sys15/security-edu/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-security-edu'] })
    },
  })

  const columns: ProColumns<SecurityEduRecord>[] = [
    { title: '교육구분', dataIndex: 'eduType', width: 120 },
    { title: '실시일자', dataIndex: 'eduDate', width: 120 },
    { title: '소요시간(h)', dataIndex: 'duration', width: 100 },
    { title: '교관', dataIndex: 'instructor', width: 100 },
    { title: '이수인원', dataIndex: 'participants', width: 80 },
    { title: '부대(서)', dataIndex: 'department', width: 120 },
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
    {
      title: '작업',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
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
              title: '삭제 확인 (체계관리자 전용)',
              content: '교육결과를 삭제하시겠습니까?',
              onOk: () => deleteMutation.mutateAsync(record.id),
            })
          }
        >
          삭제
        </Button>,
      ],
    },
  ]

  const startDate = filterDates?.[0]?.format('YYYY-MM-DD')
  const endDate = filterDates?.[1]?.format('YYYY-MM-DD')

  return (
    <PageContainer
      title="보안교육관리"
      extra={[
        <Button
          key="excel"
          icon={<DownloadOutlined />}
          onClick={() => message.info('엑셀 저장 기능은 추후 구현됩니다.')}
        >
          엑셀 저장
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditRecord(null); setModalOpen(true) }}
        >
          결과작성
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span>조회기간:</span>
        <RangePicker
          onChange={(dates) => setFilterDates(dates as [Dayjs | null, Dayjs | null] | null)}
        />
        <span>교육구분:</span>
        <Select
          options={[{ value: '', label: '전체' }, ...EDU_TYPE_OPTIONS]}
          style={{ width: 120 }}
          onChange={(val) => setFilterEduType(val || undefined)}
          defaultValue=""
        />
      </div>
      <DataTable<SecurityEduRecord>
        actionRef={actionRef}
        queryKey={['sys15-security-edu', startDate, endDate, filterEduType]}
        fetchFn={(params) => fetchSecurityEdu({ ...params, startDate, endDate, eduType: filterEduType })}
        columns={columns}
      />
      <EduFormModal
        open={modalOpen}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); actionRef.current?.reload() }}
      />
    </PageContainer>
  )
}
