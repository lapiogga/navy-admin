import { useState } from 'react'
import { Button, Modal } from 'antd'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { Survey, SurveyStatus } from '@/shared/api/mocks/handlers/sys02'
import SurveyResultPage from './SurveyResultPage'

// 상태 표시 설정 (closed 상태만 표시)
const STATUS_COLOR_MAP: Record<string, string> = {
  closed: 'gray',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  closed: '마감',
}

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

// 지난 설문보기 (SURV-03) - closed 상태 설문만 조회
export default function PastSurveyPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'past', searchParams],
    queryFn: () => apiClient.get<Survey[]>('/sys02/surveys/past'),
  })

  const surveys: Survey[] = (data as { data?: Survey[] } | undefined)?.data ?? []

  // 검색 필터링 (클라이언트 사이드)
  const filteredSurveys = surveys.filter((s) => {
    if (searchParams.keyword && !s.surveyName.includes(searchParams.keyword as string)) {
      return false
    }
    return true
  })

  const columns: ProColumns<Survey>[] = [
    {
      title: '설문명',
      dataIndex: 'surveyName',
      width: 250,
      render: (_, record) =>
        record.isPublicResult ? (
          <a onClick={() => setSelectedId(record.id)}>{record.surveyName}</a>
        ) : (
          <span>{record.surveyName}</span>
        ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status as SurveyStatus}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '대상자 수',
      dataIndex: 'targetCount',
      width: 100,
      sorter: true,
    },
    {
      title: '응답자 수',
      dataIndex: 'responseCount',
      width: 100,
      sorter: true,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 120,
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
      title: '결과',
      width: 100,
      render: (_, record) =>
        record.isPublicResult ? (
          <Button size="small" onClick={() => setSelectedId(record.id)}>
            결과 조회
          </Button>
        ) : (
          <Button size="small" disabled>
            비공개
          </Button>
        ),
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
    <PageContainer title="지난 설문보기">
      {/* 검색영역 */}
      <SearchForm
        fields={searchFields}
        onSearch={handleSearch}
        onReset={handleSearchReset}
      />

      <DataTable<Survey>
        columns={columns}
        dataSource={filteredSurveys}
        loading={isLoading}
        rowKey="id"
      />

      <Modal
        title="설문 결과 분석"
        open={!!selectedId}
        onCancel={() => setSelectedId(null)}
        footer={null}
        width={900}
      >
        {selectedId && <SurveyResultPage surveyId={selectedId} />}
      </Modal>
    </PageContainer>
  )
}
