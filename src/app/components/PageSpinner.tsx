import { Spin } from 'antd'

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spin size="large" tip="로딩 중..." />
    </div>
  )
}
