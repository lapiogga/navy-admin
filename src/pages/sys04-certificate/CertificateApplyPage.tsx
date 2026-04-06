import { useState } from 'react'
import { Modal, Button, Popconfirm, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { CertApplication } from '@/shared/api/mocks/handlers/sys04'

// 인증서 신청 목록 조회
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

type FormValues = {
  certType: string
  requestType: string
  purpose: string
  reason: string
  militaryId: string
  email: string
  phone: string
}

export default function CertificateApplyPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CertApplication | null>(null)

  // 신청 등록 mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiClient.post('/sys04/certificates', values)
    },
    onSuccess: () => {
      message.success('신청서가 등록되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys04-certificates'] })
    },
    onError: () => {
      message.error('등록에 실패했습니다')
    },
  })

  // 신청 수정 mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      return apiClient.put(`/sys04/certificates/${id}`, values)
    },
    onSuccess: () => {
      message.success('신청서가 수정되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['sys04-certificates'] })
    },
    onError: () => {
      message.error('수정에 실패했습니다')
    },
  })

  // 신청 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys04/certificates/${id}`)
    },
    onSuccess: () => {
      message.success('신청서가 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys04-certificates'] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다')
    },
  })

  // 회수 mutation
  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.patch(`/sys04/certificates/${id}/withdraw`)
    },
    onSuccess: () => {
      message.success('신청서가 회수되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys04-certificates'] })
    },
    onError: () => {
      message.error('회수에 실패했습니다')
    },
  })

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    const formValues = values as FormValues
    if (editTarget) {
      await updateMutation.mutateAsync({ id: editTarget.id, values: formValues })
    } else {
      await createMutation.mutateAsync(formValues)
    }
    return true
  }

  const handleEdit = (record: CertApplication) => {
    setEditTarget(record)
    setModalOpen(true)
  }

  const handleCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleCancel = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const columns: ProColumns<CertApplication>[] = [
    {
      title: '번호',
      dataIndex: 'id',
      width: 80,
      render: (_, __, index) => index + 1,
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
      title: '액션',
      width: 200,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
            disabled={record.status !== 'pending'}
          >
            수정
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="link"
              size="small"
              danger
              disabled={record.status !== 'pending'}
            >
              삭제
            </Button>
          </Popconfirm>
          <Popconfirm
            title="회수하시겠습니까?"
            onConfirm={() => withdrawMutation.mutate(record.id)}
            okText="회수"
            cancelText="취소"
          >
            <Button
              type="link"
              size="small"
              disabled={record.status !== 'pending'}
            >
              회수
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  const formFields = [
    {
      name: 'certType',
      label: '인증서종류',
      type: 'select' as const,
      required: true,
      options: CERT_TYPE_OPTIONS,
    },
    {
      name: 'requestType',
      label: '신청구분',
      type: 'select' as const,
      required: true,
      options: REQUEST_TYPE_OPTIONS,
    },
    {
      name: 'purpose',
      label: '신청목적',
      type: 'textarea' as const,
      required: true,
      placeholder: '신청 목적을 입력하세요',
    },
    {
      name: 'reason',
      label: '사유',
      type: 'textarea' as const,
      required: true,
      placeholder: '사유를 입력하세요',
    },
    {
      name: 'militaryId',
      label: '군번',
      type: 'text' as const,
      required: true,
      disabled: true,
    },
    {
      name: 'email',
      label: '이메일',
      type: 'text' as const,
      required: true,
      placeholder: 'example@mil.kr',
    },
    {
      name: 'phone',
      label: '전화번호',
      type: 'text' as const,
      required: true,
      placeholder: '010-0000-0000',
    },
  ]

  const defaultInitialValues = {
    militaryId: 'M-20250001',
  }

  return (
    <PageContainer title="인증서 신청">
      <DataTable<CertApplication>
        rowKey="id"
        columns={columns}
        request={(params) => {
          queryClient.setQueryData(['sys04-certificates-params'], params)
          return fetchCertificates(params)
        }}
        headerTitle="인증서 신청 목록"
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleCreate}>
            신청서 작성
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '신청서 수정' : '신청서 작성'}
        open={modalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={formFields}
          onFinish={handleFinish}
          initialValues={editTarget ? {
            certType: editTarget.certType,
            requestType: editTarget.requestType,
            purpose: editTarget.purpose,
            reason: editTarget.reason,
            militaryId: editTarget.militaryId,
            email: editTarget.email,
            phone: editTarget.phone,
          } : defaultInitialValues}
          loading={createMutation.isPending || updateMutation.isPending}
          mode={editTarget ? 'edit' : 'create'}
        />
      </Modal>
    </PageContainer>
  )
}
