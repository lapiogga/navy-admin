import { useState, useCallback } from 'react'
import { Modal, Button, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
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

const COMBAT_CATEGORY_OPTIONS = [
  { label: '전투상이', value: '전투상이' },
  { label: '공무상이', value: '공무상이' },
  { label: '교육훈련상이', value: '교육훈련상이' },
  { label: '직무수행상이', value: '직무수행상이' },
]

// CSV 검색조건: 군구분, 군번, 성명, 주민번호(생년월일), 계급, 소속
const searchFields: SearchField[] = [
  { name: 'militaryType', label: '군구분', type: 'select', options: MILITARY_TYPE_OPTIONS },
  { name: 'serviceNumber', label: '군번', type: 'text', placeholder: '군번 입력' },
  { name: 'name', label: '성명', type: 'text', placeholder: '성명 입력' },
  { name: 'residentNumber', label: '주민번호', type: 'text', placeholder: '생년월일 6자리' },
  { name: 'rank', label: '계급', type: 'select', options: RANK_OPTIONS },
  { name: 'unit', label: '소속', type: 'select', options: UNIT_OPTIONS },
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
  diseaseName: string
  incidentType: string
  incidentDate: string
  incidentCause: string
  combatCategory: string
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

  // 검색 처리
  const handleSearch = useCallback((values: Record<string, unknown>) => {
    setSearchParams(values)
  }, [])

  const handleSearchReset = useCallback(() => {
    setSearchParams({})
  }, [])

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
    // R6: 군번/계급/성명 동시 표시
    {
      ...militaryPersonColumn<CombatReview>('대상자', {
        serviceNumber: 'serviceNumber',
        rank: 'rank',
        name: 'name',
      }),
      render: (_, record) => (
        <a
          onClick={() => {
            setEditTarget(record)
            setModalOpen(true)
          }}
        >
          {`${record.serviceNumber} / ${record.rank} / ${record.name}`}
        </a>
      ),
    },
    {
      title: '소속',
      dataIndex: 'unit',
      width: 150,
      sorter: true,
    },
    {
      title: '병명',
      dataIndex: 'diseaseName',
      width: 150,
      sorter: true,
    },
    {
      title: '전공상 분류',
      dataIndex: 'combatCategory',
      width: 120,
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

  // CSV 입력값: 심사차수, 심사일자, 성명, 군번, 주민번호, 입대일자, 소속, 병명, 소속부대 심사결과, 전공상 분류
  const formFields = [
    { name: 'reviewRound', label: '심사차수', type: 'text' as const, required: true, placeholder: '예: 제1차' },
    { name: 'reviewDate', label: '심사일자', type: 'date' as const, required: true },
    { name: 'name', label: '성명', type: 'text' as const, required: true },
    { name: 'serviceNumber', label: '군번', type: 'text' as const, required: true },
    { name: 'birthDate', label: '주민번호(생년월일)', type: 'text' as const, required: true },
    { name: 'enlistDate', label: '입대일자', type: 'date' as const, required: true },
    { name: 'rank', label: '계급', type: 'select' as const, required: true, options: RANK_OPTIONS },
    { name: 'unit', label: '소속', type: 'select' as const, required: true, options: UNIT_OPTIONS },
    { name: 'diseaseName', label: '병명', type: 'text' as const },
    { name: 'incidentType', label: '사고유형', type: 'select' as const, required: true, options: INCIDENT_TYPE_OPTIONS },
    { name: 'incidentDate', label: '사고일자', type: 'date' as const, required: true },
    { name: 'incidentCause', label: '사고원인', type: 'textarea' as const, required: true },
    { name: 'combatCategory', label: '전공상 분류', type: 'select' as const, options: COMBAT_CATEGORY_OPTIONS },
    { name: 'result', label: '소속부대 심사결과', type: 'select' as const, required: true, options: RESULT_OPTIONS },
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
      {/* R2: CSV 검색조건 반영 SearchForm */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleSearchReset} />
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
