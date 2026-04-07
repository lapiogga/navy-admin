import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { Survey } from '@/shared/api/mocks/handlers/sys02'

// 검색 필드 정의
const searchFields: SearchField[] = [
  {
    name: 'keyword',
    label: '설문명',
    type: 'text',
    placeholder: '설문명 검색',
  },
  {
    name: 'period',
    label: '설문기간',
    type: 'dateRange',
  },
]

// 설문참여 목록 페이지 (SURV-01)
export default function SurveyParticipationPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'participation', searchParams],
    queryFn: () => apiClient.get<Survey[]>('/sys02/surveys/participation'),
  })

  const surveys = (data as Survey[] | undefined) || []

  // 검색 필터링 (클라이언트 사이드)
  const filteredSurveys = surveys.filter((s) => {
    if (searchParams.keyword && !s.surveyName.includes(searchParams.keyword as string)) {
      return false
    }
    return true
  })

  const columns: ProColumns<Survey & { isParticipated?: boolean; authorServiceNumber?: string; authorRank?: string }>[] = [
    {
      title: '설문명',
      dataIndex: 'surveyName',
      width: 250,
      render: (_, record) => (
        <a onClick={() => navigate(`/sys02/1/3/${record.id}`)}>{record.surveyName}</a>
      ),
    },
    {
      title: '등록자(군번/계급/성명)',
      dataIndex: 'authorName',
      width: 200,
      render: (_, record) => {
        const r = record as Survey & { authorServiceNumber?: string; authorRank?: string }
        const parts = [r.authorServiceNumber, r.authorRank, r.authorName].filter(Boolean)
        return parts.join(' / ')
      },
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      width: 120,
    },
    {
      title: '종료일',
      dataIndex: 'endDate',
      width: 120,
    },
    {
      title: '참여 여부',
      dataIndex: 'isParticipated',
      width: 100,
      render: (_, record) => {
        const participated = (record as Survey & { isParticipated?: boolean }).isParticipated
        return (
          <StatusBadge
            status={participated ? 'participated' : 'not_participated'}
            colorMap={{
              participated: 'green',
              not_participated: 'default',
            }}
            labelMap={{
              participated: '참여',
              not_participated: '미참여',
            }}
          />
        )
      },
    },
  ]

  // 검색 처리
  const handleSearch = (values: Record<string, unknown>) => {
    setSearchParams(values)
  }

  const handleSearchReset = () => {
    setSearchParams({})
  }

  return (
    <PageContainer title="설문참여">
      {/* 검색영역 */}
      <SearchForm
        fields={searchFields}
        onSearch={handleSearch}
        onReset={handleSearchReset}
      />

      <DataTable<Survey & { isParticipated?: boolean }>
        columns={columns}
        dataSource={filteredSurveys as (Survey & { isParticipated?: boolean })[]}
        loading={isLoading}
        rowKey="id"
      />
    </PageContainer>
  )
}
