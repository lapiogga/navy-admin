import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('기본 상태값 텍스트를 렌더링한다', () => {
    render(<StatusBadge status="승인" />)
    expect(screen.getByText('승인')).toBeInTheDocument()
  })

  it('커스텀 labelMap으로 라벨을 변경할 수 있다', () => {
    render(<StatusBadge status="승인" labelMap={{ 승인: 'Approved' }} />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('알 수 없는 상태값도 default 색상으로 렌더링된다', () => {
    render(<StatusBadge status="기타" />)
    expect(screen.getByText('기타')).toBeInTheDocument()
  })

  it('5종 기본 상태값이 모두 렌더링된다', () => {
    const { container } = render(
      <>
        <StatusBadge status="승인" />
        <StatusBadge status="반려" />
        <StatusBadge status="대기" />
        <StatusBadge status="완료" />
        <StatusBadge status="진행" />
      </>,
    )
    expect(container.querySelectorAll('.ant-tag')).toHaveLength(5)
  })
})
