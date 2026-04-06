import { useState, useRef } from 'react'
import { Modal, Button, Tag, Upload, message, Tabs, Descriptions, Table } from 'antd'
import { UploadOutlined, DownloadOutlined, PrinterOutlined, PlusOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { MilDocument, EvaluationItem } from '@/shared/api/mocks/handlers/sys07'
import MilDataFormPage from './MilDataFormPage'
import MilDataDetailPage from './MilDataDetailPage'
import MilDataEvalPage from './MilDataEvalPage'
import { PrintableReport } from '@/pages/sys09-memorial/PrintableReport'

const SECURITY_LEVEL_OPTIONS = [
  { label: '비밀', value: 'secret' },
  { label: '대외비', value: 'confidential' },
  { label: '일반', value: 'normal' },
]

const STORAGE_TYPE_OPTIONS = [
  { label: '금고보관', value: '금고보관' },
  { label: '서가보관', value: '서가보관' },
  { label: '전산보관', value: '전산보관' },
]

const DOC_TYPE_OPTIONS = [
  { label: '훈령', value: '훈령' },
  { label: '예규', value: '예규' },
  { label: '지시', value: '지시' },
  { label: '일반문서', value: '일반문서' },
  { label: '보고서', value: '보고서' },
]

const STATUS_OPTIONS = [
  { label: '보존중', value: 'active' },
  { label: '대출중', value: 'on_loan' },
  { label: '평가심의', value: 'evaluation' },
  { label: '파기', value: 'disposed' },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  active: 'green',
  on_loan: 'blue',
  evaluation: 'gold',
  disposed: 'default',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: '보존중',
  on_loan: '대출중',
  evaluation: '평가심의',
  disposed: '파기',
}

function securityLevelTag(level: string) {
  const map: Record<string, { color: string; label: string }> = {
    secret: { color: 'red', label: '비밀' },
    confidential: { color: 'orange', label: '대외비' },
    normal: { color: 'blue', label: '일반' },
  }
  const { color, label } = map[level] ?? { color: 'default', label: level }
  return <Tag color={color}>{label}</Tag>
}

async function fetchDocuments(params: PageRequest & Record<string, unknown>): Promise<PageResponse<MilDocument>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<MilDocument>>>('/sys07/documents', { params })
  return (res as ApiResult<PageResponse<MilDocument>>).data ?? (res as unknown as PageResponse<MilDocument>)
}

async function deleteDocument(id: string, deleteReason: string): Promise<void> {
  await apiClient.delete(`/sys07/documents/${id}`, { data: { deleteReason } })
}

export default function MilDataListPage() {
  const [activeTab, setActiveTab] = useState<string>('list')
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MilDocument | undefined>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<MilDocument | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<MilDocument | undefined>()
  const [deleteReason, setDeleteReason] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkValidationResult, setBulkValidationResult] = useState<{ valid: unknown[]; errors: { row: number; column: string; errorMessage: string }[] } | null>(null)
  const [bulkValidating, setBulkValidating] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [printData, setPrintData] = useState<MilDocument[]>([])
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const { data: listData } = useQuery({
    queryKey: ['sys07-documents', searchValues],
    queryFn: () => fetchDocuments({ page: 0, size: 10, ...searchValues }),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => deleteDocument(id, reason),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-documents'] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
      setDeleteReason('')
    },
    onError: () => message.error('삭제에 실패했습니다'),
  })

  const searchFields = [
    { name: 'securityLevel', label: '비밀등급', type: 'select' as const, options: SECURITY_LEVEL_OPTIONS },
    { name: 'storageType', label: '보관형태', type: 'select' as const, options: STORAGE_TYPE_OPTIONS },
    { name: 'docType', label: '문서구분', type: 'select' as const, options: DOC_TYPE_OPTIONS },
    { name: 'keyword', label: '키워드', type: 'text' as const },
    { name: 'status', label: '상태', type: 'select' as const, options: STATUS_OPTIONS },
  ]

  const columns: ProColumns<MilDocument>[] = [
    { title: '비밀등급', dataIndex: 'securityLevel', width: 90, render: (_, r) => securityLevelTag(r.securityLevel) },
    { title: '관리번호', dataIndex: 'docNumber', width: 160 },
    { title: '문서구분', dataIndex: 'docType', width: 100 },
    {
      title: '자료명',
      dataIndex: 'title',
      render: (text, r) => (
        <a onClick={() => { setDetailTarget(r); setDetailOpen(true) }}>{text as string}</a>
      ),
    },
    { title: '작성자', dataIndex: 'author', width: 100 },
    { title: '이관일자', dataIndex: 'transferDate', width: 110 },
    { title: '보관형태', dataIndex: 'storageType', width: 100 },
    { title: '보존기간', dataIndex: 'retentionPeriod', width: 80, render: (v) => `${v}년` },
    { title: '보존만료일', dataIndex: 'retentionExpireDate', width: 120 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '등록일', dataIndex: 'registeredAt', width: 110 },
    {
      title: '관리',
      width: 120,
      render: (_, r) => (
        <>
          <Button size="small" type="link" onClick={() => { setEditTarget(r); setFormOpen(true) }}>수정</Button>
          <Button size="small" type="link" danger onClick={() => setDeleteTarget(r)}>삭제</Button>
        </>
      ),
    },
  ]

  const handleBulkUpload = async (file: File) => {
    setBulkValidating(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/sys07/documents/bulk-validate', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      setBulkValidationResult(json.data)
    } catch {
      message.error('검증 중 오류가 발생했습니다')
    } finally {
      setBulkValidating(false)
    }
    return false // antd Upload 자동 업로드 방지
  }

  const handleBulkSave = async () => {
    if (!bulkValidationResult) return
    try {
      await fetch('/api/sys07/documents/bulk-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: bulkValidationResult.valid }),
      })
      message.success(`${bulkValidationResult.valid.length}건 저장 완료`)
      setBulkOpen(false)
      setBulkValidationResult(null)
      queryClient.invalidateQueries({ queryKey: ['sys07-documents'] })
      actionRef.current?.reload()
    } catch {
      message.error('저장에 실패했습니다')
    }
  }

  const toolBarRender = () => [
    <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => { setEditTarget(undefined); setFormOpen(true) }}>
      신규 등록
    </Button>,
    <Button key="bulk" icon={<UploadOutlined />} onClick={() => setBulkOpen(true)}>
      일괄 등록(엑셀)
    </Button>,
    <Button key="excel" icon={<DownloadOutlined />} onClick={() => message.success('엑셀 다운로드가 시작되었습니다')}>
      엑셀 다운로드
    </Button>,
    <Button key="print" icon={<PrinterOutlined />} onClick={() => { setPrintData(listData?.content ?? []); setPrintOpen(true) }}>
      인쇄
    </Button>,
  ]

  const tabItems = [
    {
      key: 'list',
      label: '군사자료 목록',
      children: (
        <>
          <SearchForm fields={searchFields} onSearch={setSearchValues} onReset={() => setSearchValues({})} />
          <DataTable<MilDocument>
            columns={columns}
            request={async (params) => fetchDocuments({ ...params, ...searchValues })}
            rowKey="id"
            toolBarRender={toolBarRender}
            actionRef={actionRef}
          />
        </>
      ),
    },
    {
      key: 'evaluation',
      label: '평가심의 목록',
      children: <MilDataEvalPage />,
    },
  ]

  return (
    <PageContainer title="군사자료 관리">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* 등록/수정 Modal */}
      <Modal
        title={editTarget ? '군사자료 수정' : '군사자료 등록'}
        open={formOpen}
        onCancel={() => { setFormOpen(false); setEditTarget(undefined) }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <MilDataFormPage
          initialValues={editTarget}
          mode={editTarget ? 'edit' : 'create'}
          onSuccess={() => {
            setFormOpen(false)
            setEditTarget(undefined)
            queryClient.invalidateQueries({ queryKey: ['sys07-documents'] })
            actionRef.current?.reload()
          }}
        />
      </Modal>

      {/* 상세 Modal */}
      <Modal
        title="군사자료 상세"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setDetailTarget(undefined) }}
        footer={null}
        width={900}
        destroyOnClose
      >
        {detailTarget && <MilDataDetailPage docId={detailTarget.id} />}
      </Modal>

      {/* 삭제 확인 Modal */}
      <Modal
        title="군사자료 삭제"
        open={!!deleteTarget}
        onOk={() => {
          if (deleteTarget && deleteReason) {
            deleteMutation.mutate({ id: deleteTarget.id, reason: deleteReason })
          }
        }}
        onCancel={() => { setDeleteTarget(undefined); setDeleteReason('') }}
        okButtonProps={{ danger: true, disabled: !deleteReason, loading: deleteMutation.isPending }}
        okText="삭제"
        cancelText="취소"
      >
        <p>선택한 군사자료를 삭제합니다. 삭제 사유를 입력하세요. (필수)</p>
        <textarea
          className="w-full border rounded p-2 mt-2"
          rows={3}
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          placeholder="삭제 사유를 입력하세요"
        />
      </Modal>

      {/* 일괄 등록 Modal */}
      <Modal
        title="군사자료 일괄 등록 (엑셀)"
        open={bulkOpen}
        onCancel={() => { setBulkOpen(false); setBulkValidationResult(null) }}
        footer={[
          <Button key="cancel" onClick={() => { setBulkOpen(false); setBulkValidationResult(null) }}>취소</Button>,
          <Button
            key="save"
            type="primary"
            disabled={!bulkValidationResult || bulkValidationResult.errors.length > 0}
            onClick={handleBulkSave}
          >
            저장
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        <Upload.Dragger
          accept=".xlsx,.xls"
          maxCount={1}
          beforeUpload={handleBulkUpload}
          showUploadList={false}
        >
          <p className="text-center py-4">
            엑셀 파일(.xlsx, .xls)을 여기에 드래그하거나 클릭하여 선택하세요
          </p>
        </Upload.Dragger>

        {bulkValidating && <p className="mt-4 text-center">검증 중...</p>}

        {bulkValidationResult && (
          <div className="mt-4">
            <p style={{ color: 'green' }}>
              유효 건수: <strong>{bulkValidationResult.valid.length}</strong>건
            </p>
            {bulkValidationResult.errors.length > 0 && (
              <>
                <p style={{ color: 'red' }} className="mt-2">
                  오류 건수: <strong>{bulkValidationResult.errors.length}</strong>건
                </p>
                <Table
                  size="small"
                  dataSource={bulkValidationResult.errors}
                  rowKey="row"
                  pagination={false}
                  columns={[
                    { title: '행번호', dataIndex: 'row', width: 80 },
                    { title: '오류 컬럼', dataIndex: 'column', width: 120 },
                    { title: '오류 내용', dataIndex: 'errorMessage' },
                  ]}
                />
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 인쇄 미리보기 Modal */}
      <Modal
        title="군사자료 목록 출력"
        open={printOpen}
        onCancel={() => setPrintOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <PrintableReport title="군사자료 관리 목록">
          <Table
            size="small"
            dataSource={printData}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '비밀등급', dataIndex: 'securityLevel', render: (v: string) => securityLevelTag(v), width: 80 },
              { title: '관리번호', dataIndex: 'docNumber', width: 150 },
              { title: '자료명', dataIndex: 'title' },
              { title: '작성자', dataIndex: 'author', width: 100 },
              { title: '이관일자', dataIndex: 'transferDate', width: 100 },
              { title: '상태', dataIndex: 'status', render: (v: string) => STATUS_LABEL_MAP[v] ?? v, width: 80 },
            ]}
          />
        </PrintableReport>
      </Modal>
    </PageContainer>
  )
}
