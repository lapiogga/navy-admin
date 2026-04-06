import { useState } from 'react'
import { Select, Button, Space, Tree, message, Spin, Row, Col } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TreeDataNode } from 'antd'
import type { Key } from 'rc-tree/lib/interface'
import { permissionGroupApi, menuPermissionApi } from '@/entities/permission/api'
import { SUBSYSTEM_MENUS } from '@/entities/subsystem/menus'
import { SUBSYSTEM_META } from '@/entities/subsystem/config'

/** SUBSYSTEM_MENUS를 antd Tree 데이터로 변환 */
function buildTreeData(): TreeDataNode[] {
  return Object.entries(SUBSYSTEM_MENUS).map(([sysCode, menus]) => ({
    key: sysCode,
    title: SUBSYSTEM_META[sysCode]?.name ?? sysCode,
    children: menus.map((menu) => ({
      key: menu.path ?? sysCode,
      title: menu.name,
      children: menu.children?.map((child) => ({
        key: child.path ?? '',
        title: child.name,
      })),
    })),
  }))
}

/** Tree에서 모든 leaf key 추출 */
function getAllLeafKeys(nodes: TreeDataNode[]): string[] {
  const keys: string[] = []
  const traverse = (nodeList: TreeDataNode[]) => {
    for (const node of nodeList) {
      if (node.children && node.children.length > 0) {
        traverse(node.children as TreeDataNode[])
      } else {
        keys.push(String(node.key))
      }
    }
  }
  traverse(nodes)
  return keys
}

const treeData = buildTreeData()
const allLeafKeys = getAllLeafKeys(treeData)

export function MenuPermissionPage() {
  const queryClient = useQueryClient()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['permission-groups', 'all'],
    queryFn: () => permissionGroupApi.list({ page: 0, size: 100 }),
  })

  const { isLoading: permsLoading } = useQuery({
    queryKey: ['menu-permissions', 'byGroup', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return null
      const res = await menuPermissionApi.getByGroup(selectedGroupId)
      // apiClient interceptor가 response.data를 추출하므로 res는 ApiResult 또는 배열일 수 있음
      const perms = (res as { data?: { menuPath: string }[] }).data ?? (res as unknown as { menuPath: string }[])
      const paths = Array.isArray(perms) ? perms.map((p) => p.menuPath) : []
      setCheckedKeys(paths)
      return perms
    },
    enabled: !!selectedGroupId,
  })

  const assignMutation = useMutation({
    mutationFn: (menuPaths: string[]) =>
      menuPermissionApi.assign(selectedGroupId!, menuPaths),
    onSuccess: () => {
      message.success('저장되었습니다')
      queryClient.invalidateQueries({ queryKey: ['menu-permissions', 'byGroup', selectedGroupId] })
    },
    onError: () => {
      message.error('저장에 실패했습니다. 입력 내용을 확인하고 다시 시도하세요')
    },
  })

  const groupOptions = (groupsData?.content ?? []).map((g) => ({
    label: `${g.groupName} (${g.groupCode})`,
    value: g.id,
  }))

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId)
    setCheckedKeys([])
  }

  const handleCheck = (checked: Key[] | { checked: Key[]; halfChecked: Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked
    setCheckedKeys(keys.map(String))
  }

  const handleSelectAll = () => {
    setCheckedKeys(allLeafKeys)
  }

  const handleDeselectAll = () => {
    setCheckedKeys([])
  }

  const handleSave = () => {
    if (!selectedGroupId) {
      message.warning('권한그룹을 선택하세요')
      return
    }
    assignMutation.mutate(checkedKeys)
  }

  return (
    <Row gutter={24}>
      <Col span={24} style={{ marginBottom: 16 }}>
        <Space>
          <span style={{ fontWeight: 500 }}>권한그룹:</span>
          <Select
            style={{ width: 280 }}
            placeholder="권한그룹을 선택하세요"
            options={groupOptions}
            loading={groupsLoading}
            onChange={handleGroupChange}
            value={selectedGroupId}
          />
        </Space>
      </Col>
      {selectedGroupId && (
        <Col span={24}>
          <div style={{ marginBottom: 8 }}>
            <Space>
              <Button size="small" onClick={handleSelectAll}>전체 선택</Button>
              <Button size="small" onClick={handleDeselectAll}>전체 해제</Button>
              <Button
                type="primary"
                size="small"
                onClick={handleSave}
                loading={assignMutation.isPending}
              >
                저장
              </Button>
            </Space>
          </div>
          <Spin spinning={permsLoading}>
            <div style={{ maxHeight: 500, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 12 }}>
              <Tree
                checkable
                checkStrictly={false}
                defaultExpandAll={false}
                treeData={treeData}
                checkedKeys={checkedKeys}
                onCheck={handleCheck}
              />
            </div>
          </Spin>
        </Col>
      )}
    </Row>
  )
}
