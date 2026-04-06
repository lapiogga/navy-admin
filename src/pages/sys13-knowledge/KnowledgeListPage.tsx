import { useState, useRef } from 'react'
import { Modal, Select, Input, Button, Tag, Rate, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import type { PageResponse, ApiResult } from '@/shared/api/types'
import KnowledgeDetailPage from './KnowledgeDetailPage'
import type { Knowledge } from '@/shared/api/mocks/handlers/sys13'

const CATEGORY_OPTIONS = ['업무지식', '기술지식', '행정지식', '법규지식', '기타']
const SEARCH_TYPE_OPTIONS = ['전체', '제목', '내용', '작성자']
const SORT_OPTIONS = ['최신순', '추천순', '조회순', '평점순']

const CATEGORY_COLOR: Record<string, string> = {
  업무지식: 'blue',
  기술지식: 'green',
  행정지식: 'orange',
  법규지식: 'red',
  기타: 'default',
}

export default function KnowledgeListPage() {
  const queryClient = useQueryClient()
  const actionRef = useRef<ActionType>(null)
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // 검색 조건 상태
  const [searchParams, setSearchParams] = useState({
    category: '',
    keyword: '',
    searchType: '전체',
    sortBy: '최신순',
  })

  const fetchKnowledge = async (params: { page: number; size: number }): Promise<PageResponse<Knowledge>> => {
    const query = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      ...(searchParams.category ? { category: searchParams.category } : {}),
      ...(searchParams.keyword ? { keyword: searchParams.keyword, searchType: searchParams.searchType } : {}),
      sortBy: searchParams.sortBy,
    })
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

  const handleSearch = () => {
    actionRef.current?.reload()
  }

  const columns: ProColumns<Knowledge>[] = [
    {
      title: '제목',
      dataIndex: 'title',
      width: 300,
      render: (_, record) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => handleTitleClick(record)}>
          {record.title}
        </Button>
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
    {
      title: '작성자',
      dataIndex: 'authorName',
      width: 100,
      sorter: true,
    },
    {
      title: '소속',
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
      {/* 검색 영역 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          placeholder="카테고리"
          allowClear
          style={{ width: 140 }}
          value={searchParams.category || undefined}
          onChange={(v) => setSearchParams((prev) => ({ ...prev, category: v || '' }))}
          options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))}
        />
        <Select
          style={{ width: 120 }}
          value={searchParams.searchType}
          onChange={(v) => setSearchParams((prev) => ({ ...prev, searchType: v }))}
          options={SEARCH_TYPE_OPTIONS.map((t) => ({ label: t, value: t }))}
        />
        <Input
          placeholder="키워드 입력"
          style={{ width: 200 }}
          value={searchParams.keyword}
          onChange={(e) => setSearchParams((prev) => ({ ...prev, keyword: e.target.value }))}
          onPressEnter={handleSearch}
        />
        <Select
          style={{ width: 120 }}
          value={searchParams.sortBy}
          onChange={(v) => setSearchParams((prev) => ({ ...prev, sortBy: v }))}
          options={SORT_OPTIONS.map((s) => ({ label: s, value: s }))}
        />
        <Button type="primary" onClick={handleSearch}>
          검색
        </Button>
      </div>

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
