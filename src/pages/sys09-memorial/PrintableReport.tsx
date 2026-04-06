import { useRef } from 'react'
import { Button } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import './print.css'

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
