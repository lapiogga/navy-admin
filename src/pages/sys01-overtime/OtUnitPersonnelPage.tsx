import { Button, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { OtUnitPersonnel } from '@/shared/api/mocks/handlers/sys01-overtime'

/** 검색 필드 정의 */
const personnelSearchFields: SearchField[] = [
  { name: 'name', label: '성명', type: 'text', placeholder: '성명 검색' },
  { name: 'rank', label: '계급', type: 'select', options: [
    { label: '중위', value: '중위' }, { label: '대위', value: '대위' },
    { label: '소령', value: '소령' }, { label: '중령', value: '중령' },
    { label: '대령', value: '대령' },
  ]},
  { name: 'unitName', label: '부대(서)', type: 'text', placeholder: '부대명 검색' },
]

async function fetchUnitPersonnel(params: PageRequest): Promise<PageResponse<OtUnitPersonnel>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OtUnitPersonnel>>>('/sys01/unit-personnel', {
    params: { page: params.page, size: params.size },
  })
  const data = (res as ApiResult<PageResponse<OtUnitPersonnel>>).data ?? (res as unknown as PageResponse<OtUnitPersonnel>)
  return data
}

export default function OtUnitPersonnelPage() {
  const columns: ProColumns<OtUnitPersonnel>[] = [
    militaryPersonColumn<OtUnitPersonnel>('군번/계급/성명', { serviceNumber: 'serviceNumber', rank: 'rank', name: 'name' }),
    { title: '직책', dataIndex: 'position', width: 110 },
    { title: '부대(서)', dataIndex: 'unitName', width: 110 },
    { title: '연락처', dataIndex: 'phone', width: 130 },
    { title: '당직개소', dataIndex: 'dutyPost', width: 120 },
  ]

  return (
    <PageContainer title="부대인원 조회">
      <SearchForm fields={personnelSearchFields} onSearch={(values) => console.log('검색:', values)} />
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
