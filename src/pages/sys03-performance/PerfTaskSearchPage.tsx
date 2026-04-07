import { useState, useRef } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse, PageRequest } from '@/shared/api/types'
import type { DetailTask } from '@/shared/api/mocks/handlers/sys03-performance'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'

const YEARS = ['2022', '2023', '2024', '2025', '2026']

/** 검색 필드 정의 */
const searchFields: SearchField[] = [
  { name: 'keyword', label: '과제명', type: 'text', placeholder: '과제명을 입력하세요' },
  { name: 'year', label: '기준년도', type: 'select', options: YEARS.map((y) => ({ label: y, value: y })) },
]

async function searchTasks(params: PageRequest & { keyword?: string; year?: string }): Promise<PageResponse<DetailTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<DetailTask>>>('/sys03/task-search', {
    params: {
      current: params.page + 1,
      pageSize: params.size,
      keyword: params.keyword,
      year: params.year,
    },
  })
  return (res as ApiResult<PageResponse<DetailTask>>).data ?? (res as unknown as PageResponse<DetailTask>)
}

export default function PerfTaskSearchPage() {
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const actionRef = useRef<ActionType>()

  const columns: ProColumns<DetailTask>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '상세과제명', dataIndex: 'title' },
    { title: '소과제', dataIndex: 'subTaskTitle' },
    { title: '부대(서)', dataIndex: 'deptName', width: 120 },
    militaryPersonColumn<DetailTask>('담당자', { serviceNumber: 'managerServiceNumber', rank: 'managerRank', name: 'manager' }),
    { title: '가중치(%)', dataIndex: 'weight', width: 100 },
  ]

  return (
    <PageContainer title="과제검색">
      <SearchForm fields={searchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<DetailTask>
        rowKey="id"
        columns={columns}
        headerTitle="과제 검색 결과"
        actionRef={actionRef}
        request={(params) => searchTasks({ ...params, ...searchParams } as PageRequest & { keyword?: string; year?: string })}
      />
    </PageContainer>
  )
}
