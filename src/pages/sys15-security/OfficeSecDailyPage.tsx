import { useState } from 'react'
import { Checkbox, Input, Button, Form, DatePicker, message, Divider, Tag } from 'antd'
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

const OFFICE_REQUIRED_ITEMS = [
  { id: 'or1', label: '비밀서류 캐비닛 잠금 확인' },
  { id: 'or2', label: '저장매체 전량 수거 확인' },
  { id: 'or3', label: '암호장비 봉인 확인' },
  { id: 'or4', label: '사무실 출입문 이중 잠금 확인' },
  { id: 'or5', label: '전산장비 전원 차단 확인' },
  { id: 'or6', label: 'CCTV 정상 작동 확인' },
]

const OFFICE_OPTIONAL_ITEMS = [
  { id: 'oo1', label: '보안표찰 부착 여부 확인' },
  { id: 'oo2', label: '출입자 명부 정리 완료' },
  { id: 'oo3', label: '보안위반 사항 없음 확인' },
]

interface OfficeDailyRecord extends Record<string, unknown> {
  id: string
  date: string
  officeManager: string
  department: string
  checkedItems: string[]
  nonCompliantPersons: string
  nonCompliantReason: string
  absentPersons: string
  absentReason: string
  status: 'draft' | 'submitted' | 'approved'
  submittedAt?: string
}

async function fetchOfficeDailyHistory(params: PageRequest & { startDate?: string; endDate?: string }): Promise<PageResponse<OfficeDailyRecord>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<OfficeDailyRecord>>>('/api/sys15/office-daily', {
    params: { page: params.page, size: params.size, startDate: params.startDate, endDate: params.endDate },
  })
  const data = (res as ApiResult<PageResponse<OfficeDailyRecord>>).data ?? (res as unknown as PageResponse<OfficeDailyRecord>)
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

export default function OfficeSecDailyPage() {
  const [form] = Form.useForm()
  const [checkedRequired, setCheckedRequired] = useState<string[]>([])
  const [checkedOptional, setCheckedOptional] = useState<string[]>([])
  const [uncheckedReasons, setUncheckedReasons] = useState<Record<string, string>>({})
  const [filterDates, setFilterDates] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const queryClient = useQueryClient()

  const allRequiredIds = OFFICE_REQUIRED_ITEMS.map((i) => i.id)
  const uncheckedRequired = allRequiredIds.filter((id) => !checkedRequired.includes(id))

  function handleReasonChange(id: string, value: string) {
    setUncheckedReasons((prev) => ({ ...prev, [id]: value }))
  }

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post('/api/sys15/office-daily', payload),
    onSuccess: () => {
      message.success('저장되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-office-daily'] })
    },
    onError: () => message.error('저장에 실패했습니다.'),
  })

  const submitMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiClient.post('/api/sys15/office-daily', { ...payload, status: 'submitted' }),
    onSuccess: () => {
      message.success('결재 요청이 완료되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys15-office-daily'] })
      setCheckedRequired([])
      setCheckedOptional([])
      setUncheckedReasons({})
      form.resetFields()
    },
    onError: () => message.error('제출에 실패했습니다.'),
  })

  function buildPayload(status: 'draft' | 'submitted') {
    const formValues = form.getFieldsValue()
    const allChecked = [...checkedRequired, ...checkedOptional]
    return {
      checkedItems: allChecked,
      uncheckedReasons,
      nonCompliantPersons: formValues.nonCompliantPersons ?? '',
      nonCompliantReason: formValues.nonCompliantReason ?? '',
      absentPersons: formValues.absentPersons ?? '',
      absentReason: formValues.absentReason ?? '',
      status,
    }
  }

  function handleSave() {
    saveMutation.mutate(buildPayload('draft'))
  }

  function handleSubmit() {
    const missingReason = uncheckedRequired.find((id) => !uncheckedReasons[id]?.trim())
    if (missingReason) {
      const item = OFFICE_REQUIRED_ITEMS.find((i) => i.id === missingReason)
      message.warning(`미체크 항목 "${item?.label}"에 대한 사유를 입력하세요.`)
      return
    }
    submitMutation.mutate(buildPayload('submitted'))
  }

  const columns: ProColumns<OfficeDailyRecord>[] = [
    { title: '날짜', dataIndex: 'date', width: 120 },
    { title: '관리자', dataIndex: 'officeManager', width: 100 },
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
    <PageContainer title="사무실 보안일일결산">
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>사무실 보안점검</h3>

        <Form form={form} layout="vertical">
          <h4>필수 점검항목</h4>
          <Checkbox.Group
            value={checkedRequired}
            onChange={(vals) => setCheckedRequired(vals as string[])}
            style={{ display: 'block' }}
          >
            {OFFICE_REQUIRED_ITEMS.map((item) => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <Checkbox value={item.id}>{item.label}</Checkbox>
                {!checkedRequired.includes(item.id) && (
                  <TextArea
                    placeholder="미실시 사유를 입력하세요"
                    rows={1}
                    style={{ marginTop: 4, marginLeft: 24 }}
                    value={uncheckedReasons[item.id] ?? ''}
                    onChange={(e) => handleReasonChange(item.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </Checkbox.Group>

          <Divider />

          <h4>선택 점검항목</h4>
          <Checkbox.Group
            value={checkedOptional}
            onChange={(vals) => setCheckedOptional(vals as string[])}
            style={{ display: 'block' }}
          >
            {OFFICE_OPTIONAL_ITEMS.map((item) => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <Checkbox value={item.id}>{item.label}</Checkbox>
              </div>
            ))}
          </Checkbox.Group>

          <Divider />

          <h4>미실시자/부재자 관리 (필수)</h4>
          <Form.Item
            name="nonCompliantPersons"
            label="미실시자 성명"
            rules={[{ required: false }]}
          >
            <Input placeholder="미실시자가 없으면 '없음'을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="nonCompliantReason"
            label="미실시 사유"
            rules={[{ required: false }]}
          >
            <TextArea rows={2} placeholder="미실시 사유를 입력하세요" />
          </Form.Item>
          <Form.Item
            name="absentPersons"
            label="부재자 성명"
          >
            <Input placeholder="부재자가 없으면 '없음'을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="absentReason"
            label="부재 사유"
          >
            <TextArea rows={2} placeholder="부재 사유를 입력하세요" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleSave} loading={saveMutation.isPending}>
              임시저장
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={submitMutation.isPending}>
              제출 (결재요청)
            </Button>
          </div>
        </Form>
      </div>

      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span>조회기간:</span>
          <RangePicker
            onChange={(dates) => setFilterDates(dates as [Dayjs | null, Dayjs | null] | null)}
          />
        </div>
        <DataTable<OfficeDailyRecord>
          queryKey={['sys15-office-daily', startDate, endDate]}
          fetchFn={(params) => fetchOfficeDailyHistory({ ...params, startDate, endDate })}
          columns={columns}
        />
      </div>
    </PageContainer>
  )
}
