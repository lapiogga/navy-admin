/**
 * SYS06 지시문서 목록 페이지
 * - API 경로: /api/sys06/directives
 * - SearchForm, DataTable, CrudForm, militaryPersonColumn 적용
 */
import { useState, useRef } from 'react'
import { Button, Modal, Descriptions, Popconfirm, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { CrudFormField } from '@/shared/ui/CrudForm/CrudForm'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface Directive extends Record<string, unknown> {
  id: string
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
  serviceNumber?: string
  rank?: string
  authorName?: string
}

// 검색 필드 정의 (R2) - CSV '검색기능 추가' 반영
const SEARCH_FIELDS: SearchField[] = [
  { name: 'title', label: '지시명', type: 'text' },
  { name: 'docNumber', label: '문서번호', type: 'text' },
]

// CrudForm 필드 정의
const DIRECTIVE_FIELDS: CrudFormField[] = [
  { name: 'docNumber', label: '문서번호', type: 'text' as const, required: true },
  { name: 'title', label: '지시명', type: 'text' as const, required: true },
  {
    name: 'department',
    label: '발령부서',
    type: 'select' as const,
    required: true,
    options: [
      { label: '정책부', value: '정책부' },
      { label: '운영부', value: '운영부' },
      { label: '지원부', value: '지원부' },
      { label: '법제실', value: '법제실' },
      { label: '기획처', value: '기획처' },
      { label: '행정처', value: '행정처' },
      { label: '감사실', value: '감사실' },
      { label: '홍보실', value: '홍보실' },
    ],
  },
  { name: 'effectiveDate', label: '발령일', type: 'date' as const, required: true },
  { name: 'content', label: '내용', type: 'textarea' as const, required: true },
]

async function fetchDirectives(
  params: PageRequest,
  searchParams?: Record<string, unknown>,
): Promise<PageResponse<Directive>> {
  const url = new URL('/api/sys06/directives', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  // 검색 파라미터 전달
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, String(value))
    })
  }
  const res = await fetch(url.toString())
  const json = (await res.json()) as { success: boolean; data: PageResponse<Directive> }
  return json.data
}

type FormValues = {
  docNumber: string
  title: string
  department: string
  effectiveDate: string
  content: string
}

export default function Sys06DirectiveListPage() {
  const [selected, setSelected] = useState<Directive | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [crudOpen, setCrudOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Directive | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>({})
  const actionRef = useRef<ActionType>(null)

  // 검색 핸들러 (R2)
  const handleSearch = (values: Record<string, unknown>) => {
    setSearchValues(values)
    actionRef.current?.reload()
  }

  const handleSearchReset = () => {
    setSearchValues({})
    actionRef.current?.reload()
  }

  const handleCreate = () => {
    setEditTarget(null)
    setCrudOpen(true)
  }

  const handleEdit = (record: Directive) => {
    setEditTarget(record)
    setCrudOpen(true)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/sys06/directives/${id}`, { method: 'DELETE' })
    message.success('지시문서가 삭제되었습니다')
    actionRef.current?.reload()
  }

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    setLoading(true)
    try {
      const formValues = values as unknown as FormValues
      if (editTarget) {
        await fetch(`/api/sys06/directives/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        message.success('지시문서가 수정되었습니다')
      } else {
        await fetch('/api/sys06/directives', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        message.success('지시문서가 등록되었습니다')
      }
      setCrudOpen(false)
      setEditTarget(null)
      actionRef.current?.reload()
      return true
    } finally {
      setLoading(false)
    }
  }

  const columns: ProColumns<Directive>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '문서번호', dataIndex: 'docNumber', width: 140 },
    { title: '지시명', dataIndex: 'title', ellipsis: true },
    { title: '분류', dataIndex: 'category', width: 100 },
    { title: '발령부서', dataIndex: 'department', width: 120 },
    { title: '발령일', dataIndex: 'effectiveDate', width: 120 },
    // 등록자 군번/계급/성명 (R6)
    militaryPersonColumn<Directive>('등록자', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'authorName',
    }),
    {
      title: '액션',
      width: 140,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(record)
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="삭제하시겠습니까?"
            onConfirm={() => handleDelete(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="link"
              size="small"
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

  return (
    <PageContainer title="지시문서">
      {/* 검색영역 (R2) */}
      <SearchForm fields={SEARCH_FIELDS} onSearch={handleSearch} onReset={handleSearchReset} />
      <DataTable<Directive>
        columns={columns}
        request={(params) => fetchDirectives(params, searchValues)}
        rowKey="id"
        headerTitle="지시문서 목록"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleCreate}>
            지시문서 등록
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => {
            setSelected(record as unknown as Directive)
            setModalOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />

      {/* 상세 조회 Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="지시문서 상세"
        width={720}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => message.success('다운로드 시작')}>다운로드</Button>
            <Button type="primary" onClick={() => setModalOpen(false)}>닫기</Button>
          </div>
        }
      >
        {selected && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="문서번호">{selected.docNumber}</Descriptions.Item>
            <Descriptions.Item label="지시명">{selected.title}</Descriptions.Item>
            <Descriptions.Item label="분류">{selected.category}</Descriptions.Item>
            <Descriptions.Item label="발령부서">{selected.department}</Descriptions.Item>
            <Descriptions.Item label="발령일">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="내용">{selected.content}</Descriptions.Item>
            <Descriptions.Item label="등록자">
              {[selected.serviceNumber, selected.rank, selected.authorName].filter(Boolean).join(' / ')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 등록/수정 Modal */}
      <Modal
        title={editTarget ? '지시문서 수정' : '지시문서 등록'}
        open={crudOpen}
        onCancel={() => {
          setCrudOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={DIRECTIVE_FIELDS}
          onFinish={handleFinish}
          initialValues={
            editTarget
              ? {
                  docNumber: editTarget.docNumber,
                  title: editTarget.title,
                  department: editTarget.department,
                  effectiveDate: editTarget.effectiveDate,
                  content: editTarget.content,
                }
              : undefined
          }
          loading={loading}
          mode={editTarget ? 'edit' : 'create'}
        />
      </Modal>
    </PageContainer>
  )
}
