<template>
  <el-menu :default-active="activeMenu" class="menu-list" @select="handleSelect">
    <el-menu-item index="/dashboard">
      <el-icon><PieChartIcon /></el-icon>
      <span>运动总览</span>
    </el-menu-item>
    <el-sub-menu index="group">
      <template #title>
        <el-icon><UserIcon /></el-icon>
        <span>工会管理</span>
      </template>
      <el-menu-item index="/group/setting">工会设置</el-menu-item>
      <el-menu-item index="/group/person">人员设置</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="gift">
      <template #title>
        <el-icon><GiftIcon /></el-icon>
        <span>活动奖励</span>
      </template>
      <el-menu-item index="/gift/list">礼物管理</el-menu-item>
      <el-menu-item index="/gift/activity">活动管理</el-menu-item>
      <el-menu-item index="/gift/quota">额度管理</el-menu-item>
      <el-menu-item index="/gift/summary">统计汇总</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="survey">
      <template #title>
        <el-icon><EditPenIcon /></el-icon>
        <span>问卷调查</span>
      </template>
      <el-menu-item index="/survey/list">问卷管理</el-menu-item>
      <el-menu-item index="/survey/launch">活动发起</el-menu-item>
      <el-menu-item index="/survey/statistic">问卷统计</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/setting">
      <el-icon><SettingIcon /></el-icon>
      <span>活动设置</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  PieChart as PieChartIcon,
  User as UserIcon,
  Present as GiftIcon,
  EditPen as EditPenIcon,
  Setting as SettingIcon,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)

const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<style scoped>
.menu-list {
  height: 100%;
  border-right: none;
}
</style>
