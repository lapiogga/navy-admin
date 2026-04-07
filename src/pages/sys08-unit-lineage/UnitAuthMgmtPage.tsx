import { useState } from 'react'
import { Modal, Button, message, Form, Input } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useRef } from 'react'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitAuthRequest } from '@/shared/api/mocks/handlers/sys08-unit-lineage'

const { TextArea } = Input

const STATUS_COLOR_MAP: Record<string, string> = {
  신청: 'blue',
  승인: 'green',
  반려: 'red',
}

// 검색 필드 정의 (R2 규칙)
const searchFields: SearchField[] = [
  { name: 'keyword', label: '검색어', type: 'text', placeholder: '관리부대/요청권한 검색' },
  {
    name: 'status', label: '상태', type: 'select', options: [
      { label: '신청', value: '신청' },
      { label: '승인', value: '승인' },
      { label: '반려', value: '반려' },
    ],
  },
]

async function fetchAuthRequests(params: PageRequest & Record<string, unknown>): Promise<PageResponse<UnitAuthRequest>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitAuthRequest>>>('/sys08/auth-mgmt', { params })
  return (res as ApiResult<PageResponse<UnitAuthRequest>>).data ?? (res as unknown as PageResponse<UnitAuthRequest>)
}

export default function UnitAuthMgmtPage() {
  const [rejectTarget, setRejectTarget] = useState<UnitAuthRequest | undefined>()
  const [rejectReason, setRejectReason] = useState('')
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.put(`/sys08/auth-mgmt/${id}/approve`, {})
    },
    onSuccess: () => {
      message.success('승인 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-auth-mgmt'] })
      actionRef.current?.reload()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiClient.put(`/sys08/auth-mgmt/${id}/reject`, { rejectReason: reason })
    },
    onSuccess: () => {
      message.success('반려 처리되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-auth-mgmt'] })
      actionRef.current?.reload()
      setRejectTarget(undefined)
      setRejectReason('')
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const columns: ProColumns<UnitAuthRequest>[] = [
    { title: '관리부대', dataIndex: 'requestUnit', width: 150 },
    { title: '요청권한', dataIndex: 'requestRole', width: 130 },
    { title: '군 전화번호', dataIndex: 'milPhone', width: 120 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge status={record.status} colorMap={STATUS_COLOR_MAP} />
      ),
    },
    { title: '신청일', dataIndex: 'requestedAt', width: 120 },
    { title: '처리자', dataIndex: 'processedBy', width: 120, render: (v) => (v as string) || '-' },
    {
      title: '처리',
      width: 140,
      render: (_, record) => (
        record.status === '신청' ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => approveMutation.mutate(record.id)}
              loading={approveMutation.isPending}
            >
              승인
            </Button>
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => setRejectTarget(record)}
            >
              반려
            </Button>
          </div>
        ) : (
          <StatusBadge status={record.status} colorMap={STATUS_COLOR_MAP} />
        )
      ),
    },
  ]

  const handleSearch = (values: Record<string, unknown>) => {
    setSearchParams(values)
    actionRef.current?.reload()
  }

  const handleSearchReset = () => {
    setSearchParams({})
    actionRef.current?.reload()
  }

  return (
    <PageContainer title="권한관리">
      {/* 검색영역 (R2 규칙) */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleSearchReset} />

      <DataTable<UnitAuthRequest>
        columns={columns}
        request={(params) => fetchAuthRequests({ ...params, ...searchParams })}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="권한신청 목록"
      />

      {/* 반려 사유 입력 모달 */}
      <Modal
        title="반려 사유 입력"
        open={!!rejectTarget}
        onCancel={() => {
          setRejectTarget(undefined)
          setRejectReason('')
        }}
        onOk={() => rejectTarget && rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason })}
        okText="반려"
        cancelText="취소"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <Form.Item label="반려 사유" required>
          <TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="반려 사유를 입력하세요"
          />
        </Form.Item>
      </Modal>
    </PageContainer>
  )
}
