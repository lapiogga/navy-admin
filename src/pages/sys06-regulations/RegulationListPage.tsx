/**
 * SYS06 현행규정 목록 페이지
 * - API 경로: /api/sys06/regulations
 * - 조직도(부/실/단) 트리 + 규정 목록
 * - SearchForm, DataTable, CrudForm, militaryPersonColumn 적용
 */
import { useState, useRef } from 'react'
import { Button, Modal, Descriptions, Row, Col, Card, Tree, Popconfirm, message } from 'antd'
import { StarFilled, StarOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { CrudFormField } from '@/shared/ui/CrudForm/CrudForm'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import type { PageRequest, PageResponse } from '@/shared/api/types'
import { useFavorites } from '../sys05-admin-rules/useFavorites'

interface Regulation extends Record<string, unknown> {
  id: string
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
  fileUrl?: string
  fileName?: string
  serviceNumber?: string
  rank?: string
  authorName?: string
}

// 검색 필드 정의 (R2) - CSV '검색기능 추가' 반영
const SEARCH_FIELDS: SearchField[] = [
  { name: 'title', label: '규정명', type: 'text' },
  { name: 'docNumber', label: '문서번호', type: 'text' },
  {
    name: 'category',
    label: '분류',
    type: 'select',
    options: [
      { label: '법령', value: '법령' },
      { label: '훈령', value: '훈령' },
      { label: '예규', value: '예규' },
      { label: '고시', value: '고시' },
    ],
  },
]

// 조직도 트리 데이터 - 부/실/단 구조
const ORG_TREE_DATA = [
  {
    title: '해병대사령부',
    key: 'hq',
    children: [
      {
        title: '부(部)',
        key: 'dept-group',
        children: [
          { title: '정책부', key: '정책부' },
          { title: '운영부', key: '운영부' },
          { title: '지원부', key: '지원부' },
        ],
      },
      {
        title: '실(室)',
        key: 'office-group',
        children: [
          { title: '법제실', key: '법제실' },
          { title: '감사실', key: '감사실' },
          { title: '홍보실', key: '홍보실' },
        ],
      },
      {
        title: '처(處)',
        key: 'division-group',
        children: [
          { title: '기획처', key: '기획처' },
          { title: '행정처', key: '행정처' },
        ],
      },
    ],
  },
]

// CrudForm 필드 정의 - 첨부파일 포함
const REGULATION_FIELDS: CrudFormField[] = [
  { name: 'title', label: '규정명', type: 'text' as const, required: true },
  { name: 'docNumber', label: '문서번호', type: 'text' as const, required: true },
  {
    name: 'category',
    label: '분류',
    type: 'select' as const,
    required: true,
    options: [
      { label: '법령', value: '법령' },
      { label: '훈령', value: '훈령' },
      { label: '예규', value: '예규' },
      { label: '고시', value: '고시' },
    ],
  },
  {
    name: 'department',
    label: '소관부서',
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
  { name: 'effectiveDate', label: '시행일', type: 'date' as const, required: true },
  { name: 'content', label: '내용', type: 'textarea' as const, required: true },
  {
    name: 'fileName',
    label: '첨부파일명',
    type: 'text' as const,
    placeholder: '첨부파일이 있는 경우 파일명을 입력하세요',
  },
]

async function fetchRegulations(
  params: PageRequest,
  department?: string,
  searchParams?: Record<string, unknown>,
): Promise<PageResponse<Regulation>> {
  const url = new URL('/api/sys06/regulations', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  if (department) {
    url.searchParams.set('department', department)
  }
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
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
  fileName?: string
}

export default function Sys06RegulationListPage() {
  const [selected, setSelected] = useState<Regulation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [crudOpen, setCrudOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Regulation | null>(null)
  const [selectedDept, setSelectedDept] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>({})
  const actionRef = useRef<ActionType>(null)
  const { toggle, isFavorite } = useFavorites('sys06-regulation-favorites')

  // 검색 핸들러 (R2)
  const handleSearch = (values: Record<string, unknown>) => {
    setSearchValues(values)
    actionRef.current?.reload()
  }

  const handleSearchReset = () => {
    setSearchValues({})
    actionRef.current?.reload()
  }

  // 조직도 선택 핸들러 - 그룹 노드 선택 시 전체 조회
  const GROUP_KEYS = ['hq', 'dept-group', 'office-group', 'division-group']
  const handleOrgSelect = (selectedKeys: React.Key[]) => {
    const key = selectedKeys[0] as string
    if (!key || GROUP_KEYS.includes(key)) {
      setSelectedDept(undefined)
    } else {
      setSelectedDept(key)
    }
    actionRef.current?.reload()
  }

  // CRUD 핸들러
  const handleCreate = () => {
    setEditTarget(null)
    setCrudOpen(true)
  }

  const handleEdit = (record: Regulation) => {
    setEditTarget(record)
    setCrudOpen(true)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/sys06/regulations/${id}`, { method: 'DELETE' })
    message.success('규정이 삭제되었습니다')
    actionRef.current?.reload()
  }

  const handleFinish = async (values: Record<string, unknown>): Promise<boolean> => {
    setLoading(true)
    try {
      const formValues = values as unknown as FormValues
      if (editTarget) {
        await fetch(`/api/sys06/regulations/${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        message.success('규정이 수정되었습니다')
      } else {
        await fetch('/api/sys06/regulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        })
        message.success('규정이 등록되었습니다')
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
    { title: '규정명', dataIndex: 'title', ellipsis: true },
    { title: '분류', dataIndex: 'category', width: 100 },
    { title: '소관부서', dataIndex: 'department', width: 120 },
    { title: '시행일', dataIndex: 'effectiveDate', width: 120 },
    // 등록자 군번/계급/성명 (R6)
    militaryPersonColumn<Regulation>('등록자', {
      serviceNumber: 'serviceNumber',
      rank: 'rank',
      name: 'authorName',
    }),
    {
      title: '즐겨찾기',
      dataIndex: 'id',
      width: 80,
      render: (_, record) =>
        isFavorite(record.id) ? (
          <StarFilled
            style={{ color: '#faad14', cursor: 'pointer', fontSize: 18 }}
            onClick={(e) => {
              e.stopPropagation()
              toggle(record.id)
            }}
          />
        ) : (
          <StarOutlined
            style={{ cursor: 'pointer', fontSize: 18 }}
            onClick={(e) => {
              e.stopPropagation()
              toggle(record.id)
            }}
          />
        ),
    },
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
    <PageContainer title="현행규정">
      <Row gutter={16}>
        <Col span={6}>
          <Card title="조직도" size="small">
            <Tree
              treeData={ORG_TREE_DATA}
              onSelect={handleOrgSelect}
              defaultExpandAll
            />
          </Card>
        </Col>
        <Col span={18}>
          {/* 검색영역 (R2) */}
          <SearchForm fields={SEARCH_FIELDS} onSearch={handleSearch} onReset={handleSearchReset} />
          <DataTable<Regulation>
            columns={columns}
            request={(params) => fetchRegulations(params, selectedDept, searchValues)}
            rowKey="id"
            headerTitle="현행규정 목록"
            actionRef={actionRef}
            toolBarRender={() => [
              <Button key="create" type="primary" onClick={handleCreate}>
                규정 등록
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
        </Col>
      </Row>

      {/* 상세 조회 Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="규정 상세"
        width={720}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={() => message.success('다운로드 시작')}>다운로드</Button>
            <Button onClick={() => message.success('인쇄를 시작합니다')}>프린트</Button>
            <Button type="primary" onClick={() => setModalOpen(false)}>닫기</Button>
          </div>
        }
      >
        {selected && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="문서번호">{selected.docNumber}</Descriptions.Item>
            <Descriptions.Item label="규정명">{selected.title}</Descriptions.Item>
            <Descriptions.Item label="분류">{selected.category}</Descriptions.Item>
            <Descriptions.Item label="소관부서">{selected.department}</Descriptions.Item>
            <Descriptions.Item label="시행일">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="내용">{selected.content}</Descriptions.Item>
            <Descriptions.Item label="등록자">
              {[selected.serviceNumber, selected.rank, selected.authorName].filter(Boolean).join(' / ')}
            </Descriptions.Item>
            <Descriptions.Item label="첨부파일">
              {selected.fileUrl ? (
                <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer">
                  {selected.fileName ?? '파일 다운로드'}
                </a>
              ) : (
                '없음'
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 등록/수정 Modal */}
      <Modal
        title={editTarget ? '규정 수정' : '규정 등록'}
        open={crudOpen}
        onCancel={() => {
          setCrudOpen(false)
          setEditTarget(null)
        }}
        footer={null}
        destroyOnClose
      >
        <CrudForm<Record<string, unknown>>
          fields={REGULATION_FIELDS}
          onFinish={handleFinish}
          initialValues={
            editTarget
              ? {
                  title: editTarget.title,
                  docNumber: editTarget.docNumber,
                  category: editTarget.category,
                  department: editTarget.department,
                  effectiveDate: editTarget.effectiveDate,
                  content: editTarget.content,
                  fileName: editTarget.fileName,
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
