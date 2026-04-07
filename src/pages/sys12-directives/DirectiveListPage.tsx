import { useState, useRef, useCallback } from 'react'
import { Modal, Button, Divider, message, Timeline } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { CrudFormField } from '@/shared/ui/CrudForm/CrudForm'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { Directive, ActionItem, ActionHistory } from '@/shared/api/mocks/handlers/sys12'
import type { DirectiveCategory } from './DirectiveProgressPage'

// 카테고리별 API 경로 매핑
const API_PATH_MAP: Record<DirectiveCategory, string> = {
  commander: '/sys12/directives',
  president: '/sys12/presidential-directives',
  minister: '/sys12/minister-directives',
}

const TITLE_MAP: Record<DirectiveCategory, string> = {
  commander: '지휘관 지시사항 목록',
  president: '대통령 지시사항 목록',
  minister: '국방부장관 지시사항 목록',
}

interface Props {
  category?: DirectiveCategory
}

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

const UNIT_OPTIONS = [
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '교육훈련단', value: '교육훈련단' },
  { label: '상륙기동단', value: '상륙기동단' },
]

const DIRECTIVE_TYPE_OPTIONS = [
  { label: '문서', value: '문서' },
  { label: '구두', value: '구두' },
]

// 검색 필드 정의 (CSV 검색조건: 지시일, 지시자, 수명부대, 진행상황, 지시내용)
const searchFields: SearchField[] = [
  { name: 'directiveDateRange', label: '지시일', type: 'dateRange' },
  { name: 'director', label: '지시자', type: 'text', placeholder: '지시자명 검색' },
  { name: 'targetUnit', label: '수명부대', type: 'select', options: UNIT_OPTIONS },
  { name: 'progressStatus', label: '진행상황', type: 'select', options: STATUS_OPTIONS },
  { name: 'keyword', label: '지시내용', type: 'text', placeholder: '지시내용 검색' },
]

// API 함수
async function fetchDirectives(apiPath: string, params: PageRequest & Record<string, unknown>): Promise<PageResponse<Directive>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Directive>>>(apiPath, {
    params: {
      page: params.page,
      size: params.size,
      progressStatus: params.progressStatus || '',
      director: params.director || '',
      keyword: params.keyword || '',
      targetUnit: params.targetUnit || '',
      directiveDateFrom: params.directiveDateFrom || '',
      directiveDateTo: params.directiveDateTo || '',
    },
  })
  const data = (res as ApiResult<PageResponse<Directive>>).data ?? (res as unknown as PageResponse<Directive>)
  return data
}

async function fetchDirectiveHistory(apiPath: string, id: string): Promise<ActionHistory[]> {
  const res = await apiClient.get<never, ApiResult<ActionHistory[]>>(`${apiPath}/${id}/history`)
  const data = (res as ApiResult<ActionHistory[]>).data ?? (res as unknown as ActionHistory[])
  return data
}

// CrudForm 필드 정의 (CSV 입력값: 지시자, 지시일자, 수명부대, 추진상태, 지시내용, 지시사항종류(문서/구두))
const directiveFormFields: CrudFormField[] = [
  {
    name: 'directorServiceNumber',
    label: '지시자 군번',
    type: 'text',
    required: true,
  },
  {
    name: 'directorRank',
    label: '지시자 계급',
    type: 'text',
    required: true,
  },
  {
    name: 'directorName',
    label: '지시자 성명',
    type: 'text',
    required: true,
  },
  {
    name: 'directiveDate',
    label: '지시일자',
    type: 'date',
    required: true,
  },
  {
    name: 'targetUnit',
    label: '수명부대',
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
    label: '지시내용',
    type: 'textarea',
    required: true,
  },
  {
    name: 'directiveType',
    label: '지시사항 종류',
    type: 'select',
    required: true,
    options: DIRECTIVE_TYPE_OPTIONS,
  },
]

// 조치사항 등록 폼 필드 (CSV 입력값: 업무담당자, 추진상태, 추진계획, 추진내용, 첨부파일)
const actionFormFields: CrudFormField[] = [
  {
    name: 'assigneeServiceNumber',
    label: '담당자 군번',
    type: 'text',
    required: true,
  },
  {
    name: 'assigneeRank',
    label: '담당자 계급',
    type: 'text',
    required: true,
  },
  {
    name: 'assigneeName',
    label: '담당자 성명',
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
  {
    name: 'attachments',
    label: '첨부파일',
    type: 'file',
  },
]

export default function DirectiveListPage({ category = 'commander' }: Props) {
  const apiPath = API_PATH_MAP[category]
  const title = TITLE_MAP[category]
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [actionFormOpen, setActionFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Directive | null>(null)
  const [selectedDirective, setSelectedDirective] = useState<Directive | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  // 검색 핸들러
  const handleSearch = useCallback((values: Record<string, unknown>) => {
    const params: Record<string, unknown> = { ...values }
    // dateRange를 from/to로 분리
    if (values.directiveDateRange && Array.isArray(values.directiveDateRange)) {
      const [from, to] = values.directiveDateRange as [{ format: (f: string) => string }, { format: (f: string) => string }]
      params.directiveDateFrom = from?.format('YYYY-MM-DD') || ''
      params.directiveDateTo = to?.format('YYYY-MM-DD') || ''
      delete params.directiveDateRange
    }
    setSearchParams(params)
    actionRef.current?.reload()
  }, [])

  const handleSearchReset = useCallback(() => {
    setSearchParams({})
    actionRef.current?.reload()
  }, [])

  // 지시사항 이행 이력 조회
  const { data: history = [] } = useQuery({
    queryKey: ['sys12-directive-history', category, selectedDirective?.id],
    queryFn: () => fetchDirectiveHistory(apiPath, selectedDirective!.id),
    enabled: !!selectedDirective?.id,
  })

  // 등록 mutation
  const createMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return apiClient.post(apiPath, values)
    },
    onSuccess: () => {
      message.success('지시사항이 등록되었습니다')
      setFormOpen(false)
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys12-directive-progress', category] })
    },
    onError: () => message.error('등록에 실패했습니다'),
  })

  // 수정 mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      return apiClient.put(`${apiPath}/${id}`, values)
    },
    onSuccess: () => {
      message.success('지시사항이 수정되었습니다')
      setFormOpen(false)
      setEditTarget(null)
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys12-directive-progress', category] })
    },
    onError: () => message.error('수정에 실패했습니다'),
  })

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`${apiPath}/${id}`)
    },
    onSuccess: () => {
      message.success('삭제되었습니다')
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys12-directive-progress', category] })
    },
    onError: () => message.error('삭제에 실패했습니다'),
  })

  // 조치사항 등록 mutation
  const actionMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      return apiClient.post(`${apiPath}/${selectedDirective?.id}/actions`, values)
    },
    onSuccess: () => {
      message.success('조치사항이 등록되었습니다')
      setActionFormOpen(false)
    },
    onError: () => message.error('조치사항 등록에 실패했습니다'),
  })

  const columns: ProColumns<Directive>[] = [
    {
      title: '관리번호',
      dataIndex: 'directiveNo',
      width: 120,
      sorter: true,
    },
    // 지시자: 군번/계급/성명 표시
    militaryPersonColumn<Directive>('지시자', {
      serviceNumber: 'directorServiceNumber',
      rank: 'directorRank',
      name: 'directorName',
    }),
    {
      title: '지시일자',
      dataIndex: 'directiveDate',
      width: 120,
      sorter: true,
      valueType: 'date',
    },
    {
      title: '수명부대',
      dataIndex: 'targetUnit',
      width: 150,
      sorter: true,
    },
    {
      title: '지시내용',
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
      title: '종류(문서/구두)',
      dataIndex: 'directiveType',
      width: 120,
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
              setSelectedDirective(record)
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
    <PageContainer title={title}>
      {/* 검색영역 (CSV 검색조건: 지시일, 지시자, 수명부대, 진행상황, 지시내용) */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleSearchReset} />

      <DataTable<Directive>
        rowKey="id"
        columns={columns}
        request={(params) => fetchDirectives(apiPath, { ...params, ...searchParams } as PageRequest & Record<string, unknown>)}
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
            지시사항 등록
          </Button>,
        ]}
      />

      {/* 등록/수정 Modal */}
      <Modal
        title={editTarget ? '지시사항 수정' : '지시사항 등록'}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        width={700}
      >
        <CrudForm<Record<string, unknown>>
          fields={directiveFormFields}
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
        title="지시사항 상세"
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
        {selectedDirective && (
          <>
            <Divider>기본 정보</Divider>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <dt>관리번호</dt>
              <dd>{selectedDirective.directiveNo}</dd>
              <dt>지시자</dt>
              <dd>{selectedDirective.directorServiceNumber} / {selectedDirective.directorRank} / {selectedDirective.directorName}</dd>
              <dt>지시일자</dt>
              <dd>{selectedDirective.directiveDate}</dd>
              <dt>수명부대</dt>
              <dd>{selectedDirective.targetUnit}</dd>
              <dt>종류(문서/구두)</dt>
              <dd>{selectedDirective.directiveType}</dd>
              <dt>추진상태</dt>
              <dd>
                <StatusBadge
                  status={selectedDirective.progressStatus}
                  colorMap={STATUS_COLOR_MAP}
                  labelMap={STATUS_LABEL_MAP}
                />
              </dd>
              <dt style={{ gridColumn: '1' }}>지시내용</dt>
              <dd style={{ gridColumn: '2' }}>{selectedDirective.content}</dd>
            </dl>

            <Divider>이행 이력</Divider>
            {history.length === 0 ? (
              <p>이행 이력이 없습니다.</p>
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
