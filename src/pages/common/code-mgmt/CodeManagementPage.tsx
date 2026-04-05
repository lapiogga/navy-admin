import { useState } from 'react'
import { Row, Col } from 'antd'
import { CodeGroupPage } from './CodeGroupPage'
import { CodeListPanel } from './CodeListPanel'

export default function CodeManagementPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedGroupCode, setSelectedGroupCode] = useState<string | null>(null)

  return (
    <Row gutter={16} style={{ height: '100%' }}>
      <Col span={10}>
        <CodeGroupPage
          onSelectGroup={(groupId, groupCode) => {
            setSelectedGroupId(groupId)
            setSelectedGroupCode(groupCode)
          }}
          selectedGroupId={selectedGroupId}
        />
      </Col>
      <Col span={14}>
        {selectedGroupId && selectedGroupCode ? (
          <CodeListPanel groupId={selectedGroupId} groupCode={selectedGroupCode} />
        ) : (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              color: '#999',
              background: '#F0F2F5',
              borderRadius: 8,
              marginTop: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              코드그룹을 선택하세요
            </div>
            <div style={{ fontSize: 14 }}>
              좌측 목록에서 코드그룹을 선택하면 해당 코드 목록이 표시됩니다
            </div>
          </div>
        )}
      </Col>
    </Row>
  )
}
