import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Statistic,
  Tabs,
  Typography,
  message,
} from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Column } from '@ant-design/charts'
import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { CrudForm } from '@/shared/ui/CrudForm'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type {
  Survey,
  SurveyStatus,
  SurveyCategory,
  SurveyTemplate,
  SurveyTarget,
} from '@/shared/api/mocks/handlers/sys02'

const { TextArea } = Input
const { Text } = Typography

// 승인대기 검색 필드
const pendingSearchFields: SearchField[] = [
  { name: 'keyword', label: '설문명', type: 'text', placeholder: '설문명 검색' },
  { name: 'period', label: '제출기간', type: 'dateRange' },
]

// 승인완료/전체 검색 필드
const allSearchFields: SearchField[] = [
  { name: 'keyword', label: '설문명', type: 'text', placeholder: '설문명 검색' },
  {
    name: 'status',
    label: '상태',
    type: 'select',
    options: [
      { label: '작성중', value: 'draft' },
      { label: '제출됨', value: 'submitted' },
      { label: '승인', value: 'approved' },
      { label: '반려', value: 'rejected' },
      { label: '진행중', value: 'active' },
      { label: '마감', value: 'closed' },
    ],
  },
  { name: 'period', label: '설문기간', type: 'dateRange' },
]

const STATUS_COLOR_MAP: Record<SurveyStatus, string> = {
  draft: 'default',
  submitted: 'orange',
  approved: 'blue',
  rejected: 'red',
  active: 'cyan',
  closed: 'gray',
}

const STATUS_LABEL_MAP: Record<SurveyStatus, string> = {
  draft: '작성중',
  submitted: '제출됨',
  approved: '승인',
  rejected: '반려',
  active: '진행중',
  closed: '마감',
}

// ===== Tab 1: 승인 대기 =====
function PendingTab() {
  const queryClient = useQueryClient()
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string }>({ open: false, id: '' })
  const [rejectForm] = Form.useForm()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'pending', searchParams],
    queryFn: () => apiClient.get<Survey[]>('/sys02/surveys/pending'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/sys02/surveys/${id}/approve`),
    onSuccess: () => {
      message.success('승인되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'pending'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.put(`/sys02/surveys/${id}/reject`, { reason }),
    onSuccess: () => {
      message.success('반려되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'pending'] })
      setRejectModal({ open: false, id: '' })
      rejectForm.resetFields()
    },
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
    },
    {
      title: '등록자',
      dataIndex: 'authorName',
      width: 100,
    },
    {
      title: '제출일',
      dataIndex: 'submittedAt',
      width: 120,
    },
    {
      title: '대상자 수',
      dataIndex: 'targetCount',
      width: 100,
    },
    {
      title: '문항 수',
      dataIndex: 'questionCount',
      width: 80,
    },
    {
      title: '처리',
      width: 160,
      render: (_, record) => (
        <>
          <Button
            type="primary"
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => approveMutation.mutate(record.id)}
            loading={approveMutation.isPending}
          >
            승인
          </Button>
          <Button
            danger
            size="small"
            onClick={() => setRejectModal({ open: true, id: record.id })}
          >
            반려
          </Button>
        </>
      ),
    },
  ]

  return (
    <>
      {/* 검색영역 */}
      <SearchForm
        fields={pendingSearchFields}
        onSearch={(values) => setSearchParams(values)}
        onReset={() => setSearchParams({})}
      />

      <DataTable<Survey>
        columns={columns}
        dataSource={filteredSurveys}
        loading={isLoading}
        rowKey="id"
      />
      <Modal
        title="반려 사유 입력"
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, id: '' })}
        onOk={() => {
          rejectForm.validateFields().then((values) => {
            rejectMutation.mutate({ id: rejectModal.id, reason: values.reason })
          })
        }}
        confirmLoading={rejectMutation.isPending}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="반려 사유"
            rules={[{ required: true, message: '반려 사유를 입력하세요' }]}
          >
            <TextArea rows={4} placeholder="반려 사유를 입력하세요" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

// ===== Tab 2: 전체 설문관리 =====
function AllSurveysTab() {
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'all', searchParams],
    queryFn: () => apiClient.get<{ content: Survey[] }>('/sys02/surveys/all'),
  })

  const surveys = (data as { content: Survey[] } | undefined)?.content || []

  // 검색 필터링 (클라이언트 사이드)
  const filteredSurveys = surveys.filter((s) => {
    if (searchParams.keyword && !s.surveyName.includes(searchParams.keyword as string)) {
      return false
    }
    if (searchParams.status && s.status !== searchParams.status) {
      return false
    }
    return true
  })

  const columns: ProColumns<Survey>[] = [
    {
      title: '설문명',
      dataIndex: 'surveyName',
      width: 200,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      sorter: true,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '등록자',
      dataIndex: 'authorName',
      width: 100,
      sorter: true,
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
  ]

  return (
    <>
      {/* 검색영역 */}
      <SearchForm
        fields={allSearchFields}
        onSearch={(values) => setSearchParams(values)}
        onReset={() => setSearchParams({})}
      />

      <DataTable<Survey>
        columns={columns}
        dataSource={filteredSurveys}
        loading={isLoading}
        rowKey="id"
      />
    </>
  )
}

// ===== Tab 3: 카테고리 관리 =====
function CategoryTab() {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'categories'],
    queryFn: () => apiClient.get<SurveyCategory[]>('/sys02/categories'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Partial<SurveyCategory>) => apiClient.post('/sys02/categories', values),
    onSuccess: () => {
      message.success('카테고리가 등록되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'categories'] })
    },
  })

  const categories = (data as SurveyCategory[] | undefined) || []

  const columns: ProColumns<SurveyCategory>[] = [
    {
      title: '카테고리명',
      dataIndex: 'categoryName',
      width: 200,
    },
    {
      title: '설명',
      dataIndex: 'description',
      width: 300,
    },
    {
      title: '설문 수',
      dataIndex: 'surveyCount',
      width: 100,
    },
    {
      title: '정렬순서',
      dataIndex: 'sortOrder',
      width: 80,
      sorter: true,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 120,
    },
  ]

  return (
    <DataTable<SurveyCategory>
      columns={columns}
      dataSource={categories}
      loading={isLoading}
      rowKey="id"
      toolBarRender={() => [
        <Button
          key="add"
          type="primary"
          onClick={() => {
            Modal.confirm({
              title: '카테고리 추가',
              icon: null,
              content: (
                <CrudForm
                  form={form}
                  onFinish={(values) => createMutation.mutate(values as Partial<SurveyCategory>)}
                  fields={[
                    {
                      name: 'categoryName',
                      label: '카테고리명',
                      rules: [{ required: true, message: '카테고리명을 입력하세요' }],
                      children: <Input maxLength={50} />,
                    },
                    {
                      name: 'description',
                      label: '설명',
                      children: <TextArea maxLength={200} />,
                    },
                    {
                      name: 'sortOrder',
                      label: '정렬순서',
                      rules: [{ required: true, message: '정렬순서를 입력하세요' }],
                      children: <InputNumber style={{ width: '100%' }} />,
                    },
                  ]}
                />
              ),
              onOk: () => {
                form.submit()
              },
            })
          }}
        >
          카테고리 추가
        </Button>,
      ]}
    />
  )
}

// ===== Tab 4: 통계 =====
function StatsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'stats'],
    queryFn: () => apiClient.get('/sys02/stats'),
  })

  const stats = data as {
    totalSurveys: number
    activeSurveys: number
    closedSurveys: number
    averageResponseRate: number
    monthlyStats: { month: string; registered: number; closed: number; responded: number }[]
    categoryStats: { categoryName: string; surveyCount: number; responseRate: number }[]
  } | undefined

  if (isLoading) return <div>로딩 중...</div>

  const barData = (stats?.monthlyStats || []).flatMap((m) => [
    { month: m.month, type: '등록', value: m.registered },
    { month: m.month, type: '마감', value: m.closed },
    { month: m.month, type: '응답', value: m.responded },
  ])

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="총 설문 수" value={stats?.totalSurveys || 0} suffix="건" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="진행중" value={stats?.activeSurveys || 0} suffix="건" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="마감" value={stats?.closedSurveys || 0} suffix="건" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="평균 응답률" value={stats?.averageResponseRate || 0} suffix="%" />
          </Card>
        </Col>
      </Row>
      <Card title="월별 설문 통계" style={{ marginBottom: 16 }}>
        <Column
          data={barData}
          xField="month"
          yField="value"
          colorField="type"
          group={true}
          height={300}
        />
      </Card>
    </>
  )
}

// ===== Tab 5: 대상자 관리 =====
function TargetTab() {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')

  const { data: surveysData } = useQuery({
    queryKey: ['sys02', 'surveys'],
    queryFn: () => apiClient.get<{ content: Survey[] }>('/sys02/surveys'),
  })

  const { data: targetsData, isLoading } = useQuery({
    queryKey: ['sys02', 'targets', selectedSurveyId],
    queryFn: () => apiClient.get<SurveyTarget[]>(`/sys02/surveys/${selectedSurveyId}/targets`),
    enabled: !!selectedSurveyId,
  })

  const surveys = (surveysData as { content: Survey[] } | undefined)?.content || []
  const targets = (targetsData as SurveyTarget[] | undefined) || []

  const columns: ProColumns<SurveyTarget>[] = [
    // 군번/계급/성명 통합 컬럼
    militaryPersonColumn<SurveyTarget>('대상자(군번/계급/성명)', {
      serviceNumber: 'serviceNumber',
      rank: 'targetRank',
      name: 'targetName',
    }),
    {
      title: '소속부대',
      dataIndex: 'targetUnit',
      width: 150,
    },
    {
      title: '응답 여부',
      dataIndex: 'isResponded',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.isResponded ? 'responded' : 'not_responded'}
          colorMap={{ responded: 'green', not_responded: 'default' }}
          labelMap={{ responded: '완료', not_responded: '미응답' }}
        />
      ),
    },
    {
      title: '응답일시',
      dataIndex: 'respondedAt',
      width: 150,
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="설문을 선택하세요"
          style={{ width: 300 }}
          onChange={setSelectedSurveyId}
          options={surveys.map((s) => ({ label: s.surveyName, value: s.id }))}
        />
      </div>
      <DataTable<SurveyTarget>
        columns={columns}
        dataSource={targets}
        loading={isLoading}
        rowKey="id"
        toolBarRender={() => [
          <Button key="add" type="primary">
            대상자 추가
          </Button>,
          <Button key="notify">미응답자 알림</Button>,
        ]}
      />
    </>
  )
}

// ===== Tab 6: 설문 템플릿 =====
function TemplateTab() {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'templates'],
    queryFn: () => apiClient.get<SurveyTemplate[]>('/sys02/templates'),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['sys02', 'categories'],
    queryFn: () => apiClient.get<SurveyCategory[]>('/sys02/categories'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Partial<SurveyTemplate>) => apiClient.post('/sys02/templates', values),
    onSuccess: () => {
      message.success('템플릿이 등록되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'templates'] })
    },
  })

  const templates = (data as SurveyTemplate[] | undefined) || []
  const categories = (categoriesData as SurveyCategory[] | undefined) || []

  const columns: ProColumns<SurveyTemplate>[] = [
    {
      title: '템플릿명',
      dataIndex: 'templateName',
      width: 200,
    },
    {
      title: '설명',
      dataIndex: 'description',
      width: 250,
    },
    {
      title: '카테고리',
      dataIndex: 'categoryId',
      width: 120,
      render: (_, record) =>
        categories.find((c) => c.id === record.categoryId)?.categoryName || record.categoryId,
    },
    {
      title: '문항 수',
      dataIndex: 'questionCount',
      width: 80,
    },
    {
      title: '작성자',
      dataIndex: 'authorName',
      width: 100,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 120,
    },
    {
      title: '관리',
      width: 140,
      render: () => (
        <Button size="small" type="primary">
          이 템플릿으로 설문 생성
        </Button>
      ),
    },
  ]

  return (
    <DataTable<SurveyTemplate>
      columns={columns}
      dataSource={templates}
      loading={isLoading}
      rowKey="id"
      toolBarRender={() => [
        <Button
          key="add"
          type="primary"
          onClick={() => {
            Modal.confirm({
              title: '템플릿 등록',
              icon: null,
              content: (
                <CrudForm
                  form={form}
                  onFinish={(values) => createMutation.mutate(values as Partial<SurveyTemplate>)}
                  fields={[
                    {
                      name: 'templateName',
                      label: '템플릿명',
                      rules: [{ required: true, message: '템플릿명을 입력하세요' }],
                      children: <Input maxLength={100} />,
                    },
                    {
                      name: 'description',
                      label: '설명',
                      children: <TextArea maxLength={500} />,
                    },
                    {
                      name: 'categoryId',
                      label: '카테고리',
                      rules: [{ required: true, message: '카테고리를 선택하세요' }],
                      children: (
                        <Select
                          options={categories.map((c) => ({ label: c.categoryName, value: c.id }))}
                        />
                      ),
                    },
                  ]}
                />
              ),
              onOk: () => form.submit(),
            })
          }}
        >
          템플릿 등록
        </Button>,
      ]}
    />
  )
}

// ===== 메인: 체계관리 6탭 (SURV-04) =====
export default function SurveyAdminPage() {
  const tabItems = [
    {
      key: 'pending',
      label: '승인 대기',
      children: <PendingTab />,
    },
    {
      key: 'all',
      label: '전체 설문관리',
      children: <AllSurveysTab />,
    },
    {
      key: 'categories',
      label: '카테고리 관리',
      children: <CategoryTab />,
    },
    {
      key: 'stats',
      label: '통계',
      children: <StatsTab />,
    },
    {
      key: 'targets',
      label: '대상자 관리',
      children: <TargetTab />,
    },
    {
      key: 'templates',
      label: '설문 템플릿',
      children: <TemplateTab />,
    },
  ]

  return (
    <PageContainer title="체계관리">
      <Tabs items={tabItems} defaultActiveKey="pending" />
    </PageContainer>
  )
}
