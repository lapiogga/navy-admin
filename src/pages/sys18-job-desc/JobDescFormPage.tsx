import { useState } from 'react'
import {
  Steps,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  InputNumber,
  Descriptions,
  Upload,
  Table,
  message,
} from 'antd'
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { JobDescType, OrgDiagnosis } from '@/shared/api/mocks/handlers/sys18'

const { TextArea } = Input
const { Text } = Typography

interface JobDescFormPageProps {
  type: JobDescType
  id?: string
  onClose?: () => void
}

const TASK_TYPE_OPTIONS = [
  { label: '정책', value: '정책' },
  { label: '관리', value: '관리' },
  { label: '지원', value: '지원' },
  { label: '기타', value: '기타' },
]

const STEP_ITEMS = [
  { title: '기본정보' },
  { title: '업무분류/비율' },
  { title: '시간배분' },
  { title: '역량/자격요건' },
  { title: '완료/제출' },
]

// 결재자 옵션 (1차/2차 결재자 지정용)
const APPROVER_OPTIONS = [
  { label: '김부서장 (중령)', value: 'user-a1' },
  { label: '이참모 (대령)', value: 'user-a2' },
  { label: '박대위 (대위)', value: 'user-a3' },
  { label: '최소령 (소령)', value: 'user-a4' },
]

// 초과근무 실적 Mock 데이터 (연동 데이터)
const OVERTIME_MOCK_DATA = [
  { key: '1', month: '2024-01', hours: 12, description: '작전 지원' },
  { key: '2', month: '2024-02', hours: 8, description: '행정 업무' },
  { key: '3', month: '2024-03', hours: 15, description: '훈련 지원' },
]

const OVERTIME_COLUMNS = [
  { title: '월', dataIndex: 'month', key: 'month' },
  { title: '시간', dataIndex: 'hours', key: 'hours' },
  { title: '내용', dataIndex: 'description', key: 'description' },
]

// 표준업무시간 조회
async function fetchStandardHours(): Promise<number> {
  const res = await apiClient.get<never, ApiResult<{ standardHours: number }>>('/sys18/standard-hours')
  const data = (res as ApiResult<{ standardHours: number }>).data ?? (res as unknown as { standardHours: number })
  return data.standardHours
}

// 조직진단 목록 조회
async function fetchOrgDiagnoses(): Promise<OrgDiagnosis[]> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OrgDiagnosis>>>('/sys18/org-diagnosis', {
    params: { page: 0, size: 100 },
  })
  const data = (res as ApiResult<PageResponse<OrgDiagnosis>>).data ?? (res as unknown as PageResponse<OrgDiagnosis>)
  return data.content
}

export default function JobDescFormPage({ type, id, onClose }: JobDescFormPageProps) {
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()

  // 실시간 비율 합계 감시
  const tasks = Form.useWatch('tasks', form) as Array<{ ratio?: number }> | undefined
  const ratioSum = tasks?.reduce((acc, t) => acc + (t?.ratio ?? 0), 0) ?? 0

  // 시간배분 주간시간 감시
  const taskTimeList = Form.useWatch('taskTimeList', form) as Array<{ weeklyHours?: number }> | undefined
  const standardHoursQuery = useQuery({
    queryKey: ['sys18-standard-hours'],
    queryFn: fetchStandardHours,
  })
  const standardHours = standardHoursQuery.data ?? 40

  const orgDiagnosisQuery = useQuery({
    queryKey: ['sys18-org-diagnoses'],
    queryFn: fetchOrgDiagnoses,
  })

  // 임시저장 mutation
  const draftMutation = useMutation({
    mutationFn: async () => {
      const values = form.getFieldsValue()
      const jdId = id || `jd-temp-${Date.now()}`
      await apiClient.put(`/sys18/job-descs/${jdId}/draft`, { ...values, type })
    },
    onSuccess: () => message.success('임시저장되었습니다.'),
    onError: () => message.error('임시저장에 실패했습니다.'),
  })

  // 결재 요청 mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const jdId = id || `jd-temp-${Date.now()}`
      await apiClient.put(`/sys18/job-descs/${jdId}/submit`)
    },
    onSuccess: () => {
      message.success('결재 요청이 완료되었습니다.')
      onClose?.()
    },
    onError: () => message.error('결재 요청에 실패했습니다.'),
  })

  const handleNext = async () => {
    try {
      // 현재 단계의 필드만 검증
      if (current === 1) {
        await form.validateFields(['tasks'])
        // 비율 합계 100% 검증
        if (ratioSum !== 100) {
          message.error(`업무 비율 합계가 100%가 되어야 합니다. 현재: ${ratioSum}%`)
          return
        }
      } else if (current === 0) {
        await form.validateFields(['diagnosisId', 'position', 'department'])
      } else if (current === 2) {
        await form.validateFields(['taskTimeList'])
      }
      setCurrent((prev) => prev + 1)
    } catch {
      // 유효성 검사 실패 시 이미 antd에서 메시지 표시
    }
  }

  const handlePrev = () => {
    setCurrent((prev) => prev - 1)
  }

  const handleDraft = () => {
    draftMutation.mutate()
  }

  const handleSubmit = () => {
    submitMutation.mutate()
  }

  const diagnosisOptions =
    orgDiagnosisQuery.data?.map((d) => ({
      label: d.diagnosisName,
      value: d.id,
    })) ?? []

  return (
    <div style={{ padding: '16px 0' }}>
      <Steps
        current={current}
        items={STEP_ITEMS}
        style={{ marginBottom: 32 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          tasks: [{ taskType: '정책', taskName: '', taskDetail: '', ratio: 0 }],
          taskTimeList: [{ taskName: '', weeklyHours: 0 }],
        }}
      >
        {/* Step 1: 기본정보 */}
        {current === 0 && (
          <div>
            <Form.Item name="diagnosisId" label="조직진단" rules={[{ required: true, message: '조직진단을 선택하세요' }]}>
              <Select placeholder="조직진단 선택" options={diagnosisOptions} loading={orgDiagnosisQuery.isLoading} />
            </Form.Item>
            <Form.Item name="writerMilitaryId" label="군번">
              <Input readOnly defaultValue="22-12345" />
            </Form.Item>
            <Form.Item name="writerName" label="성명">
              <Input readOnly defaultValue="홍길동" />
            </Form.Item>
            <Form.Item name="rank" label="계급">
              <Input readOnly defaultValue="대위" />
            </Form.Item>
            <Form.Item name="unit" label="부대(서)">
              <Input readOnly defaultValue="해병대사령부" />
            </Form.Item>
            <Form.Item
              name="position"
              label="직책"
              rules={[{ required: true, message: '직책을 입력하세요' }, { max: 50, message: '50자 이내로 입력하세요' }]}
            >
              <Input placeholder="직책 입력" maxLength={50} />
            </Form.Item>
            <Form.Item
              name="department"
              label="부서"
              rules={[{ required: true, message: '부서를 입력하세요' }, { max: 100, message: '100자 이내로 입력하세요' }]}
            >
              <Input placeholder="부서 입력" maxLength={100} />
            </Form.Item>
            <Form.Item name="phone" label="전화번호">
              <Input placeholder="010-0000-0000" />
            </Form.Item>

            {/* 1차/2차 결재자 지정 (CSV 행 16) */}
            <Form.Item name="firstApproverId" label="1차 결재자" rules={[{ required: true, message: '1차 결재자를 선택하세요' }]}>
              <Select placeholder="1차 결재자 선택" options={APPROVER_OPTIONS} />
            </Form.Item>
            <Form.Item name="secondApproverId" label="2차 결재자" rules={[{ required: true, message: '2차 결재자를 선택하세요' }]}>
              <Select placeholder="2차 결재자 선택" options={APPROVER_OPTIONS} />
            </Form.Item>

            {/* 개인직무내용 엑셀 업로드 (CSV 행 16: 엑셀 작성 및 파일 업로드) */}
            <Form.Item name="excelFile" label="개인직무내용 엑셀 가져오기">
              <Upload accept=".xlsx,.xls" maxCount={1} beforeUpload={() => { message.success('엑셀 파일이 업로드되었습니다 (Mock)'); return false }}>
                <Button icon={<UploadOutlined />}>엑셀 파일 선택</Button>
              </Upload>
            </Form.Item>

            {/* 전자결재 생산/발송 실적 엑셀 업로드 */}
            <Form.Item name="approvalRecordFile" label="전자결재 생산/발송 실적 엑셀">
              <Upload accept=".xlsx,.xls" maxCount={1} beforeUpload={() => { message.success('전자결재 실적 파일이 업로드되었습니다 (Mock)'); return false }}>
                <Button icon={<UploadOutlined />}>엑셀 파일 선택</Button>
              </Upload>
            </Form.Item>

            {/* 초과근무 실적 (연동 데이터, CSV 행 16) */}
            <div style={{ marginBottom: 16 }}>
              <Typography.Text strong>초과근무 실적 (연동 데이터)</Typography.Text>
              <Table
                columns={OVERTIME_COLUMNS}
                dataSource={OVERTIME_MOCK_DATA}
                pagination={false}
                size="small"
                style={{ marginTop: 8 }}
              />
            </div>

            {/* 대리작성 모드 (부서관리자 권한): 작성자 선택 */}
            {type === 'department' && (
              <Form.Item name="proxyWriterId" label="작성자 선택 (대리작성)">
                <Select
                  placeholder="대리 작성할 사용자 선택"
                  options={[
                    { label: '홍길동 (대위)', value: 'user-1' },
                    { label: '김철수 (소령)', value: 'user-2' },
                    { label: '이영희 (중위)', value: 'user-3' },
                  ]}
                  allowClear
                />
              </Form.Item>
            )}
          </div>
        )}

        {/* Step 2: 업무분류/비율 */}
        {current === 1 && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Text
                type={ratioSum === 100 ? 'success' : 'danger'}
                strong
              >
                합계: {ratioSum}% (100%가 되어야 합니다)
              </Text>
            </div>

            <Form.List name="tasks">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: 'flex', marginBottom: 8, alignItems: 'flex-start' }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'taskType']}
                        label="업무유형"
                        rules={[{ required: true, message: '업무유형 선택' }]}
                      >
                        <Select options={TASK_TYPE_OPTIONS} style={{ width: 100 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'taskName']}
                        label="업무명"
                        rules={[{ required: true, message: '업무명 입력' }, { max: 100 }]}
                      >
                        <Input placeholder="업무명" maxLength={100} style={{ width: 160 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'taskDetail']}
                        label="업무내용"
                      >
                        <TextArea placeholder="업무내용 (선택)" maxLength={300} rows={1} style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'ratio']}
                        label="비율(%)"
                        rules={[{ required: true, message: '비율 입력' }]}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          addonAfter="%"
                          style={{ width: 110 }}
                        />
                      </Form.Item>
                      <MinusCircleOutlined
                        style={{ marginTop: 36, color: 'red' }}
                        onClick={() => remove(name)}
                      />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add({ taskType: '정책', taskName: '', taskDetail: '', ratio: 0 })}
                      block
                      icon={<PlusOutlined />}
                    >
                      업무 추가
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        )}

        {/* Step 3: 시간배분 */}
        {current === 2 && (
          <div>
            <Form.Item label="표준업무시간(주)">
              <InputNumber value={standardHours} readOnly addonAfter="시간" style={{ width: 140 }} />
            </Form.Item>

            <Form.List name="taskTimeList">
              {(fields) => (
                <>
                  {fields.map(({ key, name, ...restField }) => {
                    const weeklyHours = taskTimeList?.[name]?.weeklyHours ?? 0
                    const pct = standardHours > 0 ? Math.round((weeklyHours / standardHours) * 100) : 0
                    return (
                      <Space
                        key={key}
                        style={{ display: 'flex', marginBottom: 8, alignItems: 'flex-start' }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, 'taskName']}
                          label="업무명"
                        >
                          <Input readOnly style={{ width: 180 }} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'weeklyHours']}
                          label="주간시간"
                          rules={[{ required: true, message: '주간시간 입력' }]}
                        >
                          <InputNumber
                            min={0}
                            max={100}
                            addonAfter="시간"
                            style={{ width: 130 }}
                          />
                        </Form.Item>
                        <Form.Item label="비율(자동)">
                          <Text type="secondary">{pct}%</Text>
                        </Form.Item>
                      </Space>
                    )
                  })}
                </>
              )}
            </Form.List>
          </div>
        )}

        {/* Step 4: 역량/자격요건 */}
        {current === 3 && (
          <div>
            <Form.Item name={['competency', 'requiredCompetency']} label="필요역량">
              <TextArea rows={3} maxLength={500} showCount placeholder="필요역량 입력" />
            </Form.Item>
            <Form.Item name={['competency', 'requiredQualification']} label="필요자격">
              <TextArea rows={3} maxLength={500} showCount placeholder="필요자격 입력" />
            </Form.Item>
            <Form.Item name={['competency', 'educationRequired']} label="학력요건">
              <TextArea rows={2} maxLength={300} showCount placeholder="학력요건 입력" />
            </Form.Item>
            <Form.Item name={['competency', 'experienceRequired']} label="경험요건">
              <TextArea rows={2} maxLength={300} showCount placeholder="경험요건 입력" />
            </Form.Item>
            <Form.Item name={['competency', 'specialNote']} label="특기사항">
              <TextArea rows={2} maxLength={300} showCount placeholder="특기사항 입력" />
            </Form.Item>
          </div>
        )}

        {/* Step 5: 완료/제출 */}
        {current === 4 && (
          <div>
            <Descriptions
              title="기본정보 요약"
              layout="vertical"
              column={2}
              bordered
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="성명">{form.getFieldValue('writerName') || '홍길동'}</Descriptions.Item>
              <Descriptions.Item label="직책">{form.getFieldValue('position') || '-'}</Descriptions.Item>
              <Descriptions.Item label="부서">{form.getFieldValue('department') || '-'}</Descriptions.Item>
              <Descriptions.Item label="업무분류 건수">
                {(form.getFieldValue('tasks') as unknown[] | undefined)?.length ?? 0}건
              </Descriptions.Item>
              <Descriptions.Item label="시간배분 총합">
                {taskTimeList?.reduce((acc, t) => acc + (t?.weeklyHours ?? 0), 0) ?? 0}시간/주
              </Descriptions.Item>
              <Descriptions.Item label="상태">작성중</Descriptions.Item>
            </Descriptions>

            <Descriptions title="결재선 확인" layout="vertical" column={2} bordered>
              <Descriptions.Item label="1차 결재자">
                <Text>{APPROVER_OPTIONS.find((o) => o.value === form.getFieldValue('firstApproverId'))?.label ?? '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="2차 결재자">
                <Text>{APPROVER_OPTIONS.find((o) => o.value === form.getFieldValue('secondApproverId'))?.label ?? '-'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Form>

      {/* 단계별 하단 버튼 */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          {current > 0 && (
            <Button onClick={handlePrev}>이전 단계</Button>
          )}
          {current < 4 && (
            <Button onClick={handleDraft} loading={draftMutation.isPending}>
              임시저장
            </Button>
          )}
          {current < 4 && (
            <Button type="primary" onClick={handleNext}>
              다음 단계
            </Button>
          )}
          {current === 4 && (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitMutation.isPending}
            >
              결재 요청
            </Button>
          )}
        </Space>
      </div>
    </div>
  )
}
