import { useState } from 'react'
import { Button, Modal, Input, Space, Table, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import type { TableRowSelection } from 'antd/es/table/interface'
import { DataTable, showConfirmDialog } from '@/shared/ui'
import { boardUserApi } from '@/entities/board/api'
import { apiClient } from '@/shared/api/client'
import type { BoardUser } from '@/entities/board/types'
import type { PageResponse, ApiResult } from '@/shared/api/types'

interface BoardUserRecord extends BoardUser, Record<string, unknown> {}

interface AllUserItem extends Record<string, unknown> {
  id: string
  name: string
  rank: string
  unit: string
}

const emptyStyle: React.CSSProperties = {
  backgroundColor: '#F0F2F5',
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  borderRadius: 4,
}

interface BoardUserPageProps {
  boardId: string | null
}

export function BoardUserPage({ boardId }: BoardUserPageProps) {
  const queryClient = useQueryClient()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [userSearchKeyword, setUserSearchKeyword] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const { data: allUsersData, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users-board-user', userSearchKeyword],
    queryFn: async () => {
      const res = await apiClient.get<unknown, ApiResult<PageResponse<AllUserItem>>>(
        '/common/users',
        { params: { page: 0, size: 50, keyword: userSearchKeyword } },
      )
      const data = (res as { data?: PageResponse<AllUserItem> }).data ?? (res as PageResponse<AllUserItem>)
      return data
    },
    enabled: addModalOpen,
  })

  const assignMutation = useMutation({
    mutationFn: (userIds: string[]) => boardUserApi.assign(boardId!, userIds),
    onSuccess: () => {
      message.success('저장되었습니다')
      setAddModalOpen(false)
      setSelectedUserIds([])
      queryClient.invalidateQueries({ queryKey: ['board-users', boardId] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => boardUserApi.remove(boardId!, userId),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['board-users', boardId] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다. 잠시 후 다시 시도하세요')
    },
  })

  const handleRemove = (record: BoardUserRecord) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      danger: true,
      onConfirm: () => removeMutation.mutateAsync(record.id),
    })
  }

  if (!boardId) {
    return <div style={emptyStyle}>게시판 설정 탭에서 게시판을 먼저 선택하세요</div>
  }

  const columns: ProColumns<BoardUserRecord>[] = [
    { title: '이름', dataIndex: 'userName', width: 120 },
    { title: '계급', dataIndex: 'userRank', width: 100 },
    { title: '소속부대', dataIndex: 'userUnit' },
    { title: '배정일', dataIndex: 'assignedAt', width: 120 },
    {
      title: '관리',
      width: 80,
      render: (_, record) => (
        <Button size="small" danger onClick={() => handleRemove(record)}>
          해제
        </Button>
      ),
    },
  ]

  const userTableColumns = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '계급', dataIndex: 'rank', key: 'rank' },
    { title: '소속', dataIndex: 'unit', key: 'unit' },
  ]

  const rowSelection: TableRowSelection<AllUserItem> = {
    type: 'checkbox',
    selectedRowKeys: selectedUserIds,
    onChange: (keys) => setSelectedUserIds(keys as string[]),
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            사용자 추가
          </Button>
        </Space>
      </div>

      <DataTable<BoardUserRecord>
        columns={columns}
        rowKey="id"
        request={(params) => boardUserApi.list(boardId, params)}
        headerTitle="허용 사용자"
      />

      <Modal
        title="사용자 추가"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false)
          setSelectedUserIds([])
          setUserSearchKeyword('')
        }}
        onOk={() => {
          if (selectedUserIds.length === 0) {
            message.warning('배정할 사용자를 선택하세요')
            return
          }
          assignMutation.mutate(selectedUserIds)
        }}
        okText="배정"
        cancelText="취소"
        confirmLoading={assignMutation.isPending}
        width={600}
      >
        <div style={{ marginBottom: 8 }}>
          <Input.Search
            placeholder="이름, 계급, 소속 검색"
            allowClear
            onSearch={(val) => setUserSearchKeyword(val)}
            style={{ width: 280 }}
          />
        </div>
        <Table<AllUserItem>
          dataSource={allUsersData?.content ?? []}
          columns={userTableColumns}
          rowKey="id"
          rowSelection={rowSelection}
          loading={usersLoading}
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ y: 300 }}
        />
      </Modal>
    </div>
  )
}
