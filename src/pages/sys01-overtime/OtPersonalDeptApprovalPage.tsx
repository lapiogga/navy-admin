import { useRef, useState } from 'react'
import { Button, Modal, Form, Input, Descriptions, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { showConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface PersonalDeptApproval extends Record<string, unknown> {
  id: string
  applicantName: string
  applicantRank: string
  serviceNumber: string
  fromDept: string
  toDept: string
  reason: string
  status: string
  createdAt: string
}

/** 검색 필드 정의 */
const personalDeptSearchFields: SearchField[] = [
  { name: 'applicantName', label: '신청자', type: 'text', placeholder: '성명 검색' },
  { name: 'status', label: '상태', type: 'select', options: [
    { label: '승인대기', value: 'pending' },
    { label: '승인', value: 'approved' },
    { label: '반려', value: 'rejected' },
  ]},
]

const STATUS_COLOR_MAP: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP: Record<string, string> = { pending: '승인대기', approved: '승인', rejected: '반려' }

async function fetchApprovals(params: PageRequest): Promise<PageResponse<PersonalDeptApproval>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<PersonalDeptApproval>>>('/sys01/personal-dept', {
    params: { page: params.page, size: params.size },
  })
  return (res as ApiResult<PageResponse<PersonalDeptApproval>>).data ?? (res as unknown as PageResponse<PersonalDeptApproval>)
}

export default function OtPersonalDeptApprovalPage() {
  const actionRef = useRef<ActionType>()
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<PersonalDeptApproval | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectForm] = Form.useForm()

  const handleApprove = (record: PersonalDeptApproval) => {
    showConfirmDialog({
      title: '승인 확인',
      content: `${record.applicantName}의 부서 이동 신청을 승인하시겠습니까?`,
      onConfirm: () => {
        message.success('승인되었습니다.')
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

  const columns: ProColumns<PersonalDeptApproval>[] = [
    militaryPersonColumn<PersonalDeptApproval>('신청자', { serviceNumber: 'serviceNumber', rank: 'applicantRank', name: 'applicantName' }),
    { title: '이동 전 부서', dataIndex: 'fromDept', width: 130 },
    { title: '이동 후 부서', dataIndex: 'toDept', width: 130 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, r) => <StatusBadge status={r.status} colorMap={STATUS_COLOR_MAP} labelMap={STATUS_LABEL_MAP} />,
    },
    { title: '신청일', dataIndex: 'createdAt', width: 110 },
    {
      title: '작업',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <Button
          key="approve"
          type="primary"
          size="small"
          disabled={record.status !== 'pending'}
          onClick={() => handleApprove(record)}
        >
          승인
        </Button>,
        <Button
          key="reject"
          danger
          size="small"
          disabled={record.status !== 'pending'}
          onClick={() => { setSelectedRecord(record); setRejectModalOpen(true) }}
          style={{ marginLeft: 4 }}
        >
          반려
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer title="개인별 부서 이동 승인">
      <SearchForm fields={personalDeptSearchFields} onSearch={(values) => { console.log('검색:', values); actionRef.current?.reload() }} />
      <DataTable<PersonalDeptApproval>
        columns={columns}
        request={fetchApprovals}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="부서 이동 신청 목록"
        onRow={(record) => ({
          onClick: () => { setSelectedRecord(record); setDetailOpen(true) },
          style: { cursor: 'pointer' },
        })}
      />

      {/* 상세 Modal */}
      <Modal
        open={detailOpen}
        title="부서 이동 신청 상세"
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="reject" danger disabled={selectedRecord?.status !== 'pending'} onClick={() => setRejectModalOpen(true)}>
            반려
          </Button>,
          <Button key="approve" type="primary" disabled={selectedRecord?.status !== 'pending'} onClick={() => selectedRecord && handleApprove(selectedRecord)}>
            승인
          </Button>,
          <Button key="close" onClick={() => setDetailOpen(false)}>닫기</Button>,
        ]}
        destroyOnClose
      >
        {selectedRecord && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="신청자">{selectedRecord.applicantName}</Descriptions.Item>
            <Descriptions.Item label="신청일">{selectedRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="이동 전 부서">{selectedRecord.fromDept}</Descriptions.Item>
            <Descriptions.Item label="이동 후 부서">{selectedRecord.toDept}</Descriptions.Item>
            <Descriptions.Item label="사유" span={2}>{selectedRecord.reason}</Descriptions.Item>
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
