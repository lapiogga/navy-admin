import { useState, useRef } from 'react'
import { Button, Modal, message } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import { apiClient } from '@/shared/api/client'
import type { PageRequest } from '@/shared/api/types'
import { PrintableReport } from '@/pages/sys09-memorial/PrintableReport'

interface UsageRecord extends Record<string, unknown> {
  id: string
  operationDate: string
  routeId: string
  routeName: string
  unit: string
  totalSeats: number
  usedSeats: number
  usageRate: string
}

export function BusUsagePage() {
  const actionRef = useRef<ActionType>(null)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [allData, setAllData] = useState<UsageRecord[]>([])

  const fetchUsage = async (params: PageRequest) => {
    const qs = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      ...Object.fromEntries(
        Object.entries(searchParams)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ),
    })
    const res = await apiClient.get<{ content: UsageRecord[]; totalElements: number }>(
      `/api/sys10/usage?${qs.toString()}`
    )
    setAllData(res.data.content)
    return {
      content: res.data.content,
      totalElements: res.data.totalElements,
      totalPages: Math.ceil(res.data.totalElements / params.size),
    }
  }

  const columns: ProColumns<UsageRecord>[] = [
    { title: '운행일자', dataIndex: 'operationDate', width: 110 },
    { title: '노선', dataIndex: 'routeName', width: 120 },
    { title: '부대(서)', dataIndex: 'unit', width: 100 },
    { title: '전체좌석', dataIndex: 'totalSeats', width: 80 },
    { title: '이용좌석', dataIndex: 'usedSeats', width: 80 },
    {
      title: '이용률',
      dataIndex: 'usageRate',
      width: 80,
      render: (_, record) => record.usageRate,
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>주말버스 사용현황</h2>

      <SearchForm
        fields={[
          { name: 'dateRange', label: '운행일자', type: 'dateRange' },
          {
            name: 'routeId',
            label: '노선',
            type: 'select',
            options: [
              { label: '서울→포항', value: 'r1' },
              { label: '서울→청주', value: 'r2' },
              { label: '서울→대전', value: 'r3' },
              { label: '서울→광주', value: 'r4' },
              { label: '서울→부산', value: 'r5' },
            ],
          },
          { name: 'unit', label: '부대(서)', type: 'text', placeholder: '부대(서) 입력' },
        ]}
        onSearch={(values) => {
          setSearchParams(values)
          actionRef.current?.reload()
        }}
        onReset={() => {
          setSearchParams({})
          actionRef.current?.reload()
        }}
      />

      <DataTable<UsageRecord>
        columns={columns}
        request={fetchUsage}
        rowKey="id"
        headerTitle="사용현황 목록"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => setPrintModalOpen(true)}
          >
            인쇄
          </Button>,
        ]}
      />

      {/* 사용현황 인쇄 미리보기 Modal */}
      <Modal
        title="사용현황 인쇄"
        open={printModalOpen}
        onCancel={() => setPrintModalOpen(false)}
        footer={null}
        width={800}
        afterClose={() => {}}
      >
        <PrintableReport title="주말버스 사용현황">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['운행일자', '노선', '부대(서)', '전체좌석', '이용좌석', '이용률'].map((h) => (
                  <th
                    key={h}
                    style={{ border: '1px solid #ccc', padding: '4px 8px', background: '#f5f5f5' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allData.map((row) => (
                <tr key={row.id}>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.operationDate}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.routeName}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.unit}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.totalSeats}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.usedSeats}</td>
                  <td style={{ border: '1px solid #ccc', padding: '4px 8px' }}>{row.usageRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintableReport>
      </Modal>
    </div>
  )
}
