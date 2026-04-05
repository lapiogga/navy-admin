import { useState } from 'react'
import { Row, Col, Tree, Card, Form, Input, Select, Button, Modal, message, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DataNode } from 'antd/es/tree'
import { apiClient } from '@/shared/api/client'
import type { ApiResult } from '@/shared/api/types'

// ===== 타입 =====
interface MenuItem {
  id: string
  menuName: string
  menuPath: string
  parentId: string | null
  subsystemCode: string
  sortOrder: number
  useYn: string
}

// ===== API =====
const menuApi = {
  list: (): Promise<ApiResult<MenuItem[]>> =>
    apiClient.get('/common/menus') as Promise<ApiResult<MenuItem[]>>,
  create: (data: Omit<MenuItem, 'id'>): Promise<ApiResult<MenuItem>> =>
    apiClient.post('/common/menus', data) as Promise<ApiResult<MenuItem>>,
  update: (id: string, data: Partial<MenuItem>): Promise<ApiResult<MenuItem>> =>
    apiClient.put(`/common/menus/${id}`, data) as Promise<ApiResult<MenuItem>>,
  delete: (id: string): Promise<ApiResult<void>> =>
    apiClient.delete(`/common/menus/${id}`) as Promise<ApiResult<void>>,
}

// ===== 플랫 배열 → Tree DataNode 변환 =====
function buildTree(items: MenuItem[]): DataNode[] {
  const map = new Map<string, DataNode>()
  items.forEach((item) => {
    map.set(item.id, {
      key: item.id,
      title: `${item.menuName} (${item.menuPath})`,
      children: [],
    })
  })

  const roots: DataNode[] = []
  items.forEach((item) => {
    const node = map.get(item.id)!
    if (item.parentId && map.has(item.parentId)) {
      ;(map.get(item.parentId)!.children as DataNode[]).push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

// ===== 컴포넌트 =====
export function MenuManagementPage() {
  const queryClient = useQueryClient()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const { data: menuData } = useQuery({
    queryKey: ['common-menus'],
    queryFn: menuApi.list,
  })

  const menus: MenuItem[] = (menuData as ApiResult<MenuItem[]> | undefined)?.data ?? []
  const treeData = buildTree(menus)
  const selectedMenu = menus.find((m) => m.id === selectedKey) ?? null

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItem> }) => menuApi.update(id, data),
    onSuccess: () => {
      message.success('저장되었습니다')
      queryClient.invalidateQueries({ queryKey: ['common-menus'] })
    },
    onError: () => { message.error('저장에 실패했습니다') },
  })

  const createMutation = useMutation({
    mutationFn: menuApi.create,
    onSuccess: () => {
      message.success('등록되었습니다')
      setAddModalOpen(false)
      addForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['common-menus'] })
    },
    onError: () => { message.error('등록에 실패했습니다') },
  })

  const handleEditSave = () => {
    if (!selectedKey) return
    editForm.validateFields().then((values: Partial<MenuItem>) => {
      updateMutation.mutate({ id: selectedKey, data: values })
    })
  }

  const handleAdd = () => {
    addForm.validateFields().then((values: Omit<MenuItem, 'id'>) => {
      createMutation.mutate({ ...values, sortOrder: values.sortOrder ?? menus.length + 1 })
    })
  }

  // 선택된 메뉴 변경 시 폼 초기화
  const handleSelect = (keys: React.Key[]) => {
    const key = keys[0] as string
    setSelectedKey(key ?? null)
    const menu = menus.find((m) => m.id === key)
    if (menu) {
      editForm.setFieldsValue({
        menuName: menu.menuName,
        menuPath: menu.menuPath,
        sortOrder: menu.sortOrder,
        useYn: menu.useYn,
      })
    } else {
      editForm.resetFields()
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
          메뉴 추가
        </Button>
      </Space>
      <Row gutter={16}>
        <Col span={10}>
          <Card title="메뉴 트리" size="small">
            <Tree
              treeData={treeData}
              selectedKeys={selectedKey ? [selectedKey] : []}
              onSelect={handleSelect}
              defaultExpandAll
            />
          </Card>
        </Col>
        <Col span={14}>
          <Card title="메뉴 상세 / 수정" size="small">
            {selectedMenu ? (
              <Form form={editForm} layout="vertical" initialValues={selectedMenu}>
                <Form.Item name="menuName" label="메뉴명" rules={[{ required: true, message: '메뉴명을 입력하세요' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="menuPath" label="경로" rules={[{ required: true, message: '경로를 입력하세요' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="sortOrder" label="정렬 순서">
                  <Input type="number" />
                </Form.Item>
                <Form.Item name="useYn" label="사용여부">
                  <Select options={[{ label: '사용', value: 'Y' }, { label: '미사용', value: 'N' }]} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={handleEditSave} loading={updateMutation.isPending}>
                    저장
                  </Button>
                </Form.Item>
              </Form>
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
                좌측 트리에서 메뉴를 선택하세요
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 메뉴 추가 모달 */}
      <Modal
        title="메뉴 추가"
        open={addModalOpen}
        onOk={handleAdd}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields() }}
        okText="등록"
        cancelText="취소"
        okButtonProps={{ type: 'primary', loading: createMutation.isPending }}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="parentId" label="상위 메뉴">
            <Select
              allowClear
              placeholder="최상위 메뉴로 등록"
              options={menus
                .filter((m) => !m.parentId)
                .map((m) => ({ label: m.menuName, value: m.id }))}
            />
          </Form.Item>
          <Form.Item name="menuName" label="메뉴명" rules={[{ required: true, message: '메뉴명을 입력하세요' }]}>
            <Input placeholder="메뉴 이름" />
          </Form.Item>
          <Form.Item name="menuPath" label="경로" rules={[{ required: true, message: '경로를 입력하세요' }]}>
            <Input placeholder="/common/..." />
          </Form.Item>
          <Form.Item name="subsystemCode" label="서브시스템">
            <Input placeholder="예: SYS99" />
          </Form.Item>
          <Form.Item name="useYn" label="사용여부" initialValue="Y">
            <Select options={[{ label: '사용', value: 'Y' }, { label: '미사용', value: 'N' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
