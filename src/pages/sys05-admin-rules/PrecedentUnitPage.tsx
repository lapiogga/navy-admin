import { Row, Col, Card, Tag } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { BankOutlined, FileTextOutlined } from '@ant-design/icons'

// 예하부대 카드 데이터 (G10) - 부대 목록 및 예규 페이지 링크
interface UnitCard {
  name: string
  url: string
  description: string
  regulationCount: number
  type: '사단' | '여단' | '단' | '대대'
}

const UNIT_LINKS: UnitCard[] = [
  { name: '해군작전사령부', url: '#', description: '해군 작전 총괄', regulationCount: 18, type: '사단' },
  { name: '제1함대', url: '#', description: '동해 작전 담당', regulationCount: 12, type: '여단' },
  { name: '제2함대', url: '#', description: '서해 작전 담당', regulationCount: 14, type: '여단' },
  { name: '제3함대', url: '#', description: '남해 작전 담당', regulationCount: 11, type: '여단' },
  { name: '잠수함사령부', url: '#', description: '잠수함 작전 전담', regulationCount: 9, type: '단' },
  { name: '해군항공사령부', url: '#', description: '해군 항공 작전', regulationCount: 8, type: '단' },
  { name: '해군교육사령부', url: '#', description: '해군 교육훈련 전담', regulationCount: 15, type: '단' },
  { name: '해군군수사령부', url: '#', description: '해군 군수지원 전담', regulationCount: 10, type: '단' },
  { name: '특수전전단', url: '#', description: '특수작전 전담 부대', regulationCount: 6, type: '여단' },
  { name: '해군사관학교', url: '#', description: '해군 장교 양성', regulationCount: 7, type: '단' },
]

// 부대 유형별 색상
const TYPE_COLOR: Record<string, string> = {
  사단: 'blue',
  여단: 'green',
  단: 'orange',
  대대: 'purple',
}

export default function PrecedentUnitPage() {
  return (
    <PageContainer title="예규 - 예하부대">
      <Row gutter={[16, 16]}>
        {UNIT_LINKS.map((unit) => (
          <Col key={unit.name} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              onClick={() => window.open(unit.url, '_blank')}
              style={{ textAlign: 'center' }}
            >
              <BankOutlined style={{ fontSize: 36, color: '#1890ff', marginBottom: 12 }} />
              <Card.Meta
                title={
                  <span>
                    {unit.name}{' '}
                    <Tag color={TYPE_COLOR[unit.type]}>{unit.type}</Tag>
                  </span>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>{unit.description}</div>
                    <div style={{ color: '#666' }}>
                      <FileTextOutlined style={{ marginRight: 4 }} />
                      예규 {unit.regulationCount}건
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  )
}
