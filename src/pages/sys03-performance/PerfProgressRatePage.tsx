import { useState, useRef } from 'react'
import { Modal, Button, message, Tabs, Descriptions } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Bar } from '@ant-design/charts'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { ProgressRate } from '@/shared/api/mocks/handlers/sys03-performance'

const DEPT_NAMES = ['작전처', '정보처', '인사처', '군수처', '기획처', '교육훈련처', '통신처', '동원처']

/** 부대별 추진진도율 검색 필드 */
const unitSearchFields: SearchField[] = [
  { name: 'keyword', label: '부대명/부대(서)', type: 'text', placeholder: '부대명 또는 부대(서) 검색' },
]

/** 부서별 과제별 추진진도율 검색 필드 */
const deptSearchFields: SearchField[] = [
  { name: 'keyword', label: '부대(서)/과제명', type: 'text', placeholder: '부대(서) 또는 과제명 검색' },
  { name: 'deptName', label: '부대(서)', type: 'select', options: DEPT_NAMES.map((d) => ({ label: d, value: d })) },
]

async function fetchProgressRates(params: PageRequest & { keyword?: string; deptName?: string }): Promise<PageResponse<ProgressRate>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<ProgressRate>>>('/sys03/progress-rates', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword, deptName: params.deptName },
  })
  return (res as ApiResult<PageResponse<ProgressRate>>).data ?? (res as unknown as PageResponse<ProgressRate>)
}

function ProgressBarChart({ data }: { data: ProgressRate[] }) {
  const chartData = data.map((item) => ({
    name: item.deptName || item.unitName,
    value: item.progressRate,
  }))
  return (
    <Bar
      data={chartData}
      xField="value"
      yField="name"
      height={Math.max(200, chartData.length * 30)}
      label={{ position: 'right' as const, formatter: (d: { value?: number }) => `${d.value ?? 0}%` }}
      color="#1890ff"
    />
  )
}

function UnitProgressTab() {
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProgressRate | null>(null)
  const [chartData, setChartData] = useState<ProgressRate[]>([])
  const printRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<ActionType>()

  const exportMutation = useMutation({
    mutationFn: async () => apiClient.post('/sys03/progress-rates/export'),
    onSuccess: () => message.success('엑셀 파일 준비 완료'),
    onError: () => message.error('다운로드에 실패했습니다.'),
  })

  const columns: ProColumns<ProgressRate>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '부대명', dataIndex: 'unitName', width: 120 },
    { title: '부대(서)', dataIndex: 'deptName' },
    { title: '전체 과제 수', dataIndex: 'totalTasks', width: 110 },
    {
      title: '추진진도율',
      dataIndex: 'progressRate',
      width: 110,
      render: (val) => <span style={{ fontWeight: 'bold' }}>{String(val)}%</span>,
    },
    {
      title: '상세',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedItem(record)
            setDetailOpen(true)
          }}
        >
          상세
        </Button>
      ),
    },
  ]

  return (
    <>
      <SearchForm fields={unitSearchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<ProgressRate>
        rowKey="id"
        columns={columns}
        headerTitle="부대별 추진진도율 목록"
        actionRef={actionRef}
        request={(params) => fetchProgressRates({ ...params, ...searchParams } as PageRequest & { keyword?: string; deptName?: string })}
        toolBarRender={() => [
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            인쇄
          </Button>,
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => exportMutation.mutate()}
            loading={exportMutation.isPending}
          >
            엑셀 저장
          </Button>,
        ]}
        postData={(data: ProgressRate[]) => {
          setChartData(data)
          return data
        }}
      />
      {chartData.length > 0 && (
        <div ref={printRef} style={{ marginTop: 16 }} className="print-area">
          <ProgressBarChart data={chartData} />
        </div>
      )}
      <Modal
        title="부대별 추진진도율 상세"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={500}
      >
        {selectedItem && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="부대명">{selectedItem.unitName}</Descriptions.Item>
            <Descriptions.Item label="부대(서)">{selectedItem.deptName}</Descriptions.Item>
            <Descriptions.Item label="전체 과제 수">{selectedItem.totalTasks}개</Descriptions.Item>
            <Descriptions.Item label="추진진도율">{selectedItem.progressRate}%</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}

function DeptProgressTab() {
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProgressRate | null>(null)
  const deptActionRef = useRef<ActionType>()

  const exportMutation = useMutation({
    mutationFn: async () => apiClient.post('/sys03/progress-rates/export'),
    onSuccess: () => message.success('엑셀 파일 준비 완료'),
    onError: () => message.error('다운로드에 실패했습니다.'),
  })

  const columns: ProColumns<ProgressRate>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '부대(서)', dataIndex: 'deptName' },
    { title: '과제명', dataIndex: 'unitName', width: 120 },
    { title: '전체 과제 수', dataIndex: 'totalTasks', width: 110 },
    {
      title: '추진진도율',
      dataIndex: 'progressRate',
      width: 110,
      render: (val) => <span style={{ fontWeight: 'bold' }}>{String(val)}%</span>,
    },
    {
      title: '상세',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedItem(record)
            setDetailOpen(true)
          }}
        >
          상세
        </Button>
      ),
    },
  ]

  return (
    <>
      <SearchForm fields={deptSearchFields} onSearch={(v) => { setSearchParams(v); deptActionRef.current?.reload() }} onReset={() => { setSearchParams({}); deptActionRef.current?.reload() }} />
      <DataTable<ProgressRate>
        rowKey="id"
        columns={columns}
        headerTitle="부서별 과제별 추진진도율 목록"
        actionRef={deptActionRef}
        request={(params) => fetchProgressRates({ ...params, ...searchParams } as PageRequest & { keyword?: string; deptName?: string })}
        toolBarRender={() => [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={() => exportMutation.mutate()}
            loading={exportMutation.isPending}
          >
            엑셀 저장
          </Button>,
        ]}
      />
      <Modal
        title="부서별 과제별 추진현황 상세"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={500}
      >
        {selectedItem && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="부대(서)">{selectedItem.deptName}</Descriptions.Item>
            <Descriptions.Item label="과제명">{selectedItem.unitName}</Descriptions.Item>
            <Descriptions.Item label="전체 과제 수">{selectedItem.totalTasks}개</Descriptions.Item>
            <Descriptions.Item label="추진진도율">{selectedItem.progressRate}%</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  )
}

export default function PerfProgressRatePage() {
  return (
    <PageContainer title="추진진도율">
      <Tabs
        items={[
          { key: 'unit', label: '부대별 추진진도율', children: <UnitProgressTab /> },
          { key: 'dept', label: '부서별 과제별 추진진도율', children: <DeptProgressTab /> },
        ]}
      />
    </PageContainer>
  )
}
