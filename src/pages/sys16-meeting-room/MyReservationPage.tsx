import { useState } from 'react'
import { Modal, Popconfirm, Button, Form, DatePicker, TimePicker, Input, message, Descriptions } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import dayjs from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface Reservation extends Record<string, unknown> {
  id: string
  roomId: string
  roomName: string
  applicant: string
  unit: string
  purpose: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  processedAt?: string
}

const STATUS_COLOR_MAP = { pending: 'orange', approved: 'green', rejected: 'red' }
const STATUS_LABEL_MAP = { pending: '대기', approved: '승인', rejected: '반려' }

export default function MyReservationPage() {
  const [selectedRecord, setSelectedRecord] = useState<Reservation | null>(null)
  const [editRecord, setEditRecord] = useState<Reservation | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editForm] = Form.useForm()
  const queryClient = useQueryClient()

  // 내 예약 목록 request 함수
  const fetchMyReservations = async (params: PageRequest): Promise<PageResponse<Reservation>> => {
    const res = await axios.get<ApiResult<PageResponse<Reservation>>>('/sys16/reservations/my', {
      params: { page: params.page, size: params.size },
    })
    return res.data.data
  }

  // 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const payload = {
        ...values,
        date: values.date ? (values.date as import('dayjs').Dayjs).format('YYYY-MM-DD') : undefined,
        startTime: values.startTime ? (values.startTime as import('dayjs').Dayjs).format('HH:mm') : undefined,
        endTime: values.endTime ? (values.endTime as import('dayjs').Dayjs).format('HH:mm') : undefined,
      }
      const res = await axios.put<ApiResult>(`/sys16/reservations/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      message.success('예약이 수정되었습니다')
      setEditModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys16', 'reservations', 'my'] })
    },
    onError: () => {
      message.error('예약 수정에 실패했습니다')
    },
  })

  // 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete<ApiResult>(`/sys16/reservations/${id}`)
      return res.data
    },
    onSuccess: () => {
      message.success('예약이 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys16', 'reservations', 'my'] })
    },
    onError: () => {
      message.error('예약 삭제에 실패했습니다')
    },
  })

  const handleEdit = (record: Reservation) => {
    setEditRecord(record)
    editForm.setFieldsValue({
      purpose: record.purpose,
      date: dayjs(record.date),
      startTime: dayjs(record.startTime, 'HH:mm'),
      endTime: dayjs(record.endTime, 'HH:mm'),
    })
    setEditModalOpen(true)
  }

  const handleEditFinish = (values: Record<string, unknown>) => {
    if (!editRecord) return
    updateMutation.mutate({ id: editRecord.id, values })
  }

  const columns: ProColumns<Reservation>[] = [
    { title: '번호', dataIndex: 'id', width: 80, render: (_, __, index) => index + 1 },
    { title: '회의실', dataIndex: 'roomName', width: 120 },
    { title: '예약일', dataIndex: 'date', width: 110 },
    {
      title: '시간',
      width: 130,
      render: (_, record) => `${record.startTime} ~ ${record.endTime}`,
    },
    { title: '목적', dataIndex: 'purpose', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 80,
      render: (_, record) => (
        <StatusBadge
          status={record.status}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    { title: '신청일', dataIndex: 'createdAt', width: 110 },
    {
      title: '액션',
      width: 140,
      render: (_, record) => (
        <span>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(record)
                }}
              >
                수정
              </Button>
              <Popconfirm
                title="예약을 삭제하시겠습니까?"
                onConfirm={(e) => {
                  e?.stopPropagation()
                  deleteMutation.mutate(record.id)
                }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={(e) => e.stopPropagation()}
                >
                  삭제
                </Button>
              </Popconfirm>
            </>
          )}
        </span>
      ),
    },
  ]

  return (
    <PageContainer title="내예약확인">
      <DataTable<Reservation>
        columns={columns}
        request={fetchMyReservations}
        rowKey="id"
        headerTitle="내 예약 목록"
        onRow={(record) => ({
          onClick: () => {
            setSelectedRecord(record)
            setDetailModalOpen(true)
          },
          style: { cursor: 'pointer' },
        })}
      />

      {/* 상세 Modal */}
      <Modal
        title="예약 상세"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={<Button onClick={() => setDetailModalOpen(false)}>닫기</Button>}
        width={600}
      >
        {selectedRecord && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="회의실" span={2}>{selectedRecord.roomName}</Descriptions.Item>
            <Descriptions.Item label="예약일">{selectedRecord.date}</Descriptions.Item>
            <Descriptions.Item label="시간">
              {selectedRecord.startTime} ~ {selectedRecord.endTime}
            </Descriptions.Item>
            <Descriptions.Item label="목적" span={2}>{selectedRecord.purpose}</Descriptions.Item>
            <Descriptions.Item label="상태">
              <StatusBadge
                status={selectedRecord.status}
                colorMap={STATUS_COLOR_MAP}
                labelMap={STATUS_LABEL_MAP}
              />
            </Descriptions.Item>
            <Descriptions.Item label="신청일">{selectedRecord.createdAt}</Descriptions.Item>
            {selectedRecord.processedAt && (
              <Descriptions.Item label="처리일">{selectedRecord.processedAt}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 수정 Modal */}
      <Modal
        title="예약 수정"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditFinish}
        >
          <Form.Item name="date" label="예약일" rules={[{ required: true, message: '예약일을 선택하세요' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startTime" label="시작 시간" rules={[{ required: true, message: '시작 시간을 선택하세요' }]}>
            <TimePicker format="HH:mm" minuteStep={30} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="종료 시간" rules={[{ required: true, message: '종료 시간을 선택하세요' }]}>
            <TimePicker format="HH:mm" minuteStep={30} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="purpose" label="회의 목적" rules={[{ required: true, message: '회의 목적을 입력하세요' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending} block>
              수정 완료
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  )
}
