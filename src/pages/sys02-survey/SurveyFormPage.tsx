import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Radio,
  Rate,
  Result,
  Space,
  Typography,
  message,
} from 'antd'
import { useQuery, useMutation } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { apiClient } from '@/shared/api/client'
import type { Survey, SurveyQuestion } from '@/shared/api/mocks/handlers/sys02'

const { TextArea } = Input
const { Title, Paragraph, Text } = Typography

// 설문 응답 폼 (SURV-01)
export default function SurveyFormPage() {
  const { id: surveyId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm()

  // 설문 상세 조회
  const { data: survey } = useQuery({
    queryKey: ['sys02', 'survey', surveyId],
    queryFn: () => apiClient.get<Survey>(`/sys02/surveys/${surveyId}`),
    enabled: !!surveyId,
  })

  // 설문 문항 조회
  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['sys02', 'questions', surveyId],
    queryFn: () => apiClient.get<SurveyQuestion[]>(`/sys02/surveys/${surveyId}/questions`),
    enabled: !!surveyId,
  })

  // 응답 제출 뮤테이션
  const submitMutation = useMutation({
    mutationFn: (answers: Record<string, unknown>) =>
      apiClient.post(`/sys02/surveys/${surveyId}/respond`, answers),
    onSuccess: () => {
      message.success('설문 응답이 완료되었습니다')
      setSubmitted(true)
    },
    onError: () => message.error('제출에 실패했습니다'),
  })

  const surveyData = (survey as { data?: Survey } | undefined)?.data ?? (survey as Survey | undefined)
  const questions = ((questionsData as { data?: SurveyQuestion[] } | undefined)?.data ?? (questionsData as SurveyQuestion[] | undefined) ?? []).sort(
    (a, b) => a.orderIndex - b.orderIndex
  )

  // 제출 완료 화면
  if (submitted) {
    return (
      <PageContainer title="설문참여">
        <Result
          status="success"
          title="설문 응답이 완료되었습니다."
          subTitle="참여해 주셔서 감사합니다."
          extra={[
            <Button key="back" onClick={() => navigate('/sys02/1/3')}>
              목록으로
            </Button>,
          ]}
        />
      </PageContainer>
    )
  }

  if (isLoading) {
    return <PageContainer title="설문 응답" loading />
  }

  const handleSubmit = (values: Record<string, unknown>) => {
    submitMutation.mutate(values)
  }

  const handleTempSave = () => {
    message.info('임시 저장되었습니다')
  }

  const renderQuestionInput = (q: SurveyQuestion) => {
    switch (q.questionType) {
      case 'radio':
        return (
          <Form.Item
            key={q.id}
            name={q.id}
            rules={q.isRequired ? [{ required: true, message: '필수 항목입니다' }] : []}
          >
            <Radio.Group>
              <Space direction="vertical">
                {q.options.map((opt) => (
                  <Radio key={opt} value={opt}>
                    {opt}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        )
      case 'checkbox':
        return (
          <Form.Item
            key={q.id}
            name={q.id}
            rules={q.isRequired ? [{ required: true, message: '필수 항목입니다' }] : []}
          >
            <Checkbox.Group>
              <Space direction="vertical">
                {q.options.map((opt) => (
                  <Checkbox key={opt} value={opt}>
                    {opt}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        )
      case 'textarea':
        return (
          <Form.Item
            key={q.id}
            name={q.id}
            rules={q.isRequired ? [{ required: true, message: '필수 항목입니다' }] : []}
          >
            <TextArea rows={4} placeholder="자유롭게 작성해 주세요" />
          </Form.Item>
        )
      case 'rate':
        return (
          <Form.Item
            key={q.id}
            name={q.id}
            rules={q.isRequired ? [{ required: true, message: '필수 항목입니다' }] : []}
          >
            <Rate />
          </Form.Item>
        )
      default:
        return null
    }
  }

  return (
    <PageContainer title={surveyData?.surveyName || '설문 응답'}>
      <Card>
        <Title level={3}>{surveyData?.surveyName}</Title>
        <Paragraph type="secondary">{surveyData?.description}</Paragraph>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {questions.map((q, idx) => (
            <Card
              key={q.id}
              style={{ marginBottom: 16 }}
              bodyStyle={{ paddingBottom: 8 }}
            >
              <div style={{ marginBottom: 12 }}>
                <Text strong>
                  {idx + 1}. {q.questionText}
                </Text>
                {q.isRequired && (
                  <Text type="danger" style={{ marginLeft: 4 }}>
                    *
                  </Text>
                )}
              </div>
              {renderQuestionInput(q)}
            </Card>
          ))}

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitMutation.isPending}
            >
              제출
            </Button>
            <Button onClick={handleTempSave}>임시 저장</Button>
            <Button onClick={() => navigate(-1)}>취소</Button>
          </Space>
        </Form>
      </Card>
    </PageContainer>
  )
}
