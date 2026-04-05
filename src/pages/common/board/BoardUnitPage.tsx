import { useState } from 'react'
import { Button, Modal, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable, CrudForm, showConfirmDialog } from '@/shared/ui'
import type { CrudFormField } from '@/shared/ui'
import { boardUnitApi } from '@/entities/board/api'
import type { BoardUnit } from '@/entities/board/types'

interface BoardUnitRecord extends BoardUnit, Record<string, unknown> {}

const formFields: CrudFormField[] = [
  { name: 'unitCode', label: '부대코드', type: 'text', required: true, placeholder: '예: DIV-01' },
  { name: 'unitName', label: '부대명', type: 'text', required: true, placeholder: '예: 해병대1사단' },
]

const emptyStyle: React.CSSProperties = {
  backgroundColor: '#F0F2F5',
  padding: '24px',
  textAlign: 'center',
  color: '#999',
  borderRadius: 4,
}

interface BoardUnitPageProps {
  boardId: string | null
}

export function BoardUnitPage({ boardId }: BoardUnitPageProps) {
  const queryClient = useQueryClient()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const assignMutation = useMutation({
    mutationFn: (units: { unitCode: string; unitName: string }[]) =>
      boardUnitApi.assign(boardId!, units),
    onSuccess: () => {
      message.success('저장되었습니다')
      setAddModalOpen(false)
      setRefreshKey((k) => k + 1)
      queryClient.invalidateQueries({ queryKey: ['board-units', boardId] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (unitId: string) => boardUnitApi.remove(boardId!, unitId),
    onSuccess: () => {
      message.success('삭제되었습니다')
      setRefreshKey((k) => k + 1)
      queryClient.invalidateQueries({ queryKey: ['board-units', boardId] })
    },
    onError: () => {
      message.error('삭제에 실패했습니다. 잠시 후 다시 시도하세요')
    },
  })

  const handleRemove = (record: BoardUnitRecord) => {
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

  const columns: ProColumns<BoardUnitRecord>[] = [
    { title: '부대코드', dataIndex: 'unitCode', width: 130 },
    { title: '부대명', dataIndex: 'unitName' },
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

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    try {
      await assignMutation.mutateAsync([
        { unitCode: values.unitCode as string, unitName: values.unitName as string },
      ])
      return true
    } catch {
      return false
    }
  }

  // 부대 목록은 비페이지이므로 변환
  const requestFn = async (params: { page: number; size: number }) => {
    const result = await boardUnitApi.list(boardId)
    const data = (result as { data?: BoardUnit[] }).data ?? (result as unknown as BoardUnit[])
    const items = Array.isArray(data) ? data : []
    return {
      content: items as BoardUnitRecord[],
      totalElements: items.length,
      totalPages: 1,
      size: params.size,
      number: 0,
    }
  }

  return (
    <div key={refreshKey}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            부대 추가
          </Button>
        </Space>
      </div>

      <DataTable<BoardUnitRecord>
        columns={columns}
        rowKey="id"
        request={requestFn}
        headerTitle="허용 부대"
      />

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
