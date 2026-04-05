import { Card, Row, Col, Typography } from 'antd'
import { SUBSYSTEM_META } from '@/entities/subsystem/config'
import { AnnouncementSection } from '@/features/announcements/components/AnnouncementSection'

const { Title, Text } = Typography

export default function PortalPage() {
  const subsystems = Object.values(SUBSYSTEM_META)

  const handleOpen = (path: string) => {
    window.open(path, '_blank')
  }

  return (
    <div>
      <AnnouncementSection />
      <Title level={4}>서브시스템 바로가기</Title>
      <Row gutter={[16, 16]}>
        {subsystems.map((sys) => (
          <Col key={sys.code} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => handleOpen(sys.path)}
              className="text-center"
            >
              <Title level={5}>{sys.name}</Title>
              <Text type="secondary">{sys.processCount}개 프로세스</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
