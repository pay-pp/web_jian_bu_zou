export interface Group {
  id: number
  name: string
  memberCount: number
  onlineCount: number
}

export interface GroupMember {
  id: number
  realName: string
  nickname: string
  firstLoginTime: number
  lastLoginTime: number
  isLeader: boolean
}

export interface NonMember {
  id: number
  realName: string
  nickname: string
  firstLoginTime: number
  lastLoginTime: number
}
