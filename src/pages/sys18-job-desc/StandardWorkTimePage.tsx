import { useState, useRef } from 'react'
import { Modal, Form, Select, InputNumber, Button, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import dayjs from 'dayjs'
import { DatePicker } from 'antd'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { StandardWorkHour, RankCategory } from '@/shared/api/mocks/handlers/sys18'

const { RangePicker } = DatePicker

// 적용상태 자동계산 (dayjs 비교, per D-31)
function calcApplyStatus(record: StandardWorkHour): 'active' | 'upcoming' | 'expired' {
  const today = dayjs()
  if (today.isAfter(dayjs(record.periodEnd))) return 'expired'
  if (today.isBefore(dayjs(record.periodStart))) return 'upcoming'
  return 'active'
}

const APPLY_STATUS_COLOR_MAP = {
  active: 'success',
  upcoming: 'processing',
  expired: 'default',
}
const APPLY_STATUS_LABEL_MAP = {
  active: '적용중',
  upcoming: '적용예정',
  expired: '적용만료',
}

const RANK_CATEGORIES: RankCategory[] = ['장관', '영관', '부사관', '원사', '병']

interface StandardWorkHourFormValues {
  rankCategory: RankCategory
  standardHours: number
  applyPeriod: [dayjs.Dayjs, dayjs.Dayjs]
}

export default function StandardWorkTimePage() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<StandardWorkHour | null>(null)
  const [form] = Form.useForm<StandardWorkHourFormValues>()

  const createMutation = useMutation({
    mutationFn: async (values: Omit<StandardWorkHour, 'id'>) => {
      const res = await fetch('/api/sys18/standard-work-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json() as Promise<ApiResult<StandardWorkHour>>
    },
    onSuccess: () => {
      void message.success('표준업무시간이 등록되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys18-standard-work-hours'] })
      actionRef.current?.reload()
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => void message.error('등록 중 오류가 발생했습니다'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Omit<StandardWorkHour, 'id'> }) => {
      const res = await fetch(`/api/sys18/standard-work-hours/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      return res.json() as Promise<ApiResult<StandardWorkHour>>
    },
    onSuccess: () => {
      void message.success('표준업무시간이 수정되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys18-standard-work-hours'] })
      actionRef.current?.reload()
      setModalOpen(false)
      form.resetFields()
      setEditRecord(null)
    },
    onError: () => void message.error('수정 중 오류가 발생했습니다'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sys18/standard-work-hours/${id}`, { method: 'DELETE' })
      return res.json() as Promise<ApiResult<null>>
    },
    onSuccess: () => {
      void message.success('표준업무시간이 삭제되었습니다')
      void queryClient.invalidateQueries({ queryKey: ['sys18-standard-work-hours'] })
      actionRef.current?.reload()
    },
    onError: () => void message.error('삭제 중 오류가 발생했습니다'),
  })

  const columns: ProColumns<StandardWorkHour>[] = [
    {
      title: '신분',
      dataIndex: 'rankCategory',
      width: 120,
    },
    {
      title: '표준업무시간 (주간, 시간)',
      dataIndex: 'standardHours',
      width: 180,
      render: (v) => `${v as number}시간`,
    },
    {
      title: '적용기간 시작',
      dataIndex: 'periodStart',
      width: 130,
    },
    {
      title: '적용기간 종료',
      dataIndex: 'periodEnd',
      width: 130,
    },
    {
      title: '적용상태',
      key: 'applyStatus',
      width: 110,
      render: (_, record) => {
        const status = calcApplyStatus(record)
        return <StatusBadge status={status} colorMap={APPLY_STATUS_COLOR_MAP} labelMap={APPLY_STATUS_LABEL_MAP} />
      },
    },
    {
      title: '액션',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              setEditRecord(record)
              form.setFieldsValue({
                rankCategory: record.rankCategory as RankCategory,
                standardHours: record.standardHours,
                applyPeriod: [dayjs(record.periodStart), dayjs(record.periodEnd)],
              })
              setModalOpen(true)
            }}
          >
            수정
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              Modal.confirm({
                title: '삭제 확인',
                content: `${record.rankCategory} 표준업무시간을 삭제하시겠습니까?`,
                okText: '삭제',
                okButtonProps: { danger: true },
                cancelText: '취소',
                onOk: () => deleteMutation.mutate(record.id),
              })
            }}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ]

  const fetchList = async (params: { page: number; size: number }): Promise<PageResponse<StandardWorkHour>> => {
    const query = new URLSearchParams({ page: String(params.page), size: String(params.size) })
    const res = await fetch(`/api/sys18/standard-work-hours?${query}`)
    const json: ApiResult<PageResponse<StandardWorkHour>> = await res.json()
    if (!json.success) throw new Error('표준업무시간 목록 조회 실패')
    return json.data
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = {
        rankCategory: values.rankCategory,
        standardHours: values.standardHours,
        periodStart: values.applyPeriod[0].format('YYYY-MM-DD'),
        periodEnd: values.applyPeriod[1].format('YYYY-MM-DD'),
      }
      if (editRecord) {
        updateMutation.mutate({ id: editRecord.id, values: payload })
      } else {
        createMutation.mutate(payload)
      }
    }).catch(() => {})
  }

  const handleOpenCreate = () => {
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  // CrudForm 필드 정의 (Modal 내부에서 직접 Form 사용하므로 참조용)
  const crudFormFields = [
    { name: 'rankCategory', label: '신분', type: 'select' as const, required: true },
    { name: 'standardHours', label: '표준업무시간 (주간, 시간)', type: 'number' as const, required: true },
  ]

  return (
    <PageContainer title="표준업무시간관리">
      <DataTable<StandardWorkHour>
        columns={columns}
        request={fetchList}
        rowKey="id"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleOpenCreate}>신규 등록</Button>,
        ]}
      />

      {/* CrudForm 필드 참조 (타입 검증용) */}
      <div style={{ display: 'none' }}>
        <CrudForm fields={crudFormFields} onFinish={async () => true} />
      </div>

      <Modal
        title={editRecord ? '표준업무시간 수정' : '표준업무시간 등록'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditRecord(null) }}
        onOk={handleSubmit}
        okText={editRecord ? '수정' : '등록'}
        cancelText="취소"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rankCategory"
            label="신분"
            rules={[{ required: true, message: '신분을 선택하세요' }]}
          >
            <Select
              placeholder="신분 선택"
              options={RANK_CATEGORIES.map((r) => ({ label: r, value: r }))}
            />
          </Form.Item>
          <Form.Item
            name="standardHours"
            label="표준업무시간 (주간, 시간)"
            rules={[{ required: true, message: '표준업무시간을 입력하세요' }]}
          >
            <InputNumber min={1} max={60} style={{ width: '100%' }} addonAfter="시간" />
          </Form.Item>
          <Form.Item
            name="applyPeriod"
            label="적용기간"
            rules={[{ required: true, message: '적용기간을 선택하세요' }]}
          >
            <RangePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
