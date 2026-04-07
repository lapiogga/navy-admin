import { useState, useRef } from 'react'
import { Modal, Button, Form, Input, Select, DatePicker, Switch, message, Space, Timeline } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitKeyPerson, UnitKeyPersonHistory } from '@/shared/api/mocks/handlers/sys08-unit-lineage'
import dayjs from 'dayjs'

const { TextArea } = Input

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

const BRANCH_OPTIONS = [
  { label: '항해', value: '항해' },
  { label: '기관', value: '기관' },
  { label: '전투체계', value: '전투체계' },
  { label: '통신전자', value: '통신전자' },
  { label: '항공', value: '항공' },
  { label: '잠수함', value: '잠수함' },
  { label: '의무', value: '의무' },
  { label: '정보', value: '정보' },
  { label: '군수', value: '군수' },
  { label: '행정', value: '행정' },
]

const COMMISSION_OPTIONS = [
  { label: '학사', value: '학사' },
  { label: '학군', value: '학군' },
  { label: '3사', value: '3사' },
  { label: '부사관', value: '부사관' },
  { label: '간부후보생', value: '간부후보생' },
]

// 검색 필드 정의
const searchFields: SearchField[] = [
  { name: 'keyword', label: '성명', type: 'text', placeholder: '성명 검색' },
  { name: 'category', label: '구분', type: 'select', options: CATEGORY_OPTIONS },
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
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
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
    { title: '구분', dataIndex: 'category', width: 100 },
    { title: '계승번호', dataIndex: 'lineageNo', width: 100 },
    { title: '역대', dataIndex: 'generation', width: 60 },
    // 군번/계급/성명 컬럼 (R6 규칙)
    militaryPersonColumn<UnitKeyPerson>('군번/계급/성명', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'name',
    }),
    { title: '병과', dataIndex: 'branch', width: 80 },
    { title: '보직일자', dataIndex: 'termStart', width: 110 },
    { title: '면직일자', dataIndex: 'termEnd', width: 110 },
    { title: '직무대리', dataIndex: 'isActingDuty', width: 80, render: (_, r) => r.isActingDuty ? '예' : '-' },
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

  const handleSearch = (values: Record<string, unknown>) => {
    setSearchParams(values)
    actionRef.current?.reload()
  }

  const handleSearchReset = () => {
    setSearchParams({})
    actionRef.current?.reload()
  }

  return (
    <PageContainer title="주요직위자 관리">
      {/* 검색영역 (R2 규칙) */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleSearchReset} />

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
        request={(params) => fetchKeyPersons({ ...params, ...searchParams })}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="주요직위자 목록"
      />

      {/* 등록/수정 모달 - CSV 입력값 전체 반영 (R1 규칙) */}
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
        width={700}
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
          <Form.Item name="category" label="주요직위자 구분" rules={[{ required: true, message: '구분을 선택하세요' }]}>
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="lineageNo" label="계승번호">
            <Input />
          </Form.Item>
          <Form.Item name="generation" label="역대">
            <Input />
          </Form.Item>
          <Form.Item name="serviceNumber" label="군번" rules={[{ required: true, message: '군번을 입력하세요' }]}>
            <Input placeholder="예: 12-345678" />
          </Form.Item>
          <Form.Item name="name" label="성명(한글)" rules={[{ required: true, message: '성명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nameHanja" label="성명(한자)">
            <Input />
          </Form.Item>
          <Form.Item name="rank" label="계급" rules={[{ required: true, message: '계급을 선택하세요' }]}>
            <Select options={RANK_OPTIONS} />
          </Form.Item>
          <Form.Item name="position" label="직책">
            <Input />
          </Form.Item>
          <Form.Item name="branch" label="병과">
            <Select options={BRANCH_OPTIONS} allowClear />
          </Form.Item>
          <Form.Item name="commissionType" label="임관구분">
            <Select options={COMMISSION_OPTIONS} allowClear />
          </Form.Item>
          <Form.Item name="termStart" label="보직일자" rules={[{ required: true, message: '보직일자를 입력하세요' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="termEnd" label="면직일자">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActingDuty" label="직무대리 여부" valuePropName="checked">
            <Switch checkedChildren="예" unCheckedChildren="아니오" />
          </Form.Item>
          <Form.Item name="motto" label="지휘관 표어">
            <Input />
          </Form.Item>
          <Form.Item name="policy" label="지휘관 방침">
            <TextArea rows={2} />
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
                  <strong>{h.serviceNumber}</strong> / {h.rank} / {h.name} ({h.category})
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
