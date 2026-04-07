import { useState } from 'react'
import { Select, Tabs } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitAuthView } from '@/shared/api/mocks/handlers/sys08-unit-lineage'

const UNIT_OPTIONS = [
  { label: '전체', value: '' },
  { label: '해군사령부', value: '해군사령부' },
  { label: '제1함대', value: '제1함대' },
  { label: '제2함대', value: '제2함대' },
  { label: '제3함대', value: '제3함대' },
  { label: '기뢰전전대', value: '기뢰전전대' },
  { label: '잠수함전대', value: '잠수함전대' },
  { label: '항공전대', value: '항공전대' },
  { label: '해병대사령부', value: '해병대사령부' },
]

// 검색 필드 정의 (R2 규칙)
const searchFields: SearchField[] = [
  { name: 'keyword', label: '검색어', type: 'text', placeholder: '성명/역할 검색' },
  {
    name: 'unit', label: '부대(서)', type: 'select',
    options: UNIT_OPTIONS.filter((o) => o.value !== ''),
  },
]

async function fetchAuthViews(params: PageRequest & { unit?: string; keyword?: string }): Promise<PageResponse<UnitAuthView>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitAuthView>>>('/sys08/auth-view', { params })
  return (res as ApiResult<PageResponse<UnitAuthView>>).data ?? (res as unknown as PageResponse<UnitAuthView>)
}

export default function UnitAuthViewPage() {
  const [selectedUnit, setSelectedUnit] = useState('')
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const columns: ProColumns<UnitAuthView>[] = [
    { title: '성명', dataIndex: 'userName', width: 120 },
    { title: '계급', dataIndex: 'rank', width: 100 },
    { title: '부대(서)', dataIndex: 'unit', width: 150 },
    { title: '역할', dataIndex: 'role', width: 130 },
    { title: '부여일', dataIndex: 'assignedAt', width: 120 },
    { title: '부여자', dataIndex: 'assignedBy', width: 120 },
  ]

  const handleSearch = (values: Record<string, unknown>) => {
    setSearchParams(values)
  }

  const handleSearchReset = () => {
    setSearchParams({})
  }

  const MyAuthTable = () => (
    <DataTable<UnitAuthView>
      columns={columns}
      request={(params) => fetchAuthViews({ ...params, unit: undefined, ...searchParams })}
      rowKey="id"
      headerTitle="내 권한"
    />
  )

  const UnitAuthTable = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Select
          options={UNIT_OPTIONS}
          value={selectedUnit}
          onChange={setSelectedUnit}
          style={{ width: 200 }}
          placeholder="부대(서) 선택"
        />
      </div>
      <DataTable<UnitAuthView>
        columns={columns}
        request={(params) => fetchAuthViews({ ...params, unit: selectedUnit || undefined, ...searchParams })}
        rowKey="id"
        headerTitle="부대별 권한"
      />
    </div>
  )

  const tabItems = [
    {
      key: '1',
      label: '내 권한',
      children: <MyAuthTable />,
    },
    {
      key: '2',
      label: '부대별 권한',
      children: <UnitAuthTable />,
    },
  ]

  return (
    <PageContainer title="권한조회">
      {/* 검색영역 (R2 규칙) */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleSearchReset} />

      <Tabs items={tabItems} />
    </PageContainer>
  )
}
