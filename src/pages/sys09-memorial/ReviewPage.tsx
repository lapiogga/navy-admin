import { useState } from 'react'
import { Modal, Button, message, Select } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { CombatReview } from '@/shared/api/mocks/handlers/sys09'

async function fetchReviews(params: PageRequest & Record<string, unknown>): Promise<PageResponse<CombatReview>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<CombatReview>>>(
    '/sys09/reviews',
    { params: { page: params.page, size: params.size, ...params } },
  )
  const data = (res as ApiResult<PageResponse<CombatReview>>).data ?? (res as unknown as PageResponse<CombatReview>)
  return data
}

const RESULT_COLOR_MAP: Record<string, string> = {
  eligible: 'green',
  ineligible: 'red',
}
const RESULT_LABEL_MAP: Record<string, string> = {
  eligible: '해당',
  ineligible: '비해당',
}

const RANK_OPTIONS = [
  '이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사',
  '소위', '중위', '대위', '소령', '중령', '대령',
].map((r) => ({ label: r, value: r }))

const UNIT_OPTIONS = ['1사단', '2사단', '해병대사령부', '교육훈련단', '상륙기동단'].map((u) => ({ label: u, value: u }))

const INCIDENT_TYPE_OPTIONS = [
  { label: '전사', value: '전사' },
  { label: '순직', value: '순직' },
  { label: '전상', value: '전상' },
  { label: '공상', value: '공상' },
]

const RESULT_OPTIONS = [
  { label: '해당', value: 'eligible' },
  { label: '비해당', value: 'ineligible' },
]

const MILITARY_TYPE_OPTIONS = [
  { label: '해병', value: '해병' },
  { label: '해군', value: '해군' },
  { label: '육군', value: '육군' },
  { label: '공군', value: '공군' },
]

type FormValues = {
  reviewRound: string
  reviewDate: string
  name: string
  serviceNumber: string
  birthDate: string
  enlistDate: string
  rank: string
  unit: string
  incidentType: string
  incidentDate: string
  incidentCause: string
  result: string
  resultDetail: string
  remarks: string
}

export default function ReviewPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CombatReview | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiClient.post('/sys09/reviews', values)
    },
    onSuccess: () => {
      message.success('심사 정보가 등록되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys09/reviews'] })
    },
    onError: () => {
      message.error('등록 중 오류가 발생했습니다')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      return apiClient.put(`/sys09/reviews/${id}`, values)
    },
    onSuccess: () => {
      message.success('심사 정보가 수정되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['sys09/reviews'] })
    },
    onError: () => {
      message.error('수정 중 오류가 발생했습니다')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys09/reviews/${id}`)
    },
    onSuccess: () => {
      message.success('심사 정보가 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys09/reviews'] })
    },
    onError: () => {
      message.error('삭제 중 오류가 발생했습니다')
    },
  })

  const columns: ProColumns<CombatReview>[] = [
    {
      title: '심사차수',
      dataIndex: 'reviewRound',
      width: 80,
      sorter: true,
    },
    {
      title: '심사일자',
      dataIndex: 'reviewDate',
      width: 120,
      sorter: true,
    },
    {
      title: '성명',
      dataIndex: 'name',
      width: 100,
      sorter: true,
      render: (_, record) => (
        <a
          onClick={() => {
            setEditTarget(record)
            setModalOpen(true)
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '군번',
      dataIndex: 'serviceNumber',
      width: 120,
      sorter: true,
    },
    {
      title: '계급',
      dataIndex: 'rank',
      width: 80,
      sorter: true,
    },
    {
      title: '소속',
      dataIndex: 'unit',
      width: 150,
      sorter: true,
    },
    {
      title: '심사결과',
      dataIndex: 'result',
      width: 100,
      sorter: true,
      render: (_, record) => (
        <StatusBadge
          status={record.result}
          colorMap={RESULT_COLOR_MAP}
          labelMap={RESULT_LABEL_MAP}
        />
      ),
    },
    {
      title: '작업',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setEditTarget(record)
            setModalOpen(true)
          }}
        >
          수정
        </a>,
        <a
          key="delete"
          style={{ color: 'red', marginLeft: 8 }}
          onClick={() => deleteMutation.mutate(record.id)}
        >
          삭제
        </a>,
      ],
    },
  ]

  const formFields = [
    { name: 'reviewRound', label: '심사차수', type: 'text' as const, required: true, placeholder: '예: 제1차' },
    { name: 'reviewDate', label: '심사일자', type: 'date' as const, required: true },
    { name: 'name', label: '성명', type: 'text' as const, required: true },
    { name: 'serviceNumber', label: '군번', type: 'text' as const, required: true },
    { name: 'birthDate', label: '주민번호(생년월일)', type: 'text' as const, required: true },
    { name: 'enlistDate', label: '입대일자', type: 'date' as const, required: true },
    { name: 'rank', label: '계급', type: 'select' as const, required: true, options: RANK_OPTIONS },
    { name: 'unit', label: '소속', type: 'select' as const, required: true, options: UNIT_OPTIONS },
    { name: 'incidentType', label: '사고유형', type: 'select' as const, required: true, options: INCIDENT_TYPE_OPTIONS },
    { name: 'incidentDate', label: '사고일자', type: 'date' as const, required: true },
    { name: 'incidentCause', label: '사고원인', type: 'textarea' as const, required: true },
    { name: 'result', label: '심사결과', type: 'select' as const, required: true, options: RESULT_OPTIONS },
    { name: 'resultDetail', label: '결과 상세', type: 'textarea' as const },
    { name: 'remarks', label: '비고', type: 'textarea' as const },
  ]

  const handleSubmit = (values: FormValues) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, values })
    } else {
      createMutation.mutate(values)
    }
  }

  return (
    <PageContainer title="전공사상심사 관리">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Select
          placeholder="군구분"
          allowClear
          style={{ width: 120 }}
          options={MILITARY_TYPE_OPTIONS}
          onChange={(val) => setSearchParams((prev) => ({ ...prev, militaryType: val }))}
        />
        <Select
          placeholder="계급"
          allowClear
          style={{ width: 120 }}
          options={RANK_OPTIONS}
          onChange={(val) => setSearchParams((prev) => ({ ...prev, rank: val }))}
        />
        <Select
          placeholder="소속"
          allowClear
          style={{ width: 160 }}
          options={UNIT_OPTIONS}
          onChange={(val) => setSearchParams((prev) => ({ ...prev, unit: val }))}
        />
      </div>
      <DataTable<CombatReview>
        queryKey="sys09/reviews"
        requestFn={(params) => fetchReviews({ ...params, ...searchParams })}
        columns={columns}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setEditTarget(null)
              setModalOpen(true)
            }}
          >
            신규 등록
          </Button>,
          <Button key="excel" onClick={() => message.info('엑셀 다운로드')}>
            엑셀 다운로드
          </Button>,
        ]}
      />
      <Modal
        title={editTarget ? '심사 정보 수정' : '심사 정보 등록'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        width={600}
      >
        <CrudForm
          fields={formFields}
          initialValues={editTarget || {}}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false)
            setEditTarget(null)
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </PageContainer>
  )
}
