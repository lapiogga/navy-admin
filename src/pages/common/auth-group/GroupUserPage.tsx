import { useState, useRef } from 'react'
import { Select, Button, Modal, Space, Table, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import type { TableRowSelection } from 'antd/es/table/interface'
import { DataTable, DetailModal, showConfirmDialog } from '@/shared/ui'
import type { DetailField } from '@/shared/ui'
import { permissionGroupApi, groupUserApi } from '@/entities/permission/api'
import { apiClient } from '@/shared/api/client'
import type { GroupUser } from '@/entities/permission/types'
import type { PageResponse, ApiResult } from '@/shared/api/types'

interface GroupUserRecord extends GroupUser, Record<string, unknown> {}

interface AllUserItem extends Record<string, unknown> {
  id: string
  name: string
  rank: string
  unit: string
  username: string
}

const detailFields: DetailField[] = [
  { key: 'userName', label: '이름' },
  { key: 'userRank', label: '계급' },
  { key: 'userUnit', label: '소속부대' },
  { key: 'assignedAt', label: '배정일' },
]

export function GroupUserPage() {
  const queryClient = useQueryClient()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailRecord, setDetailRecord] = useState<GroupUserRecord | null>(null)
  const [userSearchKeyword, setUserSearchKeyword] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['permission-groups', 'all'],
    queryFn: () => permissionGroupApi.list({ page: 0, size: 100 }),
  })

  const { data: allUsersData, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users', userSearchKeyword],
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
    mutationFn: (userIds: string[]) =>
      groupUserApi.assign(selectedGroupId!, userIds),
    onSuccess: () => {
      message.success('저장되었습니다')
      setAddModalOpen(false)
      setSelectedUserIds([])
      queryClient.invalidateQueries({ queryKey: ['group-users', selectedGroupId] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => groupUserApi.remove(selectedGroupId!, userId),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['group-users', selectedGroupId] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다. 다시 시도하세요')
    },
  })

  const handleRemove = (record: GroupUser) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      danger: true,
      onConfirm: () => removeMutation.mutateAsync(record.userId),
    })
  }

  const groupOptions = (groupsData?.content ?? []).map((g) => ({
    label: `${g.groupName} (${g.groupCode})`,
    value: g.id,
  }))

  const columns: ProColumns<GroupUserRecord>[] = [
    { title: '이름', dataIndex: 'userName', width: 120 },
    { title: '계급', dataIndex: 'userRank', width: 100 },
    { title: '소속부대', dataIndex: 'userUnit' },
    { title: '배정일', dataIndex: 'assignedAt', width: 120 },
    {
      title: '관리',
      width: 80,
      render: (_, record) => (
        <Button size="small" danger onClick={() => handleRemove(record as GroupUser)}>
          해제
        </Button>
      ),
    },
  ]

  const userTableColumns = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '계급', dataIndex: 'rank', key: 'rank' },
    { title: '소속부대', dataIndex: 'unit', key: 'unit' },
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
          <span style={{ fontWeight: 500 }}>권한그룹:</span>
          <Select
            style={{ width: 280 }}
            placeholder="권한그룹을 선택하세요"
            options={groupOptions}
            loading={groupsLoading}
            onChange={(val) => setSelectedGroupId(val)}
            value={selectedGroupId}
          />
          {selectedGroupId && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalOpen(true)}
            >
              사용자 추가
            </Button>
          )}
        </Space>
      </div>

      {selectedGroupId && (
        <DataTable<GroupUserRecord>
          columns={columns}
          rowKey="id"
          request={(params) => groupUserApi.list(selectedGroupId, params)}
          headerTitle="배정된 사용자"
          onRow={(record) => ({
            onClick: () => {
              setDetailRecord(record)
              setDetailModalOpen(true)
            },
            style: { cursor: 'pointer' },
          })}
        />
      )}

      {/* 사용자 추가 모달 */}
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
            ref={searchInputRef as React.RefObject<HTMLInputElement>}
            placeholder="이름, 부대, 계급 검색"
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

      {/* 사용자 상세 모달 */}
      <DetailModal
        title="사용자 상세"
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        data={detailRecord ?? {}}
        fields={detailFields}
      />
    </div>
  )
}
