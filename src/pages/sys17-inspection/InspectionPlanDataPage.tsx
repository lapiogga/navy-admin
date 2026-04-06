import { useState } from 'react'
import { Modal, Button } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { InspectionPlan } from '@/shared/api/mocks/handlers/sys17'

async function fetchPlans(params: PageRequest): Promise<PageResponse<InspectionPlan>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InspectionPlan>>>('/sys17/plans', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<InspectionPlan>>).data ?? (res as unknown as PageResponse<InspectionPlan>)
  return data
}

export default function InspectionPlanDataPage() {
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const columns: ProColumns<InspectionPlan>[] = [
    {
      title: '검열계획명',
      dataIndex: 'planName',
      width: 250,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedPlan(record)
            setDetailOpen(true)
          }}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
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
  ]

  return (
    <PageContainer title="검열계획 정보">
      <DataTable<InspectionPlan>
        queryKey={['sys17', 'plan-data']}
        requestFn={fetchPlans}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title="검열계획 상세"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false)
          setSelectedPlan(null)
        }}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            닫기
          </Button>,
        ]}
        destroyOnClose
      >
        {selectedPlan && (
          <div>
            <p><strong>검열계획명:</strong> {selectedPlan.planName}</p>
            <p><strong>검열연도:</strong> {selectedPlan.inspYear}</p>
            <p><strong>대상부대:</strong> {selectedPlan.targetUnit}</p>
            <p><strong>시작일:</strong> {selectedPlan.startDate}</p>
            <p><strong>종료일:</strong> {selectedPlan.endDate}</p>
            <p><strong>과제 수:</strong> {selectedPlan.taskCount}</p>
            <p><strong>첨부 수:</strong> {selectedPlan.fileCount}</p>
            <p><strong>비고:</strong> {selectedPlan.remarks}</p>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
