import { useState } from 'react'
import { Button, message } from 'antd'
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

const STATUS_COLOR_MAP = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP = { pending: '대기', approved: '승인', rejected: '반려' }

// 상세 모달 필드 정의
const DETAIL_FIELDS: DetailField[] = [
  { key: 'applicantName', label: '신청자' },
  { key: 'applicantUnit', label: '소속' },
  { key: 'certType', label: '인증서종류' },
  { key: 'purpose', label: '신청목적' },
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

export default function CertificateRegisterPage() {
  const queryClient = useQueryClient()
  const [selectedRecord, setSelectedRecord] = useState<CertApplication | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleRowClick = (record: CertApplication) => {
    setSelectedRecord(record)
    setDetailOpen(true)
  }

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

  return (
    <PageContainer title="인증서 등록대장">
      <DataTable<CertApplication>
        rowKey="id"
        columns={columns}
        request={(params) => {
          queryClient.setQueryData(['sys04-register-params'], params)
          return fetchCertificates(params)
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
        ]}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
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
