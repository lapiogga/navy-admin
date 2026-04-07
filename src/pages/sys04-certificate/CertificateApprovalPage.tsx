import { useState, useCallback } from 'react'
import { message, Modal, Input } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Popconfirm, Button } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { CertApplication } from '@/shared/api/mocks/handlers/sys04'

// 인증서 신청 목록 조회 (검색 필터 포함)
async function fetchCertificates(
  params: PageRequest,
  filters?: Record<string, unknown>,
): Promise<PageResponse<CertApplication>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<CertApplication>>>(
    '/sys04/certificates',
    { params: { page: params.page, size: params.size, ...filters } },
  )
  const data = (res as ApiResult<PageResponse<CertApplication>>).data ?? (res as unknown as PageResponse<CertApplication>)
  return data
}

const STATUS_COLOR_MAP: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red', withdrawn: 'default' }
const STATUS_LABEL_MAP: Record<string, string> = { pending: '대기', approved: '승인', rejected: '반려', withdrawn: '회수' }

const NDSCA_COLOR_MAP: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red' }
const NDSCA_LABEL_MAP: Record<string, string> = { pending: '처리중', approved: '승인', rejected: '반려' }

const CERT_TYPE_OPTIONS = [
  { label: '재직증명서', value: '재직증명서' },
  { label: '경력증명서', value: '경력증명서' },
  { label: '복무증명서', value: '복무증명서' },
]

const REQUEST_TYPE_OPTIONS = [
  { label: '신규발급', value: '신규발급' },
  { label: '재발급', value: '재발급' },
  { label: '갱신', value: '갱신' },
]

const APPROVAL_STATUS_OPTIONS = [
  { label: '전체', value: '' },
  { label: '대기', value: 'pending' },
  { label: '승인', value: 'approved' },
  { label: '반려', value: 'rejected' },
]

// 검색 필드 정의
const approvalSearchFields: SearchField[] = [
  { name: 'certType', label: '인증서구분', type: 'select', options: CERT_TYPE_OPTIONS },
  { name: 'requestType', label: '신청구분', type: 'select', options: REQUEST_TYPE_OPTIONS },
  { name: 'status', label: '진행상태', type: 'select', options: APPROVAL_STATUS_OPTIONS },
]

export default function CertificateApprovalPage() {
  const queryClient = useQueryClient()
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [searchFilters, setSearchFilters] = useState<Record<string, unknown>>({})

  // 검색 핸들러
  const handleSearch = useCallback((values: Record<string, unknown>) => {
    setSearchFilters(values)
    queryClient.invalidateQueries({ queryKey: ['sys04-approval'] })
  }, [queryClient])

  const handleSearchReset = useCallback(() => {
    setSearchFilters({})
    queryClient.invalidateQueries({ queryKey: ['sys04-approval'] })
  }, [queryClient])

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
    mutationFn: async ({ id, rejectReason: reason }: { id: string; rejectReason: string }) => {
      return apiClient.patch(`/sys04/certificates/${id}/reject`, { rejectReason: reason })
    },
    onSuccess: () => {
      message.success('처리 완료')
      setRejectModalOpen(false)
      setRejectTargetId(null)
      setRejectReason('')
      queryClient.invalidateQueries({ queryKey: ['sys04-approval'] })
    },
    onError: () => {
      message.error('처리에 실패했습니다')
    },
  })

  const handleRejectClick = (id: string) => {
    setRejectTargetId(id)
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = () => {
    if (!rejectTargetId) return
    if (!rejectReason.trim()) {
      message.warning('반려사유를 입력하세요')
      return
    }
    rejectMutation.mutate({ id: rejectTargetId, rejectReason })
  }

  const handleRejectCancel = () => {
    setRejectModalOpen(false)
    setRejectTargetId(null)
    setRejectReason('')
  }

  const columns: ProColumns<CertApplication>[] = [
    {
      title: '순번',
      dataIndex: 'id',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '소속부서',
      dataIndex: 'applicantUnit',
      width: 120,
    },
    {
      title: '인증서구분',
      dataIndex: 'certType',
      width: 120,
    },
    {
      title: '신청구분',
      dataIndex: 'requestType',
      width: 100,
    },
    militaryPersonColumn<CertApplication>('신청자', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'applicantName',
    }),
    {
      title: '신청일시',
      dataIndex: 'appliedAt',
      width: 110,
    },
    {
      title: '국방전자서명인증센터',
      dataIndex: 'ndscaStatus',
      width: 150,
      render: (_, record) => (
        <StatusBadge
          status={record.ndscaStatus || 'pending'}
          colorMap={NDSCA_COLOR_MAP}
          labelMap={NDSCA_LABEL_MAP}
        />
      ),
    },
    {
      title: '진행상태(최종)',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    militaryPersonColumn<CertApplication>('승인자', {
      serviceNumber: 'approverServiceNumber',
      rank: 'approverRank',
      name: 'approverName',
    }),
    {
      title: '처리일시',
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
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleRejectClick(record.id)}
            >
              반려
            </Button>
          </>
        )
      },
    },
  ]

  return (
    <PageContainer title="인증서 승인/관리">
      <SearchForm fields={approvalSearchFields} onSearch={handleSearch} onReset={handleSearchReset} />

      <DataTable<CertApplication>
        rowKey="id"
        columns={columns}
        request={(params) => {
          queryClient.setQueryData(['sys04-approval-params'], params)
          return fetchCertificates(params, searchFilters)
        }}
        headerTitle="승인 대기 목록"
      />

      <Modal
        title="반려사유 입력"
        open={rejectModalOpen}
        onOk={handleRejectConfirm}
        onCancel={handleRejectCancel}
        okText="반려"
        cancelText="취소"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="반려사유를 입력하세요"
        />
      </Modal>
    </PageContainer>
  )
}
