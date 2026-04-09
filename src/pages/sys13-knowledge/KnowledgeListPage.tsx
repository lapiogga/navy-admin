import { useState, useRef } from 'react'
import { Modal, Button, Tag, Rate, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import type { PageResponse, ApiResult } from '@/shared/api/types'
import KnowledgeDetailPage from './KnowledgeDetailPage'
import type { Knowledge } from '@/shared/api/mocks/handlers/sys13'

const CATEGORY_OPTIONS = ['업무지식', '기술지식', '행정지식', '법규지식', '기타']
const UNITS = ['1사단', '2사단', '해병대사령부', '교육훈련단', '상륙기동단']

const CATEGORY_COLOR: Record<string, string> = {
  업무지식: 'blue',
  기술지식: 'green',
  행정지식: 'orange',
  법규지식: 'red',
  기타: 'default',
}

// CSV 검색조건: 카테고리, 키워드, 제목, 내용, 작성자, 작성부대
const SEARCH_FIELDS: SearchField[] = [
  {
    name: 'category',
    label: '카테고리',
    type: 'select',
    options: CATEGORY_OPTIONS.map((c) => ({ label: c, value: c })),
    placeholder: '전체',
  },
  {
    name: 'searchType',
    label: '검색대상',
    type: 'select',
    options: [
      { label: '전체', value: '전체' },
      { label: '제목', value: '제목' },
      { label: '내용', value: '내용' },
      { label: '작성자', value: '작성자' },
    ],
    placeholder: '전체',
  },
  {
    name: 'keyword',
    label: '키워드',
    type: 'text',
    placeholder: '검색어 입력',
  },
  {
    name: 'authorUnit',
    label: '작성부대',
    type: 'select',
    options: UNITS.map((u) => ({ label: u, value: u })),
    placeholder: '전체',
  },
  {
    name: 'sortBy',
    label: '정렬',
    type: 'select',
    options: [
      { label: '최신순', value: '최신순' },
      { label: '추천순', value: '추천순' },
      { label: '조회순', value: '조회순' },
      { label: '평점순', value: '평점순' },
    ],
    placeholder: '최신순',
  },
]

export default function KnowledgeListPage() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>(null)
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // 검색 조건 상태
  const [searchParams, setSearchParams] = useState<Record<string, string>>({})

  const fetchKnowledge = async (params: { page: number; size: number }): Promise<PageResponse<Knowledge>> => {
    const query = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
    })
    if (searchParams.category) query.set('category', searchParams.category)
    if (searchParams.keyword) {
      query.set('keyword', searchParams.keyword)
      query.set('searchType', searchParams.searchType || '전체')
    }
    if (searchParams.authorUnit) query.set('authorUnit', searchParams.authorUnit)
    if (searchParams.sortBy) query.set('sortBy', searchParams.sortBy)

    const res = await fetch(`/api/sys13/knowledge?${query}`)
    const json: ApiResult<PageResponse<Knowledge>> = await res.json()
    if (!json.success) throw new Error('지식 목록 조회 실패')
    return json.data
  }

  const handleTitleClick = async (record: Knowledge) => {
    try {
      const res = await fetch(`/api/sys13/knowledge/${record.id}`)
      const json: ApiResult<Knowledge> = await res.json()
      if (json.success) {
        setSelectedKnowledge(json.data)
        setDetailOpen(true)
        void queryClient.invalidateQueries({ queryKey: ['sys13-knowledge'] })
      }
    } catch {
      void message.error('지식 상세 조회 실패')
    }
  }

  const handleDetailClose = () => {
    setDetailOpen(false)
    setSelectedKnowledge(null)
    actionRef.current?.reload()
  }

  const handleSearch = (values: Record<string, unknown>) => {
    const params: Record<string, string> = {}
    Object.entries(values).forEach(([k, v]) => {
      if (v != null && v !== '') params[k] = String(v)
    })
    setSearchParams(params)
    actionRef.current?.reload()
  }

  const handleReset = () => {
    setSearchParams({})
    actionRef.current?.reload()
  }

  const columns: ProColumns<Knowledge>[] = [
    {
      title: '제목',
      dataIndex: 'title',
      width: 300,
      render: (_, record) => (
        <a onClick={() => handleTitleClick(record)}>{record.title}</a>
      ),
    },
    {
      title: '유형',
      dataIndex: 'category',
      width: 100,
      render: (_, record) => (
        <Tag color={CATEGORY_COLOR[record.category] || 'default'}>{record.category}</Tag>
      ),
    },
    // R6: 작성자 군번/계급/성명
    militaryPersonColumn<Knowledge>('작성자', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'authorName',
    }),
    {
      title: '소속부대',
      dataIndex: 'authorUnit',
      width: 150,
      sorter: true,
    },
    {
      title: '조회수',
      dataIndex: 'viewCount',
      width: 80,
      sorter: true,
      valueType: 'digit',
    },
    {
      title: '추천',
      dataIndex: 'recommendCount',
      width: 80,
      sorter: true,
      valueType: 'digit',
    },
    {
      title: '평점',
      dataIndex: 'rating',
      width: 140,
      sorter: true,
      render: (_, record) => (
        <Rate
          disabled
          allowHalf
          defaultValue={record.rating}
          style={{ fontSize: 12 }}
        />
      ),
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 120,
      sorter: true,
    },
  ]

  return (
    <PageContainer title="지식열람">
      {/* R2: 검색영역 - CSV 검색조건 기반 */}
      <SearchForm fields={SEARCH_FIELDS} onSearch={handleSearch} onReset={handleReset} />

      <DataTable<Knowledge>
        columns={columns}
        request={fetchKnowledge}
        rowKey="id"
        actionRef={actionRef}
      />

      {/* 지식 상세 Modal */}
      <Modal
        open={detailOpen}
        onCancel={handleDetailClose}
        footer={null}
        width={800}
        title="지식 상세"
        destroyOnClose
      >
        {selectedKnowledge && (
          <KnowledgeDetailPage
            knowledge={selectedKnowledge}
            onClose={handleDetailClose}
          />
        )}
      </Modal>
    </PageContainer>
  )
}
