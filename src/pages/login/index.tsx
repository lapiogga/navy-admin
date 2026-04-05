import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ROUTES } from '@/shared/config/routes'
import type { LoginCredentials } from '@/entities/user/types'

const { Title } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (values: LoginCredentials) => {
    setLoading(true)
    try {
      await login(values)
      message.success('로그인 성공')
      // 로그아웃 후 재로그인 시 항상 메인포탈로 이동 (이전 서브시스템 경로 무시)
      navigate(ROUTES.PORTAL, { replace: true })
    } catch (error) {
      message.error(error instanceof Error ? error.message : '로그인 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <div className="text-center mb-8">
          <Title level={3}>해군 행정포탈</Title>
          <p className="text-gray-500">시스템에 로그인하세요</p>
        </div>
        <Form onFinish={handleSubmit} autoComplete="off" size="large">
          <Form.Item name="username" rules={[{ required: true, message: '아이디를 입력하세요' }]}>
            <Input prefix={<UserOutlined />} placeholder="아이디" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '비밀번호를 입력하세요' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              로그인
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center text-gray-400 text-sm">
          테스트 계정: admin / 1234
        </div>
      </Card>
    </div>
  )
}
