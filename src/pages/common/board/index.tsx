import { useState } from 'react'
import { Tabs } from 'antd'
import { PageContainer } from '@ant-design/pro-components'
import { BoardConfigPage } from './BoardConfigPage'
import { BoardCategoryPage } from './BoardCategoryPage'
import { BoardListPage } from './BoardListPage'
import { BoardAdminPage } from './BoardAdminPage'
import { BoardUserPage } from './BoardUserPage'
import { BoardUnitPage } from './BoardUnitPage'

export default function BoardIndex() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)

  return (
    <PageContainer title="공통게시판">
      <Tabs
        type="line"
        defaultActiveKey="config"
        items={[
          {
            key: 'config',
            label: '게시판 설정',
            children: <BoardConfigPage onSelectBoard={setSelectedBoardId} />,
          },
          {
            key: 'category',
            label: '카테고리관리',
            children: <BoardCategoryPage boardId={selectedBoardId} />,
          },
          {
            key: 'posts',
            label: '게시글관리',
            children: <BoardListPage boardId={selectedBoardId} />,
          },
          {
            key: 'admin',
            label: '관리자설정',
            children: <BoardAdminPage boardId={selectedBoardId} />,
          },
          {
            key: 'user',
            label: '사용자설정',
            children: <BoardUserPage boardId={selectedBoardId} />,
          },
          {
            key: 'unit',
            label: '부대설정',
            children: <BoardUnitPage boardId={selectedBoardId} />,
          },
        ]}
      />
    </PageContainer>
  )
}
