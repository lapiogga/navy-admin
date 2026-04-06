import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Input, Select } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { IndividualTarget } from '@/shared/api/mocks/handlers/sys03-performance'

const RANKS = ['대장', '중장', '소장', '준장', '대령', '중령', '소령', '대위', '중위', '소위', '원사', '상사', '중사', '하사']
const DEPT_NAMES = ['작전처', '정보처', '인사처', '군수처', '기획처', '교육훈련처', '통신처', '동원처']
const YEARS = ['2022', '2023', '2024', '2025', '2026']

async function fetchIndividualTargets(params: PageRequest): Promise<PageResponse<IndividualTarget>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<IndividualTarget>>>(
    '/sys03/individual-targets',
    { params: { current: params.page + 1, pageSize: params.size } },
  )
  return (res as ApiResult<PageResponse<IndividualTarget>>).data ?? (res as unknown as PageResponse<IndividualTarget>)
}

export default function PerfIndividualTargetPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IndividualTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IndividualTarget | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<IndividualTarget>) => {
      if (editTarget) {
        return apiClient.put(`/sys03/individual-targets/${editTarget.id}`, values)
      }
      return apiClient.post('/sys03/individual-targets', values)
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'individual-targets'] })
      actionRef.current?.reload()
      setModalOpen(false)
      setEditTarget(null)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys03/individual-targets/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'individual-targets'] })
      actionRef.current?.reload()
      setDeleteTarget(null)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<IndividualTarget>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '성명', dataIndex: 'name', width: 120 },
    { title: '계급', dataIndex: 'rank', width: 100 },
    { title: '부대(서)', dataIndex: 'deptName' },
    { title: '기준년도', dataIndex: 'year', width: 100 },
    {
      title: '관리',
      width: 120,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditTarget(record)
              form.setFieldsValue(record)
              setModalOpen(true)
            }}
          >
            수정
          </Button>
          <Button type="link" size="small" danger onClick={() => setDeleteTarget(record)}>
            삭제
          </Button>
        </>
      ),
    },
  ]

  return (
    <PageContainer title="개인 업무실적 대상자 관리">
      <DataTable<IndividualTarget>
        rowKey="id"
        columns={columns}
        headerTitle="개인 업무실적 대상자 목록"
        actionRef={actionRef}
        request={(params) => fetchIndividualTargets(params)}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setEditTarget(null)
              form.resetFields()
              setModalOpen(true)
            }}
          >
            대상자 등록
          </Button>,
        ]}
      />

      <Modal
        title={editTarget ? '대상자 수정' : '대상자 등록'}
        open={modalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false)
          setEditTarget(null)
          form.resetFields()
        }}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
          <Form.Item name="name" label="성명" rules={[{ required: true, message: '성명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rank" label="계급" rules={[{ required: true, message: '계급을 선택하세요' }]}>
            <Select options={RANKS.map((r) => ({ label: r, value: r }))} />
          </Form.Item>
          <Form.Item name="deptName" label="부대(서)" rules={[{ required: true, message: '부대(서)를 선택하세요' }]}>
            <Select options={DEPT_NAMES.map((d) => ({ label: d, value: d }))} />
          </Form.Item>
          <Form.Item name="year" label="기준년도" rules={[{ required: true, message: '기준년도를 선택하세요' }]}>
            <Select options={YEARS.map((y) => ({ label: y, value: y }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        confirmLoading={deleteMutation.isPending}
        okText="삭제"
        okButtonProps={{ danger: true }}
      >
        <p>&quot;{deleteTarget?.name}&quot; 대상자를 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
