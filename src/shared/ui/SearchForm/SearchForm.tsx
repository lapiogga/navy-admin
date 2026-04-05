import { Form, Input, Select, DatePicker, Button, Row, Col, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useEnterSubmit } from '@/shared/lib/ime'

const { RangePicker } = DatePicker

export interface SearchField {
  name: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange'
  options?: { label: string; value: string | number }[]
  placeholder?: string
}

export interface SearchFormProps {
  fields: SearchField[]
  onSearch: (values: Record<string, unknown>) => void
  onReset?: () => void
}

export function SearchForm({ fields, onSearch, onReset }: SearchFormProps) {
  const [form] = Form.useForm()
  const handleEnter = useEnterSubmit(() => form.submit())

  const handleReset = () => {
    form.resetFields()
    onReset?.()
  }

  const renderField = (field: SearchField) => {
    switch (field.type) {
      case 'select':
        return <Select options={field.options} placeholder={field.placeholder ?? '선택'} allowClear />
      case 'date':
        return <DatePicker className="w-full" />
      case 'dateRange':
        return <RangePicker className="w-full" />
      default:
        return <Input placeholder={field.placeholder ?? '검색어 입력'} onKeyDown={handleEnter} />
    }
  }

  return (
    <Form form={form} onFinish={onSearch} layout="inline" className="mb-4">
      <Row gutter={[16, 16]} className="w-full">
        {fields.map((field) => (
          <Col key={field.name} xs={24} sm={12} md={8} lg={6}>
            <Form.Item name={field.name} label={field.label}>
              {renderField(field)}
            </Form.Item>
          </Col>
        ))}
        <Col>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              검색
            </Button>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              초기화
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  )
}
