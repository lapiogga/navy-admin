import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Input, Descriptions, Tag } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { TaskResult } from '@/shared/api/mocks/handlers/sys03-performance'

async function fetchPendingResults(params: PageRequest): Promise<PageResponse<TaskResult>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<TaskResult>>>('/sys03/task-results', {
    params: { current: params.page + 1, pageSize: params.size, status: 'pending' },
  })
  return (res as ApiResult<PageResponse<TaskResult>>).data ?? (res as unknown as PageResponse<TaskResult>)
}

export default function PerfTaskResultApprovalPage() {
  const queryClient = useQueryClient()
  const [detailOpen, setDetailOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TaskResult | null>(null)
  const [rejectForm] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const approveMutation = useMutation({
    mutationFn: async (id: string) => apiClient.post(`/sys03/task-results/${id}/approve`),
    onSuccess: () => {
      message.success('승인되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'task-results'] })
      actionRef.current?.reload()
      setDetailOpen(false)
    },
    onError: () => message.error('승인에 실패했습니다.'),
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post(`/sys03/task-results/${id}/reject`, { reason }),
    onSuccess: () => {
      message.success('반려되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'task-results'] })
      actionRef.current?.reload()
      setRejectOpen(false)
      setDetailOpen(false)
      rejectForm.resetFields()
    },
    onError: () => message.error('반려 처리에 실패했습니다.'),
  })

  const columns: ProColumns<TaskResult>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '상세과제명', dataIndex: 'detailTaskTitle' },
    { title: '부대(서)', dataIndex: 'deptName', width: 120 },
    {
      title: '진도율(%)',
      dataIndex: 'progressRate',
      width: 100,
      render: (val) => `${String(val)}%`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 80,
      render: () => <Tag color="processing">상신</Tag>,
    },
    { title: '상신일', dataIndex: 'submittedAt', width: 110 },
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
    <PageContainer title="과제실적 승인">
      <DataTable<TaskResult>
        rowKey="id"
        columns={columns}
        headerTitle="결재대기 업무실적 목록"
        actionRef={actionRef}
        request={(params) => fetchPendingResults(params)}
      />

      {/* 상세 Modal */}
      <Modal
        title="업무실적 상세"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={
          selectedItem?.status === 'pending' ? (
            <>
              <Button
                type="primary"
                onClick={() => selectedItem && approveMutation.mutate(selectedItem.id)}
                loading={approveMutation.isPending}
              >
                승인
              </Button>
              <Button
                danger
                onClick={() => setRejectOpen(true)}
              >
                반려
              </Button>
              <Button onClick={() => setDetailOpen(false)}>닫기</Button>
            </>
          ) : (
            <Button onClick={() => setDetailOpen(false)}>닫기</Button>
          )
        }
        width={600}
      >
        {selectedItem && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="상세과제명" span={2}>{selectedItem.detailTaskTitle}</Descriptions.Item>
            <Descriptions.Item label="부대(서)">{selectedItem.deptName}</Descriptions.Item>
            <Descriptions.Item label="진도율">{selectedItem.progressRate}%</Descriptions.Item>
            <Descriptions.Item label="진행 내용" span={2}>{selectedItem.content}</Descriptions.Item>
            <Descriptions.Item label="상신일">{selectedItem.submittedAt ?? '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 반려 사유 입력 Modal */}
      <Modal
        title="반려 사유 입력"
        open={rejectOpen}
        onOk={() => rejectForm.submit()}
        onCancel={() => {
          setRejectOpen(false)
          rejectForm.resetFields()
        }}
        confirmLoading={rejectMutation.isPending}
        okText="반려"
        okButtonProps={{ danger: true }}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={(values) =>
            selectedItem && rejectMutation.mutate({ id: selectedItem.id, reason: values.reason })
          }
        >
          <Form.Item name="reason" label="반려 사유" rules={[{ required: true, message: '반려 사유를 입력하세요' }]}>
            <Input.TextArea rows={3} placeholder="반려 사유를 입력하세요" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
