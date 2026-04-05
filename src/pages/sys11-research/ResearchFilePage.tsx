import { PageContainer } from '@ant-design/pro-components'
import { Button, message } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import type { PageRequest, PageResponse } from '@/shared/api/types'

interface FileItem extends Record<string, unknown> {
  id: string
  title: string
  fileName: string
  downloadCount: number
  createdAt: string
}

// 파일 크기 Mock 생성
function mockFileSize(): string {
  const sizes = ['1.2MB', '2.4MB', '856KB', '3.1MB', '512KB', '1.8MB']
  return sizes[Math.floor(Math.random() * sizes.length)]
}

async function fetchFiles(params: PageRequest): Promise<PageResponse<FileItem>> {
  const url = new URL('/api/sys11/files', window.location.origin)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('size', String(params.size))
  const res = await fetch(url.toString())
  const json = await res.json()
  return json.data
}

export default function ResearchFilePage() {
  const columns: ProColumns<FileItem>[] = [
    { title: '번호', dataIndex: 'id', width: 80 },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '파일명', dataIndex: 'fileName', width: 180 },
    {
      title: '파일크기',
      dataIndex: 'id',
      width: 90,
      render: () => mockFileSize(),
    },
    { title: '다운로드수', dataIndex: 'downloadCount', width: 100 },
    { title: '등록일', dataIndex: 'createdAt', width: 110 },
    {
      title: '다운로드',
      width: 100,
      render: () => (
        <Button
          size="small"
          type="primary"
          onClick={() => void message.success('다운로드 시작')}
        >
          다운로드
        </Button>
      ),
    },
  ]

  return (
    <PageContainer title="자료실">
      <DataTable<FileItem>
        columns={columns}
        request={(params) => fetchFiles(params)}
        rowKey="id"
        headerTitle="자료실 목록"
      />
    </PageContainer>
  )
}
