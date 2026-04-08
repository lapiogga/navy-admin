import { useState } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { Descriptions, Table, Modal } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { PrintableReport } from './PrintableReport'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { CombatReview } from '@/shared/api/mocks/handlers/sys09'

const RESULT_LABEL: Record<string, string> = { eligible: '해당', ineligible: '비해당' }
const RESULT_COLOR: Record<string, string> = { eligible: 'green', ineligible: 'red' }

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

async function fetchReviews(params: PageRequest & Record<string, unknown>): Promise<PageResponse<CombatReview>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<CombatReview>>>('/sys09/reviews', { params })
  return (res as ApiResult<PageResponse<CombatReview>>).data ?? (res as unknown as PageResponse<CombatReview>)
}

const committeeColumns = [
  { title: '직책', dataIndex: 'role', key: 'role' },
  { title: '성명', dataIndex: 'name', key: 'name' },
  { title: '서명', dataIndex: 'signature', key: 'signature' },
]

const committeeData = [
  { key: '1', role: '위원장', name: '', signature: '' },
  { key: '2', role: '위원', name: '', signature: '' },
  { key: '3', role: '위원', name: '', signature: '' },
  { key: '4', role: '간사', name: '', signature: '' },
]

export default function CertReviewResultPage() {
  const [selected, setSelected] = useState<CombatReview | null>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  const columns: ProColumns<CombatReview>[] = [
    { title: '심사차수', dataIndex: 'reviewRound', width: 80 },
    { title: '심사일자', dataIndex: 'reviewDate', width: 120 },
    {
      ...militaryPersonColumn<CombatReview>('대상자', {
        serviceNumber: 'serviceNumber',
        rank: 'rank',
        name: 'name',
      }),
    },
    { title: '소속', dataIndex: 'unit', width: 150 },
    { title: '병명', dataIndex: 'diseaseName', width: 150 },
    { title: '전공상 분류', dataIndex: 'combatCategory', width: 120 },
    {
      title: '심사결과',
      dataIndex: 'result',
      width: 100,
      render: (_, r) => <StatusBadge status={r.result} colorMap={RESULT_COLOR} labelMap={RESULT_LABEL} />,
    },
  ]

  return (
    <PageContainer title="전공사상심사결과">
      <SearchForm fields={searchFields} onSearch={setSearchParams} onReset={() => setSearchParams({})} />
      <DataTable<CombatReview>
        key={JSON.stringify(searchParams)}
        request={(params) => fetchReviews({ ...params, ...searchParams })}
        columns={columns}
        rowKey="id"
        headerTitle="심사 목록 (선택하면 결과 미리보기)"
        onRow={(record) => ({
          onClick: () => setSelected(record),
          style: selected?.id === record.id ? { background: '#e6f7ff' } : undefined,
        })}
      />
      <Modal
        title="전공사상심사결과"
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={720}
      >
        {selected && (
          <PrintableReport title="전공사상심사결과">
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="심사차수">{selected.reviewRound}</Descriptions.Item>
              <Descriptions.Item label="심사일자">{selected.reviewDate}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={2} title="대상자 정보" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="성명">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="군번">{selected.serviceNumber}</Descriptions.Item>
              <Descriptions.Item label="계급">{selected.rank}</Descriptions.Item>
              <Descriptions.Item label="소속">{selected.unit}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} title="사고 내용" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="사고유형">{selected.incidentType}</Descriptions.Item>
              <Descriptions.Item label="사고일자">{selected.incidentDate}</Descriptions.Item>
              <Descriptions.Item label="사고원인">{selected.incidentCause}</Descriptions.Item>
            </Descriptions>
            <Descriptions bordered column={1} title="심사결과" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="결과">
                <strong style={{ color: selected.result === 'eligible' ? 'green' : 'red' }}>
                  {RESULT_LABEL[selected.result]}
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="상세">{selected.resultDetail}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 8 }}>위원 서명</div>
              <Table columns={committeeColumns} dataSource={committeeData} pagination={false} bordered />
            </div>
          </PrintableReport>
        )}
      </Modal>
    </PageContainer>
  )
}
