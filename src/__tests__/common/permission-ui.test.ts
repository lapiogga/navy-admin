import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const PAGE_DIR = path.resolve(__dirname, '../../pages/common/auth-group')

function readPage(filename: string): string {
  return readFileSync(path.join(PAGE_DIR, filename), 'utf-8')
}

describe('권한관리 UI 페이지 export', () => {
  it('auth-group/index.tsx 파일이 존재하고 default export를 포함한다', () => {
    const content = readPage('index.tsx')
    expect(content).toContain('export default function AuthGroupIndex')
    expect(content).toContain('type="line"')
    expect(content).toContain('Tabs')
  })

  it('PermissionGroupPage가 named export된다', () => {
    const content = readPage('PermissionGroupPage.tsx')
    expect(content).toContain('export function PermissionGroupPage')
  })

  it('MenuPermissionPage가 named export된다', () => {
    const content = readPage('MenuPermissionPage.tsx')
    expect(content).toContain('export function MenuPermissionPage')
  })

  it('GroupMenuPage가 named export된다', () => {
    const content = readPage('GroupMenuPage.tsx')
    expect(content).toContain('export function GroupMenuPage')
  })

  it('GroupUserPage가 named export된다', () => {
    const content = readPage('GroupUserPage.tsx')
    expect(content).toContain('export function GroupUserPage')
  })

  it('GroupUnitPage가 named export된다', () => {
    const content = readPage('GroupUnitPage.tsx')
    expect(content).toContain('export function GroupUnitPage')
  })
})

describe('권한관리 UI 컴포넌트 내용 검증', () => {
  it('PermissionGroupPage에 DataTable과 CrudForm이 있다', () => {
    const content = readPage('PermissionGroupPage.tsx')
    expect(content).toContain('DataTable<PermissionGroup')
    expect(content).toContain('CrudForm')
    expect(content).toContain('해당 그룹에 배정된 사용자의 권한이 모두 해제됩니다')
    expect(content).toContain('저장되었습니다')
  })

  it('MenuPermissionPage에 Tree와 전체 선택이 있다', () => {
    const content = readPage('MenuPermissionPage.tsx')
    expect(content).toContain('Tree')
    expect(content).toContain('SUBSYSTEM_MENUS')
    expect(content).toContain('checkable')
    expect(content).toContain('전체 선택')
  })

  it('GroupMenuPage에 Tree와 전체 선택이 있다', () => {
    const content = readPage('GroupMenuPage.tsx')
    expect(content).toContain('Tree')
    expect(content).toContain('전체 선택')
  })

  it('GroupUserPage에 DataTable과 groupUserApi가 있다', () => {
    const content = readPage('GroupUserPage.tsx')
    expect(content).toContain('DataTable<GroupUser')
    expect(content).toContain('groupUserApi')
  })

  it('GroupUnitPage에 DataTable과 groupUnitApi가 있다', () => {
    const content = readPage('GroupUnitPage.tsx')
    expect(content).toContain('DataTable<GroupUnit')
    expect(content).toContain('groupUnitApi')
  })
})
