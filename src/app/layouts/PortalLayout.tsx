import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout } from '@ant-design/pro-components'
import type { MenuDataItem } from '@ant-design/pro-components'
import { LogoutOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons'
import { Dropdown } from 'antd'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useUiStore } from '@/features/auth/store/uiStore'
import { ROUTES } from '@/shared/config/routes'
import { SUBSYSTEM_MENUS } from '@/entities/subsystem/menus'
import { SUBSYSTEM_META } from '@/entities/subsystem/config'

/**
 * 서브시스템 전용 레이아웃.
 * - 상단 헤더: 대메뉴 (풀다운)
 * - 좌측 사이드바: 소메뉴 (선택된 대메뉴의 하위 메뉴)
 * - layout="mix" + splitMenus로 자동 분리
 */
export function SubsystemProLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)

  // URL에서 서브시스템 코드 추출 (/sys01/... → sys01)
  const sysCode = location.pathname.split('/')[1] ?? ''
  const sysMeta = SUBSYSTEM_META[sysCode]
  const menuData = SUBSYSTEM_MENUS[sysCode] ?? []

  const handleLogout = () => {
    logout()
    if (window.opener) {
      window.close()
    } else {
      navigate(ROUTES.LOGIN)
    }
  }

  const handleGoPortal = () => {
    if (window.opener) {
      window.opener.focus()
      window.close()
    } else {
      navigate(ROUTES.PORTAL)
    }
  }

  return (
    <ProLayout
      title={sysMeta?.name ?? '서브시스템'}
      logo={false}
      layout="mix"
      splitMenus
      fixSiderbar
      fixedHeader
      collapsed={collapsed}
      onCollapse={setSidebarCollapsed}
      location={{ pathname: location.pathname }}
      route={{ path: `/${sysCode}`, children: menuData }}
      menuItemRender={(item: MenuDataItem, dom: React.ReactNode) => (
        <div onClick={() => item.path && navigate(item.path)}>{dom}</div>
      )}
      subMenuItemRender={(_item: MenuDataItem, dom: React.ReactNode) => dom}
      breadcrumbRender={() => null}
      onMenuHeaderClick={() => navigate(`/${sysCode}`)}
      avatarProps={{
        src: undefined,
        icon: <UserOutlined />,
        title: user ? `${user.rank} ${user.name} (${user.unit})` : '',
        render: (_props: unknown, dom: React.ReactNode) => (
          <Dropdown
            menu={{
              items: [
                { key: 'portal', icon: <HomeOutlined />, label: '메인포탈로 돌아가기', onClick: handleGoPortal },
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
