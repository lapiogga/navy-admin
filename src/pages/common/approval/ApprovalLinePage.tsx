import { useState } from 'react'
import { Button, Modal, Form, Input, Transfer, List, Space, message, Typography } from 'antd'
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable, DetailModal, showConfirmDialog } from '@/shared/ui'
import type { DetailField } from '@/shared/ui'
import type { ProColumns } from '@ant-design/pro-components'
import { approvalLineApi } from '@/entities/approval/api'
import type { ApprovalLine } from '@/entities/approval/types'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse } from '@/shared/api/types'

const { Text } = Typography

// ===== 타입 정의 =====

interface UserOption {
  id: string
  name: string
  rank: string
  unit: string
}

interface TransferItem {
  key: string
  title: string
  description: string
}

// ===== 상세 모달 필드 =====
const detailFields: DetailField[] = [
  { key: 'lineName', label: '결재선 이름' },
  { key: 'description', label: '설명' },
  {
    key: 'approvers',
    label: '결재자',
    render: (value) => {
      const approvers = value as ApprovalLine['approvers']
      if (!approvers || approvers.length === 0) return '-'
      return (
        <List
          size="small"
          dataSource={approvers}
          renderItem={(a) => (
            <List.Item key={a.userId}>
              {a.order}. {a.userRank} {a.userName} ({a.userUnit})
            </List.Item>
          )}
        />
      )
    },
  },
  { key: 'createdAt', label: '등록일' },
  { key: 'updatedAt', label: '수정일' },
]

// ===== 메인 컴포넌트 =====
export default function ApprovalLinePage() {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Transfer 상태
  const [targetKeys, setTargetKeys] = useState<string[]>([]) // 선택된 userId 배열
  const [orderedApproverIds, setOrderedApproverIds] = useState<string[]>([]) // 순서 포함 userId 배열

  // 상세 모달 상태
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState<Record<string, unknown> | null>(null)

  // ===== 전체 사용자 조회 (결재자 선택용) =====
  const { data: usersData } = useQuery({
    queryKey: ['common-users'],
    queryFn: () => apiClient.get('/common/users') as Promise<ApiResult<UserOption[]>>,
    staleTime: 5 * 60 * 1000,
  })

  const rawUsers = (usersData as ApiResult<UserOption[]> | undefined)?.data
  const users: UserOption[] = Array.isArray(rawUsers) ? rawUsers : []

  const transferDataSource: TransferItem[] = users.map((u) => ({
    key: u.id,
    title: `${u.rank} ${u.name} (${u.unit})`,
    description: u.unit,
  }))

  // Transfer → orderedApproverIds 동기화
  const handleTransferChange = (newTargetKeys: React.Key[]) => {
    const keys = newTargetKeys.map(String)
    setTargetKeys(keys)
    // 기존 순서 유지 + 새로 추가된 것 append
    setOrderedApproverIds((prev) => {
      const kept = prev.filter((id) => keys.includes(id))
      const added = keys.filter((id) => !prev.includes(id))
      return [...kept, ...added]
    })
  }

  // 결재자 순서 위로
  const moveUp = (index: number) => {
    if (index === 0) return
    setOrderedApproverIds((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  // 결재자 순서 아래로
  const moveDown = (index: number) => {
    setOrderedApproverIds((prev) => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  // 모달 열기 (등록)
  const openCreateModal = () => {
    setModalMode('create')
    setEditingId(null)
    form.resetFields()
    setTargetKeys([])
    setOrderedApproverIds([])
    setModalOpen(true)
  }

  // 모달 열기 (수정)
  const openEditModal = (record: ApprovalLine) => {
    setModalMode('edit')
    setEditingId(record.id)
    form.setFieldsValue({ lineName: record.lineName, description: record.description })
    const ids = record.approvers.map((a) => a.userId)
    setTargetKeys(ids)
    setOrderedApproverIds(ids)
    setModalOpen(true)
  }

  // 모달 닫기
  const closeModal = () => {
    setModalOpen(false)
    form.resetFields()
    setTargetKeys([])
    setOrderedApproverIds([])
    setEditingId(null)
  }

  // ===== Mutation =====
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof approvalLineApi.create>[0]) =>
      approvalLineApi.create(data),
    onSuccess: () => {
      message.success('저장되었습니다')
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['approval-lines'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof approvalLineApi.update>[1] }) =>
      approvalLineApi.update(id, data),
    onSuccess: () => {
      message.success('저장되었습니다')
      closeModal()
      queryClient.invalidateQueries({ queryKey: ['approval-lines'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => approvalLineApi.delete(id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['approval-lines'] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다')
    },
  })

  // ===== 저장 =====
  const handleSave = async () => {
    const values = await form.validateFields()
    const approvers = orderedApproverIds.map((uid, i) => ({ userId: uid, order: i + 1 }))

    if (modalMode === 'create') {
      createMutation.mutate({ lineName: values.lineName, description: values.description ?? '', approvers })
    } else if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: { lineName: values.lineName, description: values.description ?? '', approvers },
      })
    }
  }

  // ===== 삭제 =====
  const handleDelete = (record: ApprovalLine) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      onConfirm: () => deleteMutation.mutate(record.id),
    })
  }

  // ===== 상세 =====
  const handleDetail = (record: ApprovalLine) => {
    setDetailData(record as unknown as Record<string, unknown>)
    setDetailOpen(true)
  }

  // ===== 테이블 컬럼 =====
  const columns: ProColumns<ApprovalLine & Record<string, unknown>>[] = [
    { title: '결재선 이름', dataIndex: 'lineName', key: 'lineName', width: 200 },
    {
      title: '결재자 수',
      dataIndex: 'approvers',
      key: 'approverCount',
      width: 100,
      render: (_, record) => `${record.approvers.length}명`,
    },
    {
      title: '결재자 목록',
      dataIndex: 'approvers',
      key: 'approverList',
      render: (_, record) =>
        record.approvers
          .slice(0, 3)
          .map((a) => `${a.userRank} ${a.userName}`)
          .join(' → ') + (record.approvers.length > 3 ? ' ...' : ''),
    },
    { title: '등록일', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '액션',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleDetail(record)}>상세</Button>
          <Button size="small" onClick={() => openEditModal(record)}>수정</Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>삭제</Button>
        </Space>
      ),
    },
  ]

  // 순서 목록에 표시할 사용자 정보 조회
  const getUserInfo = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? `${user.rank} ${user.name} (${user.unit})` : userId
  }

  return (
    <div>
      <DataTable<ApprovalLine & Record<string, unknown>>
        columns={columns}
        request={(params) => approvalLineApi.list(params) as Promise<PageResponse<ApprovalLine & Record<string, unknown>>>}
        rowKey="id"
        headerTitle="결재선 관리"
        searchable
        searchPlaceholder="결재선 이름으로 검색"
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            등록
          </Button>,
        ]}
      />

      {/* 등록/수정 모달 */}
      <Modal
        title={modalMode === 'create' ? '결재선 등록' : '결재선 수정'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="저장"
        cancelText="취소"
        okButtonProps={{ type: 'primary', loading: createMutation.isPending || updateMutation.isPending }}
        width={800}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="lineName"
            label="결재선 이름"
            rules={[{ required: true, message: '결재선 이름을 입력하세요' }]}
          >
            <Input placeholder="예: 기본결재선, 부대장직속결재선" />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={2} placeholder="결재선에 대한 설명을 입력하세요" />
          </Form.Item>

          {/* Transfer: 결재자 선택 */}
          <Form.Item label="결재자 선택">
            <Transfer
              dataSource={transferDataSource}
              targetKeys={targetKeys}
              onChange={handleTransferChange}
              render={(item) => item.title}
              showSearch
              filterOption={(inputValue, item) =>
                item.title.includes(inputValue)
              }
              locale={{
                notFoundContent: '결재자를 추가하세요',
                searchPlaceholder: '검색',
              }}
              listStyle={{ width: 300, height: 300 }}
              titles={['전체 사용자', '선택된 결재자']}
            />
          </Form.Item>

          {/* 결재자 순서 지정 */}
          {orderedApproverIds.length > 0 && (
            <Form.Item label="결재 순서 지정">
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                좌측 목록에서 결재자를 선택하여 오른쪽으로 이동하세요
              </Text>
              <List
                size="small"
                bordered
                dataSource={orderedApproverIds}
                renderItem={(userId, index) => (
                  <List.Item
                    key={userId}
                    actions={[
                      <Button
                        key="up"
                        size="small"
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        onClick={() => moveUp(index)}
                      />,
                      <Button
                        key="down"
                        size="small"
                        icon={<ArrowDownOutlined />}
                        disabled={index === orderedApproverIds.length - 1}
                        onClick={() => moveDown(index)}
                      />,
                    ]}
                  >
                    <Text>{index + 1}. {getUserInfo(userId)}</Text>
                  </List.Item>
                )}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 상세 모달 */}
      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="결재선 상세"
        data={detailData}
        fields={detailFields}
        width={600}
      />
    </div>
  )
}
