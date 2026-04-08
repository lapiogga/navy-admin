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
import type { Injured } from '@/shared/api/mocks/handlers/sys09'

async function fetchInjured(params: PageRequest & Record<string, unknown>): Promise<PageResponse<Injured>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Injured>>>(
    '/sys09/injured',
    { params: { page: params.page, size: params.size, ...params } },
  )
  const data = (res as ApiResult<PageResponse<Injured>>).data ?? (res as unknown as PageResponse<Injured>)
  return data
}

const INJURY_TYPE_COLOR_MAP: Record<string, string> = {
  combat: 'red',
  duty: 'orange',
}
const INJURY_TYPE_LABEL_MAP: Record<string, string> = {
  combat: '전상',
  duty: '공상',
}

const MILITARY_TYPE_OPTIONS = [
  { label: '해병', value: '해병' },
  { label: '해군', value: '해군' },
  { label: '육군', value: '육군' },
  { label: '공군', value: '공군' },
]

const RANK_OPTIONS = [
  '이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사',
  '소위', '중위', '대위', '소령', '중령', '대령',
].map((r) => ({ label: r, value: r }))

const UNIT_OPTIONS = ['1사단', '2사단', '해병대사령부', '교육훈련단', '상륙기동단'].map((u) => ({ label: u, value: u }))

const INJURY_TYPE_OPTIONS = [
  { label: '전상', value: 'combat' },
  { label: '공상', value: 'duty' },
]

const INJURY_GRADE_OPTIONS = ['1급', '2급', '3급', '4급', '5급', '6급', '7급'].map((g) => ({ label: g, value: g }))

const VETERANS_OFFICE_OPTIONS = [
  '서울보훈청', '부산보훈청', '대전보훈청', '광주보훈청', '인천보훈청',
].map((v) => ({ label: v, value: v }))

const COMBAT_INJURY_OPTIONS = [
  { label: '해당(Y)', value: 'Y' },
  { label: '비해당(N)', value: 'N' },
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
  serviceNumber: string
  name: string
  residentNumber: string
  rank: string
  unit: string
  enlistDate: string
  phone: string
  address: string
  injuryType: string
  injuryGrade: string
  injuryDate: string
  injuryPlace: string
  injuryCause: string
  hospitalName: string
  veteransOfficeName: string
  diseaseName: string
  combatInjuryYn: string
  remarks: string
  militaryType: string
}

export default function InjuredPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Injured | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiClient.post('/sys09/injured', values)
    },
    onSuccess: () => {
      message.success('상이자 정보가 등록되었습니다')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys09/injured'] })
    },
    onError: () => {
      message.error('등록 중 오류가 발생했습니다')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      return apiClient.put(`/sys09/injured/${id}`, values)
    },
    onSuccess: () => {
      message.success('상이자 정보가 수정되었습니다')
      setModalOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['sys09/injured'] })
    },
    onError: () => {
      message.error('수정 중 오류가 발생했습니다')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys09/injured/${id}`)
    },
    onSuccess: () => {
      message.success('상이자 정보가 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys09/injured'] })
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

  const columns: ProColumns<Injured>[] = [
    // R6: 군번/계급/성명 동시 표시
    {
      ...militaryPersonColumn<Injured>('상이자', {
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
      title: '상이구분',
      dataIndex: 'injuryType',
      width: 100,
      sorter: true,
      render: (_, record) => (
        <StatusBadge
          status={record.injuryType}
          colorMap={INJURY_TYPE_COLOR_MAP}
          labelMap={INJURY_TYPE_LABEL_MAP}
        />
      ),
    },
    {
      title: '상이등급',
      dataIndex: 'injuryGrade',
      width: 80,
      sorter: true,
    },
    {
      title: '병명',
      dataIndex: 'diseaseName',
      width: 150,
      sorter: true,
    },
    {
      title: '전공상 여부',
      dataIndex: 'combatInjuryYn',
      width: 90,
      sorter: true,
    },
    {
      title: '상이일자',
      dataIndex: 'injuryDate',
      width: 120,
      sorter: true,
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

  // CSV 입력값: 군번, 성명, 주민등록번호, 계급, 소속, 입대일자, 전화번호, 현주소, 보훈청명, 병명, 전공상 여부
  const formFields = [
    { name: 'militaryType', label: '군구분', type: 'select' as const, options: MILITARY_TYPE_OPTIONS },
    { name: 'serviceNumber', label: '군번', type: 'text' as const, required: true },
    { name: 'name', label: '성명', type: 'text' as const, required: true },
    { name: 'residentNumber', label: '주민등록번호', type: 'text' as const, required: true, placeholder: '앞6-*******' },
    { name: 'rank', label: '계급', type: 'select' as const, required: true, options: RANK_OPTIONS },
    { name: 'unit', label: '소속', type: 'select' as const, required: true, options: UNIT_OPTIONS },
    { name: 'enlistDate', label: '입대일자', type: 'date' as const, required: true },
    { name: 'phone', label: '전화번호', type: 'text' as const },
    { name: 'address', label: '현주소', type: 'text' as const },
    { name: 'injuryType', label: '상이구분', type: 'select' as const, required: true, options: INJURY_TYPE_OPTIONS },
    { name: 'injuryGrade', label: '상이등급', type: 'select' as const, required: true, options: INJURY_GRADE_OPTIONS },
    { name: 'injuryDate', label: '상이일자', type: 'date' as const, required: true },
    { name: 'injuryPlace', label: '상이장소', type: 'text' as const },
    { name: 'injuryCause', label: '상이원인', type: 'textarea' as const },
    { name: 'hospitalName', label: '치료병원', type: 'text' as const },
    { name: 'veteransOfficeName', label: '보훈청명', type: 'select' as const, options: VETERANS_OFFICE_OPTIONS },
    { name: 'diseaseName', label: '병명', type: 'text' as const },
    { name: 'combatInjuryYn', label: '전공상 여부', type: 'select' as const, options: COMBAT_INJURY_OPTIONS },
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
    <PageContainer title="상이자 관리">
      {/* R2: CSV 검색조건 반영 SearchForm */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleSearchReset} />
      <DataTable<Injured>
        key={JSON.stringify(searchParams)}
        request={(params) => fetchInjured({ ...params, ...searchParams })}
        columns={columns}
        rowKey="id"
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
        title={editTarget ? '상이자 정보 수정' : '상이자 정보 등록'}
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
