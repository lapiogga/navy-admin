import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Space,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  DeleteOutlined,
  HolderOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQuery, useMutation } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { apiClient } from '@/shared/api/client'
import type { SurveyQuestion, QuestionType } from '@/shared/api/mocks/handlers/sys02'

const { TextArea } = Input
const { Text } = Typography

const QUESTION_TYPE_OPTIONS = [
  { label: '단일선택 Radio', value: 'radio' },
  { label: '복수선택 Checkbox', value: 'checkbox' },
  { label: '주관식 TextArea', value: 'textarea' },
  { label: '평점 Rate', value: 'rate' },
]

const QUESTION_TYPE_COLOR_MAP: Record<QuestionType, string> = {
  radio: 'blue',
  checkbox: 'green',
  textarea: 'orange',
  rate: 'purple',
}

interface SortableQuestionItemProps {
  question: SurveyQuestion
  isSelected: boolean
  onSelect: (q: SurveyQuestion) => void
  onDelete: (id: string) => void
}

function SortableQuestionItem({
  question,
  isSelected,
  onSelect,
  onDelete,
}: SortableQuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: isDragging
      ? '2px dashed #003366'
      : isSelected
      ? '1px solid #1677ff'
      : '1px solid #d9d9d9',
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 8,
    background: isSelected ? '#e6f4ff' : '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  return (
    <div ref={setNodeRef} style={style} onClick={() => onSelect(question)}>
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', color: '#bbb', fontSize: 18, width: 24, height: 24, display: 'flex', alignItems: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <HolderOutlined />
      </span>
      <Text strong style={{ minWidth: 24 }}>
        {question.orderIndex}.
      </Text>
      <Text
        style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {question.questionText || '(문항 내용 없음)'}
      </Text>
      <Tag color={QUESTION_TYPE_COLOR_MAP[question.questionType]}>
        {QUESTION_TYPE_OPTIONS.find((o) => o.value === question.questionType)?.label || question.questionType}
      </Tag>
      {question.isRequired && (
        <Text type="danger" style={{ fontSize: 12 }}>
          필수
        </Text>
      )}
      <Button
        type="text"
        danger
        size="small"
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation()
          onDelete(question.id)
        }}
      />
    </div>
  )
}

export default function SurveyQuestionEditor() {
  const { id: surveyId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<SurveyQuestion | null>(null)
  const [form] = Form.useForm()

  // 문항 목록 조회
  const { data } = useQuery({
    queryKey: ['sys02', 'questions', surveyId],
    queryFn: () => apiClient.get<SurveyQuestion[]>(`/sys02/surveys/${surveyId}/questions`),
    enabled: !!surveyId,
  })

  useEffect(() => {
    if (data) {
      const sorted = [...(data as SurveyQuestion[])].sort((a, b) => a.orderIndex - b.orderIndex)
      setQuestions(sorted)
    }
  }, [data])

  // 문항 저장 뮤테이션
  const saveMutation = useMutation({
    mutationFn: (qs: SurveyQuestion[]) =>
      apiClient.put(`/sys02/surveys/${surveyId}/questions`, qs),
    onSuccess: () => {
      message.success('문항이 저장되었습니다')
    },
    onError: () => message.error('저장에 실패했습니다'),
  })

  // 드래그 종료 처리
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, i) => ({
        ...q,
        orderIndex: i + 1,
      }))
      setQuestions(reordered)
      if (selectedQuestion && selectedQuestion.id === active.id) {
        const updated = reordered.find((q) => q.id === active.id)
        if (updated) setSelectedQuestion(updated)
      }
    }
  }

  // 문항 추가
  const handleAddQuestion = () => {
    const newQuestion: SurveyQuestion = {
      id: `q-new-${Date.now()}`,
      surveyId: surveyId || '',
      questionText: '',
      questionType: 'radio',
      isRequired: true,
      options: ['선택지 1', '선택지 2'],
      orderIndex: questions.length + 1,
    }
    const updated = [...questions, newQuestion]
    setQuestions(updated)
    setSelectedQuestion(newQuestion)
    form.setFieldsValue(newQuestion)
  }

  // 문항 삭제
  const handleDeleteQuestion = (id: string) => {
    const updated = questions
      .filter((q) => q.id !== id)
      .map((q, i) => ({ ...q, orderIndex: i + 1 }))
    setQuestions(updated)
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null)
      form.resetFields()
    }
  }

  // 문항 선택
  const handleSelectQuestion = (q: SurveyQuestion) => {
    setSelectedQuestion(q)
    form.setFieldsValue({
      questionText: q.questionText,
      questionType: q.questionType,
      isRequired: q.isRequired,
      options: q.options,
    })
  }

  // 편집 폼 변경 처리
  const handleFormChange = () => {
    if (!selectedQuestion) return
    const values = form.getFieldsValue()
    const updated: SurveyQuestion = {
      ...selectedQuestion,
      questionText: values.questionText || '',
      questionType: values.questionType || 'radio',
      isRequired: values.isRequired ?? true,
      options: values.options || [],
    }
    setSelectedQuestion(updated)
    setQuestions((prev) =>
      prev.map((q) => (q.id === selectedQuestion.id ? updated : q))
    )
  }

  // 저장
  const handleSave = () => {
    saveMutation.mutate(questions)
  }

  const selectedType = selectedQuestion?.questionType

  return (
    <PageContainer
      title="설문 문항 편집기"
      extra={[
        <Button key="back" onClick={() => navigate(-1)}>
          목록으로
        </Button>,
        <Button key="excel-download">엑셀 양식 다운로드</Button>,
        <Button key="excel-upload">엑셀 업로드</Button>,
        <Button key="add" type="dashed" onClick={handleAddQuestion}>
          <PlusOutlined /> 문항 추가
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={saveMutation.isPending}
          onClick={handleSave}
        >
          저장
        </Button>,
      ]}
    >
      <Row gutter={16}>
        {/* 좌측: 문항 목록 */}
        <Col span={14}>
          <div style={{ marginBottom: 16 }}>
            <Text strong>문항 목록 ({questions.length}개)</Text>
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
              드래그로 순서를 변경할 수 있습니다
            </Text>
          </div>

          {questions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: '#bbb',
                border: '1px dashed #d9d9d9',
                borderRadius: 6,
              }}
            >
              문항이 없습니다. [문항 추가] 버튼을 눌러 문항을 추가하세요.
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {questions.map((q) => (
                  <SortableQuestionItem
                    key={q.id}
                    question={q}
                    isSelected={selectedQuestion?.id === q.id}
                    onSelect={handleSelectQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          <Button
            type="dashed"
            onClick={handleAddQuestion}
            style={{ width: '100%', marginTop: 8 }}
          >
            <PlusOutlined /> 문항 추가
          </Button>
        </Col>

        {/* 우측: 문항 편집 */}
        <Col span={10}>
          {selectedQuestion ? (
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                padding: 20,
                background: '#fafafa',
              }}
            >
              <Text strong style={{ marginBottom: 16, display: 'block' }}>
                문항 편집
              </Text>
              <Form
                form={form}
                layout="vertical"
                onValuesChange={handleFormChange}
              >
                <Form.Item
                  name="questionText"
                  label="문항 내용"
                  rules={[
                    { required: true, message: '문항 내용을 입력하세요' },
                    { max: 500, message: '500자 이하로 입력하세요' },
                  ]}
                >
                  <TextArea rows={3} maxLength={500} placeholder="문항 내용을 입력하세요" />
                </Form.Item>

                <Form.Item
                  name="questionType"
                  label="문항 유형"
                  rules={[{ required: true, message: '문항 유형을 선택하세요' }]}
                >
                  <Select options={QUESTION_TYPE_OPTIONS} />
                </Form.Item>

                <Form.Item
                  name="isRequired"
                  label="필수 응답"
                  valuePropName="checked"
                >
                  <Switch defaultChecked />
                </Form.Item>

                {/* 선택지 목록 (radio/checkbox일 때만) */}
                {(selectedType === 'radio' || selectedType === 'checkbox') && (
                  <Form.List name="options">
                    {(fields, { add, remove }) => (
                      <Form.Item label="선택지 목록">
                        {fields.map((field) => (
                          <Space key={field.key} style={{ display: 'flex', marginBottom: 4 }}>
                            <Form.Item {...field} noStyle>
                              <Input placeholder={`선택지 ${field.name + 1}`} />
                            </Form.Item>
                            <DeleteOutlined
                              style={{ color: '#ff4d4f', cursor: 'pointer' }}
                              onClick={() => remove(field.name)}
                            />
                          </Space>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add(`선택지 ${fields.length + 1}`)}
                          style={{ width: '100%', marginTop: 4 }}
                          icon={<PlusOutlined />}
                        >
                          선택지 추가
                        </Button>
                      </Form.Item>
                    )}
                  </Form.List>
                )}
              </Form>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#bbb',
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
              }}
            >
              좌측에서 편집할 문항을 선택하세요
            </div>
          )}
        </Col>
      </Row>
    </PageContainer>
  )
}
