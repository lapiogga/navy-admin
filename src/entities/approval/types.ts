export interface Approver {
  userId: string
  userName: string
  userRank: string
  userUnit: string
  order: number // 결재 순서 (1, 2, 3...)
}

export interface ApprovalLine {
  id: string
  lineName: string // 결재선 이름 (예: '기본 결재선', '부대장 직속 결재선')
  description: string
  approvers: Approver[] // 순서 있는 결재자 배열
  createdBy: string // 등록자 ID
  createdAt: string
  updatedAt: string
}
