import { useState } from 'react'
import { Modal, Button } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { InspectionTask } from '@/shared/api/mocks/handlers/sys17'

const STATUS_COLOR_MAP: Record<string, string> = {
  notStarted: 'default',
  inProgress: 'blue',
  completed: 'green',
  received: 'cyan',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  notStarted: '미조치',
  inProgress: '진행중',
  completed: '조치완료',
  received: '접수완료',
}

async function fetchTasks(params: PageRequest): Promise<PageResponse<InspectionTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InspectionTask>>>('/sys17/tasks', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<InspectionTask>>).data ?? (res as unknown as PageResponse<InspectionTask>)
  return data
}

export default function InspectionResultDataPage() {
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const columns: ProColumns<InspectionTask>[] = [
    {
      title: '과제번호',
      dataIndex: 'taskNo',
      width: 100,
      sorter: true,
    },
    {
      title: '과제명',
      dataIndex: 'taskName',
      width: 250,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedTask(record)
            setDetailOpen(true)
          }}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: '검열계획',
      dataIndex: 'planName',
      width: 150,
      sorter: true,
    },
    {
      title: '대상부대',
      dataIndex: 'targetUnit',
      width: 120,
      sorter: true,
    },
    {
      title: '주관부서',
      dataIndex: 'managingDept',
      width: 120,
      sorter: true,
    },
    // 담당검열관: 군번/계급/성명 통합 표시
    militaryPersonColumn<InspectionTask>('담당검열관', {
      serviceNumber: 'inspectorServiceNumber',
      rank: 'inspectorRank',
      name: 'inspectorName',
    }),
    {
      title: '검열분야',
      dataIndex: 'inspField',
      width: 100,
      sorter: true,
    },
    {
      title: '처분종류',
      dataIndex: 'dispositionType',
      width: 100,
      sorter: true,
    },
    {
      title: '공개여부',
      dataIndex: 'isPublic',
      width: 80,
      render: (_, record) => (record.isPublic ? '공개' : '비공개'),
    },
    {
      title: '진행상태',
      dataIndex: 'progressStatus',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.progressStatus}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
  ]

  return (
    <PageContainer title="검열결과 정보">
      <DataTable<InspectionTask>
        request={fetchTasks}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title="검열결과 상세 (읽기전용)"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false)
          setSelectedTask(null)
        }}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            닫기
          </Button>,
        ]}
        destroyOnClose
      >
        {selectedTask && (
          <div>
            <p><strong>과제번호:</strong> {selectedTask.taskNo}</p>
            <p><strong>과제명:</strong> {selectedTask.taskName}</p>
            <p><strong>검열계획:</strong> {selectedTask.planName}</p>
            <p><strong>대상부대:</strong> {selectedTask.targetUnit}</p>
            <p><strong>주관부서:</strong> {selectedTask.managingDept}</p>
            <p><strong>담당검열관:</strong> {selectedTask.inspectorServiceNumber} / {selectedTask.inspectorRank} / {selectedTask.inspectorName}</p>
            <p><strong>공개여부:</strong> {selectedTask.isPublic ? '공개' : '비공개'}</p>
            <p><strong>검열분야:</strong> {selectedTask.inspField}</p>
            <p><strong>처분종류:</strong> {selectedTask.dispositionType}</p>
            <p>
              <strong>진행상태:</strong>{' '}
              <StatusBadge
                status={selectedTask.progressStatus}
                colorMap={STATUS_COLOR_MAP}
                labelMap={STATUS_LABEL_MAP}
              />
            </p>
            <p><strong>주요내용:</strong> {selectedTask.taskContent || '-'}</p>
            <p><strong>문제점:</strong> {selectedTask.issues || '-'}</p>
            <p><strong>조치결과:</strong> {selectedTask.actionResult || '-'}</p>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}
