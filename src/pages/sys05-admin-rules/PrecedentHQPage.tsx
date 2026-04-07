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

interface Regulation extends Record<string, unknown> {
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
  { name: 'title', label: '예규명', type: 'text' },
  { name: 'docNumber', label: '문서번호', type: 'text' },
]

// CrudForm 필드 정의 (G07)
const PRECEDENT_HQ_FIELDS: CrudFormField[] = [
  { name: 'docNumber', label: '문서번호', type: 'text' as const, required: true },
  { name: 'title', label: '예규명', type: 'text' as const, required: true },
  {
    name: 'department',
    label: '담당부서',
    type: 'select' as const,
    required: true,
    options: [
      { label: '기획부', value: '기획부' },
      { label: '인사부', value: '인사부' },
      { label: '작전부', value: '작전부' },
      { label: '군수부', value: '군수부' },
      { label: '정보부', value: '정보부' },
    ],
  },
  { name: 'effectiveDate', label: '시행일', type: 'date' as const, required: true },
  { name: 'content', label: '내용', type: 'textarea' as const, required: true },
]

async function fetchPrecedentsHQ(
  params: PageRequest,
  searchParams?: Record<string, unknown>,
): Promise<PageResponse<Regulation>> {
  const url = new URL('/api/sys05/precedents/hq', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  // 검색 파라미터 전달
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, String(value))
    })
  }
  const res = await fetch(url.toString())
  const json = (await res.json()) as { success: boolean; data: PageResponse<Regulation> }
  return json.data
}

type FormValues = {
  docNumber: string
  title: string
  department: string
  effectiveDate: string
  content: string
}

export default function PrecedentHQPage() {
  const [selected, setSelected] = useState<Regulation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [crudOpen, setCrudOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Regulation | null>(null)
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

  const handleEdit = (record: Regulation) => {
    setEditTarget(record)
    setCrudOpen(true)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/sys05/precedents/hq/${id}`, { method: 'DELETE' })
    message.success('예규가 삭제되었습니다')
    actionRef.current?.reload()
  }

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    setLoading(true)
    try {
      const formValues = values as unknown as FormValues
      if (editTarget) {
        await fetch(`/api/sys05/precedents/hq/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        message.success('예규가 수정되었습니다')
      } else {
        await fetch('/api/sys05/precedents/hq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        message.success('예규가 등록되었습니다')
      }
      setCrudOpen(false)
      setEditTarget(null)
      actionRef.current?.reload()
      return true
    } finally {
      setLoading(false)
    }
  }

  const columns: ProColumns<Regulation>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '문서번호', dataIndex: 'docNumber', width: 140 },
    { title: '예규명', dataIndex: 'title', ellipsis: true },
    { title: '분류', dataIndex: 'category', width: 100 },
    { title: '담당부서', dataIndex: 'department', width: 120 },
    { title: '시행일', dataIndex: 'effectiveDate', width: 120 },
    militaryPersonColumn<Regulation>('등록자', {
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
    <PageContainer title="예규 - 해군본부">
      {/* 검색영역 (R2) */}
      <SearchForm fields={SEARCH_FIELDS} onSearch={handleSearch} onReset={handleSearchReset} />
      <DataTable<Regulation>
        columns={columns}
        request={(params) => fetchPrecedentsHQ(params, searchValues)}
        rowKey="id"
        headerTitle="해군본부 예규 목록"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleCreate}>
            예규 등록
          </Button>,
        ]}
        onRow={(record) => ({
          onClick: () => {
            setSelected(record as unknown as Regulation)
            setModalOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />

      {/* 상세 조회 Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="예규 상세 - 해군본부"
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
            <Descriptions.Item label="예규명">{selected.title}</Descriptions.Item>
            <Descriptions.Item label="분류">{selected.category}</Descriptions.Item>
            <Descriptions.Item label="담당부서">{selected.department}</Descriptions.Item>
            <Descriptions.Item label="시행일">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="내용">{selected.content}</Descriptions.Item>
            <Descriptions.Item label="등록자">
              {[selected.serviceNumber, selected.rank, selected.authorName].filter(Boolean).join(' / ')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 등록/수정 Modal (G07) */}
      <Modal
        title={editTarget ? '예규 수정' : '예규 등록'}
        open={crudOpen}
        onCancel={() => {
          setCrudOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={PRECEDENT_HQ_FIELDS}
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
