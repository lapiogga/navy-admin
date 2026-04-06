import { useState } from 'react'
import { Card, Form, Input, Button, Select, Tag } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult, PageResponse } from '@/shared/api/types'
import type { DetailTask } from '@/shared/api/mocks/handlers/sys03-performance'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import type { ProColumns } from '@ant-design/pro-components'
import type { PageRequest } from '@/shared/api/types'

const YEARS = ['2022', '2023', '2024', '2025', '2026']

async function searchTasks(params: PageRequest & { keyword?: string; year?: string }): Promise<PageResponse<DetailTask>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<DetailTask>>>('/sys03/task-search', {
    params: {
      current: params.page + 1,
      pageSize: params.size,
      keyword: params.keyword,
      year: params.year,
    },
  })
  return (res as ApiResult<PageResponse<DetailTask>>).data ?? (res as unknown as PageResponse<DetailTask>)
}

export default function PerfTaskSearchPage() {
  const [searchParams, setSearchParams] = useState<{ keyword?: string; year?: string }>({})
  const [form] = Form.useForm()

  const columns: ProColumns<DetailTask>[] = [
    { title: '번호', dataIndex: 'index', valueType: 'index', width: 60 },
    { title: '상세과제명', dataIndex: 'title' },
    { title: '소과제', dataIndex: 'subTaskTitle' },
    { title: '부대(서)', dataIndex: 'deptName', width: 120 },
    { title: '담당자', dataIndex: 'manager', width: 100 },
    { title: '가중치(%)', dataIndex: 'weight', width: 100 },
  ]

  const handleSearch = (values: { keyword?: string; year?: string }) => {
    setSearchParams(values)
  }

  return (
    <PageContainer title="과제검색">
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword" label="과제명">
            <Input placeholder="과제명을 입력하세요" style={{ width: 250 }} allowClear />
          </Form.Item>
          <Form.Item name="year" label="기준년도">
            <Select
              options={YEARS.map((y) => ({ label: y, value: y }))}
              placeholder="기준년도"
              style={{ width: 120 }}
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              검색
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <DataTable<DetailTask>
        rowKey="id"
        columns={columns}
        headerTitle="과제 검색 결과"
        request={(params) => searchTasks({ ...params, ...searchParams })}
      />
    </PageContainer>
  )
}
