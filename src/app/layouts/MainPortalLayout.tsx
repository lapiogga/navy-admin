import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Dropdown, Typography, Space, message } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/features/auth/store/authStore'
import { ROUTES } from '@/shared/config/routes'

const { Header, Content } = Layout
const { Text } = Typography

export function MainPortalLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
    message.success('로그아웃 되었습니다')
  }

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-6" style={{ background: '#001529' }}>
        <Text strong style={{ color: '#fff', fontSize: 16 }}>
          해군 행정포탈
        </Text>
        <Dropdown
          menu={{
            items: [
              { key: 'logout', icon: <LogoutOutlined />, label: '로그아웃', onClick: handleLogout },
            ],
          }}
        >
          <Space style={{ color: '#fff', cursor: 'pointer' }}>
            <UserOutlined />
            <span>{user ? `${user.rank} ${user.name} (${user.unit})` : ''}</span>
          </Space>
        </Dropdown>
      </Header>
      <Content className="p-6" style={{ background: '#f0f2f5' }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
