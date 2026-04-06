import { useState, useRef } from 'react'
import {
  Modal, Button, message, Form, Input, Select, DatePicker, Upload, Tabs, Space,
} from 'antd'
import { UploadOutlined, PrinterOutlined, ExportOutlined, PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { SecretItem, MediaItem, EquipmentItem } from '@/shared/api/mocks/handlers/sys15-security'

// ── 타입 분기 ──
type ItemType = SecretItem | MediaItem | EquipmentItem

export interface SecretMediaPageProps {
  /** type='secret' | 'media' | 'equipment' */
  type: 'secret' | 'media' | 'equipment'
  /** 비밀 등록 성공 후 예고문 Modal 오픈 콜백 (type='secret' 일 때만 사용) */
  onSecretCreated?: (secret: SecretItem) => void
}

const STATUS_COLOR_MAP: Record<string, string> = {
  active: 'green',
  expired: 'orange',
  transferred: 'blue',
  destroyed: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  active: '현용',
  expired: '만료',
  transferred: '인계완료',
  destroyed: '폐기',
}

const UNIT_OPTIONS = [
  { label: '1함대', value: '1함대' },
  { label: '2함대', value: '2함대' },
  { label: '3함대', value: '3함대' },
  { label: '해군사령부', value: '해군사령부' },
  { label: '교육사령부', value: '교육사령부' },
  { label: '군수사령부', value: '군수사령부' },
  { label: '해병대사령부', value: '해병대사령부' },
]

const CLASSIFICATION_OPTIONS = [
  { label: '1급', value: '1급' },
  { label: '2급', value: '2급' },
  { label: '3급', value: '3급' },
  { label: 'II급', value: 'II급' },
  { label: 'III급', value: 'III급' },
]

const STATUS_OPTIONS = [
  { label: '현용', value: 'active' },
  { label: '만료', value: 'expired' },
  { label: '인계완료', value: 'transferred' },
  { label: '폐기', value: 'destroyed' },
]

const MEDIA_TYPE_OPTIONS = [
  { label: 'USB', value: 'USB' },
  { label: 'HDD', value: 'HDD' },
  { label: 'SSD', value: 'SSD' },
  { label: 'CD/DVD', value: 'CD/DVD' },
  { label: '기타', value: '기타' },
]

const EQUIPMENT_TYPE_OPTIONS = [
  { label: '암호장비', value: '암호장비' },
  { label: '보안카드단말기', value: '보안카드단말기' },
  { label: '보안USB관리기', value: '보안USB관리기' },
  { label: '지문인식기', value: '지문인식기' },
  { label: '기타', value: '기타' },
]

function getApiPath(type: 'secret' | 'media' | 'equipment') {
  switch (type) {
    case 'secret': return 'secrets'
    case 'media': return 'media'
    case 'equipment': return 'equipment'
  }
}

function getTitle(type: 'secret' | 'media' | 'equipment') {
  switch (type) {
    case 'secret': return '비밀 관리'
    case 'media': return '저장매체 관리'
    case 'equipment': return '보안자재/암호장비 관리'
  }
}

// ── 공통 컬럼 ──
const commonColumns: ProColumns<ItemType>[] = [
  { title: '관리번호', dataIndex: 'registrationNo', width: 130 },
  { title: '명칭', dataIndex: 'name', ellipsis: true },
  {
    title: '비밀등급',
    dataIndex: 'classification',
    width: 80,
    render: (_, r) => <StatusBadge status={r.classification as string} colorMap={{ '1급': 'red', '2급': 'orange', '3급': 'gold', 'II급': 'blue', 'III급': 'cyan' }} />,
  },
  { title: '등록자', dataIndex: 'registrant', width: 90 },
  { title: '부대(서)', dataIndex: 'department', width: 120 },
  { title: '등록일자', dataIndex: 'registeredAt', width: 110 },
  {
    title: '상태',
    dataIndex: 'status',
    width: 90,
    render: (_, r) => <StatusBadge status={r.status as string} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
  },
]

// ── type별 추가 컬럼 ──
const secretExtraColumns: ProColumns<SecretItem>[] = [
  {
    title: '예고문',
    dataIndex: 'hasNoticeDoc',
    width: 80,
    render: (_, r) => (r.hasNoticeDoc ? <StatusBadge status="완료" /> : <StatusBadge status="미작성" colorMap={{ 미작성: 'orange' }} />),
  },
  { title: '예고일자', dataIndex: 'noticeDue', width: 110 },
]

const mediaExtraColumns: ProColumns<MediaItem>[] = [
  { title: '매체유형', dataIndex: 'mediaType', width: 90 },
  { title: '시리얼번호', dataIndex: 'serialNo', width: 130 },
  { title: '용량', dataIndex: 'capacity', width: 70 },
]

const equipmentExtraColumns: ProColumns<EquipmentItem>[] = [
  { title: '장비유형', dataIndex: 'equipmentType', width: 100 },
  { title: '모델명', dataIndex: 'modelName', width: 110 },
  { title: '설치위치', dataIndex: 'installLocation', width: 110 },
]

// ── 삭제 확인 Modal ──
interface DeleteModalProps {
  open: boolean
  onOk: (reason: string) => void
  onCancel: () => void
  loading: boolean
}

function DeleteModal({ open, onOk, onCancel, loading }: DeleteModalProps) {
  const [reason, setReason] = useState('')
  return (
    <Modal
      title="삭제 확인"
      open={open}
      onOk={() => {
        if (!reason.trim()) { message.warning('삭제 사유를 입력하세요'); return }
        onOk(reason)
      }}
      onCancel={onCancel}
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
      okText="삭제"
    >
      <p>삭제 사유를 입력하세요 (필수)</p>
      <Input.TextArea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="삭제 사유를 입력하세요"
      />
    </Modal>
  )
}

// ── 등록/수정 Modal ──
interface FormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  type: 'secret' | 'media' | 'equipment'
  initialValues?: Partial<ItemType>
  onOk: (values: Record<string, unknown>) => void
  onCancel: () => void
  loading: boolean
}

function FormModal({ open, mode, type, initialValues, onOk, onCancel, loading }: FormModalProps) {
  const [form] = Form.useForm()
  const title = mode === 'create' ? `${getTitle(type)} 등록` : `${getTitle(type)} 수정`

  return (
    <Modal
      title={title}
      open={open}
      onOk={() => form.validateFields().then((values) => onOk(values))}
      onCancel={() => { form.resetFields(); onCancel() }}
      confirmLoading={loading}
      okText={mode === 'create' ? '등록' : '수정'}
      width={600}
      destroyOnClose
    >
      <Form form={form} initialValues={initialValues} layout="vertical">
        <Form.Item name="name" label="명칭" rules={[{ required: true, message: '명칭을 입력하세요' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="classification" label="비밀등급" rules={[{ required: true, message: '비밀등급을 선택하세요' }]}>
          <Select options={CLASSIFICATION_OPTIONS} />
        </Form.Item>
        <Form.Item name="registrant" label="등록자" rules={[{ required: true, message: '등록자를 입력하세요' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="department" label="부대(서)" rules={[{ required: true, message: '부대(서)를 선택하세요' }]}>
          <Select options={UNIT_OPTIONS} />
        </Form.Item>

        {type === 'secret' && (
          <Form.Item name="noticeDue" label="예고일자">
            <Input type="date" />
          </Form.Item>
        )}

        {type === 'media' && (
          <>
            <Form.Item name="mediaType" label="매체유형" rules={[{ required: true, message: '매체유형을 선택하세요' }]}>
              <Select options={MEDIA_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="serialNo" label="시리얼번호">
              <Input />
            </Form.Item>
            <Form.Item name="capacity" label="용량">
              <Input />
            </Form.Item>
          </>
        )}

        {type === 'equipment' && (
          <>
            <Form.Item name="equipmentType" label="장비유형" rules={[{ required: true, message: '장비유형을 선택하세요' }]}>
              <Select options={EQUIPMENT_TYPE_OPTIONS} />
            </Form.Item>
            <Form.Item name="modelName" label="모델명">
              <Input />
            </Form.Item>
            <Form.Item name="installLocation" label="설치위치">
              <Input />
            </Form.Item>
          </>
        )}

        <Form.Item name="status" label="상태">
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

// ── 관리대장 출력 (PrintableReport) ──
interface PrintableReportProps {
  title: string
  items: ItemType[]
}

function PrintableReport({ title, items }: PrintableReportProps) {
  return (
    <div className="print-area" style={{ padding: 16 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>{title}</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>관리번호</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>명칭</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>비밀등급</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>등록자</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>부대(서)</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>등록일자</th>
            <th style={{ border: '1px solid #ddd', padding: 6 }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id as string}>
              <td style={{ border: '1px solid #ddd', padding: 6 }}>{item.registrationNo as string}</td>
              <td style={{ border: '1px solid #ddd', padding: 6 }}>{item.name as string}</td>
              <td style={{ border: '1px solid #ddd', padding: 6 }}>{item.classification as string}</td>
              <td style={{ border: '1px solid #ddd', padding: 6 }}>{item.registrant as string}</td>
              <td style={{ border: '1px solid #ddd', padding: 6 }}>{item.department as string}</td>
              <td style={{ border: '1px solid #ddd', padding: 6 }}>{item.registeredAt as string}</td>
              <td style={{ border: '1px solid #ddd', padding: 6 }}>{STATUS_LABEL_MAP[item.status as string] ?? (item.status as string)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ textAlign: 'right', marginTop: 8, fontSize: 11 }}>출력일시: {new Date().toLocaleString('ko-KR')}</p>
    </div>
  )
}

// ── 메인 컴포넌트 ──
export function SecretMediaPage({ type, onSecretCreated }: SecretMediaPageProps) {
  const apiPath = getApiPath(type)
  const queryKey = `sys15-${apiPath}`
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>()

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editRecord, setEditRecord] = useState<ItemType | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [printOpen, setPrintOpen] = useState(false)
  const [printItems, setPrintItems] = useState<ItemType[]>([])
  const [activeTab, setActiveTab] = useState('list')

  // 검색 폼 상태
  const [searchForm] = Form.useForm()

  // 이력 조회 탭용 dateRange
  const [historyRange, setHistoryRange] = useState<[string, string] | null>(null)

  async function fetchItems(params: PageRequest): Promise<PageResponse<ItemType>> {
    const res = await apiClient.get<never, ApiResult<PageResponse<ItemType>>>(`/api/sys15/${apiPath}`, {
      params: { page: params.page, size: params.size },
    })
    const data = (res as ApiResult<PageResponse<ItemType>>).data ?? (res as unknown as PageResponse<ItemType>)
    return data
  }

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      apiClient.post(`/api/sys15/${apiPath}`, values),
    onSuccess: (res) => {
      message.success('등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      actionRef.current?.reload()
      setFormOpen(false)
      // 비밀 등록 후 예고문 Modal 자동 오픈
      if (type === 'secret' && onSecretCreated) {
        const result = (res as ApiResult<SecretItem>).data ?? (res as unknown as SecretItem)
        onSecretCreated(result)
      }
    },
    onError: () => message.error('등록에 실패했습니다.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Record<string, unknown> }) =>
      apiClient.put(`/api/sys15/${apiPath}/${id}`, values),
    onSuccess: () => {
      message.success('수정되었습니다.')
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      actionRef.current?.reload()
      setFormOpen(false)
    },
    onError: () => message.error('수정에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/sys15/${apiPath}/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      actionRef.current?.reload()
      setDeleteOpen(false)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  function handleCreate() {
    setFormMode('create')
    setEditRecord(null)
    setFormOpen(true)
  }

  function handleEdit(record: ItemType) {
    setFormMode('edit')
    setEditRecord(record)
    setFormOpen(true)
  }

  function handleDeleteOpen(id: string) {
    setDeleteTarget(id)
    setDeleteOpen(true)
  }

  function handleDelete(reason: string) {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget)
      console.info(`삭제 사유: ${reason}`)
    }
  }

  function handlePrint() {
    // 현재 페이지 데이터로 관리대장 출력 (실제로는 전체 목록 fetch)
    const sampleItems: ItemType[] = []
    setPrintItems(sampleItems)
    setPrintOpen(true)
    setTimeout(() => window.print(), 300)
  }

  function handleExcel() {
    message.success('엑셀 저장이 완료되었습니다.')
  }

  // 타입별 컬럼
  const typeColumns: ProColumns<ItemType>[] =
    type === 'secret'
      ? (secretExtraColumns as unknown as ProColumns<ItemType>[])
      : type === 'media'
        ? (mediaExtraColumns as unknown as ProColumns<ItemType>[])
        : (equipmentExtraColumns as unknown as ProColumns<ItemType>[])

  const columns: ProColumns<ItemType>[] = [
    ...commonColumns,
    ...typeColumns,
    {
      title: '관리',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" size="small" onClick={() => handleEdit(record)}>수정</Button>,
        <Button key="delete" type="link" size="small" danger onClick={() => handleDeleteOpen(record.id as string)}>삭제</Button>,
      ],
    },
  ]

  const listTab = (
    <>
      {/* 검색 폼 */}
      <Form
        form={searchForm}
        layout="inline"
        style={{ marginBottom: 12, padding: 12, background: '#fafafa', borderRadius: 4 }}
      >
        <Form.Item name="dateRange" label="기간">
          <DatePicker.RangePicker style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="department" label="부대(서)">
          <Select options={UNIT_OPTIONS} placeholder="전체" allowClear style={{ width: 130 }} />
        </Form.Item>
        <Form.Item name="status" label="상태">
          <Select options={STATUS_OPTIONS} placeholder="전체" allowClear style={{ width: 110 }} />
        </Form.Item>
        <Form.Item name="keyword" label="키워드">
          <Input placeholder="명칭/관리번호 검색" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => actionRef.current?.reload()}>검색</Button>
          <Button onClick={() => { searchForm.resetFields(); actionRef.current?.reload() }} style={{ marginLeft: 8 }}>초기화</Button>
        </Form.Item>
      </Form>

      {/* 일괄등록 */}
      <Space style={{ marginBottom: 12 }}>
        <Upload.Dragger
          name="file"
          accept=".xlsx,.xls,.csv"
          beforeUpload={() => false}
          onChange={() => message.info('파일이 선택되었습니다. 일괄 등록 처리 중...')}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>일괄등록(엑셀)</Button>
        </Upload.Dragger>
        <Button icon={<ExportOutlined />} onClick={handleExcel}>엑셀 저장</Button>
        <Button icon={<PrinterOutlined />} onClick={handlePrint}>관리대장 출력</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>신규 등록</Button>
      </Space>

      <DataTable<ItemType>
        columns={columns}
        request={fetchItems}
        rowKey="id"
        headerTitle={getTitle(type)}
        actionRef={actionRef}
      />
    </>
  )

  const historyTab = (
    <div>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="조회기간">
          <DatePicker.RangePicker
            onChange={(_, dateStrings) => setHistoryRange(dateStrings as [string, string])}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary">조회</Button>
        </Form.Item>
      </Form>
      {historyRange && (
        <p style={{ color: '#888' }}>
          {historyRange[0]} ~ {historyRange[1]} 이력 조회 결과 (Mock)
        </p>
      )}
      <DataTable<ItemType>
        columns={columns}
        request={fetchItems}
        rowKey="id"
        headerTitle="이력 조회"
      />
    </div>
  )

  return (
    <PageContainer title={getTitle(type)}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'list', label: '목록', children: listTab },
          { key: 'history', label: '이력 조회', children: historyTab },
        ]}
      />

      <FormModal
        open={formOpen}
        mode={formMode}
        type={type}
        initialValues={editRecord ?? undefined}
        onOk={(values) => {
          if (formMode === 'create') {
            createMutation.mutate(values)
          } else if (editRecord) {
            updateMutation.mutate({ id: editRecord.id as string, values })
          }
        }}
        onCancel={() => setFormOpen(false)}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteModal
        open={deleteOpen}
        onOk={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />

      {/* 인쇄용 PrintableReport (숨김) */}
      <div style={{ display: 'none' }}>
        <PrintableReport title={`${getTitle(type)} 관리대장`} items={printItems} />
      </div>
    </PageContainer>
  )
}
