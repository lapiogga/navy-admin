import { Tabs } from 'antd'
import { PermissionGroupPage } from './PermissionGroupPage'
import { MenuPermissionPage } from './MenuPermissionPage'
import { GroupMenuPage } from './GroupMenuPage'
import { GroupUserPage } from './GroupUserPage'
import { GroupUnitPage } from './GroupUnitPage'

export default function AuthGroupIndex() {
  return (
    <Tabs
      type="line"
      defaultActiveKey="group"
      items={[
        { key: 'group', label: '권한그룹', children: <PermissionGroupPage /> },
        { key: 'menu-perm', label: '메뉴별 권한그룹', children: <MenuPermissionPage /> },
        { key: 'group-menu', label: '권한그룹별 메뉴', children: <GroupMenuPage /> },
        { key: 'group-user', label: '권한그룹별 사용자', children: <GroupUserPage /> },
        { key: 'group-unit', label: '권한그룹별 부대', children: <GroupUnitPage /> },
      ]}
    />
  )
}
