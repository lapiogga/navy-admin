import { useState } from 'react'
import { Button, message, Modal, Descriptions } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface Directive {
  id: string
  title: string
  docNumber: string
  category: string
  department: string
  effectiveDate: string
  content: string
}

async function fetchDirectives(params: PageRequest): Promise<PageResponse<Directive>> {
  const url = new URL('/api/sys05/directives', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  const res = await fetch(url.toString())
  const json = await res.json() as { success: boolean; data: PageResponse<Directive> }
  return json.data
}

export default function DirectiveListPage() {
  const [selected, setSelected] = useState<Directive | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const columns: ProColumns<Directive>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '문서번호', dataIndex: 'docNumber', width: 140 },
    { title: '지시명', dataIndex: 'title', ellipsis: true },
    { title: '발령부서', dataIndex: 'department', width: 120 },
    { title: '발령일', dataIndex: 'effectiveDate', width: 120 },
  ]

  return (
    <PageContainer title="지시문서">
      <DataTable<Directive>
        columns={columns}
        request={fetchDirectives}
        rowKey="id"
        headerTitle="지시문서 목록"
        onRow={(record) => ({
          onClick: () => {
            setSelected(record as unknown as Directive)
            setModalOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />
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
            <Descriptions.Item label="발령부서">{selected.department}</Descriptions.Item>
            <Descriptions.Item label="발령일">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="내용">{selected.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  )
}
