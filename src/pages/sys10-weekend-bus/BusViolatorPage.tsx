import { useRef, useState } from 'react'
import { Button, Modal, message, Form, Input, Select, DatePicker } from 'antd'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { PrintableReport } from '@/pages/sys09-memorial/PrintableReport'
import { apiClient } from '@/shared/api/client'
import type { PageRequest } from '@/shared/api/types'

interface ViolatorItem {
  id: string
  userName: string
  militaryId: string
  rank: string
  unit: string
  violationType: 'cancel_no_show' | 'refuse_board' | 'other'
  violationReason: string
  sanctionStart: string
  sanctionEnd: string
  registeredAt: string
}

const VIOLATION_TYPE_MAP: Record<string, string> = {
  cancel_no_show: '무단취소',
  refuse_board: '탑승거부',
  other: '기타',
}

const RANK_OPTIONS = [
  '대장', '중장', '소장', '준장', '대령', '중령', '소령', '대위',
  '중위', '소위', '준위', '원사', '상사', '중사', '하사',
  '병장', '상병', '일병', '이병',
].map((r) => ({ label: r, value: r }))

const VIOLATION_TYPE_OPTIONS = [
  { label: '무단취소', value: 'cancel_no_show' },
  { label: '탑승거부', value: 'refuse_board' },
  { label: '기타', value: 'other' },
]

function getSanctionStatus(start: string, end: string): { key: string } {
  const today = dayjs()
  const s = dayjs(start)
  const e = dayjs(end)
  if (today.isAfter(e)) return { key: 'sanction_expired' }
  if (today.isSameOrAfter(s) && today.isSameOrBefore(e)) return { key: 'sanctioned' }
  return { key: 'pending_sanction' }
}

const SANCTION_STATUS_COLOR: Record<string, string> = {
  sanctioned: 'red',
  sanction_expired: 'default',
  pending_sanction: 'gold',
}
const SANCTION_STATUS_LABEL: Record<string, string> = {
  sanctioned: '제재중',
  sanction_expired: '제재만료',
  pending_sanction: '제재예정',
}

export function BusViolatorPage() {
  const actionRef = useRef<ActionType>()
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<ViolatorItem | null>(null)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [violators, setViolators] = useState<ViolatorItem[]>([])
  const [loading, setLoading] = useState(false)

  const columns: ProColumns<ViolatorItem>[] = [
    { title: '성명', dataIndex: 'userName', width: 100 },
    { title: '군번', dataIndex: 'militaryId', width: 120 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '부대(서)', dataIndex: 'unit', width: 120 },
    {
      title: '위규 유형',
      dataIndex: 'violationType',
      width: 100,
      render: (val) => VIOLATION_TYPE_MAP[val as string] ?? String(val),
    },
    { title: '제재 시작', dataIndex: 'sanctionStart', width: 110 },
    { title: '제재 종료', dataIndex: 'sanctionEnd', width: 110 },
    {
      title: '제재 상태',
      key: 'sanctionStatus',
      width: 100,
      render: (_, record) => {
        const { key } = getSanctionStatus(record.sanctionStart, record.sanctionEnd)
        return (
          <StatusBadge
            status={key}
            colorMap={SANCTION_STATUS_COLOR}
            labelMap={SANCTION_STATUS_LABEL}
          />
        )
      },
    },
    { title: '등록일', dataIndex: 'registeredAt', width: 110 },
    {
      title: '작업',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <>
          <Button
            size="small"
            style={{ marginRight: 4 }}
            onClick={() => {
              setEditRecord(record)
              form.setFieldsValue({
                ...record,
                sanctionPeriod: [dayjs(record.sanctionStart), dayjs(record.sanctionEnd)],
              })
              setModalOpen(true)
            }}
          >
            수정
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          >
            삭제
          </Button>
        </>
      ),
    },
  ]

  async function fetchList(params: PageRequest) {
    const res = await apiClient.get('/api/sys10/violators', {
      params: { page: params.page, size: params.size },
    })
    const data = res.data as { content: ViolatorItem[]; totalElements: number }
    setViolators(data.content ?? [])
    return res.data
  }

  function handleOpenCreate() {
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields()
      const [sanctionStart, sanctionEnd] = (values.sanctionPeriod as [Dayjs, Dayjs]).map((d) =>
        d.format('YYYY-MM-DD')
      )
      const payload = { ...values, sanctionStart, sanctionEnd }
      delete payload.sanctionPeriod

      setLoading(true)
      if (editRecord) {
        await apiClient.put(`/api/sys10/violators/${editRecord.id}`, payload)
        message.success('위규자 정보가 수정되었습니다.')
      } else {
        await apiClient.post('/api/sys10/violators', payload)
        message.success('위규자가 등록되었습니다.')
      }
      setModalOpen(false)
      actionRef.current?.reload()
    } catch {
      // 유효성 검증 실패 또는 API 오류 — form.validateFields가 throw
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiClient.delete(`/api/sys10/violators/${id}`)
      message.success('삭제되었습니다.')
      actionRef.current?.reload()
    } catch {
      message.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <DataTable<ViolatorItem>
        headerTitle="위규자 관리"
        columns={columns}
        request={fetchList}
        rowKey="id"
        actionRef={actionRef}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={handleOpenCreate}>
            신규 등록
          </Button>,
          <Button
            key="print"
            onClick={() => setPrintModalOpen(true)}
          >
            인쇄
          </Button>,
        ]}
      />

      {/* 등록/수정 Modal */}
      <Modal
        title={editRecord ? '위규자 수정' : '위규자 신규 등록'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText={editRecord ? '수정' : '등록'}
        cancelText="취소"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="militaryId"
            label="군번"
            rules={[
              { required: true, message: '군번을 입력하세요' },
              { max: 10, message: '군번은 10자 이내로 입력하세요' },
            ]}
          >
            <Input placeholder="군번 입력" maxLength={10} />
          </Form.Item>
          <Form.Item
            name="userName"
            label="성명"
            rules={[
              { required: true, message: '성명을 입력하세요' },
              { max: 20, message: '성명은 20자 이내로 입력하세요' },
            ]}
          >
            <Input placeholder="성명 입력" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="rank"
            label="계급"
            rules={[{ required: true, message: '계급을 선택하세요' }]}
          >
            <Select placeholder="계급 선택" options={RANK_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="unit"
            label="부대(서)"
            rules={[
              { required: true, message: '부대(서)를 입력하세요' },
              { max: 100, message: '부대(서)는 100자 이내로 입력하세요' },
            ]}
          >
            <Input placeholder="부대(서) 입력" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="violationType"
            label="위규 유형"
            rules={[{ required: true, message: '위규 유형을 선택하세요' }]}
          >
            <Select placeholder="위규 유형 선택" options={VIOLATION_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="violationReason"
            label="위규 사유"
            rules={[
              { required: true, message: '위규 사유를 입력하세요' },
              { max: 500, message: '위규 사유는 500자 이내로 입력하세요' },
            ]}
          >
            <Input.TextArea rows={3} placeholder="위규 사유를 상세히 입력하세요" maxLength={500} />
          </Form.Item>
          <Form.Item
            name="sanctionPeriod"
            label="제재 기간"
            rules={[{ required: true, message: '제재 기간을 선택하세요' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 인쇄 미리보기 Modal (규칙 4) */}
      <Modal
        title="위규자 목록 인쇄 미리보기"
        open={printModalOpen}
        onCancel={() => setPrintModalOpen(false)}
        footer={null}
        width={800}
      >
        <PrintableReport title="주말버스 위규자 목록">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>성명</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>군번</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>계급</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>부대(서)</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>위규 유형</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>제재 기간</th>
              </tr>
            </thead>
            <tbody>
              {violators.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{v.userName}</td>
                  <td style={{ padding: '8px' }}>{v.militaryId}</td>
                  <td style={{ padding: '8px' }}>{v.rank}</td>
                  <td style={{ padding: '8px' }}>{v.unit}</td>
                  <td style={{ padding: '8px' }}>{VIOLATION_TYPE_MAP[v.violationType] ?? v.violationType}</td>
                  <td style={{ padding: '8px' }}>{v.sanctionStart} ~ {v.sanctionEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintableReport>
      </Modal>
    </>
  )
}
