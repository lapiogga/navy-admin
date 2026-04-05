import { useState } from 'react'
import { Button, Card, Space, Typography, Divider, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
  DataTable,
  CrudForm,
  DetailModal,
  SearchForm,
  StatusBadge,
  showConfirmDialog,
} from '@/shared/ui'
import type { CrudFormField, SearchField, DetailField } from '@/shared/ui'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { Title } = Typography

interface DemoItem extends Record<string, unknown> {
  id: string
  title: string
  author: string
  status: string
  createdAt: string
  unit: string
}

// SearchForm 필드 정의
const searchFields: SearchField[] = [
  { name: 'keyword', label: '검색어', type: 'text', placeholder: '제목 또는 작성자' },
  {
    name: 'status',
    label: '상태',
    type: 'select',
    options: [
      { label: '승인', value: '승인' },
      { label: '반려', value: '반려' },
      { label: '대기', value: '대기' },
    ],
  },
  { name: 'dateRange', label: '기간', type: 'dateRange' },
]

// CrudForm 필드 정의
const formFields: CrudFormField[] = [
  { name: 'title', label: '제목', type: 'text', required: true, placeholder: '제목을 입력하세요' },
  { name: 'author', label: '작성자', type: 'text', required: true },
  {
    name: 'unit',
    label: '소속부대',
    type: 'select',
    options: [
      { label: '해군본부', value: '해군본부' },
      { label: '1사단', value: '1사단' },
      { label: '2사단', value: '2사단' },
    ],
  },
  {
    name: 'status',
    label: '상태',
    type: 'select',
    required: true,
    options: [
      { label: '대기', value: '대기' },
      { label: '진행', value: '진행' },
    ],
  },
]

// DetailModal 필드 정의
const detailFields: DetailField[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: '제목' },
  { key: 'author', label: '작성자' },
  { key: 'unit', label: '소속부대' },
  { key: 'status', label: '상태', render: (v) => <StatusBadge status={String(v)} /> },
  { key: 'createdAt', label: '작성일' },
]

export default function DemoPage() {
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailData, setDetailData] = useState<DemoItem | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const fetchItems = async (params: PageRequest): Promise<PageResponse<DemoItem>> => {
    const res = await apiClient.get<unknown, ApiResult<PageResponse<DemoItem>>>('/demo/items', {
      params: { ...params, ...searchParams },
    })
    return res.data
  }

  const handleCreate = async (values: Record<string, unknown>) => {
    await apiClient.post('/demo/items', values)
    message.success('등록되었습니다')
    setFormOpen(false)
    return true
  }

  const handleDelete = (item: DemoItem) => {
    showConfirmDialog({
      title: '삭제 확인',
      content: `"${item.title}"을(를) 삭제하시겠습니까?`,
      danger: true,
      onConfirm: async () => {
        await apiClient.delete(`/demo/items/${item.id}`)
        message.success('삭제되었습니다')
      },
    })
  }

  return (
    <div>
      <Title level={4}>공통 컴포넌트 데모 (Phase 0 Frozen Contract)</Title>

      <Card title="1. SearchForm -- 검색 폼" className="mb-4">
        <SearchForm
          fields={searchFields}
          onSearch={setSearchParams}
          onReset={() => setSearchParams({})}
        />
      </Card>

      <Card title="2. DataTable -- 데이터 테이블" className="mb-4">
        <DataTable<DemoItem>
          columns={[
            { title: '제목', dataIndex: 'title', ellipsis: true },
            { title: '작성자', dataIndex: 'author', width: 100 },
            { title: '소속부대', dataIndex: 'unit', width: 120 },
            {
              title: '상태',
              dataIndex: 'status',
              width: 80,
              render: (_, record) => <StatusBadge status={record.status} />,
            },
            { title: '작성일', dataIndex: 'createdAt', width: 110 },
            {
              title: '관리',
              width: 120,
              render: (_, record) => (
                <Space>
                  <a
                    onClick={() => {
                      setDetailData(record)
                      setDetailOpen(true)
                    }}
                  >
                    상세
                  </a>
                  <a onClick={() => handleDelete(record)} className="text-red-500">
                    삭제
                  </a>
                </Space>
              ),
            },
          ]}
          request={fetchItems}
          rowKey="id"
          headerTitle="데모 목록"
          toolBarRender={() => [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setFormOpen(true)}
            >
              등록
            </Button>,
          ]}
        />
      </Card>

      <Card title="3. StatusBadge -- 상태 배지" className="mb-4">
        <Space>
          <StatusBadge status="승인" />
          <StatusBadge status="반려" />
          <StatusBadge status="대기" />
          <StatusBadge status="완료" />
          <StatusBadge status="진행" />
        </Space>
      </Card>

      <Divider />

      {/* 4. DetailModal */}
      <DetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="상세 정보"
        data={detailData}
        fields={detailFields}
      />

      {/* 5. CrudForm (카드로 표시) */}
      {formOpen && (
        <Card title="5. CrudForm -- 등록 폼" className="mb-4">
          <CrudForm<Record<string, unknown>>
            fields={formFields}
            onFinish={handleCreate}
            mode="create"
          />
          <Button onClick={() => setFormOpen(false)} className="mt-2">
            닫기
          </Button>
        </Card>
      )}
    </div>
  )
}
