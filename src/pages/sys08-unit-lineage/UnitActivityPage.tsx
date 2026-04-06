import { useState, useRef } from 'react'
import { Modal, Button, Form, Input, Select, DatePicker, message, Space, Upload } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitActivity } from '@/shared/api/mocks/handlers/sys08-unit-lineage'
import dayjs from 'dayjs'

const { TextArea } = Input

const CATEGORY_OPTIONS = [
  { label: '작전', value: '작전' },
  { label: '훈련', value: '훈련' },
  { label: '행사', value: '행사' },
  { label: '기타', value: '기타' },
]

const APPROVAL_STATUS_COLOR_MAP: Record<string, string> = {
  작성중: 'default',
  결재대기: 'orange',
  승인: 'green',
  반려: 'red',
}

async function fetchActivities(params: PageRequest & Record<string, unknown>): Promise<PageResponse<UnitActivity>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitActivity>>>('/sys08/activities', { params })
  return (res as ApiResult<PageResponse<UnitActivity>>).data ?? (res as unknown as PageResponse<UnitActivity>)
}

export default function UnitActivityPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UnitActivity | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<UnitActivity | undefined>()
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkValidating, setBulkValidating] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ valid: unknown[]; errors: { row: number; column: string; errorMessage: string }[] } | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<UnitActivity>) => {
      if (editTarget) {
        return apiClient.put(`/sys08/activities/${editTarget.id}`, values)
      }
      return apiClient.post('/sys08/activities', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-activities'] })
      actionRef.current?.reload()
      setFormOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys08/activities/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-activities'] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const handleBulkValidate = async (file: File) => {
    setBulkValidating(true)
    try {
      const res = await apiClient.post<never, ApiResult<{ valid: unknown[]; errors: { row: number; column: string; errorMessage: string }[] }>>('/sys08/activities/bulk-validate', { fileName: file.name })
      const data = (res as ApiResult<typeof res>).data ?? res as unknown as { valid: unknown[]; errors: { row: number; column: string; errorMessage: string }[] }
      setBulkResult(data as { valid: unknown[]; errors: { row: number; column: string; errorMessage: string }[] })
    } catch {
      message.error('검증에 실패했습니다.')
    } finally {
      setBulkValidating(false)
    }
    return false
  }

  const handleBulkSave = async () => {
    if (!bulkResult) return
    await apiClient.post('/sys08/activities/bulk-save', { items: bulkResult.valid })
    message.success(`${bulkResult.valid.length}건 일괄등록 완료`)
    queryClient.invalidateQueries({ queryKey: ['sys08-activities'] })
    actionRef.current?.reload()
    setBulkOpen(false)
    setBulkResult(null)
  }

  const columns: ProColumns<UnitActivity>[] = [
    { title: '활동명', dataIndex: 'activityName', width: 200 },
    { title: '분류', dataIndex: 'category', width: 100 },
    { title: '일시', dataIndex: 'activityDate', width: 120 },
    { title: '장소', dataIndex: 'location', width: 130 },
    { title: '내용', dataIndex: 'description', ellipsis: true },
    {
      title: '결재상태',
      dataIndex: 'approvalStatus',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.approvalStatus}
          colorMap={APPROVAL_STATUS_COLOR_MAP}
        />
      ),
    },
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
                activityDate: record.activityDate ? dayjs(record.activityDate) : undefined,
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

  return (
    <PageContainer title="주요활동 관리">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
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
        <Button
          icon={<UploadOutlined />}
          onClick={() => setBulkOpen(true)}
        >
          일괄등록
        </Button>
      </div>

      <DataTable<UnitActivity>
        columns={columns}
        request={fetchActivities}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="주요활동 목록"
      />

      {/* 등록/수정 모달 */}
      <Modal
        title={editTarget ? '주요활동 수정' : '주요활동 등록'}
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
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const payload = {
              ...values,
              activityDate: values.activityDate?.format?.('YYYY-MM-DD') ?? values.activityDate,
            }
            saveMutation.mutate(payload)
          }}
        >
          <Form.Item name="activityName" label="활동명" rules={[{ required: true, message: '활동명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="분류" rules={[{ required: true, message: '분류를 선택하세요' }]}>
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="activityDate" label="일시" rules={[{ required: true, message: '일시를 입력하세요' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="location" label="장소">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="내용">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="첨부파일">
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>파일 선택</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 일괄등록 모달 */}
      <Modal
        title="주요활동 일괄등록"
        open={bulkOpen}
        onCancel={() => {
          setBulkOpen(false)
          setBulkResult(null)
        }}
        footer={
          bulkResult ? (
            <Space>
              <Button onClick={() => setBulkResult(null)}>다시 업로드</Button>
              <Button
                type="primary"
                disabled={bulkResult.errors.length > 0}
                onClick={handleBulkSave}
              >
                일괄저장 ({bulkResult.valid.length}건)
              </Button>
            </Space>
          ) : null
        }
      >
        {!bulkResult ? (
          <Upload.Dragger
            beforeUpload={handleBulkValidate}
            accept=".xlsx,.xls"
            multiple={false}
            showUploadList={false}
          >
            <p>엑셀 파일을 여기에 드롭하거나 클릭하여 업로드</p>
            <p style={{ color: '#999' }}>(.xlsx, .xls 파일만 지원)</p>
          </Upload.Dragger>
        ) : (
          <div>
            {bulkValidating && <p>검증 중...</p>}
            <p>유효 데이터: {bulkResult.valid.length}건</p>
            {bulkResult.errors.length > 0 && (
              <div style={{ color: 'red' }}>
                <p>오류 {bulkResult.errors.length}건:</p>
                {bulkResult.errors.map((e, i) => (
                  <p key={i}>{e.row}행 [{e.column}]: {e.errorMessage}</p>
                ))}
              </div>
            )}
          </div>
        )}
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
        <p>'{deleteTarget?.activityName}' 주요활동을 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
