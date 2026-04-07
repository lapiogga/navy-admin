import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProFormUploadButton,
  ProFormDateRangePicker,
  ProFormCheckbox,
} from '@ant-design/pro-components'
import type { Rule } from 'antd/es/form'

export interface CrudFormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'dateRange' | 'number' | 'file' | 'checkbox'
  required?: boolean
  options?: { label: string; value: string | number }[]
  disabled?: boolean
  rules?: Rule[]
  placeholder?: string
  colSpan?: number
  maxFiles?: number
}

export interface CrudFormProps<T extends Record<string, unknown>> {
  fields: CrudFormField[]
  onFinish: (values: T) => Promise<boolean>
  initialValues?: Partial<T>
  loading?: boolean
  mode?: 'create' | 'edit' | 'view'
}

export function CrudForm<T extends Record<string, unknown>>({
  fields,
  onFinish,
  initialValues,
  loading,
  mode = 'create',
}: CrudFormProps<T>) {
  const isView = mode === 'view'

  const renderField = (field: CrudFormField) => {
    const commonProps = {
      key: field.name,
      name: field.name,
      label: field.label,
      placeholder: field.placeholder,
      disabled: isView || field.disabled,
      rules: field.required
        ? [
            { required: true, message: `${field.label}을(를) 입력하세요` },
            ...(field.rules ?? []),
          ]
        : field.rules,
    }
    switch (field.type) {
      case 'textarea':
        return <ProFormTextArea {...commonProps} />
      case 'select':
        return <ProFormSelect {...commonProps} options={field.options} />
      case 'date':
        return <ProFormDatePicker {...commonProps} />
      case 'dateRange':
        return <ProFormDateRangePicker {...commonProps} />
      case 'number':
        return <ProFormDigit {...commonProps} />
      case 'file':
        return <ProFormUploadButton {...commonProps} max={field.maxFiles ?? 5} title="파일 선택" />
      case 'checkbox':
        return <ProFormCheckbox {...commonProps} />
      default:
        return <ProFormText {...commonProps} />
    }
  }

  return (
    <ProForm<T>
      onFinish={onFinish}
      initialValues={initialValues as T}
      loading={loading}
      submitter={isView ? false : undefined}
    >
      {fields.map(renderField)}
    </ProForm>
  )
}
