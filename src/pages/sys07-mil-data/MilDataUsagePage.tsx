import { useState } from 'react'
import { Modal, Button, Tag, Form, Input, Select, DatePicker, message, Steps } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { MilDocUsage } from '@/shared/api/mocks/handlers/sys07'

const USAGE_TYPE_OPTIONS = [
  { label: '전체', value: '' },
  { label: '대출', value: 'loan' },
  { label: '열람', value: 'view' },
  { label: '지출', value: 'checkout' },
]

const STATUS_OPTIONS = [
  { label: '전체', value: '' },
  { label: '신청대기', value: 'pending' },
  { label: '승인완료', value: 'approved' },
  { label: '대출중', value: 'on_loan' },
  { label: '반납완료', value: 'returned' },
  { label: '반려', value: 'rejected' },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'gold',
  approved: 'blue',
  on_loan: 'cyan',
  returned: 'green',
  rejected: 'red',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  pending: '신청대기',
  approved: '승인완료',
  on_loan: '대출중',
  returned: '반납완료',
  rejected: '반려',
}

const USAGE_TYPE_LABEL: Record<string, string> = {
  loan: '대출',
  view: '열람',
  checkout: '지출',
}

function securityLevelTag(level: string) {
  const map: Record<string, { color: string; label: string }> = {
    secret: { color: 'red', label: '비밀' },
    confidential: { color: 'orange', label: '대외비' },
    normal: { color: 'blue', label: '일반' },
  }
  const { color, label } = map[level] ?? { color: 'default', label: level }
  return <Tag color={color}>{label}</Tag>
}

// Steps current 계산
function getUsageStep(status: string): number {
  switch (status) {
    case 'pending': return 0
    case 'approved': return 1
    case 'on_loan': return 2
    case 'returned': return 3
    case 'rejected': return 1
    default: return 0
  }
}

async function fetchUsages(params: PageRequest & Record<string, unknown>): Promise<PageResponse<MilDocUsage>> {
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('size', String(params.size))
  if (params.usageType) query.set('usageType', String(params.usageType))
  if (params.status) query.set('status', String(params.status))
  if (params.keyword) query.set('keyword', String(params.keyword))
  const res = await fetch(`/api/sys07/usages?${query}`)
  const json: ApiResult<PageResponse<MilDocUsage>> = await res.json()
  return json.data ?? { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 }
}

export default function MilDataUsagePage() {
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>({})
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedUsage, setSelectedUsage] = useState<MilDocUsage | undefined>()
  const [applyOpen, setApplyOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<MilDocUsage | undefined>()
  const [form] = Form.useForm()
  const [rejectForm] = Form.useForm()
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/sys07/usages/${id}/approve`),
    onSuccess: () => { message.success('승인되었습니다'); queryClient.invalidateQueries({ queryKey: ['sys07-usages'] }) },
    onError: () => message.error('승인에 실패했습니다'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, rejectReason }: { id: string; rejectReason: string }) =>
      apiClient.put(`/sys07/usages/${id}/reject`, { rejectReason }),
    onSuccess: () => {
      message.success('반려되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-usages'] })
      setRejectOpen(false)
      rejectForm.resetFields()
    },
    onError: () => message.error('반려에 실패했습니다'),
  })

  const loanMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/sys07/usages/${id}/loan`),
    onSuccess: () => { message.success('대출처리되었습니다'); queryClient.invalidateQueries({ queryKey: ['sys07-usages'] }) },
    onError: () => message.error('대출처리에 실패했습니다'),
  })

  const returnMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/sys07/usages/${id}/return`),
    onSuccess: () => { message.success('반납처리되었습니다'); queryClient.invalidateQueries({ queryKey: ['sys07-usages'] }) },
    onError: () => message.error('반납처리에 실패했습니다'),
  })

  const applyMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => apiClient.post('/sys07/usages', values),
    onSuccess: () => {
      message.success('신청되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-usages'] })
      setApplyOpen(false)
      form.resetFields()
    },
    onError: () => message.error('신청에 실패했습니다'),
  })

  const searchFields = [
    { name: 'usageType', label: '활용유형', type: 'select' as const, options: USAGE_TYPE_OPTIONS },
    { name: 'status', label: '상태', type: 'select' as const, options: STATUS_OPTIONS },
    { name: 'keyword', label: '성명/군번', type: 'text' as const },
  ]

  const columns: ProColumns<MilDocUsage>[] = [
    {
      title: '활용유형',
      dataIndex: 'usageType',
      width: 80,
      render: (_, r) => <Tag>{USAGE_TYPE_LABEL[r.usageType] ?? r.usageType}</Tag>,
    },
    {
      title: '자료명',
      dataIndex: 'docTitle',
      render: (text, r) => (
        <a onClick={() => { setSelectedUsage(r); setDetailOpen(true) }}>{text as string}</a>
      ),
    },
    { title: '비밀등급', dataIndex: 'securityLevel', width: 90, render: (_, r) => securityLevelTag(r.securityLevel) },
    { title: '성명', dataIndex: 'userName', width: 100 },
    { title: '군번', dataIndex: 'militaryId', width: 100 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '직위', dataIndex: 'position', width: 100 },
    { title: '부대', dataIndex: 'unit', width: 120 },
    { title: '활용일', dataIndex: 'usageDate', width: 110 },
    { title: '반납예정일', dataIndex: 'returnDueDate', width: 110 },
    { title: '반납일', dataIndex: 'returnDate', width: 110, render: (v) => (v as string) ?? '-' },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    {
      title: '처리',
      width: 180,
      render: (_, r) => (
        <>
          {r.status === 'pending' && (
            <>
              <Button size="small" type="link" onClick={() => approveMutation.mutate(r.id)}>승인</Button>
              <Button size="small" type="link" danger onClick={() => { setRejectTarget(r); setRejectOpen(true) }}>반려</Button>
            </>
          )}
          {r.status === 'approved' && (
            <Button size="small" type="link" onClick={() => loanMutation.mutate(r.id)}>대출처리</Button>
          )}
          {r.status === 'on_loan' && (
            <Button size="small" type="link" onClick={() => returnMutation.mutate(r.id)}>반납처리</Button>
          )}
        </>
      ),
    },
  ]

  const toolBarRender = () => [
    <Button key="apply" type="primary" onClick={() => setApplyOpen(true)}>
      열람/대출 신청
    </Button>,
  ]

  // 비밀등급 경고 처리
  const handleApplyFinish = (values: Record<string, unknown>) => {
    applyMutation.mutate(values)
  }

  const [applySecurityLevel, setApplySecurityLevel] = useState<string>('')
  const showSecurityWarning = applySecurityLevel === 'secret' || applySecurityLevel === 'confidential'
  const securityWarningText = applySecurityLevel === 'secret' ? '[비밀]' : applySecurityLevel === 'confidential' ? '[대외비]' : ''

  return (
    <PageContainer title="군사자료 활용 (대출/열람)">
      <SearchForm fields={searchFields} onSearch={setSearchValues} onReset={() => setSearchValues({})} />
      <DataTable<MilDocUsage>
        columns={columns}
        request={async (params) => fetchUsages({ ...params, ...searchValues })}
        rowKey="id"
        toolBarRender={toolBarRender}
      />

      {/* 상세 + Steps 워크플로우 Modal */}
      <Modal
        title="활용 상세 및 진행단계"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedUsage(undefined) }}
        footer={null}
        width={700}
        destroyOnClose
      >
        {selectedUsage && (
          <>
            <Steps
              current={getUsageStep(selectedUsage.status)}
              status={selectedUsage.status === 'rejected' ? 'error' : 'process'}
              items={[
                { title: '신청' },
                { title: '승인' },
                { title: '대출/열람' },
                { title: '반납완료' },
              ]}
              style={{ marginBottom: 24 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              <div><b>활용유형:</b> {USAGE_TYPE_LABEL[selectedUsage.usageType]}</div>
              <div><b>자료명:</b> {selectedUsage.docTitle}</div>
              <div><b>비밀등급:</b> {securityLevelTag(selectedUsage.securityLevel)}</div>
              <div><b>성명:</b> {selectedUsage.userName}</div>
              <div><b>군번:</b> {selectedUsage.militaryId}</div>
              <div><b>계급:</b> {selectedUsage.rank}</div>
              <div><b>직위:</b> {selectedUsage.position}</div>
              <div><b>부대:</b> {selectedUsage.unit}</div>
              <div><b>활용일:</b> {selectedUsage.usageDate}</div>
              <div><b>반납예정일:</b> {selectedUsage.returnDueDate}</div>
              {selectedUsage.returnDate && <div><b>반납일:</b> {selectedUsage.returnDate}</div>}
              {selectedUsage.rejectReason && <div style={{ gridColumn: '1/-1' }}><b>반려사유:</b> {selectedUsage.rejectReason}</div>}
              <div style={{ gridColumn: '1/-1' }}><b>활용목적:</b> {selectedUsage.usagePurpose}</div>
            </div>
          </>
        )}
      </Modal>

      {/* 열람/대출 신청 Modal */}
      <Modal
        title="열람/대출 신청"
        open={applyOpen}
        onCancel={() => { setApplyOpen(false); form.resetFields(); setApplySecurityLevel('') }}
        onOk={() => form.submit()}
        okText="신청"
        cancelText="취소"
        width={600}
        destroyOnClose
      >
        {showSecurityWarning && (
          <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', padding: '12px', marginBottom: 16, borderRadius: 4 }}>
            이 자료는 {securityWarningText} 등급입니다. 열람 사유를 입력하세요.
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleApplyFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="usageType" label="활용유형" rules={[{ required: true, message: '활용유형을 선택하세요' }]}>
              <Select options={[{ label: '대출', value: 'loan' }, { label: '열람', value: 'view' }, { label: '지출', value: 'checkout' }]} placeholder="선택" />
            </Form.Item>
            <Form.Item name="securityLevel" label="비밀등급">
              <Select
                options={[{ label: '비밀', value: 'secret' }, { label: '대외비', value: 'confidential' }, { label: '일반', value: 'normal' }]}
                placeholder="선택"
                onChange={(v) => setApplySecurityLevel(v)}
              />
            </Form.Item>
            <Form.Item name="militaryId" label="군번" rules={[{ required: true, message: '군번을 입력하세요' }]}>
              <Input placeholder="군번 입력" />
            </Form.Item>
            <Form.Item name="userName" label="성명" rules={[{ required: true, message: '성명을 입력하세요' }]}>
              <Input placeholder="성명 입력" />
            </Form.Item>
            <Form.Item name="rank" label="계급">
              <Input placeholder="계급 입력" />
            </Form.Item>
            <Form.Item name="position" label="직위">
              <Input placeholder="직위 입력" />
            </Form.Item>
            <Form.Item name="unit" label="부대">
              <Input placeholder="부대 입력" />
            </Form.Item>
            <Form.Item name="phone" label="연락처">
              <Input placeholder="연락처 입력" />
            </Form.Item>
            <Form.Item name="returnDueDate" label="반납예정일">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item
            name="usagePurpose"
            label="활용목적"
            rules={[{ required: showSecurityWarning, message: '비밀/대외비 자료는 열람 사유를 필수 입력하세요' }]}
          >
            <Input.TextArea rows={3} placeholder="활용목적을 입력하세요" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 반려 Modal */}
      <Modal
        title="반려 처리"
        open={rejectOpen}
        onCancel={() => { setRejectOpen(false); rejectForm.resetFields() }}
        onOk={() => rejectForm.submit()}
        okText="반려"
        cancelText="취소"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={(values) => {
            if (rejectTarget) {
              rejectMutation.mutate({ id: rejectTarget.id, rejectReason: values.rejectReason as string })
            }
          }}
        >
          <Form.Item name="rejectReason" label="반려 사유" rules={[{ required: true, message: '반려 사유를 입력하세요' }]}>
            <Input.TextArea rows={3} placeholder="반려 사유를 입력하세요" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
