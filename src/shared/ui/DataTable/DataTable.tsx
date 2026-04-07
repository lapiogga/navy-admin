import { useState } from 'react'
import { Input } from 'antd'
import type React from 'react'
import type { ProColumns, ProTableProps, ActionType } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import type { ListParams, PageResponse } from '@/shared/api/types'

/** 군청색 테이블 스타일: 최상단 2px, 최하단 1px */
const NAVY_TABLE_STYLE: React.CSSProperties = {
  borderTop: '2px solid #003366',
}

const NAVY_TABLE_CLASS = 'navy-bordered-table'

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: ProColumns<T>[]
  request: (params: ListParams) => Promise<PageResponse<T>>
  rowKey: keyof T & string
  toolBarRender?: ProTableProps<T, ListParams>['toolBarRender']
  rowSelection?: ProTableProps<T, ListParams>['rowSelection']
  headerTitle?: string
  onRow?: (record: T) => { onClick?: () => void; style?: React.CSSProperties }
  actionRef?: React.Ref<ActionType>
  searchable?: boolean
  searchPlaceholder?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  request,
  rowKey,
  toolBarRender,
  rowSelection,
  headerTitle,
  onRow,
  actionRef,
  searchable = false,
  searchPlaceholder = '검색어를 입력하세요',
}: DataTableProps<T>) {
  const [keyword, setKeyword] = useState('')

  return (
    <ProTable<T, ListParams>
      columns={columns}
      params={{ keyword } as ListParams}
      request={async (params) => {
        const raw = await request({
          page: (params.current ?? 1) - 1,
          size: params.pageSize ?? 10,
          keyword: params.keyword || undefined,
        })
        // ApiResult<PageResponse> 래핑 자동 처리
        const res = (raw as unknown as { data?: PageResponse<T> }).data?.content !== undefined
          ? (raw as unknown as { data: PageResponse<T> }).data
          : raw
        return { data: res.content ?? [], success: true, total: res.totalElements ?? 0 }
      }}
      rowKey={rowKey}
      toolBarRender={(...args) => {
        const custom = toolBarRender?.(...args) ?? []
        if (!searchable) return custom
        return [
          <Input.Search
            key="__keyword"
            placeholder={searchPlaceholder}
            allowClear
            onSearch={(v) => setKeyword(v)}
            style={{ width: 280 }}
          />,
          ...custom,
        ]
      }}
      rowSelection={rowSelection}
      headerTitle={headerTitle}
      pagination={{ showSizeChanger: true, defaultPageSize: 10 }}
      search={false}
      dateFormatter="string"
      options={{ density: false }}
      onRow={onRow}
      actionRef={actionRef}
      className={NAVY_TABLE_CLASS}
      style={NAVY_TABLE_STYLE}
    />
  )
}
