import { useRef, useState } from 'react'
import { Button, Modal, Descriptions, Form, Input, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface DutyWorker extends Record<string, unknown> {
  id: string
  name: string
  rank: string
  unitName: string
  dutyDate: string
  dutyPost: string
  status: string
}

const STATUS_COLOR_MAP: Record<string, string> = { 근무중: 'blue', 교대완료: 'green' }
const STATUS_LABEL_MAP: Record<string, string> = { 근무중: '근무중', 교대완료: '교대완료' }

async function fetchDutyWorkers(params: PageRequest): Promise<PageResponse<DutyWorker>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<DutyWorker>>>('/sys01/duty-workers', {
    params: { page: params.page, size: params.size },
  })
  return (res as ApiResult<PageResponse<DutyWorker>>).data ?? (res as unknown as PageResponse<DutyWorker>)
}

export default function OtDutyWorkerPage() {
  const actionRef = useRef<ActionType>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DutyWorker | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectForm] = Form.useForm()

  const handleApprove = (record: DutyWorker) => {
    showConfirmDialog({
      title: '확인',
      content: `${record.name}의 초과근무를 확인하시겠습니까?`,
      onConfirm: () => {
        message.success('확인되었습니다.')
        actionRef.current?.reload()
        setDetailOpen(false)
      },
    })
  }

  const handleReject = async () => {
    try {
      const values = await rejectForm.validateFields()
      message.success(`반려되었습니다. 사유: ${values.reason}`)
      rejectForm.resetFields()
      setRejectModalOpen(false)
      setDetailOpen(false)
      actionRef.current?.reload()
    } catch {
      // 검증 실패
    }
  }

  const columns: ProColumns<DutyWorker>[] = [
    { title: '성명', dataIndex: 'name', width: 90 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '부대(서)', dataIndex: 'unitName', width: 120 },
    { title: '당직일', dataIndex: 'dutyDate', width: 110 },
    { title: '당직개소', dataIndex: 'dutyPost', width: 120 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    {
      title: '작업',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Button key="view" type="link" size="small" onClick={() => { setSelectedRecord(record); setDetailOpen(true) }}>
          상세
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer title="초과근무자 관리">
      <DataTable<DutyWorker>
        columns={columns}
        request={fetchDutyWorkers}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="초과근무자 목록"
      />

      {/* 상세 Modal */}
      <Modal
        open={detailOpen}
        title="초과근무자 상세"
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="reject" danger onClick={() => setRejectModalOpen(true)}>
            반려
          </Button>,
          <Button key="approve" type="primary" onClick={() => selectedRecord && handleApprove(selectedRecord)}>
            확인
          </Button>,
          <Button key="close" onClick={() => setDetailOpen(false)}>
            닫기
          </Button>,
        ]}
        destroyOnClose
      >
        {selectedRecord && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="성명">{selectedRecord.name}</Descriptions.Item>
            <Descriptions.Item label="계급">{selectedRecord.rank}</Descriptions.Item>
            <Descriptions.Item label="부대(서)">{selectedRecord.unitName}</Descriptions.Item>
            <Descriptions.Item label="당직개소">{selectedRecord.dutyPost}</Descriptions.Item>
            <Descriptions.Item label="당직일" span={2}>{selectedRecord.dutyDate}</Descriptions.Item>
            <Descriptions.Item label="상태" span={2}>
              <StatusBadge status={selectedRecord.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 반려 사유 Modal */}
      <Modal
        open={rejectModalOpen}
        title="반려 사유 입력"
        onOk={handleReject}
        onCancel={() => { rejectForm.resetFields(); setRejectModalOpen(false) }}
        destroyOnClose
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item name="reason" label="반려 사유" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
