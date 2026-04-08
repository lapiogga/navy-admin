import { useState } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { Descriptions, Modal } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { PrintableReport } from './PrintableReport'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { Deceased } from '@/shared/api/mocks/handlers/sys09'

const DEATH_TYPE_LABEL: Record<string, string> = {
  combat: '전사',
  duty: '순직',
  disease: '병사',
  accident: '사고사',
}
const DEATH_TYPE_COLOR: Record<string, string> = {
  combat: 'red',
  duty: 'orange',
  disease: 'blue',
  accident: 'default',
}

const RANK_OPTIONS = [
  '이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사',
  '소위', '중위', '대위', '소령', '중령', '대령',
].map((r) => ({ label: r, value: r }))

const UNIT_OPTIONS = ['1사단', '2사단', '해병대사령부', '교육훈련단', '상륙기동단'].map((u) => ({ label: u, value: u }))

const searchFields: SearchField[] = [
  { name: 'rank', label: '계급', type: 'select', options: RANK_OPTIONS },
  { name: 'unit', label: '소속', type: 'select', options: UNIT_OPTIONS },
  { name: 'name', label: '성명', type: 'text', placeholder: '성명 입력' },
  { name: 'serviceNumber', label: '군번', type: 'text', placeholder: '군번 입력' },
]

async function fetchDeceased(params: PageRequest & Record<string, unknown>): Promise<PageResponse<Deceased>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Deceased>>>('/sys09/deceased', { params })
  return (res as ApiResult<PageResponse<Deceased>>).data ?? (res as unknown as PageResponse<Deceased>)
}

export default function CertMeritDeathPage() {
  const [selected, setSelected] = useState<Deceased | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const columns: ProColumns<Deceased>[] = [
    {
      ...militaryPersonColumn<Deceased>('사망자', {
        serviceNumber: 'serviceNumber',
        rank: 'rank',
        name: 'name',
      }),
    },
    { title: '소속', dataIndex: 'unit', width: 150 },
    {
      title: '사망구분',
      dataIndex: 'deathType',
      width: 100,
      render: (_, r) => <StatusBadge status={r.deathType} colorMap={DEATH_TYPE_COLOR} labelMap={DEATH_TYPE_LABEL} />,
    },
    { title: '사망일자', dataIndex: 'deathDate', width: 120 },
    { title: '사망장소', dataIndex: 'deathPlace', width: 150 },
  ]

  const today = new Date().toISOString().split('T')[0]

  return (
    <PageContainer title="국가유공자 요건 해당사실 확인서(사망자)">
      <SearchForm fields={searchFields} onSearch={setSearchParams} onReset={() => setSearchParams({})} />
      <DataTable<Deceased>
        key={JSON.stringify(searchParams)}
        request={(params) => fetchDeceased({ ...params, ...searchParams })}
        columns={columns}
        rowKey="id"
        headerTitle="사망자 목록 (선택하면 확인서 미리보기)"
        onRow={(record) => ({
          onClick: () => setSelected(record),
          style: selected?.id === record.id ? { background: '#e6f7ff' } : undefined,
        })}
      />
      <Modal
        title="국가유공자 요건 해당사실 확인서(사망자)"
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
      >
        {selected && (
          <PrintableReport title="국가유공자 요건 해당사실 확인서(사망자)">
            <Descriptions bordered column={2} title="인적사항">
              <Descriptions.Item label="군번">{selected.serviceNumber}</Descriptions.Item>
              <Descriptions.Item label="성명">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="계급">{selected.rank}</Descriptions.Item>
              <Descriptions.Item label="소속">{selected.unit}</Descriptions.Item>
              <Descriptions.Item label="입대일자">{selected.enlistDate}</Descriptions.Item>
              <Descriptions.Item label="군구분">{selected.militaryType}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} title="사망 관련 사항" style={{ marginTop: 16 }}>
              <Descriptions.Item label="사망구분">{DEATH_TYPE_LABEL[selected.deathType]}</Descriptions.Item>
              <Descriptions.Item label="사망일자">{selected.deathDate}</Descriptions.Item>
              <Descriptions.Item label="사망장소">{selected.deathPlace}</Descriptions.Item>
              <Descriptions.Item label="사망원인">{selected.deathCause}</Descriptions.Item>
              <Descriptions.Item label="안장지">{selected.burialPlace}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} title="국가유공자 요건" style={{ marginTop: 16 }}>
              <Descriptions.Item label="요건 해당 여부">해당</Descriptions.Item>
              <Descriptions.Item label="근거법령">국가유공자 등 예우 및 지원에 관한 법률 제4조</Descriptions.Item>
            </Descriptions>
            <div style={{ textAlign: 'center', margin: '16px 0' }}>작성일자: {today}</div>
            <div className="signature-area">확인자: _________________ (인)</div>
          </PrintableReport>
        )}
      </Modal>
    </PageContainer>
  )
}
