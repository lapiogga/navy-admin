import { useState, useRef } from 'react'
import { Tabs, Button, Modal, message, Steps, Select, Checkbox, Space, Descriptions } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { TransferRecord, SecretItem } from '@/shared/api/mocks/handlers/sys15-security'

// ── 상태 맵 ──
const TRANSFER_STATUS_COLOR: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
}
const TRANSFER_STATUS_LABEL: Record<string, string> = {
  pending: '인계대기',
  approved: '인수완료',
  rejected: '반송',
}

// ── Steps 정의 ──
const TRANSFER_STEPS = [
  { title: '인계등록', description: '인계자 등록' },
  { title: '결재대기', description: '결재 진행' },
  { title: '인수확인', description: '인수자 확인' },
]

function getStepCurrent(status: string): number {
  switch (status) {
    case 'pending': return 1
    case 'approved': return 2
    case 'rejected': return 1
    default: return 0
  }
}

// ── 데이터 fetch ──
async function fetchTransfers(params: PageRequest, type?: 'out' | 'in'): Promise<PageResponse<TransferRecord>> {
  const url = type ? `/sys15/transfers?transferType=${type}` : '/sys15/transfers'
  const res = await apiClient.get<never, ApiResult<PageResponse<TransferRecord>>>(url, {
    params: { page: params.page, size: params.size },
  })
  return (res as ApiResult<PageResponse<TransferRecord>>).data ?? (res as unknown as PageResponse<TransferRecord>)
}

async function fetchSecrets(params: PageRequest): Promise<PageResponse<SecretItem>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<SecretItem>>>('/sys15/secrets', {
    params: { page: params.page, size: params.size },
  })
  return (res as ApiResult<PageResponse<SecretItem>>).data ?? (res as unknown as PageResponse<SecretItem>)
}

// ── 인수자 목록 조회 ──
interface UserOption {
  id: string
  name: string
  rank: string
  department: string
}

// ── 인계 상세 Modal ──
interface TransferDetailModalProps {
  record: TransferRecord | null
  open: boolean
  onClose: () => void
  onConfirm: (id: string) => void
  onReject: (id: string) => void
  loading: boolean
  mode: 'out' | 'in'
}

function TransferDetailModal({ record, open, onClose, onConfirm, onReject, loading, mode }: TransferDetailModalProps) {
  if (!record) return null

  const stepCurrent = getStepCurrent(record.status)
  const stepStatus = record.status === 'rejected' ? 'error' : 'process'

  return (
    <Modal
      title="인계/인수 상세"
      open={open}
      onCancel={onClose}
      footer={[
        mode === 'in' && record.status === 'pending' && (
          <Button key="confirm" type="primary" onClick={() => onConfirm(record.id)} loading={loading}>
            인수확인
          </Button>
        ),
        mode === 'in' && record.status === 'pending' && (
          <Button key="reject" danger onClick={() => onReject(record.id)} loading={loading}>
            반송
          </Button>
        ),
        <Button key="close" onClick={onClose}>닫기</Button>,
      ].filter(Boolean)}
      width={600}
    >
      <Steps
        current={stepCurrent}
        status={stepStatus}
        items={TRANSFER_STEPS}
        style={{ marginBottom: 20 }}
        size="small"
      />

      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="인계자">{record.fromUser}</Descriptions.Item>
        <Descriptions.Item label="인수자">{record.toUser}</Descriptions.Item>
        <Descriptions.Item label="인계 부대(서)">{record.fromDept}</Descriptions.Item>
        <Descriptions.Item label="인수 부대(서)">{record.toDept}</Descriptions.Item>
        <Descriptions.Item label="등록일자">{record.createdAt}</Descriptions.Item>
        <Descriptions.Item label="확인일자">{record.confirmedAt ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="상태" span={2}>
          <StatusBadge status={record.status} colorMap={TRANSFER_STATUS_COLOR} labelMap={TRANSFER_STATUS_LABEL} />
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  )
}

// ── 인계 탭 ──
function OutboundTab() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [toUser, setToUser] = useState<string>('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<TransferRecord | null>(null)

  // 인수자 목록
  const { data: usersData } = useQuery({
    queryKey: ['sys15-users'],
    queryFn: async () => {
      const res = await apiClient.get<never, ApiResult<UserOption[]>>('/sys15/users')
      return (res as ApiResult<UserOption[]>).data ?? (res as unknown as UserOption[])
    },
  })
  const userOptions = (usersData ?? []).map((u) => ({
    label: `${u.rank} ${u.name} (${u.department})`,
    value: u.name,
  }))

  const transferMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/sys15/transfers', {
        items: selectedKeys,
        toUser,
        transferType: 'out',
      }),
    onSuccess: () => {
      message.success('인계 등록이 완료되었습니다.')
      setSelectedKeys([])
      setToUser('')
      queryClient.invalidateQueries({ queryKey: ['sys15-transfers-out'] })
      actionRef.current?.reload()
    },
    onError: () => message.error('인계 등록에 실패했습니다.'),
  })

  function handleTransfer() {
    if (selectedKeys.length === 0) { message.warning('인계할 항목을 선택하세요'); return }
    if (!toUser) { message.warning('인수자를 선택하세요'); return }
    transferMutation.mutate()
  }

  // 보유 현황 컬럼 (Checkbox 선택)
  const assetColumns: ProColumns<SecretItem>[] = [
    {
      title: '선택',
      dataIndex: 'check',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedKeys.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedKeys((prev) => [...prev, record.id])
            } else {
              setSelectedKeys((prev) => prev.filter((k) => k !== record.id))
            }
          }}
        />
      ),
    },
    { title: '관리번호', dataIndex: 'registrationNo', width: 130 },
    { title: '명칭', dataIndex: 'name', ellipsis: true },
    { title: '비밀등급', dataIndex: 'classification', width: 80 },
    { title: '등록일자', dataIndex: 'registeredAt', width: 110 },
  ]

  // 인계 내역 컬럼
  const transferColumns: ProColumns<TransferRecord>[] = [
    { title: '인계번호', dataIndex: 'id', width: 110, render: (_, r) => r.id.slice(0, 8).toUpperCase() },
    { title: '인계자', dataIndex: 'fromUser', width: 90 },
    { title: '인수자', dataIndex: 'toUser', width: 90 },
    { title: '인계 부대(서)', dataIndex: 'fromDept', width: 120 },
    { title: '인수 부대(서)', dataIndex: 'toDept', width: 120 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={TRANSFER_STATUS_COLOR} labelMap={TRANSFER_STATUS_LABEL} />,
    },
    { title: '등록일자', dataIndex: 'createdAt', width: 110 },
    {
      title: '상세',
      valueType: 'option',
      width: 70,
      render: (_, record) => [
        <Button key="detail" type="link" size="small" onClick={() => { setDetailRecord(record); setDetailOpen(true) }}>상세</Button>,
      ],
    },
  ]

  return (
    <div>
      <div style={{ padding: 16, background: '#fafafa', borderRadius: 4, marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12 }}>보유 현황 (인계 대상 선택)</h4>
        <DataTable<SecretItem>
          columns={assetColumns}
          request={fetchSecrets}
          rowKey="id"
          headerTitle="보유 비밀 목록"
        />

        <div style={{ marginTop: 12 }}>
          <Space>
            <span>인수자 선택:</span>
            <Select
              options={userOptions}
              value={toUser || undefined}
              onChange={(v) => setToUser(v as string)}
              placeholder="인수자를 선택하세요"
              style={{ width: 250 }}
              showSearch
            />
            <Button
              type="primary"
              onClick={handleTransfer}
              loading={transferMutation.isPending}
              disabled={selectedKeys.length === 0 || !toUser}
            >
              인계 등록 ({selectedKeys.length}건)
            </Button>
          </Space>
        </div>
      </div>

      <h4 style={{ marginBottom: 8 }}>인계 내역</h4>
      <DataTable<TransferRecord>
        columns={transferColumns}
        request={(params) => fetchTransfers(params, 'out')}
        rowKey="id"
        headerTitle="인계 내역"
        actionRef={actionRef}
      />

      <TransferDetailModal
        record={detailRecord}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConfirm={() => {}}
        onReject={() => {}}
        loading={false}
        mode="out"
      />
    </div>
  )
}

// ── 인수 탭 ──
function InboundTab() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<TransferRecord | null>(null)

  const confirmMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/sys15/transfers/${id}/confirm`, {}),
    onSuccess: () => {
      message.success('인수 확인이 완료되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-transfers-in'] })
      actionRef.current?.reload()
      setDetailOpen(false)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/sys15/transfers/${id}/reject`, {}),
    onSuccess: () => {
      message.success('반송 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-transfers-in'] })
      actionRef.current?.reload()
      setDetailOpen(false)
    },
  })

  const pendingColumns: ProColumns<TransferRecord>[] = [
    { title: '인계번호', dataIndex: 'id', width: 110, render: (_, r) => r.id.slice(0, 8).toUpperCase() },
    { title: '인계자', dataIndex: 'fromUser', width: 90 },
    { title: '인계 부대(서)', dataIndex: 'fromDept', width: 120 },
    { title: '인계일자', dataIndex: 'createdAt', width: 110 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={TRANSFER_STATUS_COLOR} labelMap={TRANSFER_STATUS_LABEL} />,
    },
    {
      title: '처리',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <Button
          key="confirm"
          type="primary"
          size="small"
          onClick={() => { setDetailRecord(record); setDetailOpen(true) }}
        >
          상세/처리
        </Button>,
      ],
    },
  ]

  return (
    <div>
      <h4 style={{ marginBottom: 8 }}>인수 대기 목록</h4>
      <DataTable<TransferRecord>
        columns={pendingColumns}
        request={(params) => fetchTransfers(params, 'in')}
        rowKey="id"
        headerTitle="인수 대기"
        actionRef={actionRef}
      />

      <TransferDetailModal
        record={detailRecord}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConfirm={(id) => confirmMutation.mutate(id)}
        onReject={(id) => rejectMutation.mutate(id)}
        loading={confirmMutation.isPending || rejectMutation.isPending}
        mode="in"
      />
    </div>
  )
}

// ── 메인 컴포넌트 ──
export default function TransferPage() {
  return (
    <PageContainer title="비밀/매체 인계/인수">
      <Tabs
        defaultActiveKey="out"
        items={[
          { key: 'out', label: '인계', children: <OutboundTab /> },
          { key: 'in', label: '인수', children: <InboundTab /> },
        ]}
      />
    </PageContainer>
  )
}
