import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { Survey } from '@/shared/api/mocks/handlers/sys02'

// 설문참여 목록 페이지 (SURV-01)
export default function SurveyParticipationPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'participation'],
    queryFn: () => apiClient.get<Survey[]>('/sys02/surveys/participation'),
  })

  const surveys = (data as Survey[] | undefined) || []

  const columns: ProColumns<Survey & { isParticipated?: boolean }>[] = [
    {
      title: '설문명',
      dataIndex: 'surveyName',
      width: 300,
      render: (_, record) => (
        <a onClick={() => navigate(`/sys02/1/3/${record.id}`)}>{record.surveyName}</a>
      ),
    },
    {
      title: '등록자',
      dataIndex: 'authorName',
      width: 100,
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

  return (
    <PageContainer title="설문참여">
      <DataTable<Survey & { isParticipated?: boolean }>
        columns={columns}
        dataSource={surveys as (Survey & { isParticipated?: boolean })[]}
        loading={isLoading}
        rowKey="id"
      />
    </PageContainer>
  )
}
