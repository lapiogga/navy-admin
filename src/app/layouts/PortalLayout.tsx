import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout } from '@ant-design/pro-components'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Dropdown, Avatar } from 'antd'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useUiStore } from '@/features/auth/store/uiStore'
import { SUBSYSTEM_META } from '@/entities/subsystem/config'
import { ROUTES } from '@/shared/config/routes'

// Avatar import 사용 여부 lint 방지용 (실제 avatarProps render에서 dom 파라미터로 처리됨)
void Avatar

const menuData = [
  { path: ROUTES.PORTAL, name: '대시보드' },
  ...Object.values(SUBSYSTEM_META).map((sys) => ({
    path: sys.path,
    name: sys.name,
  })),
  {
    path: ROUTES.COMMON.ROOT,
    name: '공통 기능',
    children: [
      { path: ROUTES.COMMON.AUTH_GROUP, name: '권한관리' },
      { path: ROUTES.COMMON.CODE_MGMT, name: '코드관리' },
      { path: ROUTES.COMMON.BOARD, name: '공통게시판' },
      { path: ROUTES.COMMON.APPROVAL, name: '결재관리' },
      { path: ROUTES.COMMON.SYSTEM_MGR, name: '시스템관리' },
    ],
  },
]

export function PortalLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <ProLayout
      title="해병대 행정포탈"
      logo={false}
      layout="mix"
      fixSiderbar
      collapsed={collapsed}
      onCollapse={setSidebarCollapsed}
      location={{ pathname: location.pathname }}
      route={{ path: '/', routes: menuData }}
      menuItemRender={(item, dom) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      avatarProps={{
        src: undefined,
        icon: <UserOutlined />,
        title: user ? `${user.rank} ${user.name} (${user.unit})` : '',
        render: (_props, dom) => (
          <Dropdown
            menu={{
              items: [
                { key: 'logout', icon: <LogoutOutlined />, label: '로그아웃', onClick: handleLogout },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
    >
      <Outlet />
    </ProLayout>
  )
}
