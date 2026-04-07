import { Button, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtUnitPersonnel } from '@/shared/api/mocks/handlers/sys01-overtime'

async function fetchUnitPersonnel(params: PageRequest): Promise<PageResponse<OtUnitPersonnel>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtUnitPersonnel>>>('/sys01/unit-personnel', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtUnitPersonnel>>).data ?? (res as unknown as PageResponse<OtUnitPersonnel>)
  return data
}

export default function OtUnitPersonnelPage() {
  const columns: ProColumns<OtUnitPersonnel>[] = [
    { title: '이름', dataIndex: 'name', width: 90 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '직책', dataIndex: 'position', width: 110 },
    { title: '부대(서)', dataIndex: 'unitName', width: 110 },
    { title: '군번', dataIndex: 'militaryId', width: 110 },
    { title: '연락처', dataIndex: 'phone', width: 130 },
    { title: '당직개소', dataIndex: 'dutyPost', width: 120 },
  ]

  return (
    <PageContainer title="부대인원 조회">
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Button
          icon={<DownloadOutlined />}
          onClick={() => void message.success('자료 출력이 완료되었습니다.')}
        >
          자료 출력 (엑셀)
        </Button>
      </div>
      <DataTable<OtUnitPersonnel>
        columns={columns}
        request={fetchUnitPersonnel}
        rowKey="id"
        headerTitle="부대인원 목록"
      />
    </PageContainer>
  )
}
