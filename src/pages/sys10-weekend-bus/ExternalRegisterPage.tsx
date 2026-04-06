import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Input, Select, message, Typography } from 'antd'
import { apiClient } from '@/shared/api/apiClient'

const { Title } = Typography

const MILITARY_BRANCH_OPTIONS = [
  { label: '육군', value: '육군' },
  { label: '공군', value: '공군' },
  { label: '해군', value: '해군' },
  { label: '해병대', value: '해병대' },
]

const RANK_OPTIONS = [
  '대장', '중장', '소장', '준장', '대령', '중령', '소령', '대위',
  '중위', '소위', '준위', '원사', '상사', '중사', '하사',
  '병장', '상병', '일병', '이병',
].map((r) => ({ label: r, value: r }))

export function ExternalRegisterPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await apiClient.post('/api/sys10/external-users/register', values)
      message.success('회원등록 신청이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.')
      navigate('/sys10/login')
    } catch {
      // 유효성 검증 실패 또는 API 오류
    } finally {
      setLoading(false)
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
        padding: 24,
      }}
    >
      <Card style={{ width: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            타군 사용자 회원등록 신청
          </Title>
        </div>

        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            name="militaryBranch"
            label="군 구분"
            rules={[{ required: true, message: '군 구분을 선택하세요' }]}
          >
            <Select placeholder="군 구분 선택" options={MILITARY_BRANCH_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="unitName"
            label="부대명"
            rules={[
              { required: true, message: '부대명을 입력하세요' },
              { max: 100, message: '부대명은 100자 이내로 입력하세요' },
            ]}
          >
            <Input placeholder="부대명 입력" maxLength={100} />
          </Form.Item>
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
            name="rank"
            label="계급"
            rules={[{ required: true, message: '계급을 선택하세요' }]}
          >
            <Select placeholder="계급 선택" options={RANK_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="name"
            label="성명"
            rules={[
              { required: true, message: '성명을 입력하세요' },
              { max: 20, message: '성명은 20자 이내로 입력하세요' },
            ]}
          >
            <Input placeholder="성명 입력" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="position"
            label="직책"
            rules={[
              { required: true, message: '직책을 입력하세요' },
              { max: 50, message: '직책은 50자 이내로 입력하세요' },
            ]}
          >
            <Input placeholder="직책 입력" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="연락처"
            rules={[
              {
                pattern: /^010-\d{4}-\d{4}$/,
                message: '010-XXXX-XXXX 형식으로 입력하세요',
              },
            ]}
          >
            <Input placeholder="010-XXXX-XXXX" />
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
          <Form.Item
            name="password"
            label="비밀번호"
            rules={[
              { required: true, message: '비밀번호를 입력하세요' },
              { min: 8, message: '비밀번호는 8자 이상이어야 합니다' },
            ]}
          >
            <Input.Password placeholder="비밀번호 입력 (8자 이상)" />
          </Form.Item>
          <Form.Item
            name="passwordConfirm"
            label="비밀번호 확인"
            dependencies={['password']}
            rules={[
              { required: true, message: '비밀번호 확인을 입력하세요' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="비밀번호 재입력" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} style={{ marginBottom: 8 }}>
            등록 신청
          </Button>
          <Button block onClick={() => navigate('/sys10/login')}>
            로그인으로 돌아가기
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default ExternalRegisterPage
