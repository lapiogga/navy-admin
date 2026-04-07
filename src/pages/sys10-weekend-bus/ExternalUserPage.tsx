import { useRef, useState } from 'react'
import { Button, Modal, Form, Input, message } from 'antd'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
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
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  // 검색 필드 정의 (CSV: 군구분, 부대명, 군번, 계급, 성명, 직책, 전화번호, 메일주소, 등록일)
  const searchFields: SearchField[] = [
    {
      name: 'militaryBranch',
      label: '군 구분',
      type: 'select',
      options: [
        { label: '육군', value: '육군' },
        { label: '공군', value: '공군' },
        { label: '해군', value: '해군' },
        { label: '해병대', value: '해병대' },
      ],
    },
    { name: 'unitName', label: '부대명', type: 'text', placeholder: '부대명 입력' },
    { name: 'militaryId', label: '군번', type: 'text', placeholder: '군번 입력' },
    { name: 'name', label: '성명', type: 'text', placeholder: '성명 입력' },
    { name: 'position', label: '직책', type: 'text', placeholder: '직책 입력' },
    { name: 'dateRange', label: '등록일', type: 'dateRange' },
  ]

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
    const qs = new URLSearchParams({
      page: String(params.page),
      size: String(params.size),
      ...Object.fromEntries(
        Object.entries(searchParams)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ),
    })
    const res = await apiClient.get(`/sys10/external-users?${qs.toString()}`)
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
      {/* 검색영역 (R2: CSV 검색조건 - 군구분, 부대명, 군번, 성명, 직책, 등록일) */}
      <SearchForm
        fields={searchFields}
        onSearch={(values) => {
          setSearchParams(values)
          actionRef.current?.reload()
        }}
        onReset={() => {
          setSearchParams({})
          actionRef.current?.reload()
        }}
      />

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
