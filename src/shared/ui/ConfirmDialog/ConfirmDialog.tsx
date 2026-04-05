import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

export interface ConfirmDialogOptions {
  title: string
  content: string
  onConfirm: () => Promise<void> | void
  danger?: boolean
}

export function showConfirmDialog({
  title,
  content,
  onConfirm,
  danger = false,
}: ConfirmDialogOptions) {
  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    content,
    okText: '확인',
    cancelText: '취소',
    okButtonProps: { danger },
    onOk: onConfirm,
  })
}
