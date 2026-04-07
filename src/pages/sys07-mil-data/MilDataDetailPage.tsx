import { Descriptions, Tag, Spin, Table, Divider } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ApiResult } from '@/shared/api/types'
import type { MilDocument } from '@/shared/api/mocks/handlers/sys07'

interface ChangeHistory {
  id: string
  changedAt: string
  changedBy: string
  changedField: string
  before: string
  after: string
}

interface MilDataDetailPageProps {
  docId: string
}

function securityLevelTag(level: string) {
  const map: Record<string, { color: string; label: string }> = {
    secret: { color: 'red', label: '비밀' },
    confidential: { color: 'orange', label: '대외비' },
    normal: { color: 'blue', label: '일반' },
  }
  const { color, label } = map[level] ?? { color: 'default', label: level }
  return <Tag color={color}>{label}</Tag>
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: '보존중',
  on_loan: '대출중',
  evaluation: '평가심의',
  disposed: '파기',
}

export default function MilDataDetailPage({ docId }: MilDataDetailPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['sys07-document-detail', docId],
    queryFn: async () => {
      const res = await fetch(`/api/sys07/documents/${docId}`)
      const json: ApiResult<{ doc: MilDocument; history: ChangeHistory[] }> = await res.json()
      return json.data
    },
    enabled: !!docId,
  })

  if (isLoading) return <Spin />

  const doc = data?.doc
  const history = data?.history ?? []

  if (!doc) return <div>자료를 찾을 수 없습니다.</div>

  return (
    <>
      {/* CSV 상세 조회 필드: 비밀등급, 관리번호, 문서구분, 접수일자, 문서제목,
          이관부서, 보관위치, 문서일자, 보존기간, 문서규격, 문서형태,
          발행부서, 문서매수, 문서번호, 예고문, 변경근거 */}
      <Descriptions layout="vertical" column={3} bordered size="small">
        <Descriptions.Item label="비밀등급">{securityLevelTag(doc.securityLevel)}</Descriptions.Item>
        <Descriptions.Item label="관리번호">{doc.docNumber}</Descriptions.Item>
        <Descriptions.Item label="문서구분">{doc.docType}</Descriptions.Item>
        <Descriptions.Item label="문서제목" span={3}>{doc.title}</Descriptions.Item>
        <Descriptions.Item label="이관부서">{(doc as Record<string, unknown>).transferDept as string ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="발행부서">{(doc as Record<string, unknown>).issueDept as string ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="이관일자">{doc.transferDate}</Descriptions.Item>
        <Descriptions.Item label="문서일자">{(doc as Record<string, unknown>).docDate as string ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="보관형태">{doc.storageType}</Descriptions.Item>
        <Descriptions.Item label="보관위치">{(doc as Record<string, unknown>).storagePosition as string ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="보관장소">{doc.storageLocation}</Descriptions.Item>
        <Descriptions.Item label="보존기간">{doc.retentionPeriod}년</Descriptions.Item>
        <Descriptions.Item label="보존만료일">{doc.retentionExpireDate}</Descriptions.Item>
        <Descriptions.Item label="문서매수">{doc.pages}매</Descriptions.Item>
        <Descriptions.Item label="문서규격">{(doc as Record<string, unknown>).docSpec as string ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="문서형태">{(doc as Record<string, unknown>).docFormat as string ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="상태">{STATUS_LABEL_MAP[doc.status] ?? doc.status}</Descriptions.Item>
        <Descriptions.Item label="등록일">{doc.registeredAt}</Descriptions.Item>
        <Descriptions.Item label="예고문" span={3}>{(doc as Record<string, unknown>).notice as string || '-'}</Descriptions.Item>
        <Descriptions.Item label="변경근거" span={3}>{(doc as Record<string, unknown>).changeReason as string || '-'}</Descriptions.Item>
        <Descriptions.Item label="비고" span={3}>{doc.remarks}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">변경이력 (관리자)</Divider>
      <Table<ChangeHistory>
        size="small"
        dataSource={history}
        rowKey="id"
        pagination={false}
        columns={[
          { title: '변경일시', dataIndex: 'changedAt', width: 160 },
          { title: '변경자', dataIndex: 'changedBy', width: 120 },
          { title: '변경항목', dataIndex: 'changedField', width: 120 },
          { title: '변경전', dataIndex: 'before' },
          { title: '변경후', dataIndex: 'after' },
        ]}
      />
    </>
  )
}
