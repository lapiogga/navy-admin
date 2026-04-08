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
import type { Injured } from '@/shared/api/mocks/handlers/sys09'

const INJURY_TYPE_LABEL: Record<string, string> = {
  combat: '전상',
  duty: '공상',
}
const INJURY_TYPE_COLOR: Record<string, string> = {
  combat: 'red',
  duty: 'orange',
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

async function fetchInjured(params: PageRequest & Record<string, unknown>): Promise<PageResponse<Injured>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<Injured>>>('/sys09/injured', { params })
  return (res as ApiResult<PageResponse<Injured>>).data ?? (res as unknown as PageResponse<Injured>)
}

export default function CertMeritInjuredPage() {
  const [selected, setSelected] = useState<Injured | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const columns: ProColumns<Injured>[] = [
    {
      ...militaryPersonColumn<Injured>('상이자', {
        serviceNumber: 'serviceNumber',
        rank: 'rank',
        name: 'name',
      }),
    },
    { title: '소속', dataIndex: 'unit', width: 150 },
    {
      title: '상이구분',
      dataIndex: 'injuryType',
      width: 100,
      render: (_, r) => <StatusBadge status={r.injuryType} colorMap={INJURY_TYPE_COLOR} labelMap={INJURY_TYPE_LABEL} />,
    },
    { title: '상이등급', dataIndex: 'injuryGrade', width: 80 },
    { title: '상이일자', dataIndex: 'injuryDate', width: 120 },
    { title: '병명', dataIndex: 'diseaseName', width: 150 },
  ]

  const today = new Date().toISOString().split('T')[0]

  return (
    <PageContainer title="국가유공자 요건 해당사실 확인서(상이자)">
      <SearchForm fields={searchFields} onSearch={setSearchParams} onReset={() => setSearchParams({})} />
      <DataTable<Injured>
        key={JSON.stringify(searchParams)}
        request={(params) => fetchInjured({ ...params, ...searchParams })}
        columns={columns}
        rowKey="id"
        headerTitle="상이자 목록 (선택하면 확인서 미리보기)"
        onRow={(record) => ({
          onClick: () => setSelected(record),
          style: selected?.id === record.id ? { background: '#e6f7ff' } : undefined,
        })}
      />
      <Modal
        title="국가유공자 요건 해당사실 확인서(상이자)"
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
      >
        {selected && (
          <PrintableReport title="국가유공자 요건 해당사실 확인서(상이자)">
            <Descriptions bordered column={2} title="인적사항">
              <Descriptions.Item label="군번">{selected.serviceNumber}</Descriptions.Item>
              <Descriptions.Item label="성명">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="계급">{selected.rank}</Descriptions.Item>
              <Descriptions.Item label="소속">{selected.unit}</Descriptions.Item>
              <Descriptions.Item label="입대일자">{selected.enlistDate}</Descriptions.Item>
              <Descriptions.Item label="군구분">{selected.militaryType}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} title="상이 관련 사항" style={{ marginTop: 16 }}>
              <Descriptions.Item label="상이구분">{INJURY_TYPE_LABEL[selected.injuryType]}</Descriptions.Item>
              <Descriptions.Item label="상이등급">{selected.injuryGrade}</Descriptions.Item>
              <Descriptions.Item label="상이일자">{selected.injuryDate}</Descriptions.Item>
              <Descriptions.Item label="상이장소">{selected.injuryPlace}</Descriptions.Item>
              <Descriptions.Item label="상이원인">{selected.injuryCause}</Descriptions.Item>
              <Descriptions.Item label="치료병원">{selected.hospitalName}</Descriptions.Item>
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
