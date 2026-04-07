import { useState, useRef } from 'react'
import {
  Modal, Button, Descriptions, Space, Typography, Divider, message,
  Select, DatePicker, Input, Upload, List, Popconfirm,
} from 'antd'
import { LikeOutlined, WarningOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { Dayjs } from 'dayjs'
import type { UploadFile } from 'antd/es/upload'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { Text, Title } = Typography

// G19: 4단계 진행상태 + 반려
interface Suggestion extends Record<string, unknown> {
  id: string
  title: string
  content: string
  authorName: string
  serviceNumber: string
  rank: string
  authorUnit: string
  authorPosition?: string
  authorPhone?: string
  status: 'registered' | 'received' | 'processing' | 'completed' | 'rejected'
  assignedDept: string
  actionDate?: string
  actionType?: string
  rejectReason?: string
  isPrivate: boolean
  recommendCount: number
  reportCount: number
  attachments?: { name: string; url: string }[]
  answer?: string
  answeredAt?: string
  answeredBy?: string
  createdAt: string
  updatedAt: string
}

interface SuggestionComment {
  id: string
  suggestionId: string
  authorName: string
  content: string
  createdAt: string
}

// G19: 상태 색상/라벨 매핑
const STATUS_COLOR_MAP: Record<string, string> = {
  registered: 'blue',
  received: 'cyan',
  processing: 'orange',
  completed: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  registered: '등록',
  received: '접수',
  processing: '진행',
  completed: '완료',
  rejected: '반려',
}

// G22: 등록폼 확장 (로그인 정보 자동표시)
const CRUD_FIELDS = [
  { name: 'authorUnit', label: '소속', type: 'text' as const, disabled: true },
  { name: 'authorName', label: '제언자', type: 'text' as const, disabled: true },
  { name: 'authorPosition', label: '직책', type: 'text' as const, disabled: true },
  { name: 'authorPhone', label: '전화번호', type: 'text' as const, disabled: true },
  { name: 'title', label: '제목', type: 'text' as const, required: true },
  { name: 'content', label: '내용', type: 'textarea' as const, required: true },
]

// Mock 로그인 정보
const MOCK_USER = {
  authorUnit: '해병대사령부',
  authorName: '홍길동',
  serviceNumber: 'M-20260001',
  rank: '대위',
  authorPosition: '과장',
  authorPhone: '010-1234-5678',
}

// CSV 스펙: 진행상태 옵션
const STATUS_OPTIONS = [
  { label: '전체', value: '' },
  { label: '등록', value: 'registered' },
  { label: '접수', value: 'received' },
  { label: '진행', value: 'processing' },
  { label: '완료', value: 'completed' },
  { label: '반려', value: 'rejected' },
]

// CSV 스펙: 조치유형 옵션 (정책반영, 업무추진, 기추진, 업무참고)
const ACTION_TYPE_OPTIONS = [
  { label: '전체', value: '' },
  { label: '정책반영', value: '정책반영' },
  { label: '업무추진', value: '업무추진' },
  { label: '기추진', value: '기추진' },
  { label: '업무참고', value: '업무참고' },
]

// 검색 파라미터 확장: 제목, 작성자, 진행상태, 조치유형
interface SuggestionSearchParams extends PageRequest {
  keyword?: string
  status?: string
  actionType?: string
  author?: string
}

async function fetchSuggestions(params: SuggestionSearchParams): Promise<PageResponse<Suggestion>> {
  const qs = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
    ...(params.keyword ? { keyword: params.keyword } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.actionType ? { actionType: params.actionType } : {}),
    ...(params.author ? { author: params.author } : {}),
  })
  const res = await fetch(`/api/sys14/suggestions?${qs}`)
  const json: ApiResult<PageResponse<Suggestion>> = await res.json()
  return json.data
}

// G26: 엑셀 출력 - 전체 데이터 조회 후 CSV 생성
async function fetchAllSuggestions(): Promise<Suggestion[]> {
  const res = await fetch('/api/sys14/suggestions?page=0&size=9999')
  const json: ApiResult<PageResponse<Suggestion>> = await res.json()
  return json.data.content
}

async function fetchDetail(id: string): Promise<Suggestion> {
  const res = await fetch(`/api/sys14/suggestions/${id}`)
  const json: ApiResult<Suggestion> = await res.json()
  return json.data
}

// G26: 엑셀(CSV) 출력 - 전체 데이터 기반
function handleExcelExport(data: Suggestion[]) {
  const headers = ['순번', '제목', '내용', '제언자', '소속', '직책', '전화번호', '작성일', '진행상태', '담당부서', '조치일', '조치유형', '추천수']
  const rows = data.map((item, index) => {
    const year = item.createdAt?.substring(0, 4) || new Date().getFullYear()
    return [
      `${year}-${index + 1}`,
      `"${item.title}"`,
      `"${item.content?.replace(/"/g, '""')}"`,
      item.authorName,
      item.authorUnit,
      item.authorPosition || '',
      item.authorPhone || '',
      item.createdAt,
      STATUS_LABEL_MAP[item.status] || item.status,
      item.assignedDept || '',
      item.actionDate || '',
      item.actionType || '',
      String(item.recommendCount),
    ].join(',')
  })
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `제언목록_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function SuggestionListPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<Suggestion | null>(null)

  // 상태 관리
  const [newStatus, setNewStatus] = useState<string>('registered')
  const [actionType, setActionType] = useState<string | undefined>(undefined)
  const [actionDateVal, setActionDateVal] = useState<Dayjs | null>(null)
  const [assignedDeptVal, setAssignedDeptVal] = useState('')

  // G20: 반려사유 모달
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // G23: 댓글
  const [commentText, setCommentText] = useState('')
  const [editCommentId, setEditCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState('')

  // G22: 첨부파일 상태
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // G26: 엑셀 출력 로딩
  const [excelLoading, setExcelLoading] = useState(false)

  // 검색 파라미터
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const actionRef = useRef<ActionType>(null)

  const queryClient = useQueryClient()

  const { data: detail } = useQuery({
    queryKey: ['sys14', 'detail', selectedId],
    queryFn: () => fetchDetail(selectedId!),
    enabled: !!selectedId,
  })

  // G24: 댓글 목록
  const { data: comments = [] } = useQuery<SuggestionComment[]>({
    queryKey: ['sys14', 'comments', selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/sys14/suggestions/${selectedId}/comments`)
      const json: ApiResult<SuggestionComment[]> = await res.json()
      return json.data
    },
    enabled: !!selectedId && detailOpen,
  })

  const createMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const res = await fetch('/api/sys14/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('제언이 등록되었습니다')
      setCreateOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const editMutation = useMutation({
    mutationFn: async (values: { title: string; content: string }) => {
      const res = await fetch(`/api/sys14/suggestions/${editTarget?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('제언이 수정되었습니다')
      setEditOpen(false)
      setEditTarget(null)
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/suggestions/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      message.success('제언이 삭제되었습니다')
      setDetailOpen(false)
      setSelectedId(null)
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
    },
  })

  const recommendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/suggestions/${id}/recommend`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sys14', 'detail', selectedId] })
    },
  })

  const reportMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys14/suggestions/${id}/report`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sys14', 'detail', selectedId] })
    },
  })

  // G20: 상태 변경 mutation
  const statusMutation = useMutation({
    mutationFn: async (body: { status: string; actionType?: string; actionDate?: string; rejectReason?: string }) => {
      const res = await fetch(`/api/sys14/suggestions/${selectedId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      return res.json()
    },
    onSuccess: () => {
      message.success('상태가 변경되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys14'] })
      setActionType(undefined)
      setActionDateVal(null)
      setAssignedDeptVal('')
      setRejectReason('')
    },
  })

  // G24: 댓글 CRUD mutations
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/sys14/suggestions/${selectedId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      return res.json()
    },
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['sys14', 'comments', selectedId] })
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const res = await fetch(`/api/sys14/suggestions/${selectedId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      return res.json()
    },
    onSuccess: () => {
      setEditCommentId(null)
      setEditCommentText('')
      queryClient.invalidateQueries({ queryKey: ['sys14', 'comments', selectedId] })
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/sys14/suggestions/${selectedId}/comments/${commentId}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sys14', 'comments', selectedId] })
    },
  })

  // 상태 변경 핸들러 - 반려 시 모달로 사유 입력
  function handleStatusChange() {
    // 반려 상태 선택 시 반려사유 모달 표시
    if (newStatus === 'rejected') {
      setRejectModalOpen(true)
      return
    }
    const body: { status: string; actionType?: string; actionDate?: string; assignedDept?: string } = {
      status: newStatus,
    }
    if (actionType) body.actionType = actionType
    if (actionDateVal) body.actionDate = actionDateVal.format('YYYY-MM-DD')
    if (assignedDeptVal) body.assignedDept = assignedDeptVal
    statusMutation.mutate(body)
  }

  // G20: 반려 확정 (모달에서 사유 입력 후)
  function handleRejectConfirm() {
    if (!rejectReason.trim()) {
      message.warning('반려사유를 입력하세요')
      return
    }
    statusMutation.mutate({
      status: 'rejected',
      rejectReason,
    })
    setRejectModalOpen(false)
  }

  // G24: 댓글 등록 핸들러
  function handleAddComment() {
    if (!commentText.trim()) {
      message.warning('댓글 내용을 입력하세요')
      return
    }
    createCommentMutation.mutate(commentText)
  }

  // G24: 댓글 수정 시작
  function handleEditComment(item: SuggestionComment) {
    setEditCommentId(item.id)
    setEditCommentText(item.content)
  }

  // R2: 검색 필드 정의 (제목, 작성자, 진행상태, 조치유형)
  const searchFields: SearchField[] = [
    { name: 'title', label: '제목', type: 'text' },
    { name: 'author', label: '작성자', type: 'text' },
    { name: 'status', label: '진행상태', type: 'select', options: STATUS_OPTIONS },
    { name: 'actionType', label: '조치유형', type: 'select', options: ACTION_TYPE_OPTIONS },
  ]

  // CSV 스펙: 순번, 제목, 제언자, 작성일, 진행상태, 담당부서, 조치일, 조치유형
  const columns: ProColumns<Suggestion>[] = [
    {
      // 연도별 순번 형식 (ex: 2026-1, 2026-2)
      title: '순번',
      width: 100,
      render: (_, record, index) => {
        const year = record.createdAt?.substring(0, 4) || new Date().getFullYear()
        return `${year}-${index + 1}`
      },
    },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    // R6: 제언자 컬럼 - 군번/계급/성명
    militaryPersonColumn<Suggestion>('제언자', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'authorName',
    }),
    { title: '작성일', dataIndex: 'createdAt', width: 110 },
    {
      title: '진행상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    { title: '담당부서', dataIndex: 'assignedDept', width: 100 },
    { title: '조치일', dataIndex: 'actionDate', width: 110 },
    { title: '조치유형', dataIndex: 'actionType', width: 100 },
  ]

  return (
    <PageContainer title="제언확인">
      {/* R2: 검색영역 - 제목, 작성자, 진행상태, 조치유형 */}
      <SearchForm
        fields={searchFields}
        onSearch={(values) => {
          setSearchParams(values)
          actionRef.current?.reload()
        }}
        onReset={() => {
          setSearchParams({})
          actionRef.current?.reload()
        }}
      />

      <DataTable<Suggestion>
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={async (params) => {
          const result = await fetchSuggestions({
            ...params,
            keyword: searchParams.title as string,
            author: searchParams.author as string,
            status: searchParams.status as string,
            actionType: searchParams.actionType as string,
          })
          return result
        }}
        headerTitle="제언 목록"
        toolBarRender={() => [
          // G26: 엑셀 출력 버튼 - 전체 데이터 조회 후 출력
          <Button
            key="excel"
            icon={<DownloadOutlined />}
            loading={excelLoading}
            onClick={async () => {
              setExcelLoading(true)
              try {
                const allData = await fetchAllSuggestions()
                handleExcelExport(allData)
              } finally {
                setExcelLoading(false)
              }
            }}
          >
            엑셀 출력
          </Button>,
          <Button key="create" type="primary" onClick={() => setCreateOpen(true)}>
            제언 작성
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => {
            setSelectedId(record.id)
            setDetailOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />

      {/* G22: 제언 작성 모달 (로그인 정보 자동 + Upload 폼 통합) */}
      <Modal
        title="제언 작성"
        open={createOpen}
        onCancel={() => { setCreateOpen(false); setFileList([]) }}
        footer={null}
        destroyOnClose
        width={600}
      >
        <CrudForm
          fields={CRUD_FIELDS}
          initialValues={MOCK_USER}
          onFinish={async (values) => {
            // 첨부파일 정보를 함께 전송
            const payload = {
              ...values,
              attachments: fileList.map((f) => ({ name: f.name, url: `/files/${f.name}` })),
            }
            await createMutation.mutateAsync(payload as Record<string, unknown>)
            setFileList([])
            return true
          }}
          mode="create"
        />
        {/* G22: 첨부파일 Upload - 폼과 연동 */}
        <div style={{ marginTop: 12 }}>
          <Text strong>첨부파일</Text>
          <Upload
            listType="text"
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
            beforeUpload={() => false}
            maxCount={5}
          >
            <Button icon={<UploadOutlined />} style={{ marginTop: 4 }}>
              파일 선택 (최대 5개)
            </Button>
          </Upload>
        </div>
      </Modal>

      {/* 제언 수정 모달 */}
      <Modal
        title="제언 수정"
        open={editOpen}
        onCancel={() => { setEditOpen(false); setEditTarget(null) }}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={CRUD_FIELDS}
          initialValues={editTarget ?? {}}
          onFinish={async (values) => {
            await editMutation.mutateAsync(values as { title: string; content: string })
            return true
          }}
          mode="edit"
        />
      </Modal>

      {/* 제언 상세 모달 */}
      <Modal
        title="제언 상세"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedId(null) }}
        footer={
          detail ? (
            <Space>
              <Button
                icon={<LikeOutlined />}
                onClick={() => recommendMutation.mutate(detail.id)}
              >
                추천 {detail.recommendCount}
              </Button>
              <Button
                icon={<WarningOutlined />}
                danger
                onClick={() => reportMutation.mutate(detail.id)}
              >
                신고 {detail.reportCount}
              </Button>
              <Button
                onClick={() => {
                  setEditTarget(detail)
                  setDetailOpen(false)
                  setEditOpen(true)
                }}
              >
                수정
              </Button>
              <Button danger onClick={() => deleteMutation.mutate(detail.id)}>
                삭제
              </Button>
            </Space>
          ) : null
        }
        width={700}
        destroyOnClose
      >
        {detail && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="제목" span={2}>{detail.title}</Descriptions.Item>
              <Descriptions.Item label="작성자">{detail.authorName}</Descriptions.Item>
              <Descriptions.Item label="소속">{detail.authorUnit}</Descriptions.Item>
              {/* G22: 직책, 전화번호 추가 */}
              <Descriptions.Item label="직책">{detail.authorPosition || '-'}</Descriptions.Item>
              <Descriptions.Item label="전화번호">{detail.authorPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="진행상태">
                <StatusBadge
                  status={detail.status}
                  colorMap={STATUS_COLOR_MAP}
                  labelMap={STATUS_LABEL_MAP}
                />
              </Descriptions.Item>
              <Descriptions.Item label="작성일">{detail.createdAt}</Descriptions.Item>
              <Descriptions.Item label="담당부서">{detail.assignedDept || '-'}</Descriptions.Item>
              <Descriptions.Item label="조치유형">{detail.actionType || '-'}</Descriptions.Item>
              <Descriptions.Item label="조치일">{detail.actionDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="내용" span={2}>
                <Text>{detail.content}</Text>
              </Descriptions.Item>
              {/* G22: 첨부파일 */}
              <Descriptions.Item label="첨부파일" span={2}>
                {detail.attachments?.length
                  ? detail.attachments.map((f, i) => <div key={i}>{f.name}</div>)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 답변 영역 */}
            {detail.answer && (
              <>
                <Divider />
                <div style={{ background: '#f5f5f5', padding: '12px 16px', borderRadius: 4 }}>
                  <Title level={5} style={{ marginTop: 0 }}>
                    관리자 답변
                  </Title>
                  <Text>{detail.answer}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      {detail.answeredBy} · {detail.answeredAt}
                    </Text>
                  </div>
                </div>
              </>
            )}

            {/* G21: 반려사유 표시 */}
            {detail.status === 'rejected' && detail.rejectReason && (
              <>
                <Divider />
                <div style={{ background: '#fff2f0', padding: '12px 16px', borderRadius: 4 }}>
                  <Title level={5} style={{ marginTop: 0, color: '#cf1322' }}>반려사유</Title>
                  <Text>{detail.rejectReason}</Text>
                </div>
              </>
            )}

            {/* G19: 상태 관리 패널 */}
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>상태 관리</Text>
              <Space wrap>
                {/* CSV 스펙: 진행상태 (등록, 접수, 진행, 완료, 반려) */}
                <Select
                  value={newStatus}
                  onChange={setNewStatus}
                  style={{ width: 120 }}
                  options={[
                    { label: '등록', value: 'registered' },
                    { label: '접수', value: 'received' },
                    { label: '진행', value: 'processing' },
                    { label: '완료', value: 'completed' },
                    { label: '반려', value: 'rejected' },
                  ]}
                />
                {/* CSV 스펙: 조치유형 (정책반영, 업무추진, 기추진, 업무참고) */}
                <Select
                  value={actionType}
                  onChange={setActionType}
                  placeholder="조치유형"
                  allowClear
                  style={{ width: 120 }}
                  options={[
                    { label: '정책반영', value: '정책반영' },
                    { label: '업무추진', value: '업무추진' },
                    { label: '기추진', value: '기추진' },
                    { label: '업무참고', value: '업무참고' },
                  ]}
                />
                {/* 조치유형 선택 시 조치일 DatePicker 연동 */}
                {actionType && (
                  <DatePicker
                    value={actionDateVal}
                    onChange={setActionDateVal}
                    placeholder="조치일"
                  />
                )}
                {/* 담당부서 입력 */}
                <Input
                  value={assignedDeptVal}
                  onChange={(e) => setAssignedDeptVal(e.target.value)}
                  placeholder="담당부서"
                  style={{ width: 120 }}
                />
                <Button type="primary" onClick={handleStatusChange}>변경</Button>
              </Space>
            </Space>

            {/* G24: 댓글 섹션 */}
            <Divider />
            <Title level={5}>댓글</Title>
            <List
              dataSource={comments}
              locale={{ emptyText: '댓글이 없습니다' }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    ...(item.authorName === '홍길동'
                      ? [
                          editCommentId === item.id ? (
                            <Button
                              key="save"
                              type="link"
                              size="small"
                              onClick={() => updateCommentMutation.mutate({ commentId: item.id, content: editCommentText })}
                            >
                              저장
                            </Button>
                          ) : (
                            <Button key="edit" type="link" size="small" onClick={() => handleEditComment(item)}>
                              수정
                            </Button>
                          ),
                          <Popconfirm
                            key="delete"
                            title="삭제하시겠습니까?"
                            onConfirm={() => deleteCommentMutation.mutate(item.id)}
                          >
                            <Button type="link" size="small" danger>삭제</Button>
                          </Popconfirm>,
                        ]
                      : []),
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <>
                        <Text strong>{item.authorName}</Text>{' '}
                        <Text type="secondary">{item.createdAt}</Text>
                      </>
                    }
                    description={
                      editCommentId === item.id ? (
                        <Input.TextArea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={2}
                        />
                      ) : (
                        item.content
                      )
                    }
                  />
                </List.Item>
              )}
            />
            {/* 댓글 작성 */}
            <Space.Compact style={{ width: '100%', marginTop: 8 }}>
              <Input.TextArea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="댓글을 입력하세요"
                style={{ flex: 1 }}
              />
              <Button type="primary" onClick={handleAddComment}>등록</Button>
            </Space.Compact>
          </>
        )}
      </Modal>
      {/* G20: 반려사유 입력 모달 */}
      <Modal
        title="반려사유 입력"
        open={rejectModalOpen}
        onCancel={() => { setRejectModalOpen(false); setRejectReason('') }}
        onOk={handleRejectConfirm}
        okText="반려 확정"
        cancelText="취소"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary">반려 시 반려사유는 필수입니다.</Text>
        </div>
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="반려사유를 입력하세요"
          autoFocus
        />
      </Modal>
    </PageContainer>
  )
}
