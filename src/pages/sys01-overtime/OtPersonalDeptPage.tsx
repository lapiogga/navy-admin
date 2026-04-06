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
