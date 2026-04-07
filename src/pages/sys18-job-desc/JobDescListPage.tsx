import { useState, useRef } from 'react'
import { Tabs, Button, Modal, message, Tooltip, Space } from 'antd'
import { PlusOutlined, PrinterOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { JobDesc, JobDescType } from '@/shared/api/mocks/handlers/sys18'
import JobDescFormPage from './JobDescFormPage'

const JD_STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  submitted: 'orange',
  approved_1st: 'blue',
  completed: 'green',
  rejected: 'red',
}

const JD_STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  submitted: '제출됨',
  approved_1st: '1차 완료',
  completed: '완료',
  rejected: '반려',
}

const JD_TYPE_LABEL_MAP: Record<string, string> = {
  personal: '개인직무기술서',
  position: '직책직무기술서',
  department: '부서직무기술서',
}

async function fetchJobDescs(params: PageRequest & { type?: string }): Promise<PageResponse<JobDesc>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<JobDesc>>>('/sys18/job-descs', {
    params: { page: params.page, size: params.size, type: params.type },
  })
  const data = (res as ApiResult<PageResponse<JobDesc>>).data ?? (res as unknown as PageResponse<JobDesc>)
  return data
}

interface TabContentProps {
  type: JobDescType
  onWrite: (type: JobDescType) => void
}

function JobDescTabContent({ type, onWrite }: TabContentProps) {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sys18/job-descs/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys18-job-descs'] })
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const copyMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/sys18/job-descs/${id}/copy`),
    onSuccess: () => {
      message.success('복사되었습니다.')
      actionRef.current?.reload()
    },
    onError: () => message.error('복사에 실패했습니다.'),
  })

  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [printType, setPrintType] = useState<'list' | 'single'>('list')
  const [selectedRecord, setSelectedRecord] = useState<JobDesc | null>(null)

  const columns: ProColumns<JobDesc>[] = [
    {
      title: '조직진단명',
      dataIndex: 'diagnosisName',
      ellipsis: true,
    },
    ...(type === 'personal'
      ? [
          {
            title: '작성자',
            dataIndex: 'writerName',
            width: 100,
          } as ProColumns<JobDesc>,
        ]
      : []),
    {
      title: '부서',
      dataIndex: 'department',
      width: 120,
    },
    {
      title: '직책',
      dataIndex: 'position',
      width: 120,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={JD_STATUS_COLOR_MAP}
          labelMap={JD_STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '작성일',
      dataIndex: 'createdAt',
      width: 110,
    },
    {
      title: '제출일',
      dataIndex: 'submittedAt',
      width: 110,
      render: (val) => (val as string) || '-',
    },
    {
      title: '관리',
      valueType: 'option',
      width: 200,
      render: (_, record) => [
        <Button key="detail" type="link" size="small">
          상세
        </Button>,
        <Button key="edit" type="link" size="small">
          수정
        </Button>,
        <Button
          key="copy"
          type="link"
          size="small"
          onClick={() => copyMutation.mutate(record.id)}
        >
          복사
        </Button>,
        <Button
          key="delete"
          type="link"
          size="small"
          danger
          onClick={() => {
            Modal.confirm({
              title: '삭제 확인',
              content: '직무기술서를 삭제하시겠습니까?',
              okType: 'danger',
              onOk: () => deleteMutation.mutate(record.id),
            })
          }}
        >
          삭제
        </Button>,
        <Tooltip key="print" title="인쇄">
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => {
              setSelectedRecord(record)
              setPrintType('single')
              setPrintModalOpen(true)
            }}
          />
        </Tooltip>,
      ],
    },
  ]

  return (
    <>
      <DataTable<JobDesc>
        columns={columns}
        request={(params) => fetchJobDescs({ ...params, type })}
        rowKey="id"
        actionRef={actionRef}
        headerTitle={JD_TYPE_LABEL_MAP[type]}
        toolBarRender={() => [
          <Button
            key="write"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onWrite(type)}
          >
            직무기술서 작성
          </Button>,
          <Button
            key="printList"
            icon={<PrinterOutlined />}
            onClick={() => {
              setPrintType('list')
              setSelectedRecord(null)
              setPrintModalOpen(true)
            }}
          >
            인쇄
          </Button>,
        ]}
      />

      {/* 인쇄 미리보기 Modal (규칙 4) */}
      <Modal
        open={printModalOpen}
        title={printType === 'list' ? `${JD_TYPE_LABEL_MAP[type]} 목록 인쇄` : '직무기술서 인쇄'}
        onCancel={() => setPrintModalOpen(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            인쇄
          </Button>,
          <Button key="close" onClick={() => setPrintModalOpen(false)}>
            닫기
          </Button>,
        ]}
        width={800}
      >
        <div className="print-area" style={{ padding: 16 }}>
          {printType === 'list' ? (
            <div>
              <h3 style={{ textAlign: 'center', marginBottom: 16 }}>{JD_TYPE_LABEL_MAP[type]} 목록</h3>
              <p style={{ color: '#666' }}>인쇄 시 현재 조회된 목록이 출력됩니다.</p>
            </div>
          ) : selectedRecord ? (
            <div>
              <h3 style={{ textAlign: 'center', marginBottom: 16 }}>직무기술서</h3>
              <Space direction="vertical" style={{ width: '100%' }}>
                <p><strong>작성자:</strong> {selectedRecord.writerName} ({selectedRecord.rank})</p>
                <p><strong>부서:</strong> {selectedRecord.department}</p>
                <p><strong>직책:</strong> {selectedRecord.position}</p>
                <p><strong>조직진단명:</strong> {selectedRecord.diagnosisName}</p>
                <p><strong>상태:</strong> {JD_STATUS_LABEL_MAP[selectedRecord.status]}</p>
              </Space>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  )
}

export default function JobDescListPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState<JobDescType>('personal')
  const [editId, setEditId] = useState<string | undefined>()

  const handleWrite = (type: JobDescType) => {
    setFormType(type)
    setEditId(undefined)
    setFormOpen(true)
  }

  const tabItems = [
    {
      key: 'personal',
      label: '나의 개인직무기술서',
      children: <JobDescTabContent type="personal" onWrite={handleWrite} />,
    },
    {
      key: 'position',
      label: '직책 개인직무기술서',
      children: <JobDescTabContent type="position" onWrite={handleWrite} />,
    },
    {
      key: 'department',
      label: '부서직무기술서',
      children: <JobDescTabContent type="department" onWrite={handleWrite} />,
    },
  ]

  return (
    <PageContainer title="직무기술서 작성">
      <Tabs items={tabItems} />

      {/* 직무기술서 작성/수정 Modal */}
      <Modal
        open={formOpen}
        title={editId ? '직무기술서 수정' : '직무기술서 작성'}
        onCancel={() => setFormOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <JobDescFormPage
          type={formType}
          id={editId}
          onClose={() => setFormOpen(false)}
        />
      </Modal>
    </PageContainer>
  )
}
