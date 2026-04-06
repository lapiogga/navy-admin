import { useRef, useState } from 'react'
import { Button, Modal, Form, Select, Space, message } from 'antd'
import { TimePicker } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { RangePicker: TimeRangePicker } = TimePicker

interface NotifyTimeRecord extends Record<string, unknown> {
  id: string
  department: string
  isTopLevel: boolean
  personalStartTime: string
  personalEndTime: string
  officeStartTime: string
  officeEndTime: string
}

const UNITS = ['해군', '해병대', '1함대', '2함대', '3함대', '해군사령부', '교육사령부', '군수사령부', '해병대사령부']

async function fetchNotifyTime(params: PageRequest): Promise<PageResponse<NotifyTimeRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<NotifyTimeRecord>>>('/sys15/notify-time', { params })
  return (res as ApiResult<PageResponse<NotifyTimeRecord>>).data ?? (res as unknown as PageResponse<NotifyTimeRecord>)
}

export default function NotifyTimeMgmtPage() {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<NotifyTimeRecord | undefined>()

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const [personalStart, personalEnd] = (values.personalTimeRange as [{ format: (f: string) => string }, { format: (f: string) => string }] | undefined) ?? [null, null]
      const [officeStart, officeEnd] = (values.officeTimeRange as [{ format: (f: string) => string }, { format: (f: string) => string }] | undefined) ?? [null, null]
      const payload = {
        department: values.department,
        personalStartTime: personalStart?.format('HH:mm'),
        personalEndTime: personalEnd?.format('HH:mm'),
        officeStartTime: officeStart?.format('HH:mm'),
        officeEndTime: officeEnd?.format('HH:mm'),
      }
      return apiClient.put(`/sys15/notify-time/${editTarget!.id}`, payload)
    },
    onSuccess: () => {
      message.success('알림시간이 수정되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15', 'notify-time'] })
      actionRef.current?.reload()
      setOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const columns: ProColumns<NotifyTimeRecord>[] = [
    { title: '부대(서)', dataIndex: 'department', width: 160 },
    {
      title: '개인결산 알림시간',
      render: (_, record) => `${record.personalStartTime} ~ ${record.personalEndTime}`,
      width: 160,
    },
    {
      title: '사무실결산 알림시간',
      render: (_, record) => `${record.officeStartTime} ~ ${record.officeEndTime}`,
      width: 160,
    },
    {
      title: '관리',
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            disabled={record.isTopLevel}
            onClick={() => {
              setEditTarget(record)
              setOpen(true)
            }}
          />
        </Space>
      ),
    },
  ]

  return (
    <PageContainer title="알림시간관리">
      <DataTable<NotifyTimeRecord>
        columns={columns}
        request={(params) => fetchNotifyTime(params)}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="부대(서)별 알림시간 설정"
      />

      <Modal
        title="알림시간 수정"
        open={open}
        onOk={() => form.validateFields().then((v) => saveMutation.mutate(v))}
        onCancel={() => {
          setOpen(false)
          setEditTarget(undefined)
          form.resetFields()
        }}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="department" label="부대(서)">
            <Select
              options={UNITS.map((u) => ({ label: u, value: u }))}
              disabled
            />
          </Form.Item>
          <Form.Item name="personalTimeRange" label="개인결산 알림시간" rules={[{ required: true }]}>
            <TimeRangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="officeTimeRange" label="사무실결산 알림시간" rules={[{ required: true }]}>
            <TimeRangePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
