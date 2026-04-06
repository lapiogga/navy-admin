import { useRef } from 'react'
import { Button, Descriptions, Table } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import '@/pages/sys09-memorial/print.css'

interface PrintableReportProps {
  title: string
  children: React.ReactNode
}

export function PrintableReport({ title, children }: PrintableReportProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div className="no-print" style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          인쇄
        </Button>
      </div>
      <div ref={printRef} className="print-area">
        <div className="report-title">{title}</div>
        {children}
      </div>
    </>
  )
}

// 주요활동 상세출력 래퍼
interface ActivityReportData {
  activityName: string
  category: string
  activityDate: string
  location: string
  description: string
  unitName?: string
}

export function ActivityPrintableReport({ data }: { data: ActivityReportData }) {
  return (
    <PrintableReport title="주요활동 상세 출력">
      <Descriptions bordered column={2}>
        <Descriptions.Item label="활동명" span={2}>{data.activityName}</Descriptions.Item>
        <Descriptions.Item label="분류">{data.category}</Descriptions.Item>
        <Descriptions.Item label="일시">{data.activityDate}</Descriptions.Item>
        <Descriptions.Item label="장소" span={2}>{data.location}</Descriptions.Item>
        <Descriptions.Item label="부대명">{data.unitName ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="내용" span={2}>{data.description}</Descriptions.Item>
      </Descriptions>
    </PrintableReport>
  )
}

// 주요직위자 출력 래퍼
interface KeyPersonReportData {
  unitName: string
  persons: Array<{ category: string; name: string; rank: string; termStart: string; termEnd: string }>
}

export function KeyPersonPrintableReport({ data }: { data: KeyPersonReportData }) {
  return (
    <PrintableReport title="주요직위자 현황">
      <p style={{ textAlign: 'center', marginBottom: 16 }}>부대명: {data.unitName}</p>
      <Table
        dataSource={data.persons}
        rowKey={(r) => `${r.name}-${r.termStart}`}
        pagination={false}
        columns={[
          { title: '구분', dataIndex: 'category', width: 120 },
          { title: '성명', dataIndex: 'name', width: 120 },
          { title: '계급', dataIndex: 'rank', width: 100 },
          { title: '임기시작', dataIndex: 'termStart', width: 120 },
          { title: '임기종료', dataIndex: 'termEnd', width: 120 },
        ]}
      />
    </PrintableReport>
  )
}

// 제원/계승부대 출력 래퍼
interface LineageReportData {
  unitName: string
  lineages: Array<{ lineageNo: string; unitName: string; establishDate: string; relatedOrg: string }>
}

export function LineagePrintableReport({ data }: { data: LineageReportData }) {
  return (
    <PrintableReport title="제원/계승부대 현황">
      <p style={{ textAlign: 'center', marginBottom: 16 }}>부대명: {data.unitName}</p>
      <Table
        dataSource={data.lineages}
        rowKey="lineageNo"
        pagination={false}
        columns={[
          { title: '계승번호', dataIndex: 'lineageNo', width: 120 },
          { title: '부대명', dataIndex: 'unitName', width: 160 },
          { title: '창설일자', dataIndex: 'establishDate', width: 120 },
          { title: '관련기관', dataIndex: 'relatedOrg' },
        ]}
      />
    </PrintableReport>
  )
}

// 부대기/마크 출력 래퍼
interface FlagReportData {
  unitName: string
  flags: Array<{ flagType: string; revisionDate: string; imageBase64?: string; remarks: string }>
}

export function FlagPrintableReport({ data }: { data: FlagReportData }) {
  return (
    <PrintableReport title="부대기/부대마크 현황">
      <p style={{ textAlign: 'center', marginBottom: 16 }}>부대명: {data.unitName}</p>
      <Table
        dataSource={data.flags}
        rowKey={(r) => `${r.flagType}-${r.revisionDate}`}
        pagination={false}
        columns={[
          { title: '구분', dataIndex: 'flagType', width: 100 },
          { title: '개정일자', dataIndex: 'revisionDate', width: 120 },
          {
            title: '이미지',
            dataIndex: 'imageBase64',
            width: 80,
            render: (v) => v ? <img src={v as string} width={50} height={50} style={{ objectFit: 'contain' }} /> : '-',
          },
          { title: '비고', dataIndex: 'remarks' },
        ]}
      />
    </PrintableReport>
  )
}
