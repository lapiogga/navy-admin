import { useState } from 'react'
import { Modal, Button, message, Select, DatePicker, Upload } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { InspectionPlan } from '@/shared/api/mocks/handlers/sys17'

const { RangePicker } = DatePicker

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const year = (2020 + i).toString()
  return { label: year, value: year }
})

const UNIT_OPTIONS = [
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '교육훈련단', value: '교육훈련단' },
  { label: '상륙기동단', value: '상륙기동단' },
]

async function fetchPlans(params: PageRequest & Record<string, unknown>): Promise<PageResponse<InspectionPlan>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InspectionPlan>>>('/sys17/plans', {
    params: { page: params.page, size: params.size, ...params },
  })
  const data = (res as ApiResult<PageResponse<InspectionPlan>>).data ?? (res as unknown as PageResponse<InspectionPlan>)
  return data
}

type SearchParams = {
  inspYear?: string
  planName?: string
  targetUnit?: string
}

type FormValues = {
  inspYear: string
  planName: string
  startDate: string
  endDate: string
  targetUnit: string
  remarks?: string
}

export default function InspectionPlanPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<InspectionPlan | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({})

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiClient.post('/sys17/plans', values)
    },
    onSuccess: () => {
      message.success('검열계획이 등록되었습니다.')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'plans'] })
    },
    onError: () => {
      message.error('등록에 실패했습니다.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      return apiClient.put(`/sys17/plans/${id}`, values)
    },
    onSuccess: () => {
      message.success('검열계획이 수정되었습니다.')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'plans'] })
    },
    onError: () => {
      message.error('수정에 실패했습니다.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys17/plans/${id}`)
    },
    onSuccess: () => {
      message.success('검열계획이 삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys17', 'plans'] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다.')
    },
  })

  const handleSubmit = (values: FormValues) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns: ProColumns<InspectionPlan>[] = [
    {
      title: '검열계획명',
      dataIndex: 'planName',
      width: 250,
      render: (text, record) => (
        <a onClick={() => { setEditTarget(record); setModalOpen(true) }}>{text}</a>
      ),
    },
    {
      title: '검열연도',
      dataIndex: 'inspYear',
      width: 80,
      sorter: true,
    },
    {
      title: '대상부대',
      dataIndex: 'targetUnit',
      width: 150,
      sorter: true,
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      width: 120,
      sorter: true,
    },
    {
      title: '종료일',
      dataIndex: 'endDate',
      width: 120,
      sorter: true,
    },
    {
      title: '과제 수',
      dataIndex: 'taskCount',
      width: 80,
      sorter: true,
      valueType: 'digit',
    },
    {
      title: '첨부',
      dataIndex: 'fileCount',
      width: 60,
      valueType: 'digit',
    },
    {
      title: '관리',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          onClick={() => deleteMutation.mutate(record.id)}
        >
          삭제
        </Button>
      ),
    },
  ]

  const searchFields = [
    {
      name: 'inspYear',
      label: '검열연도',
      render: () => <Select options={YEAR_OPTIONS} placeholder="연도 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'planName',
      label: '검열계획명',
      type: 'text' as const,
    },
    {
      name: 'targetUnit',
      label: '대상부대',
      render: () => <Select options={UNIT_OPTIONS} placeholder="부대 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'inspPeriod',
      label: '검열기간',
      render: () => <RangePicker style={{ width: '100%' }} />,
    },
  ]

  const formFields = [
    {
      name: 'inspYear',
      label: '검열연도',
      rules: [{ required: true, message: '검열연도를 선택하세요' }],
      render: () => <Select options={YEAR_OPTIONS} placeholder="연도 선택" style={{ width: '100%' }} />,
    },
    {
      name: 'planName',
      label: '검열계획명',
      type: 'text' as const,
      rules: [{ required: true, message: '검열계획명을 입력하세요' }, { max: 200, message: '200자 이내로 입력하세요' }],
    },
    {
      name: 'startDate',
      label: '시작일',
      type: 'date' as const,
      rules: [{ required: true, message: '시작일을 선택하세요' }],
    },
    {
      name: 'endDate',
      label: '종료일',
      type: 'date' as const,
      rules: [{ required: true, message: '종료일을 선택하세요' }],
    },
    {
      name: 'targetUnit',
      label: '대상부대',
      rules: [{ required: true, message: '대상부대를 선택하세요' }],
      render: () => (
        <Select
          options={UNIT_OPTIONS}
          placeholder="부대 선택"
          mode="multiple"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      name: 'remarks',
      label: '비고',
      type: 'textarea' as const,
    },
    {
      name: 'attachments',
      label: '첨부파일',
      render: () => (
        <Upload>
          <Button icon={<UploadOutlined />}>파일 선택</Button>
        </Upload>
      ),
    },
  ]

  return (
    <PageContainer title="검열계획">
      <SearchForm
        fields={searchFields}
        onSearch={(values) => setSearchParams(values as SearchParams)}
        onReset={() => setSearchParams({})}
      />
      <DataTable<InspectionPlan>
        request={(params) => fetchPlans({ ...params, ...searchParams })}
        columns={columns}
        rowKey="id"
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditTarget(null)
              setModalOpen(true)
            }}
          >
            검열계획 작성
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '검열계획 수정' : '검열계획 작성'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <CrudForm
          fields={formFields}
          initialValues={editTarget || {}}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false)
            setEditTarget(null)
          }}
          submitText={editTarget ? '수정' : '등록'}
        />
      </Modal>
    </PageContainer>
  )
}
