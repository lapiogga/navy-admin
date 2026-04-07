import { useState } from 'react'
import { Tabs, Form, Select, Input, Button, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface DeptHistoryItem extends Record<string, unknown> {
  id: string
  fromDept: string
  toDept: string
  reason: string
  status: string
  createdAt: string
  approvedAt?: string
}

const STATUS_COLOR_MAP: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP: Record<string, string> = { pending: '결재대기', approved: '승인', rejected: '반려' }

const DEPT_OPTIONS = [
  { label: '작전부서', value: '작전부서' },
  { label: '인사부서', value: '인사부서' },
  { label: '군수부서', value: '군수부서' },
  { label: '정보부서', value: '정보부서' },
  { label: '통신부서', value: '통신부서' },
  { label: '의무부서', value: '의무부서' },
]

const historyData: DeptHistoryItem[] = [
  { id: '1', fromDept: '작전부서', toDept: '인사부서', reason: '보직 변경', status: 'approved', createdAt: '2026-02-01', approvedAt: '2026-02-10' },
  { id: '2', fromDept: '인사부서', toDept: '군수부서', reason: '업무 이관', status: 'pending', createdAt: '2026-04-01' },
  { id: '3', fromDept: '군수부서', toDept: '정보부서', reason: '인사 발령', status: 'approved', createdAt: '2026-01-15', approvedAt: '2026-01-22' },
  { id: '4', fromDept: '정보부서', toDept: '통신부서', reason: '전문성 강화', status: 'rejected', createdAt: '2025-12-20' },
  { id: '5', fromDept: '통신부서', toDept: '작전부서', reason: '부대 개편', status: 'approved', createdAt: '2025-12-01', approvedAt: '2025-12-08' },
  { id: '6', fromDept: '의무부서', toDept: '인사부서', reason: '교육 파견 복귀', status: 'pending', createdAt: '2026-03-28' },
  { id: '7', fromDept: '작전부서', toDept: '군수부서', reason: '조직 재편', status: 'approved', createdAt: '2025-11-15', approvedAt: '2025-11-20' },
  { id: '8', fromDept: '정보부서', toDept: '의무부서', reason: '보직 순환', status: 'rejected', createdAt: '2025-11-01' },
  { id: '9', fromDept: '군수부서', toDept: '통신부서', reason: '업무 효율화', status: 'approved', createdAt: '2025-10-20', approvedAt: '2025-10-28' },
  { id: '10', fromDept: '통신부서', toDept: '정보부서', reason: '인력 재배치', status: 'pending', createdAt: '2026-04-03' },
  { id: '11', fromDept: '인사부서', toDept: '작전부서', reason: '경력 개발', status: 'approved', createdAt: '2025-10-05', approvedAt: '2025-10-12' },
  { id: '12', fromDept: '의무부서', toDept: '군수부서', reason: '부대 이전', status: 'approved', createdAt: '2025-09-15', approvedAt: '2025-09-22' },
  { id: '13', fromDept: '작전부서', toDept: '정보부서', reason: '전문 교육 이수 후 재배치', status: 'rejected', createdAt: '2025-09-01' },
  { id: '14', fromDept: '군수부서', toDept: '의무부서', reason: '건강 관련 업무 지원', status: 'pending', createdAt: '2026-03-15' },
  { id: '15', fromDept: '통신부서', toDept: '작전부서', reason: '작전 통신 지원 강화', status: 'approved', createdAt: '2025-08-20', approvedAt: '2025-08-28' },
]

async function fetchHistory(params: PageRequest): Promise<PageResponse<DeptHistoryItem>> {
  const start = params.page * params.size
  const content = historyData.slice(start, start + params.size)
  return {
    content,
    totalElements: historyData.length,
    totalPages: Math.ceil(historyData.length / params.size),
    size: params.size,
    number: params.page,
  }
}

// 이동신청 탭
function DeptRequestTab() {
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      message.success(`부서 이동 신청이 등록되었습니다. 이동 부서: ${values.toDept}`)
      form.resetFields()
    } catch {
      // 검증 실패
    }
  }

  const handleRestore = () => {
    showConfirmDialog({
      title: '복구 확인',
      content: '이전 부서로 복구하시겠습니까?',
      onConfirm: () => {
        message.success('복구 신청이 등록되었습니다.')
      },
    })
  }

  return (
    <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
      <Form.Item name="toDept" label="이동 부서" rules={[{ required: true }]}>
        <Select options={DEPT_OPTIONS} placeholder="이동할 부서를 선택하세요" />
      </Form.Item>
      <Form.Item name="reason" label="사유" rules={[{ required: true }]}>
        <Input.TextArea rows={4} placeholder="이동 사유를 입력하세요" />
      </Form.Item>
      <Form.Item>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={handleSubmit}>
            신청
          </Button>
          <Button onClick={handleRestore}>
            복구
          </Button>
        </div>
      </Form.Item>
    </Form>
  )
}

// 결재현황 탭
function ApprovalStatusTab() {
  const columns: ProColumns<DeptHistoryItem>[] = [
    { title: '이동 전 부서', dataIndex: 'fromDept', width: 130 },
    { title: '이동 후 부서', dataIndex: 'toDept', width: 130 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '신청일', dataIndex: 'createdAt', width: 110 },
    { title: '결재일', dataIndex: 'approvedAt', width: 110 },
  ]

  return (
    <DataTable<DeptHistoryItem>
      columns={columns}
      request={fetchHistory}
      rowKey="id"
      headerTitle="결재현황"
    />
  )
}

export default function OtPersonalDeptPage() {
  const tabItems = [
    { key: 'request', label: '부서 이동 신청', children: <DeptRequestTab /> },
    { key: 'status', label: '결재현황', children: <ApprovalStatusTab /> },
  ]

  return (
    <PageContainer title="개인별 부서 설정">
      <Tabs defaultActiveKey="request" items={tabItems} />
    </PageContainer>
  )
}
