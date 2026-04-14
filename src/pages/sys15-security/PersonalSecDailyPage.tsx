import { useState } from 'react'
import { Checkbox, Input, Button, Form, DatePicker, message, Row, Col, Tag } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Dayjs } from 'dayjs'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'

const { TextArea } = Input
const { RangePicker } = DatePicker

// 필수/선택 체크리스트
const REQUIRED_ITEMS = [
  { id: 'r1', label: '비밀서류 잠금장치 확인' },
  { id: 'r2', label: '저장매체 보관함 잠금 확인' },
  { id: 'r3', label: '암호장비 봉인 확인' },
  { id: 'r4', label: 'PC 화면잠금 설정 확인' },
  { id: 'r5', label: '출입통제 이상 없음 확인' },
]

const OPTIONAL_ITEMS = [
  { id: 'o1', label: '인원 이상 없음 확인' },
  { id: 'o2', label: '문서파쇄 실시 여부' },
  { id: 'o3', label: '보안교육 이수 여부' },
]

interface PersonalDailyRecord extends Record<string, unknown> {
  id: string
  date: string
  userName: string
  department: string
  checkedItems: string[]
  uncheckedReasons: Record<string, string>
  status: 'draft' | 'submitted' | 'approved'
  submittedAt?: string
}

async function fetchPersonalDailyHistory(params: PageRequest & { startDate?: string; endDate?: string }): Promise<PageResponse<PersonalDailyRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<PersonalDailyRecord>>>('/sys15/personal-daily', {
    params: { page: params.page, size: params.size, startDate: params.startDate, endDate: params.endDate },
  })
  const data = (res as ApiResult<PageResponse<PersonalDailyRecord>>).data ?? (res as unknown as PageResponse<PersonalDailyRecord>)
  return data
}

const STATUS_COLOR_MAP: Record<string, string> = {
  draft: 'default',
  submitted: 'orange',
  approved: 'green',
}
const STATUS_LABEL_MAP: Record<string, string> = {
  draft: '임시저장',
  submitted: '결재대기',
  approved: '승인',
}

export default function PersonalSecDailyPage() {
  const [form] = Form.useForm()
  const [checkedRequired, setCheckedRequired] = useState<string[]>([])
  const [checkedOptional, setCheckedOptional] = useState<string[]>([])
  const [uncheckedReasons, setUncheckedReasons] = useState<Record<string, string>>({})
  const [filterDates, setFilterDates] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const queryClient = useQueryClient()

  const allRequiredIds = REQUIRED_ITEMS.map((i) => i.id)
  const uncheckedRequired = allRequiredIds.filter((id) => !checkedRequired.includes(id))

  function handleReasonChange(id: string, value: string) {
    setUncheckedReasons((prev) => ({ ...prev, [id]: value }))
  }

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post('/sys15/personal-daily', payload),
    onSuccess: () => {
      message.success('저장되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-personal-daily'] })
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  const submitMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post('/sys15/personal-daily', { ...payload, status: 'submitted' }),
    onSuccess: () => {
      message.success('결재 요청이 완료되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-personal-daily'] })
      setCheckedRequired([])
      setCheckedOptional([])
      setUncheckedReasons({})
    },
    onError: () => message.error('제출에 실패했습니다.'),
  })

  function buildPayload(status: 'draft' | 'submitted') {
    const allChecked = [...checkedRequired, ...checkedOptional]
    return {
      checkedItems: allChecked,
      uncheckedReasons,
      status,
    }
  }

  function handleSave() {
    saveMutation.mutate(buildPayload('draft'))
  }

  function handleSubmit() {
    // 미체크 항목에 사유가 없으면 경고
    const missingReason = uncheckedRequired.find((id) => !uncheckedReasons[id]?.trim())
    if (missingReason) {
      const item = REQUIRED_ITEMS.find((i) => i.id === missingReason)
      message.warning(`미체크 항목 "${item?.label}"에 대한 사유를 입력하세요.`)
      return
    }
    submitMutation.mutate(buildPayload('submitted'))
  }

  const columns: ProColumns<PersonalDailyRecord>[] = [
    { title: '날짜', dataIndex: 'date', width: 120 },
    { title: '성명', dataIndex: 'userName', width: 100 },
    { title: '부대(서)', dataIndex: 'department', width: 120 },
    {
      title: '체크항목',
      dataIndex: 'checkedItems',
      render: (val: unknown) => (
        <Tag>{Array.isArray(val) ? `${(val as string[]).length}개` : '0개'}</Tag>
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (val: unknown) => (
        <StatusBadge
          status={String(val)}
          colorMap={STATUS_COLOR_MAP}
          labelMap={STATUS_LABEL_MAP}
        />
      ),
    },
    { title: '제출일시', dataIndex: 'submittedAt', width: 120 },
  ]

  const startDate = filterDates?.[0]?.format('YYYY-MM-DD')
  const endDate = filterDates?.[1]?.format('YYYY-MM-DD')

  return (
    <PageContainer title="개인 보안일일결산">
      {/* 체크리스트 입력 영역 */}
      <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>오늘의 보안점검</div>

        <Form form={form} size="small">
          <div style={{ marginBottom: 4, fontWeight: 600, fontSize: 13, color: '#1890ff' }}>필수 점검항목</div>
          <Checkbox.Group
            value={checkedRequired}
            onChange={(vals) => setCheckedRequired(vals as string[])}
            style={{ display: 'block' }}
          >
            <Row gutter={[16, 2]}>
              {REQUIRED_ITEMS.map((item) => (
                <Col span={12} key={item.id}>
                  <Checkbox value={item.id} style={{ fontSize: 13 }}>{item.label}</Checkbox>
                  {!checkedRequired.includes(item.id) && (
                    <Input
                      placeholder="미실시 사유"
                      size="small"
                      style={{ marginTop: 2, marginLeft: 24, width: 'calc(100% - 24px)', marginBottom: 4 }}
                      value={uncheckedReasons[item.id] ?? ''}
                      onChange={(e) => handleReasonChange(item.id, e.target.value)}
                    />
                  )}
                </Col>
              ))}
            </Row>
          </Checkbox.Group>

          <div style={{ marginTop: 8, marginBottom: 4, fontWeight: 600, fontSize: 13, color: '#1890ff' }}>선택 점검항목</div>
          <Checkbox.Group
            value={checkedOptional}
            onChange={(vals) => setCheckedOptional(vals as string[])}
            style={{ display: 'block' }}
          >
            <Row gutter={[16, 2]}>
              {OPTIONAL_ITEMS.map((item) => (
                <Col span={8} key={item.id}>
                  <Checkbox value={item.id} style={{ fontSize: 13 }}>{item.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>

          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <Button size="small" onClick={handleSave} loading={saveMutation.isPending}>
              임시저장
            </Button>
            <Button size="small" type="primary" onClick={handleSubmit} loading={submitMutation.isPending}>
              제출 (결재요청)
            </Button>
          </div>
        </Form>
      </div>

      {/* 이력 조회 */}
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span>조회기간:</span>
          <RangePicker
            onChange={(dates) => setFilterDates(dates as [Dayjs | null, Dayjs | null] | null)}
          />
        </div>
        <DataTable<PersonalDailyRecord>
          columns={columns}
          request={(params) => fetchPersonalDailyHistory({ ...params, startDate, endDate })}
          rowKey="id"
        />
      </div>
    </PageContainer>
  )
}
