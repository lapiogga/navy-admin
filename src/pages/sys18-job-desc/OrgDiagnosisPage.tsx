import { useState, useRef } from 'react'
import { Button, Modal, message, Tooltip, Form, Input, Select, DatePicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OrgDiagnosis } from '@/shared/api/mocks/handlers/sys18'

const { RangePicker } = DatePicker

// 검색 필드 정의
const SEARCH_FIELDS: SearchField[] = [
  { name: 'diagnosisName', label: '조직진단명', type: 'text', placeholder: '조직진단명 검색' },
  { name: 'diagnosisUnit', label: '부대(서)', type: 'select', options: [
    { label: '해병대사령부', value: '해병대사령부' },
    { label: '1사단', value: '1사단' },
    { label: '2사단', value: '2사단' },
    { label: '교육훈련단', value: '교육훈련단' },
    { label: '상륙기동단', value: '상륙기동단' },
  ]},
  { name: 'progressStatus', label: '진행상태', type: 'select', options: [
    { label: '준비중', value: 'preparing' },
    { label: '진행중', value: 'inProgress' },
    { label: '완료', value: 'completed' },
  ]},
]

const PROGRESS_STATUS_COLOR_MAP: Record<string, string> = {
  preparing: 'orange',
  inProgress: 'blue',
  completed: 'green',
}

const PROGRESS_STATUS_LABEL_MAP: Record<string, string> = {
  preparing: '준비중',
  inProgress: '진행중',
  completed: '완료',
}

const UNIT_OPTIONS = [
  { label: '해병대사령부', value: '해병대사령부' },
  { label: '1사단', value: '1사단' },
  { label: '2사단', value: '2사단' },
  { label: '교육훈련단', value: '교육훈련단' },
  { label: '상륙기동단', value: '상륙기동단' },
]

const USER_OPTIONS = [
  { label: '홍길동 (대위)', value: 'user-1' },
  { label: '김철수 (소령)', value: 'user-2' },
  { label: '이영희 (중위)', value: 'user-3' },
  { label: '박민준 (대위)', value: 'user-4' },
  { label: '최지수 (중위)', value: 'user-5' },
]

// 제외대상자 옵션
const EXCLUDE_USER_OPTIONS = [
  { label: '정대현 (상사)', value: 'user-6' },
  { label: '한민호 (중사)', value: 'user-7' },
  { label: '오지현 (하사)', value: 'user-8' },
]

async function fetchOrgDiagnoses(params: PageRequest & Record<string, unknown>): Promise<PageResponse<OrgDiagnosis>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OrgDiagnosis>>>('/sys18/org-diagnosis', {
    params: { page: params.page, size: params.size, ...params },
  })
  const data = (res as ApiResult<PageResponse<OrgDiagnosis>>).data ?? (res as unknown as PageResponse<OrgDiagnosis>)
  return data
}

export default function OrgDiagnosisPage() {
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()
  const [crudOpen, setCrudOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<OrgDiagnosis | null>(null)
  const [form] = Form.useForm()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const createMutation = useMutation({
    mutationFn: (data: Partial<OrgDiagnosis>) => apiClient.post('/sys18/org-diagnosis', data),
    onSuccess: () => {
      message.success('등록되었습니다.')
      setCrudOpen(false)
      form.resetFields()
      actionRef.current?.reload()
      queryClient.invalidateQueries({ queryKey: ['sys18-org-diagnosis'] })
    },
    onError: () => message.error('등록에 실패했습니다.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrgDiagnosis> }) =>
      apiClient.put(`/sys18/org-diagnosis/${id}`, data),
    onSuccess: () => {
      message.success('수정되었습니다.')
      setCrudOpen(false)
      setEditRecord(null)
      form.resetFields()
      actionRef.current?.reload()
    },
    onError: () => message.error('수정에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sys18/org-diagnosis/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      actionRef.current?.reload()
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  // 진단기간 이전인지 확인 (이전이면 수정/삭제 활성화)
  const isEditable = (record: OrgDiagnosis): boolean => {
    return dayjs().isBefore(dayjs(record.diagnosisPeriodStart))
  }

  const handleOpenEdit = (record: OrgDiagnosis) => {
    setEditRecord(record)
    form.setFieldsValue({
      diagnosisName: record.diagnosisName,
      diagnosisUnit: record.diagnosisUnit,
      writePeriod: [dayjs(record.writePeriodStart), dayjs(record.writePeriodEnd)],
      diagnosisPeriod: [dayjs(record.diagnosisPeriodStart), dayjs(record.diagnosisPeriodEnd)],
      targetUsers: record.targetUsers,
      excludedUsers: record.excludedUsers,
    })
    setCrudOpen(true)
  }

  // 검색 처리
  const handleSearch = (values: Record<string, unknown>) => {
    setSearchParams(values)
    actionRef.current?.reload()
  }

  const handleSearchReset = () => {
    setSearchParams({})
    actionRef.current?.reload()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: Partial<OrgDiagnosis> = {
        diagnosisName: values.diagnosisName,
        diagnosisUnit: values.diagnosisUnit,
        writePeriodStart: values.writePeriod[0].format('YYYY-MM-DD'),
        writePeriodEnd: values.writePeriod[1].format('YYYY-MM-DD'),
        diagnosisPeriodStart: values.diagnosisPeriod[0].format('YYYY-MM-DD'),
        diagnosisPeriodEnd: values.diagnosisPeriod[1].format('YYYY-MM-DD'),
        targetUsers: values.targetUsers,
        targetCount: (values.targetUsers as string[]).length,
        excludedUsers: values.excludedUsers ?? [],
        excludedCount: ((values.excludedUsers as string[]) ?? []).length,
      }
      if (editRecord) {
        await updateMutation.mutateAsync({ id: editRecord.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch {
      // 유효성 검사 실패
    }
  }

  const columns: ProColumns<OrgDiagnosis>[] = [
    {
      title: '조직진단명',
      dataIndex: 'diagnosisName',
      render: (text, record) => (
        <a onClick={() => handleOpenEdit(record)}>{text as string}</a>
      ),
    },
    { title: '부대(서)', dataIndex: 'diagnosisUnit', width: 130 },
    { title: '작성기간 시작', dataIndex: 'writePeriodStart', width: 120 },
    { title: '작성기간 종료', dataIndex: 'writePeriodEnd', width: 120 },
    { title: '진단기간 시작', dataIndex: 'diagnosisPeriodStart', width: 120 },
    { title: '진단기간 종료', dataIndex: 'diagnosisPeriodEnd', width: 120 },
    { title: '대상자 수', dataIndex: 'targetCount', width: 90 },
    { title: '제외대상자 수', dataIndex: 'excludedCount', width: 110 },
    {
      title: '진행상태',
      dataIndex: 'progressStatus',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.progressStatus}
          colorMap={PROGRESS_STATUS_COLOR_MAP}
          labelMap={PROGRESS_STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '관리',
      valueType: 'option',
      width: 120,
      render: (_, record) => {
        const editable = isEditable(record)
        return [
          editable ? (
            <Button
              key="edit"
              type="link"
              size="small"
              onClick={() => handleOpenEdit(record)}
            >
              수정
            </Button>
          ) : (
            <Tooltip key="edit" title="진단기간 이후에는 수정/삭제할 수 없습니다.">
              <Button type="link" size="small" disabled>수정</Button>
            </Tooltip>
          ),
          editable ? (
            <Button
              key="delete"
              type="link"
              size="small"
              danger
              onClick={() => {
                Modal.confirm({
                  title: '삭제 확인',
                  content: '조직진단 대상을 삭제하시겠습니까?',
                  okType: 'danger',
                  onOk: () => deleteMutation.mutate(record.id),
                })
              }}
            >
              삭제
            </Button>
          ) : (
            <Tooltip key="delete" title="진단기간 이후에는 수정/삭제할 수 없습니다.">
              <Button type="link" size="small" danger disabled>삭제</Button>
            </Tooltip>
          ),
        ]
      },
    },
  ]

  return (
    <PageContainer title="조직진단 대상 관리">
      {/* 검색 영역 */}
      <SearchForm fields={SEARCH_FIELDS} onSearch={handleSearch} onReset={handleSearchReset} />

      <DataTable<OrgDiagnosis>
        columns={columns}
        request={(params) => fetchOrgDiagnoses({ ...params, ...searchParams })}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="조직진단 목록"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditRecord(null); form.resetFields(); setCrudOpen(true) }}
          >
            신규 등록
          </Button>,
        ]}
      />

      <Modal
        open={crudOpen}
        title={editRecord ? '조직진단 수정' : '조직진단 등록'}
        onCancel={() => { setCrudOpen(false); setEditRecord(null); form.resetFields() }}
        onOk={handleSubmit}
        okText={editRecord ? '수정' : '등록'}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="diagnosisName"
            label="조직진단명"
            rules={[{ required: true, message: '조직진단명을 입력하세요' }, { max: 100 }]}
          >
            <Input placeholder="조직진단명 입력" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="diagnosisUnit"
            label="진단 부대(서)"
            rules={[{ required: true, message: '부대(서)를 입력하세요' }, { max: 100 }]}
          >
            <Input placeholder="부대(서) 입력" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="writePeriod"
            label="작성기간"
            rules={[{ required: true, message: '작성기간을 선택하세요' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="diagnosisPeriod"
            label="진단기간"
            rules={[{ required: true, message: '진단기간을 선택하세요' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="targetUsers"
            label="대상자"
          >
            <Select
              mode="multiple"
              options={USER_OPTIONS}
              placeholder="대상자 선택"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="excludedUsers"
            label="제외대상자"
          >
            <Select
              mode="multiple"
              options={EXCLUDE_USER_OPTIONS}
              placeholder="제외대상자 선택"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name="diagnosisUnit2"
            label="부대(서) 선택"
          >
            <Select options={UNIT_OPTIONS} placeholder="부대(서) 선택" allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
