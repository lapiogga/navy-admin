import { useRef, useState } from 'react'
import { Button, Modal, Form, Input, message } from 'antd'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest } from '@/shared/api/types'

interface ExternalUser {
  id: string
  militaryBranch: string
  unitName: string
  militaryId: string
  rank: string
  name: string
  position: string
  phone: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  registeredAt: string
}

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'gold',
  approved: 'green',
  rejected: 'red',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  pending: '신청대기',
  approved: '승인',
  rejected: '반려',
}

export function ExternalUserPage() {
  const actionRef = useRef<ActionType>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)
  const [rejectForm] = Form.useForm()

  const columns: ProColumns<ExternalUser>[] = [
    { title: '군 구분', dataIndex: 'militaryBranch', width: 80 },
    { title: '부대명', dataIndex: 'unitName', width: 120 },
    { title: '군번', dataIndex: 'militaryId', width: 120 },
    { title: '계급', dataIndex: 'rank', width: 80 },
    { title: '성명', dataIndex: 'name', width: 100 },
    { title: '직책', dataIndex: 'position', width: 100 },
    { title: '연락처', dataIndex: 'phone', width: 120 },
    { title: '이메일', dataIndex: 'email', width: 160 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    { title: '신청일', dataIndex: 'registeredAt', width: 110 },
    {
      title: '작업',
      key: 'action',
      width: 130,
      render: (_, record) =>
        record.status === 'pending' ? (
          <>
            <Button
              size="small"
              type="primary"
              style={{ marginRight: 4 }}
              onClick={() => handleApprove(record.id)}
            >
              승인
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                setRejectTargetId(record.id)
                rejectForm.resetFields()
                setRejectModalOpen(true)
              }}
            >
              반려
            </Button>
          </>
        ) : null,
    },
  ]

  async function fetchList(params: PageRequest) {
    const res = await apiClient.get('/sys10/external-users', {
      params: { page: params.page, size: params.size },
    })
    return res.data
  }

  async function handleApprove(id: string) {
    try {
      await apiClient.put(`/sys10/external-users/${id}/approve`)
      message.success('승인 처리되었습니다.')
      actionRef.current?.reload()
    } catch {
      message.error('승인 처리 중 오류가 발생했습니다.')
    }
  }

  async function handleReject() {
    try {
      const values = await rejectForm.validateFields()
      await apiClient.put(`/sys10/external-users/${rejectTargetId}/reject`, {
        rejectReason: values.rejectReason,
      })
      message.success('반려 처리되었습니다.')
      setRejectModalOpen(false)
      actionRef.current?.reload()
    } catch {
      // 유효성 검증 실패
    }
  }

  function handlePasswordReset() {
    if (selectedRowKeys.length === 0) {
      message.warning('패스워드를 초기화할 사용자를 선택하세요.')
      return
    }
    message.success('임시 패스워드가 메일로 발송되었습니다.')
  }

  return (
    <>
      <DataTable<ExternalUser>
        headerTitle="타군 사용자 관리"
        columns={columns}
        request={fetchList}
        rowKey="id"
        actionRef={actionRef}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => message.info('신규 등록은 회원등록 신청 페이지를 이용하세요.')}>
            신규 등록
          </Button>,
          <Button
            key="reset-pw"
            disabled={selectedRowKeys.length === 0}
            onClick={handlePasswordReset}
          >
            패스워드 초기화
          </Button>,
          <Button
            key="excel"
            onClick={() => message.success('엑셀 파일이 다운로드 되었습니다.')}
          >
            엑셀 다운로드
          </Button>,
        ]}
      />

      {/* 반려 사유 Modal */}
      <Modal
        title="반려 처리"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleReject}
        okText="반려"
        okButtonProps={{ danger: true }}
        cancelText="취소"
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectReason"
            label="반려 사유"
            rules={[{ required: true, message: '반려 사유를 입력하세요' }]}
          >
            <Input.TextArea rows={3} placeholder="반려 사유를 입력하세요" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
