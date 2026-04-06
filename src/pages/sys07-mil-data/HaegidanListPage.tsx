import { useState, useRef } from 'react'
import { Modal, Button, Tag, message, Input } from 'antd'
import { PlusOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { HaegidanDoc } from '@/shared/api/mocks/handlers/sys07'
import HaegidanFormPage from './HaegidanFormPage'
import { PrintableReport } from '@/pages/sys09-memorial/PrintableReport'
import { Table } from 'antd'

const DEPARTMENT_OPTIONS = [
  { label: '작전처', value: '작전처' },
  { label: '정보처', value: '정보처' },
  { label: '인사처', value: '인사처' },
  { label: '군수처', value: '군수처' },
  { label: '기획처', value: '기획처' },
]

function securityLevelTag(level: string) {
  const map: Record<string, { color: string; label: string }> = {
    secret: { color: 'red', label: '비밀' },
    confidential: { color: 'orange', label: '대외비' },
    normal: { color: 'blue', label: '일반' },
  }
  const { color, label } = map[level] ?? { color: 'default', label: level }
  return <Tag color={color}>{label}</Tag>
}

async function fetchHaegidanDocs(params: PageRequest & Record<string, unknown>): Promise<PageResponse<HaegidanDoc>> {
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('size', String(params.size))
  if (params.department) query.set('department', String(params.department))
  if (params.keyword) query.set('keyword', String(params.keyword))
  const res = await fetch(`/api/sys07/haegidan?${query}`)
  const json: ApiResult<PageResponse<HaegidanDoc>> = await res.json()
  return json.data ?? { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 }
}

export default function HaegidanListPage() {
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<HaegidanDoc | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<HaegidanDoc | undefined>()
  const [deleteReason, setDeleteReason] = useState('')
  const [printOpen, setPrintOpen] = useState(false)
  const [printData, setPrintData] = useState<HaegidanDoc[]>([])
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.delete(`/sys07/haegidan/${id}`, { data: { deleteReason: reason } }),
    onSuccess: () => {
      message.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-haegidan'] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
      setDeleteReason('')
    },
    onError: () => message.error('삭제에 실패했습니다'),
  })

  const searchFields = [
    { name: 'department', label: '부서', type: 'select' as const, options: DEPARTMENT_OPTIONS },
    { name: 'managerPosition', label: '관리직위', type: 'text' as const },
    { name: 'fileFolder', label: '파일철', type: 'text' as const },
    { name: 'keyword', label: '키워드', type: 'text' as const },
  ]

  const columns: ProColumns<HaegidanDoc>[] = [
    { title: '부서', dataIndex: 'department', width: 100 },
    { title: '관리직위', dataIndex: 'managerPosition', width: 100 },
    { title: '파일철', dataIndex: 'fileFolder', width: 100 },
    { title: '자료명', dataIndex: 'title' },
    { title: '자료유형', dataIndex: 'dataType', width: 100 },
    { title: '발행처', dataIndex: 'publisher', width: 100 },
    {
      title: '비밀등급',
      dataIndex: 'securityLevel',
      width: 90,
      render: (_, r) => securityLevelTag(r.securityLevel),
    },
    { title: '발행년도', dataIndex: 'publishYear', width: 90 },
    { title: '보관장소', dataIndex: 'storageLocation', width: 120 },
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

  const toolBarRender = () => [
    <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => { setEditTarget(undefined); setFormOpen(true) }}>
      신규 등록
    </Button>,
    <Button key="excel" icon={<DownloadOutlined />} onClick={() => message.success('엑셀 다운로드가 시작되었습니다')}>
      엑셀 다운로드
    </Button>,
    <Button key="print" icon={<PrinterOutlined />} onClick={() => setPrintOpen(true)}>
      인쇄
    </Button>,
  ]

  return (
    <PageContainer title="해기단자료 관리">
      <SearchForm fields={searchFields} onSearch={setSearchValues} onReset={() => setSearchValues({})} />
      <DataTable<HaegidanDoc>
        columns={columns}
        request={async (params) => fetchHaegidanDocs({ ...params, ...searchValues })}
        rowKey="id"
        toolBarRender={toolBarRender}
        actionRef={actionRef}
      />

      {/* 등록/수정 Modal */}
      <Modal
        title={editTarget ? '해기단자료 수정' : '해기단자료 등록'}
        open={formOpen}
        onCancel={() => { setFormOpen(false); setEditTarget(undefined) }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <HaegidanFormPage
          initialValues={editTarget}
          mode={editTarget ? 'edit' : 'create'}
          onSuccess={() => {
            setFormOpen(false)
            setEditTarget(undefined)
            queryClient.invalidateQueries({ queryKey: ['sys07-haegidan'] })
            actionRef.current?.reload()
          }}
        />
      </Modal>

      {/* 삭제 확인 Modal - deleteReason 필수 */}
      <Modal
        title="해기단자료 삭제"
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
        <p>선택한 해기단자료를 삭제합니다. 삭제 사유를 입력하세요. (필수)</p>
        <Input.TextArea
          className="mt-2"
          rows={3}
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          placeholder="삭제 사유를 입력하세요"
        />
      </Modal>

      {/* 인쇄 미리보기 Modal */}
      <Modal
        title="해기단자료 목록 출력"
        open={printOpen}
        onCancel={() => setPrintOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open) {
            fetchHaegidanDocs({ page: 0, size: 100, ...searchValues }).then((d) => setPrintData(d.content))
          }
        }}
      >
        <PrintableReport title="해기단자료 관리 목록">
          <Table
            size="small"
            dataSource={printData}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '부서', dataIndex: 'department', width: 80 },
              { title: '파일철', dataIndex: 'fileFolder', width: 80 },
              { title: '자료명', dataIndex: 'title' },
              { title: '비밀등급', dataIndex: 'securityLevel', render: (v: string) => securityLevelTag(v), width: 80 },
              { title: '발행년도', dataIndex: 'publishYear', width: 80 },
              { title: '보관장소', dataIndex: 'storageLocation', width: 100 },
            ]}
          />
        </PrintableReport>
      </Modal>
    </PageContainer>
  )
}
