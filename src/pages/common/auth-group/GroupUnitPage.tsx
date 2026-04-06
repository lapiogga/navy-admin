import { useState } from 'react'
import { Select, Button, Modal, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import { permissionGroupApi, groupUnitApi } from '@/entities/permission/api'
import type { GroupUnit } from '@/entities/permission/types'
import type { PageResponse } from '@/shared/api/types'

interface GroupUnitRecord extends GroupUnit, Record<string, unknown> {}

const formFields: CrudFormField[] = [
  { name: 'unitCode', label: '부대코드', type: 'text', required: true, placeholder: '예: HQ, DIV1' },
  { name: 'unitName', label: '부대명', type: 'text', required: true, placeholder: '예: 해병대사령부' },
]

export function GroupUnitPage() {
  const queryClient = useQueryClient()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['permission-groups', 'all'],
    queryFn: () => permissionGroupApi.list({ page: 0, size: 100 }),
  })

  const assignMutation = useMutation({
    mutationFn: (units: { unitCode: string; unitName: string }[]) =>
      groupUnitApi.assign(selectedGroupId!, units),
    onSuccess: () => {
      message.success('저장되었습니다')
      setAddModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['group-units', selectedGroupId] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (unitId: string) => groupUnitApi.remove(selectedGroupId!, unitId),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['group-units', selectedGroupId] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다. 다시 시도하세요')
    },
  })

  const handleRemove = (record: GroupUnit) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: '선택한 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다',
      danger: true,
      onConfirm: async () => { await removeMutation.mutateAsync(record.id) },
    })
  }

  const groupOptions = (groupsData?.content ?? []).map((g) => ({
    label: `${g.groupName} (${g.groupCode})`,
    value: g.id,
  }))

  const columns: ProColumns<GroupUnitRecord>[] = [
    { title: '부대코드', dataIndex: 'unitCode', width: 120 },
    { title: '부대명', dataIndex: 'unitName' },
    { title: '배정일', dataIndex: 'assignedAt', width: 120 },
    {
      title: '관리',
      width: 80,
      render: (_, record) => (
        <Button size="small" danger onClick={() => handleRemove(record as GroupUnit)}>
          해제
        </Button>
      ),
    },
  ]

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    try {
      await assignMutation.mutateAsync([{ unitCode: values.unitCode as string, unitName: values.unitName as string }])
      return true
    } catch {
      return false
    }
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
              부대 추가
            </Button>
          )}
        </Space>
      </div>

      {selectedGroupId && (
        <DataTable<GroupUnitRecord>
          columns={columns}
          rowKey="id"
          request={(params) => groupUnitApi.list(selectedGroupId, params) as Promise<PageResponse<GroupUnitRecord>>}
          headerTitle="배정된 부대"
        />
      )}

      <Modal
        title="부대 추가"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={formFields}
          onFinish={handleFinish}
          mode="create"
        />
      </Modal>
    </div>
  )
}
