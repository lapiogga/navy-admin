import { useState, useRef } from 'react'
import { Button, message, Tabs, Row, Col, Statistic } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { DetailModal } from '@/shared/ui/DetailModal/DetailModal'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { CertApplication } from '@/shared/api/mocks/handlers/sys04'
import type { DetailField } from '@/shared/ui/DetailModal/DetailModal'

// 인증서 전체 목록 조회
async function fetchCertificates(params: PageRequest): Promise<PageResponse<CertApplication>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<CertApplication>>>(
    '/sys04/certificates',
    { params: { page: params.page, size: params.size } },
  )
  const data = (res as ApiResult<PageResponse<CertApplication>>).data ?? (res as unknown as PageResponse<CertApplication>)
  return data
}

const STATUS_COLOR_MAP: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red', withdrawn: 'default' }
const STATUS_LABEL_MAP: Record<string, string> = { pending: '대기', approved: '승인', rejected: '반려', withdrawn: '회수' }

// 상세 모달 필드 정의
const DETAIL_FIELDS: DetailField[] = [
  { key: 'applicantName', label: '신청자' },
  { key: 'applicantUnit', label: '소속' },
  { key: 'certType', label: '인증서종류' },
  { key: 'requestType', label: '신청구분' },
  { key: 'purpose', label: '신청목적' },
  { key: 'reason', label: '사유' },
  { key: 'militaryId', label: '군번' },
  { key: 'email', label: '이메일' },
  { key: 'phone', label: '전화번호' },
  {
    key: 'status',
    label: '상태',
    render: (value) => (
      <StatusBadge
        status={String(value)}
        colorMap={STATUS_COLOR_MAP}
        labelMap={STATUS_LABEL_MAP}
      />
    ),
  },
  { key: 'appliedAt', label: '신청일' },
  { key: 'processedAt', label: '처리일' },
]

// 엑셀(CSV) 다운로드 함수
function exportToExcel(data: CertApplication[]) {
  const headers = ['번호', '신청자', '소속', '인증서종류', '신청구분', '신청목적', '상태', '신청일', '처리일']
  const rows = data.map((item, index) => [
    index + 1,
    item.applicantName,
    item.applicantUnit,
    item.certType,
    item.requestType,
    item.purpose,
    STATUS_LABEL_MAP[item.status] || item.status,
    item.appliedAt,
    item.processedAt || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `인증서_등록대장_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  message.success('엑셀 다운로드가 완료되었습니다')
}

export default function CertificateRegisterPage() {
  const queryClient = useQueryClient()
  const [selectedRecord, setSelectedRecord] = useState<CertApplication | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('list')
  const dataRef = useRef<CertApplication[]>([])

  const handleRowClick = (record: CertApplication) => {
    setSelectedRecord(record)
    setDetailOpen(true)
  }

  // 통계 계산
  const totalCount = dataRef.current.length
  const approvedCount = dataRef.current.filter((item) => item.status === 'approved').length
  const rejectedCount = dataRef.current.filter((item) => item.status === 'rejected').length
  const pendingCount = dataRef.current.filter((item) => item.status === 'pending').length

  const columns: ProColumns<CertApplication>[] = [
    {
      title: '번호',
      dataIndex: 'id',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: '신청자',
      dataIndex: 'applicantName',
      width: 100,
    },
    {
      title: '소속',
      dataIndex: 'applicantUnit',
      width: 120,
    },
    {
      title: '인증서종류',
      dataIndex: 'certType',
      width: 120,
    },
    {
      title: '신청구분',
      dataIndex: 'requestType',
      width: 100,
    },
    {
      title: '신청목적',
      dataIndex: 'purpose',
      ellipsis: true,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 80,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '신청일',
      dataIndex: 'appliedAt',
      width: 110,
    },
    {
      title: '처리일',
      dataIndex: 'processedAt',
      width: 110,
      render: (_, record) => record.processedAt ?? '-',
    },
  ]

  const tabItems = [
    {
      key: 'list',
      label: '목록',
      children: (
        <DataTable<CertApplication>
          rowKey="id"
          columns={columns}
          request={async (params) => {
            queryClient.setQueryData(['sys04-register-params'], params)
            const result = await fetchCertificates(params)
            dataRef.current = result.content
            return result
          }}
          headerTitle="인증서 등록대장"
          toolBarRender={() => [
            <Button
              key="save"
              type="primary"
              onClick={() => message.success('저장되었습니다')}
            >
              저장
            </Button>,
            <Button
              key="excel"
              icon={<DownloadOutlined />}
              onClick={() => exportToExcel(dataRef.current)}
            >
              엑셀 다운로드
            </Button>,
          ]}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
        />
      ),
    },
    {
      key: 'statistics',
      label: '통계',
      children: (
        <Row gutter={[24, 24]} style={{ padding: 24 }}>
          <Col span={6}>
            <Statistic title="전체 건수" value={totalCount} />
          </Col>
          <Col span={6}>
            <Statistic title="승인 건수" value={approvedCount} valueStyle={{ color: '#52c41a' }} />
          </Col>
          <Col span={6}>
            <Statistic title="반려 건수" value={rejectedCount} valueStyle={{ color: '#ff4d4f' }} />
          </Col>
          <Col span={6}>
            <Statistic title="대기 건수" value={pendingCount} valueStyle={{ color: '#faad14' }} />
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <PageContainer title="인증서 등록대장">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="인증서 상세"
        data={selectedRecord as Record<string, unknown> | null}
        fields={DETAIL_FIELDS}
        width={600}
      />
    </PageContainer>
  )
}
