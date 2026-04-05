import { message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Popconfirm, Button } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { CertApplication } from '@/shared/api/mocks/handlers/sys04'

// 인증서 신청 목록 조회 (전체)
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

export default function CertificateApprovalPage() {
  const queryClient = useQueryClient()

  // 승인 mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(`/sys04/certificates/${id}/approve`)
    },
    onSuccess: () => {
      message.success('처리 완료')
      queryClient.invalidateQueries({ queryKey: ['sys04-approval'] })
    },
    onError: () => {
      message.error('처리에 실패했습니다')
    },
  })

  // 반려 mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(`/sys04/certificates/${id}/reject`)
    },
    onSuccess: () => {
      message.success('처리 완료')
      queryClient.invalidateQueries({ queryKey: ['sys04-approval'] })
    },
    onError: () => {
      message.error('처리에 실패했습니다')
    },
  })

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
    {
      title: '처리',
      width: 160,
      render: (_, record) => {
        if (record.status !== 'pending') {
          return (
            <StatusBadge
              status={record.status}
              colorMap={STATUS_COLOR_MAP}
              labelMap={STATUS_LABEL_MAP}
            />
          )
        }
        return (
          <>
            <Popconfirm
              title="승인하시겠습니까?"
              onConfirm={() => approveMutation.mutate(record.id)}
              okText="승인"
              cancelText="취소"
            >
              <Button type="link" size="small">
                승인
              </Button>
            </Popconfirm>
            <Popconfirm
              title="반려하시겠습니까?"
              onConfirm={() => rejectMutation.mutate(record.id)}
              okText="반려"
              cancelText="취소"
              okButtonProps={{ danger: true }}
            >
              <Button type="link" size="small" danger>
                반려
              </Button>
            </Popconfirm>
          </>
        )
      },
    },
  ]

  return (
    <PageContainer title="인증서 승인/관리">
      <DataTable<CertApplication>
        rowKey="id"
        columns={columns}
        request={(params) => {
          queryClient.setQueryData(['sys04-approval-params'], params)
          return fetchCertificates(params)
        }}
        headerTitle="승인 대기 목록"
      />
    </PageContainer>
  )
}
