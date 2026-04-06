import { useState } from 'react'
import { Tree, Table, Button, Card, Row, Col, message } from 'antd'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/apiClient'
import type { ApiResult } from '@/shared/api/types'

interface UnitTreeNode {
  key: string
  title: string
  children?: UnitTreeNode[]
}

interface UnitData {
  tree: UnitTreeNode[]
  selectedIds: string[]
}

// 트리에서 노드 제목 조회
function findNodeTitle(tree: UnitTreeNode[], key: string): string {
  for (const node of tree) {
    if (node.key === key) return node.title
    if (node.children) {
      const found = findNodeTitle(node.children, key)
      if (found) return found
    }
  }
  return key
}

export default function InspectionUnitPage() {
  const queryClient = useQueryClient()
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['sys17', 'units'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResult<UnitData>>('/sys17/units')
      const unitData = res.data.data
      setCheckedKeys(unitData.selectedIds)
      return unitData
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (unitIds: string[]) => {
      await apiClient.put('/sys17/units', { unitIds })
    },
    onSuccess: () => {
      message.success('검열부대가 저장되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys17', 'units'] })
    },
    onError: () => {
      message.error('저장에 실패했습니다.')
    },
  })

  const handleCheck = (keys: string[] | { checked: string[]; halfChecked: string[] }) => {
    const checkedArr = Array.isArray(keys) ? keys : keys.checked
    setCheckedKeys(checkedArr)
  }

  const handleRemove = (key: string) => {
    setCheckedKeys((prev) => prev.filter((k) => k !== key))
  }

  const handleSave = () => {
    saveMutation.mutate(checkedKeys)
  }

  const selectedUnits = checkedKeys.map((key) => ({
    key,
    unitName: data ? findNodeTitle(data.tree, key) : key,
  }))

  const columns = [
    {
      title: '부대명',
      dataIndex: 'unitName',
      key: 'unitName',
    },
    {
      title: '삭제',
      key: 'action',
      width: 80,
      render: (_: unknown, record: { key: string }) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.key)}
          size="small"
        />
      ),
    },
  ]

  return (
    <PageContainer title="검열부대 지정">
      <Row gutter={16}>
        <Col span={12}>
          <Card title="조직도 트리" loading={isLoading}>
            {data && (
              <Tree
                checkable
                checkedKeys={checkedKeys}
                onCheck={handleCheck}
                treeData={data.tree}
                defaultExpandAll
              />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={`선택된 검열부대 (${selectedUnits.length}개)`}
            extra={
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saveMutation.isPending}
              >
                저장
              </Button>
            }
          >
            <Table
              dataSource={selectedUnits}
              columns={columns}
              rowKey="key"
              pagination={false}
              size="small"
              locale={{ emptyText: '선택된 부대가 없습니다' }}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}
