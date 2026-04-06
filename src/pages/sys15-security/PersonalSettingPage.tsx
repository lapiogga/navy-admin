import { Card, Form, Switch, Button, message, Space } from 'antd'
import { TimePicker } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

interface PersonalSetting extends Record<string, unknown> {
  id: string
  personalAlarm: boolean
  officeAlarm: boolean
  alarmTime: string
}

async function fetchPersonalSettings(): Promise<PersonalSetting> {
  const res = await apiClient.get<never, ApiResult<PersonalSetting>>('/sys15/personal-settings')
  return (res as ApiResult<PersonalSetting>).data ?? (res as unknown as PersonalSetting)
}

export default function PersonalSettingPage() {
  const [form] = Form.useForm()

  const { isLoading } = useQuery({
    queryKey: ['sys15', 'personal-settings'],
    queryFn: fetchPersonalSettings,
    select: (data) => {
      form.setFieldsValue({ personalAlarm: data.personalAlarm, officeAlarm: data.officeAlarm })
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const alarmTimeVal = values.alarmTime as { format?: (f: string) => string } | undefined
      return apiClient.put('/sys15/personal-settings', {
        ...values,
        alarmTime: alarmTimeVal?.format?.('HH:mm') ?? values.alarmTime,
      })
    },
    onSuccess: () => message.success('설정이 저장되었습니다.'),
    onError: () => message.error('저장에 실패했습니다.'),
  })

  return (
    <PageContainer title="개인설정">
      <Card title="알림 설정" loading={isLoading} style={{ maxWidth: 500 }}>
        <Form form={form} layout="vertical" onFinish={(v) => saveMutation.mutate(v)}>
          <Form.Item name="personalAlarm" label="개인결산 알림" valuePropName="checked">
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
          <Form.Item name="officeAlarm" label="사무실결산 알림" valuePropName="checked">
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
          <Form.Item name="alarmTime" label="알림 시간">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saveMutation.isPending}
              >
                저장
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  )
}
