import { useState } from 'react'
import { Form, Input, Select, DatePicker, InputNumber, Checkbox, Button, message, Upload, Space } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { MilDocument } from '@/shared/api/mocks/handlers/sys07'
import dayjs from 'dayjs'

interface MilDataFormPageProps {
  initialValues?: Partial<MilDocument>
  mode?: 'create' | 'edit'
  onSuccess?: () => void
}

const SECURITY_LEVEL_OPTIONS = [
  { label: '비밀', value: 'secret' },
  { label: '대외비', value: 'confidential' },
  { label: '일반', value: 'normal' },
]

const STORAGE_TYPE_OPTIONS = [
  { label: '이관비밀', value: '이관비밀' },
  { label: '존안비밀', value: '존안비밀' },
  { label: '군사자료', value: '군사자료' },
]

const DOC_SPEC_OPTIONS = [
  { label: 'A4', value: 'A4' },
  { label: 'B4', value: 'B4' },
  { label: 'A3', value: 'A3' },
  { label: 'B5', value: 'B5' },
  { label: '기타', value: '기타' },
]

const DOC_FORMAT_OPTIONS = [
  { label: '원본', value: '원본' },
  { label: '사본', value: '사본' },
  { label: '전자문서', value: '전자문서' },
  { label: '마이크로필름', value: '마이크로필름' },
]

const USAGE_FORMAT_OPTIONS = [
  { label: '대출', value: '대출' },
  { label: '열람', value: '열람' },
  { label: '지출', value: '지출' },
]

const DEPARTMENT_OPTIONS = [
  { label: '작전처', value: '작전처' },
  { label: '정보처', value: '정보처' },
  { label: '인사처', value: '인사처' },
  { label: '군수처', value: '군수처' },
  { label: '기획처', value: '기획처' },
]

const DOC_TYPE_OPTIONS = [
  { label: '훈령', value: '훈령' },
  { label: '예규', value: '예규' },
  { label: '지시', value: '지시' },
  { label: '일반문서', value: '일반문서' },
  { label: '보고서', value: '보고서' },
]

const STORAGE_LOCATION_OPTIONS = [
  { label: '본부 비밀취급소', value: '본부 비밀취급소' },
  { label: '1사단 보관소', value: '1사단 보관소' },
  { label: '2사단 보관소', value: '2사단 보관소' },
  { label: '교육훈련단', value: '교육훈련단' },
]

const RETENTION_PERIOD_OPTIONS = [
  { label: '5년', value: 5 },
  { label: '10년', value: 10 },
  { label: '15년', value: 15 },
  { label: '20년', value: 20 },
  { label: '30년', value: 30 },
]

export default function MilDataFormPage({ initialValues, mode = 'create', onSuccess }: MilDataFormPageProps) {
  const [form] = Form.useForm()
  const [retentionExtend, setRetentionExtend] = useState(false)
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (values: Partial<MilDocument>) =>
      apiClient.post('/sys07/documents', values),
    onSuccess: () => {
      message.success('등록되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-documents'] })
      onSuccess?.()
    },
    onError: () => message.error('등록에 실패했습니다'),
  })

  const updateMutation = useMutation({
    mutationFn: (values: Partial<MilDocument>) =>
      apiClient.put(`/sys07/documents/${initialValues?.id}`, values),
    onSuccess: () => {
      message.success('수정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['sys07-documents'] })
      onSuccess?.()
    },
    onError: () => message.error('수정에 실패했습니다'),
  })

  const handleFinish = (values: Record<string, unknown>) => {
    const payload = {
      ...values,
      transferDate: values.transferDate ? dayjs(values.transferDate as string).format('YYYY-MM-DD') : undefined,
      docDate: values.docDate ? dayjs(values.docDate as string).format('YYYY-MM-DD') : undefined,
      retentionExpireDate: values.retentionExpireDate
        ? dayjs(values.retentionExpireDate as string).format('YYYY-MM-DD')
        : undefined,
      newRetentionDate: values.newRetentionDate
        ? dayjs(values.newRetentionDate as string).format('YYYY-MM-DD')
        : undefined,
    }
    if (mode === 'edit' && initialValues?.id) {
      updateMutation.mutate(payload as Partial<MilDocument>)
    } else {
      createMutation.mutate(payload as Partial<MilDocument>)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={
        initialValues
          ? {
              ...initialValues,
              transferDate: initialValues.transferDate ? dayjs(initialValues.transferDate) : undefined,
              docDate: initialValues.docDate ? dayjs(initialValues.docDate as string) : undefined,
              retentionExpireDate: initialValues.retentionExpireDate
                ? dayjs(initialValues.retentionExpireDate)
                : undefined,
            }
          : {}
      }
      onFinish={handleFinish}
    >
      {/* CSV 입력값: 비밀등급, 보관장소, 관리번호, 문서구분, 이관일자, 문서제목,
          문서상태 변경근거, 문서일자, 보관위치, 이관부서, 발행부서, 보존기간,
          문서매수, 문서규격, 문서형태, 문서번호, 예고문, 활용형태, 보존기간만료 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Form.Item name="securityLevel" label="비밀등급" rules={[{ required: true, message: '비밀등급을 선택하세요' }]}>
          <Select options={SECURITY_LEVEL_OPTIONS} placeholder="비밀등급 선택" />
        </Form.Item>

        <Form.Item name="storageLocation" label="보관장소">
          <Select options={STORAGE_LOCATION_OPTIONS} placeholder="보관장소 선택" />
        </Form.Item>

        <Form.Item name="docNumber" label="관리번호" rules={[{ required: true, message: '관리번호를 입력하세요' }]}>
          <Input placeholder="관리번호 입력" />
        </Form.Item>

        <Form.Item name="docType" label="문서구분" rules={[{ required: true, message: '문서구분을 선택하세요' }]}>
          <Select options={DOC_TYPE_OPTIONS} placeholder="문서구분 선택" />
        </Form.Item>

        <Form.Item name="transferDate" label="이관일자" rules={[{ required: true, message: '이관일자를 선택하세요' }]}>
          <DatePicker style={{ width: '100%' }} placeholder="이관일자 선택" />
        </Form.Item>

        <Form.Item name="docDate" label="문서일자">
          <DatePicker style={{ width: '100%' }} placeholder="문서일자 선택" />
        </Form.Item>

        <Form.Item name="storageType" label="보관형태" rules={[{ required: true, message: '보관형태를 선택하세요' }]}>
          <Select options={STORAGE_TYPE_OPTIONS} placeholder="보관형태 선택" />
        </Form.Item>

        <Form.Item name="storagePosition" label="보관위치">
          <Input placeholder="보관위치 입력 (예: A-01)" />
        </Form.Item>

        <Form.Item name="transferDept" label="이관부서">
          <Select options={DEPARTMENT_OPTIONS} placeholder="이관부서 선택" />
        </Form.Item>

        <Form.Item name="issueDept" label="발행부서">
          <Select options={DEPARTMENT_OPTIONS} placeholder="발행부서 선택" />
        </Form.Item>

        <Form.Item name="retentionPeriod" label="보존기간" rules={[{ required: true, message: '보존기간을 선택하세요' }]}>
          <Select options={RETENTION_PERIOD_OPTIONS} placeholder="보존기간 선택" />
        </Form.Item>

        <Form.Item name="retentionExpireDate" label="보존기간만료일">
          <DatePicker style={{ width: '100%' }} placeholder="보존만료일 선택" />
        </Form.Item>

        <Form.Item name="pages" label="문서매수">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="매수 입력" />
        </Form.Item>

        <Form.Item name="docSpec" label="문서규격">
          <Select options={DOC_SPEC_OPTIONS} placeholder="문서규격 선택" />
        </Form.Item>

        <Form.Item name="docFormat" label="문서형태">
          <Select options={DOC_FORMAT_OPTIONS} placeholder="문서형태 선택" />
        </Form.Item>

        <Form.Item name="usageFormat" label="활용형태">
          <Select options={USAGE_FORMAT_OPTIONS} placeholder="활용형태 선택" />
        </Form.Item>
      </div>

      <Form.Item name="title" label="문서제목" rules={[{ required: true, message: '문서제목을 입력하세요' }]}>
        <Input placeholder="문서제목 입력" />
      </Form.Item>

      <Form.Item name="notice" label="예고문">
        <Input.TextArea rows={2} placeholder="예고문 입력" />
      </Form.Item>

      <Form.Item name="changeReason" label="문서상태 변경근거">
        <Input.TextArea rows={2} placeholder="변경근거 입력" />
      </Form.Item>

      <Form.Item name="attachFile" label="첨부파일">
        <Upload beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>파일 선택</Button>
        </Upload>
      </Form.Item>

      <Form.Item name="remarks" label="비고">
        <Input.TextArea rows={3} placeholder="비고 입력" />
      </Form.Item>

      {/* 수정 모드 전용 추가 필드 */}
      {mode === 'edit' && (
        <>
          <Form.Item name="disposeFlag" valuePropName="checked" label="">
            <Checkbox>파기 처리</Checkbox>
          </Form.Item>

          <Form.Item name="retentionExtend" valuePropName="checked" label="">
            <Checkbox onChange={(e) => setRetentionExtend(e.target.checked)}>
              보존기간 연장
            </Checkbox>
          </Form.Item>

          {retentionExtend && (
            <Form.Item
              name="newRetentionDate"
              label="연장 만료일"
              rules={[{ required: retentionExtend, message: '연장 만료일을 선택하세요' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="연장 만료일 선택" />
            </Form.Item>
          )}
        </>
      )}

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
