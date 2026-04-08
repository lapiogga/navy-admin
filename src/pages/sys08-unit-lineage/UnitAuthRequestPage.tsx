import { useState, useRef } from 'react'
import { Button, Form, Input, Select, Upload, message, Card, Row, Col } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitAuthRequest } from '@/shared/api/mocks/handlers/sys08-unit-lineage'

const { TextArea } = Input

const UNIT_OPTIONS = [
  { label: '해군사령부', value: '해군사령부' },
  { label: '제1함대', value: '제1함대' },
  { label: '제2함대', value: '제2함대' },
  { label: '제3함대', value: '제3함대' },
  { label: '기뢰전전대', value: '기뢰전전대' },
  { label: '잠수함전대', value: '잠수함전대' },
  { label: '항공전대', value: '항공전대' },
  { label: '해병대사령부', value: '해병대사령부' },
]

const ROLE_OPTIONS = [
  { label: '계보담당', value: '계보담당' },
  { label: '중간결재자', value: '중간결재자' },
  { label: '확인관', value: '확인관' },
  { label: '부대관리자', value: '부대관리자' },
]

const STATUS_COLOR_MAP: Record<string, string> = {
  신청: 'blue',
  승인: 'green',
  반려: 'red',
}

async function fetchMyRequests(params: PageRequest): Promise<PageResponse<UnitAuthRequest>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitAuthRequest>>>('/sys08/auth-requests', { params })
  return (res as ApiResult<PageResponse<UnitAuthRequest>>).data ?? (res as unknown as PageResponse<UnitAuthRequest>)
}

export default function UnitAuthRequestPage() {
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const requestMutation = useMutation({
    mutationFn: async (values: { requestUnit: string; requestRole: string; milPhone: string; personnelOrderBasis: string; reason: string }) => {
      return apiClient.post('/sys08/auth-request', values)
    },
    onSuccess: () => {
      message.success('권한신청이 완료되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08-auth-requests'] })
      actionRef.current?.reload()
      form.resetFields()
    },
    onError: () => message.error('신청에 실패했습니다.'),
  })

  const columns: ProColumns<UnitAuthRequest>[] = [
    { title: '관리부대', dataIndex: 'requestUnit', width: 150 },
    { title: '요청권한', dataIndex: 'requestRole', width: 130 },
    { title: '군 전화번호', dataIndex: 'milPhone', width: 120 },
    { title: '사유', dataIndex: 'reason', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <StatusBadge status={record.status} colorMap={STATUS_COLOR_MAP} />
      ),
    },
    { title: '신청일', dataIndex: 'requestedAt', width: 120 },
    { title: '처리일', dataIndex: 'processedAt', width: 120, render: (v) => (v as string) || '-' },
    {
      title: '반려사유',
      dataIndex: 'rejectReason',
      ellipsis: true,
      render: (v) => (v as string) || '-',
    },
  ]

  return (
    <PageContainer title="권한신청">
      {/* 신청 폼 - CSV 입력값 반영 (R1 규칙) */}
      <Card title="권한신청" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => requestMutation.mutate(values)}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="requestUnit"
                label="관리부대"
                rules={[{ required: true, message: '관리부대를 선택하세요' }]}
              >
                <Select options={UNIT_OPTIONS} placeholder="관리부대 선택" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="requestRole"
                label="요청권한"
                rules={[{ required: true, message: '요청권한을 선택하세요' }]}
              >
                <Select options={ROLE_OPTIONS} placeholder="요청권한 선택" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="milPhone"
                label="군 전화번호"
                rules={[{ required: true, message: '군 전화번호를 입력하세요' }]}
              >
                <Input placeholder="예: 123-4567" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="reason"
                label="사유"
                rules={[{ required: true, message: '사유를 입력하세요' }]}
              >
                <TextArea rows={2} placeholder="권한 신청 사유를 입력하세요" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="인사명령 근거(첨부파일)">
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>파일 선택</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={requestMutation.isPending}>
              신청
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 진행조회 목록 */}
      <DataTable<UnitAuthRequest>
        columns={columns}
        request={fetchMyRequests}
        rowKey="id"
        actionRef={actionRef}
        headerTitle="신청 진행현황"
      />
    </PageContainer>
  )
}
