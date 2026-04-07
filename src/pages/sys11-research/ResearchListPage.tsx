import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Modal, Button, message, Popconfirm, Descriptions, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface ResearchItem extends Record<string, unknown> {
  id: string
  title: string
  author: string
  department: string
  category: string
  researchField: string
  description: string
  fileUrl: string
  fileName: string
  downloadCount: number
  viewCount: number
  researchYear: number
  budget: number
  researcherServiceNumber: string
  researcherRank: string
  researcherName: string
  researcherType: string
  progressStatus: string
  managerName: string
  posterName: string
  createdAt: string
  updatedAt: string
}

// CSV 스펙 기준 10개 카테고리
const CATEGORY_OPTIONS = [
  { label: '국방정책', value: '국방정책' },
  { label: '개별사업', value: '개별사업' },
  { label: '해사학술', value: '해사학술' },
  { label: '군사학술', value: '군사학술' },
  { label: '해군발전', value: '해군발전' },
  { label: '함정정비', value: '함정정비' },
  { label: '전투발전', value: '전투발전' },
  { label: '전투실험', value: '전투실험' },
  { label: '함정기술', value: '함정기술' },
  { label: '장성정책연구', value: '장성정책연구' },
]

const PROGRESS_OPTIONS = [
  { label: '최초평가', value: '최초평가' },
  { label: '중간평가', value: '중간평가' },
  { label: '최종평가', value: '최종평가' },
]

const RESEARCHER_TYPE_OPTIONS = [
  { label: '군내', value: '군내' },
  { label: '외부', value: '외부' },
]

// CSV 기준 입력값 필드
const CRUD_FIELDS = [
  { name: 'title', label: '제목', type: 'text' as const, required: true },
  { name: 'researchField', label: '연구분야(카테고리)', type: 'select' as const, required: true, options: CATEGORY_OPTIONS },
  { name: 'researchYear', label: '연구년도', type: 'number' as const, required: true },
  { name: 'budget', label: '연구예산(원)', type: 'number' as const, required: true },
  { name: 'researcherType', label: '연구자 구분', type: 'select' as const, required: true, options: RESEARCHER_TYPE_OPTIONS },
  { name: 'researcherName', label: '연구자 성명', type: 'text' as const, required: true },
  { name: 'researcherServiceNumber', label: '연구자 군번', type: 'text' as const },
  { name: 'researcherRank', label: '연구자 계급', type: 'text' as const },
  { name: 'progressStatus', label: '진행사항', type: 'select' as const, required: true, options: PROGRESS_OPTIONS },
  { name: 'managerName', label: '과제담당관', type: 'text' as const, required: true },
  { name: 'description', label: '내용', type: 'textarea' as const, required: true },
]

// CSV 기준 검색조건: 진행상황, 제목, 연구자, 연구년도, 과제담당관
const SEARCH_FIELDS: SearchField[] = [
  { name: 'progressStatus', label: '진행상황', type: 'select', options: [
    { label: '전체', value: '' },
    ...PROGRESS_OPTIONS,
  ] },
  { name: 'keyword', label: '제목', type: 'text', placeholder: '제목 검색' },
  { name: 'researcher', label: '연구자', type: 'text', placeholder: '연구자명' },
  { name: 'researchYear', label: '연구년도', type: 'text', placeholder: '예: 2026' },
  { name: 'manager', label: '과제담당관', type: 'text', placeholder: '담당관명' },
]

interface SearchParams {
  progressStatus?: string
  keyword?: string
  researcher?: string
  researchYear?: string
  manager?: string
}

async function fetchResearch(
  params: PageRequest,
  search: SearchParams = {},
): Promise<PageResponse<ResearchItem>> {
  const url = new URL('/api/sys11/research', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  if (search.progressStatus) url.searchParams.set('progressStatus', search.progressStatus)
  if (search.keyword) url.searchParams.set('keyword', search.keyword)
  if (search.researcher) url.searchParams.set('researcher', search.researcher)
  if (search.researchYear) url.searchParams.set('researchYear', search.researchYear)
  if (search.manager) url.searchParams.set('manager', search.manager)
  const res = await fetch(url.toString())
  const json = await res.json()
  return json.data
}

// CSV 스펙: 순번, 제목, 내용, 연구자, 연구년도, 연구예산, 과제담당관, 게시자, 게시일자, 수정일자, 진행상황
function handleExcelExport(items: ResearchItem[]) {
  const header = '순번,제목,내용,연구자,연구년도,연구예산,과제담당관,게시자,게시일자,수정일자,진행상황'
  const rows = items.map((item, i) =>
    [
      i + 1,
      `"${item.title}"`,
      `"${item.description}"`,
      item.researcherName,
      item.researchYear,
      item.budget,
      item.managerName,
      item.posterName,
      item.createdAt,
      item.updatedAt,
      item.progressStatus,
    ].join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '연구자료_목록.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function ResearchListPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<ResearchItem | null>(null)
  const [detailItem, setDetailItem] = useState<ResearchItem | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [searchKey, setSearchKey] = useState(0)
  const [lastItems, setLastItems] = useState<ResearchItem[]>([])

  const handleSearch = (values: Record<string, unknown>) => {
    setSearchParams({
      progressStatus: (values.progressStatus as string) || '',
      keyword: (values.keyword as string) || '',
      researcher: (values.researcher as string) || '',
      researchYear: (values.researchYear as string) || '',
      manager: (values.manager as string) || '',
    })
    setSearchKey((prev) => prev + 1)
  }

  const handleSearchReset = () => {
    setSearchParams({})
    setSearchKey((prev) => prev + 1)
  }

  // CSV 스펙: 순번, 제목, 연구자, 연구년도, 연구예산, 과제담당관, 게시자, 게시일자, 진행상황
  const columns: ProColumns<ResearchItem>[] = [
    { title: '순번', dataIndex: 'id', width: 80 },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    militaryPersonColumn<ResearchItem>('연구자', {
      serviceNumber: 'researcherServiceNumber',
      rank: 'researcherRank',
      name: 'researcherName',
    }),
    { title: '연구년도', dataIndex: 'researchYear', width: 100 },
    { title: '연구예산', dataIndex: 'budget', width: 120, render: (_, record) => record.budget ? `${Number(record.budget).toLocaleString()}원` : '-' },
    { title: '과제담당관', dataIndex: 'managerName', width: 110 },
    { title: '게시자', dataIndex: 'posterName', width: 100 },
    { title: '게시일자', dataIndex: 'createdAt', width: 110 },
    { title: '진행상황', dataIndex: 'progressStatus', width: 100 },
    {
      title: '관리',
      width: 120,
      render: (_, record) => (
        <>
          <Button
            size="small"
            type="link"
            onClick={(e) => {
              e.stopPropagation()
              setEditItem(record)
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={async (e) => {
              e?.stopPropagation()
              await fetch(`/api/sys11/research/${record.id}`, { method: 'DELETE' })
              void queryClient.invalidateQueries({ queryKey: ['sys11', 'list'] })
              void message.success('삭제되었습니다')
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button
              size="small"
              type="link"
              danger
              onClick={(e) => e.stopPropagation()}
            >
              삭제
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ]

  const handleCreate = async (values: Record<string, unknown>): Promise<boolean> => {
    await fetch('/api/sys11/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    void queryClient.invalidateQueries({ queryKey: ['sys11', 'list'] })
    setCreateOpen(false)
    void message.success('등록되었습니다')
    return true
  }

  const handleEdit = async (values: Record<string, unknown>): Promise<boolean> => {
    if (!editItem) return false
    await fetch(`/api/sys11/research/${editItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    void queryClient.invalidateQueries({ queryKey: ['sys11', 'list'] })
    setEditItem(null)
    void message.success('수정되었습니다')
    return true
  }

  return (
    <PageContainer title="연구자료">
      {/* 검색영역: 진행상황, 제목, 연구자, 연구년도, 과제담당관 */}
      <SearchForm fields={SEARCH_FIELDS} onSearch={handleSearch} onReset={handleSearchReset} />

      <DataTable<ResearchItem>
        key={searchKey}
        columns={columns}
        request={async (params) => {
          const result = await fetchResearch(params, searchParams)
          setLastItems(result.content)
          return result
        }}
        rowKey="id"
        headerTitle="연구자료 목록"
        toolBarRender={() => [
          <Button key="excel" onClick={() => handleExcelExport(lastItems)}>
            엑셀 다운로드
          </Button>,
          <Button key="create" type="primary" onClick={() => setCreateOpen(true)}>
            자료 등록
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => setDetailItem(record),
          style: { cursor: 'pointer' },
        })}
      />

      {/* 등록 모달 */}
      <Modal
        title="연구자료 등록"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnClose
        width={640}
      >
        <CrudForm fields={CRUD_FIELDS} onFinish={handleCreate} mode="create" />
        {/* 연구계획서: 최초/중간/최종/기타 구분, 각각 복수 등록 가능 */}
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>연구계획서</div>
          {['최초', '중간', '최종', '기타'].map((label) => (
            <Upload key={label} listType="text" beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />} size="small" style={{ marginRight: 8, marginBottom: 4 }}>
                {label}
              </Button>
            </Upload>
          ))}
        </div>
        {/* 연구보고서: 복수 등록 가능 */}
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>연구보고서</div>
          <Upload listType="text" beforeUpload={() => false} multiple>
            <Button icon={<UploadOutlined />}>파일 선택</Button>
          </Upload>
        </div>
      </Modal>

      {/* 수정 모달 */}
      <Modal
        title="연구자료 수정"
        open={!!editItem}
        onCancel={() => setEditItem(null)}
        footer={null}
        destroyOnClose
        width={640}
      >
        <CrudForm
          fields={CRUD_FIELDS}
          onFinish={handleEdit}
          initialValues={editItem ?? undefined}
          mode="edit"
        />
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>연구계획서</div>
          {['최초', '중간', '최종', '기타'].map((label) => (
            <Upload key={label} listType="text" beforeUpload={() => false} multiple>
              <Button icon={<UploadOutlined />} size="small" style={{ marginRight: 8, marginBottom: 4 }}>
                {label}
              </Button>
            </Upload>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>연구보고서</div>
          <Upload listType="text" beforeUpload={() => false} multiple>
            <Button icon={<UploadOutlined />}>파일 선택</Button>
          </Upload>
        </div>
      </Modal>

      {/* 상세 모달 */}
      <Modal
        title="연구자료 상세"
        open={!!detailItem}
        onCancel={() => setDetailItem(null)}
        width={640}
        footer={
          <Button
            type="primary"
            onClick={() => void message.success('다운로드 시작')}
          >
            다운로드
          </Button>
        }
      >
        {detailItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="제목">{detailItem.title}</Descriptions.Item>
            <Descriptions.Item label="연구분야">{detailItem.researchField}</Descriptions.Item>
            <Descriptions.Item label="연구년도">{detailItem.researchYear}</Descriptions.Item>
            <Descriptions.Item label="연구예산">{detailItem.budget ? `${Number(detailItem.budget).toLocaleString()}원` : '-'}</Descriptions.Item>
            <Descriptions.Item label="연구자 구분">{detailItem.researcherType}</Descriptions.Item>
            <Descriptions.Item label="연구자">{`${detailItem.researcherServiceNumber || ''} / ${detailItem.researcherRank || ''} / ${detailItem.researcherName || ''}`}</Descriptions.Item>
            <Descriptions.Item label="진행사항">{detailItem.progressStatus}</Descriptions.Item>
            <Descriptions.Item label="과제담당관">{detailItem.managerName}</Descriptions.Item>
            <Descriptions.Item label="내용">{detailItem.description}</Descriptions.Item>
            <Descriptions.Item label="게시자">{detailItem.posterName}</Descriptions.Item>
            <Descriptions.Item label="게시일자">{detailItem.createdAt}</Descriptions.Item>
            <Descriptions.Item label="파일명">{detailItem.fileName}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  )
}
