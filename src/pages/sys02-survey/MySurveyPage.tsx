import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Dropdown, Modal, Form, Input, DatePicker, Select, message } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer } from '@ant-design/pro-components'
import dayjs from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge'
import { CrudForm } from '@/shared/ui/CrudForm'
import { apiClient } from '@/shared/api/client'
import type { Survey, SurveyStatus } from '@/shared/api/mocks/handlers/sys02'

const { TextArea } = Input

// 상태 표시 설정
const STATUS_COLOR_MAP: Record<SurveyStatus, string> = {
  draft: 'default',
  submitted: 'orange',
  approved: 'blue',
  rejected: 'red',
  active: 'cyan',
  closed: 'gray',
}

const STATUS_LABEL_MAP: Record<SurveyStatus, string> = {
  draft: '작성중',
  submitted: '제출됨',
  approved: '승인',
  rejected: '반려',
  active: '진행중',
  closed: '마감',
}

const TARGET_UNITS = ['1사단', '2사단', '3사단', '해병대사령부', '교육훈련단']
const TARGET_RANKS = ['대령', '중령', '소령', '대위', '중위', '소위', '준위', '원사', '상사', '중사', '하사']

export default function MySurveyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<Survey | null>(null)
  const [targetType, setTargetType] = useState<string>('전체')
  const [form] = Form.useForm()

  // 설문 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ['sys02', 'surveys'],
    queryFn: () => apiClient.get<{ content: Survey[]; totalElements: number }>('/sys02/surveys'),
  })

  // 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: (values: Partial<Survey>) => apiClient.post('/sys02/surveys', values),
    onSuccess: () => {
      message.success('설문이 등록되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'surveys'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => message.error('등록에 실패했습니다'),
  })

  // 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<Survey> }) =>
      apiClient.put(`/sys02/surveys/${id}`, values),
    onSuccess: () => {
      message.success('설문이 수정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'surveys'] })
      setModalOpen(false)
      setEditRecord(null)
      form.resetFields()
    },
    onError: () => message.error('수정에 실패했습니다'),
  })

  // 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/sys02/surveys/${id}`),
    onSuccess: () => {
      message.success('설문이 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'surveys'] })
    },
    onError: () => message.error('삭제에 실패했습니다'),
  })

  // 상태 전환 뮤테이션
  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      apiClient.put(`/sys02/surveys/${id}/${action}`),
    onSuccess: () => {
      message.success('상태가 변경되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys02', 'surveys'] })
    },
    onError: () => message.error('상태 변경에 실패했습니다'),
  })

  const surveys = (data as { content: Survey[]; totalElements: number } | undefined)?.content || []

  const columns: ProColumns<Survey>[] = [
    {
      title: '설문명',
      dataIndex: 'surveyName',
      width: 250,
      render: (_, record) => (
        <a onClick={() => navigate(`/sys02/1/2/edit/${record.id}`)}>{record.surveyName}</a>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge
          status={record.status as string}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    {
      title: '대상자 수',
      dataIndex: 'targetCount',
      width: 100,
      sorter: true,
    },
    {
      title: '응답자 수',
      dataIndex: 'responseCount',
      width: 100,
      sorter: true,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 120,
      sorter: true,
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      width: 120,
      sorter: true,
    },
    {
      title: '종료일',
      dataIndex: 'endDate',
      width: 120,
      sorter: true,
    },
    {
      title: '관리',
      width: 120,
      render: (_, record) => {
        const menuItems = []
        if (record.status === 'draft') {
          menuItems.push({ key: 'submit', label: '승인 요청' })
        }
        if (record.status === 'approved') {
          menuItems.push({ key: 'deploy', label: '배포' })
        }
        if (record.status === 'active') {
          menuItems.push({ key: 'close', label: '마감' })
        }
        menuItems.push({ key: 'edit', label: '문항 편집' })
        menuItems.push({ key: 'delete', label: '삭제', danger: true })

        return (
          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === 'edit') {
                  navigate(`/sys02/1/2/edit/${record.id}`)
                } else if (key === 'delete') {
                  Modal.confirm({
                    title: '삭제 확인',
                    content: '설문을 삭제하시겠습니까?',
                    onOk: () => deleteMutation.mutate(record.id),
                  })
                } else if (['submit', 'deploy', 'close'].includes(key)) {
                  statusMutation.mutate({ id: record.id, action: key })
                }
              },
            }}
          >
            <Button size="small">
              관리 <DownOutlined />
            </Button>
          </Dropdown>
        )
      },
    },
  ]

  const handleSubmit = (values: Record<string, unknown>) => {
    const formValues: Partial<Survey> = {
      ...values,
      startDate: values.startDate ? dayjs(values.startDate as string).format('YYYY-MM-DD') : '',
      endDate: values.endDate ? dayjs(values.endDate as string).format('YYYY-MM-DD') : '',
    }
    if (editRecord) {
      updateMutation.mutate({ id: editRecord.id, values: formValues })
    } else {
      createMutation.mutate(formValues)
    }
  }

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  return (
    <PageContainer title="나의 설문관리">
      <DataTable<Survey>
        columns={columns}
        dataSource={surveys}
        loading={isLoading}
        rowKey="id"
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={openCreate}>
            신규 등록
          </Button>,
        ]}
      />

      <Modal
        title={editRecord ? '설문 수정' : '설문 등록'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditRecord(null)
          form.resetFields()
        }}
        footer={null}
        width={700}
      >
        <CrudForm
          form={form}
          onFinish={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          fields={[
            {
              name: 'surveyName',
              label: '설문명',
              rules: [{ required: true, message: '설문명을 입력하세요' }, { max: 100 }],
              children: <Input maxLength={100} />,
            },
            {
              name: 'description',
              label: '설문내용(개요)',
              rules: [{ required: true, message: '설문 내용을 입력하세요' }, { max: 2000 }],
              children: <TextArea rows={4} maxLength={2000} />,
            },
            {
              name: 'startDate',
              label: '시작일',
              rules: [{ required: true, message: '시작일을 선택하세요' }],
              children: <DatePicker style={{ width: '100%' }} />,
            },
            {
              name: 'endDate',
              label: '종료일',
              rules: [{ required: true, message: '종료일을 선택하세요' }],
              children: <DatePicker style={{ width: '100%' }} />,
            },
            {
              name: 'targetType',
              label: '대상 구분',
              rules: [{ required: true, message: '대상 구분을 선택하세요' }],
              children: (
                <Select
                  options={[
                    { label: '부대', value: '부대' },
                    { label: '직급', value: '직급' },
                    { label: '전체', value: '전체' },
                  ]}
                  onChange={(val) => setTargetType(val)}
                />
              ),
            },
            ...(targetType === '부대'
              ? [
                  {
                    name: 'targetUnits',
                    label: '대상 부대',
                    children: (
                      <Select
                        mode="multiple"
                        options={TARGET_UNITS.map((u) => ({ label: u, value: u }))}
                      />
                    ),
                  },
                ]
              : []),
            ...(targetType === '직급'
              ? [
                  {
                    name: 'targetRanks',
                    label: '대상 직급',
                    children: (
                      <Select
                        mode="multiple"
                        options={TARGET_RANKS.map((r) => ({ label: r, value: r }))}
                      />
                    ),
                  },
                ]
              : []),
            {
              name: 'isPublicResult',
              label: '결과 공개',
              rules: [{ required: true, message: '결과 공개 여부를 선택하세요' }],
              children: (
                <Select
                  options={[
                    { label: '공개', value: true },
                    { label: '비공개', value: false },
                  ]}
                />
              ),
            },
            {
              name: 'isAnonymous',
              label: '익명 여부',
              rules: [{ required: true, message: '익명 여부를 선택하세요' }],
              children: (
                <Select
                  options={[
                    { label: '익명', value: true },
                    { label: '실명', value: false },
                  ]}
                />
              ),
            },
          ]}
        />
      </Modal>
    </PageContainer>
  )
}
