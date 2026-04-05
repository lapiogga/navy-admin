import { useState } from 'react'
import { Button, message, Modal, Descriptions } from 'antd'
import { StarFilled, StarOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import type { PageRequest, PageResponse } from '@/shared/api/types'
import { useFavorites } from './useFavorites'

interface Regulation {
  id: string
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
  fileUrl?: string
}

async function fetchRegulations(params: PageRequest): Promise<PageResponse<Regulation>> {
  const url = new URL('/api/sys05/regulations', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  const res = await fetch(url.toString())
  const json = await res.json() as { success: boolean; data: PageResponse<Regulation> }
  return json.data
}

export default function RegulationListPage() {
  const [selected, setSelected] = useState<Regulation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { toggle, isFavorite } = useFavorites('sys05-regulation-favorites')

  const columns: ProColumns<Regulation>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '문서번호', dataIndex: 'docNumber', width: 140 },
    { title: '규정명', dataIndex: 'title', ellipsis: true },
    { title: '담당부서', dataIndex: 'department', width: 120 },
    { title: '시행일', dataIndex: 'effectiveDate', width: 120 },
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
  ]

  return (
    <PageContainer title="현행규정">
      <DataTable<Regulation>
        columns={columns}
        request={fetchRegulations}
        rowKey="id"
        headerTitle="현행규정 목록"
        onRow={(record) => ({
          onClick: () => {
            setSelected(record as unknown as Regulation)
            setModalOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />
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
            <Descriptions.Item label="담당부서">{selected.department}</Descriptions.Item>
            <Descriptions.Item label="시행일">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="내용">{selected.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  )
}
