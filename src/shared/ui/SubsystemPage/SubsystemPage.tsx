import { useLocation } from 'react-router-dom'
import { Card, Typography, Breadcrumb } from 'antd'
import { SUBSYSTEM_MENUS } from '@/entities/subsystem/menus'
import { SUBSYSTEM_META } from '@/entities/subsystem/config'
import type { MenuDataItem } from '@ant-design/pro-components'

const { Title, Text } = Typography

/**
 * 서브시스템 공통 플레이스홀더 페이지.
 * 현재 URL 경로에 맞는 대메뉴/소메뉴 이름을 표시한다.
 */
export function SubsystemPage() {
  const { pathname } = useLocation()
  const sysCode = pathname.split('/')[1] ?? ''
  const sysMeta = SUBSYSTEM_META[sysCode]
  const menus = SUBSYSTEM_MENUS[sysCode] ?? []

  const { mainMenu, subMenu } = findCurrentMenu(pathname, menus)

  return (
    <div>
      <Breadcrumb
        items={[
          { title: sysMeta?.name ?? sysCode },
          ...(mainMenu ? [{ title: mainMenu }] : []),
          ...(subMenu ? [{ title: subMenu }] : []),
        ]}
        style={{ marginBottom: 16 }}
      />
      <Card>
        <Title level={4}>{subMenu ?? mainMenu ?? sysMeta?.name ?? '대시보드'}</Title>
        <Text type="secondary">해당 화면은 추후 개발 예정입니다.</Text>
      </Card>
    </div>
  )
}

function findCurrentMenu(
  pathname: string,
  menus: MenuDataItem[],
): { mainMenu: string | null; subMenu: string | null } {
  for (const menu of menus) {
    if (menu.children) {
      for (const child of menu.children) {
        if (child.path === pathname) {
          return { mainMenu: menu.name ?? null, subMenu: child.name ?? null }
        }
      }
    }
    if (menu.path === pathname) {
      return { mainMenu: menu.name ?? null, subMenu: null }
    }
  }
  return { mainMenu: null, subMenu: null }
}
