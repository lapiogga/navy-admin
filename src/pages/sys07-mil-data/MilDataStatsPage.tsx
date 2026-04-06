import { useState } from 'react'
import { Tabs, Button, Select, Modal, message, Table } from 'antd'
import { DatePicker } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { Column, Pie, Line, Bar } from '@ant-design/charts'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import { PrintableReport } from '@/pages/sys09-memorial/PrintableReport'
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = String(2024 - i)
  return { label: `${y}년`, value: y }
})

interface DocTypeStat { docType: string; count: number }
interface SecurityLevelStat { securityLevel: string; label: string; count: number }
interface UsageTrendItem { month: string; loan: number; view: number; checkout: number }
interface CrossTabItem extends Record<string, unknown> {
  id?: string; securityLevel: string; label: string; year: string
  active: number; on_loan: number; evaluation: number; disposed: number
}
interface ReceiptRecord extends Record<string, unknown> {
  id: string; securityLevel: string; docStatus: string; baseYear: string
  totalCount: number; newCount: number; disposedCount: number; remainCount: number
}
interface UsageRecord extends Record<string, unknown> {
  id: string; baseYear: string; securityLevel: string; usageType: string
  totalCount: number; unitCount: number
}

function securityLabel(level: string) {
  const m: Record<string, string> = { secret: '비밀', confidential: '대외비', normal: '일반' }
  return m[level] ?? level
}

export default function MilDataStatsPage() {
  const [baseYear, setBaseYear] = useState('2024')
  const [printOpen, setPrintOpen] = useState(false)

  // 문서별 현황
  const { data: byDocType = [] } = useQuery<DocTypeStat[]>({
    queryKey: ['sys07-stats-doctype'],
    queryFn: async () => {
      const r = await fetch('/api/sys07/stats/by-doc-type')
      const j: ApiResult<DocTypeStat[]> = await r.json()
      return j.data ?? []
    },
  })

  // 등급별 현황
  const { data: bySecLevel = [] } = useQuery<SecurityLevelStat[]>({
    queryKey: ['sys07-stats-seclevel', baseYear],
    queryFn: async () => {
      const r = await fetch(`/api/sys07/stats/by-security-level?year=${baseYear}`)
      const j: ApiResult<SecurityLevelStat[]> = await r.json()
      return j.data ?? []
    },
  })

  // 활용실적 추이
  const { data: usageTrend = [] } = useQuery<UsageTrendItem[]>({
    queryKey: ['sys07-stats-trend', baseYear],
    queryFn: async () => {
      const r = await fetch(`/api/sys07/stats/usage-trend?year=${baseYear}`)
      const j: ApiResult<UsageTrendItem[]> = await r.json()
      return j.data ?? []
    },
  })

  // 크로스탭
  const { data: crossTab = [] } = useQuery<CrossTabItem[]>({
    queryKey: ['sys07-stats-cross', baseYear],
    queryFn: async () => {
      const r = await fetch(`/api/sys07/stats/cross-tab?year=${baseYear}`)
      const j: ApiResult<CrossTabItem[]> = await r.json()
      return j.data ?? []
    },
  })

  // 접수용관리기록부
  const { data: receiptRecords = [] } = useQuery<ReceiptRecord[]>({
    queryKey: ['sys07-stats-receipt', baseYear],
    queryFn: async () => {
      const r = await fetch(`/api/sys07/stats/receipt-records?baseYear=${baseYear}`)
      const j: ApiResult<ReceiptRecord[]> = await r.json()
      return j.data ?? []
    },
  })

  // 활용지원기록부
  const { data: usageRecords = [] } = useQuery<UsageRecord[]>({
    queryKey: ['sys07-stats-usage-rec', baseYear],
    queryFn: async () => {
      const r = await fetch(`/api/sys07/stats/usage-records?baseYear=${baseYear}`)
      const j: ApiResult<UsageRecord[]> = await r.json()
      return j.data ?? []
    },
  })

  // Line 차트용 데이터 변환 (series 포맷)
  const trendData = usageTrend.flatMap((d) => [
    { month: d.month, count: d.loan, type: '대출' },
    { month: d.month, count: d.view, type: '열람' },
    { month: d.month, count: d.checkout, type: '지출' },
  ])

  // Bar 차트용 데이터 (크로스탭)
  const crossBarData = crossTab.flatMap((d) => [
    { label: d.label, count: d.active, status: '보존중' },
    { label: d.label, count: d.on_loan, status: '대출중' },
    { label: d.label, count: d.evaluation, status: '평가심의' },
    { label: d.label, count: d.disposed, status: '파기' },
  ])

  const receiptColumns: ProColumns<ReceiptRecord>[] = [
    { title: '비밀등급', dataIndex: 'securityLevel', render: (v) => securityLabel(v as string), width: 90 },
    { title: '문서상태', dataIndex: 'docStatus', width: 100 },
    { title: '기준연도', dataIndex: 'baseYear', width: 90 },
    { title: '총건수', dataIndex: 'totalCount', width: 80 },
    { title: '신규건수', dataIndex: 'newCount', width: 80 },
    { title: '파기건수', dataIndex: 'disposedCount', width: 80 },
    { title: '잔존건수', dataIndex: 'remainCount', width: 80 },
  ]

  const usageRecColumns: ProColumns<UsageRecord>[] = [
    { title: '기준연도', dataIndex: 'baseYear', width: 90 },
    { title: '비밀등급', dataIndex: 'securityLevel', render: (v) => securityLabel(v as string), width: 90 },
    { title: '활용유형', dataIndex: 'usageType', width: 90 },
    { title: '총건수', dataIndex: 'totalCount', width: 80 },
    { title: '부대수', dataIndex: 'unitCount', width: 80 },
  ]

  const toolBar = () => [
    <Button key="excel" icon={<DownloadOutlined />} onClick={() => message.success('엑셀 다운로드가 시작되었습니다')}>엑셀 다운로드</Button>,
    <Button key="print" icon={<PrinterOutlined />} onClick={() => setPrintOpen(true)}>인쇄</Button>,
  ]

  const yearFilter = (
    <Select value={baseYear} onChange={setBaseYear} options={YEAR_OPTIONS} style={{ width: 100, marginBottom: 16 }} />
  )

  const tabItems = [
    {
      key: '1',
      label: '문서별 보유현황',
      children: (
        <>
          <RangePicker style={{ marginBottom: 16 }} />
          <Column
            data={byDocType}
            xField="docType"
            yField="count"
            height={300}
            color="#003366"
            label={{ position: 'middle' }}
          />
        </>
      ),
    },
    {
      key: '2',
      label: '등급별 현황',
      children: (
        <>
          {yearFilter}
          <Pie
            data={bySecLevel}
            angleField="count"
            colorField="label"
            radius={0.8}
            innerRadius={0.5}
            color={['#ff4d4f', '#fa8c16', '#1890ff']}
            height={300}
            label={{ type: 'spider' }}
          />
        </>
      ),
    },
    {
      key: '3',
      label: '활용실적 추이',
      children: (
        <>
          {yearFilter}
          <Line
            data={trendData}
            xField="month"
            yField="count"
            seriesField="type"
            height={300}
          />
        </>
      ),
    },
    {
      key: '4',
      label: '등급별/상태별 현황',
      children: (
        <>
          {yearFilter}
          <Table
            size="small"
            dataSource={crossTab}
            rowKey="securityLevel"
            pagination={false}
            columns={[
              { title: '비밀등급', dataIndex: 'label', width: 90 },
              { title: '보존중', dataIndex: 'active', width: 80 },
              { title: '대출중', dataIndex: 'on_loan', width: 80 },
              { title: '평가심의', dataIndex: 'evaluation', width: 80 },
              { title: '파기', dataIndex: 'disposed', width: 80 },
            ]}
            style={{ marginBottom: 24 }}
          />
          <Bar
            data={crossBarData}
            xField="count"
            yField="label"
            seriesField="status"
            height={300}
            isStack
          />
        </>
      ),
    },
    {
      key: '5',
      label: '접수용관리기록부',
      children: (
        <>
          {yearFilter}
          <DataTable<ReceiptRecord>
            columns={receiptColumns}
            request={async (p: PageRequest) => ({
              content: receiptRecords.slice(p.page * p.size, (p.page + 1) * p.size),
              totalElements: receiptRecords.length,
              totalPages: Math.ceil(receiptRecords.length / p.size),
              size: p.size,
              number: p.page,
            })}
            rowKey="id"
            toolBarRender={toolBar}
            headerTitle="접수용관리기록부"
          />
        </>
      ),
    },
    {
      key: '6',
      label: '활용지원기록부',
      children: (
        <>
          {yearFilter}
          <DataTable<UsageRecord>
            columns={usageRecColumns}
            request={async (p: PageRequest) => ({
              content: usageRecords.slice(p.page * p.size, (p.page + 1) * p.size),
              totalElements: usageRecords.length,
              totalPages: Math.ceil(usageRecords.length / p.size),
              size: p.size,
              number: p.page,
            })}
            rowKey="id"
            toolBarRender={toolBar}
            headerTitle="활용지원기록부"
          />
        </>
      ),
    },
  ]

  return (
    <PageContainer title="통계자료">
      <Tabs items={tabItems} />

      {/* 인쇄 미리보기 Modal */}
      <Modal
        title="통계자료 출력"
        open={printOpen}
        onCancel={() => setPrintOpen(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <PrintableReport title="군사자료 통계 현황">
          <h4>문서별 보유현황</h4>
          <Table size="small" dataSource={byDocType} rowKey="docType" pagination={false}
            columns={[{ title: '문서구분', dataIndex: 'docType' }, { title: '건수', dataIndex: 'count', width: 80 }]} />
          <h4 style={{ marginTop: 16 }}>접수용관리기록부</h4>
          <Table size="small" dataSource={receiptRecords} rowKey="id" pagination={false}
            columns={[
              { title: '비밀등급', dataIndex: 'securityLevel', render: (v: string) => securityLabel(v) },
              { title: '기준연도', dataIndex: 'baseYear' },
              { title: '총건수', dataIndex: 'totalCount' },
              { title: '잔존건수', dataIndex: 'remainCount' },
            ]} />
        </PrintableReport>
      </Modal>
    </PageContainer>
  )
}
