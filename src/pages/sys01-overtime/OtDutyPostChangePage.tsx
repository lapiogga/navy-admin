import { useState } from 'react'
import { Card, Select, Button, Descriptions, message } from 'antd'
import { PageContainer } from '@ant-design/pro-components'

const DUTY_POST_OPTIONS = [
  { label: '제1당직실', value: '제1당직실' },
  { label: '제2당직실', value: '제2당직실' },
  { label: '본부 당직실', value: '본부 당직실' },
  { label: '지휘통제실', value: '지휘통제실' },
]

export default function OtDutyPostChangePage() {
  const [currentPost] = useState('제1당직실')
  const [selectedPost, setSelectedPost] = useState<string | undefined>(undefined)

  const handleChange = () => {
    if (!selectedPost) {
      message.warning('변경할 당직개소를 선택하세요.')
      return
    }
    message.success(`당직개소가 '${selectedPost}'(으)로 변경되었습니다.`)
    setSelectedPost(undefined)
  }

  return (
    <PageContainer title="당직개소 변경">
      <Card title="우리 부대 당직개소 현황" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="현재 당직개소">{currentPost}</Descriptions.Item>
          <Descriptions.Item label="부대명">1함대</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="당직개소 변경">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: 400 }}>
          <span style={{ whiteSpace: 'nowrap' }}>변경할 개소:</span>
          <Select
            value={selectedPost}
            options={DUTY_POST_OPTIONS.filter((o) => o.value !== currentPost)}
            onChange={setSelectedPost}
            placeholder="당직개소 선택"
            style={{ flex: 1 }}
          />
          <Button type="primary" onClick={handleChange}>
            변경
          </Button>
        </div>
      </Card>
    </PageContainer>
  )
}
