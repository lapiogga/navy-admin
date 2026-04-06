import { useState } from 'react'
import { Modal, Button, message, Tabs, Descriptions } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { DownloadOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { ProgressRate } from '@/shared/api/mocks/handlers/sys03-performance'

async function fetchProgressRates(params: PageRequest): Promise<PageResponse<ProgressRate>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<ProgressRate>>>('/sys03/progress-rates', {
    params: { current: params.page + 1, pageSize: params.size },
  })
  return (res as ApiResult<PageResponse<ProgressRate>>).data ?? (res as unknown as PageResponse<ProgressRate>)
}

function UnitProgressTab() {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProgressRate | null>(null)

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
      <DataTable<ProgressRate>
        rowKey="id"
        columns={columns}
        headerTitle="부대별 추진진도율 목록"
        request={(params) => fetchProgressRates(params)}
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
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProgressRate | null>(null)

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
      <DataTable<ProgressRate>
        rowKey="id"
        columns={columns}
        headerTitle="부서별 과제별 추진진도율 목록"
        request={(params) => fetchProgressRates(params)}
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
