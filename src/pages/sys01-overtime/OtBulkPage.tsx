import { useState, useRef } from 'react'
import { Modal, Form, Button, TimePicker, DatePicker, Input, message, Space } from 'antd'
import { PlusOutlined, SendOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtRequest, OtBulkRequest } from '@/shared/api/mocks/handlers/sys01-overtime'

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

async function fetchRequests(params: PageRequest): Promise<PageResponse<OtRequest>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtRequest>>>('/sys01/requests', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtRequest>>).data ?? (res as unknown as PageResponse<OtRequest>)
  return data
}

async function fetchBulkRequests(params: PageRequest): Promise<PageResponse<OtBulkRequest>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtBulkRequest>>>('/sys01/bulk-requests', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtBulkRequest>>).data ?? (res as unknown as PageResponse<OtBulkRequest>)
  return data
}

interface BulkFormValues {
  workDate: Dayjs
  timeRange: [Dayjs, Dayjs]
  reason: string
}

export default function OtBulkPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [form] = Form.useForm<BulkFormValues>()
  const [totalHours, setTotalHours] = useState<string>('0.0')
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const bulkMutation = useMutation({
    mutationFn: async (values: BulkFormValues) => {
      const minutes = values.timeRange[1].diff(values.timeRange[0], 'minutes')
      const hours = parseFloat((minutes / 60).toFixed(1))
      return apiClient.post('/sys01/bulk-requests', {
        workDate: values.workDate.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        totalHours: hours,
        reason: values.reason,
        applicantCount: selectedKeys.length,
      })
    },
    onSuccess: () => {
      message.success(`${selectedKeys.length}명에 대한 일괄 신청이 완료되었습니다.`)
      queryClient.invalidateQueries({ queryKey: ['sys01-bulk-requests'] })
      setFormOpen(false)
      setSelectedKeys([])
      form.resetFields()
      actionRef.current?.reload()
    },
    onError: () => message.error('일괄 신청에 실패했습니다.'),
  })

  const personColumns: ProColumns<OtRequest>[] = [
    { title: '신청자', dataIndex: 'applicantName', width: 90 },
    { title: '부대(서)', dataIndex: 'applicantUnit', width: 100 },
    { title: '근무일', dataIndex: 'workDate', width: 110 },
    { title: '총근무시간(h)', dataIndex: 'totalHours', width: 110 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
  ]

  const bulkColumns: ProColumns<OtBulkRequest>[] = [
    { title: '근무일', dataIndex: 'workDate', width: 110 },
    { title: '시작시간', dataIndex: 'startTime', width: 90 },
    { title: '종료시간', dataIndex: 'endTime', width: 90 },
    { title: '총근무시간(h)', dataIndex: 'totalHours', width: 110 },
    { title: '대상인원', dataIndex: 'applicantCount', width: 90 },
    { title: '근무사유', dataIndex: 'reason', ellipsis: true },
    { title: '등록자', dataIndex: 'createdBy', width: 90 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
  ]

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (keys: React.Key[]) => setSelectedKeys(keys as string[]),
  }

  return (
    <PageContainer title="일괄처리">
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>대상자 선택</div>
        <DataTable<OtRequest>
          columns={personColumns}
          request={fetchRequests}
          rowKey="id"
          rowSelection={rowSelection}
          actionRef={actionRef}
          headerTitle="대상자 목록"
          toolBarRender={() => [
            <Space key="bulk-actions">
              <span>선택: {selectedKeys.length}명</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={selectedKeys.length === 0}
                onClick={() => setFormOpen(true)}
              >
                일괄 신청
              </Button>
            </Space>,
          ]}
        />
      </div>

      <div style={{ marginTop: 32 }}>
        <div style={{ marginBottom: 8, fontWeight: 'bold' }}>일괄처리 현황</div>
        <DataTable<OtBulkRequest>
          columns={bulkColumns}
          request={fetchBulkRequests}
          rowKey="id"
          headerTitle="일괄처리 목록"
        />
      </div>

      <Modal
        title="일괄 신청서 작성"
        open={formOpen}
        onCancel={() => { setFormOpen(false); form.resetFields() }}
        footer={null}
        width={480}
        destroyOnClose
      >
        <p style={{ marginBottom: 16 }}>선택된 대상자: <strong>{selectedKeys.length}명</strong></p>
        <Form form={form} layout="vertical" onFinish={(v) => bulkMutation.mutate(v)}>
          <Form.Item name="workDate" label="근무일" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="timeRange" label="시작/종료 시간" rules={[{ required: true }]}>
            <TimePicker.RangePicker
              format="HH:mm"
              style={{ width: '100%' }}
              onChange={(times) => {
                if (times && times[0] && times[1]) {
                  const mins = times[1].diff(times[0], 'minutes')
                  setTotalHours((mins / 60).toFixed(1))
                }
              }}
            />
          </Form.Item>
          <Form.Item label="총 근무시간">
            <Input value={`${totalHours} 시간`} readOnly style={{ background: '#f5f5f5' }} />
          </Form.Item>
          <Form.Item name="reason" label="근무사유" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="근무사유를 입력하세요" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setFormOpen(false); form.resetFields() }}>취소</Button>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={bulkMutation.isPending}>
              일괄 신청
            </Button>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  )
}
