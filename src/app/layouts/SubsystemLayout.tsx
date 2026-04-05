import { Outlet } from 'react-router-dom'
import { PageContainer } from '@ant-design/pro-components'

interface SubsystemLayoutProps {
  title: string
}

export function SubsystemLayout({ title }: SubsystemLayoutProps) {
  return (
    <PageContainer title={title}>
      <Outlet />
    </PageContainer>
  )
}
