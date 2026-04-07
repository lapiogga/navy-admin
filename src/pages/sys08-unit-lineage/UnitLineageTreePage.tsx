import { useState, useRef } from 'react'
import { Card, Tree, Modal, Button, Form, Input, DatePicker, Upload, message, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import type { TreeDataNode } from 'antd'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { apiClient } from '@/shared/api/client'
import type { PageRequest, PageResponse, ApiResult } from '@/shared/api/types'
import type { UnitTreeNode, UnitLineage } from '@/shared/api/mocks/handlers/sys08-unit-lineage'
import dayjs from 'dayjs'

const { TextArea } = Input

async function fetchUnitTree(): Promise<UnitTreeNode[]> {
  const res = await apiClient.get<never, ApiResult<UnitTreeNode[]>>('/sys08/unit-tree')
  return (res as ApiResult<UnitTreeNode[]>).data ?? (res as unknown as UnitTreeNode[])
}

async function fetchLineage(params: PageRequest & { unitId?: string }): Promise<PageResponse<UnitLineage>> {
  const res = await apiClient.get<never, ApiResult<PageResponse<UnitLineage>>>('/sys08/lineage', { params })
  return (res as ApiResult<PageResponse<UnitLineage>>).data ?? (res as unknown as PageResponse<UnitLineage>)
}

export default function UnitLineageTreePage() {
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>()
  const [selectedUnitName, setSelectedUnitName] = useState<string>('부대를 선택하세요')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<UnitLineage | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<UnitLineage | undefined>()
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()
  const queryClient = useQueryClient()

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ['sys08', 'unit-tree'],
    queryFn: fetchUnitTree,
  })

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<UnitLineage>) => {
      if (editTarget) {
        return apiClient.put(`/sys08/lineage/${editTarget.id}`, values)
      }
      return apiClient.post('/sys08/lineage', { ...values, unitId: selectedUnit })
    },
    onSuccess: () => {
      message.success(editTarget ? '수정되었습니다.' : '등록되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08', 'lineage', selectedUnit] })
      actionRef.current?.reload()
      setFormOpen(false)
      setEditTarget(undefined)
      form.resetFields()
    },
    onError: () => message.error('처리에 실패했습니다.'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/sys08/lineage/${id}`),
    onSuccess: () => {
      message.success('삭제되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['sys08', 'lineage', selectedUnit] })
      actionRef.current?.reload()
      setDeleteTarget(undefined)
    },
    onError: () => message.error('삭제에 실패했습니다.'),
  })

  const columns: ProColumns<UnitLineage>[] = [
    { title: '계승번호', dataIndex: 'lineageNo', width: 120 },
    { title: '부대명', dataIndex: 'unitName', width: 160 },
    { title: '창설일자', dataIndex: 'establishDate', width: 120 },
    { title: '소재지 주소', dataIndex: 'address', width: 180, ellipsis: true },
    { title: '관련기관', dataIndex: 'relatedOrg', ellipsis: true },
    {
      title: '관리',
      width: 110,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditTarget(record)
              form.setFieldsValue({
                ...record,
                establishDate: record.establishDate ? dayjs(record.establishDate) : undefined,
              })
              setFormOpen(true)
            }}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteTarget(record)}
          />
        </Space>
      ),
    },
  ]

  return (
    <PageContainer title="제원/계승부대 관리">
      <div style={{ display: 'flex', gap: 16 }}>
        {/* 좌측 부대 트리 */}
        <Card
          title="부대 계층"
          style={{ width: 280, flexShrink: 0, height: 'fit-content' }}
          loading={treeLoading}
        >
          <Tree
            treeData={treeData as TreeDataNode[]}
            onSelect={(selectedKeys, info) => {
              if (selectedKeys.length > 0) {
                setSelectedUnit(String(selectedKeys[0]))
                setSelectedUnitName(String((info.node as TreeDataNode).title ?? ''))
                actionRef.current?.reload()
              }
            }}
            defaultExpandAll
          />
        </Card>

        {/* 우측 계승관계 DataTable */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>{selectedUnitName}</strong>
            {selectedUnit && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditTarget(undefined)
                  form.resetFields()
                  setFormOpen(true)
                }}
              >
                계승관계 등록
              </Button>
            )}
          </div>

          <DataTable<UnitLineage>
            columns={columns}
            request={(params) => fetchLineage({ ...params, unitId: selectedUnit })}
            rowKey="id"
            actionRef={actionRef}
            headerTitle="제원/계승부대 목록"
          />
        </div>
      </div>

      {/* 등록/수정 모달 - CSV 입력값 전체 반영 (R1 규칙) */}
      <Modal
        title={editTarget ? '계승관계 수정' : '계승관계 등록'}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false)
          setEditTarget(undefined)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText={editTarget ? '수정' : '등록'}
        confirmLoading={saveMutation.isPending}
        destroyOnClose
        width={650}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const payload = {
              ...values,
              establishDate: values.establishDate?.format?.('YYYY-MM-DD') ?? values.establishDate,
            }
            saveMutation.mutate(payload)
          }}
        >
          <Form.Item name="lineageNo" label="계승번호" rules={[{ required: true, message: '계승번호를 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="unitName" label="부대명" rules={[{ required: true, message: '부대명을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="establishDate" label="창설일자" rules={[{ required: true, message: '창설일자를 입력하세요' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="relatedBasis" label="관련근거">
            <Input />
          </Form.Item>
          <Form.Item name="mission" label="임무 및 기능">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="address" label="소재지 주소">
            <Input />
          </Form.Item>
          <Form.Item name="buildingStatus" label="건물현황">
            <Input />
          </Form.Item>
          <Form.Item name="landScale" label="대지규모">
            <Input />
          </Form.Item>
          <Form.Item name="relatedOrg" label="관련기관">
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label="기타 참고사항">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item label="부대본관 사진(첨부파일)">
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
              <Button icon={<UploadOutlined />}>사진 선택</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title="삭제 확인"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(undefined)}
        onOk={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        okText="삭제"
        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
        cancelText="취소"
      >
        <p>'{deleteTarget?.unitName}' 계승관계를 삭제하시겠습니까?</p>
      </Modal>
    </PageContainer>
  )
}
