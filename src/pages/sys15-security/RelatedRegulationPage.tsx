import { useState } from 'react'
import { Button, Card, Input, Space, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

const { TextArea } = Input

interface RegulationContent extends Record<string, unknown> {
  id: string
  category: string
  content: string
  updatedAt: string
}

const REGULATION_CATEGORIES = [
  { key: 'personal', label: '개인보안 관련규정' },
  { key: 'office', label: '사무실보안 관련규정' },
  { key: 'secret', label: '비밀취급 관련규정' },
  { key: 'media', label: '보안매체 관련규정' },
]

async function fetchRegulation(category: string): Promise<RegulationContent> {
  const res = await apiClient.get<never, ApiResult<RegulationContent>>(`/sys15/regulations/${category}`)
  return (res as ApiResult<RegulationContent>).data ?? (res as unknown as RegulationContent)
}

function RegulationEditor({ category, label }: { category: string; label: string }) {
  const [content, setContent] = useState('')

  const { isLoading } = useQuery({
    queryKey: ['sys15', 'regulations', category],
    queryFn: () => fetchRegulation(category),
    select: (data) => {
      setContent(data.content)
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => apiClient.put(`/sys15/regulations/${category}`, { content }),
    onSuccess: () => message.success('저장되었습니다.'),
    onError: () => message.error('저장에 실패했습니다.'),
  })

  return (
    <Card
      title={label}
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          저장
        </Button>
      }
      loading={isLoading}
      style={{ marginBottom: 16 }}
    >
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        placeholder={`${label} 내용을 입력하세요`}
      />
    </Card>
  )
}

export default function RelatedRegulationPage() {
  return (
    <PageContainer title="관련규정관리">
      <Space direction="vertical" style={{ width: '100%' }}>
        {REGULATION_CATEGORIES.map((cat) => (
          <RegulationEditor key={cat.key} category={cat.key} label={cat.label} />
        ))}
      </Space>
    </PageContainer>
  )
}
