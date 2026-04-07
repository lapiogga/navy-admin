import { Form, Input, Select, InputNumber, Button, message, Upload, Space } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { HaegidanDoc } from '@/shared/api/mocks/handlers/sys07'

interface HaegidanFormPageProps {
  initialValues?: Partial<HaegidanDoc>
  mode?: 'create' | 'edit'
  onSuccess?: () => void
}

const DEPARTMENT_OPTIONS = [
  { label: '작전처', value: '작전처' },
  { label: '정보처', value: '정보처' },
  { label: '인사처', value: '인사처' },
  { label: '군수처', value: '군수처' },
  { label: '기획처', value: '기획처' },
]

const SECURITY_LEVEL_OPTIONS = [
  { label: '비밀', value: 'secret' },
  { label: '대외비', value: 'confidential' },
  { label: '일반', value: 'normal' },
]

const DATA_TYPE_OPTIONS = [
  { label: '전술교범', value: '전술교범' },
  { label: '기술교범', value: '기술교범' },
  { label: '훈련교재', value: '훈련교재' },
  { label: '연구자료', value: '연구자료' },
  { label: '참고자료', value: '참고자료' },
]

const STORAGE_LOCATION_OPTIONS = [
  { label: '본부 비밀취급소', value: '본부 비밀취급소' },
  { label: '1사단 보관소', value: '1사단 보관소' },
  { label: '2사단 보관소', value: '2사단 보관소' },
  { label: '교육훈련단', value: '교육훈련단' },
]

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const year = String(2024 - i)
  return { label: `${year}년`, value: year }
})

export default function HaegidanFormPage({ initialValues, mode = 'create', onSuccess }: HaegidanFormPageProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (values: Partial<HaegidanDoc>) => apiClient.post('/sys07/haegidan', values),
    onSuccess: () => {
      message.success('등록되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-haegidan'] })
      onSuccess?.()
    },
    onError: () => message.error('등록에 실패했습니다'),
  })

  const updateMutation = useMutation({
    mutationFn: (values: Partial<HaegidanDoc>) =>
      apiClient.put(`/sys07/haegidan/${initialValues?.id}`, values),
    onSuccess: () => {
      message.success('수정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-haegidan'] })
      onSuccess?.()
    },
    onError: () => message.error('수정에 실패했습니다'),
  })

  const handleFinish = (values: Record<string, unknown>) => {
    if (mode === 'edit' && initialValues?.id) {
      updateMutation.mutate(values as Partial<HaegidanDoc>)
    } else {
      createMutation.mutate(values as Partial<HaegidanDoc>)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues ?? {}}
      onFinish={handleFinish}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Form.Item name="department" label="담당부서" rules={[{ required: true, message: '담당부서를 선택하세요' }]}>
          <Select options={DEPARTMENT_OPTIONS} placeholder="담당부서 선택" />
        </Form.Item>

        <Form.Item name="managerPosition" label="관리직위">
          <Input placeholder="관리직위 입력" />
        </Form.Item>

        <Form.Item name="fileFolder" label="파일철">
          <Input placeholder="파일철 입력" />
        </Form.Item>

        <Form.Item name="dataType" label="자료유형" rules={[{ required: true, message: '자료유형을 선택하세요' }]}>
          <Select options={DATA_TYPE_OPTIONS} placeholder="자료유형 선택" />
        </Form.Item>

        <Form.Item name="publisher" label="발행처">
          <Input placeholder="발행처 입력" />
        </Form.Item>

        <Form.Item name="securityLevel" label="비밀등급" rules={[{ required: true, message: '비밀등급을 선택하세요' }]}>
          <Select options={SECURITY_LEVEL_OPTIONS} placeholder="비밀등급 선택" />
        </Form.Item>

        <Form.Item name="publishYear" label="발행년도">
          <Select options={YEAR_OPTIONS} placeholder="발행년도 선택" />
        </Form.Item>

        <Form.Item name="storageLocation" label="보관위치(파일철)">
          <Select options={STORAGE_LOCATION_OPTIONS} placeholder="보관위치 선택" />
        </Form.Item>

        <Form.Item name="cabinetLocation" label="보관위치(캐비넷)">
          <Input placeholder="캐비넷 위치 입력" />
        </Form.Item>

        <Form.Item name="manageDept" label="관리부서">
          <Select options={DEPARTMENT_OPTIONS} placeholder="관리부서 선택" />
        </Form.Item>

        <Form.Item name="pages" label="쪽수">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="쪽수 입력" />
        </Form.Item>
      </div>

      <Form.Item name="title" label="자료명" rules={[{ required: true, message: '자료명을 입력하세요' }]}>
        <Input placeholder="자료명 입력" />
      </Form.Item>

      {/* CSV: 관리자(군번, 성명, 계급, 직책) */}
      <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 16, marginBottom: 16 }}>
        <h4 style={{ marginTop: 0, marginBottom: 12 }}>관리자 정보</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="managerServiceNumber" label="관리자 군번">
            <Input placeholder="군번 입력" />
          </Form.Item>
          <Form.Item name="managerName" label="관리자 성명">
            <Input placeholder="성명 입력" />
          </Form.Item>
          <Form.Item name="managerRank" label="관리자 계급">
            <Input placeholder="계급 입력" />
          </Form.Item>
          <Form.Item name="managerTitle" label="관리자 직책">
            <Input placeholder="직책 입력" />
          </Form.Item>
        </div>
      </div>

      <Form.Item name="attachFile" label="첨부파일">
        <Upload beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>파일 선택</Button>
        </Upload>
      </Form.Item>

      <Form.Item name="remarks" label="비고">
        <Input.TextArea rows={3} placeholder="비고 입력" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isPending}>
            {mode === 'edit' ? '수정' : '등록'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
