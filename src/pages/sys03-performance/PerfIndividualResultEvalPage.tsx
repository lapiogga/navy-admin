import { useState, useRef } from 'react'
import { Modal, Button, message, Form, Select, Descriptions, Tag } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { SearchForm } from '@/shared/ui/SearchForm/SearchForm'
import type { SearchField } from '@/shared/ui/SearchForm/SearchForm'
import { militaryPersonColumn, formatMilitaryPerson } from '@/shared/lib/military'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { IndividualResultEval, EvalGrade } from '@/shared/api/mocks/handlers/sys03-performance'

const GRADE_OPTIONS: { label: string; value: EvalGrade }[] = [
  { label: 'S (최우수)', value: 'S' },
  { label: 'A (우수)', value: 'A' },
  { label: 'B (보통)', value: 'B' },
  { label: 'C (미흡)', value: 'C' },
  { label: 'D (불량)', value: 'D' },
]

const GRADE_COLOR: Record<EvalGrade, string> = {
  S: 'gold',
  A: 'green',
  B: 'blue',
  C: 'orange',
  D: 'red',
}

/** 검색 필드 정의 */
const searchFields: SearchField[] = [
  { name: 'keyword', label: '성명/부대(서)', type: 'text', placeholder: '성명 또는 부대(서) 검색' },
]

async function fetchIndividualEvals(params: PageRequest & { keyword?: string }): Promise<PageResponse<IndividualResultEval>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<IndividualResultEval>>>('/sys03/individual-evals', {
    params: { current: params.page + 1, pageSize: params.size, keyword: params.keyword },
  })
  return (res as ApiResult<PageResponse<IndividualResultEval>>).data ?? (res as unknown as PageResponse<IndividualResultEval>)
}

export default function PerfIndividualResultEvalPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})
  const [evalOpen, setEvalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<IndividualResultEval | null>(null)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const evalMutation = useMutation({
    mutationFn: async (values: { grade: EvalGrade }) =>
      apiClient.post('/sys03/individual-evals', { id: selectedItem?.id, grade: values.grade }),
    onSuccess: () => {
      message.success('평가가 완료되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys03', 'individual-evals'] })
      actionRef.current?.reload()
      setEvalOpen(false)
      form.resetFields()
    },
    onError: () => message.error('평가 처리에 실패했습니다.'),
  })

  const columns: ProColumns<IndividualResultEval>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    militaryPersonColumn<IndividualResultEval>('대상자', { serviceNumber: 'serviceNumber', rank: 'rank', name: 'name' }),
    { title: '부대(서)', dataIndex: 'deptName' },
    {
      title: '평가상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.status === 'evaluated' ? 'success' : 'default'}>
          {record.status === 'evaluated' ? '평가완료' : '평가대기'}
        </Tag>
      ),
    },
    {
      title: '등급',
      dataIndex: 'grade',
      width: 80,
      render: (_, record) =>
        record.grade ? (
          <Tag color={GRADE_COLOR[record.grade as EvalGrade]}>{record.grade}</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '평가',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedItem(record)
            if (record.grade) form.setFieldsValue({ grade: record.grade })
            setEvalOpen(true)
          }}
        >
          평가
        </Button>
      ),
    },
  ]

  return (
    <PageContainer title="개인 업무실적 평가">
      <SearchForm fields={searchFields} onSearch={(v) => { setSearchParams(v); actionRef.current?.reload() }} onReset={() => { setSearchParams({}); actionRef.current?.reload() }} />
      <DataTable<IndividualResultEval>
        rowKey="id"
        columns={columns}
        headerTitle="개인 업무실적 평가 목록"
        actionRef={actionRef}
        request={(params) => fetchIndividualEvals({ ...params, ...searchParams } as PageRequest & { keyword?: string })}
      />

      <Modal
        title="개인 업무실적 평가"
        open={evalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setEvalOpen(false)
          form.resetFields()
        }}
        confirmLoading={evalMutation.isPending}
        okText="평가 저장"
        width={500}
      >
        {selectedItem && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="대상자" span={2}>{formatMilitaryPerson({ serviceNumber: selectedItem.serviceNumber, rank: selectedItem.rank, name: selectedItem.name })}</Descriptions.Item>
              <Descriptions.Item label="부대(서)" span={2}>{selectedItem.deptName}</Descriptions.Item>
            </Descriptions>
            <Form form={form} layout="vertical" onFinish={(values) => evalMutation.mutate(values)}>
              <Form.Item name="grade" label="평가 등급" rules={[{ required: true, message: '등급을 선택하세요' }]}>
                <Select options={GRADE_OPTIONS} placeholder="등급을 선택하세요" size="large" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </PageContainer>
  )
}
