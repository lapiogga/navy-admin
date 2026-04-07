import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Modal, message, Typography } from 'antd'
import { apiClient } from '@/shared/api/client'

const { Title, Text } = Typography

export function ExternalLoginPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetForm] = Form.useForm()

  async function handleLogin() {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await apiClient.post('/sys10/external-auth/login', values)
      message.success('로그인 성공')
      navigate('/sys10/1/2')
    } catch {
      message.error('군번 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    try {
      await resetForm.validateFields()
      message.success('임시 패스워드가 등록된 메일로 발송되었습니다.')
      setResetModalOpen(false)
      resetForm.resetFields()
    } catch {
      // 유효성 검증 실패
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            주말버스 예약 시스템
          </Title>
          <Text type="secondary">타군 사용자 로그인</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="militaryId"
            label="군번"
            rules={[
              { required: true, message: '군번을 입력하세요' },
              { max: 10, message: '군번은 10자 이내로 입력하세요' },
            ]}
          >
            <Input placeholder="군번 입력" maxLength={10} />
          </Form.Item>
          <Form.Item
            name="password"
            label="비밀번호"
            rules={[
              { required: true, message: '비밀번호를 입력하세요' },
              { min: 8, message: '비밀번호는 8자 이상이어야 합니다' },
            ]}
          >
            <Input.Password placeholder="비밀번호 입력" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} style={{ marginBottom: 8 }}>
            로그인
          </Button>
          <Button block onClick={() => navigate('/sys10/login/register')} style={{ marginBottom: 8 }}>
            회원등록 신청
          </Button>
          <Button type="link" block onClick={() => setResetModalOpen(true)}>
            패스워드를 잊으셨나요?
          </Button>
        </Form>
      </Card>

      {/* 패스워드 초기화 Modal */}
      <Modal
        title="패스워드 초기화"
        open={resetModalOpen}
        onCancel={() => setResetModalOpen(false)}
        onOk={handleResetPassword}
        okText="확인"
        cancelText="취소"
      >
        <Form form={resetForm} layout="vertical">
          <Form.Item
            name="militaryId"
            label="군번"
            rules={[{ required: true, message: '군번을 입력하세요' }]}
          >
            <Input placeholder="군번 입력" />
          </Form.Item>
          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력하세요' },
              { type: 'email', message: '올바른 이메일 형식으로 입력하세요' },
            ]}
          >
            <Input placeholder="이메일 입력" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ExternalLoginPage
