import { Card, Descriptions, Spin } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface PersonalSettings {
  approvalDept: string
  approver: string
  dutyPost: string
  unitName: string
}

async function fetchPersonalSettings(): Promise<PersonalSettings> {
  const res = await apiClient.get<never, ApiResult<PersonalSettings>>('/sys01/personal-settings')
  return (res as ApiResult<PersonalSettings>).data ?? (res as unknown as PersonalSettings)
}

export default function OtPersonalSettingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['sys01-personal-settings'],
    queryFn: fetchPersonalSettings,
  })

  return (
    <PageContainer title="개인설정 정보">
      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Spin />
          </div>
        ) : (
          <Descriptions title="나의 설정 정보" column={2} bordered>
            <Descriptions.Item label="결재부서">{data?.approvalDept ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="결재자">{data?.approver ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="당직개소">{data?.dutyPost ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="소속 부대(서)">{data?.unitName ?? '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </PageContainer>
  )
}
