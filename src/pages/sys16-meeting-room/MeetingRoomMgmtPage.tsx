import { useState } from 'react'
import {
  Row,
  Col,
  Modal,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Descriptions,
  Tabs,
  Table,
  Switch,
  TimePicker,
  Upload,
  Popconfirm,
  Image,
  Space,
} from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import dayjs from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

interface Equipment {
  id: string
  name: string
  quantity: number
}

interface Photo {
  id: string
  url: string
}

interface Schedule {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
}

interface MeetingRoom extends Record<string, unknown> {
  id: string
  name: string
  location: string
  capacity: number
  description: string
  photos: Photo[]
  equipment: Equipment[]
  schedule: Schedule[]
}

export default function MeetingRoomMgmtPage() {
  const queryClient = useQueryClient()
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [equipModalOpen, setEquipModalOpen] = useState(false)
  const [editForm] = Form.useForm()
  const [scheduleData, setScheduleData] = useState<Schedule[]>([])

  // 회의실 목록 request 함수
  const fetchRooms = async (params: PageRequest): Promise<PageResponse<MeetingRoom>> => {
    const res = await axios.get<ApiResult<PageResponse<MeetingRoom>>>('/api/sys16/meeting-rooms', {
      params: { page: params.page, size: params.size },
    })
    return res.data.data
  }

  // 선택된 회의실 상세 조회
  const { data: roomDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['sys16', 'meeting-rooms', selectedRoom?.id],
    queryFn: async () => {
      if (!selectedRoom) return null
      const res = await axios.get<ApiResult<MeetingRoom>>(`/api/sys16/meeting-rooms/${selectedRoom.id}`)
      return res.data.data
    },
    enabled: !!selectedRoom,
  })

  // 회의실 등록 뮤테이션
  const createMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const res = await axios.post<ApiResult<MeetingRoom>>('/api/sys16/meeting-rooms', values)
      return res.data.data
    },
    onSuccess: () => {
      message.success('회의실이 등록되었습니다')
      setCreateModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['sys16', 'meeting-rooms'] })
    },
    onError: () => {
      message.error('회의실 등록에 실패했습니다')
    },
  })

  // 회의실 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const res = await axios.put<ApiResult<MeetingRoom>>(`/api/sys16/meeting-rooms/${id}`, values)
      return res.data.data
    },
    onSuccess: (data) => {
      message.success('회의실이 수정되었습니다')
      setEditModalOpen(false)
      setSelectedRoom(data)
      refetchDetail()
      queryClient.invalidateQueries({ queryKey: ['sys16', 'meeting-rooms'] })
    },
    onError: () => {
      message.error('회의실 수정에 실패했습니다')
    },
  })

  // 회의실 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/sys16/meeting-rooms/${id}`)
    },
    onSuccess: () => {
      message.success('회의실이 삭제되었습니다')
      setSelectedRoom(null)
      queryClient.invalidateQueries({ queryKey: ['sys16', 'meeting-rooms'] })
    },
    onError: () => {
      message.error('회의실 삭제에 실패했습니다')
    },
  })

  // 시간대 저장 뮤테이션
  const scheduleMutation = useMutation({
    mutationFn: async ({ id, schedule }: { id: string; schedule: Schedule[] }) => {
      const res = await axios.put<ApiResult<MeetingRoom>>(
        `/api/sys16/meeting-rooms/${id}/schedule`,
        schedule,
      )
      return res.data.data
    },
    onSuccess: () => {
      message.success('시간대 설정이 저장되었습니다')
      refetchDetail()
    },
    onError: () => {
      message.error('시간대 저장에 실패했습니다')
    },
  })

  // 장비 추가 뮤테이션
  const addEquipMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const res = await axios.post<ApiResult<Equipment>>(
        `/api/sys16/meeting-rooms/${id}/equipment`,
        values,
      )
      return res.data.data
    },
    onSuccess: () => {
      message.success('장비가 추가되었습니다')
      setEquipModalOpen(false)
      refetchDetail()
    },
    onError: () => {
      message.error('장비 추가에 실패했습니다')
    },
  })

  // 장비 삭제 뮤테이션
  const deleteEquipMutation = useMutation({
    mutationFn: async ({ roomId, eqId }: { roomId: string; eqId: string }) => {
      await axios.delete(`/api/sys16/meeting-rooms/${roomId}/equipment/${eqId}`)
    },
    onSuccess: () => {
      message.success('장비가 삭제되었습니다')
      refetchDetail()
    },
    onError: () => {
      message.error('장비 삭제에 실패했습니다')
    },
  })

  // 사진 삭제 뮤테이션
  const deletePhotoMutation = useMutation({
    mutationFn: async ({ roomId, photoId }: { roomId: string; photoId: string }) => {
      await axios.delete(`/api/sys16/meeting-rooms/${roomId}/photos/${photoId}`)
    },
    onSuccess: () => {
      message.success('사진이 삭제되었습니다')
      refetchDetail()
    },
    onError: () => {
      message.error('사진 삭제에 실패했습니다')
    },
  })

  const handleSelectRoom = (record: MeetingRoom) => {
    setSelectedRoom(record)
    if (record.schedule) {
      setScheduleData(record.schedule)
    }
  }

  const handleScheduleChange = (dayIndex: number, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    setScheduleData((prev) =>
      prev.map((item, i) => (i === dayIndex ? { ...item, [field]: value } : item)),
    )
  }

  // 사진 업로드 props
  const getUploadProps = (roomId: string): UploadProps => ({
    name: 'file',
    action: `/api/sys16/meeting-rooms/${roomId}/photos`,
    listType: 'picture-card',
    maxCount: 5,
    accept: 'image/*',
    defaultFileList: (roomDetail?.photos ?? []).map((p) => ({
      uid: p.id,
      name: p.id,
      status: 'done',
      url: p.url,
    } as UploadFile)),
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success('사진이 등록되었습니다')
        refetchDetail()
      } else if (info.file.status === 'error') {
        message.error('사진 업로드에 실패했습니다')
      }
    },
    onRemove: (file) => {
      if (roomDetail && file.uid) {
        deletePhotoMutation.mutate({ roomId: roomDetail.id, photoId: file.uid })
      }
    },
  })

  const roomColumns: ProColumns<MeetingRoom>[] = [
    { title: '회의실명', dataIndex: 'name', width: 130 },
    { title: '위치', dataIndex: 'location', width: 120 },
    { title: '수용인원', dataIndex: 'capacity', width: 90, render: (val) => `${val}명` },
    {
      title: '액션',
      width: 100,
      render: (_, record) => (
        <span>
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              editForm.setFieldsValue({
                name: record.name,
                location: record.location,
                capacity: record.capacity,
                description: record.description,
              })
              setSelectedRoom(record)
              setEditModalOpen(true)
            }}
          >
            수정
          </Button>
          <Popconfirm
            title="회의실을 삭제하시겠습니까?"
            onConfirm={(e) => {
              e?.stopPropagation()
              deleteMutation.mutate(record.id)
            }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button
              type="link"
              danger
              size="small"
              onClick={(e) => e.stopPropagation()}
            >
              삭제
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  const equipColumns: ProColumns<Equipment>[] = [
    { title: '장비명', dataIndex: 'name' },
    { title: '수량', dataIndex: 'quantity', width: 80 },
    {
      title: '삭제',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="장비를 삭제하시겠습니까?"
          onConfirm={() =>
            roomDetail && deleteEquipMutation.mutate({ roomId: roomDetail.id, eqId: record.id })
          }
        >
          <Button type="link" danger size="small">삭제</Button>
        </Popconfirm>
      ),
    },
  ]

  const currentRoom = roomDetail ?? selectedRoom

  return (
    <PageContainer title="회의실 관리">
      <Row gutter={16}>
        {/* 좌측: 회의실 목록 */}
        <Col span={8}>
          <DataTable<MeetingRoom>
            columns={roomColumns}
            request={fetchRooms}
            rowKey="id"
            headerTitle="회의실 목록"
            toolBarRender={() => [
              <Button
                key="add"
                type="primary"
                onClick={() => setCreateModalOpen(true)}
              >
                회의실 등록
              </Button>,
            ]}
            onRow={(record) => ({
              onClick: () => handleSelectRoom(record),
              style: {
                cursor: 'pointer',
                background: selectedRoom?.id === record.id ? '#e6f4ff' : undefined,
              },
            })}
          />
        </Col>

        {/* 우측: 선택된 회의실 상세 */}
        <Col span={16}>
          {currentRoom ? (
            <Tabs
              defaultActiveKey="info"
              items={[
                {
                  key: 'info',
                  label: '기본정보',
                  children: (
                    <div>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="회의실명">{currentRoom.name}</Descriptions.Item>
                        <Descriptions.Item label="위치">{currentRoom.location}</Descriptions.Item>
                        <Descriptions.Item label="수용인원">{currentRoom.capacity}명</Descriptions.Item>
                        <Descriptions.Item label="설명" span={2}>{currentRoom.description}</Descriptions.Item>
                      </Descriptions>
                      <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        onClick={() => {
                          editForm.setFieldsValue({
                            name: currentRoom.name,
                            location: currentRoom.location,
                            capacity: currentRoom.capacity,
                            description: currentRoom.description,
                          })
                          setEditModalOpen(true)
                        }}
                      >
                        수정
                      </Button>
                    </div>
                  ),
                },
                {
                  key: 'schedule',
                  label: '시간대 설정',
                  children: (
                    <div>
                      <Table
                        dataSource={scheduleData.length > 0 ? scheduleData : (currentRoom.schedule ?? [])}
                        rowKey="day"
                        pagination={false}
                        size="small"
                        columns={[
                          { title: '요일', dataIndex: 'day', width: 60 },
                          {
                            title: '운영 여부',
                            dataIndex: 'enabled',
                            width: 100,
                            render: (val: boolean, _, index) => (
                              <Switch
                                checked={scheduleData[index]?.enabled ?? val}
                                onChange={(checked) => handleScheduleChange(index, 'enabled', checked)}
                              />
                            ),
                          },
                          {
                            title: '운영 시간',
                            render: (_, record, index) => {
                              const item = scheduleData[index] ?? record
                              const startVal = item.startTime ? dayjs(item.startTime, 'HH:mm') : null
                              const endVal = item.endTime ? dayjs(item.endTime, 'HH:mm') : null
                              return (
                                <TimePicker.RangePicker
                                  format="HH:mm"
                                  minuteStep={30}
                                  value={startVal && endVal ? [startVal, endVal] : null}
                                  disabled={!(scheduleData[index]?.enabled ?? record.enabled)}
                                  onChange={(times) => {
                                    if (times && times[0] && times[1]) {
                                      handleScheduleChange(index, 'startTime', times[0].format('HH:mm'))
                                      handleScheduleChange(index, 'endTime', times[1].format('HH:mm'))
                                    }
                                  }}
                                />
                              )
                            },
                          },
                        ]}
                      />
                      <Button
                        type="primary"
                        style={{ marginTop: 16 }}
                        loading={scheduleMutation.isPending}
                        onClick={() => {
                          if (currentRoom) {
                            scheduleMutation.mutate({
                              id: currentRoom.id,
                              schedule: scheduleData.length > 0 ? scheduleData : (currentRoom.schedule ?? []),
                            })
                          }
                        }}
                      >
                        저장
                      </Button>
                    </div>
                  ),
                },
                {
                  key: 'equipment',
                  label: '장비 관리',
                  children: (
                    <div>
                      <Button
                        type="primary"
                        style={{ marginBottom: 16 }}
                        onClick={() => setEquipModalOpen(true)}
                      >
                        장비 추가
                      </Button>
                      <Table
                        dataSource={currentRoom.equipment ?? []}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={equipColumns as Parameters<typeof Table>[0]['columns']}
                      />
                    </div>
                  ),
                },
                {
                  key: 'photos',
                  label: '사진 관리',
                  children: (
                    <div>
                      <Upload {...getUploadProps(currentRoom.id)}>
                        <Button>사진 업로드</Button>
                      </Upload>
                      <div style={{ marginTop: 16 }}>
                        <Space wrap>
                          {(currentRoom.photos ?? []).map((photo) => (
                            <div key={photo.id} style={{ position: 'relative' }}>
                              <Image
                                src={photo.url}
                                width={120}
                                height={90}
                                style={{ objectFit: 'cover' }}
                              />
                            </div>
                          ))}
                        </Space>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
              좌측에서 회의실을 선택하세요
            </div>
          )}
        </Col>
      </Row>

      {/* 회의실 등록 Modal */}
      <Modal
        title="회의실 등록"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        width={500}
      >
        <CrudForm<Record<string, unknown>>
          fields={[
            { name: 'name', label: '회의실명', type: 'text', required: true },
            { name: 'location', label: '위치', type: 'text', required: true },
            { name: 'capacity', label: '수용인원', type: 'number', required: true },
            { name: 'description', label: '설명', type: 'textarea' },
          ]}
          onFinish={async (values) => {
            createMutation.mutate(values)
            return true
          }}
          mode="create"
        />
      </Modal>

      {/* 회의실 수정 Modal */}
      <Modal
        title="회의실 수정"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values) => {
            if (!selectedRoom) return
            updateMutation.mutate({ id: selectedRoom.id, values })
          }}
        >
          <Form.Item name="name" label="회의실명" rules={[{ required: true, message: '회의실명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="위치" rules={[{ required: true, message: '위치를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="capacity" label="수용인원" rules={[{ required: true, message: '수용인원을 입력하세요' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending} block>
              수정 완료
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 장비 추가 Modal */}
      <Modal
        title="장비 추가"
        open={equipModalOpen}
        onCancel={() => setEquipModalOpen(false)}
        footer={null}
        width={400}
      >
        <CrudForm<Record<string, unknown>>
          fields={[
            { name: 'name', label: '장비명', type: 'text', required: true },
            { name: 'quantity', label: '수량', type: 'number', required: true },
          ]}
          onFinish={async (values) => {
            if (!currentRoom) return false
            addEquipMutation.mutate({ id: currentRoom.id, values })
            return true
          }}
          mode="create"
        />
      </Modal>
    </PageContainer>
  )
}
