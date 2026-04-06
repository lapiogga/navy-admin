import { useState, useRef } from 'react'
import { Modal, Button, Form, Input, Select, DatePicker, message, Space, Timeline } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitKeyPerson, UnitKeyPersonHistory } from '@/shared/api/mocks/handlers/sys08-unit-lineage'
import dayjs from 'dayjs'

const CATEGORY_OPTIONS = [
  { label: '지휘관', value: '지휘관' },
  { label: '부지휘관', value: '부지휘관' },
  { label: '참모장', value: '참모장' },
  { label: '주임원사', value: '주임원사' },
  { label: '작전처장', value: '작전처장' },
  { label: '정보처장', value: '정보처장' },
  { label: '군수처장', value: '군수처장' },
]

const RANK_OPTIONS = [
  { label: '대령', value: '대령' },
  { label: '중령', value: '중령' },
  { label: '소령', value: '소령' },
  { label: '대위', value: '대위' },
  { label: '중위', value: '중위' },
  { label: '소위', value: '소위' },
  { label: '원사', value: '원사' },
  { label: '상사', value: '상사' },
  { label: '중사', value: '중사' },
]

async function fetchKeyPersons(params: PageRequest & Record<string, unknown>): Promise<PageResponse<UnitKeyPerson>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitKeyPerson>>>('/sys08/key-persons', { params })
  return (res as ApiResult<PageResponse<UnitKeyPerson>>).data ?? (res as unknown as PageResponse<UnitKeyPerson>)
}

async function fetchPersonHistory(personId: string): Promise<UnitKeyPersonHistory[]> {
  const res = await apiClient.get<never, ApiResult<UnitKeyPersonHistory[]>>(`/sys08/key-persons/${personId}/history`)
  return (res as ApiResult<UnitKeyPersonHistory[]>).data ?? (res as unknown as UnitKeyPersonHistory[])
}

export default function UnitKeyPersonPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UnitKeyPerson | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<UnitKeyPerson | undefined>()
  const [historyTarget, setHistoryTarget] = useState<UnitKeyPerson | undefined>()
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['sys08', 'key-person-history', historyTarget?.id],
    queryFn: () => fetchPersonHistory(historyTarget!.id),
    enabled: !!historyTarget,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<UnitKeyPerson>) => {
      if (editTarget) {
        return apiClient.put(`/sys08/key-persons/${editTarget.id}`, values)
      }
      return apiClient.post('/sys08/key-persons', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-key-persons'] })
      actionRef.current?.reload()
      setFormOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys08/key-persons/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-key-persons'] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<UnitKeyPerson>[] = [
    { title: '구분', dataIndex: 'category', width: 120 },
    { title: '성명', dataIndex: 'name', width: 120 },
    { title: '계급', dataIndex: 'rank', width: 100 },
    { title: '임기시작', dataIndex: 'termStart', width: 120 },
    { title: '임기종료', dataIndex: 'termEnd', width: 120 },
    { title: '비고', dataIndex: 'remarks', ellipsis: true },
    {
      title: '관리',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => setHistoryTarget(record)}
          >
            이력
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditTarget(record)
              form.setFieldsValue({
                ...record,
                termStart: record.termStart ? dayjs(record.termStart) : undefined,
                termEnd: record.termEnd ? dayjs(record.termEnd) : undefined,
              })
              setFormOpen(true)
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteTarget(record)}
          />
        </Space>
      ),
    },
  ]

  return (
    <PageContainer title="주요직위자 관리">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditTarget(undefined)
            form.resetFields()
            setFormOpen(true)
          }}
        >
          등록
        </Button>
      </div>

      <DataTable<UnitKeyPerson>
        columns={columns}
        request={fetchKeyPersons}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="주요직위자 목록"
      />

      {/* 등록/수정 모달 */}
      <Modal
        title={editTarget ? '주요직위자 수정' : '주요직위자 등록'}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false)
          setEditTarget(undefined)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText={editTarget ? '수정' : '등록'}
        confirmLoading={saveMutation.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const payload = {
              ...values,
              termStart: values.termStart?.format?.('YYYY-MM-DD') ?? values.termStart,
              termEnd: values.termEnd?.format?.('YYYY-MM-DD') ?? values.termEnd,
            }
            saveMutation.mutate(payload)
          }}
        >
          <Form.Item name="category" label="구분" rules={[{ required: true, message: '구분을 선택하세요' }]}>
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="name" label="성명" rules={[{ required: true, message: '성명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rank" label="계급" rules={[{ required: true, message: '계급을 선택하세요' }]}>
            <Select options={RANK_OPTIONS} />
          </Form.Item>
          <Form.Item name="termStart" label="임기시작" rules={[{ required: true, message: '임기시작을 입력하세요' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="termEnd" label="임기종료">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remarks" label="비고">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 이력 조회 모달 */}
      <Modal
        title={`이력 조회 - ${historyTarget?.name ?? ''}`}
        open={!!historyTarget}
        onCancel={() => setHistoryTarget(undefined)}
        footer={<Button onClick={() => setHistoryTarget(undefined)}>닫기</Button>}
        width={600}
      >
        {historyLoading ? (
          <p>로딩 중...</p>
        ) : (
          <Timeline
            items={historyData?.map((h) => ({
              children: (
                <div>
                  <strong>{h.name}</strong> ({h.rank} / {h.category})
                  <br />
                  임기: {h.termStart} ~ {h.termEnd}
                  <br />
                  <small style={{ color: '#999' }}>{h.changedAt} 변경</small>
                </div>
              ),
            }))}
          />
        )}
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(undefined)}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        okText="삭제"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
        cancelText="취소"
      >
        <p>'{deleteTarget?.name}' 주요직위자를 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
