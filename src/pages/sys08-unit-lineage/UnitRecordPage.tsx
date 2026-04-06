import { useState, useRef } from 'react'
import { Modal, Button, Form, Input, DatePicker, message, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitRecord } from '@/shared/api/mocks/handlers/sys08-unit-lineage'
import dayjs from 'dayjs'

const { TextArea } = Input

async function fetchUnitRecords(params: PageRequest & Record<string, unknown>): Promise<PageResponse<UnitRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitRecord>>>('/sys08/unit-records', { params })
  return (res as ApiResult<PageResponse<UnitRecord>>).data ?? (res as unknown as PageResponse<UnitRecord>)
}

export default function UnitRecordPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UnitRecord | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<UnitRecord | undefined>()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<UnitRecord>) => {
      if (editTarget) {
        return apiClient.put(`/sys08/unit-records/${editTarget.id}`, values)
      }
      return apiClient.post('/sys08/unit-records', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-unit-records'] })
      actionRef.current?.reload()
      setFormOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys08/unit-records/${id}`)
    },
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-unit-records'] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<UnitRecord>[] = [
    { title: '부대명', dataIndex: 'unitName', width: 150 },
    { title: '부대코드', dataIndex: 'unitCode', width: 130 },
    { title: '창설일자', dataIndex: 'establishDate', width: 120 },
    { title: '해체일자', dataIndex: 'dissolveDate', width: 120, render: (v) => (v as string) || '-' },
    { title: '소재지', dataIndex: 'location', width: 200 },
    { title: '비고', dataIndex: 'remarks', ellipsis: true },
    {
      title: '관리',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditTarget(record)
              form.setFieldsValue({
                ...record,
                establishDate: record.establishDate ? dayjs(record.establishDate) : undefined,
                dissolveDate: record.dissolveDate ? dayjs(record.dissolveDate) : undefined,
              })
              setFormOpen(true)
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

  const handleSearch = () => {
    actionRef.current?.reload()
  }

  return (
    <PageContainer title="부대기록부">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input
          placeholder="부대명 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 240 }}
          allowClear
        />
        <Button onClick={handleSearch}>검색</Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditTarget(undefined)
            form.resetFields()
            setFormOpen(true)
          }}
        >
          등록
        </Button>
      </div>

      <DataTable<UnitRecord>
        columns={columns}
        request={(params) => fetchUnitRecords({ ...params, keyword: searchKeyword })}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="부대기록부 목록"
      />

      {/* 등록/수정 모달 */}
      <Modal
        title={editTarget ? '부대기록부 수정' : '부대기록부 등록'}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false)
          setEditTarget(undefined)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText={editTarget ? '수정' : '등록'}
        confirmLoading={saveMutation.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const payload = {
              ...values,
              establishDate: values.establishDate?.format?.('YYYY-MM-DD') ?? values.establishDate,
              dissolveDate: values.dissolveDate?.format?.('YYYY-MM-DD') ?? values.dissolveDate,
            }
            saveMutation.mutate(payload)
          }}
        >
          <Form.Item name="unitName" label="부대명" rules={[{ required: true, message: '부대명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unitCode" label="부대코드" rules={[{ required: true, message: '부대코드를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="establishDate" label="창설일자" rules={[{ required: true, message: '창설일자를 입력하세요' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dissolveDate" label="해체일자">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="location" label="소재지">
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label="비고">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(undefined)}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        okText="삭제"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
        cancelText="취소"
      >
        <p>'{deleteTarget?.unitName}' 부대기록부를 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
