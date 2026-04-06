import { useState } from 'react'
import { Modal, Button, message, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface UnitMgmt extends Record<string, unknown> {
  id: string
  unitCode: string
  unitName: string
  parentUnit?: string
  unitType: string
  sortOrder: number
}

const UNIT_TYPE_OPTIONS = [
  { label: '사단', value: '사단' },
  { label: '단', value: '단' },
  { label: '대대', value: '대대' },
  { label: '중대', value: '중대' },
]

const PARENT_UNIT_OPTIONS = [
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
  { label: '교육훈련단', value: '교육훈련단' },
]

// Mock fetch (sys17/units는 트리 구조이므로 별도 목록 fetch 구현)
const MOCK_UNITS: UnitMgmt[] = [
  { id: 'u1', unitCode: 'HQ', unitName: '해병대사령부', unitType: '사령부', sortOrder: 1 },
  { id: 'u2', unitCode: 'DIV1', unitName: '1사단', parentUnit: '해병대사령부', unitType: '사단', sortOrder: 2 },
  { id: 'u3', unitCode: 'DIV2', unitName: '2사단', parentUnit: '해병대사령부', unitType: '사단', sortOrder: 3 },
  { id: 'u4', unitCode: 'EDU', unitName: '교육훈련단', parentUnit: '해병대사령부', unitType: '단', sortOrder: 4 },
  { id: 'u5', unitCode: 'AMPH', unitName: '상륙기동단', parentUnit: '해병대사령부', unitType: '단', sortOrder: 5 },
]

async function fetchUnits(params: PageRequest): Promise<PageResponse<UnitMgmt>> {
  const start = params.page * params.size
  const content = MOCK_UNITS.slice(start, start + params.size)
  return {
    content,
    totalElements: MOCK_UNITS.length,
    totalPages: Math.ceil(MOCK_UNITS.length / params.size),
    size: params.size,
    number: params.page,
  }
}

type FormValues = {
  unitCode: string
  unitName: string
  parentUnit?: string
  unitType: string
  sortOrder: number
}

export default function InspectionUnitMgmtPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UnitMgmt | null>(null)

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiClient.post('/sys17/units', values)
    },
    onSuccess: () => {
      message.success('부대가 등록되었습니다.')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'unit-mgmt'] })
    },
    onError: () => {
      message.error('등록에 실패했습니다.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      return apiClient.put(`/sys17/units/${id}`, values)
    },
    onSuccess: () => {
      message.success('부대 정보가 수정되었습니다.')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'unit-mgmt'] })
    },
    onError: () => {
      message.error('수정에 실패했습니다.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys17/units/${id}`)
    },
    onSuccess: () => {
      message.success('부대가 삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys17', 'unit-mgmt'] })
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

  const columns: ProColumns<UnitMgmt>[] = [
    {
      title: '부대코드',
      dataIndex: 'unitCode',
      width: 100,
    },
    {
      title: '부대명',
      dataIndex: 'unitName',
      width: 150,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setEditTarget(record)
            setModalOpen(true)
          }}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '상위부대',
      dataIndex: 'parentUnit',
      width: 150,
    },
    {
      title: '부대유형',
      dataIndex: 'unitType',
      width: 100,
    },
    {
      title: '정렬순서',
      dataIndex: 'sortOrder',
      width: 80,
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

  const formFields = [
    {
      name: 'unitCode',
      label: '부대코드',
      type: 'text' as const,
      rules: [{ required: true, message: '부대코드를 입력하세요' }],
    },
    {
      name: 'unitName',
      label: '부대명',
      type: 'text' as const,
      rules: [{ required: true, message: '부대명을 입력하세요' }],
    },
    {
      name: 'parentUnit',
      label: '상위부대',
      render: () => <Select options={PARENT_UNIT_OPTIONS} placeholder="상위부대 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'unitType',
      label: '부대유형',
      rules: [{ required: true, message: '부대유형을 선택하세요' }],
      render: () => <Select options={UNIT_TYPE_OPTIONS} placeholder="유형 선택" style={{ width: '100%' }} />,
    },
    {
      name: 'sortOrder',
      label: '정렬순서',
      type: 'number' as const,
    },
  ]

  return (
    <PageContainer title="부대관리">
      <DataTable<UnitMgmt>
        queryKey={['sys17', 'unit-mgmt']}
        requestFn={fetchUnits}
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
            부대 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '부대 수정' : '부대 등록'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        footer={null}
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
