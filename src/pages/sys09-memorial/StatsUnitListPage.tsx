import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Table, Button, message } from 'antd'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { Deceased } from '@/shared/api/mocks/handlers/sys09'

const DEATH_TYPE_LABEL: Record<string, string> = {
  combat: '전사',
  duty: '순직',
  disease: '병사',
  accident: '사고사',
}

const UNIT_OPTIONS = ['1사단', '2사단', '해병대사령부', '교육훈련단', '상륙기동단'].map((u) => ({ label: u, value: u }))
const RANK_OPTIONS = [
  '이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사',
  '소위', '중위', '대위', '소령', '중령', '대령',
].map((r) => ({ label: r, value: r }))

// 부대별/계급별 필터
const searchFields: SearchField[] = [
  { name: 'unit', label: '부대', type: 'select', options: UNIT_OPTIONS },
  { name: 'rank', label: '계급', type: 'select', options: RANK_OPTIONS },
]

async function fetchUnitList(filters?: Record<string, unknown>): Promise<Deceased[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Deceased>>>('/sys09/stats/unit-list', {
    params: { page: 0, size: 100, ...filters },
  })
  const data = (res as ApiResult<PageResponse<Deceased>>).data ?? (res as unknown as PageResponse<Deceased>)
  return data.content || []
}

const columns = [
  { title: '연번', key: 'index', render: (_: unknown, __: Deceased, i: number) => i + 1 },
  { title: '부대명', dataIndex: 'unit', key: 'unit' },
  { title: '군번', dataIndex: 'serviceNumber', key: 'serviceNumber' },
  { title: '성명', dataIndex: 'name', key: 'name' },
  { title: '계급', dataIndex: 'rank', key: 'rank' },
  {
    title: '사망구분',
    dataIndex: 'deathType',
    key: 'deathType',
    render: (v: string) => DEATH_TYPE_LABEL[v] || v,
  },
  { title: '사망일자', dataIndex: 'deathDate', key: 'deathDate' },
]

export default function StatsUnitListPage() {
  const [filters, setFilters] = useState<Record<string, unknown>>({})

  const { data = [] } = useQuery({
    queryKey: ['sys09/stats/unit-list', filters],
    queryFn: () => fetchUnitList(filters),
  })

  const handleSearch = useCallback((values: Record<string, unknown>) => {
    setFilters(values)
  }, [])

  const handleReset = useCallback(() => {
    setFilters({})
  }, [])

  return (
    <PageContainer title="부대별 사망자 명부">
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button onClick={() => message.info('엑셀 다운로드')}>엑셀 다운로드</Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />
    </PageContainer>
  )
}
