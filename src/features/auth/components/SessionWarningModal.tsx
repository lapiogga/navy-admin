import { Modal, Button, Typography } from 'antd'

const { Text } = Typography

interface SessionWarningModalProps {
  visible: boolean
  countdown: number
  onExtend: () => void
  onLogout: () => void
}

/**
 * 세션 만료 경고 Modal (D-05).
 * - closable=false, maskClosable=false — 사용자가 Modal을 회피할 수 없음
 * - 카운트다운 숫자: 20px semibold colorError (#ff4d4f)
 * - footer: [세션 연장 (primary)] [지금 로그아웃 (default)]
 */
export function SessionWarningModal({ visible, countdown, onExtend, onLogout }: SessionWarningModalProps) {
  return (
    <Modal
      title="세션 만료 경고"
      open={visible}
      closable={false}
      maskClosable={false}
      footer={[
        <Button key="extend" type="primary" onClick={onExtend}>
          세션 연장
        </Button>,
        <Button key="logout" onClick={onLogout}>
          지금 로그아웃
        </Button>,
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        <Text>{countdown}초 후 자동으로 로그아웃됩니다.</Text>
        <br />
        <Text style={{ fontSize: 20, fontWeight: 600, color: '#ff4d4f' }}>
          {countdown}
        </Text>
      </div>
    </Modal>
  )
}
