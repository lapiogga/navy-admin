import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageContainer } from '@ant-design/pro-components'
import { Tabs, Modal, Button, Popconfirm, Statistic, Row, Col, Card, Table, Select, Input, message } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { PageRequest, PageResponse } from '@/shared/api/types'
import { useNavigate } from 'react-router-dom'

interface ResearchItem extends Record<string, unknown> {
  id: string
  title: string
  author: string
  department: string
  category: string
  description: string
  downloadCount: number
  viewCount: number
  createdAt: string
}

interface ResearchCategory extends Record<string, unknown> {
  id: string
  name: string
  sortOrder: number
}

interface ResearchStats {
  total: number
  thisMonth: number
  topCategory: string
  totalDownloads: number
}

// 자료관리 탭
function DataManagementTab() {
  const queryClient = useQueryClient()

  async function fetchResearch(params: PageRequest): Promise<PageResponse<ResearchItem>> {
    const url = new URL('/api/sys11/research', window.location.origin)
    url.searchParams.set('page', String(params.page))
    url.searchParams.set('size', String(params.size))
    const res = await fetch(url.toString())
    const json = await res.json()
    return json.data
  }

  const columns: ProColumns<ResearchItem>[] = [
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '저자', dataIndex: 'author', width: 100 },
    { title: '분야', dataIndex: 'category', width: 100 },
    { title: '등록일', dataIndex: 'createdAt', width: 110 },
    {
      title: '관리',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="삭제하시겠습니까?"
          onConfirm={async () => {
            await fetch(`/api/sys11/research/${record.id}`, { method: 'DELETE' })
            void queryClient.invalidateQueries({ queryKey: ['sys11', 'admin', 'list'] })
            void message.success('삭제되었습니다')
          }}
        >
          <Button size="small" type="link" danger>삭제</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <DataTable<ResearchItem>
      columns={columns}
      request={fetchResearch}
      rowKey="id"
      headerTitle="자료 관리"
    />
  )
}

// 카테고리관리 탭
function CategoryManagementTab() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['sys11', 'categories'],
    queryFn: async () => {
      const res = await fetch('/api/sys11/categories')
      const json = await res.json()
      return json.data as ResearchCategory[]
    },
  })

  const handleCreate = async (values: Record<string, unknown>): Promise<boolean> => {
    await fetch('/api/sys11/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    void queryClient.invalidateQueries({ queryKey: ['sys11', 'categories'] })
    setCreateOpen(false)
    void message.success('카테고리가 등록되었습니다')
    return true
  }

  const columns = [
    { title: '카테고리명', dataIndex: 'name' as keyof ResearchCategory },
    { title: '순서', dataIndex: 'sortOrder' as keyof ResearchCategory, width: 80 },
    {
      title: '관리',
      width: 100,
      render: (_: unknown, record: ResearchCategory) => (
        <Popconfirm
          title="삭제하시겠습니까?"
          onConfirm={async () => {
            await fetch(`/api/sys11/categories/${record.id}`, { method: 'DELETE' })
            void queryClient.invalidateQueries({ queryKey: ['sys11', 'categories'] })
            void message.success('삭제되었습니다')
          }}
        >
          <Button size="small" type="link" danger>삭제</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>카테고리 추가</Button>
      </div>
      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
      <Modal
        title="카테고리 추가"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        destroyOnClose
      >
        <CrudForm
          fields={[{ name: 'name', label: '카테고리명', type: 'text', required: true }]}
          onFinish={handleCreate}
          mode="create"
        />
      </Modal>
    </>
  )
}

// 통계 탭
function StatisticsTab() {
  const { data: stats } = useQuery({
    queryKey: ['sys11', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/sys11/research/stats')
      const json = await res.json()
      return json.data as ResearchStats
    },
  })

  return (
    <Row gutter={16}>
      <Col span={6}>
        <Card>
          <Statistic title="총 자료수" value={stats?.total ?? 0} suffix="건" />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="이번달 등록" value={stats?.thisMonth ?? 0} suffix="건" />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="총 다운로드" value={stats?.totalDownloads ?? 0} suffix="회" />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="인기 분야" value={stats?.topCategory ?? '-'} />
        </Card>
      </Col>
    </Row>
  )
}

// 사용자관리 Mock 탭
function UserManagementTab() {
  const mockUsers = [
    { key: '1', name: '홍길동', unit: '제1대대', role: '일반사용자' },
    { key: '2', name: '김철수', unit: '제2대대', role: '관리자' },
    { key: '3', name: '이영희', unit: '본부대대', role: '일반사용자' },
  ]
  const columns = [
    { title: '사용자명', dataIndex: 'name' },
    { title: '소속', dataIndex: 'unit' },
    { title: '역할', dataIndex: 'role' },
  ]
  return <Table dataSource={mockUsers} columns={columns} pagination={false} size="small" />
}

// 삭제관리 Mock 탭
function DeleteManagementTab() {
  const mockDeleted = [
    { key: '1', title: '[전략연구] 삭제된 연구 예시 1', deletedAt: '2026-03-01', deletedBy: '관리자' },
    { key: '2', title: '[교육훈련] 삭제된 연구 예시 2', deletedAt: '2026-03-15', deletedBy: '관리자' },
  ]
  const columns = [
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '삭제일', dataIndex: 'deletedAt', width: 110 },
    { title: '삭제자', dataIndex: 'deletedBy', width: 100 },
  ]
  return <Table dataSource={mockDeleted} columns={columns} pagination={false} size="small" />
}

// 권한관리 탭 — 공통 권한관리로 리다이렉트
function AuthManagementTab() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '24px 0', textAlign: 'center' }}>
      <Button type="primary" onClick={() => navigate('/sys11/2/1')}>
        사용자별 권한등록 페이지로 이동
      </Button>
    </div>
  )
}

// 다운로드 이력 탭
// CSV 스펙: 순번, 게시판이름, 게시글번호, 사용자정보(군번/계급/성명), IP, 다운로드일시, 파일명
interface DownloadHistoryItem extends Record<string, unknown> {
  id: string
  downloaderServiceNumber: string
  downloaderRank: string
  downloaderName: string
  downloaderUnit: string
  ip: string
  fileName: string
  downloadedAt: string
  boardType: string
  postId: string
}

function DownloadHistoryTab() {
  const [boardFilter, setBoardFilter] = useState('')
  const [searchField, setSearchField] = useState('downloaderServiceNumber')
  const [searchValue, setSearchValue] = useState('')

  async function fetchDownloadHistory(params: PageRequest): Promise<PageResponse<DownloadHistoryItem>> {
    const url = new URL('/api/sys11/download-history', window.location.origin)
    url.searchParams.set('page', String(params.page))
    url.searchParams.set('size', String(params.size))
    if (boardFilter) {
      url.searchParams.set('boardType', boardFilter)
    }
    if (searchValue) {
      url.searchParams.set('searchField', searchField)
      url.searchParams.set('searchValue', searchValue)
    }
    const res = await fetch(url.toString())
    const json = await res.json()
    return json.data
  }

  const columns: ProColumns<DownloadHistoryItem>[] = [
    { title: '순번', dataIndex: 'id', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '게시판', dataIndex: 'boardType', width: 100 },
    { title: '게시글번호', dataIndex: 'postId', width: 110 },
    { title: '군번', dataIndex: 'downloaderServiceNumber', width: 120 },
    { title: '계급', dataIndex: 'downloaderRank', width: 80 },
    { title: '성명', dataIndex: 'downloaderName', width: 100 },
    { title: 'IP', dataIndex: 'ip', width: 130 },
    { title: '다운로드일시', dataIndex: 'downloadedAt', width: 150 },
    { title: '파일명', dataIndex: 'fileName', ellipsis: true },
  ]

  return (
    <>
      {/* CSV 스펙: 조건1(게시판), 조건2(군번/성명/IP/파일이름), 조건3(검색내용) */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <Select
          value={boardFilter}
          onChange={setBoardFilter}
          style={{ width: 150 }}
          options={[
            { label: '전체', value: '' },
            { label: '연구자료', value: '연구자료' },
            { label: '자료실', value: '자료실' },
          ]}
        />
        <Select
          value={searchField}
          onChange={setSearchField}
          style={{ width: 130 }}
          options={[
            { label: '군번', value: 'downloaderServiceNumber' },
            { label: '성명', value: 'downloaderName' },
            { label: 'IP', value: 'ip' },
            { label: '파일이름', value: 'fileName' },
          ]}
        />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="검색내용"
          style={{ width: 200 }}
          allowClear
        />
      </div>
      <DataTable<DownloadHistoryItem>
        columns={columns}
        request={fetchDownloadHistory}
        rowKey="id"
        headerTitle="다운로드 이력"
      />
    </>
  )
}

export default function ResearchAdminPage() {
  const tabItems = [
    { key: 'data', label: '자료관리', children: <DataManagementTab /> },
    { key: 'category', label: '카테고리관리', children: <CategoryManagementTab /> },
    { key: 'stats', label: '통계', children: <StatisticsTab /> },
    { key: 'users', label: '사용자관리', children: <UserManagementTab /> },
    { key: 'deleted', label: '삭제관리', children: <DeleteManagementTab /> },
    { key: 'auth', label: '권한관리', children: <AuthManagementTab /> },
    { key: 'download-history', label: '다운로드 이력', children: <DownloadHistoryTab /> },
  ]

  return (
    <PageContainer title="관리자">
      <Tabs items={tabItems} />
    </PageContainer>
  )
}
