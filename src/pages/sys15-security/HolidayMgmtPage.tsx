import { useRef, useState } from 'react'
import { Tabs, Button, Modal, Form, Input, Select, Space, message, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { DatePicker } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { RangePicker } = DatePicker

interface HolidayRecord extends Record<string, unknown> {
  id: string
  holidayType: '특정기간' | '특정요일'
  description: string
  startDate: string
  endDate: string
  department?: string
  tabType: 'common' | 'unit'
}

const UNITS = ['1함대', '2함대', '3함대', '해군사령부', '교육사령부', '군수사령부', '해병대사령부']

async function fetchHolidays(tabType: 'common' | 'unit', params: PageRequest): Promise<PageResponse<HolidayRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<HolidayRecord>>>('/sys15/holidays', {
    params: { ...params, tabType },
  })
  return (res as ApiResult<PageResponse<HolidayRecord>>).data ?? (res as unknown as PageResponse<HolidayRecord>)
}

function HolidayTab({ tabType }: { tabType: 'common' | 'unit' }) {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<HolidayRecord | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<HolidayRecord | undefined>()

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const [startDate, endDate] = (values.dateRange as [{ format: (f: string) => string }, { format: (f: string) => string }] | undefined) ?? [null, null]
      const payload = {
        ...values,
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
        tabType,
        dateRange: undefined,
      }
      if (editTarget) {
        return apiClient.put(`/sys15/holidays/${editTarget.id}`, payload)
      }
      return apiClient.post('/sys15/holidays', payload)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15', 'holidays', tabType] })
      actionRef.current?.reload()
      setOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys15/holidays/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15', 'holidays', tabType] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<HolidayRecord>[] = [
    {
      title: '구분',
      dataIndex: 'holidayType',
      width: 100,
    },
    { title: '설명', dataIndex: 'description', ellipsis: true },
    { title: '시작일', dataIndex: 'startDate', width: 120 },
    { title: '종료일', dataIndex: 'endDate', width: 120 },
    ...(tabType === 'unit'
      ? [{ title: '부대(서)', dataIndex: 'department' as keyof HolidayRecord, width: 140 } as ProColumns<HolidayRecord>]
      : []),
    {
      title: '관리',
      width: 110,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditTarget(record)
              form.setFieldsValue({ ...record, dateRange: undefined })
              setOpen(true)
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteTarget(record)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <DataTable<HolidayRecord>
        columns={columns}
        request={(params) => fetchHolidays(tabType, params)}
        rowKey="id"
        actionRef={actionRef}
        headerTitle={tabType === 'common' ? '공통 공휴일' : '부대(서) 휴무일'}
        toolBarRender={() => [
          <Button key="export" icon={<DownloadOutlined />}>엑셀 저장</Button>,
          <Upload
            key="upload"
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={() => {
              message.info('일괄 등록이 처리됩니다.')
              return false
            }}
          >
            <Button icon={<UploadOutlined />}>일괄등록</Button>
          </Upload>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditTarget(undefined)
              form.resetFields()
              setOpen(true)
            }}
          >
            등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '휴무일 수정' : '휴무일 등록'}
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
          <Form.Item name="holidayType" label="구분" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '특정기간', value: '특정기간' },
                { label: '특정요일', value: '특정요일' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="설명" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dateRange" label="기간" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          {tabType === 'unit' && (
            <Form.Item name="department" label="부대(서)" rules={[{ required: true }]}>
              <Select options={UNITS.map((u) => ({ label: u, value: u }))} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(undefined)}
        okText="삭제"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteMutation.isPending}
      >
        <p>'{deleteTarget?.description}' 항목을 삭제하시겠습니까?</p>
      </Modal>
    </div>
  )
}

export default function HolidayMgmtPage() {
  return (
    <PageContainer title="공휴일관리">
      <Tabs
        items={[
          { key: 'common', label: '공통 공휴일', children: <HolidayTab tabType="common" /> },
          { key: 'unit', label: '부대(서) 휴무일', children: <HolidayTab tabType="unit" /> },
        ]}
      />
    </PageContainer>
  )
}
