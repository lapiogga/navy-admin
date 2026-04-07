import { useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd'
import { SecretMediaPage } from './SecretMediaPage'
import type { SecretItem } from '@/shared/api/mocks/handlers/sys15-security'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'

// 예고문 자동 오픈 Modal
interface NoticeDocAutoModalProps {
  open: boolean
  secret: SecretItem | null
  onClose: () => void
}

const UNIT_OPTIONS = [
  { label: '1함대', value: '1함대' },
  { label: '2함대', value: '2함대' },
  { label: '3함대', value: '3함대' },
  { label: '해군사령부', value: '해군사령부' },
  { label: '교육사령부', value: '교육사령부' },
  { label: '군수사령부', value: '군수사령부' },
  { label: '해병대사령부', value: '해병대사령부' },
]

function NoticeDocAutoModal({ open, secret, onClose }: NoticeDocAutoModalProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      apiClient.post('/sys15/notice-docs', values),
    onSuccess: () => {
      message.success('예고문이 등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-notice-docs'] })
      form.resetFields()
      onClose()
    },
    onError: () => message.error('예고문 등록에 실패했습니다.'),
  })

  function handleOk() {
    form.validateFields().then((values) => {
      createMutation.mutate({
        ...values,
        secretId: secret?.id,
        secretName: secret?.name,
      })
    })
  }

  return (
    <Modal
      title="비밀 예고문 등록"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose() }}
      confirmLoading={createMutation.isPending}
      okText="등록"
      width={560}
      destroyOnClose
    >
      <p style={{ color: '#888', marginBottom: 12 }}>
        비밀 <strong>{secret?.name}</strong> 등록 후 예고문을 작성합니다.
      </p>
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="예고문 제목" rules={[{ required: true, message: '제목을 입력하세요' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="content" label="내용" rules={[{ required: true, message: '내용을 입력하세요' }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="notifyDate" label="예고일자" rules={[{ required: true, message: '예고일자를 선택하세요' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="recipients" label="수신 부대(서)" rules={[{ required: true, message: '수신 부대(서)를 선택하세요' }]}>
          <Select options={UNIT_OPTIONS} mode="multiple" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default function SecretPage() {
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [pendingSecret, setPendingSecret] = useState<SecretItem | null>(null)

  function handleSecretCreated(secret: SecretItem) {
    setPendingSecret(secret)
    setNoticeOpen(true)
  }

  return (
    <>
      <SecretMediaPage type="secret" onSecretCreated={handleSecretCreated} />
      <NoticeDocAutoModal
        open={noticeOpen}
        secret={pendingSecret}
        onClose={() => setNoticeOpen(false)}
      />
    </>
  )
}
