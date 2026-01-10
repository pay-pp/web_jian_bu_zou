import { request } from '@/utils/request'

// ========== 类型定义 ==========
export interface UnionInfo {
  id: number //工会id，和后台java的domain对应
  name: string //和后台java的domain对应
  unionCode: string //微信用户登录码，微信用户根据登录码将登入对应工会组织
  unionCount: number //自定义数据；把所有用户unionin为工会id的人查出总数
  rewardAmount: number //和后台java的domain对应；每月奖励钱数；可修改
  groupList: GroupInfo[] //工会所属的小组列表，展示所有工会小组名称和对应小组人数（包括“未加入小组”信息，即groupId为空的微信用户）
  notice: string //和后台java的domain对应；工会对应的公告信息，就一个；可修改，放最底下呈现一个编辑的公告栏样式
}

export interface GroupInfo {
  groupId: number | null //小组id，和后台java的domain（class UnionInfo）对应，null表示"未加入小组"
  groupName: string //工会小组名称
  membersList?: GroupMember[] //小组成员列表
  members?: GroupMember[] //兼容旧字段
  memberCount: number //新增字段，展示小组人员数量
}

export interface GroupMember {
  openid: string //对应后台java的domain的class WxUser 的openid
  name: string //对应后台java的domain的class WxUser的name
  wxname: string //对应后台java的domain的class WxUser的wxname
  role: number // 小组内角色(1:成员, 2:组长)；对应 java的domain的  class GroupMember的role
  status: number //对应后台java的domain的class WxUser的用户状态 status
  createTime: string //  对应后台java的domain的class WxUser的 createTime
  updateTime: string //对应后台java的domain的class WxUser的 updateTime
  operatorOpenid: string //如果是在管理页面操作operatorOpenid为当前管理员登录名+操作当前时间；在微信小程序操作则为微信用户的openid

  //status操作逻辑，只会在管理页面设置状态，设置为“0：禁用”，则需要将该用户移出工会小组，“未加入小组”那一组里面设置为“0”
}

// ========== API接口 ==========

/**
 * 获取工会信息
 * @param unionId 工会ID
 */

export function fetchUnionInfo(unionId: string | number): Promise<UnionInfo> {
  return request<UnionInfo>({
    url: '/group/UnionInfo',
    method: 'post',
    data: { unionId },
  })
}

/**
 * 更新工会信息（只更新表单字段）
 * @param data 更新数据
 */
export function updateUnionInfo(data: {
  id: number
  unionCode: string
  rewardAmount: number
  notice: string
}): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/group/updateUnionInfo',
    method: 'post',
    data,
  })
}

/**
 * 新增小组
 * @param data 小组数据
 */
export function createGroup(data: {
  unionId: number
  groupName: string
}): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/group/addGroup',
    method: 'post',
    data,
  })
}

/**
 * 删除小组
 * @param groupId 小组ID
 */
export function deleteGroup(groupId: number): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/group/deleteGroup',
    method: 'post',
    data: { groupId },
  })
}

/**
 * 更新成员角色（设为组长或组员）
 * @param data 更新数据
 */
export function updateMemberRole(data: {
  openid: string
  groupId: number
  role: number
  operatorOpenid: string
}): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/user/updateMemberRole',
    method: 'post',
    data,
  })
}

/**
 * 移出小组成员
 * @param data 移出数据
 */
export function removeMember(data: {
  openid: string
  groupId: number
  operatorOpenid: string
}): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/user/removeMember',
    method: 'post',
    data,
  })
}

/**
 * 添加成员到小组
 * @param data 添加数据
 */
export function addMemberToGroup(data: {
  openid: string
  groupId: number
  operatorOpenid: string
}): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/user/addMemberToGroup',
    method: 'post',
    data,
  })
}

/**
 * 删除用户
 * @param openid 用户openid
 */
export function deleteUser(openid: string): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/user/deleteUser',
    method: 'post',
    data: { openid },
  })
}

/**
 * 恢复用户权限（启用用户）
 * @param data 包含 openid 和 operatorOpenid
 */
export function restoreUser(data: {
  openid: string
  operatorOpenid: string
}): Promise<{ success: boolean; message?: string }> {
  return request<{ success: boolean; message?: string }>({
    url: '/user/restoreUser',
    method: 'post',
    data,
  })
}
