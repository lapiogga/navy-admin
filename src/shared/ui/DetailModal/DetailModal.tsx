import { Modal, Descriptions } from 'antd'

export interface DetailField {
  key: string
  label: string
  render?: (value: unknown, record?: Record<string, unknown>) => React.ReactNode
}

export interface DetailModalProps {
  open: boolean
  onClose: () => void
  title: string
  data: Record<string, unknown> | null
  fields: DetailField[]
  width?: number
}

export function DetailModal({
  open,
  onClose,
  title,
  data,
  fields,
  width = 640,
}: DetailModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title={title} footer={null} width={width}>
      {data && (
        <Descriptions column={1} bordered size="small">
          {fields.map((field) => (
            <Descriptions.Item key={field.key} label={field.label}>
              {field.render ? field.render(data[field.key], data) : String(data[field.key] ?? '-')}
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </Modal>
  )
}
