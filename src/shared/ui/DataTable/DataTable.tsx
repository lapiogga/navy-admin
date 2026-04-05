import type { ProColumns, ProTableProps } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import type { PageRequest, PageResponse } from '@/shared/api/types'

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: ProColumns<T>[]
  request: (params: PageRequest) => Promise<PageResponse<T>>
  rowKey: keyof T & string
  toolBarRender?: ProTableProps<T, PageRequest>['toolBarRender']
  rowSelection?: ProTableProps<T, PageRequest>['rowSelection']
  headerTitle?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  request,
  rowKey,
  toolBarRender,
  rowSelection,
  headerTitle,
}: DataTableProps<T>) {
  return (
    <ProTable<T, PageRequest>
      columns={columns}
      request={async (params) => {
        const res = await request({
          page: (params.current ?? 1) - 1,
          size: params.pageSize ?? 10,
        })
        return { data: res.content, success: true, total: res.totalElements }
      }}
      rowKey={rowKey}
      toolBarRender={toolBarRender}
      rowSelection={rowSelection}
      headerTitle={headerTitle}
      pagination={{ showSizeChanger: true, defaultPageSize: 10 }}
      search={false}
      dateFormatter="string"
    />
  )
}
