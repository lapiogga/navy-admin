import { useState, useRef } from 'react'
import { Modal, Button, Form, Input, Select, DatePicker, message, Space, Upload, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitFlag } from '@/shared/api/mocks/handlers/sys08-unit-lineage'
import dayjs from 'dayjs'

const { TextArea } = Input

const FLAG_TYPE_OPTIONS = [
  { label: '부대기', value: '부대기' },
  { label: '부대마크', value: '부대마크' },
]

async function fetchFlags(params: PageRequest & Record<string, unknown>): Promise<PageResponse<UnitFlag>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitFlag>>>('/sys08/flags', { params })
  return (res as ApiResult<PageResponse<UnitFlag>>).data ?? (res as unknown as PageResponse<UnitFlag>)
}

export default function UnitFlagPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UnitFlag | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<UnitFlag | undefined>()
  const [previewImage, setPreviewImage] = useState<string | undefined>()
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<UnitFlag> & { imageBase64?: string }) => {
      if (editTarget) {
        return apiClient.put(`/sys08/flags/${editTarget.id}`, values)
      }
      return apiClient.post('/sys08/flags', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-flags'] })
      actionRef.current?.reload()
      setFormOpen(false)
      setEditTarget(undefined)
      setPreviewImage(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys08/flags/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-flags'] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  // Upload.Dragger beforeUpload: FileReader로 Base64 변환 후 state 저장
  const handleBeforeUpload = (file: File) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      setPreviewImage(base64)
      form.setFieldValue('imageBase64', base64)
    }
    return false // 자동 업로드 방지
  }

  const columns: ProColumns<UnitFlag>[] = [
    {
      title: '썸네일',
      dataIndex: 'imageBase64',
      width: 80,
      render: (value) =>
        value ? (
          <Image src={value as string} width={50} height={50} style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
            이미지 없음
          </div>
        ),
    },
    { title: '부대명', dataIndex: 'unitName', width: 150 },
    { title: '구분', dataIndex: 'flagType', width: 100 },
    { title: '개정일자', dataIndex: 'revisionDate', width: 120 },
    { title: '제작자(고안자)', dataIndex: 'creator', width: 120 },
    { title: '비고', dataIndex: 'remarks', ellipsis: true },
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
              setPreviewImage(record.imageBase64)
              form.setFieldsValue({
                ...record,
                revisionDate: record.revisionDate ? dayjs(record.revisionDate) : undefined,
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
    <PageContainer title="부대기/부대마크 관리">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditTarget(undefined)
            setPreviewImage(undefined)
            form.resetFields()
            setFormOpen(true)
          }}
        >
          등록
        </Button>
      </div>

      <DataTable<UnitFlag>
        columns={columns}
        request={fetchFlags}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="부대기/부대마크 목록"
      />

      {/* 등록/수정 모달 - CSV 입력값 전체 반영 (R1 규칙) */}
      <Modal
        title={editTarget ? '부대기/부대마크 수정' : '부대기/부대마크 등록'}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false)
          setEditTarget(undefined)
          setPreviewImage(undefined)
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
              revisionDate: values.revisionDate?.format?.('YYYY-MM-DD') ?? values.revisionDate,
              imageBase64: previewImage,
            }
            saveMutation.mutate(payload)
          }}
        >
          <Form.Item name="unitName" label="부대명" rules={[{ required: true, message: '부대명을 입력하세요' }]}>
            <Input disabled={!!editTarget} />
          </Form.Item>
          <Form.Item name="flagType" label="구분(부대기/부대마크)" rules={[{ required: true, message: '구분을 선택하세요' }]}>
            <Select options={FLAG_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="revisionDate" label="개정일자">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="creator" label="제작자(고안자)">
            <Input />
          </Form.Item>
          <Form.Item name="meaning" label="의미">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="motivation" label="제정동기">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="remarks" label="비고">
            <Input />
          </Form.Item>
          <Form.Item label="이미지(첨부파일)">
            <Upload.Dragger
              beforeUpload={handleBeforeUpload}
              accept="image/*"
              multiple={false}
              showUploadList={false}
              style={{ padding: '8px 0' }}
            >
              <p>이미지를 여기에 드롭하거나 클릭하여 업로드</p>
              <p style={{ color: '#999', fontSize: 12 }}>(JPG, PNG, GIF 지원)</p>
            </Upload.Dragger>
          </Form.Item>
          {previewImage && (
            <Form.Item label="미리보기">
              <Image src={previewImage} width={200} style={{ objectFit: 'contain' }} />
            </Form.Item>
          )}
          <Form.Item name="imageBase64" hidden>
            <Input />
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
        <p>'{deleteTarget?.unitName}' 부대기/부대마크를 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
