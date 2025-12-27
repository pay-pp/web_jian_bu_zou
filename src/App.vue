<template>
  <!-- 路由切换的挂载点 -->
  <router-view />
</template>

<script setup lang="ts">
// 空脚本即可，全局 <router-view> 由 Vue-Router 自动渲染对应页面
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
onMounted(() => {
  userStore.restoreState() // 页面加载时恢复 state
})
</script>

<style scoped></style>
