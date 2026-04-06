import { useState } from 'react'
import { Tabs, Card, Form, Input, InputNumber, Switch, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { Bar } from '@ant-design/charts'
import { useQuery } from '@tanstack/react-query'
import type { ProColumns } from '@ant-design/pro-components'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { CrudForm } from '@/shared/ui/CrudForm/CrudForm'
import type { CrudFormField } from '@/shared/ui/CrudForm/CrudForm'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'
import type { Directive, Proposal } from '@/shared/api/mocks/handlers/sys12'

// 관리자 통계 타입
interface AdminStat extends Record<string, unknown> {
  category: string
  count: number
  status: string
  type: string
}

// 카테고리 타입
interface CategoryItem extends Record<string, unknown> {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

// API 함수
async function fetchAdminStats(): Promise<AdminStat[]> {
  const res = await apiClient.get<never, ApiResult<AdminStat[]>>('/sys12/admin/stats')
  const data = (res as ApiResult<AdminStat[]>).data ?? (res as unknown as AdminStat[])
  return data
}

// Mock 카테고리 데이터
const mockCategories: CategoryItem[] = [
  { id: '1', name: '작전', sortOrder: 1, isActive: true },
  { id: '2', name: '교육', sortOrder: 2, isActive: true },
  { id: '3', name: '군수', sortOrder: 3, isActive: true },
  { id: '4', name: '인사', sortOrder: 4, isActive: true },
  { id: '5', name: '정보화', sortOrder: 5, isActive: true },
]

// Mock 사용자 데이터
interface UserItem extends Record<string, unknown> {
  id: string
  name: string
  unit: string
  role: string
}

const mockUsers: UserItem[] = [
  { id: 'u1', name: '홍길동', unit: '해병대사령부', role: '관리자' },
  { id: 'u2', name: '이순신', unit: '1사단', role: '일반사용자' },
  { id: 'u3', name: '강감찬', unit: '2사단', role: '일반사용자' },
]

// Mock 부대 데이터
interface UnitItem extends Record<string, unknown> {
  id: string
  name: string
  code: string
}

const mockUnits: UnitItem[] = [
  { id: 'unit1', name: '해병대사령부', code: 'HQ' },
  { id: 'unit2', name: '1사단', code: 'D1' },
  { id: 'unit3', name: '2사단', code: 'D2' },
  { id: 'unit4', name: '교육훈련단', code: 'ET' },
  { id: 'unit5', name: '상륙기동단', code: 'AO' },
]

// 카테고리 폼 필드
const categoryFormFields: CrudFormField[] = [
  { name: 'name', label: '카테고리명', type: 'text', required: true },
  { name: 'sortOrder', label: '정렬순서', type: 'number', required: true },
]

export default function DirectiveAdminPage() {
  const [activeTab, setActiveTab] = useState('directives')

  const { data: statsData = [] } = useQuery({
    queryKey: ['sys12-admin-stats'],
    queryFn: fetchAdminStats,
  })

  // 지시사항 관리 컬럼
  const directiveColumns: ProColumns<Directive>[] = [
    { title: '관리번호', dataIndex: 'directiveNo', width: 120 },
    { title: '지시자', dataIndex: 'director', width: 100 },
    { title: '지시일자', dataIndex: 'directiveDate', width: 120, valueType: 'date' },
    { title: '수명부대', dataIndex: 'targetUnit', width: 150 },
    { title: '지시내용', dataIndex: 'content', width: 250, ellipsis: true },
    { title: '종류', dataIndex: 'category', width: 100 },
    { title: '추진상태', dataIndex: 'progressStatus', width: 100 },
  ]

  // 건의사항 관리 컬럼
  const proposalColumns: ProColumns<Proposal>[] = [
    { title: '관리번호', dataIndex: 'proposalNo', width: 120 },
    { title: '건의자', dataIndex: 'proposer', width: 100 },
    { title: '건의일자', dataIndex: 'proposalDate', width: 120, valueType: 'date' },
    { title: '주관부대', dataIndex: 'managingUnit', width: 150 },
    { title: '건의내용', dataIndex: 'content', width: 250, ellipsis: true },
    { title: '종류', dataIndex: 'category', width: 100 },
    { title: '추진상태', dataIndex: 'progressStatus', width: 100 },
  ]

  // 카테고리 컬럼
  const categoryColumns: ProColumns<CategoryItem>[] = [
    { title: '카테고리명', dataIndex: 'name', width: 200 },
    { title: '정렬순서', dataIndex: 'sortOrder', width: 100 },
    {
      title: '사용여부',
      dataIndex: 'isActive',
      width: 100,
      render: (_, record) => <Switch checked={record.isActive} disabled />,
    },
  ]

  // 사용자 컬럼
  const userColumns: ProColumns<UserItem>[] = [
    { title: '이름', dataIndex: 'name', width: 150 },
    { title: '소속부대', dataIndex: 'unit', width: 200 },
    { title: '권한', dataIndex: 'role', width: 150 },
  ]

  // 부대 컬럼
  const unitColumns: ProColumns<UnitItem>[] = [
    { title: '부대명', dataIndex: 'name', width: 200 },
    { title: '코드', dataIndex: 'code', width: 100 },
  ]

  const tabItems = [
    {
      key: 'directives',
      label: '지시사항관리',
      children: (
        <DataTable<Directive>
          rowKey="id"
          columns={directiveColumns}
          request={async (params) => {
            const res = await apiClient.get<never, ApiResult<{ content: Directive[]; totalElements: number; totalPages: number; size: number; number: number }>>('/sys12/directives', {
              params: { page: params.page, size: params.size },
            })
            const data = (res as ApiResult<typeof res>).data ?? (res as unknown as typeof res)
            return data as { content: Directive[]; totalElements: number; totalPages: number; size: number; number: number }
          }}
        />
      ),
    },
    {
      key: 'proposals',
      label: '건의사항관리',
      children: (
        <DataTable<Proposal>
          rowKey="id"
          columns={proposalColumns}
          request={async (params) => {
            const res = await apiClient.get<never, ApiResult<{ content: Proposal[]; totalElements: number; totalPages: number; size: number; number: number }>>('/sys12/proposals', {
              params: { page: params.page, size: params.size },
            })
            const data = (res as ApiResult<typeof res>).data ?? (res as unknown as typeof res)
            return data as { content: Proposal[]; totalElements: number; totalPages: number; size: number; number: number }
          }}
        />
      ),
    },
    {
      key: 'categories',
      label: '카테고리 관리',
      children: (
        <DataTable<CategoryItem>
          rowKey="id"
          columns={categoryColumns}
          request={async () => ({
            content: mockCategories,
            totalElements: mockCategories.length,
            totalPages: 1,
            size: mockCategories.length,
            number: 0,
          })}
          toolBarRender={() => [
            <CrudForm<Record<string, unknown>>
              key="category-form"
              fields={categoryFormFields}
              mode="create"
              onFinish={async () => {
                message.success('카테고리가 등록되었습니다')
                return true
              }}
            />,
          ]}
        />
      ),
    },
    {
      key: 'stats',
      label: '통계',
      children: (
        <Card title="카테고리별 지시/건의 처리현황">
          <Bar
            data={statsData}
            xField="count"
            yField="category"
            seriesField="status"
            isStack={true}
            height={300}
            label={{ position: 'middle' }}
            legend={{ position: 'top-left' }}
          />
        </Card>
      ),
    },
    {
      key: 'users',
      label: '사용자 관리',
      children: (
        <DataTable<UserItem>
          rowKey="id"
          columns={userColumns}
          request={async () => ({
            content: mockUsers,
            totalElements: mockUsers.length,
            totalPages: 1,
            size: mockUsers.length,
            number: 0,
          })}
        />
      ),
    },
    {
      key: 'units',
      label: '부대 관리',
      children: (
        <DataTable<UnitItem>
          rowKey="id"
          columns={unitColumns}
          request={async () => ({
            content: mockUnits,
            totalElements: mockUnits.length,
            totalPages: 1,
            size: mockUnits.length,
            number: 0,
          })}
        />
      ),
    },
    {
      key: 'period',
      label: '기간 설정',
      children: (
        <Card title="지시/건의 관리 기간 설정">
          <Form layout="vertical">
            <Form.Item label="관리 시작일" name="startDate">
              <Input type="date" />
            </Form.Item>
            <Form.Item label="관리 종료일" name="endDate">
              <Input type="date" />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notification',
      label: '알림 설정',
      children: (
        <Card title="알림 주기/대상 설정">
          <Form layout="vertical">
            <Form.Item label="알림 주기(일)" name="notifyPeriod">
              <InputNumber min={1} max={30} defaultValue={7} />
            </Form.Item>
            <Form.Item label="알림 대상 부대" name="notifyUnit">
              <Input placeholder="알림 대상 부대를 입력하세요" />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'permissions',
      label: '권한 관리',
      children: (
        <Card title="권한 관리">
          <p>Phase 1 권한관리 기능을 재사용합니다.</p>
          <DataTable<UserItem>
            rowKey="id"
            columns={[
              ...userColumns,
              {
                title: '권한변경',
                key: 'changeRole',
                render: () => (
                  <Input placeholder="권한 입력" style={{ width: 120 }} />
                ),
              },
            ]}
            request={async () => ({
              content: mockUsers,
              totalElements: mockUsers.length,
              totalPages: 1,
              size: mockUsers.length,
              number: 0,
            })}
          />
        </Card>
      ),
    },
  ]

  return (
    <PageContainer title="관리자">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </PageContainer>
  )
}
