import { request } from '@/utils/request'
import http from '@/utils/request'

export interface StepOverviewItem {
  id: number | string
  name: string
  year: number
  month: number
  day: number
}

/**
 * 获取运动步数总览
 * 后端应返回的数据示例：
 * [
 *   { "id": 1, "name": "总工会", "year": 400000, "month": 30000, "day": 10000 },
 *   { "id": 2, "name": "第一小组", "year": 100000, "month": 9000, "day": 2500 }
 * ]
 */
export function fetchStepOverview(unionId: string | number) {
  return request<StepOverviewItem[]>({
    url: '/bushu/data',
    method: 'post',
    data: { unionId },
  })
}

/**
 * 导出运动步数数据
 * @param params 导出参数
 */
export function exportSportData(params: {
  unionId: string | number
  groupId?: number | string
  startDate: string
  endDate: string
}) {
  // 文件下载需要直接使用 http，跳过 ApiResponse 格式检查
  return http
    .request<Blob>({
      url: '/bushu/export',
      method: 'post',
      data: params,
      responseType: 'blob',
    })
    .then((res) => res.data) // 直接返回 blob 数据
}
