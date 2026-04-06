import { useState } from 'react'
import { Modal, Button, Tag, Upload, message, Table } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { EvaluationItem } from '@/shared/api/mocks/handlers/sys07'

const SECURITY_LEVEL_OPTIONS = [
  { label: '비밀', value: 'secret' },
  { label: '대외비', value: 'confidential' },
  { label: '일반', value: 'normal' },
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

async function fetchEvaluations(params: PageRequest & Record<string, unknown>): Promise<PageResponse<EvaluationItem>> {
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('size', String(params.size))
  if (params.securityLevel) query.set('securityLevel', String(params.securityLevel))
  if (params.keyword) query.set('keyword', String(params.keyword))
  const res = await fetch(`/api/sys07/evaluations?${query}`)
  const json: ApiResult<PageResponse<EvaluationItem>> = await res.json()
  return json.data ?? { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 }
}

export default function MilDataEvalPage() {
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>({})
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [bulkValidationResult, setBulkValidationResult] = useState<{
    valid: unknown[]
    errors: { row: number; column: string; errorMessage: string }[]
  } | null>(null)
  const [bulkValidating, setBulkValidating] = useState(false)
  const queryClient = useQueryClient()

  const searchFields = [
    { name: 'securityLevel', label: '비밀등급', type: 'select' as const, options: SECURITY_LEVEL_OPTIONS },
    { name: 'keyword', label: '키워드', type: 'text' as const },
  ]

  const columns: ProColumns<EvaluationItem>[] = [
    { title: '비밀등급', dataIndex: 'securityLevel', width: 90, render: (_, r) => securityLevelTag(r.securityLevel) },
    { title: '관리번호', dataIndex: 'docNumber', width: 160 },
    { title: '자료명', dataIndex: 'title' },
    { title: '보존만료일', dataIndex: 'retentionExpireDate', width: 120 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '평가결과', dataIndex: 'evaluationResult', width: 100, render: (v) => v ?? '-' },
    { title: '연장만료일', dataIndex: 'newRetentionDate', width: 120, render: (v) => (v as string) ?? '-' },
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
    return false
  }

  const handleBulkSave = async () => {
    if (!bulkValidationResult) return
    try {
      await fetch('/api/sys07/evaluations/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: bulkValidationResult.valid }),
      })
      message.success('평가심의 결과가 처리되었습니다')
      setBulkUploadOpen(false)
      setBulkValidationResult(null)
      queryClient.invalidateQueries({ queryKey: ['sys07-evaluations'] })
    } catch {
      message.error('처리에 실패했습니다')
    }
  }

  const toolBarRender = () => [
    <Button key="upload" icon={<UploadOutlined />} type="primary" onClick={() => setBulkUploadOpen(true)}>
      평가심의 결과 업로드
    </Button>,
    <Button key="excel" icon={<DownloadOutlined />} onClick={() => message.success('엑셀 다운로드가 시작되었습니다')}>
      엑셀 다운로드
    </Button>,
  ]

  return (
    <>
      <SearchForm fields={searchFields} onSearch={setSearchValues} onReset={() => setSearchValues({})} />
      <DataTable<EvaluationItem>
        columns={columns}
        request={async (params) => fetchEvaluations({ ...params, ...searchValues })}
        rowKey="id"
        toolBarRender={toolBarRender}
        headerTitle="평가심의 목록 (보존기간 만료)"
      />

      {/* 결과 업로드 Modal */}
      <Modal
        title="평가심의 결과 업로드"
        open={bulkUploadOpen}
        onCancel={() => { setBulkUploadOpen(false); setBulkValidationResult(null) }}
        footer={[
          <Button key="cancel" onClick={() => { setBulkUploadOpen(false); setBulkValidationResult(null) }}>취소</Button>,
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
            평가심의 결과 파일(.xlsx, .xls)을 여기에 드래그하거나 클릭하여 선택하세요<br />
            결과값: 파기(dispose) / 보존기간연장(extend) + 연장만료일
          </p>
        </Upload.Dragger>

        {bulkValidating && <p className="mt-4 text-center">검증 중...</p>}

        {bulkValidationResult && (
          <div className="mt-4">
            <p style={{ color: 'green' }}>유효 건수: <strong>{bulkValidationResult.valid.length}</strong>건</p>
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
    </>
  )
}
