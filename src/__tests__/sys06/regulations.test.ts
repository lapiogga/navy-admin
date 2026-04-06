import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE = resolve(__dirname, '../../pages/sys06-regulations')
const HANDLERS_BASE = resolve(__dirname, '../../shared/api/mocks/handlers')

describe('sys06 MSW 핸들러', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'sys06.ts'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('sys06Handlers를 export한다', () => {
    expect(content).toContain('export const sys06Handlers')
  })

  it('/sys06/regulations 핸들러를 포함한다', () => {
    expect(content).toContain('/api/sys06/regulations')
  })

  it('/sys06/precedents 핸들러를 포함한다', () => {
    expect(content).toContain('/api/sys06/precedents')
  })

  it('/sys06/directives 핸들러를 포함한다', () => {
    expect(content).toContain('/api/sys06/directives')
  })

  it('extends Record<string, unknown>을 포함한다', () => {
    expect(content).toContain('extends Record<string, unknown>')
  })
})

describe('handlers/index.ts', () => {
  const content = readFileSync(resolve(HANDLERS_BASE, 'index.ts'), 'utf-8')

  it('sys06Handlers를 import하고 사용한다', () => {
    expect(content).toContain('sys06Handlers')
  })
})

describe('sys06-regulations index.tsx 라우팅', () => {
  const content = readFileSync(resolve(BASE, 'index.tsx'), 'utf-8')

  it('파일이 존재한다', () => {
    expect(content.length).toBeGreaterThan(0)
  })

  it('sys05-admin-rules import를 포함한다 (재사용 확인)', () => {
    expect(content).toContain('sys05-admin-rules')
  })

  it('common/board import를 포함한다', () => {
    expect(content).toContain('common/board')
  })

  it('auth-group import를 포함한다', () => {
    expect(content).toContain('auth-group')
  })

  it('/sys06/ 경로를 포함한다', () => {
    expect(content).toContain('/sys06/')
  })

  it('Navigate 또는 index redirect를 포함한다', () => {
    expect(content).toMatch(/Navigate|index/)
  })

  it('Route 컴포넌트 8개 이상을 포함한다', () => {
    const routeMatches = content.match(/<Route/g)
    expect(routeMatches).not.toBeNull()
    expect(routeMatches!.length).toBeGreaterThanOrEqual(8)
  })

  it('lazy import를 사용한다', () => {
    expect(content).toContain('lazy')
  })

  it('sysCode 문자열을 포함한다 (sys06 격리 확인)', () => {
    expect(content).toContain('sysCode')
  })
})
