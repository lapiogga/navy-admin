import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1E3A5F',        // 해군 네이비
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F0F2F5',
    borderRadius: 4,
    fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
    },
  },
}
