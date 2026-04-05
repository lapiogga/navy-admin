import { Tabs } from 'antd'
import { SystemManagerPage } from './SystemManagerPage'
import { MenuManagementPage } from './MenuManagementPage'
import { MessageManagementPage } from './MessageManagementPage'
import { AccessLogPage } from './AccessLogPage'
import { ErrorLogPage } from './ErrorLogPage'

export default function SystemMgrIndex() {
  return (
    <Tabs
      type="line"
      defaultActiveKey="manager"
      items={[
        { key: 'manager', label: '체계담당자', children: <SystemManagerPage /> },
        { key: 'menu', label: '메뉴관리', children: <MenuManagementPage /> },
        { key: 'message', label: '메시지관리', children: <MessageManagementPage /> },
        { key: 'access-log', label: '접속로그', children: <AccessLogPage /> },
        { key: 'error-log', label: '장애로그', children: <ErrorLogPage /> },
      ]}
    />
  )
}
