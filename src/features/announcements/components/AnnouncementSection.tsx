import { List, Alert, Typography } from 'antd'
import { useAnnouncements } from '../hooks/useAnnouncements'

const { Title, Text } = Typography

export function AnnouncementSection() {
  const { data, isLoading } = useAnnouncements()

  const urgentItem = data?.find((a) => a.isUrgent)
  const items = data?.slice(0, 3) ?? []

  return (
    <div className="mb-12">
      <Title level={5}>공지사항</Title>
      {urgentItem && (
        <Alert
          type="warning"
          message={urgentItem.title}
          closable
          className="mb-2"
        />
      )}
      <List
        size="small"
        bordered={false}
        loading={isLoading}
        dataSource={items}
        locale={{ emptyText: '등록된 공지사항이 없습니다' }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.title}
              description={<Text type="secondary">{item.createdAt}</Text>}
            />
          </List.Item>
        )}
      />
    </div>
  )
}
