import { useState } from 'react'
import { Modal, Button, message, Select, Tabs, Timeline, Upload, Radio } from 'antd'
import { PlusOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { InspectionTask, InspActionHistory } from '@/shared/api/mocks/handlers/sys17'

const INSP_FIELD_OPTIONS = [
  { label: '전투준비태세', value: '전투준비태세' },
  { label: '교육훈련', value: '교육훈련' },
  { label: '군수', value: '군수' },
  { label: '인사', value: '인사' },
  { label: '정보화', value: '정보화' },
]

const UNIT_OPTIONS = [
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '교육훈련단', value: '교육훈련단' },
  { label: '상륙기동단', value: '상륙기동단' },
]

const DEPT_OPTIONS = [
  { label: '작전처', value: '작전처' },
  { label: '군수처', value: '군수처' },
  { label: '인사처', value: '인사처' },
  { label: '정보처', value: '정보처' },
  { label: '교육처', value: '교육처' },
]

const DISPOSITION_TYPE_OPTIONS = [
  { label: '시정', value: '시정' },
  { label: '주의', value: '주의' },
  { label: '경고', value: '경고' },
  { label: '개선', value: '개선' },
  { label: '보완', value: '보완' },
]

const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const year = (2020 + i).toString()
  return { label: year, value: year }
})

const PROGRESS_STATUS_OPTIONS = [
  { label: '미조치', value: 'notStarted' },
  { label: '진행중', value: 'inProgress' },
  { label: '조치완료', value: 'completed' },
  { label: '접수완료', value: 'received' },
]

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

async function fetchTasks(params: PageRequest & Record<string, unknown>): Promise<PageResponse<InspectionTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<InspectionTask>>>('/sys17/tasks', {
    params: { page: params.page, size: params.size, ...params },
  })
  const data = (res as ApiResult<PageResponse<InspectionTask>>).data ?? (res as unknown as PageResponse<InspectionTask>)
  return data
}

type SearchParams = {
  inspYear?: string
  targetUnit?: string
  taskName?: string
  progressStatus?: string
  inspField?: string
}

type TaskFormValues = {
  planId: string
  targetUnit: string
  managingDept: string
  /** 담당검열관 군번 */
  inspectorServiceNumber: string
  /** 담당검열관 계급 */
  inspectorRank: string
  /** 담당검열관 성명 */
  inspectorName: string
  /** 공개여부 */
  isPublic: boolean
  /** 과제번호 */
  taskNo: string
  inspField: string
  /** 처분종류 */
  dispositionType: string
  taskName: string
  /** 주요내용 */
  taskContent: string
}

type ResultFormValues = {
  progressStatus: string
  issues?: string
  actionResult: string
}

interface TaskDetailModalProps {
  task: InspectionTask | null
  open: boolean
  onClose: () => void
}

function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  const queryClient = useQueryClient()
  const [resultModalOpen, setResultModalOpen] = useState(false)

  const { data: histories } = useQuery({
    queryKey: ['sys17', 'tasks', task?.id, 'history'],
    queryFn: async () => {
      if (!task) return []
      const res = await apiClient.get<ApiResult<InspActionHistory[]>>(`/sys17/tasks/${task.id}/history`)
      const data = (res as ApiResult<InspActionHistory[]>).data ?? (res as unknown as InspActionHistory[])
      return data
    },
    enabled: !!task,
  })

  const resultMutation = useMutation({
    mutationFn: async (values: ResultFormValues) => {
      if (!task) return
      return apiClient.put(`/sys17/tasks/${task.id}/result`, values)
    },
    onSuccess: () => {
      message.success('조치결과가 저장되었습니다.')
      setResultModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'tasks'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다.')
    },
  })

  if (!task) return null

  const timelineItems = (histories || []).map((h) => ({
    color: STATUS_COLOR_MAP[h.status] || 'blue',
    children: (
      <span>
        <strong>[{h.date}]</strong> {h.assignee} - {STATUS_LABEL_MAP[h.status] || h.status} / {h.content}
      </span>
    ),
  }))

  const resultFormFields = [
    {
      name: 'progressStatus',
      label: '진행상태',
      rules: [{ required: true, message: '진행상태를 선택하세요' }],
      render: () => (
        <Select
          options={PROGRESS_STATUS_OPTIONS.filter((o) => o.value !== 'received')}
          placeholder="진행상태 선택"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      name: 'issues',
      label: '문제점',
      type: 'textarea' as const,
    },
    {
      name: 'actionResult',
      label: '조치계획/결과',
      type: 'textarea' as const,
      rules: [{ required: true, message: '조치계획/결과를 입력하세요' }],
    },
    {
      name: 'attachments',
      label: '첨부파일',
      render: () => (
        <Upload>
          <Button icon={<UploadOutlined />}>파일 선택</Button>
        </Upload>
      ),
    },
  ]

  return (
    <Modal title="조치과제 상세" open={open} onCancel={onClose} footer={null} width={700} destroyOnClose>
      <div style={{ marginBottom: 16 }}>
        <strong>과제번호:</strong> {task.taskNo}
        <br />
        <strong>과제명:</strong> {task.taskName}
        <br />
        <strong>검열계획:</strong> {task.planName}
        <br />
        <strong>대상부대:</strong> {task.targetUnit}
        <br />
        <strong>주관부서:</strong> {task.managingDept}
        <br />
        <strong>담당검열관:</strong> {task.inspectorServiceNumber} / {task.inspectorRank} / {task.inspectorName}
        <br />
        <strong>공개여부:</strong> {task.isPublic ? '공개' : '비공개'}
        <br />
        <strong>검열분야:</strong> {task.inspField}
        <br />
        <strong>처분종류:</strong> {task.dispositionType}
        <br />
        <strong>진행상태:</strong>{' '}
        <StatusBadge
          status={task.progressStatus}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
        <br />
        <strong>주요내용:</strong> {task.taskContent}
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setResultModalOpen(true)}>
          조치결과 입력
        </Button>
      </div>

      <div>
        <strong>과제처리 이력</strong>
        {timelineItems.length > 0 ? (
          <Timeline items={timelineItems} style={{ marginTop: 8 }} />
        ) : (
          <p style={{ color: '#999' }}>이력이 없습니다.</p>
        )}
      </div>

      <Modal
        title="조치결과 입력"
        open={resultModalOpen}
        onCancel={() => setResultModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={resultFormFields}
          initialValues={{ progressStatus: task.progressStatus, issues: task.issues, actionResult: task.actionResult }}
          onSubmit={(values) => resultMutation.mutate(values as ResultFormValues)}
          onCancel={() => setResultModalOpen(false)}
          submitText="저장"
        />
      </Modal>
    </Modal>
  )
}

export default function InspectionResultPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<InspectionTask | null>(null)
  const [detailTask, setDetailTask] = useState<InspectionTask | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchParams>({})

  const createMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      return apiClient.post('/sys17/tasks', values)
    },
    onSuccess: () => {
      message.success('조치과제가 등록되었습니다.')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'tasks'] })
    },
    onError: () => {
      message.error('등록에 실패했습니다.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TaskFormValues }) => {
      return apiClient.put(`/sys17/tasks/${id}`, values)
    },
    onSuccess: () => {
      message.success('조치과제가 수정되었습니다.')
      setModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys17', 'tasks'] })
    },
    onError: () => {
      message.error('수정에 실패했습니다.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/sys17/tasks/${id}`)
    },
    onSuccess: () => {
      message.success('조치과제가 삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys17', 'tasks'] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다.')
    },
  })

  const handleSubmit = (values: TaskFormValues) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, values })
    } else {
      createMutation.mutate(values)
    }
  }

  const taskColumns: ProColumns<InspectionTask>[] = [
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
            setDetailTask(record)
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
      title: '공개여부',
      dataIndex: 'isPublic',
      width: 80,
      render: (_, record) => (record.isPublic ? '공개' : '비공개'),
    },
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
    {
      title: '관리',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          onClick={() => deleteMutation.mutate(record.id)}
        >
          삭제
        </Button>
      ),
    },
  ]

  const resultColumns: ProColumns<InspectionTask>[] = [
    {
      title: '과제번호',
      dataIndex: 'taskNo',
      width: 100,
    },
    {
      title: '과제명',
      dataIndex: 'taskName',
      width: 250,
    },
    {
      title: '주관부서',
      dataIndex: 'managingDept',
      width: 120,
    },
    // 담당검열관: 군번/계급/성명 통합 표시
    militaryPersonColumn<InspectionTask>('담당검열관', {
      serviceNumber: 'inspectorServiceNumber',
      rank: 'inspectorRank',
      name: 'inspectorName',
    }),
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
    {
      title: '최종수정일',
      dataIndex: 'lastUpdated',
      width: 120,
    },
  ]

  // 조치과제 목록 검색: 연도, 대상부대, 과제명, 진행상태, 검열분야
  const searchFields = [
    {
      name: 'inspYear',
      label: '연도',
      render: () => <Select options={YEAR_OPTIONS} placeholder="연도 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'targetUnit',
      label: '대상부대',
      render: () => <Select options={UNIT_OPTIONS} placeholder="부대 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'taskName',
      label: '과제명',
      type: 'text' as const,
    },
    {
      name: 'progressStatus',
      label: '진행상태',
      render: () => <Select options={PROGRESS_STATUS_OPTIONS} placeholder="상태 선택" allowClear style={{ width: '100%' }} />,
    },
    {
      name: 'inspField',
      label: '검열분야',
      render: () => <Select options={INSP_FIELD_OPTIONS} placeholder="분야 선택" allowClear style={{ width: '100%' }} />,
    },
  ]

  // 조치결과 목록 검색: 과제번호, 과제명, 주관부서, 진행상태
  const resultSearchFields: SearchField[] = [
    { name: 'taskNo', label: '과제번호', type: 'text' },
    { name: 'taskName', label: '과제명', type: 'text' },
    { name: 'managingDept', label: '주관부서', type: 'select', options: DEPT_OPTIONS },
    { name: 'progressStatus', label: '진행상태', type: 'select', options: PROGRESS_STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value })) },
  ]

  // CSV 입력값: 검열계획, 대상부대, 주관부서, 담당검열관, 공개여부, 과제번호, 검열분야, 처분종류, 과제명, 주요내용, 첨부파일
  const formFields = [
    {
      name: 'planId',
      label: '검열계획',
      rules: [{ required: true, message: '검열계획을 선택하세요' }],
      render: () => <Select options={[]} placeholder="상단 검열계획 목록에서 선택" style={{ width: '100%' }} />,
    },
    {
      name: 'targetUnit',
      label: '대상부대',
      rules: [{ required: true, message: '대상부대를 선택하세요' }],
      render: () => <Select options={UNIT_OPTIONS} placeholder="부대 선택" style={{ width: '100%' }} />,
    },
    {
      name: 'managingDept',
      label: '주관부서',
      rules: [{ required: true, message: '주관부서를 선택하세요' }],
      render: () => <Select options={DEPT_OPTIONS} placeholder="부서 선택" style={{ width: '100%' }} />,
    },
    {
      name: 'inspectorServiceNumber',
      label: '담당검열관 군번',
      type: 'text' as const,
      rules: [{ required: true, message: '군번을 입력하세요' }],
    },
    {
      name: 'inspectorRank',
      label: '담당검열관 계급',
      type: 'text' as const,
      rules: [{ required: true, message: '계급을 입력하세요' }],
    },
    {
      name: 'inspectorName',
      label: '담당검열관 성명',
      type: 'text' as const,
      rules: [{ required: true, message: '성명을 입력하세요' }],
    },
    {
      name: 'isPublic',
      label: '공개여부',
      rules: [{ required: true, message: '공개여부를 선택하세요' }],
      render: () => (
        <Radio.Group>
          <Radio value={true}>공개</Radio>
          <Radio value={false}>비공개</Radio>
        </Radio.Group>
      ),
    },
    {
      name: 'taskNo',
      label: '과제번호',
      type: 'text' as const,
      rules: [{ required: true, message: '과제번호를 입력하세요' }],
    },
    {
      name: 'inspField',
      label: '검열분야',
      rules: [{ required: true, message: '검열분야를 선택하세요' }],
      render: () => <Select options={INSP_FIELD_OPTIONS} placeholder="분야 선택" style={{ width: '100%' }} />,
    },
    {
      name: 'dispositionType',
      label: '처분종류',
      rules: [{ required: true, message: '처분종류를 선택하세요' }],
      render: () => <Select options={DISPOSITION_TYPE_OPTIONS} placeholder="처분종류 선택" style={{ width: '100%' }} />,
    },
    {
      name: 'taskName',
      label: '과제명',
      type: 'text' as const,
      rules: [{ required: true, message: '과제명을 입력하세요' }, { max: 200, message: '200자 이내로 입력하세요' }],
    },
    {
      name: 'taskContent',
      label: '주요내용',
      type: 'textarea' as const,
      rules: [{ required: true, message: '주요내용을 입력하세요' }],
    },
    {
      name: 'attachments',
      label: '첨부파일',
      render: () => (
        <Upload>
          <Button icon={<UploadOutlined />}>파일 선택</Button>
        </Upload>
      ),
    },
  ]

  const tabItems = [
    {
      key: '1',
      label: '조치과제 목록',
      children: (
        <DataTable<InspectionTask>
          queryKey={['sys17', 'tasks', searchParams]}
          requestFn={(params) => fetchTasks({ ...params, ...searchParams })}
          columns={taskColumns}
          rowKey="id"
          searchFields={searchFields}
          onSearch={(values) => setSearchParams(values as SearchParams)}
          toolBarRender={() => [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditTarget(null)
                setModalOpen(true)
              }}
            >
              조치과제 작성
            </Button>,
            <Button key="excel" icon={<DownloadOutlined />}>
              엑셀 다운로드
            </Button>,
          ]}
        />
      ),
    },
    {
      key: '2',
      label: '조치결과 목록',
      children: (
        <div>
          <SearchForm
            fields={resultSearchFields}
            onSearch={(values) => setSearchParams(values as SearchParams)}
            onReset={() => setSearchParams({})}
          />
          <DataTable<InspectionTask>
            queryKey={['sys17', 'tasks', 'results', searchParams]}
            requestFn={(params) => fetchTasks({ ...params, ...searchParams })}
            columns={resultColumns}
            rowKey="id"
          />
        </div>
      ),
    },
  ]

  return (
    <PageContainer title="검열결과">
      <Tabs items={tabItems} />

      <Modal
        title={editTarget ? '조치과제 수정' : '조치과제 작성'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <CrudForm
          fields={formFields}
          initialValues={editTarget || {}}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false)
            setEditTarget(null)
          }}
          submitText={editTarget ? '수정' : '등록'}
        />
      </Modal>

      <TaskDetailModal
        task={detailTask}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setDetailTask(null)
        }}
      />
    </PageContainer>
  )
}
