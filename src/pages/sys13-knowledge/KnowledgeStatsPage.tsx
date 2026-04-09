import { useState } from 'react'
import { Tabs, Button, Select, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { Pie, Column } from '@ant-design/charts'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { DatePicker } from 'antd'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { militaryPersonColumn } from '@/shared/lib/military'
import type { ApiResult, PageResponse } from '@/shared/api/types'

const { RangePicker } = DatePicker

interface CategoryStat {
  category: string
  count: number
  ratio: number
}

interface UnitStat {
  unit: string
  count: number
  recommendCount: number
  avgRating: number
}

interface AuthorStat extends Record<string, unknown> {
  unit: string
  serviceNumber: string
  rank: string
  authorName: string
  count: number
  recommendCount: number
  rating: number
  viewCount: number
}

interface UnitListItem extends Record<string, unknown> {
  id: string
  title: string
  serviceNumber: string
  rank: string
  authorName: string
  authorUnit: string
  category: string
  createdAt: string
  viewCount: number
  recommendCount: number
}

const SORT_OPTIONS = [
  { label: '작성수순(인기순)', value: '작성수순' },
  { label: '추천순', value: '추천순' },
  { label: '평점순', value: '평점순' },
  { label: '조회순', value: '조회순' },
]

export default function KnowledgeStatsPage() {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [authorSortBy, setAuthorSortBy] = useState('작성수순')

  // 유형별 통계
  const { data: categoryStats } = useQuery({
    queryKey: ['sys13-stats-category'],
    queryFn: async () => {
      const res = await fetch('/api/sys13/stats/category')
      const json: ApiResult<CategoryStat[]> = await res.json()
      return json.data || []
    },
  })

  // 부대별 통계
  const { data: unitStats } = useQuery({
    queryKey: ['sys13-stats-unit'],
    queryFn: async () => {
      const res = await fetch('/api/sys13/stats/unit')
      const json: ApiResult<UnitStat[]> = await res.json()
      return json.data || []
    },
  })

  // 작성자별 통계 (기간 필터 + 정렬)
  const { data: authorStats, refetch: refetchAuthor } = useQuery({
    queryKey: ['sys13-stats-author', dateRange, authorSortBy],
    queryFn: async () => {
      const query = new URLSearchParams({ sortBy: authorSortBy })
      if (dateRange[0]) query.set('startDate', dateRange[0].format('YYYY-MM-DD'))
      if (dateRange[1]) query.set('endDate', dateRange[1].format('YYYY-MM-DD'))
      const res = await fetch(`/api/sys13/stats/author?${query}`)
      const json: ApiResult<AuthorStat[]> = await res.json()
      return json.data || []
    },
  })

  // Pie 차트 config
  const pieCfg = {
    data: categoryStats || [],
    angleField: 'count',
    colorField: 'category',
    radius: 0.8,
    innerRadius: 0.5,
    label: { type: 'spider' as const },
    height: 300,
  }

  // Column 차트 config
  const colCfg = {
    data: unitStats || [],
    xField: 'unit',
    yField: 'count',
    height: 300,
    label: { position: 'top' as const },
  }

  // 유형별 테이블 컬럼
  const categoryColumns: ProColumns<CategoryStat & Record<string, unknown>>[] = [
    { title: '유형', dataIndex: 'category', width: 150 },
    { title: '건수', dataIndex: 'count', width: 100, valueType: 'digit' },
    { title: '비율(%)', dataIndex: 'ratio', width: 100, render: (_, r) => `${r.ratio}%` },
  ]

  // 부대별 테이블 컬럼
  const unitColumns: ProColumns<UnitStat & Record<string, unknown>>[] = [
    { title: '부대명', dataIndex: 'unit', width: 150 },
    { title: '건수', dataIndex: 'count', width: 100, valueType: 'digit' },
    { title: '추천수', dataIndex: 'recommendCount', width: 100, valueType: 'digit' },
    { title: '평균평점', dataIndex: 'avgRating', width: 100 },
  ]

  // 작성자별 테이블 컬럼 (R6: 군번/계급/성명)
  const authorColumns: ProColumns<AuthorStat>[] = [
    { title: '부대명', dataIndex: 'unit', width: 150 },
    militaryPersonColumn<AuthorStat>('작성자', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'authorName',
    }),
    { title: '작성수', dataIndex: 'count', width: 100, valueType: 'digit' },
    { title: '추천수', dataIndex: 'recommendCount', width: 100, valueType: 'digit' },
    { title: '평점', dataIndex: 'rating', width: 100 },
    { title: '조회수', dataIndex: 'viewCount', width: 100, valueType: 'digit' },
  ]

  // 부대별 작성 목록 컬럼 (R6: 군번/계급/성명)
  const unitListColumns: ProColumns<UnitListItem>[] = [
    { title: '부대명', dataIndex: 'authorUnit', width: 120 },
    { title: '제목', dataIndex: 'title', width: 250, ellipsis: true },
    militaryPersonColumn<UnitListItem>('작성자', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'authorName',
    }),
    { title: '유형', dataIndex: 'category', width: 100 },
    { title: '등록일', dataIndex: 'createdAt', width: 120 },
    { title: '조회수', dataIndex: 'viewCount', width: 80, valueType: 'digit' },
    { title: '추천수', dataIndex: 'recommendCount', width: 80, valueType: 'digit' },
  ]

  const fetchUnitList = async (params: { page: number; size: number }): Promise<PageResponse<UnitListItem>> => {
    const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
    const res = await fetch(`/api/sys13/stats/unit-list?${query}`)
    const json: ApiResult<PageResponse<UnitListItem>> = await res.json()
    if (!json.success) throw new Error('부대별 작성 목록 조회 실패')
    return json.data
  }

  const handleExcelDownload = () => {
    void message.info('엑셀 다운로드 기능은 백엔드 연동 시 제공됩니다')
  }

  return (
    <PageContainer title="지식통계">
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: '유형별 작성 통계',
            children: (
              <div>
                <Pie {...pieCfg} />
                <div style={{ marginTop: 16 }}>
                  <DataTable<CategoryStat & Record<string, unknown>>
                    columns={categoryColumns}
                    dataSource={(categoryStats || []) as Array<CategoryStat & Record<string, unknown>>}
                    rowKey="category"
                  />
                </div>
              </div>
            ),
          },
          {
            key: '2',
            label: '부대별 작성 통계',
            children: (
              <div>
                <Column {...colCfg} />
                <div style={{ marginTop: 16 }}>
                  <DataTable<UnitStat & Record<string, unknown>>
                    columns={unitColumns}
                    dataSource={(unitStats || []) as Array<UnitStat & Record<string, unknown>>}
                    rowKey="unit"
                  />
                </div>
              </div>
            ),
          },
          {
            key: '3',
            label: '작성자별 통계',
            children: (
              <div>
                {/* 기간 필터 + 정렬 */}
                <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <RangePicker
                    value={dateRange}
                    onChange={(range) => {
                      setDateRange(range ? [range[0], range[1]] : [null, null])
                    }}
                    placeholder={['시작일', '종료일']}
                    format="YYYY-MM-DD"
                    presets={[
                      { label: '최근 1개월', value: [dayjs().subtract(1, 'month'), dayjs()] },
                      { label: '최근 3개월', value: [dayjs().subtract(3, 'month'), dayjs()] },
                      { label: '최근 6개월', value: [dayjs().subtract(6, 'month'), dayjs()] },
                    ]}
                  />
                  <Select
                    style={{ width: 160 }}
                    value={authorSortBy}
                    onChange={setAuthorSortBy}
                    options={SORT_OPTIONS}
                    placeholder="정렬 기준"
                  />
                  <Button type="primary" onClick={() => void refetchAuthor()}>
                    조회
                  </Button>
                  <Button onClick={handleExcelDownload}>엑셀 다운로드</Button>
                </div>

                <DataTable<AuthorStat>
                  columns={authorColumns}
                  dataSource={authorStats || []}
                  rowKey="authorName"
                />
              </div>
            ),
          },
          {
            key: '4',
            label: '부대별 작성 목록',
            children: (
              <div>
                <div style={{ marginBottom: 12, textAlign: 'right' }}>
                  <Button onClick={handleExcelDownload}>엑셀 다운로드</Button>
                </div>
                <DataTable<UnitListItem>
                  columns={unitListColumns}
                  request={fetchUnitList}
                  rowKey="id"
                />
              </div>
            ),
          },
        ]}
      />
    </PageContainer>
  )
}
