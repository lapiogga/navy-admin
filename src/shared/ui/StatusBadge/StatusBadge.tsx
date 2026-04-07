import { Tag } from 'antd'

const DEFAULT_COLOR_MAP: Record<string, string> = {
  승인: 'green',
  완료: 'blue',
  진행: 'cyan',
  대기: 'orange',
  반려: 'red',
  삭제: 'default',
}

export interface StatusBadgeProps {
  status: string
  colorMap?: Record<string, string>
  labelMap?: Record<string, string>
}

export function StatusBadge({ status, colorMap, labelMap }: StatusBadgeProps) {
  const mergedColors = { ...DEFAULT_COLOR_MAP, ...colorMap }
  const label = labelMap?.[status] ?? status
  const color = mergedColors[status] ?? 'default'
  return <Tag color={color} bordered={false}>{label}</Tag>
}
