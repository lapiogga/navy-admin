import { useState, useRef } from 'react'
import { Tabs, Modal, Form, Input, InputNumber, Select, Button, message, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Column, Pie, Line } from '@ant-design/charts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { militaryPersonColumn } from '@/shared/lib/military'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { SecurityLevelRecord, SecurityLevelStats } from '@/shared/api/mocks/handlers/sys15-security'

const { TextArea } = Input
const { Dragger } = Upload

const GRADE_COLOR_MAP: Record<string, string> = {
  A: 'green',
  B: 'blue',
  C: 'orange',
  D: 'red',
}
const GRADE_LABEL_MAP: Record<string, string> = {
  A: 'A등급',
  B: 'B등급',
  C: 'C등급',
  D: 'D등급',
}
const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  approved: 'green',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  approved: '승인',
}

async function fetchSecurityLevels(params: PageRequest & { evalType?: string }): Promise<PageResponse<SecurityLevelRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SecurityLevelRecord>>>('/sys15/security-level', {
    params: { page: params.page, size: params.size, evalType: params.evalType },
  })
  const data = (res as ApiResult<PageResponse<SecurityLevelRecord>>).data ?? (res as unknown as PageResponse<SecurityLevelRecord>)
  return data
}

async function fetchStats(): Promise<SecurityLevelStats> {
  const res = await apiClient.get<never, ApiResult<SecurityLevelStats>>('/sys15/security-level/stats')
  const data = (res as ApiResult<SecurityLevelStats>).data ?? (res as unknown as SecurityLevelStats)
  return data
}

interface EvalModalProps {
  open: boolean
  evalType: '수시' | '정기'
  record?: SecurityLevelRecord | null
  onClose: () => void
  onSuccess: () => void
}

function EvalModal({ open, evalType, record, onClose, onSuccess }: EvalModalProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const saveMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => {
      if (record) {
        return apiClient.put(`/sys15/security-level/${record.id}`, values)
      }
      return apiClient.post('/sys15/security-level', { ...values, evalType })
    },
    onSuccess: () => {
      message.success('저장되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-security-level'] })
      form.resetFields()
      onSuccess()
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  function calcGrade(score: number): 'A' | 'B' | 'C' | 'D' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    return 'D'
  }

  function handleOk() {
    form.validateFields().then((values) => {
      const totalScore = evalType === '정기'
        ? (values.score1 + values.score2 + values.score3 + values.score4 + values.score5) / 5 + (values.bonus ?? 0) - (values.deduction ?? 0)
        : values.score + (values.bonus ?? 0) - (values.deduction ?? 0)
      const grade = calcGrade(Math.round(totalScore))
      saveMutation.mutate({ ...values, score: Math.round(totalScore), grade })
    })
  }

  return (
    <Modal
      title={record ? '평가 수정' : `${evalType}평가 입력`}
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose() }}
      confirmLoading={saveMutation.isPending}
      okText="저장"
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={record ? {
          targetName: record.targetName,
          department: record.department,
          evalDate: record.evalDate,
          evaluator: record.evaluator,
          score: record.score,
        } : undefined}
      >
        <Form.Item name="targetName" label="대상자 성명" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="department" label="부대(서)" rules={[{ required: true }]}>
          <Select options={[
            { value: '1함대', label: '1함대' },
            { value: '2함대', label: '2함대' },
            { value: '3함대', label: '3함대' },
            { value: '해군사령부', label: '해군사령부' },
            { value: '교육사령부', label: '교육사령부' },
          ]} />
        </Form.Item>
        <Form.Item name="evalDate" label="평가일자" rules={[{ required: true }]}>
          <Input type="date" />
        </Form.Item>
        <Form.Item name="evaluator" label="평가자" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        {evalType === '정기' ? (
          <>
            <Form.Item name="score1" label="보안인식 (100점)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="score2" label="비밀관리 (100점)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="score3" label="매체관리 (100점)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="score4" label="시설보안 (100점)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="score5" label="개인보안 (100점)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </>
        ) : (
          <Form.Item name="score" label="평가점수 (100점)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        )}

        <Form.Item name="bonus" label="가점">
          <InputNumber min={0} max={10} style={{ width: '100%' }} defaultValue={0} />
        </Form.Item>
        <Form.Item name="deduction" label="감점">
          <InputNumber min={0} max={10} style={{ width: '100%' }} defaultValue={0} />
        </Form.Item>
        <Form.Item name="notes" label="특이사항">
          <TextArea rows={2} />
        </Form.Item>

        {evalType === '정기' && (
          <Form.Item name="attachments" label="관련근거 첨부 (체계관리자 전용)">
            <Dragger name="files" multiple>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">파일을 드래그하거나 클릭하여 업로드</p>
            </Dragger>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

function SecurityLevelEvalTab({ evalType }: { evalType: '수시' | '정기' }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<SecurityLevelRecord | null>(null)
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sys15/security-level/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-security-level'] })
    },
  })

  // 검색 필드 (CSV line 52: 검색기능 추가)
  const evalSearchFields: SearchField[] = [
    { name: 'keyword', label: '대상자', type: 'text', placeholder: '성명 검색' },
    { name: 'department', label: '부대(서)', type: 'select', options: [
      { label: '1함대', value: '1함대' },
      { label: '2함대', value: '2함대' },
      { label: '3함대', value: '3함대' },
      { label: '해군사령부', value: '해군사령부' },
      { label: '교육사령부', value: '교육사령부' },
    ] },
    { name: 'dateRange', label: '평가기간', type: 'dateRange' },
  ]

  const columns: ProColumns<SecurityLevelRecord>[] = [
    { title: '평가일자', dataIndex: 'evalDate', width: 120 },
    militaryPersonColumn<SecurityLevelRecord>('대상자', { serviceNumber: 'targetServiceNumber', rank: 'targetRank', name: 'targetName' }),
    { title: '부대(서)', dataIndex: 'department', width: 120 },
    {
      title: '점수',
      dataIndex: 'score',
      width: 80,
      render: (val: unknown) => <span>{String(val)}점</span>,
    },
    {
      title: '등급',
      dataIndex: 'grade',
      width: 80,
      render: (val: unknown) => (
        <StatusBadge status={String(val)} colorMap={GRADE_COLOR_MAP} labelMap={GRADE_LABEL_MAP} />
      ),
    },
    militaryPersonColumn<SecurityLevelRecord>('평가자', { serviceNumber: 'evaluatorServiceNumber', rank: 'evaluatorRank', name: 'evaluator' }),
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (val: unknown) => (
        <StatusBadge status={String(val)} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />
      ),
    },
    {
      title: '작업',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" size="small"
          onClick={() => { setEditRecord(record); setModalOpen(true) }}
        >수정</Button>,
        <Button key="del" type="link" size="small" danger
          onClick={() => showConfirmDialog({
            title: '삭제 확인',
            content: '평가를 삭제하시겠습니까?',
            onOk: () => deleteMutation.mutateAsync(record.id),
          })}
        >삭제</Button>,
      ],
    },
  ]

  return (
    <div>
      <SearchForm
        fields={evalSearchFields}
        onSearch={() => actionRef.current?.reload()}
        onReset={() => actionRef.current?.reload()}
      />
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setEditRecord(null); setModalOpen(true) }}>
          평가 입력
        </Button>
      </div>
      <DataTable<SecurityLevelRecord>
        actionRef={actionRef}
        queryKey={['sys15-security-level', evalType]}
        fetchFn={(params) => fetchSecurityLevels({ ...params, evalType })}
        columns={columns}
      />
      <EvalModal
        open={modalOpen}
        evalType={evalType}
        record={editRecord}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); actionRef.current?.reload() }}
      />
    </div>
  )
}

function SecurityLevelStatsTab() {
  const { data: stats } = useQuery({
    queryKey: ['sys15-security-level-stats'],
    queryFn: fetchStats,
  })

  const barData = (stats?.trend ?? []).map((t) => ({
    month: t.month,
    avgScore: t.avgScore,
  }))

  const pieData = (stats?.gradeDistribution ?? []).map((g) => ({
    type: g.grade + '등급',
    value: g.count,
  }))

  const lineData = (stats?.trend ?? []).map((t) => ({
    month: t.month,
    avgScore: t.avgScore,
  }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
        <h4>부대별 평가 현황 (Bar)</h4>
        <Bar
          data={barData}
          xField="month"
          yField="avgScore"
          height={250}
          meta={{ month: { alias: '월' }, avgScore: { alias: '평균점수' } }}
        />
      </div>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
        <h4>등급분포 (Pie)</h4>
        <Pie
          data={pieData}
          angleField="value"
          colorField="type"
          height={250}
          label={{ type: 'inner', offset: '-30%' }}
        />
      </div>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, gridColumn: 'span 2' }}>
        <h4>기간별 추이 (Line)</h4>
        <Line
          data={lineData}
          xField="month"
          yField="avgScore"
          height={250}
          meta={{ month: { alias: '월' }, avgScore: { alias: '평균점수' } }}
          point={{ size: 5, shape: 'circle' }}
        />
      </div>
    </div>
  )
}

export default function SecurityLevelPage() {
  const tabItems = [
    {
      key: 'irregular',
      label: '수시평가',
      children: <SecurityLevelEvalTab evalType="수시" />,
    },
    {
      key: 'regular',
      label: '정기평가',
      children: <SecurityLevelEvalTab evalType="정기" />,
    },
    {
      key: 'stats',
      label: '통계',
      children: <SecurityLevelStatsTab />,
    },
  ]

  return (
    <PageContainer title="보안수준평가">
      <Tabs defaultActiveKey="irregular" items={tabItems} />
    </PageContainer>
  )
}

// Bar를 Column으로 임포트 (실제 @ant-design/charts에서 Column이 Bar chart임)
function Bar(props: Parameters<typeof Column>[0]) {
  return <Column {...props} />
}
