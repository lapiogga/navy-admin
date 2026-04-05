import { useState } from 'react'
import { Button, message, Modal, Descriptions } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface Regulation {
  id: string
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
}

async function fetchPrecedentsHQ(params: PageRequest): Promise<PageResponse<Regulation>> {
  const url = new URL('/api/sys05/precedents/hq', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  const res = await fetch(url.toString())
  const json = await res.json() as { success: boolean; data: PageResponse<Regulation> }
  return json.data
}

export default function PrecedentHQPage() {
  const [selected, setSelected] = useState<Regulation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const columns: ProColumns<Regulation>[] = [
    { title: '번호', dataIndex: 'id', width: 100 },
    { title: '문서번호', dataIndex: 'docNumber', width: 160 },
    { title: '예규명', dataIndex: 'title', ellipsis: true },
    { title: '담당부서', dataIndex: 'department', width: 120 },
    { title: '시행일', dataIndex: 'effectiveDate', width: 120 },
  ]

  return (
    <PageContainer title="예규 - 해군본부">
      <DataTable<Regulation>
        columns={columns}
        request={fetchPrecedentsHQ}
        rowKey="id"
        headerTitle="해군본부 예규 목록"
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
            <Descriptions.Item label="담당부서">{selected.department}</Descriptions.Item>
            <Descriptions.Item label="시행일">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="내용">{selected.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  )
}
