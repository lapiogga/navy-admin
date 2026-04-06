import { useState, useRef } from 'react'
import { Modal, Button, Divider, message, Timeline } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { CrudFormField } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { Proposal, ActionItem, ActionHistory } from '@/shared/api/mocks/handlers/sys12'

// 상태 매핑
const STATUS_COLOR_MAP: Record<string, string> = {
  notStarted: 'default',
  inProgress: 'blue',
  completed: 'green',
  delayed: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  notStarted: '미착수',
  inProgress: '진행중',
  completed: '완료',
  delayed: '지연',
}

const STATUS_OPTIONS = [
  { label: '미착수', value: 'notStarted' },
  { label: '진행중', value: 'inProgress' },
  { label: '완료', value: 'completed' },
  { label: '지연', value: 'delayed' },
]

const PROPOSER_OPTIONS = [
  { label: '사령관', value: '사령관' },
  { label: '참모장', value: '참모장' },
  { label: '부사령관', value: '부사령관' },
]

const UNIT_OPTIONS = [
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '교육훈련단', value: '교육훈련단' },
  { label: '상륙기동단', value: '상륙기동단' },
]

const CATEGORY_OPTIONS = [
  { label: '작전', value: '작전' },
  { label: '교육', value: '교육' },
  { label: '군수', value: '군수' },
  { label: '인사', value: '인사' },
  { label: '정보화', value: '정보화' },
]

// API 함수
async function fetchProposals(params: PageRequest & Record<string, unknown>): Promise<PageResponse<Proposal>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Proposal>>>('/sys12/proposals', {
    params: {
      page: params.page,
      size: params.size,
      progressStatus: params.progressStatus || '',
      keyword: params.keyword || '',
    },
  })
  const data = (res as ApiResult<PageResponse<Proposal>>).data ?? (res as unknown as PageResponse<Proposal>)
  return data
}

async function fetchProposalHistory(id: string): Promise<ActionHistory[]> {
  const res = await apiClient.get<never, ApiResult<ActionHistory[]>>(`/sys12/proposals/${id}/history`)
  const data = (res as ApiResult<ActionHistory[]>).data ?? (res as unknown as ActionHistory[])
  return data
}

// CrudForm 필드 정의
const proposalFormFields: CrudFormField[] = [
  {
    name: 'proposer',
    label: '건의자',
    type: 'select',
    required: true,
    options: PROPOSER_OPTIONS,
  },
  {
    name: 'proposalDate',
    label: '건의일자',
    type: 'date',
    required: true,
  },
  {
    name: 'managingUnit',
    label: '주관부대',
    type: 'select',
    required: true,
    options: UNIT_OPTIONS,
  },
  {
    name: 'progressStatus',
    label: '추진상태',
    type: 'select',
    required: true,
    options: STATUS_OPTIONS,
  },
  {
    name: 'content',
    label: '건의내용',
    type: 'textarea',
    required: true,
  },
  {
    name: 'category',
    label: '종류',
    type: 'select',
    required: true,
    options: CATEGORY_OPTIONS,
  },
]

// 조치사항 등록 폼 필드
const actionFormFields: CrudFormField[] = [
  {
    name: 'assignee',
    label: '업무담당자',
    type: 'text',
    required: true,
  },
  {
    name: 'progressStatus',
    label: '추진상태',
    type: 'select',
    required: true,
    options: [
      { label: '미착수', value: 'notStarted' },
      { label: '진행중', value: 'inProgress' },
      { label: '완료', value: 'completed' },
    ],
  },
  {
    name: 'plan',
    label: '추진계획',
    type: 'textarea',
    required: true,
  },
  {
    name: 'result',
    label: '추진내용',
    type: 'textarea',
  },
]

export default function ProposalListPage() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionFormOpen, setActionFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Proposal | null>(null)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)

  // 건의사항 처리 이력 조회
  const { data: history = [] } = useQuery({
    queryKey: ['sys12-proposal-history', selectedProposal?.id],
    queryFn: () => fetchProposalHistory(selectedProposal!.id),
    enabled: !!selectedProposal?.id,
  })

  // 등록 mutation
  const createMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return apiClient.post('/sys12/proposals', values)
    },
    onSuccess: () => {
      message.success('건의사항이 등록되었습니다')
      setFormOpen(false)
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys12-proposal-progress'] })
    },
    onError: () => message.error('등록에 실패했습니다'),
  })

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      return apiClient.put(`/sys12/proposals/${id}`, values)
    },
    onSuccess: () => {
      message.success('건의사항이 수정되었습니다')
      setFormOpen(false)
      setEditTarget(null)
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys12-proposal-progress'] })
    },
    onError: () => message.error('수정에 실패했습니다'),
  })

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys12/proposals/${id}`)
    },
    onSuccess: () => {
      message.success('삭제되었습니다')
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys12-proposal-progress'] })
    },
    onError: () => message.error('삭제에 실패했습니다'),
  })

  // 조치사항 등록 mutation
  const actionMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return apiClient.post(`/sys12/proposals/${selectedProposal?.id}/actions`, values)
    },
    onSuccess: () => {
      message.success('조치사항이 등록되었습니다')
      setActionFormOpen(false)
    },
    onError: () => message.error('조치사항 등록에 실패했습니다'),
  })

  const columns: ProColumns<Proposal>[] = [
    {
      title: '관리번호',
      dataIndex: 'proposalNo',
      width: 100,
      sorter: true,
    },
    {
      title: '건의자',
      dataIndex: 'proposer',
      width: 100,
      sorter: true,
    },
    {
      title: '건의일자',
      dataIndex: 'proposalDate',
      width: 120,
      sorter: true,
      valueType: 'date',
    },
    {
      title: '주관부대',
      dataIndex: 'managingUnit',
      width: 150,
      sorter: true,
    },
    {
      title: '건의내용',
      dataIndex: 'content',
      width: 300,
      ellipsis: true,
    },
    {
      title: '추진상태',
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
    {
      title: '종류',
      dataIndex: 'category',
      width: 100,
      sorter: true,
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedProposal(record)
              setDetailOpen(true)
            }}
          >
            상세
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditTarget(record)
              setFormOpen(true)
            }}
          >
            수정
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => deleteMutation.mutate(record.id)}
          >
            삭제
          </Button>
        </>
      ),
    },
  ]

  return (
    <PageContainer title="건의사항 목록">
      <DataTable<Proposal>
        rowKey="id"
        columns={columns}
        request={(params) => fetchProposals(params as PageRequest & Record<string, unknown>)}
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setEditTarget(null)
              setFormOpen(true)
            }}
          >
            건의사항 등록
          </Button>,
        ]}
      />

      {/* 등록/수정 Modal */}
      <Modal
        title={editTarget ? '건의사항 수정' : '건의사항 등록'}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        width={700}
      >
        <CrudForm<Record<string, unknown>>
          fields={proposalFormFields}
          initialValues={editTarget ?? {}}
          mode={editTarget ? 'edit' : 'create'}
          onFinish={async (values) => {
            if (editTarget) {
              await updateMutation.mutateAsync({ id: editTarget.id, values })
            } else {
              await createMutation.mutateAsync(values)
            }
            return true
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* 상세 Modal */}
      <Modal
        title="건의사항 상세"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button
            key="action"
            type="primary"
            onClick={() => setActionFormOpen(true)}
          >
            조치사항 등록
          </Button>,
          <Button key="close" onClick={() => setDetailOpen(false)}>
            닫기
          </Button>,
        ]}
        width={800}
      >
        {selectedProposal && (
          <>
            <Divider>기본 정보</Divider>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <dt>관리번호</dt>
              <dd>{selectedProposal.proposalNo}</dd>
              <dt>건의자</dt>
              <dd>{selectedProposal.proposer}</dd>
              <dt>건의일자</dt>
              <dd>{selectedProposal.proposalDate}</dd>
              <dt>주관부대</dt>
              <dd>{selectedProposal.managingUnit}</dd>
              <dt>종류</dt>
              <dd>{selectedProposal.category}</dd>
              <dt>추진상태</dt>
              <dd>
                <StatusBadge
                  status={selectedProposal.progressStatus}
                  colorMap={STATUS_COLOR_MAP}
                  labelMap={STATUS_LABEL_MAP}
                />
              </dd>
              <dt style={{ gridColumn: '1' }}>건의내용</dt>
              <dd style={{ gridColumn: '2' }}>{selectedProposal.content}</dd>
            </dl>

            <Divider>처리 이력</Divider>
            {history.length === 0 ? (
              <p>처리 이력이 없습니다.</p>
            ) : (
              <Timeline
                items={history.map((h) => ({
                  key: h.id,
                  color: STATUS_COLOR_MAP[h.status] ?? 'blue',
                  children: (
                    <div>
                      <strong>[{h.date}]</strong> {h.assignee} - {h.status}
                      <p>{h.content}</p>
                    </div>
                  ),
                }))}
              />
            )}
          </>
        )}
      </Modal>

      {/* 조치사항 등록 Modal */}
      <Modal
        title="조치사항 등록"
        open={actionFormOpen}
        onCancel={() => setActionFormOpen(false)}
        footer={null}
        width={600}
      >
        <CrudForm<Record<string, unknown>>
          fields={actionFormFields}
          mode="create"
          onFinish={async (values) => {
            await actionMutation.mutateAsync(values)
            return true
          }}
          loading={actionMutation.isPending}
        />
      </Modal>
    </PageContainer>
  )
}
