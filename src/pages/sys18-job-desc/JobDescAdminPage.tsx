import { useState, useRef } from 'react'
import { Tabs, Modal, Form, Select, Input, Button, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Bar, Column, Pie } from '@ant-design/charts'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { DatePicker } from 'antd'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { PrintableReport } from '@/shared/ui/PrintableReport/PrintableReport'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { JobDesc, JobDescType } from '@/shared/api/mocks/handlers/sys18'

const { RangePicker } = DatePicker
const { TextArea } = Input

// 상태 컬러맵
const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  submitted: 'processing',
  approved_1st: 'warning',
  completed: 'success',
  rejected: 'error',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '작성중',
  submitted: '제출완료',
  approved_1st: '1차승인',
  completed: '최종완료',
  rejected: '반려',
}

interface AdminJobDesc extends JobDesc {
  reviewResult?: '적합' | '수정필요' | '부적합'
  reviewComment?: string
}

interface UnitStat extends Record<string, unknown> {
  unit: string
  completed: number
  inProgress: number
  notStarted: number
}

interface RankStat extends Record<string, unknown> {
  rank: string
  count: number
}

interface TaskTypeStat extends Record<string, unknown> {
  taskType: string
  count: number
}

interface SearchFilter {
  diagnosisName?: string
  dateRange?: [Dayjs | null, Dayjs | null]
  unit?: string
  position?: string
}

// 검토결과 입력 Modal
function ReviewModal({
  open,
  record,
  onClose,
  onSubmit,
}: {
  open: boolean
  record: AdminJobDesc | null
  onClose: () => void
  onSubmit: (id: string, values: { reviewResult: string; reviewComment: string }) => void
}) {
  const [form] = Form.useForm()
  return (
    <Modal
      title="검토결과 입력"
      open={open}
      onCancel={() => { form.resetFields(); onClose() }}
      onOk={() => {
        form.validateFields().then((values: { reviewResult: string; reviewComment: string }) => {
          if (record) onSubmit(record.id, values)
          form.resetFields()
          onClose()
        }).catch(() => {})
      }}
      okText="확인"
      cancelText="취소"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="reviewResult" label="검토결과" rules={[{ required: true, message: '검토결과를 선택하세요' }]}>
          <Select
            placeholder="검토결과 선택"
            options={[
              { label: '적합', value: '적합' },
              { label: '수정필요', value: '수정필요' },
              { label: '부적합', value: '부적합' },
            ]}
          />
        </Form.Item>
        <Form.Item name="reviewComment" label="검토의견" rules={[{ required: true, message: '검토의견을 입력하세요' }, { max: 500, message: '500자 이내로 입력하세요' }]}>
          <TextArea rows={4} placeholder="검토의견을 입력하세요 (최대 500자)" maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}

// 의견보내기 Modal
function OpinionModal({
  open,
  record,
  onClose,
  onSubmit,
}: {
  open: boolean
  record: AdminJobDesc | null
  onClose: () => void
  onSubmit: (id: string, values: { opinionContent: string }) => void
}) {
  const [form] = Form.useForm()
  return (
    <Modal
      title="의견 보내기"
      open={open}
      onCancel={() => { form.resetFields(); onClose() }}
      onOk={() => {
        form.validateFields().then((values: { opinionContent: string }) => {
          if (record) onSubmit(record.id, values)
          form.resetFields()
          onClose()
        }).catch(() => {})
      }}
      okText="보내기"
      cancelText="취소"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="opinionContent" label="의견 내용" rules={[{ required: true, message: '의견 내용을 입력하세요' }, { max: 500, message: '500자 이내로 입력하세요' }]}>
          <TextArea rows={4} placeholder="의견 내용을 입력하세요 (최대 500자)" maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}

// 반송 Modal
function ReturnModal({
  open,
  record,
  onClose,
  onSubmit,
}: {
  open: boolean
  record: AdminJobDesc | null
  onClose: () => void
  onSubmit: (id: string, values: { returnReason: string }) => void
}) {
  const [form] = Form.useForm()
  return (
    <Modal
      title="직무기술서 반송"
      open={open}
      onCancel={() => { form.resetFields(); onClose() }}
      onOk={() => {
        form.validateFields().then((values: { returnReason: string }) => {
          if (record) onSubmit(record.id, values)
          form.resetFields()
          onClose()
        }).catch(() => {})
      }}
      okText="확인"
      cancelText="취소"
      okButtonProps={{ danger: true }}
    >
      <p style={{ marginBottom: 12 }}>해당 직무기술서를 반송하시겠습니까?</p>
      <Form form={form} layout="vertical">
        <Form.Item name="returnReason" label="반송사유" rules={[{ required: true, message: '반송사유를 입력하세요' }, { max: 500, message: '500자 이내로 입력하세요' }]}>
          <TextArea rows={4} placeholder="반송사유를 입력하세요 (최대 500자)" maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}

// 인쇄 미리보기 Modal
function PrintPreviewModal({ open, onClose, data }: { open: boolean; onClose: () => void; data: AdminJobDesc[] }) {
  return (
    <Modal title="직무기술서 관리자 목록 인쇄 미리보기" open={open} onCancel={onClose} footer={null} width={900}>
      <PrintableReport title="직무기술서 관리자 목록">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['진단명', '작성자', '부대(서)', '직위', '계급', '상태', '제출일'].map((h) => (
                <th key={h} style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f5f5f5', textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.diagnosisName}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.writerName}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.unit}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.position}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.rank}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{STATUS_LABEL_MAP[r.status] ?? r.status}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{r.submittedAt ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintableReport>
    </Modal>
  )
}

// 개인/부서 직무기술서 탭 공통 컴포넌트
function JobDescTab({ type }: { type: JobDescType }) {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [filter, setFilter] = useState<SearchFilter>({})
  const [reviewModal, setReviewModal] = useState<{ open: boolean; record: AdminJobDesc | null }>({ open: false, record: null })
  const [opinionModal, setOpinionModal] = useState<{ open: boolean; record: AdminJobDesc | null }>({ open: false, record: null })
  const [returnModal, setReturnModal] = useState<{ open: boolean; record: AdminJobDesc | null }>({ open: false, record: null })
  const [printModal, setPrintModal] = useState(false)
  const [printData, setPrintData] = useState<AdminJobDesc[]>([])

  const reviewMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: { reviewResult: string; reviewComment: string } }) => {
      const res = await fetch(`/api/sys18/job-descs/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json() as Promise<ApiResult<null>>
    },
    onSuccess: () => {
      void message.success('검토결과가 입력되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys18-admin-list'] })
      actionRef.current?.reload()
    },
  })

  const opinionMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: { opinionContent: string } }) => {
      const res = await fetch(`/api/sys18/job-descs/${id}/opinion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json() as Promise<ApiResult<null>>
    },
    onSuccess: () => {
      void message.success('의견이 전송되었습니다')
    },
  })

  const returnMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: { returnReason: string } }) => {
      const res = await fetch(`/api/sys18/job-descs/${id}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json() as Promise<ApiResult<null>>
    },
    onSuccess: () => {
      void message.success('직무기술서가 반송되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys18-admin-list'] })
      actionRef.current?.reload()
    },
  })

  const columns: ProColumns<AdminJobDesc>[] = [
    { title: '진단명', dataIndex: 'diagnosisName', width: 180, ellipsis: true },
    { title: '작성자', dataIndex: 'writerName', width: 100 },
    { title: '부대(서)', dataIndex: 'department', width: 120 },
    { title: '직위', dataIndex: 'position', width: 120, ellipsis: true },
    { title: '계급', dataIndex: 'rank', width: 80 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge status={record.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />
      ),
    },
    { title: '제출일', dataIndex: 'submittedAt', width: 110, render: (v) => (v as string) || '-' },
    { title: '검토결과', dataIndex: 'reviewResult', width: 100, render: (v) => (v as string) || '-' },
    {
      title: '액션',
      key: 'action',
      fixed: 'right',
      width: 230,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => void message.info(`ID: ${record.id} 상세 조회`)}>상세</Button>
          <Button size="small" type="primary" onClick={() => setReviewModal({ open: true, record })}>검토결과 입력</Button>
          <Button size="small" onClick={() => setOpinionModal({ open: true, record })}>의견 보내기</Button>
          <Button size="small" danger onClick={() => setReturnModal({ open: true, record })}>반송</Button>
        </div>
      ),
    },
  ]

  const fetchList = async (params: { page: number; size: number }): Promise<PageResponse<AdminJobDesc>> => {
    const query = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      type,
    })
    if (filter.unit) query.set('unit', filter.unit)
    const res = await fetch(`/api/sys18/job-descs/admin?${query}`)
    const json: ApiResult<PageResponse<AdminJobDesc>> = await res.json()
    if (!json.success) throw new Error('관리자 직무기술서 목록 조회 실패')
    return json.data
  }

  const handlePrint = async () => {
    const res = await fetch(`/api/sys18/job-descs/admin?page=0&size=100&type=${type}`)
    const json: ApiResult<PageResponse<AdminJobDesc>> = await res.json()
    setPrintData(json.data?.content ?? [])
    setPrintModal(true)
  }

  return (
    <div>
      {/* 검색 영역 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          placeholder="진단명 선택"
          style={{ width: 180 }}
          allowClear
          onChange={(v) => setFilter((f) => ({ ...f, diagnosisName: v as string }))}
          options={[1, 2, 3, 4, 5].map((i) => ({
            label: `2024년도 직무기술서 조직진단 ${i}차`,
            value: `diag-${i}`,
          }))}
        />
        <RangePicker
          placeholder={['시작일', '종료일']}
          format="YYYY-MM-DD"
          onChange={(range) => setFilter((f) => ({ ...f, dateRange: range ? [range[0], range[1]] : undefined }))}
        />
        <Input
          placeholder="부대(서) 검색"
          style={{ width: 140 }}
          allowClear
          onChange={(e) => setFilter((f) => ({ ...f, unit: e.target.value }))}
        />
        <Input
          placeholder="직위 검색"
          style={{ width: 140 }}
          allowClear
          onChange={(e) => setFilter((f) => ({ ...f, position: e.target.value }))}
        />
        <Button type="primary" onClick={() => actionRef.current?.reload()}>조회</Button>
      </div>

      <DataTable<AdminJobDesc>
        columns={columns}
        request={fetchList}
        rowKey="id"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="print" onClick={() => void handlePrint()}>인쇄</Button>,
          <Button key="excel" onClick={() => void message.success('엑셀 다운로드 준비중입니다')}>엑셀 다운로드</Button>,
        ]}
      />

      <ReviewModal
        open={reviewModal.open}
        record={reviewModal.record}
        onClose={() => setReviewModal({ open: false, record: null })}
        onSubmit={(id, values) => {
          reviewMutation.mutate({ id, values: { reviewResult: values.reviewResult, reviewComment: values.reviewComment } })
        }}
      />
      <OpinionModal
        open={opinionModal.open}
        record={opinionModal.record}
        onClose={() => setOpinionModal({ open: false, record: null })}
        onSubmit={(id, values) => {
          opinionMutation.mutate({ id, values: { opinionContent: values.opinionContent } })
        }}
      />
      <ReturnModal
        open={returnModal.open}
        record={returnModal.record}
        onClose={() => setReturnModal({ open: false, record: null })}
        onSubmit={(id, values) => {
          returnMutation.mutate({ id, values: { returnReason: values.returnReason } })
        }}
      />
      <PrintPreviewModal open={printModal} onClose={() => setPrintModal(false)} data={printData} />
    </div>
  )
}

// 통계 탭
function StatsTab() {
  const [filter, setFilter] = useState<SearchFilter>({})

  const { data: byUnitData } = useQuery({
    queryKey: ['sys18-stats-by-unit', filter],
    queryFn: async () => {
      const query = new URLSearchParams()
      if (filter.unit) query.set('unit', filter.unit)
      const res = await fetch(`/api/sys18/stats/by-unit?${query}`)
      const json: ApiResult<UnitStat[]> = await res.json()
      return json.data || []
    },
  })

  const { data: byRankData } = useQuery({
    queryKey: ['sys18-stats-by-rank'],
    queryFn: async () => {
      const res = await fetch('/api/sys18/stats/by-rank')
      const json: ApiResult<RankStat[]> = await res.json()
      return json.data || []
    },
  })

  const { data: byTaskTypeData } = useQuery({
    queryKey: ['sys18-stats-by-task-type'],
    queryFn: async () => {
      const res = await fetch('/api/sys18/stats/by-task-type')
      const json: ApiResult<TaskTypeStat[]> = await res.json()
      return json.data || []
    },
  })

  // Bar 차트 (수평): 부대별 작성현황
  const barData = (byUnitData || []).flatMap((item) => [
    { unit: item.unit, status: '작성완료', count: item.completed },
    { unit: item.unit, status: '작성중', count: item.inProgress },
    { unit: item.unit, status: '미작성', count: item.notStarted },
  ])

  const barCfg = {
    data: barData,
    xField: 'count',
    yField: 'unit',
    colorField: 'status',
    stack: true,
    color: ['#52c41a', '#1890ff', '#d9d9d9'],
    height: 300,
    legend: { position: 'top' as const },
  }

  // Column 차트: 직급별 현황
  const columnCfg = {
    data: byRankData || [],
    xField: 'rank',
    yField: 'count',
    color: '#003366',
    height: 300,
  }

  // Pie 차트: 업무분류별 분포
  const pieCfg = {
    data: byTaskTypeData || [],
    angleField: 'count',
    colorField: 'taskType',
    radius: 0.8,
    innerRadius: 0.4,
    height: 300,
    label: { type: 'spider' as const },
  }

  return (
    <div>
      {/* 검색 영역 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          placeholder="진단명 선택"
          style={{ width: 200 }}
          allowClear
          onChange={(v) => setFilter((f) => ({ ...f, diagnosisName: v as string }))}
          options={[1, 2, 3, 4, 5].map((i) => ({
            label: `2024년도 직무기술서 조직진단 ${i}차`,
            value: `diag-${i}`,
          }))}
        />
        <RangePicker placeholder={['시작일', '종료일']} format="YYYY-MM-DD" />
        <Input
          placeholder="부대(서) 검색"
          style={{ width: 140 }}
          allowClear
          onChange={(e) => setFilter((f) => ({ ...f, unit: e.target.value }))}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div>
          <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>부대별 작성현황</h3>
          <Bar {...barCfg} />
        </div>
        <div>
          <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>직급별 현황</h3>
          <Column {...columnCfg} />
        </div>
      </div>
      <div style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>업무분류별 분포</h3>
        <Pie {...pieCfg} />
      </div>
    </div>
  )
}

export default function JobDescAdminPage() {
  const items = [
    {
      key: 'personal',
      label: '개인직무기술서',
      children: <JobDescTab type="personal" />,
    },
    {
      key: 'department',
      label: '부서직무기술서',
      children: <JobDescTab type="department" />,
    },
    {
      key: 'stats',
      label: '통계',
      children: <StatsTab />,
    },
  ]

  return (
    <PageContainer title="직무기술서 조회(관리자)">
      <Tabs defaultActiveKey="personal" items={items} />
    </PageContainer>
  )
}
