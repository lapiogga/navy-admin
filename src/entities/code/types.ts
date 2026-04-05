export interface CodeGroup {
  id: string
  groupCode: string
  groupName: string
  description: string
  useYn: string
  createdAt: string
  updatedAt: string
}

export interface Code {
  id: string
  groupId: string
  groupCode: string
  codeValue: string
  codeName: string
  sortOrder: number
  useYn: string
  description: string
  createdAt: string
}

export interface CodeOption {
  label: string
  value: string
}
