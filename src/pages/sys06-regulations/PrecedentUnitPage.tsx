/**
 * SYS06 예하부대 예규 페이지
 * - 부대(서) 카드 리스트 + 예규 페이지 링크
 * - CSV 스펙: "예규 소관 부대(서) 리스트 및 예규 페이지 링크 전시"
 */
import { Row, Col, Card, Tag } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { BankOutlined, FileTextOutlined } from '@ant-design/icons'

// 예하부대 카드 데이터 - 해병대 예하부대 목록
interface UnitCard {
  name: string
  url: string
  description: string
  regulationCount: number
  type: '사단' | '여단' | '단' | '대대'
}

const UNIT_LINKS: UnitCard[] = [
  { name: '제1사단', url: '#', description: '포항 소재, 동해안 방어', regulationCount: 12, type: '사단' },
  { name: '제2사단', url: '#', description: '김포 소재, 수도권 방어', regulationCount: 9, type: '사단' },
  { name: '교육훈련단', url: '#', description: '해병대 교육훈련 전담', regulationCount: 15, type: '단' },
  { name: '상륙기동단', url: '#', description: '상륙작전 전담 부대', regulationCount: 8, type: '단' },
  { name: '항공단', url: '#', description: '해병대 항공 지원', regulationCount: 6, type: '단' },
  { name: '군수단', url: '#', description: '군수지원 전담 부대', regulationCount: 5, type: '단' },
  { name: '제6여단', url: '#', description: '서해 도서 방어', regulationCount: 7, type: '여단' },
  { name: '제9여단', url: '#', description: '백령도 방어', regulationCount: 4, type: '여단' },
]

// 부대 유형별 색상
const TYPE_COLOR: Record<string, string> = {
  사단: 'blue',
  여단: 'green',
  단: 'orange',
  대대: 'purple',
}

export default function Sys06PrecedentUnitPage() {
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
