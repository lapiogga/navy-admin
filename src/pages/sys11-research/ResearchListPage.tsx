import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Modal, Button, message, Popconfirm, Descriptions, Card, Space, Select, Input, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface ResearchItem extends Record<string, unknown> {
  id: string
  title: string
  author: string
  department: string
  category: string
  description: string
  fileUrl: string
  fileName: string
  downloadCount: number
  viewCount: number
  researchYear: number
  budget: number
  progressStatus: string
  createdAt: string
  updatedAt: string
}

const CATEGORY_OPTIONS = [
  { label: '전략연구', value: '전략연구' },
  { label: '작전연구', value: '작전연구' },
  { label: '교육훈련', value: '교육훈련' },
  { label: '인사관리', value: '인사관리' },
  { label: '군수지원', value: '군수지원' },
  { label: '기타', value: '기타' },
]

const CRUD_FIELDS = [
  { name: 'title', label: '제목', type: 'text' as const, required: true },
  { name: 'category', label: '분야', type: 'select' as const, required: true, options: CATEGORY_OPTIONS },
  { name: 'author', label: '연구자', type: 'text' as const, required: true },
  { name: 'researchYear', label: '연구년도', type: 'number' as const, required: true },
  { name: 'budget', label: '연구예산', type: 'number' as const, required: true },
  { name: 'progressStatus', label: '진행상황', type: 'select' as const, required: true, options: [
    { label: '최초평가', value: '최초평가' },
    { label: '중간평가', value: '중간평가' },
    { label: '최종평가', value: '최종평가' },
  ] },
  { name: 'department', label: '부서', type: 'text' as const },
  { name: 'description', label: '설명', type: 'textarea' as const, required: true },
]

async function fetchResearch(
  params: PageRequest,
  progressStatus?: string,
  keyword?: string,
): Promise<PageResponse<ResearchItem>> {
  const url = new URL('/api/sys11/research', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  if (progressStatus) {
    url.searchParams.set('progressStatus', progressStatus)
  }
  if (keyword) {
    url.searchParams.set('keyword', keyword)
  }
  const res = await fetch(url.toString())
  const json = await res.json()
  return json.data
}

function handleExcelExport(items: ResearchItem[]) {
  const header = '순번,제목,내용,연구자,연구년도,연구예산'
  const rows = items.map((item, i) =>
    [
      i + 1,
      `"${item.title}"`,
      `"${item.description}"`,
      item.author,
      item.researchYear,
      item.budget,
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
  const [searchStatus, setSearchStatus] = useState<string>('')
  const [keyword, setKeyword] = useState('')
  const [searchKey, setSearchKey] = useState(0)
  const [lastItems, setLastItems] = useState<ResearchItem[]>([])

  const handleSearch = () => {
    setSearchKey((prev) => prev + 1)
  }

  const columns: ProColumns<ResearchItem>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '연구자', dataIndex: 'author', width: 100 },
    { title: '연구년도', dataIndex: 'researchYear', width: 100 },
    { title: '연구예산', dataIndex: 'budget', width: 110, render: (_, record) => record.budget ? `${Number(record.budget).toLocaleString()}원` : '-' },
    { title: '분야', dataIndex: 'category', width: 100 },
    { title: '부서', dataIndex: 'department', width: 120 },
    { title: '다운로드', dataIndex: 'downloadCount', width: 90 },
    { title: '조회수', dataIndex: 'viewCount', width: 80 },
    { title: '등록일', dataIndex: 'createdAt', width: 110 },
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
      {/* G14: 검색조건 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space>
          <Select
            value={searchStatus}
            onChange={setSearchStatus}
            placeholder="진행상황"
            allowClear
            style={{ width: 140 }}
            options={[
              { label: '전체', value: '' },
              { label: '최초평가', value: '최초평가' },
              { label: '중간평가', value: '중간평가' },
              { label: '최종평가', value: '최종평가' },
            ]}
          />
          <Input.Search
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="키워드 검색"
            onSearch={handleSearch}
            style={{ width: 200 }}
            allowClear
          />
        </Space>
      </Card>

      <DataTable<ResearchItem>
        key={searchKey}
        columns={columns}
        request={async (params) => {
          const result = await fetchResearch(params, searchStatus, keyword)
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
      >
        <CrudForm fields={CRUD_FIELDS} onFinish={handleCreate} mode="create" />
        <Upload listType="text" beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>첨부파일 선택</Button>
        </Upload>
      </Modal>

      {/* 수정 모달 */}
      <Modal
        title="연구자료 수정"
        open={!!editItem}
        onCancel={() => setEditItem(null)}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={CRUD_FIELDS}
          onFinish={handleEdit}
          initialValues={editItem ?? undefined}
          mode="edit"
        />
        <Upload listType="text" beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>첨부파일 선택</Button>
        </Upload>
      </Modal>

      {/* 상세 모달 (다운로드 버튼 포함) */}
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
            <Descriptions.Item label="연구자">{detailItem.author}</Descriptions.Item>
            <Descriptions.Item label="분야">{detailItem.category}</Descriptions.Item>
            <Descriptions.Item label="부서">{detailItem.department}</Descriptions.Item>
            <Descriptions.Item label="연구년도">{detailItem.researchYear}</Descriptions.Item>
            <Descriptions.Item label="연구예산">{detailItem.budget ? `${Number(detailItem.budget).toLocaleString()}원` : '-'}</Descriptions.Item>
            <Descriptions.Item label="진행상황">{detailItem.progressStatus}</Descriptions.Item>
            <Descriptions.Item label="설명">{detailItem.description}</Descriptions.Item>
            <Descriptions.Item label="파일명">{detailItem.fileName}</Descriptions.Item>
            <Descriptions.Item label="다운로드수">{detailItem.downloadCount}</Descriptions.Item>
            <Descriptions.Item label="조회수">{detailItem.viewCount}</Descriptions.Item>
            <Descriptions.Item label="등록일">{detailItem.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  )
}
