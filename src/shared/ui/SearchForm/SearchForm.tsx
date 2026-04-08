import type React from 'react'
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
  span?: { xs?: number; sm?: number; md?: number; lg?: number }
}

export interface SearchFormProps {
  fields: SearchField[]
  onSearch: (values: Record<string, unknown>) => void
  onReset?: () => void
  containerStyle?: React.CSSProperties
}

export function SearchForm({ fields, onSearch, onReset, containerStyle }: SearchFormProps) {
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
    <div className="search-form-container" style={containerStyle}>
      <Form form={form} onFinish={onSearch} layout="inline" style={{ width: '100%' }}>
        <Row gutter={[16, 8]} style={{ width: '100%' }}>
          {fields.map((field) => {
            const defaultSpan = field.type === 'dateRange'
              ? { xs: 24, sm: 24, md: 12, lg: 8 }
              : { xs: 24, sm: 12, md: 8, lg: 6 }
            const colSpan = { ...defaultSpan, ...field.span }
            return (
              <Col key={field.name} {...colSpan}>
                <Form.Item name={field.name} label={field.label} style={{ marginBottom: 0 }}>
                  {renderField(field)}
                </Form.Item>
              </Col>
            )
          })}
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
    </div>
  )
}
