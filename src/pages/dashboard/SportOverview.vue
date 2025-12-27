<template>
  <div class="sport-overview">
    <el-card class="overview-card">
      <template #header>
        <h2 style="margin: 0">运动步数总览</h2>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #default>
          <el-empty v-if="!groups.length" description="暂无数据" />
          <el-table v-else :data="groups" stripe style="width: 100%">
            <el-table-column prop="name" label="分组名称" min-width="120" />
            <el-table-column prop="year" label="本年步数" />
            <el-table-column prop="month" label="本月步数" />
            <el-table-column prop="day" label="今日步数" />
          </el-table>
        </template>
      </el-skeleton>
    </el-card>

    <el-card class="download-card">
      <template #header>
        <h2 style="margin: 0">数据下载</h2>
      </template>

      <el-form :model="downloadForm" label-width="100px" class="download-form">
        <el-form-item label="选择分组">
          <el-select
            v-model="downloadForm.groupId"
            placeholder="请选择分组"
            clearable
            style="width: 100%"
          >
            <el-option label="全部" :value="undefined" />
            <el-option v-for="item in groups" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择月份">
          <el-date-picker
            v-model="dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            value-format="YYYY-MM"
            format="YYYY年MM月"
            :picker-options="pickerOptions"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="downloading"
            :disabled="!dateRange || dateRange.length !== 2"
            @click="handleDownload"
          >
            下载数据
          </el-button>
          <span class="tip">* 最多可选择连续3个月</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchStepOverview, exportSportData, type StepOverviewItem } from '@/api/sport'
import { useUserStore } from '@/store/user'

const groups = ref<StepOverviewItem[]>([])
const loading = ref(false)
const downloading = ref(false)
const dateRange = ref<string[]>([])
const userStore = useUserStore()

// 下载表单
const downloadForm = ref({
  groupId: undefined as string | number | undefined,
})

// 日期选择器配置 - 限制只能选择连续3个月
const pickerOptions = ref({
  onPick: ({ maxDate, minDate }: { maxDate: Date; minDate: Date }) => {
    // 选择后验证
    if (maxDate && minDate) {
      const diffMonths =
        (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
        (maxDate.getMonth() - minDate.getMonth())
      if (diffMonths > 2) {
        ElMessage.warning('最多只能选择连续3个月')
        dateRange.value = []
      }
    }
  },
  disabledDate: () => {
    // 可以添加其他禁用逻辑，比如禁止选择未来月份
    return false
  },
})

const loadOverview = async () => {
  loading.value = true
  try {
    const unionId = userStore.unionInfo.unionId
    if (!unionId) {
      ElMessage.error('未获取到工会信息，请重新登录')
      return
    }
    groups.value = await fetchStepOverview(unionId)
    console.log(groups)
    // 默认选择id为1的小组（group_1），如果没有则选择第一个小组
    const group1 = groups.value.find((item) => typeof item.id === 'string' && item.id === 'union_1')
    const defaultGroup =
      group1 ||
      groups.value.find((item) => typeof item.id === 'string' && item.id.startsWith('group_'))
    if (defaultGroup) {
      downloadForm.value.groupId = defaultGroup.id
    }
  } catch {
    groups.value = []
    // 错误信息已由request拦截器统一处理，这里只做数据清理
  } finally {
    loading.value = false
  }
}

// 验证月份范围
const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate + '-01')
  const end = new Date(endDate + '-01')
  const diffMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())

  if (diffMonths > 2) {
    ElMessage.warning('最多只能选择连续3个月')
    return false
  }
  return true
}

// 处理下载
const handleDownload = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    ElMessage.warning('请选择月份范围')
    return
  }

  const [startDate, endDate] = dateRange.value as [string, string]

  if (!validateDateRange(startDate, endDate)) {
    return
  }

  downloading.value = true
  try {
    const params = {
      unionId: userStore.unionInfo.unionId,
      groupId: downloadForm.value.groupId,
      startDate,
      endDate,
    }

    const blob = await exportSportData(params)

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `运动步数数据_${startDate}_${endDate}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch {
    // 错误信息已由request拦截器统一处理
  } finally {
    downloading.value = false
  }
}

onMounted(loadOverview)
</script>

<style scoped>
.sport-overview {
  padding: 20px;
}

.overview-card,
.download-card {
  margin-bottom: 20px;
}

.download-form {
  max-width: 600px;
  margin-top: 20px;
}

.tip {
  margin-left: 16px;
  font-size: 12px;
  color: #666;
}
</style>
